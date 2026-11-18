/**
 * features/virtualKeyboard.js
 *
 * F9e "Teclado virtual": ação de sessão (não persistida). Um teclado ABNT2 pt-BR (com ç e
 * acentos) fixo no rodapé escreve nos campos de texto da própria página (input de texto,
 * textarea, contenteditable; nunca readonly/disabled). Com o modo ligado, ele aparece sempre
 * que um campo recebe foco; sem campo focado mostra só uma dica. Usa-se com mouse ou toque:
 * as teclas não roubam o foco (pointerdown/mousedown com preventDefault).
 *
 * Teclas mortas ´ ` ~ ^ ¨ compõem com a letra seguinte (dead + espaço = o próprio símbolo).
 * A escrita passa por beforeinput/input reais (inputType insertText / deleteContentBackward),
 * com o setter nativo de `value`, para campos ligados a frameworks (React) atualizarem.
 * Só funciona no documento da página: iframes de outros sites não são alcançáveis.
 *
 * API (a F10, voz, pode reaproveitar): openVirtualKeyboard(), closeVirtualKeyboard(),
 * isVirtualKeyboardOpen(), insertText(), deleteBack(), pressEnter(), composeDead().
 */

import { STRINGS as S } from '../ui/strings.js';
import { announce } from '../utils/aria.js';
import { themeColors } from './textMagnifier.js';

export const KEYBOARD_ID = 'ms-virtual-keyboard';
const OWN = `#ms-container, #${KEYBOARD_ID}`;
const TEXT_TYPES = [
  'text',
  'search',
  'email',
  'url',
  'tel',
  'number',
  'password',
];

/** Teclas mortas da ABNT2 (cada uma compõe com a vogal seguinte). */
export const DEAD_KEYS = ['´', '`', '~', '^', '¨'];
const COMPOSE = {
  '´': {
    a: 'á',
    e: 'é',
    i: 'í',
    o: 'ó',
    u: 'ú',
    y: 'ý',
    A: 'Á',
    E: 'É',
    I: 'Í',
    O: 'Ó',
    U: 'Ú',
    Y: 'Ý',
  },
  '`': {
    a: 'à',
    e: 'è',
    i: 'ì',
    o: 'ò',
    u: 'ù',
    A: 'À',
    E: 'È',
    I: 'Ì',
    O: 'Ò',
    U: 'Ù',
  },
  '~': { a: 'ã', o: 'õ', n: 'ñ', A: 'Ã', O: 'Õ', N: 'Ñ' },
  '^': {
    a: 'â',
    e: 'ê',
    i: 'î',
    o: 'ô',
    u: 'û',
    A: 'Â',
    E: 'Ê',
    I: 'Î',
    O: 'Ô',
    U: 'Û',
  },
  '¨': {
    a: 'ä',
    e: 'ë',
    i: 'ï',
    o: 'ö',
    u: 'ü',
    y: 'ÿ',
    A: 'Ä',
    E: 'Ë',
    I: 'Ï',
    O: 'Ö',
    U: 'Ü',
  },
};

/** Letra composta (dead + ch) ou null se não compõe. */
export function composeDead(dead, ch) {
  return COMPOSE[dead]?.[ch] ?? null;
}

/**
 * Linhas ABNT2. Tecla = "nível1nível2" (2 caracteres: normal e com Shift); letra = 1 caractere
 * minúsculo (a maiúscula vem do Shift/Caps); ou nome de tecla especial.
 */
