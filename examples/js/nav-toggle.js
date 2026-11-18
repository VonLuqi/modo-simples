/**
 * Botão "Menu" do nav principal do protótipo (UX-25).
 * Em telas largas o botão fica oculto por CSS e o nav é uma linha só; em telas estreitas
 * o botão abre/fecha a lista (aria-expanded + aria-controls). Esc fecha e devolve o foco
 * ao botão; clicar fora ou escolher um link também fecha.
 */
(function () {
  var nav = document.querySelector('.main-nav');
  if (!nav) return;
  var btn = nav.querySelector('.nav-toggle');
  var list = document.getElementById(btn && btn.getAttribute('aria-controls'));
  if (!btn || !list) return;

  function setOpen(open) {
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('main-nav--open', open);
  }

  btn.addEventListener('click', function () {
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      btn.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) setOpen(false);
  });

  // Tab para fora do nav (foco vai para a página) fecha o menu.
  nav.addEventListener('focusout', function (e) {
    if (e.relatedTarget && !nav.contains(e.relatedTarget)) setOpen(false);
  });

  // Ao voltar para a faixa larga (nav em linha), zera o estado do botão.
  window
    .matchMedia('(min-width: 1181px)')
    .addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });

  // Recolhe também quando a lista não cabe numa linha (fonte de fallback mais larga, zoom de
  // texto, fonte para dislexia): mede com o nav aberto em linha e liga html.nav-collapsed.
  var root = document.documentElement;
  function fit() {
    root.classList.remove('nav-collapsed');
    var links = list.querySelectorAll('li a');
    if (!links.length || !list.offsetParent) return;
    var first = links[0].getBoundingClientRect().top;
    for (var i = 1; i < links.length; i++) {
      if (links[i].getBoundingClientRect().top - first > 8) {
        root.classList.add('nav-collapsed');
        return;
      }
    }
  }
  fit();
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  new MutationObserver(function (records) {
    // só mudanças de classe de fora (texto, fonte, tema); o próprio nav-collapsed não conta
    for (var i = 0; i < records.length; i++) {
      var had = (records[i].oldValue || '')
        .split(/\s+/)
        .filter(function (c) {
          return c !== 'nav-collapsed';
        })
        .join(' ');
      var now = root.className
        .split(/\s+/)
        .filter(function (c) {
          return c !== 'nav-collapsed';
        })
        .join(' ');
      if (had !== now) return fit();
    }
  }).observe(root, {
    attributes: true,
    attributeFilter: ['class'],
    attributeOldValue: true,
  });

  list.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a')) setOpen(false);
  });
})();
