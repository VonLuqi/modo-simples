/**
 * features/tts.js
 *
 * speechSynthesis helper — reads main / [data-ms-principal] content in pt-BR,
 * block by block, highlighting the current element.
 */

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

  const text = (el.innerText || el.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 0;
}

/**
 * Collect readable text blocks from the main content region.
 * @returns {Element[]}
 */
function collectBlocks() {
  const root = getRoot();
  if (!root) return [];

  /** @type {Element[]} */
  const nodes = [];
  for (const tag of BLOCK_TAGS) {
    const found = root.querySelectorAll(tag);
    for (let i = 0; i < found.length; i++) nodes.push(found[i]);
  }

  return nodes.filter((el) => {
    if (!isVisiblyReadable(el)) return false;
    // Skip nested blocks already covered by a parent block (e.g. p inside li)
    let parent = el.parentElement;
    while (parent && parent !== root) {
      if (
        parent.tagName &&
        BLOCK_TAGS.includes(parent.tagName.toLowerCase()) &&
        isVisiblyReadable(parent)
      ) {
        return false;
      }
      parent = parent.parentElement;
    }
    return true;
  });
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

  const utterance = new SpeechSynthesisUtterance(text);
  _utterance = utterance;
  utterance.lang = 'pt-BR';
  utterance.rate = 1;
  const next = () => {
    if (run !== _runId) return; // evento de uma leitura antiga: ignora (IMP-13)
    _utterance = null;
    if (_speaking) speakBlockAt(index + 1, run);
  };
  utterance.onend = next;
  utterance.onerror = next;

  speechSynthesis.speak(_utterance);
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

    const utterance = new SpeechSynthesisUtterance(text);
    _utterance = utterance;
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    const done = () => {
      if (run !== _runId) return; // evento de uma leitura antiga (IMP-13)
      _speaking = false;
      _utterance = null;
    };
    utterance.onend = done;
    utterance.onerror = done;
    _speaking = true;
    speechSynthesis.speak(utterance);
    return;
  }

  _speaking = true;
  speakBlockAt(0, run);
}

/**
 * Cancel any ongoing speech and clear highlight.
 */
export function stopSpeaking() {
  _runId += 1; // invalida qualquer evento pendente da leitura que está sendo parada
  _speaking = false;
  _blocks = [];
  _blockIndex = 0;
  clearHighlight();
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  _utterance = null;
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
