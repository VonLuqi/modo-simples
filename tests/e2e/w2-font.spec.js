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

  test('W4a/W4b: 320x568 a 175% — chrome cabe na largura e barra+chrome ≤ 50% da altura', async ({
    site,
  }) => {
    const { page } = site;
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(INDEX);
    await waitForLib(page);
    await ligarMS(page);
    await page.evaluate(() =>
      document.documentElement.classList.add('ms-text-scale-175'),
    );
    const r = await page.evaluate(() => {
      const wrap = document.querySelector('.ms-simples-toggle-wrap');
      const btns = [
        ...document.querySelectorAll('#ms-session-bar .ms-session-btn'),
      ].filter((b) => b.offsetParent !== null);
      return {
        wrapRight: wrap.getBoundingClientRect().right,
        wrapOverflow: wrap.scrollWidth - wrap.clientWidth,
        docOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        btnMenor44: btns.filter((b) => b.getBoundingClientRect().height < 43.5)
          .length,
        btnOverflow: btns.filter((b) => b.scrollWidth > b.clientWidth + 1)
          .length,
        total:
          document.querySelector('#ms-session-bar').getBoundingClientRect()
            .height +
          document.querySelector('#ms-simples-chrome').getBoundingClientRect()
            .height,
      };
    });
    expect(r.wrapRight).toBeLessThanOrEqual(320);
    expect(r.wrapOverflow).toBeLessThanOrEqual(0);
    expect(r.docOverflow).toBe(0);
    expect(r.btnOverflow).toBe(0);
    expect(r.btnMenor44).toBe(0);
    expect(r.total).toBeLessThanOrEqual(568 * 0.5);
  });

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
