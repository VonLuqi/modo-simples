import { test, expect, waitForLib, expectNoNewViolations } from './helpers.js';

/**
 * F11b / T179 — tutorial guiado do demo (ADR-016): auto na 1ª visita, botão "Tutorial" para rever.
 * Liga UMA ferramenta por passo (efeito visível), desliga ao avançar e devolve tudo ao estado do
 * visitante no fim / Pular / Esc. Depois, botão "Responder formulário" no canto. Também: um só
 * "Pesquisar" por modo e cabeçalho sem sobreposição.
 */
const INDEX = '/examples/index.html';
const PESQUISA = '/examples/pesquisa.html';
const FORM = 'https://forms.cloud.microsoft/r/ZuaZ4S0i9t';
const STEPS = 31;
const KEY = 'ms-demo-tutorial-seen';
const CORNER_KEY = 'ms-demo-tutorial-corner';
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

const tut = (page) => page.locator('#ms-tutorial');
const balloon = (page) => page.locator('.ms-tut-balloon');
const nextBtn = (page) => page.locator('.ms-tut-btn--primary');
const panel = (page) => page.locator('#ms-a11y-panel');
const corner = (page) => page.locator('#ms-tut-corner');
const count = (page) => page.locator('.ms-tut-count');

/** Tudo que o visitante configurou: storage ms_*, todos os controles do painel e classes do <html>. */
const uiState = (page) =>
  page.evaluate(() => {
    const store = Object.fromEntries(
      Object.entries(localStorage).filter(([k]) => k.startsWith('ms_')),
    );
    const sr = document.getElementById('ms-container').shadowRoot;
    const controls = [
      ...sr.querySelectorAll(
        '[aria-checked], [aria-pressed], [data-range], [data-picker]',
      ),
    ].map(
      (n) =>
        n.getAttribute('aria-checked') ??
        n.getAttribute('aria-pressed') ??
        n.value,
    );
    const custom = [...sr.querySelectorAll('.ms-profile-custom')].map(
      (n) => n.hidden,
    );
    return {
      store,
      controls,
      custom,
      htmlClass: document.documentElement.className,
      htmlStyle: document.documentElement.getAttribute('style') || '',
    };
  });

/** A ferramenta do passo está ligada? (null = não dá para afirmar neste navegador) */
const toolOn = (page, tool) =>
  page.evaluate((t) => {
    const sr = document.getElementById('ms-container').shadowRoot;
    const q = (s) => sr.querySelector(s);
    if (t.t === 'switch') {
      const b = q(`.ms-switch[data-option="${t.o}"]`);
      return b.disabled ? null : b.getAttribute('aria-checked') === 'true';
    }
    if (t.t === 'radio') {
      const r = q(`[data-option="${t.o}"] [role="radio"][aria-checked="true"]`);
      return (r ? r.getAttribute('data-value') : '') !== t.off;
    }
    if (t.t === 'range') {
      return [...sr.querySelectorAll('[data-range]')].some(
        (i) => i.value !== '0',
      );
    }
    if (t.t === 'outline') return !!q('.ms-outline');
    if (t.t === 'grid') return !!document.getElementById('ms-mouse-grid');
    if (t.t === 'vk') return !!document.getElementById('ms-virtual-keyboard');
    if (t.t === 'profile') {
      return (
        q(`.ms-profile[data-profile="${t.v}"]`).getAttribute('aria-pressed') ===
        'true'
      );
    }
    if (t.t === 'modo') {
      return (
        q('[data-action="modo-simples"]').getAttribute('aria-checked') ===
        'true'
      );
    }
    return null; // speak: depende de voz do sistema
  }, tool);

const getSteps = (page) =>
  page.evaluate(() =>
    window.MSTutorialStrings.steps.map((s) => ({
      tool: s.tool || null,
      final: !!s.final,
    })),
  );

/** Visitante com ajustes próprios, feitos pelo painel (switches, escala, tema, perfil). */
const configurarVisitante = (page, comPerfil) =>
  page.evaluate(async (perfil) => {
    const sr = document.getElementById('ms-container').shadowRoot;
    const click = (s) => sr.querySelector(s).click();
    sr.querySelector('#ms-fab').click();
    if (perfil) click('.ms-profile[data-profile="dyslexia"]');
    click('.ms-switch[data-option="highlightLinks"]');
    click('.ms-switch[data-option="strongFocus"]');
    click('[data-option="textScale"] [data-value="125"]');
    click('[data-option="colorTheme"] [data-value="soft"]');
    await new Promise((r) => setTimeout(r, 300));
    sr.querySelector('.ms-a11y-close').click();
    await new Promise((r) => setTimeout(r, 300));
  }, comPerfil);

