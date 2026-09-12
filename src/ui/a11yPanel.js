/**
 * ui/a11yPanel.js
 *
 * Painel "Acessibilidade Digital" — Shadow-DOM friendly panel matching the
 * Senac PI 2025 mockup (header, Modo Simples card, text scale, themes, aids).
 */

import { trapFocus } from '../utils/focus.js';

const TEXT_SCALES = [
  { value: '100', label: '100%', title: 'Padrão' },
  { value: '125', label: '125%', title: 'Grande' },
  { value: '150', label: '150%', title: 'Muito +' },
  { value: '175', label: '175%', title: 'Extra' },
];

const COLOR_THEMES = [
  { value: 'senac', label: 'Cores Senac', sub: 'Padrão' },
  { value: 'yellowBlack', label: 'Amarelo e Preto', sub: 'Alto contraste' },
  { value: 'darkHigh', label: 'Modo Escuro Alto', sub: 'Fundo escuro' },
  { value: 'soft', label: 'Descanso / Suave', sub: 'Baixa intensidade' },
];

/**
 * @param {Object} opts
 * @param {Object} opts.state
 * @param {() => void} opts.onClose
 * @param {(value: boolean) => void} opts.onToggleModoSimples
 * @param {(key: string, value: *) => void} opts.onSetOption
 * @param {() => void} opts.onSpeak
 * @returns {{ element: HTMLElement, open: () => void, close: () => void, sync: (state: Object) => void }}
 */
