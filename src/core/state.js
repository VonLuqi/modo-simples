import eventBus from './eventBus.js';

/**
 * Single, immutable-style state store.
 *
 * State is never mutated in place — set() produces a new snapshot and emits
 * 'stateChange' so every subscriber receives { prev, next } and can react
 * independently without coupling to each other.
 *
 * Shape:
 *   {
 *     modoSimples: boolean,   // Modo Simples activation flag
 *     panelOpen:   boolean,   // accessibility panel open/closed
 *     options: {
 *       reducedMotion: boolean,  // synced from prefers-reduced-motion
 *       highContrast:  boolean,  // user-enabled high contrast
 *       largerText:    boolean,  // user-enabled larger text
 *     }
 *   }
 */

/** @type {import('../types.js').AppState} */
const initialState = {
  modoSimples: false,
  panelOpen: false,
  options: {
    reducedMotion: false,
    highContrast: false,
    largerText: false,
  },
};

/** Deep clone for our two-level state shape (no circular refs, no Date/Map). */
function cloneState(s) {
  return { ...s, options: { ...s.options } };
}

function createState(initial) {
  let current = cloneState(initial);

  return {
    /** Returns a snapshot — never a direct reference to internal state. */
    get() {
      return cloneState(current);
    },

    /**
     * Merge a patch into current state and emit 'stateChange'.
     * Nested `options` are merged (not replaced), so partial patches work:
     *   state.set({ options: { highContrast: true } })
     *   → only highContrast changes; others are preserved.
     *
     * @param {Partial<import('../types.js').AppState>} patch
     */
    set(patch) {
      const prev = cloneState(current);

      if (patch.options) {
        current = {
          ...current,
          ...patch,
          options: { ...current.options, ...patch.options },
        };
      } else {
        current = { ...current, ...patch };
      }

      eventBus.emit('stateChange', { prev, next: cloneState(current) });
    },

    /** Reset state to initial values (e.g. on destroy). */
    reset() {
      this.set(cloneState(initialState));
    },
  };
}

const state = createState(initialState);

export default state;
