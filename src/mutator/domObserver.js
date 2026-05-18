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
    // Only care about structural changes (added/removed nodes)
    const hasStructural = mutations.some(
      (m) => m.type === 'childList' && m.addedNodes.length > 0,
    );
    if (!hasStructural) return;

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
