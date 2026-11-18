/**
 * Textos do tutorial guiado do demo (ADR-016 / F11b, reescrito em T179). SÓ do demo: este arquivo
 * vive em examples/ e nunca entra em dist/ nem em src/. Todo texto do tutorial fica aqui.
 * Carregue ANTES de js/tutorial.js.
 *
 * Cada passo de ferramenta liga UM ajuste do painel (tool), mostra o efeito na página e o
 * desliga ao avançar. tool.t: switch | radio | range | speak | outline | grid | vk | profile | modo.
 * Sem tool = passo de texto (intro / final); o final traz as ações de feedback.
 */
(function () {
  var PT = {
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

  // ── Inglês e espanhol ────────────────────────────────────────────────────────
  // Só texto: chaves de storage, URL e a estrutura dos passos (tool, target...) vêm do PT.
  // `steps` aqui tem {title, text} na mesma ordem dos passos do PT.
  var EN = {
    dialogLabel: 'Accessibility panel tutorial',
    skip: 'Skip',
    back: 'Back',
    next: 'Next',
    explore: 'Explore on my own',
    startButton: 'Tutorial',
    startButtonLabel: 'Tutorial: get to know the accessibility panel',
    counter: function (n, total) {
      return 'Step ' + n + ' of ' + total;
    },
    announce: function (n, total, title, text) {
      return 'Step ' + n + ' of ' + total + '. ' + title + '. ' + text;
    },
    closed: 'Tutorial closed.',
    exploreClosed: 'Tutorial closed. Explore the panel at your own pace.',
    peekHide: 'Collapse',
    peekShow: 'Expand',
    vkDemoLabel: 'Test field for the on-screen keyboard',
    vkDemoPlaceholder: 'Type here with the on-screen keyboard',
    peekLabel: 'Collapse or expand the balloon text to see the page better',
    unsupported:
      ' This browser has no voice: the setting cannot be shown here.',
    formNow: 'Answer now',
    formLinkNote: '(opens in a new tab)',
    cornerLabel: 'Answer the feedback form (opens in a new tab)',
    cornerText: 'Answer the form',
    cornerDismiss: 'Dismiss the form button',
    steps: [
      {
        title: "Let's try the panel",
        text: 'Each setting will be turned on so you can see its effect on the page, and turned off when you move on. When you finish, everything goes back exactly as it was. Esc or Skip end it at any time and also restore everything.',
      },
      {
        title: 'Text size',
        text: 'Set to 150%: all the text on the page got bigger.',
      },
      {
        title: 'Dyslexia-friendly font (Lexend)',
        text: 'On: the page font changed to Lexend, with more distinct letters.',
      },
      {
        title: 'Text spacing',
        text: 'On: more space between lines, words and letters.',
      },
      {
        title: 'Fine typography control',
        text: 'Line height, word spacing and letter spacing, each with its own control. Here we set a value so you can see it.',
      },
      {
        title: 'Reading ruler',
        text: 'On: a strip follows the mouse or focus and highlights the line you are reading.',
      },
      {
        title: 'Listen to the page',
        text: 'On: the page starts being read aloud, block by block. If the browser blocks sound, nothing is forced.',
      },
      {
        title: 'Pause and resume reading',
        text: 'While the page is being read, the Pause button appears. It stops the reading and becomes Resume, which continues from the same point.',
      },
      {
        title: 'Read what gets focus',
        text: 'On: when you navigate with Tab, each focused element is read aloud.',
      },
      {
        title: 'Voice Studio',
        text: 'Here you choose the voice, speed, pitch and volume of the reading, and hear a sample with Test voice. It is saved. Nothing was changed now.',
      },
      {
        title: 'Voice commands',
        text: 'You can control reading by speaking, such as "pause" or "faster". It stays off until you turn it on, and the panel warns you before using the microphone. Nothing was turned on now.',
      },
      {
        title: 'Contrast theme',
        text: 'The high-contrast yellow on black theme is on.',
      },
      {
        title: 'Color saturation',
        text: 'The page colors changed intensity. You can soften them or remove them.',
      },
      {
        title: 'Text color',
        text: 'We picked a text color for you to see. You can use any color.',
      },
      {
        title: 'Heading color',
        text: 'The page headings got a color of their own.',
      },
      {
        title: 'Background color',
        text: 'The page background changed color.',
      },
      {
        title: 'Mouse cursor',
        text: 'The mouse cursor became big. Touch screens have no cursor.',
      },
      {
        title: 'Highlight links',
        text: 'On: all links on the page are highlighted.',
      },
      {
        title: 'Highlight headings',
        text: 'On: the page headings are marked.',
      },
      {
        title: 'Highlight buttons and fields',
        text: 'On: buttons and form fields got an outline.',
      },
      {
        title: 'Enlarge click areas',
        text: 'On: links and buttons became bigger and easier to hit.',
      },
      {
        title: 'Text magnifier',
        text: 'On: hover or focus a text to see it enlarged.',
      },
      {
        title: 'Page structure',
        text: 'The list of headings and regions of the page is open, so you can jump straight to a section.',
      },
      {
        title: 'Mouse grid',
        text: 'The grid is open: choose a cell (1 to 9) to reach any point on the screen without a mouse.',
      },
      {
        title: 'On-screen keyboard',
        text: 'The on-screen keyboard is open, fixed at the bottom, to type without the physical keyboard. Try it in the field below.',
      },
      {
        title: 'Less motion',
        text: 'On: transitions and animations on the page are reduced.',
      },
      {
        title: 'Block animations and GIFs',
        text: 'On: nothing flashes or moves on its own. Recommended for epilepsy.',
      },
      {
        title: 'Pause and mute media',
        text: 'On: videos and audio on the page are paused and muted.',
      },
      {
        title: 'Hide images',
        text: 'On: the images on the page are gone, only the text is left.',
      },
      {
        title: 'Very visible focus',
        text: 'On: the outline of the focused element is thick and easy to find when using Tab.',
      },
      {
        title: 'Keyboard shortcuts',
        text: 'On: a card lists the keyboard shortcuts in the corner of the screen.',
      },
      {
        title: 'Ready-made profiles',
        text: 'We applied the Low vision profile: larger text, high contrast and a big cursor at once. There are also Simple Mode, Dyslexia, ADHD, Epilepsy and Keyboard.',
      },
      {
        title: 'Simple Mode',
        text: 'The recommended mode to get started is on: direct language, a lean page and big shortcuts.',
      },
      {
        title: "Done! Now it's up to you",
        text: 'Everything is back as it was. Explore the panel on your own, or tell us what you think: your feedback helps improve the project. The "Tutorial" button at the top of the page shows it all again.',
      },
    ],
  };

  var ES = {
    dialogLabel: 'Tutorial del panel de accesibilidad',
    skip: 'Omitir',
    back: 'Atrás',
    next: 'Siguiente',
    explore: 'Explorar por mi cuenta',
    startButton: 'Tutorial',
    startButtonLabel: 'Tutorial: conocer el panel de accesibilidad',
    counter: function (n, total) {
      return 'Paso ' + n + ' de ' + total;
    },
    announce: function (n, total, title, text) {
      return 'Paso ' + n + ' de ' + total + '. ' + title + '. ' + text;
    },
    closed: 'Tutorial finalizado.',
    exploreClosed: 'Tutorial finalizado. Explora el panel con calma.',
    peekHide: 'Contraer',
    peekShow: 'Expandir',
    vkDemoLabel: 'Campo de prueba para el teclado en pantalla',
    vkDemoPlaceholder: 'Escribe aquí con el teclado en pantalla',
    peekLabel:
      'Contraer o expandir el texto del globo para ver mejor la página',
    unsupported:
      ' Este navegador no tiene voz: el ajuste no se puede mostrar aquí.',
    formNow: 'Responder ahora',
    formLinkNote: '(se abre en una pestaña nueva)',
    cornerLabel:
      'Responder el formulario de comentarios (se abre en una pestaña nueva)',
    cornerText: 'Responder formulario',
    cornerDismiss: 'Descartar el botón del formulario',
    steps: [
      {
        title: 'Probemos el panel',
        text: 'Cada ajuste se activará para que veas su efecto en la página y se desactivará cuando avances. Al terminar, todo vuelve exactamente a como estaba. Esc u Omitir lo terminan en cualquier momento y también restauran todo.',
      },
      {
        title: 'Tamaño del texto',
        text: 'Activado en 150%: todo el texto de la página se hizo más grande.',
      },
      {
        title: 'Fuente para dislexia (Lexend)',
        text: 'Activada: la fuente de la página cambió a Lexend, con letras más distintas.',
      },
      {
        title: 'Espaciado del texto',
        text: 'Activado: más espacio entre líneas, palabras y letras.',
      },
      {
        title: 'Ajuste fino de la tipografía',
        text: 'Altura de línea, espacio entre palabras y entre letras, cada uno con su control. Aquí pusimos un valor para que lo veas.',
      },
      {
        title: 'Regla de lectura',
        text: 'Activada: una franja sigue el ratón o el foco y resalta la línea que lees.',
      },
      {
        title: 'Escuchar la página',
        text: 'Activado: la página empieza a leerse en voz alta, bloque por bloque. Si el navegador bloquea el sonido, no se fuerza nada.',
      },
      {
        title: 'Pausar y continuar la lectura',
        text: 'Mientras se lee la página, aparece el botón Pausar. Detiene la lectura y se convierte en Continuar, que la retoma desde el mismo punto.',
      },
      {
        title: 'Leer lo que recibe el foco',
        text: 'Activado: al navegar con Tab, cada elemento enfocado se lee en voz alta.',
      },
      {
        title: 'Estudio de Voz',
        text: 'Aquí eliges la voz, la velocidad, el tono y el volumen de la lectura, y escuchas un ejemplo en Probar voz. Se guarda. Ahora no se cambió nada.',
      },
      {
        title: 'Comandos de voz',
        text: 'Puedes controlar la lectura hablando, como "pausar" o "más rápido". Queda desactivado hasta que lo actives, y el panel avisa antes de usar el micrófono. Ahora no se activó nada.',
      },
      {
        title: 'Tema de contraste',
        text: 'Activado el tema amarillo sobre negro, de alto contraste.',
      },
      {
        title: 'Saturación de los colores',
        text: 'Los colores de la página cambiaron de intensidad. Puedes suavizarlos o quitarlos.',
      },
      {
        title: 'Color del texto',
        text: 'Elegimos un color de texto para que lo veas. Puedes usar cualquier color.',
      },
      {
        title: 'Color de los títulos',
        text: 'Los títulos de la página recibieron un color propio.',
      },
      {
        title: 'Color del fondo',
        text: 'El fondo de la página cambió de color.',
      },
      {
        title: 'Cursor del ratón',
        text: 'El cursor del ratón se hizo grande. Las pantallas táctiles no tienen cursor.',
      },
      {
        title: 'Resaltar enlaces',
        text: 'Activado: todos los enlaces de la página están resaltados.',
      },
      {
        title: 'Resaltar títulos',
        text: 'Activado: los títulos de la página quedaron marcados.',
      },
      {
        title: 'Resaltar botones y campos',
        text: 'Activado: los botones y campos de formulario tienen contorno.',
      },
      {
        title: 'Agrandar áreas de clic',
        text: 'Activado: enlaces y botones son más grandes y fáciles de acertar.',
      },
      {
        title: 'Lupa de texto',
        text: 'Activada: pasa el ratón o el foco sobre un texto para verlo ampliado.',
      },
      {
        title: 'Estructura de la página',
        text: 'Abierta la lista de títulos y regiones de la página, para ir directo a una sección.',
      },
      {
        title: 'Cuadrícula de ratón',
        text: 'Abierta la cuadrícula: elige una celda (1 a 9) para llegar a cualquier punto de la pantalla sin ratón.',
      },
      {
        title: 'Teclado en pantalla',
        text: 'Abierto el teclado en pantalla, fijo en la parte inferior, para escribir sin el teclado físico. Pruébalo en el campo de abajo.',
      },
      {
        title: 'Menos movimiento',
        text: 'Activado: las transiciones y animaciones de la página se reducen.',
      },
      {
        title: 'Bloquear animaciones y GIF',
        text: 'Activado: nada parpadea ni se mueve solo. Recomendado para la epilepsia.',
      },
      {
        title: 'Pausar y silenciar medios',
        text: 'Activado: los vídeos y audios de la página se pausan y se silencian.',
      },
      {
        title: 'Ocultar imágenes',
        text: 'Activado: las imágenes de la página desaparecieron, solo queda el texto.',
      },
      {
        title: 'Foco muy visible',
        text: 'Activado: el contorno del elemento enfocado es grueso y fácil de encontrar al usar Tab.',
      },
      {
        title: 'Atajos del teclado',
        text: 'Activado: una tarjeta lista los atajos del teclado en la esquina de la pantalla.',
      },
      {
        title: 'Perfiles listos',
        text: 'Aplicamos el perfil Baja visión: texto más grande, alto contraste y cursor grande de una vez. También hay Modo Simple, Dislexia, TDAH, Epilepsia y Teclado.',
      },
      {
        title: 'Modo Simple',
        text: 'Activado el recomendado para empezar: lenguaje directo, página sencilla y atajos grandes.',
      },
      {
        title: '¡Listo! Ahora es contigo',
        text: 'Todo volvió a como estaba. Explora el panel por tu cuenta, o cuéntanos qué te pareció: tu opinión ayuda a mejorar el proyecto. El botón "Tutorial" en la parte superior de la página lo muestra todo otra vez.',
      },
    ],
  };

  // ── Seleção do idioma ────────────────────────────────────────────────────────
  // window.MSTutorialStrings é um objeto estável (tutorial.js guarda a referência): a troca de
  // idioma troca o conteúdo dele. O idioma vem do evento 'ms:localechange' da lib; se o evento
  // passou antes deste script, lê o lang que a lib pôs no #ms-container.
  var TEXTS = { pt: PT, en: EN, es: ES };
  var T = {};
  window.MSTutorialStrings = T;

  function pick(loc) {
    var tx = TEXTS[loc] || PT;
    Object.keys(T).forEach(function (k) {
      delete T[k];
    });
    var base = {
      storageKey: PT.storageKey,
      cornerKey: PT.cornerKey,
      formUrl: PT.formUrl,
    };
    Object.keys(base).forEach(function (k) {
      T[k] = base[k];
    });
    Object.keys(PT).forEach(function (k) {
      if (k !== 'steps' && !(k in base))
        T[k] = tx[k] !== undefined ? tx[k] : PT[k];
    });
    T.steps = PT.steps.map(function (s, i) {
      var tr = tx === PT ? s : tx.steps[i];
      return Object.assign({}, s, { title: tr.title, text: tr.text });
    });
    T.locale = TEXTS[loc] ? loc : 'pt';
  }

  function currentLocale() {
    var host = document.getElementById('ms-container');
    var tag = (host && host.lang) || '';
    var p = tag.toLowerCase().split(/[-_]/)[0];
    return TEXTS[p] ? p : 'pt';
  }

  pick(currentLocale());
  window.MSTutorialLocale = {
    pick: pick,
    current: function () {
      return T.locale;
    },
  };
  document.addEventListener('ms:localechange', function (e) {
    pick((e.detail && e.detail.locale) || currentLocale());
  });
})();
