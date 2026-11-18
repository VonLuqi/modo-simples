/**
 * features/voice.js
 *
 * F10 — preferências de voz da leitura em voz alta. Só APIs do navegador (speechSynthesis).
 * O idioma da fala segue o idioma da UI (BCP47[getLocale()]); a pessoa ainda escolhe a voz.
 */

import { BCP47, getLocale, t } from '../i18n/index.js';

export const VOICE_LIMITS = {
  rate: { min: 0.5, max: 2, step: 0.1 },
  pitch: { min: 0, max: 2, step: 0.1 },
  volume: { min: 0.1, max: 1, step: 0.1 }, // 0 = leitura muda: não oferecer
};

/** Número limitado ao intervalo; inválido (storage/painel) → 1. */
export function clampVoice(key, value) {
  const lim = VOICE_LIMITS[key];
  const n = Number(value);
  if (value === '' || value === null || !Number.isFinite(n)) return 1;
  return Math.round(Math.min(lim.max, Math.max(lim.min, n)) * 100) / 100;
}

export function isVoiceSupported() {
  return (
    typeof speechSynthesis !== 'undefined' &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

/** Voz do idioma atual (ex.: 'en-GB' para en) e voz da região exata (ex.: 'en-US'). */
const isLang = (v, loc) =>
  (v.lang || '').toLowerCase().split(/[-_]/)[0] === loc;
const isExact = (v, loc) =>
  (v.lang || '').toLowerCase().replace('_', '-') === BCP47[loc].toLowerCase();

/**
 * Idioma do TEXTO da página: html[lang] se for pt/en/es, senão o idioma da UI.
 * @returns {'pt'|'en'|'es'}
 */
export function pageLocale() {
  const lang =
    typeof document !== 'undefined'
      ? document.documentElement?.getAttribute('lang')
      : null;
  const primary = String(lang || '')
    .toLowerCase()
    .split(/[-_]/)[0];
  return primary in BCP47 ? primary : getLocale();
}

/** Vozes instaladas: região exata (ex.: pt-BR), depois o idioma, depois o resto — por nome. */
export function listVoices(loc = getLocale()) {
  if (!isVoiceSupported()) return [];
  const rank = (v) => (isExact(v, loc) ? 0 : isLang(v, loc) ? 1 : 2);
  return [...(speechSynthesis.getVoices?.() || [])].sort(
    (a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name),
  );
}

/**
 * As vozes chegam depois da página (voiceschanged). Resolve assim que houver vozes, ou ao fim do
 * prazo com a lista que houver (possivelmente vazia: navegador sem voz instalada).
 * @param {number} [timeoutMs]
 * @returns {Promise<SpeechSynthesisVoice[]>}
 */
export function waitForVoices(timeoutMs = 1500) {
  if (!isVoiceSupported()) return Promise.resolve([]);
  const now = listVoices();
  if (now.length || !speechSynthesis.addEventListener)
    return Promise.resolve(now);
  return new Promise((resolve) => {
    let timer;
    const done = () => {
      clearTimeout(timer);
      speechSynthesis.removeEventListener('voiceschanged', onChange);
      resolve(listVoices());
    };
    const onChange = () => {
      if (listVoices().length) done();
    };
    speechSynthesis.addEventListener('voiceschanged', onChange);
    timer = setTimeout(done, timeoutMs);
  });
}

/** true se o navegador sabe falar mas não tem nenhuma voz instalada (Brave/Chromium no Linux). */
export async function hasNoVoices() {
  return isVoiceSupported() && (await waitForVoices()).length === 0;
}

/** O navegador carrega as vozes depois; avisa quando mudarem. Retorna o cancelamento. */
export function onVoicesChanged(cb) {
  if (!isVoiceSupported() || !speechSynthesis.addEventListener) {
    return () => {};
  }
  speechSynthesis.addEventListener('voiceschanged', cb);
  return () => speechSynthesis.removeEventListener('voiceschanged', cb);
}

/**
 * Aplica voz, velocidade, tom e volume a uma fala. `source`: 'ui' (padrão) fala no idioma da UI
 * (avisos, ajuda, amostra); 'page' lê texto da página e usa o html[lang] dela (pageLocale).
 * @param {'ui'|'page'} [source]
 */
export function applyVoice(utt, prefs = {}, source = 'ui') {
  const loc = source === 'page' ? pageLocale() : getLocale();
  utt.lang = BCP47[loc];
  const voices = listVoices(loc);
  const chosen =
    (prefs.voiceName && voices.find((v) => v.name === prefs.voiceName)) ||
    voices.find((v) => isExact(v, loc)) ||
    voices.find((v) => isLang(v, loc));
  if (chosen) utt.voice = chosen;
  utt.rate = clampVoice('rate', prefs.voiceRate);
  utt.pitch = clampVoice('pitch', prefs.voicePitch);
  utt.volume = clampVoice('volume', prefs.voiceVolume);
}

/** "Testar voz": interrompe a fala atual e fala uma frase de exemplo. */
export function previewVoice(prefs, text = t('voiceSample')) {
  if (!isVoiceSupported()) return;
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  applyVoice(utt, prefs);
  speechSynthesis.speak(utt);
}
