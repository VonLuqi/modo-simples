import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F9e — "Teclado virtual": teclado ABNT2 pt-BR na tela que escreve nos campos de texto da página.
 */
const PAGE = '/tests/e2e/fixtures/virtual-keyboard.html';
const KB = '#ms-virtual-keyboard';

async function open(page) {
  await page.goto(PAGE);
  await waitForLib(page);
  await openPanel(page);
  const sec = page.locator('#ms-sec-pageTools-btn');
  if ((await sec.getAttribute('aria-expanded')) !== 'true') await sec.click();
  await page.locator('[data-action="virtual-keyboard"]').click();
  await expect(page.locator(KB)).toBeVisible();
}

const isMobile = (info) => info.project.name === 'mobile';
async function press(page, info, def) {
  const k = page.locator(`${KB} [data-vk="${def}"]`).first();
  if (isMobile(info)) await k.tap();
  else await k.click();
}
async function typeKeys(page, info, defs) {
  for (const d of defs) await press(page, info, d);
}
const active = (page) => page.evaluate(() => document.activeElement?.id);
const logOf = (page) => page.evaluate(() => window.__log);

// "ação Ünico"
const ACAO_UNICO = [
  'a',
  'ç',
  '~^',
  'a',
  'o',
  'Space',
  'Shift',
  '6¨',
  'Shift',
  'u',
  'n',
  'i',
  'c',
  'o',
];

