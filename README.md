# Modo Simples

[![CI](https://github.com/VonLuqi/modo-simples/actions/workflows/ci.yml/badge.svg)](https://github.com/VonLuqi/modo-simples/actions/workflows/ci.yml)

Script JavaScript injetável de **acessibilidade cognitiva** (Projeto Integrador 2025 · Senac).  
Licença **MIT** · versão **1.1.0**.

Inclui:

- Painel **Acessibilidade Digital** (FAB)
- Toggle **SIMPLES** + barra sob o menu
- Modo Simples (menos distrações), texto, temas, Lexend, régua, TTS
- Imagens ocultas por padrão no MS (reativáveis)
- Protótipo Senac Minas com hub, pills e assistente de cursos

**Guia para desenvolvedores (instalar, configurar, API, markup):**  
[`doc/09-guia-integracao.md`](./doc/09-guia-integracao.md)

Docs: [`doc/`](./doc/README.md) · Entrega banca: [`doc/11-pacote-entrega.md`](./doc/11-pacote-entrega.md) · Status: [`doc/03-status-implementacao.md`](./doc/03-status-implementacao.md)

---

## Começar em 1 minuto

```bash
git clone https://github.com/VonLuqi/modo-simples.git
cd modo-simples
npm install
npm run preview
```

Abra **`http://127.0.0.1:8765/`** — a raiz (e `/examples`) levam ao protótipo.

| URL                                         | Conteúdo                        |
| ------------------------------------------- | ------------------------------- |
| `http://127.0.0.1:8765/`                    | Home (via `index.html` na raiz) |
| `http://127.0.0.1:8765/examples/index.html` | Home Senac (canônica)           |
| `…/examples/psg.html`                       | Cursos gratuitos (PSG)          |
| `…/examples/hello-modo-simples.html`        | Demo mínima da lib              |

```bash
npm run smoke:examples
# Com o preview no ar:
# set SMOKE_BASE=http://127.0.0.1:8765&& npm run smoke:examples   (Windows)
# SMOKE_BASE=http://127.0.0.1:8765 npm run smoke:examples         (Unix)
```

> Sirva sempre a **raiz do repo** (`npm run preview` ou Vercel Root Directory = `.`), não só a pasta `examples/`: as páginas carregam `../dist/modo-simples.min.js`.  
> Não use URLs “limpas” sem `.html` (`/contato`) — use `/examples/contato.html`.  
> Prefira **sempre o mesmo host** (`127.0.0.1` **ou** `localhost`): a persistência é por hostname.

---

## Protótipo (mapa)

Início · Sobre Nós · Cursos · Gratuitos (PSG) · Unidades · Contato · Área do Aluno · Pesquisar

Com Modo Simples ligado: **pills** + **hub** na home. Demo guiada em 5 passos: [`doc/11-pacote-entrega.md`](./doc/11-pacote-entrega.md#3-guia-de-demo-em-5-passos-banca).

Inventário: [`doc/05-inventario-prototipo.md`](./doc/05-inventario-prototipo.md)

---

## Comandos

| Comando                    | Função                                                           |
| -------------------------- | ---------------------------------------------------------------- |
| `npm run preview`          | Serve o projeto na porta 8765 (`/` e `/examples` → home)         |
| `npm test`                 | Unitários + estruturais                                          |
| `npm run test:unit`        | Só unitários                                                     |
| `npm run test:structure`   | Só estrutura do protótipo                                        |
| `npm run test:e2e`         | Browser real (Chromium) + axe; antes: `npm run test:e2e:install` |
| `npm run smoke:examples`   | Verifica páginas/assets do protótipo                             |
| `npm run smoke:assistente` | Smoke do assistente de cursos                                    |
| `npm run build`            | Gera `dist/modo-simples(.min).js` (ES2018)                       |
| `npm run format`           | Prettier                                                         |

---

## Integração e configuração (devs)

### Incluir o script

```html
<!-- Produção / preview (bundle IIFE) -->
<script src="../dist/modo-simples.min.js"></script>

<!-- Dev com módulos (opcional, requer HTTP na raiz do repo) -->
<script type="module" src="../src/modo-simples.js"></script>
```

O script **auto-inicia** e expõe `window.ModoSimples`.

### API

| Método                                | Uso                                                  |
| ------------------------------------- | ---------------------------------------------------- |
| `enable()` / `disable()` / `toggle()` | Liga/desliga Modo Simples                            |
| `configure(patch)`                    | Config da lib (`position`, `simpleNav`, limiares, …) |
| `destroy()`                           | Remove UI, estilos e listeners                       |

```js
window.ModoSimples.enable();
window.ModoSimples.disable();
window.ModoSimples.toggle();

window.ModoSimples.configure({
  position: 'bottom-right', // FAB
  confidenceThreshold: 0.45,
  persistence: true,
  hostnamePersistence: true,
  simpleNav: [
    { label: 'Início', href: '/' },
    { label: 'Ajuda', href: '/ajuda', short: 'Ajuda' },
  ],
});
```

### Configuração principal (`configure` / defaults)

| Chave                  | Default                     | Papel                                                                  |
| ---------------------- | --------------------------- | ---------------------------------------------------------------------- |
| `position`             | `bottom-right`              | Canto do FAB                                                           |
| `persistence`          | `true`                      | Salva preferências em `localStorage`                                   |
| `hostnamePersistence`  | `true`                      | Escopo por hostname                                                    |
| `confidenceThreshold`  | `0.45`                      | Abaixo → seleção manual do conteúdo                                    |
| `reprocessDebounce`    | `300`                       | Debounce do observer (SPA)                                             |
| `reprocessMaxWait`     | `1500`                      | Teto do debounce (mutação contínua ainda reprocessa)                   |
| `mainSelectors`        | `main`, `[role=main]`, …    | Onde achar o conteúdo                                                  |
| `distractionSelectors` | `header`, `nav`, `aside`, … | O que ocultar no MS                                                    |
| `sessionBar`           | `false`                     | Barra de sessão (switch SIMPLES + barra) no host; opt-in               |
| `mount`                | `null`                      | `{ chrome, bar }` seletores onde montar a barra de sessão              |
| `fontUrl`              | `null`                      | Lexend sob demanda: `null` Google · `string` self-host · `false` nunca |
| `simpleNav`            | `null`                      | Pills injetáveis (se não houver `[data-ms-pills]`)                     |

Config **antes** do boot: `<script>window.ModoSimplesConfig = { sessionBar: true, mount: { … } }</script>` antes do bundle (ver [`examples/js/ms-config.js`](./examples/js/ms-config.js)).

Sem auto-boot: `<script … data-ms-autoboot="false">` (ou `ModoSimplesConfig.autoboot = false`); depois `window.ModoSimplesBoot()` ou `new window.ModoSimplesClass(cfg).init()`. Script incluído duas vezes não duplica a UI.

> `mount` vale quando a barra de sessão é criada (init ou `configure({ sessionBar: true })`); `configure({ mount })` com a barra já criada não a move — use o pré-boot.

### Migração 1.x → 2.0 (breaking)

A lib agora é genérica por padrão: `sessionBar` vem **desligado** (só FAB + painel) e os seletores do Senac saíram dos defaults. Quem dependia da barra de sessão precisa optar antes do bundle:

```html
<!-- antes de ../dist/modo-simples.min.js -->
<script>
  window.ModoSimplesConfig = {
    sessionBar: true,
    mount: {
      chrome: ['.site-header .header-inner', 'header'], // container do switch SIMPLES
      bar: ['header'], // elemento APÓS o qual a barra entra
    },
  };
</script>
```

Detalhes e tabela completa de mudanças: [`CHANGELOG.md`](./CHANGELOG.md) · [`doc/09`](./doc/09-guia-integracao.md).

Tabela completa: [`doc/09-guia-integracao.md`](./doc/09-guia-integracao.md#4-configuração-da-lib-defaults--configure).

### Preferências do usuário (painel)

Persistidas entre páginas (mesmo host): escala de texto, tema, Lexend, régua, links, espaçamento, motion, ocultar imagens, estado do MS.

Ativar MS também liga linguagem simples e oculta imagens (reativáveis na barra/painel). Desligar MS não apaga tema/escala do painel.

### Markup útil no site hospedeiro

```html
<main>…conteúdo principal…</main>

<section class="ms-simple-hide">…some no Modo Simples…</section>
<section class="ms-simple-view ms-simple-only">…só no Modo Simples…</section>

<img src="logo.png" alt="Marca" data-ms-keep-img />
```

| Marcação                              | Efeito                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `<main>` / `[role="main"]`            | Melhora detecção + TTS                                                   |
| `.ms-simple-hide`                     | Some com MS on                                                           |
| `.ms-simple-only` / `.ms-simple-view` | Aparece só com MS on                                                     |
| `data-ms-plain` / `data-ms-simple`    | Pares de linguagem (sem eles o botão mostra "Indisponível nesta página") |
| `data-ms-keep-img`                    | Não some com “ocultar imagens”                                           |
| `[data-ms-pills]`                     | Pills autoradas (a lib não sobrescreve)                                  |

### Controles na UI

- **Ativar/desativar MS:** switch **SIMPLES** (header; com MS on, também nas pills) ou switch do painel
- **Barra âmbar:** convite (off) ou Ouvir / Linguagem / Imagens (on) — sem segundo botão de ativar/voltar
- **FAB:** abre o painel (Esc fecha)

Demo mínima: [`examples/hello-modo-simples.html`](./examples/hello-modo-simples.html)  
Bookmarklet: [`doc/10-bookmarklet.md`](./doc/10-bookmarklet.md)  
Browsers: [`doc/13-compatibilidade-browsers.md`](./doc/13-compatibilidade-browsers.md)

---

## Deploy (Vercel)

O `npm run build` gera `dist/` e também **`public/`** (gitignored) contendo **só** `index.html`, `examples/` e `dist/`. O deploy publica `public/` — `doc/`, `tests/`, `scripts/`, `package.json` e `.husky/` **não** ficam públicos. As páginas continuam carregando `../dist/modo-simples.min.js` (mesma estrutura relativa dentro de `public/`).

No painel Vercel:

1. **Framework Preset:** Other / sem framework
2. **Root Directory:** `.` (raiz do repositório)
3. **Build Command:** `npm run build` (ou deixe o `vercel.json` mandar)
4. **Output Directory:** `public` (definido no `vercel.json`)
5. Use a URL canônica: `https://seu-projeto.vercel.app/examples/index.html` (ou `/`, que redireciona)

Local: `npm run preview` continua servindo a **raiz do repo** (porta 8765); para conferir o que vai ao ar: `npm run build && npx serve public`.

Arquivo [`vercel.json`](./vercel.json) define o output `public`, o redirect `/` → `/examples/index.html` e headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy`, cache de `/dist/`).

---

## Padronização

Prettier + ESLint + Husky 9 + lint-staged. `npm install` ativa o hook (`core.hooksPath=.husky/_`); o `pre-commit` roda lint-staged (prettier + eslint nos `.js`, prettier em `.css`/`.md`) e `npm run test:unit`. Verificações manuais: `npm run lint`, `npm run format:check`, `npm run coverage`. VS Code: format on save (`.vscode/`).

### CI (GitHub Actions)

`.github/workflows/ci.yml` roda em todo `push` e `pull_request` (Node 22, cache npm, um run por branch):

| Job                         | Passos                                                                                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quality`                   | `npm ci` → `format:check` → `lint` → `npm test` → `coverage` (resumo no job summary) → `build` + `git diff --exit-code dist src` (dist sem drift) → `npm audit --omit=dev --audit-level=high` → `smoke:examples` + `smoke:assistente` |
| `e2e` (depois de `quality`) | Playwright + axe em Chromium (desktop + mobile); em falha sobe o artefato `playwright-report`                                                                                                                                         |

O `format:check` roda **antes** do build porque o `prebuild` reformata `src/`. Para reproduzir localmente: `CI=true npm run test:e2e` e os mesmos scripts acima na mesma ordem.
