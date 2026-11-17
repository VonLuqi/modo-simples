/**
 * User preference media-query wrappers.
 *
 * Centralising here avoids duplicated matchMedia calls and makes
 * unit-testing easier — tests can mock this module instead of window.matchMedia.
 *
 * Sem window.matchMedia (ambiente antigo/restrito) assume "o usuário não pediu" (doc/13).
 * MediaQueryList antigo (Safari < 14) só tem addListener/removeListener (IMP-28).
 */

/**
 * @param {string} query
 * @returns {MediaQueryList|null} null quando o ambiente não tem matchMedia
 */
function match(query) {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
    ? window.matchMedia(query)
    : null;
}

/**
 * Returns true when the user has requested reduced motion at OS level.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  const mq = match('(prefers-reduced-motion: reduce)');
  return !!(mq && mq.matches);
}

/**
 * Returns true when the user has requested higher contrast at OS level.
 * @returns {boolean}
 */
export function prefersHighContrast() {
  const mq = match('(prefers-contrast: more)');
  return !!(mq && mq.matches);
}

/**
 * Register a callback that fires whenever the prefers-reduced-motion value
 * changes (e.g. user toggles the OS setting while the page is open).
 *
 * @param {Function} callback — receives the MediaQueryListEvent
 * @returns {Function} Unsubscribe function
 */
export function onReducedMotionChange(callback) {
  const mq = match('(prefers-reduced-motion: reduce)');
  if (!mq) return () => {};
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', callback);
    return () => mq.removeEventListener('change', callback);
  }
  if (typeof mq.addListener === 'function') {
    mq.addListener(callback);
    return () => mq.removeListener(callback);
  }
  return () => {};
}
