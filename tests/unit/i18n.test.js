/**
 * i18n core: ordem de resolução, fallback, paridade de chaves pt/en/es, evento de troca
 * e a opção `language` no estado persistido.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  t,
  getLocale,
  resolveLocale,
  setLocale,
  getShortcuts,
  SUPPORTED,
  BCP47,
} from '../../src/i18n/index.js';
import * as pt from '../../src/i18n/pt.js';
import * as en from '../../src/i18n/en.js';
import * as es from '../../src/i18n/es.js';
import { STRINGS, SHORTCUTS } from '../../src/ui/strings.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import state from '../../src/core/state.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
const setNavigatorLanguage = (lang) =>
  Object.defineProperty(globalThis, 'navigator', {
    value: { language: lang },
    configurable: true,
    writable: true,
  });
const navDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

beforeEach(() => {
  env = installHappy({ bodyHtml: '' });
  setNavigatorLanguage('fr-FR');
});
afterEach(() => {
  setLocale('pt');
  if (navDescriptor)
    Object.defineProperty(globalThis, 'navigator', navDescriptor);
  else delete globalThis.navigator;
  env.restore();
});

describe('i18n — resolveLocale', () => {
  it('escolha manual vence o site e o navegador', () => {
    document.documentElement.setAttribute('lang', 'es');
    setNavigatorLanguage('en-US');
    assert.equal(resolveLocale('pt'), 'pt');
    assert.equal(resolveLocale('en'), 'en');
  });

  it('auto: html[lang] vence navigator.language', () => {
    document.documentElement.setAttribute('lang', 'es-MX');
    setNavigatorLanguage('en-US');
    assert.equal(resolveLocale('auto'), 'es');
  });

  it('auto: sem lang suportado no site, usa navigator.language', () => {
    document.documentElement.setAttribute('lang', 'fr');
    setNavigatorLanguage('en-GB');
    assert.equal(resolveLocale('auto'), 'en');
    document.documentElement.removeAttribute('lang');
    assert.equal(resolveLocale('auto'), 'en');
  });

  it('auto: nada suportado cai em pt; valor desconhecido conta como auto', () => {
    assert.equal(resolveLocale('auto'), 'pt');
    assert.equal(resolveLocale('xx'), 'pt');
    document.documentElement.setAttribute('lang', 'en');
    assert.equal(resolveLocale('xx'), 'en');
  });

  it('SUPPORTED e BCP47', () => {
    assert.deepEqual([...SUPPORTED], ['pt', 'en', 'es']);
    assert.deepEqual({ ...BCP47 }, { pt: 'pt-BR', en: 'en-US', es: 'es-ES' });
  });
});

describe('i18n — t() e fallback', () => {
  it('começa em pt e traduz conforme o locale', () => {
    assert.equal(getLocale(), 'pt');
    assert.equal(t('stateOn'), 'Ligado');
    setLocale('en');
    assert.equal(t('stateOn'), 'On');
    setLocale('es');
    assert.equal(t('stateOn'), 'Activado');
  });

  it('chaves de voz também resolvem', () => {
    setLocale('en');
    assert.equal(t('status_stopped'), 'Voice commands off.');
  });

  it('chave inexistente devolve a própria chave', () => {
    setLocale('en');
    assert.equal(t('chave.que.nao.existe'), 'chave.que.nao.existe');
  });

  it('interpola {vars} e mantém o marcador sem valor', () => {
    setLocale('pt');
    // usa o motor direto numa chave inexistente: o fallback é a própria chave com {vars}
    assert.equal(t('Olá {nome}, {n}!', { nome: 'Ana', n: 2 }), 'Olá Ana, 2!');
    assert.equal(t('Olá {nome}', {}), 'Olá {nome}');
  });
});

describe('i18n — paridade de chaves', () => {
  const keys = (o) => Object.keys(o).sort();

  it('STRINGS: en e es têm exatamente as chaves do pt, todas não vazias', () => {
    for (const [name, loc] of [
      ['en', en],
      ['es', es],
    ]) {
      assert.deepEqual(keys(loc.STRINGS), keys(pt.STRINGS), name);
      for (const k of keys(loc.STRINGS)) {
        assert.equal(typeof loc.STRINGS[k], 'string', `${name}.${k}`);
        assert.ok(loc.STRINGS[k].length > 0, `${name}.${k}`);
      }
    }
  });

  it('VOICE_CMD_STRINGS: mesmas chaves', () => {
    assert.deepEqual(keys(en.VOICE_CMD_STRINGS), keys(pt.VOICE_CMD_STRINGS));
    assert.deepEqual(keys(es.VOICE_CMD_STRINGS), keys(pt.VOICE_CMD_STRINGS));
  });

  it('SHORTCUTS: mesma quantidade; teclas iguais exceto o nome da barra de espaço', () => {
    for (const loc of [en, es]) {
      assert.equal(loc.SHORTCUTS.length, pt.SHORTCUTS.length);
      loc.SHORTCUTS.forEach((s, i) => {
        assert.ok(s.text.length > 0);
        if (pt.SHORTCUTS[i].keys !== 'Espaço') {
          assert.equal(s.keys, pt.SHORTCUTS[i].keys);
        }
      });
    }
  });

  it('listas de comandos de voz têm o mesmo número de itens e o mesmo nº de placeholders', () => {
    const n = (s) => s.split('|').length;
    assert.equal(n(en.STRINGS.panelVcCommands), n(pt.STRINGS.panelVcCommands));
    assert.equal(n(es.STRINGS.panelVcCommands), n(pt.STRINGS.panelVcCommands));
  });

  it('getShortcuts segue o locale', () => {
    assert.equal(getShortcuts(), pt.SHORTCUTS);
    setLocale('en');
    assert.equal(getShortcuts(), en.SHORTCUTS);
  });

  it('ui/strings.js continua exportando o pt', () => {
    assert.equal(STRINGS, pt.STRINGS);
    assert.equal(SHORTCUTS, pt.SHORTCUTS);
  });
});

describe('i18n — setLocale', () => {
  it('emite ms:localechange no document com locale e preferência', () => {
    document.documentElement.setAttribute('lang', 'es');
    const seen = [];
    const on = (e) => seen.push(e.detail);
    document.addEventListener('ms:localechange', on);
    assert.equal(setLocale('auto'), 'es');
    assert.equal(setLocale('en'), 'en');
    document.removeEventListener('ms:localechange', on);
    assert.deepEqual(seen, [
      { locale: 'es', preference: 'auto' },
      { locale: 'en', preference: 'en' },
    ]);
    assert.equal(getLocale(), 'en');
  });
});

describe('opção language (estado + persistência)', () => {
  it('padrão é auto', () => {
    assert.equal(state.get().options.language, 'auto');
  });

  it('persistido valida: pt/en/es/auto passam; lixo vira auto', () => {
    const lang = (v) =>
      hydratePersistedState({ options: { language: v } }).options.language;
    for (const v of ['auto', 'pt', 'en', 'es']) assert.equal(lang(v), v);
    for (const v of ['fr', '', null, 5, undefined])
      assert.equal(lang(v), 'auto');
  });
});
