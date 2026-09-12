# Checklist a11y — painel + barra Modo Simples (F3-T01)

Data: **2026-09-10** · Referências: [06 painel](../06-ui-painel-acessibilidade.md) · [07 barra](../07-ui-barra-modo-simples.md)

Linha de base: **WCAG 2.1 AA** no widget (FAB, painel Shadow DOM, chrome SIMPLES, barra de sessão).

## P0 — obrigatório

| # | Critério | Onde | Status | Notas |
| --- | --- | --- | --- | --- |
| 1 | Nome acessível em todos os controles | FAB, switches, segmentos, temas, CTA, botões barra | ✅ | `aria-label` / texto visível |
| 2 | FAB: `aria-expanded` + `aria-controls` + `aria-haspopup="dialog"` | `fab.js` | ✅ | Corrigido na F3 |
| 3 | Painel: `role="dialog"` + `aria-modal` + `aria-labelledby` | `a11yPanel.js` | ✅ | |
| 4 | Focus trap no painel aberto | `trapFocus` | ✅ | |
| 5 | `Esc` fecha e devolve foco ao FAB | `modo-simples.js` | ✅ | |
| 6 | Foco visível (`:focus-visible`) | FAB, painel, barra, chrome | ✅ | Outline azul/branco; reforçado na barra na F3 |
| 7 | Switches com `role="switch"` + `aria-checked` | Painel + chrome | ✅ | Labels dinâmicos Ativar/Desativar |
| 8 | Escalas/temas: `radiogroup` + `role="radio"` | Painel | ✅ | `aria-label` completo nos segmentos/temas |
| 9 | Anúncios de mudança de estado | `announce()` / `aria-live` | ✅ | polite no `document.body` |
| 10 | Contraste texto do painel ≥ 4.5:1 | Header branco/azul; corpo escuro/claro | ✅ | CTA barra: texto `#8a5500` sobre branco |
| 11 | Zoom 200% — FAB e painel usáveis | Layout `min(380px,…)` + max-height | ✅ | Verificar visualmente no browser |
| 12 | Barra: `role="region"` + `aria-label` | `sessionChrome.js` | ✅ | |
| 13 | Ícones decorativos `aria-hidden` | SVG / estrelas | ✅ | |
| 14 | Não esconder foco com `outline: none` sem substituto | CSS UI | ✅ | |

## P1 — desejável

| # | Critério | Status | Notas |
| --- | --- | --- | --- |
| 15 | Preferência `prefers-reduced-motion` no UI | ✅ | Opção + CSS página |
| 16 | Ordem de foco lógica (chrome → barra → conteúdo → FAB) | ⚠️ | Depende do markup da página hospedeira |
| 17 | Painel scrollável com teclado | ✅ | Tab percorre controles |
| 18 | TTS com feedback “Ouvir/Parar” | ✅ | Label atualiza |

## Problemas corrigidos nesta auditoria (F3)

1. FAB sem `aria-haspopup="dialog"`
2. Segmentos/temas sem `aria-label` descritivo
3. Switch Modo Simples / SIMPLES sem label dinâmico Ativar/Desativar
4. Botões da barra sem `aria-label` explícito
5. Contraste do CTA da barra (laranja claro → `#8a5500`)
6. `:focus-visible` na barra/chrome

## Como revalidar

```bash
npm run preview
# Abrir examples/sobrenos.html
# Tab pelo FAB → painel; Esc; toggle SIMPLES; barra ON
```
