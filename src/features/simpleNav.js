/**
 * features/simpleNav.js
 *
 * Pills de navegação injetáveis via configure({ simpleNav: [{ label, href }] }).
 * Não altera markup de páginas que já têm [data-ms-pills] próprio (ex.: protótipo Senac).
 */

/**
 * @typedef {{ label: string, href: string, short?: string }} SimpleNavItem
 */

/**
 * Normaliza a lista de itens da API.
 * @param {unknown} items
 * @returns {SimpleNavItem[]}
 */
export function normalizeSimpleNav(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const label = String(item.label ?? '').trim();
      const href = String(item.href ?? '').trim();
      if (!label || !href) return null;
      const short =
        item.short != null && String(item.short).trim()
          ? String(item.short).trim()
          : undefined;
      return short ? { label, href, short } : { label, href };
    })
    .filter(Boolean);
}

/**
 * @returns {Element | null}
 */
function findHostAuthoredPills() {
  const all = document.querySelectorAll('[data-ms-pills]');
  for (const el of all) {
    if (!el.hasAttribute('data-ms-injected')) return el;
  }
  return null;
}

/**
 * @returns {{
 *   sync: (items: unknown) => void,
 *   destroy: () => void,
 * }}
 */
export function createSimpleNav() {
  /** @type {HTMLElement | null} */
  let nav = null;

  /**
   * @param {unknown} items
   */
  function sync(items) {
    const list = normalizeSimpleNav(items);

    if (findHostAuthoredPills()) {
      destroy();
      return;
    }

    if (!list.length) {
      destroy();
      return;
    }

    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'ms-pills-nav ms-simple-only';
      nav.setAttribute('data-ms-pills', '');
      nav.setAttribute('data-ms-injected', '');
      nav.setAttribute('aria-label', 'Navegação do Modo Simples');

      const inner = document.createElement('div');
      inner.className = 'ms-pills-nav__inner';
      nav.appendChild(inner);
      _mount(nav);
    }

    const inner = nav.querySelector('.ms-pills-nav__inner');
    if (!inner) return;

    // Preserve SIMPLES chrome if it was moved into the pills row (MS on)
    const chrome = inner.querySelector('#ms-simples-chrome');
    if (chrome) chrome.remove();

    inner.innerHTML = '';
    for (const item of list) {
      const a = document.createElement('a');
      a.className = 'ms-pill';
      a.setAttribute('href', item.href);
      a.href = item.href;
      if (item.short) {
        const full = document.createElement('span');
        full.className = 'ms-pill__full';
        full.textContent = item.label;
        const short = document.createElement('span');
        short.className = 'ms-pill__short';
        short.textContent = item.short;
        a.appendChild(full);
        a.appendChild(short);
      } else {
        a.textContent = item.label;
      }
      inner.appendChild(a);
    }

    if (chrome) inner.appendChild(chrome);

    _markCurrent(nav);
  }

  function destroy() {
    if (!nav) return;
    nav.remove();
    nav = null;
  }

  return { sync, destroy };
}

/**
 * @param {HTMLElement} nav
 */
function _mount(nav) {
  const bar = document.getElementById('ms-session-bar');
  if (bar) {
    bar.insertAdjacentElement('afterend', nav);
    return;
  }

  const header =
    document.querySelector('header.site-header') ||
    document.querySelector('header');
  if (header) {
    header.insertAdjacentElement('afterend', nav);
    return;
  }

  const chrome = document.getElementById('ms-simples-chrome');
  if (chrome) {
    chrome.insertAdjacentElement('afterend', nav);
    return;
  }

  document.body.prepend(nav);
}

/**
 * @param {HTMLElement} nav
 */
function _markCurrent(nav) {
  const path = (typeof location !== 'undefined' && location.pathname) || '';
  const file = path.split('/').pop() || '';
  const hrefFull = (typeof location !== 'undefined' && location.href) || '';

  nav.querySelectorAll('a.ms-pill').forEach((a) => {
    a.removeAttribute('aria-current');
    const href = a.getAttribute('href') || '';
    if (!href || href === '#') return;

    try {
      const resolved =
        typeof location !== 'undefined'
          ? new URL(href, location.href)
          : null;
      const match =
        (resolved && resolved.href === hrefFull) ||
        href === file ||
        href.endsWith('/' + file) ||
        (file && href.split('/').pop() === file);
      if (match) a.setAttribute('aria-current', 'page');
    } catch (_) {
      if (href === file) a.setAttribute('aria-current', 'page');
    }
  });
}
