/**
 * ui/sessionChrome.js
 *
 * Toggle SIMPLES (header) + barra âmbar abaixo do nav.
 * Injetado no light DOM para participar do layout da página.
 */

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
}) {
  const chrome = document.createElement('div');
  chrome.id = 'ms-simples-chrome';
  chrome.className = 'ms-simples-chrome';
  chrome.innerHTML = `
    <div class="ms-simples-chrome-inner">
      <button type="button" class="ms-chrome-icon" data-action="open-panel"
        aria-label="Abrir painel de acessibilidade" title="Acessibilidade">
        ${SLIDERS_ICON}
      </button>
      <div class="ms-simples-toggle-wrap" data-active="false">
        <span class="ms-simples-spark" aria-hidden="true">★</span>
        <div class="ms-simples-toggle-text">
          <strong>SIMPLES</strong>
          <span class="ms-simples-sub" data-sub>Acessibilidade Cognitiva</span>
        </div>
        <button type="button" class="ms-switch ms-chrome-switch" role="switch" aria-checked="false"
          data-action="toggle-simples" aria-label="Ativar Modo Simples">
          <span class="ms-switch-thumb"></span>
        </button>
      </div>
    </div>
  `;

  const bar = document.createElement('div');
  bar.id = 'ms-session-bar';
  bar.className = 'ms-session-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Modo Simples');
  bar.innerHTML = `
    <div class="ms-session-bar-inner" data-state="off">
      <div class="ms-session-off">
        <p><span aria-hidden="true">★</span> Prefere uma navegação mais calma, sem excesso de informações e com textos diretos? Use o interruptor <strong>SIMPLES</strong> no menu.</p>
      </div>
      <div class="ms-session-on" hidden>
        <div class="ms-session-on-top">
          <div class="ms-session-on-title">
            <span aria-hidden="true">★</span>
            <strong>Modo Simples Ativado</strong>
            <span class="ms-session-badge">Foco na Navegação</span>
          </div>
          <p class="ms-session-desc" data-session-desc>
            Exibindo explicações em palavras fáceis, sem termos complicados.
          </p>
        </div>
        <div class="ms-session-actions">
          <button type="button" class="ms-session-btn ms-session-btn--light" data-action="speak" aria-label="Ouvir página">
            <span aria-hidden="true">🔊</span> <span data-speak-label>Ouvir Página</span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="lang" aria-pressed="false" aria-label="Alternar linguagem simples">
            <span aria-hidden="true">📄</span> Linguagem Simples: <span data-lang-label>DESLIGADA</span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="images" aria-pressed="false" aria-label="Mostrar ou ocultar imagens">
            <span aria-hidden="true">🖼</span> Imagens: <span data-images-label>OCULTAS</span>
          </button>
        </div>
      </div>
    </div>
  `;

  _mountChrome(chrome);
  _mountBar(bar);

  chrome.querySelector('[data-action="toggle-simples"]').addEventListener('click', (e) => {
    const on = e.currentTarget.getAttribute('aria-checked') !== 'true';
    onToggleModoSimples(on);
  });
  chrome.querySelector('[data-action="open-panel"]').addEventListener('click', () => onOpenPanel());

  bar.querySelector('[data-action="speak"]').addEventListener('click', () => onSpeak());
  bar.querySelector('[data-action="lang"]').addEventListener('click', (e) => {
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
      sw.setAttribute(
        'aria-label',
        on ? 'Desativar Modo Simples' : 'Ativar Modo Simples',
      );
    }
    if (wrap) wrap.setAttribute('data-active', String(on));
    if (sub) sub.textContent = on ? 'Interface Simplificada' : 'Acessibilidade Cognitiva';

    // Header some com MS on (distração) — reposiciona o mesmo switch no nav de pills
    _placeChrome(chrome, on);

    const inner = bar.querySelector('.ms-session-bar-inner');
    const off = bar.querySelector('.ms-session-off');
    const onBlock = bar.querySelector('.ms-session-on');
    if (inner) inner.setAttribute('data-state', on ? 'on' : 'off');
    if (off) off.hidden = on;
    if (onBlock) onBlock.hidden = !on;

    const langOn = !!s.options?.simpleLanguage;
    const langBtn = bar.querySelector('[data-action="lang"]');
    const langLabel = bar.querySelector('[data-lang-label]');
    const desc = bar.querySelector('[data-session-desc]');
    if (langBtn) {
      langBtn.setAttribute('aria-pressed', String(langOn));
      langBtn.classList.toggle('ms-session-btn--active', langOn);
      langBtn.setAttribute(
        'aria-label',
        langOn ? 'Linguagem simples: ligada' : 'Linguagem simples: desligada',
      );
    }
    if (langLabel) langLabel.textContent = langOn ? 'LIGADA' : 'DESLIGADA';
    if (desc) {
      desc.textContent = langOn
        ? 'Exibindo explicações em palavras fáceis, sem termos complicados.'
        : 'Navegação mais calma, com botões claros e menos distrações.';
    }

    const hideImgs = !!s.options?.hideImages;
    const imgBtn = bar.querySelector('[data-action="images"]');
    const imgLabel = bar.querySelector('[data-images-label]');
    if (imgBtn) {
      imgBtn.setAttribute('aria-pressed', String(!hideImgs));
      imgBtn.classList.toggle('ms-session-btn--active', !hideImgs);
      imgBtn.setAttribute(
        'aria-label',
        hideImgs ? 'Mostrar imagens' : 'Ocultar imagens',
      );
    }
    if (imgLabel) imgLabel.textContent = hideImgs ? 'OCULTAS' : 'VISÍVEIS';

    if (ui.speaking !== undefined) {
      const speakBtn = bar.querySelector('[data-action="speak"]');
      const speakLabel = bar.querySelector('[data-speak-label]');
      if (speakBtn) {
        speakBtn.classList.toggle('ms-session-btn--speaking', ui.speaking);
        speakBtn.setAttribute(
          'aria-label',
          ui.speaking ? 'Parar leitura da página' : 'Ouvir página',
        );
      }
      if (speakLabel) speakLabel.textContent = ui.speaking ? 'Parar Voz' : 'Ouvir Página';
    }
  }

  function destroy() {
    chrome.remove();
    bar.remove();
  }

  return { sync, destroy };
}

