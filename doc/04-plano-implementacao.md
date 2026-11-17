# Plano de implementação — Modo Simples

Plano operacional em **tasks** para concluir a proposta do Projeto Integrador e entregar a ferramenta + protótipo Senac Minas.

Documentos relacionados: [proposta](./01-proposta.md) · [contexto](./02-contexto-repo.md) · [status](./03-status-implementacao.md) · [UI painel](./06-ui-painel-acessibilidade.md) · [UI barra](./07-ui-barra-modo-simples.md) · plano técnico legado em [`arquivo/implementation_plan.md`](./arquivo/implementation_plan.md)

---

## 1. Objetivo do plano

Entregar, de forma demonstrável e documentada:

1. **Ferramenta aplicável** — script injetável que ativa o Modo Simples e opções de acessibilidade em qualquer página.
2. **Protótipo Senac Minas** — site de exemplo com várias páginas, todas com o script integrado.
3. **Modelo para desenvolvedores** — build (`dist/`), API pública e guia de integração em 1 linha.

Público-alvo da experiência: pessoas com barreira digital (ex.: idosos, TDAH, espectro autista) e quem se beneficia de interface com menos ruído.

---

## 2. Princípios (não negociáveis)

| Princípio            | Regra prática                                                        |
| -------------------- | -------------------------------------------------------------------- |
| Não destrutivo       | Nunca remover nós do DOM; só classes/atributos (`data-ms-*`, `ms-*`) |
| Reversível           | Um clique desfaz tudo                                                |
| Zero deps no bundle  | Bundle final sem dependências de runtime                             |
| A11y first           | Teclado, foco, ARIA, contraste, `prefers-reduced-motion`             |
| Páginas ≠ biblioteca | Markup em `examples/`; lógica em `src/`                              |
| HTML semântico       | `header` / `nav` / `main` / `footer` nas páginas novas               |

---

## 3. Baseline (já feito — não reimplementar)

Use isto como ponto de partida. Tasks abaixo partem daqui.

| ID base | Entrega                                                               | Onde                              |
| ------- | --------------------------------------------------------------------- | --------------------------------- |
| B01     | Ambiente Prettier + Husky + VS Code                                   | raiz                              |
| B02     | Biblioteca: state, eventBus, persistence                              | `src/core/`                       |
| B03     | UI radial + botão central (Shadow DOM)                                | `src/ui/`                         |
| B04     | Heurísticas + DOM mutator + observer                                  | `src/heuristics/`, `src/mutator/` |
| B05     | Opções (contraste, texto, motion, links, fonte, espaçamento, imagens) | state + styles                    |
| B06     | Scripts de build e testes unitários                                   | `scripts/`, `tests/unit/`         |
| B07     | Demo em Sobre Nós / Início / Contato (script módulo)                  | `examples/*.html`                 |

---

## 4. Fases e tasks

Convenção de IDs: `F{fase}-T{número}`  
Prioridade: **P0** (bloqueia entrega) · **P1** (alta) · **P2** (desejável) · **P3** (fase final / opcional)

Critério de conclusão de task: checklist de **Aceite** marcado + atualização em [03-status-implementacao.md](./03-status-implementacao.md).

---

### Fase 0 — Alinhamento e inventário (1–2 dias)

Objetivo: time na mesma página; inventário do que já existe vs. o que falta nas páginas.

#### F0-T01 — Congelar escopo da entrega do PI

- **Prioridade:** P0
- **Depende de:** —
- **Descrição:** Definir o que entra na entrega da UC (MVP do protótipo + lib estável) vs. o que fica como “fase 3 / nice-to-have”.
- **Aceite:**
  - [x] Escopo escrito neste plano (seção 8) revisado pela equipe
  - [x] Lista de páginas obrigatórias acordada (mínimo: Início, Sobre Nós, Cursos, Contato)
- **Saída:** escopo fechado; backlog P3 explícito
- **Concluído em:** 2026-09-10 — escopo congelado na seção 8 (inclui Pesquisa mínima para evitar 404)

#### F0-T02 — Inventário das páginas da equipe

- **Prioridade:** P0
- **Depende de:** —
- **Descrição:** Listar arquivos já no repo (`index`, `contato`, `sobrenos`, CSS, `img/`) e o que ainda falta (`cursos`, `pesquisa`, unificação de estilos/assets).
- **Aceite:**
  - [x] Tabela atualizada em `03-status-implementacao.md`
  - [x] Decisão: manter `examples/imagem/` + `examples/img/` ou unificar numa pasta só