export function createA11yPanel({
  state,
  onClose,
  onToggleModoSimples,
  onSetOption,
  onSpeak,
}) {
  const panel = document.createElement('div');
  panel.id = 'ms-a11y-panel';
  panel.className = 'ms-a11y-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'ms-a11y-title');
  panel.hidden = true;

  panel.innerHTML = `
    <header class="ms-a11y-header">
      <div class="ms-a11y-header-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
        </svg>
      </div>
      <div class="ms-a11y-header-text">
        <h2 id="ms-a11y-title">Acessibilidade Digital</h2>
        <p class="ms-a11y-subtitle">Projeto Integrador 2025 • Senac</p>
      </div>
      <button type="button" class="ms-a11y-close" aria-label="Fechar painel de acessibilidade">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </header>

    <div class="ms-a11y-body">
      <div class="ms-a11y-card ms-a11y-card--simple" data-section="modo-simples">
        <div class="ms-a11y-card-row">
          <div class="ms-a11y-card-text">
            <span class="ms-a11y-card-star" aria-hidden="true">★</span>
            <strong>Modo Simples (Recomendado)</strong>
            <p>Oculta distrações visuais, aumenta botões e resume conteúdos essenciais.</p>
          </div>
          <button type="button" class="ms-switch" role="switch" aria-checked="false"
            data-action="modo-simples" aria-label="Ativar Modo Simples">
            <span class="ms-switch-thumb"></span>
          </button>
        </div>
      </div>

      <section class="ms-a11y-section" aria-labelledby="ms-label-text">
        <h3 id="ms-label-text" class="ms-a11y-section-title">
          <span aria-hidden="true">T</span> Tamanho do texto
        </h3>
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-text" data-option="textScale">
          ${TEXT_SCALES.map(
            (s) => `
            <button type="button" role="radio" class="ms-segment"
              data-value="${s.value}" aria-checked="false"
              aria-label="Tamanho do texto ${s.label} — ${s.title}" title="${s.title}">
              ${s.label}
            </button>`,
          ).join('')}
        </div>
      </section>

      <section class="ms-a11y-section" aria-labelledby="ms-label-theme">
        <h3 id="ms-label-theme" class="ms-a11y-section-title">
          <span aria-hidden="true">◉</span> Contraste e cores
        </h3>
        <div class="ms-theme-grid" role="radiogroup" aria-labelledby="ms-label-theme" data-option="colorTheme">
          ${COLOR_THEMES.map(
            (t) => `
            <button type="button" role="radio" class="ms-theme-btn ms-theme-btn--${t.value}"
              data-value="${t.value}" aria-checked="false"
              aria-label="Tema ${t.label} — ${t.sub}">
              <span class="ms-theme-swatch" aria-hidden="true"></span>
              <span class="ms-theme-label">${t.label}</span>
              <span class="ms-theme-sub">${t.sub}</span>
            </button>`,
          ).join('')}
        </div>
      </section>

      <section class="ms-a11y-section" aria-labelledby="ms-label-cognitive">
        <h3 id="ms-label-cognitive" class="ms-a11y-section-title">
          <span aria-hidden="true">▣</span> Auxílio cognitivo &amp; TDAH
        </h3>
        <ul class="ms-a11y-option-list">
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text">
              <strong>Fonte Acessível (Lexend)</strong>
              <p>Desenvolvida para dislexia e agilidade visual</p>
            </div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="dyslexiaFont" aria-label="Fonte Acessível Lexend">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text">
              <strong>Régua de Foco de Leitura</strong>
              <p>Destaque linha a linha para guiar a atenção</p>
            </div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="readingRuler" aria-label="Régua de Foco de Leitura">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text">
              <strong>Leitor de Tela por Voz</strong>
              <p>Lê os títulos e textos em português</p>
            </div>
            <button type="button" class="ms-btn-ouvir" data-action="speak" aria-label="Ouvir conteúdo principal">
              Ouvir
            </button>
          </li>
        </ul>
      </section>

      <section class="ms-a11y-section" aria-labelledby="ms-label-more">
        <h3 id="ms-label-more" class="ms-a11y-section-title">Mais opções</h3>
        <ul class="ms-a11y-option-list">
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text"><strong>Destacar links</strong></div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="highlightLinks" aria-label="Destacar links">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text"><strong>Espaçamento de texto</strong></div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="textSpacing" aria-label="Espaçamento de texto">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text"><strong>Reduzir movimento</strong></div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="reducedMotion" aria-label="Reduzir movimento">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text">
              <strong>Ocultar imagens</strong>
              <span class="ms-a11y-option-hint">No Modo Simples, imagens somem por padrão — desligue para manter</span>
            </div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="hideImages" aria-label="Ocultar imagens">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
        </ul>
      </section>

      <div class="ms-a11y-live" aria-live="polite" aria-atomic="true"></div>
      <p class="ms-a11y-footer-note">
        Preferências salvas neste navegador · Projeto Integrador 2025
      </p>
    </div>
  `;

  /** @type {Function|null} */
  let _releaseFocus = null;

  panel.querySelector('.ms-a11y-close').addEventListener('click', () => onClose());

  panel.querySelector('[data-action="modo-simples"]').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const next = btn.getAttribute('aria-checked') !== 'true';
    onToggleModoSimples(next);
  });

  panel.querySelectorAll('.ms-segmented .ms-segment').forEach((btn) => {
    btn.addEventListener('click', () => {
      onSetOption('textScale', btn.getAttribute('data-value'));
    });
  });

  panel.querySelectorAll('.ms-theme-grid .ms-theme-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      onSetOption('colorTheme', btn.getAttribute('data-value'));
    });
  });

  panel.querySelectorAll('.ms-switch[data-option]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-option');
      const next = btn.getAttribute('aria-checked') !== 'true';
      onSetOption(key, next);
    });
  });

  panel.querySelector('[data-action="speak"]').addEventListener('click', () => onSpeak());

  /**
   * Sync UI controls with state snapshot.
   * @param {Object} s
   * @param {{ speaking?: boolean }} [ui]
   */
  function sync(s, ui = {}) {
    const modoBtn = panel.querySelector('[data-action="modo-simples"]');
    if (modoBtn) {
      modoBtn.setAttribute('aria-checked', String(!!s.modoSimples));
      modoBtn.classList.toggle('ms-switch--on', !!s.modoSimples);
      modoBtn.setAttribute(
        'aria-label',
        s.modoSimples ? 'Desativar Modo Simples' : 'Ativar Modo Simples',
      );
    }

    const scale = s.options?.textScale || '100';
    panel.querySelectorAll('[data-option="textScale"] .ms-segment').forEach((btn) => {
      const on = btn.getAttribute('data-value') === scale;
      btn.setAttribute('aria-checked', String(on));
      btn.classList.toggle('ms-segment--on', on);
    });

    const theme = s.options?.colorTheme || 'senac';
    panel.querySelectorAll('[data-option="colorTheme"] .ms-theme-btn').forEach((btn) => {
      const on = btn.getAttribute('data-value') === theme;
      btn.setAttribute('aria-checked', String(on));
      btn.classList.toggle('ms-theme-btn--on', on);
    });

    ['dyslexiaFont', 'readingRuler', 'highlightLinks', 'textSpacing', 'reducedMotion', 'hideImages'].forEach(
      (key) => {
        const btn = panel.querySelector(`.ms-switch[data-option="${key}"]`);
        if (!btn) return;
        const on = !!s.options?.[key];
        btn.setAttribute('aria-checked', String(on));
        btn.classList.toggle('ms-switch--on', on);
      },
    );

    const speakBtn = panel.querySelector('[data-action="speak"]');
    if (speakBtn && ui.speaking !== undefined) {
      speakBtn.textContent = ui.speaking ? 'Parar' : 'Ouvir';
      speakBtn.setAttribute(
        'aria-label',
        ui.speaking ? 'Parar leitura' : 'Ouvir conteúdo principal',
      );
    }
  }

  function open() {
    panel.hidden = false;
    _releaseFocus = trapFocus(panel);
    const closeBtn = panel.querySelector('.ms-a11y-close');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    panel.hidden = true;
    if (_releaseFocus) {
      _releaseFocus();
      _releaseFocus = null;
    }
  }

  sync(state);

  return { element: panel, open, close, sync };
}
