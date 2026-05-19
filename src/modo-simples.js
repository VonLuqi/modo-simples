/**
 * src/modo-simples.js — Orchestrator principal
 *
 * Wires todos os módulos para o menu radial de acessibilidade.
 *
 * Estrutura no Shadow DOM:
 *   #ms-container (host)
 *     └─ shadow root
 *          ├─ <style>  (UI styles)
 *          └─ #ms-radial-root
 *               ├─ #ms-radial-menu  (itens radiais)
 *               ├─ #ms-central-btn  (toggle Modo Simples + acionador do radial)
 *               └─ #ms-help-panel   (painel de ajuda inline)
 *
 * Fluxo de interação:
 *   Clique no #ms-central-btn → abre/fecha o radial se fechado/aberto
 *   Clique em item radial → toggle da opção correspondente
 *   Esc → fecha o radial e devolve foco ao botão central
 *   Estado → persiste no localStorage prefixado com ms_
 *
 * API pública:
 *   instance.enable()           Ativa Modo Simples
 *   instance.disable()          Desativa Modo Simples
 *   instance.toggle()           Alterna Modo Simples
 *   instance.configure(patch)   Sobrescreve config em runtime
 *   instance.destroy()          Remove completamente da página
 */

import defaults from './config/defaults.js';
import eventBus from './core/eventBus.js';
import state from './core/state.js';
import persistence from './core/persistence.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils/mediaQuery.js';
import { announce } from './utils/aria.js';
import { getUIStyles } from './ui/styles.js';
import { createCentralToggle } from './ui/centralToggle.js';
import { createRadialMenu } from './ui/radialMenu.js';
import { injectPageStyles, scan, apply, revert } from './mutator/domMutator.js';
import { startObserving, stopObserving } from './mutator/domObserver.js';

class ModoSimples {
  constructor(userConfig = {}) {
    this._config = { ...defaults, ...userConfig };
    this._host = null;
    this._shadow = null;
    this._centralBtn = null;
    this._radial = null;
    this._helpPanel = null;
    this._removeMotionListener = null;
    this._removeStateListener = null;
    this._initialized = false;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  init() {
    if (this._initialized) return;
    this._initialized = true;

    this._loadPersistedState();
    injectPageStyles();
    this._buildUI();
    this._bindEvents();

    startObserving(() => state.get(), this._config);
    this._syncReducedMotion();
    this._removeMotionListener = onReducedMotionChange(() => this._syncReducedMotion());

    const currentState = state.get();
    if (currentState.modoSimples) {
      scan(this._config);
      apply(currentState, this._config);
    }
  }

  destroy() {
    revert();
    stopObserving();
    if (this._removeMotionListener) { this._removeMotionListener(); this._removeMotionListener = null; }
    if (this._removeStateListener)  { this._removeStateListener();  this._removeStateListener  = null; }
    if (this._host?.parentNode) this._host.parentNode.removeChild(this._host);
    const pageStyle = document.getElementById('ms-page-styles');
    if (pageStyle?.parentNode) pageStyle.parentNode.removeChild(pageStyle);
    state.reset();
    eventBus.clearAll();
    this._initialized = false;
  }

  // ── API pública ────────────────────────────────────────────────────────────

  enable()         { state.set({ modoSimples: true }); }
  disable()        { state.set({ modoSimples: false }); }
  toggle()         { state.set({ modoSimples: !state.get().modoSimples }); }
  configure(patch) { this._config = { ...this._config, ...patch }; }

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

    this._radial = createRadialMenu({
      state: s,
      onToggle: (key, value) => state.set({ options: { [key]: value } }),
      onHelp: () => this._toggleHelp(),
    });
    this._shadow.appendChild(this._radial.element);

    this._centralBtn = createCentralToggle();
    this._radial.element.appendChild(this._centralBtn.element);

    this._helpPanel = this._buildHelpPanel();
    this._radial.element.appendChild(this._helpPanel);

    this._centralBtn.sync({ modoSimples: s.modoSimples, radialOpen: s.panelOpen });
    this._radial.updateItems(s.options);
  }

  _buildHelpPanel() {
    const panel = document.createElement('div');
    panel.id = 'ms-help-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Ajuda — Modo Simples');
    panel.hidden = true;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ms-help-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Fechar ajuda');
    closeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    closeBtn.addEventListener('click', () => { panel.hidden = true; });

