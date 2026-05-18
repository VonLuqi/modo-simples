import { createToggle } from './toggle.js';
import { trapFocus, getFocusable } from '../utils/focus.js';

/**
 * Accessibility options panel (dialog).
 *
 * Accessibility checklist:
 *   ✓ role="dialog" + aria-modal="true" — AT announces modal context
 *   ✓ aria-labelledby → #ms-panel-title — dialog has an accessible name
 *   ✓ Focus trap — Tab key cycles within the panel while it's open
 *   ✓ Esc key handled by the parent orchestrator (modo-simples.js)
 *   ✓ Focus returns to trigger button on close (handled by caller)
 *   ✓ First focusable element receives focus on open
 *   ✓ [hidden] attribute toggles visibility — AT-safe alternative to CSS-only
 *
 * @param {Object} params
 * @param {Object}   params.state                  Current state snapshot
 * @param {Function} params.onToggleModoSimples     (checked: boolean) => void
 * @param {Function} params.onToggleHighContrast    (checked: boolean) => void
 * @param {Function} params.onToggleLargerText      (checked: boolean) => void
 * @param {Function} params.onClose                 () => void
 *
 * @returns {{
 *   element: HTMLDivElement,
 *   open: () => void,
 *   close: () => void,
 *   updateToggles: (state: Object) => void
 * }}
 */
export function createPanel({
  state,
  onToggleModoSimples,
  onToggleHighContrast,
  onToggleLargerText,
  onClose,
}) {
  const panel = document.createElement('div');
  panel.id = 'ms-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'ms-panel-title');
  panel.hidden = true;

  // ── Header ────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'ms-panel-header';

  const title = document.createElement('h2');
  title.id = 'ms-panel-title';
  title.textContent = 'Acessibilidade';

  const closeBtn = document.createElement('button');
  closeBtn.id = 'ms-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Fechar painel de acessibilidade');
  closeBtn.innerHTML = `
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `;
  closeBtn.addEventListener('click', onClose);

  header.appendChild(title);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // ── Toggles ───────────────────────────────────────────────────
  const list = document.createElement('ul');
  list.setAttribute('role', 'list');
  list.style.cssText = 'margin:0;padding:0;list-style:none;';

  const modoSimplesToggle = createToggle({
    id: 'ms-toggle-modo-simples',
    label: 'Modo Simples',
    description: 'Remove distrações e foca no conteúdo principal',
    checked: state.modoSimples,
    onChange: onToggleModoSimples,
  });

  const highContrastToggle = createToggle({
    id: 'ms-toggle-high-contrast',
    label: 'Alto Contraste',
    description: 'Aumenta o contraste para melhor legibilidade',
    checked: state.options.highContrast,
    onChange: onToggleHighContrast,
  });

  const largerTextToggle = createToggle({
    id: 'ms-toggle-larger-text',
    label: 'Texto Maior',
    description: 'Aumenta o tamanho da fonte do conteúdo principal',
    checked: state.options.largerText,
    onChange: onToggleLargerText,
  });

  // Wrap each row in <li> for proper list semantics
  [modoSimplesToggle, highContrastToggle, largerTextToggle].forEach((t) => {
    const li = document.createElement('li');
    li.appendChild(t.element);
    list.appendChild(li);
  });

  panel.appendChild(list);

  // ── Footer ────────────────────────────────────────────────────
  const footer = document.createElement('p');
  footer.className = 'ms-panel-footer';
  footer.textContent = 'Modo Simples — Acessibilidade Web';
  panel.appendChild(footer);

  // ── Focus trap management ─────────────────────────────────────
  let removeTrap = null;

  return {
    element: panel,

    /** Open the panel, activate focus trap, move focus to first control. */
    open() {
      panel.hidden = false;
      removeTrap = trapFocus(panel);

      // Defer focus so the browser renders the panel before we move focus
      setTimeout(() => {
        const focusable = getFocusable(panel);
        if (focusable.length) focusable[0].focus();
      }, 0);
    },

    /** Close the panel and release the focus trap. */
    close() {
      panel.hidden = true;
      if (removeTrap) {
        removeTrap();
        removeTrap = null;
      }
    },

    /**
     * Sync toggle visual states to a new state snapshot.
     * Called by the orchestrator on every stateChange event.
     * @param {Object} s State snapshot
     */
    updateToggles(s) {
      modoSimplesToggle.setChecked(s.modoSimples);
      highContrastToggle.setChecked(s.options.highContrast);
      largerTextToggle.setChecked(s.options.largerText);
    },
  };
}
