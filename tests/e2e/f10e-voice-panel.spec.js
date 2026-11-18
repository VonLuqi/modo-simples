import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F10e — painel: Pausar/Continuar a leitura e interruptor "Comandos de voz" com os avisos
 * (baixar / enviar pela internet), revogar consentimento, status e lista de comandos.
 * speechSynthesis, SpeechRecognition e navigator.permissions são stubs; cliques são de mouse real.
 */
const PAGE = '/tests/e2e/fixtures/generic.html';
const KEY = 'ms_state:127.0.0.1';

/**
 * rec: 'none' | 'local' | 'download' | 'cloud'
 * install: resultado de SpeechRecognition.install (modo 'download')
 */
async function boot(
  page,
  {
    rec = 'local',
    install = true,
    consent = false,
    on = false,
    mic = 'granted',
    shim = true, // false = deixa o UA HeadlessChrome do Playwright (caminho sem available())
  } = {},
) {
  await page.addInitScript(
    ([key, mode, installOk, cs, vc, micState, uaShim]) => {
      // O núcleo não chama available() em HeadlessChrome (queda do renderizador, QA T202):
      // para testar os modos local/baixar, o UA vira "Chrome" como no navegador de verdade.
      if (uaShim) {
        Object.defineProperty(navigator, 'userAgent', {
          configurable: true,
          value: navigator.userAgent.replace('HeadlessChrome', 'Chrome'),
        });
      }
      try {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(
            key,
            JSON.stringify({
              v: 1,
              modoSimples: false,
              options: { voiceCommands: vc, voiceCloudConsent: cs },
            }),
          );
        }
      } catch {
        /* sem storage */
      }
      window.__spoken = [];
      window.__pending = [];
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          speaking: false,
          getVoices: () => [],
          cancel() {
            for (const u of window.__pending.splice(0)) {
              setTimeout(
                () => u.onerror && u.onerror({ error: 'canceled' }),
                0,
              );
            }
          },
          speak(u) {
            window.__spoken.push(u.text);
            window.__pending.push(u);
          },
        },
      });
      Object.defineProperty(navigator, 'permissions', {
        configurable: true,
        value: { query: async () => ({ state: micState }) },
      });
      window.__recs = [];
      window.__installs = [];
      delete window.SpeechRecognition;
      delete window.webkitSpeechRecognition;
      if (mode === 'none') return;
      let installed = false;
      class Rec {
        constructor() {
          window.__recs.push(this);
          this.starts = 0;
          this.aborted = false;
        }
        start() {
          this.starts++;
        }
        abort() {
          this.aborted = true;
        }
      }
      if (mode === 'local') Rec.available = async () => 'available';
      if (mode === 'download') {
        Rec.available = async () => {
          window.__availCalls = (window.__availCalls || 0) + 1;
          // resposta lenta do navegador (window.__slowAvail = ms): dá tempo de um 2º clique
          if (window.__slowAvail) {
            await new Promise((r) => setTimeout(r, window.__slowAvail));
          }
          return installed ? 'available' : 'downloadable';
        };
        Rec.install = async () => {
          window.__installs.push(!!navigator.userActivation?.isActive);
          installed = installOk;
          return installOk;
        };
      }
      window.SpeechRecognition = Rec;
      window.__recError = (error) => {
        window.__recs[window.__recs.length - 1].onerror({ error });
      };
    },
    [KEY, rec, install, consent, on, mic, shim],
  );
  await page.goto(PAGE);
  await waitForLib(page);
  // Contrato T200 do núcleo: ModoSimples.onVoiceStatus(cb) → cancela; voiceStatus. Aqui é um stub
  // controlável (window.__emit) para os testes não dependerem do que o núcleo emite em cada passo.
  await page.evaluate(() => {
    const subs = new Set();
    const ms = window.ModoSimples;
    ms.voiceStatus = 'stopped';
    ms.onVoiceStatus = (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    };
    window.__emit = (s) => {
      ms.voiceStatus = s;
      subs.forEach((cb) => cb(s));
    };
  });
  await openPanel(page);
}

const SW = '[data-option="voiceCommands"]';
const DLG = '.ms-a11y-dialog';
const persisted = (page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)).options, KEY);
const recStarts = (page) =>
  page.evaluate(() => window.__recs.reduce((n, r) => n + r.starts, 0));

