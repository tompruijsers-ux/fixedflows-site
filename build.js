// ============================================================
//  FixedFlows — bouwt de volledige site
//  Draaien met:  node build.js <uitvoermap>
// ============================================================

const fs = require('fs');
const path = require('path');
const inhoud = require('./inhoud.js');
const { kanalen, services, diensten, home, instellingen } = inhoud;
const { nav, footer, ICONEN, svg, APP_URL } = require('./partials.js');
const blogbouw = require('./blogbouw.js');
const paginabouw = require('./paginabouw.js');
const { visueel, illustratie } = require('./mockups.js');
const { beeld } = require('./beelden.js');

const UIT = process.argv[2] || '.';
const lees = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FONTS = `<link rel="stylesheet" href="fonts.css">`;

// Endorsely (affiliate-tracking, koppelt aan Stripe). Build-time env var
// (Netlify: Site settings -> Environment variables -> ENDORSELY_SITE_ID),
// want dit is een statisch gebouwde site zonder eigen server om 'm runtime
// uit te lezen. Leeg = geen script, niets breekt -- zelfde "leeg = uit"-
// patroon als de andere losse koppelingen in stratella-api/.env.example.
const ENDORSELY_SITE_ID = process.env.ENDORSELY_SITE_ID || '';
const ENDORSELY_SCRIPT = ENDORSELY_SITE_ID
  ? `<script async src="https://assets.endorsely.com/endorsely.js" data-endorsely="${ENDORSELY_SITE_ID}"></script>`
  : '';

const vink = c => `<svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M3 7.8l3.1 3.1L12 5" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const tick = (i) => `<span class="tick${i === 1 ? ' p' : ''}" aria-hidden="true"><svg viewBox="0 0 12 12" fill="none"><path d="M2.5 6.3l2.4 2.4L9.6 3.9" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;

function html({ titel, beschrijving, canoniek, extraCss = '', extraHead = '', actief, body, scripts = '' }) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(beschrijving)}">
${canoniek ? `<link rel="canonical" href="https://fixedflows.net/${canoniek}">` : ''}
<meta property="og:title" content="${esc(titel)}">
<meta property="og:description" content="${esc(beschrijving)}">
<meta property="og:type" content="website">
${FONTS}
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="pagina.css">
<link rel="stylesheet" href="blog.css">
<link rel="stylesheet" href="pagina-extra.css">
${extraCss ? `<style>\n${extraCss}\n</style>` : ''}
${extraHead}
${ENDORSELY_SCRIPT}
</head>
<body>

${nav(actief)}

<main>
${body}
</main>

