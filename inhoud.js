// ============================================================
//  FixedFlows — inhoud laden
//  Leest de JSON-bestanden uit /content. Dat is ook waar het CMS
//  in schrijft, dus wat je in /admin aanpast komt hier binnen.
// ============================================================

const fs = require('fs');
const path = require('path');

const MAP = path.join(__dirname, 'content');

const json = (p) => normaliseer(JSON.parse(fs.readFileSync(path.join(MAP, p), 'utf8')));

// Het CMS slaat eenvoudige lijsten op als [{regel:"..."}] in plaats van
// ["..."]. Hier maken we daar weer platte lijsten van, zodat de sjablonen
// niet hoeven te weten hoe de tekst is ingevoerd.
const SLEUTELS = ['regel', 'punt', 'cel', 'plaats', 'item', 'tekstregel'];
function normaliseer(v) {
  if (Array.isArray(v)) return v.map(normaliseer);
  if (v && typeof v === 'object') {
    const k = Object.keys(v);
    if (k.length === 1 && SLEUTELS.includes(k[0]) && typeof v[k[0]] === 'string') return v[k[0]];
    if (k.length === 1 && k[0] === 'cellen' && Array.isArray(v.cellen)) return normaliseer(v.cellen);
    const uit = {};
    for (const s of k) uit[s] = normaliseer(v[s]);
    return uit;
  }
  return v;
}

function bundel(map) {
  const dir = path.join(MAP, map);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const d = json(path.join(map, f));
      if (!d.slug) d.slug = f.replace(/\.json$/, '');
      return d;
    })
    .sort((a, b) => (a.volgorde ?? 999) - (b.volgorde ?? 999) || String(b.datum || '').localeCompare(String(a.datum || '')));
}

module.exports = {
  instellingen: json('instellingen.json'),
  home: json('home.json'),
  kanalen: bundel('kanalen'),
  services: bundel('services'),
  diensten: bundel('diensten'),
  artikelen: bundel('blog')
};
