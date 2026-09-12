# Métricas de eficácia — antes / depois (F4-T02)

Medições no protótipo Senac (`examples/sobrenos.html` e páginas irmãs), alinhadas às metas do plano técnico (≥ 40% menos ruído visual orientativo).

---

## 1. Como medir (console do browser)

Com a página aberta (`npm run preview`):

```js
function msCountVisible() {
  return [...document.body.querySelectorAll('*')].filter((el) => {
    if (el.closest('#ms-container, #ms-simples-chrome, #ms-session-bar')) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0;
  }).length;
}

const before = msCountVisible();
window.ModoSimples.enable();
setTimeout(() => {
  const after = msCountVisible();
  console.table({
    before,
    after,
    reducaoPct: (((before - after) / before) * 100).toFixed(1) + '%',
    principal: document.querySelector('[data-ms-principal]')?.tagName,
  });
}, 100);
```

---

## 2. Resultados no protótipo (medição estrutural)

Base: HTML de `sobrenos.html` + comportamento do mutator (oculta `header`, `footer`, `nav`, `iframe` fora do main, etc.).

| Métrica | Sem Modo Simples | Com Modo Simples | Variação |
| --- | --- | --- | --- |
| Landmarks de ruído típicos visíveis | header + nav + footer + áreas laterais | ocultos via `data-ms-hidden` | Ruído de chrome **removido** |
| Conteúdo principal | `<main>` no fluxo da página | `[data-ms-principal]` centralizado | Foco no texto |
| Largura de coluna do principal | layout fluido (~página inteira) | `max-width: 75ch` | Leitura mais estreita |
| Line-height do principal | padrão do CSS da página | ~1.8 | ↑ legibilidade |
| Contraste (temas) | Cores Senac | Temas Amarelo/Preto, Escuro Alto, Suave | Opção do usuário |
| Meta ≥ 40% menos ruído visual | — | Chrome (header/nav/footer) some | **Meta atingível** no protótipo semântico |

### Contagem orientativa em `sobrenos.html`

| Região | Sem MS | Com MS |
| --- | --- | --- |
| Header + nav + CTA | Visível | Oculto |
| Hero / breadcrumbs | Visível | Oculto (fora do main) |
| Main (texto + vídeo) | Visível | Visível (principal) |
| Footer | Visível | Oculto |
| Widget Modo Simples (FAB/barra) | — | Visível (controle, não “ruído do site”) |

**Estimativa de redução de blocos de chrome:** de 4 regiões de ruído (header, hero, footer, + nav) para 0 no fluxo de leitura → redução **> 40%** das regiões distrativas tipificadas.

Repetir o script da seção 1 na máquina de apresentação e colar os números reais abaixo:

| Página | `before` | `after` | Redução % | Data |
| --- | --- | --- | --- | --- |
| sobrenos.html | | | | |
| index.html | | | | |
| contato.html | | | | |

---

## 3. Métricas de tempo (ligadas ao estudo de caso)

Preencher com a média da [ficha de usuários](./estudo-caso-roteiro.md):

| Indicador | Valor |
| --- | --- |
| Tempo médio **sem** MS (s) | _após piloto_ |
| Tempo médio **com** MS (s) | _após piloto_ |
| Variação % | _após piloto_ |
| Meta qualitativa | Percepção “mais fácil” em ≥ 2 de 3 participantes |

---

## 4. Uso em slides

1. Print **antes** (página cheia) vs **depois** (Modo Simples).
2. Uma linha: “Redução de regiões distrativas no protótipo Senac > 40% (chrome oculto).”
3. Citação de participante do piloto (ficha §6).
