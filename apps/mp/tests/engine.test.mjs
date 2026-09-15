// mp 学习闭环引擎测试：mastery / streak / review / report 薄包装在 stub uni 存储下的行为。
// 全部用 day 参数注入日期，不依赖真实日期（record 缺省 todayStr 的默认值不在此覆盖）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todayStr } from '@geo/core/engine/days.js';
import * as mastery from '../src/engine/mastery.js';
import * as streak from '../src/engine/streak.js';
import * as review from '../src/engine/review.js';
import * as report from '../src/engine/report.js';
import * as progress from '../src/engine/progress.js';

// stub uni 存储：每个 test 内独立 Map，结束时清理
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

test('mastery：连对升星（1→2→3 星，精通需隔天确认），答错清零', () => {
  stubUni();
  try {
    const D0 = '2026-09-07';
    const D1 = '2026-09-08';
    const CAT = '结构';

    mastery.recordAnswer(CAT, true, D0);
    assert.equal(mastery.levelOf(mastery.loadMastery(), CAT), 1);
    assert.equal(mastery.starsOf(mastery.loadMastery(), CAT), '★☆☆');

    mastery.recordAnswer(CAT, true, D0); // 第 2 连对仍 1 星
    assert.equal(mastery.levelOf(mastery.loadMastery(), CAT), 1);

    mastery.recordAnswer(CAT, true, D0); // 第 3 连对 → 2 星（熟悉）
    assert.equal(mastery.levelOf(mastery.loadMastery(), CAT), 2);
    assert.equal(mastery.starsOf(mastery.loadMastery(), CAT), '★★☆');

    mastery.recordAnswer(CAT, true, D1); // 熟悉后隔天答对 → 3 星（精通）
    assert.equal(mastery.levelOf(mastery.loadMastery(), CAT), 3);
    assert.equal(mastery.starsOf(mastery.loadMastery(), CAT), '★★★');

    mastery.recordAnswer(CAT, false, D1); // 答错清零降级
    assert.equal(mastery.levelOf(mastery.loadMastery(), CAT), 0);
    assert.equal(mastery.starsOf(mastery.loadMastery(), CAT), '☆☆☆');
  } finally {
    delete globalThis.uni;
  }
});

test('streak：记录 step/answer 推进今日目标，答 3 题达成 streak', () => {
  stubUni();
  try {
    const D0 = '2026-09-07';
    const D1 = '2026-09-08';

    streak.record('step', D0); // 学 1 步即达成
    let s = streak.loadStreak();
    assert.equal(s.current, 1);
    assert.equal(s.best, 1);
    let g = streak.goalProgress(s, D0);
    assert.equal(g.steps, 1);
    assert.equal(g.done, true);

    // 次日答 2 题未达成，答第 3 题达成 → 连续 2 天
    streak.record('answer', D1);
    streak.record('answer', D1);
    s = streak.loadStreak();
    g = streak.goalProgress(s, D1);
    assert.equal(g.answers, 2);
    assert.equal(g.done, false);
    assert.equal(s.current, 1);

    streak.record('answer', D1);
    s = streak.loadStreak();
    g = streak.goalProgress(s, D1);
    assert.equal(g.answers, 3);
    assert.equal(g.done, true);
    assert.equal(s.current, 2);
    assert.equal(s.best, 2);
  } finally {
    delete globalThis.uni;
  }
});

test('review：答错生成 +1/+3/+7 计划，dueReviews 按到期日返回，答对推进至掌握', () => {
  stubUni();
  try {
    const D0 = '2026-09-07';
    const QID = 'q-test-01';

    review.recordWrong(QID, D0);
    assert.equal(review.hasActivePlan(review.loadReview(), QID), true);
    assert.equal(review.isMastered(review.loadReview(), QID), false);
    // 当天未到期（+1 天）
    assert.deepEqual(review.dueReviews(review.loadReview(), D0), []);

    const D1 = '2026-09-08'; // +1 到期
    assert.deepEqual(review.dueReviews(review.loadReview(), D1), [QID]);
    review.recordReviewAnswer(QID, true, D1); // 节点 1 → 下次 +3 天
    assert.deepEqual(review.dueReviews(review.loadReview(), D1), []);

    const D4 = '2026-09-11'; // +3 到期
    assert.deepEqual(review.dueReviews(review.loadReview(), D4), [QID]);
    review.recordReviewAnswer(QID, true, D4); // 节点 2 → 下次 +7 天

    const D11 = '2026-09-18'; // +7 到期
    assert.deepEqual(review.dueReviews(review.loadReview(), D11), [QID]);
    review.recordReviewAnswer(QID, true, D11); // 节点满 → 已掌握
    assert.equal(review.isMastered(review.loadReview(), QID), true);
    assert.deepEqual(review.dueReviews(review.loadReview(), D11), []);

    // 复习时再错 → 回第一节点
    review.recordReviewAnswer(QID, false, D11);
    assert.equal(review.isMastered(review.loadReview(), QID), false);
    assert.equal(review.hasActivePlan(review.loadReview(), QID), true);
  } finally {
    delete globalThis.uni;
  }
});

test('report：buildWeeklyReport 输出本周字段，reportText 含关键行', () => {
  stubUni();
  try {
    const day = todayStr(); // 作答 ts 为真实当前时间，周报截止日取今天
    progress.recordAttempt('q01', true);
    progress.recordAttempt('q01', false);
    progress.recordAttempt('q01', true); // 本周攻克错题 1
    progress.recordAttempt('q02', true);

    const r = report.buildWeeklyReport(day);
    assert.equal(typeof r.weekStart, 'string');
    assert.equal(r.weekEnd, day);
    assert.ok(r.days >= 1, '本周学习天数 ≥ 1');
    assert.equal(r.answers, 4);
    assert.equal(r.acc, 75);
    assert.equal(r.conquered, 1);
    assert.equal(r.stars.length, 8);
    assert.equal(typeof r.suggestion, 'string');

    const text = report.reportText(r);
    assert.ok(text.includes('立体几何学习周报'));
    assert.ok(text.includes('本周答题 4 道，正确率 75%'));
    assert.ok(text.includes('本周攻克错题 1 道'));
  } finally {
    delete globalThis.uni;
  }
});
