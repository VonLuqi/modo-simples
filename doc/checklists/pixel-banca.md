# Checklist visual — banca (F5–F7)

Use com `npm run preview` → `http://127.0.0.1:8765/examples/index.html`.  
Marque cada item na revisão pré-apresentação.

## Lib (FAB / painel / chrome)

| # | Critério | OK? |
| --- | --- | --- |
| 1 | FAB laranja (`#f39200`) com sombra suave; tip azul “Acessibilidade & Modo Simples” + seta | ☐ |
| 2 | Tip some ao abrir o painel; ícone vira X | ☐ |
| 3 | Painel abre com leve fade/escala (sem salto brusco) | ☐ |
| 4 | Toggle **SIMPLES** no header muda borda/fundo âmbar quando ativo | ☐ |
| 5 | Barra âmbar: off = só texto de convite (ativar pelo **SIMPLES**); on = status + Ouvir / Linguagem / Imagens (sem “Voltar”) | ☐ |
| 6 | Switch do chrome desliza; foco visível (outline) em botões | ☐ |

## Protótipo Senac (Modo Simples)

| # | Critério | OK? |
| --- | --- | --- |
| 7 | **MS off:** textos institucionais (`data-ms-plain`); site limpo | ☐ |
| 8 | Ao ativar MS: pills + hub na home; dual markup nas internas | ☐ |
| 9 | Nav desktop **sem** scrollbar horizontal feia (wrap) | ☐ |
| 10 | Linguagem simples liga com MS; desliga ao voltar ao site padrão | ☐ |
| 11 | Imagens **ocultas** por padrão no MS; botão “Imagens: VISÍVEIS” restaura | ☐ |
| 12 | Tema Escuro/Amarelo: `.page-hero` legível (sem branco em fundo claro) | ☐ |
| 13 | **Ouvir Página:** highlight âmbar + scroll no bloco atual | ☐ |
| 14 | Contato: cards em grid utilizável (não “só na esquerda”) | ☐ |

## Motion / a11y

| # | Critério | OK? |
| --- | --- | --- |
| 15 | Com **Reduzir movimento**: sem animação tip/painel; TTS scroll sem smooth | ☐ |
| 16 | Mobile (~375px): tip legível; painel cabe; pills/nav scroll ok | ☐ |

## Extra (1 min)

| # | Critério | OK? |
| --- | --- | --- |
| 17 | `hello-modo-simples.html`: `simpleNav` injeta pills ao ativar MS | ☐ |

Roteiro falado: [11-pacote-entrega §3](../11-pacote-entrega.md#3-guia-de-demo-em-5-passos-banca).
