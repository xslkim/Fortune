import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  recordActivity,
  goalProgress,
  emptyStreak,
  FREEZES_PER_MONTH,
} from '../src/engine/streak.js';

test('每日目标：学 1 步即达成；答 1~2 题不达成，答 3 题达成', () => {
  let s = recordActivity(emptyStreak(), 'step', '2026-09-10');
  assert.equal(s.current, 1);
  assert.equal(s.lastDoneDate, '2026-09-10');

  let s2 = recordActivity(emptyStreak(), 'answer', '2026-09-10');
  assert.equal(s2.current, 0); // 1 题不够
  s2 = recordActivity(s2, 'answer', '2026-09-10');
  assert.equal(s2.current, 0); // 2 题不够
  s2 = recordActivity(s2, 'answer', '2026-09-10');
  assert.equal(s2.current, 1); // 3 题达成
});

test('连续推进与 best；同一天重复记录不重复推进', () => {
  let s = recordActivity(emptyStreak(), 'step', '2026-09-10');
  s = recordActivity(s, 'step', '2026-09-10'); // 当天第二次
  assert.equal(s.current, 1);
  s = recordActivity(s, 'answer', '2026-09-11');
  s = recordActivity(s, 'answer', '2026-09-11');
  s = recordActivity(s, 'answer', '2026-09-11'); // 第 3 题达成
  assert.equal(s.current, 2);
  assert.equal(s.best, 2);
});

test('断签保护：间隔 1 天未学，自动消耗 freeze 保住 streak', () => {
  let s = recordActivity(emptyStreak(), 'step', '2026-09-10'); // current 1
  s = recordActivity(s, 'step', '2026-09-11'); // current 2
  // 09-12 未学，09-13 再学 → gap=2，消耗 1 次 freeze
  s = recordActivity(s, 'step', '2026-09-13');
  assert.equal(s.current, 3);
  assert.equal(s.freezes, FREEZES_PER_MONTH - 1);
});

test('freeze 耗尽或间隔 ≥2 天未学 → streak 清零重开', () => {
  let s = recordActivity(emptyStreak(), 'step', '2026-09-01');
  s = recordActivity(s, 'step', '2026-09-02'); // current 2
  s = recordActivity(s, 'step', '2026-09-04'); // freeze 1 → current 3
  s = recordActivity(s, 'step', '2026-09-06'); // freeze 2 → current 4
  assert.equal(s.freezes, 0);
  s = recordActivity(s, 'step', '2026-09-08'); // 无 freeze → 断签重开
  assert.equal(s.current, 1);
  assert.equal(s.best, 4);

  let s2 = recordActivity(emptyStreak(), 'step', '2026-09-01');
  s2 = recordActivity(s2, 'step', '2026-09-05'); // gap=4 → 直接重开（freeze 救不了）
  assert.equal(s2.current, 1);
});

test('freeze 每月重置为 2 次', () => {
  let s = recordActivity(emptyStreak(), 'step', '2026-09-28');
  s = recordActivity(s, 'step', '2026-09-30'); // 09-29 断，消耗 freeze → freezes 1
  assert.equal(s.freezes, 1);
  s = recordActivity(s, 'step', '2026-10-02'); // 跨月：freeze 重置为 2 后再消耗 → 1
  assert.equal(s.current, 3);
  assert.equal(s.freezes, FREEZES_PER_MONTH - 1);
  assert.equal(s.freezeMonth, '2026-10');
});

test('goalProgress：跨天清零；完成后 done=true', () => {
  let s = recordActivity(emptyStreak(), 'step', '2026-09-10');
  assert.deepEqual(goalProgress(s, '2026-09-10'), { steps: 1, answers: 0, games: 0, done: true });
  assert.deepEqual(goalProgress(s, '2026-09-11'), { steps: 0, answers: 0, games: 0, done: false });
});

test('玩 1 关闯关即达成今日目标；与答题路径互相独立', () => {
  let s = recordActivity(emptyStreak(), 'game', '2026-09-10');
  assert.equal(s.current, 1); // 1 关即达成
  assert.deepEqual(goalProgress(s, '2026-09-10'), { steps: 0, answers: 0, games: 1, done: true });

  // 答 2 题 + 玩 1 关：答题路径不够，但闯关路径达成
  let s2 = recordActivity(emptyStreak(), 'answer', '2026-09-10');
  s2 = recordActivity(s2, 'answer', '2026-09-10');
  assert.equal(s2.current, 0);
  s2 = recordActivity(s2, 'game', '2026-09-10');
  assert.equal(s2.current, 1);
  assert.equal(goalProgress(s2, '2026-09-10').games, 1);

  // 旧数据没有 games 字段时按 0 处理
  const legacy = recordActivity(
    { today: { date: '2026-09-10', steps: 0, answers: 2 } },
    'answer',
    '2026-09-10',
  );
  assert.equal(legacy.current, 1); // 第 3 题达成，games 缺省不炸
});

test('损坏数据容错', () => {
  const s = recordActivity(null, 'step', '2026-09-10');
  assert.equal(s.current, 1);
  const s2 = recordActivity({ current: 'x', freezes: null }, 'step', '2026-09-10');
  assert.equal(s2.current, 1);
});