/** Abre o tutorial pelo botão e avança `n` passos pelo teclado (Enter no Próximo). */
async function iniciar(page) {
  await page.locator('.header-tutorial').click();
  await expect(count(page)).toHaveText(`Passo 1 de ${STEPS}`);
}
async function avancar(page, ate) {
  for (let n = 2; n <= ate; n++) {
    await nextBtn(page).focus();
    await page.keyboard.press('Enter');
    await expect(count(page)).toHaveText(`Passo ${n} de ${STEPS}`);
  }
}

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
    await expect(count(page)).toHaveText(`Passo 1 de ${STEPS}`);
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe('1');
    await expect(corner(page)).toHaveCount(0); // escondido enquanto o tutorial roda

    await page.reload();
    await waitForLib(page);
    await page.waitForTimeout(400);
    await expect(tut(page)).toHaveCount(0);
    await expect(corner(page)).toHaveCount(0); // ainda não terminou o tutorial
  });

  test('Esc no tutorial aberto sozinho: foco no botão Tutorial (não no FAB) e aviso', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await expect(balloon(page)).toBeFocused();
    await nextBtn(page).click(); // painel aberto pelo tutorial
    await expect(panel(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tut(page)).toHaveCount(0);
    await expect(panel(page)).toBeHidden();
    await expect(page.locator('.header-tutorial')).toBeFocused();
    await expect(page.locator('#ms-tutorial-live')).toHaveText(
      'Tutorial encerrado.',
    );
  });
});

test('Esc no replay (botão Tutorial): foco volta ao botão Tutorial', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await iniciar(page);
  await nextBtn(page).click();
  await expect(panel(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tut(page)).toHaveCount(0);
  await expect(page.locator('.header-tutorial')).toBeFocused();
});

