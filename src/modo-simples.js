/**
 * src/modo-simples.js — Orchestrator principal
 *
 * Wires FAB + painel "Acessibilidade Digital" (Shadow DOM).
 *
 * API pública:
 *   instance.enable() / disable() / toggle() / configure(patch) / destroy()
 *   configure({ simpleNav: [{ label, href, short? }] }) — pills injetáveis (F5-T11)
 */

import defaults from './config/defaults.js';
import eventBus from './core/eventBus.js';
import state from './core/state.js';
import persistence from './core/persistence.js';
import { hydratePersistedState } from './core/persistedState.js';
import {
  prefersReducedMotion,
  onReducedMotionChange,
} from './utils/mediaQuery.js';
import { announce } from './utils/aria.js';
import { hasSimpleLanguagePairs } from './utils/simpleLanguage.js';
import { getUIStyles } from './ui/styles.js';
import { createFab } from './ui/fab.js';
import { createA11yPanel } from './ui/a11yPanel.js';
import { createSessionChrome } from './ui/sessionChrome.js';
import {
  injectPageStyles,
  setLexendFontUrl,
  scan,
  applyOptions,
  applyModoSimples,
  revert,
  revertModoSimples,
  setPrincipal,
} from './mutator/domMutator.js';
import { startObserving, stopObserving } from './mutator/domObserver.js';
import {
  startReadingRuler,
  stopReadingRuler,
} from './features/readingRuler.js';
import { speakMainContent, stopSpeaking, isSpeaking } from './features/tts.js';
import {
  startManualSelect,
  stopManualSelect,
} from './features/manualSelect.js';
import { createSimpleNav } from './features/simpleNav.js';

const STATE_KEY = 'state';
const PRINCIPAL_KEY = 'principal';

