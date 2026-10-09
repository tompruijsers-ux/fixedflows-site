# FixedFlows — datamodel en API

Dit document beschrijft de achterkant onder de prototypes `app-account.html` en `app-kalender.html`. De prototypes zijn de gebruikersinterface; hieronder staat wat er in de database en op de server moet gebeuren om er een werkend product van te maken.

**Uitgangspunt:** PostgreSQL met Row Level Security, een Node-backend (Next.js route handlers of Fastify), en S3-compatibele opslag voor media.

---

## 1. Het belangrijkste principe

Alles is **multi-tenant**. Elke rij in elke tabel hoort bij precies één `account_id`. Eén vergeten `WHERE account_id = ...` betekent dat klant A de data van klant B ziet — een datalek met meldplicht bij de Autoriteit Persoonsgegevens.

Daarom staat de scheiding niet in je applicatiecode maar in de database zelf. Ook als je code een fout maakt, geeft Postgres niets terug.

```sql
-- Bij elke request zet de backend wie er ingelogd is.
-- Alle policies hieronder bouwen daarop voort.
SET LOCAL app.gebruiker_id = '…';
SET LOCAL app.account_id  = '…';
```

---

## 2. Schema

### 2.1 Accounts, gebruikers en rollen

```sql
create extension if not exists "pgcrypto";

-- Een account is één werkruimte: één bedrijf, of één klant van een bureau.
create table accounts (
  id              uuid primary key default gen_random_uuid(),
  naam            text not null,
  slug            text unique not null,
  soort           text not null check (soort in ('bureau','bedrijf','zelfstandig')),
  pakket          text not null default 'proef'
                    check (pakket in ('proef','start','groei','bureau','maatwerk')),
  proef_tot       timestamptz,
  land            text not null default 'NL',
  tijdzone        text not null default 'Europe/Amsterdam',
  aangemaakt_op   timestamptz not null default now()
);

-- Een gebruiker bestaat één keer, ongeacht bij hoeveel accounts hij hoort.
create table gebruikers (
  id                uuid primary key default gen_random_uuid(),
  email             citext unique not null,
  wachtwoord_hash   text,                  -- null bij uitsluitend sociale login
  voornaam          text not null,
  achternaam        text not null,
  email_bevestigd   timestamptz,
  laatste_login     timestamptz,
  mfa_geheim        text,
  aangemaakt_op     timestamptz not null default now()
);

-- De koppeling bepaalt de rol. Dit is de kern van het rechtenmodel.
create table lidmaatschappen (
  id             uuid primary key default gen_random_uuid(),
  account_id     uuid not null references accounts(id) on delete cascade,
  gebruiker_id   uuid not null references gebruikers(id) on delete cascade,
  rol            text not null check (rol in ('eigenaar','beheerder','creator','klant')),
  uitgenodigd_door uuid references gebruikers(id),
  actief_vanaf   timestamptz not null default now(),
  unique (account_id, gebruiker_id)
);

-- Sociale login (Google, Facebook, Apple)
create table identiteiten (
  id            uuid primary key default gen_random_uuid(),
  gebruiker_id  uuid not null references gebruikers(id) on delete cascade,
  aanbieder     text not null check (aanbieder in ('google','facebook','apple')),
  extern_id     text not null,
  unique (aanbieder, extern_id)
);

-- Sessies. Bewust in de database, zodat je ze kunt intrekken.
create table sessies (
  id            uuid primary key default gen_random_uuid(),
  gebruiker_id  uuid not null references gebruikers(id) on delete cascade,
  token_hash    text not null unique,
  ip            inet,
  user_agent    text,
  verloopt_op   timestamptz not null,
  ingetrokken_op timestamptz
);

-- Uitnodigingen voor teamleden
create table uitnodigingen (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references accounts(id) on delete cascade,
  email         citext not null,
  rol           text not null check (rol in ('beheerder','creator','klant')),
  token_hash    text not null unique,
  verloopt_op   timestamptz not null,
  geaccepteerd_op timestamptz
);
```

