/**
 * CSS factory functions for Modo Simples.
 *
 * Two separate style sets:
 *  1. getUIStyles(position)  â†’ injected inside Shadow DOM (UI isolation)
 *  2. getPageStyles()        â†’ injected into host page <head> (scoped under
 *                              html.ms-ativo, dormant when inactive)
 */

/**
 * CSS for the radial menu UI inside Shadow DOM.
 *
 * Architecture:
 *   :host covers full viewport (pointer-events:none)
 *   #ms-radial-root anchors the central button + items (pointer-events:auto)
 *
 * Radial item positioning:
 *   Each item uses CSS custom property --ms-angle (degrees) set inline.
 *   translateX(var(--ms-radius)) rotates the item to its arc position.
 *   The label rotates back to stay readable.
 *
 * @param {'bottom-right'|'bottom-left'|'top-right'|'top-left'} position
 * @returns {string}
 */
export function getUIStyles(position = 'bottom-right') {
  const isBottom = position.startsWith('bottom');
  const isRight  = position.endsWith('right');

  const rootCorner = [
    isBottom ? 'bottom:1.5rem;' : 'top:1.5rem;',
    isRight  ? 'right:1.5rem;' : 'left:1.5rem;',
  ].join('');

  const RADIUS    = 95;   // px â€” distÃ¢ncia do centro ao meio do item
  const BTN_SIZE  = 60;   // px â€” diÃ¢metro do botÃ£o central
  const ITEM_SIZE = 52;   // px â€” diÃ¢metro de cada item radial

  return `
    /* â”€â”€ Host â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

    /* â”€â”€ Radial root â€” Ã¢ncora de posicionamento â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    #ms-radial-root {
      position: absolute;
      ${rootCorner}
      width: ${BTN_SIZE}px;
      height: ${BTN_SIZE}px;
      pointer-events: none;
    }

    /* â”€â”€ BotÃ£o central â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    #ms-central-btn {
      position: absolute;
      inset: 0;
      width: ${BTN_SIZE}px;
      height: ${BTN_SIZE}px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.5);
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1px;
      padding: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.15);
      transition:
        background 0.22s ease,
        transform 0.18s ease,
        box-shadow 0.18s ease;
      z-index: 2;
      /* Estado padrÃ£o: OFF = vermelho */
      background: #dc2626;
      color: #fff;
    }

    /* Estado ON â€” verde */
    #ms-central-btn.ms-central--on {
      background: #16a34a;
    }

    /* Anel de abertura (radial aberto) */
    #ms-central-btn.ms-central--open {
      box-shadow:
        0 0 0 6px rgba(255,255,255,0.15),
        0 4px 20px rgba(0,0,0,0.28);
    }

    #ms-central-btn:hover { transform: scale(1.1); }
    #ms-central-btn:active { transform: scale(0.96); }

    #ms-central-btn:focus-visible {
      outline: 3px solid #fbbf24;
      outline-offset: 4px;
    }

    /* Label compacta visÃ­vel (nÃ£o apenas cor para indicar estado) */
    .ms-central-label {
      font-size: 0.55rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1;
      color: rgba(255,255,255,0.9);
    }

    .ms-central-icon svg { display: block; }

    /* â”€â”€ Menu radial (container dos itens) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    #ms-radial-menu {
      position: absolute;
      /* Centralizado sobre o botÃ£o central */
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 0;
      height: 0;
      pointer-events: none;
    }

    #ms-radial-menu[hidden] { display: block !important; visibility: hidden; pointer-events: none; }
    /* Quando nÃ£o estÃ¡ hidden â€” ativo */
    #ms-radial-menu:not([hidden]) { visibility: visible; pointer-events: none; }

    /* â”€â”€ Item radial â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .ms-radial-item {
      position: absolute;
      /* PivÃ´ no centro do menu */
      top: -${ITEM_SIZE / 2}px;
      left: -${ITEM_SIZE / 2}px;
      width: ${ITEM_SIZE}px;
      height: ${ITEM_SIZE}px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.18);
      background: #1e293b;
      color: #e2e8f0;
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.32);

      /* Posicionamento pelo Ã¢ngulo â€” cada item recebe --ms-angle via JS */
      transform:
        rotate(var(--ms-angle))
        translateX(${RADIUS}px)
        rotate(calc(-1 * var(--ms-angle)));

      /* AnimaÃ§Ã£o de entrada */
      opacity: 0;
      scale: 0.4;
      transition:
        opacity 0.22s ease,
        scale 0.22s ease,
        background 0.15s ease,
        transform 0.15s ease,
        border-color 0.15s ease;
    }

    /* Itens visÃ­veis quando menu estÃ¡ aberto */
    #ms-radial-menu:not([hidden]) .ms-radial-item {
      opacity: 1;
      scale: 1;
    }

    /* Delay escalonado por ordem de filho */
    #ms-radial-menu:not([hidden]) .ms-radial-item:nth-child(1) { transition-delay: 0.00s; }
    #ms-radial-menu:not([hidden]) .ms-radial-item:nth-child(2) { transition-delay: 0.03s; }
    #ms-radial-menu:not([hidden]) .ms-radial-item:nth-child(3) { transition-delay: 0.06s; }
    #ms-radial-menu:not([hidden]) .ms-radial-item:nth-child(4) { transition-delay: 0.09s; }
    #ms-radial-menu:not([hidden]) .ms-radial-item:nth-child(5) { transition-delay: 0.12s; }
    #ms-radial-menu:not([hidden]) .ms-radial-item:nth-child(6) { transition-delay: 0.15s; }
    #ms-radial-menu:not([hidden]) .ms-radial-item:nth-child(7) { transition-delay: 0.18s; }
    #ms-radial-menu:not([hidden]) .ms-radial-item:nth-child(8) { transition-delay: 0.21s; }

    .ms-radial-item:hover {
      background: #334155;
      border-color: rgba(255,255,255,0.35);
      transform:
        rotate(var(--ms-angle))
        translateX(${RADIUS + 5}px)
        rotate(calc(-1 * var(--ms-angle)))
        scale(1.08);
    }

    .ms-radial-item:active {
      transform:
        rotate(var(--ms-angle))
        translateX(${RADIUS}px)
        rotate(calc(-1 * var(--ms-angle)))
        scale(0.95);
    }

    /* Estado ON do item */
    .ms-radial-item.ms-item--on {
      background: #1d4ed8;
      border-color: rgba(147,197,253,0.5);
      color: #fff;
    }

    .ms-radial-item:focus-visible {
      outline: 3px solid #fbbf24;
      outline-offset: 3px;
    }

    /* Ãcone e label dentro do item */
    .ms-item-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }

    .ms-item-label {
      font-size: 0.47rem;
      font-weight: 700;
      text-align: center;
      line-height: 1.1;
      letter-spacing: 0.01em;
      max-width: 44px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: currentColor;
    }

    /* â”€â”€ Painel de ajuda â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    #ms-help-panel {
      position: absolute;
      ${isBottom ? 'bottom: calc(' + BTN_SIZE + 'px + 8rem);' : 'top: calc(' + BTN_SIZE + 'px + 2rem);'}
      ${isRight  ? 'right: 0;' : 'left: 0;'}
      width: 280px;
      background: #1e293b;
      color: #e2e8f0;
      border-radius: 14px;
      padding: 1.25rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      pointer-events: auto;
      font-size: 0.82rem;
      line-height: 1.55;
    }

    #ms-help-panel[hidden] { display: none; }

    #ms-help-panel h3 {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: #f8fafc;
    }

    #ms-help-panel p { margin: 0 0 0.5rem; }
    #ms-help-panel p:last-child { margin: 0; }

    .ms-help-close {
      position: absolute;
      top: 0.6rem;
      right: 0.6rem;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ms-help-close:hover { color: #f8fafc; background: rgba(255,255,255,0.1); }
    .ms-help-close:focus-visible { outline: 3px solid #fbbf24; outline-offset: 2px; }

    /* â”€â”€ Reduced motion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    @media (prefers-reduced-motion: reduce) {
      #ms-central-btn,
      .ms-radial-item {
        transition: none !important;
        transition-delay: 0s !important;
      }
    }
  `;
}

