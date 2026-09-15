import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  planOnWrong,
  applyReviewAnswer,
  dueReviews,
  hasActivePlan,
  isMastered,
  OFFSETS,
} from '../src/engine/review.js';

test('答错生成计划：第一节点 +1 天到期', () => {
  const r = planOnWrong({}, 'q01', '2026-09-10');
  assert.deepEqual(r.q01, { node: 0, nextReviewAt: '2026-09-11' });
  assert.deepEqual(OFFSETS, [1, 3, 7]);
});

test('复习答对逐级推进：+1 → +3 → +7 → 已掌握', () => {
  let r = planOnWrong({}, 'q01', '2026-09-10');
  assert.deepEqual(dueReviews(r, '2026-09-10'), []); // 当天不到期
  assert.deepEqual(dueReviews(r, '2026-09-11'), ['q01']); // +1 天到期

  r = applyReviewAnswer(r, 'q01', true, '2026-09-11');
  assert.deepEqual(r.q01, { node: 1, nextReviewAt: '2026-09-14' }); // +3
  assert.deepEqual(dueReviews(r, '2026-09-13'), []);
  assert.deepEqual(dueReviews(r, '2026-09-14'), ['q01']);

  r = applyReviewAnswer(r, 'q01', true, '2026-09-14');
  assert.deepEqual(r.q01, { node: 2, nextReviewAt: '2026-09-21' }); // +7

  r = applyReviewAnswer(r, 'q01', true, '2026-09-21');
  assert.equal(r.q01.node, 3);
  assert.equal(r.q01.nextReviewAt, null); // 已掌握，不再到期
  assert.ok(isMastered(r, 'q01'));
  assert.ok(!hasActivePlan(r, 'q01'));
  assert.deepEqual(dueReviews(r, '2027-01-01'), []);
});

test('再错回第一节点重新计划', () => {
  let r = planOnWrong({}, 'q02', '2026-09-10');
  r = applyReviewAnswer(r, 'q02', true, '2026-09-11'); // node 1
  r = applyReviewAnswer(r, 'q02', false, '2026-09-14'); // 再错
  assert.deepEqual(r.q02, { node: 0, nextReviewAt: '2026-09-15' });
  assert.ok(hasActivePlan(r, 'q02'));
});

test('无计划答对不产生计划；已掌握后答对不动；多题互不影响', () => {
  let r = applyReviewAnswer({}, 'q03', true, '2026-09-10');
  assert.deepEqual(r, {});
  r = planOnWrong(r, 'q01', '2026-09-10');
  r = planOnWrong(r, 'q02', '2026-09-12');
  assert.deepEqual(dueReviews(r, '2026-09-11'), ['q01']);
  assert.deepEqual(dueReviews(r, '2026-09-12'), ['q01']); // q02 +1 天 → 09-13 才到期
  assert.deepEqual(dueReviews(r, '2026-09-13').sort(), ['q01', 'q02']);
});
