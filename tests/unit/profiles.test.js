/**
 * F7f — perfis de acessibilidade: tabela, aplicar/trocar/desligar, "personalizado",
 * Desligar tudo, persistência (inclui estado antigo sem perfil), um anúncio só, painel.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  PROFILES,
  getProfile,
  profileDiffers,
} from '../../src/core/profiles.js';
import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import { STRINGS } from '../../src/ui/strings.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let inst;

const DEFAULTS = {
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
  muteMedia: false,
  blockFlashing: false,
  strongFocus: false,
  showShortcuts: false,
};
/** o Modo Simples deriva estas duas ao ligar (imagens e linguagem simples) */
const DERIVED_BY_MS = ['hideImages', 'simpleLanguage'];

const MAP = {
  simple: { ms: true, opts: {} },
  lowVision: {
    ms: false,
    opts: {
      textScale: '150',
      colorTheme: 'yellowBlack',
      cursorStyle: 'bigWhite',
      lineHeight: 1.5,
    },
  },
  dyslexia: {
    ms: false,
    opts: {
      dyslexiaFont: true,
      letterSpacing: 0.12,
      wordSpacing: 0.16,
      lineHeight: 1.5,
      readingRuler: true,
    },
  },
  adhd: {
    ms: true,
    opts: { readFocus: true, muteMedia: true, reducedMotion: true },
  },
  epilepsy: {
    ms: false,
    opts: { blockFlashing: true, reducedMotion: true, muteMedia: true },
  },
  keyboard: {
    ms: false,
    opts: { strongFocus: true, readFocus: true, showShortcuts: true },
  },
};

const $ = (s) => document.querySelector(s);
const panel = () =>
  $('#ms-container').shadowRoot.querySelector('#ms-a11y-panel');
const profileBtn = (id) => panel().querySelector(`[data-profile="${id}"]`);

/** chaves que diferem do padrão (menos o que o MS deriva sozinho) */
function changed(ms) {
  const o = state.get().options;
  return Object.fromEntries(
    Object.entries(o).filter(
      ([k, v]) => v !== DEFAULTS[k] && !(ms && DERIVED_BY_MS.includes(k)),
    ),
  );
}

function boot(cfg = { persistence: false }) {
  inst = new ModoSimples(cfg);
  inst.init();
}

beforeEach(() => {
  env = installHappy({
    bodyHtml: '<header>h</header><main><h1>t</h1><p>texto longo '.concat(
      'x'.repeat(400),
      '</p></main>',
    ),
  });
});
afterEach(() => {
  inst?.destroy();
  inst = null;
  env.restore();
});

describe('tabela de perfis', () => {
  it('são 6, congelados, com id único e textos em strings.js', () => {
    assert.deepEqual(
      PROFILES.map((p) => p.id),
      ['simple', 'lowVision', 'dyslexia', 'adhd', 'epilepsy', 'keyboard'],
    );
    assert.ok(
      Object.isFrozen(PROFILES) && Object.isFrozen(PROFILES[0].options),
    );
    for (const p of PROFILES) {
      assert.equal(typeof STRINGS[`profile${p.key}Name`], 'string');
      assert.equal(typeof STRINGS[`profile${p.key}Desc`], 'string');
    }
    assert.equal(getProfile('nope'), null);
  });

  it('só usa chaves de opção que existem no estado e valores dentro dos limites', () => {
    for (const p of PROFILES) {
      for (const k of Object.keys(p.options)) {
        assert.ok(k in state.get().options, `${p.id}: ${k}`);
      }
    }
    const lv = getProfile('lowVision').options;
    assert.equal(lv.lineHeight, 1.5); // WCAG 1.4.12
  });
});

