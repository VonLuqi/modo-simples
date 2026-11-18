/**
 * src/ui/binding.js — ligação da UI (FAB, painel, barra de sessão, eventos globais) ao ModoSimples.
 *
 * Funções que operam em nome de uma instância `ms` (usam ms._config, ms._panel, ms._fab, ...).
 * A classe ModoSimples mantém os métodos _xxx como delegates de uma linha para cá.
 */

import state from '../core/state.js';
import eventBus from '../core/eventBus.js';
import persistence from '../core/persistence.js';
import { announce } from '../utils/aria.js';
import { getUIStyles } from './styles.js';
import { createFab } from './fab.js';
import { createA11yPanel } from './a11yPanel.js';
import { createSessionChrome } from './sessionChrome.js';
import { createSimpleNav } from '../features/simpleNav.js';
import {
  speakMainContent,
  stopSpeaking,
  isSpeaking,
  onSpeakingChange,
} from '../features/tts.js';
import { isManualSelectActive } from '../features/manualSelect.js';
import { placeShortcutsCard } from '../features/shortcutsCard.js';
import { jumpToElement } from '../features/pageOutline.js';
import { openMouseGrid, closeMouseGrid } from '../features/mouseGrid.js';
import {
  openVirtualKeyboard,
  closeVirtualKeyboard,
} from '../features/virtualKeyboard.js';
import { STRINGS_T as S } from './strings.js';
import { getLocale, BCP47 } from '../i18n/index.js';
import { getProfile } from '../core/profiles.js';

/** Valores iniciais das opções (espelha core/state.js) — alvo do "Desligar tudo". */
export const RESET_OPTIONS = {
  textScale: '100',
  colorTheme: 'senac',
  colorSaturation: 'normal',
  customText: '',
  customHeading: '',
  customBg: '',
  dyslexiaFont: false,
  readingRuler: false,
  highlightLinks: false,
  highlightHeadings: false,
  highlightControls: false,
  enlargeTargets: false,
  textMagnifier: false,
  textSpacing: false,
  lineHeight: 0,
  wordSpacing: 0,
  letterSpacing: 0,
  cursorStyle: 'default',
  reducedMotion: false,
  hideImages: false,
  simpleLanguage: false,
  readFocus: false,
  blockFlashing: false,
  strongFocus: false,
  showShortcuts: false,
  muteMedia: false,
  voiceName: '',
  voiceCommands: false,
  voiceCloudConsent: false,
  voiceRate: 1,
  voicePitch: 1,
  voiceVolume: 1,
};

/** "Redefinir fonte": só as opções de tipografia (F8b). */
const FONT_KEYS = [
  'textScale',
  'dyslexiaFont',
  'textSpacing',
  'lineHeight',
  'wordSpacing',
  'letterSpacing',
];

/** Alvo do atalho/teclado é campo editável (inclui dentro de shadow DOM)? */
function isEditableTarget(e) {
  const t =
    typeof e.composedPath === 'function' ? e.composedPath()[0] : e.target;
  return !!(
    t &&
    (t.isContentEditable ||
      (t.matches &&
        t.matches(
          'input, select, textarea, [contenteditable]:not([contenteditable="false"])',
        )))
  );
}

export function buildUI(ms) {
  ms._host = document.createElement('div');
  ms._host.id = 'ms-container';
  document.body.appendChild(ms._host);

  ms._shadow = ms._host.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = getUIStyles(ms._config.position);
  ms._shadow.appendChild(styleEl);
  ms._styleEl = styleEl;

  ms._host.lang = BCP47[getLocale()];
  mountPanelAndFab(ms);
  const s = state.get();

  ms._syncSessionChrome();

  ms._simpleNav = createSimpleNav();
  ms._syncSimpleNav();
  // Reposiciona SIMPLES após pills (MS on some com o header)
  if (ms._chrome) ms._chrome.sync(s);
}

