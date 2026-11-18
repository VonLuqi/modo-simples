/**
 * features/tts.js
 *
 * speechSynthesis helper — reads main / [data-ms-principal] content in pt-BR,
 * block by block, highlighting the current element.
 */

import state from '../core/state.js';
import { applyVoice } from './voice.js';

/** @type {SpeechSynthesisUtterance|null} */
let _utterance = null;
let _speaking = false;
/** @type {Element[]} */
let _blocks = [];
let _blockIndex = 0;
/** @type {Element|null} */
let _activeEl = null;
/**
 * Geração da leitura. speechSynthesis.cancel() dispara onerror do utterance antigo de forma
 * assíncrona; sem este token o handler velho avançava a fila da leitura nova (IMP-13).
 */
let _runId = 0;

/** Quem quer saber quando a leitura começa/termina (a UI não precisa fazer polling). */
const _listeners = new Set();
let _notified = false;
let _notifiedPaused = false;
/** F10c: leitura pausada (cancel + lembrar onde parou; speechSynthesis.pause é instável). */
let _paused = false;
/** Onde retomar: bloco/pedaço atual (ou o texto único do fallback). */
let _resume = null;

/** Ouvintes de falha de fala (tts e leitura do foco): recebem 'speech-failed'. */
const _errListeners = new Set();

/**
 * Falha real de síntese (sem voz instalada, sem permissão, áudio indisponível...). Cancelar ou
 * interromper uma fala (troca de leitura, parar) NÃO é falha.
 * @param {{error?: string}|undefined} e evento onerror do utterance
 */
export function isSpeechFailure(e) {
  return Boolean(
    e && e.error && e.error !== 'interrupted' && e.error !== 'canceled',
  );
}

/** Avisa os ouvintes de onSpeechError. */
export function notifySpeechError() {
  for (const cb of Array.from(_errListeners)) {
    try {
      cb('speech-failed');
    } catch (_) {
      // um ouvinte com erro não pode travar a leitura
    }
  }
}

/**
 * Registra um ouvinte de falha de fala: recebe 'speech-failed' quando o navegador não consegue
 * falar (tts "Ouvir" ou "Ler o que eu seleciono").
 * @param {(reason: 'speech-failed') => void} cb
 * @returns {() => void} cancela o registro
 */
export function onSpeechError(cb) {
  _errListeners.add(cb);
  return () => {
    _errListeners.delete(cb);
  };
}

/** Falha de síntese durante a leitura: para tudo (sem encadear o próximo bloco) e avisa. */
function failSpeech() {
  stopSpeaking('speech-failed');
  notifySpeechError();
}

function notify(reason) {
  if (_speaking === _notified && _paused === _notifiedPaused) return;
  _notified = _speaking;
  _notifiedPaused = _paused;
  for (const cb of Array.from(_listeners)) {
    try {
      cb(_speaking, _paused, reason);
    } catch (_) {
      // um ouvinte com erro não pode travar a leitura
    }
  }
}

/**
 * Registra um ouvinte do estado da leitura: recebe true ao começar e false ao terminar,
 * ser parada ou falhar. O 2º argumento diz se a leitura está pausada (F10c).
 * Se terminou por falha de síntese, o 3º argumento é 'speech-failed'.
 * @param {(speaking: boolean, paused?: boolean, reason?: string) => void} cb
 * @returns {() => void} cancela o registro
 */
export function onSpeakingChange(cb) {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}

const BLOCK_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'p',
  'li',
  'dt',
  'dd',
  'figcaption',
  'blockquote',
];

/**
 * @param {Element} el
 * @param {string} selector
 * @returns {Element|null}
 */