describe('aplicar perfil', () => {
  for (const [id, { ms, opts }] of Object.entries(MAP)) {
    it(`${id}: liga exatamente o mapeado e mais nada`, () => {
      boot();
      inst._applyProfile(id);
      const s = state.get();
      assert.equal(s.activeProfile, id);
      assert.equal(s.profileCustom, false);
      assert.equal(s.modoSimples, ms);
      assert.deepEqual(changed(ms), opts);
    });
  }

  it('um anúncio só ("Perfil X ativado"), sem os anúncios por opção', async () => {
    boot();
    inst._applyProfile('dyslexia');
    await env.wait(120);
    const falas = [...document.querySelectorAll('[data-ms-live]')].map(
      (n) => n.textContent,
    );
    assert.deepEqual(falas, ['Perfil Dislexia ativado']);
  });

  it('perfil com Modo Simples também anuncia uma vez só', async () => {
    boot();
    inst._applyProfile('adhd');
    await env.wait(120);
    const falas = [...document.querySelectorAll('[data-ms-live]')].map(
      (n) => n.textContent,
    );
    assert.deepEqual(falas, ['Perfil TDAH ativado']);
    assert.equal(state.get().modoSimples, true);
  });

  it('trocar de perfil volta ao padrão (inclui Modo Simples desligado) e aplica o novo', () => {
    boot();
    inst._applyProfile('adhd');
    assert.equal(state.get().modoSimples, true);
    inst._applyProfile('lowVision');
    const s = state.get();
    assert.equal(s.activeProfile, 'lowVision');
    assert.equal(s.modoSimples, false);
    assert.deepEqual(changed(false), MAP.lowVision.opts);
    assert.equal(s.options.readFocus, false);
    assert.equal(s.options.muteMedia, false);
  });

  it('clicar no perfil ativo de novo desliga: padrão e sem perfil', () => {
    boot();
    inst._applyProfile('epilepsy');
    inst._applyProfile('epilepsy');
    const s = state.get();
    assert.equal(s.activeProfile, null);
    assert.equal(s.profileCustom, false);
    assert.deepEqual(changed(false), {});
  });

  it('id desconhecido é ignorado', () => {
    boot();
    inst._applyProfile('xyz');
    assert.equal(state.get().activeProfile, null);
  });
});

describe('"personalizado"', () => {
  it('ajuste manual de opção mantém o perfil e marca personalizado', () => {
    boot();
    inst._applyProfile('lowVision');
    assert.equal(state.get().profileCustom, false);
    state.set({ options: { textScale: '175' } });
    assert.equal(state.get().activeProfile, 'lowVision');
    assert.equal(state.get().profileCustom, true);
  });

  it('ligar/desligar o Modo Simples à mão também marca personalizado', () => {
    boot();
    inst._applyProfile('dyslexia');
    inst.enable();
    assert.equal(state.get().profileCustom, true);
  });

  it('o próprio perfil e o SO mexendo em reducedMotion não marcam personalizado', () => {
    boot();
    inst._applyProfile('dyslexia'); // não define reducedMotion: segue o SO
    state.set({ options: { reducedMotion: true } }); // vindo do SO, sem escolha do usuário
    assert.equal(state.get().profileCustom, false);
  });

  it('mexer pelo painel (clique no interruptor) marca personalizado e mostra o rótulo', () => {
    boot();
    inst._applyProfile('dyslexia');
    panel().querySelector('.ms-switch[data-option="highlightLinks"]').click();
    assert.equal(state.get().profileCustom, true);
    const custom = profileBtn('dyslexia').querySelector('.ms-profile-custom');
    assert.equal(custom.hidden, false);
    assert.equal(custom.textContent, 'Personalizado');
  });

  it('profileDiffers: compara o estado com a foto do perfil', () => {
    const base = {
      modoSimples: false,
      options: { a: 1, reducedMotion: false },
    };
    assert.equal(
      profileDiffers(
        base,
        { modoSimples: false, options: { a: 1, reducedMotion: true } },
        false,
      ),
      false,
    );
    assert.equal(
      profileDiffers(
        base,
        { modoSimples: false, options: { a: 1, reducedMotion: true } },
        true,
      ),
      true,
    );
    assert.equal(
      profileDiffers(
        base,
        { modoSimples: true, options: { a: 1, reducedMotion: false } },
        false,
      ),
      true,
    );
  });
});