**Waarom vier rollen en niet twee?** In het prototype staan alleen eigenaar en creator. In de praktijk heb je er twee bij nodig: een *beheerder* die alles mag behalve facturatie en het account opheffen, en een *klant* die alleen mag meekijken en goedkeuren. Die laatste is je sterkste verkoopargument voor bureaus, en hij mag niets kunnen bewerken.

| | eigenaar | beheerder | creator | klant |
|---|---|---|---|---|
| Posts schrijven | ✓ | ✓ | ✓ | — |
| Indienen ter goedkeuring | ✓ | ✓ | ✓ | — |
| Goedkeuren en afkeuren | ✓ | ✓ | — | ✓ |
| Kanalen koppelen | ✓ | ✓ | — | — |
| Leden uitnodigen | ✓ | ✓ | — | — |
| Facturatie en opzeggen | ✓ | — | — | — |

### 2.2 Kanalen

```sql
create table kanalen (
  id                uuid primary key default gen_random_uuid(),
  account_id        uuid not null references accounts(id) on delete cascade,
  platform          text not null check (platform in
                      ('facebook','instagram','tiktok','linkedin','x','pinterest','threads','youtube')),
  extern_id         text not null,        -- page id, ig user id, channel id
  weergavenaam      text not null,
  avatar_url        text,
  token_versleuteld bytea not null,       -- pgcrypto of KMS, nooit leesbaar opslaan
  token_verloopt_op timestamptz,
  scopes            text[] not null default '{}',
  status            text not null default 'actief'
                      check (status in ('actief','verlopen','ingetrokken','fout')),
  laatste_controle  timestamptz,
  gekoppeld_door    uuid references gebruikers(id),
  gekoppeld_op      timestamptz not null default now(),
  unique (account_id, platform, extern_id)
);
```

Twee dingen die je hier niet moet vergeten. **Tokens hoor je versleuteld op te slaan**, niet als platte tekst — bij een datalek geeft een leesbare token toegang tot het Instagram-account van je klant. En **tokens verlopen**: bij Meta na zestig dagen. Draai een dagelijkse cron die vernieuwt, zet `status` op `verlopen` als dat mislukt, en mail de eigenaar. Zonder die cron valt je product stilletjes uit.

### 2.3 Posts en goedkeuring

```sql
create table posts (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references accounts(id) on delete cascade,
  kanaal_id       uuid not null references kanalen(id) on delete restrict,

  titel           text not null,
  tekst           text not null default '',
  trefwoord       text,                    -- start de chat-flow

  publiceren_op   timestamptz not null,    -- altijd UTC opslaan
  status          text not null default 'concept'
                    check (status in ('concept','review','afgekeurd','gepland','publiceren','live','mislukt')),
  afkeurreden     text,

  extern_post_id  text,                    -- id bij het platform na publicatie
  fout_melding    text,
  pogingen        smallint not null default 0,

  gemaakt_door    uuid not null references gebruikers(id),
  ingediend_door  uuid references gebruikers(id),
  ingediend_op    timestamptz,
  beoordeeld_door uuid references gebruikers(id),
  beoordeeld_op   timestamptz,

  aangemaakt_op   timestamptz not null default now(),
  gewijzigd_op    timestamptz not null default now()
);

create index on posts (account_id, publiceren_op);
create index on posts (status, publiceren_op) where status = 'gepland';

-- Eén trefwoord mag maar bij één actieve post horen, anders kun je
-- niet herleiden welke post welke leads opleverde.
create unique index posts_trefwoord_uniek
  on posts (account_id, upper(trefwoord))
  where trefwoord is not null and status in ('gepland','live');

create table media (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references accounts(id) on delete cascade,
  post_id       uuid references posts(id) on delete cascade,
  soort         text not null check (soort in ('beeld','video')),
  opslag_sleutel text not null,            -- pad in S3, niet het bestand zelf
  bestandsnaam  text,
  bytes         bigint,
  breedte       int,
  hoogte        int,
  duur_seconden numeric,
  volgorde      smallint not null default 0,
  aangemaakt_op timestamptz not null default now()
);

-- Append-only. Nooit bijwerken, nooit verwijderen.
create table post_log (
  id            bigserial primary key,
  account_id    uuid not null references accounts(id) on delete cascade,
  post_id       uuid not null references posts(id) on delete cascade,
  gebruiker_id  uuid references gebruikers(id),
  actie         text not null,             -- aangemaakt, ingediend, goedgekeurd, …
  van_status    text,
  naar_status   text,
  notitie       text,
  op            timestamptz not null default now()
);
```