function closestSafe(el, selector) {
  if (!el) return null;
  if (typeof el.closest === 'function') return el.closest(selector);
  // Fallback for mini DOM nos testes
  let node = el;
  while (node) {
    if (node.matches && node.matches(selector)) return node;
    // Simple class / id / tag checks when matches is absent
    const parts = selector.split(',').map((s) => s.trim());
    for (const part of parts) {
      if (part.startsWith('.') && node.classList?.contains(part.slice(1)))
        return node;
      if (part.startsWith('#') && node.id === part.slice(1)) return node;
      if (part.startsWith('[') && part.endsWith(']')) {
        const attr = part.slice(1, -1).split('=')[0];
        if (node.hasAttribute?.(attr)) return node;
      }
      if (
        /^[a-z][a-z0-9]*$/i.test(part) &&
        node.tagName?.toLowerCase() === part.toLowerCase()
      ) {
        return node;
      }
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * @returns {Element|null}
 */
function getRoot() {
  return (
    document.querySelector('[data-ms-principal]') ||
    document.querySelector('main') ||
    document.querySelector('[role="main"]') ||
    document.body
  );
}

/**
 * @param {Element} el
 * @returns {boolean}
 */
function isVisiblyReadable(el) {
  if (
    !el ||
    closestSafe(el, '#ms-container') ||
    closestSafe(el, '#ms-simples-chrome') ||
    closestSafe(el, '#ms-session-bar')
  ) {
    return false;
  }
  if (closestSafe(el, '[data-ms-hidden]')) return false;

  const html = document.documentElement;
  const msOn = html.classList.contains('ms-ativo');
  const simpleLang = html.classList.contains('ms-simple-language');

  if (msOn && closestSafe(el, '.ms-simple-hide')) return false;
  if (!msOn && closestSafe(el, '.ms-simple-only')) return false;

  if (simpleLang && closestSafe(el, '[data-ms-plain]')) return false;
  if (!simpleLang && closestSafe(el, '[data-ms-simple]')) return false;

  // textContent: não força layout (innerText forçava um reflow por bloco e por ancestral).
  // O texto realmente falado continua vindo de innerText, só do bloco em leitura.
  return (el.textContent || '').trim().length > 0;
}

/**
 * Collect readable text blocks from the main content region.
 * @returns {Element[]}
 */
function collectBlocks() {
  const root = getRoot();
  if (!root) return [];

  // Uma consulta só: o resultado vem em ORDEM DE DOCUMENTO. Antes era uma consulta por tag
  // (todos os h1, depois h2, ..., depois p), o que lia títulos primeiro e parágrafos depois (IMP-50)
  const nodes = Array.from(root.querySelectorAll(BLOCK_TAGS.join(',')));

  // Legibilidade calculada uma vez por bloco (antes: de novo para cada ancestral de cada bloco)
  const readable = new Set(nodes.filter(isVisiblyReadable));

  return nodes.filter((el) => {
    if (!readable.has(el)) return false;
    // Skip nested blocks already covered by a parent block (e.g. p inside li)
    let parent = el.parentElement;
    while (parent && parent !== root) {
      if (readable.has(parent)) return false;
      parent = parent.parentElement;
    }
    return true;
  });
}

/** Limite prático de caracteres por utterance (o Chrome corta falas longas). */
const MAX_UTTERANCE = 200;

/**
 * Divide o texto em pedaços de até `max` caracteres, preferindo fronteiras de frase,
 * depois de palavra; uma palavra maior que `max` é fatiada. Sem perder texto.
 * @param {string} text texto já com espaços normalizados
 * @param {number} [max]
 * @returns {string[]}
 */
export function splitForSpeech(text, max = MAX_UTTERANCE) {
  if (text.length <= max) return [text];

  const chunks = [];
  let cur = '';
  const flush = () => {
    const t = cur.trim();
    if (t) chunks.push(t);
    cur = '';
  };

  // frase = até pontuação seguida de espaço/fim ("3.14" não quebra)
  const sentences = text.match(/[\s\S]+?(?:[.!?…]+(?=\s|$)|$)\s*/g) || [text];
  for (const s of sentences) {
    if (s.length > max) {
      flush();
      const words = s.match(/\S+\s*/g) || [s]; // palavras mantendo o espaço final (sem lookbehind: Safari < 16.4)
      for (const w of words) {
        if (w.length > max) {
          flush();
          for (let i = 0; i < w.length; i += max)
            chunks.push(w.slice(i, i + max));
        } else if ((cur + w).trim().length > max) {
          flush();
          cur = w;
        } else {
          cur += w;
        }
      }
      continue;
    }
    if ((cur + s).trim().length > max) {
      flush();
      cur = s;
    } else {
      cur += s;
    }
  }
  flush();
  return chunks;
}

function clearHighlight() {
  document.querySelectorAll('[data-ms-tts-active]').forEach((node) => {
    node.removeAttribute('data-ms-tts-active');
  });
  _activeEl = null;
}

/**
 * @param {Element} el
 */
function highlightAndScroll(el) {
  clearHighlight();
  el.setAttribute('data-ms-tts-active', '');
  _activeEl = el;

  const reduceMotion =
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof el.scrollIntoView === 'function') {
    try {
      el.scrollIntoView({
        block: 'center',
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    } catch (_) {
      el.scrollIntoView(true);
    }
  }
}

/**
 * Speak the next block in the queue.
 */
function speakBlockAt(index, run) {
  if (!_speaking || run !== _runId) return;

  if (index >= _blocks.length) {
    stopSpeaking();
    return;
  }

  const el = _blocks[index];
  _blockIndex = index;
  highlightAndScroll(el);

  const text = (el.innerText || el.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) {
    speakBlockAt(index + 1, run);
    return;
  }

  // Blocos longos viram várias falas curtas (limite prático do Chrome, IMP-38)
  speakChunk(index, splitForSpeech(text), 0, run);
}

function speakChunk(index, chunks, i, run) {
  if (!_speaking || run !== _runId) return;
  _resume = { index, chunks, i };
  const utterance = new SpeechSynthesisUtterance(chunks[i]);
  _utterance = utterance;
  applyVoice(utterance, state.get().options);
  const next = () => {
    if (run !== _runId) return; // evento de uma leitura antiga: ignora (IMP-13)
    _utterance = null;
    if (!_speaking) return;
    if (i + 1 < chunks.length) speakChunk(index, chunks, i + 1, run);
    else speakBlockAt(index + 1, run);
  };
  utterance.onend = next;
  utterance.onerror = (e) => {
    if (run !== _runId) return;
    if (isSpeechFailure(e)) failSpeech();
    else next();
  };
  speechSynthesis.speak(utterance);
}

function speakFallback(text, run) {
  _resume = { text };
  const utterance = new SpeechSynthesisUtterance(text);
  _utterance = utterance;
  applyVoice(utterance, state.get().options);
  const done = () => {
    if (run !== _runId) return; // evento de uma leitura antiga (IMP-13)
    _speaking = false;
    _resume = null;
    _utterance = null;
    notify();
  };
  utterance.onend = done;
  utterance.onerror = (e) => {
    if (run !== _runId) return;
    if (isSpeechFailure(e)) failSpeech();
    else done();
  };
  speechSynthesis.speak(utterance);
}

/**
 * Speak the main page content in Brazilian Portuguese, block by block.
 * If already speaking, stops first then starts again.
 */
export function speakMainContent() {
  if (typeof speechSynthesis === 'undefined') return;

  stopSpeaking();

  const run = _runId; // stopSpeaking() acima já abriu uma nova geração
  _blocks = collectBlocks();
  if (!_blocks.length) {
    // Fallback: whole region as one utterance (no highlight target)
    const root = getRoot();
    const text = root
      ? (root.innerText || root.textContent || '').replace(/\s+/g, ' ').trim()
      : '';
    if (!text) return;

    _speaking = true;
    notify();
    speakFallback(text, run);
    return;
  }

  _speaking = true;
  notify();
  speakBlockAt(0, run);
}

/**
 * Cancel any ongoing speech and clear highlight.
 */
export function stopSpeaking(reason) {
  _runId += 1; // invalida qualquer evento pendente da leitura que está sendo parada
  _speaking = false;
  _paused = false;
  _resume = null;
  _blocks = [];
  _blockIndex = 0;
  clearHighlight();
  notify(typeof reason === 'string' ? reason : undefined);
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  _utterance = null;
}

/**
 * F10c: pausa a leitura do conteúdo principal. Cancela a fala e guarda o pedaço atual;
 * `resumeSpeaking` volta a falar desse pedaço (a pausa nativa falha no Android e em falas longas).
 * @returns {boolean} true se pausou
 */
export function pauseSpeaking() {
  if (!_speaking || _paused || !_resume) return false;
  _runId += 1; // eventos da fala cancelada não avançam a fila
  _paused = true;
  _utterance = null;
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  notify();
  return true;
}

/** F10c: retoma do pedaço onde pausou. @returns {boolean} true se retomou */
export function resumeSpeaking() {
  if (!_speaking || !_paused || !_resume) return false;
  _paused = false;
  const run = _runId;
  const r = _resume;
  notify();
  if (r.chunks) speakChunk(r.index, r.chunks, r.i, run);
  else speakFallback(r.text, run);
  return true;
}

/** @returns {boolean} true enquanto a leitura está pausada */
export function isPaused() {
  return _paused;
}

/** @returns {boolean} true enquanto a leitura "Ouvir" do conteúdo principal está ativa */
export function isReadingMain() {
  return _speaking;
}

/**
 * @returns {boolean}
 */
export function isSpeaking() {
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking) {
    return true;
  }
  return _speaking;
}
