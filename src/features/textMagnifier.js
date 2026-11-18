/**
 * features/textMagnifier.js
 *
 * F9b "Lupa de texto": com `textMagnifier` ligada, uma caixa grande (fonte ≥ 32px) mostra o texto
 * do bloco sob o ponteiro ou com o foco do teclado. Não é lente de pixels nem clone do DOM: é só
 * o texto, copiado como texto. A caixa nunca cobre o alvo nem sai da tela, usa as cores do tema
 * ativo (computadas no <body>), é `aria-hidden` (leitores de tela já leem a página) e não captura
 * eventos (o toque/clique passa direto). Fica escondida sobre o painel/FAB. Esc esconde até o
 * próximo movimento ou foco. Campos de senha nunca são mostrados.
 * Todos os listeners saem em stopTextMagnifier() (também chamado no destroy).
 */

export const MAGNIFIER_ID = 'ms-text-magnifier';
const MIN_FONT_PX = 32;
const GAP = 12;
const MAX_CHARS = 280;
const OWN =
  '#ms-container, #ms-shortcuts-card, #ms-simples-chrome, #ms-session-bar, #' +
  MAGNIFIER_ID;
const BLOCK =
  'p, li, h1, h2, h3, h4, h5, h6, td, th, dt, dd, blockquote, figcaption, label, legend, caption, summary, button, a, pre';

let _box = null;
let _raf = null;
let _pending = null;
let _escaped = false;
let _last = '';
/** 'pointer' (mouse/toque) ou 'focus' (teclado): quem mostrou a caixa agora */
let _source = null;
/** rolagem da janela quando a caixa foi mostrada (para ignorar scroll sem mudança) */
let _scroll0 = { x: 0, y: 0 };
/** @type {Array<[EventTarget, string, Function, object|boolean|undefined]>} */
let _listeners = [];

/** autocomplete que guarda dados sensíveis: mostra só o rótulo, nunca o valor */
const SENSITIVE_AC = /^(cc-|one-time-code$|new-password$|current-password$)/;
function isSensitive(el) {
  const tokens = (el.getAttribute('autocomplete') || '')
    .toLowerCase()
    .split(/\s+/);
  return tokens.some((t) => SENSITIVE_AC.test(t));
}

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

/** Texto de um campo de formulário; senha nunca. */
function fieldText(el) {
  const tag = el.tagName;
  if (tag === 'INPUT') {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    if (type === 'password' || type === 'hidden') return '';
    if (['checkbox', 'radio', 'file', 'range', 'color'].includes(type)) {
      return clean(labelOf(el));
    }
    if (['button', 'submit', 'reset'].includes(type)) return clean(el.value);
    if (isSensitive(el)) return clean(labelOf(el));
    return clean(`${labelOf(el)} ${el.value || ''}`);
  }
  if (tag === 'TEXTAREA') {
    if (isSensitive(el)) return clean(labelOf(el));
    return clean(`${labelOf(el)} ${el.value || ''}`);
  }
  if (tag === 'SELECT') {
    const opt = el.selectedOptions?.[0];
    return clean(`${labelOf(el)} ${opt ? opt.textContent : ''}`);
  }
  return '';
}

function labelOf(el) {
  const aria = el.getAttribute('aria-label');
  if (aria) return aria;
  const labels = el.labels
    ? [...el.labels].map((l) => l.textContent).join(' ')
    : '';
  return labels || el.getAttribute('placeholder') || '';
}

/**
 * Texto do bloco mais próximo do elemento (ou '' se não há o que mostrar).
 * @param {Element|null} el
 */
