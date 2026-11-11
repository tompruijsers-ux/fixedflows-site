// ============================================================
//  FixedFlows — gedeelde onderdelen (navigatie, footer, pictogrammen)
//  Wordt gebruikt door build.js. Pas hier aan en bouw opnieuw.
// ============================================================

const { kanalen, services, diensten } = require('./inhoud.js');

// De app draait op hetzelfde domein als deze marketingsite (zie
// stratella-api/src/server.js: ingelogd -> index.html, uitgelogd ->
// marketing-home.html, allebei achter www.fixedflows.net). Daarom zijn dit
// gewone relatieve links, geen apart app-domein -- leeg laten dus, tenzij
// je ooit weer naar een los app-domein splitst.
const APP_URL = process.env.STRATELLA_APP_URL || '';

const LOGO = `<svg class="logo-mark" viewBox="0 0 27 27" fill="none" aria-hidden="true">
        <rect width="27" height="27" rx="7.5" fill="#2563EB"/>
        <path d="M6 17c2.7 0 2.7-7.4 5.4-7.4S14.1 17 16.8 17s2.7-4.2 3.7-4.2" stroke="#7C3AED" stroke-width="2.2" stroke-linecap="round"/>
      </svg>`;

const ICONEN = {
  facebook: '<path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z"/>',
  instagram: '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.39C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.39 2.12.66.67 1.33 1.09 2.12 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.39.67-.66 1.09-1.33 1.39-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.39-2.12C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z"/><path d="M12 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8z"/><circle cx="18.41" cy="5.59" r="1.44"/>',
  linkedin: '<path d="M4.98 3.5a2.5 2.5 0 11-.02 5.01A2.5 2.5 0 014.98 3.5zM2.4 21.5h5.16V9.75H2.4V21.5zM9.9 9.75h4.95v1.6h.07c.69-1.24 2.37-2.55 4.88-2.55 5.22 0 6.18 3.3 6.18 7.6v5.1h-5.15v-4.52c0-1.08-.02-2.47-1.55-2.47-1.55 0-1.79 1.17-1.79 2.39v4.6H9.9V9.75z"/>',
  tiktok: '<path d="M16.6 5.82A4.28 4.28 0 0115.54 3h-3.09v12.4a2.59 2.59 0 01-2.59 2.5 2.59 2.59 0 01-2.59-2.59 2.59 2.59 0 013.16-2.53v-3.1a5.66 5.66 0 00-.57-.03A5.68 5.68 0 004.2 15.4a5.68 5.68 0 005.66 5.66 5.68 5.68 0 005.66-5.66V9.4a7.35 7.35 0 004.28 1.37V7.7a4.28 4.28 0 01-3.2-1.88z"/>',
  x: '<path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64z"/>',
  pinterest: '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.17-.1-.95-.2-2.4.04-3.44.22-.94 1.4-5.96 1.4-5.96s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-1 4-.28 1.19.6 2.16 1.77 2.16 2.13 0 3.76-2.24 3.76-5.48 0-2.86-2.06-4.87-5-4.87-3.41 0-5.41 2.55-5.41 5.19 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34-.09.38-.29 1.19-.33 1.35-.05.22-.17.27-.4.16-1.5-.7-2.43-2.89-2.43-4.65 0-3.78 2.75-7.26 7.92-7.26 4.16 0 7.39 2.96 7.39 6.92 0 4.13-2.6 7.46-6.22 7.46-1.21 0-2.35-.63-2.74-1.38l-.75 2.85c-.27 1.04-1 2.35-1.49 3.15 1.12.35 2.31.53 3.55.53 6.63 0 12-5.37 12-12S18.63 0 12 0z"/>',
  threads: '<path d="M17.2 11.13c-.1-.05-.2-.1-.3-.14-.18-3.26-1.96-5.13-4.95-5.15h-.04c-1.79 0-3.28.76-4.2 2.16l1.65 1.13c.68-1.04 1.76-1.26 2.55-1.26h.03c.98 0 1.72.29 2.2.85.35.41.58.98.7 1.7a12.6 12.6 0 00-2.83-.14c-2.85.17-4.68 1.83-4.56 4.15.06 1.17.65 2.18 1.65 2.84.85.55 1.94.82 3.07.76 1.5-.08 2.67-.65 3.49-1.69.62-.79.02-1.66.83-3.06.72.44 1.25 1.01 1.55 1.7.5 1.17.53 3.1-1.04 4.67-1.38 1.38-3.03 1.97-5.53 1.99-2.77-.02-4.87-.91-6.24-2.64C4.94 17.4 4.28 15.14 4.25 12c.03-3.14.69-5.4 1.98-6.99C7.6 3.28 9.7 2.39 12.47 2.37c2.79.02 4.93.91 6.35 2.65.7.85 1.23 1.93 1.58 3.19l1.94-.52c-.42-1.55-1.09-2.89-2-4-1.82-2.22-4.48-3.36-7.87-3.38h-.01C9.06.32 6.44 1.46 4.66 3.69 3.07 5.67 2.26 8.43 2.23 11.99v.02c.03 3.56.84 6.32 2.43 8.3 1.78 2.23 4.4 3.37 7.79 3.39h.01c3.02-.02 5.14-.81 6.9-2.56 2.29-2.29 2.22-5.16 1.47-6.92-.55-1.28-1.6-2.32-3.03-3.09zm-5.1 5.28c-1.25.07-2.55-.49-2.61-1.66-.05-.87.61-1.83 2.68-1.95.24-.01.47-.02.7-.02.75 0 1.46.07 2.1.21-.24 2.98-1.64 3.36-2.87 3.42z"/>',
  youtube: '<path d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>',

  // services
  pen: '<path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  kalender: '<rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  magneet: '<path d="M4 4h5v8a3 3 0 006 0V4h5v8a8 8 0 01-16 0V4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 9h5M15 9h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 8l7.1 4.8a1.6 1.6 0 001.8 0L20 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  segment: '<circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="16" cy="16" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11.5 11.5l1 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  groei: '<path d="M3 17l5.5-5.5 3.5 3.5L21 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 6h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  megafoon: '<path d="M3 10v4a1 1 0 001 1h2l6 4V5L6 9H4a1 1 0 00-1 1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M18 8a4 4 0 010 8M21 5.5a8 8 0 010 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  zoeken: '<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-4.8-4.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  doel: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  link: '<path d="M9.5 14.5l5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M11 6.5l1-1a3.8 3.8 0 015.5 5.5l-1 1M13 17.5l-1 1a3.8 3.8 0 01-5.5-5.5l1-1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
};