export const ROWS = [
  [
    '\'"',
    '1!',
    '2@',
    '3#',
    '4$',
    '5%',
    '6¨',
    '7&',
    '8*',
    '9(',
    '0)',
    '-_',
    '=+',
    'Backspace',
  ],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '´`', '[{'],
  [
    'Caps',
    'a',
    's',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    'ç',
    '~^',
    ']}',
    'Enter',
  ],
  [
    'Shift',
    '\\|',
    'z',
    'x',
    'c',
    'v',
    'b',
    'n',
    'm',
    ',<',
    '.>',
    ';:',
    '/?',
    'Shift',
  ],
  ['Fechar', 'Space'],
];
const DEAD_NAMES = {
  '´': S.vkDeadAcute,
  '`': S.vkDeadGrave,
  '~': S.vkDeadTilde,
  '^': S.vkDeadCircumflex,
  '¨': S.vkDeadDiaeresis,
};
const SPECIAL = ['Backspace', 'Caps', 'Enter', 'Shift', 'Fechar', 'Space'];

// ── campo-alvo ──────────────────────────────────────────────────────────────

const isCE = (el) =>
  el.isContentEditable === true ||
  ['', 'true', 'plaintext-only'].includes(el.getAttribute('contenteditable'));

/** Campo onde o teclado pode escrever (texto, não readonly/disabled, fora da UI da lib). */
export function isEditableField(el) {
  if (!el || el.nodeType !== 1 || el.closest?.(OWN)) return false;
  if (el.tagName === 'TEXTAREA') return !el.readOnly && !el.disabled;
  if (el.tagName === 'INPUT') {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    return TEXT_TYPES.includes(type) && !el.readOnly && !el.disabled;
  }
  return el.getAttribute('contenteditable') !== null && isCE(el);
}

// ── escrita no campo ────────────────────────────────────────────────────────

const win = () => document.defaultView || window;

/** Dispara um evento de entrada; devolve false se alguém cancelou (beforeinput). */
function fire(el, type, init = {}) {
  const W = win();
  const C = W.InputEvent || W.Event;
  return el.dispatchEvent(
    new C(type, { bubbles: true, cancelable: type === 'beforeinput', ...init }),
  );
}

function setValue(el, v) {
  const W = win();
  const proto =
    el.tagName === 'TEXTAREA'
      ? W.HTMLTextAreaElement?.prototype
      : W.HTMLInputElement?.prototype;
  const set = proto && Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (set) set.call(el, v);
  else el.value = v;
}

function setCaret(el, pos) {
  try {
    el.setSelectionRange(pos, pos);
  } catch (_) {
    /* email/number não têm seleção */
  }
}

function selection(el) {
  const val = el.value;
  let s = null;
  let e = null;
  try {
    s = el.selectionStart;
    e = el.selectionEnd;
  } catch (_) {
    /* sem seleção */
  }
  if (s == null || e == null) {
    s = val.length;
    e = val.length;
  }
  return [s, e, val];
}

function ceSelection(el) {
  const sel = win().getSelection?.();
  if (!sel || !sel.rangeCount) return null;
  const r = sel.getRangeAt(0);
  return el.contains(r.commonAncestorContainer) ? { sel, r } : null;
}

/** Insere `text` no cursor (trocando a seleção). Devolve true se inseriu. */
export function insertText(el, text, inputType = 'insertText') {
  if (!el || !text) return false;
  if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
    el.focus?.({ preventScroll: true });
    const cmd = text === '\n' ? 'insertLineBreak' : 'insertText';
    if (document.execCommand?.(cmd, false, text)) return true;
    const cs = ceSelection(el);
    if (!cs || !fire(el, 'beforeinput', { inputType, data: text }))
      return false;
    cs.r.deleteContents();
    const node = document.createTextNode(text);
    cs.r.insertNode(node);
    cs.r.setStartAfter(node);
    cs.r.collapse(true);
    cs.sel.removeAllRanges();
    cs.sel.addRange(cs.r);
    fire(el, 'input', { inputType, data: text });
    return true;
  }
  const [s, e, val] = selection(el);
  const max = el.maxLength;
  if (max >= 0 && val.length - (e - s) + text.length > max) return false;
  if (!fire(el, 'beforeinput', { inputType, data: text })) return false;
  setValue(el, val.slice(0, s) + text + val.slice(e));
  setCaret(el, s + text.length);
  fire(el, 'input', { inputType, data: text });
  return true;
}

