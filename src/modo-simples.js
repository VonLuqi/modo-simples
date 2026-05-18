import defaults from './config/defaults.js';
import eventBus from './core/eventBus.js';
import state from './core/state.js';
import persistence from './core/persistence.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils/mediaQuery.js';
import { announce } from './utils/aria.js';
import { getUIStyles } from './ui/styles.js';
import { createFloatingButton } from './ui/button.js';
import { createPanel } from './ui/panel.js';
import { injectPageStyles, scan, apply, revert } from './mutator/domMutator.js';
import { startObserving, stopObserving } from './mutator/domObserver.js';

/**
 * ModoSimples — orchestrator class.
 *
 * Wires all modules together:
 *   - Builds the Shadow DOM UI (button + panel)
 *   - Manages state lifecycle (load → react → persist)
 *   - Delegates DOM mutations to domMutator
 *   - Delegates observation to domObserver
 *
 * Public API:
 *   instance.enable()           Activate Modo Simples
 *   instance.disable()          Deactivate Modo Simples
 *   instance.toggle()           Toggle Modo Simples
 *   instance.configure(patch)   Override config at runtime
 *   instance.destroy()          Fully remove from page
 *
 * Auto-boot: when loaded as a plain <script> (IIFE bundle), the class
 * instantiates itself and boots immediately. Integrators using ES modules
 * can call `new ModoSimples(config).init()` manually.
 */
class ModoSimples {
  /**
   * @param {Partial<typeof defaults>} [userConfig]
   */
  constructor(userConfig = {}) {
    this._config = { ...defaults, ...userConfig };

    /** @type {HTMLElement|null} */
    this._host = null;
    /** @type {ShadowRoot|null} */
    this._shadow = null;
    /** @type {ReturnType<typeof createFloatingButton>|null} */
    this._button = null;
    /** @type {ReturnType<typeof createPanel>|null} */
    this._panel = null;
    /** @type {Function|null} Unsubscribe from reduced-motion OS change */
    this._removeMotionListener = null;
    /** @type {Function|null} Unsubscribe from state changes */
    this._removeStateListener = null;

    this._initialized = false;
  }

  // ── Lifecycle ───────────────────────────────────────────────

  /**
   * Bootstrap the script. Safe to call multiple times (idempotent).
   * Should be called after DOMContentLoaded.
   */
  init() {
    if (this._initialized) return;
    this._initialized = true;

    // 1. Load persisted state before building UI
    this._loadPersistedState();

    // 2. Inject page-level CSS (scoped to html.ms-ativo — dormant until enabled)
    injectPageStyles();

    // 3. Build Shadow DOM UI
    this._buildUI();

    // 4. Wire all event handlers
    this._bindEvents();

    // 5. Start DOM observer for SPA support
    startObserving(() => state.get(), this._config);

    // 6. Sync initial reduced-motion preference from OS, then watch for changes
    this._syncReducedMotion();
    this._removeMotionListener = onReducedMotionChange(() => this._syncReducedMotion());

    // 7. Re-apply if Modo Simples was ON when the user last left the page
    const currentState = state.get();
    if (currentState.modoSimples) {
      scan(this._config);
      apply(currentState, this._config);
    }
  }

  /**
   * Completely remove Modo Simples from the page.
   * Reverts DOM changes, removes the UI, and releases all listeners.
   */
  destroy() {
    revert();
    stopObserving();

    if (this._removeMotionListener) {
      this._removeMotionListener();
      this._removeMotionListener = null;
    }
    if (this._removeStateListener) {
      this._removeStateListener();
      this._removeStateListener = null;
    }

    if (this._host && this._host.parentNode) {
      this._host.parentNode.removeChild(this._host);
    }

    const pageStyle = document.getElementById('ms-page-styles');
    if (pageStyle && pageStyle.parentNode) {
      pageStyle.parentNode.removeChild(pageStyle);
    }

    state.reset();
    eventBus.clearAll();
    this._initialized = false;
  }

  // ── Public API ──────────────────────────────────────────────

  /** Activate Modo Simples. */
  enable() {
    state.set({ modoSimples: true });
  }

  /** Deactivate Modo Simples. */
  disable() {
    state.set({ modoSimples: false });
  }

  /** Toggle Modo Simples on/off. */
  toggle() {
    state.set({ modoSimples: !state.get().modoSimples });
  }

  /**
   * Override configuration at runtime.
   * Useful for integrators who need custom selectors per page.
   * @param {Partial<typeof defaults>} patch
   */
  configure(patch) {
    this._config = { ...this._config, ...patch };
  }

  // ── Private — UI construction ───────────────────────────────

