import { defineConfig } from '@playwright/test';

/**
 * E2E em browser real (Chromium) + verificação de acessibilidade com axe (Q01, Q02).
 *
 * Primeira vez na máquina:  npx playwright install chromium
 * Rodar:                    npm run test:e2e
 *
 * Servidor: mesmo `serve` do preview, raiz do repositório, porta própria (47831, E2E_PORT muda) para não
 * colidir com `npm run preview` (8765). Requisições a hosts externos são interceptadas nos
 * testes (determinismo, sem rede).
 */
const PORT = Number(process.env.E2E_PORT) || 47831;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
  webServer: {
    command: `node node_modules/serve/build/main.js . -l ${PORT} --no-clipboard`,
    url: `http://127.0.0.1:${PORT}/examples/index.html`,
    reuseExistingServer: false, // nunca reaproveita outro servidor (determinismo)
    timeout: 30_000,
  },
});
