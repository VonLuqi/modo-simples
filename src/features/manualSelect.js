/**
 * features/manualSelect.js
 *
 * When heuristic confidence is low, show a banner prompting the user to pick the
 * main content: by click/tap, or by keyboard (Tab = next block, ↑ = parent,
 * ↓ = first child, Enter = confirm, Esc = cancel). Confirming sets
 * data-ms-principal and returns a CSS path.
 */

const BANNER_ID = 'ms-manual-select-banner';
const HIGHLIGHT_ID = 'ms-manual-select-highlight';
const OVERLAY_CLASS = 'ms-manual-select-active';
const INSTRUCTION =
  'Clique ou toque no conteúdo principal. Teclado: Tab escolhe, ↑ ↓ ampliam ou reduzem, Enter confirma, Esc cancela.';
const CANDIDATE_SELECTOR = 'main, [role="main"], article, section, aside, div';
const MIN_W = 120;
const MIN_H = 60;

/** @type {HTMLElement|null} */
let _banner = null;
/** @type {HTMLElement|null} */
let _status = null;
/** @type {HTMLElement|null} */
let _highlight = null;
/** @type {Element|null} */
let _current = null;
/** @type {Element|null} */
let _prevFocus = null;
/** @type {((e: MouseEvent) => void)|null} */
let _onClick = null;
/** @type {((e: KeyboardEvent) => void)|null} */
let _onKey = null;
/** @type {((e: Event) => void)|null} */
let _onPointer = null;
/** @type {((e: Event) => void)|null} */
let _onTouch = null;
/** @type {((e: Event) => void)|null} */
let _onOver = null;
/** @type {{ onSelect?: Function, onCancel?: Function }|null} */
let _callbacks = null;

const POINTER_EVENTS = [
  'pointerdown',
  'pointerup',
  'mousedown',
  'mouseup',
  'contextmenu',
];
// toque: só impede o host de ver (sem preventDefault, senão o toque não vira clique)
const TOUCH_EVENTS = ['touchstart', 'touchend'];

/**
 * Escape a CSS identifier without relying on the CSS global (Node-safe).
 * @param {string} value
 * @returns {string}
 */
function escapeIdent(value) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(value);
  return String(value).replace(/([^\w-])/g, '\\$1');
}

/**
 * Build a reasonably unique CSS path for an element (for persistence).
 * @param {Element} el
 * @returns {string}
 */
export function buildCssPath(el) {
  if (!el || el.nodeType !== 1) return '';
  if (el.id) {
    return `#${escapeIdent(el.id)}`;
  }

  const parts = [];
  let current = el;
  const root =
    typeof document !== 'undefined' ? document.documentElement : null;

  while (current && current.nodeType === 1 && current !== root) {
    let part = current.tagName.toLowerCase();
    if (current.id) {
      parts.unshift(`#${escapeIdent(current.id)}`);
      break;
    }

    const parent = current.parentElement;
    if (parent && parent.children) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === current.tagName,
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        part += `:nth-of-type(${index})`;
      }
    }

    parts.unshift(part);
    current = parent;
  }

  return parts.join(' > ');
}

/** @param {Element|null} el */
function isOwnUi(el) {
  return !!(
    el?.closest?.('#ms-container') ||
    el?.closest?.(`#${BANNER_ID}`) ||
    el?.closest?.(`#${HIGHLIGHT_ID}`) ||
    // chrome da lib no light DOM: barra de sessão, switch SIMPLES e pills (QA R34 MED-2)
    el?.closest?.(
      '#ms-session-bar, #ms-simples-chrome, .ms-pills-nav, [data-ms-pills]',
    )
  );
}

/** Elemento que pode ser escolhido: visível, com tamanho útil e fora da UI da lib. */
function isCandidate(el) {
  if (!el || el === document.documentElement || el === document.body) {
    return false;
  }
  if (isOwnUi(el)) return false;
  const r = el.getBoundingClientRect();
  return r.width >= MIN_W && r.height >= MIN_H;
}

