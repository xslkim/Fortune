import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  openDb,
  ingestEvents,
  statsOverview,
  statsPages,
  statsQuizzes,
  recentEvents,
} from '../src/db.js';

function withDb(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'geo-analytics-'));
  const db = openDb(join(dir, 't.sqlite'));
  try {
    return fn(db);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

test('ingest accepts page and quiz events', () => {
  withDb((db) => {
    const r = ingestEvents(db, {
      visitorId: 'visitor_abc123',
      events: [
        { type: 'session_start', ts: Date.now() },
        { type: 'page_view', page: 'lessons', ts: Date.now() },
        { type: 'quiz_view', quizId: 'q1', ts: Date.now(), meta: { from: 'quizzes' } },
      ],
    });
    assert.equal(r.ok, true);
    assert.equal(r.accepted, 3);

    const overview = statsOverview(db);
    assert.equal(overview.visitors, 1);
    assert.equal(overview.pageViews, 1);
    assert.equal(overview.quizViews, 1);

    const pages = statsPages(db);
    assert.equal(pages[0].page, 'lessons');
    assert.equal(pages[0].views, 1);

    const quizzes = statsQuizzes(db);
    assert.equal(quizzes[0].quizId, 'q1');
    assert.equal(quizzes[0].views, 1);

    const recent = recentEvents(db, 10);
    assert.equal(recent.length, 3);
  });
});

test('ingest rejects bad visitor and unknown page', () => {
  withDb((db) => {
    assert.equal(ingestEvents(db, { visitorId: 'bad', events: [{ type: 'page_view', page: 'lessons' }] }).ok, false);
    const r = ingestEvents(db, {
      visitorId: 'visitor_ok_01',
      events: [
        { type: 'page_view', page: 'not-a-real-page' },
        { type: 'quiz_view' },
        { type: 'page_view', page: 'lab' },
      ],
    });
    assert.equal(r.ok, true);
    assert.equal(r.accepted, 1);
  });
});

test('overview counts distinct visitors', () => {
  withDb((db) => {
    ingestEvents(db, {
      visitorId: 'visitor_one___',
      events: [{ type: 'page_view', page: 'quizzes' }],
    });
    ingestEvents(db, {
      visitorId: 'visitor_two___',
      events: [
        { type: 'page_view', page: 'quizzes' },
        { type: 'quiz_view', quizId: 'q9' },
      ],
    });
    const overview = statsOverview(db);
    assert.equal(overview.visitors, 2);
    assert.equal(overview.pageViews, 2);
    assert.equal(overview.quizViews, 1);
    const pages = statsPages(db);
    assert.equal(pages[0].visitors, 2);
  });
});