function _mountChrome(chrome) {
  chrome.classList.remove('ms-simples-chrome--ms-nav', 'ms-simples-chrome--fixed');
  const host =
    document.querySelector('.site-header .header-inner') ||
    document.querySelector('.cabecalho') ||
    document.querySelector('header .fx.bg27') ||
    document.querySelector('header');
  if (host) {
    host.appendChild(chrome);
  } else {
    chrome.classList.add('ms-simples-chrome--fixed');
    document.body.appendChild(chrome);
  }
}

/**
 * Com MS on o <header> é ocultado; o switch SIMPLES precisa ficar no nav visível (pills).
 * @param {HTMLElement} chrome
 * @param {boolean} modoOn
 */
function _placeChrome(chrome, modoOn) {
  if (!modoOn) {
    _mountChrome(chrome);
    return;
  }

  chrome.classList.remove('ms-simples-chrome--fixed');
  chrome.classList.add('ms-simples-chrome--ms-nav');

  const pillsInner =
    document.querySelector('[data-ms-pills] .ms-pills-nav__inner') ||
    document.querySelector('[data-ms-pills]');
  if (pillsInner) {
    pillsInner.appendChild(chrome);
    return;
  }

  const barOnActions = document.querySelector('#ms-session-bar .ms-session-actions');
  if (barOnActions) {
    barOnActions.appendChild(chrome);
    return;
  }

  const barInner = document.querySelector('#ms-session-bar .ms-session-bar-inner');
  if (barInner) {
    barInner.appendChild(chrome);
    return;
  }

  chrome.classList.add('ms-simples-chrome--fixed');
  document.body.appendChild(chrome);
}

function _mountBar(bar) {
  const header = document.querySelector('header.site-header') || document.querySelector('header');
  if (header) {
    header.insertAdjacentElement('afterend', bar);
    const pills = document.querySelector('[data-ms-pills]');
    if (pills && bar.nextElementSibling !== pills) {
      bar.insertAdjacentElement('afterend', pills);
    }
    return;
  }

  const nav =
    document.querySelector('nav[aria-label="Menu principal"]') ||
    document.querySelector('.cabecalho__nav') ||
    document.querySelector('nav');
  if (nav) {
    nav.insertAdjacentElement('afterend', bar);
    return;
  }
  document.body.prepend(bar);
}