    panel.innerHTML = `
      <h3>Como usar o menu de acessibilidade</h3>
      <p><strong>Botão central (A):</strong> clique para abrir/fechar as opções. Verde = Modo Simples ativo, Vermelho = inativo.</p>
      <p><strong>Modo Simples:</strong> remove distrações e centraliza o conteúdo principal.</p>
      <p><strong>Alto Contraste:</strong> reforça preto/branco para melhor legibilidade.</p>
      <p><strong>Texto Maior:</strong> aumenta o tamanho da fonte do conteúdo.</p>
      <p><strong>Reduzir Movimento:</strong> desativa animações e transições da página.</p>
      <p><strong>Destacar Links:</strong> sublinha e realça todos os links visíveis.</p>
      <p><strong>Fonte Legível:</strong> aplica uma fonte com maior legibilidade para dislexia.</p>
      <p><strong>Espaçamento:</strong> aumenta espaço entre linhas, letras e parágrafos.</p>
      <p><strong>Ocultar Imagens:</strong> esconde imagens decorativas.</p>
      <p><em>Tecle Esc para fechar o menu. Use Tab ou setas para navegar.</em></p>
    `;
    panel.prepend(closeBtn);
    return panel;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  _bindEvents() {
    this._centralBtn.element.addEventListener('click', () => this._toggleRadial());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.get().panelOpen) {
        this._closeRadial();
        this._centralBtn.element.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!state.get().panelOpen) return;
      if (e.target !== this._host && !this._host?.contains(e.target)) {
        this._closeRadial();
      }
    }, { capture: true });

    this._removeStateListener = eventBus.on('stateChange', ({ prev, next }) => {
      this._onStateChange(prev, next);
    });
  }

  // ── Radial management ─────────────────────────────────────────────────────

  _toggleRadial() {
    state.get().panelOpen ? this._closeRadial() : this._openRadial();
  }

  _openRadial() {
    state.set({ panelOpen: true });
    this._radial.open();
    this._centralBtn.sync({ modoSimples: state.get().modoSimples, radialOpen: true });
    announce('Menu de acessibilidade aberto');
  }

  _closeRadial() {
    state.set({ panelOpen: false });
    this._radial.close();
    this._centralBtn.sync({ modoSimples: state.get().modoSimples, radialOpen: false });
    if (this._helpPanel) this._helpPanel.hidden = true;
  }

  _toggleHelp() {
    if (this._helpPanel) this._helpPanel.hidden = !this._helpPanel.hidden;
  }

  // ── State reactions ────────────────────────────────────────────────────────

  _onStateChange(prev, next) {
    if (this._centralBtn) {
      this._centralBtn.sync({ modoSimples: next.modoSimples, radialOpen: next.panelOpen });
    }
    if (this._radial) this._radial.updateItems(next.options);

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

    const optionKeys = ['highContrast', 'largerText', 'reducedMotion', 'highlightLinks', 'dyslexiaFont', 'textSpacing', 'hideImages'];
    const optionChanged = optionKeys.some((k) => prev.options[k] !== next.options[k]);
    if (next.modoSimples && optionChanged) { revert(); apply(next, this._config); }

    const announcements = {
      highContrast:   ['Alto contraste ativado',           'Alto contraste desativado'],
      largerText:     ['Texto maior ativado',              'Texto maior desativado'],
      highlightLinks: ['Destaque de links ativado',        'Destaque de links desativado'],
      dyslexiaFont:   ['Fonte legível ativada',            'Fonte legível desativada'],
      textSpacing:    ['Espaçamento de texto ativado',     'Espaçamento de texto desativado'],
      hideImages:     ['Imagens ocultadas',                'Imagens visíveis'],
    };
    Object.entries(announcements).forEach(([k, [on, off]]) => {
      if (prev.options[k] !== next.options[k]) announce(next.options[k] ? on : off);
    });

    if (this._config.persistence) {
      persistence.save('state', { modoSimples: next.modoSimples, options: next.options });
    }
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  _loadPersistedState() {
    if (!this._config.persistence) return;
    const saved = persistence.load('state');
    if (!saved) return;
    state.set({
      modoSimples: Boolean(saved.modoSimples),
      options: {
        highContrast:   Boolean(saved.options?.highContrast),
        largerText:     Boolean(saved.options?.largerText),
        reducedMotion:  Boolean(saved.options?.reducedMotion),
        highlightLinks: Boolean(saved.options?.highlightLinks),
        dyslexiaFont:   Boolean(saved.options?.dyslexiaFont),
        textSpacing:    Boolean(saved.options?.textSpacing),
        hideImages:     Boolean(saved.options?.hideImages),
      },
    });
  }

  // ── System preferences ─────────────────────────────────────────────────────

  _syncReducedMotion() {
    state.set({ options: { reducedMotion: prefersReducedMotion() } });
  }
}

// ── Auto-boot ──────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  function boot() {
    const instance = new ModoSimples();
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