### 2.4 Publicatiewachtrij

```sql
create table publicatie_taken (
  id             uuid primary key default gen_random_uuid(),
  account_id     uuid not null references accounts(id) on delete cascade,
  post_id        uuid not null references posts(id) on delete cascade,
  uitvoeren_op   timestamptz not null,
  vergrendeld_tot timestamptz,             -- voorkomt dubbele verwerking
  pogingen       smallint not null default 0,
  laatste_fout   text,
  unique (post_id)
);

create index on publicatie_taken (uitvoeren_op) where vergrendeld_tot is null;
```

De worker pakt taken op met `FOR UPDATE SKIP LOCKED`, zodat meerdere workers elkaar niet in de weg zitten:

```sql
update publicatie_taken
   set vergrendeld_tot = now() + interval '5 minutes',
       pogingen = pogingen + 1
 where id in (
   select id from publicatie_taken
    where uitvoeren_op <= now()
      and (vergrendeld_tot is null or vergrendeld_tot < now())
    order by uitvoeren_op
    limit 10
    for update skip locked
 )
returning *;
```

**Maak publiceren idempotent.** Als een worker crasht ná het versturen maar vóór het wegschrijven, wordt de taak opnieuw opgepakt en staat de post twee keer online. Voorkom dat met een `idempotency_key` per post richting het platform, en controleer `extern_post_id` voordat je opnieuw verstuurt.

### 2.5 Row Level Security

```sql
alter table posts enable row level security;

create policy posts_zichtbaar on posts
  for select using (account_id = current_setting('app.account_id')::uuid);

create policy posts_schrijven on posts
  for insert with check (
    account_id = current_setting('app.account_id')::uuid
    and exists (
      select 1 from lidmaatschappen l
       where l.account_id = posts.account_id
         and l.gebruiker_id = current_setting('app.gebruiker_id')::uuid
         and l.rol in ('eigenaar','beheerder','creator')
    )
  );

-- Een creator mag een goedgekeurde post niet meer aanpassen.
create policy posts_bijwerken on posts
  for update using (
    account_id = current_setting('app.account_id')::uuid
    and (
      exists (select 1 from lidmaatschappen l
               where l.account_id = posts.account_id
                 and l.gebruiker_id = current_setting('app.gebruiker_id')::uuid
                 and l.rol in ('eigenaar','beheerder'))
      or (status in ('concept','review','afgekeurd')
          and gemaakt_door = current_setting('app.gebruiker_id')::uuid)
    )
  );
```

Herhaal ditzelfde patroon voor `kanalen`, `media` en `post_log`.

**Belangrijk:** de rolcontroles in het prototype gebeuren in de browser. Dat is geen beveiliging — iemand kan de knop terugzetten met de ontwikkelaarstools en alsnog een verzoek versturen. De policies hierboven zijn wat het écht tegenhoudt.

---

## 3. Statusovergangen

```
concept ──indienen──▶ review ──goedkeuren──▶ gepland ──worker──▶ live
   ▲                    │                       │                  
   │                    └──afkeuren──▶ afgekeurd│                  
   └────────────────────────────────────────────┘  (terug naar concept)
                                                 └──mislukt (fout bij platform)
```

Leg dit vast op de server, niet alleen in de interface:

```js
const TOEGESTAAN = {
  concept:   { review: ['eigenaar','beheerder','creator'],
               gepland: ['eigenaar','beheerder'] },
  review:    { gepland: ['eigenaar','beheerder'],
               afgekeurd: ['eigenaar','beheerder'],
               concept: ['eigenaar','beheerder','creator'] },  // intrekken
  afgekeurd: { review: ['eigenaar','beheerder','creator'],
               gepland: ['eigenaar','beheerder'] },
  gepland:   { concept: ['eigenaar','beheerder'] },
  live:      {},        // eindstation
  mislukt:   { gepland: ['eigenaar','beheerder'] }
};

function magOvergang(van, naar, rol) {
  return (TOEGESTAAN[van]?.[naar] ?? []).includes(rol);
}
```

