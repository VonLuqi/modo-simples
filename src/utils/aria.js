/**
 * Minimal ARIA helpers.
 *
 * Rule: only use these when native HTML semantics cannot express the state.
 * Prefer semantic elements (<button>, <nav>, <main>) over ARIA attributes.
 */

/**
 * Set aria-expanded (for disclosure widgets like the panel button).
 * @param {Element} el
 * @param {boolean} value
 */
export function setExpanded(el, value) {
  el.setAttribute('aria-expanded', String(value));
}

/**
 * Set aria-pressed (for toggle buttons).
 * @param {Element} el
 * @param {boolean} value
 */
export function setPressed(el, value) {
  el.setAttribute('aria-pressed', String(value));
}

/**
 * Add or remove aria-hidden.
 * Use only on decorative/duplicated content; never on focusable elements.
 * @param {Element} el
 * @param {boolean} value
 */
export function setHidden(el, value) {
  if (value) {
    el.setAttribute('aria-hidden', 'true');
  } else {
    el.removeAttribute('aria-hidden');
  }
}

/**
 * Inject a visually-hidden live region to announce a message to screen readers.
 *
 * The node is self-cleaning: it removes itself 3 s after announcement so
 * repeated calls don't pile up in the DOM.
 *
 * @param {string} message
 * @param {'polite'|'assertive'} [politeness='polite']
 */
export function announce(message, politeness = 'polite') {
  const live = document.createElement('div');
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', politeness);
  live.setAttribute('aria-atomic', 'true');

  // Visually hidden but accessible to AT
  live.style.cssText =
    'position:absolute;width:1px;height:1px;overflow:hidden;' +
    'clip:rect(0,0,0,0);white-space:nowrap;border:0;';

  document.body.appendChild(live);

  // Small defer so AT can detect the node insertion before text is set
  setTimeout(() => {
    live.textContent = message;
    setTimeout(() => {
      if (live.parentNode) live.parentNode.removeChild(live);
    }, 3000);
  }, 50);
}