/** Apaga a seleção ou o caractere antes do cursor. Devolve true se apagou. */
export function deleteBack(el) {
  if (!el) return false;
  if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
    el.focus?.({ preventScroll: true });
    if (document.execCommand?.('delete')) return true;
    const cs = ceSelection(el);
    if (!cs) return false;
    if (cs.r.collapsed) cs.sel.modify?.('extend', 'backward', 'character');
    const r = cs.sel.getRangeAt(0);
    if (r.collapsed) return false;
    if (!fire(el, 'beforeinput', { inputType: 'deleteContentBackward' }))
      return false;
    r.deleteContents();
    fire(el, 'input', { inputType: 'deleteContentBackward' });
    return true;
  }
  let [s, e, val] = selection(el);
  if (s === e) {
    if (s === 0) return false;
    // não parte um par substituto (emoji)
    const low = val.charCodeAt(s - 1);
    s -= low >= 0xdc00 && low <= 0xdfff && s >= 2 ? 2 : 1;
  }
  if (!fire(el, 'beforeinput', { inputType: 'deleteContentBackward' }))
    return false;
  setValue(el, val.slice(0, s) + val.slice(e));
  setCaret(el, s);
  fire(el, 'input', { inputType: 'deleteContentBackward' });
  return true;
}

/** Enter: quebra de linha em textarea/contenteditable; em input, Enter real + envio do form. */
export function pressEnter(el) {
  if (!el) return false;
  if (el.tagName !== 'INPUT') return insertText(el, '\n', 'insertLineBreak');
  const W = win();
  const K = W.KeyboardEvent || W.Event;
  const init = {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
  };
  const go = el.dispatchEvent(new K('keydown', init));
  if (go) el.form?.requestSubmit?.();
  el.dispatchEvent(new K('keyup', init));
  return true;
}

// ── estado e UI ─────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let _root = null;
let _target = null;
let _dead = null;
let _shift = false;
let _caps = false;
let _touch = false;
let _listeners = [];
/** campo → valor original do atributo inputmode (null = não tinha) */
let _inputmodes = new Map();
let _bodyPad = null;
let _basePad = 0;
let _keys = [];