const svg = (naam, kl = '') => `<svg class="${kl}" viewBox="0 0 24 24" fill="${ICONEN[naam].includes('stroke="currentColor"') ? 'none' : 'currentColor'}" aria-hidden="true">${ICONEN[naam]}</svg>`;

// ---------- navigatie met uitklapmenu's ----------
function nav(actief) {
  const serviceItems = services.map(s => `<a href="service-${s.slug}.html">
            <span class="dd-ico">${svg(s.icoon)}</span>
            <span class="dd-txt"><b>${s.naam}</b><em>${s.kort}</em></span>
          </a>`).join('\n          ');

  const kanaalItems = kanalen.map(k => `<a href="kanaal-${k.slug}.html">
            <span class="dd-ico" style="color:${k.kleur}">${svg(k.slug)}</span>
            <span class="dd-txt"><b>${k.naam}</b></span>
          </a>`).join('\n          ');

  const dienstItems = diensten.map(d => `<a href="dienst-${d.slug}.html">
            <span class="dd-ico">${svg(d.icoon)}</span>
            <span class="dd-txt"><b>${d.naam}</b><em>${d.kort}</em></span>
          </a>`).join('\n          ');

  return `<header class="nav">
  <div class="wrap nav-in">
    <a href="index.html" class="logo">${LOGO} FixedFlows</a>

    <nav class="nav-links" aria-label="Hoofdmenu">
      <div class="has-dd">
        <a href="services.html"${actief === 'services' ? ' class="on"' : ''} aria-haspopup="true">Services <span class="caret" aria-hidden="true">▾</span></a>
        <div class="dd dd-wide">
          ${serviceItems}
          <a class="dd-all" href="services.html">Alle services bekijken →</a>
        </div>
      </div>

      <div class="has-dd">
        <a href="kanalen.html"${actief === 'kanalen' ? ' class="on"' : ''} aria-haspopup="true">Kanalen <span class="caret" aria-hidden="true">▾</span></a>
        <div class="dd dd-kanalen">
          ${kanaalItems}
          <a class="dd-all" href="kanalen.html">Alle kanalen bekijken →</a>
        </div>
      </div>

      <div class="has-dd">
        <a href="diensten.html"${actief === 'diensten' ? ' class="on"' : ''} aria-haspopup="true">Diensten <span class="caret" aria-hidden="true">▾</span></a>
        <div class="dd dd-wide">
          ${dienstItems}
          <a class="dd-all" href="diensten.html">Alle diensten bekijken →</a>
        </div>
      </div>

      <a href="blog.html"${actief === 'blog' ? ' class="on"' : ''}>Blog</a>
      <a href="prijzen.html"${actief === 'prijzen' ? ' class="on"' : ''}>Prijzen</a>
    </nav>

    <div class="nav-right">
      <a href="${APP_URL}/#/inloggen" class="link-quiet">Inloggen</a>
      <a href="${APP_URL}/#/inloggen?modus=reg" class="btn btn-primary btn-sm">Start gratis</a>
    </div>

    <button type="button" class="nav-burger" aria-label="Menu" aria-expanded="false"
      onclick="const n=this.closest('.nav');const open=!n.classList.contains('menu-open');n.classList.toggle('menu-open',open);this.setAttribute('aria-expanded',open)">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path class="bl b1" d="M4 7h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path class="bl b2" d="M4 12h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path class="bl b3" d="M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</header>`;
}