---

## 4. API

Alle routes onder `/api`. Authenticatie via een httpOnly-cookie met een sessietoken. Het actieve account komt uit de header `X-Account-Id`, en de backend controleert bij elk verzoek of de gebruiker daar lid van is.

### 4.1 Registreren en inloggen

| Methode | Pad | Doet |
|---|---|---|
| `POST` | `/auth/registreren` | Maakt gebruiker + account + lidmaatschap `eigenaar`, stuurt bevestigingsmail |
| `POST` | `/auth/bevestigen` | Bevestigt het e-mailadres met de token uit de mail |
| `POST` | `/auth/inloggen` | Controleert wachtwoord, maakt sessie |
| `POST` | `/auth/uitloggen` | Trekt de sessie in |
| `POST` | `/auth/wachtwoord-vergeten` | Verstuurt herstelmail (antwoordt altijd hetzelfde) |
| `POST` | `/auth/wachtwoord-herstellen` | Zet nieuw wachtwoord, trekt alle sessies in |
| `GET` | `/auth/oauth/:aanbieder` | Start Google, Facebook of Apple login |
| `GET` | `/auth/oauth/:aanbieder/terug` | Verwerkt de terugkoppeling |
| `GET` | `/auth/ik` | Huidige gebruiker plus zijn accounts en rollen |

```http
POST /api/auth/registreren
{
  "email": "tom@devrieszonnepanelen.nl",
  "wachtwoord": "…",
  "voornaam": "Tom",
  "achternaam": "de Vries",
  "bedrijf": "De Vries Zonnepanelen",
  "soort": "bedrijf",
  "bron": "Zoekmachine",
  "doelen": ["Plannen", "Goedkeuren", "AI"]
}

201
{
  "account": { "id": "…", "naam": "De Vries Zonnepanelen", "proef_tot": "2026-09-03T00:00:00Z" },
  "gebruiker": { "id": "…", "email": "…", "rol": "eigenaar" },
  "volgende_stap": "kanaal_koppelen"
}
```

Vier dingen die je bij registratie moet regelen:

- **Hash met Argon2id**, niet met bcrypt en zeker niet met SHA. Wachtwoorden nooit loggen, ook niet bij een fout.
- **Antwoord altijd hetzelfde** bij "e-mail bestaat al", anders kan iemand achterhalen wie klant bij je is.
- **Beperk pogingen**: maximaal vijf per e-mailadres per kwartier, en per IP.
- **Leg toestemming vast** met tijdstip, IP en de versie van de voorwaarden. Dat heb je nodig bij een AVG-klacht.

### 4.2 Kanalen

| Methode | Pad | Doet |
|---|---|---|
| `GET` | `/kanalen` | Gekoppelde kanalen met status |
| `GET` | `/kanalen/:platform/start` | Stuurt door naar het inlogscherm van het platform |
| `GET` | `/kanalen/:platform/terug` | Wisselt de code om voor een token, slaat versleuteld op |
| `DELETE` | `/kanalen/:id` | Koppeling intrekken |
| `POST` | `/kanalen/:id/vernieuwen` | Token handmatig vernieuwen |

### 4.3 Posts

| Methode | Pad | Doet |
|---|---|---|
| `GET` | `/posts?van=&tot=&kanaal=&status=` | Posts in een periode |
| `POST` | `/posts` | Nieuwe post (altijd als `concept`) |
| `PATCH` | `/posts/:id` | Inhoud of moment wijzigen |
| `POST` | `/posts/:id/indienen` | → `review` |
| `POST` | `/posts/:id/goedkeuren` | → `gepland`, zet een publicatietaak klaar |
| `POST` | `/posts/:id/afkeuren` | → `afgekeurd`, reden verplicht |
| `POST` | `/posts/:id/intrekken` | → `concept` |
| `DELETE` | `/posts/:id` | Verwijderen (niet bij `live`) |
| `GET` | `/posts/:id/log` | Wie deed wat, wanneer |

```http
POST /api/posts/8f2c…/afkeuren
{ "reden": "Foto is te donker, graag de versie van dinsdag gebruiken." }

200
{ "id": "8f2c…", "status": "afgekeurd", "beoordeeld_op": "2026-08-20T14:02:11Z" }
```

