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
 *       lineHeight / wordSpacing / letterSpacing: number (0 = padrão; ver TYPO_LIMITS),
 *       cursorStyle:   'default'|'bigWhite'|'bigBlack',
 *       reducedMotion: boolean,
 *       hideImages:    boolean,
 *       simpleLanguage: boolean,
 *       readFocus:     boolean,  // F7b: lê em voz alta o elemento focado
 *     }
 *   }
 */

/**
 * F8b — tipografia fina. 0 = sem override (usa o site / o preset textSpacing).
 * lineHeight sem unidade; wordSpacing/letterSpacing em em. Os máximos passam do WCAG 1.4.12
 * (linha 1,5 · palavra 0,16em · letra 0,12em).
 */
export const TYPO_LIMITS = {
  lineHeight: { min: 1.5, max: 3, step: 0.1 },
  wordSpacing: { min: 0, max: 0.8, step: 0.02 },
  letterSpacing: { min: 0, max: 0.3, step: 0.01 },
};

/** Número seguro (vem de storage/painel): inválido ou ≤ 0 → 0; senão limitado ao intervalo. */
export function clampTypo(key, value) {
  const n = Number(value);
  const lim = TYPO_LIMITS[key];
  if (!lim || !Number.isFinite(n) || n <= 0) return 0;
  return Math.round(Math.min(lim.max, Math.max(lim.min, n)) * 100) / 100;
}

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
    lineHeight: 0,
    wordSpacing: 0,
    letterSpacing: 0,
    cursorStyle: 'default',
    reducedMotion: false,
    hideImages: false,
    simpleLanguage: false,
    readFocus: false,
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
