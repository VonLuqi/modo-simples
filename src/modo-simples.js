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
import { mergeConfig } from './config/mergeConfig.js';
import state from './core/state.js';
import { diffStateAnnouncements } from './core/announcements.js';
import {
  saveHideImagesBeforeMs,
  takeHideImagesBeforeMs,
  loadPreferShowImages,
  savePreferShowImages,
  persistState,
  loadPersistedState,
  loadPanelSide,
  savePanelSide,
  savePrincipalPath,
  loadPrincipal,
  discardPrincipal,
  isPlausiblePrincipal,
  legacyHintFits,
} from './core/instancePersistence.js';
import {
  prefersReducedMotion,
  onReducedMotionChange,
} from './utils/mediaQuery.js';
import { announce } from './utils/aria.js';
import { hasSimpleLanguagePairs } from './utils/simpleLanguage.js';
import { getPageStyles, getUIStyles } from './ui/styles.js';
import {
  buildUI,
  syncSessionChrome,
  syncSimpleNav,
  bindEvents,
  togglePanel,
  openPanel,
  setPageInert,
  inertSibling,
  closePanel,
  toggleSpeak,
  syncSpeaking,
  resetAll,
  movePanelSide,
  hideWidget,
  showWidget,
} from './ui/binding.js';
import {
  injectPageStyles,
  setLexendFontUrl,
  scan,
  applyOptions,
  applyModoSimples,
  revert,
  revertModoSimples,
  setPrincipal,
  holdPrincipal,
} from './mutator/domMutator.js';
import { startObserving, stopObserving } from './mutator/domObserver.js';
import {
  startReadingRuler,
  stopReadingRuler,
} from './features/readingRuler.js';
import { stopSpeaking, isSpeaking } from './features/tts.js';
import { startFocusReader, stopFocusReader } from './features/focusReader.js';
import {
  startManualSelect,
  stopManualSelect,
  showLowConfidenceNotice,
} from './features/manualSelect.js';

