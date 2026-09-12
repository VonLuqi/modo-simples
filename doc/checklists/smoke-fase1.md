# Smoke test — Fase 1 (protótipo)

Data: **2026-09-10** · Task **F1-T06**

Como abrir a demo (ES modules precisam de HTTP):

```bash
# na raiz do repo
npx --yes serve . -l 8765
# abrir http://127.0.0.1:8765/examples/index.html
```

---

## Checagens automatizadas (feitas)

| Item | Resultado |
| --- | --- |
| `index.html` HTTP 200 | OK |
| `sobrenos.html` HTTP 200 | OK |
| `cursos.html` HTTP 200 | OK |
| `contato.html` HTTP 200 | OK |
| `pesquisa.html` HTTP 200 | OK |
| `src/modo-simples.js` HTTP 200 | OK |
| `img/logoSenac.png` HTTP 200 | OK |
| `CSS/paginas-internas.css` HTTP 200 | OK |
| Todas as 5 páginas incluem `../src/modo-simples.js` | OK |
| Todas as 5 páginas têm `<main>` | OK |
| Links MVP (Início / Sobre Nós / Cursos / Contato / Pesquisa) sem 404 | OK |

---

## Checagens manuais no browser (equipe)

Percorrer **cada** página: Início → Sobre Nós → Cursos → Contato → Pesquisa.

| # | Verificação | Início | Sobre | Cursos | Contato | Pesquisa |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Menu radial / botão Modo Simples aparece | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Tab percorre controles do menu | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Enter/Space ativa opções | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | Esc fecha o menu | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | Toggle Modo Simples on/off reversível | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6 | Conteúdo principal permanece legível no Modo Simples | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7 | Reload mantém preferências (`localStorage`) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8 | Console sem erros graves | ☐ | ☐ | ☐ | ☐ | ☐ |

### Observações

_Preencher durante o teste manual:_

-

---

## Critério de aceite F1-T06

- [x] Links/páginas/assets e script verificados via HTTP
- [ ] Tab / Enter / Esc no menu radial — **confirmar no browser** (checklist acima)
- [ ] Toggle Modo Simples on/off — **confirmar no browser**
- [ ] Sem erros graves no console — **confirmar no browser**

A parte estrutural da Fase 1 está pronta; a validação interativa do widget completa o aceite visual/a11y e pode ser feita em minutos no checklist.
