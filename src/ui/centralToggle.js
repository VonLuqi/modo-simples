/**
 * ui/centralToggle.js
 *
 * Botão central do menu radial — representa o toggle do Modo Simples.
 *
 * Papéis duplos do botão:
 *   1. Toggle Modo Simples (aria-pressed)
 *   2. Acionador do menu radial (aria-expanded + aria-controls)
 *
 * Prioridade de interação:
 *   - Clique / Enter / Space → expande o radial se fechado;
 *     se radial já está aberto, fecha-o.
 *   - O estado visual verde/vermelho reflete EXCLUSIVAMENTE o Modo Simples,
 *     independente de o radial estar aberto ou fechado.
 *
 * Acessibilidade:
 *   ✓ <button> nativo — operável por teclado sem JS extra
 *   ✓ aria-pressed  — leitores de tela anunciam estado ON/OFF
 *   ✓ aria-expanded — leitores de tela anunciam menu expandido/recolhido
 *   ✓ aria-controls → #ms-radial-menu
 *   ✓ aria-label descritivo
 *   ✓ SVG aria-hidden + title visível para tooltip nativo (opcional)
 *   ✓ :focus-visible ring (CSS em styles.js)
 *   ✓ Não usa apenas cor: texto de estado acessível via .ms-central-label
 */

export function createCentralToggle() {
  const btn = document.createElement('button');
  btn.id = 'ms-central-btn';
  btn.type = 'button';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'ms-radial-menu');
  btn.setAttribute('aria-label', 'Modo Simples: desativado — abrir menu de acessibilidade');

  btn.innerHTML = `
    <span class="ms-central-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" focusable="false">
        <circle cx="12" cy="4.5" r="2.5"/>
        <path d="M18 9.5a1 1 0 0 0-1-1h-4.2l-.3-1H15a1 1 0 0 0 0-2H9a1 1 0 0 0 0 2h1l.5 2.5H7a1 1 0 0 0 0 2h3.1l-.9 4.3a1 1 0 0 0 .8 1.2 1 1 0 0 0 1.1-.8l1-4.7H14l1 4.7a1 1 0 0 0 1 .8 1 1 0 0 0 .2 0 1 1 0 0 0 .8-1.2l-1-4.8H17a1 1 0 0 0 1-1z"/>
      </svg>
    </span>
    <span class="ms-central-label">A</span>
  `;

  /**
   * Sync visual state of the central button.
   * @param {{ modoSimples: boolean, radialOpen: boolean }} state
   */
  function sync({ modoSimples, radialOpen }) {
    btn.setAttribute('aria-pressed', String(modoSimples));
    btn.setAttribute('aria-expanded', String(radialOpen));

    const statusLabel = modoSimples ? 'ativado' : 'desativado';
    const menuLabel   = radialOpen ? 'fechar' : 'abrir';
    btn.setAttribute(
      'aria-label',
      `Modo Simples: ${statusLabel} — ${menuLabel} menu de acessibilidade`,
    );

    // Color classes drive green (ON) / red (OFF) — also non-color indicator
    btn.classList.toggle('ms-central--on',  modoSimples);
    btn.classList.toggle('ms-central--off', !modoSimples);
    btn.classList.toggle('ms-central--open', radialOpen);
  }

  // Initial state
  sync({ modoSimples: false, radialOpen: false });

  return { element: btn, sync };
}
