# Heurísticas — casos edge (F2-T05)

Após ajustes de seletores (`slider`, `s1`, `barra-superior`, etc.):

| Página    | Comportamento esperado                                  | Edge / limitação                                                                                   |
| --------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Início    | Oculta header/nav/carrossel; mantém `<main>` com cursos | Carrossel (`.slider` / `.s1`) some no Modo Simples — intencional                                   |
| Sobre Nós | Mantém texto + vídeo no main; oculta header/footer      | iframe do YouTube pode ser ocultado se casar seletor `iframe` — conteúdo principal deve permanecer |
| Cursos    | Cards no main visíveis                                  | OK se `<main>` semântico                                                                           |
| Contato   | Form no main; barra superior/footer ocultos             | Footer longo some (ruído) — OK                                                                     |
| Pesquisa  | Form de busca no main                                   | OK                                                                                                 |

Se a confiança da heurística for baixa, o painel/fluxo pede **seleção manual** do bloco principal (F2-T03) e salva o caminho por hostname (F2-T04).

## Pesos e limiares (A-12)

Fonte: `src/config/defaults.js` (`scoring`, `confidenceThreshold`), `src/heuristics/scoring.js` e `src/heuristics/contentDetector.js`. Todos podem ser sobrescritos por `configure()` (o `scoring` é mesclado chave a chave).

### Pontuação de um candidato (`scoreElement`)

| Critério                                     | Chave                     | Pontos         |
| -------------------------------------------- | ------------------------- | -------------- |
| Tag `<main>`                                 | `mainTagBonus`            | 100            |
| `role="main"`                                | `roleMainBonus`           | 90             |
| Tag `<article>`                              | `articleBonus`            | 60             |
| Contém `<h1>`                                | `h1Bonus`                 | 30             |
| Contém `<h2>`                                | `h2Bonus`                 | 20             |
| Texto ≥ `minTextLength` (200 caracteres)     | `textLengthBonus`         | 40             |
| Texto ≥ 3 × `minTextLength` (600 caracteres) | `textLengthBonus` de novo | +40 (total 80) |

Os bônus somam. Não há teto e a pontuação não olha estilo nem geometria (rápido o bastante para rodar a cada carga). Candidatos vêm de `mainSelectors`; empate de nota vence o seletor que aparece primeiro na lista.

### Confiança e decisão

- `confiança = min(melhor nota / ideal, 1)`, com `ideal = mainTagBonus + h1Bonus + 2 × textLengthBonus` = **210** com os pesos padrão. Sem nenhum candidato: o `<body>` é usado com confiança 0.
- `confidenceThreshold = 0.45`: com confiança **abaixo** de 0,45 (`<`) o conteúdo não é aplicado automaticamente e o fluxo pede seleção manual. 0,45 × 210 = 94,5, então a nota mínima é **95**.

| Exemplo                                              | Nota | Confiança | Resultado      |
| ---------------------------------------------------- | ---- | --------- | -------------- |
| `<main>` sem texto nem títulos                       | 100  | 0,48      | automático     |
| `<article>` com `<h1>`, texto curto                  | 90   | 0,43      | seleção manual |
| `<article>` com `<h1>` e `<h2>`                      | 110  | 0,52      | automático     |
| `<div id="content">` com 700 caracteres, sem títulos | 80   | 0,38      | seleção manual |

Ajuste: subir `confidenceThreshold` pede seleção manual com mais frequência; baixar aceita mais palpites em sites sem marcação semântica. Ao mudar pesos, refaça `ideal` (é derivado de `mainTagBonus`, `h1Bonus` e `textLengthBonus`) e os testes de `heuristics`.