/** Cria painel + FAB no shadow root (primeira montagem e a cada troca de idioma). */
function mountPanelAndFab(ms) {
  const s = state.get();

  ms._panel = createA11yPanel({
    state: s,
    onClose: () => ms._closePanel(),
    onToggleModoSimples: (value) => ms._setModoSimples(value),
    onSetOption: (key, value) => {
      if (key === 'reducedMotion') ms._reducedMotionUser = !!value;
      state.set({ options: { [key]: value } });
      if (key === 'hideImages' && state.get().modoSimples) {
        ms._savePreferShowImages(!value);
      }
    },
    onSpeak: () => ms._toggleSpeak(),
    onResetAll: () => ms._resetAll(),
    onSelectProfile: (id) => ms._applyProfile(id),
    onResetFont: () => {
      state.set({
        options: Object.fromEntries(
          FONT_KEYS.map((k) => [k, RESET_OPTIONS[k]]),
        ),
      });
      announce(S.announceResetFont); // depois dos anúncios por opção: é o que fica no aria-live
    },
    onMoveSide: () => ms._movePanelSide(),
    // F9c: o painel é modal (página inert): fecha o painel antes de mover o foco para o alvo
    onOutlineJump: (el) => {
      ms._closePanel();
      jumpToElement(el);
    },
    // F9d: fecha o painel (devolve o foco ao FAB) e abre a grade; Esc volta a esse foco
    onOpenMouseGrid: () => {
      ms._closePanel();
      openMouseGrid();
    },
    // F9e: fecha o painel e liga o teclado virtual (sessão; dock no rodapé)
    onOpenVirtualKeyboard: () => {
      ms._closePanel();
      openVirtualKeyboard();
    },
    brand: ms._config.brand,
  });
  ms._shadow.appendChild(ms._panel.element);

  ms._fab = createFab({
    onClick: () => ms._togglePanel(),
    onHide: () => ms._hideWidget(),
  });
  ms._shadow.appendChild(ms._fab.element);
  ms._side = ms._loadPanelSide();
  ms._fab.setSide(ms._side);
  ms._panel.setSide(ms._side);

  ms._fab.sync({ panelOpen: s.panelOpen });
  ms._panel.sync(s);
  if (s.panelOpen) {
    ms._panel.open();
    ms._setPageInert(true);
  }
}

/**
 * Troca de idioma: refaz painel, FAB e barra de sessão com os textos novos. O painel aberto
 * continua aberto e o foco volta ao seletor de idioma (que acabou de ser usado).
 */
export function rebuildUI(ms) {
  if (!ms._host?.isConnected) return;
  const wasOpen = state.get().panelOpen;
  // foco dentro do painel: solta antes de remover o elemento (o navegador também faria isso)
  const focused = ms._shadow.activeElement;
  const hadFocus = !!focused && ms._panel.element.contains(focused);
  if (hadFocus) focused.blur();
  ms._host.lang = BCP47[getLocale()];
  ms._panel.close(); // solta a armadilha de foco do painel antigo
  ms._panel.element.remove();
  ms._fab.element.remove();
  mountPanelAndFab(ms);
  if (ms._chrome) {
    ms._chrome.destroy();
    ms._chrome = null;
    ms._syncSessionChrome();
  }
  if (wasOpen && hadFocus) {
    ms._panel.element.querySelector('[data-language]')?.focus();
  }
}

/** Escuta 'ms:localechange' e refaz a UI. @returns {() => void} remove o listener */
function bindLocaleChange(ms) {
  const onChange = () => rebuildUI(ms);
  document.addEventListener('ms:localechange', onChange);
  return () => document.removeEventListener('ms:localechange', onChange);
}

/** Cria/destrói a barra de sessão conforme config.sessionBar (default: desligada). */
export function syncSessionChrome(ms) {
  if (ms._config.sessionBar && !ms._chrome) {
    ms._chrome = createSessionChrome({
      mount: ms._config.mount || {},
      onToggleModoSimples: (value) => ms._setModoSimples(value),
      onOpenPanel: () => ms._openPanel(),
      onSpeak: () => ms._toggleSpeak(),
      onToggleSimpleLanguage: (value) =>
        state.set({ options: { simpleLanguage: value } }),
      onToggleHideImages: (hide) => {
        state.set({ options: { hideImages: hide } });
        if (state.get().modoSimples) ms._savePreferShowImages(!hide);
      },
    });
    ms._chrome.sync(state.get());
  } else if (!ms._config.sessionBar && ms._chrome) {
    ms._chrome.destroy();
    ms._chrome = null;
  }
}

export function syncSimpleNav(ms) {
  if (!ms._simpleNav) return;
  ms._simpleNav.sync(ms._config.simpleNav);
  if (ms._chrome) ms._chrome.sync(state.get());
}

