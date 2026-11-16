/**
 * Hydrate in-memory state from a persisted payload (localStorage).
 * Preferências do painel (tema, escala, etc.) persistem com ou sem Modo Simples.
 * `simpleLanguage` só volta se o MS estiver ativo (é recurso de sessão MS).
 *
 * @param {Object|null|undefined} saved
 * @returns {{ modoSimples: boolean, options: Object } | null}
 */
export function hydratePersistedState(saved) {
  if (!saved || typeof saved !== 'object') return null;

  const opts = saved.options || {};
  let textScale = opts.textScale || '100';
  if (!opts.textScale && opts.largerText) textScale = '125';
  let colorTheme = opts.colorTheme || 'senac';
  if (!opts.colorTheme && opts.highContrast) colorTheme = 'yellowBlack';

  const modoSimples = Boolean(saved.modoSimples);

  return {
    modoSimples,
    options: {
      textScale: ['100', '125', '150', '175'].includes(textScale)
        ? textScale
        : '100',
      colorTheme: ['senac', 'yellowBlack', 'darkHigh', 'soft'].includes(
        colorTheme,
      )
        ? colorTheme
        : 'senac',
      dyslexiaFont: Boolean(opts.dyslexiaFont),
      readingRuler: Boolean(opts.readingRuler),
      highlightLinks: Boolean(opts.highlightLinks),
      textSpacing: Boolean(opts.textSpacing),
      reducedMotion: Boolean(opts.reducedMotion),
      hideImages: Boolean(opts.hideImages),
      // Linguagem simples é acoplada ao MS; sem MS não reativa “órfã”
      simpleLanguage: modoSimples ? Boolean(opts.simpleLanguage) : false,
    },
  };
}
