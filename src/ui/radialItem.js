/**
 * ui/radialItem.js
 *
 * Um item individual do menu radial.
 *
 * Cada item é um <button> com:
 *   - SVG icon (aria-hidden)
 *   - Label de texto visível (class ms-item-label)
 *   - aria-pressed para itens toggle
 *   - Tooltip nativo via title (opcional)
 *
 * Posicionamento: tratado inteiramente pelo CSS (variáveis CSS --ms-angle e
 * --ms-radius em cada elemento). O radialMenu.js define essas variáveis.
 *
 * Acessibilidade:
 *   ✓ <button> nativo
 *   ✓ aria-pressed (para toggles)
 *   ✓ aria-label com texto completo
 *   ✓ Ícone SVG decorativo (aria-hidden)
 *   ✓ Label visível curta (não escondida — lida por leitores de tela E visível)
 *   ✓ :focus-visible via CSS
 *
 * @param {{
 *   id:      string,
 *   label:   string,
 *   icon:    string,      SVG inner HTML
 *   checked: boolean,
 *   angle:   number,      graus, onde 0 = direita, sentido horário
 *   onChange: (checked: boolean) => void
 * }} opts
 * @returns {{ element: HTMLButtonElement, setChecked: (v: boolean) => void }}
 */
export function createRadialItem({
  id,
  label,
  icon,
  checked = false,
  angle,
  onChange,
}) {
  const btn = document.createElement('button');
  btn.id = id;
  btn.type = 'button';
  btn.className = 'ms-radial-item';
  btn.setAttribute('aria-pressed', String(checked));
  btn.setAttribute('aria-label', label);
  btn.style.setProperty('--ms-angle', `${angle}deg`);

  btn.innerHTML = `
    <span class="ms-item-icon" aria-hidden="true">${icon}</span>
    <span class="ms-item-label">${label}</span>
  `;

  if (checked) btn.classList.add('ms-item--on');

  btn.addEventListener('click', () => {
    const next = btn.getAttribute('aria-pressed') !== 'true';
    setChecked(next);
    onChange(next);
  });

  function setChecked(value) {
    btn.setAttribute('aria-pressed', String(value));
    btn.classList.toggle('ms-item--on', value);
  }

  return { element: btn, setChecked };
}