const isTouchDevice = () =>
  (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
  !!win().matchMedia?.('(pointer: coarse)')?.matches;

export const isVirtualKeyboardOpen = () => !!_root;

function on(target, type, fn, opts) {
  target.addEventListener(type, fn, opts);
  _listeners.push([target, type, fn, opts]);
}

/** Caractere que a tecla gera agora (Shift/Caps aplicados). */
function charOf(def) {
  if (def.length === 1) return _shift !== _caps ? def.toUpperCase() : def;
  return _shift ? def[1] : def[0];
}

function labelOf(def) {
  switch (def) {
    case 'Backspace':
      return S.vkBackspace;
    case 'Caps':
      return S.vkCaps;
    case 'Enter':
      return S.vkEnter;
    case 'Shift':
      return S.vkShift;
    case 'Fechar':
      return S.vkClose;
    case 'Space':
      return S.vkSpace;
    default:
      return charOf(def);
  }
}

function setStyle(el, styles) {
  for (const [k, v] of Object.entries(styles))
    el.style.setProperty(k, v, 'important');
}

function paint() {
  if (!_root) return;
  const { color, background } = themeColors();
  setStyle(_root, { background, color, 'border-top': `3px solid ${color}` });
  for (const { btn, def } of _keys) {
    const pressed =
      (def === 'Shift' && _shift) ||
      (def === 'Caps' && _caps) ||
      (_dead &&
        def.length === 2 &&
        DEAD_KEYS.includes(charOf(def)) &&
        charOf(def) === _dead);
    btn.setAttribute('aria-pressed', String(!!pressed));
    setStyle(
      btn,
      pressed
        ? { background: color, color: background, border: `2px solid ${color}` }
        : { background, color, border: `2px solid ${color}` },
    );
    if (!SPECIAL.includes(def)) {
      const ch = charOf(def);
      btn.textContent = ch;
      const dead = DEAD_KEYS.includes(ch);
      btn.setAttribute('aria-label', dead ? DEAD_NAMES[ch] : ch);
      btn.dataset.char = ch;
    }
  }
}

/** Reserva espaço no fim da página (o teclado não cobre o campo) e rola o campo para cima dele. */
function reserve() {
  if (!_root || !document.body) return;
  const h = _root.offsetHeight || 0;
  if (_bodyPad === null) {
    const st = document.body.style;
    _bodyPad = [
      st.getPropertyValue('padding-bottom'),
      st.getPropertyPriority('padding-bottom'),
    ];
    _basePad =
      parseFloat(win().getComputedStyle(document.body).paddingBottom) || 0;
  }
  document.body.style.setProperty(
    'padding-bottom',
    `${_basePad + h}px`,
    'important',
  );
  if (_target?.getBoundingClientRect) {
    const vh = win().innerHeight || document.documentElement.clientHeight;
    const r = _target.getBoundingClientRect();
    const limit = vh - h - 16;
    if (r.bottom > limit) win().scrollBy?.(0, r.bottom - limit);
    else if (r.top < 0) win().scrollBy?.(0, r.top - 16);
  }
}

function render() {
  if (!_root) return;
  const has = !!_target;
  _root
    .querySelector('[data-vk-hint]')
    .style.setProperty('display', has ? 'none' : 'block', 'important');
  _root
    .querySelector('[data-vk-keys]')
    .style.setProperty('display', has ? 'block' : 'none', 'important');
  paint();
  reserve();
}

function restoreInputmode(el) {
  if (!_inputmodes.has(el)) return;
  const orig = _inputmodes.get(el);
  _inputmodes.delete(el);
  if (orig === null) el.removeAttribute('inputmode');
  else el.setAttribute('inputmode', orig);
}

function setTarget(el) {
  if (el === _target) return;
  if (_target) restoreInputmode(_target);
  _target = el;
  _dead = null;
  _shift = false;
  if (el && _touch) {
    // celular: a tela já tem o nosso teclado; some o nativo
    _inputmodes.set(el, el.getAttribute('inputmode'));
    el.setAttribute('inputmode', 'none');
  }
  render();
}

// ── teclas ──────────────────────────────────────────────────────────────────

function typeChar(ch) {
  if (_dead) {
    const d = _dead;
    _dead = null;
    insertText(_target, ch === ' ' ? d : (composeDead(d, ch) ?? d + ch));
  } else {
    insertText(_target, ch);
  }
}

function press(def) {
  if (def === 'Fechar') return closeVirtualKeyboard();
  if (def === 'Shift') {
    _shift = !_shift;
    return paint();
  }
  if (def === 'Caps') {
    _caps = !_caps;
    return paint();
  }
  if (!_target) return;
  _target.focus?.({ preventScroll: true }); // o foco pode ter ido para uma tecla (Tab)
  if (def === 'Backspace') {
    _dead = null;
    deleteBack(_target);
  } else if (def === 'Enter') {
    _dead = null;
    pressEnter(_target);
  } else if (def === 'Space') {
    typeChar(' ');
  } else {
    const ch = charOf(def);
    if (DEAD_KEYS.includes(ch)) {
      if (_dead) typeChar(' '); // segunda morta: escreve a primeira como símbolo
      _dead = ch;
    } else {
      typeChar(ch);
    }
    _shift = false; // Shift vale para uma tecla só
  }
  paint();
}

function build() {
  const root = document.createElement('div');
  root.id = KEYBOARD_ID;
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', S.vkLabel);
  setStyle(root, {
    position: 'fixed',
    left: '0',
    right: '0',
    bottom: '0',
    'box-sizing': 'border-box',
    padding: '8px',
    'z-index': '2147483644',
    font: '600 20px/1 system-ui, sans-serif',
    'max-height': '70vh',
    'overflow-y': 'auto',
  });
  const hint = document.createElement('p');
  hint.dataset.vkHint = '';
  hint.textContent = S.vkHint;
  setStyle(hint, {
    margin: '4px 8px',
    font: '600 18px/1.4 system-ui, sans-serif',
    color: 'inherit',
  });
  const keys = document.createElement('div');
  keys.dataset.vkKeys = '';
  keys.style.setProperty('max-width', '960px', 'important');
  keys.style.setProperty('margin', '0 auto', 'important');
  const wide = {
    Backspace: 2,
    Caps: 2,
    Enter: 2,
    Shift: 2,
    Fechar: 2,
    Space: 8,
  };
  for (const row of ROWS) {
    const line = document.createElement('div');
    setStyle(line, {
      display: 'flex',
      'flex-wrap': 'wrap',
      gap: '4px',
      margin: '0 0 4px',
    });
    for (const def of row) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.vk = def;
      if (def !== 'Fechar') btn.tabIndex = -1; // só o Fechar entra na ordem do Tab
      btn.textContent = SPECIAL.includes(def) ? labelOf(def) : '';
      setStyle(btn, {
        flex: `${wide[def] || 1} 0 ${(wide[def] || 1) * 44}px`,
        'min-width': '44px',
        'min-height': '48px',
        margin: '0',
        padding: '0 4px',
        font: 'inherit',
        'border-radius': '8px',
        cursor: 'pointer',
      });
      if (def === 'Shift' || def === 'Caps')
        btn.setAttribute('aria-pressed', 'false');
      // sem roubar o foco do campo (mouse e toque)
      btn.addEventListener('pointerdown', (e) => e.preventDefault());
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', () => press(def));
      line.append(btn);
      _keys.push({ btn, def });
    }
    keys.append(line);
  }
  root.append(hint, keys);
  return root;
}

