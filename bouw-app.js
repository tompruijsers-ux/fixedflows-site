// ============================================================
//  FixedFlows — bundelt alle appschermen tot één bestand
//  Draaien met:  node bouw-app.js <map>
//
//  Het resultaat is stratella-app.html: registreren, inloggen,
//  werkruimte, contentcreatie en kalender in één bestand dat
//  je gewoon kunt openen, zonder server en zonder losse
//  bestanden ernaast.
// ============================================================

const fs = require('fs');
const { inlineInter } = require('./maak-fontcss.js');
const path = require('path');

const MAP = process.argv[2] || '.';
const lees = f => fs.readFileSync(path.join(__dirname, f), 'utf8');

const SCHERMEN = [
  { bestand: 'app-login.html',         menu: null,          openbaar: true },
  { bestand: 'app-account.html',       menu: null,          openbaar: true },
  { bestand: 'app-home.html',          menu: 'home' },
  { bestand: 'app-contentcreatie.html', menu: 'schrijven' },
  { bestand: 'app-kalender.html',      menu: 'kalender' }
];

// ---------- CSS afbakenen per scherm ----------
// Voorkomt dat de stijlen van het ene scherm het andere raken.
function scope(css, sel) {
  let uit = '', i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) { uit += css.slice(i); break; }
    const kop = css.slice(i, open).trim();
    let diepte = 1, j = open + 1;
    while (j < css.length && diepte > 0) {
      if (css[j] === '{') diepte++;
      else if (css[j] === '}') diepte--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);

    if (kop.startsWith('@')) {
      uit += /^@(media|supports)/i.test(kop) ? kop + '{' + scope(body, sel) + '}' : kop + '{' + body + '}';
    } else if (kop === ':root' || kop === '*' || kop === 'html') {
      uit += kop + '{' + body + '}';
    } else {
      uit += kop.split(',').map(s => {
        s = s.trim();
        if (!s) return s;
        if (s === 'body' || s.startsWith('body.')) return sel;
        if (s.startsWith('body ')) return sel + ' ' + s.slice(5);
        return sel + ' ' + s;
      }).join(',') + '{' + body + '}';
    }
    i = j;
  }
  return uit;
}

// ---------- navigatie omzetten naar routes ----------
const PAGINAS = SCHERMEN.map(s => s.bestand);

function routesInHtml(html) {
  return html.replace(/href="([a-z0-9-]+\.html)([^"]*)"/gi, (m, bestand, rest) => {
    if (PAGINAS.includes(bestand)) return `href="#${bestand}${rest}"`;
    return `href="#${bestand}${rest}" data-buiten="1"`;   // website-pagina's
  });
}

function routesInJs(js) {
  return js
    .replace(/window\.location\.replace\(([^;]+?)\);/g, 'FixedFlows.ga($1);')
    .replace(/window\.location\.href = ([^;]+?);/g, 'FixedFlows.ga($1);')
    .replace(/window\.location\.search/g, 'FixedFlows.zoek()')
    .replace(/(?<!\.)\blocation\.search\b/g, 'FixedFlows.zoek()')
    .replace(/window\.location\.pathname\.split\('\/'\)\.pop\(\)/g, 'FixedFlows.pagina()');
}

// ---------- scherm uit elkaar halen ----------
function ontleed(s) {
  const rauw = lees(s.bestand);

  const css = [...rauw.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const id = s.bestand.replace(/\.html$/, '').replace(/[^a-z0-9-]/g, '');

  let body = rauw.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1];

  // de inline scripts eruit; de bewakingsscripts in de kop vervallen,
  // want de router regelt de toegang al
  const scripts = [...body.matchAll(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  body = body.replace(/<script[\s\S]*?<\/script>/g, '').trim();

  return {
    id,
    bestand: s.bestand,
    menu: s.menu,
    openbaar: !!s.openbaar,
    css: scope(css, '#app.p-' + id),
    html: routesInHtml(body),
    js: routesInJs(scripts.join('\n'))
  };
}

const schermen = SCHERMEN.map(ontleed);

// ---------- gedeelde onderdelen ----------
const sessieJs = lees('app-sessie.js');
const menuJs = routesInHtml(lees('app-menu.js'))
  .replace(/href="#([a-z0-9-]+\.html)([^"]*)"/g, "href=\"#$1$2\"");
const basisCss = lees('styles.css');

