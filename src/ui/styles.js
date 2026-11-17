/**
 * CSS factory functions for Modo Simples.
 *
 * Two separate style sets:
 *  1. getUIStyles(position)  → injected inside Shadow DOM (panel + FAB)
 *  2. getPageStyles()        → injected into host page <head>
 */

/**
 * CSS for the accessibility panel + FAB inside Shadow DOM.
 *
 * @param {'bottom-right'|'bottom-left'|'top-right'|'top-left'} position
 * @returns {string}
 */
export function getUIStyles(position = 'bottom-right') {
  const isBottom = position.startsWith('bottom');
  const isRight = position.endsWith('right');

  const fabCorner = [
    isBottom
      ? 'bottom: calc(1.5 * var(--ms-u));'
      : 'top: calc(1.5 * var(--ms-u));',
    isRight
      ? 'right: calc(1.5 * var(--ms-u));'
      : 'left: calc(1.5 * var(--ms-u));',
  ].join('');

  const panelCorner = [
    isBottom
      ? 'bottom: calc(calc(1.5 * var(--ms-u)) + 100px);'
      : 'top: calc(calc(1.5 * var(--ms-u)) + 100px);',
    isRight
      ? 'right: calc(1.5 * var(--ms-u));'
      : 'left: calc(1.5 * var(--ms-u));',
  ].join('');

  const panelOrigin = `${isBottom ? 'bottom' : 'top'} ${isRight ? 'right' : 'left'}`;

  return `
    :host {
      all: initial;
      display: block;
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483647;
      --ms-blue: #0B2C5F;
      --ms-blue-mid: #1B3F92;
      --ms-orange: #F39200;
      --ms-orange-dark: #E08400;
      --ms-simple-bg: #FFF8E7;
      --ms-simple-border: #F39200;
      --ms-panel-radius: 14px;
      --ms-u: calc(16px * var(--ms-scale, 1));
      --ms-font: 'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-family: var(--ms-font);
      font-size: 15px;
      line-height: 1.45;
      color: #1a1a1a;
      box-sizing: border-box;
    }

    *, *::before, *::after { box-sizing: inherit; }

    /* ── FAB ─────────────────────────────────────────────────────────────── */
    .ms-fab-wrap {
      position: absolute;
      ${fabCorner}
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: calc(0.45 * var(--ms-u));
      pointer-events: none;
      z-index: 2;
    }
    .ms-fab-tip {
      pointer-events: none;
      position: relative;
      background: #0B2C5F;
      color: #fff;
      font-size: calc(0.75 * var(--ms-u));
      font-weight: 700;
      padding: calc(0.45 * var(--ms-u)) calc(0.8 * var(--ms-u));
      border-radius: 999px;
      box-shadow:
        0 2px 4px rgba(11, 44, 95, 0.18),
        0 8px 20px rgba(11, 44, 95, 0.28);
      white-space: nowrap;
      max-width: min(240px, 72vw);
      line-height: 1.25;
      animation:
        ms-fab-tip-in 0.38s ease both,
        ms-fab-tip-out 0.4s ease 6s forwards;
    }
    .ms-fab-tip::after {
      content: '';
      position: absolute;
      bottom: -5px;
      right: calc(1.15 * var(--ms-u));
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-top-color: #0B2C5F;
      filter: drop-shadow(0 2px 1px rgba(11, 44, 95, 0.15));
    }
    .ms-fab-tip[hidden] { display: none !important; }

    @keyframes ms-fab-tip-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes ms-fab-tip-out {
      to {
        opacity: 0;
        visibility: hidden;
      }
    }

    #ms-fab,
    .ms-fab {
      position: relative;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: none;
      background: var(--ms-orange);
      color: #fff;
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 2px 6px rgba(243, 146, 0, 0.35),
        0 8px 22px rgba(243, 146, 0, 0.4);
      transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;
      padding: 0;
    }

    #ms-fab:hover {
      background: var(--ms-orange-dark);
      transform: scale(1.06);
      box-shadow:
        0 4px 10px rgba(243, 146, 0, 0.4),
        0 12px 28px rgba(243, 146, 0, 0.45);
    }
    #ms-fab:active { transform: scale(0.96); }
    #ms-fab:focus-visible {
      outline: 3px solid var(--ms-blue);
      outline-offset: 3px;
    }
    #ms-fab.ms-fab--open {
      box-shadow:
        0 0 0 4px rgba(243, 146, 0, 0.35),
        0 4px 16px rgba(0, 0, 0, 0.25);
    }
    .ms-fab-icon { display: block; }
    .ms-fab-icon--close[hidden],
    .ms-fab-icon--open[hidden] { display: none !important; }

    /* ── Panel ───────────────────────────────────────────────────────────── */
    #ms-a11y-panel,
    .ms-a11y-panel {
      position: absolute;
      ${panelCorner}
      width: min(380px, calc(100vw - calc(2 * var(--ms-u))));
      max-height: min(72vh, 640px);
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: var(--ms-panel-radius);
      box-shadow:
        0 4px 12px rgba(11, 44, 95, 0.12),
        0 16px 48px rgba(11, 44, 95, 0.28);
      overflow: hidden;
      pointer-events: auto;
      z-index: 1;
      transform-origin: ${panelOrigin};
      animation: ms-panel-in 0.22s ease both;
    }

    #ms-a11y-panel[hidden] { display: none !important; }

    @keyframes ms-panel-in {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .ms-a11y-header {
      display: flex;
      align-items: flex-start;
      gap: calc(0.75 * var(--ms-u));
      padding: calc(1 * var(--ms-u)) calc(1 * var(--ms-u)) calc(0.9 * var(--ms-u));
      background: linear-gradient(135deg, var(--ms-blue) 0%, var(--ms-blue-mid) 100%);
      color: #fff;
      flex-shrink: 0;
    }

    .ms-a11y-header-icon {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--ms-orange);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ms-a11y-header-text { flex: 1; min-width: 0; }
    .ms-a11y-header-text h2 {
      margin: 0;
      font-size: calc(1.05 * var(--ms-u));
      font-weight: 700;
      line-height: 1.25;
      color: #fff;
    }
    .ms-a11y-subtitle {
      margin: calc(0.2 * var(--ms-u)) 0 0;
      font-size: calc(0.8125 * var(--ms-u));
      opacity: 0.85;
      color: #fff;
    }

    .ms-a11y-close {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      padding: calc(0.25 * var(--ms-u));
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ms-a11y-close:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
    .ms-a11y-close:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

    .ms-a11y-body {
      overflow-y: auto;
      padding: calc(0.85 * var(--ms-u)) calc(1 * var(--ms-u)) calc(1.1 * var(--ms-u));
      flex: 1;
      background: #f7f8fa;
    }

    /* ── Modo Simples card ───────────────────────────────────────────────── */
    .ms-a11y-card--simple {
      background: var(--ms-simple-bg);
      border: 2px solid var(--ms-simple-border);
      border-radius: 12px;
      padding: calc(0.85 * var(--ms-u)) calc(0.9 * var(--ms-u));
      margin-bottom: calc(1 * var(--ms-u));
    }
    .ms-a11y-card-row {
      display: flex;
      align-items: flex-start;
      gap: calc(0.75 * var(--ms-u));
    }
    .ms-a11y-card-text { flex: 1; min-width: 0; }
    .ms-a11y-card-star {
      color: var(--ms-orange);
      margin-right: calc(0.2 * var(--ms-u));
      font-size: calc(1 * var(--ms-u));
    }
    .ms-a11y-card-text strong {
      font-size: calc(0.95 * var(--ms-u));
      color: var(--ms-blue);
    }
    .ms-a11y-card-text p {
      margin: calc(0.35 * var(--ms-u)) 0 0;
      font-size: calc(0.78 * var(--ms-u));
      color: #4a5568;
      line-height: 1.4;
    }

    .ms-a11y-card--simple .ms-switch--on,
    .ms-a11y-card--simple .ms-switch[aria-checked="true"] {
      background: #8a5500;
    }

    /* ── Sections ────────────────────────────────────────────────────────── */
    .ms-a11y-section {
      background: #fff;
      border-radius: 10px;
      padding: calc(0.75 * var(--ms-u)) calc(0.85 * var(--ms-u));
      margin-bottom: calc(0.75 * var(--ms-u));
      border: 1px solid #e8eaef;
    }
    .ms-a11y-section-title {
      margin: 0 0 calc(0.65 * var(--ms-u));
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--ms-blue);
      display: flex;
      align-items: center;
      gap: calc(0.35 * var(--ms-u));
    }

    /* ── Segmented text scale ────────────────────────────────────────────── */
    .ms-segmented {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: calc(0.35 * var(--ms-u));
    }
    .ms-segment {
      border: none;
      border-radius: 8px;
      padding: calc(0.55 * var(--ms-u)) calc(0.25 * var(--ms-u));
      min-height: 44px;
      font: inherit;
      font-size: calc(0.8 * var(--ms-u));
      font-weight: 600;
      background: #eef0f4;
      color: #334155;
      cursor: pointer;
    }
    .ms-segment--on,
    .ms-segment[aria-checked="true"] {
      background: var(--ms-blue);
      color: #fff;
    }
    .ms-segment:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }

    /* ── Theme grid ──────────────────────────────────────────────────────── */
    .ms-theme-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: calc(0.5 * var(--ms-u));
    }
    .ms-theme-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: calc(0.15 * var(--ms-u));
      text-align: left;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: calc(0.55 * var(--ms-u)) calc(0.6 * var(--ms-u));
      background: #fff;
      cursor: pointer;
      font: inherit;
      color: #1a1a1a;
    }
    .ms-theme-btn--on,
    .ms-theme-btn[aria-checked="true"] {
      border-color: var(--ms-blue);
      box-shadow: 0 0 0 1px var(--ms-blue);
    }
    .ms-theme-btn:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }
    .ms-theme-swatch {
      width: 100%;
      height: 18px;
      border-radius: 4px;
      margin-bottom: calc(0.25 * var(--ms-u));
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .ms-theme-btn--senac .ms-theme-swatch {
      background: linear-gradient(90deg, #0B2C5F 40%, #F5A623 40%);
    }
    .ms-theme-btn--yellowBlack .ms-theme-swatch {
      background: linear-gradient(90deg, #000 50%, #ffe600 50%);
    }
    .ms-theme-btn--darkHigh .ms-theme-swatch {
      background: linear-gradient(90deg, #111 50%, #f1f5f9 50%);
    }
    .ms-theme-btn--soft .ms-theme-swatch {
      background: linear-gradient(90deg, #f5efe0 50%, #5c4a32 50%);
    }
    .ms-theme-label {
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      line-height: 1.2;
    }
    .ms-theme-sub {
      font-size: calc(0.8125 * var(--ms-u));
      color: #64748b;
    }

    /* ── Option rows + switches ──────────────────────────────────────────── */
    .ms-a11y-option-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: calc(0.65 * var(--ms-u));
    }
    .ms-a11y-option-row {
      display: flex;
      align-items: center;
      gap: calc(0.75 * var(--ms-u));
    }
    .ms-a11y-option-text { flex: 1; min-width: 0; }
    .ms-a11y-option-text strong {
      font-size: calc(0.85 * var(--ms-u));
      color: #1e293b;
      display: block;
    }
    .ms-a11y-option-hint {
      display: block;
      margin-top: calc(0.2 * var(--ms-u));
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 500;
      color: #64748b;
      line-height: 1.35;
    }
    .ms-a11y-option-text p {
      margin: calc(0.15 * var(--ms-u)) 0 0;
      font-size: calc(0.8125 * var(--ms-u));
      color: #64748b;
      line-height: 1.35;
    }

    .ms-switch {
      flex-shrink: 0;
      width: 44px;
      height: 26px;
      border-radius: 999px;
      border: none;
      background: #64748b;
      padding: 3px;
      cursor: pointer;
      position: relative;
      transition: background 0.18s ease;
    }
    /* UX-16: área de toque de 44px de altura (trilho visual de 26px) */
    .ms-switch::after {
      content: "";
      position: absolute;
      inset: -9px 0;
    }
    .ms-switch-thumb {
      display: block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
      transition: transform 0.18s ease;
    }
    .ms-switch--on,
    .ms-switch[aria-checked="true"] {
      background: var(--ms-blue);
    }
    .ms-switch--on .ms-switch-thumb,
    .ms-switch[aria-checked="true"] .ms-switch-thumb {
      transform: translateX(18px);
    }
    .ms-switch:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }

    .ms-btn-ouvir {
      flex-shrink: 0;
      border: none;
      border-radius: 8px;
      padding: calc(0.45 * var(--ms-u)) calc(0.9 * var(--ms-u));
      background: var(--ms-orange);
      color: #1a1205;
      font: inherit;
      font-size: calc(0.82 * var(--ms-u));
      font-weight: 700;
      cursor: pointer;
    }
    .ms-btn-ouvir:hover { background: var(--ms-orange-dark); }
    .ms-btn-ouvir:focus-visible {
      outline: 2px solid var(--ms-blue);
      outline-offset: 2px;
    }

    .ms-a11y-live {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    }

    .ms-a11y-footer-note {
      margin: calc(0.35 * var(--ms-u)) 0 0;
      text-align: center;
      font-size: calc(0.8125 * var(--ms-u));
      color: #475569;
      line-height: 1.35;
    }

    @media (max-width: 480px) {
      #ms-a11y-panel {
        width: calc(100vw - calc(1 * var(--ms-u)));
        max-height: calc(100vh - 124px - calc(2.5 * var(--ms-u)));
        max-height: calc(100dvh - 124px - calc(2.5 * var(--ms-u)));
        right: calc(0.5 * var(--ms-u)) !important;
        left: calc(0.5 * var(--ms-u)) !important;
        transform-origin: bottom center;
      }
      .ms-fab-tip {
        max-width: min(180px, 62vw);
        white-space: normal;
        text-align: center;
        border-radius: 14px;
        font-size: calc(0.75 * var(--ms-u));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ms-fab-tip {
        animation: ms-fab-tip-out 0.01s linear 6s forwards !important;
      }
      #ms-a11y-panel,
      .ms-a11y-panel {
        animation: none !important;
      }
      #ms-fab,
      .ms-fab,
      .ms-switch-thumb,
      .ms-switch,
      .ms-fab-wrap,
      .ms-chrome-switch .ms-switch-thumb {
        transition: none !important;
      }
      #ms-fab:hover,
      #ms-fab:active {
        transform: none;
      }
    }
  `;
}

