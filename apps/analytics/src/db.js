// SQLite 存储层（node:sqlite，零 npm 依赖）。
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const ALLOWED_TYPES = new Set(['session_start', 'page_view', 'quiz_view']);
const ALLOWED_PAGES = new Set([
  'lessons',
  'quizzes',
  'wrong',
  'lab',
  'netgame',
  'explore',
  'beauty',
  'report',
]);

/** @param {string} dbPath */
export function openDb(dbPath) {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      visitor_id TEXT NOT NULL,
      type TEXT NOT NULL,
      page TEXT,
      quiz_id TEXT,
      lesson_id TEXT,
      meta TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_events_page ON events(page);
    CREATE INDEX IF NOT EXISTS idx_events_quiz ON events(quiz_id);
  `);
  return db;
}

function clampRange(from, to) {
  const now = Date.now();
  let f = Number.isFinite(from) ? from : now - 30 * 24 * 60 * 60 * 1000;
  let t = Number.isFinite(to) ? to : now;
  if (f > t) [f, t] = [t, f];
  // 防滥用：单次查询最多 366 天
  const maxSpan = 366 * 24 * 60 * 60 * 1000;
  if (t - f > maxSpan) f = t - maxSpan;
  return { from: f, to: t };
}

/**
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {{ visitorId: string, events: Array<object> }} payload
 */
export function ingestEvents(db, payload) {
  const visitorId = String(payload?.visitorId || '').slice(0, 64);
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(visitorId)) {
    return { ok: false, error: 'invalid_visitor_id' };
  }
  const list = Array.isArray(payload?.events) ? payload.events : [];
  if (!list.length) return { ok: false, error: 'empty_events' };
  if (list.length > 50) return { ok: false, error: 'too_many_events' };

  const now = Date.now();
  const insert = db.prepare(`
    INSERT INTO events (ts, visitor_id, type, page, quiz_id, lesson_id, meta)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let accepted = 0;
  db.exec('BEGIN');
  try {
    for (const ev of list) {
      const type = String(ev?.type || '');
      if (!ALLOWED_TYPES.has(type)) continue;
      let ts = Number(ev?.ts);
      if (!Number.isFinite(ts) || ts < now - 7 * 24 * 60 * 60 * 1000 || ts > now + 60_000) {
        ts = now;
      }
      let page = ev?.page != null ? String(ev.page).slice(0, 32) : null;
      if (page && !ALLOWED_PAGES.has(page)) page = null;
      if (type === 'page_view' && !page) continue;
      const quizId =
        ev?.quizId != null ? String(ev.quizId).slice(0, 64) : null;
      if (type === 'quiz_view' && !quizId) continue;
      const lessonId =
        ev?.lessonId != null ? String(ev.lessonId).slice(0, 64) : null;
      let meta = null;
      if (ev?.meta != null && typeof ev.meta === 'object') {
        try {
          meta = JSON.stringify(ev.meta).slice(0, 500);
        } catch {
          meta = null;
        }
      }
      insert.run(ts, visitorId, type, page, quizId, lessonId, meta);
      accepted += 1;
    }
    db.exec('COMMIT');
  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw err;
  }
  return { ok: true, accepted };
}

/** @param {import('node:sqlite').DatabaseSync} db */
export function statsOverview(db, fromMs, toMs) {
  const { from, to } = clampRange(fromMs, toMs);
  const row = db
    .prepare(
      `
    SELECT
      COUNT(*) AS events,
      COUNT(DISTINCT visitor_id) AS visitors,
      SUM(CASE WHEN type='page_view' THEN 1 ELSE 0 END) AS page_views,
      SUM(CASE WHEN type='quiz_view' THEN 1 ELSE 0 END) AS quiz_views
    FROM events
    WHERE ts BETWEEN ? AND ?
  `,
    )
    .get(from, to);

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const todayVisitors = db
    .prepare(
      `
    SELECT COUNT(DISTINCT visitor_id) AS n
    FROM events
    WHERE ts >= ?
  `,
    )
    .get(dayStart.getTime()).n;

  const daily = db
    .prepare(
      `
    SELECT
      strftime('%Y-%m-%d', ts/1000, 'unixepoch', 'localtime') AS day,
      COUNT(DISTINCT visitor_id) AS visitors,
      COUNT(*) AS events
    FROM events
    WHERE ts BETWEEN ? AND ?
    GROUP BY day
    ORDER BY day ASC
  `,
    )
    .all(from, to);

  return {
    from,
    to,
    visitors: row.visitors || 0,
    events: row.events || 0,
    pageViews: row.page_views || 0,
    quizViews: row.quiz_views || 0,
    todayVisitors: todayVisitors || 0,
    daily,
  };
}

/** @param {import('node:sqlite').DatabaseSync} db */
export function statsPages(db, fromMs, toMs) {
  const { from, to } = clampRange(fromMs, toMs);
  return db
    .prepare(
      `
    SELECT
      page,
      COUNT(*) AS views,
      COUNT(DISTINCT visitor_id) AS visitors
    FROM events
    WHERE type='page_view' AND page IS NOT NULL AND ts BETWEEN ? AND ?
    GROUP BY page
    ORDER BY views DESC
  `,
    )
    .all(from, to)
    .map((r) => ({
      page: r.page,
      views: r.views,
      visitors: r.visitors,
    }));
}

/** @param {import('node:sqlite').DatabaseSync} db */
export function statsQuizzes(db, fromMs, toMs, limit = 50) {
  const { from, to } = clampRange(fromMs, toMs);
  const lim = Math.min(200, Math.max(1, Number(limit) || 50));
  return db
    .prepare(
      `
    SELECT
      quiz_id,
      COUNT(*) AS views,
      COUNT(DISTINCT visitor_id) AS visitors
    FROM events
    WHERE type='quiz_view' AND quiz_id IS NOT NULL AND ts BETWEEN ? AND ?
    GROUP BY quiz_id
    ORDER BY views DESC
    LIMIT ?
  `,
    )
    .all(from, to, lim)
    .map((r) => ({
      quizId: r.quiz_id,
      views: r.views,
      visitors: r.visitors,
    }));
}

/** @param {import('node:sqlite').DatabaseSync} db */
export function recentEvents(db, limit = 50) {
  const lim = Math.min(200, Math.max(1, Number(limit) || 50));
  return db
    .prepare(
      `
    SELECT id, ts, visitor_id, type, page, quiz_id, lesson_id
    FROM events
    ORDER BY id DESC
    LIMIT ?
  `,
    )
    .all(lim)
    .map((r) => ({
      id: r.id,
      ts: r.ts,
      visitorId: r.visitor_id,
      type: r.type,
      page: r.page,
      quizId: r.quiz_id,
      lessonId: r.lesson_id,
    }));
}