test('Esc no Modo Simples: foco na pílula Tutorial (cabeçalho oculto)', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await page.evaluate(() => window.ModoSimples.enable());
  await page.evaluate(() => window.MSTutorial.start()); // sem opener útil
  await expect(tut(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tut(page)).toHaveCount(0);
  await expect(page.locator('.ms-pill--tutorial')).toBeFocused();
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

test('percurso completo só com teclado: cada passo liga a ferramenta e desliga ao avançar; estado idêntico no fim', async ({
  site,
}, testInfo) => {
  test.setTimeout(240_000);
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  const before = await uiState(page);

  await iniciar(page);
  const steps = await getSteps(page);
  expect(steps).toHaveLength(STEPS);
  const live = page.locator('#ms-tutorial-live');
  await expect(live).toContainText(`Passo 1 de ${STEPS}`);
  const vp = page.viewportSize();
  const link = page.locator('.ms-tut-link');
  const shots = new Set([1, 8, 14, 21, 30]);
  let prev = null;

  for (let i = 0; i < STEPS; i++) {
    if (i > 0) {
      await nextBtn(page).focus();
      await page.keyboard.press('Enter');
      await expect(count(page)).toHaveText(`Passo ${i + 1} de ${STEPS}`);
    }
    // a ferramenta do passo anterior desligou ao avançar
    if (prev)
      expect(await toolOn(page, prev), `${i - 1} desligada`).not.toBe(true);

    const step = steps[i];
    if (step.tool) {
      const on = await toolOn(page, step.tool);
      if (on !== null) expect(on, `passo ${i + 1} ligado`).toBe(true);
    }
    // formulário "Responder agora" só no último passo
    if (step.final) await expect(link).toBeVisible();
    else await expect(link).toBeHidden();
    // o foco nunca sai do balão
    expect(
      await balloon(page).evaluate((b) => b.contains(document.activeElement)),
    ).toBe(true);
    // balão dentro da tela
    const box = await balloon(page).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
    expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
    if (process.env.F11_SHOTS && shots.has(i)) {
      await page.screenshot({
        path: `${process.env.F11_SHOTS}/${testInfo.project.name}-passo-${String(i + 1).padStart(2, '0')}.png`,
      });
    }
    // o tutorial não fica inert enquanto o painel está aberto
    expect(await tut(page).evaluate((n) => n.hasAttribute('inert'))).toBe(
      false,
    );
    // no último passo tudo já voltou ao estado do visitante
    if (step.final) expect(await uiState(page)).toEqual(before);
    prev = step.tool;
  }

  await expect(nextBtn(page)).toHaveText('Explorar sozinho');
  await expect(page.getByRole('button', { name: 'Pular' })).toBeHidden();
  await expect(link).toHaveAttribute('href', FORM);
  await expect(link).toHaveAttribute('target', '_blank');
  expect(await link.getAttribute('rel')).toContain('noopener');

  await page.keyboard.press('Enter'); // Explorar sozinho
  await expect(tut(page)).toHaveCount(0);
  await expect(panel(page)).toBeHidden(); // estava fechado: volta fechado
  await expect(page.locator('#ms-fab')).toBeFocused();
  expect(await uiState(page)).toEqual(before);
  await expect(corner(page)).toBeVisible();
});

for (const perfil of [false, true]) {
  const quem = perfil ? 'com perfil Dislexia + ajuste' : 'com ajustes próprios';

  test(`visitante ${quem}: estado idêntico após o percurso inteiro`, async ({
    site,
  }) => {
    test.setTimeout(240_000);
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await configurarVisitante(page, perfil);
    const before = await uiState(page);
    expect(Object.keys(before.store).length).toBeGreaterThan(0);

    await iniciar(page);
    await avancar(page, STEPS);
    await nextBtn(page).focus();
    await page.keyboard.press('Enter'); // Explorar sozinho
    await expect(tut(page)).toHaveCount(0);
    expect(await uiState(page)).toEqual(before);
  });

  test(`visitante ${quem}: estado idêntico após Pular no meio`, async ({
    site,
  }) => {
    test.setTimeout(120_000);
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await configurarVisitante(page, perfil);
    const before = await uiState(page);

    await iniciar(page);
    await avancar(page, 12);
    await page.getByRole('button', { name: 'Pular' }).click();
    await expect(tut(page)).toHaveCount(0);
    expect(await uiState(page)).toEqual(before);
    await expect(corner(page)).toBeVisible();
  });

  test(`visitante ${quem}: estado idêntico após Esc no meio (grade de mouse aberta)`, async ({
    site,
  }) => {
    test.setTimeout(120_000);
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await configurarVisitante(page, perfil);
    const before = await uiState(page);

    await iniciar(page);
    await avancar(page, 21); // 21 = grade de mouse
    expect(await page.locator('#ms-mouse-grid').count()).toBe(1);
    await page.keyboard.press('Escape');
    await expect(tut(page)).toHaveCount(0);
    await expect(page.locator('#ms-mouse-grid')).toHaveCount(0);
    expect(await uiState(page)).toEqual(before);
  });
}

test('Esc no teclado virtual (passo 22): fecha o teclado e restaura tudo', async ({
  site,
}) => {
  test.setTimeout(120_000);
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  const before = await uiState(page);
  await iniciar(page);
  await avancar(page, 22);
  await expect(page.locator('#ms-virtual-keyboard')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(tut(page)).toHaveCount(0);
  await expect(page.locator('#ms-virtual-keyboard')).toHaveCount(0);
  expect(await uiState(page)).toEqual(before);
});

test('sair da página no meio do tutorial devolve o storage do visitante', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await configurarVisitante(page, false);
  const before = await uiState(page);
  await iniciar(page);
  await avancar(page, 6);
  await page.goto(PESQUISA);
  await waitForLib(page);
  expect((await uiState(page)).store).toEqual(before.store);
});

test('fluxo: Voltar do último passo volta a demonstrar; Back ao 1º restaura', async ({
  site,
}) => {
  test.setTimeout(240_000);
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  const before = await uiState(page);
  await iniciar(page);
  await avancar(page, 3);
  await page.getByRole('button', { name: 'Voltar' }).focus();
  await page.keyboard.press('Enter');
  await expect(count(page)).toHaveText(`Passo 2 de ${STEPS}`);
  expect(await toolOn(page, (await getSteps(page))[1].tool)).toBe(true);
  await page.keyboard.press('Enter'); // Voltar (foco continua nele)
  await expect(count(page)).toHaveText(`Passo 1 de ${STEPS}`);
  expect(await uiState(page)).toEqual(before); // intro: nada ligado
  await page.keyboard.press('Escape');
  await expect(tut(page)).toHaveCount(0);
});

test('Esc fecha só o tutorial; painel aberto antes continua aberto', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);

  await iniciar(page);
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

test('Recolher o balão esconde o texto e mantém Próximo/Voltar', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await iniciar(page);
  await nextBtn(page).click(); // passo 2 (ferramenta)
  const peek = page.locator('.ms-tut-peek');
  await expect(peek).toHaveAttribute('aria-expanded', 'true');
  await peek.click();
  await expect(peek).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.ms-tut-text')).toBeHidden();
  await expect(nextBtn(page)).toBeVisible();
  await nextBtn(page).click();
  await expect(page.locator('.ms-tut-text')).toBeHidden(); // vale para os próximos passos
});

test('sobreposições: balão livre do conteúdo, sem anel velho, teclado virtual com teclas (T181)', async ({
  site,
}, testInfo) => {
  test.setTimeout(240_000);
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await iniciar(page);
  const steps = await getSteps(page);
  const vp = page.viewportSize();
  const shots = new Set([6, 20, 21, 22, 28]);
  const cruza = (a, b) =>
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height;
  const visto = new Set();

  for (let i = 1; i < STEPS; i++) {
    await nextBtn(page).focus();
    await page.keyboard.press('Enter');
    await expect(count(page)).toHaveText(`Passo ${i + 1} de ${STEPS}`);
    const t = steps[i].tool;
    const n = i + 1;
    if (process.env.F11_SHOTS && shots.has(n)) {
      await page.waitForTimeout(350); // passa o fade de entrada do balão
      await page.screenshot({
        path: `${process.env.F11_SHOTS}/${testInfo.project.name}-passo-${String(n).padStart(2, '0')}.png`,
      });
    }
    if (!t) continue;
    const bb = await balloon(page).boundingBox();
    if (t.t === 'switch' && t.o === 'showShortcuts') {
      const card = await page.locator('#ms-shortcuts-card').boundingBox();
      expect(cruza(bb, card), 'balão cobre o cartão de atalhos').toBe(false);
      visto.add('atalhos');
    }
    if (t.t === 'outline') {
      const o = await page.locator('.ms-outline').boundingBox();
      expect(cruza(bb, o), 'balão cobre a estrutura').toBe(false);
      await expect(page.locator('.ms-tut-spot')).toBeHidden();
      visto.add('estrutura');
    }
    if (t.t === 'grid') {
      const cel1 = { x: 0, y: 0, width: vp.width / 3, height: vp.height / 3 };
      expect(cruza(bb, cel1), 'balão cobre a célula 1').toBe(false);
      await expect(page.locator('.ms-tut-spot')).toBeHidden();
      visto.add('grade');
    }
    if (t.t === 'vk') {
      const vk = page.locator('#ms-virtual-keyboard');
      const k = await vk.boundingBox();
      expect(cruza(bb, k), 'balão cobre o teclado virtual').toBe(false);
      await expect(page.locator('.ms-tut-spot')).toBeHidden();
      // com o campo de teste em foco as teclas aparecem (não só "Toque num campo")
      await expect(page.locator('.ms-tut-demo')).toBeFocused();
      expect(await vk.locator('button').count()).toBeGreaterThan(20);
      visto.add('teclado');
    }
  }
  expect([...visto].sort()).toEqual([
    'atalhos',
    'estrutura',
    'grade',
    'teclado',
  ]);
  // o campo de teste some ao sair do passo
  await expect(page.locator('.ms-tut-demo')).toHaveCount(0);
});

test('axe não acusa violação nova em passo de ferramenta (painel aberto)', async ({
  site,
}, testInfo) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await iniciar(page);
  await avancar(page, 3);
  await expectNoNewViolations(page, testInfo, 'f11/tutorial-passo-3');
});

