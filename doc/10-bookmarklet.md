# Bookmarklet — Modo Simples (F3-T06)

Injeta o Modo Simples em **qualquer página** aberta no navegador (útil para demos e validação externa).

## Opção A — carregar o bundle local (recomendado em aula)

1. Na raiz do projeto:

```bash
npm run build
npm run preview
```

2. Crie um favorito cujo URL seja (uma linha):

```
javascript:(function(){var s=document.createElement('script');s.src='http://127.0.0.1:8765/dist/modo-simples.min.js';s.onload=function(){console.info('Modo Simples carregado');};document.documentElement.appendChild(s);})();
```

3. Abra um site qualquer → clique no favorito → use o FAB / SIMPLES.

> O preview precisa estar rodando. Alguns sites com CSP bloqueiam scripts de `127.0.0.1`.

## Opção B — snippet no console (DevTools)

```js
var s = document.createElement('script');
s.src = 'http://127.0.0.1:8765/dist/modo-simples.min.js';
document.documentElement.appendChild(s);
```

## Teste mínimo (2 sites)

| Site | Como | Esperado |
| --- | --- | --- |
| `examples/hello-modo-simples.html` | Já tem o script | FAB + barra |
| Página MDN / blog público | Bookmarklet com preview ligado | FAB aparece; Modo Simples parcial/OK |

Registrar em [validacao-sites.md](./validacao-sites.md).

## Limitações

- CSP estrita bloqueia a injeção
- HTTPS misto: página HTTPS pode bloquear script HTTP local — use túnel ou hospede o `dist` em HTTPS
- Não funciona em `chrome://` / páginas de extensão
