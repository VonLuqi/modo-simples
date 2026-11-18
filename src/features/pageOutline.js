/**
 * features/pageOutline.js
 *
 * F9c "Estrutura da página": ação (não é opção persistida) que abre um diálogo com os títulos
 * (h1–h6 e [role=heading][aria-level], recuados por nível) e as áreas (landmarks) da página.
 * A lista é refeita a cada abertura. Fora dela ficam elementos ocultos e a UI do próprio
 * Modo Simples. Clicar/Enter num item chama `onJump(elemento)`; Esc ou Fechar fecham o diálogo
 * e devolvem o foco ao botão que o abriu.
 */

import { STRINGS as S } from '../ui/strings.js';

export const OUTLINE_ID = 'ms-page-outline';
const OWN =
  '#ms-container, #ms-shortcuts-card, #ms-simples-chrome, #ms-session-bar, #ms-text-magnifier, #ms-virtual-keyboard, [data-ms-live]';
const FOCUSABLE =
  'a[href], button, input, select, textarea, summary, [contenteditable=""], [contenteditable="true"]';
const CANDIDATES =
  'h1, h2, h3, h4, h5, h6, [role], main, nav, header, footer, aside, form, section, search';
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

/** Candidatos em ordem de documento, entrando nos shadow roots abertos (o conteúdo vem logo após o host). */
function deepCandidates(root, out = []) {
  for (const el of root.querySelectorAll('*')) {
    if (el.matches(OWN)) continue;
    if (el.matches(CANDIDATES)) out.push(el);
    if (el.shadowRoot) deepCandidates(el.shadowRoot, out);
  }
  return out;
}

function isHidden(el) {
  for (
    let n = el;
    n && n.nodeType === 1;
    n = n.parentElement || n.getRootNode?.()?.host
  ) {
    if (
      n.hidden ||
      n.getAttribute('aria-hidden') === 'true' ||
      n.hasAttribute('data-ms-hidden')
    ) {
      return true;
    }
    const cs = getComputedStyle(n);
    if (cs.display === 'none') return true;
    if (n === el && cs.visibility === 'hidden') return true;
  }
  return false;
}

function accessibleName(el) {
  const by = el.getAttribute('aria-labelledby');
  if (by) {
    const t = clean(
      by
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent || '')
        .join(' '),
    );
    if (t) return t;
  }
  return clean(el.getAttribute('aria-label'));
}

const ROLE_MAP = {
  main: 'main',
  navigation: 'nav',
  banner: 'banner',
  contentinfo: 'footer',
  complementary: 'aside',
  form: 'form',
  search: 'search',
  region: 'region',
};
const TAG_MAP = {
  main: 'main',
  nav: 'nav',
  aside: 'aside',
  search: 'search',
  form: 'form',
  section: 'region',
};

/** Papel de landmark do elemento, ou '' se não é um. */
function landmarkRole(el) {
  const explicit = clean(el.getAttribute('role')).split(' ')[0].toLowerCase();
  if (explicit) return ROLE_MAP[explicit] || '';
  const tag = el.tagName.toLowerCase();
  if (TAG_MAP[tag]) return TAG_MAP[tag];
  // header/footer só são banner/contentinfo fora de article, aside, main, nav e section
  if (tag === 'header' || tag === 'footer') {
    if (el.parentElement?.closest('article, aside, main, nav, section')) {
      return '';
    }
    return tag === 'header' ? 'banner' : 'footer';
  }
  return '';
}

const NAME_REQUIRED = new Set(['form', 'search', 'region']);
const ROLE_LABEL = {
  main: S.outlineLmMain,
  nav: S.outlineLmNav,
  banner: S.outlineLmBanner,
  footer: S.outlineLmFooter,
  aside: S.outlineLmAside,
  form: S.outlineLmForm,
  search: S.outlineLmSearch,
  region: S.outlineLmRegion,
};

function headingLevel(el) {
  const m = /^H([1-6])$/.exec(el.tagName);
  if (m) return Number(m[1]);
  if (clean(el.getAttribute('role')).split(' ')[0] !== 'heading') return 0;
  const n = parseInt(el.getAttribute('aria-level'), 10);
  return n >= 1 && n <= 6 ? n : 2;
}

/**
 * Títulos e áreas visíveis da página, na ordem do documento.
 * @param {ParentNode} [root]
 */