- **Saída:** mapa de páginas + assets → [05-inventario-prototipo.md](./05-inventario-prototipo.md)
- **Concluído em:** 2026-09-10 — **unificar em `examples/img/`**; `imagem/` legada até F1-T03

#### F0-T03 — Papéis e donos por frente

- **Prioridade:** P0
- **Depende de:** F0-T01
- **Descrição:** Atribuir responsável (e backup) por: páginas HTML/CSS, biblioteca JS, testes/a11y, documentação, apresentação.
- **Aceite:**
  - [x] Tabela de donos preenchida na seção 9 deste doc
- **Saída:** RACI simples
- **Concluído em:** 2026-09-10 — proposta inicial por histórico Git; equipe pode ajustar nomes

---

### Fase 1 — Protótipo Senac completo e homogêneo (P0) — **CONCLUÍDA** (2026-09-10)

Objetivo: site demonstrável de ponta a ponta, sem links quebrados, com markup amigável às heurísticas.

#### F1-T01 — Entregar página **Cursos** ✅

- **Aceite:** todos marcados · `examples/cursos.html` + `CSS/paginas-internas.css`

#### F1-T02 — Entregar página **Pesquisa** ✅

- **Aceite:** `examples/pesquisa.html` com busca local mínima

#### F1-T03 — Unificar navegação e rodapé ✅

- Nav MVP: Início / Sobre Nós / Cursos / Contato + Pesquisar
- Assets canônicos em `examples/img/`; logo local em todas as páginas
- Footer simples nas páginas internas + home

#### F1-T04 — Markup semântico ✅

- `<main>` em todas as páginas; labels no formulário de contato; headings/alts revisados

#### F1-T05 — Integrar Modo Simples em todas as páginas ✅

- Snippet `../src/modo-simples.js` nas 5 páginas

#### F1-T06 — Smoke test ✅

- HTTP 200 em páginas/assets/script · checklist: [checklists/smoke-fase1.md](./checklists/smoke-fase1.md)

---

### Fase 2 — Biblioteca robusta (hardening)

Objetivo: fechar gaps técnicos da proposta (fallback, confiança, DX de build).

#### F2-T01 — Validar e corrigir build do bundle

- **Prioridade:** P0
- **Depende de:** —
- **Descrição:** Rodar `npm install` + `npm run build`; garantir `dist/modo-simples.js` e/ou `.min.js` utilizáveis via `<script>` clássico (não só ES module).
- **Aceite:**
  - [ ] Build conclui sem erro
  - [ ] Página de exemplo carrega o bundle de `dist/` e o menu aparece
  - [ ] README documenta o comando
- **Saída:** fluxo prod documentado

#### F2-T02 — Modo de integração dual (dev vs prod)

- **Prioridade:** P1
- **Depende de:** F2-T01
- **Descrição:** Padronizar comentário/snippet nas páginas: módulo ES em dev; `dist/*.min.js` em prod. Opcional: script de preview local (`npx serve examples` ou similar).
- **Aceite:**
  - [ ] Instruções claras em README / `doc/`
  - [ ] Pelo menos uma página (ou branch de release) usando o bundle minificado
- **Saída:** DX previsível para a equipe

#### F2-T03 — Fallback de seleção manual do conteúdo

- **Prioridade:** P1
- **Depende de:** —
- **Descrição:** Quando a confiança da heurística < limiar (`confidenceThreshold`), permitir que o usuário indique o bloco principal (ex.: 1–2 cliques) e persistir a escolha.
- **Aceite:**
  - [ ] UI de fallback acessível por teclado
  - [ ] Escolha salva (por hostname se F2-T04 existir; senão global da página)
  - [ ] Teste unitário ou integração mínima cobrindo o fluxo
- **Saída:** requisito F9 do plano técnico atendido

#### F2-T04 — Preferências por hostname

- **Prioridade:** P2
- **Depende de:** F2-T03 (recomendado)
- **Descrição:** Guardar no `localStorage` seletores/estado por domínio, com prioridade sobre heurística automática.
- **Aceite:**
  - [ ] Site A e Site B não sobrescrevem preferências um do outro
  - [ ] API/`configure` ainda funciona
- **Saída:** multi-site prático

#### F2-T05 — Melhorar heurísticas (acurácia)

