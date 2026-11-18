/**
 * features/voiceCommands.js
 *
 * F10d — comandos de voz ("Local, senão avisa"). Desligado por padrão.
 * - 'local':    reconhecimento no aparelho (a voz não sai dele);
 * - 'download': dá para usar no aparelho, mas falta baixar o modelo (installLocalModel);
 * - 'cloud':    o navegador manda a voz a um servidor (ex.: Google). Regra dura: só inicia
 *               com `voiceCloudConsent === true` no estado — sem isso, start devolve false;
 * - 'none':     sem SpeechRecognition ou página sem HTTPS.
 */

import state from '../core/state.js';

const LANG = 'pt-BR';
const MAX_WORDS = 5; // fala longa é conversa, não comando
// reinício automático: mais de 5 fins em 10 s = laço (ex.: sem microfone); para e avisa
const MAX_RESTARTS = 5;
const RESTART_WINDOW_MS = 10000;

function getCtor() {
  const g = globalThis;
  return g.SpeechRecognition || g.webkitSpeechRecognition || null;
}

const secure = () => globalThis.isSecureContext !== false;

/** @returns {Promise<'local'|'download'|'cloud'|'none'>} */
export async function getRecognitionMode() {
  const Ctor = getCtor();
  if (!Ctor || !secure()) return 'none';
  if (typeof Ctor.available === 'function') {
    try {
      const r = await Ctor.available({ langs: [LANG], processLocally: true });
      if (r === 'available') return 'local';
      if (r === 'downloadable' || r === 'downloading') return 'download';
    } catch (_) {
      // sem resposta do navegador: cai no reconhecimento em nuvem (exige consentimento)
    }
  }
  return 'cloud';
}

/** Baixa o modelo local pt-BR. Precisa de gesto do usuário (clique). */
export async function installLocalModel() {
  const Ctor = getCtor();
  if (!Ctor || typeof Ctor.install !== 'function') return false;
  try {
    return Boolean(await Ctor.install({ langs: [LANG], processLocally: true }));
  } catch (_) {
    return false;
  }
}

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// ordem importa: "desligar modo simples" antes de "ligar modo simples"
const TABLE = [
  ['msOff', /\bdesligar\b.*\bmodo simples\b/],
  ['msOn', /\bligar\b.*\bmodo simples\b/],
  ['panelOpen', /\babrir\b.*\bpainel\b/],
  ['panelClose', /\bfechar\b.*\bpainel\b/],
  ['faster', /\bmais rapido\b/],
  ['slower', /\bmais devagar\b/],
  ['scrollDown', /\bdescer\b/],
  ['scrollUp', /\bsubir\b/],
  ['pause', /\bpausar\b|\bpausa\b/],
  ['resume', /\bcontinuar\b|\bcontinue\b/],
  ['stop', /^(parar|pare|para)$/],
  ['help', /\bajuda\b|\bcomandos\b/],
  ['read', /\bler\b|\bleia\b/],
];

/** @returns {{action: string, arg?: *}|null} */
export function parseCommand(text) {
  const t = norm(text);
  if (!t || t.split(' ').length > MAX_WORDS) return null;
  for (const [action, re] of TABLE) if (re.test(t)) return { action };
  return null;
}

let _rec = null;
let _enabled = false;
let _onStatus = () => {};
let _restarts = [];

const status = (s) => {
  try {
    _onStatus(s);
  } catch (_) {
    // ouvinte com erro não derruba o reconhecimento
  }
};

function teardown() {
  _enabled = false;
  const r = _rec;
  _rec = null;
  if (!r) return;
  r.onresult = r.onerror = r.onend = null;
  try {
    r.abort ? r.abort() : r.stop();
  } catch (_) {
    // já parado
  }
}

/**
 * @param {{mode: 'local'|'cloud'|'download'|'none', onCommand?: Function, onStatus?: Function}} opts
 * @returns {boolean} true se começou a escutar
 */
export function startVoiceCommands({ mode, onCommand, onStatus } = {}) {
  _onStatus = onStatus || (() => {});
  if (mode === 'cloud' && state.get().options.voiceCloudConsent !== true) {
    status('needs-consent');
    return false;
  }
  if (mode === 'download') {
    status('needs-model');
    return false;
  }
  const Ctor = getCtor();
  if ((mode !== 'local' && mode !== 'cloud') || !Ctor || !secure()) {
    status('unsupported');
    return false;
  }
  teardown();
  _restarts = [];

  const rec = new Ctor();
  rec.lang = LANG;
  rec.continuous = true;
  rec.interimResults = false;
  if (mode === 'local') rec.processLocally = true;

  rec.onresult = (e) => {
    for (let i = e.resultIndex || 0; i < e.results.length; i++) {
      const res = e.results[i];
      if (!res.isFinal) continue;
      const cmd = parseCommand(res[0] && res[0].transcript);
      if (cmd && onCommand) onCommand(cmd);
    }
  };
  rec.onerror = (e) => {
    const err = e && e.error;
    if (err === 'not-allowed' || err === 'service-not-allowed') {
      teardown();
      status('blocked');
    } else if (err === 'language-not-supported') {
      teardown();
      status('unsupported');
    } else if (err === 'audio-capture') {
      teardown();
      status('no-mic');
    } else if (err && err !== 'no-speech' && err !== 'aborted') {
      teardown(); // erro desconhecido (network, bad-grammar...): nunca reiniciar às cegas
      status('error');
    } // no-speech / aborted: o onend reinicia
  };
  rec.onend = () => {
    if (!_enabled || _rec !== rec) return;
    const now = Date.now();
    _restarts = _restarts.filter((t) => now - t < RESTART_WINDOW_MS);
    _restarts.push(now);
    if (_restarts.length > MAX_RESTARTS) {
      teardown();
      status('error');
      return;
    }
    try {
      rec.start(); // o navegador encerra sozinho após silêncio
    } catch (_) {
      teardown();
      status('error');
    }
  };

  _rec = rec;
  _enabled = true;
  try {
    rec.start();
  } catch (_) {
    teardown();
    status('error');
    return false;
  }
  status('listening');
  return true;
}

export function stopVoiceCommands() {
  const was = _enabled;
  teardown();
  if (was) status('stopped');
}

export function isListening() {
  return _enabled && !!_rec;
}
