import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../backend/src/app.js';
import http from 'http';

let server;
let baseUrl;

test.before(() => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

test.after(() => {
  if (server) server.close();
});

test('Health check endpoint returns 200 OK', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
});

test('Missing Authentication returns 401 on protected routes', async () => {
  const res = await fetch(`${baseUrl}/api/v1/analytics`);
  assert.equal(res.status, 401);
});

test('CORS headers are present', async () => {
  const res = await fetch(`${baseUrl}/health`, {
    headers: { 'Origin': 'http://localhost:5180' }
  });
  assert.equal(res.status, 200);
  assert.ok(res.headers.get('access-control-allow-origin'));
});

test('Helmet security headers are present', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.ok(res.headers.get('content-security-policy'));
  assert.ok(res.headers.get('x-dns-prefetch-control'));
  assert.ok(res.headers.get('x-frame-options'));
  assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
});