/** Clique de verdade (mouse) no centro + confere que o alvo é o que está no ponto e tem >= 44px. */
async function realClick(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(43.5);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const hit = await locator.evaluate(
    (el, [px, py]) => {
      const top = el.getRootNode().elementFromPoint(px, py);
      return !!top && (top === el || el.contains(top));
    },
    [x, y],
  );
  expect(hit).toBe(true);
  await page.mouse.click(x, y);
}

const activeInside = (page, sel) =>
  page.evaluate((s) => {
    const sr = document.getElementById('ms-container').shadowRoot;
    const d = sr.querySelector(s);
    return !!d && d.contains(sr.activeElement);
  }, sel);

test.describe('F10e — Pausar / Continuar', () => {
  test('aparece só enquanto lê; Pausar ↔ Continuar por mouse e teclado; retoma falando', async ({
    site,
  }) => {
    const { page, errors } = site;
    await boot(page);
    const pause = page.locator('[data-action="pause"]');
    await expect(pause).toBeHidden();
    await realClick(page, page.locator('[data-action="speak"]'));
    await expect(pause).toBeVisible();
    await expect(pause).toHaveText('Pausar');
    await expect(pause).toHaveAttribute('aria-label', 'Pausar leitura');

    await realClick(page, pause);
    await expect(pause).toHaveText('Continuar');
    await expect(pause).toHaveAttribute('aria-label', 'Continuar leitura');
    const antes = await page.evaluate(() => window.__spoken.length);

    await pause.focus(); // teclado
    await page.keyboard.press('Enter');
    await expect(pause).toHaveText('Pausar');
    await expect
      .poll(() => page.evaluate(() => window.__spoken.length))
      .toBeGreaterThan(antes);

    await realClick(page, page.locator('[data-action="speak"]')); // Parar
    await expect(pause).toBeHidden();
    expect(errors).toEqual([]);
  });
});

