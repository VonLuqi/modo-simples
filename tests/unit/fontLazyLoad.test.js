/**
 * IMP-04/44 — Lexend só é pedido quando o usuário liga a fonte (sem request no init).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { installDocument } from './helpers/miniDom.js';
import {
  applyOptions,
  injectPageStyles,
  setLexendFontUrl,
} from '../../src/mutator/domMutator.js';
import { getPageStyles } from '../../src/ui/styles.js';
import defaults from '../../src/config/defaults.js';

let env;

beforeEach(() => {
  env = installDocument();
  setLexendFontUrl(undefined);
});

afterEach(() => {
  env?.restore();
  env = null;
});

const lexendLink = () => document.getElementById('ms-lexend-font');

describe('Lexend lazy load (D1)', () => {
  it('CSS da página não contém @import nem URL de terceiros', () => {
    const css = getPageStyles();
    assert.ok(!css.includes('@import'));
    assert.ok(!css.includes('fonts.googleapis'));
  });

  it('init (injectPageStyles + applyOptions sem fonte) não cria <link> de fonte', () => {
    injectPageStyles();
    applyOptions({ options: { textScale: '100', colorTheme: 'senac' } });
    assert.equal(lexendLink(), null);
  });

  it('ligar dyslexiaFont cria <link> uma única vez, com crossorigin e no-referrer', () => {
    applyOptions({ options: { dyslexiaFont: true } });
    applyOptions({ options: { dyslexiaFont: true } });
    const link = lexendLink();
    assert.ok(link);
    assert.equal(link.crossOrigin, 'anonymous');
    assert.equal(link.referrerPolicy, 'no-referrer');
    assert.ok(
      link.href.startsWith('https://fonts.googleapis.com/css2?family=Lexend'),
    );
    assert.equal(
      document.head.children.filter((c) => c.id === 'ms-lexend-font').length,
      1,
    );
  });

  it('fontUrl string usa o CSS self-hosted', () => {
    setLexendFontUrl('/assets/lexend.css');
    applyOptions({ options: { dyslexiaFont: true } });
    assert.equal(lexendLink().href, '/assets/lexend.css');
  });

  it('fontUrl false nunca carrega (mantém fallback)', () => {
    setLexendFontUrl(false);
    applyOptions({ options: { dyslexiaFont: true } });
    assert.equal(lexendLink(), null);
  });

  it('default de config.fontUrl é null (lazy, nunca eager)', () => {
    assert.equal(defaults.fontUrl, null);
  });
});
