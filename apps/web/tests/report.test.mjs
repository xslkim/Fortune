import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weekStart, buildReport, reportText } from '../src/engine/report.js';
import { applyAnswer } from '../src/engine/mastery.js';

const T = (day) => new Date(day + 'T12:00:00').getTime(); // 当天中午的时间戳

test('weekStart：回到本周一；周一当天返回自身', () => {
  assert.equal(weekStart('2026-09-13'), '2026-09-07'); // 周日 → 本周一
  assert.equal(weekStart('2026-09-07'), '2026-09-07'); // 周一
  assert.equal(weekStart('2026-09-09'), '2026-09-07'); // 周三
  assert.equal(weekStart('2026-09-01'), '2026-08-31'); // 周二，周一在上月
});

function sampleData() {
  // 本周 2026-09-07(周一) ~ 2026-09-13(周日)，day = 09-13
  return {
    attempts: [
      { id: 'q1', ok: false, ts: T('2026-09-05') }, // 上周的错题（历史）
      { id: 'q1', ok: true, ts: T('2026-09-08') }, // 本周攻克
      { id: 'q2', ok: true, ts: T('2026-09-08') },
      { id: 'q3', ok: false, ts: T('2026-09-09') }, // 本周错：结构
      { id: 'q4', ok: false, ts: T('2026-09-09') }, // 本周错：结构
      { id: 'q5', ok: false, ts: T('2026-09-10') }, // 本周错：截面
      { id: 'q6', ok: true, ts: T('2026-09-10') },
    ],
    categoryOf: (id) =>
      ({ q1: '展开图', q2: '展开图', q3: '结构', q4: '结构', q5: '截面', q6: '截面' })[id],
    categories: ['结构', '展开图', '截面'],
    lessonsDone: 2,
    lessonsTotal: 7,
    mastery: applyAnswer(
      applyAnswer(applyAnswer({}, '结构', true, '2026-09-08'), '结构', true, '2026-09-08'),
      '结构',
      true,
      '2026-09-08',
    ), // chain 3 → ★★☆
    streak: { current: 5 },
  };
}

test('buildReport：学习天数/答题数/正确率/攻克错题/薄弱知识点聚合正确', () => {
  const r = buildReport(sampleData(), '2026-09-13');
  assert.equal(r.weekStart, '2026-09-07');
  assert.equal(r.days, 3); // 09-08 / 09-09 / 09-10
  assert.equal(r.answers, 6); // 上周那条不计
  assert.equal(r.acc, 50); // 3 对 3 错
  assert.equal(r.conquered, 1); // q1 曾错、本周答对
  assert.equal(r.weakCat, '结构'); // 本周错 2 次，最多
  assert.equal(r.weakWrong, 2);
  assert.equal(r.currentStreak, 5);
  assert.equal(r.lessonsDone, 2);
  assert.equal(r.stars.length, 3);
  assert.equal(r.stars.find((x) => x.cat === '结构').stars, '★★☆');
  assert.equal(r.stars.find((x) => x.cat === '截面').stars, '☆☆☆');
  assert.match(r.suggestion, /结构/);
});

test('buildReport：本周无记录时的空态与容错', () => {
  const r = buildReport(
    {
      attempts: [],
      categories: ['结构'],
      lessonsDone: 0,
      lessonsTotal: 7,
      mastery: {},
      streak: null,
    },
    '2026-09-13',
  );
  assert.equal(r.days, 0);
  assert.equal(r.answers, 0);
  assert.equal(r.acc, 0);
  assert.equal(r.weakCat, null);
  assert.match(r.suggestion, /还没有学习记录/);
  // data 字段缺失不炸
  const r2 = buildReport({}, '2026-09-13');
  assert.equal(r2.answers, 0);
});

test('本周无错题时薄弱知识点回看全部历史；reportText 含关键数据', () => {
  const data = sampleData();
  data.attempts = [
    { id: 'q3', ok: false, ts: T('2026-09-01') }, // 历史错：结构
    { id: 'q1', ok: true, ts: T('2026-09-09') },
    { id: 'q2', ok: true, ts: T('2026-09-09') },
  ];
  const r = buildReport(data, '2026-09-13');
  assert.equal(r.weakCat, '结构'); // 本周无错 → 用历史
  assert.equal(r.acc, 100);
  const text = reportText(r);
  assert.match(text, /学习周报/);
  assert.match(text, /9\/07 - 9\/13/);
  assert.match(text, /正确率 100%/);
  assert.match(text, /结构/);
  assert.match(text, /连续学习 5 天/);
});
