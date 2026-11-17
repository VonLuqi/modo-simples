# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) · versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

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
