/**
 * F0 (UX-28) — textos de marca do painel vêm de config.brand; o padrão é genérico.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { installDocument } from './helpers/miniDom.js';
import { createA11yPanel } from '../../src/ui/a11yPanel.js';
import defaults from '../../src/config/defaults.js';

let env;

const noop = () => {};
const estado = { modoSimples: false, options: {} };

function novoPainel(brand) {
  return createA11yPanel({
    state: estado,
    onClose: noop,
    onToggleModoSimples: noop,
    onSetOption: noop,
    onSpeak: noop,
    brand,
  });
}

beforeEach(() => {
  env = installDocument();
});

afterEach(() => {
  env?.restore();
  env = null;
});

describe('config.brand (UX-28)', () => {
  it('defaults são genéricos: sem Senac nem Projeto Integrador', () => {
    const texto = JSON.stringify(defaults.brand);
    assert.ok(!/senac|projeto integrador/i.test(texto), texto);
    assert.equal(defaults.brand.title, 'Acessibilidade Digital');
    assert.equal(defaults.brand.subtitle, '');
  });

  it('painel com brand padrão: título genérico, subtítulo oculto', () => {
    const painel = novoPainel(defaults.brand);
    const titulo = painel.element.querySelector('#ms-a11y-title');
    const sub = painel.element.querySelector('.ms-a11y-subtitle');
    const rodape = painel.element.querySelector('.ms-a11y-footer-note');
    assert.equal(titulo.textContent, 'Acessibilidade Digital');
    assert.equal(sub.hidden, true);
    assert.equal(rodape.textContent, 'Preferências salvas neste navegador');
    assert.ok(!/senac|projeto integrador/i.test(painel.element.textContent));
  });

  it('override parcial: o resto continua no padrão', () => {
    const painel = novoPainel({ subtitle: 'Minha escola' });
    const sub = painel.element.querySelector('.ms-a11y-subtitle');
    assert.equal(sub.textContent, 'Minha escola');
    assert.equal(sub.hidden, false);
    assert.equal(
      painel.element.querySelector('#ms-a11y-title').textContent,
      'Acessibilidade Digital',
    );
  });

  it('título vazio cai no padrão (o diálogo nunca fica sem nome)', () => {
    const painel = novoPainel({ title: '' });
    assert.equal(
      painel.element.querySelector('#ms-a11y-title').textContent,
      'Acessibilidade Digital',
    );
  });

  it('texto da marca entra como texto, nunca como HTML', () => {
    const painel = novoPainel({ title: '<img src=x onerror=alert(1)>' });
    const titulo = painel.element.querySelector('#ms-a11y-title');
    assert.equal(titulo.textContent, '<img src=x onerror=alert(1)>');
    assert.equal(titulo.querySelector('img'), null);
  });

  it('rótulos de tamanho: Grande / Maior / Máximo (sem "Muito +")', () => {
    const painel = novoPainel();
    const rotulos = painel.element
      .querySelectorAll('[data-option="textScale"] .ms-segment')
      .map((b) => b.getAttribute('aria-label'));
    assert.ok(rotulos.some((r) => r.includes('Grande')));
    assert.ok(rotulos.some((r) => r.includes('Maior')));
    assert.ok(rotulos.some((r) => r.includes('Máximo')));
    assert.ok(!rotulos.some((r) => r.includes('Muito +')));
  });
});