${footer()}
<script>
// Affiliate-code (+ optioneel een zelfgekozen kanaal-label) onthouden
// (?ref=CODE&bron=LABEL, of ?via=CODE) en meesturen naar de
// app-koppelknoppen, plus één klik loggen bij de app (los van of iemand
// ooit aanmeldt -- zo is een conversiepercentage te zien, en met welk
// label per kanaal welke link het beste werkt). Eén klik per
// browser-sessie, niet per paginaweergave, om het cijfer niet kunstmatig
// op te blazen.
(function(){
  var qs=new URLSearchParams(location.search);
  var ref=qs.get('ref')||qs.get('via');
  var bron=qs.get('bron')||'';
  if(ref){
    document.cookie='fixedflows_ref='+encodeURIComponent(ref)+';max-age=7776000;path=/;SameSite=Lax';
    document.cookie='fixedflows_bron='+encodeURIComponent(bron)+';max-age=7776000;path=/;SameSite=Lax';
  }
  var m=document.cookie.match(/(?:^|; )fixedflows_ref=([^;]*)/);
  var opgeslagen=m&&decodeURIComponent(m[1]);
  var mb=document.cookie.match(/(?:^|; )fixedflows_bron=([^;]*)/);
  var opgeslagenBron=mb&&decodeURIComponent(mb[1]);
  if(opgeslagen) document.querySelectorAll('a[href*="/#/inloggen"]').forEach(function(a){
    try{
      var u=new URL(a.href);
      if(!u.searchParams.get('ref')) u.searchParams.set('ref',opgeslagen);
      if(opgeslagenBron&&!u.searchParams.get('bron')) u.searchParams.set('bron',opgeslagenBron);
      a.href=u.toString();
    }catch(e){}
  });
  if(ref){
    try{
      if(!sessionStorage.getItem('ff_klik_gelogd')){
        sessionStorage.setItem('ff_klik_gelogd','1');
        fetch('${APP_URL}/api/openbaar/affiliate-klik',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:ref,bron:bron,verwijzer:document.referrer||''})}).catch(function(){});
      }
    }catch(e){}
  }
})();
</script>
${scripts ? `\n<script>\n${scripts}\n</script>` : ''}
</body>
</html>
`;
}

// ---------- kaartjes die op meerdere pagina's terugkomen ----------
const serviceKaarten = () => services.map(s => `<a class="svc-card" href="service-${s.slug}.html">
        <span class="svc-ico">${svg(s.icoon)}</span>
        <h3>${s.naam}</h3>
        <p>${esc(s.sub)}</p>
        <span class="svc-link">Bekijk deze service →</span>
      </a>`).join('\n      ');

const kanaalKaarten = (uitgezonderd) => kanalen.filter(k => k.slug !== uitgezonderd)
  .map(k => `<a class="chan-card" href="kanaal-${k.slug}.html">
        <span class="chan-ico" style="color:${k.kleur}">${svg(k.slug)}</span>
        <b>${k.naam}</b>
      </a>`).join('\n      ');

// ---------- sjabloon voor detailpagina's (kanaal én service) ----------
function detail(d, soort) {
  const isKanaal = soort === 'kanaal';
  const kleur = isKanaal ? d.kleur : '#6B44DE';
  const icoon = isKanaal ? d.slug : d.icoon;

  const voordelen = d.voordelen.map(v => `<article class="card">
          <h3>${esc(v.t)}</h3>
          <p>${esc(v.d)}</p>
        </article>`).join('\n        ');

  const secties = d.secties.map((s, i) => `<div class="deep${i % 2 ? ' flip' : ''}">
        <div class="deep-txt">
          <p class="kicker">${esc(s.k)}</p>
          <h3>${esc(s.t)}</h3>
          <p>${esc(s.d)}</p>
          <a href="app-account.html" class="btn btn-ghost btn-sm">Start gratis</a>
        </div>
        <div class="deep-vis" aria-hidden="true">
          ${visueel(d.slug, i)}
        </div>
      </div>`).join('\n      ');

  const faq = d.faq.map(f => `<details>
        <summary>${esc(f.v)}</summary>
        <p>${esc(f.a)}</p>
      </details>`).join('\n      ');

  const checks = d.checks.map((c, i) => `<li>${tick(i)}<span>${esc(c)}</span></li>`).join('\n        ');

  // ---- de voorbeeldpost in de hero ----
  function postMock(k) {
    const p = k.post || {};
    const initialen = (p.naam || k.naam).split(/[\s@.]+/).filter(Boolean)
      .slice(0, 2).map(x => x[0].toUpperCase()).join('');
    const regels = (p.tekst || '').split('\n\n')
      .map(t => `<p>${esc(t).replace(/\n/g, '<br>')}</p>`).join('');
    const media = `<div class="pm-beeld r-${k.slug}">${beeld(p.beeld || 'dak')}</div>`;

    const kop = `<div class="pm-kop">
          <span class="pm-av" style="background:${kleur}">${initialen}</span>
          <span class="pm-wie"><b>${esc(p.naam || k.naam)}</b><em>${esc(p.meta || '')}</em></span>
          <span class="pm-logo" style="color:${kleur}">${svg(k.slug)}</span>
        </div>`;

    const stats = (p.stats || []).map(x =>
      `<span class="pm-stat">${x[0] ? `<i>${x[0]}</i>` : ''}${esc(x[1])}</span>`).join('');
    const acties = (p.acties || []).length
      ? `<div class="pm-acties">${p.acties.map(a => `<span>${esc(a)}</span>`).join('')}</div>` : '';

    // per platform een andere opbouw, zodat het herkenbaar oogt
    switch (k.slug) {
      case 'instagram':
        return `<div class="pm pm-ig">${kop}${media}
          <div class="pm-balk"><span>♥</span><span>💬</span><span>↗</span><b>🔖</b></div>
          <div class="pm-tekst"><span class="pm-tel">${stats}</span>${regels}</div>
          ${acties ? `<div class="pm-tags">${p.acties.map(a => `<span>${esc(a)}</span>`).join('')}</div>` : ''}
        </div>`;

      case 'linkedin':
        return `<div class="pm pm-li">${kop}
          <div class="pm-tekst lang">${regels}<button type="button" class="pm-meer">…meer</button></div>
          ${media}
          <div class="pm-stats">${stats}</div>${acties}
        </div>`;

      case 'x':
        return `<div class="pm pm-x">${kop}
          <div class="pm-tekst">${regels}</div>${media}
          <div class="pm-stats breed">${stats}</div>
        </div>`;

      case 'tiktok':
        return `<div class="pm pm-tt">${media}
          <div class="pm-over">
            <div class="pm-over-tekst"><b>@${esc(p.naam || k.handle)}</b>${regels}</div>
            <div class="pm-zij">${stats}</div>
          </div>
        </div>`;

      case 'pinterest':
        return `<div class="pm pm-pin">${media}
          <div class="pm-tekst">${regels}</div>
          <div class="pm-stats">${stats}</div>${acties}
        </div>`;

      case 'youtube':
        return `<div class="pm pm-yt">
          <div class="pm-thumb">${beeld(p.beeld || 'monteur')}<span class="pm-duur">${esc((p.stats[0] || ['',''])[1])}</span></div>
          <div class="pm-yt-onder">
            <span class="pm-av" style="background:${kleur}">${initialen}</span>
            <span class="pm-yt-tx"><b>${esc(p.tekst)}</b><em>${esc(p.naam)} · ${esc(p.meta)}</em></span>
          </div>
        </div>`;

      default: // facebook, threads
        return `<div class="pm pm-fb">${kop}
          <div class="pm-tekst">${regels}</div>${media}
          <div class="pm-stats">${stats}</div>${acties}
        </div>`;
    }
  }

  const heroMock = isKanaal ? postMock(d) : `<div class="mock">
        <div class="mock-top">
          <span class="mock-av svc" style="color:${kleur}">${svg(icoon)}</span>
          <span class="mock-name">${esc(d.naam)}<em>Stap ${d.stap} van 6 in de klantreis</em></span>
        </div>
        <div class="mock-body big">
          ${d.voordelen.slice(0, 4).map(v => `<span class="mini"><b>${esc(v.t)}</b><em>${esc(v.d)}</em></span>`).join('\n          ')}
        </div>
        <div class="mock-foot">
          <span class="chip ok">Inbegrepen vanaf Groei</span>
        </div>
      </div>`;

  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: d.faq.map(f => ({ '@type': 'Question', name: f.v, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  });

  const body = `<section class="k-hero">
  <div class="wrap k-hero-grid">
    <div>
      <span class="k-badge" style="background:${kleur}14;color:${kleur}">${svg(icoon)} ${isKanaal ? d.naam : 'Service'}</span>
      <h1>${esc(d.h1)}</h1>
      <p class="k-sub">${esc(d.sub)}</p>
      <p class="lede">${esc(d.lede)}</p>
      <ul class="checks">
        ${checks}
      </ul>
      <div class="cta-row">
        <a href="app-account.html" class="btn btn-primary">Probeer 14 dagen gratis</a>
        <a href="app-kalender.html" class="btn btn-ghost">Bekijk de demo</a>
      </div>
      <p class="fineprint">Geen creditcard nodig${isKanaal ? ` · Publiceren via de officiële ${d.naam}-koppeling` : ' · Onderdeel van de complete klantreis'}</p>
    </div>
    <div class="k-vis" aria-hidden="true">
      ${heroMock}
    </div>
  </div>