test.describe('F10e — Comandos de voz: avisos e consentimento', () => {
  test('desligado por padrão; local liga direto, sem aviso, e mostra "Ouvindo…"', async ({
    site,
  }) => {
    const { page, errors } = site;
    await boot(page, { rec: 'local' });
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'false');
    expect(await recStarts(page)).toBe(0);
    await realClick(page, page.locator(SW));
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator(DLG)).toHaveCount(0);
    await expect.poll(() => recStarts(page)).toBe(1);
    await expect(page.locator('[data-vc-status]')).toHaveText('');
    await page.evaluate(() => window.__emit('listening'));
    await expect(page.locator('[data-vc-status]')).toHaveText('Ouvindo…');
    expect((await persisted(page)).voiceCommands).toBe(true);
    // desligar pelo mesmo interruptor
    await realClick(page, page.locator(SW));
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'false');
    await page.evaluate(() => window.__emit('stopped'));
    await expect(page.locator('[data-vc-status]')).toHaveText('');
    expect(errors).toEqual([]);
  });

  test('baixar: aviso acessível; [Baixar] instala dentro do clique, liga e devolve o foco ao interruptor', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { rec: 'download', install: true });
    await realClick(page, page.locator(SW));
    const dlg = page.locator(DLG);
    await expect(dlg).toBeVisible();
    await expect(dlg).toHaveAttribute('role', 'dialog');
    await expect(dlg).toHaveAttribute('aria-modal', 'true');
    await expect(dlg).toContainText(
      'Para entender sua voz sem enviar nada para a internet, o navegador precisa baixar o português uma vez. Baixar agora?',
    );
    await expect(dlg.getByRole('heading')).toHaveCount(1);
    expect(await recStarts(page)).toBe(0);
    await realClick(page, dlg.getByRole('button', { name: 'Baixar' }));
    await expect(dlg).toHaveCount(0);
    expect(await page.evaluate(() => window.__installs)).toEqual([true]);
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator(SW)).toBeFocused();
    await expect.poll(() => recStarts(page)).toBe(1);
  });

  test('UA HeadlessChrome (sem shim): não chama available() e cai direto no aviso da internet', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { rec: 'download', shim: false });
    expect(await page.evaluate(() => navigator.userAgent)).toContain(
      'HeadlessChrome',
    );
    await realClick(page, page.locator(SW));
    const dlg = page.locator(DLG);
    await expect(dlg).toContainText('enviado para a empresa do navegador');
    await expect(dlg).not.toContainText('baixar o português');
    expect(await page.evaluate(() => window.__availCalls || 0)).toBe(0);
    await realClick(
      page,
      dlg.getByRole('button', { name: 'Ligar e enviar minha voz' }),
    );
    expect((await persisted(page)).voiceCloudConsent).toBe(true);
  });

  test('L1: fechar o painel com o aviso aberto não deixa nada inerte ao reabrir; foco no Fechar', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { rec: 'download' });
    await realClick(page, page.locator(SW));
    await expect(page.locator(DLG)).toBeVisible();
    await realClick(page, page.locator('#ms-fab')); // fecha o painel por fora
    await expect(page.locator('#ms-a11y-panel')).toBeHidden();
    await page.locator('#ms-fab').click(); // reabre
    await expect(page.locator('#ms-a11y-panel')).toBeVisible();
    await expect(page.locator(DLG)).toHaveCount(0);
    expect(
      await page.evaluate(
        () =>
          document
            .getElementById('ms-container')
            .shadowRoot.querySelectorAll('#ms-a11y-panel [inert]').length,
      ),
    ).toBe(0);
    await expect(page.locator('.ms-a11y-close')).toBeFocused();
    // e o interruptor volta a funcionar
    await realClick(page, page.locator(SW));
    await expect(page.locator(DLG)).toBeVisible();
  });

  test('L2: clique duplo antes do navegador responder abre um único aviso', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { rec: 'download' });
    await page.evaluate(() => {
      window.__slowAvail = 400;
      window.__dlgs = 0;
      const sr = document.getElementById('ms-container').shadowRoot;
      new MutationObserver((ms) => {
        for (const m of ms)
          for (const n of m.addedNodes)
            if (n.classList?.contains('ms-a11y-dialog')) window.__dlgs++;
      }).observe(sr.getElementById('ms-a11y-panel'), { childList: true });
    });
    await page.locator(SW).scrollIntoViewIfNeeded();
    const box = await page.locator(SW).boundingBox();
    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator(DLG)).toHaveCount(1);
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => window.__dlgs)).toBe(1);
  });

  test('Esc cancela só o aviso: painel segue aberto, nada liga, foco volta ao interruptor', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { rec: 'download' });
    await realClick(page, page.locator(SW));
    await expect(page.locator(DLG)).toBeVisible();
    expect(await activeInside(page, DLG)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator(DLG)).toHaveCount(0);
    await expect(page.locator('#ms-a11y-panel')).toBeVisible();
    await expect(page.locator(SW)).toBeFocused();
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'false');
    expect(await page.evaluate(() => window.__installs)).toEqual([]);
    expect(await recStarts(page)).toBe(0);
  });

  test('Tab fica preso no aviso (3 botões) e Shift+Tab também', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { rec: 'download' });
    await realClick(page, page.locator(SW));
    await expect(page.locator(DLG)).toBeVisible();
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Tab');
      expect(await activeInside(page, DLG)).toBe(true);
    }
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await activeInside(page, DLG)).toBe(true);
    }
  });

  test('baixar falha → cai no aviso da internet; [Não ligar] deixa tudo desligado', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { rec: 'download', install: false });
    await realClick(page, page.locator(SW));
    await realClick(
      page,
      page.locator(DLG).getByRole('button', { name: 'Baixar' }),
    );
    const dlg = page.locator(DLG);
    await expect(dlg).toContainText('Não deu para baixar.');
    await expect(dlg).toContainText(
      'Neste navegador, o que você fala é enviado para a empresa do navegador (Google no Chrome, Microsoft no Edge) para ser entendido. O Modo Simples não guarda nada. Quer ligar mesmo assim?',
    );
    await realClick(page, dlg.getByRole('button', { name: 'Não ligar' }));
    await expect(dlg).toHaveCount(0);
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'false');
    const o = await persisted(page);
    expect([o.voiceCommands, o.voiceCloudConsent]).toEqual([false, false]);
    expect(await recStarts(page)).toBe(0);
  });

  test('[Usar pela internet] → aviso de envio; aceitar grava o consentimento antes de ligar', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { rec: 'download' });
    await page.evaluate(() => {
      // registra a ordem em que as duas opções são gravadas
      window.__order = [];
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        try {
          const o = JSON.parse(v).options;
          if (o) window.__order.push([o.voiceCloudConsent, o.voiceCommands]);
        } catch {
          /* outro valor */
        }
        return set.call(this, k, v);
      };
    });
    await realClick(page, page.locator(SW));
    await realClick(
      page,
      page.locator(DLG).getByRole('button', { name: 'Usar pela internet' }),
    );
    await expect(page.locator(DLG)).toContainText('enviado para a empresa');
    await realClick(
      page,
      page
        .locator(DLG)
        .getByRole('button', { name: 'Ligar e enviar minha voz' }),
    );
    await expect(page.locator(DLG)).toHaveCount(0);
    expect((await persisted(page)).voiceCloudConsent).toBe(true);
    const order = await page.evaluate(() => window.__order);
    const iConsent = order.findIndex(([c]) => c === true);
    const iOn = order.findIndex(([, v]) => v === true);
    expect(iConsent).toBeGreaterThanOrEqual(0);
    expect(iConsent).toBeLessThanOrEqual(iOn < 0 ? iConsent : iOn);
  });

  test('só nuvem: aceitar liga e escuta; "Parar de enviar minha voz" revoga tudo', async ({
    site,
  }) => {
    const { page, errors } = site;
    await boot(page, { rec: 'cloud' });
    await expect(page.locator('[data-action="vc-revoke"]')).toBeHidden();
    await realClick(page, page.locator(SW));
    await realClick(
      page,
      page
        .locator(DLG)
        .getByRole('button', { name: 'Ligar e enviar minha voz' }),
    );
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'true');
    await expect.poll(() => recStarts(page)).toBe(1);
    const revoke = page.locator('[data-action="vc-revoke"]');
    await expect(revoke).toBeVisible();
    await expect(revoke).toHaveText('Parar de enviar minha voz');
    await realClick(page, revoke);
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'false');
    await expect(revoke).toBeHidden();
    const o = await persisted(page);
    expect([o.voiceCommands, o.voiceCloudConsent]).toEqual([false, false]);
    expect(await page.evaluate(() => window.__recs[0].aborted)).toBe(true);
    await expect(page.locator('[data-vc-status]')).toHaveText('');
    // sem consentimento, ligar de novo pede o aviso outra vez
    await realClick(page, page.locator(SW));
    await expect(page.locator(DLG)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('consentimento já dado: liga sem novo aviso', async ({ site }) => {
    const { page } = site;
    await boot(page, { rec: 'cloud', consent: true });
    await expect(page.locator('[data-action="vc-revoke"]')).toBeVisible();
    await realClick(page, page.locator(SW));
    await expect(page.locator(DLG)).toHaveCount(0);
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'true');
  });

  test('sem reconhecimento de voz: interruptor desligado com o motivo', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { rec: 'none' });
    await expect(page.locator(SW)).toBeDisabled();
    await expect(page.locator('[data-vc-status]')).toHaveText(
      'Seu navegador não entende comandos de voz. Use Chrome ou Edge.',
    );
    await expect(page.locator(SW)).toHaveAttribute(
      'title',
      'Seu navegador não entende comandos de voz. Use Chrome ou Edge.',
    );
  });

  test('microfone bloqueado: o núcleo desliga e o painel explica em palavras simples', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { rec: 'local', mic: 'denied' });
    await realClick(page, page.locator(SW));
    await expect.poll(() => recStarts(page)).toBe(1);
    await page.evaluate(() => window.__recError('not-allowed'));
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'false');
    await page.evaluate(() => window.__emit('blocked'));
    await expect(page.locator('[data-vc-status]')).toHaveText(
      'O microfone está bloqueado. Libere nas configurações do navegador.',
    );
    // ligar de novo limpa o aviso antigo até o núcleo dizer o novo estado
    await realClick(page, page.locator(SW));
    await expect(page.locator('[data-vc-status]')).toHaveText('');
    // o status é região viva educada
    await expect(page.locator('[data-vc-status]')).toHaveAttribute(
      'aria-live',
      'polite',
    );
  });

  test('status do núcleo vira texto simples: sem microfone, erro, falta baixar, falta aceitar, parado', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const st = page.locator('[data-vc-status]');
    for (const [s, texto] of [
      ['no-mic', 'Não achei um microfone.'],
      ['error', 'Os comandos de voz pararam. Tente ligar de novo.'],
      [
        'needs-model',
        'Falta baixar o reconhecimento de voz no seu aparelho para usar comandos de voz.',
      ],
      [
        'needs-consent',
        'Para usar comandos de voz, é preciso aceitar que sua voz vá para o servidor do navegador, por exemplo o Google.',
      ],
      ['listening', 'Ouvindo…'],
      ['stopped', ''],
    ]) {
      await page.evaluate((x) => window.__emit(x), s);
      await expect(st).toHaveText(texto);
    }
    await expect(st).toHaveAttribute('aria-live', 'polite');
  });

  test('"Ver comandos" abre e fecha a lista com as 13 frases', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const btn = page.locator('[data-action="vc-commands"]');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[data-vc-list]')).toBeHidden();
    await realClick(page, btn);
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    const items = page.locator('[data-vc-list] li');
    await expect(items).toHaveCount(13);
    await expect(items.first()).toHaveText('“ler página”');
    await expect(items.last()).toHaveText('“ajuda”');
    await realClick(page, btn);
    await expect(page.locator('[data-vc-list]')).toBeHidden();
  });
});

