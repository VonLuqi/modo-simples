# Contexto do repositório — Modo Simples

Snapshot detalhado do projeto no GitHub [`VonLuqi/modo-simples`](https://github.com/VonLuqi/modo-simples).  
Última atualização: **2026-09-11** · versão **1.1.0** · licença **MIT**.

Documentos irmãos: [proposta](./01-proposta.md) · [status](./03-status-implementacao.md) · [inventário](./05-inventario-prototipo.md) · **[integração / config (devs)](./09-guia-integracao.md)** · [entrega](./11-pacote-entrega.md)

---

## 1. Em uma frase

Um **script JavaScript injetável** de acessibilidade cognitiva que adiciona um painel flutuante e um **Modo Simples** (menos distrações, linguagem simples, navegação reduzida) — mais um **site protótipo Senac Minas** que demonstra a ferramenta de ponta a ponta.

---

## 2. Ideia e origem (PI 2025)

| Campo         | Valor                                                              |
| ------------- | ------------------------------------------------------------------ |
| UC            | Projeto Integrador 2025                                            |
| Tema          | Acessibilidade para plataformas digitais                           |
| Foco do grupo | Modo Simplificado / Modo Simples                                   |
| Público-alvo  | Pessoas com barreira digital (ex.: idosos, TDAH, espectro autista) |

**Objetivo da proposta:** desenvolver uma ferramenta que adapta plataformas existentes (layout e elementos em cena) para uma navegação mais simples, direta e proveitosa — e entregar um **modelo reutilizável** para outros desenvolvedores.

**Tradução no repositório:**

| Intenção                     | Entrega no repo                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Adaptar plataforma existente | Protótipo Senac Minas em `examples/` + mutação não destrutiva do DOM            |
| Facilitar navegação          | Ocultar distrações, dual markup, pills/hub MS, assistente de cursos             |
| Modelo para devs             | Lib `src/` → bundle `dist/modo-simples(.min).js` + guia + hello + bookmarklet   |
| Inclusão cognitiva           | Painel a11y, temas, Lexend, régua, TTS, ARIA, teclado, `prefers-reduced-motion` |

Equipe (proposta): Lucas F. S. de Aragão · Márcio J. da Silva Junior · Flavio Magno Fulgencio Junior · Juliana Gomes · Larisse A. de Rezende Silva · Reynaldo J. Lara Rodriguez. Professora: Jô Ferreira.

---

## 3. O que está implementado (estado atual)

**Fases 0–7 concluídas.** O `main` entrega biblioteca + protótipo + docs + testes + tooling de demo.

### 3.1 Biblioteca (`src/` → `dist/`)

| Capacidade       | Detalhe                                                                       |
| ---------------- | ----------------------------------------------------------------------------- |
| FAB + painel     | Botão flutuante laranja abre o painel **Acessibilidade Digital** (Shadow DOM) |
| Chrome de sessão | Toggle **SIMPLES** + barra laranja sob o `<nav>`                              |
| Modo Simples     | Detecta conteúdo principal, oculta distrações, aplica classes/atributos       |
| Dual markup      | Host pode marcar `.ms-simple-hide` / `.ms-simple-view.ms-simple-only`         |
| Texto            | Escalas 100% / 125% / 150% / 175%                                             |
| Temas            | Senac · Amarelo/Preto · Escuro Alto · Descanso/Suave                          |
| Auxílios         | Lexend, régua de foco, destaque de links, espaçamento, motion reduzido        |
| Imagens          | `hideImages` ligado por padrão ao ativar MS (reativável na barra/painel)      |
| TTS              | “Ouvir página” com highlight do bloco atual (`speechSynthesis`)               |
| Seleção manual   | Fallback se a heurística de conteúdo principal tiver baixa confiança          |
| Pills injetáveis | `configure({ simpleNav: [...] })` quando a página não tem `[data-ms-pills]`   |
| Persistência     | Preferências em `localStorage`, escopadas por hostname                        |
| Observer         | Reprocessa DOM após mudanças (SPA / conteúdo dinâmico), com debounce          |
| API              | `enable()` · `disable()` · `toggle()` · `configure()` · `destroy()`           |

Princípios de desenho:

- **Zero dependências** no bundle final (só tooling em `devDependencies`)
- **Não destrutivo**: não remove nós; usa `data-ms-hidden`, `ms-ativo`, classes de opção, etc.
- **Shadow DOM** isola a UI do CSS do site hospedeiro
- **Auto-boot**: ao carregar o script, instancia e expõe `window.ModoSimples`

### 3.2 Protótipo Senac Minas (`examples/`)

**8 páginas no mapa** + demo mínima da lib:

| Página          | Arquivo                   | Notas                              |
| --------------- | ------------------------- | ---------------------------------- |
| Início          | `index.html`              | Hub MS (cartões) + pills           |
| Sobre Nós       | `sobrenos.html`           | Dual markup; vídeo vira link no MS |
| Cursos          | `cursos.html`             | Assistente guiado                  |
| Gratuitos (PSG) | `psg.html`                | Assistente PSG                     |
| Unidades        | `unidades.html`           |                                    |
| Contato         | `contato.html`            | Atendente                          |
| Área do Aluno   | `aluno.html`              |                                    |
| Pesquisar       | `pesquisa.html`           | Fora do mapa de pills MS           |
| Hello MS        | `hello-modo-simples.html` | Integração mínima + `simpleNav`    |

CSS canônico do shell: `examples/CSS/tokens.css` · `shell.css` · `pages.css`.  
Assets em `examples/img/`. Scripts de página: `examples/js/cursos-data.js`, `cursos-assistente.js`.

Nav unificada (8 itens) com `aria-current="page"`. Com MS ligado: **pills** + **hub** na home.

### 3.3 Qualidade, build e demo

| Área             | Situação                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| Build            | esbuild IIFE, target **ES2018** → `dist/modo-simples.js` + `.min.js`         |
| Testes           | Unitários (`node:test`) + estruturais do protótipo (`tests/structure/`)      |
| Smoke            | `smoke:examples`, `smoke:assistente`                                         |
| Preview          | `npm run preview` (serve na porta **8765**; `/` via `index.html` → examples) |
| Sync             | `scripts/sync-nav.cjs`, `scripts/sync-ms-pills.cjs`                          |
| Docs             | Proposta, planos, UI, heurísticas, integração, bookmarklet, banca, browsers  |
| Licença / pacote | MIT · `package.json` com `exports` / `files` para distribuição               |

### 3.4 Pendências típicas antes da banca (não bloqueiam o código)

1. Tempos reais de ≥ 3 participantes no roteiro de estudo de caso
2. Contagens before/after do script de métricas
3. Ensaio da demo ao vivo (5 passos em [11-pacote-entrega.md](./11-pacote-entrega.md))
4. (Opcional) Publish npm — tag `v1.1.0` já publicada no GitHub
5. Guia de integração atualizado: [09-guia-integracao.md](./09-guia-integracao.md)

---

## 4. Arquitetura da biblioteca

```
┌──────────────────────────────────────────────────────────┐
│                 modo-simples.js (orquestrador)           │
│         Config → State → EventBus → Persistence          │
│                          │                               │
│          ┌───────────────┼───────────────┐               │
│          ▼               ▼               ▼               │
│    UI (Shadow DOM)   Heurísticas    Features             │
│    FAB · painel ·    content /      TTS · régua ·        │
│    session chrome    distraction ·  simpleNav ·          │
│                      scoring        seleção manual       │
│                          │                               │
│                          ▼                               │
│              DOM Mutator ←→ DOM Observer                 │
└──────────────────────────────────────────────────────────┘
```

### Módulos (`src/`)

| Pasta / arquivo                                                         | Papel                                                     |
| ----------------------------------------------------------------------- | --------------------------------------------------------- |
| `modo-simples.js`                                                       | Orquestrador, lifecycle, API pública, auto-boot           |
| `config/defaults.js`                                                    | Seletores, scoring, posição do FAB, `simpleNav`, limiares |
| `core/state.js`                                                         | Store imutável-style + `stateChange`                      |
| `core/eventBus.js`                                                      | Pub/sub interno                                           |
| `core/persistence.js`                                                   | `localStorage` (+ chave por host)                         |
| `heuristics/*`                                                          | Conteúdo principal, distrações, pontuação                 |
| `mutator/domMutator.js`                                                 | Aplicar/reverter MS e opções; estilos de página; Lexend   |
| `mutator/domObserver.js`                                                | MutationObserver com debounce                             |
| `ui/fab.js`, `a11yPanel.js`, `sessionChrome.js`, `styles.js`            | UI atual (painel modal + barra)                           |
| `ui/radialMenu.js` (e afins)                                            | Legado do menu radial — não é a UI alvo da demo           |
| `features/tts.js`, `readingRuler.js`, `simpleNav.js`, `manualSelect.js` | Recursos opcionais                                        |
| `utils/aria.js`, `focus.js`, `mediaQuery.js`                            | Anúncios, foco, `prefers-reduced-motion`                  |

Plano técnico adicional: [`docs/implementation_plan.md`](../docs/implementation_plan.md).  
Edges das heurísticas: [08-heuristicas-edges.md](./08-heuristicas-edges.md).

### Fluxo ao ativar Modo Simples

1. Estado: `modoSimples: true` (+ `simpleLanguage` e `hideImages` por padrão)
2. Scan heurístico → conteúdo principal (ou seleção manual)
3. Mutator marca/oculta distrações; host pode complementar com dual markup
4. Chrome/pills/hub ficam visíveis; classes no `<html>` (ex.: `ms-ativo`)
5. Observer mantém comportamento se o DOM mudar
6. Preferências persistem por hostname

Ao desligar: reverte mutações, reseta linguagem/imagens “órfãs” e temas agressivos voltam ao **Senac**.

---

## 5. Mapa do repositório

```
modo-simples/
├── src/                      ← biblioteca (ES modules)
├── dist/                     ← bundle gerado (gitignore; npm run build)
├── examples/                 ← protótipo Senac + hello
│   ├── *.html
│   ├── CSS/                  ← tokens · shell · pages (+ legado)
│   ├── img/                  ← assets canônicos
│   └── js/                   ← catálogo + assistente de cursos
├── scripts/                  ← build, testes, smoke, sync nav/pills
├── tests/
│   ├── unit/                 ← node:test
│   └── structure/            ← estrutura do protótipo
├── doc/                      ← documentação de produto/projeto/entrega
├── docs/                     ← plano técnico da lib
├── serve.json                ← cleanUrls off + rewrites /examples → index
├── LICENSE                   ← MIT
├── package.json              ← v1.1.0
└── README.md
```

Há também `_ref-prototipo-senac/` (referência/legado de protótipo) — não é o caminho canônico de demo; a demo oficial é `examples/`.

---

## 6. Stack e tecnologias

| Camada         | Tecnologia                                                  |
| -------------- | ----------------------------------------------------------- |
| Runtime da lib | JavaScript moderno (ES modules em dev; IIFE ES2018 em prod) |
| UI da lib      | Shadow DOM + CSS injetado                                   |
| Persistência   | `localStorage`                                              |
| TTS            | Web Speech API (`speechSynthesis`)                          |
| Build          | **esbuild**                                                 |
| Testes         | **node:test** nativo do Node (runner `scripts/test.cjs`)    |
| Formatação     | **Prettier** (`semi`, aspas simples, 2 espaços)             |
| Git hooks      | **Husky** + **lint-staged**                                 |
| Preview        | `serve` (via `npx`) na porta 8765                           |
| Protótipo      | HTML semântico + CSS (tokens/shell/pages) + JS de página    |
| Empacotamento  | npm package (`exports`, `files`, `main`/`module`)           |

**Browsers-alvo:** Chrome/Edge e Firefox recentes; Safari 14+ com ressalvas (TTS/vozes do SO). Fora de escopo: IE11 e ambientes sem Shadow DOM / ES2018. Detalhes: [13-compatibilidade-browsers.md](./13-compatibilidade-browsers.md).

### Comandos principais

```bash
npm install
npm run preview          # http://127.0.0.1:8765/ → examples/index.html
npm test                 # unitários + estruturais
npm run test:unit
npm run test:structure
npm run smoke:examples
npm run smoke:assistente
npm run build            # gera dist/
npm run format
```

Sirva sempre a **raiz do repo** (não só `examples/`): as páginas apontam para `../src/modo-simples.js`. Use URLs com `.html` (`/examples/contato.html`), não paths “limpos”.

---

## 7. Integração rápida

```html
<!-- Desenvolvimento -->
<script type="module" src="../src/modo-simples.js"></script>

<!-- Produção (após npm run build) -->
<script src="../dist/modo-simples.min.js"></script>
```

```js
window.ModoSimples.enable();
window.ModoSimples.disable();
window.ModoSimples.toggle();
window.ModoSimples.configure({
  simpleNav: [{ label: 'Início', href: '/' }],
});
```

Guia completo: [09-guia-integracao.md](./09-guia-integracao.md) · Bookmarklet: [10-bookmarklet.md](./10-bookmarklet.md) · Demo mínima: `examples/hello-modo-simples.html`.

Contrato útil para o host:

- HTML semântico (`main`, `nav`, `header`, `footer`) melhora a heurística
- Dual markup: `.ms-simple-hide` / `.ms-simple-view.ms-simple-only`
- Pills autoradas: `[data-ms-pills]` (senão usar `simpleNav`)
- Chrome MS é excluído do mutator (não some ao “esconder distrações”)

---

## 8. Documentação (índice mental)

| Doc                                                            | Para quê                                     |
| -------------------------------------------------------------- | -------------------------------------------- |
| [01-proposta](./01-proposta.md)                                | Origem acadêmica e justificativa             |
| **02 (este)**                                                  | Visão do repo, stack, o que existe           |
| [03-status](./03-status-implementacao.md)                      | Checklist de fases                           |
| [04-plano](./04-plano-implementacao.md)                        | Tasks históricas                             |
| [05-inventario](./05-inventario-prototipo.md)                  | Páginas, CSS, scripts do protótipo           |
| [06 / 07](./06-ui-painel-acessibilidade.md)                    | Specs de painel e barra SIMPLES              |
| [08](./08-heuristicas-edges.md)                                | Casos-limite das heurísticas                 |
| [09 / 10](./09-guia-integracao.md)                             | Devs externos + bookmarklet                  |
| [11](./11-pacote-entrega.md)                                   | Pacote banca / demo em 5 passos              |
| [12](./12-plano-melhorias-ux.md)                               | Fase 5 UX                                    |
| [13](./13-compatibilidade-browsers.md)                         | Browsers e APIs                              |
| [estudo-caso / métricas / validação](./estudo-caso-roteiro.md) | Evidências e matriz de sites                 |
| [checklists/](./checklists/)                                   | A11y, leitor de tela, estrutura, pixel banca |

---

## 9. Convenções para a equipe

1. **Lib em `src/`**, protótipo em `examples/` — não misturar markup Senac com lógica do script.
2. Documentação de produto/entrega em **`doc/`**; plano técnico longo em **`docs/`**.
3. Não versionar `node_modules/`; `dist/` é gerado localmente (`npm run build`) — está no `.gitignore`.
4. Páginas novas: HTML semântico + shell CSS canônico + nav/pills sincronizados (scripts de sync).
5. Preferir alterações focadas; UI alvo da demo é **painel + barra**, não o menu radial legado.
6. Commits só quando pedidos; formatação via Prettier (hook / format on save no VS Code).

---

## 10. Relação proposta ↔ código (visão final)

```
Proposta                          Repositório hoje
────────                          ────────────────
Ferramenta aplicável      →       src/ + dist/modo-simples*.js
Protótipo demonstrável    →       examples/*.html (8 páginas + hello)
Inclusão / a11y           →       Painel, temas, Lexend, régua, TTS, ARIA
Modelo para devs          →       API + guia + bookmarklet + package npm
Estudo / entrega UC       →       doc/11 + roteiro + métricas + checklists
```

Em resumo: o repositório já materializa a proposta do PI — **ferramenta injetável pronta para demo**, **site Senac como vitrine**, e **caminho claro para outro site** incluir o mesmo script.
