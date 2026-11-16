/**
 * tests/unit/eventBus.test.js
 *
 * Testa o módulo core/eventBus usando o test runner nativo do Node.js (node:test).
 * Não requer DOM nem dependências externas.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Importa o bus diretamente do source
import eventBus from '../../src/core/eventBus.js';

describe('eventBus', () => {
  beforeEach(() => {
    // Garante estado limpo entre testes
    eventBus.clearAll();
  });

  it('deve registrar e disparar um evento', () => {
    let chamado = false;
    eventBus.on('teste', () => {
      chamado = true;
    });
    eventBus.emit('teste');
    assert.ok(chamado, 'O handler deve ter sido chamado');
  });

  it('deve passar o payload para o handler', () => {
    let payload;
    eventBus.on('dados', (data) => {
      payload = data;
    });
    eventBus.emit('dados', { valor: 42 });
    assert.deepEqual(payload, { valor: 42 });
  });

  it('deve chamar múltiplos handlers para o mesmo evento', () => {
    let contador = 0;
    eventBus.on('multi', () => contador++);
    eventBus.on('multi', () => contador++);
    eventBus.on('multi', () => contador++);
    eventBus.emit('multi');
    assert.strictEqual(contador, 3);
  });

  it('deve remover um handler ao chamar o retorno de on()', () => {
    let chamado = false;
    const unsub = eventBus.on('remove', () => {
      chamado = true;
    });
    unsub();
    eventBus.emit('remove');
    assert.strictEqual(chamado, false, 'Handler removido não deve ser chamado');
  });

  it('deve remover um handler via off()', () => {
    let contador = 0;
    const handler = () => contador++;
    eventBus.on('off-test', handler);
    eventBus.emit('off-test'); // contador = 1
    eventBus.off('off-test', handler);
    eventBus.emit('off-test'); // deve ficar em 1
    assert.strictEqual(contador, 1);
  });

  it('deve silenciar erros lançados por handlers sem propagar', () => {
    eventBus.on('erro', () => {
      throw new Error('erro em handler');
    });
    // Não deve lançar para fora
    assert.doesNotThrow(() => eventBus.emit('erro'));
  });

  it('clear() deve remover todos os handlers de um evento', () => {
    let chamado = false;
    eventBus.on('limpar', () => {
      chamado = true;
    });
    eventBus.clear('limpar');
    eventBus.emit('limpar');
    assert.strictEqual(chamado, false);
  });

  it('clearAll() deve remover todos os handlers de todos os eventos', () => {
    let a = false,
      b = false;
    eventBus.on('eventoA', () => {
      a = true;
    });
    eventBus.on('eventoB', () => {
      b = true;
    });
    eventBus.clearAll();
    eventBus.emit('eventoA');
    eventBus.emit('eventoB');
    assert.strictEqual(a, false);
    assert.strictEqual(b, false);
  });

  it('não deve disparar eventos de outros canais', () => {
    let chamado = false;
    eventBus.on('canalA', () => {
      chamado = true;
    });
    eventBus.emit('canalB');
    assert.strictEqual(chamado, false);
  });
});
