# Testes estruturais do protótipo

Suite **F5-T08** — valida o mapa Senac em `examples/` sem abrir o navegador.

## Como rodar

```bash
npm test                 # unitários + estruturais
npm run test:structure   # só estrutura
npm run test:unit        # só unitários
```

## O que cobre

| Check | Detalhe |
| --- | --- |
| Semântica | `header`, `nav[aria-label="Menu principal"]`, `main`, `footer` |
| Nav | 8 `href` idênticos e arquivos existentes |
| Script | `modo-simples.js` em cada página do mapa |
| Assets | CSS/`img`/scripts locais resolvem no disco |
| Shell | `tokens.css` + `shell.css` |
| MS | pills, `data-ms-plain`/`data-ms-simple`; hub na home; dual markup (`ms-simple-hide` + `ms-simple-view`) nas internas |
| Assistente | `cursos.html` / `psg.html` + `js/cursos-*.js` |

Arquivos: `tests/structure/prototypeStructure.test.js` · `helpers.js`

Se um link do nav ou um CSS canônico sumir, `npm test` **falha**.