/**
 * CSS injected into the host page <head> to apply Modo Simples visual effects.
 * All selectors gated on html.ms-ativo â€” inert when Modo Simples is off.
 *
 * @returns {string}
 */
export function getPageStyles() {
  return `
    /* â”€â”€ Hidden distractions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    html.ms-ativo [data-ms-hidden="true"] {
      display: none !important;
      visibility: hidden !important;
    }

    /* â”€â”€ Main content: readable column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    html.ms-ativo [data-ms-principal] {
      display: block !important;
      max-width: 75ch !important;
      margin-inline: auto !important;
      padding-inline: 1.5rem !important;
      font-size: 1.125rem !important;
      line-height: 1.8 !important;
    }

    /* â”€â”€ Stop page animations when reduced-motion is active â”€â”€â”€ */
    html.ms-ativo.ms-reduced-motion *,
    html.ms-ativo.ms-reduced-motion *::before,
    html.ms-ativo.ms-reduced-motion *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }

    /* â”€â”€ High contrast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    html.ms-ativo.ms-high-contrast [data-ms-principal],
    html.ms-ativo.ms-high-contrast [data-ms-principal] * {
      background-color: #ffffff !important;
      color: #000000 !important;
    }

    html.ms-ativo.ms-high-contrast a,
    html.ms-ativo.ms-high-contrast a:visited {
      color: #00008b !important;
    }

    /* â”€â”€ Larger text â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    html.ms-ativo.ms-larger-text [data-ms-principal] {
      font-size: 1.375rem !important;
      line-height: 2 !important;
    }

    /* â”€â”€ Highlight links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    html.ms-ativo.ms-highlight-links a:not([data-ms-hidden]) {
      text-decoration: underline !important;
      text-decoration-thickness: 2px !important;
      text-underline-offset: 3px !important;
      outline: 1px dashed currentColor !important;
      outline-offset: 2px !important;
    }

    /* â”€â”€ Dyslexia-friendly font â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    html.ms-ativo.ms-dyslexia-font [data-ms-principal],
    html.ms-ativo.ms-dyslexia-font [data-ms-principal] * {
      font-family:
        'Atkinson Hyperlegible',
        'Arial',
        'Helvetica Neue',
        'Verdana',
        system-ui,
        sans-serif !important;
      word-spacing: 0.12em !important;
    }

    /* â”€â”€ Text spacing (WCAG 1.4.12) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    html.ms-ativo.ms-text-spacing [data-ms-principal],
    html.ms-ativo.ms-text-spacing [data-ms-principal] p,
    html.ms-ativo.ms-text-spacing [data-ms-principal] li {
      line-height: 2 !important;
      letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important;
    }

    html.ms-ativo.ms-text-spacing [data-ms-principal] p {
      margin-bottom: 1.5em !important;
    }

    /* â”€â”€ Hide decorative images â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    html.ms-ativo.ms-hide-images img[alt=""],
    html.ms-ativo.ms-hide-images img[role="presentation"],
    html.ms-ativo.ms-hide-images [data-ms-deco-img] {
      visibility: hidden !important;
      opacity: 0 !important;
    }
  `;
}
