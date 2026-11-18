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
import { BCP47, getLocale } from '../i18n/index.js';

/** Idioma de reconhecimento: segue o idioma da UI. */
const lang = () => BCP47[getLocale()];
const MAX_WORDS = 5; // fala longa é conversa, não comando
// reinício automático: mais de 5 fins em 10 s = laço (ex.: sem microfone); para e avisa
const MAX_RESTARTS = 5;
const RESTART_WINDOW_MS = 10000;

function getCtor() {
  const g = globalThis;
  return g.SpeechRecognition || g.webkitSpeechRecognition || null;
}

const secure = () => globalThis.isSecureContext !== false;

/**
 * Por que este navegador não faz comandos de voz (null = pode tentar).
 * 'brave': tem o construtor mas sem serviço de voz (erro 'network');
 * 'no-api': sem SpeechRecognition; 'insecure': página sem HTTPS.
 * @returns {'brave'|'no-api'|'insecure'|null}
 */
export function getUnsupportedReason() {
  if (globalThis.navigator?.brave) return 'brave';
  if (!getCtor()) return 'no-api';
  if (!secure()) return 'insecure';
  return null;
}

/** @returns {Promise<'local'|'download'|'cloud'|'none'>} */
export async function getRecognitionMode() {
  const Ctor = getCtor();
  if (getUnsupportedReason()) return 'none';
  // headless-shell (UA HeadlessChrome) derruba o renderizador em available() com processLocally
  // (QA T202): nesses UAs nem pergunta; Chrome, Brave e Edge de verdade não usam esse UA
  const headless = /HeadlessChrome/.test(globalThis.navigator?.userAgent || '');
  if (!headless && typeof Ctor.available === 'function') {
    try {
      const r = await Ctor.available({ langs: [lang()], processLocally: true });
      if (r === 'available') return 'local';
      if (r === 'downloadable' || r === 'downloading') return 'download';
    } catch (_) {
      // sem resposta do navegador: cai no reconhecimento em nuvem (exige consentimento)
    }
  }
  return 'cloud';
}

/** Baixa o modelo local do idioma atual. Precisa de gesto do usuário (clique). */
export async function installLocalModel() {
  const Ctor = getCtor();
  if (!Ctor || typeof Ctor.install !== 'function') return false;
  try {
    return Boolean(
      await Ctor.install({ langs: [lang()], processLocally: true }),
    );
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

// Gramática por idioma (texto já normalizado: minúsculo, sem acento).
// Ordem importa: "desligar modo simples" antes de "ligar modo simples".
const TABLES = {
  pt: [
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
  ],
  en: [
    ['msOff', /\b(turn|switch) off\b.*\bsimple mode\b/],
    ['msOn', /\b(turn|switch) on\b.*\bsimple mode\b/],
    ['panelOpen', /\bopen\b.*\bpanel\b/],
    ['panelClose', /\bclose\b.*\bpanel\b/],
    ['faster', /\bfaster\b|\bspeed up\b/],
    ['slower', /\bslower\b|\bslow down\b/],
    ['scrollDown', /\bscroll down\b|^down$/],
    ['scrollUp', /\bscroll up\b|^up$/],
    ['pause', /\bpause\b/],
    ['resume', /\bresume\b|\bcontinue\b/],
    ['stop', /^(stop)$/],
    ['help', /\bhelp\b|\bcommands\b/],
    ['read', /\bread\b/],
  ],
  es: [
    ['msOff', /\b(desactivar|apagar)\b.*\bmodo simple\b/],
    ['msOn', /\b(activar|encender)\b.*\bmodo simple\b/],
    ['panelOpen', /\babrir\b.*\bpanel\b/],
    ['panelClose', /\bcerrar\b.*\bpanel\b/],
    ['faster', /\bmas rapido\b/],
    ['slower', /\bmas lento\b|\bmas despacio\b/],
    ['scrollDown', /\bbajar\b/],
    ['scrollUp', /\bsubir\b/],
    ['pause', /\bpausar\b|\bpausa\b/],
    ['resume', /\bcontinuar\b|\bcontinua\b/],
    ['stop', /^(parar|para|detener)$/],
    ['help', /\bayuda\b|\bcomandos\b/],
    ['read', /\bleer\b|\blee\b/],
  ],
};

/** @returns {{action: string, arg?: *}|null} */
export function parseCommand(text) {
  const t = norm(text);
  if (!t || t.split(' ').length > MAX_WORDS) return null;
  for (const [action, re] of TABLES[getLocale()]) {
    if (re.test(t)) return { action };
  }
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
  rec.lang = lang();
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
    } else if (err === 'language-not-supported' || err === 'network') {
      teardown(); // 'network': o navegador não tem serviço de voz (Brave) ou está sem internet
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
