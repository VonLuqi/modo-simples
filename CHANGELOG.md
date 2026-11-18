# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) · versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado (F7b — "Leia o foco")

- **Opção `readFocus`** (booleano, padrão desligado, persistida, zerada pelo "Desligar tudo", anunciada ao alternar) com interruptor "Ler o que eu seleciono" na seção "Texto e leitura". Ligada, a voz (`speechSynthesis`, pt-BR) lê o que recebe foco por Tab ou clique, na página e no painel: nome acessível (`aria-labelledby` > `aria-label` > label/`alt`/`title` > texto, até ~200 caracteres) + papel em português (botão, link, campo, caixa de seleção, interruptor, lista de opções, título) e o estado de caixas/interruptores.
- Novo foco cancela a fala anterior; debounce de 150 ms; não interrompe a leitura "Ouvir" do conteúdo principal (`isReadingMain()` em `tts.js`). Módulo novo: `src/features/focusReader.js`.
- Sem `speechSynthesis` o interruptor fica desabilitado, com o motivo em linguagem simples. Pensado para os perfis TDAH/Teclado (F7f) ligarem a opção.

### Alterado / mudança de comportamento (F7a — UX-21, U-02)

- **UX-21 (ADR-018)** — com confiança baixa o Modo Simples **não abre mais a seleção manual sozinho**: liga na página inteira (sem principal e sem ocultar nada em volta) e mostra o aviso "Não achei o conteúdo principal, quer escolher?" (`aria-live="polite"`, botões ≥ 44 px): **Escolher o conteúdo** abre a seleção manual, **Fechar** dispensa o aviso. Ao recarregar com confiança baixa vale o mesmo fallback (sem seleção automática).
- **U-02** — textos da seleção manual em linguagem simples, sem "candidato"/"seletor" ("Clique ou toque no que você quer ler…", "Você escolheu: …", botão "Voltar"); todos em `src/ui/strings.js`.
- **IMP-22 continua valendo dentro do fluxo manual**: nada é ocultado antes de confirmar, cancelar (botão ou Esc) mantém a página inteira e nada é persistido.

### Adicionado (F8 — cor, tipografia e cursor)

- **Cor (F8a)** — temas **Monocromático** e **Claro Alto Contraste**; **saturação** baixa/normal/alta (`filter` só no `<html>`, o widget `fixed` não é afetado); **cor personalizada** de texto, títulos e fundo (8 presets com contraste ≥ 7:1 + seletor livre `input type="color"`). Opções novas: `colorSaturation`, `customText`, `customHeading`, `customBg`.
- **Tipografia (F8b)** — sliders de **altura da linha** (1º passo 1,5 até 3,0), **espaço entre palavras** (até 0,8 em) e **entre letras** (até 0,3 em) e botão **Redefinir fonte** (zera tamanho, fonte acessível, espaçamento e sliders; anuncia em PT-BR). Posição 0 = padrão do site; o botão "Espaçamento de texto" segue como preset e o slider movido vence só a propriedade que mexeu. Opções novas: `lineHeight`, `wordSpacing`, `letterSpacing` (valores salvos abaixo de 1,5 sobem para 1,5).
- **Cursor (F8c)** — **cursor grande branco ou preto** (seta SVG 48 px com contorno contrastante e mão grande em links/botões), também sobre o widget. Vence o `crosshair` da régua de leitura; campos de texto (`input`, `textarea` e `contenteditable` em qualquer forma editável) mantêm o cursor `text`. Em tela de toque o controle não tem efeito. **Limitação conhecida (Chromium):** imagens de cursor maiores que 32 px são trocadas pelo cursor padrão (`auto`/`pointer`) quando o ponteiro chega perto da borda da janela ou da interface do navegador; mantivemos 48 px por legibilidade. Opção nova: `cursorStyle`.
- Todas as opções novas entram no "Desligar tudo" (ADR-015) e são validadas ao ler o estado salvo (valor inválido volta ao padrão).

### Alterado / mudança de comportamento (F8)

