import { getPageStyles } from '../ui/styles.js';
import { detectMainContent } from '../heuristics/contentDetector.js';
import { detectDistractions } from '../heuristics/distractionDetector.js';
import {
  buildCssPath,
  isManualSelectActive,
} from '../features/manualSelect.js';

/**
 * DOM Mutator — applies and reverts Modo Simples visual transformations.
 *
 * Core principle: NEVER modify DOM structure. Only set/remove data attributes
 * and add/remove CSS classes on the root <html> element.
 *
 * Root classes:
 *   ms-ativo                     → Modo Simples ON (distraction hiding)
 *   ms-text-scale-{125|150|175}  → text scale (100% = sem classe)
 *   ms-theme-{senac|yellowBlack|…}
 *   ms-dyslexia-font, ms-highlight-links, ms-text-spacing,
 *   ms-reduced-motion, ms-hide-images, ms-reading-ruler
 */

const PAGE_STYLE_ID = 'ms-page-styles';
const LEXEND_LINK_ID = 'ms-lexend-font';

const TEXT_SCALE_CLASSES = [
  'ms-text-scale-100',
  'ms-text-scale-125',
  'ms-text-scale-150',
  'ms-text-scale-175',
];

const THEME_CLASSES = [
  'ms-theme-senac',
  'ms-theme-yellowBlack',
  'ms-theme-darkHigh',
  'ms-theme-soft',
];

const OPTION_FLAG_CLASSES = [
  'ms-dyslexia-font',
  'ms-highlight-links',
  'ms-text-spacing',
  'ms-reduced-motion',
  'ms-hide-images',
  'ms-reading-ruler',
  'ms-simple-language',
];

/** Cached scan results. Cleared on revertModoSimples / full revert. */
let _mainElement = null;
/** @type {Element[]} */
let _distractionElements = [];
/**
 * Principal escolhido manualmente (elemento + caminho CSS). Sobrevive ao reprocess do
 * observer (IMP-02); só é limpo ao desligar o Modo Simples / destroy.
 */
let _manualPrincipal = null;
let _manualPath = '';
/**
 * Confiança baixa: enquanto o usuário não escolher o principal, o reprocess (observer) NÃO pode
 * aplicar a heurística — ela já foi considerada incerta. Zera ao escolher (setPrincipal) ou ao
 * desligar o Modo Simples (revertModoSimples).
 */
let _holdPrincipal = false;

/** @param {boolean} on */
export function holdPrincipal(on) {
  _holdPrincipal = !!on;
}

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

/** Default Lexend stylesheet (third-party). Requested ONLY when dyslexiaFont is turned on. */
const DEFAULT_LEXEND_URL =
  'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap';

/** @type {string|false|null} null = default URL, string = self-host URL, false = never load */
let _fontUrl = null;

/**
 * Configure where Lexend comes from (config.fontUrl).
 * @param {string|false|null|undefined} url
 */
export function setLexendFontUrl(url) {
  _fontUrl = url === undefined ? null : url;
}

/**
 * Lazily load Lexend (idempotent). Never called at init — only when the user
 * enables dyslexiaFont. fontUrl === false keeps the system fallback stack.
 */
