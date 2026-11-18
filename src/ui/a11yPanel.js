/**
 * ui/a11yPanel.js
 *
 * Painel de acessibilidade — Shadow-DOM friendly panel (header, Modo Simples card,
 * text scale, themes, aids). Header/footer texts come from config.brand.
 */

import { trapFocus } from '../utils/focus.js';
import { STRINGS as S } from './strings.js';
import { TYPO_LIMITS } from '../core/state.js';
import { isFocusReaderSupported } from '../features/focusReader.js';
import { createPageOutline } from '../features/pageOutline.js';
import { PROFILES } from '../core/profiles.js';
import { contrastRatio, effectiveColors } from '../utils/colorContrast.js';

/** Sliders de tipografia (F8b): posição 0 = padrão do site; o resto mapeia para o valor real. */
const TYPO_KEYS = ['lineHeight', 'wordSpacing', 'letterSpacing'];
const round2 = (n) => Math.round(n * 100) / 100;
const typoValue = (key, idx) =>
  idx <= 0
    ? 0
    : key === 'lineHeight'
      ? round2(
          TYPO_LIMITS.lineHeight.min + (idx - 1) * TYPO_LIMITS.lineHeight.step,
        ) // 1.º passo = 1,5
      : round2(idx * TYPO_LIMITS[key].step);
const typoIdx = (key, v) =>
  !(v > 0)
    ? 0
    : key === 'lineHeight'
      ? Math.round(
          (v - TYPO_LIMITS.lineHeight.min) / TYPO_LIMITS.lineHeight.step,
        ) + 1
      : Math.round(v / TYPO_LIMITS[key].step);
const typoText = (key, v) =>
  v > 0
    ? `${String(v).replace('.', ',')}${key === 'lineHeight' ? '' : ' em'}`
    : S.panelTypoDefault;

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
  { value: 'mono', label: S.themeMono, sub: S.themeMonoSub },
  { value: 'lightHigh', label: S.themeLightHigh, sub: S.themeLightHighSub },
];

const SATURATIONS = [
  { value: 'low', label: S.panelSaturationLow },
  { value: 'normal', label: S.panelSaturationNormal },
  { value: 'high', label: S.panelSaturationHigh },
];

const CURSORS = [
  { value: 'default', label: S.panelCursorDefault },
  { value: 'bigWhite', label: S.panelCursorBigWhite },
  { value: 'bigBlack', label: S.panelCursorBigBlack },
];