- **Cor personalizada completa o outro lado.** Escolher **qualquer** cor (texto, título ou fundo) passa a definir também a contraparte legível: só o fundo → texto preto/branco automático; só texto/título → fundo preto/branco automático (o que serve aos dois quando possível). Antes o lado não escolhido mantinha a cor do tema/site, o que podia deixar texto ilegível. A cor escolhida **nunca** é trocada; se o par efetivo (texto/fundo ou título/fundo) ficar abaixo de 4,5:1, o painel mostra um aviso (`role="status"`) sem bloquear.
- **Links sob cor personalizada** ganham cor própria (≥ 4,5:1 sobre o fundo efetivo) e sublinhado, em vez de herdar a cor do texto; isso vence a cor de link dos temas (ex.: o `#0000cc` do Claro Alto Contraste).
- Integradores com CSS próprio sobre `html` devem considerar as novas classes de raiz: `ms-theme-mono`, `ms-theme-lightHigh`, `ms-sat-low|high`, `ms-custom-text|heading|bg|link`, `ms-lh|ws|ls`, `ms-cursor-white|black` (e as variáveis `--ms-custom-*`, `--ms-lh|ws|ls`, `--ms-cur-arrow|hand`). O host do widget (`#ms-container`) ganha o atributo `data-ms-cursor` enquanto o cursor grande está ligado.

### Corrigido (F8)

- No mobile, texto a 150% + espaçamento alargava a página (a barra SIMPLES não encolhia) e empurrava o botão flutuante para fora da tela; a barra agora encolhe.

### Qualidade / ferramentas (F1)

- CI no GitHub Actions (`.github/workflows/ci.yml`): format, lint, testes, cobertura com piso (linhas 90 · ramos 80 · funções 80), build sem drift de `dist/`, audit, smokes e e2e Playwright + axe.
- ESLint (flat config), Husky 9 + lint-staged ativos, `vitest` removido (testes em `node:test`), `npm audit` sem vulnerabilidades.
- Testes: ciclo de vida da classe, boot com `ModoSimplesConfig`, observer, focus, painel, escaping, e2e em browser real e baseline de acessibilidade por cenário (regra + seletor + página/estado).
- `npm test` falha se um teste `todo` passar ("IMP-xx fixed: remove todo"): os bugs conhecidos IMP-01, IMP-02, IMP-25 e IMP-31 ficaram rastreados como `todo` e foram **corrigidos na F2** (hoje não há `todo` pendente).

### Corrigido (F2)

