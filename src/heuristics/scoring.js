import defaults from '../config/defaults.js';

/**
 * Heuristic relevance scorer.
 *
 * Assigns a numeric score to a DOM element representing how likely it is to
 * be the page's main content. Higher = more relevant.
 *
 * Scoring criteria:
 *   - Semantic HTML landmarks (<main>, role="main", <article>)
 *   - Presence of heading hierarchy (h1, h2)
 *   - Text density (amount of text content)
 *
 * This intentionally does not read computed styles or layout geometry to
 * keep it fast enough to run on every page load without blocking rendering.
 *
 * @param {Element} element
 * @param {typeof defaults} [config]
 * @returns {number} Score (unbounded positive integer; higher = more relevant)
 */
export function scoreElement(element, config = defaults) {
  const { scoring } = config;
  let score = 0;

  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute('role');

  // Landmark bonuses
  if (tag === 'main') score += scoring.mainTagBonus;
  if (role === 'main') score += scoring.roleMainBonus;
  if (tag === 'article') score += scoring.articleBonus;

  // Heading bonuses (indicates start of a content section)
  if (element.querySelector('h1')) score += scoring.h1Bonus;
  if (element.querySelector('h2')) score += scoring.h2Bonus;

  // Text density bonus — crude but effective signal
  const textLength = (element.textContent ?? '').trim().length;
  if (textLength >= scoring.minTextLength) {
    score += scoring.textLengthBonus;
    // Extra bonus for very text-rich blocks
    if (textLength >= scoring.minTextLength * 3) score += scoring.textLengthBonus;
  }

  return score;
}
