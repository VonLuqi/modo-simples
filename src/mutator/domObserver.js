import { reprocess } from './domMutator.js';

/**
 * MutationObserver wrapper for SPA support.
 *
 * Watches document.body for structural DOM changes (added/removed nodes).
 * When Modo Simples is active and a structural change is detected, schedules
 * a reprocess() call after a debounce delay so short-lived micro-mutations
 * (e.g. loading spinners, tooltip insertions) do not trigger expensive re-scans.
 *
 * Trade-off — debounce delay:
 *   Too short → excessive re-scans during SPA transitions
 *   Too long  → stale hidden-state stays visible briefly after navigation
 *   Default 300ms is a reasonable middle ground for most SPA routers.
 *
 * The observer only reprocesses when Modo Simples is already ON.
 * When it's off, mutations are ignored to avoid any performance cost.
 */

/** Nós criados pela própria lib: mutações neles nunca devem disparar reprocess (IMP-01). */
const OWN_SELECTOR = [
  '#ms-container',
  '#ms-session-bar',
  '#ms-simples-chrome',
  '#ms-manual-select-banner',
  '#ms-reading-ruler',
  '[data-ms-pills][data-ms-injected]',
  '[data-ms-live]',
].join(',');

/** @param {Node|null} node */
function isOwnNode(node) {
  return (
    !!node &&
    node.nodeType === 1 &&
    typeof node.closest === 'function' &&
    !!node.closest(OWN_SELECTOR)
  );
}

/** Mutação relevante = adicionou algum nó do host (fora dos nós da lib). */
function isRelevantMutation(m) {
  if (m.type !== 'childList' || m.addedNodes.length === 0) return false;
  if (isOwnNode(m.target)) return false;
  for (const node of m.addedNodes) {
    if (!isOwnNode(node)) return true;
  }
  return false;
}

/** @type {MutationObserver|null} */
let _observer = null;

/** @type {ReturnType<typeof setTimeout>|null} */
let _debounceTimer = null;

/**
 * Start observing document.body for structural changes.
 * Idempotent — calling this multiple times has no extra effect.
 *
 * @param {() => Object} getState  Returns current state snapshot
 * @param {Object}       config    Current configuration
 */
export function startObserving(getState, config) {
  if (_observer) return; // Already running

  _observer = new MutationObserver((mutations) => {
    // Só interessam nós ADICIONADOS do host (nós da própria lib são ignorados)
    if (!mutations.some(isRelevantMutation)) return;

    // Only reprocess if Modo Simples is currently active
    const state = getState();
    if (!state.modoSimples) return;

    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      reprocess(getState(), config);
    }, config.reprocessDebounce ?? 300);
  });

  _observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Disconnect the observer and cancel any pending reprocess.
 * Called by ModoSimples.destroy().
 */
export function stopObserving() {
  if (_observer) {
    _observer.disconnect();
    _observer = null;
  }
  clearTimeout(_debounceTimer);
  _debounceTimer = null;
}
