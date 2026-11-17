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
import { detectMainContent } from './heuristics/contentDetector.js';
import eventBus from './core/eventBus.js';
import state from './core/state.js';
import persistence from './core/persistence.js';
import {
  hydratePersistedState,
  SCHEMA_VERSION,
} from './core/persistedState.js';
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
  holdPrincipal,
} from './mutator/domMutator.js';
import { startObserving, stopObserving } from './mutator/domObserver.js';
import {
  startReadingRuler,
  stopReadingRuler,
} from './features/readingRuler.js';
import {
  speakMainContent,
  stopSpeaking,
  isSpeaking,
  onSpeakingChange,
} from './features/tts.js';
import {
  startManualSelect,
  stopManualSelect,
  isManualSelectActive,
} from './features/manualSelect.js';
import { createSimpleNav } from './features/simpleNav.js';

/** Tamanho do texto de um elemento (sem espaços nas pontas). */
const textLength = (el) => ((el && el.textContent) || '').trim().length;

const STATE_KEY = 'state';
const PRINCIPAL_KEY = 'principal';

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
    injectPageStyles();
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

    if (currentState.modoSimples) {
      this._activateModoSimples(currentState, { announce: false });
    }
  }

  destroy() {
    // Instância que nunca subiu não pode derrubar a UI/estado de outra (state e DOM são compartilhados)
    if (!this._initialized) return;
    if (this._removeSpeakListener) {
      this._removeSpeakListener();
      this._removeSpeakListener = null;
    }
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
    this._hideImagesBeforeMs = !!hide;
    if (!this._config.persistence) return;
    const key = 'hideImagesBeforeMs';
    if (this._config.hostnamePersistence) {
      persistence.saveForHost(key, !!hide);
    } else {
      persistence.save(key, !!hide);
    }
  }

  /** Lê e esquece o valor guardado; sem registro (ex.: MS já estava ligado) = imagens visíveis. */
  _takeHideImagesBeforeMs() {
    let hide = this._hideImagesBeforeMs;
    if (hide === null && this._config.persistence) {
      const key = 'hideImagesBeforeMs';
      hide = this._config.hostnamePersistence
        ? persistence.loadForHost(key, null)
        : persistence.load(key, null);
    }
    this._hideImagesBeforeMs = null;
    if (this._config.persistence) {
      const key = 'hideImagesBeforeMs';
      if (this._config.hostnamePersistence) {
        persistence.removeForHost(key);
      } else {
        persistence.remove(key);
      }
    }
    return !!hide;
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

  _buildUI() {
    this._host = document.createElement('div');
    this._host.id = 'ms-container';
    document.body.appendChild(this._host);

    this._shadow = this._host.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = getUIStyles(this._config.position);
    this._shadow.appendChild(styleEl);
    this._styleEl = styleEl;

    const s = state.get();

    this._panel = createA11yPanel({
      state: s,
      onClose: () => this._closePanel(),
      onToggleModoSimples: (value) => this._setModoSimples(value),
      onSetOption: (key, value) => {
        if (key === 'reducedMotion') this._reducedMotionUser = !!value;
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
        this._closePanel(); // devolve o foco a quem abriu (UX-12)
      }
    };
    document.addEventListener('keydown', this._onDocKeydown);

    this._onDocClick = (e) => {
      if (!state.get().panelOpen) return;
      if (isManualSelectActive()) return; // o clique é da seleção manual: consumido uma vez (IMP-29)
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

    // Estado "lendo/parado" da UI vem dos eventos do tts: sem polling (IMP-25)
    this._removeSpeakListener = onSpeakingChange((speaking) =>
      this._syncSpeaking(speaking),
    );
  }

  // ── Panel management ───────────────────────────────────────────────────────

  _togglePanel() {
    state.get().panelOpen ? this._closePanel() : this._openPanel();
  }

  _openPanel() {
    // Quem abriu (FAB ou ícone do chrome, este no light DOM): é para onde o foco volta ao fechar
    let opener = document.activeElement;
    while (opener?.shadowRoot?.activeElement) {
      opener = opener.shadowRoot.activeElement;
    }
    if (opener !== document.body && !this._panel.element.contains(opener)) {
      this._panelOpener = opener;
    }
    state.set({ panelOpen: true });
    this._panel.open();
    this._fab.sync({ panelOpen: true });
    announce('Painel de acessibilidade aberto');
  }

  _closePanel() {
    state.set({ panelOpen: false });
    this._panel.close();
    this._fab.sync({ panelOpen: false });
    // Botão X, clique fora ou Esc: o foco volta ao opener (sem roubá-lo da seleção manual)
    if (!isManualSelectActive()) {
      const opener = this._panelOpener?.isConnected
        ? this._panelOpener
        : this._fab?.button;
      opener?.focus?.();
    }
    this._panelOpener = null;
  }

  _toggleSpeak() {
    // a UI acompanha por onSpeakingChange (ver _bindEvents)
    if (isSpeaking()) {
      stopSpeaking();
      announce('Leitura interrompida');
    } else {
      speakMainContent();
      announce('Lendo conteúdo principal');
    }
  }

  _syncSpeaking(speaking) {
    const s = state.get();
    if (this._panel) this._panel.sync(s, { speaking });
    if (this._chrome) this._chrome.sync(s, { speaking });
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
      // Confiança baixa: nada é ocultado em volta de um principal incerto até o usuário
      // confirmar (IMP-22). Enquanto escolhe, só a marca de "modo ligado" e as opções.
      document.documentElement.classList.add('ms-ativo');
      applyOptions(currentState);
      holdPrincipal(true); // o observer não aplica a heurística incerta enquanto isso
      startManualSelect({
        onSelect: (el, path) => {
          setPrincipal(el, this._config);
          this._savePrincipalPath(path, el);
          applyModoSimples(state.get(), this._config);
          announce('Conteúdo principal definido');
        },
        onCancel: () => {
          // sem escolha: ms-ativo + opções, SEM principal (nada marcado nem oculto) e nada
          // persistido. O hold continua: o observer não escolhe por conta própria; só uma nova
          // seleção ou desligar/ligar o MS muda isso.
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
    const payload = {
      v: SCHEMA_VERSION,
      modoSimples: next.modoSimples,
      // reducedMotion só é gravado quando o usuário escolheu (null = derivado do SO)
      options: { ...next.options, reducedMotion: this._reducedMotionUser },
    };
    // localStorage é síncrono: só grava quando o que é persistido de fato mudou (IMP-39);
    // abrir/fechar o painel, por exemplo, não altera o payload
    const json = JSON.stringify(payload);
    if (json === this._lastPersisted) return;
    this._lastPersisted = json;
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
    // Payload v0 (sem v) gravava o reducedMotion DERIVADO (sempre false por padrão): não é escolha
    // do usuário. Tratá-lo como escolha ignoraria o SO de todo mundo que atualizou de 1.x/2.0.
    const rm = saved.options && saved.options.reducedMotion;
    const isUserChoice = saved.v >= 1 && typeof rm === 'boolean';
    this._reducedMotionUser = isUserChoice ? rm : null;
  }

  /** Grava o principal escolhido POR PÁGINA, com o tamanho do texto para validar depois. */
  _savePrincipalPath(path, el) {
    if (!this._config.persistence || !path) return;
    persistence.saveForPath(PRINCIPAL_KEY, {
      path,
      textLen: textLength(el),
    });
  }

  /**
   * Principal salvo para ESTA página. Sem registro de página, aceita o registro antigo (por host,
   * string) — ele só vale se passar na validação, e é migrado para a página (IMP-06).
   * @returns {{ path: string, textLen: number|null, legacy: boolean } | null}
   */
  _loadPrincipal() {
    if (!this._config.persistence) return null;
    let v = persistence.loadForPath(PRINCIPAL_KEY);
    const viaHost = v == null; // sem registro da página: cai no registro antigo, por host
    if (viaHost) {
      v = this._config.hostnamePersistence
        ? persistence.loadForHost(PRINCIPAL_KEY)
        : persistence.load(PRINCIPAL_KEY);
    }
    if (typeof v === 'string' && v) {
      return { path: v, textLen: null, legacy: true };
    }
    if (v && typeof v.path === 'string' && v.path) {
      return {
        path: v.path,
        textLen: Number.isFinite(v.textLen) ? v.textLen : null,
        legacy: viaHost,
      };
    }
    return null;
  }

  /**
   * Esquece o principal salvo DESTA página. O registro antigo por host nunca é apagado aqui:
   * ele é só uma dica, e falhar numa página não diz nada sobre as outras.
   */
  _discardPrincipal() {
    if (!this._config.persistence) return;
    persistence.removeForPath(PRINCIPAL_KEY);
  }

  /**
   * O elemento achado pelo caminho salvo ainda parece a área de conteúdo? Exige o mínimo de
   * texto da heurística (scoring.minTextLength) e, quando conhecido, não menos que metade do
   * tamanho de quando foi escolhido.
   */
  _isPlausiblePrincipal(el, saved) {
    const len = textLength(el);
    if (len < this._config.scoring.minTextLength) return false;
    if (saved.textLen && len < saved.textLen * 0.5) return false;
    if (saved.legacy) return this._legacyHintFits(el, len);
    return true;
  }

  /**
   * Registro antigo (por host, sem tamanho gravado) é só uma dica: além do mínimo de texto, quando
   * a heurística tem confiança nesta página o elemento da dica não pode ser bem menor que o
   * candidato dela (< 50% do texto) — outra página do host com a mesma estrutura de caminho.
   */
  _legacyHintFits(el, len) {
    const { element, confidence } = detectMainContent(this._config);
    if (confidence < this._config.confidenceThreshold || element === el) {
      return true;
    }
    return len >= textLength(element) * 0.5;
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
