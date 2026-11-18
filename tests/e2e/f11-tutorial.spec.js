import { test, expect, waitForLib, expectNoNewViolations } from './helpers.js';

/**
 * F11b — tutorial guiado do demo (ADR-016): auto na 1ª visita, botão "Tutorial" para rever,
 * destaca cada parte do painel sem mudar nenhuma configuração. Também: um só "Pesquisar" por modo.
 */
const INDEX = '/examples/index.html';
const PESQUISA = '/examples/pesquisa.html';
const FORM = 'https://forms.cloud.microsoft/r/ZuaZ4S0i9t';
const STEPS = 10;
const KEY = 'ms-demo-tutorial-seen';

const tut = (page) => page.locator('#ms-tutorial');
const balloon = (page) => page.locator('.ms-tut-balloon');
const nextBtn = (page) => page.locator('.ms-tut-btn--primary');
const panel = (page) => page.locator('#ms-a11y-panel');

/** Fotografia do que o visitante configurou: storage (sem a flag do tutorial) + switches do painel. */
const snapshot = (page) =>
  page.evaluate((key) => {
    const store = Object.fromEntries(
      Object.entries(localStorage).filter(([k]) => k !== key),
    );
    const sr = document.getElementById('ms-container').shadowRoot;
    const checked = [...sr.querySelectorAll('[aria-checked]')].map((n) =>
      n.getAttribute('aria-checked'),
    );
    return { store, checked, htmlClass: document.documentElement.className };
  }, KEY);

test.describe('primeira visita', () => {
  test.use({ tutorialSeen: false });

  test('abre sozinho uma vez, com foco no balão, e não volta ao recarregar', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await expect(tut(page)).toBeVisible();
    await expect(balloon(page)).toBeFocused();
    await expect(page.locator('.ms-tut-count')).toHaveText(
      `Passo 1 de ${STEPS}`,
    );
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe('1');

    await page.reload();
    await waitForLib(page);
    await page.waitForTimeout(400);
    await expect(tut(page)).toHaveCount(0);
  });
});

test('Pular fecha, devolve o foco ao botão Tutorial e o painel segue fechado', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await expect(tut(page)).toHaveCount(0);

  const start = page.locator('.header-tutorial');
  await start.focus();
  await page.keyboard.press('Enter');
  await expect(balloon(page)).toBeFocused();

  await page.keyboard.press('Tab'); // Pular é o 1º foco do balão
  await expect(page.getByRole('button', { name: 'Pular' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(tut(page)).toHaveCount(0);
  await expect(start).toBeFocused();
  await expect(panel(page)).toBeHidden();
  await expect(page.locator('#ms-tutorial-live')).toHaveText(
    'Tutorial encerrado.',
  );
});

test('fluxo só com teclado: percorre os passos, volta, e conclui sem mudar nada', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  const before = await snapshot(page);

  await page.locator('.header-tutorial').click();
  const live = page.locator('#ms-tutorial-live');
  await expect(live).toContainText('Passo 1 de 10');

  // Passo 1 → 2 pelo teclado: o painel abre e o foco continua no balão (não no painel)
  await nextBtn(page).focus();
  await page.keyboard.press('Enter');
  await expect(panel(page)).toBeVisible();
  await expect(nextBtn(page)).toBeFocused();
  await expect(live).toContainText('Passo 2 de 10');

  // Tab nunca sai do balão (o trap do painel da lib não puxa o foco)
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    const inside = await balloon(page).evaluate((b) =>
      b.contains(document.activeElement),
    );
    expect(inside).toBe(true);
  }
  // o tutorial não fica inert enquanto o painel está aberto
  expect(await tut(page).evaluate((n) => n.hasAttribute('inert'))).toBe(false);

  await nextBtn(page).focus();
  await page.keyboard.press('Enter'); // 3 (Texto e leitura)
  await expect(page.locator('.ms-tut-title')).toHaveText('Texto e leitura');
  await expect(page.locator('.ms-tut-tools li').first()).toBeVisible();

  await page.getByRole('button', { name: 'Voltar' }).focus();
  await page.keyboard.press('Enter');
  await expect(live).toContainText('Passo 2 de 10');
  await nextBtn(page).focus();

  for (let n = 3; n <= STEPS; n++) {
    await page.keyboard.press('Enter');
    await expect(page.locator('.ms-tut-count')).toHaveText(
      `Passo ${n} de ${STEPS}`,
    );
  }
  await expect(nextBtn(page)).toHaveText('Concluir');
  await expect(page.getByRole('button', { name: 'Pular' })).toBeHidden();
  const link = page.getByRole('link', { name: /Responder ao formulário/ });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', FORM);
  await expect(link).toHaveAttribute('target', '_blank');
  expect(await link.getAttribute('rel')).toContain('noopener');

  await page.keyboard.press('Enter'); // Concluir
  await expect(tut(page)).toHaveCount(0);
  await expect(panel(page)).toBeHidden(); // estava fechado: volta fechado

  expect(await snapshot(page)).toEqual(before);
});

