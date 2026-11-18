import defaults from '../config/defaults.js';
import { queryAll } from './queryAll.js';

/**
 * Detects elements that are considered distracting on the current page.
 *
 * An element is a distraction when ALL of the following are true:
 *   1. It matches one of config.distractionSelectors
 *   2. It is NOT an ancestor of mainElement (would hide the content itself)
 *   3. It is NOT a descendant of mainElement (leave content internals alone)
 *   4. It is NOT the Modo Simples UI container (#ms-container)
 *
 * Trade-off: matching by selector is simple and fast but can miss dynamically
 * named classes (e.g. Tailwind JIT hashes). The MutationObserver + reprocess
 * cycle in domObserver.js handles structural changes after initial detection.
 *
 * @param {Element|null} mainElement  The detected main content element
 * @param {typeof defaults} [config]
 * @returns {Element[]}
 */
export function detectDistractions(mainElement, config = defaults) {
  /** @type {Element[]} */
  const distractions = [];

  const isMsChrome = (el) => {
    if (!el || (!el.id && !el.getAttribute)) return false;
    if (
      el.id === 'ms-container' ||
      el.id === 'ms-session-bar' ||
      el.id === 'ms-simples-chrome'
    ) {
      return true;
    }
    if (el.hasAttribute?.('data-ms-pills')) return true;
    if (
      el.closest?.(
        '#ms-container, #ms-session-bar, #ms-simples-chrome, [data-ms-pills]',
      )
    ) {
      return true;
    }
    return false;
  };

  // Uma varredura para todos os seletores; Set evita O(n²) de includes()
  const seen = new Set();
  for (const el of queryAll(config.distractionSelectors)) {
    // Never hide Modo Simples chrome / pills / host UI
    if (isMsChrome(el)) continue;

    // Never hide a dialog/modal or anything inside one (IMP-20): it would be unusable
    if (
      el.closest?.('[role="dialog"],[role="alertdialog"],[aria-modal="true"]')
    ) {
      continue;
    }

    // Never hide an ancestor of the main content — that would hide the content
    if (mainElement && el.contains(mainElement)) continue;

    // Never hide elements inside the main content
    if (mainElement && mainElement.contains(el)) continue;

    if (!seen.has(el)) {
      seen.add(el);
      distractions.push(el);
    }
  }

  return distractions;
}