export function bindEvents(ms) {
  ms._onDocKeydown = (e) => {
    // Alt+Shift+A: mostra o FAB escondido e abre o painel (ignorado ao digitar em campos)
    if (
      e.altKey &&
      e.shiftKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.repeat &&
      e.code === 'KeyA' &&
      !isEditableTarget(e)
    ) {
      e.preventDefault();
      ms._showWidget();
      return;
    }
    // Alt+Shift+G: abre a grade de mouse (F9d); fecha o painel se estiver aberto
    if (
      e.altKey &&
      e.shiftKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.repeat &&
      e.code === 'KeyG' &&
      !isEditableTarget(e)
    ) {
      e.preventDefault();
      if (state.get().panelOpen) ms._closePanel();
      openMouseGrid();
      return;
    }
    if (e.key === 'Escape' && state.get().panelOpen) {
      ms._closePanel(); // devolve o foco a quem abriu (UX-12)
    }
  };
  document.addEventListener('keydown', ms._onDocKeydown);

  ms._onDocClick = (e) => {
    if (!state.get().panelOpen) return;
    if (isManualSelectActive()) return; // o clique é da seleção manual: consumido uma vez (IMP-29)
    if (e.target?.closest?.('#ms-low-confidence-notice')) return; // aviso da lib (UX-21): não é clique fora
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    if (
      path.includes(ms._host) ||
      path.includes(ms._panel?.element) ||
      path.includes(ms._fab?.element)
    ) {
      return;
    }
    // Clicks that land on the host (open shadow) still include host in composedPath
    if (e.target === ms._host) return;
    if (!ms._host?.contains(e.target) && e.target !== ms._host) {
      // o inert faz o clique cair no body: fecha e repassa o clique ao elemento que estava
      // sob o ponteiro (senão o primeiro clique no doc é engolido)
      const { clientX, clientY } = e;
      const retargeted =
        e.target === document.body || e.target === document.documentElement;
      ms._closePanel();
      if (retargeted && e.isTrusted && e.detail > 0) {
        const alvo = document.elementFromPoint(clientX, clientY);
        if (
          alvo &&
          alvo !== document.body &&
          alvo !== document.documentElement
        ) {
          alvo.click();
          // click() sintético não dá foco: campo de formulário recebe foco no lugar do FAB
          if (
            alvo.matches(
              'input, select, textarea, [contenteditable]:not([contenteditable="false"])',
            )
          ) {
            alvo.focus();
          }
        }
      }
    }
  };
  document.addEventListener('click', ms._onDocClick, true);

  const removeState = eventBus.on('stateChange', ({ prev, next }) => {
    ms._onStateChange(prev, next);
  });
  const removeLocale = bindLocaleChange(ms);
  // destroy() chama _removeStateListener: leva junto o listener de idioma
  ms._removeStateListener = () => {
    removeState();
    removeLocale();
  };

  // Estado "lendo/parado" da UI vem dos eventos do tts: sem polling (IMP-25)
  ms._removeSpeakListener = onSpeakingChange((speaking) =>
    ms._syncSpeaking(speaking),
  );
}

export function togglePanel(ms) {
  state.get().panelOpen ? ms._closePanel() : ms._openPanel();
}

export function openPanel(ms) {
  // Quem abriu (FAB ou ícone do chrome, este no light DOM): é para onde o foco volta ao fechar
  let opener = document.activeElement;
  while (opener?.shadowRoot?.activeElement) {
    opener = opener.shadowRoot.activeElement;
  }
  if (opener !== document.body && !ms._panel.element.contains(opener)) {
    ms._panelOpener = opener;
  }
  state.set({ panelOpen: true });
  ms._panel.open();
  ms._setPageInert(true);
  ms._fab.sync({ panelOpen: true });
  announce(S.announcePanelOpen);
}

/**
 * aria-modal não esconde a página de ninguém: enquanto o painel está aberto, os irmãos do
 * host no <body> ficam `inert` (sem foco, clique ou leitura). Só desfaz o que ela mesma fez.
 * @param {boolean} on
 */
export function setPageInert(ms, on) {
  ms._inertObserver?.disconnect();
  ms._inertObserver = null;
  for (const el of ms._inerted || []) el.removeAttribute('inert');
  ms._inerted = [];
  if (!on) return;
  for (const el of document.body.children) ms._inertSibling(el);
  // filhos do body que chegam com o painel aberto (toast, modal do site) também ficam inert
  ms._inertObserver = new MutationObserver((records) => {
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (n.nodeType === 1) ms._inertSibling(n);
      }
    }
  });
  ms._inertObserver.observe(document.body, { childList: true });
}

export function inertSibling(ms, el) {
  // fora do inert: o host, o que já era inert, regiões aria-live do site (o leitor de tela
  // ainda precisa anunciá-las) e os nós da própria lib que precisam continuar vivos
  // (anúncios de leitor de tela, seleção manual)
  if (
    el === ms._host ||
    el.hasAttribute('inert') ||
    el.hasAttribute('aria-live') ||
    el.hasAttribute('data-ms-live') ||
    el.id === 'ms-shortcuts-card' || // cartão de atalhos: "Fechar" precisa responder com o painel aberto
    el.id === 'ms-manual-select-banner' ||
    el.id === 'ms-manual-select-highlight'
  ) {
    return;
  }
  el.setAttribute('inert', '');
  ms._inerted.push(el);
}

export function closePanel(ms) {
  state.set({ panelOpen: false });
  ms._panel.close();
  ms._setPageInert(false);
  ms._fab.sync({ panelOpen: false });
  // Botão X, clique fora ou Esc: o foco volta ao opener (sem roubá-lo da seleção manual)
  if (!isManualSelectActive()) {
    const opener = ms._panelOpener?.isConnected
      ? ms._panelOpener
      : ms._fab?.button;
    opener?.focus?.();
  }
  ms._panelOpener = null;
}