for (const [w, h] of [
  [320, 568],
  [390, 844],
]) {
  test(`avisos cabem na tela ${w}x${h}, botões >= 44px, nada cortado`, async ({
    site,
  }, testInfo) => {
    const { page } = site;
    await page.setViewportSize({ width: w, height: h });
    await boot(page, { rec: 'download' });
    await realClick(page, page.locator(SW));
    const dlg = page.locator(DLG);
    await expect(dlg).toBeVisible();
    const card = dlg.locator('> div');
    await expect(card).toBeVisible();
    for (const b of await dlg.getByRole('button').all()) {
      const box = await b.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(43.5);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(w);
      // alcançável: dentro da área visível do aviso (que rola se faltar altura)
    }
    const d = await dlg.boundingBox();
    expect(d.y).toBeGreaterThanOrEqual(0);
    expect(d.y + d.height).toBeLessThanOrEqual(h);
    // sem rolagem horizontal na página nem no aviso
    expect(await dlg.evaluate((n) => n.scrollWidth <= n.clientWidth + 1)).toBe(
      true,
    );
    if (process.env.F10E_SHOTS) {
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${process.env.F10E_SHOTS}/${testInfo.project.name}-${w}x${h}-aviso-baixar.png`,
      });
    }
    // o último botão chega ao alcance mesmo com pouca altura (rola o aviso)
    const last = dlg.getByRole('button', { name: 'Agora não' });
    await last.focus();
    await realClick(page, last);
    await expect(dlg).toHaveCount(0);
  });
}

test('tutorial: explica Estúdio de Voz, Pausar e Comandos de voz sem ligar nem pedir microfone', async ({
  site,
}) => {
  test.setTimeout(120_000);
  const { page } = site;
  await boot(page, { rec: 'local' });
  await page.locator('.ms-a11y-close').click();
  await page.goto('/examples/index.html');
  await waitForLib(page);
  await page.locator('.header-tutorial').click();
  const steps = await page.evaluate(() =>
    window.MSTutorialStrings.steps.map((s) => s.title),
  );
  const alvo = steps.indexOf('Comandos de voz');
  expect(alvo).toBeGreaterThan(0);
  expect(steps).toContain('Estúdio de Voz');
  expect(steps).toContain('Pausar e continuar a leitura');
  for (let n = 2; n <= alvo + 1; n++) {
    await page.locator('.ms-tut-btn--primary').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.ms-tut-count')).toHaveText(
      new RegExp(`^Passo ${n} de`),
    );
  }
  await expect(page.locator('.ms-tut-title')).toHaveText('Comandos de voz');
  const o = await persisted(page).catch(() => ({}));
  expect(o.voiceCommands ?? false).toBe(false);
  expect(await page.evaluate(() => window.__recs?.length ?? 0)).toBe(0);
  await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'false');
});
