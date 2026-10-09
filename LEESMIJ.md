# FixedFlows

De site bestaat uit twee delen: **inhoud** (bewerkbaar via het CMS) en **opmaak** (de HTML-sjablonen). Bij het bouwen worden die samengevoegd tot statische pagina's.

```
content/           ← hier staat alle tekst. Dit bewerkt het CMS.
  instellingen.json    algemene teksten, knoppen, footer
  home.json            alle teksten van de homepage
  blog/*.json          één bestand per artikel
  services/*.json      één bestand per service
  kanalen/*.json       één bestand per kanaal
admin/             ← het CMS zelf (config.yml bepaalt wat je kunt bewerken)
media/             ← afbeeldingen die je via het CMS uploadt
pages/             ← vaste stukken HTML (prijzentabel, kalendermockup)
dist/              ← het resultaat. Dit upload je naar je hosting.
```

## Eenmalig instellen

**1. Zet de map in een Git-repository**

```bash
git init && git add . && git commit -m "eerste versie"
```

Push naar GitHub. Onthoud de naam van de repository.

**2. Vul je repository in bij het CMS**

Open `admin/config.yml` en pas de tweede regel aan:

```yaml
repo: jouw-gebruikersnaam/stratella-site
```

**3. Zet de site op Netlify**

Maak een nieuw project aan vanuit je GitHub-repository en vul in:

| Veld | Waarde |
|---|---|
| Build command | `node bouw.js` |
| Publish directory | `dist` |

**4. Zet de login aan**

In Netlify: **Site settings → Identity → Enable Identity**. Zet daarna
*Registration* op **Invite only** en nodig jezelf uit. Activeer onder
**Services → Git Gateway** de koppeling.

Vervang dan in `admin/config.yml` de eerste regels door:

```yaml
backend:
  name: git-gateway
  branch: main
```

Klaar. Het CMS staat op `jouwdomein.nl/admin`.

## Zo werkt het dagelijks

1. Ga naar `/admin` en log in.
2. Pas iets aan of schrijf een artikel.
3. Klik op **Opslaan**, en daarna op **Publiceren**.
4. Netlify bouwt de site opnieuw. Binnen een minuut staat het live.

Je hoeft geen code aan te raken en niets te uploaden.

### Wat je kunt bewerken

| In het CMS | Wat het aanpast |
|---|---|
| Blogartikelen | Nieuwe artikelen schrijven met alinea's, tussenkoppen, afbeeldingen, tip- en feitenblokken, tabellen, citaten, stappen, verwijskaarten en oproepblokken |
| Services | De zes servicepagina's: koppen, voordelen, verdiepende blokken, vragen |
| Kanalen | De acht kanaalpagina's, inclusief merkkleur en beeldverhouding |
| Site en homepage → Algemeen | Merknaam, alle knopteksten, footer, sociale links, slotblok |
| Site en homepage → Homepage | Elke tekst op de voorpagina, inclusief de zes stappen van de klantreis |

### Een blogartikel opbouwen

Onder **Artikelblokken** klik je op *Add* en kies je het type blok. De volgorde
in de lijst is de volgorde op de pagina. Blokken versleep je met de greep links.

In een alinea mag HTML staan voor nadruk en links:

```html
Dit is <b>belangrijk</b>, en dit is een <a href="prijzen.html">link naar de prijzen</a>.
```

Laat je een afbeelding leeg, dan komt er automatisch een gekleurde illustratie
te staan. Upload je er wel een, dan vervangt die de illustratie.

## Lokaal werken

```bash
node bouw.js        # bouwt de site naar /dist
npx serve dist      # bekijk hem op localhost
```

Wil je het CMS lokaal proberen zonder in te loggen: zet `local_backend: true`
in `admin/config.yml`, draai `npx decap-server` in een tweede venster en open
`localhost:3000/admin`.

## Wat je níét via het CMS aanpast

De prijzentabel (`pages/prijzen.body.html`), de kalendermockup
(`pages/index.kalender.html`) en de productschermen (`mockups.js`) staan
bewust in code. Dat zijn nagebouwde interfaces, geen lopende tekst — die
bewerk je beter direct dan via invulvelden.

Kleuren en lettertypes staan bovenin `styles.css` als variabelen. Eén waarde
aanpassen verandert de hele site.


## Zo start je het product

Er zijn twee manieren om de app te bekijken.

