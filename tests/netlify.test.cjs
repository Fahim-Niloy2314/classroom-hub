const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const {webcrypto, pbkdf2Sync} = require('node:crypto');
const {Pool} = require('pg');
const root = path.resolve(__dirname, '..');
let database, pool;

function load(file, overrides = {}) {
  const box = {exports: {}, crypto: webcrypto, TextEncoder, Uint8Array, Request, Response, URL,
    AbortSignal, Date, console, fetch: async () => {throw Error('Unexpected provider call');},
    ...overrides};
  box.module = {exports: box.exports};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}
  }).outputText;
  vm.runInNewContext(code, box, {filename: file});
  return {module: box.module.exports, box};
}

before(async () => {
  const {NetlifyDB} = await import('@netlify/database-dev');
  database = new NetlifyDB({logger() {}});
  const connectionString = await database.start();
  await database.applyMigrations(path.join(root, 'netlify/database/migrations'));
  pool = new Pool({connectionString, max: 1});
});
after(async () => {await pool?.end(); await database?.stop();});

async function setup({bootstrap, unconfigured = false, ip = '192.0.2.1'} = {}) {
  await pool.query('TRUNCATE hub_state, hub_sessions, hub_limits, hub_inbox, hub_activity, hub_alerts');
  const {postgresStorage} = load('netlify/lib/postgres.mts').module;
  const engine = load('netlify/lib/owner-api.mts');
  const storage = postgresStorage(pool);
  const salt = 'c8d767fb3725935b99c8fb473e8673e3';
  const env = {DB: storage};
  if (bootstrap) env.CLASSROOM_OWNER_PASSWORD = bootstrap;
  else if (!unconfigured) env.CLASSROOM_OWNER_CREDENTIAL = JSON.stringify({salt,
    hash: pbkdf2Sync('synthetic-test-password', Buffer.from(salt, 'hex'), 100000, 32, 'sha256').toString('hex')});
  const pending = [];
  const seed = JSON.parse(fs.readFileSync(path.join(root, 'portal_sync.json')));
  const api = engine.module.createOwnerApi(env, seed, work => pending.push(work), {sameOrigin: true, clientIp: ip});
  async function call(route, body, token, origin) {
    const headers = {'Content-Type': 'application/json'};
    if (token) headers.Authorization = 'Bearer ' + token;
    if (origin) headers.Origin = origin;
    const response = await api.fetch(new Request('https://classroom.fixture.netlify.app/api/' + route, {
      method: body === undefined ? 'GET' : 'POST', headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    }));
    return {status: response.status, body: await response.json(), headers: response.headers};
  }
  async function login(email = 'fahimniloy2314@gmail.com', password = 'synthetic-test-password') {
    const result = await call('login', {email, password});
    assert.equal(result.status, 200, JSON.stringify(result.body));
    return result.body.token;
  }
  return {call, login, env, engine, api, storage, pending};
}

test('unconfigured storage never grants owner access or exposes setup instructions', async () => {
  const t = await setup({unconfigured: true});
  assert.equal((await t.call('status')).body.configured, false);
  assert.equal((await t.call('login', {email: 'fahimniloy2314@gmail.com', password: 'synthetic-test-password'})).status, 401);
  for (const route of ['owner', 'submissions', 'analytics', 'backup', 'ai/config', 'notifications/config'])
    assert.equal((await t.call(route)).status, 401);
  assert.equal((await t.call('status', undefined, undefined, 'https://attacker.invalid')).status, 403);
  assert.equal((await t.call('status')).headers.get('Access-Control-Allow-Origin'), null);
});

test('both fixed owner emails sign in directly, sessions expire and logout revokes access', async () => {
  const t = await setup();
  for (const email of ['fahimniloy2314@gmail.com', 'fahim.cuet.me20@gmail.com']) {
    const token = await t.login(email);
    assert.equal((await t.call('status', undefined, token)).body.authenticated, true);
    assert.equal((await t.call('logout', {}, token)).status, 200);
    assert.equal((await t.call('owner', undefined, token)).status, 401);
  }
  assert.equal((await t.call('login', {email: 'niloyofficial2314@gmail.com', password: 'synthetic-test-password'})).status, 401);
  const token = await t.login();
  await pool.query('UPDATE hub_sessions SET expires=0');
  assert.equal((await t.call('backup', undefined, token)).status, 401);
});

test('private hosting credential initializes a salted hash and owner password rotation revokes all sessions', async () => {
  const t = await setup({bootstrap: 'synthetic-private-bootstrap'});
  const status = await t.call('status');
  assert.equal(status.body.configured, true);
  const saved = JSON.parse((await pool.query("SELECT value FROM hub_state WHERE key='owner'")).rows[0].value);
  assert.equal(saved.iterations, 600000);
  assert.equal(JSON.stringify(saved).includes('synthetic-private-bootstrap'), false);
  const token = await t.login('fahimniloy2314@gmail.com', 'synthetic-private-bootstrap');
  const emails = ['fahimniloy2314@gmail.com', 'fahim.cuet.me20@gmail.com'];
  assert.equal((await t.call('owner', {emails: ['third@example.org'], currentPassword: 'synthetic-private-bootstrap'}, token)).status, 400);
  assert.equal((await t.call('owner', {emails, currentPassword: 'synthetic-private-bootstrap', newPassword: 'synthetic-new-private-password'}, token)).status, 200);
  assert.equal((await t.call('owner', undefined, token)).status, 401);
  assert.equal((await t.call('login', {email: emails[0], password: 'synthetic-private-bootstrap'})).status, 401);
  await t.login(emails[1], 'synthetic-new-private-password');
  assert.equal(JSON.stringify((await t.call('portal')).body).includes(saved.hash), false);
});

