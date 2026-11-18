import { getProfile } from './profiles.js';
import { clampTypo } from './state.js';

/**
 * Hydrate in-memory state from a persisted payload (localStorage).
 * Preferências do painel (tema, escala, etc.) persistem com ou sem Modo Simples.
 * `simpleLanguage` só volta se o MS estiver ativo (é recurso de sessão MS).
 *
 * @param {Object|null|undefined} saved
 * @returns {{ modoSimples: boolean, options: Object } | null}
 */
/**
 * Versão do esquema gravado em `ms_state:<host>` (campo `v`). Payload sem `v` é o formato
 * antigo (v0): continua sendo lido e é regravado como v1 na próxima mudança — nenhuma
 * preferência se perde (IMP-33).
 */
export const SCHEMA_VERSION = 1;

/** Cor personalizada: só #rrggbb (vem de storage; nunca confiar). */
const hexOrEmpty = (v) =>
  typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : '';

export function hydratePersistedState(saved) {
  if (!saved || typeof saved !== 'object') return null;

  const opts = saved.options || {};
  let textScale = opts.textScale || '100';
  if (!opts.textScale && opts.largerText) textScale = '125';
  let colorTheme = opts.colorTheme || 'senac';
  if (!opts.colorTheme && opts.highContrast) colorTheme = 'yellowBlack';

  const modoSimples = Boolean(saved.modoSimples);
  // estado antigo (sem perfil) → nenhum perfil
  const activeProfile = getProfile(saved.activeProfile)?.id ?? null;

  return {
    modoSimples,
    activeProfile,
    profileCustom: activeProfile ? Boolean(saved.profileCustom) : false,
    options: {
      textScale: ['100', '125', '150', '175'].includes(textScale)
        ? textScale
        : '100',
      colorTheme: [
        'senac',
        'yellowBlack',
        'darkHigh',
        'soft',
        'mono',
        'lightHigh',
      ].includes(colorTheme)
        ? colorTheme
        : 'senac',
      colorSaturation: ['low', 'normal', 'high'].includes(opts.colorSaturation)
        ? opts.colorSaturation
        : 'normal',
      customText: hexOrEmpty(opts.customText),
      customHeading: hexOrEmpty(opts.customHeading),
      customBg: hexOrEmpty(opts.customBg),
      dyslexiaFont: Boolean(opts.dyslexiaFont),
      readingRuler: Boolean(opts.readingRuler),
      highlightLinks: Boolean(opts.highlightLinks),
      highlightHeadings: Boolean(opts.highlightHeadings),
      highlightControls: Boolean(opts.highlightControls),
      enlargeTargets: Boolean(opts.enlargeTargets),
      textMagnifier: Boolean(opts.textMagnifier),
      textSpacing: Boolean(opts.textSpacing),
      lineHeight: clampTypo('lineHeight', opts.lineHeight),
      wordSpacing: clampTypo('wordSpacing', opts.wordSpacing),
      letterSpacing: clampTypo('letterSpacing', opts.letterSpacing),
      cursorStyle: ['default', 'bigWhite', 'bigBlack'].includes(
        opts.cursorStyle,
      )
        ? opts.cursorStyle
        : 'default',
      reducedMotion: Boolean(opts.reducedMotion),
      hideImages: Boolean(opts.hideImages),
      readFocus: Boolean(opts.readFocus),
      muteMedia: Boolean(opts.muteMedia),
      blockFlashing: Boolean(opts.blockFlashing),
      strongFocus: Boolean(opts.strongFocus),
      showShortcuts: Boolean(opts.showShortcuts),
      // Linguagem simples é acoplada ao MS; sem MS não reativa “órfã”
      simpleLanguage: modoSimples ? Boolean(opts.simpleLanguage) : false,
    },
  };
}
