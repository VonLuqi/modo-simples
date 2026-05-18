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
};

export default persistence;
