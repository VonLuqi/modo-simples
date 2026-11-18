/**
 * features/voice.js
 *
 * F10 — preferências de voz da leitura em voz alta. Só APIs do navegador (speechSynthesis).
 * O idioma continua fixo em pt-BR (IMP-27): a pessoa escolhe a voz, não o idioma.
 */

export const VOICE_LIMITS = {
  rate: { min: 0.5, max: 2, step: 0.1 },
  pitch: { min: 0, max: 2, step: 0.1 },
  volume: { min: 0.1, max: 1, step: 0.1 }, // 0 = leitura muda: não oferecer
};

const LANG = 'pt-BR';
const SAMPLE = 'Esta é a voz que vai ler para você.';

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

const isPt = (v) => /^pt([-_]|$)/i.test(v.lang || '');
const isPtBR = (v) => /^pt[-_]br$/i.test(v.lang || '');

/** Vozes instaladas: pt-BR, depois pt, depois o resto — cada grupo por nome. */
export function listVoices() {
  if (!isVoiceSupported()) return [];
  const rank = (v) => (isPtBR(v) ? 0 : isPt(v) ? 1 : 2);
  return [...(speechSynthesis.getVoices?.() || [])].sort(
    (a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name),
  );
}

/** O navegador carrega as vozes depois; avisa quando mudarem. Retorna o cancelamento. */
export function onVoicesChanged(cb) {
  if (!isVoiceSupported() || !speechSynthesis.addEventListener) {
    return () => {};
  }
  speechSynthesis.addEventListener('voiceschanged', cb);
  return () => speechSynthesis.removeEventListener('voiceschanged', cb);
}

/** Aplica voz, velocidade, tom e volume a uma fala; o idioma segue pt-BR. */
export function applyVoice(utt, prefs = {}) {
  utt.lang = LANG;
  const voices = listVoices();
  const chosen =
    (prefs.voiceName && voices.find((v) => v.name === prefs.voiceName)) ||
    voices.find(isPtBR) ||
    voices.find(isPt);
  if (chosen) utt.voice = chosen;
  utt.rate = clampVoice('rate', prefs.voiceRate);
  utt.pitch = clampVoice('pitch', prefs.voicePitch);
  utt.volume = clampVoice('volume', prefs.voiceVolume);
}

/** "Testar voz": interrompe a fala atual e fala uma frase de exemplo. */
export function previewVoice(prefs, text = SAMPLE) {
  if (!isVoiceSupported()) return;
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  applyVoice(utt, prefs);
  speechSynthesis.speak(utt);
}