- **IMP-01** — o observer ignora nós da própria lib: o anúncio de acessibilidade não dispara mais reprocess completo.
- **IMP-02** — o conteúdo principal escolhido manualmente sobrevive ao reprocess (SPA).
- **IMP-03** — debounce do observer com teto (`reprocessMaxWait`, 1500 ms) e `requestIdleCallback`.
- **IMP-15** — `scoring` mesclado chave a chave (um patch parcial não gera NaN nem desliga a seleção manual).
- **IMP-16** — o observer enxerga o config atual depois de `configure()`.
- **IMP-37** — uma varredura do DOM por lista de seletores (antes ~23), resultado idêntico.
- **IMP-23** — boot idempotente (script duas vezes não duplica a UI); `destroy()` só desfaz o que é da instância: numa instância que nunca subiu é no-op e **não chama mais `eventBus.clearAll()`** (só remove o próprio listener; listeners alheios do `eventBus` sobrevivem).
- **IMP-25** — sem polling: o estado "lendo/parado" da UI vem dos eventos do TTS (`onSpeakingChange`); nenhum `setInterval` na leitura.
- **IMP-31** — `configure({ position })` reposiciona o FAB em runtime.
- **IMP-14** — `prefers-reduced-motion` é valor derivado: não é gravado como escolha do usuário e acompanha o SO. Só um payload `v: 1` com booleano conta como escolha; no formato antigo (sem `v`) o `reducedMotion` gravado é ignorado e o SO vale (o antigo persistia o valor derivado, `false` por padrão).
- **IMP-17** — desligar o Modo Simples restaura a escolha de imagens de antes.
- **IMP-39** — localStorage só é regravado quando o estado persistido muda.
- **IMP-33** — estado salvo com `v: 1`. O formato antigo (sem `v`) continua sendo lido — `largerText`/`highContrast` viram escala e tema — e é regravado como v1 na próxima mudança; o `reducedMotion` do formato antigo não é carregado como escolha (ver IMP-14). Novas chaves por página.
- **IMP-06** — o principal manual vale por página e é validado antes de reaplicar. O registro antigo por host (string) passa a ser só uma dica: revalidado em cada página (texto mínimo e, se a heurística está confiante, tamanho vs. o candidato dela) e nunca apagado por uma página que falhou.
- **IMP-05** — escala de texto a 100% não adiciona classe/regra: `html { font-size: 62.5% }` do host deixa de ser sobrescrito. **Mudança observável:** a classe `ms-text-scale-100` não existe mais (só `ms-text-scale-125`, `-150` e `-175`); CSS ou testes de integradores que dependiam dela precisam ser ajustados.
- **IMP-32** — opt-out do auto-boot (`data-ms-autoboot="false"` / `ModoSimplesConfig.autoboot=false`), `window.ModoSimplesClass`/`ModoSimplesBoot`, `sideEffects` no `package.json`; `examples/hello-modo-simples.html` passou a usar config pré-boot.
- **IMP-50** — a leitura em voz segue a ordem do documento (antes lia todos os títulos, depois os parágrafos).
- **Seleção manual** — com confiança baixa o `reprocess` não aplica a heurística enquanto o principal está por escolher (uma mutação do host, como um carrossel, não aplica mais o principal incerto).
- **Cancelar a seleção manual** — deixa o Modo Simples ligado **sem principal** (nada marcado, oculto ou persistido); antes marcava o `body` como principal e o `max-width` do principal estreitava a página inteira.
- **IMP-13** — leitura (TTS): eventos de uma fala antiga não avançam a fila da nova (token de geração); reiniciar ou parar e ouvir de novo não pula nem duplica blocos.
- **IMP-38** — leitura (TTS): coleta de blocos sem reflow (legibilidade calculada uma vez por bloco) e falas de até 200 caracteres, por frase e depois por palavra.
- **IMP-22** — seleção manual (confiança baixa): nada é ocultado antes de o usuário confirmar; cancelar (botão ou Esc) mantém a página inteira, sem persistir.
- **IMP-29** — seleção manual consome o evento uma vez: Esc, clique, `mousedown`/`pointerdown` não vazam para o host nem fecham o painel junto.
- **IMP-42** — `simpleNav` só aceita `href` relativo, `http(s):`, `mailto:` e `tel:`; `javascript:`, `data:` e outros esquemas são descartados.
- **IMP-28** — sem `window.matchMedia` as preferências valem como "não pediu" e `MediaQueryList` antigo (Safari < 14) usa `addListener`.
- **IMP-43** — documentado em `doc/09`: os `data-ms-*` do host são só marcadores booleanos (presença do atributo), sem valores interpretados.

### Corrigido (F3)

