/**
 * features/flashBlock.js
 *
 * F7d "Bloqueio de intermitência" (segurança para epilepsia): com `blockFlashing` ligada
 *  - <marquee> para (stop()) e volta no start() ao desligar; <blink> não anima (CSS);
 *  - GIF animado (src .gif ou data:image/gif) vira um botão com o 1º quadro, mesmo tamanho e
 *    texto alternativo; clique/Enter/Espaço mostra a animação ("Mostrar animação");
 *  - vídeo com autoplay é pausado via pauseAutoplay() (F7c), sem duplicar lógica.
 * Conteúdo que aparece depois é tratado por um MutationObserver próprio. O CSS (animation/
 * transition: none) fica em page/30-reduced-motion.css e ui/. Desligar devolve tudo, sem play().
 * Limites: GIF em `background-image` de CSS e GIF dentro de shadow roots não são congelados.
 */

import { STRINGS as S } from '../ui/strings.js';
import { pauseAutoplay, restoreMedia } from './mediaMute.js';

const OWN_HOST = '#ms-container';
const STILL_ATTR = 'data-ms-gif-still';

/** @type {Map<HTMLElement, HTMLImageElement>} botão (1º quadro) → <img> original */
const _stills = new Map();
/** @type {WeakSet<Element>} GIFs que o usuário mandou animar: não congelar de novo */
const _revealed = new WeakSet();
/** @type {Set<Element>} marquees que paramos */
const _marquees = new Set();
let _observer = null;
let _on = false;

const isOwn = (el) => !!el.closest?.(OWN_HOST);

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
  img.focus?.({ preventScroll: true });
}

function freeze(img) {
  if (!_on || _revealed.has(img) || !img.isConnected || isOwn(img)) return;
  if (!img.complete || !img.naturalWidth) return;
  const rect = img.getBoundingClientRect();
  const w = Math.round(rect.width || img.naturalWidth);
  const h = Math.round(rect.height || img.naturalHeight);
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

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute(STILL_ATTR, '');
  const alt = img.getAttribute('alt') || '';
  btn.setAttribute(
    'aria-label',
    alt ? `${S.gifShowLabel}: ${alt}` : S.gifShowLabel,
  );
  Object.assign(btn.style, {
    position: 'relative',
    display: img.style.display || 'inline-block',
    width: `${w}px`,
    height: `${h}px`,
    maxWidth: '100%',
    padding: '0',
    border: '0',
    background: 'none',
    cursor: 'pointer',
    verticalAlign: 'bottom',
  });
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
  btn.append(canvas, tag);
  btn.addEventListener('click', (e) => {
    e.preventDefault(); // GIF dentro de link: não navega
    e.stopPropagation();
    reveal(btn);
  });
  _stills.set(btn, img);
  img.replaceWith(btn);
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
  }
  pauseAutoplay(root);
}

export function startFlashBlock() {
  if (_on) return;
  _on = true;
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

/**
 * @param {{keepMedia?: boolean}} [opts] keepMedia: "Pausar e mutar tudo" segue ligado,
 *   então o `muted` das mídias não é devolvido.
 */
export function stopFlashBlock({ keepMedia = false } = {}) {
  if (!_on) return;
  _on = false;
  _observer?.disconnect();
  _observer = null;
  for (const [btn, img] of _stills) btn.replaceWith(img);
  _stills.clear();
  for (const m of _marquees) m.start?.();
  _marquees.clear();
  if (!keepMedia) restoreMedia();
}
