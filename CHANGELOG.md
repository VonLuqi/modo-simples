# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) · versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Qualidade / ferramentas (F1)

- CI no GitHub Actions (`.github/workflows/ci.yml`): format, lint, testes, cobertura com piso (linhas 90 · ramos 80 · funções 80), build sem drift de `dist/`, audit, smokes e e2e Playwright + axe.
- ESLint (flat config), Husky 9 + lint-staged ativos, `vitest` removido (testes em `node:test`), `npm audit` sem vulnerabilidades.
- Testes: ciclo de vida da classe, boot com `ModoSimplesConfig`, observer, focus, painel, escaping, e2e em browser real e baseline de acessibilidade por cenário (regra + seletor + página/estado).
- `npm test` falha se um teste `todo` passar ("IMP-xx fixed: remove todo"): bugs conhecidos IMP-01, IMP-02, IMP-25 e IMP-31 seguem rastreados como `todo` até a correção.

### Corrigido (F2)

- **IMP-01** — o observer ignora nós da própria lib: o anúncio de acessibilidade não dispara mais reprocess completo.
- **IMP-02** — o conteúdo principal escolhido manualmente sobrevive ao reprocess (SPA).
- **IMP-03** — debounce do observer com teto (`reprocessMaxWait`, 1500 ms) e `requestIdleCallback`.
- **IMP-15** — `scoring` mesclado chave a chave (um patch parcial não gera NaN nem desliga a seleção manual).
- **IMP-16** — o observer enxerga o config atual depois de `configure()`.
- **IMP-37** — uma varredura do DOM por lista de seletores (antes ~23), resultado idêntico.
- **IMP-23** — boot idempotente (script duas vezes não duplica a UI); `destroy()` só desfaz o que é da instância.
- **IMP-25** — o polling do fim da fala é limpo no `destroy()`.
- **IMP-31** — `configure({ position })` reposiciona o FAB em runtime.
- **IMP-14** — `prefers-reduced-motion` é valor derivado: não é gravado como escolha do usuário e acompanha o SO.
- **IMP-17** — desligar o Modo Simples restaura a escolha de imagens de antes.
- **IMP-39** — localStorage só é regravado quando o estado persistido muda.
- **IMP-33** — estado salvo com `v: 1` (formato antigo migrado); novas chaves por página.
- **IMP-06** — o principal manual vale por página e é validado antes de reaplicar.
- **IMP-05** — escala de texto a 100% não adiciona classe/regra: `html { font-size: 62.5% }` do host deixa de ser sobrescrito.
- **IMP-32** — opt-out do auto-boot (`data-ms-autoboot="false"` / `ModoSimplesConfig.autoboot=false`), `window.ModoSimplesClass`/`ModoSimplesBoot`, `sideEffects` no `package.json`; `examples/hello-modo-simples.html` passou a usar config pré-boot.

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