- **UX-01** — botão Ouvir com texto escuro `#1a1205` sobre o laranja da marca: **7,88:1** em `#F39200` e **6,60:1** no hover `#E08400` (antes branco, 2,35:1). A mensagem do commit `df395d9` cita 8,6:1; o valor correto, medido pelo QA, é 7,88:1.
- **UX-02** — trilho dos interruptores com contraste ≥ 3:1 (WCAG 1.4.11): desligado `#64748b` (4,76:1 sobre branco), ligado `#8a5500` no card Modo Simples do painel e no interruptor SIMPLES da barra (antes `#cbd5e1` 1,48:1 e laranja `#F39200` ~2,2:1).
- **UX-03** — nota do rodapé do painel em `#475569` (7:1 sobre `#f7f8fa`).
- **UX-04** — textos de baixo contraste ≥ 4,5:1: subtítulo SIMPLES `#475569`; no protótipo, `.eyebrow` e `.ms-simple-view__eyebrow` usam o novo token `--ms-orange-text` (`#8a5500`) e `.ms-hub-card__opt--project` usa `--senac-blue`. A baseline de a11y (`tests/e2e/a11y-baseline.json`) ficou sem entradas.
- **UX-05** — o painel cabe inteiro em 390×844: `max-height` em `dvh` descontando o offset do FAB.
- **UX-08** — a dica do FAB aparece só na primeira visita, some sozinha após 6 s ou ao abrir o painel e não volta (`aria-describedby` removido; no mobile quebra linha em vez de cortar). **Mudança observável:** nova chave `ms_fabTipSeen` no localStorage, gravada assim que a dica é mostrada.
- **UX-30** — com o painel aberto o FAB mostra o X e esconde os sliders (`toggleAttribute('hidden')`; SVG não tem `.hidden`).
- **UX-09** — o foco do switch SIMPLES sobrevive ao re-parent do chrome (header ↔ pills) e `sync()` não re-anexa o nó à toa.
- **UX-10** — grupos de opções do painel (`radiogroup`) com roving tabindex e setas/Home/End.
- **UX-11** — nome acessível estável nos switches e botões de estado ("Modo Simples", "Linguagem simples"); o estado vem só de `aria-checked`/`aria-pressed`, sem rótulo que muda.
- **IMP-07** — seleção manual por teclado (Tab/↑↓/Enter/Esc) e por toque; o menu de contexto durante a seleção é bloqueado.
- **IMP-08** — a régua de leitura fica oculta até haver posição conhecida e segue toque/foco (e `requestAnimationFrame` no movimento).
- **Repositório** — `.fuse_hidden*` no `.gitignore` (artefatos FUSE/NTFS).

### Corrigido (F3, parte 2)

- **UX-15** — nenhum texto da lib abaixo de 12 px (0.75rem): rótulos, subtítulos, dicas e nota do painel em 0.8125rem (13 px); dica do FAB, subtítulo SIMPLES e selo da barra em 0.75rem. Antes 0.65–0.72rem (10–11 px).
- **UX-16** — áreas de toque de 44 px: ícone do chrome 38 → 44 px, `.ms-segment` com `min-height: 44px` e os dois tipos de switch com área clicável de 44 px de altura (o trilho visual segue com 26 px). **Mudança observável:** o ícone do chrome ocupa 6 px a mais de largura e altura.
- **UX-17** — sem `translateY` no hover de `.ms-session-btn` e das pills (ações frequentes); o hover segue por cor/sombra.
- **IMP-09** — com a fonte Lexend ligada, ícones (`[class*="icon"]`, `[class*="fa-"]`, `.fa`, `.fas`, `.far`, `.fab`, `.material-icons`) e `code`/`pre`/`kbd`/`samp` mantêm a própria fonte (e o espaçamento de letras da regra); antes viravam letras ou quadrados.
- **IMP-21** — o espaçamento de texto (WCAG 1.4.12) agora vale também para `h1`–`h6`, `td`, `th`, `dd`, `dt`, `blockquote` e `label` (antes só `body`, `p` e `li`).
- **UX-13** — o trap de foco também pega o Tab vindo de fora do painel (clicou na página e deu Tab) ou do próprio contêiner: Tab entra pelo primeiro controle, Shift+Tab pelo último.
- **UX-12** — ao fechar o painel (botão X, clique fora ou Esc) o foco volta a quem o abriu: FAB ou ícone do chrome. Antes só o Esc devolvia, e sempre ao FAB.
- **IMP-24** — com o painel aberto os irmãos do host no `<body>` ficam `inert` (o `aria-modal` passa a valer de fato). Ficam de fora os anúncios de leitor de tela e a seleção manual; durante a seleção manual iniciada pelo painel a página volta a receber clique e foco, e o `inert` volta depois.
- **UX-19** — modo restaurado em outra página não anuncia a cada navegação; avisa "Modo Simples continua ligado" uma vez por sessão (`sessionStorage`).
- **IMP-40** — a régua já atualiza o `transform` por `requestAnimationFrame` (feito junto com o IMP-08); sem mudança de código nesta parte.
- **UX-22** — ícones do chrome e do painel em SVG inline (mesmo traço do ícone de sliders do FAB, `aria-hidden` e `focusable="false"`) no lugar de emoji e glifos: 🔊 📄 🖼 na barra, ★ no switch SIMPLES, no convite e no card do painel, e T ◉ ▣ nos títulos das seções. Os nomes acessíveis não mudaram. **Mudança observável:** o aspecto dos ícones deixa de depender do sistema operacional.

