/**
 * features/flashBlock.js
 *
 * F7d "Bloqueio de intermitência" (segurança para epilepsia): com `blockFlashing` ligada
 *  - <marquee> para (stop()) e volta no start() ao desligar; <blink> não anima (CSS);
 *  - GIF animado (src .gif ou data:image/gif) vira o 1º quadro, mesmo tamanho e texto alternativo;
 *    fora de links/botões é um botão "Mostrar animação" (clique/Enter/Espaço revela); dentro de
 *    link/botão fica só a imagem parada (sem botão dentro de link) — o link segue normal;
 *  - vídeo/áudio com `autoplay` (e `play()` de script sem gesto do usuário) é só PAUSADO: nunca
 *    mutado nem mexido se o usuário deu play (silenciar é a opção "Pausar e mutar tudo").
 * Conteúdo que aparece depois é tratado por um MutationObserver próprio. O CSS fica em
 * page/30-reduced-motion.css e ui/. Desligar devolve tudo, sem play().
 * Limites: ver CHANGELOG (GIF em background CSS/shadow root, WebP/APNG animado, SVG-SMIL, JS).
 */

import { STRINGS as S } from '../ui/strings.js';

const OWN_HOST = '#ms-container';
const STILL_ATTR = 'data-ms-gif-still';
const MEDIA_SELECTOR = 'video, audio';
/** O que, do <img>, precisa ir para o substituto para o layout não mudar. */
const COPY_STYLE = [
  'margin',
  'float',
  'borderRadius',
  'border',
  'boxSizing',
  'verticalAlign',
  'top',
  'left',
  'right',
  'bottom',
];

/** @type {Map<HTMLElement, HTMLImageElement>} substituto (1º quadro) → <img> original */
const _stills = new Map();
/** GIFs que o usuário mandou animar: não congelar de novo (zerado ao desligar). */
let _revealed = new WeakSet();
/** @type {Set<Element>} marquees que paramos */
const _marquees = new Set();
/** @type {Set<Element>} mídias cujo `autoplay` tiramos (o atributo volta ao desligar) */
const _autoplayed = new Set();
let _observer = null;
let _on = false;

const isOwn = (el) => !!el.closest?.(OWN_HOST);
const userActive = () => !!navigator.userActivation?.isActive;

export function isGif(img) {
  const src = img.currentSrc || img.getAttribute('src') || '';
  if (/^data:image\/gif/i.test(src)) return true;
  try {
    return /\.gif$/i.test(new URL(src, location.href).pathname);
  } catch (_) {
    return false;
  }
}

function reveal(btn) {
  const img = _stills.get(btn);
  if (!img) return;
  _revealed.add(img);
  _stills.delete(btn);
  btn.replaceWith(img);
  // <img> não recebe foco sozinho: sem isso o foco cairia no <body>
  if (!img.hasAttribute('tabindex')) {
    img.setAttribute('tabindex', '-1');
    img.addEventListener('blur', () => img.removeAttribute('tabindex'), {
      once: true,
    });
  }
  img.focus?.({ preventScroll: true });
}

