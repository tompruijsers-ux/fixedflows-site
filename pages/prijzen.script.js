(function () {
  var maand = document.getElementById('btn-maand');
  var jaar  = document.getElementById('btn-jaar');
  var bedragen = document.querySelectorAll('.amt[data-m]');
  var regels   = document.querySelectorAll('[data-billed]');

  function toon(perJaar) {
    maand.setAttribute('aria-pressed', String(!perJaar));
    jaar.setAttribute('aria-pressed', String(perJaar));

    bedragen.forEach(function (el) {
      el.textContent = '€' + el.dataset[perJaar ? 'j' : 'm'];
    });

    regels.forEach(function (el, i) {
      var prijs = bedragen[i];
      if (!prijs) return;
      if (perJaar) {
        el.textContent = 'Jaarlijks gefactureerd · €' + (Number(prijs.dataset.j) * 12) + ' per jaar';
      } else {
        el.textContent = 'Maandelijks gefactureerd';
      }
    });
  }

  maand.addEventListener('click', function () { toon(false); });
  jaar.addEventListener('click', function () { toon(true); });
})();