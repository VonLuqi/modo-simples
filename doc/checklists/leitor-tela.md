# Relato — teste com leitor de tela (F3-T02)

Data: **2026-09-10**  
Ambiente previsto: **Windows** + **Narrator** ou **NVDA** + Firefox/Chrome  
Página: `examples/sobrenos.html` (via `npm run preview`)

## Percurso

| Passo | Ação | Anúncio esperado | Resultado |
| --- | --- | --- | --- |
| 1 | Focar FAB | “Abrir painel de acessibilidade, botão” (+ collapsed/expanded) | ✅ Esperado (código) |
| 2 | Ativar FAB | “Painel de acessibilidade aberto” + diálogo “Acessibilidade Digital” | ✅ `announce` + `role=dialog` |
| 3 | Tab nos controles | Switch Modo Simples, radios de texto/tema, switches cognitivos | ✅ |
| 4 | Ativar Modo Simples | “Modo Simples ativado” | ✅ |
| 5 | Esc | Fecha diálogo; foco volta ao FAB (“Fechar…” → “Abrir…”) | ✅ |
| 6 | Toggle SIMPLES no header | Switch com nome Ativar/Desativar Modo Simples | ✅ |
| 7 | CTA “Ativar Modo Simples” na barra | Ativa modo; região “Modo Simples” | ✅ |
| 8 | “Ouvir Página” | “Lendo conteúdo principal” + voz do SO | ⚠️ Depende de vozes pt-BR instaladas |
| 9 | “Voltar ao Site Padrão” | “Modo Simples desativado” | ✅ |

## Limitações conhecidas (leitor de tela)

| Item | Impacto | Mitigação |
| --- | --- | --- |
| Shadow DOM do painel | Alguns leitores anunciam “grupo” genérico | `role=dialog` + `aria-labelledby` |
| TTS (`speechSynthesis`) | Voz/idioma varia por SO | Documentar no guia; botão Parar |
| Régua de leitura | Visual; pouco valor para SR | Não depende de SR |
| Ordem de foco com headers distintos | Chrome injetado em posições diferentes | Preferir páginas com `<header>`/`nav` semânticos |

## Evidência para banca

- Checklist P0 completo: [a11y-menu.md](./a11y-menu.md)
- Este relato + demo ao vivo (`npm run preview`)

> **Nota:** Percurso validado por inspeção de atributos ARIA/fluxo de código e smoke estrutural. Revalidar 5 minutos com Narrator/NVDA na máquina de apresentação e anotar divergências aqui.
