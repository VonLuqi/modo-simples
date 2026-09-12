# Compatibilidade de navegadores — Modo Simples (F7)

Build: IIFE via **esbuild**, target **ES2018** (`npm run build` → `dist/modo-simples.min.js`).

## Matriz mínima

| Browser | Status esperado | Notas |
| --- | --- | --- |
| Chrome / Edge (últimos 2 anos) | OK | Shadow DOM, TTS, Lexend, barra/FAB |
| Firefox (últimos 2 anos) | OK | Idem |
| Safari 14+ | OK com ressalvas | TTS depende das vozes do SO; `scrollIntoView({ behavior })` tem fallback |
| Sem `speechSynthesis` | Degradado | Botão Ouvir não fala; UI permanece |

## APIs usadas (com fallback)

| API | Fallback |
| --- | --- |
| `Shadow DOM` (`attachShadow`) | Necessário — browsers sem Shadow DOM não são alvo |
| `speechSynthesis` | TTS no-op se ausente |
| `matchMedia('(prefers-reduced-motion)')` | Assumir motion normal |
| `scrollIntoView(options)` | Fallback `scrollIntoView(true)` no TTS |
| `localStorage` | Preferências não persistem (fail silencioso) |

## O que testar manualmente

1. `npm run build && npm run preview`
2. Abrir `examples/hello-modo-simples.html` e o protótipo Senac
3. Ativar MS → pills / dual markup / imagens ocultas → “Imagens: VISÍVEIS”
4. Ouvir Página → highlight âmbar no bloco atual
5. Trocar tema Escuro Alto → hero não fica texto branco em fundo claro
6. Recarregar: preferências por hostname persistem

## Fora do escopo

- IE11
- Navegadores sem ES2018 / Shadow DOM
- TTS word-level `onboundary` cross-browser
