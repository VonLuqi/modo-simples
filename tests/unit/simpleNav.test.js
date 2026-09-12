/**
 * F5-T11 — simpleNav injetável
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import {
  normalizeSimpleNav,
  createSimpleNav,
} from '../../src/features/simpleNav.js';

describe('normalizeSimpleNav', () => {
  it('retorna [] para entrada inválida', () => {
    assert.deepEqual(normalizeSimpleNav(null), []);
    assert.deepEqual(normalizeSimpleNav(undefined), []);
    assert.deepEqual(normalizeSimpleNav({}), []);
  });

  it('filtra itens sem label ou href', () => {
    assert.deepEqual(
      normalizeSimpleNav([
        { label: 'Início', href: 'index.html' },
        { label: '', href: 'x.html' },
        { label: 'X', href: '' },
        null,
        { label: ' Ajuda ', href: ' /ajuda ' },
      ]),
      [
        { label: 'Início', href: 'index.html' },
        { label: 'Ajuda', href: '/ajuda' },
      ],
    );
  });

  it('preserva short opcional', () => {
    assert.deepEqual(
      normalizeSimpleNav([{ label: 'Cursos Disponíveis', href: 'cursos.html', short: 'Cursos' }]),
      [{ label: 'Cursos Disponíveis', href: 'cursos.html', short: 'Cursos' }],
    );
  });
});

describe('createSimpleNav', () => {
  let env;

  function findInjected() {
    return [...document.querySelectorAll('[data-ms-pills]')].find((el) =>
      el.hasAttribute('data-ms-injected'),
    );
  }

  beforeEach(() => {
    env = installDocument((_doc, _html, body) => {
      const header = createElement('header');
      body.appendChild(header);
      const bar = createElement('div');
      bar.id = 'ms-session-bar';
      body.appendChild(bar);
    });
    global.location = {
      pathname: '/examples/hello-modo-simples.html',
      href: 'http://127.0.0.1:8765/examples/hello-modo-simples.html',
    };
  });

  afterEach(() => {
    env?.restore();
    delete global.location;
  });

  it('injeta nav após a barra de sessão', () => {
    const api = createSimpleNav();
    api.sync([
      { label: 'Início', href: 'hello-modo-simples.html' },
      { label: 'Sobre', href: '#sobre' },
    ]);

    const nav = findInjected();
    assert.ok(nav);
    assert.ok(nav.classList.contains('ms-simple-only'));
    assert.equal(document.getElementById('ms-session-bar').nextElementSibling, nav);

    const links = nav.querySelectorAll('a.ms-pill');
    assert.equal(links.length, 2);
    assert.equal(links[0].textContent, 'Início');
    assert.equal(links[0].getAttribute('aria-current'), 'page');

    api.destroy();
    assert.equal(findInjected(), undefined);
  });

  it('não sobrescreve pills autoradas pela página', () => {
    const host = createElement('nav');
    host.setAttribute('data-ms-pills', '');
    host.className = 'ms-pills-nav';
    document.body.appendChild(host);

    const api = createSimpleNav();
    api.sync([{ label: 'X', href: '#' }]);

    assert.equal(findInjected(), undefined);
    assert.ok(
      [...document.querySelectorAll('[data-ms-pills]')].some(
        (el) => !el.hasAttribute('data-ms-injected'),
      ),
    );
    api.destroy();
  });

  it('remove pills quando simpleNav fica vazio', () => {
    const api = createSimpleNav();
    api.sync([{ label: 'A', href: 'a.html' }]);
    assert.ok(findInjected());
    api.sync([]);
    assert.equal(findInjected(), undefined);
  });
});