- **Prioridade:** P1
- **Depende de:** F1-T05
- **Descrição:** Ajustar scoring/seletores com base em falhas reais no protótipo (carrosséis, sidebars, popups de `index`/`contato`).
- **Aceite:**
  - [ ] Em cada página do protótipo, Modo Simples deixa o conteúdo útil visível e esconde ruído óbvio
  - [ ] Casos edge documentados (o que ainda falha)
- **Saída:** heurística “boa o suficiente” para demo da UC

#### F2-T06 — Cobertura de testes da biblioteca

- **Prioridade:** P1
- **Depende de:** F2-T03 (parcial)
- **Descrição:** Completar unitários faltantes (`contentDetector`, `domMutator`, UI smoke se viável) e manter `npm test` verde.
- **Aceite:**
  - [x] `npm test` passa localmente e no CI (GitHub Actions, `.github/workflows/ci.yml`, job `quality`)
  - [ ] Novos módulos críticos com pelo menos 1 teste de regressão
- **Saída:** rede de segurança para refactors

#### F2-T07 — Testes de integração (Playwright ou equivalente)

- **Prioridade:** P2
- **Depende de:** F1-T05, F2-T01
- **Descrição:** Automatizar: carregar página → botão existe → ativar Modo Simples → atributos `data-ms-*` aplicados → reload restaura estado.
- **Aceite:**
  - [ ] Suite mínima rodando em 1 comando npm
  - [ ] Documentado no README
- **Saída:** regressão automática da demo

#### F2-T08 — Redesenhar UI: painel modal (mockup PI)

- **Prioridade:** P0
- **Depende de:** —
- **Spec:** [06-ui-painel-acessibilidade.md](./06-ui-painel-acessibilidade.md)
- **Descrição:** Substituir/evoluir o menu radial para o painel “Acessibilidade Digital” (header Senac, FAB laranja, card Modo Simples, seções scrolláveis). Manter Shadow DOM, Esc, focus trap.
- **Aceite:**
  - [ ] Visual alinhado ao mockup (estruturalmente)
  - [ ] FAB abre/fecha; `X` e Esc fecham
  - [ ] Modo Simples em card destaque funcional
  - [ ] Não regressa o protótipo `examples/`
- **Saída:** nova UI do widget

#### F2-T09 — Escala de texto 100 / 125 / 150 / 175

- **Prioridade:** P0
- **Depende de:** F2-T08 (ou em paralelo com state)
- **Descrição:** Trocar `largerText` boolean por `textScale`; segmented control no painel; CSS correspondente.
- **Aceite:**
  - [ ] Quatro opções exclusivas
  - [ ] Persistência no `localStorage`
  - [ ] Opção selecionada com estilo “ativo” (azul)

#### F2-T10 — Temas de contraste (4 opções)

- **Prioridade:** P0
- **Depende de:** F2-T08
- **Descrição:** `colorTheme`: Senac · Amarelo/Preto · Escuro Alto · Descanso/Suave; grid 2×2 no painel.
- **Aceite:**
  - [ ] Quatro temas exclusivos aplicados via classe no `<html>`
  - [ ] Persistência
  - [ ] Tema Senac = default

#### F2-T11 — Régua de foco de leitura

- **Prioridade:** P1
- **Depende de:** F2-T08
- **Descrição:** Overlay que destaca a linha sob o cursor/foco para auxílio TDAH/leitura.
- **Aceite:**
  - [ ] Toggle no painel
  - [ ] Ativa/desativa sem quebrar scroll
  - [ ] Respeita `prefers-reduced-motion` se animar

#### F2-T12 — Botão “Ouvir” (TTS pt-BR)

- **Prioridade:** P1
- **Depende de:** F2-T08
- **Descrição:** Usar `speechSynthesis` para ler títulos/textos do conteúdo principal em português.
- **Aceite:**
  - [ ] Botão “Ouvir” no painel
  - [ ] Lê o `<main>` (ou bloco `data-ms-principal`)
  - [ ] Permite parar (segundo clique ou botão Parar)

#### F2-T13 — Fonte Lexend (acessível)

- **Prioridade:** P1
- **Depende de:** F2-T08
- **Descrição:** Toggle “Fonte Acessível (Lexend)” com stack tipográfica adequada (CDN ou font no bundle).
- **Aceite:**
  - [ ] Fonte aplicada no conteúdo principal ao ativar
  - [ ] Fallback se Lexend não carregar
  - [ ] Persistência

