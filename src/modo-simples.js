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
    this._dragCleanup = null;
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
    if (this._dragCleanup)          { this._dragCleanup();          this._dragCleanup          = null; }
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
      position: this._config.position,
    });
    this._shadow.appendChild(this._radial.element);

    this._centralBtn = createCentralToggle();
    this._radial.element.appendChild(this._centralBtn.element);

    this._helpPanel = this._buildHelpPanel();
    this._radial.element.appendChild(this._helpPanel);

    this._centralBtn.sync({ modoSimples: s.modoSimples, radialOpen: s.panelOpen });
    this._radial.updateItems(s.options);
    this._initDrag();
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

  // ── Drag to reposition ────────────────────────────────────────────────────

  /**
   * Permite arrastar o botão central para reposicioná-lo na tela.
   * Usa pointer events para suporte a mouse e touch.
   * Após soltar, o botão se encaixa no canto mais próximo (snap-to-corner).
   */
  _initDrag() {
    const root = this._radial.element;  // #ms-radial-root
    const btn  = this._centralBtn.element;
    const DRAG_THRESHOLD = 6; // px — mínimo para considerar drag (não click)
    const MARGIN = 20;        // px — margem das bordas

    let startX = 0, startY = 0, startLeft = 0, startTop = 0;
    let dragging = false, moved = false;

    const onPointerDown = (e) => {
      // Somente botão primário / toque
      if (e.button !== undefined && e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;

      // Posição atual do root dentro do :host (que cobre o viewport)
      const rect = root.getBoundingClientRect();
      startLeft = rect.left;
      startTop  = rect.top;

      dragging = false;
      moved = false;
      root.classList.add('ms-drag-ready');
      btn.setPointerCapture(e.pointerId);

      e.stopPropagation();
    };

    const onPointerMove = (e) => {
      if (!root.classList.contains('ms-drag-ready') && !dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

      // Primeiro movimento significativo
      if (!dragging) {
        dragging = true;
        moved = true;
        root.classList.remove('ms-drag-ready');
        root.classList.add('ms-dragging');
        // Troca para posicionamento absoluto livre
        root.style.right  = '';
        root.style.bottom = '';
        root.style.left   = startLeft + 'px';
        root.style.top    = startTop  + 'px';
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sz = root.offsetWidth || 72;

      const newLeft = Math.max(MARGIN, Math.min(vw - sz - MARGIN, startLeft + dx));
      const newTop  = Math.max(MARGIN, Math.min(vh - sz - MARGIN, startTop  + dy));

      root.style.left = newLeft + 'px';
      root.style.top  = newTop  + 'px';
    };

    const onPointerUp = (e) => {
      if (!root.classList.contains('ms-drag-ready') && !dragging) return;
      root.classList.remove('ms-drag-ready', 'ms-dragging');

      if (!moved) { dragging = false; return; }

      // Snap para o canto mais próximo
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sz = root.offsetWidth || 72;
      const cx = parseFloat(root.style.left) + sz / 2;
      const cy = parseFloat(root.style.top)  + sz / 2;

      const snapRight  = cx > vw / 2;
      const snapBottom = cy > vh / 2;

      // Remove posicionamento livre e volta para corner CSS
      root.style.left   = '';
      root.style.top    = '';
      root.style.right  = '';
      root.style.bottom = '';

      if (snapRight && snapBottom) {
        root.style.right  = MARGIN + 'px';
        root.style.bottom = MARGIN + 'px';
      } else if (!snapRight && snapBottom) {
        root.style.left   = MARGIN + 'px';
        root.style.bottom = MARGIN + 'px';
      } else if (snapRight && !snapBottom) {
        root.style.right = MARGIN + 'px';
        root.style.top   = MARGIN + 'px';
      } else {
        root.style.left = MARGIN + 'px';
        root.style.top  = MARGIN + 'px';
      }

      dragging = false;
      moved = false;
    };

    btn.addEventListener('pointerdown', onPointerDown);
    btn.addEventListener('pointermove', onPointerMove);
    btn.addEventListener('pointerup',   onPointerUp);
    btn.addEventListener('pointercancel', onPointerUp);

    // Impede que o drag dispare click
    btn.addEventListener('click', (e) => {
      if (moved) { e.stopImmediatePropagation(); moved = false; }
    }, { capture: true });

    this._dragCleanup = () => {
      btn.removeEventListener('pointerdown', onPointerDown);
      btn.removeEventListener('pointermove', onPointerMove);
      btn.removeEventListener('pointerup',   onPointerUp);
      btn.removeEventListener('pointercancel', onPointerUp);
    };
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