# Modo Simples

Script JavaScript injetável de **acessibilidade cognitiva** (Projeto Integrador 2025 · Senac).  
Licença **MIT** · versão **1.1.0**.

Inclui:

- Painel **Acessibilidade Digital** (FAB)
- Toggle **SIMPLES** + barra sob o menu
- Modo Simples (menos distrações), texto, temas, Lexend, régua, TTS
- Imagens ocultas por padrão no MS (reativáveis)
- Protótipo Senac Minas com hub, pills e assistente de cursos

Docs: [`doc/`](./doc/README.md) · Entrega banca: [`doc/11-pacote-entrega.md`](./doc/11-pacote-entrega.md) · Status: [`doc/03-status-implementacao.md`](./doc/03-status-implementacao.md)

---

## Começar em 1 minuto

```bash
git clone https://github.com/VonLuqi/modo-simples.git
cd modo-simples
npm install
npm run preview
```

Abra **`http://127.0.0.1:8765/`** — a raiz (e `/examples`) redireciona para o protótipo.

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

> Sirva sempre a **raiz do repo** (`npm run preview`), não só a pasta `examples/`: o script aponta para `../src/modo-simples.js`.  
> Não use URLs “limpas” sem `.html` (`/contato`) — use `/examples/contato.html`.

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
| `npm run build` | Gera `dist/modo-simples(.min).js` |
| `npm run format` | Prettier |

---

## Integração

```html
<!-- Dev -->
<script type="module" src="../src/modo-simples.js"></script>

<!-- Prod (após npm run build) -->
<script src="../dist/modo-simples.min.js"></script>
```

Guia completo: [`doc/09-guia-integracao.md`](./doc/09-guia-integracao.md)  
Bookmarklet: [`doc/10-bookmarklet.md`](./doc/10-bookmarklet.md)

```js
window.ModoSimples.enable();
window.ModoSimples.disable();
window.ModoSimples.toggle();
window.ModoSimples.configure({
  simpleNav: [{ label: 'Início', href: '/' }],
});
```

Pills em sites externos: ver [`doc/09-guia-integracao.md`](./doc/09-guia-integracao.md) e `examples/hello-modo-simples.html`.
---

## Padronização

Prettier + Husky + lint-staged. VS Code: format on save (`.vscode/`).
