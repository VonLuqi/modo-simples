/**
 * ui/sessionChrome.js
 *
 * Toggle SIMPLES (header) + barra âmbar abaixo do nav.
 * Injetado no light DOM para participar do layout da página.
 */

import { hasSimpleLanguagePairs } from '../utils/simpleLanguage.js';
import { STRINGS as S } from './strings.js';

const SLIDERS_ICON = `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="4" y1="12" x2="20" y2="12"/>
    <line x1="4" y1="18" x2="20" y2="18"/>
    <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
    <circle cx="14" cy="12" r="2" fill="currentColor" stroke="none"/>
    <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
  </svg>`;

/**
 * @param {Object} opts
 * @param {(on: boolean) => void} opts.onToggleModoSimples
 * @param {() => void} opts.onOpenPanel
 * @param {() => void} opts.onSpeak
 * @param {(on: boolean) => void} opts.onToggleSimpleLanguage
 * @param {(hide: boolean) => void} [opts.onToggleHideImages]
 * @param {{ chrome?: string|string[], bar?: string|string[] }} [opts.mount]
 *   chrome: container onde entra o switch SIMPLES · bar: elemento APÓS o qual a barra entra
 *   (seletor ou lista, primeiro que existir). Sem mount: switch fixo + barra no topo do body.
 * @returns {{
 *   sync: (state: Object, ui?: { speaking?: boolean }) => void,
 *   destroy: () => void,
 * }}
 */
