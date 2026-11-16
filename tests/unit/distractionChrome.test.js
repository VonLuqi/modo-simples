/**
 * distractionDetector — nunca marca chrome MS como distração (F7).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import { detectDistractions } from '../../src/heuristics/distractionDetector.js';
import defaults from '../../src/config/defaults.js';

let env;

beforeEach(() => {
  env = installDocument((_doc, _html, body) => {
    const header = createElement('header');
    header.id = 'site-header';
    body.appendChild(header);

    const bar = createElement('div');
    bar.id = 'ms-session-bar';
    body.appendChild(bar);

    const chrome = createElement('div');
    chrome.id = 'ms-simples-chrome';
    body.appendChild(chrome);

    const pills = createElement('nav');
    pills.setAttribute('data-ms-pills', '');
    pills.className = 'ms-pills-nav';
    body.appendChild(pills);

    const main = createElement('main');
    main.textContent = 'Conteudo principal';
    body.appendChild(main);

    const footer = createElement('footer');
    body.appendChild(footer);
  });
});

afterEach(() => {
  env?.restore();
  env = null;
});

describe('detectDistractions — exclusões MS (F7)', () => {
  it('não inclui session-bar, chrome, pills nem main', () => {
    const main = document.querySelector('main');
    const list = detectDistractions(main, {
      ...defaults,
      distractionSelectors: [
        'header',
        'footer',
        'nav',
        '#ms-session-bar',
        '#ms-simples-chrome',
      ],
    });
    const ids = list.map((el) => el.id || el.tagName);
    assert.ok(!list.some((el) => el.id === 'ms-session-bar'));
    assert.ok(!list.some((el) => el.id === 'ms-simples-chrome'));
    assert.ok(!list.some((el) => el.hasAttribute('data-ms-pills')));
    assert.ok(
      list.some(
        (el) =>
          el.tagName === 'HEADER' ||
          el.tagName === 'header' ||
          el.id === 'site-header',
      ),
    );
    assert.ok(
      ids.includes('FOOTER') || list.some((el) => el.tagName === 'FOOTER'),
    );
  });
});