export function toggleSpeak() {
  // a UI acompanha por onSpeakingChange (ver _bindEvents)
  if (isSpeaking()) {
    stopSpeaking();
    announce(S.announceReadStopped);
  } else {
    speakMainContent();
    announce(S.announceReadStart);
  }
}

export function syncSpeaking(ms, speaking) {
  const s = state.get();
  if (ms._panel) ms._panel.sync(s, { speaking });
  if (ms._chrome) ms._chrome.sync(s, { speaking });
}

/** Desliga o Modo Simples e volta todas as opções ao padrão; o estado resultante é persistido. */
export function resetAll(ms) {
  ms._panel?.closeOutline?.();
  closeMouseGrid({ restoreFocus: false });
  closeVirtualKeyboard();
  ms._reducedMotionUser = null; // volta a seguir o SO (padrão)
  // um anúncio só ("Tudo desligado"): sem os por opção nem o "Modo Simples desativado" (QA T152 L1)
  ms._applyingProfile = true;
  try {
    if (state.get().modoSimples) ms._setModoSimples(false);
    state.set({
      activeProfile: null,
      profileCustom: false,
      options: { ...RESET_OPTIONS },
    });
    ms._syncReducedMotion();
  } finally {
    ms._applyingProfile = false;
  }
  // página como sem o widget: também esquece a preferência "mostrar imagens no Modo Simples"
  if (ms._config.persistence) {
    if (ms._config.hostnamePersistence) {
      persistence.removeForHost('preferShowImagesInMs');
    } else {
      persistence.remove('preferShowImagesInMs');
    }
  }
  announce(S.announceResetAll);
}

/**
 * F7f: aplica um perfil (ou desliga o ativo ao clicar nele de novo). Troca de perfil = volta ao
 * padrão (inclui Modo Simples desligado) e aplica o novo; um único anúncio no fim.
 */
export function applyProfile(ms, id) {
  const turnOff = state.get().activeProfile === id;
  const prof = turnOff ? null : getProfile(id);
  if (!turnOff && !prof) return;
  ms._applyingProfile = true; // sem anúncio por opção nem marca de "personalizado" no meio
  try {
    ms._reducedMotionUser = prof?.options.reducedMotion ? true : null;
    if (state.get().modoSimples) ms._setModoSimples(false);
    const {
      voiceName,
      voiceRate,
      voicePitch,
      voiceVolume,
      voiceCommands,
      voiceCloudConsent,
      language,
    } = state.get().options; // voz e idioma não fazem parte de perfil: troca de perfil os mantém
    state.set({
      activeProfile: prof ? prof.id : null,
      profileCustom: false,
      options: {
        ...RESET_OPTIONS,
        voiceName,
        voiceRate,
        voicePitch,
        voiceVolume,
        voiceCommands,
        voiceCloudConsent,
        language,
        ...(prof ? prof.options : {}),
      },
    });
    ms._syncReducedMotion();
    if (prof?.modoSimples) ms._setModoSimples(true);
  } finally {
    ms._applyingProfile = false;
  }
  ms._profileBaseline = state.get();
  announce(
    prof
      ? `${S.profileOnPre}${S[`profile${prof.key}Name`]}${S.profileOnPost}`
      : S.profileOff,
  );
}

/** Alterna esquerda/direita; FAB e painel vão juntos e o lado fica salvo. */
export function movePanelSide(ms) {
  ms._side = ms._side === 'left' ? 'right' : 'left';
  ms._fab.setSide(ms._side);
  ms._panel.setSide(ms._side);
  ms._savePanelSide(ms._side);
  placeShortcutsCard(ms._shortcutsSide());
  announce(ms._side === 'left' ? S.announceSideLeft : S.announceSideRight);
}

/** Esconde o FAB só nesta página (sem persistir); o foco vai para o conteúdo principal. */
export function hideWidget(ms) {
  if (state.get().panelOpen) ms._closePanel();
  ms._fab.setHidden(true);
  const main = document.querySelector('main, [role="main"]');
  if (main) {
    const had = main.hasAttribute('tabindex');
    if (!had) main.setAttribute('tabindex', '-1');
    main.addEventListener(
      'blur',
      () => {
        if (!had) main.removeAttribute('tabindex');
      },
      { once: true },
    );
    main.focus({ preventScroll: true });
  } else {
    document.activeElement?.blur?.();
  }
  announce(S.announceWidgetHidden);
}

/** Atalho: reexibe o FAB e abre o painel (foco vai para o painel). */
export function showWidget(ms) {
  ms._fab.setHidden(false);
  if (!state.get().panelOpen) ms._openPanel();
}
