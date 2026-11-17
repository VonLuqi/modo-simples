/**
 * ui/fab.js
 *
 * FAB laranja circular — abre/fecha o painel.
 * Ícone sliders (fechado) / X (aberto) + tip “Acessibilidade & Modo Simples”.
 */

/**
 * @param {{ onClick: () => void }} opts
 * @returns {{
 *   element: HTMLElement,
 *   button: HTMLButtonElement,
 *   sync: (s: { panelOpen: boolean }) => void,
 * }}
 */
export function createFab({ onClick }) {
  const wrap = document.createElement('div');
  wrap.className = 'ms-fab-wrap';
  wrap.setAttribute('data-ms-fab-wrap', '');

  const tip = document.createElement('span');
  tip.className = 'ms-fab-tip';
  tip.id = 'ms-fab-tip';
  tip.textContent = 'Acessibilidade & Modo Simples';

  const btn = document.createElement('button');
  btn.id = 'ms-fab';
  btn.type = 'button';
  btn.className = 'ms-fab';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'ms-a11y-panel');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-describedby', 'ms-fab-tip');
  btn.setAttribute('aria-label', 'Abrir painel de acessibilidade');

  const iconOpen = `
    <svg class="ms-fab-icon ms-fab-icon--open" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="8" cy="6" r="2.2" fill="currentColor" stroke="none"/>
      <circle cx="14" cy="12" r="2.2" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="18" r="2.2" fill="currentColor" stroke="none"/>
    </svg>`;

  const iconClose = `
    <svg class="ms-fab-icon ms-fab-icon--close" viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true" focusable="false" hidden>
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>`;

  btn.innerHTML = iconOpen + iconClose;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  wrap.appendChild(tip);
  wrap.appendChild(btn);

  /**
   * @param {{ panelOpen: boolean }} s
   */
  function sync({ panelOpen }) {
    btn.setAttribute('aria-expanded', String(panelOpen));
    btn.setAttribute(
      'aria-label',
      panelOpen
        ? 'Fechar painel de acessibilidade'
        : 'Abrir painel de acessibilidade',
    );
    btn.classList.toggle('ms-fab--open', panelOpen);
    wrap.classList.toggle('ms-fab-wrap--open', panelOpen);
    tip.hidden = panelOpen;

    const openIcon = btn.querySelector('.ms-fab-icon--open');
    const closeIcon = btn.querySelector('.ms-fab-icon--close');
    if (openIcon) openIcon.toggleAttribute('hidden', panelOpen);
    if (closeIcon) closeIcon.toggleAttribute('hidden', !panelOpen);
  }

  sync({ panelOpen: false });

  return { element: wrap, button: btn, sync };
}
