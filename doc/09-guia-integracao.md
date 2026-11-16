# Guia de integração — Modo Simples

Modelo para desenvolvedores (requisito da proposta do PI).  
Versão do pacote: **1.1.0** · UI: [06 painel](./06-ui-painel-acessibilidade.md) · [07 barra](./07-ui-barra-modo-simples.md) · Browsers: [13](./13-compatibilidade-browsers.md)

---

## 1. O que o script faz

Ao incluir o Modo Simples em uma página (auto-boot):

1. Injeta FAB laranja (abre o painel **Acessibilidade Digital** em Shadow DOM)
2. (Opt-in, `sessionBar: true`) Injeta toggle **SIMPLES** + barra âmbar de sessão no host — por padrão só FAB + painel
3. Permite ativar o **Modo Simples** (oculta distrações, destaca conteúdo principal)
4. Oferece tamanho de texto, temas, Lexend, régua, links, espaçamento, ocultar imagens, TTS
5. Persiste preferências em `localStorage` (por hostname, se configurado)
6. Observa mudanças no DOM (SPA) e reprocessa com debounce

**Não destrutivo:** não remove nós do host — usa classes no `<html>` e atributos `data-ms-*`.

---

## 2. Instalação

### 2.1 Desenvolvimento (ES module)

```html
<script type="module" src="/src/modo-simples.js"></script>
```

Ou, com config após o boot:

```html
<script type="module">
  import '/src/modo-simples.js';
  window.ModoSimples.configure({
    position: 'bottom-left',
    simpleNav: [{ label: 'Início', href: '/' }],
  });
</script>
```

Arquivo pronto: [`examples/hello-modo-simples.html`](../examples/hello-modo-simples.html)

```bash
npm install
npm run preview
# http://127.0.0.1:8765/examples/hello-modo-simples.html
```

> ES modules **não** funcionam via `file://`. Use sempre HTTP (`npm run preview`).

### 2.2 Produção (bundle IIFE)

```bash
npm run build
```

```html
<script src="/caminho/para/modo-simples.min.js"></script>
```

Arquivos gerados (também versionados no repo):

| Arquivo                    | Uso                  |
| -------------------------- | -------------------- |
| `dist/modo-simples.js`     | IIFE legível (debug) |
| `dist/modo-simples.min.js` | Produção             |

Target do build: **ES2018** (esbuild). Ver [13-compatibilidade-browsers.md](./13-compatibilidade-browsers.md).

### 2.3 npm / package

```bash
npm install  # no clone do repo
```

| Campo `package.json`             | Valor                      |
| -------------------------------- | -------------------------- |
| `main` / `exports["."].default`  | `dist/modo-simples.min.js` |
| `module` / `exports["."].import` | `src/modo-simples.js`      |
| `exports["./min"]`               | `dist/modo-simples.min.js` |

### 2.4 Bookmarklet

Ver [10-bookmarklet.md](./10-bookmarklet.md).

### 2.5 Deploy Vercel

1. Root Directory = **raiz do repo** (não `examples/`)
2. Build Command = `npm run build`
3. Output Directory = `public` (gerado pelo build com `index.html`, `examples/` e `dist/`); ver [`vercel.json`](../vercel.json)

Se publicar só `examples/` (sem `dist/` ao lado), `../dist/modo-simples.min.js` retorna 404 e o Modo Simples **não carrega**.

---

## 3. API pública

Após o load, a instância fica em `window.ModoSimples`:

| Método             | Descrição                                                                |
| ------------------ | ------------------------------------------------------------------------ |
| `enable()`         | Ativa Modo Simples                                                       |
| `disable()`        | Desativa Modo Simples                                                    |
| `toggle()`         | Alterna Modo Simples                                                     |
| `configure(patch)` | Mescla opções de **configuração da lib** (não as preferências do painel) |
| `destroy()`        | Remove UI, estilos injetados, observers e reseta estado em memória       |

```js
window.ModoSimples.enable();
window.ModoSimples.disable();
window.ModoSimples.toggle();

window.ModoSimples.configure({
  confidenceThreshold: 0.4,
  position: 'bottom-left',
  simpleNav: [
    { label: 'Início', href: '/' },
    { label: 'Cursos Disponíveis', href: '/cursos', short: 'Cursos' },
  ],
});

window.ModoSimples.destroy();
```

### Comportamento ao ligar / desligar MS

