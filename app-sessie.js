/* ============================================================
   FixedFlows — sessie en afscherming
   ------------------------------------------------------------
   Deze laag doet in de browser wat in het echte product op de
   server hoort te gebeuren. Zie ARCHITECTUUR.md, hoofdstuk 2 en 4.

   LET OP — dit is géén beveiliging.
   Alles staat in de browser van de gebruiker en is dus aan te
   passen. Het laat zien hoe de afscherming wérkt, maar in
   productie moet elke controle hieronder op de server gebeuren,
   afgedwongen met sessiecookies en Row Level Security.
   ============================================================ */

window.Sessie = (function () {
  'use strict';

  var SL_ACCOUNTS = 'stratella-accounts';   // alle geregistreerde accounts
  var SL_SESSIE   = 'stratella-sessie';     // wie er nu is ingelogd
  var DUUR_DAGEN  = 7;

  /* ---------- opslag met terugval op geheugen ---------- */
  var geheugen = {};
  var kanOpslaan = (function () {
    try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return true; }
    catch (e) { return false; }
  })();

  function lees(sleutel) {
    try {
      if (kanOpslaan) {
        var r = localStorage.getItem(sleutel);
        return r ? JSON.parse(r) : null;
      }
    } catch (e) {}
    return geheugen[sleutel] || null;
  }

  function schrijf(sleutel, waarde) {
    geheugen[sleutel] = waarde;
    try {
      if (kanOpslaan) localStorage.setItem(sleutel, JSON.stringify(waarde));
      return true;
    } catch (e) { return false; }
  }

  function wis(sleutel) {
    delete geheugen[sleutel];
    try { if (kanOpslaan) localStorage.removeItem(sleutel); } catch (e) {}
  }

  /* ---------- wachtwoord ----------
     In productie: Argon2id op de server, met een salt per gebruiker.
     Hieronder staat een eenvoudige hash, puur zodat er in deze demo
     nergens een leesbaar wachtwoord wordt bewaard. Niet geschikt
     voor echt gebruik. */
  function hash(tekst, salt) {
    var s = String(salt || '') + '|' + String(tekst);
    var h1 = 0x811c9dc5, h2 = 0x01000193;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      h1 = ((h1 ^ c) * 0x01000193) >>> 0;
      h2 = ((h2 + c) * 0x85ebca6b) >>> 0;
    }
    return (h1.toString(16) + h2.toString(16)).padStart(16, '0');
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function slug(t) {
    return String(t).toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'werkruimte';
  }

  /* ---------- accounts ---------- */
  function alleAccounts() { return lees(SL_ACCOUNTS) || []; }

  function zoekOpEmail(email) {
    var e = String(email || '').trim().toLowerCase();
    return alleAccounts().filter(function (a) { return a.email === e; })[0] || null;
  }

  /**
   * Maakt een nieuw account met de eerste gebruiker als eigenaar.
   * Komt overeen met POST /api/auth/registreren.
   */
  function registreer(g) {
    var email = String(g.email || '').trim().toLowerCase();
    if (zoekOpEmail(email)) return { ok: false, reden: 'bestaat' };

    var salt = uuid().slice(0, 12);
    var account = {
      account_id: uuid(),
      gebruiker_id: uuid(),
      email: email,
      voornaam: g.voornaam || '',
      achternaam: g.achternaam || '',
      bedrijf: g.bedrijf || 'Mijn werkruimte',
      slug: slug(g.bedrijf),
      soort: g.soort || 'bedrijf',
      rol: 'eigenaar',
      bron: g.bron || '',
      doelen: g.doelen || [],
      salt: salt,
      wachtwoord_hash: g.wachtwoord ? hash(g.wachtwoord, salt) : null,
      via: g.via || 'email',
      proef_tot: Date.now() + 14 * 864e5,
      aangemaakt_op: Date.now()
    };

    var lijst = alleAccounts();
    lijst.push(account);
    schrijf(SL_ACCOUNTS, lijst);
    return { ok: true, account: account };
  }

  /* ---------- inloggen ---------- */
  function metWachtwoord(email, wachtwoord) {
    var a = zoekOpEmail(email);
    if (!a) return { ok: false, reden: 'onbekend' };
    if (!a.wachtwoord_hash) return { ok: false, reden: 'geen-wachtwoord' };
    if (a.wachtwoord_hash !== hash(wachtwoord, a.salt)) return { ok: false, reden: 'wachtwoord' };
    return { ok: true, sessie: start(a) };
  }

  function metEmail(email) {
    var a = zoekOpEmail(email);
    if (!a) return { ok: false, reden: 'onbekend' };
    return { ok: true, sessie: start(a) };
  }

  /** Sociale login: bestaat het adres nog niet, dan maken we het account aan. */
  function metAanbieder(aanbieder, email, voornaam) {
    var a = zoekOpEmail(email);
    if (!a) {
      var r = registreer({
        email: email, voornaam: voornaam || 'Nieuwe', achternaam: 'gebruiker',
        bedrijf: 'Mijn werkruimte', via: aanbieder
      });
      if (!r.ok) return r;
      a = r.account;
    }
    return { ok: true, sessie: start(a), nieuw: !a.wachtwoord_hash };
  }

  /* ---------- sessie ---------- */
  function start(a) {
    var s = {
      sessie_id: uuid(),
      account_id: a.account_id,
      gebruiker_id: a.gebruiker_id,
      email: a.email,
      naam: (a.voornaam + ' ' + a.achternaam).trim(),
      voornaam: a.voornaam,
      bedrijf: a.bedrijf,
      rol: a.rol,
      proef_tot: a.proef_tot,
      begonnen_op: Date.now(),
      verloopt_op: Date.now() + DUUR_DAGEN * 864e5
    };
    schrijf(SL_SESSIE, s);
    return s;
  }

  function huidige() {
    var s = lees(SL_SESSIE);
    if (!s) return null;
    if (!s.verloopt_op || s.verloopt_op < Date.now()) { wis(SL_SESSIE); return null; }
    return s;
  }

  /* Navigatie loopt via deze twee haakjes. De losse pagina's
     gebruiken gewone links; de gebundelde versie hangt hier de
     router aan. Zo werkt dezelfde code in beide situaties. */
  var gaNaar = function (doel) { window.location.href = doel; };
  var gaNaarVervangend = function (doel) { window.location.replace(doel); };
  var huidigPad = function () {
    return window.location.pathname.split('/').pop() + window.location.search;
  };

  function zetNavigatie(opties) {
    if (opties.ga) gaNaar = opties.ga;
    if (opties.vervang) gaNaarVervangend = opties.vervang;
    if (opties.pad) huidigPad = opties.pad;
  }

  function uitloggen(naar) {
    wis(SL_SESSIE);
    gaNaar(naar || 'app-login.html');
  }

  /**
   * Zet dit bovenaan elke pagina die alleen voor ingelogde
   * gebruikers is. Zonder geldige sessie stuurt hij door naar
   * het inlogscherm, met de gevraagde pagina als terugkeerpunt.
   */
  function vereist() {
    var s = huidige();
    if (!s) {
      gaNaarVervangend('app-login.html?terug=' + encodeURIComponent(huidigPad()));
      return null;
    }
    return s;
  }

  /** Rolcontrole. Op de server hoort dit nogmaals te gebeuren. */
  var RECHTEN = {
    eigenaar:  ['schrijven', 'indienen', 'goedkeuren', 'koppelen', 'uitnodigen', 'facturatie'],
    beheerder: ['schrijven', 'indienen', 'goedkeuren', 'koppelen', 'uitnodigen'],
    creator:   ['schrijven', 'indienen'],
    klant:     ['goedkeuren']
  };
  function mag(recht, rol) {
    var r = rol || (huidige() || {}).rol;
    return (RECHTEN[r] || []).indexOf(recht) !== -1;
  }

  /* ---------- data per account ----------
     Elke werkruimte heeft een eigen sleutel. Dat is de browser-
     versie van `where account_id = …` in de database. */
  function dataSleutel(naam) {
    var s = huidige();
    return 'stratella-data-' + (s ? s.account_id : 'gast') + '-' + naam;
  }
  function leesData(naam) { return lees(dataSleutel(naam)); }
  function schrijfData(naam, waarde) { return schrijf(dataSleutel(naam), waarde); }

  function dagenOver() {
    var s = huidige();
    if (!s || !s.proef_tot) return 0;
    return Math.max(0, Math.ceil((s.proef_tot - Date.now()) / 864e5));
  }

  function initialen() {
    var s = huidige();
    if (!s) return '?';
    var d = (s.naam || s.email).split(/[\s@.]+/).filter(Boolean);
    return ((d[0] || '?')[0] + (d[1] || '')[0] || '').toUpperCase();
  }

  return {
    registreer: registreer,
    zoekOpEmail: zoekOpEmail,
    alleAccounts: alleAccounts,
    metWachtwoord: metWachtwoord,
    metEmail: metEmail,
    metAanbieder: metAanbieder,
    huidige: huidige,
    vereist: vereist,
    uitloggen: uitloggen,
    mag: mag,
    leesData: leesData,
    schrijfData: schrijfData,
    dagenOver: dagenOver,
    initialen: initialen,
    zetNavigatie: zetNavigatie,
    permanent: kanOpslaan
  };
})();
