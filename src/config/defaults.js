/**
 * Default configuration for Modo Simples.
 *
 * Integrators can override any value by passing a config object to the
 * ModoSimples constructor. All keys are optional.
 */
const defaults = {
  /**
   * CSS selectors tried in order to locate the main content.
   * The first selector that returns a high-scoring element wins.
   */
  mainSelectors: [
    'main',
    '[role="main"]',
    'article',
    '#conteudo',
    '#content',
    '.content',
    '.main-content',
    '.post-content',
    '.article-body',
    '.entry-content',
  ],

  /**
   * Candidates for hiding when Modo Simples is active.
   * Elements inside the detected main content are never hidden, regardless
   * of whether they match these selectors.
   */
  distractionSelectors: [
    'header',
    'footer',
    'aside',
    '[role="complementary"]',
    '[role="banner"]',
    '[role="contentinfo"]',
    'nav',
    '.ad',
    '.ads',
    '.advertisement',
    '[class*="banner"]:not([class*="page-banner"])',
    '[class*="popup"]',
    '[class*="overlay"]',
    '[class*="sidebar"]',
    '[class*="cookie"]',
    '[class*="newsletter"]',
    '[class*="promo"]',
    '[class*="carousel"]',
    '[class*="slider"]',
    '.slider',
    'iframe',
  ],

  /** Scoring weights used by the heuristic engine. */
  scoring: {
    mainTagBonus: 100,
    roleMainBonus: 90,
    articleBonus: 60,
    h1Bonus: 30,
    h2Bonus: 20,
    textLengthBonus: 40,
    /** Minimum text length (chars) to award textLengthBonus. */
    minTextLength: 200,
  },

  /** Persist state (modoSimples on/off + options) across page loads. */
  persistence: true,

  /** Scope persistence keys by hostname (`state:hostname`). */
  hostnamePersistence: true,

  /**
   * Floating button corner position.
   * One of: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
   */
  position: 'bottom-right',

  /**
   * Minimum heuristic confidence (0–1) to auto-apply main detection.
   * Below this threshold, a manual-selection fallback is shown instead.
   */
  confidenceThreshold: 0.45,

  /**
   * Milliseconds to debounce MutationObserver reprocessing after DOM changes.
   */
  reprocessDebounce: 300,

  /**
   * Teto (ms) de espera do debounce: com mutações contínuas o reprocess roda pelo menos
   * a cada reprocessMaxWait ms (evita "starvation" em páginas que mutam sem parar).
   */
  reprocessMaxWait: 1500,

  /**
   * Session bar (switch SIMPLES + barra "Modo Simples ativado") injected in the host page.
   * Default false: only the FAB + panel (Shadow DOM) are injected.
   * @type {boolean}
   */
  sessionBar: false,

  /**
   * Where the session bar goes (only used when sessionBar is true). Selector or list of
   * selectors (first match wins). Without mount: switch fixed on screen + bar at top of <body>.
   *   chrome → container that receives the SIMPLES switch
   *   bar    → element AFTER which the bar is inserted
   * @type {null | { chrome?: string|string[], bar?: string|string[] }}
   */
  mount: null,

  /**
   * Lexend font source. Loaded lazily, only when the user turns on the dyslexia font.
   *   null   → default (Google Fonts, no-referrer) — requested only after the user opts in
   *   string → self-hosted stylesheet URL
   *   false  → never load; keep the system fallback stack
   * @type {null | string | false}
   */
  fontUrl: null,

  /**
   * Texts of the accessibility panel header/footer. Generic by default; the host sets its own
   * (pre-boot via window.ModoSimplesConfig — the panel is built at init). Partial overrides merge.
   *   title    → panel heading
   *   subtitle → line under the heading ('' hides it)
   *   footer   → note at the bottom of the panel ('' hides it)
   * @type {{ title: string, subtitle: string, footer: string }}
   */
  brand: {
    title: 'Acessibilidade Digital',
    subtitle: '',
    footer: 'Preferências salvas neste navegador',
  },

  /**
   * Optional simple-mode nav pills for host pages without markup.
   * Example: [{ label: 'Início', href: '/' }, { label: 'Ajuda', href: '/ajuda' }]
   * Ignored when the page already has [data-ms-pills] authored in HTML.
   * @type {null | { label: string, href: string, short?: string }[]}
   */
  simpleNav: null,
};

export default defaults;
