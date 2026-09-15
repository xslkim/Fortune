// 「展开图闯关」进度（mp）：key 与 web 一致（gt_netgame_v1）、结构一致、顺序锁规则正确
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVEL_COUNT } from '@geo/core/data/netgame.js';
import {
  loadProgress,
  saveProgress,
  normalizeProgress,
  isLevelUnlocked,
} from '../src/engine/netgame.js';

function stubUni() {
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
  return store;
}

test('闯关进度：key 为 gt_netgame_v1，结构同 web，存取可往返', () => {
  const store = stubUni();
  const p = loadProgress();
  assert.equal(p.levels.length, LEVEL_COUNT);
  assert.ok(p.levels.every((l) => l.stars === 0 && !l.passed));

  p.levels[0] = { stars: 3, passed: true };
  p.levels[1] = { stars: 2, passed: true };
  saveProgress(p);
  assert.ok(store.has('gt_netgame_v1'), '应写入 gt_netgame_v1（storage.js 加 gt_ 前缀）');

  const back = loadProgress();
  assert.deepEqual(back.levels[0], { stars: 3, passed: true });
  assert.deepEqual(back.levels[1], { stars: 2, passed: true });
  assert.ok(!back.levels[2].passed);

  // 旧版「星级数组」payload 按无记录处理（与 web 行为一致）
  store.set('gt_netgame_v1', JSON.stringify([3, 3, 1]));
  assert.ok(loadProgress().levels.every((l) => !l.passed));
  store.set('gt_netgame_v1', '{broken');
  assert.equal(loadProgress().levels.length, LEVEL_COUNT);

  delete globalThis.uni;
});

test('顺序锁：第 N 关通过后才解锁第 N+1 关', () => {
  const p = normalizeProgress(null);
  assert.ok(isLevelUnlocked(p, 0));
  assert.ok(!isLevelUnlocked(p, 1));
  p.levels[0] = { stars: 1, passed: true };
  assert.ok(isLevelUnlocked(p, 1));
  assert.ok(!isLevelUnlocked(p, 2));
  p.levels[LEVEL_COUNT - 2] = { stars: 3, passed: true };
  assert.ok(isLevelUnlocked(p, LEVEL_COUNT - 1));
  assert.ok(!isLevelUnlocked(p, LEVEL_COUNT), '越界不解锁');
});
