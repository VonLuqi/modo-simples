/**
 * features/readingRuler.js
 *
 * Overlay bar that follows the pointer (mouse/touch/pen) or the focused element
 * to guide reading focus (TDAH aid). Stays hidden until a position is known, so
 * the page is never dimmed without a readable window (IMP-08).
 */

const RULER_ID = 'ms-reading-ruler';
const RULER_HEIGHT = 48; // px

/** @type {HTMLElement|null} */
let _ruler = null;
/** @type {number|null} */
let _raf = null;
/** @type {number} */
let _pendingY = 0;
/** @type {((e: Event) => void)|null} */
let _onPointer = null;
/** @type {((e: Event) => void)|null} */
let _onTouch = null;
/** @type {((e: Event) => void)|null} */
let _onFocus = null;

/**
 * @param {number} clientY center of the reading window
 */
function moveTo(clientY) {
  _pendingY = clientY;
  if (_raf !== null) return;
  _raf = requestAnimationFrame(() => {
    _raf = null;
    if (!_ruler) return;
    const y = _pendingY - RULER_HEIGHT / 2;
    _ruler.style.transform = `translateY(${Math.max(0, y)}px)`;
    _ruler.style.visibility = 'visible';
  });
}

/**
 * Start the reading ruler overlay.
 */
export function startReadingRuler() {
  if (_ruler) return;

  _ruler = document.createElement('div');
  _ruler.id = RULER_ID;
  _ruler.setAttribute('aria-hidden', 'true');
  Object.assign(_ruler.style, {
    position: 'fixed',
    left: '0',
    right: '0',
    top: '0',
    height: `${RULER_HEIGHT}px`,
    pointerEvents: 'none',
    zIndex: '2147483646',
    background: 'rgba(245, 166, 35, 0.22)',
    borderTop: '2px solid #F5A623',
    borderBottom: '2px solid #F5A623',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)',
    transform: 'translateY(-100%)',
    transition: 'none',
    // sem posição conhecida não há janela: não escurece a página (IMP-08)
    visibility: 'hidden',
  });
  document.documentElement.appendChild(_ruler);

  _onPointer = (e) => moveTo(e.clientY);
  _onTouch = (e) => {
    const t = e.touches?.[0];
    if (t) moveTo(t.clientY);
  };
  // teclado/leitor de tela: a janela acompanha o elemento focado
  _onFocus = (e) => {
    const el = e.target;
    if (!el?.getBoundingClientRect || el === document.body) return;
    const r = el.getBoundingClientRect();
    moveTo(r.top + r.height / 2);
  };

  document.addEventListener('pointermove', _onPointer, { passive: true });
  document.addEventListener('touchstart', _onTouch, { passive: true });
  document.addEventListener('touchmove', _onTouch, { passive: true });
  document.addEventListener('focusin', _onFocus);
}

/**
 * Stop and remove the reading ruler overlay.
 */
export function stopReadingRuler() {
  if (_onPointer) {
    document.removeEventListener('pointermove', _onPointer);
    _onPointer = null;
  }
  if (_onTouch) {
    document.removeEventListener('touchstart', _onTouch);
    document.removeEventListener('touchmove', _onTouch);
    _onTouch = null;
  }
  if (_onFocus) {
    document.removeEventListener('focusin', _onFocus);
    _onFocus = null;
  }
  if (_raf !== null) {
    cancelAnimationFrame(_raf);
    _raf = null;
  }
  if (_ruler?.parentNode) {
    _ruler.parentNode.removeChild(_ruler);
  }
  _ruler = null;
}
