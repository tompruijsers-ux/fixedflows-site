// ============================================================
//  FixedFlows — losse pagina's
//  Leest content/paginas/*.json en maakt daar pagina's van.
//  Het veld "soort" bepaalt de opmaak.
// ============================================================

const fs = require('fs');
const path = require('path');
const { blok } = require('./blogbouw.js');

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function laad() {
  const dir = path.join(__dirname, 'content', 'paginas');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (!d.slug) d.slug = f.replace(/\.json$/, '');
      return d;
    })
    .sort((a, b) => (a.volgorde ?? 99) - (b.volgorde ?? 99));
}

/* ---------- juridische pagina's ---------- */
function juridisch(p) {
  const koppen = (p.body || [])
    .map((b, i) => (b.t === 'h2' ? `<a href="#k${i}">${esc(b.tekst)}</a>` : ''))
    .filter(Boolean).join('\n        ');

  return `<section class="jur-hero">
  <div class="wrap">
    <span class="eyebrow"><i></i> ${esc(p.label || 'Juridisch')}</span>
    <h1>${esc(p.titel)}</h1>
    <p class="lede">${esc(p.sub)}</p>
    <p class="jur-datum">Laatst bijgewerkt op ${esc(p.bijgewerkt)} · versie ${esc(p.versie)}</p>
  </div>
</section>

<section class="art-lijf">
  <div class="wrap art-grid">
    <aside class="art-zij">
      <div class="art-inhoud">
        <h4>Op deze pagina</h4>
        ${koppen}
      </div>
    </aside>
    <div class="art-tekst">
      ${p.intro ? `<p class="art-intro">${esc(p.intro)}</p>` : ''}
      ${(p.body || []).map((b, i) => blok(b, i)).join('\n      ')}
    </div>
  </div>
</section>`;
}

/* ---------- contact ---------- */
function contact(p) {
  const kaarten = (p.kanalen || []).map(k => `<article class="cc">
        <span class="cc-ico">${k.ico}</span>
        <h3>${esc(k.titel)}</h3>
        <p>${esc(k.tekst)}</p>
        <a class="cc-link" href="${esc(k.href)}">${esc(k.knop)}</a>
        ${k.onder ? `<span class="cc-onder">${esc(k.onder)}</span>` : ''}
      </article>`).join('\n      ');

  const uren = (p.bereikbaar || []).map(r =>
    `<div class="uur"><span>${esc(r.dagen)}</span><b>${esc(r.tijd)}</b></div>`).join('\n        ');

  const gegevens = (p.gegevens || []).map(r =>
    `<div class="gr"><span>${esc(r.k)}</span><b>${esc(r.v)}</b></div>`).join('\n        ');

  return `<section class="ov-hero">
  <div class="wrap">
    <span class="eyebrow"><i></i> Contact</span>
    <h1>${esc(p.titel)}</h1>
    <p class="lede">${esc(p.sub)}</p>
  </div>
</section>

<section class="cc-wrap">
  <div class="wrap">
    <div class="cc-grid">
      ${kaarten}
    </div>
  </div>
</section>

<section class="cc-onderkant">
  <div class="wrap cc-twee">
    <div class="cc-blok">
      <h3>Wanneer we bereikbaar zijn</h3>
      <div class="uren">
        ${uren}
      </div>
      <p class="cc-note">${esc(p.reactietijd)}</p>
    </div>
    <div class="cc-blok">
      <h3>Bedrijfsgegevens</h3>
      <div class="gegevens">
        ${gegevens}
      </div>
    </div>
  </div>
</section>`;
}

/* ---------- over ons ---------- */
function verhaal(p) {
  const cijfers = (p.cijfers || []).map(c =>
    `<div class="cf"><b>${esc(c.getal)}</b><span>${esc(c.tekst)}</span></div>`).join('\n      ');

  const waarden = (p.waarden || []).map(w => `<article class="wd">
        <h3>${esc(w.titel)}</h3>
        <p>${esc(w.tekst)}</p>
      </article>`).join('\n      ');

  return `<section class="ov-hero">
  <div class="wrap">
    <span class="eyebrow"><i></i> Over ons</span>
    <h1>${esc(p.titel)}</h1>
    <p class="lede">${esc(p.sub)}</p>
  </div>
</section>

${cijfers ? `<section class="cf-strip"><div class="wrap cf-grid">\n      ${cijfers}\n    </div></section>` : ''}

<section class="art-lijf">
  <div class="wrap" style="max-width:820px">
    <div class="art-tekst" style="max-width:none">
      ${(p.body || []).map((b, i) => blok(b, i)).join('\n      ')}
    </div>
  </div>
</section>

${waarden ? `<section class="wd-wrap">
  <div class="wrap">
    <div class="sec-head">
      <p class="sec-eyebrow">Hoe we werken</p>
      <h2>${esc(p.waardenTitel || 'Waar we op letten')}</h2>
    </div>
    <div class="wd-grid">
      ${waarden}
    </div>
  </div>
</section>` : ''}`;
}

