/**
 * features/readingRuler.js
 *
 * Overlay bar that follows the mouse Y position to guide reading focus (TDAH aid).
 */

const RULER_ID = 'ms-reading-ruler';
const RULER_HEIGHT = 48; // px

/** @type {HTMLElement|null} */
let _ruler = null;
/** @type {((e: MouseEvent) => void)|null} */
let _onMove = null;

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
  });
  document.documentElement.appendChild(_ruler);

  _onMove = (e) => {
    if (!_ruler) return;
    const y = e.clientY - RULER_HEIGHT / 2;
    _ruler.style.transform = `translateY(${Math.max(0, y)}px)`;
  };

  document.addEventListener('mousemove', _onMove, { passive: true });
}

/**
 * Stop and remove the reading ruler overlay.
 */
export function stopReadingRuler() {
  if (_onMove) {
    document.removeEventListener('mousemove', _onMove);
    _onMove = null;
  }
  if (_ruler?.parentNode) {
    _ruler.parentNode.removeChild(_ruler);
  }
  _ruler = null;
}
