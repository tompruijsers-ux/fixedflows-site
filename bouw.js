// ============================================================
//  FixedFlows — bouwt de site naar /dist
//  Gebruik:  node bouw.js
// ============================================================
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIST = path.join(__dirname, 'dist');
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// pagina's genereren
execFileSync(process.execPath, ['build.js', DIST], { stdio: 'inherit' });

// stylesheets meenemen
for (const f of ['styles.css', 'pagina.css', 'blog.css', 'pagina-extra.css', 'fonts.css', 'app-kalender.html', 'app-account.html', 'app-login.html', 'app-home.html', 'app-sessie.js', 'app-menu.js', 'app-contentcreatie.html']) {
  fs.copyFileSync(path.join(__dirname, f), path.join(DIST, f));
}

// lettertypebestanden meenemen
fs.cpSync(path.join(__dirname, 'fonts'), path.join(DIST, 'fonts'), { recursive: true });

// adminscherm en media meenemen
fs.cpSync(path.join(__dirname, 'admin'), path.join(DIST, 'admin'), { recursive: true });
if (fs.existsSync(path.join(__dirname, 'media'))) {
  fs.cpSync(path.join(__dirname, 'media'), path.join(DIST, 'media'), { recursive: true });
}

// de app als één bestand
execFileSync(process.execPath, ['bouw-app.js', DIST], { stdio: 'inherit' });

// sitemap
const paginas = fs.readdirSync(DIST).filter(f => f.endsWith('.html')).sort();
const domein = JSON.parse(fs.readFileSync(path.join(__dirname, 'content/instellingen.json'), 'utf8')).domein;
const vandaag = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paginas.map(p => `  <url><loc>https://${domein}/${p === 'index.html' ? '' : p}</loc><lastmod>${vandaag}</lastmod></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(DIST, 'robots.txt'),
`User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://${domein}/sitemap.xml
`);

console.log(`Site staat klaar in /dist — ${paginas.length} pagina's, sitemap en robots.txt.`);