export function magnifierTextFor(el) {
  if (!el || el.nodeType !== 1) return '';
  if (el.closest?.(OWN)) return '';
  // contenteditable: o conteúdo é um valor digitado; mostra só o rótulo
  const ce = el.closest?.('[contenteditable]');
  if (ce && ce.getAttribute('contenteditable') !== 'false') {
    return clean(ce.getAttribute('aria-label')).slice(0, MAX_CHARS);
  }
  const tag = el.tagName;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag))
    return fieldText(el).slice(0, MAX_CHARS);
  if (tag === 'IMG') return clean(el.getAttribute('alt')).slice(0, MAX_CHARS);
  for (
    let n = el;
    n && n !== document.body && n !== document.documentElement;
    n = n.parentElement
  ) {
    if (n.closest?.(OWN)) return '';
    if (n.matches?.(BLOCK)) {
      const t = clean(n.textContent);
      if (t) return t.slice(0, MAX_CHARS);
    }
  }
  // sem bloco conhecido (ex.: <div>texto</div>): só o texto direto do elemento, nunca o contêiner todo
  const own = [...el.childNodes]
    .filter((c) => c.nodeType === 3)
    .map((c) => c.textContent)
    .join(' ');
  return clean(own).slice(0, MAX_CHARS);
}

function rgb(c) {
  const m = /rgba?\(([^)]+)\)/.exec(c || '');
  if (!m) return null;
  const [r, g, b, a = 1] = m[1]
    .split(/[ ,/]+/)
    .filter(Boolean)
    .map(Number);
  return { r, g, b, a };
}
const lum = ({ r, g, b }) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/** Cores do tema ativo: texto e fundo do <body>; fundo transparente vira o oposto do texto. */
function themeColors() {
  const cs = getComputedStyle(document.body);
  const fg = rgb(cs.color) || { r: 0, g: 0, b: 0, a: 1 };
  let bg = rgb(cs.backgroundColor);
  if (!bg || bg.a < 0.5) {
    const html = rgb(
      getComputedStyle(document.documentElement).backgroundColor,
    );
    bg =
      html && html.a >= 0.5
        ? html
        : lum(fg) > 0.5
          ? { r: 0, g: 0, b: 0 }
          : { r: 255, g: 255, b: 255 };
  }
  const css = ({ r, g, b }) => `rgb(${r}, ${g}, ${b})`;
  return { color: css(fg), background: css(bg) };
}

function ensureBox() {
  if (_box) return _box;
  _box = document.createElement('div');
  _box.id = MAGNIFIER_ID;
  _box.setAttribute('aria-hidden', 'true');
  const set = (k, v) => _box.style.setProperty(k, v, 'important');
  set('position', 'fixed');
  set('left', '0');
  set('top', '0');
  set('display', 'none');
  set('box-sizing', 'border-box');
  set('width', 'min(720px, calc(100vw - 32px))');
  set('max-height', '40vh');
  set('overflow', 'hidden');
  set('padding', '14px 18px');
  set('font', `600 ${MIN_FONT_PX}px/1.35 system-ui, sans-serif`);
  set('border-radius', '12px');
  set('border', '3px solid');
  set('box-shadow', '0 6px 24px rgba(0,0,0,0.4)');
  set('pointer-events', 'none');
  set('z-index', '2147483645');
  set('word-break', 'break-word');
  document.documentElement.appendChild(_box);
  return _box;
}

function hide() {
  _last = '';
  if (_box) _box.style.setProperty('display', 'none', 'important');
}

/** Põe a caixa abaixo (ou acima) do alvo, dentro da tela. */
function place(rect) {
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const w = _box.offsetWidth;
  const h = _box.offsetHeight;
  let top;
  if (rect.bottom + GAP + h <= vh) top = rect.bottom + GAP;
  else if (rect.top - GAP - h >= 0) top = rect.top - GAP - h;
  else top = rect.top > vh - rect.bottom ? 8 : vh - h - 8; // alvo enorme: borda mais livre
  const left = Math.min(Math.max(8, rect.left), Math.max(8, vw - w - 8));
  _box.style.setProperty('left', `${Math.round(left)}px`, 'important');
  _box.style.setProperty(
    'top',
    `${Math.round(Math.max(0, top))}px`,
    'important',
  );
}

