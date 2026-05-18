# Plano de Implementação — Modo Simples

---

## 1. Visão geral da solução

`modo-simples` é um **script JavaScript injetável** (single-file, sem dependências externas obrigatórias) que pode ser incluído em qualquer página via `<script>` ou bookmarklet. Ele acrescenta à página hospedeira:

1. Um **botão flutuante de acessibilidade** sempre visível.
2. Um **painel de opções** ativado pelo botão.
3. O **Modo Simples** propriamente dito, que reduz ruído visual e cognitivo, exibindo apenas o conteúdo principal.

O script deve ser **não destrutivo**: nunca remove elementos do DOM; apenas aplica/retira classes e atributos CSS/ARIA, podendo ser desativado com um clique.

---

## 2. Objetivos funcionais

| #   | Objetivo                                                 |
| --- | -------------------------------------------------------- |
| F1  | Injetar botão flutuante em qualquer página sem setup     |
| F2  | Abrir painel com as opções de acessibilidade disponíveis |
| F3  | Ativar/desativar Modo Simples via toggle                 |
| F4  | Ocultar elementos identificados como não essenciais      |
| F5  | Reduzir animações e transições                           |
| F6  | Aumentar contraste e espaçamento do conteúdo principal   |
| F7  | Persistir preferências via `localStorage`                |
| F8  | Reagir a mudanças dinâmicas no DOM (SPAs)                |
| F9  | Fornecer modo de configuração manual como fallback       |

---

## 3. Objetivos de acessibilidade

- **WCAG 2.1 AA** como linha de base mínima.
- Botão e painel completamente navegáveis por teclado (`Tab`, `Esc`, `Enter`/`Space`).
- Foco visível em todos os controles interativos (`:focus-visible`).
- Papéis e estados ARIA corretos (`role="dialog"`, `aria-modal`, `aria-pressed`, `aria-label`).
- Respeito a `prefers-reduced-motion`: o próprio script nunca introduz animações quando a mídia-query está ativa.
- Contraste mínimo 4.5:1 nos textos do painel.
- Ícones com texto alternativo ou `aria-label`.
- Compatível com leitores de tela (NVDA, JAWS, VoiceOver).

---

## 4. Arquitetura proposta

