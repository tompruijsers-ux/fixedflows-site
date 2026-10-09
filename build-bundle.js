// ============================================================
//  FixedFlows — bundelt alle pagina's tot één doorklikbaar bestand
//  Draaien met:  node build-bundle.js <map>
//  Alleen voor preview. Voor productie gebruik je de losse pagina's.
// ============================================================

const fs = require('fs');
const { inlineInter } = require('./maak-fontcss.js');
const path = require('path');

const MAP = process.argv[2] || '.';
const lees = f => fs.readFileSync(path.join(MAP, f), 'utf8');

// ---------- CSS afbakenen per pagina ----------
// Voorkomt dat de eigen stijlen van bijvoorbeeld de prijzenpagina
// doorlekken naar de kanaalpagina's binnen hetzelfde bestand.
function scope(css, sel) {
  let uit = '';
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) { uit += css.slice(i); break; }

    let kop = css.slice(i, open).trim();
    const isAt = kop.startsWith('@');

    // bijbehorende sluitaccolade zoeken
    let diepte = 1, j = open + 1;
    while (j < css.length && diepte > 0) {
      if (css[j] === '{') diepte++;
      else if (css[j] === '}') diepte--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);

    if (isAt) {
      if (/^@(media|supports)/i.test(kop)) {
        uit += kop + '{' + scope(body, sel) + '}';
      } else {
        uit += kop + '{' + body + '}';   // keyframes, font-face: ongemoeid laten
      }
    } else if (kop === ':root' || kop === 'html' || kop === '*') {
      uit += kop + '{' + body + '}';
    } else {
      const nieuw = kop.split(',').map(s => {
        s = s.trim();
        if (!s) return s;
        if (s === 'body') return sel;
        if (s.startsWith('body ')) return sel + ' ' + s.slice(5);
        return sel + ' ' + s;
      }).join(',');
      uit += nieuw + '{' + body + '}';
    }
    i = j;
  }
  return uit;
}

const pak = (html, tag) => {
  const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1] : '';
};

const pakAlle = (html, tag) => {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
  const uit = [];
  let m;
  while ((m = re.exec(html))) uit.push(m[1]);
  return uit;
};

// ---------- pagina's verzamelen ----------
const pagina$ = [
  { id: 'index',    bestand: 'index.html',    label: 'Home' },
  { id: 'services', bestand: 'services.html', label: 'Services' },
  { id: 'kanalen',  bestand: 'kanalen.html',  label: 'Kanalen' },
  { id: 'blog',     bestand: 'blog.html',     label: 'Blog' },
  { id: 'prijzen',  bestand: 'prijzen.html',  label: 'Prijzen' }
];
for (const f of fs.readdirSync(MAP).filter(f => /^blog-.*\.html$/.test(f)).sort()) {
  pagina$.push({ id: f.replace(/\.html$/, ''), bestand: f, label: 'Artikel' });
}
for (const f of fs.readdirSync(MAP).filter(f => /^service-.*\.html$/.test(f)).sort()) {
  pagina$.push({ id: f.replace(/\.html$/, ''), bestand: f, label: f.replace('service-', '').replace(/-/g, ' ') });
}
for (const f of fs.readdirSync(MAP).filter(f => /^kanaal-.*\.html$/.test(f)).sort()) {
  pagina$.push({ id: f.replace(/\.html$/, ''), bestand: f, label: f.replace('kanaal-', '') });
}

const gedeeldCss = lees('styles.css') + '\n' + lees('pagina.css') + '\n' + lees('blog.css');

let secties = '';
let eigenCss = '';
let footerHtml = '';
let navHtml = '';

for (const p of pagina$) {
  const html = lees(p.bestand);

  // eigen <style> van de pagina afbakenen
  for (const st of pakAlle(html, 'style')) {
    eigenCss += scope(st, `#page-${p.id}`) + '\n';
  }

  if (!navHtml) navHtml = pak(html, 'header');
  const f = pak(html, 'footer');
  if (f.includes('foot-cols')) footerHtml = f;   // de uitgebreide footer winnen

  let main = pak(html, 'main');
  main = main.replace(/href="([a-z0-9-]+)\.html([^"]*)"/gi, 'href="#$1"');

  secties += `\n<div class="page" id="page-${p.id}" data-titel="${p.bestand}">\n${main}\n</div>\n`;
}

if (!footerHtml) footerHtml = pak(lees('kanalen.html'), 'footer');
navHtml = navHtml.replace(/href="([a-z0-9-]+)\.html([^"]*)"/gi, 'href="#$1"');
footerHtml = footerHtml.replace(/href="([a-z0-9-]+)\.html([^"]*)"/gi, 'href="#$1"');

// ---------- uitvoer ----------
const uit = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FixedFlows — volledige website (voorbeeld)</title>
<!-- Voorbeeldbestand. Inter zit hier ingebakken (Open Font License).
     Satoshi komt via Fontshare, omdat de licentie het doorgeven van de
     bestanden aan derden niet toestaat en dit bestand rondgestuurd wordt.
     Op de echte site staan beide lettertypes lokaal in /fonts. -->
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap" rel="stylesheet">
<style>${inlineInter()}</style>
<style>
${gedeeldCss}
${eigenCss}
.page{display:none}
.page.actief{display:block}
</style>
</head>
<body>

${navHtml}

<main>
${secties}
</main>

${footerHtml}


<script>
(function () {
  var paginas = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var knoppen = [];

  function toon(id) {
    var doel = document.getElementById('page-' + id) || paginas[0];
    paginas.forEach(function (p) { p.classList.toggle('actief', p === doel); });
    knoppen.forEach(function (b) {
      b.setAttribute('aria-current', String('page-' + b.dataset.naar === doel.id));
    });
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('href') === '#' + id);
    });
    window.scrollTo(0, 0);
  }

  function uitHash() {
    var h = (location.hash || '#index').slice(1).split('#')[0];
    toon(h || 'index');
  }

  knoppen.forEach(function (b) {
    b.addEventListener('click', function () { location.hash = b.dataset.naar; });
  });

  window.addEventListener('hashchange', uitHash);
  uitHash();

  // prijsschakelaar
  var maand = document.getElementById('btn-maand');
  var jaar = document.getElementById('btn-jaar');
  if (maand && jaar) {
    var bedragen = document.querySelectorAll('.amt[data-m]');
    var regels = document.querySelectorAll('[data-billed]');
    function prijs(perJaar) {
      maand.setAttribute('aria-pressed', String(!perJaar));
      jaar.setAttribute('aria-pressed', String(perJaar));
      bedragen.forEach(function (el) { el.textContent = '\\u20AC' + el.dataset[perJaar ? 'j' : 'm']; });
      regels.forEach(function (el, i) {
        var p = bedragen[i];
        if (!p) return;
        el.textContent = perJaar
          ? 'Jaarlijks gefactureerd \\u00B7 \\u20AC' + (Number(p.dataset.j) * 12) + ' per jaar'
          : 'Maandelijks gefactureerd';
      });
    }
    maand.addEventListener('click', function () { prijs(false); });
    jaar.addEventListener('click', function () { prijs(true); });
  }
})();
</script>

</body>
</html>
`;

fs.writeFileSync(path.join(MAP, 'stratella-website.html'), uit);
console.log('Klaar: stratella-website.html met ' + pagina$.length + ' pagina\'s.');