export function collectOutline(root = document) {
  const headings = [];
  const landmarks = [];
  for (const el of deepCandidates(root)) {
    if (el.closest(OWN) || isHidden(el)) continue;
    const level = headingLevel(el);
    if (level) {
      const text =
        clean(el.textContent) || accessibleName(el) || S.outlineNoText;
      headings.push({ el, level, text });
      continue;
    }
    const role = landmarkRole(el);
    if (!role) continue;
    const name = accessibleName(el);
    if (NAME_REQUIRED.has(role) && !name) continue;
    const label = ROLE_LABEL[role];
    landmarks.push({
      el,
      role,
      name,
      text: name ? `${label}: ${name}` : label,
    });
  }
  return { headings, landmarks };
}

/** Rola até o alvo e move o foco (tabindex=-1 temporário se não for focalizável). */
export function jumpToElement(el) {
  if (!el?.isConnected) return;
  el.scrollIntoView?.({ block: 'start' });
  if (!el.hasAttribute('tabindex') && !el.matches(FOCUSABLE)) {
    el.setAttribute('tabindex', '-1');
    el.addEventListener('blur', () => el.removeAttribute('tabindex'), {
      once: true,
    });
  }
  el.focus?.({ preventScroll: true });
}

/**
 * Diálogo dentro do painel (mesmo shadow root): enquanto aberto, os demais filhos do painel
 * ficam `inert` para o foco ficar só nele.
 * @param {{container: HTMLElement, onJump: (el: Element) => void}} opts
 */
export function createPageOutline({ container, onJump }) {
  let dlg = null;
  let trigger = null;
  const inerted = [];

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  function item(list, text, level, target) {
    const li = el('li', 'ms-outline-item');
    if (level) li.style.paddingInlineStart = `${(level - 1) * 16}px`;
    const b = el('button', 'ms-outline-link', text);
    b.type = 'button';
    if (level) {
      b.setAttribute('aria-label', `${S.outlineLevel} ${level}: ${text}`);
    }
    b.addEventListener('click', () => {
      close({ restoreFocus: false });
      onJump(target);
    });
    li.appendChild(b);
    list.appendChild(li);
  }

  function group(parent, title, rows, levelOf) {
    if (!rows.length) return;
    const h = el('h3', 'ms-outline-group', title);
    const ul = el('ul', 'ms-outline-list');
    rows.forEach((r) => item(ul, r.text, levelOf?.(r), r.el));
    parent.append(h, ul);
  }

  function open(from) {
    if (dlg) return;
    trigger = from || null;
    const { headings, landmarks } = collectOutline();
    dlg = el('div', 'ms-outline');
    dlg.id = OUTLINE_ID;
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-labelledby', `${OUTLINE_ID}-title`);
    const head = el('div', 'ms-outline-head');
    const title = el('h2', 'ms-outline-title', S.outlineTitle);
    title.id = `${OUTLINE_ID}-title`;
    const closeBtn = el(
      'button',
      'ms-a11y-action ms-outline-close',
      S.outlineClose,
    );
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', () => close());
    head.append(title, closeBtn);
    const body = el('div', 'ms-outline-body');
    if (!headings.length && !landmarks.length) {
      body.appendChild(el('p', 'ms-outline-empty', S.outlineEmpty));
    } else {
      group(body, S.outlineLandmarks, landmarks);
      group(body, S.outlineHeadings, headings, (r) => r.level);
    }
    dlg.append(head, body);
    dlg.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation(); // Esc fecha só o diálogo, não o painel
      close();
    });
    for (const n of container.children) {
      if (!n.hasAttribute('inert')) {
        n.setAttribute('inert', '');
        inerted.push(n);
      }
    }
    container.appendChild(dlg);
    (dlg.querySelector('.ms-outline-link') || closeBtn).focus();
  }

  /** @param {{restoreFocus?: boolean}} [o] */
  function close({ restoreFocus = true } = {}) {
    if (!dlg) return;
    dlg.remove();
    dlg = null;
    for (const n of inerted.splice(0)) n.removeAttribute('inert');
    const t = trigger;
    trigger = null;
    if (restoreFocus && t?.isConnected) t.focus();
  }

  return { open, close, isOpen: () => !!dlg };
}