// ---------- footer met kolommen ----------
function footer() {
  const svcLinks = services.map(x => `<a href="service-${x.slug}.html">${x.naam}</a>`).join('\n        ');
  const kanLinks = kanalen.map(x => `<a href="kanaal-${x.slug}.html">${x.naam}</a>`).join('\n        ');
  const dienstLinks = diensten.map(x => `<a href="dienst-${x.slug}.html">${x.naam}</a>`).join('\n        ');

  return `<footer>
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-merk">
        <a href="index.html" class="logo">${LOGO} FixedFlows</a>
        <p>Je hele klantreis automatisch: van het schrijven van een post tot de opvolging van een klant. Gebouwd en gehost in de EU.</p>
        <div class="foot-cta">
          <a href="${APP_URL}/#/inloggen?modus=reg" class="btn btn-primary btn-sm">Probeer 14 dagen gratis</a>
        </div>
        <div class="foot-social" aria-label="Volg FixedFlows">
          <a href="#" aria-label="LinkedIn">${svg('linkedin')}</a>
          <a href="#" aria-label="Instagram">${svg('instagram')}</a>
          <a href="#" aria-label="YouTube">${svg('youtube')}</a>
        </div>
      </div>

      <div class="foot-kol">
        <h4>Services</h4>
        ${svcLinks}
      </div>

      <div class="foot-kol">
        <h4>Kanalen</h4>
        ${kanLinks}
      </div>

      <div class="foot-kol">
        <h4>Diensten</h4>
        ${dienstLinks}
      </div>

      <div class="foot-kol">
        <h4>Bedrijf</h4>
        <a href="blog.html">Blog</a>
        <a href="prijzen.html">Prijzen</a>
        <a href="over-ons.html">Over FixedFlows</a>
        <a href="contact.html">Contact</a>
        <a href="helpcentrum.html">Helpcentrum</a>
        <a href="status.html">Status</a>
      </div>

      <div class="foot-kol">
        <h4>Juridisch</h4>
        <a href="privacy.html">Privacyverklaring</a>
        <a href="voorwaarden.html">Algemene voorwaarden</a>
        <a href="verwerkersovereenkomst.html">Verwerkersovereenkomst</a>
        <a href="cookies.html">Cookiebeleid</a>
        <a href="privacy.html#k22">Beveiliging</a>
      </div>
    </div>

    <div class="foot-onder">
      <span>© 2026 FixedFlows · KvK 00000000 · Data op EU-servers</span>
      <span class="foot-mini"><a href="cookies.html">Cookievoorkeuren</a><a href="sitemap.xml">Sitemap</a></span>
    </div>
  </div>
</footer>`;
}

module.exports = { nav, footer, ICONEN, svg, LOGO, APP_URL };
