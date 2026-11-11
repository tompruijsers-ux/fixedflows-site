// ============================================================
//  FixedFlows — blogpagina's
//  Wordt aangeroepen vanuit build.js
// ============================================================

const { artikelen } = require('./inhoud.js');
const { illustratie } = require('./mockups.js');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// tekst die opzettelijk HTML mag bevatten (links, vet)
const rijk = s => String(s);

// ---------- losse blokken in een artikel ----------
function blok(b, i) {
  switch (b.t) {
    case 'h2':
      return `<h2 id="k${i}">${esc(b.tekst)}</h2>`;

    case 'h3':
      return `<h3>${esc(b.tekst)}</h3>`;

    case 'p':
      return `<p>${rijk(b.tekst)}</p>`;

    case 'afb':
      return `<figure class="art-afb">
        ${b.src ? `<img src="${esc(b.src)}" alt="${esc(b.bijschrift || '')}" loading="lazy">` : illustratie(i, '52%')}
        ${b.bijschrift ? `<figcaption>${esc(b.bijschrift)}</figcaption>` : ''}
      </figure>`;

    case 'tip':
    case 'feit':
      return `<aside class="kader ${b.t}">
        <span class="kader-label">${b.t === 'tip' ? 'Tip' : 'Feitje'}</span>
        <b>${esc(b.titel)}</b>
        <p>${rijk(b.tekst)}</p>
      </aside>`;

    case 'lijst':
      return `<ul class="art-lijst">${b.items.map(x => `<li>${rijk(x)}</li>`).join('')}</ul>`;

    case 'stap':
      return `<ol class="art-stappen">${b.items.map(x => `<li><b>${esc(x.k)}</b><span>${rijk(x.v)}</span></li>`).join('')}</ol>`;

    case 'quote':
      return `<blockquote class="art-quote">
        <p>${esc(b.tekst)}</p>
        ${b.bron ? `<cite>${esc(b.bron)}</cite>` : ''}
      </blockquote>`;

    case 'tabel':
      return `<div class="art-tabel"><table>
        <thead><tr>${b.kop.map(k => `<th scope="col">${esc(k)}</th>`).join('')}</tr></thead>
        <tbody>${b.rijen.map(r => `<tr>${r.map((c, j) => j === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;

    case 'link':
      return `<a class="art-link" href="${esc(b.href)}">
        <span class="art-link-txt"><b>${esc(b.titel)}</b><em>${esc(b.tekst)}</em></span>
        <span class="art-link-pijl" aria-hidden="true">→</span>
      </a>`;

    case 'cta':
      return `<aside class="art-cta">
        <b>${esc(b.titel)}</b>
        <p>${esc(b.tekst)}</p>
        <a href="${esc(b.href)}" class="btn btn-purple">${esc(b.knop)}</a>
      </aside>`;

    default:
      return '';
  }
}

// ---------- artikelpagina ----------
function artikel(a, index, html) {
  const koppen = a.body
    .map((b, i) => (b.t === 'h2' ? `<a href="#k${i}">${esc(b.tekst)}</a>` : ''))
    .filter(Boolean).join('\n        ');

  const anderen = artikelen.filter(x => x.slug !== a.slug).slice(0, 2)
    .map((x, j) => kaart(x, j)).join('\n      ');

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: a.titel,
    datePublished: a.datum,
    author: { '@type': 'Organization', name: a.auteur || 'FixedFlows' },
    publisher: { '@type': 'Organization', name: 'FixedFlows' },
    description: a.description || a.samenvatting
  });

  const body = `<article>

<section class="art-hero">
  <div class="wrap art-hero-grid">
    <div>
      <div class="art-meta">
        <span class="art-cat">${esc(a.categorie)}</span>
        <span>${esc(a.datumTekst)}</span>
        <span>${esc(a.leestijd)} lezen</span>
      </div>
      <h1>${esc(a.titel)}</h1>

      <ul class="art-kopjes">
        ${a.kopjes.map(k => `<li>
          <span class="tick p" aria-hidden="true"><svg viewBox="0 0 12 12" fill="none"><path d="M2.5 6.3l2.4 2.4L9.6 3.9" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span>${esc(k)}</span>
        </li>`).join('\n        ')}
      </ul>

      <div class="cta-row">
        <a href="${esc(a.cta.href)}" class="btn btn-primary">${esc(a.cta.tekst)}</a>
        <a href="#artikel" class="btn btn-ghost">Lees het artikel</a>
      </div>
    </div>

    <div class="art-hero-vis" aria-hidden="true">
      ${a.hero ? `<img src="${esc(a.hero)}" alt="">` : illustratie(index + 2, '72%')}
    </div>
  </div>
</section>

<section class="art-lijf" id="artikel">
  <div class="wrap art-grid">

    <aside class="art-zij">
      <div class="art-inhoud">
        <h4>In dit artikel</h4>
        ${koppen}
      </div>
      <div class="art-deel">
        <h4>Delen</h4>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://fixedflows.net/blog-${a.slug}.html" target="_blank" rel="noopener" aria-label="Deel op LinkedIn">LinkedIn</a>
        <a href="mailto:?subject=${encodeURIComponent(a.titel)}&body=${encodeURIComponent('https://fixedflows.net/blog-' + a.slug + '.html')}" aria-label="Deel via e-mail">E-mail</a>
        <button type="button" class="deel-kopie" data-link="https://fixedflows.net/blog-${a.slug}.html">Link kopiëren</button>
      </div>
    </aside>

    <div class="art-tekst">
      <p class="art-intro">${esc(a.samenvatting)}</p>
      ${a.body.map((b, i) => blok(b, i)).join('\n      ')}
    </div>

  </div>
</section>

<section class="art-meer">
  <div class="wrap">
    <div class="sec-head">
      <p class="sec-eyebrow">Meer lezen</p>
      <h2>Andere artikelen</h2>
    </div>
    <div class="blog-grid">
      ${anderen}
    </div>
  </div>
</section>

</article>

<section class="closing">
  <div class="wrap">
    <div class="closing-in">
      <div>
        <h2>Van lezen naar doen.</h2>
        <p>Zet je eerste flow op en zie binnen een week wat er binnenkomt. Veertien dagen gratis, zonder betaalgegevens.</p>
      </div>
      <div class="closing-cta">
        <a href="app-account.html" class="btn btn-purple">Start gratis</a>
        <a href="contact.html" class="btn btn-outline">Plan een demo</a>
      </div>
    </div>
  </div>
</section>`;

  const deelScript = `
(function () {
  var k = document.querySelector('.deel-kopie');
  if (!k) return;
  k.addEventListener('click', function () {
    if (navigator.clipboard) navigator.clipboard.writeText(k.dataset.link).then(function () {
      var t = k.textContent; k.textContent = 'Gekopieerd';
      setTimeout(function () { k.textContent = t; }, 1600);
    });
  });
})();`;

  return html({
    titel: `${a.titel} | FixedFlows`,
    beschrijving: a.description || a.samenvatting,
    canoniek: `blog-${a.slug}.html`,
    actief: 'blog',
    extraHead: `<script type="application/ld+json">${schema}</script>`,
    body
  });
}

