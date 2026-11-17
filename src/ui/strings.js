/**
 * ui/strings.js
 *
 * Textos PT-BR da UI do Modo Simples, centralizados (F6a). Constantes estáticas:
 * seguras para os templates innerHTML (nenhum dado do host entra aqui).
 */

export const STRINGS = Object.freeze({
  // fab.js
  fabTip: 'Acessibilidade & Modo Simples',
  fabOpenLabel: 'Abrir painel de acessibilidade',
  fabCloseLabel: 'Fechar painel de acessibilidade',

  // a11yPanel.js
  panelCloseLabel: 'Fechar painel de acessibilidade',
  panelSimpleTitle: 'Modo Simples (Recomendado)',
  panelSimpleDesc:
    'Oculta distrações visuais, aumenta botões e resume conteúdos essenciais.',
  panelSimpleSwitchLabel: 'Modo Simples',
  panelTextSizeTitle: 'Tamanho do texto',
  panelTextSizeItemLabel: 'Tamanho do texto',
  panelThemeTitle: 'Contraste e cores',
  panelThemeItemLabel: 'Tema',
  panelDyslexiaTitle: 'Fonte Acessível (Lexend)',
  panelDyslexiaDesc: 'Desenvolvida para dislexia e agilidade visual',
  panelDyslexiaLabel: 'Fonte Acessível Lexend',
  panelRulerTitle: 'Régua de Foco de Leitura',
  panelRulerDesc: 'Destaque linha a linha para guiar a atenção',
  panelVoiceTitle: 'Leitor de Tela por Voz',
  panelVoiceDesc: 'Lê os títulos e textos em português',
  panelVoiceLabel: 'Ouvir conteúdo principal',
  panelVoiceButton: 'Ouvir',
  panelVoiceStopButton: 'Parar',
  panelVoiceStopLabel: 'Parar leitura',
  stateOn: 'Ligado',
  stateOff: 'Desligado',
  sectionTextTitle: 'Texto e leitura',
  sectionColorsTitle: 'Cores e destaque',
  sectionMotionTitle: 'Movimento e imagens',
  panelHighlightLinks: 'Destacar links',
  panelTextSpacing: 'Espaçamento de texto',
  panelReducedMotion: 'Reduzir movimento',
  panelHideImages: 'Ocultar imagens',
  panelHideImagesHint:
    'No Modo Simples, imagens somem por padrão — desligue para manter',
  panelDefaultTitle: 'Acessibilidade Digital',
  panelDefaultFooter: 'Preferências salvas neste navegador',
  scaleDefault: 'Padrão',
  scaleLarge: 'Grande',
  scaleLarger: 'Maior',
  scaleMax: 'Máximo',
  themeSite: 'Cores do site',
  themeSiteSub: 'Padrão',
  themeYellowBlack: 'Amarelo e Preto',
  themeYellowBlackSub: 'Alto contraste',
  themeDarkHigh: 'Modo Escuro Alto',
  themeDarkHighSub: 'Fundo escuro',
  themeSoft: 'Descanso / Suave',
  themeSoftSub: 'Baixa intensidade',

  // sessionChrome.js
  sessionOpenPanelLabel: 'Abrir painel de acessibilidade',
  sessionOpenPanelTitle: 'Acessibilidade',
  sessionBrand: 'SIMPLES',
  sessionSubOff: 'Acessibilidade Cognitiva',
  sessionSubOn: 'Interface Simplificada',
  sessionSwitchLabel: 'Modo Simples',
  sessionBarLabel: 'Modo Simples',
  sessionOffPrompt:
    'Quer uma navegação mais calma, direta e sem excesso de informação?',
  sessionActivate: 'Ativar Modo Simples',
  sessionOnTitle: 'Modo Simples',
  sessionOnSrSuffix: ' ativado',
  sessionBadge: 'Foco na Navegação',
  sessionDescSimple:
    'Exibindo explicações em palavras fáceis, sem termos complicados.',
  sessionDescCalm:
    'Navegação mais calma, com botões claros e menos distrações.',
  sessionSpeakLabel: 'Ouvir página',
  sessionSpeakText: 'Ouvir Página',
  sessionStopLabel: 'Parar leitura da página',
  sessionStopText: 'Parar Voz',
  sessionLangPre: 'Linguagem ',
  sessionLangMain: 'Simples',
  sessionLangOn: 'LIGADA',
  sessionLangOff: 'DESLIGADA',
  sessionLangUnavailable: 'Indisponível nesta página',
  sessionImages: 'Imagens',
  sessionImagesHidden: 'OCULTAS',
  sessionImagesVisible: 'VISÍVEIS',
  sessionExit: 'Voltar',
  sessionExitPost: ' ao site normal',
});
