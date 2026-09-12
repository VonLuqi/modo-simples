/**
 * Smoke F5-T02/T03 — páginas do mapa, assets e nav unificada.
 * Uso: node scripts/smoke-examples.cjs
 * Opcional: SMOKE_BASE=http://127.0.0.1:8765 node scripts/smoke-examples.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const examples = path.join(root, 'examples');

/** Páginas do mapa com shell unificado (psg/unidades/aluno entram no T04). */
const MAP_PAGES = [
  'index.html',
  'sobrenos.html',
  'cursos.html',
  'psg.html',
  'unidades.html',
  'contato.html',
  'aluno.html',
  'pesquisa.html',
];

const EXTRA_PAGES = ['hello-modo-simples.html'];

/** Href esperados no nav principal (F5-T04). */
const EXPECTED_NAV = [
  'index.html',
  'sobrenos.html',
  'cursos.html',
  'psg.html',
  'unidades.html',
  'contato.html',
  'aluno.html',
  'pesquisa.html',
];

const SCRIPT_MS = path.join(root, 'src', 'modo-simples.js');

function fail(msg) {
  console.error('FAIL:', msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log('OK  ', msg);
}

function collectLocalRefs(html, pageFile) {
  const refs = [];
  const re = /\b(?:href|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    if (
      !raw ||
      raw.startsWith('#') ||
      raw.startsWith('mailto:') ||
      raw.startsWith('tel:') ||
      raw.startsWith('http://') ||
      raw.startsWith('https://') ||
      raw.startsWith('data:')
    ) {
      continue;
    }
    refs.push({ raw, from: pageFile });
  }
  return refs;
}

function resolveRef(pageFile, raw) {
  if (raw.startsWith('../')) {
    return path.resolve(examples, path.dirname(pageFile), raw);
  }
  return path.resolve(examples, path.dirname(pageFile), raw);
}

function extractMainNavHrefs(html) {
  const navMatch = html.match(
    /<nav[^>]*aria-label=["']Menu principal["'][^>]*>([\s\S]*?)<\/nav>/i
  );
  if (!navMatch) return null;
  const hrefs = [];
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(navMatch[1]))) {
    hrefs.push(m[1]);
  }
  return hrefs;
}

async function httpCheck(base, urlPath) {
  const url = base.replace(/\/$/, '') + urlPath;
  const res = await fetch(url, { redirect: 'manual' });
  return { url, status: res.status, location: res.headers.get('location') };
}

