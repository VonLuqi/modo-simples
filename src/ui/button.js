/**
 * Floating accessibility button.
 *
 * Rendered inside the Shadow DOM so its styles are fully isolated.
 * The button uses a human-figure SVG (universal-access icon) which is
 * aria-hidden — the accessible name comes from the button's aria-label.
 *
 * Accessibility checklist:
 *   ✓ Native <button> — keyboard-operable by default (Enter/Space)
 *   ✓ aria-label — provides accessible name
 *   ✓ aria-expanded — synced with panel state
 *   ✓ aria-haspopup="dialog" — announces that it opens a dialog
 *   ✓ :focus-visible ring — visible keyboard focus indicator (CSS in styles.js)
 */

/**
 * Creates the floating button element.
 *
 * @returns {{ element: HTMLButtonElement, setExpanded: (value: boolean) => void }}
 */
export function createFloatingButton() {
  const btn = document.createElement('button');
  btn.id = 'ms-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Opções de acessibilidade');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-haspopup', 'dialog');

  // SVG: simplified universal-access figure (WCAG icon pattern)
  btn.innerHTML = `
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="currentColor"
    >
      <circle cx="12" cy="4.5" r="2.5"/>
      <path d="M18 9.5a1 1 0 0 0-1-1h-4.2l-.3-1H15a1 1 0 0 0 0-2H9a1 1 0 0 0 0 2h1l.5 2.5H7a1 1 0 0 0 0 2h3.1l-.9 4.3a1 1 0 0 0 .8 1.2 1 1 0 0 0 1.1-.8l1-4.7H14l1 4.7a1 1 0 0 0 1 .8 1 1 0 0 0 .2 0 1 1 0 0 0 .8-1.2l-1-4.8H17a1 1 0 0 0 1-1z"/>
    </svg>
  `;

  return {
    element: btn,

    /**
     * Sync aria-expanded with panel open/closed state.
     * @param {boolean} value
     */
    setExpanded(value) {
      btn.setAttribute('aria-expanded', String(value));
    },
  };
}
