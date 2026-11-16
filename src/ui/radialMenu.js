/**
 * ui/radialMenu.js
 *
 * Container do menu radial acessível.
 *
 * Estrutura no Shadow DOM:
 *   <div id="ms-radial-root">          — âncora de posicionamento
 *     <div id="ms-radial-menu"         — lista de itens (role=menu)
 *          role="menu"
 *          aria-label="Opções de acessibilidade"
 *          hidden>
 *       <button class="ms-radial-item" …> × N itens
 *     </div>
 *     <button id="ms-central-btn" …/>  — inserido pelo orchestrator
 *   </div>
 *
 * Keyboard:
 *   Esc         → fecha (tratado no orchestrator)
 *   Tab / S-Tab → cicla focusable inside (focus trap ativado enquanto aberto)
 *   Arrow keys  → mover entre itens radiais (implementado aqui)
 *
 * Acessibilidade:
 *   ✓ role="menu" + role="menuitem" (para itens de ação)
 *     OU role="group" + aria-pressed (para toggles persistentes)
 *     → Escolha: usamos role="group" com aria-label porque toggles com memória
 *       não são "menu items" semânticos — eles se comportam como controles.
 *   ✓ aria-label no container
 *   ✓ [hidden] para ocultar do AT quando fechado
 *   ✓ Focus trap enquanto aberto
 *   ✓ Arrow keys para navegar entre itens
 *
 * @param {{ items: Array<{ id, label, icon, checked, angle, onChange }>, state: Object }} opts
 * @returns {{ element: HTMLDivElement, open, close, updateItems, getItemControls }}
 */

import { createRadialItem } from './radialItem.js';
import { trapFocus, getFocusable } from '../utils/focus.js';

/**
 * Definição dos itens radiais.
 * angle: graus, 0 = topo, sentido horário.
 * Espaçamos 8 itens em 180° (semicírculo superior) com offset centrado.
 */
const ITEM_COUNT = 8;

/**
 * Retorna start e span do arco de acordo com o canto onde o menu está.
 * O arco sempre abre para o interior da tela.
 *
 * Convenção de ângulo: 0° = topo, sentido horário.
 *   bottom-right → abre ↖  (180° a 270°)
 *   bottom-left  → abre ↗  (270° a 360°)
 *   top-right    → abre ↙  ( 90° a 180°)
 *   top-left     → abre ↘  (  0° a  90°)
 */
function arcForPosition(position) {
  switch (position) {
    case 'bottom-left':
      return { start: 270, span: 90 };
    case 'top-right':
      return { start: 90, span: 90 };
    case 'top-left':
      return { start: 0, span: 90 };
    case 'bottom-right':
    default:
      return { start: 180, span: 90 };
  }
}

/** Retorna o ângulo de cada item no arco para a posição dada. */
function computeAngles(count, position) {
  const { start, span } = arcForPosition(position);
  const step = count > 1 ? span / (count - 1) : 0;
  return Array.from({ length: count }, (_, i) => start + i * step);
}

export const RADIAL_ITEMS_DEF = [
  {
    key: 'highContrast',
    label: 'Alto Contraste',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zm0 2v14a7 7 0 0 1 0-14z"/></svg>`,
  },
  {
    key: 'largerText',
    label: 'Texto Maior',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>`,
  },
  {
    key: 'reducedMotion',
    label: 'Reduzir Movimento',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>`,
  },
  {
    key: 'highlightLinks',
    label: 'Destacar Links',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
  },
  {
    key: 'dyslexiaFont',
    label: 'Fonte Legível',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/></svg>`,
  },
  {
    key: 'textSpacing',
    label: 'Espaçamento',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M9 7v2h6V7l3 3-3 3v-2H9v2l-3-3 3-3zM4 3h16v2H4zm0 16h16v2H4z"/></svg>`,
  },
  {
    key: 'hideImages',
    label: 'Ocultar Imagens',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
  },
  {
    key: 'help',
    label: 'Ajuda',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>`,
  },
];

export function createRadialMenu({
  state,
  onToggle,
  onHelp,
  position = 'bottom-right',
}) {
  const angles = computeAngles(ITEM_COUNT, position);

  // ── Container ───────────────────────────────────────────────
  const root = document.createElement('div');
  root.id = 'ms-radial-root';

  const menu = document.createElement('div');
  menu.id = 'ms-radial-menu';
  menu.setAttribute('role', 'group');
  menu.setAttribute('aria-label', 'Opções de acessibilidade');
  menu.hidden = true;

  root.appendChild(menu);

  // ── Itens radiais ────────────────────────────────────────────
  /** @type {Map<string, ReturnType<typeof createRadialItem>>} */
  const itemControls = new Map();

  RADIAL_ITEMS_DEF.forEach((def, i) => {
    const isHelp = def.key === 'help';
    const checked = isHelp ? false : Boolean(state.options?.[def.key]);

    const item = createRadialItem({
      id: `ms-item-${def.key}`,
      label: def.label,
      icon: def.icon,
      checked,
      angle: angles[i],
      onChange: (value) => {
        if (isHelp) {
          onHelp?.();
        } else {
          onToggle(def.key, value);
        }
      },
    });

    itemControls.set(def.key, item);
    menu.appendChild(item.element);
  });

  // ── Focus trap ──────────────────────────────────────────────
  let removeTrap = null;

  // ── Arrow key navigation ────────────────────────────────────
  menu.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key))
      return;
    e.preventDefault();

    const focusable = getFocusable(menu);
    if (!focusable.length) return;
    const idx = focusable.indexOf(document.activeElement);
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? (idx + 1) % focusable.length
        : (idx - 1 + focusable.length) % focusable.length;
    focusable[next]?.focus();
  });

  return {
    element: root,
    menuElement: menu,

    open() {
      menu.hidden = false;
      // Focus primeiro item após animação de abertura
      requestAnimationFrame(() => {
        const first = getFocusable(menu)[0];
        if (first) first.focus();
        removeTrap = trapFocus(menu);
      });
    },

    close() {
      menu.hidden = true;
      if (removeTrap) {
        removeTrap();
        removeTrap = null;
      }
    },

    /**
     * Sincroniza o estado visual dos itens com o estado da aplicação.
     * @param {Object} options
     */
    updateItems(options) {
      itemControls.forEach((ctrl, key) => {
        if (key === 'help') return;
        ctrl.setChecked(Boolean(options[key]));
      });
    },

    getItemControls() {
      return itemControls;
    },
  };
}
