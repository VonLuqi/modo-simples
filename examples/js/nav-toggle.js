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
    .matchMedia('(min-width: 1101px)')
    .addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });

  list.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a')) setOpen(false);
  });
})();
