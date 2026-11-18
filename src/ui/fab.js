/**
 * ui/fab.js
 *
 * FAB laranja circular — abre/fecha o painel.
 * Ícone sliders (fechado) / X (aberto) + tip “Acessibilidade & Modo Simples”.
 */

import persistence from '../core/persistence.js';
import { STRINGS_T as S } from './strings.js';

const TIP_SEEN_KEY = 'fabTipSeen';

/**
 * @param {{ onClick: () => void, onHide?: () => void }} opts
 * @returns {{
 *   element: HTMLElement,
 *   button: HTMLButtonElement,
 *   sync: (s: { panelOpen: boolean }) => void,
 *   setSide: (side: 'left'|'right') => void,
 *   setHidden: (hidden: boolean) => void,
 * }}
 */
export function createFab({ onClick, onHide }) {
  const wrap = document.createElement('div');
  wrap.className = 'ms-fab-wrap';
  wrap.setAttribute('data-ms-fab-wrap', '');

  const tip = document.createElement('span');
  tip.className = 'ms-fab-tip';
  tip.id = 'ms-fab-tip';
  tip.textContent = S.fabTip;
  tip.setAttribute('aria-hidden', 'true');

  // UX-08: a dica aparece só na primeira visita; some sozinha após 6s (animação CSS)
  // ou ao abrir o painel, e não volta mais.
  function dismissTip() {
    tip.hidden = true;
    persistence.save(TIP_SEEN_KEY, true);
  }
  tip.hidden = persistence.load(TIP_SEEN_KEY, false) === true;
  // LOW-3: marca como vista já ao mostrar (sair da página antes dos 6s não repete a dica)
  if (!tip.hidden) persistence.save(TIP_SEEN_KEY, true);
  tip.addEventListener('animationend', (e) => {
    if (e.animationName === 'ms-fab-tip-out') dismissTip();
  });

  const btn = document.createElement('button');
  btn.id = 'ms-fab';
  btn.type = 'button';
  btn.className = 'ms-fab';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'ms-a11y-panel');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-label', S.fabOpenLabel);

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

  // X de esconder: irmão do botão do FAB (botão dentro de botão não é válido)
  const hideBtn = document.createElement('button');
  hideBtn.type = 'button';
  hideBtn.className = 'ms-fab-hide';
  hideBtn.setAttribute('aria-label', S.fabHideLabel);
  hideBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" focusable="false"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
  hideBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onHide?.();
  });

  const box = document.createElement('div');
  box.className = 'ms-fab-box';
  box.appendChild(btn);
  box.appendChild(hideBtn);

  wrap.appendChild(tip);
  wrap.appendChild(box);

  /**
   * @param {{ panelOpen: boolean }} s
   */
  function sync({ panelOpen }) {
    btn.setAttribute('aria-expanded', String(panelOpen));
    btn.setAttribute(
      'aria-label',
      panelOpen ? S.fabCloseLabel : S.fabOpenLabel,
    );
    btn.classList.toggle('ms-fab--open', panelOpen);
    wrap.classList.toggle('ms-fab-wrap--open', panelOpen);
    if (panelOpen) dismissTip();

    const openIcon = btn.querySelector('.ms-fab-icon--open');
    const closeIcon = btn.querySelector('.ms-fab-icon--close');
    if (openIcon) openIcon.toggleAttribute('hidden', panelOpen);
    if (closeIcon) closeIcon.toggleAttribute('hidden', !panelOpen);
  }

  sync({ panelOpen: false });

  /** @param {'left'|'right'} side */
  function setSide(side) {
    wrap.setAttribute('data-ms-side', side);
  }

  /** Esconde/mostra o FAB inteiro (só nesta página; nada é persistido). */
  function setHidden(hidden) {
    wrap.hidden = hidden;
  }

  return {
    element: wrap,
    button: btn,
    hideButton: hideBtn,
    sync,
    setSide,
    setHidden,
  };
}
