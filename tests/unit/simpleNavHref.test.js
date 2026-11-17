/**
 * IMP-42 — simpleNav só aceita href http(s):, mailto:, tel: ou relativo.
 * Antes o href de configure({ simpleNav }) ia direto para <a href>, aceitando javascript:.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import {
  normalizeSimpleNav,
  createSimpleNav,
  isSafeHref,
} from '../../src/features/simpleNav.js';

const item = (href) => ({ label: 'Link', href });

describe('isSafeHref (IMP-42)', () => {
  const seguros = [
    'index.html',
    '/ajuda',
    '../acima/pagina.html',
    '#secao',
    '?q=1',
    'a/b:c',
    '/a:b',
    'http://exemplo.com',
    'HTTPS://exemplo.com/x',
    'mailto:oi@exemplo.com',
    'tel:+5531999999999',
    '//cdn.exemplo.com/x',
  ];
  for (const href of seguros) {
    it(`aceita ${href}`, () => assert.equal(isSafeHref(href), true));
  }

  const perigosos = [
    'javascript:alert(1)',
    ' JavaScript:alert(1)',
    'java\tscript:alert(1)', // tab dentro do esquema: o browser ignora
    'java\nscript:alert(1)',
    '\u0001javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'blob:https://exemplo.com/uuid',
    'ftp://exemplo.com/x',
  ];
  for (const href of perigosos) {
    it(`recusa ${JSON.stringify(href)}`, () =>
      assert.equal(isSafeHref(href), false));
  }
});

describe('normalizeSimpleNav descarta href inseguro (IMP-42)', () => {
  it('mantém só os itens com href seguro', () => {
    const out = normalizeSimpleNav([
      item('index.html'),
      item('javascript:alert(1)'),
      item('mailto:a@b.co'),
      item('data:text/html,x'),
    ]);
    assert.deepEqual(
      out.map((i) => i.href),
      ['index.html', 'mailto:a@b.co'],
    );
  });
});

describe('createSimpleNav não injeta href perigoso (IMP-42)', () => {
  let env;
  beforeEach(() => {
    env = installDocument((_doc, _html, body) => {
      body.appendChild(createElement('main'));
    });
  });
  afterEach(() => {
    env?.restore();
  });

  it('o <nav> injetado só tem os links seguros', () => {
    const api = createSimpleNav();
    api.sync([item('javascript:alert(1)'), item('/ok')]);
    const links = document.querySelectorAll('.ms-pill');
    const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
    assert.deepEqual(hrefs, ['/ok']);
    api.destroy();
  });

  it('se todos forem inseguros, nenhum nav é criado', () => {
    const api = createSimpleNav();
    api.sync([item('javascript:alert(1)'), item('data:text/html,x')]);
    assert.equal(document.querySelector('[data-ms-injected]'), null);
    api.destroy();
  });
});
