/**
 * features/mediaMute.js
 *
 * F7c "Silenciar mídia": com a opção `muteMedia` ligada, pausa e muta todo <video>/<audio> da
 * página (inclusive os que aparecem depois, como autoplay, e os dentro de shadow roots abertos).
 * Iframes de outro site (YouTube etc.) não dão para controlar: recebem um aviso por cima.
 *
 * - O usuário ainda pode apertar play/ativar o som (ativação de usuário recente): não se briga com ele.
 * - Desligar devolve só o estado `muted` anterior; nunca chama play().
 * - pauseAutoplay(root) e restoreMedia() são exportadas para reuso (F7d, bloco piscante).
 */

const OWN_HOST = '#ms-container';
const BADGE_ATTR = 'data-ms-media-badge';
const MEDIA_SELECTOR = 'video, audio';
const BADGE_TEXT = 'Este vídeo é de outro site. Não consigo tirar o som dele.';
/** Hospedeiros de vídeo conhecidos: o iframe toca sozinho e não dá para controlar. */
const VIDEO_HOSTS =
  /(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv|facebook\.com|tiktok\.com|wistia\.com|wistia\.net|jwplatform\.com|brightcove\.net)$/i;

/** @type {WeakMap<Element, boolean>} estado `muted` de antes de mexermos */
const _prior = new WeakMap();
/** @type {Set<WeakRef<Element>>} */
const _tracked = new Set();
/** @type {Map<Element, HTMLElement>} iframe → aviso */
const _badges = new Map();
/** @type {MutationObserver|null} */
let _observer = null;
let _on = false;

const userActive = () => !!navigator.userActivation?.isActive;

function isOwn(el) {
  return !!el.closest?.(`${OWN_HOST}, [${BADGE_ATTR}]`);
}

/** Todos os elementos de `root` e dos shadow roots abertos abaixo dele (menos a UI da lib). */
function walk(root, visit) {
  const els =
    root.nodeType === 1
      ? [root, ...root.querySelectorAll('*')]
      : Array.from(root.querySelectorAll('*'));
  for (const el of els) {
    if (el.id === 'ms-container' || isOwn(el)) continue;
    visit(el);
    if (el.shadowRoot) walk(el.shadowRoot, visit);
  }
}

function muteOne(el) {
  if (!_prior.has(el)) {
    _prior.set(el, el.muted);
    _tracked.add(new WeakRef(el));
  }
  el.muted = true;
  el.removeAttribute('autoplay');
  el.autoplay = false;
  if (!el.paused) el.pause();
}

/**
 * Pausa, muta e tira o autoplay de todo <video>/<audio> em `root` (e shadow roots abertos).
 * Guarda o `muted` anterior para restoreMedia().
 * @param {Document|Element|ShadowRoot} [root]
 * @returns {number} quantas mídias foram tratadas
 */
export function pauseAutoplay(root = document) {
  let n = 0;
  walk(root, (el) => {
    if (el.matches?.(MEDIA_SELECTOR)) {
      muteOne(el);
      n += 1;
    }
  });
  return n;
}

/** Devolve o `muted` anterior das mídias tratadas. Nunca dá play. */
export function restoreMedia() {
  for (const ref of _tracked) {
    const el = ref.deref();
    if (el && _prior.has(el)) {
      el.muted = _prior.get(el);
      _prior.delete(el);
    }
  }
  _tracked.clear();
}

function isForeignVideoFrame(el) {
  if (el.tagName !== 'IFRAME') return false;
  let u;
  try {
    u = new URL(el.getAttribute('src') || '', location.href);
  } catch (_) {
    return false;
  }
  if (u.origin === location.origin) return false;
  return (
    VIDEO_HOSTS.test(u.hostname) ||
    /autoplay/i.test(el.getAttribute('allow') || '')
  );
}

function placeBadge(frame, badge) {
  const r = frame.getBoundingClientRect();
  Object.assign(badge.style, {
    top: `${r.top + window.scrollY + 8}px`,
    left: `${r.left + window.scrollX + 8}px`,
    maxWidth: `${Math.max(120, r.width - 16)}px`,
  });
}

function badgeFor(frame) {
  if (_badges.has(frame)) return;
  const badge = document.createElement('div');
  badge.setAttribute(BADGE_ATTR, '');
  badge.setAttribute('role', 'note');
  badge.textContent = BADGE_TEXT;
  Object.assign(badge.style, {
    position: 'absolute',
    zIndex: '2147483644',
    pointerEvents: 'none', // não bloqueia cliques no vídeo
    padding: '0.5rem 0.75rem',
    background: '#0B2C5F',
    color: '#fff',
    font: '600 0.9rem/1.3 system-ui, sans-serif',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  });
  document.body.appendChild(badge);
  placeBadge(frame, badge);
  _badges.set(frame, badge);
}

function scan(root) {
  walk(root, (el) => {
    if (el.matches?.(MEDIA_SELECTOR)) muteOne(el);
    else if (isForeignVideoFrame(el)) badgeFor(el);
  });
}

function relayout() {
  for (const [frame, badge] of _badges) {
    if (frame.isConnected) placeBadge(frame, badge);
    else {
      badge.remove();
      _badges.delete(frame);
    }
  }
}

/** play() de script (autoplay tardio) sem gesto do usuário: pausa e muta de novo. */
function onPlay(e) {
  const el = e.target;
  if (!el?.matches?.(MEDIA_SELECTOR) || isOwn(el)) return;
  if (!_prior.has(el)) {
    _prior.set(el, el.muted);
    _tracked.add(new WeakRef(el));
  }
  el.muted = true;
  if (!userActive()) el.pause();
}

/** Som ligado por script (sem gesto do usuário) volta a ficar mudo. */
function onVolume(e) {
  const el = e.target;
  if (!el?.matches?.(MEDIA_SELECTOR) || isOwn(el)) return;
  if (!el.muted && !userActive()) el.muted = true;
}

export function startMediaMute() {
  if (_on) return;
  _on = true;
  scan(document);
  document.addEventListener('play', onPlay, true);
  document.addEventListener('volumechange', onVolume, true);
  window.addEventListener('resize', relayout);
  _observer = new MutationObserver((records) => {
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (n.nodeType === 1 && !isOwn(n)) scan(n);
      }
    }
    relayout();
  });
  _observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

export function stopMediaMute() {
  if (!_on) return;
  _on = false;
  _observer?.disconnect();
  _observer = null;
  document.removeEventListener('play', onPlay, true);
  document.removeEventListener('volumechange', onVolume, true);
  window.removeEventListener('resize', relayout);
  for (const badge of _badges.values()) badge.remove();
  _badges.clear();
  restoreMedia();
}
