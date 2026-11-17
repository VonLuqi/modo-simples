/**
 * Focus management utilities for accessible modal/dialog behaviour.
 *
 * Designed to work correctly with elements inside Shadow DOM: uses
 * `ShadowRoot.activeElement` when the container lives in a shadow tree,
 * falling back to `document.activeElement` for regular DOM.
 */

/** CSS selector matching all keyboard-focusable element types. */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Returns all currently visible, keyboard-focusable descendants of a container.
 *
 * Filters out elements inside [hidden] ancestors or with zero bounding rect
 * (display:none, visibility:hidden, etc.).
 *
 * @param {Element} container
 * @returns {Element[]}
 */
export function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.closest('[hidden]') && el.getBoundingClientRect().width > 0,
  );
}

/**
 * Constrain keyboard Tab focus to within `container`.
 *
 * Works with Shadow DOM: calls getRootNode() to get the ShadowRoot (if any)
 * and reads ShadowRoot.activeElement to find the true focused element.
 *
 * @param {Element} container — the dialog/panel element to trap focus within
 * @returns {Function} Cleanup function — call it to remove the trap
 */
export function trapFocus(container) {
  function handleKeydown(e) {
    if (e.key !== 'Tab') return;

    const focusable = getFocusable(container);
    if (!focusable.length) return;

    const root = container.getRootNode();
    // When inside a shadow root, shadowRoot.activeElement holds the real focus
    const active =
      root instanceof ShadowRoot ? root.activeElement : document.activeElement;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Foco fora do painel (clicou na página e deu Tab) ou no próprio contêiner:
    // Tab entra pelo primeiro, Shift+Tab pelo último (UX-13)
    if (!active || active === container || !container.contains(active)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
      return;
    }

    if (focusable.length < 2) return; // Nothing meaningful to trap

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // No document (não no contêiner): só assim o Tab com foco fora do painel é visto
  document.addEventListener('keydown', handleKeydown);
  return () => document.removeEventListener('keydown', handleKeydown);
}
