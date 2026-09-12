# Guia de integração — Modo Simples

Modelo para desenvolvedores (requisito da proposta do PI).  
UI: [06 painel](./06-ui-painel-acessibilidade.md) · [07 barra](./07-ui-barra-modo-simples.md)

---

## 1. O que o script faz

Ao incluir o Modo Simples em uma página:

1. Injeta FAB laranja (abre o painel **Acessibilidade Digital**)
2. Injeta toggle **SIMPLES** + barra laranja sob o `<nav>`
3. Permite ativar o **Modo Simples** (oculta distrações, destaca conteúdo principal)
4. Oferece tamanho de texto, temas, Lexend, régua de foco, TTS, etc.
5. Persiste preferências em `localStorage` (por hostname)

---

## 2. Instalação

### 2.1 Desenvolvimento (ES module)

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Demo Modo Simples</title>
  </head>
  <body>
    <header>
      <nav aria-label="Menu principal">
        <a href="#">Início</a>
      </nav>
    </header>
    <main>
      <h1>Conteúdo principal</h1>
      <p>Texto de exemplo para o Modo Simples destacar.</p>
    </main>
    <script type="module" src="../src/modo-simples.js"></script>
  </body>
</html>
```

Arquivo pronto: [`examples/hello-modo-simples.html`](../examples/hello-modo-simples.html)

```bash
npm install
npm run preview
# http://127.0.0.1:8765/examples/hello-modo-simples.html
```

> ES modules **não** funcionam via `file://`.

### 2.2 Produção (bundle IIFE)

```bash
npm run build
```

```html
<script src="/caminho/para/modo-simples.min.js"></script>
```

Arquivos gerados (locais, no `.gitignore`):

- `dist/modo-simples.js`
- `dist/modo-simples.min.js`

### 2.3 Bookmarklet

Ver [10-bookmarklet.md](./10-bookmarklet.md).

---

## 3. API pública

Após o load, a instância fica em `window.ModoSimples`:

| Método | Descrição |
| --- | --- |
| `enable()` | Ativa Modo Simples |
| `disable()` | Desativa Modo Simples |
| `toggle()` | Alterna Modo Simples |
| `configure(patch)` | Sobrescreve config (ex.: `confidenceThreshold`, `simpleNav`) |
| `destroy()` | Remove UI, estilos e listeners |

```js
window.ModoSimples.enable();
window.ModoSimples.configure({ confidenceThreshold: 0.4, position: 'bottom-left' });

// Pills injetáveis (F5-T11) — sites sem markup de [data-ms-pills]
window.ModoSimples.configure({
  simpleNav: [
    { label: 'Início', href: '/' },
    { label: 'Cursos Disponíveis', href: '/cursos', short: 'Cursos' },
  ],
});
```

`simpleNav` só injeta pills se a página **não** tiver `[data-ms-pills]` próprio (o protótipo Senac já traz o markup). Visíveis com Modo Simples ativo (`html.ms-ativo`). Exemplo: [`examples/hello-modo-simples.html`](../examples/hello-modo-simples.html).
---

## 4. Opções de estado (persistidas)

| Chave | Valores | Efeito |
| --- | --- | --- |
| `modoSimples` | boolean | Oculta distrações / marca principal |
| `textScale` | `100` `125` `150` `175` | Escala tipográfica |
| `colorTheme` | `senac` `yellowBlack` `darkHigh` `soft` | Temas |
| `dyslexiaFont` | boolean | Lexend |
| `readingRuler` | boolean | Régua de foco |
| `simpleLanguage` | boolean | Linguagem simples (barra) |
| `highlightLinks` | boolean | Destaca links |
| `textSpacing` | boolean | Espaçamento WCAG |
| `reducedMotion` | boolean | Reduz animações |
| `hideImages` | boolean | No MS: oculta imagens por padrão (reativável na barra/painel) |

---

## 5. Markup recomendado na página hospedeira

### O que a lib faz sozinha

- Injeta FAB, painel, toggle SIMPLES e barra âmbar
- Com MS on: oculta `header`/`nav`/`footer`/etc. (heurística), marca `[data-ms-principal]`, aplica opções
- `configure({ simpleNav: [...] })` injeta pills se a página não tiver `[data-ms-pills]`

### O que o host precisa marcar para layout “clean” (tipo Senac)

| Classe / atributo | Papel |
| --- | --- |
| `.ms-simple-hide` | Some com `html.ms-ativo` (hero, marketing) |
| `.ms-simple-only` / `.ms-simple-view` | Aparece só com MS on (resumo + CTAs) |
| `data-ms-plain` / `data-ms-simple` | Pares de linguagem |
| `<main>` ou `[role="main"]` | Conteúdo principal para heurística e TTS |
| `data-ms-keep-img` | Imagem mantida mesmo com “Ocultar imagens” |

Sem essas classes, sites externos ganham chrome + redução de ruído, **não** um hub Senac automático.

Persistência: estado por **hostname** em `localStorage` (`ms_state:hostname`).

Browsers: [13-compatibilidade-browsers.md](./13-compatibilidade-browsers.md).

---

## 6. Limitações conhecidas

O Modo Simples **não resolve** tudo. Limitações honestas para banca e integradores:

| Limitação | Detalhe | Mitigação |
| --- | --- | --- |
| CSP / scripts bloqueados | Bookmarklet e `<script>` externo podem falhar | Incluir o bundle no mesmo origin do site |
| iframes cross-origin | Não é possível ler/alterar conteúdo interno | Ocultar iframe não essencial; não entrar no frame |
| CSS Modules / classes hash | Seletores por classe genérica falham | HTML semântico + fallback de seleção manual |
| SPAs muito dinâmicas | Re-render pode exigir reprocessamento | MutationObserver + debounce (já na lib) |
| Temas agressivos | `yellowBlack` / `darkHigh` usam `!important` | Usuário troca tema; default = Senac |
| Barra sob o nav | Depende de achar `<nav>`/`<header>` | Fallback de posicionamento na lib |
| TTS | Depende das vozes do SO | Documentar; botão Parar |
| Shadow DOM | Anúncio pode variar entre leitores de tela | `role=dialog` + `announce()` |
| `file://` | ES modules não carregam | Sempre usar `npm run preview` ou HTTP |
| Resumo por IA | Mockup cita “resume conteúdos” | MVP prioriza/oculta; não gera resumo NLP |
| Sites que proíbem injeção | Fora do escopo | Integração oficial via tag no HTML |

Detalhes de validação externa: [validacao-sites.md](./validacao-sites.md).

---

## 7. Relação com a proposta

| Ação da proposta | Entrega |
| --- | --- |
| Ferramenta aplicável | Script injetável + bookmarklet |
| Modelo para desenvolvedores | Este guia + `hello-modo-simples.html` + API |
| Inclusão cognitiva | Painel + barra SIMPLES (docs 06/07) |