// ---------- kaartje op het overzicht ----------
function kaart(a, i, uitgelicht = false) {
  return `<a class="blog-kaart${uitgelicht ? ' groot' : ''}" href="blog-${a.slug}.html">
        <span class="blog-afb">${a.hero ? `<img src="${esc(a.hero)}" alt="" loading="lazy">` : illustratie(i, uitgelicht ? '48%' : '58%')}</span>
        <span class="blog-txt">
          <span class="blog-meta"><span class="art-cat">${esc(a.categorie)}</span><span>${esc(a.leestijd)}</span></span>
          <b>${esc(a.titel)}</b>
          <em>${esc(a.samenvatting)}</em>
          <span class="blog-link">Lees verder →</span>
        </span>
      </a>`;
}

// ---------- overzichtspagina ----------
function overzicht(html) {
  const [eerste, ...rest] = artikelen;
  const cats = [...new Set(artikelen.map(a => a.categorie))];

  const body = `<section class="blog-hero">
  <div class="wrap">
    <span class="eyebrow"><i></i> Blog</span>
    <h1>Hoe je het zelf aanpakt.</h1>
    <p class="lede">Praktische artikelen over content, automatisering en opvolging. Geschreven voor mensen die het uitvoeren, niet voor mensen die erover vergaderen.</p>
    <div class="blog-cats" aria-label="Categorieën">
      <span class="cat on">Alles</span>
      ${cats.map(c => `<span class="cat">${esc(c)}</span>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="blog-uitgelicht">
  <div class="wrap">
    ${kaart(eerste, 0, true)}
  </div>
</section>

<section class="blog-lijst">
  <div class="wrap">
    <div class="sec-head">
      <p class="sec-eyebrow">Alle artikelen</p>
      <h2>Recent verschenen</h2>
    </div>
    <div class="blog-grid">
      ${rest.map((a, i) => kaart(a, i + 1)).join('\n      ')}
    </div>
  </div>
</section>

<section class="closing">
  <div class="wrap">
    <div class="closing-in">
      <div>
        <h2>Elke twee weken een nieuw artikel.</h2>
        <p>Geen nieuwsbrief vol aankondigingen — alleen wat je die week kunt toepassen. Uitschrijven met één klik.</p>
      </div>
      <div class="closing-cta">
        <a href="app-account.html" class="btn btn-purple">Probeer FixedFlows gratis</a>
        <a href="contact.html" class="btn btn-outline">Schrijf je in</a>
      </div>
    </div>
  </div>
</section>`;

  return html({
    titel: 'Blog — content, automatisering en opvolging | FixedFlows',
    beschrijving: 'Praktische artikelen over contentplanning, comment-to-DM, e-mailbezorging en het automatiseren van je klantreis.',
    canoniek: 'blog.html',
    actief: 'blog',
    body
  });
}

module.exports = { artikel, overzicht, artikelen, blok };