async function main() {
  console.log('Smoke examples (F5-T02–T05)\n');

  if (!fs.existsSync(SCRIPT_MS)) {
    fail(`Biblioteca ausente: ${SCRIPT_MS}`);
  } else {
    ok('src/modo-simples.js');
  }

  const rootIndex = path.join(root, 'index.html');
  if (!fs.existsSync(rootIndex)) {
    fail('index.html na raiz (redirect) ausente');
  } else {
    ok('index.html (raiz → examples/)');
  }

  const serveJson = path.join(root, 'serve.json');
  if (!fs.existsSync(serveJson)) {
    fail('serve.json ausente');
  } else {
    const cfg = JSON.parse(fs.readFileSync(serveJson, 'utf8'));
    if (cfg.cleanUrls !== false) {
      fail('serve.json deve ter "cleanUrls": false');
    } else {
      ok('serve.json cleanUrls=false');
    }
  }

  for (const css of ['tokens.css', 'shell.css', 'pages.css']) {
    const p = path.join(examples, 'CSS', css);
    if (!fs.existsSync(p)) fail(`CSS ausente: examples/CSS/${css}`);
    else ok(`CSS/${css}`);
  }

  const navByPage = {};

  for (const page of [...MAP_PAGES, ...EXTRA_PAGES]) {
    const full = path.join(examples, page);
    if (!fs.existsSync(full)) {
      fail(`Página ausente: examples/${page}`);
      continue;
    }
    ok(`página examples/${page}`);

    const html = fs.readFileSync(full, 'utf8');
    if (!html.includes('modo-simples.js') && !html.includes('modo-simples.min.js')) {
      fail(`${page}: sem script Modo Simples`);
    }

    if (MAP_PAGES.includes(page)) {
      if (!html.includes('CSS/shell.css') || !html.includes('CSS/tokens.css')) {
        fail(`${page}: deve usar tokens.css + shell.css`);
      }
      if (!html.includes('site-header')) {
        fail(`${page}: sem header.site-header`);
      }
      if (!html.includes('site-footer')) {
        fail(`${page}: sem footer.site-footer`);
      }
      if (!html.includes('<main')) {
        fail(`${page}: sem <main>`);
      }

      const hrefs = extractMainNavHrefs(html);
      if (!hrefs) {
        fail(`${page}: nav aria-label="Menu principal" ausente`);
      } else {
        navByPage[page] = hrefs;
        const missing = EXPECTED_NAV.filter((h) => !hrefs.includes(h));
        if (missing.length) {
          fail(`${page}: nav incompleto, falta ${missing.join(', ')}`);
        }
      }

      if (!html.includes('aria-current="page"') && !html.includes("aria-current='page'")) {
        fail(`${page}: sem aria-current="page"`);
      }
      if (!html.includes('data-ms-pills') && !html.includes('ms-pills-nav')) {
        fail(`${page}: sem nav pills do Modo Simples (F5-T05)`);
      }
      if (page === 'index.html' && !html.includes('ms-hub')) {
        fail('index.html: sem hub ms-hub (F5-T05)');
      }
      if (page === 'index.html' && !html.includes('ms-simple-hide')) {
        fail('index.html: sem ms-simple-hide no conteúdo padrão');
      }
      if (page === 'cursos.html' || page === 'psg.html') {
        if (!html.includes('curso-assistente') || !html.includes('cursos-assistente.js')) {
          fail(`${page}: assistente de cursos ausente (F5-T07)`);
        }
        if (!html.includes('cursos-data.js')) {
          fail(`${page}: cursos-data.js ausente`);
        }
      }
    }

    for (const { raw } of collectLocalRefs(html, page)) {
      const resolved = resolveRef(page, raw);
      if (!fs.existsSync(resolved)) {
        fail(`${page}: asset não encontrado → ${raw}`);
      }
    }
  }

  const navKeys = Object.keys(navByPage);
  if (navKeys.length >= 2) {
    const baseNav = navByPage[navKeys[0]].join('|');
    for (let i = 1; i < navKeys.length; i++) {
      const cur = navByPage[navKeys[i]].join('|');
      if (cur !== baseNav) {
        fail(
          `Nav divergente: ${navKeys[0]}=[${navByPage[navKeys[0]]}] vs ${navKeys[i]}=[${navByPage[navKeys[i]]}]`
        );
      }
    }
    if (!process.exitCode) ok('nav principal idêntica em todas as páginas do mapa');
  }

  const base = process.env.SMOKE_BASE;
  if (base) {
    console.log(`\nHTTP contra ${base}`);
    const paths = [
      '/',
      '/examples',
      '/examples/',
      '/examples/index.html',
      '/examples/contato.html',
      '/examples/cursos.html',
      '/examples/CSS/shell.css',
      '/examples/CSS/tokens.css',
      '/examples/img/logoSenac.png',
      '/src/modo-simples.js',
      '/contato.html',
      '/CSS/reset.css',
    ];

    for (const p of paths) {
      try {
        const { url, status, location } = await httpCheck(base, p);
        const expectRedirect =
          p === '/' || p === '/examples' || p === '/examples/';
        const expectOk =
          expectRedirect || p.startsWith('/examples/') || p.startsWith('/src/');
        if (expectOk) {
          if (expectRedirect) {
            if (status !== 200 && status !== 301 && status !== 302) {
              fail(`HTTP ${status} ${url} (reinicie npm run preview se alterou serve.json)`);
            } else {
              ok(`HTTP ${status} ${p}${location ? ' → ' + location : ''}`);
            }
          } else if (status !== 200) {
            fail(`HTTP ${status} ${url}`);
          } else {
            ok(`HTTP 200 ${p}`);
          }
        } else if (status === 200) {
          console.warn('WARN ', `inesperado 200 em ${p} (prefira /examples/...)`);
        } else {
          ok(`HTTP ${status} ${p} (fora de /examples — esperado falhar)`);
        }
      } catch (err) {
        fail(`HTTP ${p}: ${err.message}`);
      }
    }
  } else {
    console.log(
      '\n(Dica: com o preview no ar, rode SMOKE_BASE=http://127.0.0.1:8765 npm run smoke:examples)'
    );
  }

  if (process.exitCode) {
    console.error('\nSmoke FALHOU');
    process.exit(1);
  }
  console.log('\nSmoke OK');
}

main();