</section>

<section class="k-voordelen">
  <div class="wrap">
    <div class="sec-head">
      <p class="sec-eyebrow">Wat je ermee kunt</p>
      <h2>${isKanaal ? 'Vier dingen die je hier niet meer handmatig doet' : 'Wat deze service voor je overneemt'}</h2>
    </div>
    <div class="cards">
        ${voordelen}
    </div>
  </div>
</section>

<section class="k-deep">
  <div class="wrap">
      ${secties}
  </div>
</section>

<section class="k-faq">
  <div class="wrap">
    <div class="sec-head">
      <p class="sec-eyebrow">Veelgestelde vragen</p>
      <h2>${esc(d.naam)} en FixedFlows</h2>
    </div>
    <div class="faq-list">
      ${faq}
    </div>
  </div>
</section>

<section class="andere">
  <div class="wrap">
    <p class="sec-eyebrow">${isKanaal ? 'Meer kanalen' : 'Meer services'}</p>
    <h2>${isKanaal ? 'FixedFlows werkt ook op' : 'Sluit aan op de rest van de reis'}</h2>
    ${isKanaal
      ? `<div class="chan-grid">\n      ${kanaalKaarten(d.slug)}\n    </div>`
      : `<div class="svc-grid">\n      ${services.filter(s => s.slug !== d.slug).map(s => `<a class="svc-card" href="service-${s.slug}.html">
        <span class="svc-ico">${svg(s.icoon)}</span>
        <h3>${s.naam}</h3>
        <p>${esc(s.kort)}</p>
      </a>`).join('\n      ')}\n    </div>`}
  </div>
