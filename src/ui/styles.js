/**
 * CSS factory functions for Modo Simples.
 *
 * Two separate style sets:
 *  1. getUIStyles(position)  → injected inside Shadow DOM (panel + FAB)
 *  2. getPageStyles()        → injected into host page <head>
 *
 * The CSS lives in src/ui/css/{ui,page}/*.css and is bundled into
 * styles.generated.js by scripts/gen-styles.cjs (do not edit that file by hand).
 * Only the position-dependent corners are interpolated here.
 */

import { UI_CSS, PAGE_CSS } from './styles.generated.js';

/**
 * CSS for the accessibility panel + FAB inside Shadow DOM.
 *
 * @param {'bottom-right'|'bottom-left'|'top-right'|'top-left'} position
 * @returns {string}
 */
export function getUIStyles(position = 'bottom-right') {
  const isBottom = position.startsWith('bottom');
  const isRight = position.endsWith('right');

  const fabCorner = [
    isBottom
      ? 'bottom: calc(1.5 * var(--ms-u));'
      : 'top: calc(1.5 * var(--ms-u));',
    isRight
      ? 'right: calc(1.5 * var(--ms-u));'
      : 'left: calc(1.5 * var(--ms-u));',
  ].join('');

  const panelCorner = [
    isBottom
      ? 'bottom: calc(calc(1.5 * var(--ms-u)) + 100px);'
      : 'top: calc(calc(1.5 * var(--ms-u)) + 100px);',
    isRight
      ? 'right: calc(1.5 * var(--ms-u));'
      : 'left: calc(1.5 * var(--ms-u));',
  ].join('');

  const panelOrigin = `${isBottom ? 'bottom' : 'top'} ${isRight ? 'right' : 'left'}`;

  // replacer em função: o valor entra literal (sem padrões especiais de `$`)
  return UI_CSS.replace('{{fabCorner}}', () => fabCorner)
    .replace('{{panelCorner}}', () => panelCorner)
    .replace('{{panelOrigin}}', () => panelOrigin);
}

/**
 * CSS injected into the host page <head>.
 * Text scale / themes / cognitive aids apply whenever their classes are set.
 * Distraction hiding and principal-content layout require html.ms-ativo.
 *
 * @returns {string}
 */
export function getPageStyles() {
  return PAGE_CSS;
}