/** Cor personalizada: título + 8 presets com contraste ≥ 7:1 contra branco ou preto. */
const CUSTOM_COLORS = {
  customText: {
    labelId: 'ms-label-ctext',
    title: S.panelCustomTextTitle,
    presets: [
      '#000000',
      '#1a1a1a',
      '#0b2c5f',
      '#14532d',
      '#7f1d1d',
      '#ffffff',
      '#fef08a',
      '#bae6fd',
    ],
  },
  customHeading: {
    labelId: 'ms-label-cheading',
    title: S.panelCustomHeadingTitle,
    presets: [
      '#000000',
      '#0b2c5f',
      '#7f1d1d',
      '#14532d',
      '#4a148c',
      '#ffffff',
      '#fde047',
      '#93c5fd',
    ],
  },
  customBg: {
    labelId: 'ms-label-cbg',
    title: S.panelCustomBgTitle,
    presets: [
      '#ffffff',
      '#fffbe6',
      '#f5efe0',
      '#e6f0ff',
      '#e8f5e9',
      '#000000',
      '#0f172a',
      '#1a1a1a',
    ],
  },
};

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
  // Segmentos preenchidos em createA11yPanel (DOM, sem interpolação no template)
  colorSaturation: {
    wide: true,
    html: `
        ${radioHead('ms-label-sat', S.panelSaturationTitle, 'colorSaturation')}
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-sat" data-option="colorSaturation"></div>`,
  },
  // Segmentos preenchidos em createA11yPanel. Em tela de toque não há cursor: o controle fica e é inofensivo
  cursorStyle: {
    wide: true,
    html: `
        ${radioHead('ms-label-cursor', S.panelCursorTitle, 'cursorStyle')}
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-cursor" data-option="cursorStyle"></div>`,
  },
  customText: {
    wide: true,
    html: `
        ${radioHead('ms-label-ctext', S.panelCustomTextTitle, 'customText')}
        <div class="ms-swatches" role="radiogroup" aria-labelledby="ms-label-ctext" data-option="customText"></div>
        <input type="color" class="ms-color-input" data-picker="customText">`,
  },
  customHeading: {
    wide: true,
    html: `
        ${radioHead('ms-label-cheading', S.panelCustomHeadingTitle, 'customHeading')}
        <div class="ms-swatches" role="radiogroup" aria-labelledby="ms-label-cheading" data-option="customHeading"></div>
        <input type="color" class="ms-color-input" data-picker="customHeading">`,
  },
  customBg: {
    wide: true,
    html: `
        ${radioHead('ms-label-cbg', S.panelCustomBgTitle, 'customBg')}
        <div class="ms-swatches" role="radiogroup" aria-labelledby="ms-label-cbg" data-option="customBg"></div>
        <input type="color" class="ms-color-input" data-picker="customBg">
        <p class="ms-a11y-warn" role="status" aria-atomic="true" data-contrast-warn></p>`,
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
  readFocus: {
    html: switchTile({
      option: 'readFocus',
      title: S.panelReadFocusTitle,
      label: S.panelReadFocusTitle,
      desc: S.panelReadFocusDesc,
      icon: svgIcon(
        '<path d="M5 4v14l4-3.5 2.5 5 2.5-1-2.5-5H16z"/><path d="M17.5 5.5a4 4 0 0 1 0 5"/>',
      ),
    }),
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
  highlightHeadings: {
    html: switchTile({
      option: 'highlightHeadings',
      title: S.panelHighlightHeadings,
      label: S.panelHighlightHeadings,
      icon: svgIcon(
        '<path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/>',
      ),
    }),
  },
  highlightControls: {
    html: switchTile({
      option: 'highlightControls',
      title: S.panelHighlightControls,
      label: S.panelHighlightControls,
      icon: svgIcon(
        '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M8 12h8"/>',
      ),
    }),
  },
  enlargeTargets: {
    html: switchTile({
      option: 'enlargeTargets',
      title: S.panelEnlargeTargets,
      label: S.panelEnlargeTargets,
      icon: svgIcon(
        '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 15l6-6"/><path d="M10 9h5v5"/>',
      ),
    }),
  },
  textMagnifier: {
    html: switchTile({
      option: 'textMagnifier',
      title: S.panelTextMagnifier,
      label: S.panelTextMagnifier,
      icon: svgIcon(
        '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/><path d="M8 10h4"/>',
      ),
    }),
  },
  // F9c: ação de sessão (abre um diálogo), não é opção persistida
  pageOutline: {
    html: `<button type="button" class="ms-tile" data-action="page-outline" aria-haspopup="dialog"><span class="ms-tile-icon" aria-hidden="true">${svgIcon('<path d="M4 6h16"/><path d="M8 12h12"/><path d="M12 18h8"/>')}</span><span class="ms-tile-label">${S.panelPageOutline}</span></button>`,
  },
  // Ocupa a linha inteira da grade (não é radiogroup, então não usa `wide`)
  typography: {
    html: `
        <div class="ms-a11y-block--span" role="group" aria-labelledby="ms-label-typo">
          <p id="ms-label-typo" class="ms-a11y-control-label">${S.panelTypoGroupLabel}</p>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-range-lineHeight">${S.panelLineHeightTitle}</label><span class="ms-a11y-control-state" data-state-for="lineHeight" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-range-lineHeight" data-range="lineHeight" min="0" step="1" value="0">
          </div>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-range-wordSpacing">${S.panelWordSpacingTitle}</label><span class="ms-a11y-control-state" data-state-for="wordSpacing" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-range-wordSpacing" data-range="wordSpacing" min="0" step="1" value="0">
          </div>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-range-letterSpacing">${S.panelLetterSpacingTitle}</label><span class="ms-a11y-control-state" data-state-for="letterSpacing" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-range-letterSpacing" data-range="letterSpacing" min="0" step="1" value="0">
          </div>
          <button type="button" class="ms-a11y-action ms-a11y-action--font" data-action="reset-font" aria-label="${S.panelResetFontLabel}">${S.panelResetFont}</button>
        </div>`,
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
  strongFocus: {
    html: switchTile({
      option: 'strongFocus',
      title: S.panelStrongFocusTitle,
      label: S.panelStrongFocusTitle,
      desc: S.panelStrongFocusDesc,
      icon: svgIcon(
        '<rect x="4" y="6" width="16" height="12" rx="2"/><rect x="1.5" y="3.5" width="21" height="17" rx="3.5"/>',
      ),
    }),
  },
  showShortcuts: {
    html: switchTile({
      option: 'showShortcuts',
      title: S.panelShortcutsTitle,
      label: S.panelShortcutsTitle,
      desc: S.panelShortcutsDesc,
      icon: svgIcon(
        '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
      ),
    }),
  },
  blockFlashing: {
    html: switchTile({
      option: 'blockFlashing',
      title: S.panelBlockFlashingTitle,
      label: S.panelBlockFlashingTitle,
      desc: S.panelBlockFlashingDesc,
      icon: svgIcon('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
    }),
  },
  muteMedia: {
    html: switchTile({
      option: 'muteMedia',
      title: S.panelMuteMediaTitle,
      label: S.panelMuteMediaTitle,
      desc: S.panelMuteMediaDesc,
      icon: svgIcon(
        '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6"/><path d="m21 9-5 6"/>',
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
      'readFocus',
      'typography',
    ],
  },
  {
    id: 'colors',
    title: S.sectionColorsTitle,
    icon: svgIcon(
      '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
    ),
    controls: [
      'colorTheme',
      'colorSaturation',
      'customText',
      'customHeading',
      'customBg',
      'cursorStyle',
      'highlightLinks',
    ],
  },
  {
    id: 'pageTools',
    title: S.sectionPageToolsTitle,
    icon: svgIcon(
      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 14h8"/>',
    ),
    controls: [
      'highlightHeadings',
      'highlightControls',
      'enlargeTargets',
      'textMagnifier',
      'pageOutline',
    ],
  },
  {
    id: 'motion',
    title: S.sectionMotionTitle,
    icon: svgIcon(
      '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/>',
    ),
    controls: ['reducedMotion', 'blockFlashing', 'muteMedia', 'hideImages'],
  },
  {
    id: 'keyboard',
    title: S.sectionKeyboardTitle,
    icon: svgIcon(
      '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    ),
    controls: ['strongFocus', 'showShortcuts'],
  },
];

/** F7f: escolha de perfil, montada por DOM (textos só de strings.js; botões com aria-pressed). */
function buildProfiles() {
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };
  const sec = el('section', 'ms-a11y-profiles');
  sec.setAttribute('aria-labelledby', 'ms-profiles-title');
  const h = el(
    'h3',
    'ms-a11y-section-title ms-profiles-title',
    S.profilesTitle,
  );
  h.id = 'ms-profiles-title';
  const list = el('div', 'ms-profile-list');
  for (const p of PROFILES) {
    const b = el('button', 'ms-profile');
    b.type = 'button';
    b.setAttribute('data-profile', p.id);
    b.setAttribute('aria-pressed', 'false');
    b.appendChild(el('span', 'ms-profile-name', S['profile' + p.key + 'Name']));
    b.appendChild(el('span', 'ms-profile-desc', S['profile' + p.key + 'Desc']));
    const custom = el('span', 'ms-profile-custom', S.profileCustom);
    custom.hidden = true;
    b.appendChild(custom);
    list.appendChild(b);
  }
  sec.appendChild(h);
  sec.appendChild(el('p', 'ms-profiles-hint', S.profilesHint));
  sec.appendChild(list);
  return sec;
}

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
 * @param {() => void} [opts.onResetAll]
 * @param {() => void} [opts.onMoveSide]
 * @param {{ title?: string, subtitle?: string, footer?: string }} [opts.brand]
 * @returns {{ element: HTMLElement, open: () => void, close: () => void, sync: (state: Object) => void }}
 */
export function createA11yPanel({
  state,
  onClose,
  onToggleModoSimples,
  onSetOption,
  onSpeak,
  onResetAll,
  onResetFont,
  onSelectProfile,
  onMoveSide,
  onOutlineJump,
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
      <div data-slot="profiles"></div>
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

      <div class="ms-a11y-actions">
        <button type="button" class="ms-a11y-action" data-action="reset-all">${S.panelResetLabel}</button>
        <button type="button" class="ms-a11y-action" data-action="move-side">${S.panelMoveToLeft}</button>
      </div>

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

  // Saturação e cores personalizadas: botões criados por DOM (valores são constantes internas)
  const radioBtn = (cls, value, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', 'false');
    b.className = cls;
    b.setAttribute('data-value', value);
    b.setAttribute('aria-label', label);
    return b;
  };
  const satGroup = panel.querySelector('[data-option="colorSaturation"]');
  SATURATIONS.forEach((s) => {
    const b = radioBtn(
      'ms-segment',
      s.value,
      `${S.panelSaturationTitle} ${s.label}`,
    );
    b.textContent = s.label;
    satGroup.appendChild(b);
  });
  const cursorGroup = panel.querySelector('[data-option="cursorStyle"]');
  CURSORS.forEach((c) => {
    const b = radioBtn(
      'ms-segment',
      c.value,
      `${S.panelCursorTitle} ${c.label}`,
    );
    b.textContent = c.label;
    cursorGroup.appendChild(b);
  });
  Object.entries(CUSTOM_COLORS).forEach(([key, cfg]) => {
    const group = panel.querySelector(`[data-option="${key}"]`);
    const none = radioBtn(
      'ms-swatch ms-swatch--none',
      '',
      `${cfg.title}: ${S.panelCustomNone}`,
    );
    none.title = S.panelCustomNone;
    group.appendChild(none);
    cfg.presets.forEach((hex) => {
      const b = radioBtn(
        'ms-swatch',
        hex,
        `${S.panelCustomSwatchLabel} ${hex} — ${cfg.title}`,
      );
      b.style.backgroundColor = hex;
      b.title = hex;
      group.appendChild(b);
    });
    // L1 (QA): cor do seletor livre não coincide com preset — este rádio "Personalizada" aparece
    // marcado (aria-checked) só enquanto vale, para o leitor de tela saber o estado
    const other = radioBtn(
      'ms-swatch ms-swatch--custom',
      'x',
      `${cfg.title}: ${S.panelCustomOther}`,
    );
    other.hidden = true;
    group.appendChild(other);
    panel
      .querySelector(`[data-picker="${key}"]`)
      .setAttribute('aria-label', `${S.panelCustomPickerLabel} ${cfg.title}`);
  });

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
  panel.querySelector('[data-slot="profiles"]').appendChild(buildProfiles());
  panel
    .querySelectorAll('[data-profile]')
    .forEach((btn) =>
      btn.addEventListener('click', () =>
        onSelectProfile?.(btn.getAttribute('data-profile')),
      ),
    );
  panel
    .querySelector('[data-action="reset-all"]')
    .addEventListener('click', () => onResetAll?.());
  panel
    .querySelector('[data-action="reset-font"]')
    .addEventListener('click', () => onResetFont?.());
  const outline = createPageOutline({
    container: panel,
    onJump: (el) => onOutlineJump?.(el),
  });
  panel
    .querySelector('[data-action="page-outline"]')
    .addEventListener('click', (e) => outline.open(e.currentTarget));

  // F8b: faixa e rótulo falado de cada slider; teclado (setas/Home/End/PageUp/Down) é o nativo
  TYPO_KEYS.forEach((key) => {
    const input = panel.querySelector(`[data-range="${key}"]`);
    input.max = String(typoIdx(key, TYPO_LIMITS[key].max));
    input.setAttribute('aria-valuetext', typoText(key, 0));
    input.addEventListener('input', () =>
      onSetOption(key, typoValue(key, Number(input.value))),
    );
  });
  panel
    .querySelector('[data-action="move-side"]')
    .addEventListener('click', () => onMoveSide?.());

  /** Lado atual do painel: o botão oferece o lado oposto. @param {'left'|'right'} side */
  function setSide(side) {
    panel.setAttribute('data-ms-side', side);
    panel.querySelector('[data-action="move-side"]').textContent =
      side === 'left' ? S.panelMoveToRight : S.panelMoveToLeft;
  }

  panel
    .querySelector('[data-action="modo-simples"]')
    .addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const next = btn.getAttribute('aria-checked') !== 'true';
      onToggleModoSimples(next);
    });

  panel.querySelectorAll('.ms-segmented .ms-segment').forEach((btn) => {
    btn.addEventListener('click', () => {
      onSetOption(
        btn.closest('[data-option]').getAttribute('data-option'),
        btn.getAttribute('data-value'),
      );
    });
  });

  panel.querySelectorAll('.ms-swatches .ms-swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      onSetOption(
        btn.closest('[data-option]').getAttribute('data-option'),
        btn.getAttribute('data-value'),
      );
    });
  });
  panel.querySelectorAll('.ms-color-input').forEach((input) => {
    input.addEventListener('input', () => {
      onSetOption(input.getAttribute('data-picker'), input.value);
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
      const radios = [...group.querySelectorAll('[role="radio"]')].filter(
        (r) => !r.hidden,
      );
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

    TYPO_KEYS.forEach((key) => {
      const v = Number(s.options?.[key]) || 0;
      const input = panel.querySelector(`[data-range="${key}"]`);
      if (input) {
        input.value = String(typoIdx(key, v));
        input.setAttribute('aria-valuetext', typoText(key, v));
      }
      const st = panel.querySelector(`[data-state-for="${key}"]`);
      if (st) st.textContent = typoText(key, v);
    });

    // Radiogroups extras: saturação e cores personalizadas (roving tabindex; sem match → 1º tabulável)
    const syncRadios = (selector, value) => {
      const radios = [...panel.querySelectorAll(selector)];
      const hit = radios.some((b) => b.getAttribute('data-value') === value);
      radios.forEach((btn, i) => {
        const on = btn.getAttribute('data-value') === value;
        btn.setAttribute('aria-checked', String(on));
        btn.setAttribute('tabindex', on || (!hit && i === 0) ? '0' : '-1');
        btn.classList.toggle(
          btn.classList.contains('ms-swatch')
            ? 'ms-swatch--on'
            : 'ms-segment--on',
          on,
        );
      });
    };
    const sat = s.options?.colorSaturation || 'normal';
    const cursor = s.options?.cursorStyle || 'default';
    syncRadios('[data-option="colorSaturation"] .ms-segment', sat);
    syncRadios('[data-option="cursorStyle"] .ms-segment', cursor);
    Object.keys(CUSTOM_COLORS).forEach((key) => {
      const val = s.options?.[key] || '';
      const other = panel.querySelector(
        `[data-option="${key}"] .ms-swatch--custom`,
      );
      if (other) {
        const isOther = !!val && !CUSTOM_COLORS[key].presets.includes(val);
        other.hidden = !isOther;
        other.setAttribute('data-value', isOther ? val : 'x');
        other.style.backgroundColor = isOther ? val : '';
        other.title = isOther ? val : '';
      }
      syncRadios(`[data-option="${key}"] .ms-swatch`, val);
      const input = panel.querySelector(`[data-picker="${key}"]`);
      if (input) input.value = val || '#000000';
      const st = panel.querySelector(`[data-state-for="${key}"]`);
      if (st) st.textContent = val || S.panelCustomNone;
    });

    // M1 (QA): aviso (não bloqueia) quando o par escolhido tem < 4,5:1; o lado não escolhido é
    // completado automaticamente em domMutator (utils/colorContrast)
    const warn = panel.querySelector('[data-contrast-warn]');
    if (warn) {
      // pares efetivos (inclui fundo/texto automáticos): texto/fundo e título/fundo
      const eff = effectiveColors(s.options || {});
      const low = [
        [S.panelCustomTextTitle, eff.text],
        [S.panelCustomHeadingTitle, eff.heading],
      ]
        .filter(([, c]) => c && eff.bg)
        .map(([title, c]) => [title, contrastRatio(c, eff.bg)])
        .filter(([, r]) => r < 4.5);
      // fundo que o usuário não escolheu é o automático: dizer isso no aviso
      const bgLabel = s.options?.customBg
        ? S.panelCustomBgTitle
        : S.panelAutoBgTitle;
      warn.textContent = low
        .map(
          ([title, r]) =>
            `${S.panelContrastWarn} ${title} / ${bgLabel}: ${r
              .toFixed(1)
              .replace('.', ',')}:1.`,
        )
        .join(' ');
    }

    [
      'dyslexiaFont',
      'readingRuler',
      'highlightLinks',
      'highlightHeadings',
      'highlightControls',
      'enlargeTargets',
      'textMagnifier',
      'textSpacing',
      'reducedMotion',
      'hideImages',
      'readFocus',
      'muteMedia',
      'blockFlashing',
      'strongFocus',
      'showShortcuts',
    ].forEach((key) => {
      const btn = panel.querySelector(`.ms-switch[data-option="${key}"]`);
      if (!btn) return;
      const on = !!s.options?.[key];
      btn.setAttribute('aria-checked', String(on));
      btn.classList.toggle('ms-switch--on', on);
      const st = btn.querySelector('[data-state]');
      if (st) st.textContent = on ? S.stateOn : S.stateOff;
      if (key === 'readFocus' && !isFocusReaderSupported()) {
        // sem speechSynthesis: opção desligada, com o motivo em palavras simples
        btn.disabled = true;
        btn.setAttribute('title', S.panelReadFocusUnsupported);
        if (st) st.textContent = S.panelReadFocusUnsupportedState;
        const d = panel.querySelector('#ms-desc-readFocus');
        if (d) d.textContent = S.panelReadFocusUnsupported;
      }
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
    setState(
      'colorSaturation',
      SATURATIONS.find((x) => x.value === sat)?.label ?? sat,
    );
    setState(
      'cursorStyle',
      CURSORS.find((x) => x.value === cursor)?.label ?? cursor,
    );

    panel.querySelectorAll('[data-profile]').forEach((btn) => {
      const active = s.activeProfile === btn.getAttribute('data-profile');
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('ms-profile--on', active);
      btn.querySelector('.ms-profile-custom').hidden = !(
        active && s.profileCustom
      );
    });

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
    outline.close({ restoreFocus: false });
    panel.hidden = true;
    if (_releaseFocus) {
      _releaseFocus();
      _releaseFocus = null;
    }
  }

  sync(state);

  return {
    element: panel,
    open,
    close,
    sync,
    setSide,
    closeOutline: () => outline.close({ restoreFocus: false }),
  };
}