  _buildUI() {
    // Shadow DOM host: position:fixed, full viewport, pointer-events:none
    // (the button and panel re-enable pointer-events inside the shadow root)
    this._host = document.createElement('div');
    this._host.id = 'ms-container';
    document.body.appendChild(this._host);

    this._shadow = this._host.attachShadow({ mode: 'open' });

    // Inject Shadow DOM styles
    const styleEl = document.createElement('style');
    styleEl.textContent = getUIStyles(this._config.position);
    this._shadow.appendChild(styleEl);

    // Floating button
    this._button = createFloatingButton();
    this._shadow.appendChild(this._button.element);

    // Accessibility panel (dialog)
    const s = state.get();
    this._panel = createPanel({
      state: s,
      onToggleModoSimples: (checked) => state.set({ modoSimples: checked }),
      onToggleHighContrast: (checked) => state.set({ options: { highContrast: checked } }),
      onToggleLargerText: (checked) => state.set({ options: { largerText: checked } }),
      onClose: () => this._closePanel(),
    });
    this._shadow.appendChild(this._panel.element);
  }

  // ── Private — Event wiring ──────────────────────────────────

  _bindEvents() {
    // Button click → toggle panel
    this._button.element.addEventListener('click', () => this._togglePanel());

    // Esc key closes panel from anywhere on the page
    // Keyboard events cross shadow boundaries, so listening on document works
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.get().panelOpen) {
        this._closePanel();
        // Return focus to the trigger button (WCAG dialog pattern)
        this._button.element.focus();
      }
    });

    // React to state changes
    this._removeStateListener = eventBus.on('stateChange', ({ prev, next }) => {
      this._onStateChange(prev, next);
    });
  }

  // ── Private — Panel management ──────────────────────────────

  _togglePanel() {
    if (state.get().panelOpen) {
      this._closePanel();
    } else {
      this._openPanel();
    }
  }

  _openPanel() {
    state.set({ panelOpen: true });
    this._button.setExpanded(true);
    this._panel.open();
    announce('Painel de acessibilidade aberto');
  }

  _closePanel() {
    state.set({ panelOpen: false });
    this._button.setExpanded(false);
    this._panel.close();
  }

  // ── Private — State reactions ───────────────────────────────

  /**
   * Reacts to every state mutation and orchestrates side-effects:
   *   - Sync panel toggle visuals
   *   - Apply/revert Modo Simples DOM transformations
   *   - Re-apply when options change while Modo Simples is active
   *   - Persist state to localStorage
   *
   * @param {Object} prev Previous state snapshot
   * @param {Object} next New state snapshot
   */
  _onStateChange(prev, next) {
    // Sync panel toggle checkboxes with new state
    if (this._panel) this._panel.updateToggles(next);

    // Handle Modo Simples activation / deactivation
    if (prev.modoSimples !== next.modoSimples) {
      if (next.modoSimples) {
        scan(this._config);
        apply(next, this._config);
        announce('Modo Simples ativado');
      } else {
        revert();
        announce('Modo Simples desativado');
      }
    }

    // Re-apply when an option changes while Modo Simples is already on
    // (e.g. user toggles highContrast → root classes need updating)
    const optionChanged =
      prev.options.highContrast !== next.options.highContrast ||
      prev.options.largerText !== next.options.largerText;

    if (next.modoSimples && optionChanged) {
      // Lightweight re-apply: revert root classes only, then re-add
      revert();
      apply(next, this._config);
    }

    // Persist relevant state (not panelOpen — that's transient UI state)
    if (this._config.persistence) {
      persistence.save('state', {
        modoSimples: next.modoSimples,
        options: next.options,
      });
    }
  }

  // ── Private — Persistence ───────────────────────────────────

  _loadPersistedState() {
    if (!this._config.persistence) return;
    const saved = persistence.load('state');
    if (!saved) return;

    state.set({
      modoSimples: Boolean(saved.modoSimples),
      options: {
        highContrast: Boolean(saved.options?.highContrast),
        largerText: Boolean(saved.options?.largerText),
        reducedMotion: Boolean(saved.options?.reducedMotion),
      },
    });
  }

  // ── Private — System preferences ───────────────────────────

  /**
   * Sync reducedMotion state with the OS preference.
   * The system preference always overrides the stored value.
   */
  _syncReducedMotion() {
    state.set({ options: { reducedMotion: prefersReducedMotion() } });
  }
}

// ── Auto-boot ──────────────────────────────────────────────────
//
// When used as a plain <script> (IIFE bundle), instantiate and boot
// automatically once the DOM is ready.
//
// When used as an ES module, the consumer controls instantiation:
//   import ModoSimples from './modo-simples.js';
//   new ModoSimples({ position: 'bottom-left' }).init();

if (typeof window !== 'undefined') {
  function boot() {
    const instance = new ModoSimples();
    instance.init();
    // Expose on window so page code can control it (e.g. window.ModoSimples.disable())
    window.ModoSimples = instance;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    // DOMContentLoaded already fired (script loaded with defer or at bottom of body)
    boot();
  }
}

export default ModoSimples;

