// ============================================================
//  FixedFlows — visuele bouwstenen
//  Vervangen de lege grijze blokken door herkenbare schermen.
//  Voeg een type toe en verwijs ernaar vanuit build.js.
// ============================================================

const M = { P: '#6B44DE', B: '#0F3568', A: '#3B82C4', L: '#DCE2F0' };

const rij = (w, k = 'ln') => `<span class="${k}" style="width:${w}%"></span>`;

const mockups = {

  // --- postbewerker met AI-voorstel ---
  editor: () => `<div class="mk">
    <div class="mk-bar"><b>Nieuwe post</b><span class="mk-pill p">AI-voorstel</span></div>
    <div class="mk-body">
      <p class="mk-tekst"><b>Zonnepanelen na een storm?</b> Negen van de tien keer zit het niet in de panelen, maar in de omvormer of de bekabeling.</p>
      <p class="mk-tekst">Wij meten daarom altijd eerst de werkelijke opbrengst na, voordat we iets adviseren. Dat kost een halve ochtend en voorkomt een dure vergissing.</p>
      <p class="mk-tekst">Reageer met ZON en we sturen je de checklist toe.</p>
      <div class="mk-chips"><span class="mk-chip">#zonnepanelen</span><span class="mk-chip">#utrecht</span><span class="mk-chip">#onderhoud</span></div>
    </div>
    <div class="mk-foot"><span class="mk-pill">Opslaan als concept</span><span class="mk-pill b">Inplannen</span></div>
  </div>`,

  // --- mini maandkalender (werkweek, vier weken) ---
  kalender: () => {
    const posts = { 0: M.P, 2: M.A, 4: M.B, 5: M.A, 6: M.P, 8: M.A, 10: M.B, 12: M.A, 13: M.P, 15: M.P, 17: M.A, 19: M.B };
    let weken = '';
    for (let w = 0; w < 4; w++) {
      let cellen = '';
      for (let d = 0; d < 5; d++) {
        const i = w * 5 + d;
        cellen += `<span class="mk-dag">${posts[i] ? `<i style="background:${posts[i]}"></i>` : ''}</span>`;
      }
      weken += `<span class="mk-wk">W${w + 1}</span>${cellen}`;
    }
    return `<div class="mk">
      <div class="mk-bar"><b>Deze maand</b><span class="mk-pill">12 posts</span></div>
      <div class="mk-kal">
        <span class="mk-hoek"></span><span class="mk-dg">ma</span><span class="mk-dg">di</span><span class="mk-dg">wo</span><span class="mk-dg">do</span><span class="mk-dg">vr</span>
        ${weken}
      </div>
      <div class="mk-legend"><span><i style="background:${M.B}"></i>Ingepland</span><span><i style="background:${M.P}"></i>Review</span><span><i style="background:${M.A}"></i>Concept</span></div>
    </div>`;
  },

  // --- gesprek in de DM ---
  dm: () => `<div class="mk">
    <div class="mk-bar"><b>Instagram · gesprek</b><span class="mk-pill p">Automatisch</span></div>
    <div class="mk-chat">
      <span class="bb in">ZON</span>
      <span class="bb uit">Leuk dat je reageert! Waar ben je naar op zoek?</span>
      <div class="bb-keuze"><span>Zonnepanelen</span><span>Thuisbatterij</span><span>Laadpaal</span></div>
      <span class="bb in">Zonnepanelen</span>
      <span class="bb uit">Duidelijk. Naar welk e-mailadres mag de gids?</span>
      <span class="bb in">anja@voorbeeld.nl</span>
    </div>
    <div class="mk-foot"><span class="mk-pill b">Segment: zonnepanelen</span><span class="mk-pill">Naar e-mailflow →</span></div>
  </div>`,

  // --- e-mailflow ---
  flow: () => `<div class="mk">
    <div class="mk-bar"><b>Flow: zonnepanelen</b><span class="mk-pill p">Actief · 214</span></div>
    <div class="mk-flow">
      <span class="fn start">Bevestiging gevraagd</span>
      <span class="fp"></span>
      <span class="fn">Gids verstuurd</span>
      <span class="fp"></span>
      <span class="fn wacht">Wacht 2 dagen</span>
      <span class="fp"></span>
      <span class="fn">Klantverhaal Bilthoven</span>
      <span class="fp"></span>
      <span class="fn eind">Aanbod opbrengstcheck</span>
    </div>
  </div>`,

  // --- segmenten met score ---
  segment: () => `<div class="mk">
    <div class="mk-bar"><b>Segmenten</b><span class="mk-pill">Live bijgewerkt</span></div>
    <div class="mk-lijst">
      <span class="li"><b>Zonnepanelen</b><em>412 contacten</em><i class="sc hoog">74</i></span>
      <span class="li"><b>Thuisbatterij</b><em>287 contacten</em><i class="sc mid">51</i></span>
      <span class="li"><b>Laadpaal</b><em>163 contacten</em><i class="sc mid">44</i></span>
      <span class="li"><b>Geen respons</b><em>96 contacten</em><i class="sc laag">12</i></span>
    </div>
    <div class="mk-foot"><span class="mk-pill b">3 hete leads vandaag</span></div>
  </div>`,

  // --- resultaten ---
  stats: () => `<div class="mk">
    <div class="mk-bar"><b>Resultaat per post</b><span class="mk-pill">Deze maand</span></div>
    <div class="mk-bars">
      ${[38, 62, 45, 88, 54, 71, 96, 49].map((h, i) => `<span class="bar" style="height:${h}%;background:${i === 6 ? M.P : M.B};opacity:${i === 6 ? 1 : .28}"></span>`).join('')}
    </div>
    <div class="mk-kpi"><span><b>147</b><em>leads</em></span><span><b>12,4%</b><em>naar e-mail</em></span><span><b>9</b><em>gesprekken</em></span></div>
  </div>`,

  // --- goedkeuring ---
  goedkeuring: () => `<div class="mk">
    <div class="mk-bar"><b>Ter goedkeuring</b><span class="mk-pill p">2 open</span></div>
    <div class="mk-lijst">
      <span class="li"><b>Voor &amp; na: 14 panelen</b><em>Week 2 · Instagram</em><i class="st wacht">Wacht</i></span>
      <span class="li"><b>Vacature installateur</b><em>Week 2 · LinkedIn</em><i class="st wacht">Wacht</i></span>
      <span class="li"><b>18 panelen in Zeist</b><em>Week 1 · Instagram</em><i class="st ok">Akkoord</i></span>
    </div>
    <div class="mk-foot"><span class="mk-pill">Afkeuren</span><span class="mk-pill b">Alles goedkeuren</span></div>
  </div>`,

  // --- zoekwoorden ---
  zoekwoord: () => `<div class="mk">
    <div class="mk-bar"><b>Zoekwoorden</b><span class="mk-pill">Nederland</span></div>
    <div class="mk-tab">
      <span class="tr kop"><b>Term</b><em>Volume</em><i>Positie</i></span>
      <span class="tr"><b>zonnepanelen utrecht</b><em>1.900</em><i class="pos goed">3</i></span>
      <span class="tr"><b>thuisbatterij kopen</b><em>880</em><i class="pos goed">5</i></span>
      <span class="tr"><b>zonnepanelen kosten</b><em>2.400</em><i class="pos mid">11</i></span>
      <span class="tr"><b>laadpaal laten plaatsen</b><em>3.600</em><i class="pos laag">24</i></span>
    </div>
  </div>`,

  // --- feedraster ---
  feed: () => `<div class="mk">
    <div class="mk-bar"><b>Rastervoorbeeld</b><span class="mk-pill p">Volgende 9</span></div>
    <div class="mk-raster">
      ${[M.P, M.A, M.B, M.A, M.P, M.A, M.B, M.P, M.A].map((c, i) => `<span style="background:${c};opacity:${.14 + (i % 3) * .1}"></span>`).join('')}
    </div>
    <div class="mk-foot"><span class="mk-pill">Volgorde aanpassen</span></div>
  </div>`,

  // --- videolijst ---
  video: () => `<div class="mk">
    <div class="mk-bar"><b>Opnames klaar</b><span class="mk-pill p">5 gepland</span></div>
    <div class="mk-lijst">
      <span class="li"><b>3 fouten bij zonnepanelen</b><em>Hook geschreven · 0:42</em><i class="st ok">Klaar</i></span>
      <span class="li"><b>Werkt jouw omvormer nog</b><em>Hook geschreven · 0:38</em><i class="st ok">Klaar</i></span>
      <span class="li"><b>Wat levert een thuisbatterij op</b><em>Nog opnemen</em><i class="st wacht">Concept</i></span>
    </div>
  </div>`
};

