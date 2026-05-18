/**
 * CSS factory functions for Modo Simples.
 *
 * Two separate style sets:
 *  1. getUIStyles(position)  → injected inside Shadow DOM (UI isolation)
 *  2. getPageStyles()        → injected into host page <head> (scoped under
 *                              html.ms-ativo, dormant when inactive)
 *
 * Trade-off on !important in getPageStyles:
 *   Necessary to override unknown host-page specificity. Risk is minimised
 *   because every rule requires the `html.ms-ativo` prefix — the styles
 *   are completely inert on pages where Modo Simples is never activated.
 */

/**
 * CSS for the Shadow DOM host content: floating button + panel.
 *
 * Architecture:
 *   :host is position:fixed covering the full viewport with pointer-events:none
 *   so it never blocks page interactions. The button and panel re-enable
 *   pointer-events individually.
 *
 * @param {'bottom-right'|'bottom-left'|'top-right'|'top-left'} position
 * @returns {string} CSS text
 */
export function getUIStyles(position = 'bottom-right') {
  const btnCorner = {
    'bottom-right': 'bottom:1.5rem;right:1.5rem;',
    'bottom-left': 'bottom:1.5rem;left:1.5rem;',
    'top-right': 'top:1.5rem;right:1.5rem;',
    'top-left': 'top:1.5rem;left:1.5rem;',
  }[position] ?? 'bottom:1.5rem;right:1.5rem;';

  const isBottom = position.startsWith('bottom');
  const isRight = position.endsWith('right');

  const panelVertical = isBottom
    ? 'bottom:calc(1.5rem + 52px + 0.625rem);'
    : 'top:calc(1.5rem + 52px + 0.625rem);';
  const panelHorizontal = isRight ? 'right:1.5rem;' : 'left:1.5rem;';

  return `
    /* ── Host container ─────────────────────────────────────── */
    :host {
      all: initial;
      display: block;
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483647;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #1a1a1a;
      box-sizing: border-box;
    }

    *, *::before, *::after { box-sizing: inherit; }

    /* ── Floating button ─────────────────────────────────────── */
    #ms-btn {
      position: absolute;
      ${btnCorner}
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 2px solid transparent;
      background: #1a56db;
      color: #fff;
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.22);
      transition: background 0.18s ease, transform 0.18s ease;
      padding: 0;
    }

    #ms-btn:hover { background: #1e429f; transform: scale(1.08); }

    /* Visible focus indicator complying with WCAG 2.4.11 (Focus Appearance) */
    #ms-btn:focus-visible {
      outline: 3px solid #fbbf24;
      outline-offset: 3px;
    }

    /* ── Accessibility panel ─────────────────────────────────── */
    #ms-panel {
      position: absolute;
      ${panelVertical}
      ${panelHorizontal}
      width: 308px;
      max-height: 80vh;
      overflow-y: auto;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08);
      pointer-events: auto;
      padding: 1.25rem;
    }

    #ms-panel[hidden] { display: none; }

    /* Panel header */
    .ms-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
      gap: 0.5rem;
    }

    #ms-panel-title {
      font-size: 1rem;
      font-weight: 700;
      margin: 0;
      color: #111827;
      flex: 1;
    }

    /* Close button */
    #ms-close {
      background: none;
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      padding: 0.25rem;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s;
    }

    #ms-close:hover { background: #f3f4f6; color: #111827; }

    #ms-close:focus-visible {
      outline: 3px solid #1a56db;
      outline-offset: 2px;
    }

    /* ── Toggle rows ─────────────────────────────────────────── */
    .ms-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.7rem 0;
      gap: 0.75rem;
    }

    .ms-toggle-row + .ms-toggle-row { border-top: 1px solid #f3f4f6; }

    .ms-toggle-label {
      flex: 1;
      cursor: pointer;
    }

    .ms-toggle-label strong {
      display: block;
      font-size: 0.9rem;
      font-weight: 600;
      color: #111827;
    }

    .ms-toggle-label span {
      display: block;
      font-size: 0.775rem;
      color: #6b7280;
      margin-top: 0.1rem;
    }

    /* Switch component — native checkbox visually hidden, custom track shown */
    .ms-switch { position: relative; flex-shrink: 0; }

    .ms-switch input[type="checkbox"] {
      /* Accessible: visible to AT but not sighted users */
      position: absolute;
      opacity: 0;
      width: 44px;
      height: 24px;
      margin: 0;
      cursor: pointer;
      z-index: 1;
    }

    .ms-switch-track {
      display: block;
      width: 44px;
      height: 24px;
      border-radius: 12px;
      background: #d1d5db;
      position: relative;
      transition: background 0.18s ease;
      pointer-events: none;
    }

    /* Thumb */
    .ms-switch-track::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
      transition: transform 0.18s ease;
    }

    .ms-switch input:checked + .ms-switch-track { background: #1a56db; }
    .ms-switch input:checked + .ms-switch-track::after { transform: translateX(20px); }

    /* Focus ring on the invisible checkbox transfers to the visible track */
    .ms-switch input:focus-visible + .ms-switch-track {
      outline: 3px solid #fbbf24;
      outline-offset: 2px;
    }

    /* ── Panel footer ────────────────────────────────────────── */
    .ms-panel-footer {
      margin-top: 1rem;
      padding-top: 0.625rem;
      border-top: 1px solid #e5e7eb;
      font-size: 0.7rem;
      color: #9ca3af;
      text-align: center;
    }

    /* ── Reduced motion: disable all UI animations ───────────── */
    @media (prefers-reduced-motion: reduce) {
      #ms-btn,
      .ms-switch-track,
      .ms-switch-track::after {
        transition: none;
      }
    }
  `;
}

/**
 * CSS injected into the host page <head> to apply Modo Simples visual effects.
 *
 * All selectors are gated on `html.ms-ativo` — no style applies when Modo
 * Simples is off, regardless of which site the script is running on.
 *
 * @returns {string} CSS text
 */
export function getPageStyles() {
  return `
    /* ── Hidden distractions ─────────────────────────────────── */
    html.ms-ativo [data-ms-hidden="true"] {
      display: none !important;
      visibility: hidden !important;
    }

    /* ── Main content: readable column ──────────────────────── */
    html.ms-ativo [data-ms-principal] {
      display: block !important;
      max-width: 75ch !important;
      margin-inline: auto !important;
      padding-inline: 1.5rem !important;
      font-size: 1.125rem !important;
      line-height: 1.8 !important;
    }

    /* ── Stop page animations when reduced-motion is active ─── */
    @media (prefers-reduced-motion: reduce) {
      html.ms-ativo *,
      html.ms-ativo *::before,
      html.ms-ativo *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* ── High contrast option ────────────────────────────────── */
    html.ms-ativo.ms-high-contrast [data-ms-principal],
    html.ms-ativo.ms-high-contrast [data-ms-principal] * {
      background-color: #ffffff !important;
      color: #000000 !important;
    }

    /* ── Larger text option ──────────────────────────────────── */
    html.ms-ativo.ms-larger-text [data-ms-principal] {
      font-size: 1.375rem !important;
      line-height: 2 !important;
    }
  `;
}
