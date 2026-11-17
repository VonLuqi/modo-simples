# Pacote de entrega — UC Projeto Integrador (F4-T04 · atualizado F5-T10)

## 1. Checklist de entrega

| Item                                           | Status                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| Protótipo Senac (8 páginas do mapa) + script   | ✅                                                                 |
| Biblioteca Modo Simples (painel + barra + FAB) | ✅                                                                 |
| Hub MS + pills + linguagem simples             | ✅ F5-T05                                                          |
| `npm test` passando                            | ✅                                                                 |
| `npm run build` gera `dist/`                   | ✅ (versionado no repo)                                            |
| Guia para desenvolvedores                      | ✅ `doc/09-guia-integracao.md` (API, config, markup, persistência) |
| UI documentada (painel + barra)                | ✅ docs 06 / 07                                                    |
| Auditoria a11y                                 | ✅ `doc/checklists/a11y-menu.md`                                   |
| Inventário de páginas                          | ✅ `doc/05-inventario-prototipo.md`                                |
| Estudo de caso (roteiro)                       | ✅ `doc/estudo-caso-roteiro.md`                                    |
| Métricas                                       | ✅ `doc/metricas-eficacia.md`                                      |
| Limitações no guia                             | ✅ seção 6 de `09`                                                 |
| Status                                         | ✅ `doc/03-status-implementacao.md`                                |
| LICENSE MIT + package `files`/`exports`        | ✅ F7 · v1.1.0                                                     |
| Compatibilidade browsers                       | ✅ `doc/13-compatibilidade-browsers.md`                            |
| Plano UX Fase 5                                | ✅ `doc/12-plano-melhorias-ux.md`                                  |

---

## 2. Demo em máquina limpa

```bash
git clone https://github.com/VonLuqi/modo-simples.git
cd modo-simples
npm install
npm run preview
```

Abrir: **`http://127.0.0.1:8765/`** (raiz → protótipo) ou  
`http://127.0.0.1:8765/examples/index.html`

Sempre use caminhos com **`.html`** sob `/examples/`. Não abrir só `/contato` na raiz.

Smoke: `npm run smoke:examples` · testes: `npm test`

Build opcional: `npm run build` → `dist/modo-simples.min.js`.

---

## 3. Guia de demo em 5 passos (banca)

Use o preview local. Fale em voz alta o que está mudando.

| Passo               | Ação                                                                               | O que mostrar                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **1. Ativar MS**    | Na home, ligue o toggle **SIMPLES** no header (único controle; a barra só convida) | `html.ms-ativo`; barra muda para “Modo Simples” (leitor de tela: “Modo Simples ativado”); distrações somem |
| **2. Pills**        | Aparece a faixa de atalhos MS sob o header                                         | Início · Cursos · PSG · Unidades · Atendente · Área do Aluno                                               |
| **3. Hub**          | Na home (ainda com MS ligado), mostre o **hub de cartões**                         | Navegação cognitiva sem o menu completo; contraste com o hero padrão                                       |
| **4. PSG**          | Clique na pill **PSG** (ou nav “Gratuitos”)                                        | Página `psg.html` com conteúdo simples + assistente de cursos gratuitos                                    |
| **5. Painel / TTS** | FAB laranja → painel; na barra, **Ouvir Página** e **Linguagem Simples**           | Escala/temas/Lexend; rótulo LIGADA/DESLIGADA; desligar MS pelo toggle **SIMPLES**                          |

Extras se sobrar tempo: `cursos.html` (assistente pago), `hello-modo-simples.html` (lib em página mínima).

---

## 4. Roteiro de apresentação (slides sugeridos)

| #   | Slide           | Conteúdo                                                    |
| --- | --------------- | ----------------------------------------------------------- |
| 1   | Capa            | Modo Simples · PI 2025 · Senac · turma / nomes              |
| 2   | Problema        | Excesso de informação; barreiras (idosos, TDAH, autismo)    |
| 3   | Objetivo        | Ferramenta aplicável + modelo para desenvolvedores          |
| 4   | Solução         | Script injetável; painel + barra (prints docs 06/07)        |
| 5   | Demo ao vivo    | 5 passos da seção 3 (MS → pills → hub → PSG → painel)       |
| 6   | Arquitetura     | Config → State → UI / Heurísticas → Mutator                 |
| 7   | Resultados      | Métricas + estudo de caso (tempos / citações)               |
| 8   | Modelo p/ devs  | 1 linha de `<script>` + API                                 |
| 9   | Limitações      | CSP, iframe, temas agressivos                               |
| 10  | Próximos passos | Mais usuários; Playwright; `simpleNav` (T11); hospedar dist |

Texto de apoio: [01-proposta](./01-proposta.md) · [metricas](./metricas-eficacia.md) · [estudo-caso](./estudo-caso-roteiro.md).

---

## 5. Mapa proposta → entrega

| Proposta                    | Entrega no repo                                     |
| --------------------------- | --------------------------------------------------- |
| Adaptar plataforma digital  | `examples/*` Senac (8 páginas + PSG/unidades/aluno) |
| Navegação mais simples      | Modo Simples + pills + hub + barra SIMPLES          |
| Modelo para desenvolvedores | `doc/09` + hello world + build                      |
| Inclusão                    | Painel cognitivo, a11y, roteiro de usuários         |

---

## 6. Antes da banca (equipe)

1. Preencher tempos reais de **3 participantes** em `estudo-caso-roteiro.md`.
2. Rodar o script de contagem em `metricas-eficacia.md` e colar números.
3. Ensaiar a demo dos **5 passos** (`preview`) uma vez offline.
4. Passar no checklist visual [pixel-banca.md](./checklists/pixel-banca.md).
5. Ter Narrator/NVDA só se for mostrar a11y (opcional).
