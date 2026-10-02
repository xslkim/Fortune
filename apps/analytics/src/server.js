// 访问统计服务：采集 API + Token 保护的管理后台。
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import {
  openDb,
  ingestEvents,
  statsOverview,
  statsPages,
  statsQuizzes,
  recentEvents,
} from './db.js';

const PORT = Number(process.env.ANALYTICS_PORT) || 8472;
const TOKEN = process.env.ANALYTICS_TOKEN || 'dev-token-change-me';
const DATA_DIR = process.env.ANALYTICS_DATA || join(fileURLToPath(new URL('..', import.meta.url)), 'data');
const DB_PATH = join(DATA_DIR, 'analytics.sqlite');
const ADMIN_HTML = readFileSync(join(fileURLToPath(new URL('.', import.meta.url)), 'admin.html'), 'utf8');

const db = openDb(DB_PATH);

// 简易限流：按 IP 每分钟最多 120 次采集请求
const rate = new Map();
function allowIngest(ip) {
  const now = Date.now();
  let bucket = rate.get(ip);
  if (!bucket || now - bucket.start > 60_000) {
    bucket = { start: now, n: 0 };
    rate.set(ip, bucket);
  }
  bucket.n += 1;
  return bucket.n <= 120;
}

function cors(res, req) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
}

function sendJson(res, status, body) {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(raw),
  });
  res.end(raw);
}

function readBody(req, limit = 64_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error('body_too_large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function authed(req) {
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  const token = m ? m[1].trim() : '';
  return token && token === TOKEN;
}

function parseRange(url) {
  const fromRaw = url.searchParams.get('from');
  const toRaw = url.searchParams.get('to');
  const from = fromRaw == null || fromRaw === '' ? NaN : Number(fromRaw);
  const to = toRaw == null || toRaw === '' ? NaN : Number(toRaw);
  return {
    from: Number.isFinite(from) ? from : undefined,
    to: Number.isFinite(to) ? to : undefined,
  };
}

const server = http.createServer(async (req, res) => {
  cors(res, req);
  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  let url;
  try {
    url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  } catch {
    sendJson(res, 400, { error: 'bad_url' });
    return;
  }

  try {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/admin')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(ADMIN_HTML);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/events') {
      const ip = req.socket.remoteAddress || 'unknown';
      if (!allowIngest(ip)) {
        sendJson(res, 429, { error: 'rate_limited' });
        return;
      }
      const raw = await readBody(req);
      let payload;
      try {
        payload = JSON.parse(raw || '{}');
      } catch {
        sendJson(res, 400, { error: 'invalid_json' });
        return;
      }
      const result = ingestEvents(db, payload);
      sendJson(res, result.ok ? 200 : 400, result);
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/v1/stats/')) {
      if (!authed(req)) {
        sendJson(res, 401, { error: 'unauthorized' });
        return;
      }
      const { from, to } = parseRange(url);
      if (url.pathname === '/api/v1/stats/overview') {
        sendJson(res, 200, statsOverview(db, from, to));
        return;
      }
      if (url.pathname === '/api/v1/stats/pages') {
        sendJson(res, 200, { pages: statsPages(db, from, to) });
        return;
      }
      if (url.pathname === '/api/v1/stats/quizzes') {
        const limit = Number(url.searchParams.get('limit')) || 50;
        sendJson(res, 200, { quizzes: statsQuizzes(db, from, to, limit) });
        return;
      }
      if (url.pathname === '/api/v1/stats/recent') {
        const limit = Number(url.searchParams.get('limit')) || 50;
        sendJson(res, 200, { events: recentEvents(db, limit) });
        return;
      }
      sendJson(res, 404, { error: 'not_found' });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    sendJson(res, 404, { error: 'not_found' });
  } catch (err) {
    const status = err?.status || 500;
    sendJson(res, status, { error: err?.message || 'server_error' });
  }
});

if (process.env.ANALYTICS_NO_LISTEN !== '1') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`统计后台: http://localhost:${PORT}/`);
    console.log(`采集接口: POST http://localhost:${PORT}/api/v1/events`);
    console.log(`Token: 环境变量 ANALYTICS_TOKEN（当前 ${TOKEN === 'dev-token-change-me' ? '默认开发口令' : '已自定义'}）`);
    console.log(`数据库: ${DB_PATH}`);
  });
}

export { server, db, TOKEN, DB_PATH };
