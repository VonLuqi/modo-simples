/**
 * tests/structure/prototypeStructure.test.js
 *
 * Valida a estrutura do protótipo Senac em examples/ (F5-T08).
 * Sem browser: só filesystem + parse HTML leve.
 *
 * Cobertura:
 *  1. header / nav[aria-label] / main / footer
 *  2. links do nav apontam para arquivos existentes
 *  3. script Modo Simples em cada página do mapa
 *  4. CSS/img locais existem
 *  5. nav idêntica entre páginas
 *  6. marcadores MS (pills, plain/simple; hub na home)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  EXAMPLES,
  MAP_PAGES,
  EXPECTED_NAV,
  CANONICAL_CSS,
  ROOT,
  readPage,
  hasTag,
  hasMainNav,
  extractMainNavHrefs,
  collectLocalRefs,
  resolveExampleRef,
  hasModoSimplesScript,
} from './helpers.js';

describe('prototype structure (examples/)', () => {
  it('CSS canônico do shell existe', () => {
    for (const css of CANONICAL_CSS) {
      const full = path.join(EXAMPLES, 'CSS', css);
      assert.ok(fs.existsSync(full), `faltando examples/CSS/${css}`);
    }
  });

  it('biblioteca src/modo-simples.js existe', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'src', 'modo-simples.js')));
  });

  for (const page of MAP_PAGES) {
    describe(page, () => {
      const { exists, html } = readPage(page);

      it('arquivo existe', () => {
        assert.ok(exists, `examples/${page} ausente`);
      });

      it('tem header, nav principal, main e footer', () => {
        assert.ok(hasTag(html, 'header'), `${page}: sem <header>`);
        assert.ok(hasMainNav(html), `${page}: sem nav Menu principal`);
        assert.ok(hasTag(html, 'main'), `${page}: sem <main>`);
        assert.ok(
          hasTag(html, 'footer') || html.includes('site-footer'),
          `${page}: sem <footer>`,
        );
      });

      it('inclui script Modo Simples', () => {
        assert.ok(hasModoSimplesScript(html), `${page}: sem modo-simples.js`);
      });

      it('usa tokens.css + shell.css', () => {
        assert.ok(html.includes('CSS/tokens.css'), `${page}: sem tokens.css`);
        assert.ok(html.includes('CSS/shell.css'), `${page}: sem shell.css`);
      });

      it('tem aria-current="page"', () => {
        assert.ok(
          html.includes('aria-current="page"') ||
            html.includes("aria-current='page'"),
          `${page}: sem aria-current`,
        );
      });

      it('assets locais referenciados existem', () => {
        for (const raw of collectLocalRefs(html)) {
          const resolved = resolveExampleRef(page, raw);
          assert.ok(fs.existsSync(resolved), `${page}: asset ausente → ${raw}`);
        }
      });

      it('tem pills MS e pares de linguagem', () => {
        assert.ok(
          html.includes('ms-pills-nav') || html.includes('data-ms-pills'),
          `${page}: sem pills MS`,
        );
        assert.ok(html.includes('data-ms-plain'), `${page}: sem data-ms-plain`);
        assert.ok(
          html.includes('data-ms-simple'),
          `${page}: sem data-ms-simple`,
        );
      });
    });
  }

  it('nav principal é idêntica e completa em todas as páginas', () => {
    const byPage = {};
    for (const page of MAP_PAGES) {
      const { html } = readPage(page);
      const hrefs = extractMainNavHrefs(html);
      assert.ok(hrefs, `${page}: nav não encontrada`);
      byPage[page] = hrefs;

      for (const href of EXPECTED_NAV) {
        assert.ok(hrefs.includes(href), `${page}: nav sem link ${href}`);
        assert.ok(
          fs.existsSync(path.join(EXAMPLES, href)),
          `destino inexistente: ${href}`,
        );
      }
    }

    const first = byPage[MAP_PAGES[0]].join('|');
    for (const page of MAP_PAGES.slice(1)) {
      assert.equal(byPage[page].join('|'), first, `nav divergente em ${page}`);
    }
  });

  it('index.html tem hub do Modo Simples', () => {
    const { html } = readPage('index.html');
    assert.ok(html.includes('ms-hub'), 'hub ms-hub ausente');
    assert.ok(html.includes('ms-simple-hide'), 'ms-simple-hide ausente');
  });

  it('páginas internas têm dual markup MS (hide + simple-view)', () => {
    const pages = [
      'sobrenos.html',
      'contato.html',
      'unidades.html',
      'aluno.html',
      'pesquisa.html',
      'cursos.html',
      'psg.html',
    ];
    for (const page of pages) {
      const { html } = readPage(page);
      assert.ok(html.includes('ms-simple-hide'), `${page}: sem ms-simple-hide`);
      assert.ok(
        html.includes('ms-simple-view') && html.includes('ms-simple-only'),
        `${page}: sem ms-simple-view / ms-simple-only`,
      );
    }
  });

  it('cursos.html e psg.html têm assistente de cursos', () => {
    for (const page of ['cursos.html', 'psg.html']) {
      const { html } = readPage(page);
      assert.ok(
        html.includes('curso-assistente'),
        `${page}: sem #curso-assistente`,
      );
      assert.ok(
        html.includes('cursos-assistente.js'),
        `${page}: sem cursos-assistente.js`,
      );
      assert.ok(html.includes('cursos-data.js'), `${page}: sem cursos-data.js`);
    }
    assert.ok(
      fs.existsSync(path.join(EXAMPLES, 'js', 'cursos-data.js')),
      'js/cursos-data.js ausente',
    );
    assert.ok(
      fs.existsSync(path.join(EXAMPLES, 'js', 'cursos-assistente.js')),
      'js/cursos-assistente.js ausente',
    );
  });
});
