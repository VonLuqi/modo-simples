/**
 * Idioma do demo (T229): só o que é da casca do demo e não da lib, hoje o link "Pular para o
 * conteúdo". O resto da página fica em português (conteúdo do site). O idioma vem de
 * 'ms:localechange' (evento da lib); se o evento passou antes, lê o lang do #ms-container.
 */
(function () {
  var SKIP = {
    pt: 'Pular para o conteúdo',
    en: 'Skip to content',
    es: 'Saltar al contenido',
  };

  function apply(loc) {
    var a = document.querySelector('a.skip-link');
    if (a) a.textContent = SKIP[loc] || SKIP.pt;
  }

  function current() {
    var host = document.getElementById('ms-container');
    var p = ((host && host.lang) || '').toLowerCase().split(/[-_]/)[0];
    return SKIP[p] ? p : 'pt';
  }

  document.addEventListener('ms:localechange', function (e) {
    apply((e.detail && e.detail.locale) || current());
  });
  apply(current());
})();
