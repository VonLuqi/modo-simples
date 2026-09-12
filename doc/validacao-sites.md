# Matriz de validação em sites externos (F3-T03 · atualizado F7)

Objetivo: evidenciar que o Modo Simples é uma **ferramenta aplicável** além do protótipo Senac.

Método: injetar o bundle via [bookmarklet](./10-bookmarklet.md) ou DevTools (`script` apontando para `dist/modo-simples.min.js` servido localmente).

## Contrato mínimo do host

Para resultado **preciso e persistente**:

1. Conteúdo útil em `<main>` ou `[role="main"]`
2. Chrome em `header` / `nav` / `footer` / `aside` (heurística esconde fora do main)
3. Preferências em `localStorage` por hostname (`ms_state:…`)
4. Layout “clean” tipo Senac: classes `ms-simple-hide` / `ms-simple-only` **ou** `ModoSimples.configure({ simpleNav })`
5. Chrome da lib (`#ms-session-bar`, `#ms-simples-chrome`, `[data-ms-pills]`, `#ms-container`) **nunca** é tratado como distração

## Resultados (avaliação estrutural + critérios de uso)

Critérios:

- **OK** — FAB/painel abrem; Modo Simples reduz ruído; conteúdo principal legível
- **Parcial** — funciona com falhas (seleção manual, tema agressivo, etc.)
- **Falhou** — script bloqueado ou UI inutilizável

| # | Tipo | Exemplo | Resultado | Observação |
| --- | --- | --- | --- | --- |
| 1 | Protótipo próprio | `examples/sobrenos.html` | **OK** | Dual markup F6 + imagens off F7 |
| 2 | Protótipo próprio | `examples/index.html` | **OK** | Hub + pills; hero some no MS |
| 3 | Protótipo próprio | `examples/contato.html` | **OK** | `ms-simple-view` no MS |
| 4 | Demo mínima | `examples/hello-modo-simples.html` | **OK** | Lib + `simpleNav` |
| 5 | Documentação | MDN (páginas artigo) | **Parcial** | Costuma ter `<main>`; chrome do site pode conflitar com barra |
| 6 | Notícias | Portal com `<article>` | **Parcial** | Heurística + fallback manual se confiança baixa |
| 7 | Gov | Página gov.br com landmarks | **Parcial** | CSP pode bloquear script externo / bookmarklet |
| 8 | Blog | Post semântico | **OK**/Parcial | Bom candidato a `<article>` |
| 9 | SPA | App React/Vue | **Parcial** | MutationObserver reprocessa; seleção manual ajuda |
| 10 | Site que bloqueia scripts | Alguns bancos/gov | **Falhou** | Fora do escopo |

### Meta

≥ **70%** OK ou Parcial utilizável → **atingida** (protótipo + hello OK; externos em geral Parcial).

## Como repetir o teste

1. `npm run build && npm run preview`
2. Em outro site: usar bookmarklet **ou** colar no console:

```js
var s = document.createElement('script');
s.src = 'http://127.0.0.1:8765/dist/modo-simples.min.js';
document.documentElement.appendChild(s);
```

3. Anotar OK / Parcial / Falhou nesta tabela.
4. Recarregar a página e confirmar persistência do estado no mesmo hostname.

## Limitações recorrentes

Ver [09-guia-integracao.md](./09-guia-integracao.md) §6 e [13-compatibilidade-browsers.md](./13-compatibilidade-browsers.md).
