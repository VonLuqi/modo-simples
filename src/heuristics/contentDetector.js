import defaults from '../config/defaults.js';
import { scoreElement } from './scoring.js';
import { queryAll } from './queryAll.js';

/**
 * Detects the main content element on the current page.
 *
 * Strategy (cascade — tries each step; stops at first confident result):
 *   1. Query all elements matching mainSelectors.
 *   2. Score each candidate with the heuristic scorer.
 *   3. Return the highest-scoring element + a normalised confidence value.
 *
 * Confidence ≈ 1.0 when a clean `<main>` with h1 and plenty of text is found.
 * Confidence < confidenceThreshold suggests the heuristic may have guessed
 * wrong — the orchestrator can surface a manual-selection fallback.
 *
 * Trade-off: the scorer ignores layout/position data to stay fast.
 * Sites that use div-soup markup with no semantic elements will score low
 * and rely on the manual fallback (Fase 3 feature).
 *
 * @param {typeof defaults} [config]
 * @returns {{ element: Element, confidence: number }}
 */
export function detectMainContent(config = defaults) {
  /** @type {{ element: Element, score: number }[]} */
  const scored = [];

  // Uma varredura para todos os seletores. Os candidatos entram na ordem de PRIORIDADE dos
  // seletores (primeiro seletor que casa), como antes: empate de nota vence o seletor anterior.
  const rank = (el) => {
    if (typeof el.matches !== 'function') return 0;
    const i = config.mainSelectors.findIndex((sel) => {
      try {
        return el.matches(sel);
      } catch (_) {
        return false;
      }
    });
    return i === -1 ? config.mainSelectors.length : i;
  };
  const candidates = queryAll(config.mainSelectors).map((element, order) => ({
    element,
    order,
    priority: rank(element),
  }));
  candidates.sort((a, b) => a.priority - b.priority || a.order - b.order);
  for (const { element } of candidates) {
    scored.push({ element, score: scoreElement(element, config) });
  }

  if (scored.length === 0) {
    // Last resort: use <body>; confidence = 0 signals the heuristic failed
    return { element: document.body, confidence: 0 };
  }

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  // Normalise confidence against an "ideal" score so it maps to [0, 1]
  // Ideal = mainTagBonus + h1Bonus + 2× textLengthBonus
  const { scoring } = config;
  const ideal =
    scoring.mainTagBonus + scoring.h1Bonus + scoring.textLengthBonus * 2;
  const confidence = Math.min(best.score / ideal, 1);

  return { element: best.element, confidence };
}
