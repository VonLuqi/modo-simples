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
 *     modoSimples: boolean,
 *     panelOpen:   boolean,
 *     options: {
 *       textScale:     '100'|'125'|'150'|'175',
 *       colorTheme:    'senac'|'yellowBlack'|'darkHigh'|'soft',
 *       dyslexiaFont:  boolean,
 *       readingRuler:  boolean,
 *       highlightLinks: boolean,
 *       textSpacing:   boolean,
 *       reducedMotion: boolean,
 *       hideImages:    boolean,
 *       simpleLanguage: boolean,
 *     }
 *   }
 */

const initialState = {
  modoSimples: false,
  panelOpen: false,
  options: {
    textScale: '100',
    colorTheme: 'senac',
    colorSaturation: 'normal',
    customText: '',
    customHeading: '',
    customBg: '',
    dyslexiaFont: false,
    readingRuler: false,
    highlightLinks: false,
    textSpacing: false,
    reducedMotion: false,
    hideImages: false,
    simpleLanguage: false,
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
     *   state.set({ options: { textScale: '150' } })
     *   → only textScale changes; others are preserved.
     *
     * @param {Object} patch
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
