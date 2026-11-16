/**
 * Accessible toggle (switch) component.
 *
 * Uses a native <input type="checkbox"> for full AT support. The checkbox is
 * visually hidden but remains in the tab order and is operable by keyboard.
 * A sibling <span> acts as the visual track/thumb, styled via CSS in styles.js.
 *
 * Accessibility checklist:
 *   ✓ <label htmlFor> — associates label text with the input
 *   ✓ Native checkbox — operable with Space key without extra JS
 *   ✓ :focus-visible ring on the hidden checkbox transfers to the visual track
 *   ✓ No ARIA switch role needed — <input type="checkbox"> is sufficient and
 *     better-supported across VoiceOver/NVDA than role="switch"
 *   ✓ Description text rendered as a <span> inside the label (not title/tooltip)
 *
 * @param {Object} options
 * @param {string}   options.id           Unique id for input/label pair
 * @param {string}   options.label        Primary label text
 * @param {string}  [options.description] Secondary description (smaller text)
 * @param {boolean} [options.checked]     Initial checked state
 * @param {(value: boolean) => void} options.onChange  Called when toggle changes
 *
 * @returns {{ element: HTMLDivElement, setChecked: (value: boolean) => void }}
 */
export function createToggle({
  id,
  label,
  description = '',
  checked = false,
  onChange,
}) {
  const row = document.createElement('div');
  row.className = 'ms-toggle-row';

  // Label — clicking this also toggles the input via htmlFor
  const labelEl = document.createElement('label');
  labelEl.className = 'ms-toggle-label';
  labelEl.htmlFor = id;

  const strong = document.createElement('strong');
  strong.textContent = label;
  labelEl.appendChild(strong);

  if (description) {
    const desc = document.createElement('span');
    desc.textContent = description;
    labelEl.appendChild(desc);
  }

  // Switch wrapper: hidden checkbox + visible track
  const switchWrapper = document.createElement('div');
  switchWrapper.className = 'ms-switch';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));

  // Visual track — decorative, hidden from AT (label provides the name)
  const track = document.createElement('span');
  track.className = 'ms-switch-track';
  track.setAttribute('aria-hidden', 'true');

  switchWrapper.appendChild(input);
  switchWrapper.appendChild(track);

  row.appendChild(labelEl);
  row.appendChild(switchWrapper);

  return {
    element: row,

    /**
     * Programmatically update the toggle state without firing onChange.
     * Used by panel.updateToggles() to sync UI when state changes externally.
     * @param {boolean} value
     */
    setChecked(value) {
      input.checked = value;
    },
  };
}
