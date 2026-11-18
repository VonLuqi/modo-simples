/**
 * features/shortcutsCard.js
 *
 * F7e "Atalhos visíveis": com `showShortcuts` ligada, mostra um cartão pequeno (canto inferior,
 * do lado oposto ao botão flutuante) com os atalhos do Modo Simples (lista única em strings.js)
 * e os `accesskey` da própria página. "Fechar" esconde o cartão só nesta sessão do navegador
 * (a opção continua ligada); desligar e ligar de novo mostra outra vez.
 * Fica fora da armadilha de foco do painel e é ignorado pelo domObserver.
 */

import { STRINGS as S, SHORTCUTS } from '../ui/strings.js';

export const CARD_ID = 'ms-shortcuts-card';
const DISMISS_KEY = 'ms-shortcuts-dismissed';
let _card = null;

function dismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch (_) {
    return false;
  }
}

function setDismissed(on) {
  try {
    if (on) sessionStorage.setItem(DISMISS_KEY, '1');
    else sessionStorage.removeItem(DISMISS_KEY);
  } catch (_) {
    /* sem storage: vale só até desligar a opção */
  }
}

/** `accesskey` da página (fora da UI da lib), com o nome do elemento. */
function pageAccessKeys() {
  const out = [];
  for (const el of document.querySelectorAll('[accesskey]')) {
    if (el.closest('#ms-container, #' + CARD_ID)) continue;
    const key = (el.getAttribute('accesskey') || '').trim();
    if (!key) continue;
    const name = (
      el.getAttribute('aria-label') ||
      el.textContent ||
      el.getAttribute('title') ||
      ''
    )
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 40);
    out.push({
      keys: `${S.shortcutAccessKeyPrefix}${key.toUpperCase()}`,
      text: name || key,
    });
  }
  return out;
}

function el(tag, text, style) {
  const n = document.createElement(tag);
  if (text) n.textContent = text;
  if (style) {
    for (const [k, v] of Object.entries(style)) {
      n.style.setProperty(k, v, 'important'); // temas da página não recolorem o cartão
    }
  }
  return n;
}

function build(side) {
  const card = el('section', '', {
    position: 'fixed',
    bottom: '16px',
    [side]: '16px',
    width: '280px',
    'max-width': 'calc(100vw - 120px)', // não cobre o botão flutuante (56px + folgas) a 390px
    'box-sizing': 'border-box',
    padding: '12px 14px',
    background: '#0B2C5F',
    color: '#fff',
    font: '400 15px/1.4 system-ui, sans-serif',
    'border-radius': '10px',
    'box-shadow': '0 4px 16px rgba(0,0,0,0.35)',
    'z-index': '2147483640',
  });
  card.id = CARD_ID;
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', S.shortcutsTitle);
  card.append(
    el('h2', S.shortcutsTitle, {
      margin: '0 0 8px',
      font: '700 16px/1.3 system-ui, sans-serif',
      color: '#fff',
    }),
  );
  const list = el('ul', '', {
    margin: '0 0 10px',
    padding: '0',
    'list-style': 'none',
  });
  for (const s of [...SHORTCUTS, ...pageAccessKeys()]) {
    const li = el('li', '', { margin: '0 0 6px', color: '#fff' });
    li.append(
      el('kbd', s.keys, {
        display: 'inline-block',
        padding: '1px 6px',
        margin: '0 6px 0 0',
        background: '#fff',
        color: '#0B2C5F',
        'border-radius': '4px',
        font: '700 14px/1.4 system-ui, sans-serif',
      }),
      document.createTextNode(s.text),
    );
    list.append(li);
  }
  const close = el('button', S.shortcutsClose, {
    'min-width': '44px',
    'min-height': '44px',
    padding: '0 16px',
    background: '#fff',
    color: '#0B2C5F',
    border: '0',
    'border-radius': '8px',
    font: '700 15px/1 system-ui, sans-serif',
    cursor: 'pointer',
  });
  close.type = 'button';
  close.addEventListener('click', () => {
    setDismissed(true);
    hide();
  });
  card.append(list, close);
  return card;
}

function hide() {
  _card?.remove();
  _card = null;
}

/** @param {{side?: 'left'|'right'}} [opts] lado do cartão (oposto ao botão flutuante) */
export function startShortcutsCard({ side = 'left' } = {}) {
  if (_card || dismissed()) return;
  _card = build(side);
  document.body.appendChild(_card);
}

/** Troca o lado do cartão aberto (botão flutuante mudou de lado). */
export function placeShortcutsCard(side) {
  if (!_card) return;
  _card.style.setProperty(
    side === 'left' ? 'right' : 'left',
    'auto',
    'important',
  );
  _card.style.setProperty(side, '16px', 'important');
}

/** Tira o cartão sem esquecer o "Fechar" da sessão (destroy). */
export function hideShortcutsCard() {
  hide();
}

export function stopShortcutsCard() {
  setDismissed(false);
  hide();
}
