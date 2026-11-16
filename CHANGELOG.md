# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) · versionamento [SemVer](https://semver.org/lang/pt-BR/).

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