class ModoSimples {
  constructor(userConfig = {}) {
    this._config = mergeConfig(defaults, userConfig);
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
    this._removeSpeakListener = null;
    this._styleEl = null;
    /** escolha explícita do usuário para reducedMotion (null = segue o SO) */
    this._reducedMotionUser = null;
    /** hideImages de antes de ligar o MS (null = sem registro) */
    this._hideImagesBeforeMs = null;
    /** último payload gravado (JSON), para não regravar igual (IMP-39) */
    this._lastPersisted = null;
    this._initialized = false;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  init() {
    if (this._initialized) return;
    this._initialized = true;

    this._loadPersistedState();
    injectPageStyles(getPageStyles());
    setLexendFontUrl(this._config.fontUrl);
    this._buildUI();
    this._bindEvents();

    startObserving(
      () => state.get(),
      () => this._config, // getter: configure() troca o objeto de config (IMP-16)
    );
    this._syncReducedMotion();
    this._removeMotionListener = onReducedMotionChange(() =>
      this._syncReducedMotion(),
    );

    const currentState = state.get();
    applyOptions(currentState);

    if (currentState.options.readingRuler) {
      startReadingRuler();
    }
    if (currentState.options.readFocus) startFocusReader();

    if (currentState.modoSimples) {
      this._activateModoSimples(currentState, { announce: false });
      this._announceRestoredOnce();
    }
  }

  /**
   * Modo restaurado em outra página: silêncio a cada navegação, mas uma única vez por sessão
   * avisa que continua ligado (UX-19). Sem sessionStorage, fica em silêncio.
   */
  _announceRestoredOnce() {
    try {
      if (sessionStorage.getItem('ms_restoreAnnounced')) return;
      sessionStorage.setItem('ms_restoreAnnounced', '1');
    } catch (_) {
      return;
    }
    announce('Modo Simples continua ligado');
  }

  destroy() {
    // Instância que nunca subiu não pode derrubar a UI/estado de outra (state e DOM são compartilhados)
    if (!this._initialized) return;
    if (this._removeSpeakListener) {
      this._removeSpeakListener();
      this._removeSpeakListener = null;
    }
    stopReadingRuler();
    stopFocusReader();
    stopSpeaking();
    stopManualSelect();
    this._setPageInert(false);
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
    // sem eventBus.clearAll(): o único listener desta instância já foi removido acima
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
      // guarda a escolha de imagens de ANTES do MS (só na transição off→on) para restaurar (IMP-17)
      if (!state.get().modoSimples) {
        this._saveHideImagesBeforeMs(state.get().options.hideImages);
      }
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
          hideImages: this._takeHideImagesBeforeMs(),
        },
      });
    }
  }

  /** Guarda (memória + storage) se as imagens estavam ocultas antes de ligar o MS. */
  _saveHideImagesBeforeMs(hide) {
    saveHideImagesBeforeMs(this, hide);
  }

  /** Lê e esquece o valor guardado; sem registro (ex.: MS já estava ligado) = imagens visíveis. */
  _takeHideImagesBeforeMs() {
    return takeHideImagesBeforeMs(this);
  }

  /** Delegate: ver loadPreferShowImages() em src/core/instancePersistence.js. */
  _loadPreferShowImages() {
    return loadPreferShowImages(this);
  }

  /** Delegate: ver savePreferShowImages() em src/core/instancePersistence.js. */
  _savePreferShowImages(show) {
    savePreferShowImages(this, show);
  }
  configure(patch) {
    this._config = mergeConfig(this._config, patch);
    if (Object.prototype.hasOwnProperty.call(patch, 'fontUrl')) {
      setLexendFontUrl(this._config.fontUrl);
    }
    // position: refaz o CSS do Shadow DOM (FAB + painel) em runtime (IMP-31)
    if (
      this._initialized &&
      this._styleEl &&
      Object.prototype.hasOwnProperty.call(patch, 'position')
    ) {
      this._styleEl.textContent = getUIStyles(this._config.position);
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

  /** Delegate: ver buildUI() em src/ui/binding.js. */
  _buildUI() {
    buildUI(this);
  }

  /** Delegate: ver syncSessionChrome() em src/ui/binding.js. */
  _syncSessionChrome() {
    syncSessionChrome(this);
  }

  /** Delegate: ver syncSimpleNav() em src/ui/binding.js. */
  _syncSimpleNav() {
    syncSimpleNav(this);
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  /** Delegate: ver bindEvents() em src/ui/binding.js. */
  _bindEvents() {
    bindEvents(this);
  }

  // ── Panel management ───────────────────────────────────────────────────────

  /** Delegate: ver togglePanel() em src/ui/binding.js. */
  _togglePanel() {
    togglePanel(this);
  }

  /** Delegate: ver openPanel() em src/ui/binding.js. */
  _openPanel() {
    openPanel(this);
  }

  /** Delegate: ver setPageInert() em src/ui/binding.js. */
  _setPageInert(on) {
    setPageInert(this, on);
  }

  /** Delegate: ver inertSibling() em src/ui/binding.js. */
  _inertSibling(el) {
    inertSibling(this, el);
  }

  /** Delegate: ver closePanel() em src/ui/binding.js. */
  _closePanel() {
    closePanel(this);
  }

  /** Delegate: ver resetAll() em src/ui/binding.js. */
  _resetAll() {
    resetAll(this);
  }

  /** Delegate: ver movePanelSide() em src/ui/binding.js. */
  _movePanelSide() {
    movePanelSide(this);
  }

  /** Delegate: ver hideWidget() em src/ui/binding.js. */
  _hideWidget() {
    hideWidget(this);
  }

  /** Delegate: ver showWidget() em src/ui/binding.js. */
  _showWidget() {
    showWidget(this);
  }

  /** Delegate: ver loadPanelSide() em src/core/instancePersistence.js. */
  _loadPanelSide() {
    return loadPanelSide(this);
  }

  /** Delegate: ver savePanelSide() em src/core/instancePersistence.js. */
  _savePanelSide(side) {
    savePanelSide(this, side);
  }

  _toggleSpeak() {
    toggleSpeak();
  }

  /** Delegate: ver syncSpeaking() em src/ui/binding.js. */
  _syncSpeaking(speaking) {
    syncSpeaking(this, speaking);
  }

  // ── Modo Simples activation ────────────────────────────────────────────────

  _activateModoSimples(currentState, { announce: doAnnounce = true } = {}) {
    const saved = this._loadPrincipal();
    if (saved) {
      let el = null;
      try {
        el = document.querySelector(saved.path);
      } catch (_) {
        // Invalid saved selector — discard below
      }
      if (el && this._isPlausiblePrincipal(el, saved)) {
        this._savePrincipalPath(saved.path, el); // migra registro antigo (por host) para a página
        setPrincipal(el, this._config);
        document.documentElement.classList.add('ms-ativo');
        applyOptions(currentState);
        if (doAnnounce) announce('Modo Simples ativado');
        return;
      }
      // caminho inválido, sumiu ou o texto encolheu demais: não é mais a mesma área (IMP-06).
      // Registro da página sai; o antigo por host (dica) fica para as outras páginas.
      if (!saved.legacy) this._discardPrincipal();
    }

    const { confidence } = scan(this._config);
    if (confidence < this._config.confidenceThreshold) {
      // Confiança baixa (UX-21): simplifica a página inteira (sem principal, nada oculto) e avisa
      // em linguagem simples; a seleção manual é opcional. Sem principal, o max-width do principal
      // não estreita o body. O hold impede o observer de aplicar a heurística incerta (IMP-22).
      document.documentElement.classList.add('ms-ativo');
      applyOptions(currentState);
      holdPrincipal(true);
      showLowConfidenceNotice({ onChoose: () => this._startManualChoice() });
    } else {
      applyModoSimples(currentState, this._config);
    }

    if (doAnnounce) announce('Modo Simples ativado');
  }

  /** Seleção manual opcional (IMP-22 vale aqui: nada oculto antes de confirmar; cancelar mantém a página). */
  _startManualChoice() {
    this._setPageInert(false); // a página precisa receber o clique/foco da escolha
    startManualSelect({
      onSelect: (el, path) => {
        this._setPageInert(state.get().panelOpen);
        setPrincipal(el, this._config);
        this._savePrincipalPath(path, el);
        applyModoSimples(state.get(), this._config);
        announce('Conteúdo principal definido');
      },
      onCancel: () => {
        // sem escolha: ms-ativo + opções, SEM principal e nada persistido; o hold continua.
        this._setPageInert(state.get().panelOpen);
        announce('Seleção manual cancelada');
      },
    });
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
      'colorSaturation',
      'customText',
      'customHeading',
      'customBg',
      'dyslexiaFont',
      'readingRuler',
      'highlightLinks',
      'textSpacing',
      'lineHeight',
      'wordSpacing',
      'letterSpacing',
      'cursorStyle',
      'reducedMotion',
      'hideImages',
      'simpleLanguage',
      'readFocus',
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
    }

    if (prev.options.readFocus !== next.options.readFocus) {
      if (next.options.readFocus) startFocusReader();
      else stopFocusReader();
    }

    diffStateAnnouncements(prev, next).forEach((msg) => announce(msg));

    this._persistState(next);
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  /** Delegate: ver persistState() em src/core/instancePersistence.js. */
  _persistState(next) {
    persistState(this, next);
  }

  /** Delegate: ver loadPersistedState() em src/core/instancePersistence.js. */
  _loadPersistedState() {
    loadPersistedState(this);
  }

  /** Grava o principal escolhido POR PÁGINA, com o tamanho do texto para validar depois. */
  _savePrincipalPath(path, el) {
    savePrincipalPath(this, path, el);
  }

  /**
   * Principal salvo para ESTA página. Sem registro de página, aceita o registro antigo (por host,
   * string) — ele só vale se passar na validação, e é migrado para a página (IMP-06).
   * @returns {{ path: string, textLen: number|null, legacy: boolean } | null}
   */
  _loadPrincipal() {
    return loadPrincipal(this);
  }

  /**
   * Esquece o principal salvo DESTA página. O registro antigo por host nunca é apagado aqui:
   * ele é só uma dica, e falhar numa página não diz nada sobre as outras.
   */
  _discardPrincipal() {
    discardPrincipal(this);
  }

  /**
   * O elemento achado pelo caminho salvo ainda parece a área de conteúdo? Exige o mínimo de
   * texto da heurística (scoring.minTextLength) e, quando conhecido, não menos que metade do
   * tamanho de quando foi escolhido.
   */
  _isPlausiblePrincipal(el, saved) {
    return isPlausiblePrincipal(this, el, saved);
  }

  /**
   * Registro antigo (por host, sem tamanho gravado) é só uma dica: além do mínimo de texto, quando
   * a heurística tem confiança nesta página o elemento da dica não pode ser bem menor que o
   * candidato dela (< 50% do texto) — outra página do host com a mesma estrutura de caminho.
   */
  _legacyHintFits(el, len) {
    return legacyHintFits(this, el, len);
  }

  // ── System preferences ─────────────────────────────────────────────────────

  /**
   * reducedMotion segue a preferência do SO enquanto o usuário não escolher (IMP-14):
   * o valor derivado nunca é gravado como escolha, e acompanha o SO nos dois sentidos.
   */
  _syncReducedMotion() {
    if (this._reducedMotionUser !== null) return;
    state.set({ options: { reducedMotion: prefersReducedMotion() } });
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

/**
 * Sobe a instância global. Idempotente: script incluído duas vezes (ou reinjetado por SPA)
 * não cria segunda UI nem sobrescreve window.ModoSimples (IMP-23).
 * @param {Window} win
 * @returns {ModoSimples}
 */
export function bootModoSimples(win) {
  if (win.ModoSimples && win.ModoSimples._initialized) return win.ModoSimples;
  const instance = new ModoSimples(readPreBootConfig(win));
  instance.init();
  win.ModoSimples = instance;
  return instance;
}

/**
 * Auto-boot ligado? Opt-out por `<script data-ms-autoboot="false">` ou
 * `window.ModoSimplesConfig = { autoboot: false }` (IMP-32).
 * @param {{ ModoSimplesConfig?: unknown }} win
 * @param {Element|null} [script] tag <script> que carregou o bundle
 * @returns {boolean}
 */
export function shouldAutoBoot(win, script) {
  if (script && script.getAttribute('data-ms-autoboot') === 'false') {
    return false;
  }
  return readPreBootConfig(win).autoboot !== false;
}

if (typeof window !== 'undefined') {
  // currentScript só existe durante a execução síncrona do script; o boot pode vir depois
  const script = document.currentScript;

  if (shouldAutoBoot(window, script)) {
    const boot = () => bootModoSimples(window);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  } else {
    // sem auto-boot: o integrador sobe quando quiser, com a classe ou pelo boot padrão
    window.ModoSimplesClass = ModoSimples;
    window.ModoSimplesBoot = () => bootModoSimples(window);
  }
}

export default ModoSimples;
