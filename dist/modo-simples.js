/*! modo-simples v2.0.0 | MIT | Script JavaScript injetável de acessibilidade web — Modo Simples */
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/i18n/pt.js
  var pt_exports = {};
  __export(pt_exports, {
    SHORTCUTS: () => SHORTCUTS,
    STRINGS: () => STRINGS,
    VOICE_CMD_STRINGS: () => VOICE_CMD_STRINGS
  });
  var STRINGS = Object.freeze({
    // fab.js
    fabTip: "Acessibilidade & Modo Simples",
    fabOpenLabel: "Abrir painel de acessibilidade",
    fabCloseLabel: "Fechar painel de acessibilidade",
    fabHideLabel: "Esconder bot\xE3o de acessibilidade nesta p\xE1gina",
    announceWidgetHidden: "Bot\xE3o de acessibilidade escondido. Alt+Shift+A mostra de novo.",
    announceResetAll: "Tudo desligado. P\xE1gina sem ajustes.",
    announceStillOn: "Modo Simples continua ligado",
    announceOn: "Modo Simples ativado",
    announceOff: "Modo Simples desativado",
    announcePanelOpen: "Painel de acessibilidade aberto",
    announceReadStopped: "Leitura interrompida",
    announceReadStart: "Lendo conte\xFAdo principal",
    announceSideLeft: "Painel movido para a esquerda",
    announceSideRight: "Painel movido para a direita",
    panelResetLabel: "Desligar tudo",
    panelMoveToLeft: "Mover para a esquerda",
    panelMoveToRight: "Mover para a direita",
    // a11yPanel.js
    panelCloseLabel: "Fechar painel de acessibilidade",
    panelSimpleTitle: "Modo Simples (Recomendado)",
    panelSimpleDesc: "Oculta distra\xE7\xF5es visuais, aumenta bot\xF5es e resume conte\xFAdos essenciais.",
    panelSimpleSwitchLabel: "Modo Simples",
    panelTextSizeTitle: "Tamanho do texto",
    panelTextSizeItemLabel: "Tamanho do texto",
    panelThemeTitle: "Contraste e cores",
    panelThemeItemLabel: "Tema",
    panelDyslexiaTitle: "Fonte Acess\xEDvel (Lexend)",
    panelDyslexiaDesc: "Desenvolvida para dislexia e agilidade visual",
    panelDyslexiaLabel: "Fonte Acess\xEDvel Lexend",
    panelRulerTitle: "R\xE9gua de Foco de Leitura",
    panelRulerDesc: "Destaque linha a linha para guiar a aten\xE7\xE3o",
    panelVoiceTitle: "Leitor de Tela por Voz",
    panelVoiceDesc: "L\xEA os t\xEDtulos e textos em portugu\xEAs",
    panelVoiceLabel: "Ouvir conte\xFAdo principal",
    panelVoiceButton: "Ouvir",
    panelVoiceStopButton: "Parar",
    panelVoiceStopLabel: "Parar leitura",
    panelLanguageTitle: "Idioma",
    panelLanguageAuto: "Autom\xE1tico ({lang})",
    panelVoiceStudioTitle: "Est\xFAdio de Voz",
    panelVoiceSelectLabel: "Voz",
    panelVoiceAuto: "Autom\xE1tica (portugu\xEAs)",
    panelVoiceRateLabel: "Velocidade",
    panelVoicePitchLabel: "Tom",
    panelVoiceVolumeLabel: "Volume",
    panelVoiceTest: "Testar voz",
    panelVoiceTestLabel: "Testar voz com estas configura\xE7\xF5es",
    panelVoiceReset: "Voltar ao padr\xE3o",
    panelVoiceResetLabel: "Voltar ao padr\xE3o: voz, velocidade, tom e volume",
    panelVoiceUnsupported: "Este navegador n\xE3o tem voz para ler. Tente outro navegador.",
    // F10e — pausar/continuar e comandos de voz no painel
    panelPause: "Pausar",
    panelPauseLabel: "Pausar leitura",
    panelResume: "Continuar",
    panelResumeLabel: "Continuar leitura",
    panelVcTitle: "Comandos de voz",
    panelVcDesc: "Controle a leitura falando. Desligado at\xE9 voc\xEA ligar",
    panelVcLabel: "Comandos de voz",
    panelVcUnsupported: "Seu navegador n\xE3o entende comandos de voz. Use Chrome ou Edge.",
    panelVcListening: "Ouvindo\u2026",
    panelVcBlocked: "O microfone est\xE1 bloqueado. Libere nas configura\xE7\xF5es do navegador.",
    panelSpeechFailed: "Seu navegador n\xE3o conseguiu ler em voz alta: n\xE3o h\xE1 voz instalada. No Brave, abra-o com a op\xE7\xE3o --enable-speech-dispatcher, ou use Chrome ou Edge.",
    panelVoiceMoreHint: 'H\xE1 mais vozes parecidas. Use "Mostrar todas as vozes" para ver todas.',
    panelVoiceAll: "Mostrar todas as vozes",
    panelVcBrave: "O Brave n\xE3o permite comandos de voz. Use Chrome ou Edge.",
    panelVcNoMic: "N\xE3o achei um microfone.",
    panelVcError: "Os comandos de voz pararam. Tente ligar de novo.",
    panelVcRevoke: "Parar de enviar minha voz",
    panelVcRevokeLabel: "Parar de enviar minha voz e desligar comandos de voz",
    panelVcShow: "Ver comandos",
    panelVcHide: "Esconder comandos",
    // lista separada por | (todas as chaves deste arquivo são texto)
    panelVcCommands: "ler p\xE1gina|parar|pausar|continuar|mais r\xE1pido|mais devagar|descer|subir|ligar modo simples|desligar modo simples|abrir painel|fechar painel|ajuda",
    panelVcDownloadTitle: "Baixar o portugu\xEAs",
    panelVcDownloadText: "Para entender sua voz sem enviar nada para a internet, o navegador precisa baixar o portugu\xEAs uma vez. Baixar agora?",
    panelVcDownloadNow: "Baixar",
    panelVcDownloading: "Baixando\u2026",
    panelVcDownloadFail: "N\xE3o deu para baixar.",
    panelVcUseInternet: "Usar pela internet",
    panelVcNotNow: "Agora n\xE3o",
    panelVcCloudTitle: "Enviar minha voz?",
    panelVcCloudText: "Neste navegador, o que voc\xEA fala \xE9 enviado para a empresa do navegador (Google no Chrome, Microsoft no Edge) para ser entendido. O Modo Simples n\xE3o guarda nada. Quer ligar mesmo assim?",
    panelVcCloudYes: "Ligar e enviar minha voz",
    panelVcCloudNo: "N\xE3o ligar",
    mediaOtherSiteNotice: "Este v\xEDdeo \xE9 de outro site. N\xE3o consigo tirar o som dele.",
    panelStrongFocusTitle: "Foco bem vis\xEDvel",
    panelStrongFocusDesc: "Contorno grosso e de duas cores no item em que voc\xEA est\xE1, em qualquer fundo",
    panelShortcutsTitle: "Mostrar atalhos do teclado",
    panelShortcutsDesc: "Um cart\xE3o na tela lista as teclas que voc\xEA pode usar",
    shortcutsTitle: "Atalhos do teclado",
    shortcutsClose: "Fechar",
    shortcutAccessKeyPrefix: "Alt+",
    panelBlockFlashingTitle: "Bloquear anima\xE7\xF5es e GIFs",
    panelBlockFlashingDesc: "Para anima\xE7\xF5es, textos que correm e v\xEDdeos que come\xE7am sozinhos. GIFs ficam parados at\xE9 voc\xEA clicar",
    gifShowLabel: "Mostrar anima\xE7\xE3o",
    panelMuteMediaTitle: "Pausar e mutar tudo",
    panelMuteMediaDesc: "Pausa e silencia v\xEDdeos e sons da p\xE1gina, inclusive os que come\xE7am sozinhos",
    panelReadFocusTitle: "Ler o que eu seleciono",
    panelReadFocusDesc: "A voz l\xEA o bot\xE3o, link, campo ou texto em que voc\xEA clicar ou parar com a tecla Tab. Se voc\xEA usa leitor de tela, pode ouvir duas vezes",
    panelReadFocusUnsupported: "Este navegador n\xE3o tem voz para ler em voz alta",
    panelReadFocusUnsupportedState: "Sem voz",
    stateOn: "Ligado",
    stateOff: "Desligado",
    sectionTextTitle: "Texto e leitura",
    sectionColorsTitle: "Cores e destaque",
    sectionKeyboardTitle: "Teclado e foco",
    sectionMotionTitle: "Movimento e imagens",
    panelHighlightLinks: "Destacar links",
    sectionPageToolsTitle: "Ferramentas de p\xE1gina",
    panelHighlightHeadings: "Destacar cabe\xE7alhos",
    panelHighlightControls: "Destacar bot\xF5es e campos",
    panelEnlargeTargets: "Ampliar bot\xF5es",
    panelTextMagnifier: "Lupa de texto",
    panelPageOutline: "Estrutura da p\xE1gina",
    panelMouseGrid: "Grade de mouse",
    panelVirtualKeyboard: "Teclado virtual",
    vkLabel: "Teclado virtual",
    vkHint: "Toque num campo de texto",
    vkOpened: "Teclado virtual aberto. Toque num campo de texto.",
    vkClosed: "Teclado virtual fechado.",
    vkClose: "Fechar",
    vkPendingPre: "Digitando:",
    vkBackspace: "Apagar",
    vkEnter: "Enter",
    vkShift: "Shift",
    vkCaps: "Caps",
    vkAltGr: "AltGr",
    vkSpace: "Espa\xE7o",
    vkDeadAcute: "Acento agudo",
    vkDeadGrave: "Acento grave",
    vkDeadTilde: "Til",
    vkDeadCircumflex: "Acento circunflexo",
    vkDeadDiaeresis: "Trema",
    gridDialogLabel: "Grade de mouse",
    gridOpen: "Grade aberta. Escolha de 1 a 9.",
    gridLevelPre: "N\xEDvel",
    gridChoose: "Escolha de 1 a 9.",
    gridMin: "\xC1rea m\xEDnima. Aperte Enter para clicar.",
    gridTop: "Voc\xEA j\xE1 est\xE1 no primeiro n\xEDvel.",
    gridClosed: "Grade fechada.",
    gridClicked: "Clique feito.",
    gridCellLabel: "C\xE9lula",
    gridClickBtn: "Clicar aqui (Enter)",
    gridBackBtn: "Voltar (Backspace)",
    gridCloseBtn: "Fechar (Esc)",
    gridClickShort: "Clicar",
    gridBackShort: "Voltar",
    gridCloseShort: "Fechar",
    outlineTitle: "Estrutura da p\xE1gina",
    outlineClose: "Fechar",
    outlineLandmarks: "\xC1reas da p\xE1gina",
    outlineHeadings: "T\xEDtulos",
    outlineEmpty: "Esta p\xE1gina n\xE3o tem t\xEDtulos nem \xE1reas para listar.",
    outlineNoText: "(sem texto)",
    outlineLevel: "n\xEDvel",
    outlineLmMain: "Conte\xFAdo principal",
    outlineLmNav: "Navega\xE7\xE3o",
    outlineLmBanner: "Cabe\xE7alho do site",
    outlineLmFooter: "Rodap\xE9 do site",
    outlineLmAside: "Conte\xFAdo lateral",
    outlineLmForm: "Formul\xE1rio",
    outlineLmSearch: "Busca",
    outlineLmRegion: "Regi\xE3o",
    panelTextSpacing: "Espa\xE7amento de texto",
    panelReducedMotion: "Reduzir movimento",
    panelHideImages: "Ocultar imagens",
    panelHideImagesHint: "No Modo Simples, imagens somem por padr\xE3o \u2014 desligue para manter",
    panelDefaultTitle: "Acessibilidade Digital",
    panelDefaultFooter: "Prefer\xEAncias salvas neste navegador",
    scaleDefault: "Padr\xE3o",
    scaleLarge: "Grande",
    scaleLarger: "Maior",
    scaleMax: "M\xE1ximo",
    themeSite: "Cores do site",
    themeSiteSub: "Padr\xE3o",
    themeYellowBlack: "Amarelo e Preto",
    themeYellowBlackSub: "Alto contraste",
    themeDarkHigh: "Modo Escuro Alto",
    themeDarkHighSub: "Fundo escuro",
    themeSoft: "Descanso / Suave",
    themeSoftSub: "Baixa intensidade",
    themeMono: "Monocrom\xE1tico",
    themeMonoSub: "Tons de cinza",
    themeLightHigh: "Claro Alto Contraste",
    themeLightHighSub: "Fundo branco",
    panelTypoGroupLabel: "Ajuste fino da tipografia",
    panelLineHeightTitle: "Altura da linha",
    panelWordSpacingTitle: "Espa\xE7o entre palavras",
    panelLetterSpacingTitle: "Espa\xE7o entre letras",
    panelTypoDefault: "Padr\xE3o do site",
    panelResetFont: "Redefinir fonte",
    announceResetFont: "Fonte redefinida: tamanho, fonte acess\xEDvel e espa\xE7amentos voltaram ao padr\xE3o.",
    panelCursorTitle: "Cursor do mouse",
    panelCursorDefault: "Padr\xE3o",
    panelCursorBigWhite: "Grande branco",
    panelCursorBigBlack: "Grande preto",
    panelResetFontLabel: "Redefinir fonte: tamanho, fonte acess\xEDvel e espa\xE7amentos",
    panelSaturationTitle: "Satura\xE7\xE3o das cores",
    panelSaturationLow: "Baixa",
    panelSaturationNormal: "Normal",
    panelSaturationHigh: "Alta",
    panelCustomTextTitle: "Cor do texto",
    panelCustomHeadingTitle: "Cor dos t\xEDtulos",
    panelCustomBgTitle: "Cor do fundo",
    panelCustomNone: "Padr\xE3o do site",
    panelCustomSwatchLabel: "Usar cor",
    panelCustomPickerLabel: "Escolher outra cor para",
    panelCustomOther: "Personalizada",
    panelAutoBgTitle: "Fundo autom\xE1tico",
    panelContrastWarn: "Aten\xE7\xE3o: contraste baixo (recomendado 4,5:1 ou mais) em",
    // sessionChrome.js
    sessionOpenPanelLabel: "Abrir painel de acessibilidade",
    sessionOpenPanelTitle: "Acessibilidade",
    sessionBrand: "SIMPLES",
    sessionSubOff: "Acessibilidade Cognitiva",
    sessionSubOn: "Interface Simplificada",
    sessionSwitchLabel: "Modo Simples",
    sessionBarLabel: "Modo Simples",
    sessionOffPrompt: "Quer uma navega\xE7\xE3o mais calma, direta e sem excesso de informa\xE7\xE3o?",
    sessionActivate: "Ativar Modo Simples",
    sessionOnTitle: "Modo Simples",
    sessionOnSrSuffix: " ativado",
    sessionBadge: "Foco na Navega\xE7\xE3o",
    sessionDescSimple: "Exibindo explica\xE7\xF5es em palavras f\xE1ceis, sem termos complicados.",
    sessionDescCalm: "Navega\xE7\xE3o mais calma, com bot\xF5es claros e menos distra\xE7\xF5es.",
    sessionSpeakLabel: "Ouvir p\xE1gina",
    sessionSpeakText: "Ouvir P\xE1gina",
    sessionStopLabel: "Parar leitura da p\xE1gina",
    sessionStopText: "Parar Voz",
    sessionLangPre: "Linguagem ",
    sessionLangMain: "Simples",
    sessionLangOn: "LIGADA",
    sessionLangOff: "DESLIGADA",
    sessionLangUnavailable: "Indispon\xEDvel nesta p\xE1gina",
    sessionImages: "Imagens",
    sessionImagesHidden: "OCULTAS",
    sessionImagesVisible: "VIS\xCDVEIS",
    sessionExit: "Voltar",
    sessionExitPost: " ao site normal",
    // F7f — perfis (ui/a11yPanel.js; dados em core/profiles.js)
    profilesTitle: "Perfis prontos",
    profilesHint: "Escolha um e a p\xE1gina se ajusta. Um de cada vez.",
    profileSimpleName: "Modo Simples",
    profileSimpleDesc: "P\xE1gina mais limpa e f\xE1cil de ler",
    profileLowVisionName: "Baixa vis\xE3o",
    profileLowVisionDesc: "Texto maior, cores fortes e cursor grande",
    profileDyslexiaName: "Dislexia",
    profileDyslexiaDesc: "Fonte pr\xF3pria, mais espa\xE7o entre letras e r\xE9gua de leitura",
    profileAdhdName: "TDAH",
    profileAdhdDesc: "Menos distra\xE7\xE3o: sem som, sem movimento e a voz l\xEA o que voc\xEA seleciona",
    profileEpilepsyName: "Epilepsia",
    profileEpilepsyDesc: "Sem anima\xE7\xF5es, sem v\xEDdeo tocando sozinho e sem som",
    profileKeyboardName: "Teclado",
    profileKeyboardDesc: "Foco bem vis\xEDvel, atalhos na tela e a voz l\xEA o que voc\xEA seleciona",
    profileCustom: "Personalizado",
    profileOnPre: "Perfil ",
    profileOnPost: " ativado",
    profileOff: "Perfil desligado. P\xE1gina sem ajustes.",
    // features/focusReader.js (papéis e estados falados)
    roleButton: "bot\xE3o",
    roleLink: "link",
    roleHeading: "t\xEDtulo",
    roleField: "campo",
    roleCheckbox: "caixa de sele\xE7\xE3o",
    roleRadio: "op\xE7\xE3o",
    roleSwitch: "interruptor",
    roleSelect: "lista de op\xE7\xF5es",
    focusSubmitName: "Enviar",
    focusSwitchOn: "ligado",
    focusSwitchOff: "desligado",
    focusChecked: "marcado",
    focusUnchecked: "desmarcado",
    // features/manualSelect.js (linguagem simples, U-02 / UX-21)
    lowConfNotice: "N\xE3o achei o conte\xFAdo principal, quer escolher?",
    lowConfChoose: "Escolher o conte\xFAdo",
    lowConfClose: "Fechar",
    manualInstruction: "Clique ou toque no que voc\xEA quer ler. No teclado: Tab muda de bloco, setas aumentam ou diminuem a \xE1rea, Enter confirma, Esc volta.",
    manualCurrent: "Voc\xEA escolheu:",
    manualChosen: "Conte\xFAdo principal definido",
    manualCancelled: "Sele\xE7\xE3o manual cancelada",
    manualCancel: "Voltar",
    manualCancelLabel: "Voltar sem escolher",
    // voice.js / simpleNav.js
    voiceSample: "Esta \xE9 a voz que vai ler para voc\xEA.",
    simpleNavLabel: "Navega\xE7\xE3o do Modo Simples",
    // core/announcements.js
    annDyslexiaFontOn: "Fonte Lexend ativada",
    annDyslexiaFontOff: "Fonte Lexend desativada",
    annHighlightLinksOn: "Destaque de links ativado",
    annHighlightLinksOff: "Destaque de links desativado",
    annHighlightHeadingsOn: "Destaque de cabe\xE7alhos ativado",
    annHighlightHeadingsOff: "Destaque de cabe\xE7alhos desativado",
    annHighlightControlsOn: "Destaque de bot\xF5es e campos ativado",
    annHighlightControlsOff: "Destaque de bot\xF5es e campos desativado",
    annTextMagnifierOn: "Lupa de texto ligada",
    annTextMagnifierOff: "Lupa de texto desligada",
    annEnlargeTargetsOn: "Bot\xF5es ampliados",
    annEnlargeTargetsOff: "Bot\xF5es com tamanho normal",
    annTextSpacingOn: "Espa\xE7amento de texto ativado",
    annTextSpacingOff: "Espa\xE7amento de texto desativado",
    annHideImagesOn: "Imagens ocultadas",
    annHideImagesOff: "Imagens vis\xEDveis",
    annReducedMotionOn: "Movimento reduzido ativado",
    annReducedMotionOff: "Movimento reduzido desativado",
    annSimpleLanguageOn: "Linguagem simples ligada",
    annSimpleLanguageOff: "Linguagem simples desligada",
    annReadFocusOn: "Leitura do foco ligada",
    annReadFocusOff: "Leitura do foco desligada",
    annMuteMediaOn: "V\xEDdeos e sons silenciados",
    annMuteMediaOff: "V\xEDdeos e sons liberados",
    annStrongFocusOn: "Foco refor\xE7ado ligado",
    annStrongFocusOff: "Foco refor\xE7ado desligado",
    annShowShortcutsOn: "Atalhos do teclado vis\xEDveis",
    annShowShortcutsOff: "Atalhos do teclado ocultos",
    annBlockFlashingOn: "Bloqueio de anima\xE7\xF5es e GIFs ligado",
    annBlockFlashingOff: "Bloqueio de anima\xE7\xF5es e GIFs desligado",
    annRulerOn: "R\xE9gua de leitura ativada",
    annRulerOff: "R\xE9gua de leitura desativada",
    annTextSize: "Tamanho do texto {value}%",
    annTheme: "Tema {value}",
    annThemeSenac: "Cores do site",
    annThemeYellowBlack: "Amarelo e Preto",
    annThemeDarkHigh: "Modo Escuro Alto",
    annThemeSoft: "Descanso Suave",
    annThemeMono: "Monocrom\xE1tico",
    annThemeLightHigh: "Claro Alto Contraste",
    annSaturation: "Satura\xE7\xE3o {value}",
    annSaturationLow: "baixa",
    annSaturationNormal: "normal",
    annSaturationHigh: "alta",
    annCursor: "Cursor {value}",
    annCursorDefault: "padr\xE3o",
    annCursorBigWhite: "grande branco",
    annCursorBigBlack: "grande preto",
    annCustomColor: "Cor personalizada de {label} {value}",
    annCustomColorRemoved: "Cor personalizada de {label} removida",
    annCustomText: "texto",
    annCustomHeading: "t\xEDtulos",
    annCustomBg: "fundo"
  });
  var SHORTCUTS = Object.freeze([
    { keys: "Alt+Shift+A", text: "Abrir o painel de acessibilidade" },
    {
      keys: "Alt+Shift+G",
      text: "Abrir a grade de mouse (1 a 9 escolhe, Enter clica)"
    },
    { keys: "Esc", text: "Fechar o painel ou sair da escolha de conte\xFAdo" },
    { keys: "Tab", text: "Ir ao pr\xF3ximo item" },
    { keys: "Shift+Tab", text: "Voltar ao item anterior" },
    { keys: "Enter", text: "Ativar o bot\xE3o ou link" },
    { keys: "Espa\xE7o", text: "Ligar ou desligar um interruptor" }
  ]);
  var VOICE_CMD_STRINGS = Object.freeze({
    status_listening: "Comandos de voz ligados. Pode falar.",
    status_stopped: "Comandos de voz desligados.",
    status_blocked: "O navegador n\xE3o deixou usar o microfone. Libere o microfone para o site e ligue de novo.",
    "status_needs-consent": "Para usar comandos de voz, \xE9 preciso aceitar que sua voz v\xE1 para o servidor do navegador, por exemplo o Google.",
    "status_needs-model": "Falta baixar o reconhecimento de voz no seu aparelho para usar comandos de voz.",
    status_unsupported: "Este navegador ou esta p\xE1gina n\xE3o aceita comandos de voz.",
    status_error: "Os comandos de voz pararam. Ligue de novo para tentar.",
    "status_no-mic": "N\xE3o encontrei um microfone. Conecte um microfone e ligue os comandos de voz de novo.",
    helpSpoken: "Voc\xEA pode dizer: ler p\xE1gina, parar, pausar, continuar, mais r\xE1pido, mais devagar, descer, subir, ligar modo simples, desligar modo simples, abrir painel, fechar painel e ajuda."
  });

  // src/i18n/en.js
  var en_exports = {};
  __export(en_exports, {
    SHORTCUTS: () => SHORTCUTS2,
    STRINGS: () => STRINGS2,
    VOICE_CMD_STRINGS: () => VOICE_CMD_STRINGS2
  });
  var STRINGS2 = Object.freeze({
    // fab.js
    fabTip: "Accessibility & Simple Mode",
    fabOpenLabel: "Open accessibility panel",
    fabCloseLabel: "Close accessibility panel",
    fabHideLabel: "Hide the accessibility button on this page",
    announceWidgetHidden: "Accessibility button hidden. Alt+Shift+A shows it again.",
    announceResetAll: "Everything is off. Page without adjustments.",
    announceStillOn: "Simple Mode is still on",
    announceOn: "Simple Mode turned on",
    announceOff: "Simple Mode turned off",
    announcePanelOpen: "Accessibility panel open",
    announceReadStopped: "Reading stopped",
    announceReadStart: "Reading the main content",
    announceSideLeft: "Panel moved to the left",
    announceSideRight: "Panel moved to the right",
    panelResetLabel: "Turn everything off",
    panelMoveToLeft: "Move to the left",
    panelMoveToRight: "Move to the right",
    // a11yPanel.js
    panelCloseLabel: "Close accessibility panel",
    panelSimpleTitle: "Simple Mode (Recommended)",
    panelSimpleDesc: "Hides visual distractions, enlarges buttons and sums up the essential content.",
    panelSimpleSwitchLabel: "Simple Mode",
    panelTextSizeTitle: "Text size",
    panelTextSizeItemLabel: "Text size",
    panelThemeTitle: "Contrast and colors",
    panelThemeItemLabel: "Theme",
    panelDyslexiaTitle: "Accessible Font (Lexend)",
    panelDyslexiaDesc: "Designed for dyslexia and visual fluency",
    panelDyslexiaLabel: "Accessible Lexend font",
    panelRulerTitle: "Reading Focus Ruler",
    panelRulerDesc: "Line-by-line highlight to guide your attention",
    panelVoiceTitle: "Voice Screen Reader",
    panelVoiceDesc: "Reads headings and text aloud in English",
    panelVoiceLabel: "Listen to the main content",
    panelVoiceButton: "Listen",
    panelVoiceStopButton: "Stop",
    panelVoiceStopLabel: "Stop reading",
    panelLanguageTitle: "Language",
    panelLanguageAuto: "Automatic ({lang})",
    panelVoiceStudioTitle: "Voice Studio",
    panelVoiceSelectLabel: "Voice",
    panelVoiceAuto: "Automatic (English)",
    panelVoiceRateLabel: "Speed",
    panelVoicePitchLabel: "Pitch",
    panelVoiceVolumeLabel: "Volume",
    panelVoiceTest: "Test voice",
    panelVoiceTestLabel: "Test the voice with these settings",
    panelVoiceReset: "Back to default",
    panelVoiceResetLabel: "Back to default: voice, speed, pitch and volume",
    panelVoiceUnsupported: "This browser has no voice to read aloud. Try another browser.",
    // F10e — pause/resume and voice commands in the panel
    panelPause: "Pause",
    panelPauseLabel: "Pause reading",
    panelResume: "Resume",
    panelResumeLabel: "Resume reading",
    panelVcTitle: "Voice commands",
    panelVcDesc: "Control reading by speaking. Off until you turn it on",
    panelVcLabel: "Voice commands",
    panelVcUnsupported: "Your browser doesn't understand voice commands. Use Chrome or Edge.",
    panelVcListening: "Listening\u2026",
    panelVcBlocked: "The microphone is blocked. Allow it in your browser settings.",
    panelSpeechFailed: "Your browser couldn't read aloud: no voice is installed. In Brave, open it with the --enable-speech-dispatcher option, or use Chrome or Edge.",
    panelVoiceMoreHint: 'There are more similar voices. Use "Show all voices" to see them all.',
    panelVoiceAll: "Show all voices",
    panelVcBrave: "Brave doesn't allow voice commands. Use Chrome or Edge.",
    panelVcNoMic: "I couldn't find a microphone.",
    panelVcError: "Voice commands stopped. Try turning them on again.",
    panelVcRevoke: "Stop sending my voice",
    panelVcRevokeLabel: "Stop sending my voice and turn off voice commands",
    panelVcShow: "Show commands",
    panelVcHide: "Hide commands",
    // list separated by | (every key in this file is text)
    panelVcCommands: "read page|stop|pause|resume|faster|slower|scroll down|scroll up|turn on simple mode|turn off simple mode|open panel|close panel|help",
    panelVcDownloadTitle: "Download English",
    panelVcDownloadText: "To understand your voice without sending anything to the internet, the browser needs to download English once. Download now?",
    panelVcDownloadNow: "Download",
    panelVcDownloading: "Downloading\u2026",
    panelVcDownloadFail: "Couldn't download it.",
    panelVcUseInternet: "Use the internet",
    panelVcNotNow: "Not now",
    panelVcCloudTitle: "Send my voice?",
    panelVcCloudText: "In this browser, what you say is sent to the browser company (Google in Chrome, Microsoft in Edge) to be understood. Simple Mode stores nothing. Turn it on anyway?",
    panelVcCloudYes: "Turn on and send my voice",
    panelVcCloudNo: "Don't turn on",
    mediaOtherSiteNotice: "This video is from another site. I can't turn its sound off.",
    panelStrongFocusTitle: "Very visible focus",
    panelStrongFocusDesc: "A thick two-color outline on the item you are on, on any background",
    panelShortcutsTitle: "Show keyboard shortcuts",
    panelShortcutsDesc: "An on-screen card lists the keys you can use",
    shortcutsTitle: "Keyboard shortcuts",
    shortcutsClose: "Close",
    shortcutAccessKeyPrefix: "Alt+",
    panelBlockFlashingTitle: "Block animations and GIFs",
    panelBlockFlashingDesc: "For animations, scrolling text and videos that start on their own. GIFs stay still until you click",
    gifShowLabel: "Show animation",
    panelMuteMediaTitle: "Pause and mute everything",
    panelMuteMediaDesc: "Pauses and silences videos and sounds on the page, including those that start on their own",
    panelReadFocusTitle: "Read what I select",
    panelReadFocusDesc: "The voice reads the button, link, field or text you click or stop on with the Tab key. If you use a screen reader, you may hear it twice",
    panelReadFocusUnsupported: "This browser has no voice to read aloud",
    panelReadFocusUnsupportedState: "No voice",
    stateOn: "On",
    stateOff: "Off",
    sectionTextTitle: "Text and reading",
    sectionColorsTitle: "Colors and highlights",
    sectionKeyboardTitle: "Keyboard and focus",
    sectionMotionTitle: "Motion and images",
    panelHighlightLinks: "Highlight links",
    sectionPageToolsTitle: "Page tools",
    panelHighlightHeadings: "Highlight headings",
    panelHighlightControls: "Highlight buttons and fields",
    panelEnlargeTargets: "Enlarge buttons",
    panelTextMagnifier: "Text magnifier",
    panelPageOutline: "Page structure",
    panelMouseGrid: "Mouse grid",
    panelVirtualKeyboard: "Virtual keyboard",
    vkLabel: "Virtual keyboard",
    vkHint: "Tap a text field",
    vkOpened: "Virtual keyboard open. Tap a text field.",
    vkClosed: "Virtual keyboard closed.",
    vkClose: "Close",
    vkPendingPre: "Typing:",
    vkBackspace: "Delete",
    vkEnter: "Enter",
    vkShift: "Shift",
    vkCaps: "Caps",
    vkAltGr: "AltGr",
    vkSpace: "Space",
    vkDeadAcute: "Acute accent",
    vkDeadGrave: "Grave accent",
    vkDeadTilde: "Tilde",
    vkDeadCircumflex: "Circumflex accent",
    vkDeadDiaeresis: "Diaeresis",
    gridDialogLabel: "Mouse grid",
    gridOpen: "Grid open. Choose from 1 to 9.",
    gridLevelPre: "Level",
    gridChoose: "Choose from 1 to 9.",
    gridMin: "Smallest area. Press Enter to click.",
    gridTop: "You're already on the first level.",
    gridClosed: "Grid closed.",
    gridClicked: "Click done.",
    gridCellLabel: "Cell",
    gridClickBtn: "Click here (Enter)",
    gridBackBtn: "Back (Backspace)",
    gridCloseBtn: "Close (Esc)",
    gridClickShort: "Click",
    gridBackShort: "Back",
    gridCloseShort: "Close",
    outlineTitle: "Page structure",
    outlineClose: "Close",
    outlineLandmarks: "Page areas",
    outlineHeadings: "Headings",
    outlineEmpty: "This page has no headings or areas to list.",
    outlineNoText: "(no text)",
    outlineLevel: "level",
    outlineLmMain: "Main content",
    outlineLmNav: "Navigation",
    outlineLmBanner: "Site header",
    outlineLmFooter: "Site footer",
    outlineLmAside: "Side content",
    outlineLmForm: "Form",
    outlineLmSearch: "Search",
    outlineLmRegion: "Region",
    panelTextSpacing: "Text spacing",
    panelReducedMotion: "Reduce motion",
    panelHideImages: "Hide images",
    panelHideImagesHint: "In Simple Mode, images are hidden by default \u2014 turn off to keep them",
    panelDefaultTitle: "Digital Accessibility",
    panelDefaultFooter: "Preferences saved in this browser",
    scaleDefault: "Default",
    scaleLarge: "Large",
    scaleLarger: "Larger",
    scaleMax: "Maximum",
    themeSite: "Site colors",
    themeSiteSub: "Default",
    themeYellowBlack: "Yellow and Black",
    themeYellowBlackSub: "High contrast",
    themeDarkHigh: "High Dark Mode",
    themeDarkHighSub: "Dark background",
    themeSoft: "Rest / Soft",
    themeSoftSub: "Low intensity",
    themeMono: "Monochrome",
    themeMonoSub: "Shades of gray",
    themeLightHigh: "Light High Contrast",
    themeLightHighSub: "White background",
    panelTypoGroupLabel: "Fine typography adjustments",
    panelLineHeightTitle: "Line height",
    panelWordSpacingTitle: "Word spacing",
    panelLetterSpacingTitle: "Letter spacing",
    panelTypoDefault: "Site default",
    panelResetFont: "Reset font",
    announceResetFont: "Font reset: size, accessible font and spacing are back to default.",
    panelCursorTitle: "Mouse cursor",
    panelCursorDefault: "Default",
    panelCursorBigWhite: "Large white",
    panelCursorBigBlack: "Large black",
    panelResetFontLabel: "Reset font: size, accessible font and spacing",
    panelSaturationTitle: "Color saturation",
    panelSaturationLow: "Low",
    panelSaturationNormal: "Normal",
    panelSaturationHigh: "High",
    panelCustomTextTitle: "Text color",
    panelCustomHeadingTitle: "Heading color",
    panelCustomBgTitle: "Background color",
    panelCustomNone: "Site default",
    panelCustomSwatchLabel: "Use color",
    panelCustomPickerLabel: "Pick another color for",
    panelCustomOther: "Custom",
    panelAutoBgTitle: "Automatic background",
    panelContrastWarn: "Warning: low contrast (4.5:1 or more recommended) in",
    // sessionChrome.js
    sessionOpenPanelLabel: "Open accessibility panel",
    sessionOpenPanelTitle: "Accessibility",
    sessionBrand: "SIMPLE",
    sessionSubOff: "Cognitive Accessibility",
    sessionSubOn: "Simplified Interface",
    sessionSwitchLabel: "Simple Mode",
    sessionBarLabel: "Simple Mode",
    sessionOffPrompt: "Want calmer, more direct browsing without information overload?",
    sessionActivate: "Turn on Simple Mode",
    sessionOnTitle: "Simple Mode",
    sessionOnSrSuffix: " on",
    sessionBadge: "Browsing Focus",
    sessionDescSimple: "Showing explanations in easy words, without hard terms.",
    sessionDescCalm: "Calmer browsing, with clear buttons and fewer distractions.",
    sessionSpeakLabel: "Listen to page",
    sessionSpeakText: "Listen to Page",
    sessionStopLabel: "Stop reading the page",
    sessionStopText: "Stop Voice",
    sessionLangPre: "Plain ",
    sessionLangMain: "Language",
    sessionLangOn: "ON",
    sessionLangOff: "OFF",
    sessionLangUnavailable: "Not available on this page",
    sessionImages: "Images",
    sessionImagesHidden: "HIDDEN",
    sessionImagesVisible: "VISIBLE",
    sessionExit: "Return",
    sessionExitPost: " to the normal site",
    // F7f — profiles (ui/a11yPanel.js; data in core/profiles.js)
    profilesTitle: "Ready-made profiles",
    profilesHint: "Pick one and the page adjusts. One at a time.",
    profileSimpleName: "Simple Mode",
    profileSimpleDesc: "A cleaner page that is easier to read",
    profileLowVisionName: "Low vision",
    profileLowVisionDesc: "Larger text, strong colors and a big cursor",
    profileDyslexiaName: "Dyslexia",
    profileDyslexiaDesc: "Its own font, more space between letters and a reading ruler",
    profileAdhdName: "ADHD",
    profileAdhdDesc: "Fewer distractions: no sound, no motion and the voice reads what you select",
    profileEpilepsyName: "Epilepsy",
    profileEpilepsyDesc: "No animations, no self-playing video and no sound",
    profileKeyboardName: "Keyboard",
    profileKeyboardDesc: "Very visible focus, on-screen shortcuts and the voice reads what you select",
    profileCustom: "Custom",
    profileOnPre: "Profile ",
    profileOnPost: " turned on",
    profileOff: "Profile turned off. Page without adjustments.",
    // features/focusReader.js (spoken roles and states)
    roleButton: "button",
    roleLink: "link",
    roleHeading: "heading",
    roleField: "field",
    roleCheckbox: "checkbox",
    roleRadio: "option",
    roleSwitch: "switch",
    roleSelect: "dropdown list",
    focusSubmitName: "Submit",
    focusSwitchOn: "on",
    focusSwitchOff: "off",
    focusChecked: "checked",
    focusUnchecked: "unchecked",
    // features/manualSelect.js (plain language, U-02 / UX-21)
    lowConfNotice: "I couldn't find the main content. Want to choose it?",
    lowConfChoose: "Choose the content",
    lowConfClose: "Close",
    manualInstruction: "Click or tap what you want to read. On the keyboard: Tab changes block, arrow keys grow or shrink the area, Enter confirms, Esc goes back.",
    manualCurrent: "You chose:",
    manualChosen: "Main content set",
    manualCancelled: "Manual selection cancelled",
    manualCancel: "Back",
    manualCancelLabel: "Go back without choosing",
    // voice.js / simpleNav.js
    voiceSample: "This is the voice that will read to you.",
    simpleNavLabel: "Simple Mode navigation",
    // core/announcements.js
    annDyslexiaFontOn: "Lexend font on",
    annDyslexiaFontOff: "Lexend font off",
    annHighlightLinksOn: "Link highlight on",
    annHighlightLinksOff: "Link highlight off",
    annHighlightHeadingsOn: "Heading highlight on",
    annHighlightHeadingsOff: "Heading highlight off",
    annHighlightControlsOn: "Button and field highlight on",
    annHighlightControlsOff: "Button and field highlight off",
    annTextMagnifierOn: "Text magnifier on",
    annTextMagnifierOff: "Text magnifier off",
    annEnlargeTargetsOn: "Buttons enlarged",
    annEnlargeTargetsOff: "Buttons at normal size",
    annTextSpacingOn: "Text spacing on",
    annTextSpacingOff: "Text spacing off",
    annHideImagesOn: "Images hidden",
    annHideImagesOff: "Images visible",
    annReducedMotionOn: "Reduced motion on",
    annReducedMotionOff: "Reduced motion off",
    annSimpleLanguageOn: "Plain language on",
    annSimpleLanguageOff: "Plain language off",
    annReadFocusOn: "Focus reading on",
    annReadFocusOff: "Focus reading off",
    annMuteMediaOn: "Videos and sounds muted",
    annMuteMediaOff: "Videos and sounds released",
    annStrongFocusOn: "Strong focus on",
    annStrongFocusOff: "Strong focus off",
    annShowShortcutsOn: "Keyboard shortcuts visible",
    annShowShortcutsOff: "Keyboard shortcuts hidden",
    annBlockFlashingOn: "Animation and GIF blocking on",
    annBlockFlashingOff: "Animation and GIF blocking off",
    annRulerOn: "Reading ruler on",
    annRulerOff: "Reading ruler off",
    annTextSize: "Text size {value}%",
    annTheme: "Theme {value}",
    annThemeSenac: "Site colors",
    annThemeYellowBlack: "Yellow and Black",
    annThemeDarkHigh: "High Dark Mode",
    annThemeSoft: "Soft Rest",
    annThemeMono: "Monochrome",
    annThemeLightHigh: "Light High Contrast",
    annSaturation: "Saturation {value}",
    annSaturationLow: "low",
    annSaturationNormal: "normal",
    annSaturationHigh: "high",
    annCursor: "Cursor {value}",
    annCursorDefault: "default",
    annCursorBigWhite: "large white",
    annCursorBigBlack: "large black",
    annCustomColor: "Custom {label} color {value}",
    annCustomColorRemoved: "Custom {label} color removed",
    annCustomText: "text",
    annCustomHeading: "heading",
    annCustomBg: "background"
  });
  var SHORTCUTS2 = Object.freeze([
    { keys: "Alt+Shift+A", text: "Open the accessibility panel" },
    {
      keys: "Alt+Shift+G",
      text: "Open the mouse grid (1 to 9 picks, Enter clicks)"
    },
    { keys: "Esc", text: "Close the panel or leave content selection" },
    { keys: "Tab", text: "Go to the next item" },
    { keys: "Shift+Tab", text: "Go back to the previous item" },
    { keys: "Enter", text: "Activate the button or link" },
    { keys: "Space", text: "Turn a switch on or off" }
  ]);
  var VOICE_CMD_STRINGS2 = Object.freeze({
    status_listening: "Voice commands on. You can speak.",
    status_stopped: "Voice commands off.",
    status_blocked: "The browser didn't allow microphone use. Allow the microphone for this site and turn it on again.",
    "status_needs-consent": "To use voice commands, you must accept that your voice goes to the browser's server, for example Google.",
    "status_needs-model": "Speech recognition must be downloaded to your device to use voice commands.",
    status_unsupported: "This browser or this page does not support voice commands.",
    status_error: "Voice commands stopped. Turn them on again to retry.",
    "status_no-mic": "I couldn't find a microphone. Connect a microphone and turn voice commands on again.",
    helpSpoken: "You can say: read page, stop, pause, resume, faster, slower, scroll down, scroll up, turn on simple mode, turn off simple mode, open panel, close panel and help."
  });

  // src/i18n/es.js
  var es_exports = {};
  __export(es_exports, {
    SHORTCUTS: () => SHORTCUTS3,
    STRINGS: () => STRINGS3,
    VOICE_CMD_STRINGS: () => VOICE_CMD_STRINGS3
  });
  var STRINGS3 = Object.freeze({
    // fab.js
    fabTip: "Accesibilidad y Modo Simple",
    fabOpenLabel: "Abrir el panel de accesibilidad",
    fabCloseLabel: "Cerrar el panel de accesibilidad",
    fabHideLabel: "Ocultar el bot\xF3n de accesibilidad en esta p\xE1gina",
    announceWidgetHidden: "Bot\xF3n de accesibilidad oculto. Alt+Shift+A lo muestra de nuevo.",
    announceResetAll: "Todo desactivado. P\xE1gina sin ajustes.",
    announceStillOn: "El Modo Simple sigue activado",
    announceOn: "Modo Simple activado",
    announceOff: "Modo Simple desactivado",
    announcePanelOpen: "Panel de accesibilidad abierto",
    announceReadStopped: "Lectura interrumpida",
    announceReadStart: "Leyendo el contenido principal",
    announceSideLeft: "Panel movido a la izquierda",
    announceSideRight: "Panel movido a la derecha",
    panelResetLabel: "Desactivar todo",
    panelMoveToLeft: "Mover a la izquierda",
    panelMoveToRight: "Mover a la derecha",
    // a11yPanel.js
    panelCloseLabel: "Cerrar el panel de accesibilidad",
    panelSimpleTitle: "Modo Simple (Recomendado)",
    panelSimpleDesc: "Oculta distracciones visuales, agranda los botones y resume los contenidos esenciales.",
    panelSimpleSwitchLabel: "Modo Simple",
    panelTextSizeTitle: "Tama\xF1o del texto",
    panelTextSizeItemLabel: "Tama\xF1o del texto",
    panelThemeTitle: "Contraste y colores",
    panelThemeItemLabel: "Tema",
    panelDyslexiaTitle: "Fuente Accesible (Lexend)",
    panelDyslexiaDesc: "Dise\xF1ada para la dislexia y la agilidad visual",
    panelDyslexiaLabel: "Fuente Accesible Lexend",
    panelRulerTitle: "Regla de Enfoque de Lectura",
    panelRulerDesc: "Resalta l\xEDnea por l\xEDnea para guiar la atenci\xF3n",
    panelVoiceTitle: "Lector de Pantalla por Voz",
    panelVoiceDesc: "Lee en voz alta los t\xEDtulos y textos en espa\xF1ol",
    panelVoiceLabel: "Escuchar el contenido principal",
    panelVoiceButton: "Escuchar",
    panelVoiceStopButton: "Parar",
    panelVoiceStopLabel: "Parar la lectura",
    panelLanguageTitle: "Idioma",
    panelLanguageAuto: "Autom\xE1tico ({lang})",
    panelVoiceStudioTitle: "Estudio de Voz",
    panelVoiceSelectLabel: "Voz",
    panelVoiceAuto: "Autom\xE1tica (espa\xF1ol)",
    panelVoiceRateLabel: "Velocidad",
    panelVoicePitchLabel: "Tono",
    panelVoiceVolumeLabel: "Volumen",
    panelVoiceTest: "Probar voz",
    panelVoiceTestLabel: "Probar la voz con estos ajustes",
    panelVoiceReset: "Volver al valor predeterminado",
    panelVoiceResetLabel: "Volver al valor predeterminado: voz, velocidad, tono y volumen",
    panelVoiceUnsupported: "Este navegador no tiene voz para leer en voz alta. Prueba con otro navegador.",
    // F10e — pausar/continuar y comandos de voz en el panel
    panelPause: "Pausar",
    panelPauseLabel: "Pausar la lectura",
    panelResume: "Continuar",
    panelResumeLabel: "Continuar la lectura",
    panelVcTitle: "Comandos de voz",
    panelVcDesc: "Controla la lectura hablando. Desactivado hasta que lo actives",
    panelVcLabel: "Comandos de voz",
    panelVcUnsupported: "Tu navegador no entiende comandos de voz. Usa Chrome o Edge.",
    panelVcListening: "Escuchando\u2026",
    panelVcBlocked: "El micr\xF3fono est\xE1 bloqueado. Perm\xEDtelo en los ajustes del navegador.",
    panelSpeechFailed: "Tu navegador no pudo leer en voz alta: no hay ninguna voz instalada. En Brave, \xE1brelo con la opci\xF3n --enable-speech-dispatcher, o usa Chrome o Edge.",
    panelVoiceMoreHint: 'Hay m\xE1s voces parecidas. Usa "Mostrar todas las voces" para verlas todas.',
    panelVoiceAll: "Mostrar todas las voces",
    panelVcBrave: "Brave no permite comandos de voz. Usa Chrome o Edge.",
    panelVcNoMic: "No encontr\xE9 un micr\xF3fono.",
    panelVcError: "Los comandos de voz se detuvieron. Intenta activarlos de nuevo.",
    panelVcRevoke: "Dejar de enviar mi voz",
    panelVcRevokeLabel: "Dejar de enviar mi voz y desactivar los comandos de voz",
    panelVcShow: "Ver comandos",
    panelVcHide: "Ocultar comandos",
    // lista separada por | (todas las claves de este archivo son texto)
    panelVcCommands: "leer p\xE1gina|parar|pausar|continuar|m\xE1s r\xE1pido|m\xE1s lento|bajar|subir|activar modo simple|desactivar modo simple|abrir panel|cerrar panel|ayuda",
    panelVcDownloadTitle: "Descargar el espa\xF1ol",
    panelVcDownloadText: "Para entender tu voz sin enviar nada a internet, el navegador necesita descargar el espa\xF1ol una vez. \xBFDescargar ahora?",
    panelVcDownloadNow: "Descargar",
    panelVcDownloading: "Descargando\u2026",
    panelVcDownloadFail: "No se pudo descargar.",
    panelVcUseInternet: "Usar por internet",
    panelVcNotNow: "Ahora no",
    panelVcCloudTitle: "\xBFEnviar mi voz?",
    panelVcCloudText: "En este navegador, lo que dices se env\xEDa a la empresa del navegador (Google en Chrome, Microsoft en Edge) para ser entendido. El Modo Simple no guarda nada. \xBFQuieres activarlo de todos modos?",
    panelVcCloudYes: "Activar y enviar mi voz",
    panelVcCloudNo: "No activar",
    mediaOtherSiteNotice: "Este video es de otro sitio. No puedo quitarle el sonido.",
    panelStrongFocusTitle: "Foco muy visible",
    panelStrongFocusDesc: "Contorno grueso y de dos colores en el elemento donde est\xE1s, sobre cualquier fondo",
    panelShortcutsTitle: "Mostrar atajos del teclado",
    panelShortcutsDesc: "Una tarjeta en pantalla lista las teclas que puedes usar",
    shortcutsTitle: "Atajos del teclado",
    shortcutsClose: "Cerrar",
    shortcutAccessKeyPrefix: "Alt+",
    panelBlockFlashingTitle: "Bloquear animaciones y GIF",
    panelBlockFlashingDesc: "Para animaciones, textos que se desplazan y videos que empiezan solos. Los GIF se quedan quietos hasta que hagas clic",
    gifShowLabel: "Mostrar animaci\xF3n",
    panelMuteMediaTitle: "Pausar y silenciar todo",
    panelMuteMediaDesc: "Pausa y silencia los videos y sonidos de la p\xE1gina, incluso los que empiezan solos",
    panelReadFocusTitle: "Leer lo que selecciono",
    panelReadFocusDesc: "La voz lee el bot\xF3n, enlace, campo o texto en el que hagas clic o te detengas con la tecla Tab. Si usas un lector de pantalla, puede que lo oigas dos veces",
    panelReadFocusUnsupported: "Este navegador no tiene voz para leer en voz alta",
    panelReadFocusUnsupportedState: "Sin voz",
    stateOn: "Activado",
    stateOff: "Desactivado",
    sectionTextTitle: "Texto y lectura",
    sectionColorsTitle: "Colores y resaltado",
    sectionKeyboardTitle: "Teclado y foco",
    sectionMotionTitle: "Movimiento e im\xE1genes",
    panelHighlightLinks: "Resaltar enlaces",
    sectionPageToolsTitle: "Herramientas de la p\xE1gina",
    panelHighlightHeadings: "Resaltar encabezados",
    panelHighlightControls: "Resaltar botones y campos",
    panelEnlargeTargets: "Agrandar botones",
    panelTextMagnifier: "Lupa de texto",
    panelPageOutline: "Estructura de la p\xE1gina",
    panelMouseGrid: "Cuadr\xEDcula del rat\xF3n",
    panelVirtualKeyboard: "Teclado virtual",
    vkLabel: "Teclado virtual",
    vkHint: "Toca un campo de texto",
    vkOpened: "Teclado virtual abierto. Toca un campo de texto.",
    vkClosed: "Teclado virtual cerrado.",
    vkClose: "Cerrar",
    vkPendingPre: "Escribiendo:",
    vkBackspace: "Borrar",
    vkEnter: "Intro",
    vkShift: "May\xFAs",
    vkCaps: "Bloq May\xFAs",
    vkAltGr: "AltGr",
    vkSpace: "Espacio",
    vkDeadAcute: "Acento agudo",
    vkDeadGrave: "Acento grave",
    vkDeadTilde: "Tilde",
    vkDeadCircumflex: "Acento circunflejo",
    vkDeadDiaeresis: "Di\xE9resis",
    gridDialogLabel: "Cuadr\xEDcula del rat\xF3n",
    gridOpen: "Cuadr\xEDcula abierta. Elige de 1 a 9.",
    gridLevelPre: "Nivel",
    gridChoose: "Elige de 1 a 9.",
    gridMin: "\xC1rea m\xEDnima. Pulsa Intro para hacer clic.",
    gridTop: "Ya est\xE1s en el primer nivel.",
    gridClosed: "Cuadr\xEDcula cerrada.",
    gridClicked: "Clic hecho.",
    gridCellLabel: "Celda",
    gridClickBtn: "Hacer clic aqu\xED (Intro)",
    gridBackBtn: "Volver (Retroceso)",
    gridCloseBtn: "Cerrar (Esc)",
    gridClickShort: "Clic",
    gridBackShort: "Volver",
    gridCloseShort: "Cerrar",
    outlineTitle: "Estructura de la p\xE1gina",
    outlineClose: "Cerrar",
    outlineLandmarks: "\xC1reas de la p\xE1gina",
    outlineHeadings: "T\xEDtulos",
    outlineEmpty: "Esta p\xE1gina no tiene t\xEDtulos ni \xE1reas para listar.",
    outlineNoText: "(sin texto)",
    outlineLevel: "nivel",
    outlineLmMain: "Contenido principal",
    outlineLmNav: "Navegaci\xF3n",
    outlineLmBanner: "Encabezado del sitio",
    outlineLmFooter: "Pie del sitio",
    outlineLmAside: "Contenido lateral",
    outlineLmForm: "Formulario",
    outlineLmSearch: "B\xFAsqueda",
    outlineLmRegion: "Regi\xF3n",
    panelTextSpacing: "Espaciado del texto",
    panelReducedMotion: "Reducir movimiento",
    panelHideImages: "Ocultar im\xE1genes",
    panelHideImagesHint: "En el Modo Simple, las im\xE1genes se ocultan por defecto \u2014 desactiva para mantenerlas",
    panelDefaultTitle: "Accesibilidad Digital",
    panelDefaultFooter: "Preferencias guardadas en este navegador",
    scaleDefault: "Predeterminado",
    scaleLarge: "Grande",
    scaleLarger: "M\xE1s grande",
    scaleMax: "M\xE1ximo",
    themeSite: "Colores del sitio",
    themeSiteSub: "Predeterminado",
    themeYellowBlack: "Amarillo y Negro",
    themeYellowBlackSub: "Alto contraste",
    themeDarkHigh: "Modo Oscuro Alto",
    themeDarkHighSub: "Fondo oscuro",
    themeSoft: "Descanso / Suave",
    themeSoftSub: "Baja intensidad",
    themeMono: "Monocrom\xE1tico",
    themeMonoSub: "Tonos de gris",
    themeLightHigh: "Claro Alto Contraste",
    themeLightHighSub: "Fondo blanco",
    panelTypoGroupLabel: "Ajuste fino de la tipograf\xEDa",
    panelLineHeightTitle: "Altura de l\xEDnea",
    panelWordSpacingTitle: "Espacio entre palabras",
    panelLetterSpacingTitle: "Espacio entre letras",
    panelTypoDefault: "Predeterminado del sitio",
    panelResetFont: "Restablecer fuente",
    announceResetFont: "Fuente restablecida: tama\xF1o, fuente accesible y espaciados vuelven al valor predeterminado.",
    panelCursorTitle: "Cursor del rat\xF3n",
    panelCursorDefault: "Predeterminado",
    panelCursorBigWhite: "Grande blanco",
    panelCursorBigBlack: "Grande negro",
    panelResetFontLabel: "Restablecer fuente: tama\xF1o, fuente accesible y espaciados",
    panelSaturationTitle: "Saturaci\xF3n de los colores",
    panelSaturationLow: "Baja",
    panelSaturationNormal: "Normal",
    panelSaturationHigh: "Alta",
    panelCustomTextTitle: "Color del texto",
    panelCustomHeadingTitle: "Color de los t\xEDtulos",
    panelCustomBgTitle: "Color del fondo",
    panelCustomNone: "Predeterminado del sitio",
    panelCustomSwatchLabel: "Usar color",
    panelCustomPickerLabel: "Elegir otro color para",
    panelCustomOther: "Personalizado",
    panelAutoBgTitle: "Fondo autom\xE1tico",
    panelContrastWarn: "Atenci\xF3n: contraste bajo (se recomienda 4,5:1 o m\xE1s) en",
    // sessionChrome.js
    sessionOpenPanelLabel: "Abrir el panel de accesibilidad",
    sessionOpenPanelTitle: "Accesibilidad",
    sessionBrand: "SIMPLE",
    sessionSubOff: "Accesibilidad Cognitiva",
    sessionSubOn: "Interfaz Simplificada",
    sessionSwitchLabel: "Modo Simple",
    sessionBarLabel: "Modo Simple",
    sessionOffPrompt: "\xBFQuieres una navegaci\xF3n m\xE1s tranquila, directa y sin exceso de informaci\xF3n?",
    sessionActivate: "Activar Modo Simple",
    sessionOnTitle: "Modo Simple",
    sessionOnSrSuffix: " activado",
    sessionBadge: "Enfoque en la Navegaci\xF3n",
    sessionDescSimple: "Mostrando explicaciones con palabras f\xE1ciles, sin t\xE9rminos complicados.",
    sessionDescCalm: "Navegaci\xF3n m\xE1s tranquila, con botones claros y menos distracciones.",
    sessionSpeakLabel: "Escuchar la p\xE1gina",
    sessionSpeakText: "Escuchar P\xE1gina",
    sessionStopLabel: "Parar la lectura de la p\xE1gina",
    sessionStopText: "Parar Voz",
    sessionLangPre: "Lenguaje ",
    sessionLangMain: "Sencillo",
    sessionLangOn: "ACTIVADO",
    sessionLangOff: "DESACTIVADO",
    sessionLangUnavailable: "No disponible en esta p\xE1gina",
    sessionImages: "Im\xE1genes",
    sessionImagesHidden: "OCULTAS",
    sessionImagesVisible: "VISIBLES",
    sessionExit: "Volver",
    sessionExitPost: " al sitio normal",
    // F7f — perfiles (ui/a11yPanel.js; datos en core/profiles.js)
    profilesTitle: "Perfiles listos",
    profilesHint: "Elige uno y la p\xE1gina se ajusta. Uno a la vez.",
    profileSimpleName: "Modo Simple",
    profileSimpleDesc: "P\xE1gina m\xE1s limpia y f\xE1cil de leer",
    profileLowVisionName: "Baja visi\xF3n",
    profileLowVisionDesc: "Texto m\xE1s grande, colores fuertes y cursor grande",
    profileDyslexiaName: "Dislexia",
    profileDyslexiaDesc: "Fuente propia, m\xE1s espacio entre letras y regla de lectura",
    profileAdhdName: "TDAH",
    profileAdhdDesc: "Menos distracciones: sin sonido, sin movimiento y la voz lee lo que seleccionas",
    profileEpilepsyName: "Epilepsia",
    profileEpilepsyDesc: "Sin animaciones, sin video que se reproduce solo y sin sonido",
    profileKeyboardName: "Teclado",
    profileKeyboardDesc: "Foco muy visible, atajos en pantalla y la voz lee lo que seleccionas",
    profileCustom: "Personalizado",
    profileOnPre: "Perfil ",
    profileOnPost: " activado",
    profileOff: "Perfil desactivado. P\xE1gina sin ajustes.",
    // features/focusReader.js (roles y estados hablados)
    roleButton: "bot\xF3n",
    roleLink: "enlace",
    roleHeading: "t\xEDtulo",
    roleField: "campo",
    roleCheckbox: "casilla de verificaci\xF3n",
    roleRadio: "opci\xF3n",
    roleSwitch: "interruptor",
    roleSelect: "lista de opciones",
    focusSubmitName: "Enviar",
    focusSwitchOn: "activado",
    focusSwitchOff: "desactivado",
    focusChecked: "marcado",
    focusUnchecked: "sin marcar",
    // features/manualSelect.js (lenguaje sencillo, U-02 / UX-21)
    lowConfNotice: "No encontr\xE9 el contenido principal, \xBFquieres elegirlo?",
    lowConfChoose: "Elegir el contenido",
    lowConfClose: "Cerrar",
    manualInstruction: "Haz clic o toca lo que quieres leer. Con el teclado: Tab cambia de bloque, las flechas agrandan o reducen el \xE1rea, Intro confirma, Esc vuelve.",
    manualCurrent: "Elegiste:",
    manualChosen: "Contenido principal definido",
    manualCancelled: "Selecci\xF3n manual cancelada",
    manualCancel: "Volver",
    manualCancelLabel: "Volver sin elegir",
    // voice.js / simpleNav.js
    voiceSample: "Esta es la voz que va a leer para ti.",
    simpleNavLabel: "Navegaci\xF3n del Modo Simple",
    // core/announcements.js
    annDyslexiaFontOn: "Fuente Lexend activada",
    annDyslexiaFontOff: "Fuente Lexend desactivada",
    annHighlightLinksOn: "Resaltado de enlaces activado",
    annHighlightLinksOff: "Resaltado de enlaces desactivado",
    annHighlightHeadingsOn: "Resaltado de encabezados activado",
    annHighlightHeadingsOff: "Resaltado de encabezados desactivado",
    annHighlightControlsOn: "Resaltado de botones y campos activado",
    annHighlightControlsOff: "Resaltado de botones y campos desactivado",
    annTextMagnifierOn: "Lupa de texto activada",
    annTextMagnifierOff: "Lupa de texto desactivada",
    annEnlargeTargetsOn: "Botones agrandados",
    annEnlargeTargetsOff: "Botones con tama\xF1o normal",
    annTextSpacingOn: "Espaciado del texto activado",
    annTextSpacingOff: "Espaciado del texto desactivado",
    annHideImagesOn: "Im\xE1genes ocultas",
    annHideImagesOff: "Im\xE1genes visibles",
    annReducedMotionOn: "Movimiento reducido activado",
    annReducedMotionOff: "Movimiento reducido desactivado",
    annSimpleLanguageOn: "Lenguaje sencillo activado",
    annSimpleLanguageOff: "Lenguaje sencillo desactivado",
    annReadFocusOn: "Lectura del foco activada",
    annReadFocusOff: "Lectura del foco desactivada",
    annMuteMediaOn: "Videos y sonidos silenciados",
    annMuteMediaOff: "Videos y sonidos liberados",
    annStrongFocusOn: "Foco reforzado activado",
    annStrongFocusOff: "Foco reforzado desactivado",
    annShowShortcutsOn: "Atajos del teclado visibles",
    annShowShortcutsOff: "Atajos del teclado ocultos",
    annBlockFlashingOn: "Bloqueo de animaciones y GIF activado",
    annBlockFlashingOff: "Bloqueo de animaciones y GIF desactivado",
    annRulerOn: "Regla de lectura activada",
    annRulerOff: "Regla de lectura desactivada",
    annTextSize: "Tama\xF1o del texto {value}%",
    annTheme: "Tema {value}",
    annThemeSenac: "Colores del sitio",
    annThemeYellowBlack: "Amarillo y Negro",
    annThemeDarkHigh: "Modo Oscuro Alto",
    annThemeSoft: "Descanso Suave",
    annThemeMono: "Monocrom\xE1tico",
    annThemeLightHigh: "Claro Alto Contraste",
    annSaturation: "Saturaci\xF3n {value}",
    annSaturationLow: "baja",
    annSaturationNormal: "normal",
    annSaturationHigh: "alta",
    annCursor: "Cursor {value}",
    annCursorDefault: "predeterminado",
    annCursorBigWhite: "grande blanco",
    annCursorBigBlack: "grande negro",
    annCustomColor: "Color personalizado de {label} {value}",
    annCustomColorRemoved: "Color personalizado de {label} eliminado",
    annCustomText: "texto",
    annCustomHeading: "t\xEDtulos",
    annCustomBg: "fondo"
  });
  var SHORTCUTS3 = Object.freeze([
    { keys: "Alt+Shift+A", text: "Abrir el panel de accesibilidad" },
    {
      keys: "Alt+Shift+G",
      text: "Abrir la cuadr\xEDcula del rat\xF3n (1 a 9 elige, Intro hace clic)"
    },
    { keys: "Esc", text: "Cerrar el panel o salir de la elecci\xF3n de contenido" },
    { keys: "Tab", text: "Ir al siguiente elemento" },
    { keys: "Shift+Tab", text: "Volver al elemento anterior" },
    { keys: "Enter", text: "Activar el bot\xF3n o enlace" },
    { keys: "Espacio", text: "Activar o desactivar un interruptor" }
  ]);
  var VOICE_CMD_STRINGS3 = Object.freeze({
    status_listening: "Comandos de voz activados. Puedes hablar.",
    status_stopped: "Comandos de voz desactivados.",
    status_blocked: "El navegador no permiti\xF3 usar el micr\xF3fono. Permite el micr\xF3fono para el sitio y act\xEDvalo de nuevo.",
    "status_needs-consent": "Para usar comandos de voz, hay que aceptar que tu voz vaya al servidor del navegador, por ejemplo Google.",
    "status_needs-model": "Falta descargar el reconocimiento de voz en tu dispositivo para usar comandos de voz.",
    status_unsupported: "Este navegador o esta p\xE1gina no admite comandos de voz.",
    status_error: "Los comandos de voz se detuvieron. Act\xEDvalos de nuevo para intentarlo.",
    "status_no-mic": "No encontr\xE9 un micr\xF3fono. Conecta un micr\xF3fono y activa los comandos de voz de nuevo.",
    helpSpoken: "Puedes decir: leer p\xE1gina, parar, pausar, continuar, m\xE1s r\xE1pido, m\xE1s lento, bajar, subir, activar modo simple, desactivar modo simple, abrir panel, cerrar panel y ayuda."
  });

  // src/i18n/index.js
  var SUPPORTED = Object.freeze(["pt", "en", "es"]);
  var BCP47 = Object.freeze({ pt: "pt-BR", en: "en-US", es: "es-ES" });
  var LOCALES = { pt: pt_exports, en: en_exports, es: es_exports };
  var current = "pt";
  function toSupported(tag) {
    const primary = String(tag || "").toLowerCase().split(/[-_]/)[0];
    return SUPPORTED.includes(primary) ? primary : null;
  }
  function resolveLocale(pref = "auto") {
    if (SUPPORTED.includes(pref)) return pref;
    const htmlLang = typeof document !== "undefined" && document.documentElement ? document.documentElement.getAttribute("lang") : null;
    const navLang = typeof navigator !== "undefined" ? navigator.language : null;
    return toSupported(htmlLang) || toSupported(navLang) || "pt";
  }
  function getLocale() {
    return current;
  }
  function setLocale(pref = "auto") {
    var _a, _b;
    current = resolveLocale(pref);
    if (typeof document !== "undefined") {
      const Ev = (_b = (_a = document.defaultView) == null ? void 0 : _a.CustomEvent) != null ? _b : CustomEvent;
      document.dispatchEvent(
        new Ev("ms:localechange", {
          detail: { locale: current, preference: pref }
        })
      );
    }
    return current;
  }
  var lookup = (locale, key) => {
    var _a;
    return (_a = LOCALES[locale].STRINGS[key]) != null ? _a : LOCALES[locale].VOICE_CMD_STRINGS[key];
  };
  function t(key, vars) {
    var _a, _b;
    let text = (_b = (_a = lookup(current, key)) != null ? _a : lookup("pt", key)) != null ? _b : key;
    if (vars) {
      text = text.replace(
        /\{(\w+)\}/g,
        (m, name) => name in vars ? String(vars[name]) : m
      );
    }
    return text;
  }
  function getShortcuts() {
    return LOCALES[current].SHORTCUTS;
  }

  // src/config/defaults.js
  var defaults = {
    /**
     * CSS selectors tried in order to locate the main content.
     * The first selector that returns a high-scoring element wins.
     */
    mainSelectors: [
      "main",
      '[role="main"]',
      "article",
      "#conteudo",
      "#content",
      ".content",
      ".main-content",
      ".post-content",
      ".article-body",
      ".entry-content"
    ],
    /**
     * Candidates for hiding when Modo Simples is active.
     * Elements inside the detected main content are never hidden, regardless
     * of whether they match these selectors.
     */
    distractionSelectors: [
      // IMP-20: nunca pega diálogos/modais (role=dialog|alertdialog, aria-modal), cookie/consent
      // (o usuário precisa responder) nem iframes de conteúdo; header/nav só como cromo do site.
      'header:not([role="dialog"]):not([role="alertdialog"]):not([aria-modal="true"])',
      "footer",
      "aside",
      '[role="complementary"]',
      '[role="banner"]',
      '[role="contentinfo"]',
      'nav:not([role="dialog"]):not([role="alertdialog"]):not([aria-modal="true"])',
      ".ad",
      ".ads",
      ".advertisement",
      '[class*="banner"]:not([class*="page-banner"]):not([role="dialog"]):not([role="alertdialog"]):not([aria-modal="true"]):not([class*="cookie"]):not([class*="consent"])',
      '[class*="popup"]:not([role="dialog"]):not([role="alertdialog"]):not([aria-modal="true"])',
      '[class*="overlay"]:not([role="dialog"]):not([role="alertdialog"]):not([aria-modal="true"]):not([class*="modal"]):not([class*="dialog"])',
      '[class*="sidebar"]',
      '[class*="newsletter"]',
      '[class*="promo"]',
      '[class*="carousel"]',
      '[class*="slider"]',
      ".slider",
      'iframe[src*="doubleclick"], iframe[src*="googlesyndication"], iframe[id^="google_ads"], iframe[title*="dvertis"]'
    ],
    /**
     * Scoring weights used by the heuristic engine (somam; sem teto).
     * Confiança = min(nota / (mainTagBonus + h1Bonus + 2 × textLengthBonus), 1).
     * Detalhes e exemplos: doc/08-heuristicas-edges.md.
     */
    scoring: {
      mainTagBonus: 100,
      roleMainBonus: 90,
      articleBonus: 60,
      h1Bonus: 30,
      h2Bonus: 20,
      textLengthBonus: 40,
      /** Minimum text length (chars) to award textLengthBonus. */
      minTextLength: 200
    },
    /** Persist state (modoSimples on/off + options) across page loads. */
    persistence: true,
    /** Scope persistence keys by hostname (`state:hostname`). */
    hostnamePersistence: true,
    /**
     * Floating button corner position.
     * One of: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
     */
    position: "bottom-right",
    /**
     * Minimum heuristic confidence (0–1) to auto-apply main detection.
     * Below this threshold (confidence < value), a manual-selection fallback is
     * shown instead. With default weights: ideal score 210, minimum score 95.
     */
    confidenceThreshold: 0.45,
    /**
     * Milliseconds to debounce MutationObserver reprocessing after DOM changes.
     */
    reprocessDebounce: 300,
    /**
     * Teto (ms) de espera do debounce: com mutações contínuas o reprocess roda pelo menos
     * a cada reprocessMaxWait ms (evita "starvation" em páginas que mutam sem parar).
     */
    reprocessMaxWait: 1500,
    /**
     * Session bar (switch SIMPLES + barra "Modo Simples ativado") injected in the host page.
     * Default false: only the FAB + panel (Shadow DOM) are injected.
     * @type {boolean}
     */
    sessionBar: false,
    /**
     * Where the session bar goes (only used when sessionBar is true). Selector or list of
     * selectors (first match wins). Without mount: switch fixed on screen + bar at top of <body>.
     *   chrome → container that receives the SIMPLES switch
     *   bar    → element AFTER which the bar is inserted
     * @type {null | { chrome?: string|string[], bar?: string|string[] }}
     */
    mount: null,
    /**
     * Lexend font source. Loaded lazily, only when the user turns on the dyslexia font.
     *   null   → default (Google Fonts, no-referrer) — requested only after the user opts in
     *   string → self-hosted stylesheet URL
     *   false  → never load; keep the system fallback stack
     * @type {null | string | false}
     */
    fontUrl: null,
    /**
     * Texts of the accessibility panel header/footer. Generic by default; the host sets its own
     * (pre-boot via window.ModoSimplesConfig — the panel is built at init). Partial overrides merge.
     *   title    → panel heading
     *   subtitle → line under the heading ('' hides it)
     *   footer   → note at the bottom of the panel ('' hides it)
     * @type {{ title: string, subtitle: string, footer: string }}
     */
    brand: {
      // getters: o texto segue o idioma atual no momento em que o painel é montado (spread lê)
      get title() {
        return t("panelDefaultTitle");
      },
      subtitle: "",
      get footer() {
        return t("panelDefaultFooter");
      }
    },
    /**
     * Optional simple-mode nav pills for host pages without markup.
     * Example: [{ label: 'Início', href: '/' }, { label: 'Ajuda', href: '/ajuda' }]
     * Ignored when the page already has [data-ms-pills] authored in HTML.
     * @type {null | { label: string, href: string, short?: string }[]}
     */
    simpleNav: null
  };
  var defaults_default = defaults;

  // src/config/mergeConfig.js
  function mergeConfig(base, patch) {
    const merged = { ...base, ...patch };
    const scoring = { ...base.scoring };
    const patchScoring = patch && patch.scoring;
    if (patchScoring && typeof patchScoring === "object") {
      for (const [key, value] of Object.entries(patchScoring)) {
        if (typeof value === "number" && Number.isFinite(value)) {
          scoring[key] = value;
        }
      }
    }
    merged.scoring = scoring;
    return merged;
  }

  // src/core/eventBus.js
  var eventBus = {
    /** @type {Record<string, Function[]>} */
    _listeners: {},
    /**
     * Subscribe to an event.
     * @param {string} event
     * @param {Function} callback
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(callback);
      return () => this.off(event, callback);
    },
    /**
     * Unsubscribe a specific callback from an event.
     * @param {string} event
     * @param {Function} callback
     */
    off(event, callback) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(
        (cb) => cb !== callback
      );
    },
    /**
     * Emit an event, invoking all registered callbacks with data.
     * Errors inside callbacks are caught and logged so a bad handler cannot
     * crash the whole system.
     * @param {string} event
     * @param {*} data
     */
    emit(event, data) {
      const listeners = this._listeners[event];
      if (!listeners || listeners.length === 0) return;
      [...listeners].forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          if (typeof process === "undefined" || true) {
            console.error("[ModoSimples] Event handler error:", err);
          }
        }
      });
    },
    /**
     * Remove all listeners for one event. Used on destroy().
     * @param {string} event
     */
    clear(event) {
      delete this._listeners[event];
    },
    /** Remove all listeners for every event. */
    clearAll() {
      this._listeners = {};
    }
  };
  var eventBus_default = eventBus;

  // src/core/state.js
  var TYPO_LIMITS = {
    lineHeight: { min: 1.5, max: 3, step: 0.1 },
    wordSpacing: { min: 0, max: 0.8, step: 0.02 },
    letterSpacing: { min: 0, max: 0.3, step: 0.01 }
  };
  function clampTypo(key, value) {
    const n = Number(value);
    const lim = TYPO_LIMITS[key];
    if (!lim || !Number.isFinite(n) || n <= 0) return 0;
    return Math.round(Math.min(lim.max, Math.max(lim.min, n)) * 100) / 100;
  }
  var initialState = {
    modoSimples: false,
    panelOpen: false,
    /** F7f: id do perfil ativo (core/profiles.js) ou null; `profileCustom` = ajustado à mão depois */
    activeProfile: null,
    profileCustom: false,
    options: {
      textScale: "100",
      colorTheme: "senac",
      colorSaturation: "normal",
      customText: "",
      customHeading: "",
      customBg: "",
      dyslexiaFont: false,
      readingRuler: false,
      highlightLinks: false,
      highlightHeadings: false,
      highlightControls: false,
      enlargeTargets: false,
      textMagnifier: false,
      textSpacing: false,
      lineHeight: 0,
      wordSpacing: 0,
      letterSpacing: 0,
      cursorStyle: "default",
      reducedMotion: false,
      hideImages: false,
      simpleLanguage: false,
      readFocus: false,
      blockFlashing: false,
      strongFocus: false,
      showShortcuts: false,
      muteMedia: false,
      voiceName: "",
      voiceCommands: false,
      voiceCloudConsent: false,
      voiceRate: 1,
      voicePitch: 1,
      voiceVolume: 1,
      language: "auto"
    }
  };
  function cloneState(s) {
    return { ...s, options: { ...s.options } };
  }
  function createState(initial) {
    let current3 = cloneState(initial);
    return {
      /** Returns a snapshot — never a direct reference to internal state. */
      get() {
        return cloneState(current3);
      },
      /**
       * Merge a patch into current state and emit 'stateChange'.
       * Nested `options` are merged (not replaced), so partial patches work:
       *   state.set({ options: { textScale: '150' } })
       *   → only textScale changes; others are preserved.
       *
       * @param {Object} patch
       */
      set(patch) {
        const prev = cloneState(current3);
        if (patch.options) {
          current3 = {
            ...current3,
            ...patch,
            options: { ...current3.options, ...patch.options }
          };
        } else {
          current3 = { ...current3, ...patch };
        }
        eventBus_default.emit("stateChange", { prev, next: cloneState(current3) });
      },
      /** Reset state to initial values (e.g. on destroy). */
      reset() {
        this.set(cloneState(initialState));
      }
    };
  }
  var state = createState(initialState);
  var state_default = state;

  // src/core/announcements.js
  var TOGGLES = {
    dyslexiaFont: "DyslexiaFont",
    highlightLinks: "HighlightLinks",
    highlightHeadings: "HighlightHeadings",
    highlightControls: "HighlightControls",
    textMagnifier: "TextMagnifier",
    enlargeTargets: "EnlargeTargets",
    textSpacing: "TextSpacing",
    hideImages: "HideImages",
    reducedMotion: "ReducedMotion",
    simpleLanguage: "SimpleLanguage",
    readFocus: "ReadFocus",
    muteMedia: "MuteMedia",
    strongFocus: "StrongFocus",
    showShortcuts: "ShowShortcuts",
    blockFlashing: "BlockFlashing"
  };
  var CUSTOM_COLORS = {
    customText: "annCustomText",
    customHeading: "annCustomHeading",
    customBg: "annCustomBg"
  };
  var cap = (s) => s[0].toUpperCase() + s.slice(1);
  function label(prefix, value) {
    const key = prefix + cap(String(value));
    const text = t(key);
    return text === key ? value : text;
  }
  function diffStateAnnouncements(prev, next) {
    const out = [];
    if (prev.options.readingRuler !== next.options.readingRuler) {
      out.push(t(next.options.readingRuler ? "annRulerOn" : "annRulerOff"));
    }
    Object.entries(TOGGLES).forEach(([k, name]) => {
      if (prev.options[k] !== next.options[k])
        out.push(t(`ann${name}${next.options[k] ? "On" : "Off"}`));
    });
    if (prev.options.textScale !== next.options.textScale) {
      out.push(t("annTextSize", { value: next.options.textScale }));
    }
    if (prev.options.colorTheme !== next.options.colorTheme) {
      out.push(
        t("annTheme", { value: label("annTheme", next.options.colorTheme) })
      );
    }
    if (prev.options.colorSaturation !== next.options.colorSaturation) {
      out.push(
        t("annSaturation", {
          value: label("annSaturation", next.options.colorSaturation)
        })
      );
    }
    if (prev.options.cursorStyle !== next.options.cursorStyle) {
      out.push(
        t("annCursor", { value: label("annCursor", next.options.cursorStyle) })
      );
    }
    Object.entries(CUSTOM_COLORS).forEach(([k, labelKey]) => {
      if (prev.options[k] !== next.options[k])
        out.push(
          next.options[k] ? t("annCustomColor", { label: t(labelKey), value: next.options[k] }) : t("annCustomColorRemoved", { label: t(labelKey) })
        );
    });
    return out;
  }

  // src/core/persistence.js
  var KEY_PREFIX = "ms_";
  var persistence = {
    /**
     * Save a JSON-serialisable value.
     * @param {string} key
     * @param {*} value
     */
    save(key, value) {
      try {
        localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
      } catch (_) {
      }
    },
    /**
     * Load a previously saved value.
     * @param {string} key
     * @param {*} [fallback=null] Value returned when the key is not found or parsing fails
     * @returns {*}
     */
    load(key, fallback = null) {
      try {
        const raw = localStorage.getItem(KEY_PREFIX + key);
        return raw !== null ? JSON.parse(raw) : fallback;
      } catch (_) {
        return fallback;
      }
    },
    /**
     * Remove a saved value.
     * @param {string} key
     */
    remove(key) {
      try {
        localStorage.removeItem(KEY_PREFIX + key);
      } catch (_) {
      }
    },
    /**
     * Build a hostname-scoped key: `base:hostname`.
     * @param {string} base
     * @returns {string}
     */
    hostKey(base) {
      const host = typeof location !== "undefined" && location.hostname ? location.hostname : "local";
      return `${base}:${host}`;
    },
    /**
     * Save a value under a hostname-scoped key.
     * @param {string} base
     * @param {*} value
     */
    saveForHost(base, value) {
      this.save(this.hostKey(base), value);
    },
    /**
     * Remove a value saved under a hostname-scoped key.
     * @param {string} base
     */
    removeForHost(base) {
      this.remove(this.hostKey(base));
    },
    /**
     * Load a value from a hostname-scoped key.
     * @param {string} base
     * @param {*} [fallback=null]
     * @returns {*}
     */
    loadForHost(base, fallback = null) {
      return this.load(this.hostKey(base), fallback);
    },
    /**
     * Build a page-scoped key: `base@/pathname:hostname`.
     * Para dados que só fazem sentido numa página (ex.: conteúdo principal escolhido).
     * @param {string} base
     * @returns {string}
     */
    pathKey(base) {
      const path = typeof location !== "undefined" && location.pathname ? location.pathname : "/";
      return `${base}@${path}:${this.hostKey("").slice(1)}`;
    },
    /** @param {string} base @param {*} value */
    saveForPath(base, value) {
      this.save(this.pathKey(base), value);
    },
    /** @param {string} base */
    removeForPath(base) {
      this.remove(this.pathKey(base));
    },
    /**
     * Load a page-scoped value. Sem registro para a página, devolve fallback
     * (quem migra dados antigos consulta a chave por host explicitamente).
     * @param {string} base
     * @param {*} [fallback=null]
     * @returns {*}
     */
    loadForPath(base, fallback = null) {
      return this.load(this.pathKey(base), fallback);
    }
  };
  var persistence_default = persistence;

  // src/core/profiles.js
  var freeze = (p) => Object.freeze({ ...p, options: Object.freeze({ ...p.options }) });
  var PROFILES = Object.freeze([
    freeze({ id: "simple", key: "Simple", modoSimples: true, options: {} }),
    freeze({
      id: "lowVision",
      key: "LowVision",
      modoSimples: false,
      options: {
        textScale: "150",
        colorTheme: "yellowBlack",
        cursorStyle: "bigWhite",
        lineHeight: 1.5
      }
    }),
    freeze({
      id: "dyslexia",
      key: "Dyslexia",
      modoSimples: false,
      options: {
        dyslexiaFont: true,
        letterSpacing: 0.12,
        wordSpacing: 0.16,
        lineHeight: 1.5,
        readingRuler: true
      }
    }),
    freeze({
      id: "adhd",
      key: "Adhd",
      modoSimples: true,
      options: { readFocus: true, muteMedia: true, reducedMotion: true }
    }),
    freeze({
      id: "epilepsy",
      key: "Epilepsy",
      modoSimples: false,
      options: { blockFlashing: true, reducedMotion: true, muteMedia: true }
    }),
    freeze({
      id: "keyboard",
      key: "Keyboard",
      modoSimples: false,
      options: { strongFocus: true, readFocus: true, showShortcuts: true }
    })
  ]);
  function getProfile(id) {
    return PROFILES.find((p) => p.id === id) || null;
  }
  function profileDiffers(base, now, reducedMotionIsUserChoice) {
    if (base.modoSimples !== now.modoSimples) return true;
    return Object.keys(base.options).some(
      (k) => !k.startsWith("voice") && // voz é preferência do aparelho, não do perfil (F10)
      k !== "language" && // idioma também não é de perfil
      (k !== "reducedMotion" || reducedMotionIsUserChoice) && base.options[k] !== now.options[k]
    );
  }

  // src/features/voice.js
  var VOICE_LIMITS = {
    rate: { min: 0.5, max: 2, step: 0.1 },
    pitch: { min: 0, max: 2, step: 0.1 },
    volume: { min: 0.1, max: 1, step: 0.1 }
    // 0 = leitura muda: não oferecer
  };
  function clampVoice(key, value) {
    const lim = VOICE_LIMITS[key];
    const n = Number(value);
    if (value === "" || value === null || !Number.isFinite(n)) return 1;
    return Math.round(Math.min(lim.max, Math.max(lim.min, n)) * 100) / 100;
  }
  function isVoiceSupported() {
    return typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined";
  }
  var isLang = (v, loc) => (v.lang || "").toLowerCase().split(/[-_]/)[0] === loc;
  var isExact = (v, loc) => (v.lang || "").toLowerCase().replace("_", "-") === BCP47[loc].toLowerCase();
  function pageLocale() {
    var _a;
    const lang2 = typeof document !== "undefined" ? (_a = document.documentElement) == null ? void 0 : _a.getAttribute("lang") : null;
    const primary = String(lang2 || "").toLowerCase().split(/[-_]/)[0];
    return primary in BCP47 ? primary : getLocale();
  }
  function listVoices(loc = getLocale()) {
    var _a;
    if (!isVoiceSupported()) return [];
    const rank = (v) => isExact(v, loc) ? 0 : isLang(v, loc) ? 1 : 2;
    return [...((_a = speechSynthesis.getVoices) == null ? void 0 : _a.call(speechSynthesis)) || []].sort(
      (a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)
    );
  }
  function waitForVoices(timeoutMs = 1500) {
    if (!isVoiceSupported()) return Promise.resolve([]);
    const now = listVoices();
    if (now.length || !speechSynthesis.addEventListener)
      return Promise.resolve(now);
    return new Promise((resolve) => {
      let timer;
      const done = () => {
        clearTimeout(timer);
        speechSynthesis.removeEventListener("voiceschanged", onChange);
        resolve(listVoices());
      };
      const onChange = () => {
        if (listVoices().length) done();
      };
      speechSynthesis.addEventListener("voiceschanged", onChange);
      timer = setTimeout(done, timeoutMs);
    });
  }
  async function hasNoVoices() {
    return isVoiceSupported() && (await waitForVoices()).length === 0;
  }
  function onVoicesChanged(cb) {
    if (!isVoiceSupported() || !speechSynthesis.addEventListener) {
      return () => {
      };
    }
    speechSynthesis.addEventListener("voiceschanged", cb);
    return () => speechSynthesis.removeEventListener("voiceschanged", cb);
  }
  function applyVoice(utt, prefs = {}, source = "ui") {
    const loc = source === "page" ? pageLocale() : getLocale();
    utt.lang = BCP47[loc];
    const voices = listVoices(loc);
    const chosen = prefs.voiceName && voices.find((v) => v.name === prefs.voiceName) || voices.find((v) => isExact(v, loc)) || voices.find((v) => isLang(v, loc));
    if (chosen) utt.voice = chosen;
    utt.rate = clampVoice("rate", prefs.voiceRate);
    utt.pitch = clampVoice("pitch", prefs.voicePitch);
    utt.volume = clampVoice("volume", prefs.voiceVolume);
  }
  function previewVoice(prefs, text = t("voiceSample")) {
    if (!isVoiceSupported()) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    applyVoice(utt, prefs);
    speechSynthesis.speak(utt);
  }

  // src/core/persistedState.js
  var SCHEMA_VERSION = 1;
  var hexOrEmpty = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : "";
  function hydratePersistedState(saved) {
    var _a, _b;
    if (!saved || typeof saved !== "object") return null;
    const opts = saved.options || {};
    let textScale = opts.textScale || "100";
    if (!opts.textScale && opts.largerText) textScale = "125";
    let colorTheme = opts.colorTheme || "senac";
    if (!opts.colorTheme && opts.highContrast) colorTheme = "yellowBlack";
    const modoSimples = Boolean(saved.modoSimples);
    const activeProfile = (_b = (_a = getProfile(saved.activeProfile)) == null ? void 0 : _a.id) != null ? _b : null;
    return {
      modoSimples,
      activeProfile,
      profileCustom: activeProfile ? Boolean(saved.profileCustom) : false,
      options: {
        textScale: ["100", "125", "150", "175"].includes(textScale) ? textScale : "100",
        colorTheme: [
          "senac",
          "yellowBlack",
          "darkHigh",
          "soft",
          "mono",
          "lightHigh"
        ].includes(colorTheme) ? colorTheme : "senac",
        colorSaturation: ["low", "normal", "high"].includes(opts.colorSaturation) ? opts.colorSaturation : "normal",
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
        lineHeight: clampTypo("lineHeight", opts.lineHeight),
        wordSpacing: clampTypo("wordSpacing", opts.wordSpacing),
        letterSpacing: clampTypo("letterSpacing", opts.letterSpacing),
        cursorStyle: ["default", "bigWhite", "bigBlack"].includes(
          opts.cursorStyle
        ) ? opts.cursorStyle : "default",
        reducedMotion: Boolean(opts.reducedMotion),
        hideImages: Boolean(opts.hideImages),
        readFocus: Boolean(opts.readFocus),
        muteMedia: Boolean(opts.muteMedia),
        blockFlashing: Boolean(opts.blockFlashing),
        strongFocus: Boolean(opts.strongFocus),
        showShortcuts: Boolean(opts.showShortcuts),
        voiceCommands: Boolean(opts.voiceCommands),
        voiceCloudConsent: Boolean(opts.voiceCloudConsent),
        voiceName: typeof opts.voiceName === "string" ? opts.voiceName : "",
        voiceRate: clampVoice("rate", opts.voiceRate),
        voicePitch: clampVoice("pitch", opts.voicePitch),
        voiceVolume: clampVoice("volume", opts.voiceVolume),
        language: ["auto", "pt", "en", "es"].includes(opts.language) ? opts.language : "auto",
        // Linguagem simples é acoplada ao MS; sem MS não reativa “órfã”
        simpleLanguage: modoSimples ? Boolean(opts.simpleLanguage) : false
      }
    };
  }

  // src/heuristics/scoring.js
  function scoreElement(element, config = defaults_default) {
    var _a;
    const { scoring } = config;
    let score = 0;
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute("role");
    if (tag === "main") score += scoring.mainTagBonus;
    if (role === "main") score += scoring.roleMainBonus;
    if (tag === "article") score += scoring.articleBonus;
    if (element.querySelector("h1")) score += scoring.h1Bonus;
    if (element.querySelector("h2")) score += scoring.h2Bonus;
    const textLength2 = ((_a = element.textContent) != null ? _a : "").trim().length;
    if (textLength2 >= scoring.minTextLength) {
      score += scoring.textLengthBonus;
      if (textLength2 >= scoring.minTextLength * 3)
        score += scoring.textLengthBonus;
    }
    return score;
  }

  // src/heuristics/queryAll.js
  function queryAll(selectors) {
    if (!Array.isArray(selectors) || selectors.length === 0) return [];
    try {
      return Array.from(document.querySelectorAll(selectors.join(",")));
    } catch (_) {
      const found = /* @__PURE__ */ new Set();
      for (const selector of selectors) {
        try {
          document.querySelectorAll(selector).forEach((el2) => found.add(el2));
        } catch (_2) {
        }
      }
      return [...found];
    }
  }

  // src/heuristics/contentDetector.js
  function detectMainContent(config = defaults_default) {
    const scored = [];
    const rank = (el2) => {
      if (typeof el2.matches !== "function") return 0;
      const i = config.mainSelectors.findIndex((sel) => {
        try {
          return el2.matches(sel);
        } catch (_) {
          return false;
        }
      });
      return i === -1 ? config.mainSelectors.length : i;
    };
    const candidates = queryAll(config.mainSelectors).map((element, order) => ({
      element,
      order,
      priority: rank(element)
    }));
    candidates.sort((a, b) => a.priority - b.priority || a.order - b.order);
    for (const { element } of candidates) {
      scored.push({ element, score: scoreElement(element, config) });
    }
    if (scored.length === 0) {
      return { element: document.body, confidence: 0 };
    }
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    const { scoring } = config;
    const ideal = scoring.mainTagBonus + scoring.h1Bonus + scoring.textLengthBonus * 2;
    const confidence = Math.min(best.score / ideal, 1);
    return { element: best.element, confidence };
  }

  // src/core/instancePersistence.js
  var textLength = (el2) => (el2 && el2.textContent || "").trim().length;
  var STATE_KEY = "state";
  var PRINCIPAL_KEY = "principal";
  var SIDE_KEY = "panelSide";
  function saveHideImagesBeforeMs(ms, hide3) {
    ms._hideImagesBeforeMs = !!hide3;
    if (!ms._config.persistence) return;
    const key = "hideImagesBeforeMs";
    if (ms._config.hostnamePersistence) {
      persistence_default.saveForHost(key, !!hide3);
    } else {
      persistence_default.save(key, !!hide3);
    }
  }
  function takeHideImagesBeforeMs(ms) {
    let hide3 = ms._hideImagesBeforeMs;
    if (hide3 === null && ms._config.persistence) {
      const key = "hideImagesBeforeMs";
      hide3 = ms._config.hostnamePersistence ? persistence_default.loadForHost(key, null) : persistence_default.load(key, null);
    }
    ms._hideImagesBeforeMs = null;
    if (ms._config.persistence) {
      const key = "hideImagesBeforeMs";
      if (ms._config.hostnamePersistence) {
        persistence_default.removeForHost(key);
      } else {
        persistence_default.remove(key);
      }
    }
    return !!hide3;
  }
  function loadPreferShowImages(ms) {
    if (!ms._config.persistence) return false;
    const key = "preferShowImagesInMs";
    const v = ms._config.hostnamePersistence ? persistence_default.loadForHost(key, false) : persistence_default.load(key, false);
    return !!v;
  }
  function savePreferShowImages(ms, show2) {
    if (!ms._config.persistence) return;
    const key = "preferShowImagesInMs";
    if (ms._config.hostnamePersistence) {
      persistence_default.saveForHost(key, !!show2);
    } else {
      persistence_default.save(key, !!show2);
    }
  }
  function loadPanelSide(ms) {
    const fallback = ms._config.position.endsWith("left") ? "left" : "right";
    if (!ms._config.persistence) return fallback;
    const v = ms._config.hostnamePersistence ? persistence_default.loadForHost(SIDE_KEY) : persistence_default.load(SIDE_KEY);
    return v === "left" || v === "right" ? v : fallback;
  }
  function savePanelSide(ms, side) {
    if (!ms._config.persistence) return;
    if (ms._config.hostnamePersistence) {
      persistence_default.saveForHost(SIDE_KEY, side);
    } else {
      persistence_default.save(SIDE_KEY, side);
    }
  }
  function persistState(ms, next) {
    if (!ms._config.persistence) return;
    const payload = {
      v: SCHEMA_VERSION,
      modoSimples: next.modoSimples,
      activeProfile: next.activeProfile,
      profileCustom: next.profileCustom,
      // reducedMotion só é gravado quando o usuário escolheu (null = derivado do SO)
      options: { ...next.options, reducedMotion: ms._reducedMotionUser }
    };
    const json = JSON.stringify(payload);
    if (json === ms._lastPersisted) return;
    ms._lastPersisted = json;
    if (ms._config.hostnamePersistence) {
      persistence_default.saveForHost(STATE_KEY, payload);
    } else {
      persistence_default.save(STATE_KEY, payload);
    }
  }
  function loadPersistedState(ms) {
    if (!ms._config.persistence) return;
    const saved = ms._config.hostnamePersistence ? persistence_default.loadForHost(STATE_KEY) : persistence_default.load(STATE_KEY);
    if (!saved) return;
    const patch = hydratePersistedState(saved);
    if (patch) state_default.set(patch);
    const rm = saved.options && saved.options.reducedMotion;
    const isUserChoice = saved.v >= 1 && typeof rm === "boolean";
    ms._reducedMotionUser = isUserChoice ? rm : null;
  }
  function savePrincipalPath(ms, path, el2) {
    if (!ms._config.persistence || !path) return;
    persistence_default.saveForPath(PRINCIPAL_KEY, {
      path,
      textLen: textLength(el2)
    });
  }
  function loadPrincipal(ms) {
    if (!ms._config.persistence) return null;
    let v = persistence_default.loadForPath(PRINCIPAL_KEY);
    const viaHost = v == null;
    if (viaHost) {
      v = ms._config.hostnamePersistence ? persistence_default.loadForHost(PRINCIPAL_KEY) : persistence_default.load(PRINCIPAL_KEY);
    }
    if (typeof v === "string" && v) {
      return { path: v, textLen: null, legacy: true };
    }
    if (v && typeof v.path === "string" && v.path) {
      return {
        path: v.path,
        textLen: Number.isFinite(v.textLen) ? v.textLen : null,
        legacy: viaHost
      };
    }
    return null;
  }
  function discardPrincipal(ms) {
    if (!ms._config.persistence) return;
    persistence_default.removeForPath(PRINCIPAL_KEY);
  }
  function isPlausiblePrincipal(ms, el2, saved) {
    const len = textLength(el2);
    if (len < ms._config.scoring.minTextLength) return false;
    if (saved.textLen && len < saved.textLen * 0.5) return false;
    if (saved.legacy) return ms._legacyHintFits(el2, len);
    return true;
  }
  function legacyHintFits(ms, el2, len) {
    const { element, confidence } = detectMainContent(ms._config);
    if (confidence < ms._config.confidenceThreshold || element === el2) {
      return true;
    }
    return len >= textLength(element) * 0.5;
  }

  // src/utils/mediaQuery.js
  function match(query) {
    return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(query) : null;
  }
  function prefersReducedMotion() {
    const mq = match("(prefers-reduced-motion: reduce)");
    return !!(mq && mq.matches);
  }
  function onReducedMotionChange(callback) {
    const mq = match("(prefers-reduced-motion: reduce)");
    if (!mq) return () => {
    };
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    }
    if (typeof mq.addListener === "function") {
      mq.addListener(callback);
      return () => mq.removeListener(callback);
    }
    return () => {
    };
  }

  // src/utils/aria.js
  function announce(message, politeness = "polite") {
    const live = document.createElement("div");
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", politeness);
    live.setAttribute("aria-atomic", "true");
    live.setAttribute("data-ms-live", "");
    live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
    document.body.appendChild(live);
    setTimeout(() => {
      live.textContent = message;
      setTimeout(() => {
        if (live.parentNode) live.parentNode.removeChild(live);
      }, 3e3);
    }, 50);
  }

  // src/utils/simpleLanguage.js
  function hasSimpleLanguagePairs() {
    if (typeof document === "undefined") return false;
    return !!(document.querySelector("[data-ms-plain]") && document.querySelector("[data-ms-simple]"));
  }

  // src/ui/styles.generated.js
  var UI_CSS = `
    :host {
      all: initial;
      display: block;
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483647;
      --ms-blue: #0B2C5F;
      --ms-blue-mid: #1B3F92;
      --ms-orange: #F39200;
      --ms-orange-dark: #E08400;
      --ms-simple-bg: #FFF8E7;
      --ms-simple-border: #F39200;
      --ms-panel-radius: 14px;
      --ms-u: calc(16px * var(--ms-scale, 1));
      --ms-font: 'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-family: var(--ms-font);
      font-size: 15px;
      line-height: 1.45;
      color: #1a1a1a;
      box-sizing: border-box;
    }

    *, *::before, *::after { box-sizing: inherit; }

    /* \u2500\u2500 FAB \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-fab-wrap {
      position: absolute;
      {{fabCorner}}
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: calc(0.45 * var(--ms-u));
      pointer-events: none;
      z-index: 2;
    }
    .ms-fab-tip {
      pointer-events: none;
      position: relative;
      background: #0B2C5F;
      color: #fff;
      font-size: calc(0.75 * var(--ms-u));
      font-weight: 700;
      padding: calc(0.45 * var(--ms-u)) calc(0.8 * var(--ms-u));
      border-radius: 999px;
      box-shadow:
        0 2px 4px rgba(11, 44, 95, 0.18),
        0 8px 20px rgba(11, 44, 95, 0.28);
      white-space: nowrap;
      max-width: min(240px, 72vw);
      line-height: 1.25;
      animation:
        ms-fab-tip-in 0.38s ease both,
        ms-fab-tip-out 0.4s ease 6s forwards;
    }
    .ms-fab-tip::after {
      content: '';
      position: absolute;
      bottom: -5px;
      right: calc(1.15 * var(--ms-u));
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-top-color: #0B2C5F;
      filter: drop-shadow(0 2px 1px rgba(11, 44, 95, 0.15));
    }
    .ms-fab-tip[hidden] { display: none !important; }

    @keyframes ms-fab-tip-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes ms-fab-tip-out {
      to {
        opacity: 0;
        visibility: hidden;
      }
    }

    #ms-fab,
    .ms-fab {
      position: relative;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: none;
      background: var(--ms-orange);
      color: #fff;
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 2px 6px rgba(243, 146, 0, 0.35),
        0 8px 22px rgba(243, 146, 0, 0.4);
      transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;
      padding: 0;
    }

    #ms-fab:hover {
      background: var(--ms-orange-dark);
      transform: scale(1.06);
      box-shadow:
        0 4px 10px rgba(243, 146, 0, 0.4),
        0 12px 28px rgba(243, 146, 0, 0.45);
    }
    #ms-fab:active { transform: scale(0.96); }
    #ms-fab:focus-visible {
      outline: 3px solid var(--ms-blue);
      outline-offset: 3px;
    }
    #ms-fab.ms-fab--open {
      box-shadow:
        0 0 0 4px rgba(243, 146, 0, 0.35),
        0 4px 16px rgba(0, 0, 0, 0.25);
    }
    .ms-fab-icon { display: block; }
    .ms-fab-icon--close[hidden],
    .ms-fab-icon--open[hidden] { display: none !important; }


    .ms-fab-wrap[hidden] { display: none !important; }
    .ms-fab-wrap[data-ms-side="left"] {
      right: auto;
      left: calc(1.5 * var(--ms-u));
      align-items: flex-start;
    }
    .ms-fab-wrap[data-ms-side="right"] {
      left: auto;
      right: calc(1.5 * var(--ms-u));
      align-items: flex-end;
    }
    .ms-fab-wrap[data-ms-side="left"] .ms-fab-tip::after {
      right: auto;
      left: calc(1.15 * var(--ms-u));
    }
    .ms-fab-box { position: relative; }
    .ms-fab-hide {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 50%;
      border: 2px solid #fff;
      background: #0B2C5F;
      color: #fff;
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ms-fab-wrap[data-ms-side="left"] .ms-fab-hide { right: auto; left: -8px; }
    .ms-fab-hide:hover { background: #123f86; }
    .ms-fab-hide:focus-visible { outline: 3px solid var(--ms-blue); outline-offset: 2px; }
    .ms-fab-wrap--open .ms-fab-hide { display: none; }
    /* \u2500\u2500 Panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    #ms-a11y-panel,
    .ms-a11y-panel {
      position: absolute;
      {{panelCorner}}
      width: min(380px, calc(100vw - calc(2 * var(--ms-u))));
      max-height: min(72vh, 640px);
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: var(--ms-panel-radius);
      box-shadow:
        0 4px 12px rgba(11, 44, 95, 0.12),
        0 16px 48px rgba(11, 44, 95, 0.28);
      overflow: hidden;
      pointer-events: auto;
      z-index: 1;
      transform-origin: {{panelOrigin}};
      animation: ms-panel-in 0.22s ease both;
    }

    #ms-a11y-panel[hidden] { display: none !important; }

    @keyframes ms-panel-in {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .ms-a11y-header {
      display: flex;
      align-items: flex-start;
      gap: calc(0.75 * var(--ms-u));
      padding: calc(1 * var(--ms-u)) calc(1 * var(--ms-u)) calc(0.9 * var(--ms-u));
      background: linear-gradient(135deg, var(--ms-blue) 0%, var(--ms-blue-mid) 100%);
      color: #fff;
      flex-shrink: 0;
    }

    .ms-a11y-header-icon {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--ms-orange);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ms-a11y-header-text { flex: 1; min-width: 0; }
    .ms-a11y-header-text h2 {
      margin: 0;
      font-size: calc(1.05 * var(--ms-u));
      font-weight: 700;
      line-height: 1.25;
      color: #fff;
    }
    .ms-a11y-subtitle {
      margin: calc(0.2 * var(--ms-u)) 0 0;
      font-size: calc(0.8125 * var(--ms-u));
      opacity: 0.85;
      color: #fff;
    }

    .ms-a11y-close {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      padding: calc(0.25 * var(--ms-u));
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ms-a11y-close:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
    .ms-a11y-close:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

    .ms-a11y-body {
      overflow-y: auto;
      padding: calc(0.85 * var(--ms-u)) calc(1 * var(--ms-u)) calc(1.1 * var(--ms-u));
      flex: 1;
      background: #f7f8fa;
    }


    #ms-a11y-panel[data-ms-side="left"] {
      right: auto;
      left: calc(1.5 * var(--ms-u));
      transform-origin: bottom left;
    }
    #ms-a11y-panel[data-ms-side="right"] {
      left: auto;
      right: calc(1.5 * var(--ms-u));
      transform-origin: bottom right;
    }
    .ms-a11y-actions {
      display: flex;
      flex-wrap: wrap;
      gap: calc(0.5 * var(--ms-u));
      margin-top: calc(0.75 * var(--ms-u));
    }
    .ms-a11y-action {
      flex: 1 1 auto;
      min-height: 44px;
      padding: calc(0.5 * var(--ms-u)) calc(0.75 * var(--ms-u));
      border: 2px solid var(--ms-blue);
      border-radius: 8px;
      background: #fff;
      color: var(--ms-blue);
      font: inherit;
      font-weight: 700;
      font-size: calc(0.875 * var(--ms-u));
      cursor: pointer;
    }
    .ms-a11y-action:hover { background: #eef3fb; }
    .ms-a11y-action:focus-visible { outline: 3px solid var(--ms-blue); outline-offset: 2px; }
    /* \u2500\u2500 Modo Simples card \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-card--simple {
      background: var(--ms-simple-bg);
      border: 2px solid var(--ms-simple-border);
      border-radius: 12px;
      padding: calc(0.85 * var(--ms-u)) calc(0.9 * var(--ms-u));
      margin-bottom: calc(1 * var(--ms-u));
    }
    .ms-a11y-card-row {
      display: flex;
      align-items: flex-start;
      gap: calc(0.75 * var(--ms-u));
    }
    .ms-a11y-card-text { flex: 1; min-width: 0; }
    .ms-a11y-card-star {
      color: var(--ms-orange);
      margin-right: calc(0.2 * var(--ms-u));
      font-size: calc(1 * var(--ms-u));
    }
    .ms-a11y-card-text strong {
      font-size: calc(0.95 * var(--ms-u));
      color: var(--ms-blue);
    }
    .ms-a11y-card-text p {
      margin: calc(0.35 * var(--ms-u)) 0 0;
      font-size: calc(0.78 * var(--ms-u));
      color: #4a5568;
      line-height: 1.4;
    }

    .ms-a11y-card--simple .ms-switch--on,
    .ms-a11y-card--simple .ms-switch[aria-checked="true"] {
      background: #8a5500;
    }

    /* \u2500\u2500 Sections (sanfona) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-section {
      background: #fff;
      border-radius: 10px;
      margin-bottom: calc(0.75 * var(--ms-u));
      border: 1px solid #e8eaef;
    }
    .ms-a11y-section-title {
      margin: 0;
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--ms-blue);
    }
    .ms-a11y-section-toggle {
      display: flex;
      align-items: center;
      gap: calc(0.35 * var(--ms-u));
      width: 100%;
      min-height: 44px;
      padding: calc(0.75 * var(--ms-u)) calc(0.85 * var(--ms-u));
      border: none;
      border-radius: 10px;
      background: transparent;
      color: inherit;
      font: inherit;
      letter-spacing: inherit;
      text-transform: inherit;
      text-align: start;
      cursor: pointer;
    }
    .ms-a11y-section-toggle:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: -2px;
    }
    .ms-a11y-section-name {
      flex: 1;
    }
    .ms-a11y-section-chevron {
      display: inline-flex;
      transition: transform 0.15s ease-out;
    }
    .ms-a11y-section-toggle[aria-expanded="true"] .ms-a11y-section-chevron {
      transform: rotate(180deg);
    }
    .ms-a11y-section-body {
      padding: 0 calc(0.85 * var(--ms-u)) calc(0.75 * var(--ms-u));
    }
    .ms-a11y-control-label {
      margin: 0;
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      color: #1e293b;
    }
    @media (prefers-reduced-motion: reduce) {
      .ms-a11y-section-chevron {
        transition: none;
      }
    }
    /* \u2500\u2500 Segmented text scale \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-segmented {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: calc(0.35 * var(--ms-u));
    }
    .ms-segment {
      border: none;
      border-radius: 8px;
      padding: calc(0.55 * var(--ms-u)) calc(0.25 * var(--ms-u));
      min-height: 44px;
      font: inherit;
      font-size: calc(0.8 * var(--ms-u));
      font-weight: 600;
      background: #eef0f4;
      color: #334155;
      cursor: pointer;
    }
    .ms-segment--on,
    .ms-segment[aria-checked="true"] {
      background: var(--ms-blue);
      color: #fff;
    }
    .ms-segment:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }

    /* \u2500\u2500 Theme grid \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-theme-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: calc(0.5 * var(--ms-u));
    }
    .ms-theme-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: calc(0.15 * var(--ms-u));
      text-align: left;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: calc(0.55 * var(--ms-u)) calc(0.6 * var(--ms-u));
      background: #fff;
      cursor: pointer;
      font: inherit;
      color: #1a1a1a;
    }
    .ms-theme-btn--on,
    .ms-theme-btn[aria-checked="true"] {
      border-color: var(--ms-blue);
      box-shadow: 0 0 0 1px var(--ms-blue);
    }
    .ms-theme-btn:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }
    .ms-theme-swatch {
      width: 100%;
      height: 18px;
      border-radius: 4px;
      margin-bottom: calc(0.25 * var(--ms-u));
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .ms-theme-btn--senac .ms-theme-swatch {
      background: linear-gradient(90deg, #0B2C5F 40%, #F5A623 40%);
    }
    .ms-theme-btn--yellowBlack .ms-theme-swatch {
      background: linear-gradient(90deg, #000 50%, #ffe600 50%);
    }
    .ms-theme-btn--darkHigh .ms-theme-swatch {
      background: linear-gradient(90deg, #111 50%, #f1f5f9 50%);
    }
    .ms-theme-btn--soft .ms-theme-swatch {
      background: linear-gradient(90deg, #f5efe0 50%, #5c4a32 50%);
    }
    .ms-theme-btn--mono .ms-theme-swatch {
      background: linear-gradient(90deg, #111 33%, #888 33% 66%, #eee 66%);
    }
    .ms-theme-btn--lightHigh .ms-theme-swatch {
      background: linear-gradient(90deg, #fff 50%, #000 50%);
      border-color: #000;
    }
    .ms-segmented[data-option="colorSaturation"],
    .ms-segmented[data-option="cursorStyle"] {
      grid-template-columns: repeat(3, 1fr);
    }
    .ms-swatches {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
      gap: calc(0.35 * var(--ms-u));
    }
    .ms-swatch[hidden] { display: none; }
    .ms-a11y-warn {
      margin: calc(0.4 * var(--ms-u)) 0 0;
      padding: calc(0.4 * var(--ms-u)) calc(0.55 * var(--ms-u));
      border-left: 4px solid #b45309;
      border-radius: 4px;
      background: #fffbeb;
      color: #7c2d12;
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 600;
    }
    /* regi\xE3o viva persistente: vazia fica sem tamanho mas na \xE1rvore de acessibilidade (display:none faria o leitor perder o an\xFAncio) */
    .ms-a11y-warn:empty { height: 0; margin: 0; padding: 0; border: 0; overflow: hidden; }
    .ms-swatch {
      min-height: 36px;
      min-width: 36px;
      border: 2px solid #64748b;
      border-radius: 8px;
      cursor: pointer;
      font: inherit;
      /* "Padr\xE3o do site": risca diagonal sobre fundo branco */
      background-image: none;
    }
    .ms-swatch--none {
      background: linear-gradient(135deg, #fff 45%, #dc2626 45% 55%, #fff 55%);
    }
    .ms-swatch--on,
    .ms-swatch[aria-checked="true"] {
      border-color: var(--ms-blue);
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--ms-blue);
    }
    .ms-swatch:focus-visible,
    .ms-color-input:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }
    .ms-color-input {
      display: block;
      width: 100%;
      min-height: 36px;
      margin-top: calc(0.4 * var(--ms-u));
      padding: 2px;
      border: 2px solid #64748b;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
    }
    .ms-theme-label {
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      line-height: 1.2;
    }
    .ms-theme-sub {
      font-size: calc(0.8125 * var(--ms-u));
      color: #64748b;
    }

    /* \u2500\u2500 Option rows + switches \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-option-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: calc(1.15 * var(--ms-u));
    }
    .ms-a11y-option-row {
      display: flex;
      align-items: center;
      gap: calc(0.75 * var(--ms-u));
    }
    .ms-a11y-option-text { flex: 1; min-width: 0; }
    .ms-a11y-option-text strong {
      font-size: calc(0.85 * var(--ms-u));
      color: #1e293b;
      display: block;
    }
    .ms-a11y-option-hint {
      display: block;
      margin-top: calc(0.2 * var(--ms-u));
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 500;
      color: #64748b;
      line-height: 1.35;
    }
    .ms-a11y-option-text p {
      margin: calc(0.15 * var(--ms-u)) 0 0;
      font-size: calc(0.8125 * var(--ms-u));
      color: #64748b;
      line-height: 1.35;
    }

    .ms-switch {
      flex-shrink: 0;
      width: 44px;
      height: 26px;
      border-radius: 999px;
      border: none;
      background: #64748b;
      padding: 3px;
      cursor: pointer;
      position: relative;
      transition: background 0.18s ease;
    }
    /* UX-16: \xE1rea de toque de 44px de altura (trilho visual de 26px) */
    .ms-switch::after {
      content: "";
      position: absolute;
      inset: -9px 0;
    }
    .ms-switch-thumb {
      display: block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
      transition: transform 0.18s ease;
    }
    .ms-switch--on,
    .ms-switch[aria-checked="true"] {
      background: var(--ms-blue);
    }
    .ms-switch--on .ms-switch-thumb,
    .ms-switch[aria-checked="true"] .ms-switch-thumb {
      transform: translateX(18px);
    }
    .ms-switch:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }

    /* \u2500\u2500 Grade de blocos (F6c): 3 colunas; radiogroups ocupam a linha inteira \u2500\u2500 */
    .ms-a11y-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(calc(5.4 * var(--ms-u)), 1fr));
      gap: calc(0.5 * var(--ms-u));
    }
    .ms-a11y-block--wide,
    .ms-a11y-block--span { grid-column: 1 / -1; min-width: 0; }
    /* F8b: sliders de tipografia */
    .ms-range { margin-bottom: calc(0.5 * var(--ms-u)); }
    .ms-range-label {
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 600;
      color: #1e293b;
    }
    .ms-range-input {
      width: 100%;
      min-height: 44px;
      margin: 0;
      accent-color: var(--ms-blue);
      cursor: pointer;
    }
    .ms-range-input:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }
    .ms-a11y-action--font { width: 100%; margin-top: calc(0.25 * var(--ms-u)); }
    .ms-a11y-control-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: calc(0.5 * var(--ms-u));
      margin-bottom: calc(0.5 * var(--ms-u));
    }
    .ms-a11y-control-state {
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      color: var(--ms-blue);
      text-align: end;
    }

    .ms-switch.ms-tile,
    .ms-btn-ouvir.ms-tile,
    .ms-tile[data-action="page-outline"], .ms-tile[data-action="mouse-grid"], .ms-tile[data-action="virtual-keyboard"], .ms-tile[data-action="pause"] {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(0.2 * var(--ms-u));
      width: auto;
      height: auto;
      min-height: 44px;
      padding: calc(0.6 * var(--ms-u)) calc(0.15 * var(--ms-u));
      border: 2px solid #64748b;
      border-radius: 10px;
      background: #fff;
      color: #1e293b;
      font: inherit;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .ms-switch.ms-tile::after { content: none; }
    .ms-tile-icon {
      display: inline-flex;
      font-size: calc(1.4 * var(--ms-u));
    }
    .ms-tile-label {
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      line-height: 1.25;
      overflow-wrap: break-word;
      hyphens: auto;
    }
    .ms-tile-state {
      font-size: calc(0.75 * var(--ms-u));
      font-weight: 600;
      color: #475569;
    }
    .ms-tile-check {
      display: none;
      position: absolute;
      top: calc(0.25 * var(--ms-u));
      right: calc(0.25 * var(--ms-u));
      font-size: calc(0.9 * var(--ms-u));
      color: var(--ms-blue);
    }
    /* Ligado: borda azul + fundo + \u2713 + texto "Ligado" (nunca s\xF3 cor) */
    .ms-switch.ms-tile[aria-checked="true"] {
      background: #e8f0fb;
      border-color: var(--ms-blue);
      box-shadow: 0 0 0 1px var(--ms-blue);
    }
    .ms-switch.ms-tile[aria-checked="true"] .ms-tile-state {
      color: var(--ms-blue);
    }
    .ms-switch.ms-tile[aria-checked="true"] .ms-tile-check { display: inline-flex; }
    .ms-switch.ms-tile:focus-visible,
    .ms-btn-ouvir.ms-tile:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }
    .ms-btn-ouvir.ms-tile {
      background: var(--ms-orange);
      border-color: var(--ms-orange);
      color: #1a1205;
    }
    .ms-btn-ouvir.ms-tile:hover { background: var(--ms-orange-dark); }

    .ms-btn-ouvir {
      flex-shrink: 0;
      border: none;
      border-radius: 8px;
      padding: calc(0.45 * var(--ms-u)) calc(0.9 * var(--ms-u));
      background: var(--ms-orange);
      color: #1a1205;
      font: inherit;
      font-size: calc(0.82 * var(--ms-u));
      font-weight: 700;
      cursor: pointer;
    }
    .ms-btn-ouvir:hover { background: var(--ms-orange-dark); }
    .ms-btn-ouvir:focus-visible {
      outline: 2px solid var(--ms-blue);
      outline-offset: 2px;
    }

    .ms-a11y-live {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    }

    .ms-a11y-footer-note {
      margin: calc(0.35 * var(--ms-u)) 0 0;
      text-align: center;
      font-size: calc(0.8125 * var(--ms-u));
      color: #475569;
      line-height: 1.35;
    }

    @media (max-width: 480px) {
      #ms-a11y-panel {
        width: calc(100vw - calc(1 * var(--ms-u)));
        max-height: calc(100vh - 124px - calc(2.5 * var(--ms-u)));
        max-height: calc(100dvh - 124px - calc(2.5 * var(--ms-u)));
        right: calc(0.5 * var(--ms-u)) !important;
        left: calc(0.5 * var(--ms-u)) !important;
        transform-origin: bottom center;
      }
      .ms-fab-tip {
        max-width: min(180px, 62vw);
        white-space: normal;
        text-align: center;
        border-radius: 14px;
        font-size: calc(0.75 * var(--ms-u));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ms-fab-tip {
        animation: ms-fab-tip-out 0.01s linear 6s forwards !important;
      }
      #ms-a11y-panel,
      .ms-a11y-panel {
        animation: none !important;
      }
      #ms-fab,
      .ms-fab,
      .ms-switch-thumb,
      .ms-switch,
      .ms-fab-wrap,
      .ms-chrome-switch .ms-switch-thumb {
        transition: none !important;
      }
      #ms-fab:hover,
      #ms-fab:active {
        transform: none;
      }
    }
    /* \u2500\u2500 F7f: perfis prontos (bot\xF5es com aria-pressed) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-profiles {
      margin-bottom: calc(1 * var(--ms-u));
    }
    .ms-profiles-title { margin: 0 0 calc(0.25 * var(--ms-u)); }
    .ms-profiles-hint {
      margin: 0 0 calc(0.6 * var(--ms-u));
      font-size: calc(0.8125 * var(--ms-u));
      color: #475569;
      line-height: 1.35;
    }
    .ms-profile-list {
      display: flex;
      flex-direction: column;
      gap: calc(0.5 * var(--ms-u));
    }
    .ms-profile {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0 calc(0.5 * var(--ms-u));
      width: 100%;
      min-height: 44px;
      padding: calc(0.55 * var(--ms-u)) calc(0.75 * var(--ms-u));
      border: 2px solid var(--ms-blue);
      border-radius: 10px;
      background: #fff;
      color: #1e293b;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    .ms-profile:hover { background: #eef3fb; }
    .ms-profile:focus-visible { outline: 3px solid var(--ms-blue); outline-offset: 2px; }
    .ms-profile--on {
      background: var(--ms-blue);
      color: #fff;
    }
    .ms-profile--on:hover { background: var(--ms-blue); }
    .ms-profile-name {
      font-weight: 700;
      font-size: calc(0.9 * var(--ms-u));
    }
    .ms-profile-desc {
      flex: 1 1 100%;
      font-size: calc(0.8125 * var(--ms-u));
      line-height: 1.35;
      overflow-wrap: anywhere;
    }
    .ms-profile-custom {
      padding: 0 calc(0.45 * var(--ms-u));
      border: 1px solid currentColor;
      border-radius: 999px;
      font-size: calc(0.75 * var(--ms-u));
      font-weight: 700;
    }
    .ms-profile-custom[hidden] { display: none; }
    /* \u2500\u2500 F9c: Estrutura da p\xE1gina (di\xE1logo dentro do painel) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-tile[data-action="page-outline"]:hover,
    .ms-tile[data-action="mouse-grid"]:hover,
    .ms-tile[data-action="virtual-keyboard"]:hover,
    .ms-tile[data-action="pause"]:hover { background: #eef3fb; }
    .ms-tile[data-action="page-outline"]:focus-visible,
    .ms-tile[data-action="mouse-grid"]:focus-visible,
    .ms-tile[data-action="virtual-keyboard"]:focus-visible,
    .ms-tile[data-action="pause"]:focus-visible,
    .ms-outline-link:focus-visible { outline: 3px solid var(--ms-blue); outline-offset: 2px; }
    .ms-outline {
      position: absolute;
      inset: 0;
      z-index: 3;
      display: flex;
      flex-direction: column;
      background: #fff;
      color: #1e293b;
    }
    .ms-outline-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(0.5 * var(--ms-u));
      padding: calc(0.75 * var(--ms-u));
      border-bottom: 2px solid #e2e8f0;
      flex-shrink: 0;
    }
    .ms-outline-title { margin: 0; font-size: calc(1.05 * var(--ms-u)); }
    .ms-outline-close { flex: 0 0 auto; }
    .ms-outline-body { flex: 1; overflow-y: auto; padding: calc(0.75 * var(--ms-u)); }
    .ms-outline-group { margin: 0 0 calc(0.4 * var(--ms-u)); font-size: calc(0.9 * var(--ms-u)); color: var(--ms-blue); }
    .ms-outline-list { list-style: none; margin: 0 0 calc(0.9 * var(--ms-u)); padding: 0; }
    .ms-outline-link {
      width: 100%;
      min-height: 44px;
      padding: calc(0.4 * var(--ms-u)) calc(0.6 * var(--ms-u));
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    .ms-outline-link:hover { background: #eef3fb; }
    .ms-outline-empty { margin: 0; font-size: calc(0.95 * var(--ms-u)); line-height: 1.4; }
    /* \u2500\u2500 F8c: cursor grande tamb\xE9m dentro do widget \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
       O host recebe data-ms-cursor (domMutator.applyOptions) e herda --ms-cur-arrow/--ms-cur-hand
       do <html> (definidas em page/85-cursor.css): as imagens n\xE3o s\xE3o duplicadas aqui. */
    :host([data-ms-cursor]) * {
      cursor: var(--ms-cur-arrow) !important;
    }
    :host([data-ms-cursor]) :is(button, a[href], summary, select, label, [role="button"], [role="switch"], [role="radio"], [role="tab"], input[type="range"], input[type="color"], input[type="checkbox"]),
    :host([data-ms-cursor]) :is(button, a[href], summary, select, label, [role="button"], [role="switch"], [role="radio"], [role="tab"]) * {
      cursor: var(--ms-cur-hand) !important;
    }
    /* F7d: bloqueio de intermit\xEAncia vale tamb\xE9m para a UI da lib (host recebe o atributo) */
    :host([data-ms-noflash]) *,
    :host([data-ms-noflash]) *::before,
    :host([data-ms-noflash]) *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      transition: none !important;
    }
    /* a dica do bot\xE3o some depois de 6 s: mant\xE9m o atraso (sen\xE3o sumiria na hora) */
    :host([data-ms-noflash]) .ms-fab-tip {
      animation: ms-fab-tip-out 0.01s linear 6s forwards !important;
    }
  `;
  var PAGE_CSS = `
    /* \u2500\u2500 Hidden distractions (Modo Simples only) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-ativo [data-ms-hidden="true"] {
      display: none !important;
      visibility: hidden !important;
    }

    html.ms-ativo [data-ms-principal] {
      display: block !important;
      max-width: 75ch !important;
      margin-inline: auto !important;
      padding-inline: 1.5rem !important;
      font-size: 1.125rem !important;
      line-height: 1.8 !important;
    }

    /* \u2500\u2500 Text scale (independent of ms-ativo) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-text-scale-125 { font-size: 125%; --ms-scale: 1.25; }
    html.ms-text-scale-150 { font-size: 150%; --ms-scale: 1.5; }
    html.ms-text-scale-175 { font-size: 175%; --ms-scale: 1.75; }

    /* \u2500\u2500 Color themes \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-theme-yellowBlack,
    html.ms-theme-yellowBlack body {
      background-color: #000000 !important;
      color: #ffe600 !important;
    }
    html.ms-theme-yellowBlack body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      color: #ffe600 !important;
      border-color: #ffe600 !important;
    }
    html.ms-theme-yellowBlack body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *):not(img):not(picture):not(video):not(canvas):not(svg):not(svg *):not(iframe) {
      background-color: transparent !important;
    }
    html.ms-theme-yellowBlack a,
    html.ms-theme-yellowBlack a:visited {
      color: #fff59d !important;
      text-decoration: underline !important;
    }
    html.ms-theme-yellowBlack .site-header,
    html.ms-theme-yellowBlack .ms-pills-nav {
      background-color: #000000 !important;
      color: #ffe600 !important;
      border-bottom-color: #ffe600 !important;
      box-shadow: 0 2px 8px rgb(0 0 0 / 55%) !important;
    }
    html.ms-theme-yellowBlack .site-header a,
    html.ms-theme-yellowBlack .ms-pills-nav a {
      color: #ffe600 !important;
    }
    /* W4c: pill inativa herdava fundo claro (#eef2f7) com texto amarelo (~1.13:1) */
    html.ms-theme-yellowBlack .ms-pills-nav .ms-pill:not([aria-current='page']) {
      background-color: #000000 !important;
      color: #ffe600 !important;
      border-color: #ffe600 !important;
    }
    html.ms-theme-yellowBlack .ms-pills-nav .ms-pill:not([aria-current='page']):hover,
    html.ms-theme-yellowBlack .ms-pills-nav .ms-pill:not([aria-current='page']):focus-visible {
      background-color: #332e00 !important;
    }
    html.ms-theme-yellowBlack .main-nav a[aria-current='page'],
    html.ms-theme-yellowBlack .ms-pill[aria-current='page'] {
      background-color: #ffe600 !important;
      color: #000000 !important;
      border-color: #ffe600 !important;
      text-decoration: none !important;
    }

    html.ms-theme-darkHigh,
    html.ms-theme-darkHigh body {
      background-color: #0f172a !important;
      color: #f8fafc !important;
    }
    html.ms-theme-darkHigh body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      color: #f8fafc !important;
      border-color: #94a3b8 !important;
    }
    html.ms-theme-darkHigh body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *):not(img):not(picture):not(video):not(canvas):not(svg):not(svg *):not(iframe) {
      background-color: transparent !important;
    }
    html.ms-theme-darkHigh a,
    html.ms-theme-darkHigh a:visited {
      color: #93c5fd !important;
    }
    html.ms-theme-darkHigh .site-header,
    html.ms-theme-darkHigh .ms-pills-nav {
      background-color: #0f172a !important;
      color: #f8fafc !important;
      border-bottom-color: #334155 !important;
      box-shadow: 0 2px 10px rgb(0 0 0 / 45%) !important;
    }
    html.ms-theme-darkHigh .site-header a,
    html.ms-theme-darkHigh .ms-pills-nav a {
      color: #e2e8f0 !important;
    }
    /* W4c: pill inativa herdava fundo claro (#eef2f7) com texto claro (~1.1:1) */
    html.ms-theme-darkHigh .ms-pills-nav .ms-pill:not([aria-current='page']) {
      background-color: #1e293b !important;
      color: #e2e8f0 !important;
      border-color: #94a3b8 !important;
    }
    html.ms-theme-darkHigh .ms-pills-nav .ms-pill:not([aria-current='page']):hover {
      background-color: #334155 !important;
    }
    html.ms-theme-darkHigh .main-nav a[aria-current='page'],
    html.ms-theme-darkHigh .ms-pill[aria-current='page'] {
      background-color: #38bdf8 !important;
      color: #0f172a !important;
      border-color: #38bdf8 !important;
      text-decoration: none !important;
    }

    html.ms-theme-soft,
    html.ms-theme-soft body {
      background-color: #f5efe0 !important;
      color: #3d3226 !important;
    }
    html.ms-theme-soft body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      color: #3d3226 !important;
      border-color: #c4b59a !important;
    }
    html.ms-theme-soft body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *):not(img):not(picture):not(video):not(canvas):not(svg):not(svg *):not(iframe) {
      background-color: transparent !important;
    }
    html.ms-theme-soft a,
    html.ms-theme-soft a:visited {
      color: #5c4a32 !important;
    }
    html.ms-theme-soft .site-header,
    html.ms-theme-soft .ms-pills-nav {
      background-color: #f5efe0 !important;
      color: #3d3226 !important;
      border-bottom-color: #c4b59a !important;
      box-shadow: 0 2px 8px rgb(61 50 38 / 12%) !important;
    }
    html.ms-theme-soft .site-header a,
    html.ms-theme-soft .ms-pills-nav a {
      color: #3d3226 !important;
    }
    html.ms-theme-soft .main-nav a[aria-current='page'],
    html.ms-theme-soft .ms-pill[aria-current='page'] {
      background-color: #3d3226 !important;
      color: #f5efe0 !important;
      border-color: #3d3226 !important;
      text-decoration: none !important;
    }

    html.ms-theme-lightHigh,
    html.ms-theme-lightHigh body {
      background-color: #ffffff !important;
      color: #000000 !important;
    }
    html.ms-theme-lightHigh body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      color: #000000 !important;
      border-color: #000000 !important;
    }
    html.ms-theme-lightHigh body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *):not(img):not(picture):not(video):not(canvas):not(svg):not(svg *):not(iframe) {
      background-color: transparent !important;
    }
    html.ms-theme-lightHigh a,
    html.ms-theme-lightHigh a:visited {
      color: #0000cc !important;
      text-decoration: underline !important;
    }
    html.ms-theme-lightHigh .site-header,
    html.ms-theme-lightHigh .ms-pills-nav {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-bottom-color: #000000 !important;
      box-shadow: 0 2px 8px rgb(0 0 0 / 25%) !important;
    }
    html.ms-theme-lightHigh .site-header a,
    html.ms-theme-lightHigh .ms-pills-nav a {
      color: #000000 !important;
    }
    html.ms-theme-lightHigh .ms-pills-nav .ms-pill:not([aria-current='page']) {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-color: #000000 !important;
    }
    html.ms-theme-lightHigh .ms-pills-nav .ms-pill:not([aria-current='page']):hover,
    html.ms-theme-lightHigh .ms-pills-nav .ms-pill:not([aria-current='page']):focus-visible {
      background-color: #e5e5e5 !important;
    }
    html.ms-theme-lightHigh .main-nav a[aria-current='page'],
    html.ms-theme-lightHigh .ms-pill[aria-current='page'] {
      background-color: #000000 !important;
      color: #ffffff !important;
      border-color: #000000 !important;
      text-decoration: none !important;
    }

    /* Session bar: opaque amber over page content under any theme */
    html.ms-theme-yellowBlack #ms-session-bar,
    html.ms-theme-darkHigh #ms-session-bar,
    html.ms-theme-lightHigh #ms-session-bar,
    html.ms-theme-soft #ms-session-bar {
      position: relative;
      z-index: 40;
      background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%) !important;
      color: #1a1205 !important;
      border-bottom-color: #d97706 !important;
    }

    /* ms-theme-senac is a noop (default site look) */

    /* F8a: satura\xE7\xE3o e monocrom\xE1tico via filter no <html> (elemento raiz: n\xE3o cria bloco
       contenedor, ent\xE3o o widget position:fixed continua ancorado \xE0 viewport). Nunca em body/filhos. */
    html.ms-sat-low { filter: saturate(0.5); }
    html.ms-sat-high { filter: saturate(1.8); }
    html.ms-theme-mono { filter: grayscale(1); }

    /* F8a: cor personalizada (texto/t\xEDtulos/fundo); vence os temas por vir depois, mesma especificidade */
    html.ms-custom-bg,
    html.ms-custom-bg body {
      background-color: var(--ms-custom-bg) !important;
    }
    html.ms-custom-bg body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *):not(img):not(picture):not(video):not(canvas):not(svg):not(svg *):not(iframe) {
      background-color: transparent !important;
    }
    html.ms-custom-text,
    html.ms-custom-text body {
      color: var(--ms-custom-text) !important;
    }
    html.ms-custom-text body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      color: var(--ms-custom-text) !important;
    }
    html.ms-custom-heading body :is(h1, h2, h3, h4, h5, h6):not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *),
    html.ms-custom-heading body :is(h1, h2, h3, h4, h5, h6):not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) * {
      color: var(--ms-custom-heading) !important;
    }
    /* F8a QA M2: links n\xE3o viram "texto comum" sob cor personalizada \u2014 cor pr\xF3pria (\u2265 4,5:1 sobre o
       fundo efetivo, calculada em domMutator) + sublinhado; vem por \xFAltimo para vencer texto e t\xEDtulos */
    html.ms-custom-link body a:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *),
    html.ms-custom-link body a:visited:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      color: var(--ms-custom-link) !important;
      text-decoration: underline !important;
    }

    /* \u2500\u2500 Reduced motion \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-reduced-motion *,
    html.ms-reduced-motion *::before,
    html.ms-reduced-motion *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }


    /* \u2500\u2500 Bloqueio de intermit\xEAncia (F7d): corta anima\xE7\xE3o e transi\xE7\xE3o do site \u2500\u2500 */
    html.ms-block-flashing *,
    html.ms-block-flashing *::before,
    html.ms-block-flashing *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
    /* \u2500\u2500 Highlight links \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-highlight-links a:not([data-ms-hidden]) {
      text-decoration: underline !important;
      text-decoration-thickness: 2px !important;
      text-underline-offset: 3px !important;
      outline: 1px dashed currentColor !important;
      outline-offset: 2px !important;
    }

    /* \u2500\u2500 Ferramentas de p\xE1gina (F9a) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-highlight-headings :is(h1, h2, h3, h4, h5, h6, [role="heading"]):not(#ms-container *, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *, #ms-mouse-grid *, #ms-virtual-keyboard *, [data-ms-hidden]) {
      outline: 3px solid #6a1b9a !important;
      outline-offset: 2px !important;
      background-color: #f3e5f5 !important;
      color: #000 !important;
    }
    html.ms-highlight-controls :is(button, [role="button"], input, select, textarea, summary):not(#ms-container *, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *, #ms-mouse-grid *, #ms-virtual-keyboard *, [data-ms-hidden]) {
      /* sombra, n\xE3o outline: o anel de foco nativo (outline) continua vis\xEDvel por cima do destaque */
      box-shadow: 0 0 0 3px #0b57d0 !important;
    }
    html.ms-enlarge-targets :is(button, [role="button"], input:not([type="hidden"], [type="checkbox"], [type="radio"]), select, textarea, summary):not(#ms-container *, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *, #ms-mouse-grid *, #ms-virtual-keyboard *, [data-ms-hidden]) {
      min-width: 44px !important;
      min-height: 44px !important;
      box-sizing: border-box !important;
    }
    /* Links soltos (menu, bot\xE3o-link, lista de links) ganham 44px. Links no meio de texto corrido
       (WCAG 2.5.8, exce\xE7\xE3o "em linha") ficam em linha, sem tamanho m\xEDnimo, para a frase quebrar normal. */
    html.ms-enlarge-targets a:not(#ms-container *, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *, #ms-mouse-grid *, #ms-virtual-keyboard *, [data-ms-hidden]):not(:is(p, dd, blockquote, figcaption, label) a, :is(li, td):not(:is(nav, [role="navigation"], [role="menu"], [role="menubar"], [role="tablist"]) *) a) {
      min-width: 44px !important;
      min-height: 44px !important;
      box-sizing: border-box !important;
    }
    html.ms-enlarge-targets a:not(#ms-container *, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *, #ms-mouse-grid *, #ms-virtual-keyboard *, [data-ms-hidden]):not(:has(img)):not(:is(p, dd, blockquote, figcaption, label) a, :is(li, td):not(:is(nav, [role="navigation"], [role="menu"], [role="menubar"], [role="tablist"]) *) a) {
      display: inline-block !important;
    }
    /* Sem suporte a :has() a regra acima \xE9 descartada: sem ela, links ganham inline-block (inclui os de imagem) */
    @supports not selector(:has(*)) {
      html.ms-enlarge-targets a:not(#ms-container *, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *, #ms-mouse-grid *, #ms-virtual-keyboard *, [data-ms-hidden]):not(:is(p, dd, blockquote, figcaption, label) a, :is(li, td):not(:is(nav, [role="navigation"], [role="menu"], [role="menubar"], [role="tablist"]) *) a) {
        display: inline-block !important;
      }
    }
    /* \u2500\u2500 Foco bem vis\xEDvel (F7e): anel duplo (preto + amarelo), leg\xEDvel em qualquer fundo \u2500\u2500 */
    html.ms-strong-focus :focus-visible:not(#ms-container, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *) {
      outline: 3px solid #000 !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 6px #ffd400 !important;
    }
    /* \u2500\u2500 Lexend / dyslexia font \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-dyslexia-font,
    html.ms-dyslexia-font body,
    html.ms-dyslexia-font body *:not(#ms-container):not(#ms-container *):not([class~="icon"]):not([class^="icon-"]):not([class*=" icon-"]):not([class^="icon_"]):not([class*=" icon_"]):not([class^="glyphicon"]):not([class*=" glyphicon"]):not([class$="-icon"]):not([class*="-icon "]):not([class$="_icon"]):not([class*="_icon "]):not([class*="fa-"]):not(.fa):not(.fas):not(.far):not(.fab):not(.material-icons):not(code):not(pre):not(kbd):not(samp) {
      font-family: 'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif !important;
      letter-spacing: 0.02em !important;
      word-spacing: 0.08em !important;
    }

    /* \u2500\u2500 Text spacing (WCAG 1.4.12) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-text-spacing body,
    html.ms-text-spacing p,
    html.ms-text-spacing li,
    html.ms-text-spacing h1,
    html.ms-text-spacing h2,
    html.ms-text-spacing h3,
    html.ms-text-spacing h4,
    html.ms-text-spacing h5,
    html.ms-text-spacing h6,
    html.ms-text-spacing td,
    html.ms-text-spacing th,
    html.ms-text-spacing dd,
    html.ms-text-spacing dt,
    html.ms-text-spacing blockquote,
    html.ms-text-spacing label {
      line-height: 2 !important;
      letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important;
    }
    html.ms-text-spacing p { margin-bottom: 1.5em !important; }

    /* F8b \u2014 sliders: v\xEAm depois do preset (mesma especificidade) e vencem s\xF3 a propriedade movida */
    html.ms-lh :is(body, p, li, h1, h2, h3, h4, h5, h6, td, th, dd, dt, blockquote, label) {
      line-height: var(--ms-lh) !important;
    }
    html.ms-ws :is(body, p, li, h1, h2, h3, h4, h5, h6, td, th, dd, dt, blockquote, label) {
      word-spacing: var(--ms-ws) !important;
    }
    html.ms-ls :is(body, p, li, h1, h2, h3, h4, h5, h6, td, th, dd, dt, blockquote, label) {
      letter-spacing: var(--ms-ls) !important;
    }

    /* \u2500\u2500 Hide images (content + logo; keep only [data-ms-keep-img]) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-hide-images img:not([data-ms-keep-img]),
    html.ms-hide-images picture:not([data-ms-keep-img]),
    html.ms-hide-images video,
    html.ms-hide-images [data-ms-deco-img] {
      display: none !important;
    }

    /* \u2500\u2500 Reading ruler marker (overlay is created in JS) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-reading-ruler { cursor: crosshair; }

    html.ms-manual-select-active { cursor: pointer !important; }

    /* \u2500\u2500 F8c: cursor grande branco/preto (setas SVG 48px com contorno contrastante) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
       Seta: ponta em (6,3). M\xE3o (links/bot\xF5es): ponta do dedo em (19,4). Fallback: auto / pointer.
       As imagens vivem s\xF3 aqui, em vari\xE1veis do <html> (--ms-cur-arrow/--ms-cur-hand): o widget (shadow
       DOM, ui/80-cursor.css) as herda \u2014 vari\xE1veis atravessam o shadow \u2014 sem duplicar os data-URIs.
       Preced\xEAncia: o cursor grande vence o crosshair da r\xE9gua (80-ruler.css) e o pointer do modo de
       sele\xE7\xE3o manual vira a m\xE3o grande. Campos de texto mant\xEAm o cursor "text" nativo.
       Telas de toque n\xE3o t\xEAm cursor: a classe n\xE3o faz nada, sem erro. */
    html.ms-cursor-white {
      --ms-cur-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M6 3v36l9-8 6 14 7-3-6-13h12z' fill='%23fff' stroke='%23000' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") 6 3, auto;
      --ms-cur-hand: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M16 6a3.5 3.5 0 0 1 7 0v15.5l2-.4a3 3 0 0 1 3.5 2.3 3 3 0 0 1 3.2-.2 3 3 0 0 1 3.1 2 3 3 0 0 1 3.2 3.1V35c0 6-4 10-10 10h-4c-4 0-6-2-8-5l-7-10a3 3 0 0 1 4.6-3.8L16 30z' fill='%23fff' stroke='%23000' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") 19 4, pointer;
    }
    html.ms-cursor-black {
      --ms-cur-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M6 3v36l9-8 6 14 7-3-6-13h12z' fill='%23000' stroke='%23fff' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") 6 3, auto;
      --ms-cur-hand: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M16 6a3.5 3.5 0 0 1 7 0v15.5l2-.4a3 3 0 0 1 3.5 2.3 3 3 0 0 1 3.2-.2 3 3 0 0 1 3.1 2 3 3 0 0 1 3.2 3.1V35c0 6-4 10-10 10h-4c-4 0-6-2-8-5l-7-10a3 3 0 0 1 4.6-3.8L16 30z' fill='%23000' stroke='%23fff' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") 19 4, pointer;
    }
    html:is(.ms-cursor-white, .ms-cursor-black),
    html:is(.ms-cursor-white, .ms-cursor-black) * {
      cursor: var(--ms-cur-arrow) !important;
    }
    html:is(.ms-cursor-white, .ms-cursor-black) :is(a[href], button, summary, select, label, [role="button"], [role="link"], [role="tab"], [role="menuitem"], input:is([type="button"], [type="submit"], [type="reset"], [type="checkbox"], [type="radio"], [type="image"])),
    html:is(.ms-cursor-white, .ms-cursor-black) :is(a[href], button, summary, select, label, [role="button"], [role="link"], [role="tab"], [role="menuitem"]) *,
    html:is(.ms-cursor-white, .ms-cursor-black).ms-manual-select-active,
    html:is(.ms-cursor-white, .ms-cursor-black).ms-manual-select-active * {
      cursor: var(--ms-cur-hand) !important;
    }
    html:is(.ms-cursor-white, .ms-cursor-black) :is(textarea, [contenteditable]:not([contenteditable="false"]), input:not([type="button"], [type="submit"], [type="reset"], [type="checkbox"], [type="radio"], [type="image"], [type="range"], [type="color"], [type="file"])),
    /* filhos de bloco edit\xE1vel (editores ricos p\xF5em p/span dentro), menos sub\xE1rvores contenteditable="false" */
    html:is(.ms-cursor-white, .ms-cursor-black) [contenteditable]:not([contenteditable="false"]) *:not([contenteditable="false"]):not([contenteditable="false"] *) {
      cursor: text !important;
    }
    /* \u2500\u2500 Session chrome (SIMPLES header) + barra sob o nav \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    /* UX-14: 1 unidade = 16px fixos, sem depender do html { font-size } do host */
    #ms-simples-chrome,
    #ms-session-bar,
    .ms-pills-nav {
      --ms-u: calc(16px * var(--ms-scale, 1));
    }
    #ms-simples-chrome {
      display: flex;
      align-items: center;
      margin-left: auto;
      z-index: 50;
      /* encolhe em vez de transbordar a linha do header (texto ampliado no mobile) */
      flex-shrink: 1;
      min-width: 0;
      max-width: 100%;
    }
    #ms-simples-chrome.ms-simples-chrome--fixed {
      position: fixed;
      top: calc(0.75 * var(--ms-u));
      right: calc(5.5 * var(--ms-u));
      z-index: 2147483646;
    }
    /* Same SIMPLES control, parked in MS pills nav while site header is hidden */
    #ms-simples-chrome.ms-simples-chrome--ms-nav {
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: calc(0.45 * var(--ms-u)) calc(1 * var(--ms-u)) 0;
      justify-content: flex-end;
      position: static;
    }
    #ms-simples-chrome.ms-simples-chrome--ms-nav .ms-chrome-icon {
      display: none;
    }
    .ms-simples-chrome-inner {
      display: flex;
      align-items: center;
      gap: calc(0.55 * var(--ms-u));
    }
    .ms-chrome-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      border: 1px solid #c5d0e3;
      background: #fff;
      color: #0b2c5f;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
    }
    .ms-chrome-icon:hover {
      border-color: #f39200;
      color: #e08400;
      box-shadow: 0 0 0 3px rgba(243, 146, 0, 0.18);
    }
    .ms-simples-toggle-wrap {
      display: flex;
      min-width: 0;
      align-items: center;
      gap: calc(0.55 * var(--ms-u));
      padding: calc(0.4 * var(--ms-u)) calc(0.7 * var(--ms-u)) calc(0.4 * var(--ms-u)) calc(0.75 * var(--ms-u));
      border-radius: 999px;
      border: 2px solid #d8e1ef;
      background: #fff;
      box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
      transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    }
    .ms-simples-toggle-wrap[data-active="true"] {
      border-color: #f39200;
      background: #fff8e7;
      box-shadow: 0 0 0 2px rgba(243, 146, 0, 0.22);
    }
    .ms-simples-spark { color: #f39200; font-size: calc(1 * var(--ms-u)); }
    .ms-simples-toggle-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .ms-simples-toggle-text strong {
      font-size: calc(0.8 * var(--ms-u));
      letter-spacing: 0.05em;
      color: #0b2c5f;
    }
    .ms-simples-sub {
      font-size: calc(0.75 * var(--ms-u));
      color: #475569;
      font-weight: 600;
    }
    .ms-chrome-switch {
      width: 44px;
      height: 26px;
      border-radius: 999px;
      border: none;
      background: #64748b;
      padding: 3px;
      cursor: pointer;
      position: relative;
    }
    .ms-chrome-switch::after {
      content: "";
      position: absolute;
      inset: -9px 0;
    }
    .ms-chrome-switch .ms-switch-thumb {
      display: block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgb(0 0 0 / 20%);
      transition: transform 0.18s ease;
    }
    .ms-chrome-switch.ms-switch--on,
    .ms-chrome-switch[aria-checked="true"] {
      background: #8a5500;
    }
    .ms-chrome-switch.ms-switch--on .ms-switch-thumb,
    .ms-chrome-switch[aria-checked="true"] .ms-switch-thumb {
      transform: translateX(18px);
    }

    #ms-session-bar {
      background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
      color: #1a1205;
      width: 100%;
      border-bottom: 2px solid #d97706;
      box-shadow: 0 2px 10px rgb(217 119 6 / 22%);
    }
    .ms-session-bar-inner {
      width: min(calc(72 * var(--ms-u)), calc(100% - calc(2 * var(--ms-u))));
      margin: 0 auto;
      padding: calc(0.9 * var(--ms-u)) 0;
    }
    .ms-session-off {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: calc(0.5 * var(--ms-u)) calc(1 * var(--ms-u));
    }
    .ms-session-off[hidden],
    .ms-session-on[hidden] {
      display: none !important;
    }
    .ms-session-off p {
      margin: 0;
      font-weight: 600;
      max-width: calc(52 * var(--ms-u));
      font-size: calc(0.95 * var(--ms-u));
    }
    .ms-chrome-icon:focus-visible,
    .ms-chrome-switch:focus-visible,
    .ms-session-btn:focus-visible {
      outline: 3px solid #0b2c5f;
      outline-offset: 2px;
    }
    .ms-session-on-top { margin-bottom: calc(0.7 * var(--ms-u)); }
    .ms-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }
    .ms-session-on-title {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: calc(0.5 * var(--ms-u));
      font-size: calc(1.05 * var(--ms-u));
    }
    .ms-session-badge {
      background: #1a1205;
      color: #fff;
      border-radius: 999px;
      padding: calc(0.22 * var(--ms-u)) calc(0.7 * var(--ms-u));
      font-size: calc(0.75 * var(--ms-u));
      font-weight: 700;
    }
    .ms-session-desc {
      margin: calc(0.35 * var(--ms-u)) 0 0;
      font-size: calc(0.9 * var(--ms-u));
      font-weight: 500;
    }
    .ms-session-actions {
      display: flex;
      flex-wrap: wrap;
      gap: calc(0.5 * var(--ms-u));
    }
    .ms-session-btn {
      border: none;
      border-radius: 12px;
      padding: calc(0.55 * var(--ms-u)) calc(0.95 * var(--ms-u));
      min-height: 44px;
      font-weight: 700;
      cursor: pointer;
      font-size: calc(0.85 * var(--ms-u));
      display: inline-flex;
      align-items: center;
      gap: calc(0.35 * var(--ms-u));
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .ms-session-btn--light {
      background: #fff;
      color: #1a1205;
      box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
    }
    .ms-session-btn--dark {
      background: #1a1205;
      color: #fff;
    }
    .ms-session-btn[aria-disabled='true'] {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .ms-session-btn--active {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px #1a1205;
    }
    .ms-session-btn--speaking {
      background: #dc2626;
      color: #fff;
    }

    /* UX-07: barra compacta no mobile (t\xEDtulo numa linha, bot\xF5es \xEDcone + r\xF3tulo curto em grade) */
    @media (max-width: 480px) {
      .ms-session-bar-inner { padding: calc(0.5 * var(--ms-u)) 0; }
      .ms-session-on-top { margin-bottom: calc(0.4 * var(--ms-u)); }
      .ms-session-on-title { font-size: calc(0.95 * var(--ms-u)); gap: calc(0.4 * var(--ms-u)); flex-wrap: nowrap; }
      .ms-session-on-title > span { flex: none; }
      .ms-session-on-title strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ms-session-badge { font-size: calc(0.75 * var(--ms-u)); padding: calc(0.15 * var(--ms-u)) calc(0.5 * var(--ms-u)); white-space: nowrap; }
      .ms-session-desc,
      .ms-btn-pre,
      .ms-btn-post {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      }
      .ms-session-actions {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: calc(0.4 * var(--ms-u));
      }
      .ms-session-actions .ms-session-btn {
        min-width: 0;
        overflow-wrap: anywhere;
        flex-direction: column;
        justify-content: center;
        gap: calc(0.15 * var(--ms-u));
        padding: calc(0.3 * var(--ms-u)) calc(0.2 * var(--ms-u));
        font-size: calc(0.75 * var(--ms-u));
        line-height: 1.15;
        text-align: center;
      }
      .ms-session-actions .ms-session-btn svg {
        width: 1.35em;
        height: 1.35em;
      }
      /* W4b: a 175% o r\xF3tulo quebrava letra a letra (barra 235px); 2 colunas, sem \xEDcone, palavra inteira por linha */
      html.ms-text-scale-175 .ms-session-actions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: calc(0.2 * var(--ms-u));
      }
      html.ms-text-scale-175 .ms-session-bar-inner { padding: calc(0.25 * var(--ms-u)) 0; }
      html.ms-text-scale-175 .ms-session-on-top { margin-bottom: calc(0.2 * var(--ms-u)); }
      html.ms-text-scale-175 #ms-simples-chrome.ms-simples-chrome--ms-nav { padding-top: calc(0.2 * var(--ms-u)); }
      html.ms-text-scale-175 .ms-simples-toggle-wrap { padding-block: calc(0.2 * var(--ms-u)); }
      html.ms-text-scale-175 .ms-session-actions .ms-session-btn {
        overflow-wrap: normal;
      }
      html.ms-text-scale-175 .ms-session-actions .ms-session-btn svg {
        display: none;
      }
    }

    html.ms-simple-language [data-ms-principal],
    html.ms-simple-language main {
      font-size: 1.15em !important;
      line-height: 1.75 !important;
      max-width: 65ch !important;
    }

    /* Pares de linguagem (prot\xF3tipo / sites que marcam o markup) */
    [data-ms-simple] {
      display: none !important;
    }
    html.ms-simple-language [data-ms-plain] {
      display: none !important;
    }
    html.ms-simple-language [data-ms-simple] {
      display: revert !important;
    }

    /* Conven\xE7\xF5es do prot\xF3tipo Senac (F5-T05) */
    .ms-simple-only {
      display: none !important;
    }
    html.ms-ativo .ms-simple-only {
      display: block !important;
    }
    html.ms-ativo .ms-simple-only.ms-hub,
    html.ms-ativo .ms-simple-only.ms-pills-nav {
      display: block !important;
    }
    html.ms-ativo .ms-simple-hide {
      display: none !important;
    }

    /* Highlight do bloco sendo lido pelo TTS */
    [data-ms-tts-active] {
      background: #fef3c7 !important;
      outline: 3px solid #f59e0b !important;
      outline-offset: 4px;
      border-radius: 6px;
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }

    /* UX-06: pills quebram linha (sem rolagem horizontal); no mobile viram grade de 2 colunas */
    .ms-pills-nav .ms-pills-nav__inner {
      flex-wrap: wrap;
      overflow-x: visible;
    }
    .ms-pills-nav .ms-pill {
      flex: 0 1 auto;
      min-height: 44px;
      box-sizing: border-box;
    }
    @media (max-width: 340px) {
      .ms-session-on-title { font-size: calc(0.85 * var(--ms-u)); }
      .ms-session-badge { padding: calc(0.15 * var(--ms-u)) calc(0.35 * var(--ms-u)); }
    }
    @media (max-width: 720px) {
      .ms-pills-nav .ms-pills-nav__inner {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: calc(0.5 * var(--ms-u));
      }
      .ms-pills-nav .ms-pill {
        justify-content: center;
        text-align: center;
        white-space: normal;
        overflow-wrap: anywhere;
        min-width: 0;
        padding-inline: calc(0.25 * var(--ms-u));
      }
    }
    @media (min-width: 360px) and (max-width: 720px) {
      .ms-pills-nav .ms-pills-nav__inner {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    /* Pills injet\xE1veis (F5-T11 \u2014 simpleNav) */
    .ms-pills-nav[data-ms-injected] {
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 0 rgb(0 0 0 / 4%);
    }
    .ms-pills-nav[data-ms-injected] .ms-pills-nav__inner {
      display: flex;
      gap: calc(0.5 * var(--ms-u));
      padding: calc(0.65 * var(--ms-u)) calc(1 * var(--ms-u));
    }
    .ms-pills-nav[data-ms-injected] .ms-pill {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: calc(0.35 * var(--ms-u));
      padding: calc(0.55 * var(--ms-u)) calc(0.95 * var(--ms-u));
      border-radius: 10px;
      background: #eef2f7;
      color: #0b2c5f;
      font-weight: 700;
      font-size: calc(0.82 * var(--ms-u));
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      text-decoration: none;
      border: 2px solid transparent;
      white-space: nowrap;
      transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    }
    .ms-pills-nav[data-ms-injected] .ms-pill:hover {
      background: #e2e8f0;
      text-decoration: none;
      box-shadow: 0 2px 6px rgb(11 44 95 / 10%);
    }
    .ms-pills-nav[data-ms-injected] .ms-pill[aria-current='page'] {
      background: #0b2c5f;
      color: #fff;
      border-color: #f39200;
      box-shadow: 0 0 0 2px rgb(243 146 0 / 35%);
      font-weight: 800;
    }
    .ms-pills-nav[data-ms-injected] .ms-pill__short {
      display: none;
    }
    @media (max-width: 720px) {
      .ms-pills-nav[data-ms-injected] .ms-pill__full {
        display: none;
      }
      .ms-pills-nav[data-ms-injected] .ms-pill__short {
        display: inline;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ms-chrome-icon,
      .ms-simples-toggle-wrap,
      .ms-chrome-switch .ms-switch-thumb,
      .ms-session-btn,
      .ms-pills-nav[data-ms-injected] .ms-pill {
        transition: none !important;
      }
    }
  `;

  // src/ui/styles.js
  function getUIStyles(position = "bottom-right") {
    const isBottom = position.startsWith("bottom");
    const isRight = position.endsWith("right");
    const fabCorner = [
      isBottom ? "bottom: calc(1.5 * var(--ms-u));" : "top: calc(1.5 * var(--ms-u));",
      isRight ? "right: calc(1.5 * var(--ms-u));" : "left: calc(1.5 * var(--ms-u));"
    ].join("");
    const panelCorner = [
      isBottom ? "bottom: calc(calc(1.5 * var(--ms-u)) + 100px);" : "top: calc(calc(1.5 * var(--ms-u)) + 100px);",
      isRight ? "right: calc(1.5 * var(--ms-u));" : "left: calc(1.5 * var(--ms-u));"
    ].join("");
    const panelOrigin = `${isBottom ? "bottom" : "top"} ${isRight ? "right" : "left"}`;
    return UI_CSS.replace("{{fabCorner}}", () => fabCorner).replace("{{panelCorner}}", () => panelCorner).replace("{{panelOrigin}}", () => panelOrigin);
  }
  function getPageStyles() {
    return PAGE_CSS;
  }

  // src/ui/strings.js
  var STRINGS_T = new Proxy(
    {},
    { get: (_, k) => typeof k === "string" ? t(k) : void 0 }
  );

  // src/ui/fab.js
  var TIP_SEEN_KEY = "fabTipSeen";
  function createFab({ onClick, onHide }) {
    const wrap = document.createElement("div");
    wrap.className = "ms-fab-wrap";
    wrap.setAttribute("data-ms-fab-wrap", "");
    const tip = document.createElement("span");
    tip.className = "ms-fab-tip";
    tip.id = "ms-fab-tip";
    tip.textContent = STRINGS_T.fabTip;
    tip.setAttribute("aria-hidden", "true");
    function dismissTip() {
      tip.hidden = true;
      persistence_default.save(TIP_SEEN_KEY, true);
    }
    tip.hidden = persistence_default.load(TIP_SEEN_KEY, false) === true;
    if (!tip.hidden) persistence_default.save(TIP_SEEN_KEY, true);
    tip.addEventListener("animationend", (e) => {
      if (e.animationName === "ms-fab-tip-out") dismissTip();
    });
    const btn = document.createElement("button");
    btn.id = "ms-fab";
    btn.type = "button";
    btn.className = "ms-fab";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "ms-a11y-panel");
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-label", STRINGS_T.fabOpenLabel);
    const iconOpen = `
    <svg class="ms-fab-icon ms-fab-icon--open" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="8" cy="6" r="2.2" fill="currentColor" stroke="none"/>
      <circle cx="14" cy="12" r="2.2" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="18" r="2.2" fill="currentColor" stroke="none"/>
    </svg>`;
    const iconClose = `
    <svg class="ms-fab-icon ms-fab-icon--close" viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true" focusable="false" hidden>
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>`;
    btn.innerHTML = iconOpen + iconClose;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
    const hideBtn = document.createElement("button");
    hideBtn.type = "button";
    hideBtn.className = "ms-fab-hide";
    hideBtn.setAttribute("aria-label", STRINGS_T.fabHideLabel);
    hideBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" focusable="false"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    hideBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      onHide == null ? void 0 : onHide();
    });
    const box2 = document.createElement("div");
    box2.className = "ms-fab-box";
    box2.appendChild(btn);
    box2.appendChild(hideBtn);
    wrap.appendChild(tip);
    wrap.appendChild(box2);
    function sync({ panelOpen }) {
      btn.setAttribute("aria-expanded", String(panelOpen));
      btn.setAttribute(
        "aria-label",
        panelOpen ? STRINGS_T.fabCloseLabel : STRINGS_T.fabOpenLabel
      );
      btn.classList.toggle("ms-fab--open", panelOpen);
      wrap.classList.toggle("ms-fab-wrap--open", panelOpen);
      if (panelOpen) dismissTip();
      const openIcon = btn.querySelector(".ms-fab-icon--open");
      const closeIcon = btn.querySelector(".ms-fab-icon--close");
      if (openIcon) openIcon.toggleAttribute("hidden", panelOpen);
      if (closeIcon) closeIcon.toggleAttribute("hidden", !panelOpen);
    }
    sync({ panelOpen: false });
    function setSide(side) {
      wrap.setAttribute("data-ms-side", side);
    }
    function setHidden(hidden) {
      wrap.hidden = hidden;
    }
    return {
      element: wrap,
      button: btn,
      hideButton: hideBtn,
      sync,
      setSide,
      setHidden
    };
  }

  // src/utils/focus.js
  var FOCUSABLE_SELECTORS = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(", ");
  function getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
      (el2) => !el2.closest("[hidden], [inert]") && el2.getBoundingClientRect().width > 0
    );
  }
  function trapFocus(container) {
    function handleKeydown(e) {
      if (e.key !== "Tab") return;
      const focusable = getFocusable(container);
      if (!focusable.length) return;
      const root = container.getRootNode();
      const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!active || active === container || !container.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (focusable.length < 2) return;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }

  // src/features/tts.js
  var _utterance = null;
  var _speaking = false;
  var _blocks = [];
  var _blockIndex = 0;
  var _activeEl = null;
  var _runId = 0;
  var _listeners = /* @__PURE__ */ new Set();
  var _notified = false;
  var _notifiedPaused = false;
  var _paused = false;
  var _resume = null;
  var _errListeners = /* @__PURE__ */ new Set();
  function isSpeechFailure(e) {
    return Boolean(
      e && e.error && e.error !== "interrupted" && e.error !== "canceled"
    );
  }
  function notifySpeechError() {
    for (const cb of Array.from(_errListeners)) {
      try {
        cb("speech-failed");
      } catch (_) {
      }
    }
  }
  function onSpeechError(cb) {
    _errListeners.add(cb);
    return () => {
      _errListeners.delete(cb);
    };
  }
  function failSpeech() {
    stopSpeaking("speech-failed");
    notifySpeechError();
  }
  function notify(reason) {
    if (_speaking === _notified && _paused === _notifiedPaused) return;
    _notified = _speaking;
    _notifiedPaused = _paused;
    for (const cb of Array.from(_listeners)) {
      try {
        cb(_speaking, _paused, reason);
      } catch (_) {
      }
    }
  }
  function onSpeakingChange(cb) {
    _listeners.add(cb);
    return () => {
      _listeners.delete(cb);
    };
  }
  var BLOCK_TAGS = [
    "h1",
    "h2",
    "h3",
    "h4",
    "p",
    "li",
    "dt",
    "dd",
    "figcaption",
    "blockquote"
  ];
  function closestSafe(el2, selector) {
    var _a, _b, _c;
    if (!el2) return null;
    if (typeof el2.closest === "function") return el2.closest(selector);
    let node = el2;
    while (node) {
      if (node.matches && node.matches(selector)) return node;
      const parts = selector.split(",").map((s) => s.trim());
      for (const part of parts) {
        if (part.startsWith(".") && ((_a = node.classList) == null ? void 0 : _a.contains(part.slice(1))))
          return node;
        if (part.startsWith("#") && node.id === part.slice(1)) return node;
        if (part.startsWith("[") && part.endsWith("]")) {
          const attr = part.slice(1, -1).split("=")[0];
          if ((_b = node.hasAttribute) == null ? void 0 : _b.call(node, attr)) return node;
        }
        if (/^[a-z][a-z0-9]*$/i.test(part) && ((_c = node.tagName) == null ? void 0 : _c.toLowerCase()) === part.toLowerCase()) {
          return node;
        }
      }
      node = node.parentElement;
    }
    return null;
  }
  function getRoot() {
    return document.querySelector("[data-ms-principal]") || document.querySelector("main") || document.querySelector('[role="main"]') || document.body;
  }
  function isVisiblyReadable(el2) {
    if (!el2 || closestSafe(el2, "#ms-container") || closestSafe(el2, "#ms-simples-chrome") || closestSafe(el2, "#ms-session-bar")) {
      return false;
    }
    if (closestSafe(el2, "[data-ms-hidden]")) return false;
    const html = document.documentElement;
    const msOn = html.classList.contains("ms-ativo");
    const simpleLang = html.classList.contains("ms-simple-language");
    if (msOn && closestSafe(el2, ".ms-simple-hide")) return false;
    if (!msOn && closestSafe(el2, ".ms-simple-only")) return false;
    if (simpleLang && closestSafe(el2, "[data-ms-plain]")) return false;
    if (!simpleLang && closestSafe(el2, "[data-ms-simple]")) return false;
    return (el2.textContent || "").trim().length > 0;
  }
  function collectBlocks() {
    const root = getRoot();
    if (!root) return [];
    const nodes = Array.from(root.querySelectorAll(BLOCK_TAGS.join(",")));
    const readable = new Set(nodes.filter(isVisiblyReadable));
    return nodes.filter((el2) => {
      if (!readable.has(el2)) return false;
      let parent = el2.parentElement;
      while (parent && parent !== root) {
        if (readable.has(parent)) return false;
        parent = parent.parentElement;
      }
      return true;
    });
  }
  var MAX_UTTERANCE = 200;
  function splitForSpeech(text, max = MAX_UTTERANCE) {
    if (text.length <= max) return [text];
    const chunks = [];
    let cur = "";
    const flush = () => {
      const t2 = cur.trim();
      if (t2) chunks.push(t2);
      cur = "";
    };
    const sentences = text.match(/[\s\S]+?(?:[.!?…]+(?=\s|$)|$)\s*/g) || [text];
    for (const s of sentences) {
      if (s.length > max) {
        flush();
        const words = s.match(/\S+\s*/g) || [s];
        for (const w of words) {
          if (w.length > max) {
            flush();
            for (let i = 0; i < w.length; i += max)
              chunks.push(w.slice(i, i + max));
          } else if ((cur + w).trim().length > max) {
            flush();
            cur = w;
          } else {
            cur += w;
          }
        }
        continue;
      }
      if ((cur + s).trim().length > max) {
        flush();
        cur = s;
      } else {
        cur += s;
      }
    }
    flush();
    return chunks;
  }
  function clearHighlight() {
    document.querySelectorAll("[data-ms-tts-active]").forEach((node) => {
      node.removeAttribute("data-ms-tts-active");
    });
    _activeEl = null;
  }
  function highlightAndScroll(el2) {
    clearHighlight();
    el2.setAttribute("data-ms-tts-active", "");
    _activeEl = el2;
    const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof el2.scrollIntoView === "function") {
      try {
        el2.scrollIntoView({
          block: "center",
          behavior: reduceMotion ? "auto" : "smooth"
        });
      } catch (_) {
        el2.scrollIntoView(true);
      }
    }
  }
  function speakBlockAt(index, run) {
    if (!_speaking || run !== _runId) return;
    if (index >= _blocks.length) {
      stopSpeaking();
      return;
    }
    const el2 = _blocks[index];
    _blockIndex = index;
    highlightAndScroll(el2);
    const text = (el2.innerText || el2.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) {
      speakBlockAt(index + 1, run);
      return;
    }
    speakChunk(index, splitForSpeech(text), 0, run);
  }
  function speakChunk(index, chunks, i, run) {
    if (!_speaking || run !== _runId) return;
    _resume = { index, chunks, i };
    const utterance = new SpeechSynthesisUtterance(chunks[i]);
    _utterance = utterance;
    applyVoice(utterance, state_default.get().options, "page");
    const next = () => {
      if (run !== _runId) return;
      _utterance = null;
      if (!_speaking) return;
      if (i + 1 < chunks.length) speakChunk(index, chunks, i + 1, run);
      else speakBlockAt(index + 1, run);
    };
    utterance.onend = next;
    utterance.onerror = (e) => {
      if (run !== _runId) return;
      if (isSpeechFailure(e)) failSpeech();
      else next();
    };
    speechSynthesis.speak(utterance);
  }
  function speakFallback(text, run) {
    _resume = { text };
    const utterance = new SpeechSynthesisUtterance(text);
    _utterance = utterance;
    applyVoice(utterance, state_default.get().options, "page");
    const done = () => {
      if (run !== _runId) return;
      _speaking = false;
      _resume = null;
      _utterance = null;
      notify();
    };
    utterance.onend = done;
    utterance.onerror = (e) => {
      if (run !== _runId) return;
      if (isSpeechFailure(e)) failSpeech();
      else done();
    };
    speechSynthesis.speak(utterance);
  }
  function speakMainContent() {
    if (typeof speechSynthesis === "undefined") return;
    stopSpeaking();
    const run = _runId;
    _blocks = collectBlocks();
    if (!_blocks.length) {
      const root = getRoot();
      const text = root ? (root.innerText || root.textContent || "").replace(/\s+/g, " ").trim() : "";
      if (!text) return;
      _speaking = true;
      notify();
      speakFallback(text, run);
      return;
    }
    _speaking = true;
    notify();
    speakBlockAt(0, run);
  }
  function stopSpeaking(reason) {
    _runId += 1;
    _speaking = false;
    _paused = false;
    _resume = null;
    _blocks = [];
    _blockIndex = 0;
    clearHighlight();
    notify(typeof reason === "string" ? reason : void 0);
    if (typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    _utterance = null;
  }
  function pauseSpeaking() {
    if (!_speaking || _paused || !_resume) return false;
    _runId += 1;
    _paused = true;
    _utterance = null;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    notify();
    return true;
  }
  function resumeSpeaking() {
    if (!_speaking || !_paused || !_resume) return false;
    _paused = false;
    const run = _runId;
    const r = _resume;
    notify();
    if (r.chunks) speakChunk(r.index, r.chunks, r.i, run);
    else speakFallback(r.text, run);
    return true;
  }
  function isPaused() {
    return _paused;
  }
  function isReadingMain() {
    return _speaking;
  }
  function isSpeaking() {
    if (typeof speechSynthesis !== "undefined" && speechSynthesis.speaking) {
      return true;
    }
    return _speaking;
  }

  // src/features/focusReader.js
  var MAX_TEXT = 200;
  var DEBOUNCE_MS = 150;
  var _timer = null;
  var _on = false;
  var _spoke = false;
  var _root = null;
  function isFocusReaderSupported() {
    return typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined";
  }
  var clean = (t2) => (t2 || "").replace(/\s+/g, " ").trim();
  var cap2 = (t2) => t2.length > MAX_TEXT ? t2.slice(0, MAX_TEXT).trim() : t2;
  function accessibleName(el2) {
    var _a, _b, _c;
    const ids = el2.getAttribute("aria-labelledby");
    if (ids) {
      const root = ((_a = el2.getRootNode) == null ? void 0 : _a.call(el2)) || document;
      const text = clean(
        ids.split(/\s+/).map((id) => {
          var _a2, _b2;
          return ((_b2 = (_a2 = root.getElementById) == null ? void 0 : _a2.call(root, id)) == null ? void 0 : _b2.textContent) || "";
        }).join(" ")
      );
      if (text) return cap2(text);
    }
    const aria = clean(el2.getAttribute("aria-label"));
    if (aria) return cap2(aria);
    const tag = el2.tagName.toLowerCase();
    let label2 = "";
    if (el2.labels && el2.labels.length) {
      label2 = clean(
        Array.from(el2.labels).map((l) => l.textContent).join(" ")
      );
    } else if (["input", "select", "textarea"].includes(tag)) {
      label2 = clean((_c = (_b = el2.closest) == null ? void 0 : _b.call(el2, "label")) == null ? void 0 : _c.textContent);
    }
    if (label2) return cap2(label2);
    const alt = clean(el2.getAttribute("alt"));
    if (alt) return cap2(alt);
    const title = clean(el2.getAttribute("title"));
    if (title) return cap2(title);
    const type = (el2.getAttribute("type") || "").toLowerCase();
    if (tag === "input") {
      if (["button", "submit", "reset"].includes(type)) {
        return cap2(
          clean(el2.value) || (type === "submit" ? t("focusSubmitName") : "")
        );
      }
      return cap2(clean(el2.getAttribute("placeholder")));
    }
    if (["select", "textarea"].includes(tag)) return "";
    return cap2(clean(el2.textContent));
  }
  function roleWord(el2) {
    const tag = el2.tagName.toLowerCase();
    const role = (el2.getAttribute("role") || "").toLowerCase();
    const type = (el2.getAttribute("type") || "").toLowerCase();
    if (role === "switch") return t("roleSwitch");
    if (role === "checkbox") return t("roleCheckbox");
    if (role === "radio") return t("roleRadio");
    if (role === "button") return t("roleButton");
    if (role === "link") return t("roleLink");
    if (role === "heading") return t("roleHeading");
    if (role === "textbox" || role === "searchbox") return t("roleField");
    if (role === "combobox" || role === "listbox") return t("roleSelect");
    if (tag === "button") return t("roleButton");
    if (tag === "a") return t("roleLink");
    if (/^h[1-6]$/.test(tag)) return t("roleHeading");
    if (tag === "select") return t("roleSelect");
    if (tag === "textarea") return t("roleField");
    if (tag === "input") {
      if (["button", "submit", "reset", "image"].includes(type))
        return t("roleButton");
      if (type === "checkbox") return t("roleCheckbox");
      if (type === "radio") return t("roleRadio");
      return t("roleField");
    }
    if (el2.isContentEditable) return t("roleField");
    return "";
  }
  function stateWord(el2) {
    const checked = el2.getAttribute("aria-checked");
    const isSwitch = (el2.getAttribute("role") || "") === "switch";
    const type = (el2.getAttribute("type") || "").toLowerCase();
    const nativo = el2.tagName === "INPUT" && ["checkbox", "radio"].includes(type);
    if (checked === null && !nativo) return "";
    const on3 = checked !== null ? checked === "true" : el2.checked;
    if (isSwitch) return on3 ? t("focusSwitchOn") : t("focusSwitchOff");
    return on3 ? t("focusChecked") : t("focusUnchecked");
  }
  function describeFocus(el2) {
    if (!el2 || el2.nodeType !== 1) return "";
    const tag = el2.tagName.toLowerCase();
    if (tag === "body" || tag === "html") return "";
    const role = roleWord(el2);
    const name = accessibleName(el2);
    const parts = [name, role, role ? stateWord(el2) : ""].filter(Boolean);
    return parts.join(", ");
  }
  function speakNow(target) {
    _timer = null;
    if (!_on || isReadingMain()) return;
    const text = describeFocus(target);
    if (!text) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    applyVoice(utterance, state_default.get().options, "page");
    _spoke = true;
    utterance.onerror = (e) => {
      if (isSpeechFailure(e)) notifySpeechError();
    };
    speechSynthesis.speak(utterance);
  }
  function onFocusIn(e) {
    var _a;
    const target = ((_a = e.composedPath) == null ? void 0 : _a.call(e)[0]) || e.target;
    if (_timer !== null) clearTimeout(_timer);
    _timer = setTimeout(() => speakNow(target), DEBOUNCE_MS);
  }
  function startFocusReader() {
    var _a;
    if (_on || !isFocusReaderSupported()) return;
    _on = true;
    document.addEventListener("focusin", onFocusIn, true);
    _root = ((_a = document.querySelector("#ms-container")) == null ? void 0 : _a.shadowRoot) || null;
    _root == null ? void 0 : _root.addEventListener("focusin", onFocusIn, true);
  }
  function stopFocusReader() {
    if (!_on) return;
    _on = false;
    document.removeEventListener("focusin", onFocusIn, true);
    _root == null ? void 0 : _root.removeEventListener("focusin", onFocusIn, true);
    _root = null;
    if (_timer !== null) clearTimeout(_timer);
    _timer = null;
    if (_spoke && !isReadingMain()) speechSynthesis.cancel();
    _spoke = false;
  }

  // src/features/voiceCommands.js
  var lang = () => BCP47[getLocale()];
  var MAX_WORDS = 5;
  var MAX_RESTARTS = 5;
  var RESTART_WINDOW_MS = 1e4;
  function getCtor() {
    const g = globalThis;
    return g.SpeechRecognition || g.webkitSpeechRecognition || null;
  }
  var secure = () => globalThis.isSecureContext !== false;
  function getUnsupportedReason() {
    var _a;
    if ((_a = globalThis.navigator) == null ? void 0 : _a.brave) return "brave";
    if (!getCtor()) return "no-api";
    if (!secure()) return "insecure";
    return null;
  }
  async function getRecognitionMode() {
    var _a;
    const Ctor = getCtor();
    if (getUnsupportedReason()) return "none";
    const headless = /HeadlessChrome/.test(((_a = globalThis.navigator) == null ? void 0 : _a.userAgent) || "");
    if (!headless && typeof Ctor.available === "function") {
      try {
        const r = await Ctor.available({ langs: [lang()], processLocally: true });
        if (r === "available") return "local";
        if (r === "downloadable" || r === "downloading") return "download";
      } catch (_) {
      }
    }
    return "cloud";
  }
  async function installLocalModel() {
    const Ctor = getCtor();
    if (!Ctor || typeof Ctor.install !== "function") return false;
    try {
      return Boolean(
        await Ctor.install({ langs: [lang()], processLocally: true })
      );
    } catch (_) {
      return false;
    }
  }
  var norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  var TABLES = {
    pt: [
      ["msOff", /\bdesligar\b.*\bmodo simples\b/],
      ["msOn", /\bligar\b.*\bmodo simples\b/],
      ["panelOpen", /\babrir\b.*\bpainel\b/],
      ["panelClose", /\bfechar\b.*\bpainel\b/],
      ["faster", /\bmais rapido\b/],
      ["slower", /\bmais devagar\b/],
      ["scrollDown", /\bdescer\b/],
      ["scrollUp", /\bsubir\b/],
      ["pause", /\bpausar\b|\bpausa\b/],
      ["resume", /\bcontinuar\b|\bcontinue\b/],
      ["stop", /^(parar|pare|para)$/],
      ["help", /\bajuda\b|\bcomandos\b/],
      ["read", /\bler\b|\bleia\b/]
    ],
    en: [
      ["msOff", /\b(turn|switch) off\b.*\bsimple mode\b/],
      ["msOn", /\b(turn|switch) on\b.*\bsimple mode\b/],
      ["panelOpen", /\bopen\b.*\bpanel\b/],
      ["panelClose", /\bclose\b.*\bpanel\b/],
      ["faster", /\bfaster\b|\bspeed up\b/],
      ["slower", /\bslower\b|\bslow down\b/],
      ["scrollDown", /\bscroll down\b|^down$/],
      ["scrollUp", /\bscroll up\b|^up$/],
      ["pause", /\bpause\b/],
      ["resume", /\bresume\b|\bcontinue\b/],
      ["stop", /^(stop)$/],
      ["help", /\bhelp\b|\bcommands\b/],
      ["read", /\bread\b/]
    ],
    es: [
      ["msOff", /\b(desactivar|apagar)\b.*\bmodo simple\b/],
      ["msOn", /\b(activar|encender)\b.*\bmodo simple\b/],
      ["panelOpen", /\babrir\b.*\bpanel\b/],
      ["panelClose", /\bcerrar\b.*\bpanel\b/],
      ["faster", /\bmas rapido\b/],
      ["slower", /\bmas lento\b|\bmas despacio\b/],
      ["scrollDown", /\bbajar\b/],
      ["scrollUp", /\bsubir\b/],
      ["pause", /\bpausar\b|\bpausa\b/],
      ["resume", /\bcontinuar\b|\bcontinua\b/],
      ["stop", /^(parar|para|detener)$/],
      ["help", /\bayuda\b|\bcomandos\b/],
      ["read", /\bleer\b|\blee\b/]
    ]
  };
  function parseCommand(text) {
    const t2 = norm(text);
    if (!t2 || t2.split(" ").length > MAX_WORDS) return null;
    for (const [action, re] of TABLES[getLocale()]) {
      if (re.test(t2)) return { action };
    }
    return null;
  }
  var _rec = null;
  var _enabled = false;
  var _onStatus = () => {
  };
  var _restarts = [];
  var status = (s) => {
    try {
      _onStatus(s);
    } catch (_) {
    }
  };
  function teardown() {
    _enabled = false;
    const r = _rec;
    _rec = null;
    if (!r) return;
    r.onresult = r.onerror = r.onend = null;
    try {
      r.abort ? r.abort() : r.stop();
    } catch (_) {
    }
  }
  function startVoiceCommands({ mode, onCommand, onStatus } = {}) {
    _onStatus = onStatus || (() => {
    });
    if (mode === "cloud" && state_default.get().options.voiceCloudConsent !== true) {
      status("needs-consent");
      return false;
    }
    if (mode === "download") {
      status("needs-model");
      return false;
    }
    const Ctor = getCtor();
    if (mode !== "local" && mode !== "cloud" || !Ctor || !secure()) {
      status("unsupported");
      return false;
    }
    teardown();
    _restarts = [];
    const rec = new Ctor();
    rec.lang = lang();
    rec.continuous = true;
    rec.interimResults = false;
    if (mode === "local") rec.processLocally = true;
    rec.onresult = (e) => {
      for (let i = e.resultIndex || 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (!res.isFinal) continue;
        const cmd = parseCommand(res[0] && res[0].transcript);
        if (cmd && onCommand) onCommand(cmd);
      }
    };
    rec.onerror = (e) => {
      const err = e && e.error;
      if (err === "not-allowed" || err === "service-not-allowed") {
        teardown();
        status("blocked");
      } else if (err === "language-not-supported" || err === "network") {
        teardown();
        status("unsupported");
      } else if (err === "audio-capture") {
        teardown();
        status("no-mic");
      } else if (err && err !== "no-speech" && err !== "aborted") {
        teardown();
        status("error");
      }
    };
    rec.onend = () => {
      if (!_enabled || _rec !== rec) return;
      const now = Date.now();
      _restarts = _restarts.filter((t2) => now - t2 < RESTART_WINDOW_MS);
      _restarts.push(now);
      if (_restarts.length > MAX_RESTARTS) {
        teardown();
        status("error");
        return;
      }
      try {
        rec.start();
      } catch (_) {
        teardown();
        status("error");
      }
    };
    _rec = rec;
    _enabled = true;
    try {
      rec.start();
    } catch (_) {
      teardown();
      status("error");
      return false;
    }
    status("listening");
    return true;
  }
  function stopVoiceCommands() {
    const was = _enabled;
    teardown();
    if (was) status("stopped");
  }

  // src/features/pageOutline.js
  var OUTLINE_ID = "ms-page-outline";
  var OWN = "#ms-container, #ms-shortcuts-card, #ms-simples-chrome, #ms-session-bar, #ms-text-magnifier, #ms-virtual-keyboard, [data-ms-live]";
  var FOCUSABLE = 'a[href], button, input, select, textarea, summary, [contenteditable=""], [contenteditable="true"]';
  var CANDIDATES = "h1, h2, h3, h4, h5, h6, [role], main, nav, header, footer, aside, form, section, search";
  var clean2 = (s) => (s || "").replace(/\s+/g, " ").trim();
  function deepCandidates(root, out = []) {
    for (const el2 of root.querySelectorAll("*")) {
      if (el2.matches(OWN)) continue;
      if (el2.matches(CANDIDATES)) out.push(el2);
      if (el2.shadowRoot) deepCandidates(el2.shadowRoot, out);
    }
    return out;
  }
  function isHidden(el2) {
    var _a, _b;
    for (let n = el2; n && n.nodeType === 1; n = n.parentElement || ((_b = (_a = n.getRootNode) == null ? void 0 : _a.call(n)) == null ? void 0 : _b.host)) {
      if (n.hidden || n.getAttribute("aria-hidden") === "true" || n.hasAttribute("data-ms-hidden")) {
        return true;
      }
      const cs = getComputedStyle(n);
      if (cs.display === "none") return true;
      if (n === el2 && cs.visibility === "hidden") return true;
    }
    return false;
  }
  function accessibleName2(el2) {
    const by = el2.getAttribute("aria-labelledby");
    if (by) {
      const t2 = clean2(
        by.split(/\s+/).map((id) => {
          var _a;
          return ((_a = document.getElementById(id)) == null ? void 0 : _a.textContent) || "";
        }).join(" ")
      );
      if (t2) return t2;
    }
    return clean2(el2.getAttribute("aria-label"));
  }
  var ROLE_MAP = {
    main: "main",
    navigation: "nav",
    banner: "banner",
    contentinfo: "footer",
    complementary: "aside",
    form: "form",
    search: "search",
    region: "region"
  };
  var TAG_MAP = {
    main: "main",
    nav: "nav",
    aside: "aside",
    search: "search",
    form: "form",
    section: "region"
  };
  function landmarkRole(el2) {
    var _a;
    const explicit = clean2(el2.getAttribute("role")).split(" ")[0].toLowerCase();
    if (explicit) return ROLE_MAP[explicit] || "";
    const tag = el2.tagName.toLowerCase();
    if (TAG_MAP[tag]) return TAG_MAP[tag];
    if (tag === "header" || tag === "footer") {
      if ((_a = el2.parentElement) == null ? void 0 : _a.closest("article, aside, main, nav, section")) {
        return "";
      }
      return tag === "header" ? "banner" : "footer";
    }
    return "";
  }
  var NAME_REQUIRED = /* @__PURE__ */ new Set(["form", "search", "region"]);
  var ROLE_LABEL = {
    main: t("outlineLmMain"),
    nav: t("outlineLmNav"),
    banner: t("outlineLmBanner"),
    footer: t("outlineLmFooter"),
    aside: t("outlineLmAside"),
    form: t("outlineLmForm"),
    search: t("outlineLmSearch"),
    region: t("outlineLmRegion")
  };
  function headingLevel(el2) {
    const m = /^H([1-6])$/.exec(el2.tagName);
    if (m) return Number(m[1]);
    if (clean2(el2.getAttribute("role")).split(" ")[0] !== "heading") return 0;
    const n = parseInt(el2.getAttribute("aria-level"), 10);
    return n >= 1 && n <= 6 ? n : 2;
  }
  function collectOutline(root = document) {
    const headings = [];
    const landmarks = [];
    for (const el2 of deepCandidates(root)) {
      if (el2.closest(OWN) || isHidden(el2)) continue;
      const level = headingLevel(el2);
      if (level) {
        const text = clean2(el2.textContent) || accessibleName2(el2) || t("outlineNoText");
        headings.push({ el: el2, level, text });
        continue;
      }
      const role = landmarkRole(el2);
      if (!role) continue;
      const name = accessibleName2(el2);
      if (NAME_REQUIRED.has(role) && !name) continue;
      const label2 = ROLE_LABEL[role];
      landmarks.push({
        el: el2,
        role,
        name,
        text: name ? `${label2}: ${name}` : label2
      });
    }
    return { headings, landmarks };
  }
  function jumpToElement(el2) {
    var _a, _b;
    if (!(el2 == null ? void 0 : el2.isConnected)) return;
    (_a = el2.scrollIntoView) == null ? void 0 : _a.call(el2, { block: "start" });
    if (!el2.hasAttribute("tabindex") && !el2.matches(FOCUSABLE)) {
      el2.setAttribute("tabindex", "-1");
      el2.addEventListener("blur", () => el2.removeAttribute("tabindex"), {
        once: true
      });
    }
    (_b = el2.focus) == null ? void 0 : _b.call(el2, { preventScroll: true });
  }
  function createPageOutline({ container, onJump }) {
    let dlg = null;
    let trigger = null;
    const inerted = [];
    const el2 = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    };
    function item(list, text, level, target) {
      const li = el2("li", "ms-outline-item");
      if (level) li.style.paddingInlineStart = `${(level - 1) * 16}px`;
      const b = el2("button", "ms-outline-link", text);
      b.type = "button";
      if (level) {
        b.setAttribute("aria-label", `${t("outlineLevel")} ${level}: ${text}`);
      }
      b.addEventListener("click", () => {
        close({ restoreFocus: false });
        onJump(target);
      });
      li.appendChild(b);
      list.appendChild(li);
    }
    function group(parent, title, rows, levelOf) {
      if (!rows.length) return;
      const h = el2("h3", "ms-outline-group", title);
      const ul = el2("ul", "ms-outline-list");
      rows.forEach((r) => item(ul, r.text, levelOf == null ? void 0 : levelOf(r), r.el));
      parent.append(h, ul);
    }
    function open(from) {
      if (dlg) return;
      trigger = from || null;
      const { headings, landmarks } = collectOutline();
      dlg = el2("div", "ms-outline");
      dlg.id = OUTLINE_ID;
      dlg.setAttribute("role", "dialog");
      dlg.setAttribute("aria-modal", "true");
      dlg.setAttribute("aria-labelledby", `${OUTLINE_ID}-title`);
      const head = el2("div", "ms-outline-head");
      const title = el2("h2", "ms-outline-title", t("outlineTitle"));
      title.id = `${OUTLINE_ID}-title`;
      const closeBtn = el2(
        "button",
        "ms-a11y-action ms-outline-close",
        t("outlineClose")
      );
      closeBtn.type = "button";
      closeBtn.addEventListener("click", () => close());
      head.append(title, closeBtn);
      const body = el2("div", "ms-outline-body");
      if (!headings.length && !landmarks.length) {
        body.appendChild(el2("p", "ms-outline-empty", t("outlineEmpty")));
      } else {
        group(body, t("outlineLandmarks"), landmarks);
        group(body, t("outlineHeadings"), headings, (r) => r.level);
      }
      dlg.append(head, body);
      dlg.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        e.stopPropagation();
        close();
      });
      for (const n of container.children) {
        if (!n.hasAttribute("inert")) {
          n.setAttribute("inert", "");
          inerted.push(n);
        }
      }
      container.appendChild(dlg);
      (dlg.querySelector(".ms-outline-link") || closeBtn).focus();
    }
    function close({ restoreFocus = true } = {}) {
      if (!dlg) return;
      dlg.remove();
      dlg = null;
      for (const n of inerted.splice(0)) n.removeAttribute("inert");
      const t2 = trigger;
      trigger = null;
      if (restoreFocus && (t2 == null ? void 0 : t2.isConnected)) t2.focus();
    }
    return { open, close, isOpen: () => !!dlg };
  }

  // src/utils/colorContrast.js
  var HEX = /^#[0-9a-f]{6}$/i;
  function luminance(hex) {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrastRatio(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }
  var readableOn = (hex) => luminance(hex) > 0.179 ? "#000000" : "#ffffff";
  function linkOn(bg) {
    const best = ["#0000cc", "#93c5fd"].sort(
      (a, b) => contrastRatio(b, bg) - contrastRatio(a, bg)
    )[0];
    return contrastRatio(best, bg) >= 4.5 ? best : readableOn(bg);
  }
  function autoBg(t2, h) {
    const refs = [t2, h].filter(Boolean);
    if (!refs.length) return "";
    const score = (c) => Math.min(...refs.map((r) => contrastRatio(r, c)));
    const [black, white] = [score("#000000"), score("#ffffff")];
    if (Math.abs(black - white) < 0.01) return readableOn(t2 || h);
    return black > white ? "#000000" : "#ffffff";
  }
  function effectiveColors({ customText, customHeading, customBg }) {
    const ok = (v) => HEX.test(v || "") ? v : "";
    const t2 = ok(customText);
    const h = ok(customHeading);
    const b = ok(customBg);
    const bg = b || autoBg(t2, h);
    const text = t2 || (bg ? readableOn(bg) : "");
    return { text, heading: h, bg, link: bg ? linkOn(bg) : "" };
  }

  // src/ui/a11yPanel.js
  var LANG_NAMES = { pt: "Portugu\xEAs", en: "English", es: "Espa\xF1ol" };
  var TYPO_KEYS = ["lineHeight", "wordSpacing", "letterSpacing"];
  var round2 = (n) => Math.round(n * 100) / 100;
  var typoValue = (key, idx) => idx <= 0 ? 0 : key === "lineHeight" ? round2(
    TYPO_LIMITS.lineHeight.min + (idx - 1) * TYPO_LIMITS.lineHeight.step
  ) : round2(idx * TYPO_LIMITS[key].step);
  var typoIdx = (key, v) => !(v > 0) ? 0 : key === "lineHeight" ? Math.round(
    (v - TYPO_LIMITS.lineHeight.min) / TYPO_LIMITS.lineHeight.step
  ) + 1 : Math.round(v / TYPO_LIMITS[key].step);
  var typoText = (key, v) => v > 0 ? `${String(v).replace(".", ",")}${key === "lineHeight" ? "" : " em"}` : STRINGS_T.panelTypoDefault;
  var VOICES_PER_LANG = 6;
  function collapseVoices(list, max = VOICES_PER_LANG) {
    const byLang = /* @__PURE__ */ new Map();
    list.forEach((v) => {
      const k = (v.lang || "").toLowerCase();
      if (!byLang.has(k)) byLang.set(k, []);
      byLang.get(k).push(v);
    });
    const out = [];
    byLang.forEach((g) => {
      const base = g.filter((v) => !v.name.includes("+"));
      out.push(...(base.length ? base : g).slice(0, max));
    });
    return out;
  }
  function groupVoicesByLang(list) {
    const byLang = /* @__PURE__ */ new Map();
    list.forEach((v) => {
      const k = v.lang || "?";
      if (!byLang.has(k)) byLang.set(k, []);
      byLang.get(k).push(v);
    });
    const loc = getLocale();
    const rank = (k) => k.toLowerCase() === BCP47[loc].toLowerCase() ? 0 : new RegExp(`^${loc}([-_]|$)`, "i").test(k) ? 1 : 2;
    let names = null;
    try {
      names = new Intl.DisplayNames([BCP47[getLocale()]], { type: "language" });
    } catch (e) {
    }
    return [...byLang.keys()].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)).map((k) => {
      let nome = "";
      try {
        nome = (names == null ? void 0 : names.of(k.replace("_", "-"))) || "";
      } catch (e) {
      }
      return {
        label: nome && nome !== k ? `${nome} (${k})` : k,
        voices: byLang.get(k).sort((a, b) => a.name.localeCompare(b.name))
      };
    });
  }
  var VOICE_SLIDERS;
  var TEXT_SCALES;
  var DEFAULT_BRAND;
  var COLOR_THEMES;
  var SATURATIONS;
  var CURSORS;
  var CUSTOM_COLORS2;
  var CONTROLS;
  var SECTIONS;
  var VOICE_LIMIT_OF = {
    voiceRate: "rate",
    voicePitch: "pitch",
    voiceVolume: "volume"
  };
  var VOICE_DEFAULTS = {
    voiceName: "",
    voiceRate: 1,
    voicePitch: 1,
    voiceVolume: 1
  };
  var voiceText = (key, v) => key === "voiceVolume" ? `${Math.round(v * 100)}%` : `${v.toFixed(1).replace(".", ",")}${key === "voiceRate" ? "\xD7" : ""}`;
  var svgIcon = (inner) => `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
  var CHEVRON = svgIcon('<path d="m6 9 6 6 6-6"/>');
  var CHECK = svgIcon('<path d="m5 12.5 4.5 4.5L19 7.5"/>');
  var switchTile = ({ option, title, label: label2, desc, icon }) => `<button type="button" class="ms-switch ms-tile" role="switch" aria-checked="false" data-option="${option}" aria-label="${label2}"${desc ? ` aria-describedby="ms-desc-${option}"` : ""}><span class="ms-tile-icon" aria-hidden="true">${icon}</span><span class="ms-tile-label">${title}</span><span class="ms-tile-state" data-state aria-hidden="true">${STRINGS_T.stateOff}</span><span class="ms-tile-check" aria-hidden="true">${CHECK}</span>${desc ? `<span id="ms-desc-${option}" hidden>${desc}</span>` : ""}</button>`;
  var radioHead = (id, title, option) => `<div class="ms-a11y-control-head"><p id="${id}" class="ms-a11y-control-label">${title}</p><span class="ms-a11y-control-state" data-state-for="${option}" aria-hidden="true"></span></div>`;
  function refreshTexts() {
    VOICE_SLIDERS = [
      ["voiceRate", STRINGS_T.panelVoiceRateLabel],
      ["voicePitch", STRINGS_T.panelVoicePitchLabel],
      ["voiceVolume", STRINGS_T.panelVoiceVolumeLabel]
    ];
    TEXT_SCALES = [
      { value: "100", label: "100%", title: STRINGS_T.scaleDefault },
      { value: "125", label: "125%", title: STRINGS_T.scaleLarge },
      { value: "150", label: "150%", title: STRINGS_T.scaleLarger },
      { value: "175", label: "175%", title: STRINGS_T.scaleMax }
    ];
    DEFAULT_BRAND = {
      title: STRINGS_T.panelDefaultTitle,
      subtitle: "",
      footer: STRINGS_T.panelDefaultFooter
    };
    COLOR_THEMES = [
      { value: "senac", label: STRINGS_T.themeSite, sub: STRINGS_T.themeSiteSub },
      {
        value: "yellowBlack",
        label: STRINGS_T.themeYellowBlack,
        sub: STRINGS_T.themeYellowBlackSub
      },
      { value: "darkHigh", label: STRINGS_T.themeDarkHigh, sub: STRINGS_T.themeDarkHighSub },
      { value: "soft", label: STRINGS_T.themeSoft, sub: STRINGS_T.themeSoftSub },
      { value: "mono", label: STRINGS_T.themeMono, sub: STRINGS_T.themeMonoSub },
      { value: "lightHigh", label: STRINGS_T.themeLightHigh, sub: STRINGS_T.themeLightHighSub }
    ];
    SATURATIONS = [
      { value: "low", label: STRINGS_T.panelSaturationLow },
      { value: "normal", label: STRINGS_T.panelSaturationNormal },
      { value: "high", label: STRINGS_T.panelSaturationHigh }
    ];
    CURSORS = [
      { value: "default", label: STRINGS_T.panelCursorDefault },
      { value: "bigWhite", label: STRINGS_T.panelCursorBigWhite },
      { value: "bigBlack", label: STRINGS_T.panelCursorBigBlack }
    ];
    CUSTOM_COLORS2 = {
      customText: {
        labelId: "ms-label-ctext",
        title: STRINGS_T.panelCustomTextTitle,
        presets: [
          "#000000",
          "#1a1a1a",
          "#0b2c5f",
          "#14532d",
          "#7f1d1d",
          "#ffffff",
          "#fef08a",
          "#bae6fd"
        ]
      },
      customHeading: {
        labelId: "ms-label-cheading",
        title: STRINGS_T.panelCustomHeadingTitle,
        presets: [
          "#000000",
          "#0b2c5f",
          "#7f1d1d",
          "#14532d",
          "#4a148c",
          "#ffffff",
          "#fde047",
          "#93c5fd"
        ]
      },
      customBg: {
        labelId: "ms-label-cbg",
        title: STRINGS_T.panelCustomBgTitle,
        presets: [
          "#ffffff",
          "#fffbe6",
          "#f5efe0",
          "#e6f0ff",
          "#e8f5e9",
          "#000000",
          "#0f172a",
          "#1a1a1a"
        ]
      }
    };
    CONTROLS = {
      // Idioma da UI (auto | pt | en | es); opções preenchidas por DOM, cada uma no próprio idioma
      language: {
        html: `
        <div class="ms-a11y-block--span">
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-language">${STRINGS_T.panelLanguageTitle}</label></div>
            <select class="ms-range-input" id="ms-language" data-language></select>
          </div>
        </div>`
      },
      textScale: {
        wide: true,
        html: `
        ${radioHead("ms-label-text", STRINGS_T.panelTextSizeTitle, "textScale")}
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-text" data-option="textScale">
          ${TEXT_SCALES.map(
          (s) => `
            <button type="button" role="radio" class="ms-segment"
              data-value="${s.value}" aria-checked="false"
              aria-label="${STRINGS_T.panelTextSizeItemLabel} ${s.label} \u2014 ${s.title}" title="${s.title}">
              ${s.label}
            </button>`
        ).join("")}
        </div>`
      },
      colorTheme: {
        wide: true,
        html: `
        ${radioHead("ms-label-theme", STRINGS_T.panelThemeTitle, "colorTheme")}
        <div class="ms-theme-grid" role="radiogroup" aria-labelledby="ms-label-theme" data-option="colorTheme">
          ${COLOR_THEMES.map(
          (t2) => `
            <button type="button" role="radio" class="ms-theme-btn ms-theme-btn--${t2.value}"
              data-value="${t2.value}" aria-checked="false"
              aria-label="${STRINGS_T.panelThemeItemLabel} ${t2.label} \u2014 ${t2.sub}">
              <span class="ms-theme-swatch" aria-hidden="true"></span>
              <span class="ms-theme-label">${t2.label}</span>
              <span class="ms-theme-sub">${t2.sub}</span>
            </button>`
        ).join("")}
        </div>`
      },
      // Segmentos preenchidos em createA11yPanel (DOM, sem interpolação no template)
      colorSaturation: {
        wide: true,
        html: `
        ${radioHead("ms-label-sat", STRINGS_T.panelSaturationTitle, "colorSaturation")}
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-sat" data-option="colorSaturation"></div>`
      },
      // Segmentos preenchidos em createA11yPanel. Em tela de toque não há cursor: o controle fica e é inofensivo
      cursorStyle: {
        wide: true,
        html: `
        ${radioHead("ms-label-cursor", STRINGS_T.panelCursorTitle, "cursorStyle")}
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-cursor" data-option="cursorStyle"></div>`
      },
      customText: {
        wide: true,
        html: `
        ${radioHead("ms-label-ctext", STRINGS_T.panelCustomTextTitle, "customText")}
        <div class="ms-swatches" role="radiogroup" aria-labelledby="ms-label-ctext" data-option="customText"></div>
        <input type="color" class="ms-color-input" data-picker="customText">`
      },
      customHeading: {
        wide: true,
        html: `
        ${radioHead("ms-label-cheading", STRINGS_T.panelCustomHeadingTitle, "customHeading")}
        <div class="ms-swatches" role="radiogroup" aria-labelledby="ms-label-cheading" data-option="customHeading"></div>
        <input type="color" class="ms-color-input" data-picker="customHeading">`
      },
      customBg: {
        wide: true,
        html: `
        ${radioHead("ms-label-cbg", STRINGS_T.panelCustomBgTitle, "customBg")}
        <div class="ms-swatches" role="radiogroup" aria-labelledby="ms-label-cbg" data-option="customBg"></div>
        <input type="color" class="ms-color-input" data-picker="customBg">
        <p class="ms-a11y-warn" role="status" aria-atomic="true" data-contrast-warn></p>`
      },
      dyslexiaFont: {
        html: switchTile({
          option: "dyslexiaFont",
          title: STRINGS_T.panelDyslexiaTitle,
          label: STRINGS_T.panelDyslexiaLabel,
          desc: STRINGS_T.panelDyslexiaDesc,
          icon: svgIcon(
            '<path d="M4 19 10 5l6 14"/><path d="M6.5 14h7"/><path d="M19 9v10"/>'
          )
        })
      },
      readingRuler: {
        html: switchTile({
          option: "readingRuler",
          title: STRINGS_T.panelRulerTitle,
          label: STRINGS_T.panelRulerTitle,
          desc: STRINGS_T.panelRulerDesc,
          icon: svgIcon(
            '<path d="M4 8h16"/><rect x="4" y="11" width="16" height="3" rx="1" fill="currentColor"/><path d="M4 18h16"/>'
          )
        })
      },
      speak: {
        html: `<button type="button" class="ms-btn-ouvir ms-tile" data-action="speak" aria-label="${STRINGS_T.panelVoiceLabel}"><span class="ms-tile-icon" aria-hidden="true">${svgIcon('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>')}</span><span class="ms-tile-label" data-speak-text>${STRINGS_T.panelVoiceButton}</span></button>`
      },
      // F10e: aparece só enquanto o "Ouvir" lê; alterna Pausar/Continuar (display:none via JS: .ms-tile é flex)
      pause: {
        html: `<button type="button" class="ms-tile" data-action="pause" hidden style="display:none" aria-label="${STRINGS_T.panelPauseLabel}"><span class="ms-tile-icon" aria-hidden="true">${svgIcon('<path d="M8 5v14"/><path d="M16 5v14"/>')}</span><span class="ms-tile-label" data-pause-text>${STRINGS_T.panelPause}</span></button>`
      },
      // T211: aviso quando a leitura falha / não há voz (região viva sempre presente; o texto entra e sai)
      speechNotice: {
        html: `<p class="ms-a11y-block--span ms-a11y-control-state" data-speech-notice role="status" aria-live="polite" style="margin:0"></p>`
      },
      readFocus: {
        html: switchTile({
          option: "readFocus",
          title: STRINGS_T.panelReadFocusTitle,
          label: STRINGS_T.panelReadFocusTitle,
          desc: STRINGS_T.panelReadFocusDesc,
          icon: svgIcon(
            '<path d="M5 4v14l4-3.5 2.5 5 2.5-1-2.5-5H16z"/><path d="M17.5 5.5a4 4 0 0 1 0 5"/>'
          )
        })
      },
      highlightLinks: {
        html: switchTile({
          option: "highlightLinks",
          title: STRINGS_T.panelHighlightLinks,
          label: STRINGS_T.panelHighlightLinks,
          icon: svgIcon(
            '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
          )
        })
      },
      highlightHeadings: {
        html: switchTile({
          option: "highlightHeadings",
          title: STRINGS_T.panelHighlightHeadings,
          label: STRINGS_T.panelHighlightHeadings,
          icon: svgIcon(
            '<path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/>'
          )
        })
      },
      highlightControls: {
        html: switchTile({
          option: "highlightControls",
          title: STRINGS_T.panelHighlightControls,
          label: STRINGS_T.panelHighlightControls,
          icon: svgIcon(
            '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M8 12h8"/>'
          )
        })
      },
      enlargeTargets: {
        html: switchTile({
          option: "enlargeTargets",
          title: STRINGS_T.panelEnlargeTargets,
          label: STRINGS_T.panelEnlargeTargets,
          icon: svgIcon(
            '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 15l6-6"/><path d="M10 9h5v5"/>'
          )
        })
      },
      textMagnifier: {
        html: switchTile({
          option: "textMagnifier",
          title: STRINGS_T.panelTextMagnifier,
          label: STRINGS_T.panelTextMagnifier,
          icon: svgIcon(
            '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/><path d="M8 10h4"/>'
          )
        })
      },
      // F9c: ação de sessão (abre um diálogo), não é opção persistida
      pageOutline: {
        html: `<button type="button" class="ms-tile" data-action="page-outline" aria-haspopup="dialog"><span class="ms-tile-icon" aria-hidden="true">${svgIcon('<path d="M4 6h16"/><path d="M8 12h12"/><path d="M12 18h8"/>')}</span><span class="ms-tile-label">${STRINGS_T.panelPageOutline}</span></button>`
      },
      // F9d: ação de sessão (fecha o painel e abre a grade), não é opção persistida
      mouseGrid: {
        html: `<button type="button" class="ms-tile" data-action="mouse-grid"><span class="ms-tile-icon" aria-hidden="true">${svgIcon('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/>')}</span><span class="ms-tile-label">${STRINGS_T.panelMouseGrid}</span></button>`
      },
      // F9e: ação de sessão (fecha o painel e abre o teclado), não é opção persistida
      virtualKeyboard: {
        html: `<button type="button" class="ms-tile" data-action="virtual-keyboard"><span class="ms-tile-icon" aria-hidden="true">${svgIcon('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>')}</span><span class="ms-tile-label">${STRINGS_T.panelVirtualKeyboard}</span></button>`
      },
      // Ocupa a linha inteira da grade (não é radiogroup, então não usa `wide`)
      typography: {
        html: `
        <div class="ms-a11y-block--span" role="group" aria-labelledby="ms-label-typo">
          <p id="ms-label-typo" class="ms-a11y-control-label">${STRINGS_T.panelTypoGroupLabel}</p>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-range-lineHeight">${STRINGS_T.panelLineHeightTitle}</label><span class="ms-a11y-control-state" data-state-for="lineHeight" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-range-lineHeight" data-range="lineHeight" min="0" step="1" value="0">
          </div>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-range-wordSpacing">${STRINGS_T.panelWordSpacingTitle}</label><span class="ms-a11y-control-state" data-state-for="wordSpacing" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-range-wordSpacing" data-range="wordSpacing" min="0" step="1" value="0">
          </div>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-range-letterSpacing">${STRINGS_T.panelLetterSpacingTitle}</label><span class="ms-a11y-control-state" data-state-for="letterSpacing" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-range-letterSpacing" data-range="letterSpacing" min="0" step="1" value="0">
          </div>
          <button type="button" class="ms-a11y-action ms-a11y-action--font" data-action="reset-font" aria-label="${STRINGS_T.panelResetFontLabel}">${STRINGS_T.panelResetFont}</button>
        </div>`
      },
      // F10b: Estúdio de Voz (ocupa a linha inteira; prefs em options.voice*)
      voiceStudio: {
        html: `
        <div class="ms-a11y-block--span" role="group" aria-labelledby="ms-label-voice">
          <p id="ms-label-voice" class="ms-a11y-control-label">${STRINGS_T.panelVoiceStudioTitle}</p>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-voice-name">${STRINGS_T.panelVoiceSelectLabel}</label></div>
            <select class="ms-range-input" id="ms-voice-name" data-voice="voiceName"></select>
          </div>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-voice-voiceRate">${STRINGS_T.panelVoiceRateLabel}</label><span class="ms-a11y-control-state" data-state-for="voiceRate" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-voice-voiceRate" data-voice="voiceRate">
          </div>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-voice-voicePitch">${STRINGS_T.panelVoicePitchLabel}</label><span class="ms-a11y-control-state" data-state-for="voicePitch" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-voice-voicePitch" data-voice="voicePitch">
          </div>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-voice-voiceVolume">${STRINGS_T.panelVoiceVolumeLabel}</label><span class="ms-a11y-control-state" data-state-for="voiceVolume" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-voice-voiceVolume" data-voice="voiceVolume">
          </div>
          <button type="button" class="ms-a11y-action ms-a11y-action--font" data-action="voice-all" aria-pressed="false" hidden style="display:none">${STRINGS_T.panelVoiceAll}</button>
          <p class="ms-a11y-control-state" data-voice-hint hidden>${STRINGS_T.panelVoiceMoreHint}</p>
          <p class="ms-a11y-control-state" data-speech-notice-studio hidden>${STRINGS_T.panelSpeechFailed}</p>
          <p class="ms-a11y-control-state" data-voice-note hidden>${STRINGS_T.panelVoiceUnsupported}</p>
          <button type="button" class="ms-a11y-action ms-a11y-action--font" data-action="voice-test" aria-label="${STRINGS_T.panelVoiceTestLabel}">${STRINGS_T.panelVoiceTest}</button>
          <button type="button" class="ms-a11y-action ms-a11y-action--font" data-action="voice-reset" aria-label="${STRINGS_T.panelVoiceResetLabel}">${STRINGS_T.panelVoiceReset}</button>
        </div>`
      },
      // F10e: interruptor próprio (fluxo com avisos no JS) + linha de status/revogar/lista de comandos
      voiceCommands: {
        html: switchTile({
          option: "voiceCommands",
          title: STRINGS_T.panelVcTitle,
          label: STRINGS_T.panelVcLabel,
          desc: STRINGS_T.panelVcDesc,
          icon: svgIcon(
            '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>'
          )
        })
      },
      voiceCommandsMore: {
        html: `
        <div class="ms-a11y-block--span">
          <p class="ms-a11y-control-state" data-vc-status role="status" aria-live="polite"></p>
          <button type="button" class="ms-a11y-action ms-a11y-action--font" data-action="vc-revoke" hidden style="display:none" aria-label="${STRINGS_T.panelVcRevokeLabel}">${STRINGS_T.panelVcRevoke}</button>
          <button type="button" class="ms-a11y-action ms-a11y-action--font" data-action="vc-commands" aria-expanded="false" aria-controls="ms-vc-commands">${STRINGS_T.panelVcShow}</button>
          <ul class="ms-a11y-control-state" id="ms-vc-commands" data-vc-list hidden></ul>
        </div>`
      },
      textSpacing: {
        html: switchTile({
          option: "textSpacing",
          title: STRINGS_T.panelTextSpacing,
          label: STRINGS_T.panelTextSpacing,
          icon: svgIcon(
            '<path d="M4 4v16"/><path d="M20 4v16"/><path d="m8 12h8"/><path d="m10 9-3 3 3 3"/><path d="m14 9 3 3-3 3"/>'
          )
        })
      },
      reducedMotion: {
        html: switchTile({
          option: "reducedMotion",
          title: STRINGS_T.panelReducedMotion,
          label: STRINGS_T.panelReducedMotion,
          icon: svgIcon(
            '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>'
          )
        })
      },
      strongFocus: {
        html: switchTile({
          option: "strongFocus",
          title: STRINGS_T.panelStrongFocusTitle,
          label: STRINGS_T.panelStrongFocusTitle,
          desc: STRINGS_T.panelStrongFocusDesc,
          icon: svgIcon(
            '<rect x="4" y="6" width="16" height="12" rx="2"/><rect x="1.5" y="3.5" width="21" height="17" rx="3.5"/>'
          )
        })
      },
      showShortcuts: {
        html: switchTile({
          option: "showShortcuts",
          title: STRINGS_T.panelShortcutsTitle,
          label: STRINGS_T.panelShortcutsTitle,
          desc: STRINGS_T.panelShortcutsDesc,
          icon: svgIcon(
            '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'
          )
        })
      },
      blockFlashing: {
        html: switchTile({
          option: "blockFlashing",
          title: STRINGS_T.panelBlockFlashingTitle,
          label: STRINGS_T.panelBlockFlashingTitle,
          desc: STRINGS_T.panelBlockFlashingDesc,
          icon: svgIcon('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>')
        })
      },
      muteMedia: {
        html: switchTile({
          option: "muteMedia",
          title: STRINGS_T.panelMuteMediaTitle,
          label: STRINGS_T.panelMuteMediaTitle,
          desc: STRINGS_T.panelMuteMediaDesc,
          icon: svgIcon(
            '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6"/><path d="m21 9-5 6"/>'
          )
        })
      },
      hideImages: {
        html: switchTile({
          option: "hideImages",
          title: STRINGS_T.panelHideImages,
          label: STRINGS_T.panelHideImages,
          desc: STRINGS_T.panelHideImagesHint,
          icon: svgIcon(
            '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/>'
          )
        })
      }
    };
    SECTIONS = [
      {
        id: "text",
        title: STRINGS_T.sectionTextTitle,
        icon: svgIcon(
          '<path d="M5 7V5h14v2"/><path d="M12 5v14"/><path d="M9 19h6"/>'
        ),
        controls: [
          "language",
          "textScale",
          "dyslexiaFont",
          "textSpacing",
          "readingRuler",
          "speak",
          "pause",
          "speechNotice",
          "readFocus",
          "voiceStudio",
          "voiceCommands",
          "voiceCommandsMore",
          "typography"
        ]
      },
      {
        id: "colors",
        title: STRINGS_T.sectionColorsTitle,
        icon: svgIcon(
          '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>'
        ),
        controls: [
          "colorTheme",
          "colorSaturation",
          "customText",
          "customHeading",
          "customBg",
          "cursorStyle",
          "highlightLinks"
        ]
      },
      {
        id: "pageTools",
        title: STRINGS_T.sectionPageToolsTitle,
        icon: svgIcon(
          '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 14h8"/>'
        ),
        controls: [
          "highlightHeadings",
          "highlightControls",
          "enlargeTargets",
          "textMagnifier",
          "pageOutline",
          "mouseGrid",
          "virtualKeyboard"
        ]
      },
      {
        id: "motion",
        title: STRINGS_T.sectionMotionTitle,
        icon: svgIcon(
          '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/>'
        ),
        controls: ["reducedMotion", "blockFlashing", "muteMedia", "hideImages"]
      },
      {
        id: "keyboard",
        title: STRINGS_T.sectionKeyboardTitle,
        icon: svgIcon(
          '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'
        ),
        controls: ["strongFocus", "showShortcuts"]
      }
    ];
  }
  function buildProfiles() {
    const el2 = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    };
    const sec = el2("section", "ms-a11y-profiles");
    sec.setAttribute("aria-labelledby", "ms-profiles-title");
    const h = el2(
      "h3",
      "ms-a11y-section-title ms-profiles-title",
      STRINGS_T.profilesTitle
    );
    h.id = "ms-profiles-title";
    const list = el2("div", "ms-profile-list");
    for (const p of PROFILES) {
      const b = el2("button", "ms-profile");
      b.type = "button";
      b.setAttribute("data-profile", p.id);
      b.setAttribute("aria-pressed", "false");
      b.appendChild(el2("span", "ms-profile-name", STRINGS_T["profile" + p.key + "Name"]));
      b.appendChild(el2("span", "ms-profile-desc", STRINGS_T["profile" + p.key + "Desc"]));
      const custom = el2("span", "ms-profile-custom", STRINGS_T.profileCustom);
      custom.hidden = true;
      b.appendChild(custom);
      list.appendChild(b);
    }
    sec.appendChild(h);
    sec.appendChild(el2("p", "ms-profiles-hint", STRINGS_T.profilesHint));
    sec.appendChild(list);
    return sec;
  }
  function renderSection(sec, index) {
    const open = index === 0;
    const blocks = sec.controls.map(
      (k) => CONTROLS[k].wide ? `<div class="ms-a11y-block ms-a11y-block--wide">${CONTROLS[k].html}</div>` : CONTROLS[k].html
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
          aria-labelledby="ms-sec-${sec.id}-btn"${open ? "" : " hidden"}>
          <div class="ms-a11y-grid">${blocks.join("")}
          </div>
        </div>
      </section>`;
  }
  function createA11yPanel({
    state: state2,
    onClose,
    onToggleModoSimples,
    onSetOption,
    onSpeak,
    onResetAll,
    onResetFont,
    onSelectProfile,
    onMoveSide,
    onOutlineJump,
    onOpenMouseGrid,
    onOpenVirtualKeyboard,
    brand
  }) {
    refreshTexts();
    const texts = { ...DEFAULT_BRAND, ...brand };
    const panel = document.createElement("div");
    panel.id = "ms-a11y-panel";
    panel.className = "ms-a11y-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "ms-a11y-title");
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
      <button type="button" class="ms-a11y-close" aria-label="${STRINGS_T.panelCloseLabel}">
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
            <strong>${STRINGS_T.panelSimpleTitle}</strong>
            <p>${STRINGS_T.panelSimpleDesc}</p>
          </div>
          <button type="button" class="ms-switch" role="switch" aria-checked="false"
            data-action="modo-simples" aria-label="${STRINGS_T.panelSimpleSwitchLabel}">
            <span class="ms-switch-thumb"></span>
          </button>
        </div>
      </div>
      ${SECTIONS.map(renderSection).join("")}

      <div class="ms-a11y-actions">
        <button type="button" class="ms-a11y-action" data-action="reset-all">${STRINGS_T.panelResetLabel}</button>
        <button type="button" class="ms-a11y-action" data-action="move-side">${STRINGS_T.panelMoveToLeft}</button>
      </div>

      <div class="ms-a11y-live" aria-live="polite" aria-atomic="true"></div>
      <p class="ms-a11y-footer-note"></p>
    </div>
  `;
    const setText = (selector, text) => {
      const el2 = panel.querySelector(selector);
      el2.textContent = text;
      el2.hidden = !text;
    };
    setText("#ms-a11y-title", texts.title || DEFAULT_BRAND.title);
    setText(".ms-a11y-subtitle", texts.subtitle);
    setText(".ms-a11y-footer-note", texts.footer);
    const radioBtn = (cls, value, label2) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.className = cls;
      b.setAttribute("data-value", value);
      b.setAttribute("aria-label", label2);
      return b;
    };
    const satGroup = panel.querySelector('[data-option="colorSaturation"]');
    SATURATIONS.forEach((s) => {
      const b = radioBtn(
        "ms-segment",
        s.value,
        `${STRINGS_T.panelSaturationTitle} ${s.label}`
      );
      b.textContent = s.label;
      satGroup.appendChild(b);
    });
    const cursorGroup = panel.querySelector('[data-option="cursorStyle"]');
    CURSORS.forEach((c) => {
      const b = radioBtn(
        "ms-segment",
        c.value,
        `${STRINGS_T.panelCursorTitle} ${c.label}`
      );
      b.textContent = c.label;
      cursorGroup.appendChild(b);
    });
    Object.entries(CUSTOM_COLORS2).forEach(([key, cfg]) => {
      const group = panel.querySelector(`[data-option="${key}"]`);
      const none = radioBtn(
        "ms-swatch ms-swatch--none",
        "",
        `${cfg.title}: ${STRINGS_T.panelCustomNone}`
      );
      none.title = STRINGS_T.panelCustomNone;
      group.appendChild(none);
      cfg.presets.forEach((hex) => {
        const b = radioBtn(
          "ms-swatch",
          hex,
          `${STRINGS_T.panelCustomSwatchLabel} ${hex} \u2014 ${cfg.title}`
        );
        b.style.backgroundColor = hex;
        b.title = hex;
        group.appendChild(b);
      });
      const other = radioBtn(
        "ms-swatch ms-swatch--custom",
        "x",
        `${cfg.title}: ${STRINGS_T.panelCustomOther}`
      );
      other.hidden = true;
      group.appendChild(other);
      panel.querySelector(`[data-picker="${key}"]`).setAttribute("aria-label", `${STRINGS_T.panelCustomPickerLabel} ${cfg.title}`);
    });
    let _releaseFocus = null;
    panel.querySelectorAll(".ms-a11y-section-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const open2 = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(open2));
        panel.querySelector(`#${btn.getAttribute("aria-controls")}`).hidden = !open2;
      });
    });
    panel.querySelector(".ms-a11y-close").addEventListener("click", () => onClose());
    panel.querySelector('[data-slot="profiles"]').appendChild(buildProfiles());
    panel.querySelectorAll("[data-profile]").forEach(
      (btn) => btn.addEventListener(
        "click",
        () => onSelectProfile == null ? void 0 : onSelectProfile(btn.getAttribute("data-profile"))
      )
    );
    panel.querySelector('[data-action="reset-all"]').addEventListener("click", () => onResetAll == null ? void 0 : onResetAll());
    panel.querySelector('[data-action="reset-font"]').addEventListener("click", () => onResetFont == null ? void 0 : onResetFont());
    const outline = createPageOutline({
      container: panel,
      onJump: (el2) => onOutlineJump == null ? void 0 : onOutlineJump(el2)
    });
    panel.querySelector('[data-action="mouse-grid"]').addEventListener("click", () => onOpenMouseGrid == null ? void 0 : onOpenMouseGrid());
    panel.querySelector('[data-action="virtual-keyboard"]').addEventListener("click", () => onOpenVirtualKeyboard == null ? void 0 : onOpenVirtualKeyboard());
    panel.querySelector('[data-action="page-outline"]').addEventListener("click", (e) => outline.open(e.currentTarget));
    TYPO_KEYS.forEach((key) => {
      const input = panel.querySelector(`[data-range="${key}"]`);
      input.max = String(typoIdx(key, TYPO_LIMITS[key].max));
      input.setAttribute("aria-valuetext", typoText(key, 0));
      input.addEventListener(
        "input",
        () => onSetOption(key, typoValue(key, Number(input.value)))
      );
    });
    const langSel = panel.querySelector("[data-language]");
    [
      [
        "auto",
        t("panelLanguageAuto", { lang: LANG_NAMES[resolveLocale("auto")] })
      ],
      ...Object.entries(LANG_NAMES)
    ].forEach(([value, label2]) => {
      const o = document.createElement("option");
      o.value = value;
      o.textContent = label2;
      if (value !== "auto") o.lang = BCP47[value];
      langSel.appendChild(o);
    });
    langSel.style.minHeight = "44px";
    langSel.addEventListener(
      "change",
      () => onSetOption("language", langSel.value)
    );
    const voiceSel = panel.querySelector('[data-voice="voiceName"]');
    const voiceSupported = isVoiceSupported();
    const voiceInput = (key) => panel.querySelector(`[data-voice="${key}"]`);
    const voiceFromDom = () => ({
      voiceName: voiceSel.value,
      voiceRate: Number(voiceInput("voiceRate").value),
      voicePitch: Number(voiceInput("voicePitch").value),
      voiceVolume: Number(voiceInput("voiceVolume").value)
    });
    voiceSel.style.minHeight = "44px";
    VOICE_SLIDERS.forEach(([key]) => {
      const input = voiceInput(key);
      const lim = VOICE_LIMITS[VOICE_LIMIT_OF[key]];
      input.min = String(lim.min);
      input.max = String(lim.max);
      input.step = String(lim.step);
      input.value = String(VOICE_DEFAULTS[key]);
      input.setAttribute("aria-valuetext", voiceText(key, VOICE_DEFAULTS[key]));
      input.addEventListener(
        "input",
        () => onSetOption(key, Number(input.value))
      );
    });
    voiceSel.addEventListener(
      "change",
      () => onSetOption("voiceName", voiceSel.value)
    );
    let voiceName = "";
    const voiceAllBtn = panel.querySelector('[data-action="voice-all"]');
    const voiceHint = panel.querySelector("[data-voice-hint]");
    let showAllVoices = false;
    voiceAllBtn.addEventListener("click", () => {
      showAllVoices = !showAllVoices;
      fillVoices(voiceName);
    });
    let voicesSig = null;
    const isVoiceSelFocused = () => {
      var _a;
      return ((_a = panel.getRootNode) == null ? void 0 : _a.call(panel).activeElement) === voiceSel;
    };
    const fillVoices = (selected) => {
      let voices = [];
      try {
        voices = voiceSupported ? listVoices() : [];
      } catch (e) {
      }
      const loc = getLocale();
      const isPt = (v) => new RegExp(`^${loc}([-_]|$)`, "i").test(v.lang || "");
      const pt = voices.filter(isPt);
      const hasOthers = voices.length > pt.length;
      voiceAllBtn.hidden = !hasOthers && pt.length === collapseVoices(pt).length;
      voiceAllBtn.style.display = voiceAllBtn.hidden ? "none" : "";
      voiceAllBtn.setAttribute("aria-pressed", String(showAllVoices));
      let items;
      let groups = null;
      let hidden = 0;
      if (showAllVoices) {
        groups = groupVoicesByLang(voices);
        items = groups.flatMap((g) => g.voices);
      } else {
        items = collapseVoices(pt);
        hidden = pt.length - items.length;
        const saved = selected && voices.find((v) => v.name === selected);
        if (saved && !items.includes(saved)) items = [...items, saved];
      }
      voiceHint.hidden = hidden <= 0;
      voices = items;
      const sig = `${showAllVoices}|${hidden}|${voices.map((v) => `${v.name}|${v.lang}`).join("\n")}`;
      if (sig === voicesSig) {
        if (!isVoiceSelFocused() && voiceSel.value !== (selected || "")) {
          voiceSel.value = selected || "";
        }
        return;
      }
      if (isVoiceSelFocused()) return;
      voicesSig = sig;
      voiceSel.textContent = "";
      const auto = document.createElement("option");
      auto.value = "";
      auto.textContent = STRINGS_T.panelVoiceAuto;
      voiceSel.appendChild(auto);
      const optionOf = (v) => {
        const o = document.createElement("option");
        o.value = v.name;
        o.textContent = `${v.name} (${v.lang})`;
        return o;
      };
      if (groups) {
        groups.forEach((g) => {
          const og = document.createElement("optgroup");
          og.label = g.label;
          g.voices.forEach((v) => og.appendChild(optionOf(v)));
          voiceSel.appendChild(og);
        });
      } else {
        voices.forEach((v) => voiceSel.appendChild(optionOf(v)));
      }
      voiceSel.value = selected || "";
    };
    fillVoices("");
    if (voiceSupported) onVoicesChanged(() => fillVoices(voiceName));
    panel.querySelector('[data-action="voice-test"]').addEventListener("click", () => {
      previewVoice(voiceFromDom());
      checkNoVoices();
    });
    const speechNotice = panel.querySelector("[data-speech-notice]");
    const studioNotice = panel.querySelector("[data-speech-notice-studio]");
    let speechFailed = false;
    let noVoices = false;
    let noticeOn = false;
    const renderSpeechNotice = () => {
      const on3 = speechFailed || noVoices;
      if (on3 === noticeOn) return;
      noticeOn = on3;
      speechNotice.textContent = on3 ? STRINGS_T.panelSpeechFailed : "";
      studioNotice.hidden = !on3;
    };
    function checkNoVoices() {
      if (!voiceSupported) return;
      hasNoVoices().then((n) => {
        noVoices = !!n;
        renderSpeechNotice();
      }).catch(() => {
      });
    }
    const speechFailedNow = () => {
      speechFailed = true;
      renderSpeechNotice();
    };
    onSpeakingChange((speaking, _paused2, reason) => {
      if (reason === "speech-failed") speechFailedNow();
      else if (speaking && speechFailed) {
        speechFailed = false;
        renderSpeechNotice();
      }
    });
    onSpeechError(speechFailedNow);
    checkNoVoices();
    panel.querySelector('[data-action="voice-reset"]').addEventListener(
      "click",
      () => Object.entries(VOICE_DEFAULTS).forEach(([k, v]) => onSetOption(k, v))
    );
    const setShown = (el2, on3) => {
      el2.hidden = !on3;
      el2.style.display = on3 ? "" : "none";
    };
    const pauseBtn = panel.querySelector('[data-action="pause"]');
    pauseBtn.addEventListener("click", () => {
      if (isPaused()) resumeSpeaking();
      else pauseSpeaking();
    });
    const vcSwitch = panel.querySelector('[data-option="voiceCommands"]');
    const vcStatus = panel.querySelector("[data-vc-status]");
    const vcRevoke = panel.querySelector('[data-action="vc-revoke"]');
    const vcToggleBtn = panel.querySelector('[data-action="vc-commands"]');
    const vcList = panel.querySelector("[data-vc-list]");
    STRINGS_T.panelVcCommands.split("|").forEach((c) => {
      const li = document.createElement("li");
      li.textContent = `\u201C${c}\u201D`;
      vcList.appendChild(li);
    });
    vcToggleBtn.addEventListener("click", () => {
      const open2 = vcToggleBtn.getAttribute("aria-expanded") !== "true";
      vcToggleBtn.setAttribute("aria-expanded", String(open2));
      vcToggleBtn.textContent = open2 ? STRINGS_T.panelVcHide : STRINGS_T.panelVcShow;
      vcList.hidden = !open2;
    });
    let recMode = null;
    let vcOn = false;
    let vcConsent = false;
    let vcCore = "";
    let vcUnsub = null;
    let vcBusy = false;
    let lastSync = null;
    const subscribeVoiceStatus = () => {
      const ms = globalThis.ModoSimples;
      if (vcUnsub || typeof (ms == null ? void 0 : ms.onVoiceStatus) !== "function") return;
      vcCore = ms.voiceStatus || "";
      vcUnsub = ms.onVoiceStatus((st) => {
        vcCore = st;
        renderVcStatus();
      });
    };
    if (!(globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition) || globalThis.isSecureContext === false) {
      recMode = "none";
    }
    const vcNoneText = () => getUnsupportedReason() === "brave" ? STRINGS_T.panelVcBrave : STRINGS_T.panelVcUnsupported;
    if (getUnsupportedReason()) recMode = "none";
    const VC_TEXT = {
      listening: STRINGS_T.panelVcListening,
      blocked: STRINGS_T.panelVcBlocked,
      "no-mic": STRINGS_T.panelVcNoMic,
      error: STRINGS_T.panelVcError,
      "needs-consent": STRINGS_T["status_needs-consent"],
      "needs-model": STRINGS_T["status_needs-model"]
    };
    const renderVcStatus = () => {
      if (recMode === "none") return;
      vcStatus.textContent = vcUnsub ? vcCore === "unsupported" ? vcNoneText() : VC_TEXT[vcCore] || "" : vcOn ? STRINGS_T.panelVcListening : "";
    };
    let dialogEl = null;
    const closeDialog = (refocus = true) => {
      if (!dialogEl) return;
      dialogEl.remove();
      dialogEl = null;
      [...panel.children].forEach((c) => c.removeAttribute("inert"));
      if (refocus) vcSwitch.focus();
    };
    const openDialog = ({ title, text, buttons }) => {
      if (dialogEl) {
        dialogEl.remove();
        dialogEl = null;
      }
      const el2 = document.createElement("div");
      el2.className = "ms-a11y-dialog";
      el2.setAttribute("role", "dialog");
      el2.setAttribute("aria-modal", "true");
      el2.setAttribute("aria-labelledby", "ms-vc-dlg-title");
      el2.setAttribute("aria-describedby", "ms-vc-dlg-text");
      Object.assign(el2.style, {
        position: "absolute",
        inset: "0",
        zIndex: "5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        boxSizing: "border-box",
        overflow: "auto",
        background: "rgba(11, 44, 95, 0.6)"
      });
      const card = document.createElement("div");
      Object.assign(card.style, {
        background: "#fff",
        color: "#1e293b",
        borderRadius: "12px",
        padding: "16px",
        width: "100%",
        maxHeight: "100%",
        overflow: "auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      });
      const h = document.createElement("h3");
      h.id = "ms-vc-dlg-title";
      h.textContent = title;
      Object.assign(h.style, { margin: "0", fontSize: "1.05em" });
      const p = document.createElement("p");
      p.id = "ms-vc-dlg-text";
      p.textContent = text;
      p.style.margin = "0";
      const live = document.createElement("p");
      live.setAttribute("role", "status");
      live.style.margin = "0";
      card.append(h, p, live);
      const btns = buttons.map((b) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ms-a11y-action";
        btn.textContent = b.label;
        btn.style.minHeight = "44px";
        btn.style.width = "100%";
        btn.addEventListener("click", () => {
          if (b.run) b.run({ live, btns });
          else closeDialog();
        });
        card.appendChild(btn);
        return btn;
      });
      el2.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        e.stopPropagation();
        closeDialog();
      });
      el2.appendChild(card);
      [...panel.children].forEach((c) => c.setAttribute("inert", ""));
      panel.appendChild(el2);
      dialogEl = el2;
      btns[0].focus();
      return el2;
    };
    const turnOn = () => {
      vcCore = "";
      renderVcStatus();
      onSetOption("voiceCommands", true);
    };
    const askCloud = (prefix = "") => {
      const me = openDialog({
        title: STRINGS_T.panelVcCloudTitle,
        text: `${prefix}${STRINGS_T.panelVcCloudText}`.trim(),
        buttons: [
          {
            label: STRINGS_T.panelVcCloudYes,
            run: () => {
              closeDialog();
              onSetOption("voiceCloudConsent", true);
              turnOn();
            }
          },
          { label: STRINGS_T.panelVcCloudNo }
        ]
      });
      return me;
    };
    const askDownload = () => {
      const me = openDialog({
        title: STRINGS_T.panelVcDownloadTitle,
        text: STRINGS_T.panelVcDownloadText,
        buttons: [
          {
            label: STRINGS_T.panelVcDownloadNow,
            run: ({ live, btns }) => {
              const p = installLocalModel();
              btns.forEach((b) => b.disabled = true);
              live.textContent = STRINGS_T.panelVcDownloading;
              p.then((ok) => {
                if (dialogEl !== me) return;
                if (ok) {
                  closeDialog();
                  turnOn();
                } else askCloud(`${STRINGS_T.panelVcDownloadFail} `);
              });
            }
          },
          { label: STRINGS_T.panelVcUseInternet, run: () => askCloud() },
          { label: STRINGS_T.panelVcNotNow }
        ]
      });
    };
    vcSwitch.addEventListener("click", async () => {
      if (vcOn) {
        onSetOption("voiceCommands", false);
        return;
      }
      if (vcBusy) return;
      vcBusy = true;
      let mode;
      try {
        mode = await getRecognitionMode();
      } finally {
        vcBusy = false;
      }
      recMode = mode;
      if (mode === "local" || mode === "cloud" && vcConsent) turnOn();
      else if (mode === "download") askDownload();
      else if (mode === "cloud") askCloud();
      else sync(...lastSync);
    });
    vcRevoke.addEventListener("click", () => {
      onSetOption("voiceCommands", false);
      onSetOption("voiceCloudConsent", false);
    });
    panel.querySelector('[data-action="move-side"]').addEventListener("click", () => onMoveSide == null ? void 0 : onMoveSide());
    function setSide(side) {
      panel.setAttribute("data-ms-side", side);
      panel.querySelector('[data-action="move-side"]').textContent = side === "left" ? STRINGS_T.panelMoveToRight : STRINGS_T.panelMoveToLeft;
    }
    panel.querySelector('[data-action="modo-simples"]').addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const next = btn.getAttribute("aria-checked") !== "true";
      onToggleModoSimples(next);
    });
    panel.querySelectorAll(".ms-segmented .ms-segment").forEach((btn) => {
      btn.addEventListener("click", () => {
        onSetOption(
          btn.closest("[data-option]").getAttribute("data-option"),
          btn.getAttribute("data-value")
        );
      });
    });
    panel.querySelectorAll(".ms-swatches .ms-swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        onSetOption(
          btn.closest("[data-option]").getAttribute("data-option"),
          btn.getAttribute("data-value")
        );
      });
    });
    panel.querySelectorAll(".ms-color-input").forEach((input) => {
      input.addEventListener("input", () => {
        onSetOption(input.getAttribute("data-picker"), input.value);
      });
    });
    panel.querySelectorAll(".ms-theme-grid .ms-theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        onSetOption("colorTheme", btn.getAttribute("data-value"));
      });
    });
    panel.querySelectorAll('[role="radiogroup"]').forEach((group) => {
      group.addEventListener("keydown", (e) => {
        const radios = [...group.querySelectorAll('[role="radio"]')].filter(
          (r) => !r.hidden
        );
        const i = radios.indexOf(e.target);
        if (i < 0) return;
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        let next;
        if (step) next = radios[(i + step + radios.length) % radios.length];
        else if (e.key === "Home") next = radios[0];
        else if (e.key === "End") next = radios[radios.length - 1];
        if (!next) return;
        e.preventDefault();
        next.focus();
        next.click();
      });
    });
    panel.querySelectorAll(".ms-switch[data-option]").forEach((btn) => {
      if (btn.getAttribute("data-option") === "voiceCommands") return;
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-option");
        const next = btn.getAttribute("aria-checked") !== "true";
        onSetOption(key, next);
      });
    });
    panel.querySelector('[data-action="speak"]').addEventListener("click", () => onSpeak());
    function sync(s, ui = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
      lastSync = [s, ui];
      const modoBtn = panel.querySelector('[data-action="modo-simples"]');
      if (modoBtn) {
        modoBtn.setAttribute("aria-checked", String(!!s.modoSimples));
        modoBtn.classList.toggle("ms-switch--on", !!s.modoSimples);
      }
      langSel.value = ((_a = s.options) == null ? void 0 : _a.language) || "auto";
      const scale = ((_b = s.options) == null ? void 0 : _b.textScale) || "100";
      panel.querySelectorAll('[data-option="textScale"] .ms-segment').forEach((btn) => {
        const on3 = btn.getAttribute("data-value") === scale;
        btn.setAttribute("aria-checked", String(on3));
        btn.setAttribute("tabindex", on3 ? "0" : "-1");
        btn.classList.toggle("ms-segment--on", on3);
      });
      const theme2 = ((_c = s.options) == null ? void 0 : _c.colorTheme) || "senac";
      panel.querySelectorAll('[data-option="colorTheme"] .ms-theme-btn').forEach((btn) => {
        const on3 = btn.getAttribute("data-value") === theme2;
        btn.setAttribute("aria-checked", String(on3));
        btn.setAttribute("tabindex", on3 ? "0" : "-1");
        btn.classList.toggle("ms-theme-btn--on", on3);
      });
      TYPO_KEYS.forEach((key) => {
        var _a2;
        const v = Number((_a2 = s.options) == null ? void 0 : _a2[key]) || 0;
        const input = panel.querySelector(`[data-range="${key}"]`);
        if (input) {
          input.value = String(typoIdx(key, v));
          input.setAttribute("aria-valuetext", typoText(key, v));
        }
        const st = panel.querySelector(`[data-state-for="${key}"]`);
        if (st) st.textContent = typoText(key, v);
      });
      const syncRadios = (selector, value) => {
        const radios = [...panel.querySelectorAll(selector)];
        const hit = radios.some((b) => b.getAttribute("data-value") === value);
        radios.forEach((btn, i) => {
          const on3 = btn.getAttribute("data-value") === value;
          btn.setAttribute("aria-checked", String(on3));
          btn.setAttribute("tabindex", on3 || !hit && i === 0 ? "0" : "-1");
          btn.classList.toggle(
            btn.classList.contains("ms-swatch") ? "ms-swatch--on" : "ms-segment--on",
            on3
          );
        });
      };
      const sat = ((_d = s.options) == null ? void 0 : _d.colorSaturation) || "normal";
      const cursor = ((_e = s.options) == null ? void 0 : _e.cursorStyle) || "default";
      syncRadios('[data-option="colorSaturation"] .ms-segment', sat);
      syncRadios('[data-option="cursorStyle"] .ms-segment', cursor);
      Object.keys(CUSTOM_COLORS2).forEach((key) => {
        var _a2;
        const val = ((_a2 = s.options) == null ? void 0 : _a2[key]) || "";
        const other = panel.querySelector(
          `[data-option="${key}"] .ms-swatch--custom`
        );
        if (other) {
          const isOther = !!val && !CUSTOM_COLORS2[key].presets.includes(val);
          other.hidden = !isOther;
          other.setAttribute("data-value", isOther ? val : "x");
          other.style.backgroundColor = isOther ? val : "";
          other.title = isOther ? val : "";
        }
        syncRadios(`[data-option="${key}"] .ms-swatch`, val);
        const input = panel.querySelector(`[data-picker="${key}"]`);
        if (input) input.value = val || "#000000";
        const st = panel.querySelector(`[data-state-for="${key}"]`);
        if (st) st.textContent = val || STRINGS_T.panelCustomNone;
      });
      const warn = panel.querySelector("[data-contrast-warn]");
      if (warn) {
        const eff = effectiveColors(s.options || {});
        const low = [
          [STRINGS_T.panelCustomTextTitle, eff.text],
          [STRINGS_T.panelCustomHeadingTitle, eff.heading]
        ].filter(([, c]) => c && eff.bg).map(([title, c]) => [title, contrastRatio(c, eff.bg)]).filter(([, r]) => r < 4.5);
        const bgLabel = ((_f = s.options) == null ? void 0 : _f.customBg) ? STRINGS_T.panelCustomBgTitle : STRINGS_T.panelAutoBgTitle;
        warn.textContent = low.map(
          ([title, r]) => `${STRINGS_T.panelContrastWarn} ${title} / ${bgLabel}: ${r.toFixed(1).replace(".", ",")}:1.`
        ).join(" ");
      }
      [
        "dyslexiaFont",
        "readingRuler",
        "highlightLinks",
        "highlightHeadings",
        "highlightControls",
        "enlargeTargets",
        "textMagnifier",
        "textSpacing",
        "reducedMotion",
        "hideImages",
        "readFocus",
        "muteMedia",
        "blockFlashing",
        "strongFocus",
        "showShortcuts",
        "voiceCommands"
      ].forEach((key) => {
        var _a2;
        const btn = panel.querySelector(`.ms-switch[data-option="${key}"]`);
        if (!btn) return;
        const on3 = !!((_a2 = s.options) == null ? void 0 : _a2[key]);
        btn.setAttribute("aria-checked", String(on3));
        btn.classList.toggle("ms-switch--on", on3);
        const st = btn.querySelector("[data-state]");
        if (st) st.textContent = on3 ? STRINGS_T.stateOn : STRINGS_T.stateOff;
        if (key === "readFocus" && !isFocusReaderSupported()) {
          btn.disabled = true;
          btn.setAttribute("title", STRINGS_T.panelReadFocusUnsupported);
          if (st) st.textContent = STRINGS_T.panelReadFocusUnsupportedState;
          const d = panel.querySelector("#ms-desc-readFocus");
          if (d) d.textContent = STRINGS_T.panelReadFocusUnsupported;
        }
      });
      voiceName = ((_g = s.options) == null ? void 0 : _g.voiceName) || "";
      fillVoices(voiceName);
      VOICE_SLIDERS.forEach(([key]) => {
        var _a2;
        const lim = VOICE_LIMITS[VOICE_LIMIT_OF[key]];
        const raw = Number((_a2 = s.options) == null ? void 0 : _a2[key]);
        const v = Number.isFinite(raw) ? Math.min(lim.max, Math.max(lim.min, raw)) : VOICE_DEFAULTS[key];
        const input = voiceInput(key);
        input.value = String(v);
        input.setAttribute("aria-valuetext", voiceText(key, v));
        panel.querySelector(`[data-state-for="${key}"]`).textContent = voiceText(
          key,
          v
        );
      });
      if (!voiceSupported) {
        panel.querySelectorAll('[data-voice], [data-action^="voice-"]').forEach((el2) => {
          el2.disabled = true;
          el2.setAttribute("title", STRINGS_T.panelVoiceUnsupported);
        });
        panel.querySelector("[data-voice-note]").hidden = false;
      }
      vcOn = !!((_h = s.options) == null ? void 0 : _h.voiceCommands);
      vcConsent = !!((_i = s.options) == null ? void 0 : _i.voiceCloudConsent);
      subscribeVoiceStatus();
      renderVcStatus();
      setShown(vcRevoke, vcConsent);
      if (recMode === "none") {
        vcSwitch.disabled = true;
        vcSwitch.setAttribute("title", vcNoneText());
        const st = vcSwitch.querySelector("[data-state]");
        if (st) st.textContent = STRINGS_T.panelReadFocusUnsupportedState;
        const d = panel.querySelector("#ms-desc-voiceCommands");
        if (d) d.textContent = vcNoneText();
        vcStatus.textContent = vcNoneText();
      }
      const reading = isReadingMain();
      setShown(pauseBtn, reading);
      if (reading) {
        const paused = isPaused();
        pauseBtn.querySelector("[data-pause-text]").textContent = paused ? STRINGS_T.panelResume : STRINGS_T.panelPause;
        pauseBtn.setAttribute(
          "aria-label",
          paused ? STRINGS_T.panelResumeLabel : STRINGS_T.panelPauseLabel
        );
      } else if (((_j = panel.getRootNode) == null ? void 0 : _j.call(panel).activeElement) === pauseBtn) {
        panel.querySelector('[data-action="speak"]').focus();
      }
      const setState = (key, text) => {
        const el2 = panel.querySelector(`[data-state-for="${key}"]`);
        if (el2) el2.textContent = text;
      };
      const curScale = TEXT_SCALES.find((x) => x.value === scale);
      setState(
        "textScale",
        curScale ? `${curScale.label} \xB7 ${curScale.title}` : `${scale}%`
      );
      setState(
        "colorTheme",
        (_l = (_k = COLOR_THEMES.find((x) => x.value === theme2)) == null ? void 0 : _k.label) != null ? _l : theme2
      );
      setState(
        "colorSaturation",
        (_n = (_m = SATURATIONS.find((x) => x.value === sat)) == null ? void 0 : _m.label) != null ? _n : sat
      );
      setState(
        "cursorStyle",
        (_p = (_o = CURSORS.find((x) => x.value === cursor)) == null ? void 0 : _o.label) != null ? _p : cursor
      );
      panel.querySelectorAll("[data-profile]").forEach((btn) => {
        const active = s.activeProfile === btn.getAttribute("data-profile");
        btn.setAttribute("aria-pressed", String(active));
        btn.classList.toggle("ms-profile--on", active);
        btn.querySelector(".ms-profile-custom").hidden = !(active && s.profileCustom);
      });
      const speakBtn = panel.querySelector('[data-action="speak"]');
      if (speakBtn && ui.speaking !== void 0) {
        speakBtn.querySelector("[data-speak-text]").textContent = ui.speaking ? STRINGS_T.panelVoiceStopButton : STRINGS_T.panelVoiceButton;
        speakBtn.setAttribute(
          "aria-label",
          ui.speaking ? STRINGS_T.panelVoiceStopLabel : STRINGS_T.panelVoiceLabel
        );
      }
    }
    function open() {
      panel.hidden = false;
      subscribeVoiceStatus();
      checkNoVoices();
      _releaseFocus = trapFocus(panel);
      const closeBtn = panel.querySelector(".ms-a11y-close");
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      outline.close({ restoreFocus: false });
      closeDialog(false);
      panel.hidden = true;
      if (_releaseFocus) {
        _releaseFocus();
        _releaseFocus = null;
      }
    }
    sync(state2);
    return {
      element: panel,
      open,
      close,
      sync,
      setSide,
      closeOutline: () => outline.close({ restoreFocus: false })
    };
  }

  // src/ui/sessionChrome.js
  var SLIDERS_ICON = `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="4" y1="12" x2="20" y2="12"/>
    <line x1="4" y1="18" x2="20" y2="18"/>
    <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
    <circle cx="14" cy="12" r="2" fill="currentColor" stroke="none"/>
    <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
  </svg>`;
  function createSessionChrome({
    onToggleModoSimples,
    onOpenPanel,
    onSpeak,
    onToggleSimpleLanguage,
    onToggleHideImages,
    mount = {}
  }) {
    const chrome = document.createElement("div");
    chrome.id = "ms-simples-chrome";
    chrome.className = "ms-simples-chrome";
    chrome.innerHTML = `
    <div class="ms-simples-chrome-inner">
      <button type="button" class="ms-chrome-icon" data-action="open-panel"
        aria-label="${STRINGS_T.sessionOpenPanelLabel}" title="${STRINGS_T.sessionOpenPanelTitle}">
        ${SLIDERS_ICON}
      </button>
      <div class="ms-simples-toggle-wrap" data-active="false">
        <span class="ms-simples-spark" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
        <div class="ms-simples-toggle-text">
          <strong>${STRINGS_T.sessionBrand}</strong>
          <span class="ms-simples-sub" data-sub>${STRINGS_T.sessionSubOff}</span>
        </div>
        <button type="button" class="ms-switch ms-chrome-switch" role="switch" aria-checked="false"
          data-action="toggle-simples" aria-label="${STRINGS_T.sessionSwitchLabel}">
          <span class="ms-switch-thumb"></span>
        </button>
      </div>
    </div>
  `;
    const bar = document.createElement("div");
    bar.id = "ms-session-bar";
    bar.className = "ms-session-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", STRINGS_T.sessionBarLabel);
    bar.innerHTML = `
    <div class="ms-session-bar-inner" data-state="off">
      <div class="ms-session-off">
        <p><span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span> ${STRINGS_T.sessionOffPrompt}</p>
        <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="activate">${STRINGS_T.sessionActivate}</button>
      </div>
      <div class="ms-session-on" hidden>
        <div class="ms-session-on-top">
          <div class="ms-session-on-title" tabindex="-1">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
            <strong>${STRINGS_T.sessionOnTitle}<span class="ms-sr-only">${STRINGS_T.sessionOnSrSuffix}</span></strong>
            <span class="ms-session-badge">${STRINGS_T.sessionBadge}</span>
          </div>
          <p class="ms-session-desc" data-session-desc>
            ${STRINGS_T.sessionDescSimple}
          </p>
        </div>
        <div class="ms-session-actions">
          <button type="button" class="ms-session-btn ms-session-btn--light" data-action="speak" aria-label="${STRINGS_T.sessionSpeakLabel}">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg></span> <span data-speak-label>${STRINGS_T.sessionSpeakText}</span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="lang" aria-pressed="false">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/></svg></span> <span class="ms-btn-pre">${STRINGS_T.sessionLangPre}</span>${STRINGS_T.sessionLangMain}<span class="ms-btn-post">: <span data-lang-label aria-hidden="true">${STRINGS_T.sessionLangOff}</span></span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="images" aria-pressed="false">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/></svg></span> ${STRINGS_T.sessionImages}<span class="ms-btn-post">: <span data-images-label aria-hidden="true">${STRINGS_T.sessionImagesHidden}</span></span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--light" data-action="exit">${STRINGS_T.sessionExit}<span class="ms-btn-post">${STRINGS_T.sessionExitPost}</span></button>
        </div>
      </div>
    </div>
  `;
    _mountChrome(chrome, mount);
    _mountBar(bar, mount);
    chrome.querySelector('[data-action="toggle-simples"]').addEventListener("click", (e) => {
      const on3 = e.currentTarget.getAttribute("aria-checked") !== "true";
      onToggleModoSimples(on3);
    });
    chrome.querySelector('[data-action="open-panel"]').addEventListener("click", () => onOpenPanel());
    const focusIn = (selector) => {
      const el2 = bar.querySelector(selector);
      if (el2 && typeof el2.focus === "function") el2.focus();
    };
    bar.querySelector('[data-action="activate"]').addEventListener("click", () => {
      onToggleModoSimples(true);
      focusIn(".ms-session-on-title");
    });
    bar.querySelector('[data-action="exit"]').addEventListener("click", () => {
      onToggleModoSimples(false);
      focusIn('[data-action="activate"]');
    });
    bar.querySelector('[data-action="speak"]').addEventListener("click", () => onSpeak());
    bar.querySelector('[data-action="lang"]').addEventListener("click", (e) => {
      if (e.currentTarget.getAttribute("aria-disabled") === "true") return;
      const next = e.currentTarget.getAttribute("aria-pressed") !== "true";
      onToggleSimpleLanguage(next);
    });
    bar.querySelector('[data-action="images"]').addEventListener("click", (e) => {
      const showing = e.currentTarget.getAttribute("aria-pressed") === "true";
      const nextShow = !showing;
      if (typeof onToggleHideImages === "function") {
        onToggleHideImages(!nextShow);
      }
    });
    function sync(s, ui = {}) {
      var _a, _b;
      const on3 = !!s.modoSimples;
      const sw = chrome.querySelector('[data-action="toggle-simples"]');
      const wrap = chrome.querySelector(".ms-simples-toggle-wrap");
      const sub = chrome.querySelector("[data-sub]");
      if (sw) {
        sw.setAttribute("aria-checked", String(on3));
        sw.classList.toggle("ms-switch--on", on3);
      }
      if (wrap) wrap.setAttribute("data-active", String(on3));
      if (sub) sub.textContent = on3 ? STRINGS_T.sessionSubOn : STRINGS_T.sessionSubOff;
      _placeChrome(chrome, on3, mount);
      const inner = bar.querySelector(".ms-session-bar-inner");
      const off = bar.querySelector(".ms-session-off");
      const onBlock = bar.querySelector(".ms-session-on");
      if (inner) inner.setAttribute("data-state", on3 ? "on" : "off");
      if (off) off.hidden = on3;
      if (onBlock) onBlock.hidden = !on3;
      const langAvailable = hasSimpleLanguagePairs();
      const langOn = langAvailable && !!((_a = s.options) == null ? void 0 : _a.simpleLanguage);
      const langBtn = bar.querySelector('[data-action="lang"]');
      const langLabel = bar.querySelector("[data-lang-label]");
      const desc = bar.querySelector("[data-session-desc]");
      if (langBtn) {
        langBtn.setAttribute("aria-pressed", String(langOn));
        langBtn.setAttribute("aria-disabled", String(!langAvailable));
        langBtn.classList.toggle("ms-session-btn--active", langOn);
      }
      if (langLabel) {
        langLabel.setAttribute("aria-hidden", String(langAvailable));
        langLabel.textContent = !langAvailable ? STRINGS_T.sessionLangUnavailable : langOn ? STRINGS_T.sessionLangOn : STRINGS_T.sessionLangOff;
      }
      if (desc) {
        desc.textContent = langOn ? STRINGS_T.sessionDescSimple : STRINGS_T.sessionDescCalm;
      }
      const hideImgs = !!((_b = s.options) == null ? void 0 : _b.hideImages);
      const imgBtn = bar.querySelector('[data-action="images"]');
      const imgLabel = bar.querySelector("[data-images-label]");
      if (imgBtn) {
        imgBtn.setAttribute("aria-pressed", String(!hideImgs));
        imgBtn.classList.toggle("ms-session-btn--active", !hideImgs);
      }
      if (imgLabel)
        imgLabel.textContent = hideImgs ? STRINGS_T.sessionImagesHidden : STRINGS_T.sessionImagesVisible;
      if (ui.speaking !== void 0) {
        const speakBtn = bar.querySelector('[data-action="speak"]');
        const speakLabel = bar.querySelector("[data-speak-label]");
        if (speakBtn) {
          speakBtn.classList.toggle("ms-session-btn--speaking", ui.speaking);
          speakBtn.setAttribute(
            "aria-label",
            ui.speaking ? STRINGS_T.sessionStopLabel : STRINGS_T.sessionSpeakLabel
          );
        }
        if (speakLabel)
          speakLabel.textContent = ui.speaking ? STRINGS_T.sessionStopText : STRINGS_T.sessionSpeakText;
      }
    }
    function destroy() {
      chrome.remove();
      bar.remove();
    }
    return { sync, destroy };
  }
  function _resolve(selectors) {
    const list = Array.isArray(selectors) ? selectors : selectors ? [selectors] : [];
    for (const sel of list) {
      try {
        const el2 = document.querySelector(sel);
        if (el2) return el2;
      } catch (_) {
      }
    }
    return null;
  }
  function _moveChrome(chrome, parent, first = false) {
    if (chrome.parentElement === parent && (!first || parent.children[0] === chrome)) {
      return;
    }
    const focused = chrome.contains(document.activeElement) ? document.activeElement : null;
    if (first) parent.prepend(chrome);
    else parent.appendChild(chrome);
    if (!focused) return;
    focused.focus();
    if (document.activeElement !== focused && typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => focused.focus());
    }
  }
  function _mountChrome(chrome, mount) {
    chrome.classList.remove(
      "ms-simples-chrome--ms-nav",
      "ms-simples-chrome--fixed"
    );
    const host = _resolve(mount == null ? void 0 : mount.chrome);
    if (host) {
      _moveChrome(chrome, host);
    } else {
      chrome.classList.add("ms-simples-chrome--fixed");
      _moveChrome(chrome, document.body);
    }
  }
  function _placeChrome(chrome, modoOn, mount) {
    if (!modoOn) {
      _mountChrome(chrome, mount);
      return;
    }
    chrome.classList.remove("ms-simples-chrome--fixed");
    chrome.classList.add("ms-simples-chrome--ms-nav");
    const pillsNav = document.querySelector("[data-ms-pills]");
    if (pillsNav) {
      _moveChrome(chrome, pillsNav, true);
      return;
    }
    const barOnActions = document.querySelector(
      "#ms-session-bar .ms-session-actions"
    );
    if (barOnActions) {
      _moveChrome(chrome, barOnActions);
      return;
    }
    const barInner = document.querySelector(
      "#ms-session-bar .ms-session-bar-inner"
    );
    if (barInner) {
      _moveChrome(chrome, barInner);
      return;
    }
    chrome.classList.add("ms-simples-chrome--fixed");
    _moveChrome(chrome, document.body);
  }
  function _mountBar(bar, mount) {
    const anchor = _resolve(mount == null ? void 0 : mount.bar);
    if (anchor) {
      anchor.insertAdjacentElement("afterend", bar);
      const pills = document.querySelector("[data-ms-pills]");
      if (pills && bar.nextElementSibling !== pills) {
        bar.insertAdjacentElement("afterend", pills);
      }
      return;
    }
    document.body.prepend(bar);
  }

  // src/features/simpleNav.js
  var SAFE_SCHEMES = ["http", "https", "mailto", "tel"];
  function isSafeHref(href) {
    const compact = String(href).replace(/[\u0000- \u007f-\u009f]/g, "");
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(compact);
    return !scheme || SAFE_SCHEMES.includes(scheme[1].toLowerCase());
  }
  function normalizeSimpleNav(items) {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      var _a, _b;
      if (!item || typeof item !== "object") return null;
      const label2 = String((_a = item.label) != null ? _a : "").trim();
      const href = String((_b = item.href) != null ? _b : "").trim();
      if (!label2 || !href || !isSafeHref(href)) return null;
      const short = item.short != null && String(item.short).trim() ? String(item.short).trim() : void 0;
      return short ? { label: label2, href, short } : { label: label2, href };
    }).filter(Boolean);
  }
  function findHostAuthoredPills() {
    const all = document.querySelectorAll("[data-ms-pills]");
    for (const el2 of all) {
      if (!el2.hasAttribute("data-ms-injected")) return el2;
    }
    return null;
  }
  function createSimpleNav() {
    let nav = null;
    function sync(items) {
      const list = normalizeSimpleNav(items);
      if (findHostAuthoredPills()) {
        destroy();
        return;
      }
      if (!list.length) {
        destroy();
        return;
      }
      if (!nav) {
        nav = document.createElement("nav");
        nav.className = "ms-pills-nav ms-simple-only";
        nav.setAttribute("data-ms-pills", "");
        nav.setAttribute("data-ms-injected", "");
        nav.setAttribute("aria-label", t("simpleNavLabel"));
        const inner2 = document.createElement("div");
        inner2.className = "ms-pills-nav__inner";
        nav.appendChild(inner2);
        _mount(nav);
      }
      const inner = nav.querySelector(".ms-pills-nav__inner");
      if (!inner) return;
      const chrome = inner.querySelector("#ms-simples-chrome");
      if (chrome) chrome.remove();
      inner.innerHTML = "";
      for (const item of list) {
        const a = document.createElement("a");
        a.className = "ms-pill";
        a.setAttribute("href", item.href);
        a.href = item.href;
        if (item.short) {
          const full = document.createElement("span");
          full.className = "ms-pill__full";
          full.textContent = item.label;
          const short = document.createElement("span");
          short.className = "ms-pill__short";
          short.textContent = item.short;
          a.appendChild(full);
          a.appendChild(short);
        } else {
          a.textContent = item.label;
        }
        inner.appendChild(a);
      }
      if (chrome) inner.appendChild(chrome);
      _markCurrent(nav);
    }
    function destroy() {
      if (!nav) return;
      nav.remove();
      nav = null;
    }
    return { sync, destroy };
  }
  function _mount(nav) {
    const bar = document.getElementById("ms-session-bar");
    if (bar) {
      bar.insertAdjacentElement("afterend", nav);
      return;
    }
    const header = document.querySelector("header");
    if (header) {
      header.insertAdjacentElement("afterend", nav);
      return;
    }
    const chrome = document.getElementById("ms-simples-chrome");
    if (chrome) {
      chrome.insertAdjacentElement("afterend", nav);
      return;
    }
    document.body.prepend(nav);
  }
  function _markCurrent(nav) {
    const path = typeof location !== "undefined" && location.pathname || "";
    const file = path.split("/").pop() || "";
    const hrefFull = typeof location !== "undefined" && location.href || "";
    nav.querySelectorAll("a.ms-pill").forEach((a) => {
      a.removeAttribute("aria-current");
      const href = a.getAttribute("href") || "";
      if (!href || href === "#") return;
      try {
        const resolved = typeof location !== "undefined" ? new URL(href, location.href) : null;
        const match2 = resolved && resolved.href === hrefFull || href === file || href.endsWith("/" + file) || file && href.split("/").pop() === file;
        if (match2) a.setAttribute("aria-current", "page");
      } catch (_) {
        if (href === file) a.setAttribute("aria-current", "page");
      }
    });
  }

  // src/features/manualSelect.js
  var BANNER_ID = "ms-manual-select-banner";
  var HIGHLIGHT_ID = "ms-manual-select-highlight";
  var OVERLAY_CLASS = "ms-manual-select-active";
  var NOTICE_ID = "ms-low-confidence-notice";
  var CANDIDATE_SELECTOR = 'main, [role="main"], article, section, aside, div';
  var MIN_W = 120;
  var MIN_H = 60;
  var _noticePrev = null;
  var _banner = null;
  var _status = null;
  var _highlight = null;
  var _current = null;
  var _prevFocus = null;
  var _cancel = null;
  var _onClick = null;
  var _onKey = null;
  var _onPointer = null;
  var _onTouch = null;
  var _onOver = null;
  var _callbacks = null;
  var POINTER_EVENTS = [
    "pointerdown",
    "pointerup",
    "mousedown",
    "mouseup",
    "contextmenu"
  ];
  var TOUCH_EVENTS = ["touchstart", "touchend"];
  function escapeIdent(value) {
    if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(value);
    return String(value).replace(/([^\w-])/g, "\\$1");
  }
  function buildCssPath(el2) {
    if (!el2 || el2.nodeType !== 1) return "";
    if (el2.id) {
      return `#${escapeIdent(el2.id)}`;
    }
    const parts = [];
    let current3 = el2;
    const root = typeof document !== "undefined" ? document.documentElement : null;
    while (current3 && current3.nodeType === 1 && current3 !== root) {
      let part = current3.tagName.toLowerCase();
      if (current3.id) {
        parts.unshift(`#${escapeIdent(current3.id)}`);
        break;
      }
      const parent = current3.parentElement;
      if (parent && parent.children) {
        const siblings = Array.from(parent.children).filter(
          (c) => c.tagName === current3.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(current3) + 1;
          part += `:nth-of-type(${index})`;
        }
      }
      parts.unshift(part);
      current3 = parent;
    }
    return parts.join(" > ");
  }
  function deepActiveElement() {
    var _a;
    let active = document.activeElement;
    while ((_a = active == null ? void 0 : active.shadowRoot) == null ? void 0 : _a.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }
  function isOwnUi(el2) {
    var _a, _b, _c, _d, _e;
    return !!(((_a = el2 == null ? void 0 : el2.closest) == null ? void 0 : _a.call(el2, "#ms-container")) || ((_b = el2 == null ? void 0 : el2.closest) == null ? void 0 : _b.call(el2, `#${BANNER_ID}`)) || ((_c = el2 == null ? void 0 : el2.closest) == null ? void 0 : _c.call(el2, `#${NOTICE_ID}`)) || ((_d = el2 == null ? void 0 : el2.closest) == null ? void 0 : _d.call(el2, `#${HIGHLIGHT_ID}`)) || // chrome da lib no light DOM: barra de sessão, switch SIMPLES e pills (QA R34 MED-2)
    ((_e = el2 == null ? void 0 : el2.closest) == null ? void 0 : _e.call(
      el2,
      "#ms-session-bar, #ms-simples-chrome, .ms-pills-nav, [data-ms-pills]"
    )));
  }
  function isCandidate(el2) {
    if (!el2 || el2 === document.documentElement || el2 === document.body) {
      return false;
    }
    if (isOwnUi(el2)) return false;
    const r = el2.getBoundingClientRect();
    return r.width >= MIN_W && r.height >= MIN_H;
  }
  function describe(el2) {
    const tag = el2.tagName.toLowerCase();
    const name = el2.getAttribute("aria-label") || el2.id || (el2.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return name ? `${tag}: ${name}` : tag;
  }
  function setCurrent(el2) {
    _current = el2;
    if (!_highlight || !_status) return;
    if (!el2) {
      _highlight.style.display = "none";
      _status.textContent = "";
      return;
    }
    const r = el2.getBoundingClientRect();
    Object.assign(_highlight.style, {
      display: "block",
      top: `${r.top + window.scrollY}px`,
      left: `${r.left + window.scrollX}px`,
      width: `${r.width}px`,
      height: `${r.height}px`
    });
    _status.textContent = ` ${t("manualCurrent")} ${describe(el2)}.`;
  }
  function cycleCandidate(step) {
    var _a;
    const list = Array.from(document.querySelectorAll(CANDIDATE_SELECTOR)).filter(
      isCandidate
    );
    const onCancel = document.activeElement === _cancel;
    const i = _current ? list.indexOf(_current) : -1;
    const goCancel = !list.length || !onCancel && step > 0 && i === list.length - 1 || !onCancel && step < 0 && i <= 0;
    if (goCancel) {
      setCurrent(null);
      _cancel == null ? void 0 : _cancel.focus();
      return;
    }
    const next = i < 0 ? step > 0 ? list[0] : list[list.length - 1] : list[(i + step + list.length) % list.length];
    (_a = next.scrollIntoView) == null ? void 0 : _a.call(next, { block: "nearest" });
    setCurrent(next);
    _banner == null ? void 0 : _banner.focus();
  }
  function confirmSelect(el2) {
    document.querySelectorAll("[data-ms-principal]").forEach((node) => {
      node.removeAttribute("data-ms-principal");
    });
    el2.setAttribute("data-ms-principal", "");
    const path = buildCssPath(el2);
    const cb = _callbacks == null ? void 0 : _callbacks.onSelect;
    stopManualSelect();
    if (cb) cb(el2, path);
  }
  function startManualSelect(opts = {}) {
    stopManualSelect();
    _callbacks = opts;
    let active = deepActiveElement();
    if ((!active || active === document.body) && (_noticePrev == null ? void 0 : _noticePrev.isConnected)) {
      active = _noticePrev;
    }
    _noticePrev = null;
    _prevFocus = active;
    _banner = document.createElement("div");
    _banner.id = BANNER_ID;
    _banner.setAttribute("role", "status");
    _banner.setAttribute("aria-live", "polite");
    _banner.tabIndex = -1;
    Object.assign(_banner.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      zIndex: "2147483646",
      padding: "0.85rem 1.25rem",
      background: "#0B2C5F",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
      fontSize: "0.95rem",
      fontWeight: "600",
      textAlign: "center",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      cursor: "default"
    });
    _banner.append(t("manualInstruction"));
    _status = document.createElement("span");
    _banner.appendChild(_status);
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = t("manualCancel");
    cancelBtn.setAttribute("aria-label", t("manualCancelLabel"));
    Object.assign(cancelBtn.style, {
      marginLeft: "1rem",
      padding: "0.3rem 0.75rem",
      minHeight: "44px",
      border: "1px solid rgba(255,255,255,0.5)",
      borderRadius: "6px",
      background: "transparent",
      color: "#fff",
      cursor: "pointer",
      font: "inherit",
      fontSize: "0.85rem"
    });
    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const cb = _callbacks == null ? void 0 : _callbacks.onCancel;
      stopManualSelect();
      if (cb) cb();
    });
    _banner.appendChild(cancelBtn);
    _cancel = cancelBtn;
    document.body.appendChild(_banner);
    _highlight = document.createElement("div");
    _highlight.id = HIGHLIGHT_ID;
    _highlight.setAttribute("aria-hidden", "true");
    Object.assign(_highlight.style, {
      display: "none",
      position: "absolute",
      zIndex: "2147483645",
      pointerEvents: "none",
      outline: "3px solid #F39200",
      outlineOffset: "-3px",
      background: "rgba(243, 146, 0, 0.12)"
    });
    document.documentElement.appendChild(_highlight);
    document.documentElement.classList.add(OVERLAY_CLASS);
    _banner.focus();
    _onClick = (e) => {
      if (isOwnUi(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const el2 = e.target;
      if (!el2 || el2 === document.documentElement || el2 === document.body) return;
      confirmSelect(el2);
    };
    _onKey = (e) => {
      var _a, _b, _c, _d;
      const inBanner = (_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, `#${BANNER_ID}`);
      const consume = () => {
        e.preventDefault();
        e.stopImmediatePropagation();
      };
      if (e.key === "Escape") {
        consume();
        const cb = _callbacks == null ? void 0 : _callbacks.onCancel;
        stopManualSelect();
        if (cb) cb();
        return;
      }
      if ((_d = (_c = e.target) == null ? void 0 : _c.closest) == null ? void 0 : _d.call(_c, "#ms-container")) return;
      if (e.key === "Tab") {
        consume();
        cycleCandidate(e.shiftKey ? -1 : 1);
      } else if (inBanner && e.target !== _banner) {
        return;
      } else if (e.key === "ArrowUp") {
        consume();
        const parent = _current == null ? void 0 : _current.parentElement;
        if (!_current) cycleCandidate(1);
        else if (parent && isCandidate(parent)) setCurrent(parent);
      } else if (e.key === "ArrowDown") {
        consume();
        if (!_current) cycleCandidate(1);
        else {
          const child = Array.from(_current.children).find(isCandidate);
          if (child) setCurrent(child);
        }
      } else if (e.key === "Enter") {
        consume();
        if (_current) confirmSelect(_current);
      }
    };
    _onPointer = (e) => {
      if (isOwnUi(e.target)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    _onTouch = (e) => {
      if (isOwnUi(e.target)) return;
      e.stopImmediatePropagation();
    };
    _onOver = (e) => {
      const el2 = e.target;
      if (el2 && !isOwnUi(el2) && el2 !== document.documentElement) setCurrent(el2);
    };
    document.addEventListener("click", _onClick, true);
    document.addEventListener("keydown", _onKey, true);
    document.addEventListener("mouseover", _onOver, true);
    for (const type of POINTER_EVENTS) {
      document.addEventListener(type, _onPointer, true);
    }
    for (const type of TOUCH_EVENTS) {
      document.addEventListener(type, _onTouch, { capture: true, passive: true });
    }
  }
  function showLowConfidenceNotice(opts = {}) {
    hideLowConfidenceNotice();
    queueMicrotask(() => {
      if (document.getElementById(NOTICE_ID)) _noticePrev = deepActiveElement();
    });
    const box2 = document.createElement("div");
    box2.id = NOTICE_ID;
    box2.setAttribute("data-ms-live", "");
    Object.assign(box2.style, {
      position: "fixed",
      left: "0",
      right: "0",
      top: "0",
      // embaixo ficam o botão flutuante e a dica dele (QA T144 M1)
      zIndex: "2147483646",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem",
      padding: "0.85rem 1.25rem",
      background: "#0B2C5F",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
      fontSize: "1rem",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)"
    });
    const msg = document.createElement("span");
    msg.setAttribute("role", "status");
    msg.setAttribute("aria-live", "polite");
    box2.appendChild(msg);
    setTimeout(() => {
      msg.textContent = t("lowConfNotice");
    }, 50);
    const mk = (text, onClick) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      Object.assign(b.style, {
        minHeight: "44px",
        minWidth: "44px",
        padding: "0.5rem 1rem",
        border: "1px solid rgba(255,255,255,0.7)",
        borderRadius: "6px",
        background: "transparent",
        color: "#fff",
        cursor: "pointer",
        font: "inherit"
      });
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        onClick();
      });
      box2.appendChild(b);
    };
    mk(t("lowConfChoose"), () => {
      var _a;
      return (_a = opts.onChoose) == null ? void 0 : _a.call(opts);
    });
    mk(t("lowConfClose"), hideLowConfidenceNotice);
    document.body.appendChild(box2);
  }
  function hideLowConfidenceNotice() {
    var _a;
    (_a = document.getElementById(NOTICE_ID)) == null ? void 0 : _a.remove();
  }
  function isManualSelectActive() {
    return _onClick !== null;
  }
  function stopManualSelect() {
    var _a;
    hideLowConfidenceNotice();
    const wasActive = _onClick !== null;
    if (_onClick) {
      document.removeEventListener("click", _onClick, true);
      _onClick = null;
    }
    if (_onKey) {
      document.removeEventListener("keydown", _onKey, true);
      _onKey = null;
    }
    if (_onOver) {
      document.removeEventListener("mouseover", _onOver, true);
      _onOver = null;
    }
    if (_onPointer) {
      for (const type of POINTER_EVENTS) {
        document.removeEventListener(type, _onPointer, true);
      }
      _onPointer = null;
    }
    if (_onTouch) {
      for (const type of TOUCH_EVENTS) {
        document.removeEventListener(type, _onTouch, true);
      }
      _onTouch = null;
    }
    if (_banner == null ? void 0 : _banner.parentNode) {
      _banner.parentNode.removeChild(_banner);
    }
    if (_highlight == null ? void 0 : _highlight.parentNode) {
      _highlight.parentNode.removeChild(_highlight);
    }
    _banner = null;
    _status = null;
    _highlight = null;
    _cancel = null;
    _current = null;
    document.documentElement.classList.remove(OVERLAY_CLASS);
    _callbacks = null;
    if (wasActive && (_prevFocus == null ? void 0 : _prevFocus.isConnected)) (_a = _prevFocus.focus) == null ? void 0 : _a.call(_prevFocus);
    _prevFocus = null;
  }

  // src/features/shortcutsCard.js
  var CARD_ID = "ms-shortcuts-card";
  var DISMISS_KEY = "ms-shortcuts-dismissed";
  var _card = null;
  function dismissed() {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch (_) {
      return false;
    }
  }
  function setDismissed(on3) {
    try {
      if (on3) sessionStorage.setItem(DISMISS_KEY, "1");
      else sessionStorage.removeItem(DISMISS_KEY);
    } catch (_) {
    }
  }
  function pageAccessKeys() {
    const out = [];
    for (const el2 of document.querySelectorAll("[accesskey]")) {
      if (el2.closest("#ms-container, #" + CARD_ID)) continue;
      const key = (el2.getAttribute("accesskey") || "").trim();
      if (!key) continue;
      const name = (el2.getAttribute("aria-label") || el2.textContent || el2.getAttribute("title") || "").trim().replace(/\s+/g, " ").slice(0, 40);
      out.push({
        keys: `${t("shortcutAccessKeyPrefix")}${key.toUpperCase()}`,
        text: name || key
      });
    }
    return out;
  }
  function el(tag, text, style) {
    const n = document.createElement(tag);
    if (text) n.textContent = text;
    if (style) {
      for (const [k, v] of Object.entries(style)) {
        n.style.setProperty(k, v, "important");
      }
    }
    return n;
  }
  function build(side) {
    const card = el("section", "", {
      position: "fixed",
      bottom: "16px",
      [side]: "16px",
      width: "280px",
      "max-width": "calc(100vw - 120px)",
      // não cobre o botão flutuante (56px + folgas) a 390px
      "box-sizing": "border-box",
      padding: "12px 14px",
      background: "#0B2C5F",
      color: "#fff",
      font: "400 15px/1.4 system-ui, sans-serif",
      "border-radius": "10px",
      "box-shadow": "0 4px 16px rgba(0,0,0,0.35)",
      "z-index": "2147483640"
    });
    card.id = CARD_ID;
    card.setAttribute("role", "region");
    card.setAttribute("aria-label", t("shortcutsTitle"));
    card.append(
      el("h2", t("shortcutsTitle"), {
        margin: "0 0 8px",
        font: "700 16px/1.3 system-ui, sans-serif",
        color: "#fff"
      })
    );
    const list = el("ul", "", {
      margin: "0 0 10px",
      padding: "0",
      "list-style": "none"
    });
    for (const s of [...getShortcuts(), ...pageAccessKeys()]) {
      const li = el("li", "", { margin: "0 0 6px", color: "#fff" });
      li.append(
        el("kbd", s.keys, {
          display: "inline-block",
          padding: "1px 6px",
          margin: "0 6px 0 0",
          background: "#fff",
          color: "#0B2C5F",
          "border-radius": "4px",
          font: "700 14px/1.4 system-ui, sans-serif"
        }),
        document.createTextNode(s.text)
      );
      list.append(li);
    }
    const close = el("button", t("shortcutsClose"), {
      "min-width": "44px",
      "min-height": "44px",
      padding: "0 16px",
      background: "#fff",
      color: "#0B2C5F",
      border: "0",
      "border-radius": "8px",
      font: "700 15px/1 system-ui, sans-serif",
      cursor: "pointer"
    });
    close.type = "button";
    close.addEventListener("click", () => {
      setDismissed(true);
      hide();
    });
    card.append(list, close);
    return card;
  }
  function hide() {
    _card == null ? void 0 : _card.remove();
    _card = null;
  }
  function startShortcutsCard({ side = "left" } = {}) {
    if (_card || dismissed()) return;
    _card = build(side);
    document.body.appendChild(_card);
  }
  function placeShortcutsCard(side) {
    if (!_card) return;
    _card.style.setProperty(
      side === "left" ? "right" : "left",
      "auto",
      "important"
    );
    _card.style.setProperty(side, "16px", "important");
  }
  function hideShortcutsCard() {
    hide();
  }
  function stopShortcutsCard() {
    setDismissed(false);
    hide();
  }

  // src/features/mouseGrid.js
  var MOUSE_GRID_ID = "ms-mouse-grid";
  var MIN_CELL_PX = 24;
  var FOCUSABLE2 = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable=""], [contenteditable="true"]';
  var _root2 = null;
  var _prevFocus2 = null;
  var _releaseTrap = null;
  var _stack = [];
  var _barH = 0;
  var _barTop = false;
  var viewport = () => ({
    w: document.documentElement.clientWidth || window.innerWidth || 1,
    h: Math.max(
      1,
      (document.documentElement.clientHeight || window.innerHeight || 1) - _barH
    ),
    y0: _barTop ? _barH : 0
  });
  var current2 = () => _stack[_stack.length - 1];
  function px(a) {
    const v = viewport();
    return { x: a.x * v.w, y: v.y0 + a.y * v.h, w: a.w * v.w, h: a.h * v.h };
  }
  function canSubdivide(area) {
    const p = px(area);
    return Math.min(p.w, p.h) / 3 >= MIN_CELL_PX;
  }
  function cellArea(area, n) {
    const col = (n - 1) % 3;
    const row = Math.floor((n - 1) / 3);
    const w = area.w / 3;
    const h = area.h / 3;
    return { x: area.x + col * w, y: area.y + row * h, w, h };
  }
  function areaCenter(area) {
    const p = px(area);
    return { x: p.x + p.w / 2, y: p.y + p.h / 2 };
  }
  var rgbaOf = (css, alpha) => {
    const m = /rgba?\(([^)]+)\)/.exec(css || "");
    if (!m) return css;
    const [r, g, b] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  function theme() {
    const cs = getComputedStyle(document.body);
    const fg = cs.color || "rgb(0, 0, 0)";
    let bg = cs.backgroundColor;
    if (!bg || /rgba\([^)]*,\s*0\)/.test(bg) || bg === "transparent") {
      bg = getComputedStyle(document.documentElement).backgroundColor;
    }
    if (!bg || /rgba\([^)]*,\s*0\)/.test(bg) || bg === "transparent") {
      bg = "rgb(255, 255, 255)";
    }
    return { fg, bg };
  }
  function box(parent, style) {
    const d = document.createElement("div");
    Object.assign(d.style, style);
    parent.appendChild(d);
    return d;
  }
  function render() {
    if (!_root2) return;
    const { fg, bg } = theme();
    _root2.textContent = "";
    _barH = 0;
    _barTop = !!document.getElementById("ms-virtual-keyboard");
    const compact = viewport().w < 420;
    const bar = box(_root2, {
      position: "absolute",
      left: "0",
      right: "0",
      [_barTop ? "top" : "bottom"]: "8px",
      display: "flex",
      gap: compact ? "4px" : "8px",
      flexWrap: "wrap",
      justifyContent: "center",
      zIndex: "1"
    });
    const mk = (label2, fn) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label2;
      Object.assign(b.style, {
        minHeight: "44px",
        padding: compact ? "0 8px" : "0 14px",
        border: `3px solid ${fg}`,
        borderRadius: "8px",
        background: bg,
        color: fg,
        font: compact ? "700 14px/1 sans-serif" : "700 16px/1 sans-serif",
        cursor: "pointer"
      });
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        fn();
      });
      bar.appendChild(b);
    };
    mk(compact ? t("gridClickShort") : t("gridClickBtn"), () => clickCurrent());
    mk(compact ? t("gridBackShort") : t("gridBackBtn"), () => goBack());
    mk(
      compact ? t("gridCloseShort") : t("gridCloseBtn"),
      () => closeMouseGrid()
    );
    _barH = bar.offsetHeight + 16;
    const a = px(current2());
    box(_root2, {
      position: "absolute",
      left: `${a.x}px`,
      top: `${a.y}px`,
      width: `${a.w}px`,
      height: `${a.h}px`,
      boxSizing: "border-box",
      border: `3px solid ${fg}`,
      boxShadow: `0 0 0 100vmax ${rgbaOf(bg, 0.55)}`,
      pointerEvents: "none"
    });
    if (canSubdivide(current2())) {
      for (let n = 1; n <= 9; n++) {
        const c = px(cellArea(current2(), n));
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-cell", String(n));
        b.setAttribute("aria-label", `${t("gridCellLabel")} ${n}`);
        b.textContent = String(n);
        Object.assign(b.style, {
          position: "absolute",
          left: `${c.x}px`,
          top: `${c.y}px`,
          width: `${c.w}px`,
          height: `${c.h}px`,
          boxSizing: "border-box",
          margin: "0",
          padding: "0",
          border: `2px solid ${fg}`,
          background: rgbaOf(bg, 0.6),
          color: fg,
          font: `700 ${Math.max(14, Math.min(64, c.h * 0.5))}px/1 sans-serif`,
          cursor: "pointer"
        });
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          selectCell(n);
        });
        _root2.appendChild(b);
      }
    }
  }
  function levelText() {
    return canSubdivide(current2()) ? `${t("gridLevelPre")} ${_stack.length}. ${t("gridChoose")}` : t("gridMin");
  }
  function deepElementAt(x, y) {
    let el2 = document.elementFromPoint(x, y);
    while (el2 == null ? void 0 : el2.shadowRoot) {
      const inner = el2.shadowRoot.elementFromPoint(x, y);
      if (!inner || inner === el2) break;
      el2 = inner;
    }
    return el2;
  }
  function onKeydown(e) {
    var _a, _b;
    if (!_root2) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code || "");
    if (m) {
      e.preventDefault();
      e.stopPropagation();
      selectCell(Number(m[1]));
    } else if (e.key === "Enter") {
      if (((_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, `#${MOUSE_GRID_ID}`)) && e.target.closest("button")) {
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      clickCurrent();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      e.stopPropagation();
      goBack();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeMouseGrid();
    }
  }
  function onResize() {
    render();
  }
  function openMouseGrid() {
    if (_root2) {
      _stack = [{ x: 0, y: 0, w: 1, h: 1 }];
      render();
      announce(t("gridOpen"));
      return;
    }
    _prevFocus2 = document.activeElement;
    _stack = [{ x: 0, y: 0, w: 1, h: 1 }];
    _root2 = document.createElement("div");
    _root2.id = MOUSE_GRID_ID;
    _root2.setAttribute("role", "dialog");
    _root2.setAttribute("aria-modal", "true");
    _root2.setAttribute("aria-label", t("gridDialogLabel"));
    _root2.tabIndex = -1;
    Object.assign(_root2.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      overflow: "hidden",
      outline: "none",
      background: "transparent"
    });
    document.body.appendChild(_root2);
    render();
    document.addEventListener("keydown", onKeydown, true);
    window.addEventListener("resize", onResize);
    _releaseTrap = trapFocus(_root2);
    _root2.focus();
    announce(t("gridOpen"));
  }
  function selectCell(n) {
    if (!_root2 || !Number.isInteger(n) || n < 1 || n > 9) return false;
    if (!canSubdivide(current2())) return false;
    _stack.push(cellArea(current2(), n));
    render();
    const prevFocus = _root2.contains(document.activeElement);
    if (!prevFocus) _root2.focus();
    announce(levelText());
    return true;
  }
  function goBack() {
    if (!_root2) return false;
    if (_stack.length < 2) {
      announce(t("gridTop"));
      return false;
    }
    _stack.pop();
    render();
    _root2.focus();
    announce(levelText());
    return true;
  }
  function closeMouseGrid({ restoreFocus = true, silent = false } = {}) {
    var _a;
    if (!_root2) return;
    document.removeEventListener("keydown", onKeydown, true);
    window.removeEventListener("resize", onResize);
    _releaseTrap == null ? void 0 : _releaseTrap();
    _releaseTrap = null;
    _root2.remove();
    _root2 = null;
    _barH = 0;
    _barTop = false;
    _stack = [];
    const prev = _prevFocus2;
    _prevFocus2 = null;
    if (restoreFocus && (prev == null ? void 0 : prev.isConnected)) (_a = prev.focus) == null ? void 0 : _a.call(prev);
    if (!silent) announce(t("gridClosed"));
  }
  function clickCurrent() {
    var _a, _b;
    if (!_root2) return null;
    const { x, y } = areaCenter(current2());
    closeMouseGrid({ restoreFocus: false, silent: true });
    const target = deepElementAt(x, y);
    if (!target) {
      announce(t("gridClosed"));
      return null;
    }
    const init = (buttons) => ({
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX: x,
      clientY: y,
      button: 0,
      buttons
    });
    const Ptr = typeof window.PointerEvent === "function" ? window.PointerEvent : window.MouseEvent;
    const ptr = { pointerType: "mouse", pointerId: 1, isPrimary: true };
    target.dispatchEvent(new Ptr("pointerdown", { ...init(1), ...ptr }));
    target.dispatchEvent(
      new window.MouseEvent("mousedown", { ...init(1), detail: 1 })
    );
    target.dispatchEvent(new Ptr("pointerup", { ...init(0), ...ptr }));
    target.dispatchEvent(
      new window.MouseEvent("mouseup", { ...init(0), detail: 1 })
    );
    target.dispatchEvent(
      new window.MouseEvent("click", { ...init(0), detail: 1 })
    );
    const focusable = (_a = target.closest) == null ? void 0 : _a.call(target, FOCUSABLE2);
    if (focusable && !focusable.disabled) (_b = focusable.focus) == null ? void 0 : _b.call(focusable);
    announce(t("gridClicked"));
    return target;
  }

  // src/features/textMagnifier.js
  var MAGNIFIER_ID = "ms-text-magnifier";
  var MIN_FONT_PX = 32;
  var GAP = 12;
  var MAX_CHARS = 280;
  var OWN2 = "#ms-container, #ms-shortcuts-card, #ms-simples-chrome, #ms-session-bar, #ms-mouse-grid, #ms-virtual-keyboard, #" + MAGNIFIER_ID;
  var BLOCK = "p, li, h1, h2, h3, h4, h5, h6, td, th, dt, dd, blockquote, figcaption, label, legend, caption, summary, button, a, pre";
  var _box = null;
  var _raf = null;
  var _pending = null;
  var _escaped = false;
  var _last = "";
  var _source = null;
  var _scroll0 = { x: 0, y: 0 };
  var _listeners2 = [];
  var SENSITIVE_AC = /^(cc-|one-time-code$|new-password$|current-password$)/;
  function isSensitive(el2) {
    const tokens = (el2.getAttribute("autocomplete") || "").toLowerCase().split(/\s+/);
    return tokens.some((t2) => SENSITIVE_AC.test(t2));
  }
  var clean3 = (s) => (s || "").replace(/\s+/g, " ").trim();
  function fieldText(el2) {
    var _a;
    const tag = el2.tagName;
    if (tag === "INPUT") {
      const type = (el2.getAttribute("type") || "text").toLowerCase();
      if (type === "password" || type === "hidden") return "";
      if (["checkbox", "radio", "file", "range", "color"].includes(type)) {
        return clean3(labelOf(el2));
      }
      if (["button", "submit", "reset"].includes(type)) return clean3(el2.value);
      if (isSensitive(el2)) return clean3(labelOf(el2));
      return clean3(`${labelOf(el2)} ${el2.value || ""}`);
    }
    if (tag === "TEXTAREA") {
      if (isSensitive(el2)) return clean3(labelOf(el2));
      return clean3(`${labelOf(el2)} ${el2.value || ""}`);
    }
    if (tag === "SELECT") {
      const opt = (_a = el2.selectedOptions) == null ? void 0 : _a[0];
      return clean3(`${labelOf(el2)} ${opt ? opt.textContent : ""}`);
    }
    return "";
  }
  function labelOf(el2) {
    const aria = el2.getAttribute("aria-label");
    if (aria) return aria;
    const labels = el2.labels ? [...el2.labels].map((l) => l.textContent).join(" ") : "";
    return labels || el2.getAttribute("placeholder") || "";
  }
  function magnifierTextFor(el2) {
    var _a, _b, _c, _d;
    if (!el2 || el2.nodeType !== 1) return "";
    if ((_a = el2.closest) == null ? void 0 : _a.call(el2, OWN2)) return "";
    const ce = (_b = el2.closest) == null ? void 0 : _b.call(el2, "[contenteditable]");
    if (ce && ce.getAttribute("contenteditable") !== "false") {
      return clean3(ce.getAttribute("aria-label")).slice(0, MAX_CHARS);
    }
    const tag = el2.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag))
      return fieldText(el2).slice(0, MAX_CHARS);
    if (tag === "IMG") return clean3(el2.getAttribute("alt")).slice(0, MAX_CHARS);
    for (let n = el2; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      if ((_c = n.closest) == null ? void 0 : _c.call(n, OWN2)) return "";
      if ((_d = n.matches) == null ? void 0 : _d.call(n, BLOCK)) {
        const t2 = clean3(n.textContent);
        if (t2) return t2.slice(0, MAX_CHARS);
      }
    }
    const own = [...el2.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join(" ");
    return clean3(own).slice(0, MAX_CHARS);
  }
  function rgb(c) {
    const m = /rgba?\(([^)]+)\)/.exec(c || "");
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  }
  var lum = ({ r, g, b }) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  function themeColors() {
    const cs = getComputedStyle(document.body);
    const fg = rgb(cs.color) || { r: 0, g: 0, b: 0, a: 1 };
    let bg = rgb(cs.backgroundColor);
    if (!bg || bg.a < 0.5) {
      const html = rgb(
        getComputedStyle(document.documentElement).backgroundColor
      );
      bg = html && html.a >= 0.5 ? html : lum(fg) > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
    }
    const css = ({ r, g, b }) => `rgb(${r}, ${g}, ${b})`;
    return { color: css(fg), background: css(bg) };
  }
  function ensureBox() {
    if (_box) return _box;
    _box = document.createElement("div");
    _box.id = MAGNIFIER_ID;
    _box.setAttribute("aria-hidden", "true");
    const set = (k, v) => _box.style.setProperty(k, v, "important");
    set("position", "fixed");
    set("left", "0");
    set("top", "0");
    set("display", "none");
    set("box-sizing", "border-box");
    set("width", "min(720px, calc(100vw - 32px))");
    set("max-height", "40vh");
    set("overflow", "hidden");
    set("padding", "14px 18px");
    set("font", `600 ${MIN_FONT_PX}px/1.35 system-ui, sans-serif`);
    set("border-radius", "12px");
    set("border", "3px solid");
    set("box-shadow", "0 6px 24px rgba(0,0,0,0.4)");
    set("pointer-events", "none");
    set("z-index", "2147483645");
    set("word-break", "break-word");
    document.documentElement.appendChild(_box);
    return _box;
  }
  function hide2() {
    _last = "";
    if (_box) _box.style.setProperty("display", "none", "important");
  }
  function place(rect) {
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const w = _box.offsetWidth;
    const h = _box.offsetHeight;
    let top;
    if (rect.bottom + GAP + h <= vh) top = rect.bottom + GAP;
    else if (rect.top - GAP - h >= 0) top = rect.top - GAP - h;
    else top = rect.top > vh - rect.bottom ? 8 : vh - h - 8;
    const left = Math.min(Math.max(8, rect.left), Math.max(8, vw - w - 8));
    _box.style.setProperty("left", `${Math.round(left)}px`, "important");
    _box.style.setProperty(
      "top",
      `${Math.round(Math.max(0, top))}px`,
      "important"
    );
  }
  function show(el2, pointer) {
    const text = magnifierTextFor(el2);
    if (!text) return hide2();
    const box2 = ensureBox();
    if (text !== _last || box2.style.display === "none") {
      const { color, background } = themeColors();
      box2.style.setProperty("color", color, "important");
      box2.style.setProperty("background", background, "important");
      box2.style.setProperty("border-color", color, "important");
      box2.textContent = text;
      _last = text;
    }
    box2.style.setProperty("display", "block", "important");
    _source = pointer ? "pointer" : "focus";
    _scroll0 = { x: window.scrollX || 0, y: window.scrollY || 0 };
    let rect = el2.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (pointer && rect.height > vh / 2) {
      rect = {
        top: pointer.y - 12,
        bottom: pointer.y + 12,
        left: rect.left,
        right: rect.right
      };
    }
    place(rect);
  }
  function schedule(el2, pointer) {
    _pending = { el: el2, pointer };
    if (_raf !== null) return;
    _raf = requestAnimationFrame(() => {
      _raf = null;
      const p = _pending;
      _pending = null;
      if (p && !_escaped && _listeners2.length) show(p.el, p.pointer);
    });
  }
  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    _listeners2.push([target, type, fn, opts]);
  }
  function startTextMagnifier() {
    if (_listeners2.length) return;
    const move = (e) => {
      var _a, _b;
      if (e.pointerType === "touch") return;
      _escaped = false;
      if ((_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "#ms-container")) return hide2();
      schedule(e.target, { x: e.clientX, y: e.clientY });
    };
    const tap = (e) => {
      var _a, _b;
      if (e.pointerType !== "touch") return;
      _escaped = false;
      if ((_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "#ms-container")) return hide2();
      schedule(e.target, { x: e.clientX, y: e.clientY });
    };
    const focus = (e) => {
      var _a, _b;
      _escaped = false;
      if (!e.target || e.target === document.body || ((_b = (_a = e.target).closest) == null ? void 0 : _b.call(_a, "#ms-container")))
        return hide2();
      schedule(e.target, null);
    };
    on(document, "pointermove", move, { passive: true });
    on(document, "pointerdown", tap, { passive: true });
    on(
      document,
      "pointerout",
      (e) => {
        if (!e.relatedTarget && e.pointerType !== "touch") hide2();
      },
      { passive: true }
    );
    on(document, "focusin", focus);
    on(document, "focusout", () => {
      if (_source === "focus") hide2();
    });
    on(document, "pointercancel", () => hide2(), { passive: true });
    on(
      document,
      "scroll",
      (e) => {
        if (_source !== "pointer") return;
        if (e.target === document && Math.abs((window.scrollX || 0) - _scroll0.x) < 1 && Math.abs((window.scrollY || 0) - _scroll0.y) < 1)
          return;
        hide2();
      },
      { capture: true, passive: true }
    );
    on(document, "keydown", (e) => {
      if (e.key === "Escape") {
        _escaped = true;
        hide2();
      }
    });
    on(document, "wheel", () => hide2(), { passive: true });
    let width = window.innerWidth;
    on(window, "resize", () => {
      if (window.innerWidth !== width) hide2();
      width = window.innerWidth;
    });
  }
  function stopTextMagnifier() {
    for (const [t2, type, fn, opts] of _listeners2)
      t2.removeEventListener(type, fn, opts);
    _listeners2 = [];
    if (_raf !== null) {
      cancelAnimationFrame(_raf);
      _raf = null;
    }
    _pending = null;
    _escaped = false;
    _last = "";
    _source = null;
    _box == null ? void 0 : _box.remove();
    _box = null;
  }

  // src/features/virtualKeyboard.js
  var KEYBOARD_ID = "ms-virtual-keyboard";
  var OWN3 = `#ms-container, #${KEYBOARD_ID}`;
  var TEXT_TYPES = [
    "text",
    "search",
    "email",
    "url",
    "tel",
    "number",
    "password"
  ];
  var DEAD_KEYS = ["\xB4", "`", "~", "^", "\xA8"];
  var COMPOSE = {
    "\xB4": {
      a: "\xE1",
      e: "\xE9",
      i: "\xED",
      o: "\xF3",
      u: "\xFA",
      y: "\xFD",
      A: "\xC1",
      E: "\xC9",
      I: "\xCD",
      O: "\xD3",
      U: "\xDA",
      Y: "\xDD"
    },
    "`": {
      a: "\xE0",
      e: "\xE8",
      i: "\xEC",
      o: "\xF2",
      u: "\xF9",
      A: "\xC0",
      E: "\xC8",
      I: "\xCC",
      O: "\xD2",
      U: "\xD9"
    },
    "~": { a: "\xE3", o: "\xF5", n: "\xF1", A: "\xC3", O: "\xD5", N: "\xD1" },
    "^": {
      a: "\xE2",
      e: "\xEA",
      i: "\xEE",
      o: "\xF4",
      u: "\xFB",
      A: "\xC2",
      E: "\xCA",
      I: "\xCE",
      O: "\xD4",
      U: "\xDB"
    },
    "\xA8": {
      a: "\xE4",
      e: "\xEB",
      i: "\xEF",
      o: "\xF6",
      u: "\xFC",
      y: "\xFF",
      A: "\xC4",
      E: "\xCB",
      I: "\xCF",
      O: "\xD6",
      U: "\xDC"
    }
  };
  function composeDead(dead, ch) {
    var _a, _b;
    return (_b = (_a = COMPOSE[dead]) == null ? void 0 : _a[ch]) != null ? _b : null;
  }
  var ROWS = [
    [
      `'"`,
      "1!",
      "2@",
      "3#",
      "4$",
      "5%",
      "6\xA8",
      "7&",
      "8*",
      "9(",
      "0)",
      "-_",
      "=+",
      "Backspace"
    ],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "\xB4`", "[{"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", "\xE7", "~^", "]}"],
    [
      "Shift",
      "\\|",
      "z",
      "x",
      "c",
      "v",
      "b",
      "n",
      "m",
      ",<",
      ".>",
      ";:",
      "/?",
      "Shift"
    ],
    ["Fechar", "AltGr", "Space", "Enter"]
  ];
  var ALTGR = {
    "1!": "\xB9",
    "2@": "\xB2",
    "3#": "\xB3",
    "4$": "\xA3",
    "5%": "\xA2",
    "6\xA8": "\xAC",
    "=+": "\xA7",
    "[{": "\xAA",
    "]}": "\xBA",
    "/?": "\xB0",
    q: "/",
    w: "?",
    e: "\xB0"
  };
  var DEAD_NAME_KEYS = {
    "\xB4": "vkDeadAcute",
    "`": "vkDeadGrave",
    "~": "vkDeadTilde",
    "^": "vkDeadCircumflex",
    "\xA8": "vkDeadDiaeresis"
  };
  var deadName = (ch) => t(DEAD_NAME_KEYS[ch]);
  var ROWS_EN = [
    [
      "`~",
      "1!",
      "2@",
      "3#",
      "4$",
      "5%",
      "6^",
      "7&",
      "8*",
      "9(",
      "0)",
      "-_",
      "=+",
      "Backspace"
    ],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[{", "]}", "\\|"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";:", `'"`],
    ["Shift", "z", "x", "c", "v", "b", "n", "m", ",<", ".>", "/?", "Shift"],
    ["Fechar", "Space", "Enter"]
  ];
  var ROWS_ES = [
    [
      "\xBA\xAA",
      "1!",
      '2"',
      "3\xB7",
      "4$",
      "5%",
      "6&",
      "7/",
      "8(",
      "9)",
      "0=",
      "'?",
      "\xA1\xBF",
      "Backspace"
    ],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "`^", "+*"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", "\xF1", "\xB4\xA8", "\xE7"],
    ["Shift", "<>", "z", "x", "c", "v", "b", "n", "m", ",;", ".:", "-_", "Shift"],
    ["Fechar", "AltGr", "Space", "Enter"]
  ];
  var ALTGR_ES = {
    \u00BA\u00AA: "\\",
    "1!": "|",
    '2"': "@",
    "3\xB7": "#",
    "4$": "~",
    "6&": "\xAC",
    "`^": "[",
    "+*": "]",
    "\xB4\xA8": "{",
    \u00E7: "}",
    e: "\u20AC"
  };
  var LAYOUTS = {
    pt: { rows: ROWS, altgr: ALTGR, dead: DEAD_KEYS },
    en: { rows: ROWS_EN, altgr: {}, dead: [] },
    es: { rows: ROWS_ES, altgr: ALTGR_ES, dead: ["\xB4", "`", "^", "\xA8"] }
  };
  var layout = () => LAYOUTS[getLocale()];
  var SPECIAL = [
    "Backspace",
    "Caps",
    "Enter",
    "Shift",
    "AltGr",
    "Fechar",
    "Space"
  ];
  var isCE = (el2) => el2.isContentEditable === true || ["", "true", "plaintext-only"].includes(el2.getAttribute("contenteditable"));
  function isEditableField(el2) {
    var _a;
    if (!el2 || el2.nodeType !== 1 || ((_a = el2.closest) == null ? void 0 : _a.call(el2, OWN3))) return false;
    if (el2.tagName === "TEXTAREA") return !el2.readOnly && !el2.disabled;
    if (el2.tagName === "INPUT") {
      const type = (el2.getAttribute("type") || "text").toLowerCase();
      return TEXT_TYPES.includes(type) && !el2.readOnly && !el2.disabled;
    }
    return el2.getAttribute("contenteditable") !== null && isCE(el2);
  }
  var isNumber = (el2) => el2.tagName === "INPUT" && (el2.getAttribute("type") || "").toLowerCase() === "number";
  var _num = null;
  var NUM_OK = /^[0-9.,+\-eE]+$/;
  function numBase(el2) {
    return _num && _num.el === el2 && el2.value === _num.last ? _num.text : el2.value;
  }
  function numCommit(el2, candidate, inputType, data) {
    const before = el2.value;
    if (!fire(el2, "beforeinput", { inputType, data })) return false;
    setValue(el2, candidate);
    if (candidate !== "" && el2.value === "") {
      setValue(el2, before);
      _num = { el: el2, text: candidate, last: before };
      updatePreview();
      return true;
    }
    _num = null;
    fire(el2, "input", { inputType, data });
    updatePreview();
    return true;
  }
  function numInsert(el2, text, inputType) {
    if (!NUM_OK.test(text)) return false;
    return numCommit(el2, numBase(el2) + text.replace(/,/g, "."), inputType, text);
  }
  function numDelete(el2) {
    const base = numBase(el2);
    if (base === "") return false;
    return numCommit(el2, base.slice(0, -1), "deleteContentBackward", null);
  }
  function flushNum() {
    if (!_num) return;
    _num = null;
    updatePreview();
  }
  var win = () => document.defaultView || window;
  function fire(el2, type, init = {}) {
    const W = win();
    const C = W.InputEvent || W.Event;
    return el2.dispatchEvent(
      new C(type, { bubbles: true, cancelable: type === "beforeinput", ...init })
    );
  }
  function setValue(el2, v) {
    var _a, _b, _c;
    const W = win();
    const proto = el2.tagName === "TEXTAREA" ? (_a = W.HTMLTextAreaElement) == null ? void 0 : _a.prototype : (_b = W.HTMLInputElement) == null ? void 0 : _b.prototype;
    const set = proto && ((_c = Object.getOwnPropertyDescriptor(proto, "value")) == null ? void 0 : _c.set);
    if (set) set.call(el2, v);
    else el2.value = v;
  }
  function setCaret(el2, pos) {
    try {
      el2.setSelectionRange(pos, pos);
    } catch (_) {
    }
  }
  function selection(el2) {
    const val = el2.value;
    let s = null;
    let e = null;
    try {
      s = el2.selectionStart;
      e = el2.selectionEnd;
    } catch (_) {
    }
    if (s == null || e == null) {
      s = val.length;
      e = val.length;
    }
    return [s, e, val];
  }
  function ceSelection(el2) {
    var _a, _b;
    const sel = (_b = (_a = win()).getSelection) == null ? void 0 : _b.call(_a);
    if (!sel || !sel.rangeCount) return null;
    const r = sel.getRangeAt(0);
    return el2.contains(r.commonAncestorContainer) ? { sel, r } : null;
  }
  function insertText(el2, text, inputType = "insertText") {
    var _a, _b;
    if (!el2 || !text) return false;
    if (el2.tagName !== "INPUT" && el2.tagName !== "TEXTAREA") {
      (_a = el2.focus) == null ? void 0 : _a.call(el2, { preventScroll: true });
      const cmd = text === "\n" ? "insertLineBreak" : "insertText";
      if ((_b = document.execCommand) == null ? void 0 : _b.call(document, cmd, false, text)) return true;
      const cs = ceSelection(el2);
      if (!cs || !fire(el2, "beforeinput", { inputType, data: text }))
        return false;
      cs.r.deleteContents();
      const node = document.createTextNode(text);
      cs.r.insertNode(node);
      cs.r.setStartAfter(node);
      cs.r.collapse(true);
      cs.sel.removeAllRanges();
      cs.sel.addRange(cs.r);
      fire(el2, "input", { inputType, data: text });
      return true;
    }
    if (isNumber(el2)) return numInsert(el2, text, inputType);
    const [s, e, val] = selection(el2);
    const max = el2.maxLength;
    if (max >= 0 && val.length - (e - s) + text.length > max) return false;
    if (!fire(el2, "beforeinput", { inputType, data: text })) return false;
    setValue(el2, val.slice(0, s) + text + val.slice(e));
    setCaret(el2, s + text.length);
    fire(el2, "input", { inputType, data: text });
    return true;
  }
  function deleteBack(el2) {
    var _a, _b, _c, _d;
    if (!el2) return false;
    if (el2.tagName !== "INPUT" && el2.tagName !== "TEXTAREA") {
      (_a = el2.focus) == null ? void 0 : _a.call(el2, { preventScroll: true });
      if ((_b = document.execCommand) == null ? void 0 : _b.call(document, "delete")) return true;
      const cs = ceSelection(el2);
      if (!cs) return false;
      if (cs.r.collapsed) (_d = (_c = cs.sel).modify) == null ? void 0 : _d.call(_c, "extend", "backward", "character");
      const r = cs.sel.getRangeAt(0);
      if (r.collapsed) return false;
      if (!fire(el2, "beforeinput", { inputType: "deleteContentBackward" }))
        return false;
      r.deleteContents();
      fire(el2, "input", { inputType: "deleteContentBackward" });
      return true;
    }
    if (isNumber(el2)) return numDelete(el2);
    let [s, e, val] = selection(el2);
    if (s === e) {
      if (s === 0) return false;
      const low = val.charCodeAt(s - 1);
      s -= low >= 56320 && low <= 57343 && s >= 2 ? 2 : 1;
    }
    if (!fire(el2, "beforeinput", { inputType: "deleteContentBackward" }))
      return false;
    setValue(el2, val.slice(0, s) + val.slice(e));
    setCaret(el2, s);
    fire(el2, "input", { inputType: "deleteContentBackward" });
    return true;
  }
  var IMPLICIT = [
    "text",
    "search",
    "url",
    "tel",
    "email",
    "password",
    "date",
    "month",
    "week",
    "time",
    "datetime-local",
    "number"
  ];
  function enterSubmit(form) {
    const els = [...form.elements];
    const btn = els.find(
      (e) => e.tagName === "BUTTON" && e.type === "submit" || e.tagName === "INPUT" && (e.type === "submit" || e.type === "image")
    );
    if (btn) return btn.disabled ? null : btn;
    const fields = els.filter(
      (e) => e.tagName === "INPUT" && IMPLICIT.includes((e.getAttribute("type") || "text").toLowerCase())
    );
    return fields.length === 1 ? true : null;
  }
  function pressEnter(el2) {
    var _a, _b, _c, _d;
    if (!el2) return false;
    if (el2.tagName !== "INPUT") return insertText(el2, "\n", "insertLineBreak");
    const W = win();
    const K = W.KeyboardEvent || W.Event;
    const init = {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true
    };
    const go = el2.dispatchEvent(new K("keydown", init));
    if (go && el2.form) {
      const how = enterSubmit(el2.form);
      if (how === true) (_b = (_a = el2.form).requestSubmit) == null ? void 0 : _b.call(_a);
      else if (how) (_d = (_c = el2.form).requestSubmit) == null ? void 0 : _d.call(_c, how);
    }
    el2.dispatchEvent(new K("keyup", init));
    return true;
  }
  var _root3 = null;
  var _target = null;
  var _dead = null;
  var _shift = false;
  var _altgr = false;
  var _caps = false;
  var _touch = false;
  var _listeners3 = [];
  var _inputmodes = /* @__PURE__ */ new Map();
  var _bodyPad = null;
  var _basePad = 0;
  var _keys = [];
  var _fab = null;
  var isTouchDevice = () => {
    var _a, _b, _c;
    return typeof navigator !== "undefined" && navigator.maxTouchPoints > 0 || !!((_c = (_b = (_a = win()).matchMedia) == null ? void 0 : _b.call(_a, "(pointer: coarse)")) == null ? void 0 : _c.matches);
  };
  function on2(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    _listeners3.push([target, type, fn, opts]);
  }
  function charOf(def) {
    const ag = _altgr && layout().altgr[def];
    if (ag) return ag;
    if (def.length === 1) return _shift !== _caps ? def.toUpperCase() : def;
    return _shift ? def[1] : def[0];
  }
  function labelOf2(def) {
    switch (def) {
      case "Backspace":
        return t("vkBackspace");
      case "Caps":
        return t("vkCaps");
      case "Enter":
        return t("vkEnter");
      case "Shift":
        return t("vkShift");
      case "AltGr":
        return t("vkAltGr");
      case "Fechar":
        return t("vkClose");
      case "Space":
        return t("vkSpace");
      default:
        return charOf(def);
    }
  }
  function setStyle(el2, styles) {
    for (const [k, v] of Object.entries(styles))
      el2.style.setProperty(k, v, "important");
  }
  function updatePreview() {
    const p = _root3 == null ? void 0 : _root3.querySelector("[data-vk-preview]");
    if (!p) return;
    p.textContent = _num ? `${t("vkPendingPre")} ${_num.text}` : "";
    p.style.setProperty("display", _num ? "block" : "none", "important");
    reserve();
  }
  function hideFab() {
    var _a, _b;
    const wrap = (_b = (_a = document.getElementById("ms-container")) == null ? void 0 : _a.shadowRoot) == null ? void 0 : _b.querySelector("[data-ms-fab-wrap]");
    if (!wrap || _fab) return;
    _fab = [
      wrap,
      wrap.style.getPropertyValue("display"),
      wrap.style.getPropertyPriority("display")
    ];
    wrap.style.setProperty("display", "none", "important");
  }
  function restoreFab() {
    if (!_fab) return;
    const [wrap, v, p] = _fab;
    if (v) wrap.style.setProperty("display", v, p);
    else wrap.style.removeProperty("display");
    _fab = null;
  }
  function paint() {
    if (!_root3) return;
    const { color, background } = themeColors();
    setStyle(_root3, { background, color, "border-top": `3px solid ${color}` });
    const hc = _root3.querySelector("[data-vk-hint-close]");
    if (hc) setStyle(hc, { background, color, border: `2px solid ${color}` });
    for (const { btn, def } of _keys) {
      const pressed = def === "Shift" && _shift || def === "Caps" && _caps || def === "AltGr" && _altgr || _dead && def.length === 2 && layout().dead.includes(charOf(def)) && charOf(def) === _dead;
      btn.setAttribute("aria-pressed", String(!!pressed));
      setStyle(
        btn,
        pressed ? { background: color, color: background, border: `2px solid ${color}` } : { background, color, border: `2px solid ${color}` }
      );
      if (!SPECIAL.includes(def)) {
        const ch = charOf(def);
        btn.textContent = ch;
        const dead = layout().dead.includes(ch);
        btn.setAttribute("aria-label", dead ? deadName(ch) : ch);
        btn.dataset.char = ch;
      }
    }
  }
  function reserve() {
    var _a, _b, _c, _d;
    if (!_root3 || !document.body) return;
    const h = _root3.offsetHeight || 0;
    if (_bodyPad === null) {
      const st = document.body.style;
      _bodyPad = [
        st.getPropertyValue("padding-bottom"),
        st.getPropertyPriority("padding-bottom")
      ];
      _basePad = parseFloat(win().getComputedStyle(document.body).paddingBottom) || 0;
    }
    document.body.style.setProperty(
      "padding-bottom",
      `${_basePad + h}px`,
      "important"
    );
    if (_target == null ? void 0 : _target.getBoundingClientRect) {
      const vh = win().innerHeight || document.documentElement.clientHeight;
      const r = _target.getBoundingClientRect();
      const limit = vh - h - 16;
      if (r.bottom > limit) (_b = (_a = win()).scrollBy) == null ? void 0 : _b.call(_a, 0, r.bottom - limit);
      else if (r.top < 0) (_d = (_c = win()).scrollBy) == null ? void 0 : _d.call(_c, 0, r.top - 16);
    }
  }
  function render2() {
    if (!_root3) return;
    layoutRows();
    const has = !!_target;
    _root3.querySelector("[data-vk-hint]").style.setProperty("display", has ? "none" : "block", "important");
    _root3.querySelector("[data-vk-hintrow]").style.setProperty("display", has ? "none" : "flex", "important");
    _root3.querySelector("[data-vk-keys]").style.setProperty("display", has ? "flex" : "none", "important");
    paint();
    reserve();
  }
  function restoreInputmode(el2) {
    if (!_inputmodes.has(el2)) return;
    const orig = _inputmodes.get(el2);
    _inputmodes.delete(el2);
    if (orig === null) el2.removeAttribute("inputmode");
    else el2.setAttribute("inputmode", orig);
  }
  function setTarget(el2) {
    if (el2 === _target) return;
    flushNum();
    if (_target) restoreInputmode(_target);
    _target = el2;
    _dead = null;
    _shift = false;
    _altgr = false;
    _num = null;
    updatePreview();
    if (el2 && _touch) {
      _inputmodes.set(el2, el2.getAttribute("inputmode"));
      el2.setAttribute("inputmode", "none");
    }
    render2();
  }
  function typeChar(ch) {
    var _a;
    if (_dead) {
      const d = _dead;
      _dead = null;
      insertText(_target, ch === " " ? d : (_a = composeDead(d, ch)) != null ? _a : d + ch);
    } else {
      insertText(_target, ch);
    }
  }
  function press(def) {
    var _a;
    if (def === "Fechar") return closeVirtualKeyboard();
    if (def === "Shift") {
      _shift = !_shift;
      return paint();
    }
    if (def === "Caps") {
      _caps = !_caps;
      return paint();
    }
    if (def === "AltGr") {
      _altgr = !_altgr;
      return paint();
    }
    if (!_target) return;
    (_a = _target.focus) == null ? void 0 : _a.call(_target, { preventScroll: true });
    if (def === "Backspace") {
      _dead = null;
      deleteBack(_target);
    } else if (def === "Enter") {
      _dead = null;
      pressEnter(_target);
    } else if (def === "Space") {
      typeChar(" ");
    } else {
      const ch = charOf(def);
      if (layout().dead.includes(ch)) {
        if (_dead) typeChar(" ");
        _dead = ch;
      } else {
        typeChar(ch);
      }
      _shift = false;
      _altgr = false;
    }
    paint();
  }
  var GAP2 = 2;
  var WEIGHT = {
    Fechar: 3,
    AltGr: 2.5,
    Enter: 3,
    Space: 5
  };
  var GLYPH = { Backspace: "\u2190", Caps: "\u21EA", Shift: "\u21E7" };
  var rowUnits = (row) => row.reduce((n, d) => n + (WEIGHT[d] || 1), 0);
  var NARROW = 375;
  function splitIndex(row) {
    const total = rowUnits(row);
    let acc = 0;
    let best = 1;
    let bestMax = Infinity;
    for (let k = 1; k < row.length; k++) {
      acc += WEIGHT[row[k - 1]] || 1;
      const m = Math.max(acc, total - acc);
      if (m < bestMax) {
        bestMax = m;
        best = k;
      }
    }
    return best;
  }
  var unitsOf = (row, narrow) => {
    if (!narrow) return rowUnits(row);
    const k = splitIndex(row);
    return Math.max(rowUnits(row.slice(0, k)), rowUnits(row.slice(k)));
  };
  var unitCss = (narrow) => {
    const n = Math.max(...layout().rows.map((r) => unitsOf(r, narrow)));
    return `min(calc((100% - ${(n - 1) * GAP2}px) / ${n}), 56px)`;
  };
  var basis = (w) => `calc(${w} * var(--vk-u) + ${(w - 1) * GAP2}px)`;
  var _lines = [];
  function layoutRows() {
    var _a;
    if (!_root3) return;
    const narrow = (win().innerWidth || 1024) < NARROW;
    _root3.style.setProperty("--vk-u", unitCss(narrow), "important");
    for (const { line, row } of _lines) {
      (_a = line.querySelector("[data-vk-break]")) == null ? void 0 : _a.remove();
      setStyle(line, { "flex-wrap": narrow ? "wrap" : "nowrap" });
      if (!narrow) continue;
      const br = document.createElement("div");
      br.dataset.vkBreak = "";
      setStyle(br, { "flex-basis": "100%", height: "0", margin: "0" });
      line.children[splitIndex(row) - 1].after(br);
    }
  }
  function buildRow(row) {
    const line = document.createElement("div");
    setStyle(line, {
      display: "flex",
      "flex-wrap": "nowrap",
      gap: `${GAP2}px`,
      "justify-content": "center",
      margin: "0 0 4px"
    });
    _lines.push({ line, row });
    for (const def of row) {
      const w = WEIGHT[def] || 1;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.vk = def;
      if (def !== "Fechar") btn.tabIndex = -1;
      btn.textContent = GLYPH[def] || (SPECIAL.includes(def) ? labelOf2(def) : "");
      if (GLYPH[def]) btn.setAttribute("aria-label", labelOf2(def));
      setStyle(btn, {
        flex: `0 0 ${basis(w)}`,
        "min-width": "0",
        "min-height": "44px",
        margin: "0",
        padding: "0",
        font: `600 ${GLYPH[def] ? 16 : 18}px/1 system-ui, sans-serif`,
        "border-radius": "8px",
        cursor: "pointer"
      });
      if (def === "Shift" || def === "Caps" || def === "AltGr")
        btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("pointerdown", (e) => e.preventDefault());
      btn.addEventListener("mousedown", (e) => e.preventDefault());
      btn.addEventListener("click", () => press(def));
      line.append(btn);
      _keys.push({ btn, def });
    }
    return line;
  }
  function build2() {
    const root = document.createElement("div");
    root.id = KEYBOARD_ID;
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", t("vkLabel"));
    setStyle(root, {
      position: "fixed",
      left: "0",
      right: "0",
      bottom: "0",
      display: "flex",
      "flex-direction": "column",
      "box-sizing": "border-box",
      padding: "8px 6px",
      "z-index": "2147483644",
      font: "600 20px/1 system-ui, sans-serif",
      "max-height": "70vh"
    });
    const hintRow = document.createElement("div");
    hintRow.dataset.vkHintrow = "";
    setStyle(hintRow, {
      "align-items": "center",
      gap: "8px",
      "justify-content": "space-between"
    });
    const hint = document.createElement("p");
    hint.dataset.vkHint = "";
    hint.textContent = t("vkHint");
    setStyle(hint, {
      margin: "4px 8px",
      font: "600 18px/1.4 system-ui, sans-serif",
      color: "inherit"
    });
    const hintClose = document.createElement("button");
    hintClose.type = "button";
    hintClose.dataset.vkHintClose = "";
    hintClose.textContent = t("vkClose");
    setStyle(hintClose, {
      "min-width": "44px",
      "min-height": "44px",
      padding: "0 14px",
      font: "600 18px/1 system-ui, sans-serif",
      "border-radius": "8px",
      cursor: "pointer"
    });
    hintClose.addEventListener("pointerdown", (e) => e.preventDefault());
    hintClose.addEventListener("mousedown", (e) => e.preventDefault());
    hintClose.addEventListener("click", () => closeVirtualKeyboard());
    hintRow.append(hint, hintClose);
    const keys = document.createElement("div");
    keys.dataset.vkKeys = "";
    setStyle(keys, {
      "flex-direction": "column",
      "min-height": "0",
      width: "100%",
      "max-width": "1000px",
      margin: "0 auto"
    });
    const preview = document.createElement("div");
    preview.dataset.vkPreview = "";
    setStyle(preview, {
      display: "none",
      margin: "0 0 6px",
      font: "600 20px/1.3 system-ui, sans-serif"
    });
    const scroll = document.createElement("div");
    scroll.dataset.vkScroll = "";
    setStyle(scroll, {
      "overflow-y": "auto",
      "min-height": "0",
      flex: "1 1 auto"
    });
    for (const row of layout().rows.slice(0, -1)) scroll.append(buildRow(row));
    const bottom = buildRow(layout().rows.at(-1));
    bottom.dataset.vkBottom = "";
    bottom.style.setProperty("flex", "0 0 auto", "important");
    bottom.style.setProperty("margin", "4px 0 0", "important");
    keys.append(preview, scroll, bottom);
    root.append(hintRow, keys);
    return root;
  }
  function openVirtualKeyboard({ touch } = {}) {
    if (_root3) return;
    _touch = touch != null ? touch : isTouchDevice();
    _shift = false;
    _altgr = false;
    _caps = false;
    _dead = null;
    _keys = [];
    _lines = [];
    _root3 = build2();
    document.documentElement.appendChild(_root3);
    hideFab();
    const focus = (e) => {
      var _a;
      const t2 = e.target;
      if ((_a = t2 == null ? void 0 : t2.closest) == null ? void 0 : _a.call(t2, `#${KEYBOARD_ID}, #ms-mouse-grid, #ms-container`)) return;
      setTarget(isEditableField(t2) ? t2 : null);
    };
    on2(document, "focusin", focus);
    on2(document, "focusout", (e) => {
      if (!e.relatedTarget && e.target === _target) {
        flushNum();
        setTarget(null);
      }
    });
    on2(window, "resize", () => render2());
    const ae = document.activeElement;
    setTarget(isEditableField(ae) ? ae : null);
    render2();
    announce(t("vkOpened"));
  }
  function closeVirtualKeyboard({ silent = false } = {}) {
    if (!_root3) return;
    for (const [t2, type, fn, opts] of _listeners3)
      t2.removeEventListener(type, fn, opts);
    _listeners3 = [];
    for (const el2 of [..._inputmodes.keys()]) restoreInputmode(el2);
    _inputmodes = /* @__PURE__ */ new Map();
    if (_bodyPad !== null && document.body) {
      if (_bodyPad[0])
        document.body.style.setProperty(
          "padding-bottom",
          _bodyPad[0],
          _bodyPad[1]
        );
      else document.body.style.removeProperty("padding-bottom");
    }
    _bodyPad = null;
    restoreFab();
    _num = null;
    _root3.remove();
    _root3 = null;
    _target = null;
    _dead = null;
    _shift = false;
    _altgr = false;
    _caps = false;
    _keys = [];
    _lines = [];
    if (!silent) announce(t("vkClosed"));
  }

  // src/ui/binding.js
  var RESET_OPTIONS = {
    textScale: "100",
    colorTheme: "senac",
    colorSaturation: "normal",
    customText: "",
    customHeading: "",
    customBg: "",
    dyslexiaFont: false,
    readingRuler: false,
    highlightLinks: false,
    highlightHeadings: false,
    highlightControls: false,
    enlargeTargets: false,
    textMagnifier: false,
    textSpacing: false,
    lineHeight: 0,
    wordSpacing: 0,
    letterSpacing: 0,
    cursorStyle: "default",
    reducedMotion: false,
    hideImages: false,
    simpleLanguage: false,
    readFocus: false,
    blockFlashing: false,
    strongFocus: false,
    showShortcuts: false,
    muteMedia: false,
    voiceName: "",
    voiceCommands: false,
    voiceCloudConsent: false,
    voiceRate: 1,
    voicePitch: 1,
    voiceVolume: 1
  };
  var FONT_KEYS = [
    "textScale",
    "dyslexiaFont",
    "textSpacing",
    "lineHeight",
    "wordSpacing",
    "letterSpacing"
  ];
  function isEditableTarget(e) {
    const t2 = typeof e.composedPath === "function" ? e.composedPath()[0] : e.target;
    return !!(t2 && (t2.isContentEditable || t2.matches && t2.matches(
      'input, select, textarea, [contenteditable]:not([contenteditable="false"])'
    )));
  }
  function buildUI(ms) {
    ms._host = document.createElement("div");
    ms._host.id = "ms-container";
    document.body.appendChild(ms._host);
    ms._shadow = ms._host.attachShadow({ mode: "open" });
    const styleEl = document.createElement("style");
    styleEl.textContent = getUIStyles(ms._config.position);
    ms._shadow.appendChild(styleEl);
    ms._styleEl = styleEl;
    ms._host.lang = BCP47[getLocale()];
    mountPanelAndFab(ms);
    const s = state_default.get();
    ms._syncSessionChrome();
    ms._simpleNav = createSimpleNav();
    ms._syncSimpleNav();
    if (ms._chrome) ms._chrome.sync(s);
  }
  function mountPanelAndFab(ms) {
    const s = state_default.get();
    ms._panel = createA11yPanel({
      state: s,
      onClose: () => ms._closePanel(),
      onToggleModoSimples: (value) => ms._setModoSimples(value),
      onSetOption: (key, value) => {
        if (key === "reducedMotion") ms._reducedMotionUser = !!value;
        state_default.set({ options: { [key]: value } });
        if (key === "hideImages" && state_default.get().modoSimples) {
          ms._savePreferShowImages(!value);
        }
      },
      onSpeak: () => ms._toggleSpeak(),
      onResetAll: () => ms._resetAll(),
      onSelectProfile: (id) => ms._applyProfile(id),
      onResetFont: () => {
        state_default.set({
          options: Object.fromEntries(
            FONT_KEYS.map((k) => [k, RESET_OPTIONS[k]])
          )
        });
        announce(STRINGS_T.announceResetFont);
      },
      onMoveSide: () => ms._movePanelSide(),
      // F9c: o painel é modal (página inert): fecha o painel antes de mover o foco para o alvo
      onOutlineJump: (el2) => {
        ms._closePanel();
        jumpToElement(el2);
      },
      // F9d: fecha o painel (devolve o foco ao FAB) e abre a grade; Esc volta a esse foco
      onOpenMouseGrid: () => {
        ms._closePanel();
        openMouseGrid();
      },
      // F9e: fecha o painel e liga o teclado virtual (sessão; dock no rodapé)
      onOpenVirtualKeyboard: () => {
        ms._closePanel();
        openVirtualKeyboard();
      },
      brand: ms._config.brand
    });
    ms._shadow.appendChild(ms._panel.element);
    ms._fab = createFab({
      onClick: () => ms._togglePanel(),
      onHide: () => ms._hideWidget()
    });
    ms._shadow.appendChild(ms._fab.element);
    ms._side = ms._loadPanelSide();
    ms._fab.setSide(ms._side);
    ms._panel.setSide(ms._side);
    ms._fab.sync({ panelOpen: s.panelOpen });
    ms._panel.sync(s);
    if (s.panelOpen) {
      ms._panel.open();
      ms._setPageInert(true);
    }
  }
  function rebuildUI(ms) {
    var _a, _b;
    if (!((_a = ms._host) == null ? void 0 : _a.isConnected)) return;
    const wasOpen = state_default.get().panelOpen;
    const focused = ms._shadow.activeElement;
    const hadFocus = !!focused && ms._panel.element.contains(focused);
    if (hadFocus) focused.blur();
    ms._host.lang = BCP47[getLocale()];
    ms._panel.close();
    ms._panel.element.remove();
    ms._fab.element.remove();
    mountPanelAndFab(ms);
    if (ms._chrome) {
      ms._chrome.destroy();
      ms._chrome = null;
      ms._syncSessionChrome();
    }
    if (wasOpen && hadFocus) {
      (_b = ms._panel.element.querySelector("[data-language]")) == null ? void 0 : _b.focus();
    }
  }
  function bindLocaleChange(ms) {
    const onChange = () => rebuildUI(ms);
    document.addEventListener("ms:localechange", onChange);
    return () => document.removeEventListener("ms:localechange", onChange);
  }
  function syncSessionChrome(ms) {
    if (ms._config.sessionBar && !ms._chrome) {
      ms._chrome = createSessionChrome({
        mount: ms._config.mount || {},
        onToggleModoSimples: (value) => ms._setModoSimples(value),
        onOpenPanel: () => ms._openPanel(),
        onSpeak: () => ms._toggleSpeak(),
        onToggleSimpleLanguage: (value) => state_default.set({ options: { simpleLanguage: value } }),
        onToggleHideImages: (hide3) => {
          state_default.set({ options: { hideImages: hide3 } });
          if (state_default.get().modoSimples) ms._savePreferShowImages(!hide3);
        }
      });
      ms._chrome.sync(state_default.get());
    } else if (!ms._config.sessionBar && ms._chrome) {
      ms._chrome.destroy();
      ms._chrome = null;
    }
  }
  function syncSimpleNav(ms) {
    if (!ms._simpleNav) return;
    ms._simpleNav.sync(ms._config.simpleNav);
    if (ms._chrome) ms._chrome.sync(state_default.get());
  }
  function bindEvents(ms) {
    ms._onDocKeydown = (e) => {
      if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.repeat && e.code === "KeyA" && !isEditableTarget(e)) {
        e.preventDefault();
        ms._showWidget();
        return;
      }
      if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.repeat && e.code === "KeyG" && !isEditableTarget(e)) {
        e.preventDefault();
        if (state_default.get().panelOpen) ms._closePanel();
        openMouseGrid();
        return;
      }
      if (e.key === "Escape" && state_default.get().panelOpen) {
        ms._closePanel();
      }
    };
    document.addEventListener("keydown", ms._onDocKeydown);
    ms._onDocClick = (e) => {
      var _a, _b, _c, _d, _e;
      if (!state_default.get().panelOpen) return;
      if (isManualSelectActive()) return;
      if ((_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "#ms-low-confidence-notice")) return;
      const path = typeof e.composedPath === "function" ? e.composedPath() : [];
      if (path.includes(ms._host) || path.includes((_c = ms._panel) == null ? void 0 : _c.element) || path.includes((_d = ms._fab) == null ? void 0 : _d.element)) {
        return;
      }
      if (e.target === ms._host) return;
      if (!((_e = ms._host) == null ? void 0 : _e.contains(e.target)) && e.target !== ms._host) {
        const { clientX, clientY } = e;
        const retargeted = e.target === document.body || e.target === document.documentElement;
        ms._closePanel();
        if (retargeted && e.isTrusted && e.detail > 0) {
          const alvo = document.elementFromPoint(clientX, clientY);
          if (alvo && alvo !== document.body && alvo !== document.documentElement) {
            alvo.click();
            if (alvo.matches(
              'input, select, textarea, [contenteditable]:not([contenteditable="false"])'
            )) {
              alvo.focus();
            }
          }
        }
      }
    };
    document.addEventListener("click", ms._onDocClick, true);
    const removeState = eventBus_default.on("stateChange", ({ prev, next }) => {
      ms._onStateChange(prev, next);
    });
    const removeLocale = bindLocaleChange(ms);
    ms._removeStateListener = () => {
      removeState();
      removeLocale();
    };
    ms._removeSpeakListener = onSpeakingChange(
      (speaking) => ms._syncSpeaking(speaking)
    );
  }
  function togglePanel(ms) {
    state_default.get().panelOpen ? ms._closePanel() : ms._openPanel();
  }
  function openPanel(ms) {
    var _a;
    let opener = document.activeElement;
    while ((_a = opener == null ? void 0 : opener.shadowRoot) == null ? void 0 : _a.activeElement) {
      opener = opener.shadowRoot.activeElement;
    }
    if (opener !== document.body && !ms._panel.element.contains(opener)) {
      ms._panelOpener = opener;
    }
    state_default.set({ panelOpen: true });
    ms._panel.open();
    ms._setPageInert(true);
    ms._fab.sync({ panelOpen: true });
    announce(STRINGS_T.announcePanelOpen);
  }
  function setPageInert(ms, on3) {
    var _a;
    (_a = ms._inertObserver) == null ? void 0 : _a.disconnect();
    ms._inertObserver = null;
    for (const el2 of ms._inerted || []) el2.removeAttribute("inert");
    ms._inerted = [];
    if (!on3) return;
    for (const el2 of document.body.children) ms._inertSibling(el2);
    ms._inertObserver = new MutationObserver((records) => {
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (n.nodeType === 1) ms._inertSibling(n);
        }
      }
    });
    ms._inertObserver.observe(document.body, { childList: true });
  }
  function inertSibling(ms, el2) {
    if (el2 === ms._host || el2.hasAttribute("inert") || el2.hasAttribute("aria-live") || el2.hasAttribute("data-ms-live") || el2.id === "ms-shortcuts-card" || // cartão de atalhos: "Fechar" precisa responder com o painel aberto
    el2.id === "ms-manual-select-banner" || el2.id === "ms-manual-select-highlight") {
      return;
    }
    el2.setAttribute("inert", "");
    ms._inerted.push(el2);
  }
  function closePanel(ms) {
    var _a, _b, _c;
    state_default.set({ panelOpen: false });
    ms._panel.close();
    ms._setPageInert(false);
    ms._fab.sync({ panelOpen: false });
    if (!isManualSelectActive()) {
      const opener = ((_a = ms._panelOpener) == null ? void 0 : _a.isConnected) ? ms._panelOpener : (_b = ms._fab) == null ? void 0 : _b.button;
      (_c = opener == null ? void 0 : opener.focus) == null ? void 0 : _c.call(opener);
    }
    ms._panelOpener = null;
  }
  function toggleSpeak() {
    if (isSpeaking()) {
      stopSpeaking();
      announce(STRINGS_T.announceReadStopped);
    } else {
      speakMainContent();
      announce(STRINGS_T.announceReadStart);
    }
  }
  function syncSpeaking(ms, speaking) {
    const s = state_default.get();
    if (ms._panel) ms._panel.sync(s, { speaking });
    if (ms._chrome) ms._chrome.sync(s, { speaking });
  }
  function resetAll(ms) {
    var _a, _b;
    (_b = (_a = ms._panel) == null ? void 0 : _a.closeOutline) == null ? void 0 : _b.call(_a);
    closeMouseGrid({ restoreFocus: false });
    closeVirtualKeyboard();
    ms._reducedMotionUser = null;
    ms._applyingProfile = true;
    try {
      if (state_default.get().modoSimples) ms._setModoSimples(false);
      state_default.set({
        activeProfile: null,
        profileCustom: false,
        options: { ...RESET_OPTIONS }
      });
      ms._syncReducedMotion();
    } finally {
      ms._applyingProfile = false;
    }
    if (ms._config.persistence) {
      if (ms._config.hostnamePersistence) {
        persistence_default.removeForHost("preferShowImagesInMs");
      } else {
        persistence_default.remove("preferShowImagesInMs");
      }
    }
    announce(STRINGS_T.announceResetAll);
  }
  function applyProfile(ms, id) {
    const turnOff = state_default.get().activeProfile === id;
    const prof = turnOff ? null : getProfile(id);
    if (!turnOff && !prof) return;
    ms._applyingProfile = true;
    try {
      ms._reducedMotionUser = (prof == null ? void 0 : prof.options.reducedMotion) ? true : null;
      if (state_default.get().modoSimples) ms._setModoSimples(false);
      const {
        voiceName,
        voiceRate,
        voicePitch,
        voiceVolume,
        voiceCommands,
        voiceCloudConsent,
        language
      } = state_default.get().options;
      state_default.set({
        activeProfile: prof ? prof.id : null,
        profileCustom: false,
        options: {
          ...RESET_OPTIONS,
          voiceName,
          voiceRate,
          voicePitch,
          voiceVolume,
          voiceCommands,
          voiceCloudConsent,
          language,
          ...prof ? prof.options : {}
        }
      });
      ms._syncReducedMotion();
      if (prof == null ? void 0 : prof.modoSimples) ms._setModoSimples(true);
    } finally {
      ms._applyingProfile = false;
    }
    ms._profileBaseline = state_default.get();
    announce(
      prof ? `${STRINGS_T.profileOnPre}${STRINGS_T[`profile${prof.key}Name`]}${STRINGS_T.profileOnPost}` : STRINGS_T.profileOff
    );
  }
  function movePanelSide(ms) {
    ms._side = ms._side === "left" ? "right" : "left";
    ms._fab.setSide(ms._side);
    ms._panel.setSide(ms._side);
    ms._savePanelSide(ms._side);
    placeShortcutsCard(ms._shortcutsSide());
    announce(ms._side === "left" ? STRINGS_T.announceSideLeft : STRINGS_T.announceSideRight);
  }
  function hideWidget(ms) {
    var _a, _b;
    if (state_default.get().panelOpen) ms._closePanel();
    ms._fab.setHidden(true);
    const main = document.querySelector('main, [role="main"]');
    if (main) {
      const had = main.hasAttribute("tabindex");
      if (!had) main.setAttribute("tabindex", "-1");
      main.addEventListener(
        "blur",
        () => {
          if (!had) main.removeAttribute("tabindex");
        },
        { once: true }
      );
      main.focus({ preventScroll: true });
    } else {
      (_b = (_a = document.activeElement) == null ? void 0 : _a.blur) == null ? void 0 : _b.call(_a);
    }
    announce(STRINGS_T.announceWidgetHidden);
  }
  function showWidget(ms) {
    ms._fab.setHidden(false);
    if (!state_default.get().panelOpen) ms._openPanel();
  }

  // src/heuristics/distractionDetector.js
  function detectDistractions(mainElement, config = defaults_default) {
    var _a;
    const distractions = [];
    const isMsChrome = (el2) => {
      var _a2, _b;
      if (!el2 || !el2.id && !el2.getAttribute) return false;
      if (el2.id === "ms-container" || el2.id === "ms-session-bar" || el2.id === "ms-simples-chrome") {
        return true;
      }
      if ((_a2 = el2.hasAttribute) == null ? void 0 : _a2.call(el2, "data-ms-pills")) return true;
      if ((_b = el2.closest) == null ? void 0 : _b.call(
        el2,
        "#ms-container, #ms-session-bar, #ms-simples-chrome, [data-ms-pills]"
      )) {
        return true;
      }
      return false;
    };
    const seen = /* @__PURE__ */ new Set();
    for (const el2 of queryAll(config.distractionSelectors)) {
      if (isMsChrome(el2)) continue;
      if ((_a = el2.closest) == null ? void 0 : _a.call(el2, '[role="dialog"],[role="alertdialog"],[aria-modal="true"]')) {
        continue;
      }
      if (mainElement && el2.contains(mainElement)) continue;
      if (mainElement && mainElement.contains(el2)) continue;
      if (!seen.has(el2)) {
        seen.add(el2);
        distractions.push(el2);
      }
    }
    return distractions;
  }

  // src/mutator/domMutator.js
  var PAGE_STYLE_ID = "ms-page-styles";
  var LEXEND_LINK_ID = "ms-lexend-font";
  var TEXT_SCALE_CLASSES = [
    "ms-text-scale-100",
    "ms-text-scale-125",
    "ms-text-scale-150",
    "ms-text-scale-175"
  ];
  var THEME_CLASSES = [
    "ms-theme-senac",
    "ms-theme-yellowBlack",
    "ms-theme-darkHigh",
    "ms-theme-soft",
    "ms-theme-mono",
    "ms-theme-lightHigh"
  ];
  var CUSTOM_COLORS3 = {
    text: ["ms-custom-text", "--ms-custom-text"],
    heading: ["ms-custom-heading", "--ms-custom-heading"],
    bg: ["ms-custom-bg", "--ms-custom-bg"],
    link: ["ms-custom-link", "--ms-custom-link"]
  };
  var TYPO_VARS = {
    lineHeight: ["ms-lh", "--ms-lh", ""],
    wordSpacing: ["ms-ws", "--ms-ws", "em"],
    letterSpacing: ["ms-ls", "--ms-ls", "em"]
  };
  var OPTION_FLAG_CLASSES = [
    "ms-sat-low",
    "ms-sat-high",
    "ms-cursor-white",
    "ms-cursor-black",
    ...Object.values(CUSTOM_COLORS3).map(([cls]) => cls),
    ...Object.values(TYPO_VARS).map(([cls]) => cls),
    "ms-dyslexia-font",
    "ms-highlight-links",
    "ms-highlight-headings",
    "ms-highlight-controls",
    "ms-enlarge-targets",
    "ms-text-spacing",
    "ms-reduced-motion",
    "ms-block-flashing",
    "ms-strong-focus",
    "ms-hide-images",
    "ms-reading-ruler",
    "ms-simple-language"
  ];
  var _mainElement = null;
  var _distractionElements = [];
  var _manualPrincipal = null;
  var _manualPath = "";
  var _holdPrincipal = false;
  function holdPrincipal(on3) {
    _holdPrincipal = !!on3;
  }
  function injectPageStyles(css = "") {
    if (!css || document.getElementById(PAGE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PAGE_STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }
  var DEFAULT_LEXEND_URL = "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap";
  var _fontUrl = null;
  function setLexendFontUrl(url) {
    _fontUrl = url === void 0 ? null : url;
  }
  function ensureLexendFont() {
    if (typeof document === "undefined") return;
    if (_fontUrl === false) return;
    if (document.getElementById(LEXEND_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = LEXEND_LINK_ID;
    link.rel = "stylesheet";
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    link.href = _fontUrl || DEFAULT_LEXEND_URL;
    document.head.appendChild(link);
  }
  function scan(config) {
    const result = detectMainContent(config);
    _mainElement = result.element;
    _distractionElements = detectDistractions(_mainElement, config);
    return { mainElement: _mainElement, confidence: result.confidence };
  }
  function setHostCursor(on3) {
    var _a;
    const host = (_a = document.querySelector) == null ? void 0 : _a.call(document, "#ms-container");
    if (!host) return;
    if (on3) host.setAttribute("data-ms-cursor", "");
    else host.removeAttribute("data-ms-cursor");
  }
  function setHostFlag(name, on3) {
    var _a;
    const host = (_a = document.querySelector) == null ? void 0 : _a.call(document, "#ms-container");
    if (!host) return;
    if (on3) host.setAttribute(name, "");
    else host.removeAttribute(name);
  }
  function applyOptions(state2) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const html = document.documentElement;
    const opts = state2.options || {};
    html.classList.remove(...TEXT_SCALE_CLASSES);
    const scale = opts.textScale || "100";
    if (scale !== "100") html.classList.add(`ms-text-scale-${scale}`);
    html.classList.remove(...THEME_CLASSES);
    const theme2 = opts.colorTheme || "senac";
    html.classList.add(`ms-theme-${theme2}`);
    html.classList.toggle("ms-sat-low", opts.colorSaturation === "low");
    html.classList.toggle("ms-sat-high", opts.colorSaturation === "high");
    html.classList.toggle("ms-cursor-white", opts.cursorStyle === "bigWhite");
    html.classList.toggle("ms-cursor-black", opts.cursorStyle === "bigBlack");
    setHostCursor(
      opts.cursorStyle === "bigWhite" || opts.cursorStyle === "bigBlack"
    );
    const eff = effectiveColors(opts);
    for (const [key, [cls, prop]] of Object.entries(CUSTOM_COLORS3)) {
      const on3 = !!eff[key];
      html.classList.toggle(cls, on3);
      if (on3) (_b = (_a = html.style) == null ? void 0 : _a.setProperty) == null ? void 0 : _b.call(_a, prop, eff[key]);
      else (_d = (_c = html.style) == null ? void 0 : _c.removeProperty) == null ? void 0 : _d.call(_c, prop);
    }
    html.classList.toggle("ms-dyslexia-font", !!opts.dyslexiaFont);
    if (opts.dyslexiaFont) ensureLexendFont();
    html.classList.toggle("ms-highlight-links", !!opts.highlightLinks);
    html.classList.toggle("ms-highlight-headings", !!opts.highlightHeadings);
    html.classList.toggle("ms-highlight-controls", !!opts.highlightControls);
    html.classList.toggle("ms-enlarge-targets", !!opts.enlargeTargets);
    html.classList.toggle("ms-text-spacing", !!opts.textSpacing);
    for (const [key, [cls, prop, unit]] of Object.entries(TYPO_VARS)) {
      const v = clampTypo(key, opts[key]);
      html.classList.toggle(cls, v > 0);
      if (v > 0) (_f = (_e = html.style) == null ? void 0 : _e.setProperty) == null ? void 0 : _f.call(_e, prop, `${v}${unit}`);
      else (_h = (_g = html.style) == null ? void 0 : _g.removeProperty) == null ? void 0 : _h.call(_g, prop);
    }
    html.classList.toggle("ms-reduced-motion", !!opts.reducedMotion);
    html.classList.toggle("ms-block-flashing", !!opts.blockFlashing);
    html.classList.toggle("ms-strong-focus", !!opts.strongFocus);
    setHostFlag("data-ms-noflash", !!opts.blockFlashing);
    html.classList.toggle("ms-hide-images", !!opts.hideImages);
    html.classList.toggle("ms-reading-ruler", !!opts.readingRuler);
    html.classList.toggle("ms-simple-language", !!opts.simpleLanguage);
  }
  function applyModoSimples(state2, config) {
    if (!_mainElement) scan(config);
    if (_mainElement) _mainElement.setAttribute("data-ms-principal", "");
    _distractionElements.forEach(
      (el2) => el2.setAttribute("data-ms-hidden", "true")
    );
    document.documentElement.classList.add("ms-ativo");
    applyOptions(state2);
  }
  function revertModoSimples() {
    document.querySelectorAll('[data-ms-hidden="true"]').forEach((el2) => {
      el2.removeAttribute("data-ms-hidden");
    });
    document.querySelectorAll("[data-ms-principal]").forEach((el2) => {
      el2.removeAttribute("data-ms-principal");
    });
    document.documentElement.classList.remove("ms-ativo");
    _mainElement = null;
    _distractionElements = [];
    _manualPrincipal = null;
    _manualPath = "";
    _holdPrincipal = false;
  }
  function revert() {
    var _a, _b;
    revertModoSimples();
    setHostCursor(false);
    setHostFlag("data-ms-noflash", false);
    document.documentElement.classList.remove(
      ...TEXT_SCALE_CLASSES,
      ...THEME_CLASSES,
      ...OPTION_FLAG_CLASSES
    );
    for (const [, prop] of [
      ...Object.values(CUSTOM_COLORS3),
      ...Object.values(TYPO_VARS)
    ]) {
      (_b = (_a = document.documentElement.style) == null ? void 0 : _a.removeProperty) == null ? void 0 : _b.call(_a, prop);
    }
  }
  function setPrincipal(el2, config) {
    document.querySelectorAll("[data-ms-principal]").forEach((node) => {
      node.removeAttribute("data-ms-principal");
    });
    _mainElement = el2;
    _manualPrincipal = el2;
    _manualPath = buildCssPath(el2);
    _holdPrincipal = false;
    el2.setAttribute("data-ms-principal", "");
    _distractionElements = detectDistractions(_mainElement, config);
    document.querySelectorAll('[data-ms-hidden="true"]').forEach((node) => {
      node.removeAttribute("data-ms-hidden");
    });
    _distractionElements.forEach(
      (node) => node.setAttribute("data-ms-hidden", "true")
    );
  }
  function reprocess(state2, config) {
    if (!state2.modoSimples) {
      applyOptions(state2);
      return;
    }
    if (_holdPrincipal || isManualSelectActive()) {
      applyOptions(state2);
      return;
    }
    const manual = findManualPrincipal();
    revertModoSimples();
    if (manual) {
      setPrincipal(manual, config);
      document.documentElement.classList.add("ms-ativo");
      applyOptions(state2);
      return;
    }
    scan(config);
    applyModoSimples(state2, config);
  }
  function findManualPrincipal() {
    if (!_manualPrincipal) return null;
    if (document.contains(_manualPrincipal)) return _manualPrincipal;
    if (!_manualPath) return null;
    try {
      return document.querySelector(_manualPath);
    } catch (_) {
      return null;
    }
  }

  // src/mutator/domObserver.js
  var OWN_SELECTOR = [
    "#ms-container",
    "#ms-session-bar",
    "#ms-simples-chrome",
    "#ms-manual-select-banner",
    "#ms-reading-ruler",
    "#ms-text-magnifier",
    "[data-ms-media-badge]",
    "#ms-shortcuts-card",
    "#ms-mouse-grid",
    "#ms-virtual-keyboard",
    "[data-ms-pills][data-ms-injected]",
    "[data-ms-live]"
  ].join(",");
  function isOwnNode(node) {
    return !!node && node.nodeType === 1 && typeof node.closest === "function" && !!node.closest(OWN_SELECTOR);
  }
  function isRelevantMutation(m) {
    if (m.type !== "childList" || m.addedNodes.length === 0) return false;
    if (isOwnNode(m.target)) return false;
    for (const node of m.addedNodes) {
      if (!isOwnNode(node)) return true;
    }
    return false;
  }
  var _observer = null;
  var _debounceTimer = null;
  var _pendingSince = 0;
  var _idleHandle = null;
  var DEFAULT_DEBOUNCE = 300;
  var DEFAULT_MAX_WAIT = 1500;
  function schedule2(run, debounce, maxWait) {
    const now = Date.now();
    if (_debounceTimer === null) _pendingSince = now;
    clearTimeout(_debounceTimer);
    const remaining = Math.max(0, maxWait - (now - _pendingSince));
    _debounceTimer = setTimeout(
      () => {
        _debounceTimer = null;
        runWhenIdle(run);
      },
      Math.min(debounce, remaining)
    );
  }
  function runWhenIdle(fn) {
    if (typeof requestIdleCallback === "function") {
      _idleHandle = requestIdleCallback(
        () => {
          _idleHandle = null;
          fn();
        },
        { timeout: 500 }
      );
    } else {
      fn();
    }
  }
  function startObserving(getState, config) {
    if (_observer) return;
    const getConfig = () => typeof config === "function" ? config() : config;
    _observer = new MutationObserver((mutations) => {
      var _a, _b;
      if (!mutations.some(isRelevantMutation)) return;
      const state2 = getState();
      if (!state2.modoSimples) return;
      const cfg = getConfig();
      schedule2(
        () => {
          if (_observer) reprocess(getState(), getConfig());
        },
        (_a = cfg.reprocessDebounce) != null ? _a : DEFAULT_DEBOUNCE,
        (_b = cfg.reprocessMaxWait) != null ? _b : DEFAULT_MAX_WAIT
      );
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  }
  function stopObserving() {
    if (_observer) {
      _observer.disconnect();
      _observer = null;
    }
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
    if (_idleHandle !== null && typeof cancelIdleCallback === "function") {
      cancelIdleCallback(_idleHandle);
    }
    _idleHandle = null;
  }

  // src/features/readingRuler.js
  var RULER_ID = "ms-reading-ruler";
  var RULER_HEIGHT = 48;
  var _ruler = null;
  var _raf2 = null;
  var _pendingY = 0;
  var _onPointer2 = null;
  var _onTouch2 = null;
  var _onFocus = null;
  function moveTo(clientY) {
    _pendingY = clientY;
    if (_raf2 !== null) return;
    _raf2 = requestAnimationFrame(() => {
      _raf2 = null;
      if (!_ruler) return;
      const y = _pendingY - RULER_HEIGHT / 2;
      _ruler.style.transform = `translateY(${Math.max(0, y)}px)`;
      _ruler.style.visibility = "visible";
    });
  }
  function startReadingRuler() {
    if (_ruler) return;
    _ruler = document.createElement("div");
    _ruler.id = RULER_ID;
    _ruler.setAttribute("aria-hidden", "true");
    Object.assign(_ruler.style, {
      position: "fixed",
      left: "0",
      right: "0",
      top: "0",
      height: `${RULER_HEIGHT}px`,
      pointerEvents: "none",
      zIndex: "2147483646",
      background: "rgba(245, 166, 35, 0.22)",
      borderTop: "2px solid #F5A623",
      borderBottom: "2px solid #F5A623",
      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.35)",
      transform: "translateY(-100%)",
      transition: "none",
      // sem posição conhecida não há janela: não escurece a página (IMP-08)
      visibility: "hidden"
    });
    document.documentElement.appendChild(_ruler);
    _onPointer2 = (e) => moveTo(e.clientY);
    _onTouch2 = (e) => {
      var _a;
      const t2 = (_a = e.touches) == null ? void 0 : _a[0];
      if (t2) moveTo(t2.clientY);
    };
    _onFocus = (e) => {
      const el2 = e.target;
      if (!(el2 == null ? void 0 : el2.getBoundingClientRect) || el2 === document.body) return;
      const r = el2.getBoundingClientRect();
      moveTo(r.top + r.height / 2);
    };
    document.addEventListener("pointermove", _onPointer2, { passive: true });
    document.addEventListener("touchstart", _onTouch2, { passive: true });
    document.addEventListener("touchmove", _onTouch2, { passive: true });
    document.addEventListener("focusin", _onFocus);
  }
  function stopReadingRuler() {
    if (_onPointer2) {
      document.removeEventListener("pointermove", _onPointer2);
      _onPointer2 = null;
    }
    if (_onTouch2) {
      document.removeEventListener("touchstart", _onTouch2);
      document.removeEventListener("touchmove", _onTouch2);
      _onTouch2 = null;
    }
    if (_onFocus) {
      document.removeEventListener("focusin", _onFocus);
      _onFocus = null;
    }
    if (_raf2 !== null) {
      cancelAnimationFrame(_raf2);
      _raf2 = null;
    }
    if (_ruler == null ? void 0 : _ruler.parentNode) {
      _ruler.parentNode.removeChild(_ruler);
    }
    _ruler = null;
  }

  // src/features/mediaMute.js
  var OWN_HOST = "#ms-container";
  var BADGE_ATTR = "data-ms-media-badge";
  var MEDIA_SELECTOR = "video, audio";
  var VIDEO_HOSTS = /(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv|tiktok\.com|wistia\.com|wistia\.net|jwplatform\.com|brightcove\.net)$/i;
  var _prior = /* @__PURE__ */ new WeakMap();
  var _tracked = /* @__PURE__ */ new Set();
  var _badges = /* @__PURE__ */ new Map();
  var _observer2 = null;
  var _on2 = false;
  var _roots = /* @__PURE__ */ new Set();
  var userActive = () => {
    var _a;
    return !!((_a = navigator.userActivation) == null ? void 0 : _a.isActive);
  };
  function isOwn(el2) {
    var _a;
    return !!((_a = el2.closest) == null ? void 0 : _a.call(el2, `${OWN_HOST}, [${BADGE_ATTR}]`));
  }
  function walk(root, visit) {
    const els = root.nodeType === 1 ? [root, ...root.querySelectorAll("*")] : Array.from(root.querySelectorAll("*"));
    for (const el2 of els) {
      if (el2.id === "ms-container" || isOwn(el2)) continue;
      visit(el2);
      if (el2.shadowRoot) {
        if (_on2) watchRoot(el2.shadowRoot);
        walk(el2.shadowRoot, visit);
      }
    }
  }
  function watchRoot(sr) {
    if (_roots.has(sr)) return;
    _roots.add(sr);
    _observer2 == null ? void 0 : _observer2.observe(sr, { childList: true, subtree: true });
    sr.addEventListener("play", onPlay, true);
    sr.addEventListener("volumechange", onVolume, true);
  }
  function muteOne(el2) {
    if (!_prior.has(el2)) {
      _prior.set(el2, el2.muted);
      _tracked.add(new WeakRef(el2));
    }
    el2.muted = true;
    el2.removeAttribute("autoplay");
    el2.autoplay = false;
    if (!el2.paused) el2.pause();
  }
  function restoreMedia() {
    for (const ref of _tracked) {
      const el2 = ref.deref();
      if (el2 && _prior.has(el2)) {
        el2.muted = _prior.get(el2);
        _prior.delete(el2);
      }
    }
    _tracked.clear();
  }
  function isForeignVideoFrame(el2) {
    if (el2.tagName !== "IFRAME") return false;
    let u;
    try {
      u = new URL(el2.getAttribute("src") || "", location.href);
    } catch (_) {
      return false;
    }
    if (u.origin === location.origin) return false;
    return VIDEO_HOSTS.test(u.hostname) || /autoplay/i.test(el2.getAttribute("allow") || "");
  }
  function placeBadge(frame, badge) {
    const r = frame.getBoundingClientRect();
    Object.assign(badge.style, {
      top: `${r.top + window.scrollY + 8}px`,
      left: `${r.left + window.scrollX + 8}px`,
      maxWidth: `${Math.max(120, r.width - 16)}px`
    });
  }
  function badgeFor(frame) {
    if (_badges.has(frame)) return;
    const r = frame.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const badge = document.createElement("div");
    badge.setAttribute(BADGE_ATTR, "");
    badge.setAttribute("role", "note");
    badge.textContent = t("mediaOtherSiteNotice");
    Object.assign(badge.style, {
      position: "absolute",
      zIndex: "2147483644",
      pointerEvents: "none",
      // não bloqueia cliques no vídeo
      padding: "0.5rem 0.75rem",
      background: "#0B2C5F",
      color: "#fff",
      font: "600 0.9rem/1.3 system-ui, sans-serif",
      borderRadius: "6px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
    });
    document.body.appendChild(badge);
    placeBadge(frame, badge);
    _badges.set(frame, badge);
  }
  function scan2(root) {
    walk(root, (el2) => {
      var _a;
      if ((_a = el2.matches) == null ? void 0 : _a.call(el2, MEDIA_SELECTOR)) muteOne(el2);
      else if (isForeignVideoFrame(el2)) badgeFor(el2);
    });
  }
  function relayout() {
    for (const [frame, badge] of _badges) {
      if (frame.isConnected) placeBadge(frame, badge);
      else {
        badge.remove();
        _badges.delete(frame);
      }
    }
  }
  function onPlay(e) {
    var _a;
    const el2 = e.target;
    if (!((_a = el2 == null ? void 0 : el2.matches) == null ? void 0 : _a.call(el2, MEDIA_SELECTOR)) || isOwn(el2)) return;
    if (!_prior.has(el2)) {
      _prior.set(el2, el2.muted);
      _tracked.add(new WeakRef(el2));
    }
    el2.muted = true;
    if (!userActive()) el2.pause();
  }
  function onVolume(e) {
    var _a;
    const el2 = e.target;
    if (!((_a = el2 == null ? void 0 : el2.matches) == null ? void 0 : _a.call(el2, MEDIA_SELECTOR)) || isOwn(el2)) return;
    if (!el2.muted && !userActive()) el2.muted = true;
    else if (!el2.muted) _prior.delete(el2);
  }
  function startMediaMute() {
    if (_on2) return;
    _on2 = true;
    document.addEventListener("play", onPlay, true);
    document.addEventListener("volumechange", onVolume, true);
    window.addEventListener("resize", relayout);
    _observer2 = new MutationObserver((records) => {
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (n.nodeType === 1 && !isOwn(n)) scan2(n);
        }
      }
      relayout();
    });
    _observer2.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    scan2(document);
  }
  function stopMediaMute() {
    if (!_on2) return;
    _on2 = false;
    _observer2 == null ? void 0 : _observer2.disconnect();
    _observer2 = null;
    document.removeEventListener("play", onPlay, true);
    document.removeEventListener("volumechange", onVolume, true);
    for (const sr of _roots) {
      sr.removeEventListener("play", onPlay, true);
      sr.removeEventListener("volumechange", onVolume, true);
    }
    _roots.clear();
    window.removeEventListener("resize", relayout);
    for (const badge of _badges.values()) badge.remove();
    _badges.clear();
    restoreMedia();
  }

  // src/features/flashBlock.js
  var OWN_HOST2 = "#ms-container";
  var STILL_ATTR = "data-ms-gif-still";
  var MEDIA_SELECTOR2 = "video";
  var COPY_STYLE = [
    "margin",
    "float",
    "borderRadius",
    "border",
    "boxSizing",
    "verticalAlign",
    "top",
    "left",
    "right",
    "bottom"
  ];
  var _stills = /* @__PURE__ */ new Map();
  var _revealed = /* @__PURE__ */ new WeakSet();
  var _marquees = /* @__PURE__ */ new Set();
  var _autoplayed = /* @__PURE__ */ new Set();
  var _observer3 = null;
  var _on3 = false;
  var isOwn2 = (el2) => {
    var _a;
    return !!((_a = el2.closest) == null ? void 0 : _a.call(el2, OWN_HOST2));
  };
  var userActive2 = () => {
    var _a;
    return !!((_a = navigator.userActivation) == null ? void 0 : _a.isActive);
  };
  function isGif(img) {
    const src = img.currentSrc || img.getAttribute("src") || "";
    if (/^data:image\/gif/i.test(src)) return true;
    try {
      return /\.gif$/i.test(new URL(src, location.href).pathname);
    } catch (_) {
      return false;
    }
  }
  function reveal(btn) {
    var _a;
    const img = _stills.get(btn);
    if (!img) return;
    _revealed.add(img);
    _stills.delete(btn);
    btn.replaceWith(img);
    if (!img.hasAttribute("tabindex")) {
      img.setAttribute("tabindex", "-1");
      img.addEventListener("blur", () => img.removeAttribute("tabindex"), {
        once: true
      });
    }
    (_a = img.focus) == null ? void 0 : _a.call(img, { preventScroll: true });
  }
  function freeze2(img) {
    if (!_on3 || _revealed.has(img) || !img.isConnected || isOwn2(img)) return;
    if (!img.complete || !img.naturalWidth) return;
    const rect = img.getBoundingClientRect();
    const w = Math.round(rect.width || img.naturalWidth);
    const h = Math.round(rect.height || img.naturalHeight);
    const cs = getComputedStyle(img);
    const interactive = !img.closest('a, button, [role="button"], [role="link"]');
    const alt = img.getAttribute("alt") || "";
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      width: "100%",
      height: "100%",
      display: "block"
    });
    const first = document.createElement("img");
    first.onload = () => {
      var _a;
      return (_a = canvas.getContext("2d")) == null ? void 0 : _a.drawImage(first, 0, 0);
    };
    first.src = img.currentSrc || img.src;
    const still = document.createElement(interactive ? "button" : "span");
    still.className = img.className;
    still.setAttribute(STILL_ATTR, "");
    if (interactive) {
      still.type = "button";
      still.setAttribute(
        "aria-label",
        alt ? `${t("gifShowLabel")}: ${alt}` : t("gifShowLabel")
      );
    } else if (alt) {
      still.setAttribute("role", "img");
      still.setAttribute("aria-label", alt);
    } else {
      still.setAttribute("aria-hidden", "true");
    }
    for (const p of COPY_STYLE) still.style[p] = cs[p];
    Object.assign(still.style, {
      position: cs.position === "static" ? "relative" : cs.position,
      display: cs.display === "inline" ? "inline-block" : cs.display,
      width: `${w}px`,
      height: "auto",
      aspectRatio: `${w} / ${h}`,
      // redimensionar não distorce
      maxWidth: "100%",
      padding: "0",
      background: "none",
      cursor: interactive ? "pointer" : "inherit"
    });
    if (cs.borderStyle === "none") still.style.border = "0";
    still.append(canvas);
    if (interactive) {
      const tag = document.createElement("span");
      tag.setAttribute("aria-hidden", "true");
      tag.textContent = `\u25B6 ${t("gifShowLabel")}`;
      Object.assign(tag.style, {
        position: "absolute",
        left: "6px",
        bottom: "6px",
        padding: "0.2rem 0.5rem",
        background: "#0B2C5F",
        color: "#fff",
        font: "600 0.85rem/1.2 system-ui, sans-serif",
        borderRadius: "4px"
      });
      still.append(tag);
      still.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        reveal(still);
      });
    }
    _stills.set(still, img);
    img.replaceWith(still);
  }
  function handleImg(img) {
    if (!isGif(img) || _revealed.has(img)) return;
    if (img.complete && img.naturalWidth) freeze2(img);
    else img.addEventListener("load", () => freeze2(img), { once: true });
  }
  function handleMarquee(m) {
    if (typeof m.stop !== "function" || _marquees.has(m)) return;
    m.stop();
    _marquees.add(m);
  }
  function handleMedia(el2) {
    if (!el2.hasAttribute("autoplay") && !el2.autoplay) return;
    el2.removeAttribute("autoplay");
    el2.autoplay = false;
    _autoplayed.add(el2);
    if (!el2.paused) el2.pause();
  }
  function onPlay2(e) {
    var _a;
    const el2 = e.target;
    if (!((_a = el2 == null ? void 0 : el2.matches) == null ? void 0 : _a.call(el2, MEDIA_SELECTOR2)) || isOwn2(el2)) return;
    if (!userActive2()) el2.pause();
  }
  function scan3(root) {
    var _a;
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    const all = root.nodeType === 1 ? [root, ...root.querySelectorAll("*")] : root.querySelectorAll("*");
    for (const el2 of all) {
      if (el2.id === "ms-container" || isOwn2(el2)) continue;
      if (el2.tagName === "IMG") handleImg(el2);
      else if (el2.tagName === "MARQUEE") handleMarquee(el2);
      else if ((_a = el2.matches) == null ? void 0 : _a.call(el2, MEDIA_SELECTOR2)) handleMedia(el2);
    }
  }
  function startFlashBlock() {
    if (_on3) return;
    _on3 = true;
    document.addEventListener("play", onPlay2, true);
    _observer3 = new MutationObserver((records) => {
      var _a;
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (n.nodeType === 1 && !isOwn2(n) && !((_a = n.hasAttribute) == null ? void 0 : _a.call(n, STILL_ATTR))) {
            scan3(n);
          }
        }
      }
    });
    _observer3.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    scan3(document);
  }
  function stopFlashBlock() {
    var _a;
    if (!_on3) return;
    _on3 = false;
    _observer3 == null ? void 0 : _observer3.disconnect();
    _observer3 = null;
    document.removeEventListener("play", onPlay2, true);
    for (const [still, img] of _stills) still.replaceWith(img);
    _stills.clear();
    _revealed = /* @__PURE__ */ new WeakSet();
    for (const m of _marquees) (_a = m.start) == null ? void 0 : _a.call(m);
    _marquees.clear();
    for (const el2 of _autoplayed) el2.setAttribute("autoplay", "");
    _autoplayed.clear();
  }

  // src/modo-simples.js
  var ModoSimples = class {
    constructor(userConfig = {}) {
      this._config = mergeConfig(defaults_default, userConfig);
      this._host = null;
      this._shadow = null;
      this._fab = null;
      this._panel = null;
      this._chrome = null;
      this._simpleNav = null;
      this._removeMotionListener = null;
      this._removeStateListener = null;
      this._onDocKeydown = null;
      this._onDocClick = null;
      this._removeSpeakListener = null;
      this._styleEl = null;
      this._reducedMotionUser = null;
      this._hideImagesBeforeMs = null;
      this._lastPersisted = null;
      this._initialized = false;
    }
    // ── Lifecycle ──────────────────────────────────────────────────────────────
    init() {
      if (this._initialized) return;
      this._initialized = true;
      this._loadPersistedState();
      setLocale(state_default.get().options.language);
      injectPageStyles(getPageStyles());
      setLexendFontUrl(this._config.fontUrl);
      this._buildUI();
      this._bindEvents();
      startObserving(
        () => state_default.get(),
        () => this._config
        // getter: configure() troca o objeto de config (IMP-16)
      );
      this._syncReducedMotion();
      this._removeMotionListener = onReducedMotionChange(
        () => this._syncReducedMotion()
      );
      const currentState = state_default.get();
      applyOptions(currentState);
      if (currentState.options.readingRuler) {
        startReadingRuler();
      }
      if (currentState.options.readFocus) startFocusReader();
      if (currentState.options.voiceCommands) this._startVoiceCommands();
      if (currentState.options.muteMedia) startMediaMute();
      if (currentState.options.blockFlashing) startFlashBlock();
      if (currentState.options.textMagnifier) startTextMagnifier();
      if (currentState.options.showShortcuts) {
        startShortcutsCard({ side: this._shortcutsSide() });
      }
      if (currentState.modoSimples) {
        this._activateModoSimples(currentState, { announce: false });
        this._announceRestoredOnce();
      }
      this._profileBaseline = state_default.get();
    }
    /** Delegate: ver applyProfile() em src/ui/binding.js. */
    _applyProfile(id) {
      applyProfile(this, id);
    }
    /** Cartão de atalhos fica do lado oposto ao botão flutuante. */
    _shortcutsSide() {
      var _a;
      const fab = (_a = this._side) != null ? _a : String(this._config.position || "").endsWith("left") ? "left" : "right";
      return fab === "left" ? "right" : "left";
    }
    /**
     * Modo restaurado em outra página: silêncio a cada navegação, mas uma única vez por sessão
     * avisa que continua ligado (UX-19). Sem sessionStorage, fica em silêncio.
     */
    /** F10d: escolhe o modo de reconhecimento e começa a escutar (a nuvem exige consentimento). */
    async _startVoiceCommands() {
      const run = this._voiceRun = (this._voiceRun || 0) + 1;
      let mode = await getRecognitionMode();
      if (run !== this._voiceRun || !state_default.get().options.voiceCommands) return;
      if (mode === "download" && state_default.get().options.voiceCloudConsent === true) {
        mode = "cloud";
      }
      this._voiceMode = mode;
      startVoiceCommands({
        mode,
        onCommand: (c) => this._runVoiceCommand(c),
        onStatus: (s) => this._voiceStatus(s)
      });
    }
    /** Último status dos comandos de voz (começa 'stopped'). */
    get voiceStatus() {
      return this._voiceStatusLast || "stopped";
    }
    /**
     * Avisa a UI de toda mudança de status dos comandos de voz:
     * 'listening'|'stopped'|'blocked'|'no-mic'|'needs-consent'|'needs-model'|'unsupported'|'error'.
     * @param {(status: string) => void} cb
     * @returns {() => void} cancela o registro
     */
    onVoiceStatus(cb) {
      (this._voiceListeners || (this._voiceListeners = /* @__PURE__ */ new Set())).add(cb);
      return () => this._voiceListeners.delete(cb);
    }
    _voiceStatus(s) {
      this._voiceStatusLast = s;
      for (const cb of Array.from(this._voiceListeners || [])) {
        try {
          cb(s);
        } catch (_) {
        }
      }
      const statusKey = `status_${s}`;
      if (t(statusKey) !== statusKey) announce(t(statusKey));
      if ([
        "blocked",
        "needs-consent",
        "needs-model",
        "unsupported",
        "error",
        "no-mic"
      ].includes(s)) {
        state_default.set({ options: { voiceCommands: false } });
      }
    }
    _runVoiceCommand({ action }) {
      const o = state_default.get().options;
      const bump = (d) => state_default.set({
        options: {
          voiceRate: clampVoice(
            "rate",
            Math.round((o.voiceRate + d) * 10) / 10
          )
        }
      });
      const scroll = (dir) => window.scrollBy({
        top: dir * Math.round(window.innerHeight * 0.8),
        behavior: o.reducedMotion ? "auto" : "smooth"
      });
      switch (action) {
        case "read":
          speakMainContent();
          break;
        case "stop":
          stopSpeaking();
          break;
        case "pause":
          pauseSpeaking();
          break;
        case "resume":
          resumeSpeaking();
          break;
        case "faster":
          bump(0.1);
          break;
        case "slower":
          bump(-0.1);
          break;
        case "scrollDown":
          scroll(1);
          break;
        case "scrollUp":
          scroll(-1);
          break;
        case "msOn":
          this._setModoSimples(true);
          break;
        case "msOff":
          this._setModoSimples(false);
          break;
        case "panelOpen":
          if (!state_default.get().panelOpen) this._openPanel();
          break;
        case "panelClose":
          if (state_default.get().panelOpen) this._closePanel();
          break;
        case "help": {
          if (typeof speechSynthesis === "undefined") break;
          stopSpeaking();
          const u = new SpeechSynthesisUtterance(t("helpSpoken"));
          applyVoice(u, o);
          speechSynthesis.speak(u);
          break;
        }
      }
    }
    _announceRestoredOnce() {
      try {
        if (sessionStorage.getItem("ms_restoreAnnounced")) return;
        sessionStorage.setItem("ms_restoreAnnounced", "1");
      } catch (_) {
        return;
      }
      announce(t("announceStillOn"));
    }
    destroy() {
      var _a, _b, _c, _d;
      if (!this._initialized) return;
      if (this._removeSpeakListener) {
        this._removeSpeakListener();
        this._removeSpeakListener = null;
      }
      stopReadingRuler();
      stopFocusReader();
      stopMediaMute();
      stopFlashBlock();
      stopTextMagnifier();
      hideShortcutsCard();
      this._voiceRun = (this._voiceRun || 0) + 1;
      stopVoiceCommands();
      (_a = this._voiceListeners) == null ? void 0 : _a.clear();
      this._voiceStatusLast = "stopped";
      stopSpeaking();
      stopManualSelect();
      (_c = (_b = this._panel) == null ? void 0 : _b.closeOutline) == null ? void 0 : _c.call(_b);
      closeMouseGrid({ restoreFocus: false, silent: true });
      closeVirtualKeyboard({ silent: true });
      this._setPageInert(false);
      revert();
      stopObserving();
      if (this._removeMotionListener) {
        this._removeMotionListener();
        this._removeMotionListener = null;
      }
      if (this._removeStateListener) {
        this._removeStateListener();
        this._removeStateListener = null;
      }
      if (this._onDocKeydown) {
        document.removeEventListener("keydown", this._onDocKeydown);
        this._onDocKeydown = null;
      }
      if (this._onDocClick) {
        document.removeEventListener("click", this._onDocClick, true);
        this._onDocClick = null;
      }
      if (this._simpleNav) {
        this._simpleNav.destroy();
        this._simpleNav = null;
      }
      if (this._chrome) {
        this._chrome.destroy();
        this._chrome = null;
      }
      if ((_d = this._host) == null ? void 0 : _d.parentNode) this._host.parentNode.removeChild(this._host);
      const pageStyle = document.getElementById("ms-page-styles");
      if (pageStyle == null ? void 0 : pageStyle.parentNode) pageStyle.parentNode.removeChild(pageStyle);
      const lexend = document.getElementById("ms-lexend-font");
      if (lexend == null ? void 0 : lexend.parentNode) lexend.parentNode.removeChild(lexend);
      state_default.reset();
      this._initialized = false;
    }
    // ── API pública ────────────────────────────────────────────────────────────
    enable() {
      this._setModoSimples(true);
    }
    disable() {
      this._setModoSimples(false);
    }
    toggle() {
      this._setModoSimples(!state_default.get().modoSimples);
    }
    /**
     * Ativa/desativa Modo Simples.
     * Ao ativar: linguagem simples + ocultar imagens (respeita preferência salva de “mostrar imagens”).
     * Ao desativar: desliga linguagem simples; imagens voltam (MS não deixa “órfã” a flag).
     * Preferências do painel (tema, escala, Lexend, etc.) permanecem.
     * @param {boolean} on
     */
    _setModoSimples(on3) {
      if (on3) {
        const preferShow = this._loadPreferShowImages();
        if (!state_default.get().modoSimples) {
          this._saveHideImagesBeforeMs(state_default.get().options.hideImages);
        }
        state_default.set({
          modoSimples: true,
          options: {
            // só liga se a página tem pares data-ms-plain/simple (senão não há o que simplificar)
            simpleLanguage: hasSimpleLanguagePairs(),
            hideImages: !preferShow
          }
        });
      } else {
        state_default.set({
          modoSimples: false,
          options: {
            simpleLanguage: false,
            hideImages: this._takeHideImagesBeforeMs()
          }
        });
      }
    }
    /** Guarda (memória + storage) se as imagens estavam ocultas antes de ligar o MS. */
    _saveHideImagesBeforeMs(hide3) {
      saveHideImagesBeforeMs(this, hide3);
    }
    /** Lê e esquece o valor guardado; sem registro (ex.: MS já estava ligado) = imagens visíveis. */
    _takeHideImagesBeforeMs() {
      return takeHideImagesBeforeMs(this);
    }
    /** Delegate: ver loadPreferShowImages() em src/core/instancePersistence.js. */
    _loadPreferShowImages() {
      return loadPreferShowImages(this);
    }
    /** Delegate: ver savePreferShowImages() em src/core/instancePersistence.js. */
    _savePreferShowImages(show2) {
      savePreferShowImages(this, show2);
    }
    configure(patch) {
      this._config = mergeConfig(this._config, patch);
      if (Object.prototype.hasOwnProperty.call(patch, "fontUrl")) {
        setLexendFontUrl(this._config.fontUrl);
      }
      if (this._initialized && this._styleEl && Object.prototype.hasOwnProperty.call(patch, "position")) {
        this._styleEl.textContent = getUIStyles(this._config.position);
      }
      if (this._initialized && Object.prototype.hasOwnProperty.call(patch, "sessionBar")) {
        this._syncSessionChrome();
      }
      if (this._initialized && Object.prototype.hasOwnProperty.call(patch, "simpleNav")) {
        this._syncSimpleNav();
      }
    }
    // ── UI Construction ────────────────────────────────────────────────────────
    /** Delegate: ver buildUI() em src/ui/binding.js. */
    _buildUI() {
      buildUI(this);
    }
    /** Delegate: ver syncSessionChrome() em src/ui/binding.js. */
    _syncSessionChrome() {
      syncSessionChrome(this);
    }
    /** Delegate: ver syncSimpleNav() em src/ui/binding.js. */
    _syncSimpleNav() {
      syncSimpleNav(this);
    }
    // ── Events ─────────────────────────────────────────────────────────────────
    /** Delegate: ver bindEvents() em src/ui/binding.js. */
    _bindEvents() {
      bindEvents(this);
    }
    // ── Panel management ───────────────────────────────────────────────────────
    /** Delegate: ver togglePanel() em src/ui/binding.js. */
    _togglePanel() {
      togglePanel(this);
    }
    /** Delegate: ver openPanel() em src/ui/binding.js. */
    _openPanel() {
      openPanel(this);
    }
    /** Delegate: ver setPageInert() em src/ui/binding.js. */
    _setPageInert(on3) {
      setPageInert(this, on3);
    }
    /** Delegate: ver inertSibling() em src/ui/binding.js. */
    _inertSibling(el2) {
      inertSibling(this, el2);
    }
    /** Delegate: ver closePanel() em src/ui/binding.js. */
    _closePanel() {
      closePanel(this);
    }
    /** Delegate: ver resetAll() em src/ui/binding.js. */
    _resetAll() {
      resetAll(this);
    }
    /** Delegate: ver movePanelSide() em src/ui/binding.js. */
    _movePanelSide() {
      movePanelSide(this);
    }
    /** Delegate: ver hideWidget() em src/ui/binding.js. */
    _hideWidget() {
      hideWidget(this);
    }
    /** Delegate: ver showWidget() em src/ui/binding.js. */
    _showWidget() {
      showWidget(this);
    }
    /** Delegate: ver loadPanelSide() em src/core/instancePersistence.js. */
    _loadPanelSide() {
      return loadPanelSide(this);
    }
    /** Delegate: ver savePanelSide() em src/core/instancePersistence.js. */
    _savePanelSide(side) {
      savePanelSide(this, side);
    }
    _toggleSpeak() {
      toggleSpeak();
    }
    /** Delegate: ver syncSpeaking() em src/ui/binding.js. */
    _syncSpeaking(speaking) {
      syncSpeaking(this, speaking);
    }
    // ── Modo Simples activation ────────────────────────────────────────────────
    _activateModoSimples(currentState, { announce: doAnnounce = true } = {}) {
      const saved = this._loadPrincipal();
      if (saved) {
        let el2 = null;
        try {
          el2 = document.querySelector(saved.path);
        } catch (_) {
        }
        if (el2 && this._isPlausiblePrincipal(el2, saved)) {
          this._savePrincipalPath(saved.path, el2);
          setPrincipal(el2, this._config);
          document.documentElement.classList.add("ms-ativo");
          applyOptions(currentState);
          if (doAnnounce) announce(t("announceOn"));
          return;
        }
        if (!saved.legacy) this._discardPrincipal();
      }
      const { confidence } = scan(this._config);
      if (confidence < this._config.confidenceThreshold) {
        document.documentElement.classList.add("ms-ativo");
        applyOptions(currentState);
        holdPrincipal(true);
        showLowConfidenceNotice({ onChoose: () => this._startManualChoice() });
      } else {
        applyModoSimples(currentState, this._config);
      }
      if (doAnnounce) announce(t("announceOn"));
    }
    /** Seleção manual opcional (IMP-22 vale aqui: nada oculto antes de confirmar; cancelar mantém a página). */
    _startManualChoice() {
      this._setPageInert(false);
      startManualSelect({
        onSelect: (el2, path) => {
          this._setPageInert(state_default.get().panelOpen);
          setPrincipal(el2, this._config);
          this._savePrincipalPath(path, el2);
          applyModoSimples(state_default.get(), this._config);
          announce(t("manualChosen"));
        },
        onCancel: () => {
          this._setPageInert(state_default.get().panelOpen);
          announce(t("manualCancelled"));
        }
      });
    }
    // ── State reactions ────────────────────────────────────────────────────────
    _onStateChange(prev, next) {
      if (this._fab) this._fab.sync({ panelOpen: next.panelOpen });
      if (this._panel) this._panel.sync(next, { speaking: isSpeaking() });
      if (this._chrome) this._chrome.sync(next, { speaking: isSpeaking() });
      if (prev.modoSimples !== next.modoSimples) {
        if (next.modoSimples) {
          this._activateModoSimples(next, { announce: !this._applyingProfile });
        } else {
          stopManualSelect();
          revertModoSimples();
          applyOptions(next);
          if (!this._applyingProfile) announce(t("announceOff"));
        }
      }
      const optionKeys = [
        "textScale",
        "colorTheme",
        "colorSaturation",
        "customText",
        "customHeading",
        "customBg",
        "dyslexiaFont",
        "readingRuler",
        "highlightLinks",
        "highlightHeadings",
        "highlightControls",
        "enlargeTargets",
        "textMagnifier",
        "textSpacing",
        "lineHeight",
        "wordSpacing",
        "letterSpacing",
        "cursorStyle",
        "reducedMotion",
        "hideImages",
        "simpleLanguage",
        "readFocus",
        "muteMedia",
        "blockFlashing",
        "strongFocus",
        "showShortcuts",
        "voiceName",
        "voiceCommands",
        "voiceCloudConsent",
        "voiceRate",
        "voicePitch",
        "voiceVolume",
        "language"
      ];
      if (prev.options.language !== next.options.language) {
        setLocale(next.options.language);
      }
      const optionChanged = optionKeys.some(
        (k) => prev.options[k] !== next.options[k]
      );
      if (optionChanged) {
        applyOptions(next);
      }
      if (prev.options.readingRuler !== next.options.readingRuler) {
        if (next.options.readingRuler) startReadingRuler();
        else stopReadingRuler();
      }
      if (prev.options.muteMedia !== next.options.muteMedia) {
        if (next.options.muteMedia) startMediaMute();
        else stopMediaMute();
      }
      if (prev.options.blockFlashing !== next.options.blockFlashing) {
        if (next.options.blockFlashing) startFlashBlock();
        else stopFlashBlock();
      }
      if (prev.options.textMagnifier !== next.options.textMagnifier) {
        if (next.options.textMagnifier) startTextMagnifier();
        else stopTextMagnifier();
      }
      if (prev.options.showShortcuts !== next.options.showShortcuts) {
        if (next.options.showShortcuts) {
          startShortcutsCard({ side: this._shortcutsSide() });
        } else stopShortcutsCard();
      }
      if (prev.options.readFocus !== next.options.readFocus) {
        if (next.options.readFocus) startFocusReader();
        else stopFocusReader();
      }
      if (prev.options.voiceCloudConsent && !next.options.voiceCloudConsent && this._voiceMode === "cloud" && next.options.voiceCommands) {
        this._voiceRun = (this._voiceRun || 0) + 1;
        stopVoiceCommands();
        state_default.set({ options: { voiceCommands: false } });
      }
      if (prev.options.voiceCommands !== next.options.voiceCommands) {
        if (next.options.voiceCommands) this._startVoiceCommands();
        else {
          this._voiceRun = (this._voiceRun || 0) + 1;
          stopVoiceCommands();
        }
      }
      if (!this._applyingProfile) {
        diffStateAnnouncements(prev, next).forEach((msg) => announce(msg));
      }
      this._persistState(next);
      if (!this._applyingProfile && next.activeProfile && !next.profileCustom && this._profileBaseline && profileDiffers(
        this._profileBaseline,
        next,
        this._reducedMotionUser !== null
      )) {
        const vazio = !profileDiffers(
          { modoSimples: false, options: RESET_OPTIONS },
          next,
          this._reducedMotionUser !== null
        );
        state_default.set(
          vazio ? { activeProfile: null, profileCustom: false } : { profileCustom: true }
        );
      }
    }
    // ── Persistence ────────────────────────────────────────────────────────────
    /** Delegate: ver persistState() em src/core/instancePersistence.js. */
    _persistState(next) {
      persistState(this, next);
    }
    /** Delegate: ver loadPersistedState() em src/core/instancePersistence.js. */
    _loadPersistedState() {
      loadPersistedState(this);
    }
    /** Grava o principal escolhido POR PÁGINA, com o tamanho do texto para validar depois. */
    _savePrincipalPath(path, el2) {
      savePrincipalPath(this, path, el2);
    }
    /**
     * Principal salvo para ESTA página. Sem registro de página, aceita o registro antigo (por host,
     * string) — ele só vale se passar na validação, e é migrado para a página (IMP-06).
     * @returns {{ path: string, textLen: number|null, legacy: boolean } | null}
     */
    _loadPrincipal() {
      return loadPrincipal(this);
    }
    /**
     * Esquece o principal salvo DESTA página. O registro antigo por host nunca é apagado aqui:
     * ele é só uma dica, e falhar numa página não diz nada sobre as outras.
     */
    _discardPrincipal() {
      discardPrincipal(this);
    }
    /**
     * O elemento achado pelo caminho salvo ainda parece a área de conteúdo? Exige o mínimo de
     * texto da heurística (scoring.minTextLength) e, quando conhecido, não menos que metade do
     * tamanho de quando foi escolhido.
     */
    _isPlausiblePrincipal(el2, saved) {
      return isPlausiblePrincipal(this, el2, saved);
    }
    /**
     * Registro antigo (por host, sem tamanho gravado) é só uma dica: além do mínimo de texto, quando
     * a heurística tem confiança nesta página o elemento da dica não pode ser bem menor que o
     * candidato dela (< 50% do texto) — outra página do host com a mesma estrutura de caminho.
     */
    _legacyHintFits(el2, len) {
      return legacyHintFits(this, el2, len);
    }
    // ── System preferences ─────────────────────────────────────────────────────
    /**
     * reducedMotion segue a preferência do SO enquanto o usuário não escolher (IMP-14):
     * o valor derivado nunca é gravado como escolha, e acompanha o SO nos dois sentidos.
     */
    _syncReducedMotion() {
      if (this._reducedMotionUser !== null) return;
      state_default.set({ options: { reducedMotion: prefersReducedMotion() } });
    }
  };
  function readPreBootConfig(win2) {
    const cfg = win2 && win2.ModoSimplesConfig;
    return cfg && typeof cfg === "object" ? cfg : {};
  }
  function bootModoSimples(win2) {
    if (win2.ModoSimples && win2.ModoSimples._initialized) return win2.ModoSimples;
    const instance = new ModoSimples(readPreBootConfig(win2));
    instance.init();
    win2.ModoSimples = instance;
    return instance;
  }
  function applyEarlyPrefs(win2) {
    if (!win2.document.documentElement || !win2.document.head) return;
    new ModoSimples(readPreBootConfig(win2))._loadPersistedState();
    injectPageStyles(getPageStyles());
    applyOptions(state_default.get());
  }
  function shouldAutoBoot(win2, script) {
    if (script && script.getAttribute("data-ms-autoboot") === "false") {
      return false;
    }
    return readPreBootConfig(win2).autoboot !== false;
  }
  if (typeof window !== "undefined") {
    const script = document.currentScript;
    if (shouldAutoBoot(window, script)) {
      const boot = () => bootModoSimples(window);
      if (document.readyState === "loading") {
        applyEarlyPrefs(window);
        document.addEventListener("DOMContentLoaded", boot);
      } else {
        boot();
      }
    } else {
      window.ModoSimplesClass = ModoSimples;
      window.ModoSimplesBoot = () => bootModoSimples(window);
    }
  }
  var modo_simples_default = ModoSimples;
})();