| Ação                      | Efeito                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `enable()` / SIMPLES on   | `simpleLanguage: true`; `hideImages: true` (salvo se o usuário já escolheu “mostrar imagens” no MS)    |
| `disable()` / SIMPLES off | `simpleLanguage: false`; `hideImages: false`                                                           |
| Preferências do painel    | Tema, escala, Lexend, régua, links, etc. **permanecem** ao desligar o MS e **persistem** entre páginas |

Ativar/desativar: **só** pelo switch **SIMPLES** (header ou, com MS on, nas pills) ou pelo switch do painel — a barra não tem CTA “Ativar” nem “Voltar ao site”.

---

## 4. Configuração da lib (`defaults` / `configure`)

Todas as chaves são opcionais. Fonte: [`src/config/defaults.js`](../src/config/defaults.js).

| Chave                  | Tipo / default                                                                                     | Descrição                                                                                                                                                                                                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mainSelectors`        | `string[]`                                                                                         | Seletores tentados em ordem para achar o conteúdo principal                                                                                                                                                                                                                                                                      |
| `distractionSelectors` | `string[]`                                                                                         | Candidatos a ocultar com MS on (nunca esconde ancestrais/descendentes do principal nem chrome `#ms-*`)                                                                                                                                                                                                                           |
| `scoring`              | objeto                                                                                             | Pesos da heurística (`mainTagBonus`, `h1Bonus`, `minTextLength`, …)                                                                                                                                                                                                                                                              |
| `persistence`          | `true`                                                                                             | Salva estado em `localStorage`                                                                                                                                                                                                                                                                                                   |
| `hostnamePersistence`  | `true`                                                                                             | Escopa chaves por hostname (`ms_state:hostname`)                                                                                                                                                                                                                                                                                 |
| `position`             | `'bottom-right'`                                                                                   | Canto do FAB: `bottom-right` \| `bottom-left` \| `top-right` \| `top-left`                                                                                                                                                                                                                                                       |
| `confidenceThreshold`  | `0.45`                                                                                             | Abaixo disso, pede seleção manual do conteúdo principal                                                                                                                                                                                                                                                                          |
| `reprocessDebounce`    | `300`                                                                                              | Debounce (ms) do MutationObserver                                                                                                                                                                                                                                                                                                |
| `fontUrl`              | `null`                                                                                             | Origem da fonte Lexend, carregada **só quando o usuário liga a fonte** (nenhuma requisição a terceiros no init). `null` = Google Fonts (`crossorigin`, `referrerpolicy=no-referrer`) · `string` = CSS self-hosted · `false` = nunca carrega (usa fonte do sistema)                                                               |
| `sessionBar`           | `false`                                                                                            | Barra de sessão no **light DOM** do host (switch SIMPLES + barra "Modo Simples ativado"). Desligada por padrão: só FAB + painel (Shadow DOM) são injetados. Aceita `configure({ sessionBar: true/false })` em runtime                                                                                                            |
| `mount`                | `null`                                                                                             | Onde a barra de sessão entra (só com `sessionBar: true`): `{ chrome?: seletor \| seletor[], bar?: seletor \| seletor[] }`, primeiro que existir. `chrome` = container do switch SIMPLES · `bar` = elemento **após** o qual a barra é inserida. Sem `mount`: switch fixo na tela + barra no topo do `<body>`                      |
| `brand`                | `{ title: "Acessibilidade Digital", subtitle: "", footer: "Preferências salvas neste navegador" }` | Textos do cabeçalho e do rodapé do painel. Padrão **genérico** (sem marca). `subtitle`/`footer` vazios ocultam a linha; `title` vazio volta ao padrão. Override parcial é mesclado. O painel é montado no init, então defina `brand` **pré-boot** (`window.ModoSimplesConfig`); o texto entra sempre como texto, nunca como HTML |
| `simpleNav`            | `null`                                                                                             | Lista de pills `{ label, href, short? }` se a página **não** tiver `[data-ms-pills]`                                                                                                                                                                                                                                             |

### Defaults de seletores (resumo)

**Principal:** `main`, `[role="main"]`, `article`, `#conteudo`, `#content`, `.content`, …

**Distrações (exemplos):** `header`, `footer`, `aside`, `nav`, banners/ads/sidebars, `iframe`, …

Chrome da lib **nunca** é tratado como distração: `#ms-container`, `#ms-session-bar`, `#ms-simples-chrome`, `[data-ms-pills]`.

### Config pré-boot (`window.ModoSimplesConfig`)

O bundle faz auto-boot ao carregar. Para passar config **antes** do init (ex.: `sessionBar`, `mount`, `brand`, `position`, `persistence`), defina o objeto antes do `<script>` da lib:

