import { getPageStyles } from '../ui/styles.js';
import { detectMainContent } from '../heuristics/contentDetector.js';
import { detectDistractions } from '../heuristics/distractionDetector.js';

/**
 * DOM Mutator — applies and reverts Modo Simples visual transformations.
 *
 * Core principle: NEVER modify DOM structure. Only set/remove data attributes
 * and add/remove CSS classes on the root <html> element. All visual changes
 * are expressed purely through CSS (see getPageStyles in styles.js).
 *
 * This makes the entire operation reversible with a single revert() call and
 * eliminates the risk of corrupting the host page's layout.
 *
 * Data attributes:
 *   data-ms-principal  → marks the detected main content block
 *   data-ms-hidden     → marks elements to be visually hidden
 *
 * Root classes:
 *   ms-ativo            → Modo Simples is ON
 *   ms-high-contrast    → high contrast option is ON
 *   ms-larger-text      → larger text option is ON
 *   ms-reduced-motion   → reduced motion option is ON
 *   ms-highlight-links  → highlight links option is ON
 *   ms-dyslexia-font    → dyslexia-friendly font option is ON
 *   ms-text-spacing     → text spacing option is ON
 *   ms-hide-images      → hide images option is ON
 */

const PAGE_STYLE_ID = 'ms-page-styles';

/** Cached scan results. Cleared on revert() to force re-scan on next apply(). */
let _mainElement = null;
/** @type {Element[]} */
let _distractionElements = [];

/**
 * Inject the Modo Simples page CSS into <head>.
 * Idempotent — safe to call multiple times; only injects once.
 */
export function injectPageStyles() {
  if (document.getElementById(PAGE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PAGE_STYLE_ID;
  style.textContent = getPageStyles();
  document.head.appendChild(style);
}

/**
 * Scan the page heuristically and cache results.
 * Must be called before apply(). Called again by reprocess() after DOM changes.
 *
 * @param {import('../config/defaults.js').default} config
 * @returns {{ mainElement: Element, confidence: number }}
 */
export function scan(config) {
  const result = detectMainContent(config);
  _mainElement = result.element;
  _distractionElements = detectDistractions(_mainElement, config);
  return { mainElement: _mainElement, confidence: result.confidence };
}

/**
 * Apply all Modo Simples transformations to the current page.
 *
 * @param {Object} state  Current state snapshot
 * @param {Object} config Current configuration
 */
export function apply(state, config) {
  // Ensure we have scan results
  if (!_mainElement) scan(config);

  // Mark main content
  if (_mainElement) _mainElement.setAttribute('data-ms-principal', '');

  // Mark distractions
  _distractionElements.forEach((el) => el.setAttribute('data-ms-hidden', 'true'));

  // Apply root activation class + option classes
  const html = document.documentElement;
  html.classList.add('ms-ativo');
  if (state.options.highContrast)   html.classList.add('ms-high-contrast');
  if (state.options.largerText)     html.classList.add('ms-larger-text');
  if (state.options.reducedMotion)  html.classList.add('ms-reduced-motion');
  if (state.options.highlightLinks) html.classList.add('ms-highlight-links');
  if (state.options.dyslexiaFont)   html.classList.add('ms-dyslexia-font');
  if (state.options.textSpacing)    html.classList.add('ms-text-spacing');
  if (state.options.hideImages)     html.classList.add('ms-hide-images');
}

/**
 * Revert ALL Modo Simples transformations without modifying DOM structure.
 *
 * After this call the page looks exactly as it did before apply() ran.
 * Also clears the scan cache so the next apply() triggers a fresh scan.
 */
export function revert() {
  // Remove element-level markers
  document.querySelectorAll('[data-ms-hidden="true"]').forEach((el) => {
    el.removeAttribute('data-ms-hidden');
  });
  document.querySelectorAll('[data-ms-principal]').forEach((el) => {
    el.removeAttribute('data-ms-principal');
  });

  // Remove root classes
  document.documentElement.classList.remove(
    'ms-ativo',
    'ms-high-contrast',
    'ms-larger-text',
    'ms-reduced-motion',
    'ms-highlight-links',
    'ms-dyslexia-font',
    'ms-text-spacing',
    'ms-hide-images',
  );

  // Clear cache — forces fresh heuristic scan on next apply()
  _mainElement = null;
  _distractionElements = [];
}

/**
 * Re-scan and re-apply after DOM changes (e.g. SPA navigation).
 * Wraps revert() + scan() + apply() in a single atomic operation.
 *
 * @param {Object} state  Current state snapshot
 * @param {Object} config Current configuration
 */
export function reprocess(state, config) {
  revert();
  scan(config);
  apply(state, config);
}