// ── abrir / fechar ──────────────────────────────────────────────────────────

/** @param {{touch?: boolean}} [opts] touch: força (ou desliga) o modo celular, útil em testes */
export function openVirtualKeyboard({ touch } = {}) {
  if (_root) return;
  _touch = touch ?? isTouchDevice();
  _shift = false;
  _caps = false;
  _dead = null;
  _keys = [];
  _root = build();
  document.documentElement.appendChild(_root);
  const focus = (e) => {
    const t = e.target;
    if (t?.closest?.(`#${KEYBOARD_ID}`)) return; // foco numa tecla (Tab): mantém o campo
    setTarget(isEditableField(t) ? t : null);
  };
  on(document, 'focusin', focus);
  on(document, 'focusout', (e) => {
    if (!e.relatedTarget && e.target === _target) setTarget(null); // tocou fora de tudo
  });
  on(window, 'resize', () => render());
  const ae = document.activeElement;
  setTarget(isEditableField(ae) ? ae : null);
  render();
  announce(S.vkOpened);
}

/** @param {{silent?: boolean}} [opts] */
export function closeVirtualKeyboard({ silent = false } = {}) {
  if (!_root) return;
  for (const [t, type, fn, opts] of _listeners)
    t.removeEventListener(type, fn, opts);
  _listeners = [];
  for (const el of [..._inputmodes.keys()]) restoreInputmode(el);
  _inputmodes = new Map();
  if (_bodyPad !== null && document.body) {
    if (_bodyPad[0])
      document.body.style.setProperty(
        'padding-bottom',
        _bodyPad[0],
        _bodyPad[1],
      );
    else document.body.style.removeProperty('padding-bottom');
  }
  _bodyPad = null;
  _root.remove();
  _root = null;
  _target = null;
  _dead = null;
  _shift = false;
  _caps = false;
  _keys = [];
  if (!silent) announce(S.vkClosed);
}
