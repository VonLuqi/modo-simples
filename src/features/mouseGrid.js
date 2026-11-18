/**
 * features/mouseGrid.js
 *
 * F9d "Grade de mouse": ação de sessão (não persistida). Uma grade 3x3 numerada cobre a tela;
 * as teclas 1–9 (linha de cima ou teclado numérico) ou o toque escolhem uma célula, que vira a
 * nova área e é subdividida de novo. Enter clica no centro da área atual; Backspace sobe um
 * nível; Esc fecha e devolve o foco. Células menores que 24px não são desenhadas: ali só Enter.
 * A área é guardada em frações da janela (redimensionar não a desalinha).
 *
 * API pequena (a F10, voz, reaproveita): openMouseGrid(), selectCell(n), clickCurrent(),
 * closeMouseGrid().
 */

import { STRINGS as S } from '../ui/strings.js';
import { announce } from '../utils/aria.js';
import { trapFocus } from '../utils/focus.js';

export const MOUSE_GRID_ID = 'ms-mouse-grid';
export const MIN_CELL_PX = 24;
const FOCUSABLE =
  'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable=""], [contenteditable="true"]';

/** @type {HTMLElement|null} */
let _root = null;
let _prevFocus = null;
let _releaseTrap = null;
/** @type {Array<{x:number,y:number,w:number,h:number}>} áreas em frações da janela */
let _stack = [];

/** altura ocupada pela barra de botões (as células nunca ficam debaixo dela) */
let _barH = 0;
/** barra no topo quando o teclado virtual está aberto (ele ocupa o rodapé e precisa ser clicável) */
let _barTop = false;
const viewport = () => ({
  w: document.documentElement.clientWidth || window.innerWidth || 1,
  h: Math.max(
    1,
    (document.documentElement.clientHeight || window.innerHeight || 1) - _barH,
  ),
  y0: _barTop ? _barH : 0,
});
const current = () => _stack[_stack.length - 1];

/** Área em pixels. */
function px(a) {
  const v = viewport();
  return { x: a.x * v.w, y: v.y0 + a.y * v.h, w: a.w * v.w, h: a.h * v.h };
}

/** Subdivide a área atual em células de 3x3? (só se cada célula tem ≥ 24px) */
export function canSubdivide(area) {
  const p = px(area);
  return Math.min(p.w, p.h) / 3 >= MIN_CELL_PX;
}

/** Área (fração da janela) da célula n (1–9, linha a linha) dentro de `area`. */
export function cellArea(area, n) {
  const col = (n - 1) % 3;
  const row = Math.floor((n - 1) / 3);
  const w = area.w / 3;
  const h = area.h / 3;
  return { x: area.x + col * w, y: area.y + row * h, w, h };
}

/** Centro em pixels da área (fração) dada. */
export function areaCenter(area) {
  const p = px(area);
  return { x: p.x + p.w / 2, y: p.y + p.h / 2 };
}

const rgbaOf = (css, alpha) => {
  const m = /rgba?\(([^)]+)\)/.exec(css || '');
  if (!m) return css;
  const [r, g, b] = m[1]
    .split(/[ ,/]+/)
    .filter(Boolean)
    .map(Number);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function theme() {
  const cs = getComputedStyle(document.body);
  const fg = cs.color || 'rgb(0, 0, 0)';
  let bg = cs.backgroundColor;
  if (!bg || /rgba\([^)]*,\s*0\)/.test(bg) || bg === 'transparent') {
    bg = getComputedStyle(document.documentElement).backgroundColor;
  }
  if (!bg || /rgba\([^)]*,\s*0\)/.test(bg) || bg === 'transparent') {
    bg = 'rgb(255, 255, 255)';
  }
  return { fg, bg };
}

function box(parent, style) {
  const d = document.createElement('div');
  Object.assign(d.style, style);
  parent.appendChild(d);
  return d;
}

