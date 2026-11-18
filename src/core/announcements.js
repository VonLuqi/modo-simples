/**
 * src/core/announcements.js — textos anunciados (aria-live) por mudança de opções.
 *
 * Função pura: não toca DOM nem estado. Quem chama decide como anunciar cada texto.
 */

const TOGGLE_ANNOUNCEMENTS = {
  dyslexiaFont: ['Fonte Lexend ativada', 'Fonte Lexend desativada'],
  highlightLinks: ['Destaque de links ativado', 'Destaque de links desativado'],
  highlightHeadings: [
    'Destaque de cabeçalhos ativado',
    'Destaque de cabeçalhos desativado',
  ],
  highlightControls: [
    'Destaque de botões e campos ativado',
    'Destaque de botões e campos desativado',
  ],
  enlargeTargets: ['Botões ampliados', 'Botões com tamanho normal'],
  textSpacing: [
    'Espaçamento de texto ativado',
    'Espaçamento de texto desativado',
  ],
  hideImages: ['Imagens ocultadas', 'Imagens visíveis'],
  reducedMotion: [
    'Movimento reduzido ativado',
    'Movimento reduzido desativado',
  ],
  simpleLanguage: ['Linguagem simples ligada', 'Linguagem simples desligada'],
  readFocus: ['Leitura do foco ligada', 'Leitura do foco desligada'],
  muteMedia: ['Vídeos e sons silenciados', 'Vídeos e sons liberados'],
  strongFocus: ['Foco reforçado ligado', 'Foco reforçado desligado'],
  showShortcuts: ['Atalhos do teclado visíveis', 'Atalhos do teclado ocultos'],
  blockFlashing: [
    'Bloqueio de animações e GIFs ligado',
    'Bloqueio de animações e GIFs desligado',
  ],
};

const THEME_LABELS = {
  senac: 'Cores do site',
  yellowBlack: 'Amarelo e Preto',
  darkHigh: 'Modo Escuro Alto',
  soft: 'Descanso Suave',
  mono: 'Monocromático',
  lightHigh: 'Claro Alto Contraste',
};

const SATURATION_LABELS = { low: 'baixa', normal: 'normal', high: 'alta' };

const CURSOR_LABELS = {
  default: 'padrão',
  bigWhite: 'grande branco',
  bigBlack: 'grande preto',
};

const CUSTOM_LABELS = {
  customText: 'texto',
  customHeading: 'títulos',
  customBg: 'fundo',
};

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
    out.push(
      next.options.readingRuler
        ? 'Régua de leitura ativada'
        : 'Régua de leitura desativada',
    );
  }

  Object.entries(TOGGLE_ANNOUNCEMENTS).forEach(([k, [on, off]]) => {
    if (prev.options[k] !== next.options[k])
      out.push(next.options[k] ? on : off);
  });

  if (prev.options.textScale !== next.options.textScale) {
    out.push(`Tamanho do texto ${next.options.textScale}%`);
  }
  if (prev.options.colorTheme !== next.options.colorTheme) {
    out.push(
      `Tema ${THEME_LABELS[next.options.colorTheme] || next.options.colorTheme}`,
    );
  }
  if (prev.options.colorSaturation !== next.options.colorSaturation) {
    out.push(
      `Saturação ${SATURATION_LABELS[next.options.colorSaturation] || next.options.colorSaturation}`,
    );
  }
  if (prev.options.cursorStyle !== next.options.cursorStyle) {
    out.push(
      `Cursor ${CURSOR_LABELS[next.options.cursorStyle] || next.options.cursorStyle}`,
    );
  }
  Object.entries(CUSTOM_LABELS).forEach(([k, label]) => {
    if (prev.options[k] !== next.options[k])
      out.push(
        next.options[k]
          ? `Cor personalizada de ${label} ${next.options[k]}`
          : `Cor personalizada de ${label} removida`,
      );
  });

  return out;
}