function freeze(img) {
  if (!_on || _revealed.has(img) || !img.isConnected || isOwn(img)) return;
  if (!img.complete || !img.naturalWidth) return;
  const rect = img.getBoundingClientRect();
  const w = Math.round(rect.width || img.naturalWidth);
  const h = Math.round(rect.height || img.naturalHeight);
  const cs = getComputedStyle(img);
  const interactive = !img.closest('a, button, [role="button"], [role="link"]');
  const alt = img.getAttribute('alt') || '';

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    width: '100%',
    height: '100%',
    display: 'block',
  });
  // Imagem nova do mesmo endereço: desenha o 1º quadro (a do DOM já pode estar no meio)
  const first = document.createElement('img');
  first.onload = () => canvas.getContext('2d')?.drawImage(first, 0, 0);
  first.src = img.currentSrc || img.src;

  const still = document.createElement(interactive ? 'button' : 'span');
  still.className = img.className; // mesmas regras de layout da página
  still.setAttribute(STILL_ATTR, '');
  if (interactive) {
    still.type = 'button';
    still.setAttribute(
      'aria-label',
      alt ? `${S.gifShowLabel}: ${alt}` : S.gifShowLabel,
    );
  } else if (alt) {
    still.setAttribute('role', 'img');
    still.setAttribute('aria-label', alt);
  } else {
    still.setAttribute('aria-hidden', 'true');
  }
  for (const p of COPY_STYLE) still.style[p] = cs[p];
  Object.assign(still.style, {
    position: cs.position === 'static' ? 'relative' : cs.position,
    display: cs.display === 'inline' ? 'inline-block' : cs.display,
    width: `${w}px`,
    height: 'auto',
    aspectRatio: `${w} / ${h}`, // redimensionar não distorce
    maxWidth: '100%',
    padding: '0',
    background: 'none',
    cursor: interactive ? 'pointer' : 'inherit',
  });
  if (cs.borderStyle === 'none') still.style.border = '0';
  still.append(canvas);
  if (interactive) {
    const tag = document.createElement('span');
    tag.setAttribute('aria-hidden', 'true');
    tag.textContent = `▶ ${S.gifShowLabel}`;
    Object.assign(tag.style, {
      position: 'absolute',
      left: '6px',
      bottom: '6px',
      padding: '0.2rem 0.5rem',
      background: '#0B2C5F',
      color: '#fff',
      font: '600 0.85rem/1.2 system-ui, sans-serif',
      borderRadius: '4px',
    });
    still.append(tag);
    still.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      reveal(still);
    });
  }
  _stills.set(still, img);
  img.replaceWith(still);
}

function handleImg(img) {
  if (!isGif(img) || _revealed.has(img)) return;
  if (img.complete && img.naturalWidth) freeze(img);
  else img.addEventListener('load', () => freeze(img), { once: true });
}

function handleMarquee(m) {
  if (typeof m.stop !== 'function' || _marquees.has(m)) return;
  m.stop();
  _marquees.add(m);
}

/** Só autoplay: pausa e tira o atributo; não muta e não mexe em mídia que o usuário iniciou. */
function handleMedia(el) {
  if (!el.hasAttribute('autoplay') && !el.autoplay) return;
  el.removeAttribute('autoplay');
  el.autoplay = false;
  _autoplayed.add(el);
  if (!el.paused) el.pause();
}

/** play() de script sem gesto do usuário (autoplay tardio): pausa, sem mutar. */
function onPlay(e) {
  const el = e.target;
  if (!el?.matches?.(MEDIA_SELECTOR) || isOwn(el)) return;
  if (!userActive()) el.pause();
}

function scan(root) {
  if (root.nodeType !== 1 && root.nodeType !== 9) return;
  const all =
    root.nodeType === 1
      ? [root, ...root.querySelectorAll('*')]
      : root.querySelectorAll('*');
  for (const el of all) {
    if (el.id === 'ms-container' || isOwn(el)) continue;
    if (el.tagName === 'IMG') handleImg(el);
    else if (el.tagName === 'MARQUEE') handleMarquee(el);
    else if (el.matches?.(MEDIA_SELECTOR)) handleMedia(el);
  }
}

export function startFlashBlock() {
  if (_on) return;
  _on = true;
  document.addEventListener('play', onPlay, true);
  _observer = new MutationObserver((records) => {
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (n.nodeType === 1 && !isOwn(n) && !n.hasAttribute?.(STILL_ATTR)) {
          scan(n);
        }
      }
    }
  });
  _observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  scan(document);
}

/** Desliga e devolve tudo (img original, marquee.start(), atributo autoplay); nunca chama play(). */
export function stopFlashBlock() {
  if (!_on) return;
  _on = false;
  _observer?.disconnect();
  _observer = null;
  document.removeEventListener('play', onPlay, true);
  for (const [still, img] of _stills) still.replaceWith(img);
  _stills.clear();
  _revealed = new WeakSet(); // ligar de novo congela de novo
  for (const m of _marquees) m.start?.();
  _marquees.clear();
  for (const el of _autoplayed) el.setAttribute('autoplay', '');
  _autoplayed.clear();
}