function render() {
  if (!_root) return;
  const { fg, bg } = theme();
  _root.textContent = '';
  _barH = 0;
  _barTop = !!document.getElementById('ms-virtual-keyboard');
  // a barra vem primeiro: a altura dela entra na conta da área das células (L1)
  const compact = viewport().w < 420;
  const bar = box(_root, {
    position: 'absolute',
    left: '0',
    right: '0',
    [_barTop ? 'top' : 'bottom']: '8px',
    display: 'flex',
    gap: compact ? '4px' : '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    zIndex: '1',
  });
  const mk = (label, fn) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    Object.assign(b.style, {
      minHeight: '44px',
      padding: compact ? '0 8px' : '0 14px',
      border: `3px solid ${fg}`,
      borderRadius: '8px',
      background: bg,
      color: fg,
      font: compact ? '700 14px/1 sans-serif' : '700 16px/1 sans-serif',
      cursor: 'pointer',
    });
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      fn();
    });
    bar.appendChild(b);
  };
  mk(compact ? S.gridClickShort : S.gridClickBtn, () => clickCurrent());
  mk(compact ? S.gridBackShort : S.gridBackBtn, () => goBack());
  mk(compact ? S.gridCloseShort : S.gridCloseBtn, () => closeMouseGrid());
  _barH = bar.offsetHeight + 16;
  const a = px(current());
  // área atual: o resto da tela escurece (sombra), a área fica com moldura forte
  box(_root, {
    position: 'absolute',
    left: `${a.x}px`,
    top: `${a.y}px`,
    width: `${a.w}px`,
    height: `${a.h}px`,
    boxSizing: 'border-box',
    border: `3px solid ${fg}`,
    boxShadow: `0 0 0 100vmax ${rgbaOf(bg, 0.55)}`,
    pointerEvents: 'none',
  });
  if (canSubdivide(current())) {
    for (let n = 1; n <= 9; n++) {
      const c = px(cellArea(current(), n));
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-cell', String(n));
      b.setAttribute('aria-label', `${S.gridCellLabel} ${n}`);
      b.textContent = String(n);
      Object.assign(b.style, {
        position: 'absolute',
        left: `${c.x}px`,
        top: `${c.y}px`,
        width: `${c.w}px`,
        height: `${c.h}px`,
        boxSizing: 'border-box',
        margin: '0',
        padding: '0',
        border: `2px solid ${fg}`,
        background: rgbaOf(bg, 0.6),
        color: fg,
        font: `700 ${Math.max(14, Math.min(64, c.h * 0.5))}px/1 sans-serif`,
        cursor: 'pointer',
      });
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCell(n);
      });
      _root.appendChild(b);
    }
  }
}

function levelText() {
  return canSubdivide(current())
    ? `${S.gridLevelPre} ${_stack.length}. ${S.gridChoose}`
    : S.gridMin;
}

/** Ponto elementFromPoint atravessando shadow roots abertos. */
function deepElementAt(x, y) {
  let el = document.elementFromPoint(x, y);
  while (el?.shadowRoot) {
    const inner = el.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === el) break;
    el = inner;
  }
  return el;
}

function onKeydown(e) {
  if (!_root) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code || '');
  if (m) {
    e.preventDefault();
    e.stopPropagation();
    selectCell(Number(m[1]));
  } else if (e.key === 'Enter') {
    // Enter num botão da própria grade ativa o botão (Clicar/Voltar/Fechar/célula)
    if (
      e.target?.closest?.(`#${MOUSE_GRID_ID}`) &&
      e.target.closest('button')
    ) {
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    clickCurrent();
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    e.stopPropagation();
    goBack();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    closeMouseGrid();
  }
}

function onResize() {
  render();
}

export const isMouseGridOpen = () => !!_root;

