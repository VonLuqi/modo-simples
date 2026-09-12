# Modo Simples

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

| URL | Conteúdo |
| --- | --- |
| `http://127.0.0.1:8765/` | Home (via `index.html` na raiz) |
| `http://127.0.0.1:8765/examples/index.html` | Home Senac (canônica) |
| `…/examples/psg.html` | Cursos gratuitos (PSG) |
| `…/examples/hello-modo-simples.html` | Demo mínima da lib |

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

| Comando | Função |
| --- | --- |
| `npm run preview` | Serve o projeto na porta 8765 (`/` e `/examples` → home) |
| `npm test` | Unitários + estruturais |
| `npm run test:unit` | Só unitários |
| `npm run test:structure` | Só estrutura do protótipo |
| `npm run smoke:examples` | Verifica páginas/assets do protótipo |
| `npm run smoke:assistente` | Smoke do assistente de cursos |
| `npm run build` | Gera `dist/modo-simples(.min).js` (ES2018) |
| `npm run format` | Prettier |

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

| Método | Uso |
| --- | --- |
| `enable()` / `disable()` / `toggle()` | Liga/desliga Modo Simples |
| `configure(patch)` | Config da lib (`position`, `simpleNav`, limiares, …) |
| `destroy()` | Remove UI, estilos e listeners |

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

| Chave | Default | Papel |
| --- | --- | --- |
| `position` | `bottom-right` | Canto do FAB |
| `persistence` | `true` | Salva preferências em `localStorage` |
| `hostnamePersistence` | `true` | Escopo por hostname |
| `confidenceThreshold` | `0.45` | Abaixo → seleção manual do conteúdo |
| `reprocessDebounce` | `300` | Debounce do observer (SPA) |
| `mainSelectors` | `main`, `[role=main]`, … | Onde achar o conteúdo |
| `distractionSelectors` | `header`, `nav`, `aside`, … | O que ocultar no MS |
| `simpleNav` | `null` | Pills injetáveis (se não houver `[data-ms-pills]`) |

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

| Marcação | Efeito |
| --- | --- |
| `<main>` / `[role="main"]` | Melhora detecção + TTS |
| `.ms-simple-hide` | Some com MS on |
| `.ms-simple-only` / `.ms-simple-view` | Aparece só com MS on |
| `data-ms-plain` / `data-ms-simple` | Pares de linguagem |
| `data-ms-keep-img` | Não some com “ocultar imagens” |
| `[data-ms-pills]` | Pills autoradas (a lib não sobrescreve) |

### Controles na UI

- **Ativar/desativar MS:** switch **SIMPLES** (header; com MS on, também nas pills) ou switch do painel  
- **Barra âmbar:** convite (off) ou Ouvir / Linguagem / Imagens (on) — sem segundo botão de ativar/voltar  
- **FAB:** abre o painel (Esc fecha)

Demo mínima: [`examples/hello-modo-simples.html`](./examples/hello-modo-simples.html)  
Bookmarklet: [`doc/10-bookmarklet.md`](./doc/10-bookmarklet.md)  
Browsers: [`doc/13-compatibilidade-browsers.md`](./doc/13-compatibilidade-browsers.md)

---

## Deploy (Vercel)

O projeto **precisa** ser publicado com a **raiz do repositório** (onde estão `src/`, `dist/`, `examples/`), **não** com Root Directory = `examples/`.

Se a raiz for só `examples/`, o script `../dist/modo-simples.min.js` (ou `../src/...`) dá **404** — a página carrega sem a lib, e hub/pills/hero aparecem todos juntos (sem `html.ms-ativo`).

No painel Vercel:

1. **Framework Preset:** Other / sem framework  
2. **Root Directory:** `.` (raiz do repositório)  
3. **Build Command:** `npm run build` (ou deixe o `vercel.json` mandar)  
4. **Output Directory:** `.` (ponto — **não** `public` nem `examples`)  
5. Use a URL canônica: `https://seu-projeto.vercel.app/examples/index.html` (ou `/`, que redireciona)

Arquivo [`vercel.json`](./vercel.json) já define o redirect `/` → `/examples/index.html`.

---

## Padronização

Prettier + Husky + lint-staged. VS Code: format on save (`.vscode/`).
