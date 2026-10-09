/* ============================================================
   FixedFlows — het menu aan de linkerkant
   ------------------------------------------------------------
   Eén bestand dat de balk op elk appscherm neerzet. Wil je een
   item toevoegen, dan doe je dat hieronder in ITEMS.
   Gebruik: laad dit bestand met een script-tag en zet daarop
   data-actief="kalender" om aan te geven welk item actief is.
   ============================================================ */

(function () {
  'use strict';

  var IC = {
    maken:      '<path d="M12 5v14M5 12h14" stroke-linecap="round"/>',
    home:       '<path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 19v-8.5z" stroke-linejoin="round"/><path d="M9.5 20.5V14h5v6.5"/>',
    kalender:   '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke-linecap="round"/>',
    schrijven:  '<path d="M16.5 3.5a2.12 2.12 0 013 3L7.5 18.5l-4 1 1-4L16.5 3.5z" stroke-linejoin="round"/>',
    goedkeuren: '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 12.2l2.6 2.6L16 9.6" stroke-linecap="round" stroke-linejoin="round"/>',
    gesprekken: '<path d="M20.5 12a8 8 0 01-11.4 7.2L3.5 20.5l1.3-5.6A8 8 0 1120.5 12z" stroke-linejoin="round"/>',
    flows:      '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4.5 8.5l6.6 4.4a1.6 1.6 0 001.8 0l6.6-4.4" stroke-linecap="round"/>',
    segmenten:  '<circle cx="9" cy="9" r="4.2"/><circle cx="15.5" cy="15.5" r="4.2"/>',
    rapport:    '<path d="M4 18V11M9.3 18V6M14.6 18v-4M20 18V8.5" stroke-linecap="round"/>',
    bel:        '<path d="M18 9a6 6 0 10-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9z" stroke-linejoin="round"/><path d="M10.3 19.5a2 2 0 003.4 0" stroke-linecap="round"/>',
    hulp:       '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 014.8.9c0 1.7-2.4 2.2-2.4 3.7" stroke-linecap="round"/><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none"/>',
    tandwiel:   '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" stroke-linejoin="round"/>'
  };

  var ITEMS = [
    { id: 'maken',      naam: 'Maken',        ico: 'maken',      naar: 'app-contentcreatie.html', knop: true },
    { id: 'home',       naam: 'Home',         ico: 'home',       naar: 'app-home.html' },
    { id: 'kalender',   naam: 'Kalender',     ico: 'kalender',   naar: 'app-kalender.html' },
    { id: 'schrijven',  naam: 'Schrijven',    ico: 'schrijven',  naar: 'app-contentcreatie.html' },
    { id: 'goedkeuren', naam: 'Goedkeuren',   ico: 'goedkeuren', naar: 'app-kalender.html?wacht=1', teller: true },
    { id: 'gesprekken', naam: 'Gesprekken',   ico: 'gesprekken', straks: true },
    { id: 'flows',      naam: 'E-mailflows',  ico: 'flows',      straks: true },
    { id: 'segmenten',  naam: 'Segmenten',    ico: 'segmenten',  straks: true },
    { id: 'rapport',    naam: 'Rapportage',   ico: 'rapport',    straks: true }
  ];

  var ONDER = [
    { id: 'meldingen', naam: 'Meldingen',   ico: 'bel',      straks: true },
    { id: 'hulp',      naam: 'Hulp',        ico: 'hulp',     straks: true },
    { id: 'instellingen', naam: 'Instellingen', ico: 'tandwiel', straks: true }
  ];

  var STIJL = [
    '.rail{position:fixed;left:0;top:0;bottom:0;width:66px;background:#fff;border-right:1px solid var(--line);',
    '  display:flex;flex-direction:column;align-items:center;padding:14px 0 12px;z-index:100}',
    '.rail-merk{width:34px;height:34px;flex:none;margin-bottom:14px}',
    '.rail-scroll{flex:1;width:100%;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;',
    '  align-items:center;gap:3px;padding:2px 0;scrollbar-width:thin}',
    '.rail-scroll::-webkit-scrollbar{width:4px}',
    '.rail-scroll::-webkit-scrollbar-thumb{background:var(--line);border-radius:2px}',
    '.rail-scroll::-webkit-scrollbar-track{background:transparent}',
    '.rail a,.rail button{position:relative;width:52px;padding:8px 0 6px;border:none;background:none;cursor:pointer;',
    '  display:flex;flex-direction:column;align-items:center;gap:4px;border-radius:11px;color:var(--ink-3);',
    '  font-family:inherit;font-size:9.5px;font-weight:600;letter-spacing:.01em;text-decoration:none;',
    '  transition:background .13s ease,color .13s ease}',
    '.rail a:hover,.rail button:hover{background:var(--bg);color:var(--ink)}',
    '.rail a.on{background:var(--purple-soft);color:var(--purple)}',
    '.rail a.on::before{content:"";position:absolute;left:-7px;top:50%;transform:translateY(-50%);',
    '  width:3px;height:22px;border-radius:0 3px 3px 0;background:var(--purple)}',
    '.rail svg{width:21px;height:21px;stroke:currentColor;stroke-width:1.7;fill:none}',
    '.rail .maakknop{background:var(--marine);color:#fff;border-radius:13px;padding:10px 0 8px;margin-bottom:8px}',
    '.rail .maakknop:hover{background:var(--marine-deep);color:#fff}',
    '.rail .straks{opacity:.42}',
    '.rail .straks:hover{background:none;color:var(--ink-3);cursor:default}',
    '.rail-onder{width:100%;display:flex;flex-direction:column;align-items:center;gap:2px;',
    '  border-top:1px solid var(--line-soft);padding-top:10px;margin-top:8px}',
    '.rail-bol{width:34px;height:34px;border-radius:50%;background:var(--marine);color:#fff;display:grid;',
    '  place-items:center;font-size:12.5px;font-weight:700;margin-top:9px;cursor:pointer;border:none;font-family:inherit}',
    '.rail-tel{position:absolute;top:3px;right:6px;min-width:16px;height:16px;border-radius:8px;background:var(--purple);',
    '  color:#fff;font-size:10px;font-weight:700;display:grid;place-items:center;padding:0 4px}',
    '.rail-uit{position:fixed;left:70px;bottom:14px;background:#fff;border:1px solid var(--line);border-radius:13px;',
    '  padding:8px;width:236px;box-shadow:0 20px 44px -20px rgba(10,36,71,.45);z-index:110;',
    '  opacity:0;visibility:hidden;transform:translateX(-6px);transition:all .16s ease}',
    '.rail-uit.open{opacity:1;visibility:visible;transform:none}',
    '.rail-uit .kop{padding:10px 12px 12px;border-bottom:1px solid var(--line-soft);margin-bottom:6px}',
    '.rail-uit .kop b{display:block;font-size:14.5px;font-weight:600}',
    '.rail-uit .kop span{font-size:12.5px;color:var(--ink-3);word-break:break-all}',
    '.rail-uit a,.rail-uit button{display:block;width:100%;text-align:left;border:none;background:none;',
    '  font-family:inherit;font-size:14px;color:var(--ink-2);padding:9px 12px;border-radius:9px;cursor:pointer;text-decoration:none}',
    '.rail-uit a:hover,.rail-uit button:hover{background:var(--bg);color:var(--ink)}',
    '.rail-uit .uit{color:#B0342A;font-weight:600;border-top:1px solid var(--line-soft);margin-top:6px;padding-top:11px}',
    '.met-rail{padding-left:66px}',
    '@media(max-width:760px){.rail{display:none}.met-rail{padding-left:0}}'
  ].join('\n');

  function svg(naam) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + IC[naam] + '</svg>';
  }

  var stijlGezet = false;

  function bouw(actiefMee) {
    var S = window.Sessie;
    var sessie = S && S.huidige();

    // altijd eerst opruimen, zodat opnieuw tekenen niets dubbel neerzet
    var oud = document.querySelector('.rail');
    if (oud) oud.remove();
    var oudUit = document.getElementById('rail-uit');
    if (oudUit) oudUit.remove();
    if (!sessie) { document.body.classList.remove('met-rail'); return; }

    var actief = actiefMee;
    if (actief === undefined) {
      var bron = document.querySelector('script[data-actief]');
      actief = bron ? bron.dataset.actief : '';
    }

    // hoeveel wacht er op goedkeuring
    var kal = S.leesData('kalender') || {};
    var wacht = (kal.posts || []).filter(function (p) { return p.status === 'review'; }).length;

    if (!stijlGezet) {
      var css = document.createElement('style');
      css.textContent = STIJL;
      document.head.appendChild(css);
      stijlGezet = true;
    }

    function knopHtml(i) {
      var tel = (i.teller && wacht) ? '<span class="rail-tel">' + wacht + '</span>' : '';
      if (i.straks) {
        return '<button type="button" class="straks" data-straks="' + i.naam + '">' +
               svg(i.ico) + '<span>' + i.naam + '</span></button>';
      }
      if (i.knop) {
        return '<a href="' + i.naar + '" class="maakknop">' + svg(i.ico) + '<span>' + i.naam + '</span></a>';
      }
      return '<a href="' + i.naar + '"' + (i.id === actief ? ' class="on"' : '') + '>' +
             tel + svg(i.ico) + '<span>' + i.naam + '</span></a>';
    }

    var rail = document.createElement('nav');
    rail.className = 'rail';
    rail.setAttribute('aria-label', 'Hoofdmenu');
    rail.innerHTML =
      '<a href="app-home.html" class="rail-merk" aria-label="Naar je werkruimte">' +
        '<svg viewBox="0 0 27 27" fill="none" style="width:34px;height:34px;stroke:none">' +
          '<rect width="27" height="27" rx="7.5" fill="#0F3568"/>' +
          '<path d="M6 17c2.7 0 2.7-7.4 5.4-7.4S14.1 17 16.8 17s2.7-4.2 3.7-4.2" stroke="#8A6BE8" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
        '</svg>' +
      '</a>' +
      '<div class="rail-scroll">' + ITEMS.map(knopHtml).join('') + '</div>' +
      '<div class="rail-onder">' + ONDER.map(knopHtml).join('') +
        '<button type="button" class="rail-bol" id="rail-bol" aria-label="Account">' + S.initialen() + '</button>' +
      '</div>';

    var uit = document.createElement('div');
    uit.className = 'rail-uit';
    uit.id = 'rail-uit';
    uit.innerHTML =
      '<div class="kop"><b>' + (sessie.bedrijf || 'Werkruimte') + '</b><span>' + sessie.email + '</span></div>' +
      '<a href="app-home.html">Je werkruimte</a>' +
      '<a href="prijzen.html">Abonnement</a>' +
      '<a href="index.html">Naar de website</a>' +
      '<button type="button" class="uit" id="rail-uitloggen">Uitloggen</button>';

    document.body.appendChild(rail);
    document.body.appendChild(uit);
    document.body.classList.add('met-rail');

    var bol = document.getElementById('rail-bol');
    bol.addEventListener('click', function (e) {
      e.stopPropagation();
      uit.classList.toggle('open');
    });
    document.addEventListener('click', function () { uit.classList.remove('open'); });
    uit.addEventListener('click', function (e) { e.stopPropagation(); });
    document.getElementById('rail-uitloggen').addEventListener('click', function () { S.uitloggen(); });

    rail.addEventListener('click', function (e) {
      var b = e.target.closest('[data-straks]');
      if (b) {
        var m = document.createElement('div');
        m.textContent = b.dataset.straks + ' komt in een volgende versie.';
        m.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#0A0E18;' +
          'color:#fff;font-size:14.5px;padding:12px 20px;border-radius:999px;z-index:300';
        document.body.appendChild(m);
        setTimeout(function () { m.remove(); }, 2200);
      }
    });
  }

  // Beschikbaar voor de gebundelde versie, die per pagina opnieuw tekent.
  window.FixedFlowsMenu = { teken: bouw };

  // Losse pagina's tekenen zichzelf zodra ze geladen zijn.
  if (!window.FixedFlowsBundel) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { bouw(); });
    } else {
      bouw();
    }
  }
})();