**Eén bestand — het snelst.** Open `stratella-app.html`. Daar zit alles in:
registreren, inloggen, je werkruimte, contentcreatie en de kalender, plus het
menu links. Geen server nodig, geen bestanden ernaast. Dit is de versie die je
doorstuurt als je iets wilt laten zien.

De adresbalk laat zien waar je bent, bijvoorbeeld `#app-kalender.html`. Je kunt
dus ook rechtstreeks naar een scherm springen — sta je niet ingelogd, dan word je
eerst naar het inlogscherm gestuurd en kom je daarna alsnog op de juiste plek uit.

**Losse bestanden — om aan te werken.** De schermen staan ook los in de map:
`app-login.html`, `app-account.html`, `app-home.html`, `app-contentcreatie.html`
en `app-kalender.html`. Die hebben `app-sessie.js`, `app-menu.js` en `styles.css`
naast zich nodig, dus start ze vanuit de map:

```bash
node bouw.js        # bouwt alles naar /dist
npx serve dist      # open daarna localhost in je browser
```

Werk je in de losse bestanden, draai dan `node bouw-app.js .` om
`stratella-app.html` bij te werken.

**Het menu links verschijnt pas na inloggen.** Dat is met opzet: zonder sessie is
er geen werkruimte om doorheen te navigeren.

## De afgeschermde omgeving

Naast de website zitten er vier schermen in die samen het product vormen.

| Bestand | Wat het is |
|---|---|
| `app-account.html` | Registreren en onboarding. Maakt het account aan en start de sessie. |
| `app-login.html` | Inloggen met wachtwoord, sociale login of een code per e-mail. |
| `app-home.html` | De werkruimte na inloggen: voortgang, producten, team. |
| `app-kalender.html` | De contentkalender met rollen en goedkeuring. |
| `app-sessie.js` | De gedeelde sessielaag die alles aan elkaar knoopt. |

**Hoe de afscherming werkt.** Bovenaan `app-home.html` en `app-kalender.html` staat een
controle op een geldige sessie. Is die er niet, dan word je doorgestuurd naar het
inlogscherm, met de pagina die je wilde bezoeken als terugkeerpunt. Na inloggen kom
je daar automatisch weer uit.

Alle data hangt aan het `account_id` uit de sessie. Twee accounts in dezelfde browser
zien elkaars kalender niet — dat is de browserversie van `where account_id = …`.

**Dit is geen beveiliging.** Alles staat in de browser van de gebruiker en is dus aan
te passen. Het laat zien hóe de afscherming werkt, maar in productie moet elke controle
op de server gebeuren, met sessiecookies en Row Level Security. Zie `ARCHITECTUUR.md`,
hoofdstuk 2 en 4.


## Lettertypes

| | Lettertype | Gewichten | Waar |
|---|---|---|---|
| Primair | Satoshi | 700, soms 500 | Alle koppen en het logo |
| Secundair | Inter | 400 en 500 | Lopende tekst, knoppen en de hele interface |

**Beide staan lokaal in `/fonts`** en worden geladen via `fonts.css`. Er gaat geen
enkele externe aanroep uit voor lettertypes. Dat is sneller, en er gaan geen
bezoekers-IP's naar een derde partij — wat past bij onze eigen belofte over
gegevens binnen de EU.

### Licenties

`Inter` valt onder de SIL Open Font License: vrij te gebruiken, te bundelen en door
te geven.

`Satoshi` valt onder de ITF Free Font License van Fontshare. De volledige tekst staat
in `fonts/Satoshi-LICENTIE.txt`. Zelf hosten is uitdrukkelijk toegestaan en zelfs
aanbevolen, maar let op twee punten:

- **Niet aanpassen of omzetten.** De bestanden mogen niet worden gesubset, omgezet
  naar een ander formaat of hernoemd. Ze staan hier precies zoals Fontshare ze levert.
- **Niet aanbieden aan gebruikers van je platform.** Krijgt FixedFlows ooit een
  ontwerpfunctie waarin klanten zelf een lettertype kiezen, dan mag Satoshi daar niet
  in staan. Voor de eigen interface is het geen probleem.

De voorbeeldbestanden `stratella-website.html` en `stratella-app.html` laden Satoshi
wel via Fontshare. Dat is bewust: die bestanden worden rondgestuurd, en de licentie
staat het doorgeven van de fontbestanden aan derden niet toe. Inter zit er wel
ingebakken, omdat de Open Font License dat toestaat.