export function createSessionChrome({
  onToggleModoSimples,
  onOpenPanel,
  onSpeak,
  onToggleSimpleLanguage,
  onToggleHideImages,
  mount = {},
}) {
  const chrome = document.createElement('div');
  chrome.id = 'ms-simples-chrome';
  chrome.className = 'ms-simples-chrome';
  chrome.innerHTML = `
    <div class="ms-simples-chrome-inner">
      <button type="button" class="ms-chrome-icon" data-action="open-panel"
        aria-label="${S.sessionOpenPanelLabel}" title="${S.sessionOpenPanelTitle}">
        ${SLIDERS_ICON}
      </button>
      <div class="ms-simples-toggle-wrap" data-active="false">
        <span class="ms-simples-spark" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
        <div class="ms-simples-toggle-text">
          <strong>${S.sessionBrand}</strong>
          <span class="ms-simples-sub" data-sub>${S.sessionSubOff}</span>
        </div>
        <button type="button" class="ms-switch ms-chrome-switch" role="switch" aria-checked="false"
          data-action="toggle-simples" aria-label="${S.sessionSwitchLabel}">
          <span class="ms-switch-thumb"></span>
        </button>
      </div>
    </div>
  `;

  const bar = document.createElement('div');
  bar.id = 'ms-session-bar';
  bar.className = 'ms-session-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', S.sessionBarLabel);
  bar.innerHTML = `
    <div class="ms-session-bar-inner" data-state="off">
      <div class="ms-session-off">
        <p><span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span> ${S.sessionOffPrompt}</p>
        <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="activate">${S.sessionActivate}</button>
      </div>
      <div class="ms-session-on" hidden>
        <div class="ms-session-on-top">
          <div class="ms-session-on-title" tabindex="-1">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
            <strong>${S.sessionOnTitle}<span class="ms-sr-only">${S.sessionOnSrSuffix}</span></strong>
            <span class="ms-session-badge">${S.sessionBadge}</span>
          </div>
          <p class="ms-session-desc" data-session-desc>
            ${S.sessionDescSimple}
          </p>
        </div>
        <div class="ms-session-actions">
          <button type="button" class="ms-session-btn ms-session-btn--light" data-action="speak" aria-label="${S.sessionSpeakLabel}">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg></span> <span data-speak-label>${S.sessionSpeakText}</span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="lang" aria-pressed="false">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/></svg></span> <span class="ms-btn-pre">${S.sessionLangPre}</span>${S.sessionLangMain}<span class="ms-btn-post">: <span data-lang-label aria-hidden="true">${S.sessionLangOff}</span></span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="images" aria-pressed="false">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/></svg></span> ${S.sessionImages}<span class="ms-btn-post">: <span data-images-label aria-hidden="true">${S.sessionImagesHidden}</span></span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--light" data-action="exit">${S.sessionExit}<span class="ms-btn-post">${S.sessionExitPost}</span></button>
        </div>
      </div>
    </div>
  `;

  _mountChrome(chrome, mount);
  _mountBar(bar, mount);

  chrome
    .querySelector('[data-action="toggle-simples"]')
    .addEventListener('click', (e) => {
      const on = e.currentTarget.getAttribute('aria-checked') !== 'true';
      onToggleModoSimples(on);
    });
  chrome
    .querySelector('[data-action="open-panel"]')
    .addEventListener('click', () => onOpenPanel());

  // Foco: o botão clicado some (bloco off/on troca); leva o foco ao controle que o desfaz.
  const focusIn = (selector) => {
    const el = bar.querySelector(selector);
    if (el && typeof el.focus === 'function') el.focus();
  };
  bar
    .querySelector('[data-action="activate"]')
    .addEventListener('click', () => {
      onToggleModoSimples(true);
      focusIn('.ms-session-on-title');
    });
  bar.querySelector('[data-action="exit"]').addEventListener('click', () => {
    onToggleModoSimples(false);
    focusIn('[data-action="activate"]');
  });
  bar
    .querySelector('[data-action="speak"]')
    .addEventListener('click', () => onSpeak());
  bar.querySelector('[data-action="lang"]').addEventListener('click', (e) => {
    // Sem pares data-ms-plain/simple na página não há o que simplificar (D4)
    if (e.currentTarget.getAttribute('aria-disabled') === 'true') return;
    const next = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    onToggleSimpleLanguage(next);
  });
  bar.querySelector('[data-action="images"]').addEventListener('click', (e) => {
    // aria-pressed true = imagens VISÍVEIS (hideImages false)
    const showing = e.currentTarget.getAttribute('aria-pressed') === 'true';
    const nextShow = !showing;
    if (typeof onToggleHideImages === 'function') {
      onToggleHideImages(!nextShow);
    }
  });

  /**
   * @param {Object} s
   * @param {{ speaking?: boolean }} [ui]
   */
  function sync(s, ui = {}) {
    const on = !!s.modoSimples;
    const sw = chrome.querySelector('[data-action="toggle-simples"]');
    const wrap = chrome.querySelector('.ms-simples-toggle-wrap');
    const sub = chrome.querySelector('[data-sub]');
    if (sw) {
      sw.setAttribute('aria-checked', String(on));
      sw.classList.toggle('ms-switch--on', on);
    }
    if (wrap) wrap.setAttribute('data-active', String(on));
    if (sub) sub.textContent = on ? S.sessionSubOn : S.sessionSubOff;

    // Header some com MS on (distração) — reposiciona o mesmo switch no nav de pills
    _placeChrome(chrome, on, mount);

    const inner = bar.querySelector('.ms-session-bar-inner');
    const off = bar.querySelector('.ms-session-off');
    const onBlock = bar.querySelector('.ms-session-on');
    if (inner) inner.setAttribute('data-state', on ? 'on' : 'off');
    if (off) off.hidden = on;
    if (onBlock) onBlock.hidden = !on;

    const langAvailable = hasSimpleLanguagePairs();
    const langOn = langAvailable && !!s.options?.simpleLanguage;
    const langBtn = bar.querySelector('[data-action="lang"]');
    const langLabel = bar.querySelector('[data-lang-label]');
    const desc = bar.querySelector('[data-session-desc]');
    if (langBtn) {
      langBtn.setAttribute('aria-pressed', String(langOn));
      langBtn.setAttribute('aria-disabled', String(!langAvailable));
      langBtn.classList.toggle('ms-session-btn--active', langOn);
    }
    if (langLabel) {
      // Estado vai por aria-pressed; só o aviso "Indisponível" precisa ser lido
      langLabel.setAttribute('aria-hidden', String(langAvailable));
      langLabel.textContent = !langAvailable
        ? S.sessionLangUnavailable
        : langOn
          ? S.sessionLangOn
          : S.sessionLangOff;
    }
    if (desc) {
      desc.textContent = langOn ? S.sessionDescSimple : S.sessionDescCalm;
    }

    const hideImgs = !!s.options?.hideImages;
    const imgBtn = bar.querySelector('[data-action="images"]');
    const imgLabel = bar.querySelector('[data-images-label]');
    if (imgBtn) {
      imgBtn.setAttribute('aria-pressed', String(!hideImgs));
      imgBtn.classList.toggle('ms-session-btn--active', !hideImgs);
    }
    if (imgLabel)
      imgLabel.textContent = hideImgs
        ? S.sessionImagesHidden
        : S.sessionImagesVisible;

    if (ui.speaking !== undefined) {
      const speakBtn = bar.querySelector('[data-action="speak"]');
      const speakLabel = bar.querySelector('[data-speak-label]');
      if (speakBtn) {
        speakBtn.classList.toggle('ms-session-btn--speaking', ui.speaking);
        speakBtn.setAttribute(
          'aria-label',
          ui.speaking ? S.sessionStopLabel : S.sessionSpeakLabel,
        );
      }
      if (speakLabel)
        speakLabel.textContent = ui.speaking
          ? S.sessionStopText
          : S.sessionSpeakText;
    }
  }

  function destroy() {
    chrome.remove();
    bar.remove();
  }

  return { sync, destroy };
}

