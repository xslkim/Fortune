// 工作区冒烟测试：@geo/core 可被 mp 端引用，mp 业务层（storage/progress）在 stub uni 下可工作
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '@geo/core/data/lessons.js';
import { recordAttempt, quizStatus, wrongList, removeWrong } from '../src/engine/progress.js';

test('@geo/core/data/lessons.js 可 import 且包含 13 门课', () => {
  assert.ok(Array.isArray(LESSONS));
  assert.equal(LESSONS.length, 13);
  assert.ok(LESSONS.every((l) => l.id && Array.isArray(l.steps)));
});

test('mp engine/progress.js 在 stub uni 下可记录作答并读写错题本', () => {
  const store = new Map();
  globalThis.uni = {
    setStorageSync: (k, v) => {
      store.set(k, v);
    },
    getStorageSync: (k) => store.get(k) ?? '',
    removeStorageSync: (k) => {
      store.delete(k);
    },
  };

  const qid = LESSONS[0].id + '-smoke';
  recordAttempt(qid, false);
  assert.equal(quizStatus(qid), 'wrong');
  assert.equal(
    wrongList().some((w) => w.id === qid && !w.corrected),
    true,
  );

  recordAttempt(qid, true);
  assert.equal(quizStatus(qid), 'ok');
  assert.equal(
    wrongList().some((w) => w.id === qid && w.corrected),
    true,
  );

  removeWrong(qid);
  assert.equal(
    wrongList().some((w) => w.id === qid),
    false,
  );

  delete globalThis.uni;
});