### Corrigido (F3, revisão do QA)

- **LOW-1** — clique fora com o painel aberto fecha o painel e repassa o clique ao elemento que estava sob o ponteiro (o `inert` jogava o clique no `body` e o primeiro clique no conteúdo da página era engolido).
- **LOW-2** — folga de 18 px entre as linhas de opção do painel: a área de toque de 44 px de um switch não sobrepõe mais a do vizinho.
- **LOW-3** — com o painel aberto, filhos do `<body>` que chegam depois também ficam `inert`; regiões `aria-live` do site não ficam `inert` (o leitor de tela continua anunciando).
- **LOW-4** — a fonte Lexend só exclui classes de ícone de verdade (`icon`, `icon-*`), não qualquer classe que contenha "icon" (ex.: `silicon`, `iconic`).
- **LOW-5** — removido o `:hover` redundante do bloco `prefers-reduced-motion` (o hover não tem `transform` desde o UX-17).
- **MED-2 / LOW-A (QA T66)** — o clique repassado só vale se for do usuário (`isTrusted`) e, se o alvo for um campo de formulário, ele recebe o foco (antes o foco ia para o FAB); a Lexend também exclui `glyphicon`, `*-icon`, `*_icon` e `icon_*` (fontes de ícone voltavam a virar tofu).
- **LOW-3 (QA T68)** — as exclusões de ícone da Lexend agora são ancoradas em token de classe (`icon`, `icon-*`, `icon_*`, `glyphicon*`, `*-icon`, `*_icon`): `silicon_x`, `lexicon_list`, `my-iconic`, `x-icons` e `foo_iconic` voltam a receber a Lexend.

### Corrigido (W2 mobile)