function show(el, pointer) {
  const text = magnifierTextFor(el);
  if (!text) return hide();
  const box = ensureBox();
  if (text !== _last || box.style.display === 'none') {
    const { color, background } = themeColors();
    box.style.setProperty('color', color, 'important');
    box.style.setProperty('background', background, 'important');
    box.style.setProperty('border-color', color, 'important');
    box.textContent = text;
    _last = text;
  }
  box.style.setProperty('display', 'block', 'important');
  _source = pointer ? 'pointer' : 'focus';
  _scroll0 = { x: window.scrollX || 0, y: window.scrollY || 0 };
  let rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  // bloco alto (maior que meia tela): usa só a faixa do ponteiro, para não esconder o resto
  if (pointer && rect.height > vh / 2) {
    rect = {
      top: pointer.y - 12,
      bottom: pointer.y + 12,
      left: rect.left,
      right: rect.right,
    };
  }
  place(rect);
}

function schedule(el, pointer) {
  _pending = { el, pointer };
  if (_raf !== null) return;
  _raf = requestAnimationFrame(() => {
    _raf = null;
    const p = _pending;
    _pending = null;
    if (p && !_escaped && _listeners.length) show(p.el, p.pointer);
  });
}

function on(target, type, fn, opts) {
  target.addEventListener(type, fn, opts);
  _listeners.push([target, type, fn, opts]);
}

export function startTextMagnifier() {
  if (_listeners.length) return;
  const move = (e) => {
    if (e.pointerType === 'touch') return; // toque: só no pointerdown
    _escaped = false;
    if (e.target?.closest?.('#ms-container')) return hide();
    schedule(e.target, { x: e.clientX, y: e.clientY });
  };
  const tap = (e) => {
    if (e.pointerType !== 'touch') return;
    _escaped = false;
    if (e.target?.closest?.('#ms-container')) return hide();
    schedule(e.target, { x: e.clientX, y: e.clientY });
  };
  const focus = (e) => {
    _escaped = false;
    if (
      !e.target ||
      e.target === document.body ||
      e.target.closest?.('#ms-container')
    )
      return hide();
    schedule(e.target, null);
  };
  on(document, 'pointermove', move, { passive: true });
  on(document, 'pointerdown', tap, { passive: true });
  on(
    document,
    'pointerout',
    (e) => {
      if (!e.relatedTarget && e.pointerType !== 'touch') hide();
    },
    { passive: true },
  );
  on(document, 'focusin', focus);
  // tocar numa área sem foco tira o foco do campo anterior: isso não pode esconder a caixa do toque
  on(document, 'focusout', () => {
    if (_source === 'focus') hide();
  });
  // toque que vira rolagem cancela o ponteiro: a caixa ficaria no lugar velho
  on(document, 'pointercancel', () => hide(), { passive: true });
  // rolagem de verdade (janela mudou de posição ou um contêiner rolou) esconde a caixa do ponteiro
  on(
    document,
    'scroll',
    (e) => {
      if (_source !== 'pointer') return;
      if (
        e.target === document &&
        Math.abs((window.scrollX || 0) - _scroll0.x) < 1 &&
        Math.abs((window.scrollY || 0) - _scroll0.y) < 1
      )
        return;
      hide();
    },
    { capture: true, passive: true },
  );
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape') {
      _escaped = true;
      hide();
    }
  });
  on(document, 'wheel', () => hide(), { passive: true }); // rolar: a posição antiga ficaria velha
  // só se a largura mudar (girar a tela): a barra de endereço do celular também dispara resize
  let width = window.innerWidth;
  on(window, 'resize', () => {
    if (window.innerWidth !== width) hide();
    width = window.innerWidth;
  });
}

export function stopTextMagnifier() {
  for (const [t, type, fn, opts] of _listeners)
    t.removeEventListener(type, fn, opts);
  _listeners = [];
  if (_raf !== null) {
    cancelAnimationFrame(_raf);
    _raf = null;
  }
  _pending = null;
  _escaped = false;
  _last = '';
  _source = null;
  _box?.remove();
  _box = null;
}