// Welke mockup hoort bij welke pagina en welk blok
const TOEWIJZING = {
  facebook: ['kalender', 'stats', 'dm'],
  instagram: ['feed', 'dm', 'stats'],
  linkedin: ['kalender', 'editor', 'goedkeuring'],
  tiktok: ['editor', 'kalender', 'video'],
  x: ['editor', 'kalender', 'stats'],
  pinterest: ['kalender', 'zoekwoord', 'stats'],
  threads: ['editor', 'feed', 'kalender'],
  youtube: ['zoekwoord', 'kalender', 'stats'],

  'contentcreatie': ['editor', 'kalender', 'goedkeuring'],
  'contentkalender': ['kalender', 'goedkeuring', 'stats'],
  'automatische-leads': ['dm', 'segment', 'goedkeuring'],
  'e-mailmarketing': ['flow', 'stats', 'flow'],
  'automatische-segmentatie': ['segment', 'dm', 'stats'],
  'digitale-marketing': ['zoekwoord', 'flow', 'stats']
};

function visueel(slug, index) {
  const rijtje = TOEWIJZING[slug] || ['editor', 'kalender', 'stats'];
  const type = rijtje[index % rijtje.length];
  return (mockups[type] || mockups.editor)();
}

// Abstracte illustratie voor blogafbeeldingen, tot je eigen foto's hebt
function illustratie(seed = 0, hoogte = '58%') {
  const p = [
    [M.P, M.A], [M.B, M.P], [M.A, M.B], [M.P, M.B], [M.B, M.A], [M.A, M.P]
  ][seed % 6];
  const r = (n) => ((seed + 1) * (n + 3) * 37) % 100;
  return `<span class="ill" style="padding-bottom:${hoogte}">
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="240" fill="${p[0]}" opacity=".10"/>
      <circle cx="${60 + r(1) * 2.6}" cy="${40 + r(2) * .9}" r="${56 + r(3) * .5}" fill="${p[1]}" opacity=".18"/>
      <circle cx="${40 + r(4) * 3}" cy="${180 - r(5) * .7}" r="${34 + r(6) * .4}" fill="${p[0]}" opacity=".22"/>
      <rect x="${30 + r(7) * 2.4}" y="${50 + r(8) * .8}" width="${70 + r(2)}" height="${70 + r(4)}" rx="18" fill="${p[1]}" opacity=".14"/>
      <path d="M0 ${170 + r(5) * .4} Q 100 ${120 + r(6) * .5} 200 ${160 + r(7) * .3} T 400 ${140 + r(8) * .4} V240 H0 Z" fill="${p[0]}" opacity=".16"/>
    </svg>
  </span>`;
}

module.exports = { mockups, visueel, illustratie };