- **UX-06** — com o Modo Simples ligado o switch SIMPLES ocupa uma linha própria no topo do `nav[data-ms-pills]` (primeiro filho), acima das pills, em vez de ficar dentro de `.ms-pills-nav__inner`. As pills quebram linha (grade de 2 colunas até 720 px) e não há mais rolagem horizontal, a 390 e a 1200 px. **Mudança observável:** o switch deixa de ser filho de `.ms-pills-nav__inner` (CSS de integrador que dependia disso, como `.ms-pills-nav__inner #ms-simples-chrome`, não vale mais); `.ms-pills-nav .ms-pills-nav__inner` e `.ms-pill` ganham `flex-wrap`, `overflow-x: visible` e `min-height: 44px` pela lib.
- **UX-07** — barra do Modo Simples compacta até 480 px: título e selo numa linha, descrição só para leitor de tela e os quatro botões numa grade, ícone mais rótulo curto (Ouvir Página, Simples, Imagens, Voltar), todos ≥ 44 px. Altura a 390×844: 97 px (antes 271 px). Os nomes acessíveis completos continuam ("Linguagem Simples:", "Voltar ao site normal"); o estado liga/desliga segue em `aria-pressed`.
- **UX-07 (CI)** — a linha do título da barra não quebra mais até 480 px (`flex-wrap: nowrap`, selo fixo, `strong` com reticências): com fonte de fallback larga (DejaVu no runner do CI) o selo ia para a 2ª linha e a barra chegava a 128 px; agora fica ≤ 120 px sem depender das métricas da fonte.
- **UX-07 (título curto)** — título da barra ligada passa de “Modo Simples Ativado” para “Modo Simples” + ` ativado` visualmente oculto (`.ms-sr-only`): o nome acessível mantém o estado e a palavra de estado não é mais cortada com reticências em fonte larga (320/360/390 px; até 340 px título 13,6 px e selo com padding menor). **Mudança observável:** texto visível do `<strong>` do título.
- **UX-14** — o CSS do widget deixou de usar `rem`: painel, FAB, chrome, barra e pills injetadas usam `calc(N * var(--ms-u))` com `--ms-u: 16px`. Um `html { font-size: 62.5% }` do host não encolhe mais o widget (nenhum texto abaixo de 12 px) e o resultado é idêntico com a raiz padrão. **Mudança observável:** a variável CSS `--ms-u` passa a existir no `:host`, em `#ms-simples-chrome`, `#ms-session-bar` e `.ms-pills-nav`; testes de integradores que comparam o CSS por texto (`bottom: 1.5rem`) precisam usar `calc(1.5 * var(--ms-u))`.
- **UX-14 (escala de texto)** — `--ms-u` agora vale `calc(16px * var(--ms-scale, 1))` e as classes `html.ms-text-scale-125|150|175` definem `--ms-scale` (1,25 / 1,5 / 1,75): o widget acompanha a escala de texto da lib (botão da barra a 175 % volta a 23,8 px) e continua imune a `html { font-size: 62.5% }` do host.
- **UX-06 / reflow (MED2, MED4)** — até 720 px as pills usam `repeat(N, minmax(0, 1fr))` (3 colunas a partir de 360 px, 2 abaixo), `overflow-wrap: anywhere` e padding lateral menor; a grade de 4 botões da barra e o `.ms-simples-toggle-wrap` ganham `min-width: 0`. A 390 px o bloco de pills cai de 222 para 117 px (conteúdo começa em 268 px, antes ~350 px) e a 320 px com texto a 175 % o documento não rola na horizontal.
- **UX-25** — cabeçalho do protótipo: o nav fica numa linha só acima de 1100 px ("Pesquisar" não quebra) e vira o botão "Menu" (aria-expanded/aria-controls, Esc fecha, 44 px) abaixo disso; no mobile (390 px) o cabeçalho cai de 201 para 140 px. Nav e botão vêm de scripts/sync-nav.cjs.
- **UX-25 (QA)** — o menu recolhível do protótipo fecha ao sair com Tab e ao voltar para telas largas (aria-expanded zerado); botão Entrar com 44px no mobile (cabeçalho segue ≤140px).
- **UX-14 (protótipo)** — textos das pills e dos cards do hub do protótipo ficam com ≥12px mesmo com html a 62,5%.
- **UX-06 (doc)** — guia de integração (doc/09) avisa do empate de especificidade de .ms-pills-nav .ms-pill com CSS do host.

### Higiene (F4a)

- **A-01** — removidos os seis arquivos legados sem importadores de `src/ui/` (`radialMenu`, `radialItem`, `panel`, `toggle`, `centralToggle`, `button`); o bundle não muda.
- **A-05** — `docs/implementation_plan.md` (plano técnico legado, conteúdo distinto de `doc/04`) movido para `doc/arquivo/`; links de `doc/02`, `doc/04` e README corrigidos.
- **A-06** — `graphify-out/` no `.gitignore`.
- **A-07** — `npm run watch` agora observa `src/` de verdade (esbuild `context().watch()` via `bundle.cjs --watch`); `build:dev` inalterado.
- **A-08** — `vercel.json` e `serve.json` ficam os dois (ferramentas diferentes); novo teste estrutural garante rewrites/redirects idênticos.
- **A-09** — já atendido: `.husky/pre-commit` roda lint-staged e `npm run test:unit` (sem mudança).
- **A-10** — CI: `node scripts/bundle.cjs && git diff --exit-code dist` (sem `prebuild`/prettier, que reescreve `src/`).
- **A-12** — pesos do `scoring` e `confidenceThreshold` documentados em `doc/08-heuristicas-edges.md` e nos comentários de `defaults.js`/`scoring.js`. `dist/modo-simples.js` reconstruído (só comentários); `.min.js` idêntico.
- **e2e (QA R78)** — `panel-focus.spec.js`: o skip silencioso quando o ícone `open-panel` não aparece virou `expect(icone).toBeVisible()`; se o ícone sumir, o teste falha em vez de passar sem rodar.

### Refatoração (F4c)