```
┌─────────────────────────────────────────────────────┐
│                   modo-simples.js                   │
│                                                     │
│  ┌──────────┐   ┌──────────┐   ┌────────────────┐  │
│  │  Config  │──▶│  State   │──▶│  EventBus      │  │
│  └──────────┘   └──────────┘   └────────────────┘  │
│                                        │            │
│       ┌────────────────────────────────┤            │
│       ▼                                ▼            │
│  ┌──────────┐                  ┌───────────────┐   │
│  │   UI     │                  │  Heuristics   │   │
│  │ (Button, │                  │  Engine       │   │
│  │  Panel)  │                  └───────┬───────┘   │
│  └──────────┘                          │            │
│                                        ▼            │
│                                ┌───────────────┐   │
│                                │  DOM Mutator  │   │
│                                └───────────────┘   │
│                                        │            │
│                                        ▼            │
│                                ┌───────────────┐   │
│                                │  MutationObs  │   │
│                                └───────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Princípios arquiteturais:**

- **Zero dependências externas** no bundle final.
- **Shadow DOM** para isolar o UI do painel da CSS do site hospedeiro.
- **Classe CSS atômica** adicionada ao `<html>` para acionar estilos do Modo Simples (não inline style).
- **Module pattern** (IIFE ou ES Module) para evitar poluição do escopo global.

---

## 5. Estrutura de pastas

```
modo-simples/
├── src/
│   ├── modo-simples.js          ← entry point / orquestrador
│   ├── config/
│   │   └── defaults.js          ← configurações e seletores padrão
│   ├── core/
│   │   ├── state.js             ← gerenciamento de estado (padrão Observer)
│   │   ├── eventBus.js          ← barramento de eventos interno
│   │   └── persistence.js       ← localStorage wrapper
│   ├── heuristics/
│   │   ├── contentDetector.js   ← identifica conteúdo principal
│   │   ├── distractionDetector.js ← identifica elementos distrativos
│   │   └── scoring.js           ← sistema de pontuação de relevância
│   ├── ui/
│   │   ├── button.js            ← botão flutuante
│   │   ├── panel.js             ← painel/modal de opções
│   │   ├── toggle.js            ← componente de toggle acessível
│   │   └── styles.js            ← CSS-in-JS injetado no Shadow DOM
│   ├── mutator/
│   │   ├── domMutator.js        ← aplica/reverte transformações no DOM
│   │   └── domObserver.js       ← MutationObserver para SPAs
│   └── utils/
│       ├── aria.js              ← helpers de ARIA
│       ├── focus.js             ← gerenciamento de foco
│       └── mediaQuery.js        ← wrapper de prefers-reduced-motion etc.
├── examples/
│   ├── sobrenos.html
│   └── sobrenos.css
├── dist/
│   └── modo-simples.min.js      ← bundle gerado pelo build
├── tests/
│   ├── unit/
│   ├── integration/
│   └── a11y/
├── docs/
│   └── implementation_plan.md
├── package.json
└── README.md
```

---

## 6. Componentes e responsabilidades

### 6.1 `modo-simples.js` — Orquestrador

```js
// Pseudocódigo de inicialização
(function (global) {
  const ms = new ModoSimples({
    target: document.body,
    lang: 'pt-BR',
  });
  ms.init();
  global.ModoSimples = ms; // ponto de extensão público
})(window);
```

Responsabilidades: instanciar todos os módulos, chamar `init()`, expor API pública (`enable()`, `disable()`, `toggle()`, `configure()`).

---

### 6.2 `config/defaults.js` — Configuração

Centraliza todos os seletores, flags e limiares. Permite que o integrador sobrescreva sem forkar.

```js
export default {
  // Seletores de conteúdo principal (por prioridade)
  mainSelectors: ['main', '[role="main"]', 'article', '#conteudo', '.content'],
  // Seletores de elementos a ocultar
  distractionSelectors: [
    'header:not([role="banner"] nav)',
    'aside',
    '[role="complementary"]',
    'footer',
    '.ad',
    '.ads',
    '[class*="banner"]',
    '[class*="popup"]',
    '[class*="modal"]:not([aria-modal="true"])',
    '[class*="carousel"]',
    '[class*="slider"]',
    'iframe:not([title*="conteúdo"])',
  ],
  scoring: {
    minTextLength: 200, // chars mínimos para considerar bloco como principal
    headingBonus: 30,
    mainTagBonus: 100,
  },
  persistence: true,
  position: 'bottom-right', // posição do botão flutuante
};
```

**Trade-off:** seletores genéricos funcionam em 80% dos sites, mas podem falhar em SPAs altamente customizadas. O fallback manual (seção 10) resolve o restante.

---

### 6.3 `core/state.js` — Estado

Estado único e imutável (inspirado em Redux lightweight):

```js
const initialState = {
  modoSimples: false,
  panelOpen: false,
  options: {
    reducedMotion: false,
    highContrast: false,
    largerText: false,
  },
};
```

Qualquer mudança é publicada no `eventBus`; os módulos reagem de forma desacoplada.

---

### 6.4 `ui/button.js` — Botão flutuante

- Renderizado dentro do Shadow DOM para isolamento total de CSS.
- `position: fixed`; `z-index: 2147483647` (máximo possível).
- Atributos: `role="button"`, `aria-label="Opções de acessibilidade"`, `aria-expanded` sincronizado com `panelOpen`.
- Tecla `Enter`/`Space` dispara toggle do painel.

---

### 6.5 `ui/panel.js` — Painel de opções

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o título do painel.
- Foco capturado dentro do painel enquanto aberto (focus trap).
- `Esc` fecha o painel e devolve foco ao botão de origem.
- Lista de opções renderizadas pelo `toggle.js`.

---

### 6.6 `heuristics/contentDetector.js` — Detecção de conteúdo principal

Estratégia em cascata (para quando falhar, tenta o próximo):

1. **Semântica HTML5:** `<main>` → `[role="main"]` → `<article>` mais longo.
2. **Densidade de texto:** pontua blocos pelo ratio `texto / área`. Blocos com maior densidade = conteúdo principal.
3. **Posicionamento:** elementos centralizados com maior margem horizontal tendem a ser conteúdo.
4. **Headings:** presença de `<h1>` ou `<h2>` no bloco é bônus de pontuação.
5. **Fallback manual:** se nenhuma heurística superar o limiar de confiança, o usuário pode clicar no elemento desejado.

---

### 6.7 `heuristics/distractionDetector.js` — Detecção de distrações

Pontuação negativa para:

| Sinal                                                                              | Peso  |
| ---------------------------------------------------------------------------------- | ----- |
| Tag `<aside>`, `[role="complementary"]`                                            | alto  |
| `position: fixed/sticky` que não seja o painel do Modo Simples                     | médio |
| `animation`, `transition` > 0.3s                                                   | médio |
| Palavras-chave na classe/id: `ad`, `banner`, `popup`, `promo`, `sidebar`, `cookie` | alto  |
| `<iframe>` sem `title` relevante                                                   | médio |
| Elementos que piscam (via `animation-iteration-count: infinite`)                   | alto  |

---

### 6.8 `mutator/domMutator.js` — Aplicação das transformações

**Regra de ouro: nunca alterar o DOM estruturalmente.** Apenas:

```js
// Ativação
element.setAttribute('data-ms-hidden', 'true');
document.documentElement.classList.add('ms-ativo');