test('Esc fecha só o tutorial; painel aberto antes continua aberto', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);

  await page.locator('.header-tutorial').click();
  await nextBtn(page).focus();
  await page.keyboard.press('Enter'); // painel aberto pelo tutorial
  await expect(panel(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tut(page)).toHaveCount(0);
  await expect(panel(page)).toBeHidden(); // abrimos nós: fechamos nós

  // painel aberto pelo visitante antes do tutorial: continua aberto no fim
  await page.locator('#ms-fab').click();
  await expect(panel(page)).toBeVisible();
  await page.evaluate(() => window.MSTutorial.start());
  await expect(tut(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tut(page)).toHaveCount(0);
  await expect(panel(page)).toBeVisible();
});

test('clique no balão não fecha o painel (clicar fora da lib)', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await page.locator('.header-tutorial').click();
  await nextBtn(page).click();
  await expect(panel(page)).toBeVisible();
  await nextBtn(page).click();
  await expect(panel(page)).toBeVisible();
  await expect(page.locator('.ms-tut-count')).toHaveText(`Passo 3 de ${STEPS}`);
});

test('balão cabe na tela e axe não acusa violação nova no passo do painel', async ({
  site,
}, testInfo) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await page.locator('.header-tutorial').click();
  await nextBtn(page).click(); // passo 2: painel aberto

  const vp = page.viewportSize();
  for (let n = 2; n <= STEPS; n++) {
    const box = await balloon(page).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
    expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
    if (process.env.F11_SHOTS) {
      await page.screenshot({
        path: `${process.env.F11_SHOTS}/${testInfo.project.name}-passo-${String(n).padStart(2, '0')}.png`,
      });
    }
    if (n === 3) {
      await expectNoNewViolations(page, testInfo, 'f11/tutorial-passo-3');
    }
    if (n < STEPS) await nextBtn(page).click();
  }
});

test('passo 1 (botão) cabe na tela', async ({ site }, testInfo) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await page.locator('.header-tutorial').click();
  const box = await balloon(page).boundingBox();
  const vp = page.viewportSize();
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
  if (process.env.F11_SHOTS) {
    await page.screenshot({
      path: `${process.env.F11_SHOTS}/${testInfo.project.name}-passo-01.png`,
    });
  }
});