```html
<script>
  window.ModoSimplesConfig = {
    position: 'bottom-left',
    sessionBar: true,
    mount: {
      chrome: ['.site-header .header-inner', 'header'],
      bar: ['header'],
    },
  };
</script>
<script src="/dist/modo-simples.min.js"></script>
```

`configure()` depois do boot continua válido (`simpleNav`, `sessionBar`, `fontUrl`, limiares…), mas chaves lidas só no init (`position`, `persistence`, `hostnamePersistence`, `brand`) precisam vir pelo pré-boot. O protótipo usa [`examples/js/ms-config.js`](../examples/js/ms-config.js).

### `simpleNav`

```js
window.ModoSimples.configure({
  simpleNav: [
    { label: 'Início', href: '/' },
    { label: 'Ajuda', href: '/ajuda', short: 'Ajuda' }, // rótulo curto no mobile
  ],
});
```

- Só injeta se **não** existir `[data-ms-pills]` autorado no HTML (protótipo Senac já tem markup próprio).
- Pills ficam visíveis com `html.ms-ativo`.
- Exemplo: [`examples/hello-modo-simples.html`](../examples/hello-modo-simples.html).

---

## 5. Preferências de usuário (estado persistido)

Controladas pelo painel / barra; salvas automaticamente (se `persistence: true`).

| Chave            | Valores                                 | Efeito                                                           |
| ---------------- | --------------------------------------- | ---------------------------------------------------------------- |
| `modoSimples`    | boolean                                 | Oculta distrações / marca principal / `html.ms-ativo`            |
| `textScale`      | `100` `125` `150` `175`                 | Escala tipográfica                                               |
| `colorTheme`     | `senac` `yellowBlack` `darkHigh` `soft` | Temas de cor                                                     |
| `dyslexiaFont`   | boolean                                 | Fonte Lexend                                                     |
| `readingRuler`   | boolean                                 | Régua de foco                                                    |
| `simpleLanguage` | boolean                                 | Linguagem simples (barra; ligada ao ativar MS)                   |
| `highlightLinks` | boolean                                 | Destaca links                                                    |
| `textSpacing`    | boolean                                 | Espaçamento WCAG 1.4.12                                          |
| `reducedMotion`  | boolean                                 | Reduz animações (também sincroniza com `prefers-reduced-motion`) |
| `hideImages`     | boolean                                 | Oculta `img` / `picture` / `video` / `.home-hero__media`         |

### Persistência

| Item                                | Detalhe                                                               |
| ----------------------------------- | --------------------------------------------------------------------- |
| Chave principal                     | `ms_state:<hostname>` (ou `ms_state` se `hostnamePersistence: false`) |
| Conteúdo                            | `{ modoSimples, options: { … } }`                                     |
| Principal manual                    | `ms_principal:<hostname>` (seletor CSS do conteúdo escolhido)         |
| Preferência “mostrar imagens no MS” | `ms_preferShowImagesInMs:<hostname>`                                  |
| Falha de storage                    | Silenciosa — a lib continua sem persistir                             |
| Hosts diferentes                    | `localhost` ≠ `127.0.0.1` ≠ IP da rede — cada um tem seu estado       |

Preferências do painel (tema, escala, etc.) **persistem entre páginas** mesmo com MS desligado.  
`simpleLanguage` só é restaurada se o MS estiver ativo.

**Linguagem Simples exige markup duplo:** o efeito vem de pares `[data-ms-plain]` (texto padrão) + `[data-ms-simple]` (versão simples) escritos pelo host — a lib não reescreve texto. Sem pelo menos um par de cada na página, o botão da barra mostra **"Indisponível nesta página"** (`aria-disabled`, não alterna) e `enable()` não liga `simpleLanguage`.

---

## 6. Classes e atributos no DOM

### No `<html>` (aplicados pela lib)

| Classe                                          | Quando              |
| ----------------------------------------------- | ------------------- |
| `ms-ativo`                                      | Modo Simples ligado |
| `ms-text-scale-{100\|125\|150\|175}`            | Escala              |
| `ms-theme-{senac\|yellowBlack\|darkHigh\|soft}` | Tema                |
| `ms-dyslexia-font`                              | Lexend              |
| `ms-highlight-links`                            | Links destacados    |
| `ms-text-spacing`                               | Espaçamento         |
| `ms-reduced-motion`                             | Menos motion        |
| `ms-hide-images`                                | Imagens ocultas     |
| `ms-reading-ruler`                              | Régua ativa         |
| `ms-simple-language`                            | Linguagem simples   |

### Marcadores no conteúdo

