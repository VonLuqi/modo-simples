/**
 * User preference media-query wrappers.
 *
 * Centralising here avoids duplicated matchMedia calls and makes
 * unit-testing easier — tests can mock this module instead of window.matchMedia.
 */

/**
 * Returns true when the user has requested reduced motion at OS level.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns true when the user has requested higher contrast at OS level.
 * @returns {boolean}
 */
export function prefersHighContrast() {
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Register a callback that fires whenever the prefers-reduced-motion value
 * changes (e.g. user toggles the OS setting while the page is open).
 *
 * @param {Function} callback — receives the MediaQueryListEvent
 * @returns {Function} Unsubscribe function
 */
export function onReducedMotionChange(callback) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}
