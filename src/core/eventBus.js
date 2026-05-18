/**
 * Lightweight internal event bus.
 *
 * Keeps every module decoupled — state changes and UI events flow through
 * here instead of modules calling each other directly.
 *
 * Usage:
 *   const unsub = eventBus.on('stateChange', handler);
 *   eventBus.emit('stateChange', { prev, next });
 *   unsub(); // unsubscribe
 */
const eventBus = {
  /** @type {Record<string, Function[]>} */
  _listeners: {},

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    return () => this.off(event, callback);
  },

  /**
   * Unsubscribe a specific callback from an event.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((cb) => cb !== callback);
  },

  /**
   * Emit an event, invoking all registered callbacks with data.
   * Errors inside callbacks are caught and logged so a bad handler cannot
   * crash the whole system.
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    const listeners = this._listeners[event];
    if (!listeners || listeners.length === 0) return;
    // Shallow copy so unsubscribing inside a handler is safe
    [...listeners].forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[ModoSimples] Event handler error:', err);
      }
    });
  },

  /**
   * Remove all listeners for one event. Used on destroy().
   * @param {string} event
   */
  clear(event) {
    delete this._listeners[event];
  },

  /** Remove all listeners for every event. */
  clearAll() {
    this._listeners = {};
  },
};

export default eventBus;
