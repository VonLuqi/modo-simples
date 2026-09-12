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
    '.barra-superior',
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
    '.s1',
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
   * Optional simple-mode nav pills for host pages without markup.
   * Example: [{ label: 'Início', href: '/' }, { label: 'Ajuda', href: '/ajuda' }]
   * Ignored when the page already has [data-ms-pills] authored in HTML.
   * @type {null | { label: string, href: string, short?: string }[]}
   */
  simpleNav: null,
};

export default defaults;