#### F2-T14 — Toggle SIMPLES no header + barra abaixo do nav ✅

#### F2-T15 — Botões da sessão ativa (barra ON) ✅

Implementados via `src/ui/sessionChrome.js` (sincronizados com `modoSimples` / `simpleLanguage` / TTS).

---

### Fase 3 — Acessibilidade, validação e modelo para devs — **CONCLUÍDA** (2026-09-10)

| Task                   | Status                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| F3-T01 Auditoria a11y  | ✅ `doc/checklists/a11y-menu.md` + fixes FAB/labels/foco            |
| F3-T02 Leitor de tela  | ✅ `doc/checklists/leitor-tela.md`                                  |
| F3-T03 Matriz sites    | ✅ `doc/validacao-sites.md`                                         |
| F3-T04 Guia integração | ✅ `doc/09-guia-integracao.md` + `examples/hello-modo-simples.html` |
| F3-T05 README produto  | ✅                                                                  |
| F3-T06 Bookmarklet     | ✅ `doc/10-bookmarklet.md`                                          |

---

### Fase 4 — Estudo de caso, métricas e entrega da UC — **CONCLUÍDA** (2026-09-10)

| Task                                 | Status                                                |
| ------------------------------------ | ----------------------------------------------------- |
| F4-T01 Roteiro teste usuários        | ✅ [estudo-caso-roteiro.md](./estudo-caso-roteiro.md) |
| F4-T02 Métricas antes/depois         | ✅ [metricas-eficacia.md](./metricas-eficacia.md)     |
| F4-T03 Limitações conhecidas         | ✅ guia §6                                            |
| F4-T04 Pacote entrega / apresentação | ✅ [11-pacote-entrega.md](./11-pacote-entrega.md)     |

**Antes da banca:** a equipe preenche os tempos reais de 3 participantes e as contagens do script de métricas (instruções nos docs acima).

---

## 5. Backlog priorizado (visão rápida)

| ID     | Task                               | P   | Fase | Status                       |
| ------ | ---------------------------------- | --- | ---- | ---------------------------- |
| F0-T01 | Congelar escopo                    | P0  | 0    | **Feito**                    |
| F0-T02 | Inventário páginas/assets          | P0  | 0    | **Feito**                    |
| F0-T03 | Donos por frente                   | P0  | 0    | **Feito**                    |
| F1-T01 | Página Cursos                      | P0  | 1    | **Feito**                    |
| F1-T02 | Página Pesquisa ou limpar link     | P1  | 1    | **Feito**                    |
| F1-T03 | Unificar nav/footer/paths          | P0  | 1    | **Feito**                    |
| F1-T04 | Markup semântico                   | P0  | 1    | **Feito**                    |
| F1-T05 | Script em todas as páginas         | P0  | 1    | **Feito**                    |
| F1-T06 | Smoke test manual                  | P0  | 1    | **Feito** (HTTP + checklist) |
| F2-T01 | Build bundle válido                | P0  | 2    | **Feito**                    |
| F2-T02 | Snippet dev/prod                   | P1  | 2    | **Feito**                    |
| F2-T03 | Fallback seleção manual            | P1  | 2    | **Feito**                    |
| F2-T04 | Preferências por hostname          | P2  | 2    | **Feito**                    |
| F2-T05 | Ajuste de heurísticas no protótipo | P1  | 2    | **Feito**                    |
| F2-T06 | Mais testes unitários              | P1  | 2    | **Feito**                    |
| F2-T07 | Testes integração                  | P2  | 2    | Adiado                       |
| F2-T08 | UI painel mockup PI                | P0  | 2    | **Feito**                    |
| F2-T09 | Escala texto 100–175%              | P0  | 2    | **Feito**                    |
| F2-T10 | 4 temas de contraste               | P0  | 2    | **Feito**                    |
| F2-T11 | Régua de foco                      | P1  | 2    | **Feito**                    |
| F2-T12 | TTS “Ouvir”                        | P1  | 2    | **Feito**                    |
| F2-T13 | Fonte Lexend                       | P1  | 2    | **Feito**                    |
| F2-T14 | Toggle SIMPLES + barra sob o nav   | P0  | 2    | **Feito**                    |
| F2-T15 | Botões da sessão ativa (barra ON)  | P0  | 2    | **Feito**                    |
| F3-T01 | Auditoria a11y do widget           | P0  | 3    | **Feito**                    |
| F3-T02 | Leitor de tela                     | P1  | 3    | **Feito**                    |
| F3-T03 | Matriz sites externos              | P2  | 3    | **Feito**                    |
| F3-T04 | Guia de integração                 | P0  | 3    | **Feito**                    |
| F3-T05 | README produto                     | P1  | 3    | **Feito**                    |
| F3-T06 | Bookmarklet                        | P3  | 3    | **Feito**                    |
| F4-T01 | Roteiro teste usuários             | P1  | 4    | **Feito**                    |
| F4-T02 | Métricas antes/depois              | P2  | 4    | **Feito**                    |
| F4-T03 | Limitações conhecidas              | P1  | 4    | **Feito**                    |
| F4-T04 | Pacote entrega UC                  | P0  | 4    | **Feito**                    |