### 4.4 Media

Upload niet door je eigen server heen — dat kost je bandbreedte en valt om bij grote video's. Vraag een tijdelijke upload-URL aan en laat de browser rechtstreeks naar S3 sturen.

```http
POST /api/media/upload-url
{ "bestandsnaam": "installatie-zeist.jpg", "type": "image/jpeg", "bytes": 2411004 }

200
{
  "media_id": "…",
  "upload_url": "https://…",           // 15 minuten geldig
  "opslag_sleutel": "acc_123/2026/08/…"
}
```

Controleer daarna op de server het werkelijke bestandstype en de afmetingen. Vertrouw nooit op wat de browser meestuurt: een bestand met `.jpg` in de naam kan van alles zijn.

---

## 5. De publicatieworker

```
elke minuut:
  taken = pak_taken(limiet 10)              -- FOR UPDATE SKIP LOCKED
  voor elke taak:
    post   = laad(taak.post_id)
    kanaal = laad(post.kanaal_id)

    als kanaal.status != 'actief':
      markeer_mislukt('kanaal niet gekoppeld'); mail_eigenaar(); door

    als post.extern_post_id is niet leeg:
      markeer_klaar(); door                 -- was al gepubliceerd

    zet post.status = 'publiceren'
    probeer:
      resultaat = platform.publiceer(kanaal, post, idempotency_key = post.id)
      post.extern_post_id = resultaat.id
      post.status = 'live'
      log('gepubliceerd')
    behalve tijdelijke_fout:
      herplan(over 2^pogingen minuten)      -- max 5 pogingen
    behalve blijvende_fout as f:
      post.status = 'mislukt'
      post.fout_melding = f.bericht
      mail_eigenaar()
```

Draai de worker in een aparte proces, niet in je webserver. Een langlopende upload naar YouTube mag je website niet blokkeren.

---

## 6. Volgorde van bouwen

| Fase | Wat | Waarom eerst |
|---|---|---|
| 1 | `accounts`, `gebruikers`, `lidmaatschappen`, `sessies` + RLS | Zonder dit kun je niets veilig bouwen |
| 2 | Registreren, inloggen, uitnodigen | Je hebt echte gebruikers nodig om te testen |
| 3 | `posts`, `media`, `post_log` + de statusovergangen | Dit is je kernproduct |
| 4 | Media-upload naar S3 | Werkt los van publiceren |
| 5 | Meta App Review aanvragen | Duurt weken; start parallel aan fase 3 |
| 6 | `kanalen` + OAuth per platform | Pas zinvol als de review rond is |
| 7 | `publicatie_taken` + worker | De laatste schakel |
| 8 | Facturatie via Stripe | Pas nodig als de proefperiodes aflopen |

Tot fase 6 rond is, kun je het product al verkopen als planning- en goedkeuringstool waarbij de klant zelf op "plaatsen" tikt via een melding. Dat is geen noodgreep: Meta staat automatisch publiceren naar Facebook-groepen en stories sowieso niet toe, dus die meldingsroute bouw je toch.

---

## 7. Wat je niet moet vergeten

- **Tijdzones.** Sla alles op in UTC en reken pas om bij het tonen. Een post die om 09:00 moet, moet dat ook doen na de overgang naar zomertijd.
- **Verwijderrecht.** Een gebruiker kan om verwijdering vragen. Bouw dat als een functie, niet als een handmatige klus: het is een wettelijke termijn van een maand.
- **Meta's data deletion callback.** Verplicht voor App Review. Meta stuurt een verzoek en jij moet de data van die gebruiker verwijderen en een bevestigings-URL teruggeven.
- **Auditlogboek.** `post_log` is append-only en bevat wie wat wanneer deed. Bij een geschil met een klant over een post die wel of niet online stond, is dat je enige bewijs.
- **Beperk de proefperiode ook in de database.** Als `proef_tot` verstreken is en er is geen abonnement, weiger dan nieuwe publicatietaken — maar laat de data staan en toon een melding. Direct afsluiten kost je klanten die net even te laat waren.