| Atributo / seletor        | Papel                                     |
| ------------------------- | ----------------------------------------- |
| `[data-ms-principal]`     | Conteúdo principal detectado ou escolhido |
| `[data-ms-hidden="true"]` | Distração oculta com MS on                |
| `[data-ms-tts-active]`    | Bloco sendo lido pelo TTS                 |
| `[data-ms-keep-img]`      | Imagem **não** oculta por `hideImages`    |
| `[data-ms-pills]`         | Nav de pills (host ou injetada)           |
| `#ms-container`           | Host Shadow DOM (painel + FAB)            |
| `#ms-session-bar`         | Barra âmbar                               |
| `#ms-simples-chrome`      | Toggle SIMPLES                            |

### Markup opcional do host (layout “clean” tipo Senac)

A lib **não** gera hub/pills de marketing sozinha. Para dual markup:

| Classe / atributo                     | Papel                                             |
| ------------------------------------- | ------------------------------------------------- |
| `.ms-simple-hide`                     | Some com `html.ms-ativo` (hero, marketing)        |
| `.ms-simple-only` / `.ms-simple-view` | Aparece só com MS on                              |
| `data-ms-plain` / `data-ms-simple`    | Pares de texto institucional vs linguagem simples |
| `<main>` ou `[role="main"]`           | Melhora heurística e TTS                          |

Sem essas classes, sites externos ganham chrome + redução de ruído heurística — **não** um hub Senac automático.

---

## 7. Arquitetura (para implementação)

```
src/
  modo-simples.js          ← orquestrador + API + auto-boot
  config/defaults.js       ← configuração da lib
  core/                    ← state, eventBus, persistence, hydrate
  ui/                      ← FAB, painel, sessionChrome, styles
  mutator/                 ← classes no html, hide distractions, observer
  heuristics/              ← conteúdo principal + distrações + scoring
  features/                ← TTS, régua, seleção manual, simpleNav
  utils/                   ← aria, focus, mediaQuery
dist/
  modo-simples(.min).js    ← bundle IIFE (produção)
```

Fluxo resumido:

1. `init()` carrega estado persistido → injeta CSS de página → monta UI
2. `applyOptions()` / `applyModoSimples()` mutam o DOM
3. `stateChange` sincroniza painel, barra, persistência e anúncios ARIA
4. MutationObserver reprocessa após mudanças no DOM do host

---

## 8. Checklist rápido de integração

1. Incluir o script (módulo ou `dist/*.min.js`) via HTTP
2. Garantir `<main>` (ou equivalente) com o conteúdo importante
3. (Opcional) `configure({ simpleNav, position, … })`
4. (Opcional) Dual markup `.ms-simple-hide` / `.ms-simple-view`
5. Testar MS on/off, tema, reload em **duas páginas** do mesmo hostname
6. Validar leitores de tela / teclado (Esc fecha o painel)

---

## 9. Limitações conhecidas

| Limitação                  | Detalhe                                       | Mitigação                                         |
| -------------------------- | --------------------------------------------- | ------------------------------------------------- |
| CSP / scripts bloqueados   | Bookmarklet e `<script>` externo podem falhar | Bundle no mesmo origin                            |
| iframes cross-origin       | Não altera conteúdo interno                   | Ocultar iframe não essencial                      |
| CSS Modules / classes hash | Seletores genéricos falham                    | HTML semântico + seleção manual                   |
| SPAs muito dinâmicas       | Re-render pode exigir reprocessamento         | Observer + debounce (já na lib)                   |
| Temas agressivos           | Usam `!important`                             | Usuário troca tema; header/chrome têm fundo opaco |
| Barra / toggle             | Dependem de achar `<header>` / `<nav>`        | Fallback fixo na lib                              |
| TTS                        | Vozes do SO                                   | Botão Parar; highlight por bloco                  |
| `file://`                  | ES modules não carregam                       | `npm run preview` ou HTTP                         |
| Resumo por IA              | Mockup cita “resume”                          | MVP prioriza/oculta; sem NLP                      |
| Hosts misturados           | Persistência por hostname                     | Usar sempre o mesmo host na demo                  |

Validação externa: [validacao-sites.md](./validacao-sites.md).

---

## 10. Relação com a proposta

| Ação da proposta            | Entrega                                              |
| --------------------------- | ---------------------------------------------------- |
| Ferramenta aplicável        | Script injetável + bookmarklet + `dist/`             |
| Modelo para desenvolvedores | Este guia + `hello-modo-simples.html` + API + README |
| Inclusão cognitiva          | Painel + barra SIMPLES (docs 06/07)                  |