---

## 6. Ordem sugerida de execução (caminho crítico)

```
F0 (escopo + inventário + donos)
        │
        ▼
F1-T01 Cursos ──► F1-T03 Nav unificada ──► F1-T04 Semântica
        │                                      │
        └──────────► F1-T05 Script em todas ◄──┘
                            │
                            ▼
                     F1-T06 Smoke test
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         F2-T01 Build   F2-T05 Heurística  F3-T01 A11y
              │             │             │
              ▼             ▼             ▼
         F2-T08 Painel  F2-T03 Fallback   F3-T02 SR
              │
              ▼
         F2-T14 Barra + toggle ──► F2-T15 Botões sessão
              │
              ▼
         F3-T04 Guia
              │
              ▼
         F4-T01 Estudo ──► F4-T04 Entrega
```

Paralelo recomendado: enquanto alguém fecha **páginas (F1)**, outra pessoa valida **build/testes (F2-T01/T06)** e outra prepara **docs (F3-T04/T05)**. Chrome da barra (**F2-T14/T15**) pode avançar em paralelo ao redesign do painel (**F2-T08**), desde que compartilhem o mesmo state `modoSimples`.

---

## 7. Definição de pronto (DoD) por task

Uma task só fecha se:

1. Código (ou doc) no `main` ou PR aprovado
2. Aceite da task 100% marcado
3. Sem regressão óbvia na demo (`sobrenos` / `index`)
4. Status atualizado em `doc/03-status-implementacao.md`
5. Formatação Prettier ok (Husky no commit)

**DoD da entrega do PI (F4-T04):**

- [ ] Protótipo com ≥ 4 páginas navegáveis + Modo Simples em todas
- [ ] `npm test` passando
- [ ] `npm run build` gerando bundle usável
- [ ] Guia de integração publicado em `doc/`
- [ ] Pelo menos um teste com usuário ou evidência de validação a11y
- [ ] Limitações documentadas

---

## 8. Escopo da entrega da UC — **CONGELADO** (F0-T01 · 2026-09-10)

Qualquer item novo só entra se a equipe reabrir explicitamente este freeze.

### Páginas obrigatórias (MVP)

| Página                      | Obrigatória  | Notas                                                               |
| --------------------------- | ------------ | ------------------------------------------------------------------- |
| Início (`index.html`)       | Sim          | Já existe                                                           |
| Sobre Nós (`sobrenos.html`) | Sim          | Já existe                                                           |
| Cursos (`cursos.html`)      | Sim          | Criar (F1-T01)                                                      |
| Contato (`contato.html`)    | Sim          | Já existe                                                           |
| Pesquisa (`pesquisa.html`)  | Sim (mínima) | Página simples para não deixar 404; não precisa busca real (F1-T02) |

### Entra (MVP)

- Biblioteca Modo Simples estável e ativa em **todas** as páginas acima
- **UI do painel conforme mockup** ([06-ui-painel-acessibilidade.md](./06-ui-painel-acessibilidade.md)) — FAB + painel com Modo Simples, texto, temas e auxílios cognitivos
- **Chrome Modo Simples no header + barra sob o nav** ([07-ui-barra-modo-simples.md](./07-ui-barra-modo-simples.md)) — toggle SIMPLES, faixa off/on e botões da sessão ativa (Ouvir, Linguagem Simples, Voltar)
- Nav/footer e paths de assets consistentes (`examples/img/` canônica)
- `npm run build` gerando bundle usável + snippet documentado
- Guia de integração para desenvolvedores (`doc/`)
- Auditoria a11y básica do widget (checklist)
- Smoke test manual do protótipo
- Piloto com usuários (ideal; mínimo 3 pessoas) **ou** evidência equivalente de validação a11y