/** Abre a grade em tela cheia (recomeça se já aberta). */
export function openMouseGrid() {
  if (_root) {
    _stack = [{ x: 0, y: 0, w: 1, h: 1 }];
    render();
    announce(S.gridOpen);
    return;
  }
  _prevFocus = document.activeElement;
  _stack = [{ x: 0, y: 0, w: 1, h: 1 }];
  _root = document.createElement('div');
  _root.id = MOUSE_GRID_ID;
  _root.setAttribute('role', 'dialog');
  _root.setAttribute('aria-modal', 'true');
  _root.setAttribute('aria-label', S.gridDialogLabel);
  _root.tabIndex = -1;
  Object.assign(_root.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    overflow: 'hidden',
    outline: 'none',
    background: 'transparent',
  });
  document.body.appendChild(_root);
  render();
  document.addEventListener('keydown', onKeydown, true);
  window.addEventListener('resize', onResize);
  _releaseTrap = trapFocus(_root);
  _root.focus();
  announce(S.gridOpen);
}

/**
 * Escolhe a célula n (1–9) da grade atual e redesenha a grade dentro dela.
 * @param {number} n
 * @returns {boolean} false se a grade está fechada, n é inválido ou não há mais subdivisão
 */
export function selectCell(n) {
  if (!_root || !Number.isInteger(n) || n < 1 || n > 9) return false;
  if (!canSubdivide(current())) return false;
  _stack.push(cellArea(current(), n));
  render();
  const prevFocus = _root.contains(document.activeElement);
  if (!prevFocus) _root.focus();
  announce(levelText());
  return true;
}

function goBack() {
  if (!_root) return false;
  if (_stack.length < 2) {
    announce(S.gridTop);
    return false;
  }
  _stack.pop();
  render();
  _root.focus();
  announce(levelText());
  return true;
}

/**
 * Fecha a grade. Por padrão devolve o foco ao elemento de antes.
 * @param {{restoreFocus?: boolean, silent?: boolean}} [o]
 */
export function closeMouseGrid({ restoreFocus = true, silent = false } = {}) {
  if (!_root) return;
  document.removeEventListener('keydown', onKeydown, true);
  window.removeEventListener('resize', onResize);
  _releaseTrap?.();
  _releaseTrap = null;
  _root.remove();
  _root = null;
  _barH = 0;
  _barTop = false;
  _stack = [];
  const prev = _prevFocus;
  _prevFocus = null;
  if (restoreFocus && prev?.isConnected) prev.focus?.();
  if (!silent) announce(S.gridClosed);
}

/**
 * Clica no centro da área atual e fecha a grade. A grade some antes do teste de acerto, então
 * nunca é o alvo.
 * @returns {Element|null} o elemento clicado
 */
export function clickCurrent() {
  if (!_root) return null;
  const { x, y } = areaCenter(current());
  closeMouseGrid({ restoreFocus: false, silent: true });
  const target = deepElementAt(x, y);
  if (!target) {
    announce(S.gridClosed);
    return null;
  }
  const init = (buttons) => ({
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window,
    clientX: x,
    clientY: y,
    button: 0,
    buttons,
  });
  const Ptr =
    typeof window.PointerEvent === 'function'
      ? window.PointerEvent
      : window.MouseEvent;
  const ptr = { pointerType: 'mouse', pointerId: 1, isPrimary: true };
  target.dispatchEvent(new Ptr('pointerdown', { ...init(1), ...ptr }));
  target.dispatchEvent(
    new window.MouseEvent('mousedown', { ...init(1), detail: 1 }),
  );
  target.dispatchEvent(new Ptr('pointerup', { ...init(0), ...ptr }));
  target.dispatchEvent(
    new window.MouseEvent('mouseup', { ...init(0), detail: 1 }),
  );
  target.dispatchEvent(
    new window.MouseEvent('click', { ...init(0), detail: 1 }),
  );
  const focusable = target.closest?.(FOCUSABLE);
  if (focusable && !focusable.disabled) focusable.focus?.();
  announce(S.gridClicked);
  return target;
}