test.describe('um só "Pesquisar" por modo', () => {
  const visiveis = (page) =>
    page.evaluate(() => {
      const vis = (n) => {
        const r = n.getBoundingClientRect();
        const cs = getComputedStyle(n);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden';
      };
      return [...document.querySelectorAll('header a[href="pesquisa.html"]')]
        .filter(vis)
        .map((a) => a.className || 'nav-link');
    });

  test('pesquisa.html: só o link do nav (aria-current), sem o botão repetido', async ({
    site,
  }, testInfo) => {
    const { page } = site;
    await page.goto(PESQUISA);
    await waitForLib(page);
    // no mobile o nav é recolhido: abre o Menu para o link existir na tela
    const toggle = page.locator('.nav-toggle');
    if (await toggle.isVisible()) await toggle.click();
    expect(await visiveis(page)).toEqual(['nav-link']);
    await expect(
      page.locator('.main-nav a[href="pesquisa.html"]'),
    ).toHaveAttribute('aria-current', 'page');
    if (process.env.F11_SHOTS) {
      await page.screenshot({
        path: `${process.env.F11_SHOTS}/${testInfo.project.name}-pesquisa.png`,
      });
    }
  });

  test('Modo Simples: nenhum "Pesquisar" duplicado e o Tutorial segue acessível (pílula)', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PESQUISA);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());
    await expect(page.locator('html.ms-ativo')).toHaveCount(1);
    expect((await visiveis(page)).length).toBeLessThanOrEqual(1);
    const pilula = page.locator('.ms-pill--tutorial');
    await expect(pilula).toBeVisible();
    await pilula.click();
    await expect(tut(page)).toBeVisible();
  });

  test('index.html: botão e link seguem como antes (sem aria-current duplo)', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await expect(page.locator('.header-search')).toBeVisible();
    await expect(page.locator('.header-search')).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

/** Itens do cabeçalho que o visitante vê (folhas: links do nav, Menu, busca, Tutorial, Entrar, chrome da lib). */
const itensDoCabecalho = (page) =>
  page.evaluate(() => {
    const sels = [
      '.site-header .brand',
      '.main-nav .nav-toggle',
      '.main-nav li a',
      '.header-search',
      '.header-tutorial',
      '.site-header__actions .btn',
      '.header-inner > :not(.brand):not(.main-nav):not(.header-search)',
      '.header-inner > :not(.brand):not(.main-nav):not(.header-search) button',
    ];
    const nodes = [
      ...new Set(sels.flatMap((s) => [...document.querySelectorAll(s)])),
    ];
    return nodes
      .map((n) => {
        const r = n.getBoundingClientRect();
        return {
          nome: (n.textContent || n.className || n.tagName).trim().slice(0, 24),
          r: [r.left, r.top, r.right, r.bottom],
          ok:
            r.width > 0 &&
            r.height > 0 &&
            getComputedStyle(n).visibility !== 'hidden',
        };
      })
      .filter((x) => x.ok);
  });

const intersecta = (a, b) =>
  a[0] < b[2] - 0.5 &&
  b[0] < a[2] - 0.5 &&
  a[1] < b[3] - 0.5 &&
  b[1] < a[3] - 0.5;

test.describe('cabeçalho sem sobreposição', () => {
  const PAGES = [
    'index',
    'sobrenos',
    'cursos',
    'psg',
    'unidades',
    'contato',
    'aluno',
    'pesquisa',
  ];

  for (const largura of [1024, 1280, 1440]) {
    test(`${largura}px: itens do cabeçalho não se cruzam (8 páginas)`, async ({
      site,
    }) => {
      const { page } = site;
      await page.setViewportSize({ width: largura, height: 800 });
      for (const p of PAGES) {
        await page.goto(`/examples/${p}.html`);
        await waitForLib(page);
        const itens = await itensDoCabecalho(page);
        expect(itens.length).toBeGreaterThan(6);
        for (let i = 0; i < itens.length; i++) {
          for (let j = i + 1; j < itens.length; j++) {
            // um contido no outro = wrapper e filho (chrome da lib), não sobreposição
            const a = itens[i].r;
            const b = itens[j].r;
            const contem = (x, y) =>
              x[0] <= y[0] && x[1] <= y[1] && x[2] >= y[2] && x[3] >= y[3];
            if (contem(a, b) || contem(b, a)) continue;
            expect(
              intersecta(a, b),
              `${p} @${largura}: "${itens[i].nome}" cruza "${itens[j].nome}"`,
            ).toBe(false);
          }
        }
        if (p === 'index' && process.env.F11_SHOTS && largura < 1440) {
          await page.screenshot({
            path: `${process.env.F11_SHOTS}/desktop-${largura}-index.png`,
            clip: { x: 0, y: 0, width: largura, height: 240 },
          });
        }
      }
    });
  }
});

test('botão Tutorial existe em todas as páginas do demo', async ({ site }) => {
  const { page } = site;
  for (const p of [
    'index',
    'sobrenos',
    'cursos',
    'psg',
    'unidades',
    'contato',
    'aluno',
    'pesquisa',
  ]) {
    await page.goto(`/examples/${p}.html`);
    await expect(page.locator('.header-tutorial')).toHaveCount(1);
    await expect(page.locator('.ms-pill--tutorial')).toHaveCount(1);
  }
});