/**
 * Primeiro elemento que casa com um seletor (ou lista de seletores). Seletor inválido é ignorado.
 * @param {string|string[]|undefined} selectors
 * @returns {Element|null}
 */
function _resolve(selectors) {
  const list = Array.isArray(selectors)
    ? selectors
    : selectors
      ? [selectors]
      : [];
  for (const sel of list) {
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch (_) {
      // seletor inválido — tenta o próximo
    }
  }
  return null;
}

/**
 * Move o chrome só se o pai mudou; se o foco estava dentro (re-parent o desfaz), devolve-o.
 * @param {HTMLElement} chrome
 * @param {Element} parent
 */
function _moveChrome(chrome, parent, first = false) {
  if (
    chrome.parentElement === parent &&
    (!first || parent.children[0] === chrome)
  ) {
    return;
  }
  const focused = chrome.contains(document.activeElement)
    ? document.activeElement
    : null;
  if (first) parent.prepend(chrome);
  else parent.appendChild(chrome);
  if (!focused) return;
  focused.focus();
  // O destino pode estar display:none até o <html> trocar ms-ativo (logo depois do sync):
  // focus() é no-op nesse caso; tenta de novo quando ele já estiver visível (QA R34 HIGH-1)
  if (
    document.activeElement !== focused &&
    typeof requestAnimationFrame === 'function'
  ) {
    requestAnimationFrame(() => focused.focus());
  }
}

function _mountChrome(chrome, mount) {
  chrome.classList.remove(
    'ms-simples-chrome--ms-nav',
    'ms-simples-chrome--fixed',
  );
  const host = _resolve(mount?.chrome);
  if (host) {
    _moveChrome(chrome, host);
  } else {
    chrome.classList.add('ms-simples-chrome--fixed');
    _moveChrome(chrome, document.body);
  }
}

/**
 * Com MS on o <header> é ocultado; o switch SIMPLES precisa ficar no nav visível (pills).
 * @param {HTMLElement} chrome
 * @param {boolean} modoOn
 */
function _placeChrome(chrome, modoOn, mount) {
  if (!modoOn) {
    _mountChrome(chrome, mount);
    return;
  }

  chrome.classList.remove('ms-simples-chrome--fixed');
  chrome.classList.add('ms-simples-chrome--ms-nav');

  // UX-06: o switch ocupa uma linha própria acima das pills (primeiro filho do nav),
  // em vez de disputar espaço com elas dentro da faixa rolável
  const pillsNav = document.querySelector('[data-ms-pills]');
  if (pillsNav) {
    _moveChrome(chrome, pillsNav, true);
    return;
  }

  const barOnActions = document.querySelector(
    '#ms-session-bar .ms-session-actions',
  );
  if (barOnActions) {
    _moveChrome(chrome, barOnActions);
    return;
  }

  const barInner = document.querySelector(
    '#ms-session-bar .ms-session-bar-inner',
  );
  if (barInner) {
    _moveChrome(chrome, barInner);
    return;
  }

  chrome.classList.add('ms-simples-chrome--fixed');
  _moveChrome(chrome, document.body);
}

function _mountBar(bar, mount) {
  const anchor = _resolve(mount?.bar);
  if (anchor) {
    anchor.insertAdjacentElement('afterend', bar);
    const pills = document.querySelector('[data-ms-pills]');
    if (pills && bar.nextElementSibling !== pills) {
      bar.insertAdjacentElement('afterend', pills);
    }
    return;
  }
  document.body.prepend(bar);
}