</section>

<section class="closing">
  <div class="wrap">
    <div class="closing-in">
      <div>
        <h2>${isKanaal ? `Zet je ${esc(d.naam)} op de automaat.` : 'Zet je klantreis op de automaat.'}</h2>
        <p>Koppel je kanalen, vul je kalender en laat FixedFlows de opvolging doen. Veertien dagen gratis, zonder betaalgegevens.</p>
      </div>
      <div class="closing-cta">
        <a href="app-account.html" class="btn btn-purple">Start gratis</a>
        <a href="contact.html" class="btn btn-outline">Plan een demo van 20 minuten</a>
      </div>
    </div>
  </div>
</section>`;

  return html({
    titel: d.title,
    beschrijving: d.description,
    canoniek: `${soort}-${d.slug}.html`,
    actief: isKanaal ? 'kanalen' : 'services',
    extraHead: `<script type="application/ld+json">${faqSchema}</script>`,
    body
  });
}

// ---------- overzichtspagina's ----------
function overzicht(soort) {
  const isKanaal = soort === 'kanaal';
  const items = isKanaal ? kanalen : services;

  const kaarten = items.map(i => isKanaal
    ? `<a class="ov-card" href="kanaal-${i.slug}.html">
        <span class="ov-ico" style="background:${i.kleur}14;color:${i.kleur}">${svg(i.slug)}</span>
        <h3>${i.naam}</h3>
        <p>${esc(i.sub)}</p>
        <span class="ov-link">Bekijk wat er kan →</span>
      </a>`
    : `<a class="ov-card" href="service-${i.slug}.html">
        <span class="ov-ico" style="background:var(--purple-soft);color:var(--purple)">${svg(i.icoon)}</span>
        <span class="ov-stap">Stap ${i.stap}</span>
        <h3>${i.naam}</h3>
        <p>${esc(i.sub)}</p>
        <span class="ov-link">Bekijk deze service →</span>
      </a>`).join('\n      ');

  const body = `<section class="ov-hero">
  <div class="wrap">
    <span class="eyebrow"><i></i> ${isKanaal ? 'Kanalen' : 'Services'}</span>
    <h1>${isKanaal ? 'Acht kanalen. Eén kalender.' : 'Zes services. Eén klantreis.'}</h1>
    <p class="lede">${isKanaal
      ? 'Schrijf één keer, publiceer waar je publiek zit. Elk kanaal heeft eigen formaten en eigen regels — FixedFlows houdt die uit elkaar zodat jij dat niet hoeft.'
      : 'Van het schrijven van een post tot het bellen van een klant. Je zet aan wat je nodig hebt; alles deelt dezelfde contacten, segmenten en motor eronder.'}</p>
    <div class="cta-row">
      <a href="app-account.html" class="btn btn-primary">Probeer 14 dagen gratis</a>
      <a href="index.html#reis" class="btn btn-ghost">Bekijk de klantreis</a>
    </div>
  </div>
</section>

<section class="ov-grid-wrap">
  <div class="wrap">
    <div class="ov-grid">
      ${kaarten}
    </div>
  </div>
</section>

<section class="closing">
  <div class="wrap">
    <div class="closing-in">
      <div>
        <h2>${isKanaal ? 'Koppel je kanalen in vijf minuten.' : 'Begin bij één service, groei naar de hele reis.'}</h2>
        <p>${isKanaal
          ? 'Je logt in bij het platform zelf en keurt daar goed welke rechten FixedFlows krijgt. Intrekken kan op elk moment.'
          : 'De meeste bedrijven starten met de kalender en zetten de automatisering aan zodra die staat. Alles blijft bewaard als je uitbreidt.'}</p>
      </div>
      <div class="closing-cta">
        <a href="app-account.html" class="btn btn-purple">Start gratis</a>
        <a href="contact.html" class="btn btn-outline">Plan een demo</a>
      </div>
    </div>
  </div>
