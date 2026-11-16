import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

// 1x1 PNG transparente: imagens externas viram "ok" sem rede.
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const EMPTY_BY_TYPE = {
  stylesheet: { contentType: 'text/css', body: '' },
  script: { contentType: 'text/javascript', body: '' },
  font: { contentType: 'font/woff2', body: '' },
  document: {
    contentType: 'text/html',
    body: '<!doctype html><title>x</title>',
  },
};

/**
 * Fixture `site`: abre páginas com rede isolada e coleta
 *  - errors:   console.error + pageerror (nada deve aparecer)
 *  - external: URLs pedidas a hosts que não são o servidor local
 * Requisições externas são respondidas com corpo vazio (sem rede, sem ruído no console).
 */
export const test = base.extend({
  site: async ({ page }, use) => {
    const errors = [];
    const external = [];

    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
    });

    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (LOCAL_HOSTS.has(url.hostname)) return route.continue();
      external.push(url.href);
      const type = route.request().resourceType();
      if (type === 'image') {
        return route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: PIXEL,
        });
      }
      const empty = EMPTY_BY_TYPE[type] || {
        contentType: 'text/plain',
        body: '',
      };
      return route.fulfill({ status: 200, ...empty });
    });

    await use({ page, errors, external });
  },
});

export { expect };

/** Espera a lib subir (host Shadow DOM injetado) */
export async function waitForLib(page) {
  await page.locator('#ms-container').waitFor({ state: 'attached' });
  await page.waitForFunction(() => !!window.ModoSimples);
}

/** Abre o painel pelo FAB (shadow DOM é atravessado pelos locators do Playwright) */
export async function openPanel(page) {
  await page.locator('#ms-fab').click();
  const panel = page.locator('#ms-a11y-panel');
  await expect(panel).toBeVisible();
  // espera a animação de entrada terminar: medidas e contraste (axe) ficam determinísticos
  await panel.evaluate((el) =>
    Promise.all(el.getAnimations().map((a) => a.finished)),
  );
}

// ── axe + baseline ───────────────────────────────────────────────────────────

const BASELINE = JSON.parse(
  readFileSync(new URL('./a11y-baseline.json', import.meta.url), 'utf8'),
);

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

const keyOf = (rule, selector) => `${rule} :: ${selector}`;

/**
 * Roda axe (WCAG 2.0/2.1/2.2 A+AA) e compara com a baseline.
 * - violação fora da baseline → falha (nova)
 * - violação na baseline → tolerada e anotada com o id do achado (F3)
 * - entrada da baseline que não apareceu → anotada como "corrigida?" (remova da baseline)
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {string} scenario ex.: "generic/ms-on"
 */
export async function expectNoNewViolations(page, testInfo, scenario) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  // A11Y_DISCOVER=1 npx playwright test a11y → imprime as violações em formato de baseline
  if (process.env.A11Y_DISCOVER) {
    for (const v of results.violations) {
      for (const node of v.nodes) {
        console.log(
          `A11Y ${testInfo.project.name} ${scenario} ${v.id} :: ${node.target.flat().join(' >>> ')}`,
        );
      }
    }
    return;
  }

  const seen = new Set();
  const fresh = [];
  for (const v of results.violations) {
    for (const node of v.nodes) {
      const selector = node.target.flat().join(' >>> ');
      const key = keyOf(v.id, selector);
      seen.add(key);
      // rule + selector + cenário (página/estado): uma entrada não esconde a mesma
      // violação em outra página ou estado
      const known = BASELINE.entries.find(
        (e) =>
          keyOf(e.rule, e.selector) === key && e.scenarios.includes(scenario),
      );
      if (known) {
        testInfo.annotations.push({
          type: `baseline ${known.finding}`,
          description: `${scenario}: ${v.id} em ${selector}`,
        });
      } else {
        fresh.push(
          `${v.id} (${v.impact}) em ${selector}\n    ${node.failureSummary?.replace(/\n/g, '\n    ')}`,
        );
      }
    }
  }

  // entradas da baseline deste cenário que sumiram
  for (const e of BASELINE.entries) {
    if (!e.scenarios.includes(scenario)) continue;
    if (!seen.has(keyOf(e.rule, e.selector))) {
      testInfo.annotations.push({
        type: 'baseline obsoleta?',
        description: `${e.finding}: ${e.rule} em ${e.selector} não apareceu em ${scenario} — remova da baseline se foi corrigido`,
      });
    }
  }

  expect(
    fresh,
    `Violações NOVAS de acessibilidade em ${scenario}:\n${fresh.join('\n')}`,
  ).toEqual([]);
}
