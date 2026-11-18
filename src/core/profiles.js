/**
 * core/profiles.js
 *
 * F7f — perfis de acessibilidade: pacotes prontos sobre as opções que já existem. Tabela única
 * (congelada); rótulos e descrições ficam em ui/strings.js (`profile<Key>Name` / `profile<Key>Desc`).
 *
 * Valores WCAG 1.4.12: linha 1,5 · palavra 0,16 em · letra 0,12 em.
 * Alto contraste = tema yellowBlack; o cursor grande é branco (contrasta com o fundo preto).
 */

const freeze = (p) =>
  Object.freeze({ ...p, options: Object.freeze({ ...p.options }) });

export const PROFILES = Object.freeze([
  freeze({ id: 'simple', key: 'Simple', modoSimples: true, options: {} }),
  freeze({
    id: 'lowVision',
    key: 'LowVision',
    modoSimples: false,
    options: {
      textScale: '150',
      colorTheme: 'yellowBlack',
      cursorStyle: 'bigWhite',
      lineHeight: 1.5,
    },
  }),
  freeze({
    id: 'dyslexia',
    key: 'Dyslexia',
    modoSimples: false,
    options: {
      dyslexiaFont: true,
      letterSpacing: 0.12,
      wordSpacing: 0.16,
      lineHeight: 1.5,
      readingRuler: true,
    },
  }),
  freeze({
    id: 'adhd',
    key: 'Adhd',
    modoSimples: true,
    options: { readFocus: true, muteMedia: true, reducedMotion: true },
  }),
  freeze({
    id: 'epilepsy',
    key: 'Epilepsy',
    modoSimples: false,
    options: { blockFlashing: true, reducedMotion: true, muteMedia: true },
  }),
  freeze({
    id: 'keyboard',
    key: 'Keyboard',
    modoSimples: false,
    options: { strongFocus: true, readFocus: true, showShortcuts: true },
  }),
]);

/** @param {string|null|undefined} id */
export function getProfile(id) {
  return PROFILES.find((p) => p.id === id) || null;
}

/**
 * Houve ajuste manual desde o perfil aplicado? Compara o estado atual com a foto tirada logo
 * depois de aplicar (inclui o que o Modo Simples deriva, como imagens e linguagem simples).
 * `reducedMotion` só conta quando o usuário escolheu (senão segue o SO e muda sozinho).
 * @param {{modoSimples: boolean, options: object}} base
 * @param {{modoSimples: boolean, options: object}} now
 * @param {boolean} reducedMotionIsUserChoice
 */
export function profileDiffers(base, now, reducedMotionIsUserChoice) {
  if (base.modoSimples !== now.modoSimples) return true;
  return Object.keys(base.options).some(
    (k) =>
      !k.startsWith('voice') && // voz é preferência do aparelho, não do perfil (F10)
      (k !== 'reducedMotion' || reducedMotionIsUserChoice) &&
      base.options[k] !== now.options[k],
  );
}