// ---------- uitvoer ----------
const uit = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>FixedFlows</title>
<!-- Voorbeeldbestand. Inter zit hier ingebakken (Open Font License).
     Satoshi komt via Fontshare, omdat de licentie het doorgeven van de
     bestanden aan derden niet toestaat en dit bestand rondgestuurd wordt.
     Op de echte site staan beide lettertypes lokaal in /fonts. -->
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap" rel="stylesheet">
<style>${inlineInter()}</style>
<style>
${basisCss}
</style>
<style id="scherm-css"></style>
<style>
  html,body{margin:0}
  #app{min-height:100vh}
</style>
</head>
<body>

<div id="app"></div>

<script>window.FixedFlowsBundel = true;</script>

<script>
/* ---------- sessielaag ---------- */
${sessieJs}
</script>

<script>
/* ---------- menu ---------- */
${menuJs}
</script>

<script>
/* ---------- de schermen ---------- */
window.SCHERMEN = ${JSON.stringify(
  schermen.reduce((o, s) => {
    o[s.bestand] = { id: s.id, menu: s.menu, openbaar: s.openbaar, css: s.css, html: s.html, js: s.js };
    return o;
  }, {}), null, 0)};
</script>

<script>
/* ============================================================
   Router
   ------------------------------------------------------------
   De adresbalk houdt de bestandsnaam bij, bijvoorbeeld
   #app-kalender.html?welkom=1. Zo blijven de links in de
   schermen leesbaar en werkt precies dezelfde code ook als je
   de bestanden los gebruikt.
   ============================================================ */
(function () {
  'use strict';

  var START = 'app-login.html';
  var app = document.getElementById('app');
  var cssVak = document.getElementById('scherm-css');

  var FixedFlows = window.FixedFlows = {
    route: START,
    ga: function (doel) {
      var d = String(doel || '').replace(/^#/, '');
      if (!window.SCHERMEN[d.split('?')[0]]) {
        // een pagina van de website: open die in een nieuw tabblad
        if (/\\.html/.test(d)) { window.open(d, '_blank'); return; }
        d = START;
      }
      if (('#' + d) === window.location.hash) toon(d);
      else window.location.hash = '#' + d;
    },
    zoek: function () {
      var i = this.route.indexOf('?');
      return i === -1 ? '' : this.route.slice(i);
    },
    pagina: function () {
      var i = this.route.indexOf('?');
      return i === -1 ? this.route : this.route.slice(0, i);
    }
  };

  // de sessielaag laten navigeren via de router
  window.Sessie.zetNavigatie({
    ga: FixedFlows.ga.bind(FixedFlows),
    vervang: FixedFlows.ga.bind(FixedFlows),
    pad: function () { return FixedFlows.route; }
  });

  function toon(route) {
    var naam = route.split('?')[0];
    var scherm = window.SCHERMEN[naam];
    if (!scherm) { FixedFlows.ga(START); return; }

    // afscherming: beschermde schermen vragen om een sessie
    if (!scherm.openbaar && !window.Sessie.huidige()) {
      FixedFlows.ga('app-login.html?terug=' + encodeURIComponent(route));
      return;
    }

    FixedFlows.route = route;

    cssVak.textContent = scherm.css;
    app.className = 'p-' + scherm.id;
    app.innerHTML = scherm.html;
    document.body.style.overflow = '';

    // menu opnieuw tekenen met het juiste onderdeel actief
    window.FixedFlowsMenu.teken(scherm.menu === null ? undefined : scherm.menu);
    if (scherm.menu === null) document.body.classList.remove('met-rail');

    // het script van dit scherm draaien op de verse inhoud
    try {
      new Function(scherm.js)();
    } catch (e) {
      console.error('Fout in scherm ' + naam + ':', e);
    }

    window.scrollTo(0, 0);
  }

  function uitHash() {
    var h = window.location.hash.replace(/^#/, '');
    if (!h) {
      h = window.Sessie.huidige() ? 'app-home.html' : START;
      window.location.replace('#' + h);
      return;
    }
    toon(h);
  }

  // links naar website-pagina's in een nieuw tabblad
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-buiten]');
    if (!a) return;
    e.preventDefault();
    window.open(a.getAttribute('href').replace(/^#/, ''), '_blank');
  });

  window.addEventListener('hashchange', uitHash);
  uitHash();
})();
</script>

</body>
</html>
`;

fs.writeFileSync(path.join(MAP, 'stratella-app.html'), uit);
console.log('Klaar: stratella-app.html met ' + schermen.length + ' schermen (' +
  Math.round(uit.length / 1024) + ' kB).');