/* ---------- helpcentrum ---------- */
function help(p) {
  const groepen = (p.groepen || []).map(g => `<article class="hg">
        <span class="hg-ico">${g.ico}</span>
        <h3>${esc(g.titel)}</h3>
        <p>${esc(g.tekst)}</p>
        <ul>
          ${(g.artikelen || []).map(a => a.href
            ? `<li><a href="${esc(a.href)}">${esc(a.titel)}</a></li>`
            : `<li><span class="nog">${esc(a.titel)}<em>binnenkort</em></span></li>`).join('\n          ')}
        </ul>
      </article>`).join('\n      ');

  const vragen = (p.faq || []).map(f => `<details>
        <summary>${esc(f.v)}</summary>
        <p>${f.a}</p>
      </details>`).join('\n      ');

  return `<section class="ov-hero">
  <div class="wrap">
    <span class="eyebrow"><i></i> Helpcentrum</span>
    <h1>${esc(p.titel)}</h1>
    <p class="lede">${esc(p.sub)}</p>
    <div class="zoekbalk">
      <input type="search" id="help-zoek" placeholder="Waar loop je tegenaan?" aria-label="Zoeken in het helpcentrum">
    </div>
  </div>
</section>

<section class="hg-wrap">
  <div class="wrap">
    <div class="hg-grid" id="hg-grid">
      ${groepen}
    </div>
    <p class="hg-leeg" id="hg-leeg" hidden>Niets gevonden. Mail ons gerust, dan zoeken we het samen uit.</p>
  </div>
</section>

<section class="k-faq">
  <div class="wrap">
    <div class="sec-head">
      <p class="sec-eyebrow">Veelgestelde vragen</p>
      <h2>Waar we het vaakst naar gevraagd worden</h2>
    </div>
    <div class="faq-list">
      ${vragen}
    </div>
  </div>
</section>`;
}

/* ---------- status ---------- */
function status(p) {
  const onderdelen = (p.onderdelen || []).map(o => `<div class="st-rij">
        <span class="st-bol ${o.staat}"></span>
        <span class="st-tx"><b>${esc(o.naam)}</b><em>${esc(o.uitleg)}</em></span>
        <span class="st-label ${o.staat}">${esc({
          goed: 'Werkt normaal', traag: 'Vertraagd', storing: 'Storing', onderhoud: 'Onderhoud'
        }[o.staat] || o.staat)}</span>
      </div>`).join('\n      ');

  const historie = (p.historie || []).map(h => `<article class="hi">
        <div class="hi-kop">
          <span class="hi-bol ${h.staat}"></span>
          <b>${esc(h.titel)}</b>
          <span class="hi-datum">${esc(h.datum)}</span>
        </div>
        <p>${esc(h.tekst)}</p>
        ${h.duur ? `<span class="hi-duur">Duur: ${esc(h.duur)}</span>` : ''}
      </article>`).join('\n      ');

  const alles = (p.onderdelen || []).every(o => o.staat === 'goed');

  return `<section class="ov-hero">
  <div class="wrap">
    <span class="eyebrow"><i></i> Status</span>
    <h1>${esc(p.titel)}</h1>
    <p class="lede">${esc(p.sub)}</p>
  </div>
</section>

<section class="st-wrap">
  <div class="wrap">
    <div class="st-banner ${alles ? 'goed' : 'let'}">
      <span class="st-bol ${alles ? 'goed' : 'traag'}"></span>
      <b>${alles ? 'Alle onderdelen werken normaal' : 'Er is iets aan de hand'}</b>
      <span class="st-tijd">Bijgewerkt op ${esc(p.bijgewerkt)}</span>
    </div>

    <div class="st-kaart">
      ${onderdelen}
    </div>

    <div class="st-uptime">
      <div class="up">
        <b>${esc(p.uptime30 || '—')}</b><span>beschikbaarheid, laatste 30 dagen</span>
      </div>
      <div class="up">
        <b>${esc(p.uptime90 || '—')}</b><span>beschikbaarheid, laatste 90 dagen</span>
      </div>
      <div class="up">
        <b>${esc(p.reactie || '—')}</b><span>gemiddelde reactietijd bij een storing</span>
      </div>
    </div>

    <div class="sec-head" style="margin:52px 0 22px">
      <h2 style="font-size:22px">Eerdere meldingen</h2>
    </div>
    <div class="hi-lijst">
      ${historie}
    </div>

    <div class="st-melden">
      <b>${esc(p.meldenTitel)}</b>
      <p>${esc(p.meldenTekst)}</p>
      <a href="mailto:${esc(p.meldenMail)}" class="btn btn-primary">${esc(p.meldenKnop)}</a>
    </div>
  </div>
</section>`;
}

const SOORTEN = { juridisch, contact, verhaal, help, status };

function bouw(p, html) {
  const maker = SOORTEN[p.soort] || juridisch;
  return html({
    titel: p.title || (p.titel + ' | FixedFlows'),
    beschrijving: p.description || p.sub,
    canoniek: p.slug + '.html',
    actief: '',
    body: maker(p) + `

<section class="closing">
  <div class="wrap">
    <div class="closing-in">
      <div>
        <h2>${esc(p.slotTitel || 'Nog vragen?')}</h2>
        <p>${esc(p.slotTekst || 'Mail of bel ons. We nemen de tijd om het uit te leggen.')}</p>
      </div>
      <div class="closing-cta">
        <a href="contact.html" class="btn btn-purple">Neem contact op</a>
        <a href="app-account.html" class="btn btn-outline">Probeer 14 dagen gratis</a>
      </div>
    </div>
  </div>
</section>`,
    scripts: p.soort === 'help' ? `
(function () {
  var zoek = document.getElementById('help-zoek');
  var groepen = Array.prototype.slice.call(document.querySelectorAll('.hg'));
  var leeg = document.getElementById('hg-leeg');
  if (!zoek) return;
  zoek.addEventListener('input', function () {
    var v = this.value.trim().toLowerCase();
    var raak = 0;
    groepen.forEach(function (g) {
      var treffer = !v || g.textContent.toLowerCase().indexOf(v) !== -1;
      g.style.display = treffer ? '' : 'none';
      if (treffer) raak++;
    });
    leeg.hidden = raak > 0;
  });
})();` : ''
  });
}

module.exports = { laad, bouw };
