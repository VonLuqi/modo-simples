/**
 * features/focusReader.js
 *
 * F7b "Leia o foco": com a opção `readFocus` ligada, o elemento que recebe foco (Tab ou clique,
 * na página e no painel da lib) é lido em voz alta: nome acessível + papel em português.
 * Reaproveita o speechSynthesis do tts.js; não interrompe a leitura "Ouvir" do conteúdo principal.
 */

import { isReadingMain, isSpeechFailure, notifySpeechError } from './tts.js';
import state from '../core/state.js';
import { applyVoice } from './voice.js';
import { t as tr } from '../i18n/index.js';

const MAX_TEXT = 200;
const DEBOUNCE_MS = 150;

/** @type {ReturnType<typeof setTimeout>|null} */
let _timer = null;
let _on = false;
let _spoke = false;
/** Shadow root do painel da lib: o focusin de dentro dele não chega ao document. */
let _root = null;

/** @returns {boolean} true se o navegador tem síntese de voz */
export function isFocusReaderSupported() {
  return (
    typeof speechSynthesis !== 'undefined' &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
const cap = (t) => (t.length > MAX_TEXT ? t.slice(0, MAX_TEXT).trim() : t);

/** Nome acessível: aria-labelledby > aria-label > label/alt/title > texto. */
export function accessibleName(el) {
  const ids = el.getAttribute('aria-labelledby');
  if (ids) {
    const root = el.getRootNode?.() || document;
    const text = clean(
      ids
        .split(/\s+/)
        .map((id) => root.getElementById?.(id)?.textContent || '')
        .join(' '),
    );
    if (text) return cap(text);
  }
  const aria = clean(el.getAttribute('aria-label'));
  if (aria) return cap(aria);

  const tag = el.tagName.toLowerCase();
  let label = '';
  if (el.labels && el.labels.length) {
    label = clean(
      Array.from(el.labels)
        .map((l) => l.textContent)
        .join(' '),
    );
  } else if (['input', 'select', 'textarea'].includes(tag)) {
    label = clean(el.closest?.('label')?.textContent);
  }
  if (label) return cap(label);

  const alt = clean(el.getAttribute('alt'));
  if (alt) return cap(alt);
  const title = clean(el.getAttribute('title'));
  if (title) return cap(title);

  const type = (el.getAttribute('type') || '').toLowerCase();
  if (tag === 'input') {
    if (['button', 'submit', 'reset'].includes(type)) {
      return cap(
        clean(el.value) || (type === 'submit' ? tr('focusSubmitName') : ''),
      );
    }
    return cap(clean(el.getAttribute('placeholder')));
  }
  if (['select', 'textarea'].includes(tag)) return '';
  return cap(clean(el.textContent));
}

/** Palavra de papel em PT-BR ('' quando o elemento é só texto, ex. parágrafo). */
export function roleWord(el) {
  const tag = el.tagName.toLowerCase();
  const role = (el.getAttribute('role') || '').toLowerCase();
  const type = (el.getAttribute('type') || '').toLowerCase();
  if (role === 'switch') return tr('roleSwitch');
  if (role === 'checkbox') return tr('roleCheckbox');
  if (role === 'radio') return tr('roleRadio');
  if (role === 'button') return tr('roleButton');
  if (role === 'link') return tr('roleLink');
  if (role === 'heading') return tr('roleHeading');
  if (role === 'textbox' || role === 'searchbox') return tr('roleField');
  if (role === 'combobox' || role === 'listbox') return tr('roleSelect');
  if (tag === 'button') return tr('roleButton');
  if (tag === 'a') return tr('roleLink');
  if (/^h[1-6]$/.test(tag)) return tr('roleHeading');
  if (tag === 'select') return tr('roleSelect');
  if (tag === 'textarea') return tr('roleField');
  if (tag === 'input') {
    if (['button', 'submit', 'reset', 'image'].includes(type))
      return tr('roleButton');
    if (type === 'checkbox') return tr('roleCheckbox');
    if (type === 'radio') return tr('roleRadio');
    return tr('roleField');
  }
  if (el.isContentEditable) return tr('roleField');
  return '';
}

/** Estado de caixas/interruptores ('' se não houver). */
function stateWord(el) {
  const checked = el.getAttribute('aria-checked');
  const isSwitch = (el.getAttribute('role') || '') === 'switch';
  const type = (el.getAttribute('type') || '').toLowerCase();
  const nativo = el.tagName === 'INPUT' && ['checkbox', 'radio'].includes(type);
  if (checked === null && !nativo) return '';
  const on = checked !== null ? checked === 'true' : el.checked;
  if (isSwitch) return on ? tr('focusSwitchOn') : tr('focusSwitchOff');
  return on ? tr('focusChecked') : tr('focusUnchecked');
}

/** Texto a falar para o elemento focado ('' = nada a dizer). */
export function describeFocus(el) {
  if (!el || el.nodeType !== 1) return '';
  const tag = el.tagName.toLowerCase();
  if (tag === 'body' || tag === 'html') return '';
  const role = roleWord(el);
  const name = accessibleName(el);
  const parts = [name, role, role ? stateWord(el) : ''].filter(Boolean);
  return parts.join(', ');
}

function speakNow(target) {
  _timer = null;
  if (!_on || isReadingMain()) return; // não interrompe a leitura do conteúdo principal
  const text = describeFocus(target);
  if (!text) return;
  speechSynthesis.cancel(); // o novo foco cancela a fala anterior
  const utterance = new SpeechSynthesisUtterance(text);
  applyVoice(utterance, state.get().options, 'page');
  _spoke = true;
  utterance.onerror = (e) => {
    if (isSpeechFailure(e)) notifySpeechError();
  };
  speechSynthesis.speak(utterance);
}

function onFocusIn(e) {
  const target = e.composedPath?.()[0] || e.target; // alcança o painel (shadow DOM)
  if (_timer !== null) clearTimeout(_timer);
  _timer = setTimeout(() => speakNow(target), DEBOUNCE_MS);
}

export function startFocusReader() {
  if (_on || !isFocusReaderSupported()) return;
  _on = true;
  document.addEventListener('focusin', onFocusIn, true);
  _root = document.querySelector('#ms-container')?.shadowRoot || null;
  _root?.addEventListener('focusin', onFocusIn, true);
}

export function stopFocusReader() {
  if (!_on) return;
  _on = false;
  document.removeEventListener('focusin', onFocusIn, true);
  _root?.removeEventListener('focusin', onFocusIn, true);
  _root = null;
  if (_timer !== null) clearTimeout(_timer);
  _timer = null;
  if (_spoke && !isReadingMain()) speechSynthesis.cancel();
  _spoke = false;
}
