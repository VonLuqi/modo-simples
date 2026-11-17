/**
 * src/core/instancePersistence.js — adaptador de persistência do ModoSimples.
 *
 * Funções que leem/gravam no storage em nome de uma instância `ms` (usam ms._config e os
 * campos de cache _hideImagesBeforeMs, _lastPersisted, _reducedMotionUser). A classe
 * ModoSimples mantém os métodos _xxx como delegates de uma linha para cá.
 */

import persistence from './persistence.js';
import state from './state.js';
import { hydratePersistedState, SCHEMA_VERSION } from './persistedState.js';
import { detectMainContent } from '../heuristics/contentDetector.js';

/** Tamanho do texto de um elemento (sem espaços nas pontas). */
const textLength = (el) => ((el && el.textContent) || '').trim().length;

const STATE_KEY = 'state';
const PRINCIPAL_KEY = 'principal';
const SIDE_KEY = 'panelSide';

/** Guarda (memória + storage) se as imagens estavam ocultas antes de ligar o MS. */
export function saveHideImagesBeforeMs(ms, hide) {
  ms._hideImagesBeforeMs = !!hide;
  if (!ms._config.persistence) return;
  const key = 'hideImagesBeforeMs';
  if (ms._config.hostnamePersistence) {
    persistence.saveForHost(key, !!hide);
  } else {
    persistence.save(key, !!hide);
  }
}

/** Lê e esquece o valor guardado; sem registro (ex.: MS já estava ligado) = imagens visíveis. */
export function takeHideImagesBeforeMs(ms) {
  let hide = ms._hideImagesBeforeMs;
  if (hide === null && ms._config.persistence) {
    const key = 'hideImagesBeforeMs';
    hide = ms._config.hostnamePersistence
      ? persistence.loadForHost(key, null)
      : persistence.load(key, null);
  }
  ms._hideImagesBeforeMs = null;
  if (ms._config.persistence) {
    const key = 'hideImagesBeforeMs';
    if (ms._config.hostnamePersistence) {
      persistence.removeForHost(key);
    } else {
      persistence.remove(key);
    }
  }
  return !!hide;
}

export function loadPreferShowImages(ms) {
  if (!ms._config.persistence) return false;
  const key = 'preferShowImagesInMs';
  const v = ms._config.hostnamePersistence
    ? persistence.loadForHost(key, false)
    : persistence.load(key, false);
  return !!v;
}

export function savePreferShowImages(ms, show) {
  if (!ms._config.persistence) return;
  const key = 'preferShowImagesInMs';
  if (ms._config.hostnamePersistence) {
    persistence.saveForHost(key, !!show);
  } else {
    persistence.save(key, !!show);
  }
}

/** Lado do painel/FAB salvo ('left'|'right'); sem registro válido = lado do config.position. */
export function loadPanelSide(ms) {
  const fallback = ms._config.position.endsWith('left') ? 'left' : 'right';
  if (!ms._config.persistence) return fallback;
  const v = ms._config.hostnamePersistence
    ? persistence.loadForHost(SIDE_KEY)
    : persistence.load(SIDE_KEY);
  return v === 'left' || v === 'right' ? v : fallback;
}

export function savePanelSide(ms, side) {
  if (!ms._config.persistence) return;
  if (ms._config.hostnamePersistence) {
    persistence.saveForHost(SIDE_KEY, side);
  } else {
    persistence.save(SIDE_KEY, side);
  }
}

export function persistState(ms, next) {
  if (!ms._config.persistence) return;
  const payload = {
    v: SCHEMA_VERSION,
    modoSimples: next.modoSimples,
    // reducedMotion só é gravado quando o usuário escolheu (null = derivado do SO)
    options: { ...next.options, reducedMotion: ms._reducedMotionUser },
  };
  // localStorage é síncrono: só grava quando o que é persistido de fato mudou (IMP-39);
  // abrir/fechar o painel, por exemplo, não altera o payload
  const json = JSON.stringify(payload);
  if (json === ms._lastPersisted) return;
  ms._lastPersisted = json;
  if (ms._config.hostnamePersistence) {
    persistence.saveForHost(STATE_KEY, payload);
  } else {
    persistence.save(STATE_KEY, payload);
  }
}

