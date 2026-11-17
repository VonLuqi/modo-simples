/**
 * localStorage wrapper with safe fallback.
 *
 * All keys are prefixed with 'ms_' to avoid collisions with the host site's
 * own localStorage usage. Every method catches errors silently because
 * localStorage can be blocked (private mode, CSP, quota exceeded, etc.).
 *
 * Trade-off: silent failure means the user won't see their preferences
 * persisted, but the script keeps working without crashing.
 */
const KEY_PREFIX = 'ms_';

const persistence = {
  /**
   * Save a JSON-serialisable value.
   * @param {string} key
   * @param {*} value
   */
  save(key, value) {
    try {
      localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
    } catch (_) {
      // Blocked or quota exceeded — fail silently
    }
  },

  /**
   * Load a previously saved value.
   * @param {string} key
   * @param {*} [fallback=null] Value returned when the key is not found or parsing fails
   * @returns {*}
   */
  load(key, fallback = null) {
    try {
      const raw = localStorage.getItem(KEY_PREFIX + key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  },

  /**
   * Remove a saved value.
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(KEY_PREFIX + key);
    } catch (_) {
      // Fail silently
    }
  },

  /**
   * Build a hostname-scoped key: `base:hostname`.
   * @param {string} base
   * @returns {string}
   */
  hostKey(base) {
    const host =
      typeof location !== 'undefined' && location.hostname
        ? location.hostname
        : 'local';
    return `${base}:${host}`;
  },

  /**
   * Save a value under a hostname-scoped key.
   * @param {string} base
   * @param {*} value
   */
  saveForHost(base, value) {
    this.save(this.hostKey(base), value);
  },

  /**
   * Remove a value saved under a hostname-scoped key.
   * @param {string} base
   */
  removeForHost(base) {
    this.remove(this.hostKey(base));
  },

  /**
   * Load a value from a hostname-scoped key.
   * @param {string} base
   * @param {*} [fallback=null]
   * @returns {*}
   */
  loadForHost(base, fallback = null) {
    return this.load(this.hostKey(base), fallback);
  },

  /**
   * Build a page-scoped key: `base@/pathname:hostname`.
   * Para dados que só fazem sentido numa página (ex.: conteúdo principal escolhido).
   * @param {string} base
   * @returns {string}
   */
  pathKey(base) {
    const path =
      typeof location !== 'undefined' && location.pathname
        ? location.pathname
        : '/';
    return `${base}@${path}:${this.hostKey('').slice(1)}`;
  },

  /** @param {string} base @param {*} value */
  saveForPath(base, value) {
    this.save(this.pathKey(base), value);
  },

  /** @param {string} base */
  removeForPath(base) {
    this.remove(this.pathKey(base));
  },

  /**
   * Load a page-scoped value. Sem registro para a página, devolve fallback
   * (quem migra dados antigos consulta a chave por host explicitamente).
   * @param {string} base
   * @param {*} [fallback=null]
   * @returns {*}
   */
  loadForPath(base, fallback = null) {
    return this.load(this.pathKey(base), fallback);
  },
};

export default persistence;
