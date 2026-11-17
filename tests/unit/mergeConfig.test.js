/**
 * IMP-15 — merge de config: scoring parcial não pode gerar NaN nem desligar o fallback manual.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import defaults from '../../src/config/defaults.js';
import { mergeConfig } from '../../src/config/mergeConfig.js';
import { scoreElement } from '../../src/heuristics/scoring.js';
import { detectMainContent } from '../../src/heuristics/contentDetector.js';
import ModoSimples from '../../src/modo-simples.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
beforeEach(() => {
  env = installHappy();
});
afterEach(() => env.restore());

describe('mergeConfig', () => {
  it('scoring parcial mantém os demais pesos', () => {
    const cfg = mergeConfig(defaults, { scoring: { h1Bonus: 50 } });
    assert.equal(cfg.scoring.h1Bonus, 50);
    assert.equal(cfg.scoring.mainTagBonus, defaults.scoring.mainTagBonus);
    assert.deepEqual(
      Object.keys(cfg.scoring).sort(),
      Object.keys(defaults.scoring).sort(),
    );
  });

  it('não muta os defaults nem o patch', () => {
    const patch = { scoring: { h1Bonus: 1 } };
    mergeConfig(defaults, patch);
    assert.equal(defaults.scoring.h1Bonus, 30);
    assert.deepEqual(patch, { scoring: { h1Bonus: 1 } });
  });

  it('ignora pesos não numéricos / não finitos', () => {
    const cfg = mergeConfig(defaults, {
      scoring: { h1Bonus: 'x', h2Bonus: NaN, mainTagBonus: Infinity },
    });
    assert.equal(cfg.scoring.h1Bonus, defaults.scoring.h1Bonus);
    assert.equal(cfg.scoring.h2Bonus, defaults.scoring.h2Bonus);
    assert.equal(cfg.scoring.mainTagBonus, defaults.scoring.mainTagBonus);
  });

  it('scoring null/ausente/inválido não quebra', () => {
    for (const scoring of [null, undefined, 'x', 3]) {
      const cfg = mergeConfig(defaults, { scoring });
      assert.deepEqual(cfg.scoring, defaults.scoring);
    }
    assert.deepEqual(mergeConfig(defaults).scoring, defaults.scoring);
  });

  it('demais chaves seguem o merge raso de sempre', () => {
    const cfg = mergeConfig(defaults, {
      confidenceThreshold: 0.9,
      mount: null,
    });
    assert.equal(cfg.confidenceThreshold, 0.9);
    assert.equal(cfg.mount, null);
  });
});

describe('sem NaN no fluxo real (IMP-15)', () => {
  it('score e confiança continuam numéricos com scoring parcial', () => {
    const cfg = mergeConfig(defaults, { scoring: { h1Bonus: 50 } });
    document.body.innerHTML =
      '<main><h1>T</h1><p>' + 'texto '.repeat(60) + '</p></main>';
    const main = document.querySelector('main');
    assert.ok(Number.isFinite(scoreElement(main, cfg)));
    const { confidence } = detectMainContent(cfg);
    assert.ok(Number.isFinite(confidence));
  });

  it('com scoring parcial, página fraca ainda cai abaixo do limiar (fallback manual vivo)', () => {
    const cfg = mergeConfig(defaults, { scoring: { h1Bonus: 50 } });
    document.body.innerHTML = '<div class="content">pouco</div>';
    const { confidence } = detectMainContent(cfg);
    assert.ok(confidence < cfg.confidenceThreshold);
  });

  it('configure({ scoring }) parcial na instância preserva os pesos', () => {
    const inst = new ModoSimples();
    inst.configure({ scoring: { h1Bonus: 99 } });
    assert.equal(inst._config.scoring.h1Bonus, 99);
    assert.equal(inst._config.scoring.minTextLength, 200);
  });

  it('o construtor também mescla scoring parcial', () => {
    const inst = new ModoSimples({ scoring: { articleBonus: 5 } });
    assert.equal(inst._config.scoring.articleBonus, 5);
    assert.equal(inst._config.scoring.mainTagBonus, 100);
  });
});