### Fora do MVP / depois (P3 ou pós-UC)

- Bookmarklet polido
- Acurácia ≥ 85% em 20 sites externos
- ~~Playwright completo em CI~~ — feito na F1: job `e2e` do `.github/workflows/ci.yml` (Chromium, desktop + mobile, axe)
- Preferências por hostname sofisticadas (F2-T04 fica P2 — só se der tempo)
- Resumo automático por IA do conteúdo (o mockup menciona “resume”; MVP usa heurística de priorização)
- App nativo / extensões de browser
- Recriar 1:1 todas as seções do site real Senac (links `#` de “Para empresas”, etc. podem permanecer placeholder)

### Decisões de produto travadas

1. **Assets:** só `examples/img/` (ver inventário).
2. **Pesquisa:** entra no MVP como página mínima (evita links mortos).
3. **Visual unificado perfeito** entre Início/Contato/Sobre Nós: desejável na F1, mas **não bloqueia** entrega se nav + script + semântica estiverem ok.

---

## 9. Donos por frente (F0-T03 · 2026-09-10)

Proposta inicial com base no histórico Git (Lucas → lib; Flavio → páginas). Ajustar se a equipe redistribuir.

| Frente                         | Responsável                      | Backup                                             | Notas                                                 |
| ------------------------------ | -------------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| Páginas HTML/CSS (`examples/`) | Flavio Magno Fulgencio Junior    | Juliana Gomes · Larisse Aparecida de Rezende Silva | Cursos, Pesquisa, unificar nav/assets                 |
| Biblioteca JS (`src/`)         | Lucas Frederico Soares de Aragão | Márcio José da Silva Junior                        | Build, heurísticas, fallback, **UI painel (F2-T08+)** |
| Testes / a11y                  | Márcio José da Silva Junior      | Lucas Frederico Soares de Aragão                   | Unitários, checklist a11y, smoke                      |
| Documentação (`doc/`)          | Reynaldo Julio Lara Rodriguez    | Lucas Frederico Soares de Aragão                   | Guia integração, status, inventário                   |
| Apresentação / estudo de caso  | Juliana Gomes                    | Larisse Aparecida de Rezende Silva · Flavio        | Roteiro usuários, slides, demo                        |

### RACI resumido

| Entrega                | R        | A      | C                | I     |
| ---------------------- | -------- | ------ | ---------------- | ----- |
| Protótipo páginas      | Flavio   | Equipe | Juliana, Larisse | Todos |
| Lib Modo Simples       | Lucas    | Equipe | Márcio           | Todos |
| Testes / a11y          | Márcio   | Lucas  | Flavio           | Todos |
| Docs                   | Reynaldo | Lucas  | Todos            | —     |
| Banca / estudo de caso | Juliana  | Equipe | Larisse, Flavio  | Todos |

R = faz · A = responde pela qualidade · C = consulta · I = informado

---

## 10. Riscos e mitigações

| Risco                                          | Impacto                      | Mitigação                                          |
| ---------------------------------------------- | ---------------------------- | -------------------------------------------------- |
| Páginas da equipe com layouts muito diferentes | Heurística falha             | F1-T04 semântica + F2-T05 ajuste + F2-T03 fallback |
| Paths de CSS/imagens inconsistentes            | Demo quebra                  | F1-T03 unificação                                  |
| Build ES module vs IIFE confunde a equipe      | Integração falha             | F2-T01 + F2-T02 + guia                             |
| Prazo curto                                    | Escopo infla                 | F0-T01 freeze; P3 explícito fora                   |
| Pouca evidência de inclusão                    | Justificativa fraca na banca | F3-T01/T02 + F4-T01                                |

---

## 11. Como usar este plano no dia a dia

1. Pegue a próxima task **P0** sem dependência aberta.
2. Crie branch `feat/F1-T01-cursos` (ou similar).
3. Implemente só o aceite da task.
4. Abra PR → merge no `main`.
5. Marque o aceite aqui e atualize `03-status-implementacao.md`.

Status das checkboxes deste arquivo = fonte da verdade do plano; o `03` resume o estado do produto.

---

## 12. Continuação — Fase 5 (UX)

Melhorias pós–F0–F4 (páginas agradáveis, nav completa por seção, Modo Simples no estilo da referência, testes de estrutura):

→ **[12-plano-melhorias-ux.md](./12-plano-melhorias-ux.md)**
