# Inventário do protótipo Senac Minas

Atualizado em **2026-09-10** (pós–**F5-T12** — Fase 5 completa).

Plano: [12-plano-melhorias-ux.md](./12-plano-melhorias-ux.md) · Tokens: [`examples/CSS/tokens.css`](../examples/CSS/tokens.css)

---

## 1. Páginas HTML

| Página | Arquivo | Status | Nav | Pills MS | Notas |
| --- | --- | --- | --- | --- | --- |
| Início | `examples/index.html` | ✅ | Sim | Hub + pills | Hub MS (cartões) |
| Sobre Nós | `examples/sobrenos.html` | ✅ | Sim | Sim | |
| Cursos | `examples/cursos.html` | ✅ | Sim | Sim | Assistente (T07) |
| Gratuitos (PSG) | `examples/psg.html` | ✅ T04 | Sim | Sim | Assistente PSG |
| Unidades | `examples/unidades.html` | ✅ T04 | Sim | Sim | |
| Contato | `examples/contato.html` | ✅ | Sim | Sim | Atendente |
| Área do Aluno | `examples/aluno.html` | ✅ T04 | Sim | Sim | |
| Pesquisar | `examples/pesquisa.html` | ✅ | Sim | Não | Fora do mapa MS |
| Hello MS | `examples/hello-modo-simples.html` | ✅ | Não | via `simpleNav` (T11) | Demo lib + pills injetadas |

**8 páginas no mapa Senac** + hello world da lib.

### CSS canônico

`tokens.css` · `shell.css` · `pages.css`

(legado em `examples/CSS/`: `reset`, `style`, `padrao`, `paginas-internas` — não usados pelo shell atual)

### Scripts

| Arquivo | Uso |
| --- | --- |
| `../src/modo-simples.js` | Biblioteca (painel, chrome, mutator, TTS) |
| `examples/js/cursos-data.js` | Catálogo cursos / PSG |
| `examples/js/cursos-assistente.js` | Assistente guiado |
| `scripts/sync-nav.cjs` | Sincroniza nav nas 8 páginas |
| `scripts/sync-ms-pills.cjs` | Sincroniza pills MS |
| `npm run smoke:examples` | Valida estrutura / assets / nav |
| `npm run smoke:assistente` | Smoke do assistente |
| `npm test` | Unitários + estruturais (`tests/structure/`) |

---

## 2. Assets

`examples/img/` canônica (logos, slides, fotos de apoio).

---

## 3. Nav (F5-T04)

Início · Sobre Nós · Cursos · Gratuitos (PSG) · Unidades · Contato · Área do Aluno · Pesquisar  

Mesmo bloco em todas as páginas do mapa; `aria-current="page"` na ativa.

### Pills MS (F5-T05)

Início · Cursos · PSG · Unidades · Atendente · Área do Aluno  

Visíveis com `html.ms-ativo`. Hub de cartões na home.

### Dual markup MS (F6)

Páginas internas usam `.ms-simple-hide` (hero/marketing) + `.ms-simple-view.ms-simple-only` (resumo + CTAs).  
Sobre Nós: texto curto sem iframe; vídeo vira link. Contato / Aluno / etc. seguem o mesmo padrão.

---

## 4. Gaps (Fase 5)

| Gap | Status |
| --- | --- |
| Spec / tokens | ✅ T01 |
| Preview / 404 | ✅ T02 |
| Shell visual único | ✅ T03 |
| Páginas + nav | ✅ T04 |
| MS hub/pills/linguagem | ✅ T05 |
| Chrome/FAB vs mockup | ✅ T06 |
| Assistente de cursos | ✅ T07 |
| Testes estrutura | ✅ T08 |
| Regressão lib | ✅ T09 |
| Docs / pacote entrega | ✅ T10 |
| `simpleNav` injetável | ✅ T11 |
| Pixel / motion | ✅ T12 · [pixel-banca.md](./checklists/pixel-banca.md) |

---

## 5. Mapa de pastas

```
examples/
├── index.html · sobrenos.html · cursos.html · psg.html
├── unidades.html · contato.html · aluno.html · pesquisa.html
├── hello-modo-simples.html
├── js/cursos-data.js · cursos-assistente.js
├── CSS/tokens.css · shell.css · pages.css
└── img/
```
