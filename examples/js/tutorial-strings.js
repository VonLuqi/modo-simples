/**
 * Textos do tutorial guiado do demo (ADR-016 / F11b). SÓ do demo: este arquivo vive em examples/
 * e nunca entra em dist/ nem em src/. Todo texto do tutorial fica aqui (módulo único de strings).
 * Carregue ANTES de js/tutorial.js.
 */
window.MSTutorialStrings = {
  storageKey: 'ms-demo-tutorial-seen',
  formUrl: 'https://forms.cloud.microsoft/r/ZuaZ4S0i9t',

  dialogLabel: 'Tutorial do painel de acessibilidade',
  skip: 'Pular',
  back: 'Voltar',
  next: 'Próximo',
  done: 'Concluir',
  startButton: 'Tutorial',
  startButtonLabel: 'Tutorial: conhecer o painel de acessibilidade',
  counter: (n, total) => 'Passo ' + n + ' de ' + total,
  announce: (n, total, title, text) =>
    'Passo ' + n + ' de ' + total + '. ' + title + '. ' + text,
  closed: 'Tutorial encerrado.',

  formLink: 'Responder ao formulário de feedback',
  formLinkNote: '(abre em uma nova aba)',

  // target: chave resolvida em tutorial.js. title: fallback; para seções o título real vem do painel.
  steps: [
    {
      target: 'fab',
      title: 'Botão de acessibilidade',
      text: 'Este botão abre o painel. Você pode usá-lo com o mouse, o toque ou o teclado (Tab e Enter).',
    },
    {
      target: 'panel',
      title: 'O painel',
      text: 'Aqui ficam todos os ajustes. Cada ajuste liga e desliga com um toque, vale para o site todo e fica salvo neste navegador. Este tutorial só mostra: nada será alterado.',
    },
    {
      target: 'section:text',
      title: 'Texto e leitura',
      text: 'Deixe a leitura confortável:',
      tools: [
        'tamanho do texto, fonte Lexend e espaçamentos',
        'régua de foco de leitura',
        'leitor de tela por voz',
        'ler o que você seleciona',
        'escolha de tipografia',
      ],
    },
    {
      target: 'section:colors',
      title: 'Cores e destaque',
      text: 'Ajuste o visual da página:',
      tools: [
        'temas de contraste e saturação das cores',
        'cor do texto, dos títulos e do fundo',
        'estilo do cursor do mouse',
        'destaque de links',
      ],
    },
    {
      target: 'section:pageTools',
      title: 'Ferramentas de página',
      text: 'Facilite a navegação:',
      tools: [
        'destacar títulos e controles, aumentar alvos de clique',
        'lupa de texto',
        'estrutura da página (ir direto a uma seção)',
        'grade de mouse (clique por células)',
        'teclado virtual',
      ],
    },
    {
      target: 'section:motion',
      title: 'Movimento e imagens',
      text: 'Reduza o que distrai:',
      tools: [
        'menos movimento',
        'bloquear animações e GIFs',
        'pausar e mutar vídeos e áudios',
        'ocultar imagens',
      ],
    },
    {
      target: 'section:keyboard',
      title: 'Teclado e foco',
      text: 'Para quem navega sem mouse:',
      tools: ['foco bem visível', 'lista de atalhos do teclado'],
    },
    {
      target: 'profiles',
      title: 'Perfis prontos',
      text: 'Não quer escolher um a um? Um perfil aplica um conjunto de ajustes de uma vez: Modo Simples, Baixa visão, Dislexia, TDAH, Epilepsia ou Teclado.',
    },
    {
      target: 'simple',
      title: 'Modo Simples',
      text: 'O recomendado para começar: linguagem direta, página enxuta e navegação por atalhos grandes. Dá para ligar e desligar a qualquer momento.',
    },
    {
      target: 'panel',
      title: 'Pronto! Conte o que achou',
      text: 'Para rever este tutorial, use o botão "Tutorial" no topo da página. Sua opinião ajuda a melhorar o projeto.',
      final: true,
    },
  ],
};
