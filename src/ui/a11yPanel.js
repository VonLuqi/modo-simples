/**
 * ui/a11yPanel.js
 *
 * Painel de acessibilidade — Shadow-DOM friendly panel (header, Modo Simples card,
 * text scale, themes, aids). Header/footer texts come from config.brand.
 */

import { trapFocus } from '../utils/focus.js';
import { STRINGS as S } from './strings.js';

const TEXT_SCALES = [
  { value: '100', label: '100%', title: S.scaleDefault },
  { value: '125', label: '125%', title: S.scaleLarge },
  { value: '150', label: '150%', title: S.scaleLarger },
  { value: '175', label: '175%', title: S.scaleMax },
];

const DEFAULT_BRAND = {
  title: S.panelDefaultTitle,
  subtitle: '',
  footer: S.panelDefaultFooter,
};

const COLOR_THEMES = [
  { value: 'senac', label: S.themeSite, sub: S.themeSiteSub },
  {
    value: 'yellowBlack',
    label: S.themeYellowBlack,
    sub: S.themeYellowBlackSub,
  },
  { value: 'darkHigh', label: S.themeDarkHigh, sub: S.themeDarkHighSub },
  { value: 'soft', label: S.themeSoft, sub: S.themeSoftSub },
];

const svgIcon = (inner) =>
  `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;

const CHEVRON = svgIcon('<path d="m6 9 6 6 6-6"/>');
const CHECK = svgIcon('<path d="m5 12.5 4.5 4.5L19 7.5"/>');

// Sem espaços entre os filhos: o textContent do tile de fala vira só o rótulo ("Ouvir"/"Parar")
// Estado (Ligado/Desligado) é aria-hidden: aria-checked já o anuncia; o nome não o repete.
const switchTile = ({ option, title, label, desc, icon }) =>
  `<button type="button" class="ms-switch ms-tile" role="switch" aria-checked="false" data-option="${option}" aria-label="${label}"${desc ? ` aria-describedby="ms-desc-${option}"` : ''}><span class="ms-tile-icon" aria-hidden="true">${icon}</span><span class="ms-tile-label">${title}</span><span class="ms-tile-state" data-state aria-hidden="true">${S.stateOff}</span><span class="ms-tile-check" aria-hidden="true">${CHECK}</span>${desc ? `<span id="ms-desc-${option}" hidden>${desc}</span>` : ''}</button>`;

const radioHead = (id, title, option) =>
  `<div class="ms-a11y-control-head"><p id="${id}" class="ms-a11y-control-label">${title}</p><span class="ms-a11y-control-state" data-state-for="${option}" aria-hidden="true"></span></div>`;

/**
 * Controles do painel, em blocos de uma grade de 3 colunas. `wide` = linha inteira
 * (radiogroup com texto de estado); os demais são tiles. A ordem vem de SECTIONS[].controls.
 */
const CONTROLS = {
  textScale: {
    wide: true,
    html: `
        ${radioHead('ms-label-text', S.panelTextSizeTitle, 'textScale')}
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-text" data-option="textScale">
          ${TEXT_SCALES.map(
            (s) => `
            <button type="button" role="radio" class="ms-segment"
              data-value="${s.value}" aria-checked="false"
              aria-label="${S.panelTextSizeItemLabel} ${s.label} — ${s.title}" title="${s.title}">
              ${s.label}
            </button>`,
          ).join('')}
        </div>`,
  },
  colorTheme: {
    wide: true,
    html: `
        ${radioHead('ms-label-theme', S.panelThemeTitle, 'colorTheme')}
        <div class="ms-theme-grid" role="radiogroup" aria-labelledby="ms-label-theme" data-option="colorTheme">
          ${COLOR_THEMES.map(
            (t) => `
            <button type="button" role="radio" class="ms-theme-btn ms-theme-btn--${t.value}"
              data-value="${t.value}" aria-checked="false"
              aria-label="${S.panelThemeItemLabel} ${t.label} — ${t.sub}">
              <span class="ms-theme-swatch" aria-hidden="true"></span>
              <span class="ms-theme-label">${t.label}</span>
              <span class="ms-theme-sub">${t.sub}</span>
            </button>`,
          ).join('')}
        </div>`,
  },
  dyslexiaFont: {
    html: switchTile({
      option: 'dyslexiaFont',
      title: S.panelDyslexiaTitle,
      label: S.panelDyslexiaLabel,
      desc: S.panelDyslexiaDesc,
      icon: svgIcon(
        '<path d="M4 19 10 5l6 14"/><path d="M6.5 14h7"/><path d="M19 9v10"/>',
      ),
    }),
  },
  readingRuler: {
    html: switchTile({
      option: 'readingRuler',
      title: S.panelRulerTitle,
      label: S.panelRulerTitle,
      desc: S.panelRulerDesc,
      icon: svgIcon(
        '<path d="M4 8h16"/><rect x="4" y="11" width="16" height="3" rx="1" fill="currentColor"/><path d="M4 18h16"/>',
      ),
    }),
  },
  speak: {
    html: `<button type="button" class="ms-btn-ouvir ms-tile" data-action="speak" aria-label="${S.panelVoiceLabel}"><span class="ms-tile-icon" aria-hidden="true">${svgIcon('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>')}</span><span class="ms-tile-label" data-speak-text>${S.panelVoiceButton}</span></button>`,
  },
  highlightLinks: {
    html: switchTile({
      option: 'highlightLinks',
      title: S.panelHighlightLinks,
      label: S.panelHighlightLinks,
      icon: svgIcon(
        '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
      ),
    }),
  },
  textSpacing: {
    html: switchTile({
      option: 'textSpacing',
      title: S.panelTextSpacing,
      label: S.panelTextSpacing,
      icon: svgIcon(
        '<path d="M4 4v16"/><path d="M20 4v16"/><path d="m8 12h8"/><path d="m10 9-3 3 3 3"/><path d="m14 9 3 3-3 3"/>',
      ),
    }),
  },
  reducedMotion: {
    html: switchTile({
      option: 'reducedMotion',
      title: S.panelReducedMotion,
      label: S.panelReducedMotion,
      icon: svgIcon(
        '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
      ),
    }),
  },
  hideImages: {
    html: switchTile({
      option: 'hideImages',
      title: S.panelHideImages,
      label: S.panelHideImages,
      desc: S.panelHideImagesHint,
      icon: svgIcon(
        '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/>',
      ),
    }),
  },
};

/**
 * Seções da sanfona (data-driven): novas seções (F8/F9) entram aqui.
 * A primeira abre por padrão; o estado aberto não é persistido.
 */
const SECTIONS = [
  {
    id: 'text',
    title: S.sectionTextTitle,
    icon: svgIcon(
      '<path d="M5 7V5h14v2"/><path d="M12 5v14"/><path d="M9 19h6"/>',
    ),
    controls: [
      'textScale',
      'dyslexiaFont',
      'textSpacing',
      'readingRuler',
      'speak',
    ],
  },
  {
    id: 'colors',
    title: S.sectionColorsTitle,
    icon: svgIcon(
      '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
    ),
    controls: ['colorTheme', 'highlightLinks'],
  },
  {
    id: 'motion',
    title: S.sectionMotionTitle,
    icon: svgIcon(
      '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/>',
    ),
    controls: ['reducedMotion', 'hideImages'],
  },
];

function renderSection(sec, index) {
  const open = index === 0;
  const blocks = sec.controls.map((k) =>
    CONTROLS[k].wide
      ? `<div class="ms-a11y-block ms-a11y-block--wide">${CONTROLS[k].html}</div>`
      : CONTROLS[k].html,
  );
  return `
      <section class="ms-a11y-section" data-section-id="${sec.id}">
        <h3 class="ms-a11y-section-title">
          <button type="button" class="ms-a11y-section-toggle" id="ms-sec-${sec.id}-btn"
            aria-expanded="${open}" aria-controls="ms-sec-${sec.id}-body">
            <span aria-hidden="true">${sec.icon}</span>
            <span class="ms-a11y-section-name">${sec.title}</span>
            <span class="ms-a11y-section-chevron" aria-hidden="true">${CHEVRON}</span>
          </button>
        </h3>
        <div class="ms-a11y-section-body" id="ms-sec-${sec.id}-body" role="region"
          aria-labelledby="ms-sec-${sec.id}-btn"${open ? '' : ' hidden'}>
          <div class="ms-a11y-grid">${blocks.join('')}
          </div>
        </div>
      </section>`;
}

/**
 * @param {Object} opts
 * @param {Object} opts.state
 * @param {() => void} opts.onClose
 * @param {(value: boolean) => void} opts.onToggleModoSimples
 * @param {(key: string, value: *) => void} opts.onSetOption
 * @param {() => void} opts.onSpeak
 * @param {{ title?: string, subtitle?: string, footer?: string }} [opts.brand]
 * @returns {{ element: HTMLElement, open: () => void, close: () => void, sync: (state: Object) => void }}
 */
export function createA11yPanel({
  state,
  onClose,
  onToggleModoSimples,
  onSetOption,
  onSpeak,
  brand,
}) {
  const texts = { ...DEFAULT_BRAND, ...brand };
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
        <h2 id="ms-a11y-title"></h2>
        <p class="ms-a11y-subtitle"></p>
      </div>
      <button type="button" class="ms-a11y-close" aria-label="${S.panelCloseLabel}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </header>

    <div class="ms-a11y-body">
      <div class="ms-a11y-card ms-a11y-card--simple" data-section="modo-simples">
        <div class="ms-a11y-card-row">
          <div class="ms-a11y-card-text">
            <span class="ms-a11y-card-star" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
            <strong>${S.panelSimpleTitle}</strong>
            <p>${S.panelSimpleDesc}</p>
          </div>
          <button type="button" class="ms-switch" role="switch" aria-checked="false"
            data-action="modo-simples" aria-label="${S.panelSimpleSwitchLabel}">
            <span class="ms-switch-thumb"></span>
          </button>
        </div>
      </div>
      ${SECTIONS.map(renderSection).join('')}

      <div class="ms-a11y-live" aria-live="polite" aria-atomic="true"></div>
      <p class="ms-a11y-footer-note"></p>
    </div>
  `;

  // Textos de marca vêm da config do host: sempre via textContent (nunca no template HTML)
  const setText = (selector, text) => {
    const el = panel.querySelector(selector);
    el.textContent = text;
    el.hidden = !text;
  };
  setText('#ms-a11y-title', texts.title || DEFAULT_BRAND.title); // nome do diálogo nunca vazio
  setText('.ms-a11y-subtitle', texts.subtitle);
  setText('.ms-a11y-footer-note', texts.footer);

  /** @type {Function|null} */
  let _releaseFocus = null;

  // Sanfona: botão nativo alterna aria-expanded + hidden da região (sem animação de altura)
  panel.querySelectorAll('.ms-a11y-section-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.querySelector(`#${btn.getAttribute('aria-controls')}`).hidden =
        !open;
    });
  });

  panel
    .querySelector('.ms-a11y-close')
    .addEventListener('click', () => onClose());

  panel
    .querySelector('[data-action="modo-simples"]')
    .addEventListener('click', (e) => {
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

  // UX-10: radiogroup (APG) — roving tabindex (em sync) + setas movem e selecionam
  panel.querySelectorAll('[role="radiogroup"]').forEach((group) => {
    group.addEventListener('keydown', (e) => {
      const radios = [...group.querySelectorAll('[role="radio"]')];
      const i = radios.indexOf(e.target);
      if (i < 0) return;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
        e.key
      ];
      let next;
      if (step) next = radios[(i + step + radios.length) % radios.length];
      else if (e.key === 'Home') next = radios[0];
      else if (e.key === 'End') next = radios[radios.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus();
      next.click();
    });
  });

  panel.querySelectorAll('.ms-switch[data-option]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-option');
      const next = btn.getAttribute('aria-checked') !== 'true';
      onSetOption(key, next);
    });
  });

  panel
    .querySelector('[data-action="speak"]')
    .addEventListener('click', () => onSpeak());

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
    }

    const scale = s.options?.textScale || '100';
    panel
      .querySelectorAll('[data-option="textScale"] .ms-segment')
      .forEach((btn) => {
        const on = btn.getAttribute('data-value') === scale;
        btn.setAttribute('aria-checked', String(on));
        btn.setAttribute('tabindex', on ? '0' : '-1');
        btn.classList.toggle('ms-segment--on', on);
      });

    const theme = s.options?.colorTheme || 'senac';
    panel
      .querySelectorAll('[data-option="colorTheme"] .ms-theme-btn')
      .forEach((btn) => {
        const on = btn.getAttribute('data-value') === theme;
        btn.setAttribute('aria-checked', String(on));
        btn.setAttribute('tabindex', on ? '0' : '-1');
        btn.classList.toggle('ms-theme-btn--on', on);
      });

    [
      'dyslexiaFont',
      'readingRuler',
      'highlightLinks',
      'textSpacing',
      'reducedMotion',
      'hideImages',
    ].forEach((key) => {
      const btn = panel.querySelector(`.ms-switch[data-option="${key}"]`);
      if (!btn) return;
      const on = !!s.options?.[key];
      btn.setAttribute('aria-checked', String(on));
      btn.classList.toggle('ms-switch--on', on);
      const st = btn.querySelector('[data-state]');
      if (st) st.textContent = on ? S.stateOn : S.stateOff;
    });

    // Texto de estado dos radiogroups (valor atual); aria-hidden: aria-checked já o anuncia
    const setState = (key, text) => {
      const el = panel.querySelector(`[data-state-for="${key}"]`);
      if (el) el.textContent = text;
    };
    const curScale = TEXT_SCALES.find((x) => x.value === scale);
    setState(
      'textScale',
      curScale ? `${curScale.label} · ${curScale.title}` : `${scale}%`,
    );
    setState(
      'colorTheme',
      COLOR_THEMES.find((x) => x.value === theme)?.label ?? theme,
    );

    const speakBtn = panel.querySelector('[data-action="speak"]');
    if (speakBtn && ui.speaking !== undefined) {
      speakBtn.querySelector('[data-speak-text]').textContent = ui.speaking
        ? S.panelVoiceStopButton
        : S.panelVoiceButton;
      speakBtn.setAttribute(
        'aria-label',
        ui.speaking ? S.panelVoiceStopLabel : S.panelVoiceLabel,
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
