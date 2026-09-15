import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAnswer, levelOf, starsOf, STARS } from '../src/engine/mastery.js';

test('升级路径：1 对 → ★☆☆，连对 3 → ★★☆（熟悉）', () => {
  let m = {};
  m = applyAnswer(m, '结构', true, '2026-09-10');
  assert.equal(levelOf(m, '结构'), 1);
  assert.equal(starsOf(m, '结构'), '★☆☆');
  m = applyAnswer(m, '结构', true, '2026-09-10');
  assert.equal(levelOf(m, '结构'), 1); // chain 2 仍 ★☆☆
  m = applyAnswer(m, '结构', true, '2026-09-10');
  assert.equal(levelOf(m, '结构'), 2); // chain 3 → 熟悉
  assert.equal(starsOf(m, '结构'), '★★☆');
});

test('精通需间隔确认：熟悉后当天再答对不升，隔天答对 → ★★★', () => {
  let m = {};
  for (let i = 0; i < 3; i++) m = applyAnswer(m, '三视图', true, '2026-09-10');
  assert.equal(levelOf(m, '三视图'), 2);
  m = applyAnswer(m, '三视图', true, '2026-09-10'); // 当天再对：不升（防刷）
  assert.equal(levelOf(m, '三视图'), 2);
  m = applyAnswer(m, '三视图', true, '2026-09-11'); // 隔天答对 → 精通
  assert.equal(levelOf(m, '三视图'), 3);
  assert.equal(starsOf(m, '三视图'), '★★★');
});

test('答错清零降级：chain 归零、等级归零、需重新攀爬', () => {
  let m = {};
  for (let i = 0; i < 3; i++) m = applyAnswer(m, '截面', true, '2026-09-10');
  m = applyAnswer(m, '截面', false, '2026-09-11');
  assert.equal(levelOf(m, '截面'), 0);
  assert.equal(m['截面'].chain, 0);
  // 精通后答错同样降级
  let m2 = {};
  for (let i = 0; i < 3; i++) m2 = applyAnswer(m2, '截面', true, '2026-09-10');
  m2 = applyAnswer(m2, '截面', true, '2026-09-12'); // 精通
  assert.equal(levelOf(m2, '截面'), 3);
  m2 = applyAnswer(m2, '截面', false, '2026-09-13');
  assert.equal(levelOf(m2, '截面'), 0);
});

test('不同知识点互不影响；未知类默认 ☆☆☆；空/损坏数据容错', () => {
  let m = applyAnswer({}, '结构', true, '2026-09-10');
  assert.equal(levelOf(m, '综合'), 0);
  assert.equal(starsOf(null, '结构'), '☆☆☆');
  m = applyAnswer(m, '展开图', false, '2026-09-10');
  assert.equal(levelOf(m, '结构'), 1);
  assert.equal(levelOf(m, '展开图'), 0);
  assert.equal(STARS.length, 4);
});
