/**
 * src/core/announcements.js — textos anunciados (aria-live) por mudança de opções.
 *
 * Os textos vêm de i18n (t) na hora de anunciar, então seguem o idioma atual.
 * Sem DOM nem estado: quem chama decide como anunciar cada texto.
 */

import { t } from '../i18n/index.js';

/** opção → sufixo das chaves `ann<Sufixo>On` / `ann<Sufixo>Off`; a ordem é a do anúncio */
const TOGGLES = {
  dyslexiaFont: 'DyslexiaFont',
  highlightLinks: 'HighlightLinks',
  highlightHeadings: 'HighlightHeadings',
  highlightControls: 'HighlightControls',
  textMagnifier: 'TextMagnifier',
  enlargeTargets: 'EnlargeTargets',
  textSpacing: 'TextSpacing',
  hideImages: 'HideImages',
  reducedMotion: 'ReducedMotion',
  simpleLanguage: 'SimpleLanguage',
  readFocus: 'ReadFocus',
  muteMedia: 'MuteMedia',
  strongFocus: 'StrongFocus',
  showShortcuts: 'ShowShortcuts',
  blockFlashing: 'BlockFlashing',
};

const CUSTOM_COLORS = {
  customText: 'annCustomText',
  customHeading: 'annCustomHeading',
  customBg: 'annCustomBg',
};

const cap = (s) => s[0].toUpperCase() + s.slice(1);

/** Rótulo traduzido de `<prefixo><Valor>`; valor desconhecido volta como veio. */
function label(prefix, value) {
  const key = prefix + cap(String(value));
  const text = t(key);
  return text === key ? value : text;
}

/**
 * Mensagens a anunciar ao ir de `prev` para `next`, na ordem de anúncio:
 * régua, toggles, tamanho do texto, tema.
 * @param {{options: object}} prev
 * @param {{options: object}} next
 * @returns {string[]}
 */
export function diffStateAnnouncements(prev, next) {
  const out = [];

  if (prev.options.readingRuler !== next.options.readingRuler) {
    out.push(t(next.options.readingRuler ? 'annRulerOn' : 'annRulerOff'));
  }

  Object.entries(TOGGLES).forEach(([k, name]) => {
    if (prev.options[k] !== next.options[k])
      out.push(t(`ann${name}${next.options[k] ? 'On' : 'Off'}`));
  });

  if (prev.options.textScale !== next.options.textScale) {
    out.push(t('annTextSize', { value: next.options.textScale }));
  }
  if (prev.options.colorTheme !== next.options.colorTheme) {
    out.push(
      t('annTheme', { value: label('annTheme', next.options.colorTheme) }),
    );
  }
  if (prev.options.colorSaturation !== next.options.colorSaturation) {
    out.push(
      t('annSaturation', {
        value: label('annSaturation', next.options.colorSaturation),
      }),
    );
  }
  if (prev.options.cursorStyle !== next.options.cursorStyle) {
    out.push(
      t('annCursor', { value: label('annCursor', next.options.cursorStyle) }),
    );
  }
  Object.entries(CUSTOM_COLORS).forEach(([k, labelKey]) => {
    if (prev.options[k] !== next.options[k])
      out.push(
        next.options[k]
          ? t('annCustomColor', { label: t(labelKey), value: next.options[k] })
          : t('annCustomColorRemoved', { label: t(labelKey) }),
      );
  });

  return out;
}
