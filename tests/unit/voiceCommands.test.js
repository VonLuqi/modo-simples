/**
 * F10d — features/voiceCommands.js: modo de reconhecimento, consentimento, tabela de comandos,
 * reinício automático e bloqueio de microfone (reconhecimento simulado).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import state from '../../src/core/state.js';
import {
  getRecognitionMode,
  installLocalModel,
  parseCommand,
  startVoiceCommands,
  stopVoiceCommands,
  isListening,
} from '../../src/features/voiceCommands.js';

let recs;
let status;
let cmds;

function installRecognition({ available, install } = {}) {
  recs = [];
  globalThis.SpeechRecognition = class {
    constructor() {
      this.starts = 0;
      this.aborted = false;
      recs.push(this);
    }
    start() {
      this.starts++;
    }
    abort() {
      this.aborted = true;
    }
  };
  if (available) globalThis.SpeechRecognition.available = available;
  if (install) globalThis.SpeechRecognition.install = install;
}

const say = (rec, transcript, isFinal = true) =>
  rec.onresult({
    resultIndex: 0,
    results: [Object.assign([{ transcript }], { isFinal })],
  });

const consent = (v) => state.set({ options: { voiceCloudConsent: v } });
const go = (mode) =>
  startVoiceCommands({
    mode,
    onCommand: (c) => cmds.push(c),
    onStatus: (s) => status.push(s),
  });

beforeEach(() => {
  status = [];
  cmds = [];
  consent(false);
});

afterEach(() => {
  stopVoiceCommands();
  delete globalThis.SpeechRecognition;
  delete globalThis.webkitSpeechRecognition;
  delete globalThis.isSecureContext;
  consent(false);
});

describe('getRecognitionMode', () => {
  it('sem construtor → none; página insegura → none', async () => {
    assert.equal(await getRecognitionMode(), 'none');
    installRecognition();
    globalThis.isSecureContext = false;
    assert.equal(await getRecognitionMode(), 'none');
  });

  it('só com prefixo webkit e sem available() → cloud', async () => {
    globalThis.webkitSpeechRecognition = class {};
    assert.equal(await getRecognitionMode(), 'cloud');
  });

  it('available(): available→local; downloadable/downloading→download; outro→cloud', async () => {
    let seen;
    for (const [ans, mode] of [
      ['available', 'local'],
      ['downloadable', 'download'],
      ['downloading', 'download'],
      ['unavailable', 'cloud'],
    ]) {
      installRecognition({
        available: async (o) => {
          seen = o;
          return ans;
        },
      });
      assert.equal(await getRecognitionMode(), mode, ans);
    }
    assert.deepEqual(seen, { langs: ['pt-BR'], processLocally: true });
  });

  it('available() que falha → cloud', async () => {
    installRecognition({
      available: async () => {
        throw new Error('x');
      },
    });
    assert.equal(await getRecognitionMode(), 'cloud');
  });
});

describe('installLocalModel', () => {
  it('chama install com pt-BR local e devolve boolean', async () => {
    let arg;
    installRecognition({
      install: async (o) => {
        arg = o;
        return true;
      },
    });
    assert.equal(await installLocalModel(), true);
    assert.deepEqual(arg, { langs: ['pt-BR'], processLocally: true });
    installRecognition({
      install: async () => {
        throw new Error('sem gesto');
      },
    });
    assert.equal(await installLocalModel(), false);
    installRecognition();
    assert.equal(await installLocalModel(), false);
  });
});

describe('parseCommand', () => {
  const tabela = [
    ['Ler página', 'read'],
    ['leia', 'read'],
    ['Parar', 'stop'],
    ['pare', 'stop'],
    ['pausar', 'pause'],
    ['Continuar', 'resume'],
    ['mais rápido', 'faster'],
    ['mais devagar', 'slower'],
    ['descer', 'scrollDown'],
    ['Subir!', 'scrollUp'],
    ['ligar modo simples', 'msOn'],
    ['Desligar Modo Simples', 'msOff'],
    ['abrir painel', 'panelOpen'],
    ['fechar o painel', 'panelClose'],
    ['ajuda', 'help'],
    ['comandos', 'help'],
  ];
  for (const [txt, action] of tabela) {
    it(`"${txt}" → ${action}`, () => {
      assert.deepEqual(parseCommand(txt), { action });
    });
  }

  it('texto sem comando, vazio ou conversa longa → null', () => {
    assert.equal(parseCommand('bom dia a todos'), null);
    assert.equal(parseCommand(''), null);
    assert.equal(parseCommand(null), null);
    assert.equal(
      parseCommand('eu acho que vou ler a página amanhã de manhã'),
      null,
    );
    assert.equal(parseCommand('para mim'), null); // "para" só vale sozinho
  });
});

describe('startVoiceCommands', () => {
  it('REGRA DURA: cloud sem consentimento nunca inicia', () => {
    installRecognition();
    assert.equal(go('cloud'), false);
    assert.deepEqual(status, ['needs-consent']);
    assert.equal(recs.length, 0);
    assert.equal(isListening(), false);
  });

  it('cloud com consentimento inicia; local não precisa e usa processLocally', () => {
    installRecognition();
    consent(true);
    assert.equal(go('cloud'), true);
    assert.equal(recs[0].processLocally, undefined);
    assert.equal(recs[0].lang, 'pt-BR');
    assert.equal(recs[0].continuous, true);
    assert.equal(isListening(), true);
    stopVoiceCommands();
    consent(false);
    assert.equal(go('local'), true);
    assert.equal(recs[1].processLocally, true);
    assert.deepEqual(status, ['listening', 'stopped', 'listening']);
  });

  it('download e none não iniciam', () => {
    installRecognition();
    assert.equal(go('download'), false);
    assert.equal(go('none'), false);
    assert.deepEqual(status, ['needs-model', 'unsupported']);
    assert.equal(recs.length, 0);
  });

  it('resultado final vira comando; parcial e frase solta são ignorados', () => {
    installRecognition();
    go('local');
    say(recs[0], 'pausar', false);
    say(recs[0], 'bom dia');
    say(recs[0], 'Mais rápido');
    assert.deepEqual(cmds, [{ action: 'faster' }]);
  });

  it('reinicia sozinho ao terminar enquanto ligado; não reinicia depois de parar', () => {
    installRecognition();
    go('local');
    recs[0].onend();
    assert.equal(recs[0].starts, 2);
    stopVoiceCommands();
    assert.equal(recs[0].aborted, true);
    assert.equal(isListening(), false);
  });

  it('not-allowed e service-not-allowed bloqueiam: para e avisa', () => {
    for (const err of ['not-allowed', 'service-not-allowed']) {
      status.length = 0;
      installRecognition();
      go('local');
      recs[0].onerror({ error: err });
      assert.equal(isListening(), false);
      assert.deepEqual(status, ['listening', 'blocked']);
    }
  });

  it('no-speech não para; start que falha no reinício vira erro', () => {
    installRecognition();
    go('local');
    recs[0].onerror({ error: 'no-speech' });
    assert.equal(isListening(), true);
    recs[0].start = () => {
      throw new Error('InvalidStateError');
    };
    recs[0].onend();
    assert.equal(isListening(), false);
    assert.equal(status.at(-1), 'error');
  });
});
