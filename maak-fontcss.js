// Bouwt een <style> met Inter als ingebedde data, voor de losse
// voorbeeldbestanden die geen /fonts-map naast zich hebben.
const fs = require('fs');
const path = require('path');

function inlineInter() {
  const map = path.join(__dirname, 'fonts');
  const gewichten = [400, 500, 600, 700];
  return gewichten.map(w => {
    const bestand = path.join(map, `inter-latin-${w}-normal.woff2`);
    const data = fs.readFileSync(bestand).toString('base64');
    return `@font-face{font-family:'Inter';font-style:normal;font-weight:${w};font-display:swap;` +
           `src:url(data:font/woff2;base64,${data}) format('woff2')}`;
  }).join('\n');
}

module.exports = { inlineInter };
