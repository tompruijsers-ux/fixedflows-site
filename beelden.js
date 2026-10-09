// ============================================================
//  FixedFlows — getekende scènes voor de voorbeeldposts
//  Geen foto's maar illustraties. Zodra je eigen beeldmateriaal
//  hebt, vervang je de aanroep door een <img>.
// ============================================================

const K = {
  lucht1: '#DCEAF7', lucht2: '#B9D6EF',
  zon: '#F5C45E', zonzacht: '#FBE3A6',
  dak: '#B5654B', dakdonker: '#96503A', dakrand: '#7E4230',
  muur: '#EDE4DA', muurdonker: '#DCCFC1',
  paneel: '#1B2A44', paneelrand: '#2E4468', paneelglans: '#3E5C86',
  gras: '#7FA36B', grasdonker: '#688B56',
  grijs: '#C9D2E0', wit: '#FFFFFF',
  marine: '#0F3568', paars: '#6B44DE'
};

/* rooster van panelen op een schuin vlak */
function panelen(x, y, kol, rij, b, h, scheef) {
  let uit = '';
  for (let r = 0; r < rij; r++) {
    for (let c = 0; c < kol; c++) {
      const px = x + c * (b + 2) + r * scheef;
      const py = y + r * (h + 2);
      uit += `<rect x="${px}" y="${py}" width="${b}" height="${h}" rx="1" fill="${K.paneel}" stroke="${K.paneelrand}" stroke-width="1"/>` +
             `<path d="M${px} ${py + h} L${px + b} ${py}" stroke="${K.paneelglans}" stroke-width="1" opacity=".55"/>`;
    }
  }
  return uit;
}