export function ensureLexendFont() {
  if (typeof document === 'undefined') return;
  if (_fontUrl === false) return;
  if (document.getElementById(LEXEND_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = LEXEND_LINK_ID;
  link.rel = 'stylesheet';
  link.crossOrigin = 'anonymous';
  link.referrerPolicy = 'no-referrer';
  link.href = _fontUrl || DEFAULT_LEXEND_URL;
  document.head.appendChild(link);
}

/**
 * Scan the page heuristically and cache results.
 *
 * @param {Object} config
 * @returns {{ mainElement: Element, confidence: number }}
 */
export function scan(config) {
  const result = detectMainContent(config);
  _mainElement = result.element;
  _distractionElements = detectDistractions(_mainElement, config);
  return { mainElement: _mainElement, confidence: result.confidence };
}

/**
 * Apply option classes (text/theme/aids) independently of Modo Simples.
 * @param {Object} state
 */
export function applyOptions(state) {
  const html = document.documentElement;
  const opts = state.options || {};

  html.classList.remove(...TEXT_SCALE_CLASSES);
  // 100% é o padrão: sem classe nem regra, para não sobrescrever o html{font-size} do host
  // (ex.: truque de rem com 62.5%) antes de o usuário pedir texto maior (IMP-05)
  const scale = opts.textScale || '100';
  if (scale !== '100') html.classList.add(`ms-text-scale-${scale}`);

  html.classList.remove(...THEME_CLASSES);
  const theme = opts.colorTheme || 'senac';
  html.classList.add(`ms-theme-${theme}`);

  html.classList.toggle('ms-dyslexia-font', !!opts.dyslexiaFont);
  if (opts.dyslexiaFont) ensureLexendFont();
  html.classList.toggle('ms-highlight-links', !!opts.highlightLinks);
  html.classList.toggle('ms-text-spacing', !!opts.textSpacing);
  html.classList.toggle('ms-reduced-motion', !!opts.reducedMotion);
  html.classList.toggle('ms-hide-images', !!opts.hideImages);
  html.classList.toggle('ms-reading-ruler', !!opts.readingRuler);
  html.classList.toggle('ms-simple-language', !!opts.simpleLanguage);
}

/**
 * Apply Modo Simples: mark principal, hide distractions, add ms-ativo.
 * Does not clear option classes.
 *
 * @param {Object} state
 * @param {Object} config
 */
export function applyModoSimples(state, config) {
  if (!_mainElement) scan(config);

  if (_mainElement) _mainElement.setAttribute('data-ms-principal', '');
  _distractionElements.forEach((el) =>
    el.setAttribute('data-ms-hidden', 'true'),
  );

  document.documentElement.classList.add('ms-ativo');
  applyOptions(state);
}

/**
 * Apply all transformations when Modo Simples is on (legacy-compatible).
 * @param {Object} state
 * @param {Object} config
 */
export function apply(state, config) {
  applyModoSimples(state, config);
}

/**
 * Remove Modo Simples markers (principal / hidden) and ms-ativo.
 * Keeps option classes (text scale, theme, etc.).
 */
export function revertModoSimples() {
  document.querySelectorAll('[data-ms-hidden="true"]').forEach((el) => {
    el.removeAttribute('data-ms-hidden');
  });
  // Keep manually selected principal if present; only clear scan-cache markers
  // when fully reverting — for disable we remove all principal markers.
  document.querySelectorAll('[data-ms-principal]').forEach((el) => {
    el.removeAttribute('data-ms-principal');
  });

  document.documentElement.classList.remove('ms-ativo');
  _mainElement = null;
  _distractionElements = [];
  _manualPrincipal = null;
  _manualPath = '';
  _holdPrincipal = false;
}

/**
 * Revert ALL Modo Simples transformations (destroy path).
 */
export function revert() {
  revertModoSimples();

  document.documentElement.classList.remove(
    ...TEXT_SCALE_CLASSES,
    ...THEME_CLASSES,
    ...OPTION_FLAG_CLASSES,
  );
}

/**
 * Mark a specific element as principal (manual select) and re-hide distractions.
 * @param {Element} el
 * @param {Object} config
 */
export function setPrincipal(el, config) {
  document.querySelectorAll('[data-ms-principal]').forEach((node) => {
    node.removeAttribute('data-ms-principal');
  });
  _mainElement = el;
  _manualPrincipal = el;
  _manualPath = buildCssPath(el);
  _holdPrincipal = false;
  el.setAttribute('data-ms-principal', '');
  _distractionElements = detectDistractions(_mainElement, config);
  document.querySelectorAll('[data-ms-hidden="true"]').forEach((node) => {
    node.removeAttribute('data-ms-hidden');
  });
  _distractionElements.forEach((node) =>
    node.setAttribute('data-ms-hidden', 'true'),
  );
}

/**
 * Re-scan and re-apply after DOM changes (SPA).
 * @param {Object} state
 * @param {Object} config
 */
export function reprocess(state, config) {
  if (!state.modoSimples) {
    applyOptions(state);
    return;
  }
  // Seleção manual aberta (ou principal ainda por escolher): a heurística é incerta, não reaplica
  if (_holdPrincipal || isManualSelectActive()) {
    applyOptions(state);
    return;
  }
  // Escolha manual vence a heurística: reaplica pelo elemento ou, se o host o recriou, pelo caminho
  const manual = findManualPrincipal();
  revertModoSimples();
  if (manual) {
    setPrincipal(manual, config);
    document.documentElement.classList.add('ms-ativo');
    applyOptions(state);
    return;
  }
  scan(config);
  applyModoSimples(state, config);
}

/** @returns {Element|null} principal manual ainda válido no documento atual */
function findManualPrincipal() {
  if (!_manualPrincipal) return null;
  if (document.contains(_manualPrincipal)) return _manualPrincipal;
  if (!_manualPath) return null;
  try {
    return document.querySelector(_manualPath);
  } catch (_) {
    return null;
  }
}