/** @param {Element} el */
function describe(el) {
  const tag = el.tagName.toLowerCase();
  const name =
    el.getAttribute('aria-label') ||
    el.id ||
    (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  return name ? `${tag}: ${name}` : tag;
}

/** Marca o candidato com uma moldura (overlay; não mexe no estilo do host) e o anuncia. */
function setCurrent(el) {
  _current = el;
  if (!_highlight || !_status) return;
  if (!el) {
    _highlight.style.display = 'none';
    _status.textContent = '';
    return;
  }
  const r = el.getBoundingClientRect();
  Object.assign(_highlight.style, {
    display: 'block',
    top: `${r.top + window.scrollY}px`,
    left: `${r.left + window.scrollX}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  });
  _status.textContent = ` Escolha atual: ${describe(el)}.`;
}

/** @param {1|-1} step */
function cycleCandidate(step) {
  const list = Array.from(document.querySelectorAll(CANDIDATE_SELECTOR)).filter(
    isCandidate,
  );
  if (!list.length) return;
  const i = _current ? list.indexOf(_current) : -1;
  const next =
    i < 0
      ? step > 0
        ? list[0]
        : list[list.length - 1]
      : list[(i + step + list.length) % list.length];
  next.scrollIntoView?.({ block: 'nearest' });
  setCurrent(next);
}

/** Confirma `el` como conteúdo principal e encerra a seleção. */
function confirmSelect(el) {
  // Clear previous principal markers
  document.querySelectorAll('[data-ms-principal]').forEach((node) => {
    node.removeAttribute('data-ms-principal');
  });
  el.setAttribute('data-ms-principal', '');

  const path = buildCssPath(el);
  const cb = _callbacks?.onSelect;
  stopManualSelect();
  if (cb) cb(el, path);
}

/**
 * Start manual main-content selection mode.
 * @param {{ onSelect?: (el: Element, path: string) => void, onCancel?: () => void }} [opts]
 */
export function startManualSelect(opts = {}) {
  stopManualSelect();
  _callbacks = opts;
  // Quem disparou pode estar num Shadow DOM (painel): guarda o elemento focado de verdade,
  // não o host #ms-container, para o foco poder voltar a ele (QA R34 LOW-2)
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  _prevFocus = active;

  _banner = document.createElement('div');
  _banner.id = BANNER_ID;
  _banner.setAttribute('role', 'status');
  _banner.setAttribute('aria-live', 'polite');
  _banner.tabIndex = -1;
  Object.assign(_banner.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    zIndex: '2147483646',
    padding: '0.85rem 1.25rem',
    background: '#0B2C5F',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '0.95rem',
    fontWeight: '600',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    cursor: 'default',
  });
  _banner.append(INSTRUCTION);
  _status = document.createElement('span');
  _banner.appendChild(_status);

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.setAttribute('aria-label', 'Cancelar seleção manual');
  Object.assign(cancelBtn.style, {
    marginLeft: '1rem',
    padding: '0.3rem 0.75rem',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '6px',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.85rem',
  });
  cancelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const cb = _callbacks?.onCancel;
    stopManualSelect();
    if (cb) cb();
  });
  _banner.appendChild(cancelBtn);
  document.body.appendChild(_banner);

  _highlight = document.createElement('div');
  _highlight.id = HIGHLIGHT_ID;
  _highlight.setAttribute('aria-hidden', 'true');
  Object.assign(_highlight.style, {
    display: 'none',
    position: 'absolute',
    zIndex: '2147483645',
    pointerEvents: 'none',
    outline: '3px solid #F39200',
    outlineOffset: '-3px',
    background: 'rgba(243, 146, 0, 0.12)',
  });
  document.documentElement.appendChild(_highlight);
  document.documentElement.classList.add(OVERLAY_CLASS);
  _banner.focus(); // o fluxo por teclado começa aqui; Esc/Tab/Enter são tratados abaixo

  _onClick = (e) => {
    // Ignore clicks on our own UI host / banner
    if (isOwnUi(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // nenhum outro listener de captura do documento vê o clique (IMP-29)

    const el = e.target;
    if (!el || el === document.documentElement || el === document.body) return;
    confirmSelect(el);
  };

  _onKey = (e) => {
    const inBanner = e.target?.closest?.(`#${BANNER_ID}`);
    const consume = () => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    if (e.key === 'Escape') {
      // consome o Esc: não fecha o painel nem diálogos do host junto (IMP-29)
      consume();
      const cb = _callbacks?.onCancel;
      stopManualSelect();
      if (cb) cb();
      return;
    }
    // Teclas dentro da UI da lib (painel, botão Cancelar) seguem o comportamento nativo,
    // exceto Tab no banner, que volta a percorrer os candidatos.
    if (e.target?.closest?.('#ms-container')) return;
    if (e.key === 'Tab') {
      consume();
      cycleCandidate(e.shiftKey ? -1 : 1);
    } else if (inBanner && e.target !== _banner) {
      return; // Enter/Espaço no botão Cancelar
    } else if (e.key === 'ArrowUp') {
      consume();
      const parent = _current?.parentElement;
      if (!_current) cycleCandidate(1);
      else if (parent && isCandidate(parent)) setCurrent(parent);
    } else if (e.key === 'ArrowDown') {
      consume();
      if (!_current) cycleCandidate(1);
      else {
        const child = Array.from(_current.children).find(isCandidate);
        if (child) setCurrent(child);
      }
    } else if (e.key === 'Enter') {
      consume();
      if (_current) confirmSelect(_current);
    }
  };

  // mousedown/pointerdown/mouseup/contextmenu também não podem acionar menus do host
  // durante a escolha
  _onPointer = (e) => {
    if (isOwnUi(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  _onTouch = (e) => {
    if (isOwnUi(e.target)) return;
    e.stopImmediatePropagation();
  };
  // hover (mouse) destaca o candidato antes do clique
  _onOver = (e) => {
    const el = e.target;
    if (el && !isOwnUi(el) && el !== document.documentElement) setCurrent(el);
  };

  document.addEventListener('click', _onClick, true);
  document.addEventListener('keydown', _onKey, true);
  document.addEventListener('mouseover', _onOver, true);
  for (const type of POINTER_EVENTS) {
    document.addEventListener(type, _onPointer, true);
  }
  for (const type of TOUCH_EVENTS) {
    document.addEventListener(type, _onTouch, { capture: true, passive: true });
  }
}

/**
 * @returns {boolean} true while the manual selection mode is open
 */
export function isManualSelectActive() {
  return _onClick !== null;
}

/**
 * Stop manual selection mode and remove the banner.
 */
export function stopManualSelect() {
  const wasActive = _onClick !== null;
  if (_onClick) {
    document.removeEventListener('click', _onClick, true);
    _onClick = null;
  }
  if (_onKey) {
    document.removeEventListener('keydown', _onKey, true);
    _onKey = null;
  }
  if (_onOver) {
    document.removeEventListener('mouseover', _onOver, true);
    _onOver = null;
  }
  if (_onPointer) {
    for (const type of POINTER_EVENTS) {
      document.removeEventListener(type, _onPointer, true);
    }
    _onPointer = null;
  }
  if (_onTouch) {
    for (const type of TOUCH_EVENTS) {
      document.removeEventListener(type, _onTouch, true);
    }
    _onTouch = null;
  }
  if (_banner?.parentNode) {
    _banner.parentNode.removeChild(_banner);
  }
  if (_highlight?.parentNode) {
    _highlight.parentNode.removeChild(_highlight);
  }
  _banner = null;
  _status = null;
  _highlight = null;
  _current = null;
  document.documentElement.classList.remove(OVERLAY_CLASS);
  _callbacks = null;
  // devolve o foco a quem o tinha (o banner focado some junto)
  if (wasActive && _prevFocus?.isConnected) _prevFocus.focus?.();
  _prevFocus = null;
}
