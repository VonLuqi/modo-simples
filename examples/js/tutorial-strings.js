/**
 * Textos do tutorial guiado do demo (ADR-016 / F11b, reescrito em T179). SÓ do demo: este arquivo
 * vive em examples/ e nunca entra em dist/ nem em src/. Todo texto do tutorial fica aqui.
 * Carregue ANTES de js/tutorial.js.
 *
 * Cada passo de ferramenta liga UM ajuste do painel (tool), mostra o efeito na página e o
 * desliga ao avançar. tool.t: switch | radio | range | speak | outline | grid | vk | profile | modo.
 * Sem tool = passo de texto (intro / final); o final traz as ações de feedback.
 */
window.MSTutorialStrings = {
  storageKey: 'ms-demo-tutorial-seen',
  cornerKey: 'ms-demo-tutorial-corner', // '1' = botão do canto visível; 'x' = dispensado
  formUrl: 'https://forms.cloud.microsoft/r/ZuaZ4S0i9t',

  dialogLabel: 'Tutorial do painel de acessibilidade',
  skip: 'Pular',
  back: 'Voltar',
  next: 'Próximo',
  explore: 'Explorar sozinho',
  startButton: 'Tutorial',
  startButtonLabel: 'Tutorial: conhecer o painel de acessibilidade',
  counter: (n, total) => 'Passo ' + n + ' de ' + total,
  announce: (n, total, title, text) =>
    'Passo ' + n + ' de ' + total + '. ' + title + '. ' + text,
  closed: 'Tutorial encerrado.',
  exploreClosed: 'Tutorial encerrado. Explore o painel à vontade.',
  peekHide: 'Recolher',
  peekShow: 'Expandir',
  vkDemoLabel: 'Campo de teste para o teclado virtual',
  vkDemoPlaceholder: 'Digite aqui com o teclado da tela',
  peekLabel: 'Recolher ou expandir o texto do balão para ver melhor a página',
  unsupported:
    ' Este navegador não tem voz: o ajuste não pode ser mostrado aqui.',

  formNow: 'Responder agora',
  formLinkNote: '(abre em uma nova aba)',

  cornerLabel: 'Responder formulário de feedback (abre em uma nova aba)',
  cornerText: 'Responder formulário',
  cornerDismiss: 'Dispensar o botão do formulário',

  steps: [
    {
      dim: true,
      target: 'panel',
      title: 'Vamos experimentar o painel',
      text: 'Cada ajuste será ligado para você ver o efeito na página e desligado quando você avançar. Ao terminar, tudo volta exatamente como estava. Esc ou Pular encerram a qualquer momento e também restauram tudo.',
    },

    // ── Texto e leitura ─────────────────────────────────────────────────
    {
      tool: { t: 'radio', o: 'textScale', v: '150', off: '100' },
      title: 'Tamanho do texto',
      text: 'Ligado em 150%: todo o texto da página ficou maior.',
    },
    {
      tool: { t: 'switch', o: 'dyslexiaFont' },
      title: 'Fonte para dislexia (Lexend)',
      text: 'Ligada: a fonte da página mudou para a Lexend, de letras mais distintas.',
    },
    {
      tool: { t: 'switch', o: 'textSpacing' },
      title: 'Espaçamento do texto',
      text: 'Ligado: mais espaço entre linhas, palavras e letras.',
    },
    {
      tool: { t: 'range' },
      title: 'Ajuste fino da tipografia',
      text: 'Altura da linha, espaço entre palavras e entre letras, cada um em um controle. Aqui colocamos um valor para você ver.',
    },
    {
      tool: { t: 'switch', o: 'readingRuler' },
      title: 'Régua de leitura',
      text: 'Ligada: uma faixa acompanha o mouse ou o foco e destaca a linha que você lê.',
    },
    {
      tool: { t: 'speak' },
      title: 'Ouvir a página',
      text: 'Ligado: a página começa a ser lida em voz alta, bloco por bloco. Se o navegador bloquear o som, nada é forçado.',
    },
    {
      tool: { t: 'pause' },
      title: 'Pausar e continuar a leitura',
      text: 'Enquanto a página é lida, aparece o botão Pausar. Ele para a leitura e vira Continuar, que retoma do mesmo ponto.',
    },
    {
      tool: { t: 'switch', o: 'readFocus' },
      title: 'Ler o que recebe o foco',
      text: 'Ligado: ao navegar com Tab, cada elemento focado é lido em voz alta.',
    },
    {
      tool: {
        t: 'show',
        sel: '[role="group"][aria-labelledby="ms-label-voice"]',
      },
      title: 'Estúdio de Voz',
      text: 'Aqui você escolhe a voz, a velocidade, o tom e o volume da leitura, e ouve um exemplo em Testar voz. Fica salvo. Nada foi alterado agora.',
    },
    {
      tool: { t: 'show', sel: '[data-option="voiceCommands"]' },
      title: 'Comandos de voz',
      text: 'Você pode controlar a leitura falando, como "pausar" ou "mais rápido". Fica desligado até você ligar, e o painel avisa antes de usar o microfone. Nada foi ligado agora.',
    },

    // ── Cores e destaque ────────────────────────────────────────────────
    {
      tool: { t: 'radio', o: 'colorTheme', v: 'yellowBlack', off: 'senac' },
      title: 'Tema de contraste',
      text: 'Ligado o tema amarelo sobre preto, de alto contraste.',
    },
    {
      tool: { t: 'radio', o: 'colorSaturation', v: 'auto', off: 'normal' },
      title: 'Saturação das cores',
      text: 'As cores da página mudaram de intensidade. Dá para suavizá-las ou tirá-las.',
    },
    {
      tool: { t: 'radio', o: 'customText', v: 'auto', off: '' },
      title: 'Cor do texto',
      text: 'Escolhemos uma cor de texto para você ver. Você pode usar qualquer cor.',
    },
    {
      tool: { t: 'radio', o: 'customHeading', v: 'auto', off: '' },
      title: 'Cor dos títulos',
      text: 'Os títulos da página ganharam uma cor própria.',
    },
    {
      tool: { t: 'radio', o: 'customBg', v: 'auto', off: '' },
      title: 'Cor do fundo',
      text: 'O fundo da página mudou de cor.',
    },
    {
      tool: { t: 'radio', o: 'cursorStyle', v: 'auto', off: 'default' },
      title: 'Cursor do mouse',
      text: 'O cursor do mouse ficou grande. Em telas de toque não há cursor.',
    },
    {
      tool: { t: 'switch', o: 'highlightLinks' },
      title: 'Destacar links',
      text: 'Ligado: todos os links da página ganharam destaque.',
    },

    // ── Ferramentas de página ───────────────────────────────────────────
    {
      tool: { t: 'switch', o: 'highlightHeadings' },
      title: 'Destacar títulos',
      text: 'Ligado: os títulos da página ficaram marcados.',
    },
    {
      tool: { t: 'switch', o: 'highlightControls' },
      title: 'Destacar botões e campos',
      text: 'Ligado: botões e campos de formulário ganharam contorno.',
    },
    {
      tool: { t: 'switch', o: 'enlargeTargets' },
      title: 'Aumentar áreas de clique',
      text: 'Ligado: links e botões ficaram maiores e mais fáceis de acertar.',
    },
    {
      tool: { t: 'switch', o: 'textMagnifier' },
      title: 'Lupa de texto',
      text: 'Ligada: passe o mouse ou o foco sobre um texto para vê-lo ampliado.',
    },
    {
      tool: { t: 'outline' },
      title: 'Estrutura da página',
      text: 'Aberta a lista de títulos e regiões da página, para ir direto a uma seção.',
    },
    {
      tool: { t: 'grid' },
      title: 'Grade de mouse',
      text: 'Aberta a grade: escolha uma célula (1 a 9) para chegar a qualquer ponto da tela sem mouse.',
    },
    {
      tool: { t: 'vk' },
      title: 'Teclado virtual',
      text: 'Aberto o teclado na tela, fixo no rodapé, para digitar sem o teclado físico. Experimente no campo abaixo.',
    },

    // ── Movimento e imagens ─────────────────────────────────────────────
    {
      tool: { t: 'switch', o: 'reducedMotion' },
      title: 'Menos movimento',
      text: 'Ligado: transições e animações da página ficam reduzidas.',
    },
    {
      tool: { t: 'switch', o: 'blockFlashing' },
      title: 'Bloquear animações e GIFs',
      text: 'Ligado: nada pisca nem se mexe sozinho. Indicado para epilepsia.',
    },
    {
      tool: { t: 'switch', o: 'muteMedia' },
      title: 'Pausar e mutar mídia',
      text: 'Ligado: vídeos e áudios da página são pausados e mutados.',
    },
    {
      tool: { t: 'switch', o: 'hideImages' },
      title: 'Ocultar imagens',
      text: 'Ligado: as imagens da página sumiram, ficam só os textos.',
    },

    // ── Teclado e foco ──────────────────────────────────────────────────
    {
      tool: { t: 'switch', o: 'strongFocus' },
      title: 'Foco bem visível',
      text: 'Ligado: o contorno do elemento em foco ficou grosso e fácil de achar ao usar Tab.',
    },
    {
      tool: { t: 'switch', o: 'showShortcuts' },
      title: 'Atalhos do teclado',
      text: 'Ligado: um cartão lista os atalhos do teclado no canto da tela.',
    },

    // ── Perfis e Modo Simples ───────────────────────────────────────────
    {
      tool: { t: 'profile', v: 'lowVision' },
      title: 'Perfis prontos',
      text: 'Aplicamos o perfil Baixa visão: texto maior, alto contraste e cursor grande de uma vez. Há também Modo Simples, Dislexia, TDAH, Epilepsia e Teclado.',
    },
    {
      tool: { t: 'modo' },
      title: 'Modo Simples',
      text: 'Ligado o recomendado para começar: linguagem direta, página enxuta e atalhos grandes.',
    },

    {
      dim: true,
      final: true,
      target: 'panel',
      title: 'Pronto! Agora é com você',
      text: 'Tudo voltou como estava. Explore o painel sozinho, ou conte o que achou: sua opinião ajuda a melhorar o projeto. O botão "Tutorial" no topo da página mostra tudo de novo.',
    },
  ],
};