test('feedback retries create exactly one durable record and receipt, with real owner inbox status', async () => {
  const t = await setup();
  const message = {requestId: 'synthetic-idempotent-message', description: 'Synthetic feedback', studentName: 'Test Student'};
  const results = await Promise.all(Array.from({length: 3}, () => t.call('submissions', message)));
  for (const r of results) {assert.equal(r.status, 200); assert.equal(r.body.state, 'received');}
  assert.equal(new Set(results.map(r => r.body.receiptId)).size, 1);
  const token = await t.login();
  const inbox = (await t.call('submissions', undefined, token)).body.submissions;
  assert.equal(inbox.length, 1); assert.equal(inbox[0].notificationState, 'disabled');
  assert.equal((await t.call('submissions/status', {id: inbox[0].id, status: 'resolved'}, token)).status, 200);
  assert.equal((await t.call('submissions/status', {id: inbox[0].id, status: 'made-up'}, token)).status, 400);
  await Promise.all(t.pending);
});

test('owner publishes empty lists to public storage; backups exclude secrets and invalid restore is atomic', async () => {
  const t = await setup(), token = await t.login();
  const payload = (await t.call('portal')).body;
  payload.faculty = []; payload.notices = [];
  payload.portalSettings.password = 'synthetic-secret';
  assert.equal((await t.call('publish', {payload}, token)).status, 400);
  delete payload.portalSettings.password;
  const published = await t.call('publish', {payload}, token);
  assert.equal(published.status, 200); assert.equal(published.body.publicFrontendConnected, true);
  assert.equal((await t.call('portal')).body.faculty.length, 0);
  assert.equal((await t.call('portal')).body.lastUpdated, published.body.revision);
  const backup = (await t.call('backup', undefined, token)).body.backup;
  assert.equal(JSON.stringify(backup).includes('synthetic-test-password'), false);
  backup.submissions = [{id: 'invalid'}];
  assert.equal((await t.call('restore', {backup}, token)).status, 400);
  assert.equal((await t.call('portal')).body.faculty.length, 0);
  // A failed multi-statement restore must roll back earlier statements on the same connection.
  await assert.rejects(t.storage.batch([
    t.storage.prepare('INSERT INTO hub_state(key,value) VALUES(?,?)').bind('transaction-fixture', 'one'),
    t.storage.prepare('INSERT INTO hub_state(key,value) VALUES(?,?)').bind('transaction-fixture', 'two')
  ]));
  assert.equal((await pool.query("SELECT count(*) FROM hub_state WHERE key='transaction-fixture'")).rows[0].count, '0');
});

test('Postgres analytics use numeric measured counts and deduplicate repeated browser heartbeats', async () => {
  const t = await setup();
  for (const [browserId, route] of [['synthetic-browser-one', 'home'], ['synthetic-browser-one', 'tools/cv'], ['synthetic-browser-two', 'faculty']])
    assert.equal((await t.call('presence', {browserId, route})).status, 200);
  const token = await t.login(), analytics = (await t.call('analytics', undefined, token)).body;
  assert.equal(analytics.activeBrowsers, 2); assert.equal(analytics.todayBrowsers, 2);
  assert.deepEqual(analytics.routes, {'tools/cv': 1, faculty: 1});
  await pool.query('UPDATE hub_activity SET seen=0');
  assert.equal((await t.call('analytics', undefined, token)).body.activeBrowsers, 0);
  await Promise.all(t.pending);
});

test('Postgres login limits are enforced and roles or precomputed password hashes grant nothing', async () => {
  const t = await setup();
  assert.equal((await t.call('publish', {role: 'admin'}, 'forged-token')).status, 401);
  for (let i = 0; i < 5; i++) assert.equal((await t.call('login', {email: 'fahimniloy2314@gmail.com', passwordHash: 'fixture'})).status, 401);
  assert.equal((await t.call('login', {email: 'fahimniloy2314@gmail.com', password: 'synthetic-test-password'})).status, 429);
});

test('online AI stays disabled until configured and does not expose provider keys', async () => {
  const t = await setup();
  assert.equal((await t.call('ai/chat', {question: 'Synthetic question'})).status, 503);
  const token = await t.login();
  assert.equal((await t.call('ai/config', {enabled: true, provider: 'gemini', model: 'gemini-3.8-flash', geminiKey: 'synthetic-provider-key', dailyLimit: 2, maxOutputTokens: 1500}, token)).status, 200);
  assert.equal(JSON.stringify((await t.call('ai/config', undefined, token)).body).includes('synthetic-provider-key'), false);
  t.engine.box.fetch = async (url, options) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent');
    assert.equal(options.headers['x-goog-api-key'], 'synthetic-provider-key');
    return Response.json({candidates: [{content: {parts: [{text: String.raw`Synthetic answer: \(E=mc^2\)`}]}}]});
  };
  const response = await t.call('ai/chat', {question: 'Synthetic engineering question', history: []});
  assert.equal(response.status, 200); assert.match(response.body.answer, /E=mc/);
});

test('only allowlisted public assets are packaged; server and private config are absent', async () => {
  require('../scripts/build-netlify.cjs');
  const names = fs.readdirSync(path.join(root, 'dist'));
  assert.ok(names.includes('cuet_routine_template_blank.docx'));
  for (const name of ['netlify', 'server.py', 'secrets.json', '.env', 'node_modules', 'OWNER_MANUAL.md', 'tests']) assert.equal(names.includes(name), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'dist/backend-config.json'))), {apiBase: ''});
  assert.equal(fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8').includes('classroom-hub-owner-service.f6050.chatgpt.site'), false);
});