</section>`;

  return html({
    titel: isKanaal
      ? 'Kanalen — plan en publiceer op acht platforms | FixedFlows'
      : 'Services — de complete klantreis automatiseren | FixedFlows',
    beschrijving: isKanaal
      ? 'FixedFlows plant en publiceert op Facebook, Instagram, LinkedIn, TikTok, X, Pinterest, Threads en YouTube — vanuit één kalender.'
      : 'Contentcreatie, contentkalender, automatische leads, e-mailmarketing, automatische segmentatie en digitale marketing — in één doorlopende klantreis.',
    canoniek: isKanaal ? 'kanalen.html' : 'services.html',
    actief: isKanaal ? 'kanalen' : 'services',
    body
  });
}

// ---------- diensten (het marketingbureau van Tom zelf: done-for-you
// werk zoals social media management, SEO, Google Ads en affiliate
// marketing -- los van de FixedFlows-software en dus ook los van de
// "zes services, één klantreis"-verhaallijn van detail()/overzicht()
// hierboven, die specifiek over de SaaS-functies gaat) ----------
function dienstDetail(d) {
  const voordelen = d.voordelen.map(v => `<article class="card">
          <h3>${esc(v.t)}</h3>
          <p>${esc(v.d)}</p>
        </article>`).join('\n        ');

  const secties = d.secties.map((s, i) => `<div class="deep${i % 2 ? ' flip' : ''}">
        <div class="deep-txt">
          <p class="kicker">${esc(s.k)}</p>
          <h3>${esc(s.t)}</h3>
          <p>${esc(s.d)}</p>
          <a href="contact.html" class="btn btn-ghost btn-sm">Vraag een offerte aan</a>
        </div>
        <div class="deep-vis" aria-hidden="true">
          ${visueel(d.slug, i)}
        </div>
      </div>`).join('\n      ');

  const faq = d.faq.map(f => `<details>
        <summary>${esc(f.v)}</summary>
        <p>${esc(f.a)}</p>
      </details>`).join('\n      ');

  const checks = d.checks.map((c, i) => `<li>${tick(i)}<span>${esc(c)}</span></li>`).join('\n        ');

  const heroMock = `<div class="mock">
        <div class="mock-top">
          <span class="mock-av svc" style="color:#6B44DE">${svg(d.icoon)}</span>
          <span class="mock-name">${esc(d.naam)}<em>Uitgevoerd door het FixedFlows-team</em></span>
        </div>
        <div class="mock-body big">
          ${d.voordelen.slice(0, 4).map(v => `<span class="mini"><b>${esc(v.t)}</b><em>${esc(v.d)}</em></span>`).join('\n          ')}
        </div>
        <div class="mock-foot">
          <span class="chip ok">Maandelijks opzegbaar</span>
        </div>
      </div>`;

  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: d.faq.map(f => ({ '@type': 'Question', name: f.v, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  });

  const body = `<section class="k-hero">
  <div class="wrap k-hero-grid">
    <div>
      <span class="k-badge" style="background:#6B44DE14;color:#6B44DE">${svg(d.icoon)} Dienst</span>
      <h1>${esc(d.h1)}</h1>
      <p class="k-sub">${esc(d.sub)}</p>
      <p class="lede">${esc(d.lede)}</p>
      <ul class="checks">
        ${checks}
      </ul>
      <div class="cta-row">
        <a href="contact.html" class="btn btn-primary">Vraag een offerte aan</a>
        <a href="contact.html" class="btn btn-ghost">Plan een kennismaking</a>
      </div>
      <p class="fineprint">Geen langlopend contract · Wordt door mensen uitgevoerd, niet door software</p>
    </div>
    <div class="k-vis" aria-hidden="true">
      ${heroMock}
    </div>
  </div>
</section>

<section class="k-voordelen">
  <div class="wrap">
    <div class="sec-head">
      <p class="sec-eyebrow">Wat je ermee kunt</p>
      <h2>Wat deze dienst voor je overneemt</h2>
    </div>
    <div class="cards">
        ${voordelen}
    </div>
  </div>
</section>

<section class="k-deep">
  <div class="wrap">
      ${secties}
  </div>
</section>

<section class="k-faq">
  <div class="wrap">
    <div class="sec-head">
      <p class="sec-eyebrow">Veelgestelde vragen</p>
      <h2>${esc(d.naam)} door FixedFlows</h2>
    </div>
    <div class="faq-list">
      ${faq}
    </div>
  </div>