test.describe('botão "Responder formulário" no canto', () => {
  const FINS = ['Explorar sozinho', 'Pular', 'Esc'];

  async function encerrar(page, como) {
    await iniciar(page);
    if (como === 'Explorar sozinho') {
      await avancar(page, STEPS);
      await nextBtn(page).focus();
      await page.keyboard.press('Enter');
    } else if (como === 'Pular') {
      await page.getByRole('button', { name: 'Pular' }).click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(tut(page)).toHaveCount(0);
  }

  test('ausente antes do tutorial; escondido enquanto ele roda', async ({
    site,
  }) => {
    const { page } = site;
    for (const p of PAGES) {
      await page.goto(`/examples/${p}.html`);
      await waitForLib(page);
      await expect(corner(page)).toHaveCount(0);
    }
    await page.goto(INDEX);
    await waitForLib(page);
    await iniciar(page);
    await expect(corner(page)).toHaveCount(0);
  });

  for (const como of FINS) {
    test(`aparece depois de ${como}, nas 8 páginas, com link seguro`, async ({
      site,
    }) => {
      test.setTimeout(como === FINS[0] ? 240_000 : 120_000);
      const { page } = site;
      await page.goto(INDEX);
      await waitForLib(page);
      await encerrar(page, como);
      for (const p of PAGES) {
        await page.goto(`/examples/${p}.html`);
        await waitForLib(page);
        const link = corner(page).getByRole('link', {
          name: /Responder formulário/,
        });
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', FORM);
        await expect(link).toHaveAttribute('target', '_blank');
        expect(await link.getAttribute('rel')).toContain('noopener');
        expect(await link.getAttribute('rel')).toContain('noreferrer');
      }
    });
  }

  test('alcançável pelo teclado e dispensável; a escolha persiste nas páginas', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await encerrar(page, 'Pular');
    const link = corner(page).getByRole('link', {
      name: /Responder formulário/,
    });
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press('Tab');
    const x = corner(page).getByRole('button', { name: /Dispensar/ });
    await expect(x).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(corner(page)).toHaveCount(0);
    expect(
      await page.evaluate((k) => localStorage.getItem(k), CORNER_KEY),
    ).toBe('x');
    for (const p of ['sobrenos', 'pesquisa']) {
      await page.goto(`/examples/${p}.html`);
      await waitForLib(page);
      await page.waitForTimeout(300);
      await expect(corner(page)).toHaveCount(0);
    }
  });

  test('a 320px não encosta no FAB (T181 L4)', async ({ site }, testInfo) => {
    const { page } = site;
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(INDEX);
    await waitForLib(page);
    await encerrar(page, 'Pular');
    await expect(corner(page)).toBeVisible();
    const a = await corner(page).boundingBox();
    const b = await page.locator('#ms-fab').boundingBox();
    expect(a.x + a.width).toBeLessThanOrEqual(b.x - 4);
    expect(a.x + a.width).toBeLessThanOrEqual(320);
    if (process.env.F11_SHOTS) {
      await page.screenshot({
        path: `${process.env.F11_SHOTS}/${testInfo.project.name}-canto-320.png`,
      });
    }
  });

  test('não sobrepõe o botão da lib (FAB)', async ({ site }, testInfo) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await encerrar(page, 'Pular');
    await expect(corner(page)).toBeVisible();
    const a = await corner(page).boundingBox();
    const b = await page.locator('#ms-fab').boundingBox();
    const cruza =
      a.x < b.x + b.width &&
      b.x < a.x + a.width &&
      a.y < b.y + b.height &&
      b.y < a.y + a.height;
    expect(cruza, 'canto cruza o FAB').toBe(false);
    const vp = page.viewportSize();
    expect(a.x).toBeGreaterThanOrEqual(0);
    expect(a.x + a.width).toBeLessThanOrEqual(vp.width);
    if (process.env.F11_SHOTS) {
      await page.screenshot({
        path: `${process.env.F11_SHOTS}/${testInfo.project.name}-canto.png`,
      });
    }
  });

  test('some com o teclado virtual aberto', async ({ site }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await encerrar(page, 'Pular');
    await expect(corner(page)).toBeVisible();
    await page.evaluate(() => {
      const sr = document.getElementById('ms-container').shadowRoot;
      sr.querySelector('#ms-fab').click();
    });
    await page
      .locator('[data-action="virtual-keyboard"]')
      .evaluate((b) => b.click());
    await expect(page.locator('#ms-virtual-keyboard')).toHaveCount(1);
    await expect(corner(page)).toBeHidden();
  });
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