test.describe('F9e — Teclado virtual', () => {
  test('abre pelo painel com a dica; ao focar um campo mostram-se as teclas', async ({
    site,
  }) => {
    const { page } = site;
    await open(page);
    await expect(page.locator(`${KB} [data-vk-hint]`)).toBeVisible();
    await expect(page.locator(`${KB} [data-vk-hint]`)).toHaveText(
      'Toque num campo de texto',
    );
    await page.locator('#t').focus();
    await expect(page.locator(`${KB} [data-vk-keys]`)).toBeVisible();
    await expect(page.locator(`${KB} [data-vk-hint]`)).toBeHidden();
    await page.locator('#ro').focus(); // readonly: não escreve
    await expect(page.locator(`${KB} [data-vk-hint]`)).toBeVisible();
  });

  test('escreve "ação Ünico" no input e no textarea sem tirar o foco; o framework vê os eventos', async ({
    site,
  }, info) => {
    const { page } = site;
    await open(page);
    for (const id of ['t', 'ta']) {
      await page.locator(`#${id}`).focus();
      await typeKeys(page, info, ACAO_UNICO);
      expect(await active(page)).toBe(id);
      await expect(page.locator(`#${id}`)).toHaveValue('ação Ünico');
    }
    const log = await logOf(page);
    const doInput = log.filter((l) => l.id === 't');
    expect(doInput.every((l) => l.type === 'insertText')).toBe(true);
    expect(doInput.at(-1).value).toBe('ação Ünico');
    expect(doInput.length).toBeGreaterThanOrEqual(10);
  });

  test('Backspace apaga (deleteContentBackward); Enter no textarea quebra a linha', async ({
    site,
  }, info) => {
    const { page } = site;
    await open(page);
    await page.locator('#ta').focus();
    await typeKeys(page, info, ['o', 'k', 'Enter', 'x', 'Backspace']);
    await expect(page.locator('#ta')).toHaveValue('ok\n');
    const log = await logOf(page);
    expect(log.at(-1).type).toBe('deleteContentBackward');
  });

  test('Enter no campo de pesquisa envia o formulário', async ({
    site,
  }, info) => {
    const { page } = site;
    await open(page);
    await page.locator('#q').focus();
    await typeKeys(page, info, ['o', 'i', 'Enter']);
    await expect(page.locator('#q')).toHaveValue('oi');
    expect(await page.evaluate(() => window.__submits)).toBe(1);
  });

  test('contenteditable recebe o texto', async ({ site }, info) => {
    const { page } = site;
    await open(page);
    await page.locator('#ce').focus();
    await typeKeys(page, info, ['p', '~^', 'a', 'o']);
    await expect(page.locator('#ce')).toHaveText('pão');
  });

  test('Fechar restaura o inputmode do campo e desfaz a reserva de espaço', async ({
    site,
  }, info) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() =>
      document.getElementById('t').setAttribute('inputmode', 'text'),
    );
    await openPanel(page);
    await page.locator('#ms-sec-pageTools-btn').click();
    await page.locator('[data-action="virtual-keyboard"]').click();
    await page.locator('#t').focus();
    const mode = () => page.locator('#t').getAttribute('inputmode');
    expect(await mode()).toBe(isMobile(info) ? 'none' : 'text');
    expect(
      await page.evaluate(() =>
        parseFloat(getComputedStyle(document.body).paddingBottom),
      ),
    ).toBeGreaterThan(30);
    await press(page, info, 'Fechar');
    await expect(page.locator(KB)).toHaveCount(0);
    expect(await mode()).toBe('text');
    expect(
      await page.evaluate(() =>
        parseFloat(getComputedStyle(document.body).paddingBottom),
      ),
    ).toBeLessThanOrEqual(16);
  });

  test('o teclado não cobre o campo (rola para cima dele) e as teclas têm tamanho mínimo', async ({
    site,
  }) => {
    const { page } = site;
    await open(page);
    await page.locator('#last').focus();
    await expect(page.locator(`${KB} [data-vk-keys]`)).toBeVisible();
    const m = await page.evaluate(() => {
      const kb = document
        .getElementById('ms-virtual-keyboard')
        .getBoundingClientRect();
      const f = document.getElementById('last').getBoundingClientRect();
      const keys = [
        ...document.querySelectorAll('#ms-virtual-keyboard [data-vk]'),
      ].map((b) => {
        const r = b.getBoundingClientRect();
        return { w: r.width, h: r.height };
      });
      return {
        kbTop: kb.top,
        fBottom: f.bottom,
        fTop: f.top,
        minW: Math.min(...keys.map((k) => k.w)),
        minH: Math.min(...keys.map((k) => k.h)),
      };
    });
    expect(m.fBottom).toBeLessThanOrEqual(m.kbTop);
    expect(m.fTop).toBeGreaterThanOrEqual(0);
    expect(m.minW).toBeGreaterThanOrEqual(24); // WCAG 2.5.8 (mínimo)
    expect(m.minH).toBeGreaterThanOrEqual(40);
  });

  test('"Desligar tudo" fecha o teclado', async ({ site }) => {
    const { page } = site;
    await open(page);
    await page.keyboard.press('Alt+Shift+A'); // o FAB está escondido: o atalho abre o painel
    await expect(page.locator('#ms-a11y-panel')).toBeVisible();
    await page.locator('[data-action="reset-all"]').click();
    await expect(page.locator(KB)).toHaveCount(0);
  });

  test('QA H1: campo numérico aceita 1.5, -5 e 1,5 (vírgula vira ponto)', async ({
    site,
  }, info) => {
    const { page } = site;
    await open(page);
    const num = page.locator('#num');
    for (const [seq, out] of [
      [['1!', '.>', '5%'], '1.5'],
      [['-_', '5%'], '-5'],
      [['1!', ',<', '5%'], '1.5'],
    ]) {
      await page.evaluate(() => (document.getElementById('num').value = ''));
      await num.focus();
      for (const k of seq) await press(page, info, k);
      await expect(num).toHaveValue(out);
    }
    // texto intermediário aparece na linha "Digitando:"
    await page.evaluate(() => (document.getElementById('num').value = ''));
    await num.focus();
    await typeKeys(page, info, ['1!', '.>']);
    await expect(page.locator(`${KB} [data-vk-preview]`)).toHaveText(
      'Digitando: 1.',
    );
    await press(page, info, '5%');
    await expect(page.locator(`${KB} [data-vk-preview]`)).toBeHidden();
    expect(await active(page)).toBe('num');
  });

  test('QA M1: a 390x844 o teclado inteiro cabe, sem rolagem interna, com a linha de baixo na tela', async ({
    site,
  }) => {
    const { page } = site;
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    await page.locator('#t').focus();
    await expect(page.locator(`${KB} [data-vk-keys]`)).toBeVisible();
    const m = await page.evaluate(() => {
      const sc = document.querySelector(
        '#ms-virtual-keyboard [data-vk-scroll]',
      );
      const rects = [
        ...document.querySelectorAll('#ms-virtual-keyboard [data-vk]'),
      ].map((b) => b.getBoundingClientRect());
      return {
        overflow: sc.scrollHeight - sc.clientHeight,
        top: Math.min(...rects.map((r) => r.top)),
        bottom: Math.max(...rects.map((r) => r.bottom)),
        right: Math.max(...rects.map((r) => r.right)),
        vh: innerHeight,
        vw: innerWidth,
      };
    });
    expect(m.overflow).toBeLessThanOrEqual(1);
    expect(m.top).toBeGreaterThanOrEqual(0);
    expect(m.bottom).toBeLessThanOrEqual(m.vh);
    expect(m.right).toBeLessThanOrEqual(m.vw);
    for (const d of ['Space', 'Enter', 'Fechar']) {
      await expect(page.locator(`${KB} [data-vk="${d}"]`)).toBeInViewport({
        ratio: 1,
      });
    }
  });

  test('QA M1: a 390x600 as linhas rolam, a linha de baixo fica sempre visível e o campo aparece acima do teclado', async ({
    site,
  }) => {
    const { page } = site;
    await page.setViewportSize({ width: 390, height: 600 });
    await open(page);
    await page.locator('#last').focus();
    await expect(page.locator(`${KB} [data-vk-keys]`)).toBeVisible();
    for (const d of ['Space', 'Enter', 'Fechar']) {
      await expect(page.locator(`${KB} [data-vk="${d}"]`)).toBeInViewport({
        ratio: 1,
      });
    }
    const m = await page.evaluate(() => {
      const kb = document
        .getElementById('ms-virtual-keyboard')
        .getBoundingClientRect();
      const f = document.getElementById('last').getBoundingClientRect();
      return {
        kbTop: kb.top,
        kbBottom: kb.bottom,
        fBottom: f.bottom,
        fTop: f.top,
        vh: innerHeight,
      };
    });
    expect(m.kbBottom).toBeLessThanOrEqual(m.vh);
    expect(m.fBottom).toBeLessThanOrEqual(m.kbTop);
    expect(m.fTop).toBeGreaterThanOrEqual(0);
  });

  test('QA M2: o botão flutuante some com o teclado aberto e volta ao fechar', async ({
    site,
  }) => {
    const { page } = site;
    await open(page);
    await expect(page.locator('#ms-fab')).toBeHidden();
    // sem campo focado só a dica aparece: o Fechar dela fecha o teclado
    await page.locator(`${KB} [data-vk-hint-close]`).click();
    await expect(page.locator(KB)).toHaveCount(0);
    await expect(page.locator('#ms-fab')).toBeVisible();
  });

  test('QA M3: com um campo focado, a grade de mouse abre e clica numa tecla do teclado: o caractere vai para o campo', async ({
    site,
  }) => {
    const { page } = site;
    await open(page);
    await page.locator('#t').focus();
    await page.locator(`${KB} [data-vk="Fechar"]`).focus(); // foco na UI da lib: mantém o campo
    await expect(page.locator(`${KB} [data-vk-keys]`)).toBeVisible();
    await page.keyboard.press('Alt+Shift+G');
    await expect(page.locator('#ms-mouse-grid')).toBeVisible();
    await expect(page.locator(`${KB} [data-vk-keys]`)).toBeVisible();
    const target = await page.locator(`${KB} [data-vk="Space"]`).boundingBox();
    const cx = target.x + target.width / 2;
    const cy = target.y + target.height / 2;
    for (let i = 0; i < 12; i++) {
      const cells = await page.$$eval('#ms-mouse-grid [data-cell]', (bs) =>
        bs.map((b) => {
          const r = b.getBoundingClientRect();
          return {
            n: b.dataset.cell,
            l: r.left,
            t: r.top,
            r: r.right,
            b: r.bottom,
          };
        }),
      );
      if (!cells.length) break;
      const c = cells.find(
        (k) => cx >= k.l && cx <= k.r && cy >= k.t && cy <= k.b,
      );
      expect(c, 'a tecla está dentro da grade').toBeTruthy();
      await page.keyboard.press(`Digit${c.n}`);
    }
    await page.keyboard.press('Enter');
    await expect(page.locator('#ms-mouse-grid')).toHaveCount(0);
    await expect(page.locator('#t')).toHaveValue(' ');
  });

  test('QA L3: Enter em formulário de vários campos sem botão de envio não envia (como o Enter nativo)', async ({
    site,
  }, info) => {
    const { page } = site;
    await open(page);
    await page.locator('#m1').focus();
    await typeKeys(page, info, ['a', 'Enter']);
    expect(await page.evaluate(() => window.__multi)).toBe(0);
    // o form de um campo só (+ botão) continua enviando
    await page.locator('#q').focus();
    await press(page, info, 'Enter');
    expect(await page.evaluate(() => window.__submits)).toBe(1);
  });
});