- **A-11 / A-03** — o CSS saiu da string JS: fonte em `src/ui/css/{ui,page}/*.css`, `scripts/gen-styles.cjs` gera `src/ui/styles.generated.js` (commitado; `--check` e passo de CI falham se defasar) e `ui/styles.js` mantém `getUIStyles()`/`getPageStyles()` (de 1165 para 60 linhas). `domMutator` não importa mais `ui/`: `injectPageStyles(css)` recebe o CSS de `modo-simples.js`. Saída do CSS byte a byte idêntica; exports públicos inalterados. Revisão (QA R86): `injectPageStyles()` sem CSS não injeta `<style>` vazio (que travaria a injeção real depois), `npm run watch` também observa `src/ui/css` e regera `styles.generated.js`, e `doc/02` e `doc/09` apontam para os novos caminhos do CSS.

### Testes (F4b)

- **A-04** — 54 testes de casos de borda para `contentDetector`, `domObserver`, `mediaQuery`, `readingRuler`, `focus` e `a11yPanel` (rede de segurança para F4c/F4d); nenhum bug encontrado, `src/` e `dist/` intactos. A afirmação "0 testes" do diagnóstico inicial estava desatualizada: os módulos já tinham testes, agora com cobertura de ramos maior.

### Encerrado sem correção

- **UX-29** (suposto widget que não respondia ao clique): era o marcador de clique do portal de teste, não um defeito do widget — verificado pelo @UI (T9). Nenhuma mudança de código.

## [2.0.0] — 2026-11-16

### Quebra de compatibilidade (breaking)

- `sessionBar` agora é `false` por padrão: a barra de sessão (switch SIMPLES + barra âmbar) não é mais injetada no host. Só FAB + painel (Shadow DOM).
- Seletores do protótipo Senac saíram dos defaults da lib (`.site-header .header-inner`, `.cabecalho`, `header .fx.bg27`, `.cabecalho__nav`, `.barra-superior`, `.s1`, `.home-hero__media`). A montagem passa a ser configurável por `config.mount` e, no protótipo, vem de `window.ModoSimplesConfig` em `examples/js/ms-config.js`.
- Painel com texto genérico por padrão (a marca "Projeto Integrador 2025 • Senac" agora vem de `config.brand`).

### Adicionado

- `config.fontUrl` — origem da fonte Lexend (`null` Google Fonts · `string` self-host · `false` nunca).
- `config.sessionBar` e `config.mount = { chrome, bar }` — barra de sessão opt-in e onde montá-la.
- `config.brand = { title, subtitle, footer }` — textos do painel.
- `window.ModoSimplesConfig` — config lida antes do init (pré-boot).
- Estado "Indisponível nesta página" no botão Linguagem Simples quando não há pares `data-ms-plain`/`data-ms-simple`.
- Barra de sessão com CTA "Ativar Modo Simples" (desligado) e "Voltar ao site normal" (ligado), alvos ≥ 44 px.
- Rótulos de escala de texto mais claros ("Maior" / "Máximo").
- `prebuild` (`prettier --write src`) para que `npm run build` seja idempotente.

### Alterado

- Lexend carregado sob demanda, sem nenhuma requisição a terceiros no init (`crossorigin` + `referrerpolicy=no-referrer`).
- Deploy Vercel publica só `public/` (`index.html`, `examples/`, `dist/`) com headers de segurança; `doc/`, `tests/`, `scripts/` não ficam públicos.
- Tema padrão renomeado para "Cores do site".

### Migração 1.x → 2.0

Para manter a barra de sessão e a montagem do protótipo Senac, defina antes do bundle:

```html
<script>
  window.ModoSimplesConfig = {
    sessionBar: true,
    mount: {
      chrome: ['.site-header .header-inner', 'header'],
      bar: ['header'],
    },
  };
</script>
<script src="/dist/modo-simples.min.js"></script>
```

Se o seu site usava `.barra-superior` ou `.s1`, acrescente-os a `distractionSelectors`.
`configure({ mount })` com a barra já criada não a move; use o pré-boot.

## [1.1.0] — 2026-09-11

Release v1.1.0 (ver `doc/03-status-implementacao.md`).