const SCENES = {

  /* dak met panelen, van de zijkant gezien */
  dak: (w, h) => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustratie van een woning met zonnepanelen op het dak">
    <defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${K.lucht2}"/><stop offset="1" stop-color="${K.lucht1}"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#lg1)"/>
    <circle cx="325" cy="62" r="30" fill="${K.zonzacht}" opacity=".65"/>
    <circle cx="325" cy="62" r="19" fill="${K.zon}"/>
    <ellipse cx="88" cy="72" rx="42" ry="17" fill="${K.wit}" opacity=".8"/>
    <ellipse cx="118" cy="66" rx="30" ry="14" fill="${K.wit}" opacity=".8"/>
    <rect y="232" width="400" height="68" fill="${K.gras}"/>
    <path d="M0 232 Q100 222 200 232 T400 230 V300 H0 Z" fill="${K.grasdonker}" opacity=".45"/>
    <rect x="96" y="150" width="208" height="86" fill="${K.muur}"/>
    <rect x="96" y="150" width="208" height="10" fill="${K.muurdonker}"/>
    <path d="M84 152 L200 82 L316 152 Z" fill="${K.dak}"/>
    <path d="M200 82 L316 152 L316 158 L200 88 Z" fill="${K.dakdonker}"/>
    <path d="M84 152 L200 82 L200 88 L84 158 Z" fill="${K.dakrand}" opacity=".55"/>
    ${panelen(112, 116, 5, 3, 22, 12, 11)}
    <rect x="252" y="92" width="16" height="30" fill="${K.muurdonker}"/>
    <rect x="249" y="88" width="22" height="7" rx="2" fill="${K.dakrand}"/>
    <rect x="128" y="178" width="30" height="34" rx="2" fill="${K.lucht2}" stroke="${K.muurdonker}" stroke-width="2"/>
    <rect x="242" y="178" width="30" height="34" rx="2" fill="${K.lucht2}" stroke="${K.muurdonker}" stroke-width="2"/>
    <rect x="186" y="186" width="28" height="50" rx="2" fill="${K.dakdonker}"/>
  </svg>`,

  /* voor en na, gesplitst beeld */
  voorna: () => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustratie: hetzelfde dak voor en na het plaatsen van panelen">
    <rect width="400" height="300" fill="${K.lucht1}"/>
    <rect y="230" width="400" height="70" fill="${K.gras}"/>
    <circle cx="352" cy="52" r="17" fill="${K.zon}"/>

    <g>
      <rect x="24" y="158" width="140" height="72" fill="${K.muur}"/>
      <path d="M14 160 L94 96 L174 160 Z" fill="${K.dak}"/>
      <path d="M94 96 L174 160 L174 165 L94 101 Z" fill="${K.dakdonker}"/>
      <rect x="46" y="182" width="24" height="28" rx="2" fill="${K.lucht2}" stroke="${K.muurdonker}" stroke-width="2"/>
      <rect x="118" y="182" width="24" height="28" rx="2" fill="${K.lucht2}" stroke="${K.muurdonker}" stroke-width="2"/>
    </g>

    <line x1="200" y1="40" x2="200" y2="270" stroke="${K.wit}" stroke-width="3" stroke-dasharray="7 6" opacity=".9"/>

    <g>
      <rect x="236" y="158" width="140" height="72" fill="${K.muur}"/>
      <path d="M226 160 L306 96 L386 160 Z" fill="${K.dak}"/>
      <path d="M306 96 L386 160 L386 165 L306 101 Z" fill="${K.dakdonker}"/>
      ${panelen(246, 124, 4, 3, 20, 11, 10)}
      <rect x="258" y="182" width="24" height="28" rx="2" fill="${K.lucht2}" stroke="${K.muurdonker}" stroke-width="2"/>
      <rect x="330" y="182" width="24" height="28" rx="2" fill="${K.lucht2}" stroke="${K.muurdonker}" stroke-width="2"/>
    </g>

    <rect x="30" y="250" width="52" height="22" rx="11" fill="${K.wit}" opacity=".92"/>
    <text x="56" y="265" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="${K.marine}">voor</text>
    <rect x="242" y="250" width="46" height="22" rx="11" fill="${K.marine}"/>
    <text x="265" y="265" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#fff">na</text>
  </svg>`,

  /* monteur op het dak */
  monteur: () => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustratie van een monteur die een paneel plaatst">
    <rect width="400" height="300" fill="${K.lucht1}"/>
    <circle cx="70" cy="56" r="24" fill="${K.zon}" opacity=".9"/>
    <ellipse cx="300" cy="60" rx="50" ry="19" fill="${K.wit}" opacity=".75"/>
    <path d="M0 300 L0 214 L400 152 L400 300 Z" fill="${K.dak}"/>
    <path d="M0 214 L400 152 L400 160 L0 222 Z" fill="${K.dakrand}"/>
    ${panelen(28, 200, 5, 3, 34, 19, -6)}
    <g>
      <rect x="252" y="150" width="34" height="19" rx="1" fill="${K.paneel}" stroke="${K.paneelrand}" stroke-width="1" transform="rotate(-9 269 159)"/>
      <path d="M256 168 L286 152" stroke="${K.paneelglans}" stroke-width="1.2" opacity=".6" transform="rotate(-9 269 159)"/>
    </g>
    <g>
      <path d="M300 178 q-6 24 -2 44" stroke="#2C3E5C" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M296 180 q-14 -6 -22 -14" stroke="#2C3E5C" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M302 178 q14 -8 20 -18" stroke="#2C3E5C" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M296 220 q-10 12 -18 16" stroke="#33425E" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M304 220 q8 14 16 18" stroke="#33425E" stroke-width="10" fill="none" stroke-linecap="round"/>
      <circle cx="300" cy="162" r="13" fill="#E8C6A8"/>
      <path d="M287 158 a13 13 0 0 1 26 0 z" fill="${K.zon}"/>
      <rect x="285" y="156" width="30" height="4" rx="2" fill="#E0AE3E"/>
    </g>
  </svg>`,

  /* omvormer aan de muur */
  omvormer: () => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustratie van een omvormer aan een muur">
    <rect width="400" height="300" fill="${K.muur}"/>
    <path d="M0 0 H400 V300 H0 Z" fill="none"/>
    <g opacity=".35" stroke="${K.muurdonker}" stroke-width="1">
      ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 44 + 22}" x2="400" y2="${i * 44 + 22}"/>`).join('')}
    </g>
    <rect x="126" y="66" width="148" height="168" rx="12" fill="#F7F8FA" stroke="${K.grijs}" stroke-width="3"/>
    <rect x="126" y="66" width="148" height="34" rx="12" fill="${K.marine}"/>
    <rect x="126" y="88" width="148" height="12" fill="${K.marine}"/>
    <rect x="146" y="120" width="108" height="52" rx="6" fill="${K.paneel}"/>
    <text x="200" y="145" text-anchor="middle" font-family="Inter,sans-serif" font-size="20" font-weight="700" fill="${K.zon}">4,2 kW</text>
    <text x="200" y="162" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#8AA0C4">nu opgewekt</text>
    <circle cx="160" cy="196" r="6" fill="#4CAF6D"/>
    <rect x="176" y="191" width="66" height="9" rx="4" fill="${K.grijs}"/>
    <rect x="176" y="206" width="44" height="9" rx="4" fill="${K.grijs}" opacity=".7"/>
    <path d="M170 234 q-6 30 -34 38" stroke="${K.paneel}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M230 234 q6 30 34 38" stroke="${K.paneel}" stroke-width="6" fill="none" stroke-linecap="round"/>
  </svg>`,

  /* thuisbatterij */
  batterij: () => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustratie van een thuisbatterij">
    <rect width="400" height="300" fill="${K.lucht1}"/>
    <rect y="236" width="400" height="64" fill="${K.muurdonker}"/>
    <rect x="140" y="72" width="120" height="164" rx="14" fill="#F7F8FA" stroke="${K.grijs}" stroke-width="3"/>
    <rect x="140" y="72" width="120" height="14" rx="14" fill="${K.paars}" opacity=".22"/>
    <rect x="160" y="106" width="80" height="104" rx="8" fill="${K.paneel}"/>
    <rect x="170" y="176" width="60" height="24" rx="4" fill="#4CAF6D"/>
    <rect x="170" y="148" width="60" height="24" rx="4" fill="#4CAF6D"/>
    <rect x="170" y="120" width="60" height="24" rx="4" fill="#4CAF6D" opacity=".3"/>
    <text x="200" y="228" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="700" fill="${K.marine}">68%</text>
    <path d="M296 120 l-22 42 h16 l-8 34 26 -46 h-16 z" fill="${K.zon}" stroke="#E0AE3E" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="86" cy="150" r="34" fill="${K.zonzacht}" opacity=".6"/>
    <circle cx="86" cy="150" r="21" fill="${K.zon}"/>
  </svg>`,

  /* laadpaal */
  laadpaal: () => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustratie van een laadpaal met auto">
    <rect width="400" height="300" fill="${K.lucht1}"/>
    <rect y="222" width="400" height="78" fill="#9AA5B4"/>
    <rect y="222" width="400" height="6" fill="#8A95A5"/>
    <g>
      <path d="M158 208 q10 -42 42 -46 h56 q28 4 40 46 z" fill="${K.marine}"/>
      <rect x="150" y="204" width="196" height="30" rx="12" fill="#14417E"/>
      <path d="M182 200 q8 -30 30 -32 h46 q22 4 30 32 z" fill="${K.lucht2}" opacity=".85"/>
      <circle cx="196" cy="236" r="17" fill="#2C3340"/><circle cx="196" cy="236" r="7" fill="#9AA5B4"/>
      <circle cx="304" cy="236" r="17" fill="#2C3340"/><circle cx="304" cy="236" r="7" fill="#9AA5B4"/>
    </g>
    <rect x="66" y="112" width="40" height="118" rx="8" fill="#F2F4F7" stroke="${K.grijs}" stroke-width="3"/>
    <rect x="76" y="126" width="20" height="26" rx="3" fill="${K.paneel}"/>
    <path d="M88 132 l-6 12 h5 l-3 10 8 -14 h-5 z" fill="${K.zon}"/>
    <circle cx="86" cy="172" r="6" fill="#4CAF6D"/>
    <path d="M106 158 q40 10 44 44" stroke="${K.paneel}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="344" cy="60" r="20" fill="${K.zon}" opacity=".9"/>
  </svg>`,

  /* opbrengstgrafiek */
  grafiek: () => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustratie van een grafiek met opbrengst per maand">
    <rect width="400" height="300" fill="#F5F7FB"/>
    <rect x="30" y="30" width="340" height="240" rx="14" fill="#fff" stroke="${K.grijs}" stroke-width="2"/>
    <text x="52" y="62" font-family="Inter,sans-serif" font-size="14" font-weight="700" fill="${K.marine}">Opbrengst per maand</text>
    <text x="52" y="80" font-family="Inter,sans-serif" font-size="11" fill="#7B8AA3">kWh &middot; 18 panelen</text>
    <g opacity=".5" stroke="${K.grijs}" stroke-width="1">
      <line x1="52" y1="110" x2="348" y2="110"/><line x1="52" y1="150" x2="348" y2="150"/>
      <line x1="52" y1="190" x2="348" y2="190"/><line x1="52" y1="230" x2="348" y2="230"/>
    </g>
    ${[26, 42, 74, 96, 118, 128, 124, 108, 82, 54, 30, 22].map((v, i) => {
      const x = 58 + i * 24.5, hgt = v, y = 230 - hgt;
      const kleur = (i >= 3 && i <= 7) ? K.zon : K.marine;
      const dek = (i >= 3 && i <= 7) ? 1 : .3;
      return `<rect x="${x}" y="${y}" width="15" height="${hgt}" rx="3" fill="${kleur}" opacity="${dek}"/>`;
    }).join('')}
    <line x1="52" y1="230" x2="348" y2="230" stroke="${K.grijs}" stroke-width="2"/>
    ${['j','f','m','a','m','j','j','a','s','o','n','d'].map((m, i) =>
      `<text x="${65.5 + i * 24.5}" y="248" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#94A2B8">${m}</text>`).join('')}
    <rect x="232" y="52" width="112" height="30" rx="8" fill="#E3F3EA"/>
    <text x="288" y="72" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#12694A">+1.400 per jaar</text>
  </svg>`,

  /* team voor de bus */
  team: () => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustratie van het installatieteam voor de bedrijfsbus">
    <rect width="400" height="300" fill="${K.lucht1}"/>
    <rect y="226" width="400" height="74" fill="#9AA5B4"/>
    <g>
      <rect x="40" y="104" width="230" height="112" rx="12" fill="${K.marine}"/>
      <path d="M270 128 h48 l30 40 v48 h-78 z" fill="#14417E"/>
      <rect x="282" y="136" width="40" height="28" rx="4" fill="${K.lucht2}" opacity=".85"/>
      <rect x="56" y="122" width="90" height="34" rx="5" fill="#fff" opacity=".92"/>
      <text x="101" y="145" text-anchor="middle" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="${K.marine}">De Vries</text>
      <circle cx="96" cy="222" r="20" fill="#2C3340"/><circle cx="96" cy="222" r="8" fill="#9AA5B4"/>
      <circle cx="298" cy="222" r="20" fill="#2C3340"/><circle cx="298" cy="222" r="8" fill="#9AA5B4"/>
    </g>
    ${[150, 196, 242].map((x, i) => `
      <g>
        <path d="M${x} 196 v34" stroke="${['#2C3E5C','#33425E','#2C3E5C'][i]}" stroke-width="20" stroke-linecap="round"/>
        <circle cx="${x}" cy="176" r="14" fill="#E8C6A8"/>
        <path d="M${x - 14} 172 a14 14 0 0 1 28 0 z" fill="${K.zon}"/>
      </g>`).join('')}
  </svg>`
};

function beeld(naam) {
  return (SCENES[naam] || SCENES.dak)();
}

module.exports = { beeld, SCENES };