// Reversão
element.removeAttribute('data-ms-hidden');
document.documentElement.classList.remove('ms-ativo');
```

CSS injetado no `<head>` da página hospedeira (apenas o necessário para o Modo Simples):

```css
.ms-ativo [data-ms-hidden='true'] {
  display: none !important;
}
.ms-ativo [data-ms-principal] {
  max-width: 75ch !important;
  margin-inline: auto !important;
  font-size: 1.125rem !important;
  line-height: 1.8 !important;
}
@media (prefers-reduced-motion: reduce) {
  .ms-ativo * {
    animation: none !important;
    transition: none !important;
  }
}
```

**Trade-off do `!important`:** necessário para sobrepor estilos do site hospedeiro com especificidade desconhecida. Risco minimizado porque só é aplicado quando `ms-ativo` está na raiz.

---

### 6.9 `mutator/domObserver.js` — Reatividade a SPAs

```js
const observer = new MutationObserver((mutations) => {
  const hasStructuralChange = mutations.some(
    (m) => m.type === 'childList' && m.addedNodes.length > 0,
  );
  if (hasStructuralChange && state.modoSimples) {
    // debounce de 300ms para não reprocessar a cada micro-mutação
    scheduleReprocess();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
```

---

## 7. Fluxo de funcionamento

```
Página carrega
    │
    ▼
init() instancia módulos
    │
    ▼
heuristics.scan() ─── identifica main e distrações
    │
    ▼
ui.renderButton() ─── botão aparece na página
    │
Usuário clica no botão
    │
    ▼
ui.openPanel() ─── painel abre com focus trap
    │
Usuário ativa "Modo Simples"
    │
    ▼
state.set({ modoSimples: true })
    │
    ▼
domMutator.apply() ─── data-ms-hidden + ms-ativo
    │
    ▼
persistence.save() ─── salva no localStorage
    │
MutationObserver detecta mudança no DOM (SPA navega)
    │
    ▼
scheduleReprocess() ─── re-scan + re-apply (debounced)
```

---

## 8. Estratégia de heurísticas

### Identificação de conteúdo principal

```
pontuação = 0
se elemento é <main> ou [role="main"]      → +100
se contém <h1>                             → +30
se contém <h2>                             → +20
se texto.length > 500 chars               → +40
se ratio texto/área > threshold            → +20
se tem position:static e centralizado     → +10
```

O elemento com maior pontuação é marcado com `data-ms-principal`.

### Identificação de distrações

```
para cada elemento no DOM:
  se seletor de distração                  → -80
  se animation-duration > 0.3s            → -40
  se position: fixed e não é o botão MS   → -30
  se classe/id contém palavras-chave ad   → -60

elementos com pontuação < -30 recebem data-ms-hidden
```

### Fallback manual

Quando `confidence < 0.6`, exibe um overlay clicável: "Clique para indicar o conteúdo principal". O usuário aponta o elemento; esse seletor é salvo no `localStorage` para aquele hostname.

---

## 9. Riscos e mitigação

| Risco                                                                     | Probabilidade | Impacto | Mitigação                                                                                                    |
| ------------------------------------------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| Conflito de CSS com `!important` do site                                  | Alta          | Médio   | Usar Shadow DOM para UI própria; estilos da página usam prefixo `ms-` com alta especificidade                |
| DOM depende de classes geradas dinamicamente (CSS Modules, Tailwind hash) | Alta          | Alto    | Combinar seletores semânticos (roles, tags HTML5) com heurística de densidade de texto                       |
| SPA re-renderiza tudo ao navegar                                          | Alta          | Alto    | MutationObserver + debounce; re-scan preserva configuração manual                                            |
| `<iframe>` de terceiros com conteúdo                                      | Média         | Baixo   | Não entrar em iframes cross-origin (bloqueio de segurança do browser); apenas ocultar iframes não essenciais |
| Conteúdo carregado via async/lazy                                         | Média         | Médio   | MutationObserver já cobre; scan sob demanda via `scheduleReprocess()`                                        |
| Performance em páginas com DOM muito grande                               | Baixa         | Médio   | Limitar scan ao primeiro nível de filhos do body; usar `requestIdleCallback`                                 |
| Sites que detectam e bloqueiam scripts injetados                          | Baixa         | Baixo   | Fora do escopo; documentar limitação                                                                         |
| Painel quebra layout (z-index war)                                        | Média         | Médio   | Shadow DOM + z-index máximo                                                                                  |

---

## 10. Detecção de mudanças e reprocessamento

```js
// Debounce para evitar sobrecarga em SPAs com muitas mutações
let reprocessTimer = null;

function scheduleReprocess() {
  clearTimeout(reprocessTimer);
  reprocessTimer = setTimeout(() => {
    if (state.modoSimples) {
      domMutator.revert(); // remove marcações antigas
      heuristics.scan(); // re-detecta
      domMutator.apply(); // re-aplica
    }
  }, 300);
}
```

**Configuração por hostname:** para domínios conhecidos, o `localStorage` guarda seletores manuais que têm prioridade sobre a heurística automática.

---

## 11. Plano por fases

### MVP (Fase 1) — "Funciona em páginas simples"

**Escopo:** sites com HTML semântico padrão (como `sobrenos.html` do projeto).

| Entregável                                        | Critério de Aceite                        |
| ------------------------------------------------- | ----------------------------------------- |
| Botão flutuante injetável                         | Aparece em qualquer página via `<script>` |
| Painel básico com toggle                          | Abre/fecha com teclado e mouse            |
| Modo Simples: ocultar distrações por seletor fixo | Aside, footer, anúncios, banners somem    |
| Persistência básica                               | Estado salvo no localStorage              |
| CSS isolado                                       | Nenhum estilo vaza para a página          |
| Navegação por teclado completa                    | Tab, Esc, Enter funcionam                 |

---

### Fase 2 — "Funciona na maioria dos sites"

| Entregável                       | Critério de Aceite                                |
| -------------------------------- | ------------------------------------------------- |
| Heurística de densidade de texto | Detecta `<main>` em 70%+ dos sites testados       |
| MutationObserver para SPAs       | Reprocessa após navegação SPA sem perder estado   |
| Fallback de seleção manual       | Usuário consegue indicar conteúdo em 2 cliques    |
| Opções adicionais                | Alto contraste, texto maior, redução de animações |
| Configuração por hostname        | Preferências por site são salvas                  |

---

### Fase 3 — "Robusto e extensível"

| Entregável                          | Critério de Aceite                                |
| ----------------------------------- | ------------------------------------------------- |
| Pontuação sofisticada de relevância | Acurácia > 85% em conjunto de 20 sites variados   |
| API pública de configuração         | Integradores podem injetar seletores customizados |
| Suporte a lazy-loaded content       | Funciona em feeds infinitos e lazy images         |
| Bookmarklet gerado automaticamente  | Um clique para instalar em qualquer browser       |
| Documentação pública                | README completo com exemplos de integração        |

---

## 12. Backlog priorizado

```
PRIORIDADE CRÍTICA (MVP)
  [1] Estrutura de pastas e setup de build (rollup/esbuild)
  [2] Shadow DOM + botão flutuante
  [3] Painel com focus trap e navegação por teclado
  [4] Toggle de Modo Simples com seletores padrão
  [5] Injeção de CSS prefixado na página hospedeira
  [6] Persistência via localStorage
  [7] Exemplo funcional com sobrenos.html

PRIORIDADE ALTA (Fase 2)
  [8]  Heurística de detecção de conteúdo por densidade de texto
  [9]  MutationObserver com debounce
  [10] Fallback de seleção manual
  [11] Opção de alto contraste
  [12] Opção de reduzir animações (com prefers-reduced-motion)

PRIORIDADE MÉDIA (Fase 2-3)
  [13] Opção de texto maior
  [14] Configuração per-hostname no localStorage
  [15] API pública de configuração
  [16] Pontuação avançada de relevância

PRIORIDADE BAIXA (Fase 3)
  [17] Suporte a conteúdo lazy-loaded
  [18] Gerador de bookmarklet
  [19] Documentação pública
```

---

## 13. Critérios de aceite

### MVP

- Script pode ser incluído com uma única tag `<script>` e nenhum CSS externo.
- Botão aparece sem quebrar o layout de nenhuma das páginas de exemplo.
- Painel abre/fecha com `Tab`/`Enter`/`Esc` sem usar mouse.
- `axe-core` ou Lighthouse não reporta regressões de acessibilidade nas páginas de exemplo após inicialização do script.
- Toggle Modo Simples oculta `aside`, `footer` e elementos com classes `ad`/`banner` no `sobrenos.html`.
- Reload da página restaura o estado anterior.

### Fase 2

- Detecção automática funciona corretamente em pelo menos 10 sites públicos com HTML diverso (teste manual documentado).
- Após navegação SPA em um site Next.js ou Vue, o Modo Simples permanece ativo e reaplicado.
- NVDA + Firefox navega todo o painel sem problemas.

### Fase 3

- Acurácia de detecção ≥ 85% no conjunto de testes definido.
- Nenhuma regressão de performance > 50ms de `Time to Interactive` em páginas de teste.

---

## 14. Estratégia de testes

### Testes unitários (`tests/unit/`)

Ferramenta: **Vitest** (zero config, compatível com o ecossistema já presente).

| Módulo                   | O que testar                                                        |
| ------------------------ | ------------------------------------------------------------------- |
| `state.js`               | Transições de estado corretas, imutabilidade                        |
| `persistence.js`         | Salva e recupera corretamente, falha graciosamente sem localStorage |
| `contentDetector.js`     | Pontuação correta dado um DOM simulado (jsdom)                      |
| `distractionDetector.js` | Elementos corretos recebem pontuação negativa                       |
| `domMutator.js`          | Aplica e reverte sem modificar estrutura do DOM                     |

### Testes de integração (`tests/integration/`)

Ferramenta: **Playwright** (headless).

- Carrega `examples/sobrenos.html` e verifica que o botão aparece.
- Ativa Modo Simples via click programático e verifica que `data-ms-hidden` foi aplicado nos elementos certos.
- Recarrega a página e verifica persistência.
- Simula navegação SPA (manipulação de `history.pushState`) e verifica reprocessamento.

### Testes manuais de acessibilidade (`tests/a11y/`)

Checklist documentado:

- [ ] Navegação por teclado (Tab/Shift+Tab percorre todos os controles)
- [ ] VoiceOver (macOS Safari) anuncia estado do painel
- [ ] NVDA (Windows Firefox) anuncia toggle ativado/desativado
- [ ] Zoom a 200% não quebra o botão flutuante
- [ ] `prefers-reduced-motion: reduce` desativa animações do painel

### Testes em sites variados

Matriz de tipos de site para validação manual:

| Tipo                 | Exemplo          |
| -------------------- | ---------------- |
| Blog simples         | Medium, Substack |
| Portal de notícias   | G1, UOL          |
| Documentação técnica | MDN, dev.to      |
| SPA (React/Vue)      | GitHub, Notion   |
| E-commerce           | Shopee, Amazon   |
| Site governamental   | gov.br           |

---

## 15. Métricas de eficácia

| Métrica                                 | Como medir                                | Meta                   |
| --------------------------------------- | ----------------------------------------- | ---------------------- |
| Redução de elementos visíveis           | `count(visible elements)` antes/depois    | ≥ 40% de redução       |
| Aumento de ratio conteúdo/ruído         | texto útil / área total visível           | ≥ 2×                   |
| Legibilidade                            | tamanho de coluna, line-height, contraste | ≥ 4.5:1, ≤ 75ch, ≥ 1.6 |
| Tempo para localizar conteúdo principal | teste com usuários                        | redução ≥ 30%          |
| Regressão de acessibilidade             | score Lighthouse Accessibility            | 0 regressões           |
| Performance                             | `requestIdleCallback` não bloqueia render | ≤ 16ms por ciclo       |

---

## 16. Próximos passos imediatos

1. **Setup de build:** configurar `esbuild` ou `rollup` no `package.json` para gerar `dist/modo-simples.min.js`.
2. **Implementar a estrutura de pastas** acima em `src/`.
3. **Começar pelo Shadow DOM + botão flutuante** (item [2] do backlog) — é o que dará feedback visual imediato.
4. **Implementar o painel com focus trap** antes de qualquer heurística, para validar a acessibilidade base.
5. **Usar `sobrenos.html` como primeira página de teste** — ela já tem `<header>`, `<nav>`, `<main>`, `<footer>`, que é um excelente campo de prova.
