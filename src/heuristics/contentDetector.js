import defaults from '../config/defaults.js';
import { scoreElement } from './scoring.js';

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

  for (const selector of config.mainSelectors) {
    let matches;
    try {
      matches = document.querySelectorAll(selector);
    } catch (_) {
      // Malformed or browser-unsupported selector — skip safely
      continue;
    }

    matches.forEach((el) => {
      // Deduplicate (the same element may match multiple selectors)
      if (scored.some((s) => s.element === el)) return;
      scored.push({ element: el, score: scoreElement(el, config) });
    });
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