class ModoSimples {
  constructor(userConfig = {}) {
    this._config = { ...defaults, ...userConfig };
    this._host = null;
    this._shadow = null;
    this._fab = null;
    this._panel = null;
    this._chrome = null;
    this._simpleNav = null;
    this._removeMotionListener = null;
    this._removeStateListener = null;
    this._onDocKeydown = null;
    this._onDocClick = null;
    this._initialized = false;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  init() {
    if (this._initialized) return;
    this._initialized = true;

    this._loadPersistedState();
    injectPageStyles();
    setLexendFontUrl(this._config.fontUrl);
    this._buildUI();
    this._bindEvents();

    startObserving(() => state.get(), this._config);
    this._syncReducedMotion();
    this._removeMotionListener = onReducedMotionChange(() =>
      this._syncReducedMotion(),
    );

    const currentState = state.get();
    applyOptions(currentState);

    if (currentState.options.readingRuler) {
      startReadingRuler();
    }

    if (currentState.modoSimples) {
      this._activateModoSimples(currentState, { announce: false });
    }
  }

  destroy() {
    stopReadingRuler();
    stopSpeaking();
    stopManualSelect();
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
    if (this._onDocKeydown) {
      document.removeEventListener('keydown', this._onDocKeydown);
      this._onDocKeydown = null;
    }
    if (this._onDocClick) {
      document.removeEventListener('click', this._onDocClick, true);
      this._onDocClick = null;
    }
    if (this._simpleNav) {
      this._simpleNav.destroy();
      this._simpleNav = null;
    }
    if (this._chrome) {
      this._chrome.destroy();
      this._chrome = null;
    }
    if (this._host?.parentNode) this._host.parentNode.removeChild(this._host);
    const pageStyle = document.getElementById('ms-page-styles');
    if (pageStyle?.parentNode) pageStyle.parentNode.removeChild(pageStyle);
    const lexend = document.getElementById('ms-lexend-font');
    if (lexend?.parentNode) lexend.parentNode.removeChild(lexend);
    state.reset();
    eventBus.clearAll();
    this._initialized = false;
  }

  // ── API pública ────────────────────────────────────────────────────────────

  enable() {
    this._setModoSimples(true);
  }
  disable() {
    this._setModoSimples(false);
  }
  toggle() {
    this._setModoSimples(!state.get().modoSimples);
  }
  /**
   * Ativa/desativa Modo Simples.
   * Ao ativar: linguagem simples + ocultar imagens (respeita preferência salva de “mostrar imagens”).
   * Ao desativar: desliga linguagem simples; imagens voltam (MS não deixa “órfã” a flag).
   * Preferências do painel (tema, escala, Lexend, etc.) permanecem.
   * @param {boolean} on
   */
  _setModoSimples(on) {
    if (on) {
      const preferShow = this._loadPreferShowImages();
      state.set({
        modoSimples: true,
        options: {
          // só liga se a página tem pares data-ms-plain/simple (senão não há o que simplificar)
          simpleLanguage: hasSimpleLanguagePairs(),
          hideImages: !preferShow,
        },
      });
    } else {
      state.set({
        modoSimples: false,
        options: {
          simpleLanguage: false,
          hideImages: false,
        },
      });
    }
  }

  _loadPreferShowImages() {
    if (!this._config.persistence) return false;
    const key = 'preferShowImagesInMs';
    const v = this._config.hostnamePersistence
      ? persistence.loadForHost(key, false)
      : persistence.load(key, false);
    return !!v;
  }

  _savePreferShowImages(show) {
    if (!this._config.persistence) return;
    const key = 'preferShowImagesInMs';
    if (this._config.hostnamePersistence) {
      persistence.saveForHost(key, !!show);
    } else {
      persistence.save(key, !!show);
    }
  }
  configure(patch) {
    this._config = { ...this._config, ...patch };
    if (Object.prototype.hasOwnProperty.call(patch, 'fontUrl')) {
      setLexendFontUrl(this._config.fontUrl);
    }
    if (
      this._initialized &&
      Object.prototype.hasOwnProperty.call(patch, 'sessionBar')
    ) {
      this._syncSessionChrome();
    }
    if (
      this._initialized &&
      Object.prototype.hasOwnProperty.call(patch, 'simpleNav')
    ) {
      this._syncSimpleNav();
    }
  }

  // ── UI Construction ────────────────────────────────────────────────────────

  _buildUI() {
    this._host = document.createElement('div');
    this._host.id = 'ms-container';
    document.body.appendChild(this._host);

    this._shadow = this._host.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = getUIStyles(this._config.position);
    this._shadow.appendChild(styleEl);

    const s = state.get();

    this._panel = createA11yPanel({
      state: s,
      onClose: () => this._closePanel(),
      onToggleModoSimples: (value) => this._setModoSimples(value),
      onSetOption: (key, value) => {
        state.set({ options: { [key]: value } });
        if (key === 'hideImages' && state.get().modoSimples) {
          this._savePreferShowImages(!value);
        }
      },
      onSpeak: () => this._toggleSpeak(),
      brand: this._config.brand,
    });
    this._shadow.appendChild(this._panel.element);

    this._fab = createFab({
      onClick: () => this._togglePanel(),
    });
    this._shadow.appendChild(this._fab.element);

    this._fab.sync({ panelOpen: s.panelOpen });
    this._panel.sync(s);
    if (s.panelOpen) this._panel.open();

    this._syncSessionChrome();

    this._simpleNav = createSimpleNav();
    this._syncSimpleNav();
    // Reposiciona SIMPLES após pills (MS on some com o header)
    if (this._chrome) this._chrome.sync(s);
  }

  /** Cria/destrói a barra de sessão conforme config.sessionBar (default: desligada). */
  _syncSessionChrome() {
    if (this._config.sessionBar && !this._chrome) {
      this._chrome = createSessionChrome({
        mount: this._config.mount || {},
        onToggleModoSimples: (value) => this._setModoSimples(value),
        onOpenPanel: () => this._openPanel(),
        onSpeak: () => this._toggleSpeak(),
        onToggleSimpleLanguage: (value) =>
          state.set({ options: { simpleLanguage: value } }),
        onToggleHideImages: (hide) => {
          state.set({ options: { hideImages: hide } });
          if (state.get().modoSimples) this._savePreferShowImages(!hide);
        },
      });
      this._chrome.sync(state.get());
    } else if (!this._config.sessionBar && this._chrome) {
      this._chrome.destroy();
      this._chrome = null;
    }
  }

  _syncSimpleNav() {
    if (!this._simpleNav) return;
    this._simpleNav.sync(this._config.simpleNav);
    if (this._chrome) this._chrome.sync(state.get());
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  _bindEvents() {
    this._onDocKeydown = (e) => {
      if (e.key === 'Escape' && state.get().panelOpen) {
        this._closePanel();
        this._fab?.button?.focus();
      }
    };
    document.addEventListener('keydown', this._onDocKeydown);

    this._onDocClick = (e) => {
      if (!state.get().panelOpen) return;
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      if (
        path.includes(this._host) ||
        path.includes(this._panel?.element) ||
        path.includes(this._fab?.element)
      ) {
        return;
      }
      // Clicks that land on the host (open shadow) still include host in composedPath
      if (e.target === this._host) return;
      if (!this._host?.contains(e.target) && e.target !== this._host) {
        this._closePanel();
      }
    };
    document.addEventListener('click', this._onDocClick, true);

    this._removeStateListener = eventBus.on('stateChange', ({ prev, next }) => {
      this._onStateChange(prev, next);
    });
  }

  // ── Panel management ───────────────────────────────────────────────────────

  _togglePanel() {
    state.get().panelOpen ? this._closePanel() : this._openPanel();
  }

  _openPanel() {
    state.set({ panelOpen: true });
    this._panel.open();
    this._fab.sync({ panelOpen: true });
    announce('Painel de acessibilidade aberto');
  }

  _closePanel() {
    state.set({ panelOpen: false });
    this._panel.close();
    this._fab.sync({ panelOpen: false });
  }

  _toggleSpeak() {
    if (isSpeaking()) {
      stopSpeaking();
      announce('Leitura interrompida');
      this._syncSpeaking(false);
    } else {
      speakMainContent();
      announce('Lendo conteúdo principal');
      this._syncSpeaking(true);
      const check = setInterval(() => {
        if (!isSpeaking()) {
          clearInterval(check);
          this._syncSpeaking(false);
        }
      }, 400);
    }
  }

  _syncSpeaking(speaking) {
    const s = state.get();
    if (this._panel) this._panel.sync(s, { speaking });
    if (this._chrome) this._chrome.sync(s, { speaking });
  }

  // ── Modo Simples activation ────────────────────────────────────────────────

  _activateModoSimples(currentState, { announce: doAnnounce = true } = {}) {
    const savedPath = this._loadPrincipalPath();
    if (savedPath) {
      try {
        const el = document.querySelector(savedPath);
        if (el) {
          setPrincipal(el, this._config);
          document.documentElement.classList.add('ms-ativo');
          applyOptions(currentState);
          if (doAnnounce) announce('Modo Simples ativado');
          return;
        }
      } catch (_) {
        // Invalid saved selector — fall through to scan
      }
    }

    const { confidence } = scan(this._config);
    if (confidence < this._config.confidenceThreshold) {
      applyModoSimples(currentState, this._config);
      startManualSelect({
        onSelect: (el, path) => {
          setPrincipal(el, this._config);
          this._savePrincipalPath(path);
          announce('Conteúdo principal definido');
        },
        onCancel: () => {
          announce('Seleção manual cancelada');
        },
      });
    } else {
      applyModoSimples(currentState, this._config);
    }

    if (doAnnounce) announce('Modo Simples ativado');
  }

  // ── State reactions ────────────────────────────────────────────────────────

  _onStateChange(prev, next) {
    if (this._fab) this._fab.sync({ panelOpen: next.panelOpen });
    if (this._panel) this._panel.sync(next, { speaking: isSpeaking() });
    if (this._chrome) this._chrome.sync(next, { speaking: isSpeaking() });

    if (prev.modoSimples !== next.modoSimples) {
      if (next.modoSimples) {
        this._activateModoSimples(next);
      } else {
        stopManualSelect();
        revertModoSimples();
        applyOptions(next);
        announce('Modo Simples desativado');
      }
    }

    const optionKeys = [
      'textScale',
      'colorTheme',
      'dyslexiaFont',
      'readingRuler',
      'highlightLinks',
      'textSpacing',
      'reducedMotion',
      'hideImages',
      'simpleLanguage',
    ];
    const optionChanged = optionKeys.some(
      (k) => prev.options[k] !== next.options[k],
    );
    if (optionChanged) {
      applyOptions(next);
    }

    if (prev.options.readingRuler !== next.options.readingRuler) {
      if (next.options.readingRuler) startReadingRuler();
      else stopReadingRuler();
      announce(
        next.options.readingRuler
          ? 'Régua de leitura ativada'
          : 'Régua de leitura desativada',
      );
    }

    const announcements = {
      dyslexiaFont: ['Fonte Lexend ativada', 'Fonte Lexend desativada'],
      highlightLinks: [
        'Destaque de links ativado',
        'Destaque de links desativado',
      ],
      textSpacing: [
        'Espaçamento de texto ativado',
        'Espaçamento de texto desativado',
      ],
      hideImages: ['Imagens ocultadas', 'Imagens visíveis'],
      reducedMotion: [
        'Movimento reduzido ativado',
        'Movimento reduzido desativado',
      ],
      simpleLanguage: [
        'Linguagem simples ligada',
        'Linguagem simples desligada',
      ],
    };
    Object.entries(announcements).forEach(([k, [on, off]]) => {
      if (prev.options[k] !== next.options[k])
        announce(next.options[k] ? on : off);
    });

    if (prev.options.textScale !== next.options.textScale) {
      announce(`Tamanho do texto ${next.options.textScale}%`);
    }
    if (prev.options.colorTheme !== next.options.colorTheme) {
      const labels = {
        senac: 'Cores do site',
        yellowBlack: 'Amarelo e Preto',
        darkHigh: 'Modo Escuro Alto',
        soft: 'Descanso Suave',
      };
      announce(
        `Tema ${labels[next.options.colorTheme] || next.options.colorTheme}`,
      );
    }

    this._persistState(next);
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  _persistState(next) {
    if (!this._config.persistence) return;
    const payload = { modoSimples: next.modoSimples, options: next.options };
    if (this._config.hostnamePersistence) {
      persistence.saveForHost(STATE_KEY, payload);
    } else {
      persistence.save(STATE_KEY, payload);
    }
  }

  _loadPersistedState() {
    if (!this._config.persistence) return;
    const saved = this._config.hostnamePersistence
      ? persistence.loadForHost(STATE_KEY)
      : persistence.load(STATE_KEY);
    if (!saved) return;

    const patch = hydratePersistedState(saved);
    if (patch) state.set(patch);
  }

  _savePrincipalPath(path) {
    if (!this._config.persistence || !path) return;
    if (this._config.hostnamePersistence) {
      persistence.saveForHost(PRINCIPAL_KEY, path);
    } else {
      persistence.save(PRINCIPAL_KEY, path);
    }
  }

  _loadPrincipalPath() {
    if (!this._config.persistence) return null;
    return this._config.hostnamePersistence
      ? persistence.loadForHost(PRINCIPAL_KEY)
      : persistence.load(PRINCIPAL_KEY);
  }

  // ── System preferences ─────────────────────────────────────────────────────

  _syncReducedMotion() {
    if (prefersReducedMotion()) {
      state.set({ options: { reducedMotion: true } });
    }
  }
}

/**
 * Config pré-boot opcional: <script>window.ModoSimplesConfig = { ... }</script> antes do bundle.
 * @param {{ ModoSimplesConfig?: unknown }} win
 * @returns {Object}
 */
export function readPreBootConfig(win) {
  const cfg = win && win.ModoSimplesConfig;
  return cfg && typeof cfg === 'object' ? cfg : {};
}

// ── Auto-boot ──────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  function boot() {
    const instance = new ModoSimples(readPreBootConfig(window));
    instance.init();
    window.ModoSimples = instance;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}

export default ModoSimples;
