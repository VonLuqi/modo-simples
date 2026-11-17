/**
 * tests/structure/deployConfig.test.js
 *
 * vercel.json (deploy) e serve.json (npm run preview) são lidos por
 * ferramentas diferentes e precisam manter as mesmas rotas (A-08).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { ROOT } from './helpers.js';

const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

const routes = (list) =>
  list.map(({ source, destination }) => ({ source, destination }));

describe('vercel.json × serve.json', () => {
  const vercel = readJson('vercel.json');
  const serve = readJson('serve.json');

  it('rewrites idênticos', () => {
    assert.deepEqual(routes(vercel.rewrites), routes(serve.rewrites));
  });

  it('redirects idênticos (source/destination)', () => {
    assert.deepEqual(routes(vercel.redirects), routes(serve.redirects));
  });

  it('cleanUrls e trailingSlash iguais', () => {
    assert.equal(vercel.cleanUrls, serve.cleanUrls);
    assert.equal(vercel.trailingSlash, serve.trailingSlash);
  });
});