</section>

<section class="andere">
  <div class="wrap">
    <p class="sec-eyebrow">Meer diensten</p>
    <h2>Ook interessant voor je bedrijf</h2>
    <div class="svc-grid">
      ${diensten.filter(x => x.slug !== d.slug).map(x => `<a class="svc-card" href="dienst-${x.slug}.html">
        <span class="svc-ico">${svg(x.icoon)}</span>
        <h3>${x.naam}</h3>
        <p>${esc(x.kort)}</p>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="closing">
  <div class="wrap">
    <div class="closing-in">
      <div>
        <h2>Laat het overnemen door een team dat het al doet.</h2>
        <p>Vertel kort over je bedrijf en we laten binnen twee werkdagen weten wat wij voor je kunnen betekenen — en wat het kost.</p>
      </div>
      <div class="closing-cta">
        <a href="contact.html" class="btn btn-purple">Vraag een offerte aan</a>
        <a href="contact.html" class="btn btn-outline">Plan een kennismaking</a>
      </div>
    </div>
  </div>
</section>`;

  return html({
    titel: d.title,
    beschrijving: d.description,
    canoniek: `dienst-${d.slug}.html`,
    actief: 'diensten',
    extraHead: `<script type="application/ld+json">${faqSchema}</script>`,
    body
  });
}

function dienstenOverzicht() {
  const kaarten = diensten.map(d => `<a class="ov-card" href="dienst-${d.slug}.html">
        <span class="ov-ico" style="background:var(--purple-soft);color:var(--purple)">${svg(d.icoon)}</span>
        <h3>${d.naam}</h3>
        <p>${esc(d.sub)}</p>
        <span class="ov-link">Bekijk deze dienst →</span>
      </a>`).join('\n      ');

  const body = `<section class="ov-hero">
  <div class="wrap">
    <span class="eyebrow"><i></i> Diensten</span>
    <h1>Marketing die we voor je uitvoeren.</h1>
    <p class="lede">Naast de FixedFlows-software voeren we deze onderdelen ook gewoon voor je uit: social media management, SEO, Google Ads en affiliate marketing. Geen software om te bedienen, gewoon een team dat het overneemt.</p>
    <div class="cta-row">
      <a href="contact.html" class="btn btn-primary">Vraag een offerte aan</a>
      <a href="contact.html" class="btn btn-ghost">Plan een kennismaking</a>
    </div>
  </div>
</section>

<section class="ov-grid-wrap">
  <div class="wrap">
    <div class="ov-grid">
      ${kaarten}
    </div>
  </div>
</section>

<section class="closing">
  <div class="wrap">
    <div class="closing-in">
      <div>
        <h2>Begin bij één dienst, breid uit wanneer je wilt.</h2>
        <p>De meeste klanten starten met social media of SEO en breiden later uit. Elke dienst is los af te nemen en maandelijks opzegbaar.</p>
      </div>
      <div class="closing-cta">
        <a href="contact.html" class="btn btn-purple">Vraag een offerte aan</a>
        <a href="contact.html" class="btn btn-outline">Plan een kennismaking</a>
      </div>
    </div>
  </div>
</section>`;

  return html({
    titel: 'Diensten — social media, SEO, Google Ads en affiliate marketing | FixedFlows',
    beschrijving: 'Naast de FixedFlows-software voeren we social media management, SEO, Google Ads en affiliate marketing ook gewoon voor je uit.',
    canoniek: 'diensten.html',
    actief: 'diensten',
    body
  });
}

// ---------- schrijven ----------
let n = 0;
for (const k of kanalen) { fs.writeFileSync(path.join(UIT, `kanaal-${k.slug}.html`), detail(k, 'kanaal')); n++; }
for (const s of services) { fs.writeFileSync(path.join(UIT, `service-${s.slug}.html`), detail(s, 'service')); n++; }
for (const d of diensten) { fs.writeFileSync(path.join(UIT, `dienst-${d.slug}.html`), dienstDetail(d)); n++; }

fs.writeFileSync(path.join(UIT, 'kanalen.html'), overzicht('kanaal'));
fs.writeFileSync(path.join(UIT, 'services.html'), overzicht('service'));
fs.writeFileSync(path.join(UIT, 'diensten.html'), dienstenOverzicht());

// homepage — teksten komen uit content/home.json
const H = home;
// Hero-carrousel: vier visuele productmockups (geen tekst eronder,
// puur beeld) i.p.v. alleen de kalender -- contentkalender, ideeënbord,
// de automatiseringsbouwer en automatische chatgesprekken. Elke
// pages/index.*.html hergebruikt dezelfde .cal-kaartchrome (zie
// pages/index.kalender.html als origineel) zodat ze in de carrousel
// niet van stijl/maat springen.
const heroSlides = [
  lees('pages/index.kalender.html'),
  lees('pages/index.ideeenbord.html'),
  lees('pages/index.agent.html'),
  lees('pages/index.chat.html'),
];

const homeBody = `<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow"><i></i> ${esc(H.heroEyebrow)}</span>
      <h1>${esc(H.heroRegel1)}<br>${esc(H.heroRegel2)}<br><span class="accent">${esc(H.heroRegel3)}</span></h1>
      <p class="lede">${esc(H.heroLede)}</p>
      <ul class="checks">
        ${H.heroChecks.map((c, i) => `<li>${tick(i)}<span>${esc(c)}</span></li>`).join('\n        ')}
      </ul>
      <div class="cta-row">
        <a href="app-account.html" class="btn btn-primary">${esc(instellingen.knopProef)}</a>
        <a href="app-kalender.html" class="btn btn-ghost"><span class="play" aria-hidden="true"><svg viewBox="0 0 11 11" fill="none"><path d="M2 1.2l7 4.3-7 4.3V1.2z" fill="#6B44DE"/></svg></span> ${esc(H.heroKnop2)}</a>
      </div>
      <p class="fineprint">${esc(H.heroFineprint)}</p>
    </div>
    <div class="cal-stage">
      <div class="hero-carrousel" id="heroCarrousel">
        ${heroSlides.map((s, i) => `<div class="hero-slide${i === 0 ? ' actief' : ''}">${s}</div>`).join('\n        ')}
      </div>
      <div class="hero-dots" id="heroDots"></div>
    </div>
  </div>
</section>

<section class="strip">
  <div class="wrap strip-in">
    <span class="label">${esc(H.stripLabel)}</span>
    ${H.stripPlaatsen.map(p => `<span>${esc(p)}</span>`).join('')}
  </div>
</section>

<section class="reis" id="reis">
  <div class="wrap">
    <div class="sec-head center">
      <p class="sec-eyebrow">${esc(H.reisEyebrow)}</p>
      <h2>${esc(H.reisTitel)}</h2>
      <p>${esc(H.reisLede)}</p>
    </div>
    <ol class="reis-lijn">
      ${H.reisStappen.map((st, i) => {
        const soort = st.label === 'AI' ? 'ai' : (st.label === 'Jij' ? 'mens' : '');
        return `<li class="stap${st.label === 'Jij' ? ' jij' : ''}">
        <span class="stap-nr">${String(i + 1).padStart(2, '0')}</span>
        <span class="stap-tag ${soort}">${esc(st.label)}</span>
        <h3>${esc(st.titel)}</h3>
        <p>${esc(st.tekst)}</p>
        <a href="${esc(st.href)}">${esc(st.linkTekst)} →</a>
      </li>`;
      }).join('\n      ')}
    </ol>
  </div>
</section>

<section class="ai-blok">
  <div class="wrap ai-grid">
    <div>
      <p class="sec-eyebrow">${esc(H.aiEyebrow)}</p>
      <h2>${esc(H.aiTitel)}</h2>
      <p class="ai-lede">${esc(H.aiLede)}</p>
      <ul class="ai-lijst">
        ${H.aiPunten.map(p => `<li><b>${esc(p.vet)}</b> ${esc(p.tekst)}</li>`).join('\n        ')}
      </ul>
      <a href="${esc(H.aiKnopHref)}" class="btn btn-primary">${esc(H.aiKnop)}</a>
    </div>
    <div class="ai-vis" aria-hidden="true">
      <div class="flow-card">
        <div class="flow-node start"><b>Reactie: "DAK"</b><em>Instagram · 14:02</em></div>
        <span class="flow-arrow"></span>
        <div class="flow-node"><b>Bericht verstuurd</b><em>14:02 · binnen 4 seconden</em></div>
        <span class="flow-arrow"></span>
        <div class="flow-node"><b>Antwoord: "Lekkage"</b><em>Segment toegekend</em></div>
        <span class="flow-arrow"></span>
        <div class="flow-node"><b>E-mail bevestigd</b><em>Gids verstuurd · 14:09</em></div>
        <span class="flow-arrow"></span>
        <div class="flow-node hot"><b>Score 74 · hete lead</b><em>Prijzenpagina bekeken · bel vandaag</em></div>
      </div>
    </div>
  </div>
</section>

<section class="services" id="services">
  <div class="wrap">
    <div class="sec-head">
      <p class="sec-eyebrow">${esc(H.servicesEyebrow)}</p>
      <h2>${esc(H.servicesTitel)}</h2>
      <p>${esc(H.servicesLede)}</p>
    </div>
    <div class="svc-grid">
      ${serviceKaarten()}
    </div>
  </div>
</section>

<section class="kan-blok">
  <div class="wrap">
    <div class="sec-head">
      <p class="sec-eyebrow">${esc(H.kanalenEyebrow)}</p>
      <h2>${esc(H.kanalenTitel)}</h2>
      <p>${esc(H.kanalenLede)}</p>
    </div>
    <div class="chan-grid">
      ${kanaalKaarten(null)}
    </div>
  </div>
</section>

<section class="closing">
  <div class="wrap">
    <div class="closing-in">
      <div>
        <h2>${esc(instellingen.slotTitel)}</h2>
        <p>${esc(instellingen.slotTekst)}</p>
      </div>
      <div class="closing-cta">
        <a href="app-account.html" class="btn btn-purple">${esc(instellingen.knopProef)}</a>
        <a href="contact.html" class="btn btn-outline">${esc(instellingen.knopDemo)}</a>
      </div>
    </div>
  </div>
</section>`;

// Schuift elke ~4,5s door de hero-slides (fade, geen tekst/onderschrift
// -- puur het mockup zelf). Pauzeert bij hover; de bolletjes springen
// direct naar een slide.
const heroScript = `(function(){
  var wrap=document.getElementById('heroCarrousel'), dotsWrap=document.getElementById('heroDots');
  if(!wrap||!dotsWrap) return;
  var slides=Array.prototype.slice.call(wrap.children);
  if(slides.length<2) return;
  var idx=0, timer=null;
  slides.forEach(function(_,i){
    var b=document.createElement('button');
    b.type='button'; b.setAttribute('aria-label','Toon voorbeeld '+(i+1));
    b.onclick=function(){ ga(i); herstart(); };
    dotsWrap.appendChild(b);
  });
  var dots=Array.prototype.slice.call(dotsWrap.children);
  function render(){
    slides.forEach(function(s,i){ s.classList.toggle('actief', i===idx); });
    dots.forEach(function(d,i){ d.classList.toggle('actief', i===idx); });
  }
  function ga(i){ idx=((i%slides.length)+slides.length)%slides.length; render(); }
  function herstart(){ clearInterval(timer); timer=setInterval(function(){ ga(idx+1); },4500); }
  render(); herstart();
  wrap.addEventListener('mouseenter',function(){ clearInterval(timer); });
  wrap.addEventListener('mouseleave', herstart);
})();`;

fs.writeFileSync(path.join(UIT, 'index.html'), html({
  titel: H.titel,
  beschrijving: H.description,
  canoniek: 'index.html',
  actief: 'home',
  extraCss: lees('pages/index.style.css'),
  body: homeBody,
  scripts: heroScript
}));

// prijzen
fs.writeFileSync(path.join(UIT, 'prijzen.html'), html({
  titel: 'Prijzen — FixedFlows',
  beschrijving: 'Kies het pakket dat bij je past. Contentkalender, chat-automatisering en e-mailmarketing in één abonnement. 14 dagen gratis, geen creditcard nodig.',
  canoniek: 'prijzen.html',
  actief: 'prijzen',
  extraCss: lees('pages/prijzen.style.css'),
  body: lees('pages/prijzen.body.html'),
  scripts: lees('pages/prijzen.script.js')
}));

// losse pagina's: contact, over ons, helpcentrum, status en juridisch
paginabouw.laad().forEach(p => {
  fs.writeFileSync(path.join(UIT, p.slug + '.html'), paginabouw.bouw(p, html));
  n++;
});

// blog
fs.writeFileSync(path.join(UIT, 'blog.html'), blogbouw.overzicht(html));
blogbouw.artikelen.forEach((a, i) => {
  fs.writeFileSync(path.join(UIT, `blog-${a.slug}.html`), blogbouw.artikel(a, i, html));
  n++;
});

console.log(`Klaar: ${n} detailpagina's + kanalen, services, index en prijzen.`);
