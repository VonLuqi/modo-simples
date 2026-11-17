import { test, expect, waitForLib, openPanel } from './helpers.js';

const INDEX = '/examples/index.html';

async function ligarMS(page) {
  await page.evaluate(() => window.ModoSimples.enable());
  await expect(page.locator('html')).toHaveClass(/ms-ativo/);
}

test.describe('W2 mobile — widget com html { font-size: 62.5% } no host', () => {
  for (const largura of [390, 320]) {
    test(`UX-14: nenhum texto do widget abaixo de 12px (${largura}px)`, async ({
      site,
    }) => {
      const { page } = site;
      await page.setViewportSize({ width: largura, height: 700 });
      await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
          const s = document.createElement('style');
          s.textContent = 'html { font-size: 62.5% !important; }';
          document.head.appendChild(s);
        });
      });
      await page.goto(INDEX);
      await waitForLib(page);
      await openPanel(page);

      const menores = await page.locator('#ms-container').evaluate((host) => {
        const out = [];
        const walk = (root) => {
          for (const el of root.querySelectorAll('*')) {
            const own = [...el.childNodes].some(
              (n) => n.nodeType === 3 && n.textContent.trim(),
            );
            if (!own) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            const px = parseFloat(cs.fontSize);
            if (px < 12) out.push(`${el.className || el.tagName}: ${px}px`);
          }
        };
        walk(host.shadowRoot);
        return out;
      });
      expect(menores).toEqual([]);
    });

    test(`UX-14: barra e switch do Modo Simples não ficam abaixo de 12px (${largura}px)`, async ({
      site,
    }) => {
      const { page } = site;
      await page.setViewportSize({ width: largura, height: 700 });
      await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
          const s = document.createElement('style');
          s.textContent = 'html { font-size: 62.5% !important; }';
          document.head.appendChild(s);
        });
      });
      await page.goto(INDEX);
      await waitForLib(page);
      await ligarMS(page);

      const menores = await page.evaluate(() => {
        const out = [];
        for (const raiz of ['#ms-session-bar', '#ms-simples-chrome']) {
          for (const el of document.querySelectorAll(`${raiz}, ${raiz} *`)) {
            const own = [...el.childNodes].some(
              (n) => n.nodeType === 3 && n.textContent.trim(),
            );
            if (!own) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || el.offsetParent === null) continue;
            // texto só para leitor de tela (1px) não conta
            if (el.getBoundingClientRect().width <= 1) continue;
            const px = parseFloat(cs.fontSize);
            if (px < 12) out.push(`${el.className || el.tagName}: ${px}px`);
          }
        }
        return out;
      });
      expect(menores).toEqual([]);
    });
  }

  test('UX-14: a 320x568 (equivale a 400% de zoom) o painel cabe na janela', async ({
    site,
  }) => {
    const { page } = site;
    await page.setViewportSize({ width: 320, height: 568 });
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const s = document.createElement('style');
        s.textContent = 'html { font-size: 62.5% !important; }';
        document.head.appendChild(s);
      });
    });
    await page.goto(INDEX);
    await waitForLib(page);
    await openPanel(page);
    const box = await page.locator('#ms-a11y-panel').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    expect(box.y + box.height).toBeLessThanOrEqual(568);
  });
});
