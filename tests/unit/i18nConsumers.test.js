/**
 * Idioma nos consumidores do core/features: boot e troca de idioma, voz (TTS + reconhecimento),
 * gramática dos comandos de voz, layout do teclado virtual, anúncios, textos de features.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { setLocale, getLocale, t } from '../../src/i18n/index.js';
import { applyVoice, listVoices } from '../../src/features/voice.js';
import { parseCommand } from '../../src/features/voiceCommands.js';
import {
  KEYBOARD_ID,
  openVirtualKeyboard,
  closeVirtualKeyboard,
} from '../../src/features/virtualKeyboard.js';
import { diffStateAnnouncements } from '../../src/core/announcements.js';
import { getShortcuts } from '../../src/i18n/index.js';
import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import defaults from '../../src/config/defaults.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
const V = (name, lang) => ({ name, lang });

beforeEach(() => {
  env = installHappy({ bodyHtml: '<main><input id="t" type="text" /></main>' });
  setLocale('pt');
});
afterEach(() => {
  closeVirtualKeyboard({ silent: true });
  setLocale('pt');
  delete globalThis.speechSynthesis;
  delete globalThis.SpeechSynthesisUtterance;
  env.restore();
});

describe('voz (TTS) segue o idioma', () => {
  beforeEach(() => {
    globalThis.SpeechSynthesisUtterance = class {};
    globalThis.speechSynthesis = {
      getVoices: () => [
        V('Zed', 'fr-FR'),
        V('Alex', 'en-GB'),
        V('Sam', 'en-US'),
        V('Luciana', 'pt-BR'),
        V('Lucia', 'es-ES'),
        V('Mex', 'es-MX'),
      ],
    };
  });

  for (const [loc, lang, voice] of [
    ['pt', 'pt-BR', 'Luciana'],
    ['en', 'en-US', 'Sam'],
    ['es', 'es-ES', 'Lucia'],
  ]) {
    it(`${loc}: utterance.lang=${lang} e voz padrão da região exata`, () => {
      setLocale(loc);
      const utt = {};
      applyVoice(utt, {});
      assert.equal(utt.lang, lang);
      assert.equal(utt.voice.name, voice);
    });
  }

  it('sem a região exata, usa outra voz do idioma; a lista põe o idioma primeiro', () => {
    setLocale('en');
    assert.deepEqual(
      listVoices().map((v) => v.name),
      ['Sam', 'Alex', 'Lucia', 'Luciana', 'Mex', 'Zed'],
    );
    globalThis.speechSynthesis.getVoices = () => [
      V('Zed', 'fr-FR'),
      V('Alex', 'en-GB'),
    ];
    const utt = {};
    applyVoice(utt, {});
    assert.equal(utt.voice.name, 'Alex');
  });

  it('voz escolhida pela pessoa vence o idioma', () => {
    setLocale('en');
    const utt = {};
    applyVoice(utt, { voiceName: 'Luciana' });
    assert.equal(utt.voice.name, 'Luciana');
    assert.equal(utt.lang, 'en-US');
  });
});

describe('gramática dos comandos de voz', () => {
  const casos = {
    pt: {
      'desligar modo simples': 'msOff',
      'ligar modo simples': 'msOn',
      'mais rápido': 'faster',
      'ler página': 'read',
    },
    en: {
      'turn off simple mode': 'msOff',
      'turn on simple mode': 'msOn',
      'open panel': 'panelOpen',
      'close panel': 'panelClose',
      faster: 'faster',
      slower: 'slower',
      'scroll down': 'scrollDown',
      'scroll up': 'scrollUp',
      pause: 'pause',
      resume: 'resume',
      stop: 'stop',
      help: 'help',
      'read page': 'read',
    },
    es: {
      'desactivar modo simple': 'msOff',
      'activar modo simple': 'msOn',
      'abrir panel': 'panelOpen',
      'cerrar panel': 'panelClose',
      'más rápido': 'faster',
      'más lento': 'slower',
      bajar: 'scrollDown',
      subir: 'scrollUp',
      pausar: 'pause',
      continuar: 'resume',
      parar: 'stop',
      ayuda: 'help',
      'leer página': 'read',
    },
  };

  for (const [loc, tabela] of Object.entries(casos)) {
    it(`${loc}: reconhece os comandos`, () => {
      setLocale(loc);
      for (const [fala, acao] of Object.entries(tabela)) {
        assert.deepEqual(parseCommand(fala), { action: acao }, fala);
      }
    });
  }

  it('comando de outro idioma não vale; fala longa também não', () => {
    setLocale('en');
    assert.equal(parseCommand('desligar modo simples'), null);
    assert.equal(parseCommand('please read the whole page right now'), null);
    setLocale('es');
    assert.equal(parseCommand('turn off simple mode'), null);
  });

  it('as listas mostradas no painel (panelVcCommands) são reconhecidas em cada idioma', () => {
    for (const loc of ['pt', 'en', 'es']) {
      setLocale(loc);
      for (const fala of t('panelVcCommands').split('|')) {
        assert.ok(parseCommand(fala), `${loc}: "${fala}"`);
      }
    }
  });
});

describe('teclado virtual por idioma', () => {
  const keys = () =>
    [...document.querySelectorAll(`#${KEYBOARD_ID} [data-vk]`)].map((k) =>
      k.getAttribute('data-vk'),
    );

  it('pt: ABNT2 com ç, AltGr e teclas mortas', () => {
    openVirtualKeyboard();
    const k = keys();
    assert.ok(k.includes('ç') && k.includes('AltGr') && k.includes('~^'));
  });

  it('en: QWERTY US, sem ç, AltGr nem teclas mortas', () => {
    setLocale('en');
    openVirtualKeyboard();
    const k = keys();
    assert.ok(k.includes('q') && k.includes('\'"') && k.includes('`~'));
    assert.ok(!k.includes('ç') && !k.includes('AltGr'));
    // a crase do US é um caractere normal, não tecla morta
    document.querySelector(`#${KEYBOARD_ID} [data-vk="\`~"]`).click();
    assert.equal(
      document.querySelector(`#${KEYBOARD_ID} [data-pending]`)?.textContent ??
        '',
      '',
    );
  });

  it('es: ñ, ç, ¡¿ e AltGr', () => {
    setLocale('es');
    openVirtualKeyboard();
    const k = keys();
    assert.ok(k.includes('ñ') && k.includes('ç') && k.includes('¡¿'));
    assert.ok(k.includes('AltGr'));
  });

  it('rótulos das teclas seguem o idioma', () => {
    setLocale('en');
    openVirtualKeyboard();
    const label = document
      .querySelector(`#${KEYBOARD_ID} [data-vk="Backspace"]`)
      .getAttribute('aria-label');
    assert.equal(label, t('vkBackspace'));
    assert.equal(label, 'Delete');
  });
});

describe('anúncios por idioma', () => {
  const prev = { options: {} };
  const next = (o) => ({ options: o });

  it('pt mantém os textos de sempre', () => {
    assert.deepEqual(
      diffStateAnnouncements(prev, next({ highlightLinks: true })),
      ['Destaque de links ativado'],
    );
  });

  it('en e es traduzem toggles, tamanho, tema, saturação, cursor e cor', () => {
    const o = {
      readingRuler: true,
      highlightLinks: true,
      textScale: '150',
      colorTheme: 'darkHigh',
      colorSaturation: 'low',
      cursorStyle: 'bigWhite',
      customText: '#112233',
    };
    setLocale('en');
    assert.deepEqual(diffStateAnnouncements(prev, next(o)), [
      'Reading ruler on',
      'Link highlight on',
      'Text size 150%',
      'Theme High Dark Mode',
      'Saturation low',
      'Cursor large white',
      'Custom text color #112233',
    ]);
    setLocale('es');
    assert.deepEqual(diffStateAnnouncements(prev, next(o)), [
      'Regla de lectura activada',
      'Resaltado de enlaces activado',
      'Tamaño del texto 150%',
      'Tema Modo Oscuro Alto',
      'Saturación baja',
      'Cursor grande blanco',
      'Color personalizado de texto #112233',
    ]);
  });

  it('valor desconhecido de tema volta como veio', () => {
    setLocale('en');
    assert.deepEqual(
      diffStateAnnouncements(prev, next({ colorTheme: 'xyz' })),
      ['Theme xyz'],
    );
  });
});

describe('boot e troca de idioma', () => {
  it('init aplica o idioma salvo; trocar a opção emite ms:localechange', () => {
    const inst = new ModoSimples();
    state.set({ options: { language: 'es' } });
    const seen = [];
    document.addEventListener('ms:localechange', (e) => seen.push(e.detail));
    inst._loadPersistedState = () => {}; // mantém o idioma definido acima
    inst.init();
    assert.equal(getLocale(), 'es');
    state.set({ options: { language: 'en' } });
    assert.equal(getLocale(), 'en');
    assert.deepEqual(seen.at(-1), { locale: 'en', preference: 'en' });
    state.set({ options: { language: 'auto' } });
    assert.equal(getLocale(), 'pt'); // html lang="pt-BR"
    inst.destroy();
    state.set({ options: { language: 'auto' } });
  });

  it('textos de features, atalhos, brand e nav seguem o idioma', () => {
    setLocale('en');
    assert.equal(getShortcuts()[0].text, 'Open the accessibility panel');
    assert.equal(defaults.brand.title, 'Digital Accessibility');
    assert.equal(defaults.brand.footer, 'Preferences saved in this browser');
    setLocale('pt');
    assert.equal(defaults.brand.title, 'Acessibilidade Digital');
  });
});
