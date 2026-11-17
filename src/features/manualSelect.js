/**
 * features/manualSelect.js
 *
 * When heuristic confidence is low, show a banner prompting the user to click
 * the main content. One click sets data-ms-principal and returns a CSS path.
 */

const BANNER_ID = 'ms-manual-select-banner';
const OVERLAY_CLASS = 'ms-manual-select-active';

/** @type {HTMLElement|null} */
let _banner = null;
/** @type {((e: MouseEvent) => void)|null} */
let _onClick = null;
/** @type {((e: KeyboardEvent) => void)|null} */
let _onKey = null;
/** @type {((e: Event) => void)|null} */
let _onPointer = null;
/** @type {{ onSelect?: Function, onCancel?: Function }|null} */
let _callbacks = null;

const POINTER_EVENTS = ['pointerdown', 'pointerup', 'mousedown', 'mouseup'];

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

/**
 * Start manual main-content selection mode.
 * @param {{ onSelect?: (el: Element, path: string) => void, onCancel?: () => void }} [opts]
 */
export function startManualSelect(opts = {}) {
  stopManualSelect();
  _callbacks = opts;

  _banner = document.createElement('div');
  _banner.id = BANNER_ID;
  _banner.setAttribute('role', 'status');
  _banner.setAttribute('aria-live', 'polite');
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
  _banner.textContent = 'Clique no conteúdo principal';

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
  document.documentElement.classList.add(OVERLAY_CLASS);

  _onClick = (e) => {
    // Ignore clicks on our own UI host / banner
    if (
      e.target.closest?.('#ms-container') ||
      e.target.closest?.(`#${BANNER_ID}`)
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // nenhum outro listener de captura do documento vê o clique (IMP-29)

    const el = e.target;
    if (!el || el === document.documentElement || el === document.body) return;

    // Clear previous principal markers
    document.querySelectorAll('[data-ms-principal]').forEach((node) => {
      node.removeAttribute('data-ms-principal');
    });
    el.setAttribute('data-ms-principal', '');

    const path = buildCssPath(el);
    const cb = _callbacks?.onSelect;
    stopManualSelect();
    if (cb) cb(el, path);
  };

  _onKey = (e) => {
    if (e.key === 'Escape') {
      // consome o Esc: não fecha o painel nem diálogos do host junto (IMP-29)
      e.preventDefault();
      e.stopImmediatePropagation();
      const cb = _callbacks?.onCancel;
      stopManualSelect();
      if (cb) cb();
    }
  };

  // mousedown/pointerdown/mouseup também não podem acionar menus do host durante a escolha
  _onPointer = (e) => {
    if (
      e.target.closest?.('#ms-container') ||
      e.target.closest?.(`#${BANNER_ID}`)
    ) {
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
  };

  document.addEventListener('click', _onClick, true);
  document.addEventListener('keydown', _onKey, true);
  for (const type of POINTER_EVENTS) {
    document.addEventListener(type, _onPointer, true);
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
  if (_onClick) {
    document.removeEventListener('click', _onClick, true);
    _onClick = null;
  }
  if (_onKey) {
    document.removeEventListener('keydown', _onKey, true);
    _onKey = null;
  }
  if (_onPointer) {
    for (const type of POINTER_EVENTS) {
      document.removeEventListener(type, _onPointer, true);
    }
    _onPointer = null;
  }
  if (_banner?.parentNode) {
    _banner.parentNode.removeChild(_banner);
  }
  _banner = null;
  document.documentElement.classList.remove(OVERLAY_CLASS);
  _callbacks = null;
}
