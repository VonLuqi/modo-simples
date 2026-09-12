# Status de implementação

Última atualização: **2026-09-11** — **Release v1.1.0** (beta de testes encerrada).  
Fases 0–7 ✅ · chrome UX · persistência de preferências entre páginas.

## Visão geral

| Frente | Situação |
| --- | --- |
| Fase 0 — Escopo | ✅ |
| Fase 1 — Protótipo | ✅ |
| Fase 2 — Lib + UI | ✅ |
| Fase 3 — A11y + guia | ✅ |
| Fase 4 — Estudo / entrega | ✅ |
| Fase 5 — UX / páginas / MS | ✅ [12-plano-melhorias-ux.md](./12-plano-melhorias-ux.md) |
| Fase 6 — Polish UX (barra, páginas, TTS) | ✅ dual markup · TTS highlight · barra `[hidden]` |
| Fase 7 — Polimento examples + lib + dist | ✅ layouts · imagens · modularidade · browsers · MIT 1.1.0 |
| Release v1.1.0 | ✅ beta fechada · `dist/` · tag prevista no GitHub |

## Demo

```bash
npm install && npm run preview
# http://127.0.0.1:8765/  →  /examples/index.html
# http://127.0.0.1:8765/examples  (rewrite para a home)
```

## Fase 7 + polish — checklist

| Item | Status |
| --- | --- |
| Reset `simpleLanguage` / imagens ao desligar MS | ✅ |
| Preferências do painel (tema, escala, etc.) persistem entre páginas | ✅ |
| Contraste `.page-hero` sob temas + overlay home | ✅ |
| Nav desktop wrap; contato centralizado; aria-current forte | ✅ |
| `hideImages` amplo + toggle barra/painel | ✅ |
| Switch SIMPLES no nav (também com MS on nas pills) | ✅ |
| Chrome MS excluído do mutator | ✅ |
| Doc browsers + contrato host | ✅ [13](./13-compatibilidade-browsers.md) · [09](./09-guia-integracao.md) |
| Build esbuild ES2018 · LICENSE MIT · package `files`/`exports` v1.1.0 | ✅ |
| Testes (`npm test`) | ✅ |

## Pendência da equipe (antes da banca)

1. Preencher tempos reais de ≥ 3 participantes no roteiro.
2. Colar contagens `before`/`after` do script de métricas.
3. Ensaiar a demo ao vivo (5 passos do pacote de entrega).
