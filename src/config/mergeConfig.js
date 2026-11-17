/**
 * Mescla uma config parcial sobre outra (constructor e configure()).
 *
 * `scoring` é mesclado chave a chave: um patch parcial (`{ scoring: { h1Bonus: 50 } }`)
 * não pode apagar os demais pesos — `undefined` na soma vira NaN, e NaN < limiar é falso,
 * o que desligava a seleção manual (IMP-15). Valores não numéricos são ignorados.
 *
 * @param {Object} base
 * @param {Object} [patch]
 * @returns {Object}
 */
export function mergeConfig(base, patch) {
  const merged = { ...base, ...patch };
  const scoring = { ...base.scoring };
  const patchScoring = patch && patch.scoring;
  if (patchScoring && typeof patchScoring === 'object') {
    for (const [key, value] of Object.entries(patchScoring)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        scoring[key] = value;
      }
    }
  }
  merged.scoring = scoring;
  return merged;
}