describe('Desligar tudo e painel', () => {
  it('Desligar tudo limpa o perfil e a marca de personalizado', () => {
    boot();
    inst._applyProfile('keyboard');
    state.set({ options: { textScale: '125' } });
    inst._resetAll();
    const s = state.get();
    assert.equal(s.activeProfile, null);
    assert.equal(s.profileCustom, false);
    assert.deepEqual(changed(false), {});
  });

  it('Desligar tudo com perfil ativo anuncia UMA vez só (QA T152 L1)', async () => {
    boot();
    inst._applyProfile('epilepsy'); // reducedMotion, muteMedia, blockFlashing
    await env.wait(120);
    document.querySelectorAll('[data-ms-live]').forEach((n) => n.remove());
    inst._resetAll();
    await env.wait(120);
    const falas = [...document.querySelectorAll('[data-ms-live]')].map(
      (n) => n.textContent,
    );
    assert.deepEqual(falas, [STRINGS.announceResetAll]);
  });

  it('desligar o Modo Simples pelo cartão após o perfil Modo Simples: nenhum perfil marcado (QA T152 L2)', () => {
    boot();
    profileBtn('simple').click();
    assert.equal(profileBtn('simple').getAttribute('aria-pressed'), 'true');
    panel().querySelector('[data-action="modo-simples"]').click(); // cartão: desliga
    const s = state.get();
    assert.equal(s.modoSimples, false);
    assert.equal(s.activeProfile, null);
    assert.equal(s.profileCustom, false);
    assert.equal(profileBtn('simple').getAttribute('aria-pressed'), 'false');
    assert.equal(
      profileBtn('simple').querySelector('.ms-profile-custom').hidden,
      true,
    );
  });

  it('desfazer só parte do perfil continua "personalizado" (só volta a nenhum perfil se tudo é padrão)', () => {
    boot();
    inst._applyProfile('dyslexia');
    state.set({ options: { readingRuler: false } });
    assert.equal(state.get().activeProfile, 'dyslexia');
    assert.equal(state.get().profileCustom, true);
  });

  it('o painel tem 6 botões aria-pressed no topo; só o ativo fica pressionado', () => {
    boot();
    const botoes = panel().querySelectorAll('[data-profile]');
    assert.equal(botoes.length, 6);
    assert.ok(
      panel()
        .querySelector('.ms-a11y-body')
        .firstElementChild.querySelector('[data-profile]'),
      'perfis são o primeiro bloco do corpo do painel',
    );
    botoes.forEach((b) =>
      assert.equal(b.getAttribute('aria-pressed'), 'false'),
    );
    profileBtn('adhd').click();
    assert.equal(profileBtn('adhd').getAttribute('aria-pressed'), 'true');
    assert.equal(profileBtn('keyboard').getAttribute('aria-pressed'), 'false');
    profileBtn('keyboard').click();
    assert.equal(profileBtn('adhd').getAttribute('aria-pressed'), 'false');
    assert.equal(profileBtn('keyboard').getAttribute('aria-pressed'), 'true');
    profileBtn('keyboard').click(); // de novo: desliga
    assert.equal(profileBtn('keyboard').getAttribute('aria-pressed'), 'false');
  });
});

describe('persistência', () => {
  it('estado antigo (sem perfil) vira nenhum perfil', () => {
    const h = hydratePersistedState({ modoSimples: false, options: {} });
    assert.equal(h.activeProfile, null);
    assert.equal(h.profileCustom, false);
  });

  it('id inválido vira null; "personalizado" sem perfil é descartado', () => {
    const h = hydratePersistedState({
      activeProfile: 'hack',
      profileCustom: true,
      options: {},
    });
    assert.equal(h.activeProfile, null);
    assert.equal(h.profileCustom, false);
  });

  it('perfil + personalizado sobrevivem a recarregar a página', () => {
    boot({ persistence: true });
    inst._applyProfile('dyslexia');
    state.set({ options: { highlightLinks: true } });
    assert.equal(state.get().profileCustom, true);
    inst.destroy();

    inst = new ModoSimples({ persistence: true });
    inst.init();
    const s = state.get();
    assert.equal(s.activeProfile, 'dyslexia');
    assert.equal(s.profileCustom, true);
    assert.equal(s.options.dyslexiaFont, true);
    assert.equal(profileBtn('dyslexia').getAttribute('aria-pressed'), 'true');
  });

  it('perfil sem ajuste continua "não personalizado" depois de recarregar', () => {
    boot({ persistence: true });
    inst._applyProfile('adhd');
    inst.destroy();
    inst = new ModoSimples({ persistence: true });
    inst.init();
    assert.equal(state.get().activeProfile, 'adhd');
    assert.equal(state.get().profileCustom, false);
  });
});