export function loadPersistedState(ms) {
  if (!ms._config.persistence) return;
  const saved = ms._config.hostnamePersistence
    ? persistence.loadForHost(STATE_KEY)
    : persistence.load(STATE_KEY);
  if (!saved) return;

  const patch = hydratePersistedState(saved);
  if (patch) state.set(patch);
  // Payload v0 (sem v) gravava o reducedMotion DERIVADO (sempre false por padrão): não é escolha
  // do usuário. Tratá-lo como escolha ignoraria o SO de todo mundo que atualizou de 1.x/2.0.
  const rm = saved.options && saved.options.reducedMotion;
  const isUserChoice = saved.v >= 1 && typeof rm === 'boolean';
  ms._reducedMotionUser = isUserChoice ? rm : null;
}

/** Grava o principal escolhido POR PÁGINA, com o tamanho do texto para validar depois. */
export function savePrincipalPath(ms, path, el) {
  if (!ms._config.persistence || !path) return;
  persistence.saveForPath(PRINCIPAL_KEY, {
    path,
    textLen: textLength(el),
  });
}

/**
 * Principal salvo para ESTA página. Sem registro de página, aceita o registro antigo (por host,
 * string) — ele só vale se passar na validação, e é migrado para a página (IMP-06).
 * @returns {{ path: string, textLen: number|null, legacy: boolean } | null}
 */
export function loadPrincipal(ms) {
  if (!ms._config.persistence) return null;
  let v = persistence.loadForPath(PRINCIPAL_KEY);
  const viaHost = v == null; // sem registro da página: cai no registro antigo, por host
  if (viaHost) {
    v = ms._config.hostnamePersistence
      ? persistence.loadForHost(PRINCIPAL_KEY)
      : persistence.load(PRINCIPAL_KEY);
  }
  if (typeof v === 'string' && v) {
    return { path: v, textLen: null, legacy: true };
  }
  if (v && typeof v.path === 'string' && v.path) {
    return {
      path: v.path,
      textLen: Number.isFinite(v.textLen) ? v.textLen : null,
      legacy: viaHost,
    };
  }
  return null;
}

/**
 * Esquece o principal salvo DESTA página. O registro antigo por host nunca é apagado aqui:
 * ele é só uma dica, e falhar numa página não diz nada sobre as outras.
 */
export function discardPrincipal(ms) {
  if (!ms._config.persistence) return;
  persistence.removeForPath(PRINCIPAL_KEY);
}

/**
 * O elemento achado pelo caminho salvo ainda parece a área de conteúdo? Exige o mínimo de
 * texto da heurística (scoring.minTextLength) e, quando conhecido, não menos que metade do
 * tamanho de quando foi escolhido.
 */
export function isPlausiblePrincipal(ms, el, saved) {
  const len = textLength(el);
  if (len < ms._config.scoring.minTextLength) return false;
  if (saved.textLen && len < saved.textLen * 0.5) return false;
  if (saved.legacy) return ms._legacyHintFits(el, len);
  return true;
}

/**
 * Registro antigo (por host, sem tamanho gravado) é só uma dica: além do mínimo de texto, quando
 * a heurística tem confiança nesta página o elemento da dica não pode ser bem menor que o
 * candidato dela (< 50% do texto) — outra página do host com a mesma estrutura de caminho.
 */
export function legacyHintFits(ms, el, len) {
  const { element, confidence } = detectMainContent(ms._config);
  if (confidence < ms._config.confidenceThreshold || element === el) {
    return true;
  }
  return len >= textLength(element) * 0.5;
}