/**
 * CSS injected into the host page <head>.
 * Text scale / themes / cognitive aids apply whenever their classes are set.
 * Distraction hiding and principal-content layout require html.ms-ativo.
 *
 * @returns {string}
 */
export function getPageStyles() {
  return `
    /* ── Hidden distractions (Modo Simples only) ─────────────────────────── */
    html.ms-ativo [data-ms-hidden="true"] {
      display: none !important;
      visibility: hidden !important;
    }

    html.ms-ativo [data-ms-principal] {
      display: block !important;
      max-width: 75ch !important;
      margin-inline: auto !important;
      padding-inline: 1.5rem !important;
      font-size: 1.125rem !important;
      line-height: 1.8 !important;
    }

    /* ── Text scale (independent of ms-ativo) ─────────────────────────────── */
    html.ms-text-scale-125 { font-size: 125%; --ms-scale: 1.25; }
    html.ms-text-scale-150 { font-size: 150%; --ms-scale: 1.5; }
    html.ms-text-scale-175 { font-size: 175%; --ms-scale: 1.75; }

    /* ── Color themes ────────────────────────────────────────────────────── */
    html.ms-theme-yellowBlack,
    html.ms-theme-yellowBlack body {
      background-color: #000000 !important;
      color: #ffe600 !important;
    }
    html.ms-theme-yellowBlack body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      background-color: transparent !important;
      color: #ffe600 !important;
      border-color: #ffe600 !important;
    }
    html.ms-theme-yellowBlack a,
    html.ms-theme-yellowBlack a:visited {
      color: #fff59d !important;
      text-decoration: underline !important;
    }
    html.ms-theme-yellowBlack .site-header,
    html.ms-theme-yellowBlack .ms-pills-nav {
      background-color: #000000 !important;
      color: #ffe600 !important;
      border-bottom-color: #ffe600 !important;
      box-shadow: 0 2px 8px rgb(0 0 0 / 55%) !important;
    }
    html.ms-theme-yellowBlack .site-header a,
    html.ms-theme-yellowBlack .ms-pills-nav a {
      color: #ffe600 !important;
    }
    html.ms-theme-yellowBlack .main-nav a[aria-current='page'],
    html.ms-theme-yellowBlack .ms-pill[aria-current='page'] {
      background-color: #ffe600 !important;
      color: #000000 !important;
      border-color: #ffe600 !important;
      text-decoration: none !important;
    }

    html.ms-theme-darkHigh,
    html.ms-theme-darkHigh body {
      background-color: #0f172a !important;
      color: #f8fafc !important;
    }
    html.ms-theme-darkHigh body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      background-color: transparent !important;
      color: #f8fafc !important;
      border-color: #94a3b8 !important;
    }
    html.ms-theme-darkHigh a,
    html.ms-theme-darkHigh a:visited {
      color: #93c5fd !important;
    }
    html.ms-theme-darkHigh .site-header,
    html.ms-theme-darkHigh .ms-pills-nav {
      background-color: #0f172a !important;
      color: #f8fafc !important;
      border-bottom-color: #334155 !important;
      box-shadow: 0 2px 10px rgb(0 0 0 / 45%) !important;
    }
    html.ms-theme-darkHigh .site-header a,
    html.ms-theme-darkHigh .ms-pills-nav a {
      color: #e2e8f0 !important;
    }
    html.ms-theme-darkHigh .main-nav a[aria-current='page'],
    html.ms-theme-darkHigh .ms-pill[aria-current='page'] {
      background-color: #38bdf8 !important;
      color: #0f172a !important;
      border-color: #38bdf8 !important;
      text-decoration: none !important;
    }

    html.ms-theme-soft,
    html.ms-theme-soft body {
      background-color: #f5efe0 !important;
      color: #3d3226 !important;
    }
    html.ms-theme-soft body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      background-color: transparent !important;
      color: #3d3226 !important;
      border-color: #c4b59a !important;
    }
    html.ms-theme-soft a,
    html.ms-theme-soft a:visited {
      color: #5c4a32 !important;
    }
    html.ms-theme-soft .site-header,
    html.ms-theme-soft .ms-pills-nav {
      background-color: #f5efe0 !important;
      color: #3d3226 !important;
      border-bottom-color: #c4b59a !important;
      box-shadow: 0 2px 8px rgb(61 50 38 / 12%) !important;
    }
    html.ms-theme-soft .site-header a,
    html.ms-theme-soft .ms-pills-nav a {
      color: #3d3226 !important;
    }
    html.ms-theme-soft .main-nav a[aria-current='page'],
    html.ms-theme-soft .ms-pill[aria-current='page'] {
      background-color: #3d3226 !important;
      color: #f5efe0 !important;
      border-color: #3d3226 !important;
      text-decoration: none !important;
    }

    /* Session bar: opaque amber over page content under any theme */
    html.ms-theme-yellowBlack #ms-session-bar,
    html.ms-theme-darkHigh #ms-session-bar,
    html.ms-theme-soft #ms-session-bar {
      position: relative;
      z-index: 40;
      background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%) !important;
      color: #1a1205 !important;
      border-bottom-color: #d97706 !important;
    }

    /* ms-theme-senac is a noop (default site look) */

    /* ── Reduced motion ──────────────────────────────────────────────────── */
    html.ms-reduced-motion *,
    html.ms-reduced-motion *::before,
    html.ms-reduced-motion *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }

    /* ── Highlight links ─────────────────────────────────────────────────── */
    html.ms-highlight-links a:not([data-ms-hidden]) {
      text-decoration: underline !important;
      text-decoration-thickness: 2px !important;
      text-underline-offset: 3px !important;
      outline: 1px dashed currentColor !important;
      outline-offset: 2px !important;
    }

    /* ── Lexend / dyslexia font ──────────────────────────────────────────── */
    html.ms-dyslexia-font,
    html.ms-dyslexia-font body,
    html.ms-dyslexia-font body *:not(#ms-container):not(#ms-container *):not([class*="icon"]):not([class*="fa-"]):not(.fa):not(.fas):not(.far):not(.fab):not(.material-icons):not(code):not(pre):not(kbd):not(samp) {
      font-family: 'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif !important;
      letter-spacing: 0.02em !important;
      word-spacing: 0.08em !important;
    }

    /* ── Text spacing (WCAG 1.4.12) ──────────────────────────────────────── */
    html.ms-text-spacing body,
    html.ms-text-spacing p,
    html.ms-text-spacing li,
    html.ms-text-spacing h1,
    html.ms-text-spacing h2,
    html.ms-text-spacing h3,
    html.ms-text-spacing h4,
    html.ms-text-spacing h5,
    html.ms-text-spacing h6,
    html.ms-text-spacing td,
    html.ms-text-spacing th,
    html.ms-text-spacing dd,
    html.ms-text-spacing dt,
    html.ms-text-spacing blockquote,
    html.ms-text-spacing label {
      line-height: 2 !important;
      letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important;
    }
    html.ms-text-spacing p { margin-bottom: 1.5em !important; }

    /* ── Hide images (content + logo; keep only [data-ms-keep-img]) ───────── */
    html.ms-hide-images img:not([data-ms-keep-img]),
    html.ms-hide-images picture:not([data-ms-keep-img]),
    html.ms-hide-images video,
    html.ms-hide-images [data-ms-deco-img] {
      display: none !important;
    }

    /* ── Reading ruler marker (overlay is created in JS) ─────────────────── */
    html.ms-reading-ruler { cursor: crosshair; }

    html.ms-manual-select-active { cursor: pointer !important; }

    /* ── Session chrome (SIMPLES header) + barra sob o nav ───────────────── */
    /* UX-14: 1 unidade = 16px fixos, sem depender do html { font-size } do host */
    #ms-simples-chrome,
    #ms-session-bar,
    .ms-pills-nav {
      --ms-u: calc(16px * var(--ms-scale, 1));
    }
    #ms-simples-chrome {
      display: flex;
      align-items: center;
      margin-left: auto;
      z-index: 50;
      flex-shrink: 0;
    }
    #ms-simples-chrome.ms-simples-chrome--fixed {
      position: fixed;
      top: calc(0.75 * var(--ms-u));
      right: calc(5.5 * var(--ms-u));
      z-index: 2147483646;
    }
    /* Same SIMPLES control, parked in MS pills nav while site header is hidden */
    #ms-simples-chrome.ms-simples-chrome--ms-nav {
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: calc(0.45 * var(--ms-u)) calc(1 * var(--ms-u)) 0;
      justify-content: flex-end;
      position: static;
    }
    #ms-simples-chrome.ms-simples-chrome--ms-nav .ms-chrome-icon {
      display: none;
    }
    .ms-simples-chrome-inner {
      display: flex;
      align-items: center;
      gap: calc(0.55 * var(--ms-u));
    }
    .ms-chrome-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      border: 1px solid #c5d0e3;
      background: #fff;
      color: #0b2c5f;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
    }
    .ms-chrome-icon:hover {
      border-color: #f39200;
      color: #e08400;
      box-shadow: 0 0 0 3px rgba(243, 146, 0, 0.18);
    }
    .ms-simples-toggle-wrap {
      display: flex;
      min-width: 0;
      align-items: center;
      gap: calc(0.55 * var(--ms-u));
      padding: calc(0.4 * var(--ms-u)) calc(0.7 * var(--ms-u)) calc(0.4 * var(--ms-u)) calc(0.75 * var(--ms-u));
      border-radius: 999px;
      border: 2px solid #d8e1ef;
      background: #fff;
      box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
      transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    }
    .ms-simples-toggle-wrap[data-active="true"] {
      border-color: #f39200;
      background: #fff8e7;
      box-shadow: 0 0 0 2px rgba(243, 146, 0, 0.22);
    }
    .ms-simples-spark { color: #f39200; font-size: calc(1 * var(--ms-u)); }
    .ms-simples-toggle-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .ms-simples-toggle-text strong {
      font-size: calc(0.8 * var(--ms-u));
      letter-spacing: 0.05em;
      color: #0b2c5f;
    }
    .ms-simples-sub {
      font-size: calc(0.75 * var(--ms-u));
      color: #475569;
      font-weight: 600;
    }
    .ms-chrome-switch {
      width: 44px;
      height: 26px;
      border-radius: 999px;
      border: none;
      background: #64748b;
      padding: 3px;
      cursor: pointer;
      position: relative;
    }
    .ms-chrome-switch::after {
      content: "";
      position: absolute;
      inset: -9px 0;
    }
    .ms-chrome-switch .ms-switch-thumb {
      display: block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgb(0 0 0 / 20%);
      transition: transform 0.18s ease;
    }
    .ms-chrome-switch.ms-switch--on,
    .ms-chrome-switch[aria-checked="true"] {
      background: #8a5500;
    }
    .ms-chrome-switch.ms-switch--on .ms-switch-thumb,
    .ms-chrome-switch[aria-checked="true"] .ms-switch-thumb {
      transform: translateX(18px);
    }

    #ms-session-bar {
      background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
      color: #1a1205;
      width: 100%;
      border-bottom: 2px solid #d97706;
      box-shadow: 0 2px 10px rgb(217 119 6 / 22%);
    }
    .ms-session-bar-inner {
      width: min(calc(72 * var(--ms-u)), calc(100% - calc(2 * var(--ms-u))));
      margin: 0 auto;
      padding: calc(0.9 * var(--ms-u)) 0;
    }
    .ms-session-off {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: calc(0.5 * var(--ms-u)) calc(1 * var(--ms-u));
    }
    .ms-session-off[hidden],
    .ms-session-on[hidden] {
      display: none !important;
    }
    .ms-session-off p {
      margin: 0;
      font-weight: 600;
      max-width: calc(52 * var(--ms-u));
      font-size: calc(0.95 * var(--ms-u));
    }
    .ms-chrome-icon:focus-visible,
    .ms-chrome-switch:focus-visible,
    .ms-session-btn:focus-visible {
      outline: 3px solid #0b2c5f;
      outline-offset: 2px;
    }
    .ms-session-on-top { margin-bottom: calc(0.7 * var(--ms-u)); }
    .ms-session-on-title {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: calc(0.5 * var(--ms-u));
      font-size: calc(1.05 * var(--ms-u));
    }
    .ms-session-badge {
      background: #1a1205;
      color: #fff;
      border-radius: 999px;
      padding: calc(0.22 * var(--ms-u)) calc(0.7 * var(--ms-u));
      font-size: calc(0.75 * var(--ms-u));
      font-weight: 700;
    }
    .ms-session-desc {
      margin: calc(0.35 * var(--ms-u)) 0 0;
      font-size: calc(0.9 * var(--ms-u));
      font-weight: 500;
    }
    .ms-session-actions {
      display: flex;
      flex-wrap: wrap;
      gap: calc(0.5 * var(--ms-u));
    }
    .ms-session-btn {
      border: none;
      border-radius: 12px;
      padding: calc(0.55 * var(--ms-u)) calc(0.95 * var(--ms-u));
      min-height: 44px;
      font-weight: 700;
      cursor: pointer;
      font-size: calc(0.85 * var(--ms-u));
      display: inline-flex;
      align-items: center;
      gap: calc(0.35 * var(--ms-u));
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .ms-session-btn--light {
      background: #fff;
      color: #1a1205;
      box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
    }
    .ms-session-btn--dark {
      background: #1a1205;
      color: #fff;
    }
    .ms-session-btn[aria-disabled='true'] {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .ms-session-btn--active {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px #1a1205;
    }
    .ms-session-btn--speaking {
      background: #dc2626;
      color: #fff;
    }

    /* UX-07: barra compacta no mobile (título numa linha, botões ícone + rótulo curto em grade) */
    @media (max-width: 480px) {
      .ms-session-bar-inner { padding: calc(0.5 * var(--ms-u)) 0; }
      .ms-session-on-top { margin-bottom: calc(0.4 * var(--ms-u)); }
      .ms-session-on-title { font-size: calc(0.95 * var(--ms-u)); gap: calc(0.4 * var(--ms-u)); }
      .ms-session-badge { font-size: calc(0.75 * var(--ms-u)); padding: calc(0.15 * var(--ms-u)) calc(0.5 * var(--ms-u)); white-space: nowrap; }
      .ms-session-desc,
      .ms-btn-pre,
      .ms-btn-post {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      }
      .ms-session-actions {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: calc(0.4 * var(--ms-u));
      }
      .ms-session-actions .ms-session-btn {
        min-width: 0;
        overflow-wrap: anywhere;
        flex-direction: column;
        justify-content: center;
        gap: calc(0.15 * var(--ms-u));
        padding: calc(0.3 * var(--ms-u)) calc(0.2 * var(--ms-u));
        font-size: calc(0.75 * var(--ms-u));
        line-height: 1.15;
        text-align: center;
      }
      .ms-session-actions .ms-session-btn svg {
        width: 1.35em;
        height: 1.35em;
      }
    }

    html.ms-simple-language [data-ms-principal],
    html.ms-simple-language main {
      font-size: 1.15em !important;
      line-height: 1.75 !important;
      max-width: 65ch !important;
    }

    /* Pares de linguagem (protótipo / sites que marcam o markup) */
    [data-ms-simple] {
      display: none !important;
    }
    html.ms-simple-language [data-ms-plain] {
      display: none !important;
    }
    html.ms-simple-language [data-ms-simple] {
      display: revert !important;
    }

    /* Convenções do protótipo Senac (F5-T05) */
    .ms-simple-only {
      display: none !important;
    }
    html.ms-ativo .ms-simple-only {
      display: block !important;
    }
    html.ms-ativo .ms-simple-only.ms-hub,
    html.ms-ativo .ms-simple-only.ms-pills-nav {
      display: block !important;
    }
    html.ms-ativo .ms-simple-hide {
      display: none !important;
    }

    /* Highlight do bloco sendo lido pelo TTS */
    [data-ms-tts-active] {
      background: #fef3c7 !important;
      outline: 3px solid #f59e0b !important;
      outline-offset: 4px;
      border-radius: 6px;
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }

    /* UX-06: pills quebram linha (sem rolagem horizontal); no mobile viram grade de 2 colunas */
    .ms-pills-nav .ms-pills-nav__inner {
      flex-wrap: wrap;
      overflow-x: visible;
    }
    .ms-pills-nav .ms-pill {
      flex: 0 1 auto;
      min-height: 44px;
      box-sizing: border-box;
    }
    @media (max-width: 720px) {
      .ms-pills-nav .ms-pills-nav__inner {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: calc(0.5 * var(--ms-u));
      }
      .ms-pills-nav .ms-pill {
        justify-content: center;
        text-align: center;
        white-space: normal;
        overflow-wrap: anywhere;
        min-width: 0;
        padding-inline: calc(0.25 * var(--ms-u));
      }
    }
    @media (min-width: 360px) and (max-width: 720px) {
      .ms-pills-nav .ms-pills-nav__inner {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    /* Pills injetáveis (F5-T11 — simpleNav) */
    .ms-pills-nav[data-ms-injected] {
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 0 rgb(0 0 0 / 4%);
    }
    .ms-pills-nav[data-ms-injected] .ms-pills-nav__inner {
      display: flex;
      gap: calc(0.5 * var(--ms-u));
      padding: calc(0.65 * var(--ms-u)) calc(1 * var(--ms-u));
    }
    .ms-pills-nav[data-ms-injected] .ms-pill {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: calc(0.35 * var(--ms-u));
      padding: calc(0.55 * var(--ms-u)) calc(0.95 * var(--ms-u));
      border-radius: 10px;
      background: #eef2f7;
      color: #0b2c5f;
      font-weight: 700;
      font-size: calc(0.82 * var(--ms-u));
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      text-decoration: none;
      border: 2px solid transparent;
      white-space: nowrap;
      transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    }
    .ms-pills-nav[data-ms-injected] .ms-pill:hover {
      background: #e2e8f0;
      text-decoration: none;
      box-shadow: 0 2px 6px rgb(11 44 95 / 10%);
    }
    .ms-pills-nav[data-ms-injected] .ms-pill[aria-current='page'] {
      background: #0b2c5f;
      color: #fff;
      border-color: #f39200;
      box-shadow: 0 0 0 2px rgb(243 146 0 / 35%);
      font-weight: 800;
    }
    .ms-pills-nav[data-ms-injected] .ms-pill__short {
      display: none;
    }
    @media (max-width: 720px) {
      .ms-pills-nav[data-ms-injected] .ms-pill__full {
        display: none;
      }
      .ms-pills-nav[data-ms-injected] .ms-pill__short {
        display: inline;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ms-chrome-icon,
      .ms-simples-toggle-wrap,
      .ms-chrome-switch .ms-switch-thumb,
      .ms-session-btn,
      .ms-pills-nav[data-ms-injected] .ms-pill {
        transition: none !important;
      }
      .ms-session-btn:hover,
      .ms-pills-nav[data-ms-injected] .ms-pill:hover {
        transform: none;
      }
    }
  `;
}
