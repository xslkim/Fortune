// 错题间隔复习计划（+1/+3/+7 天三节点，类 Anki 简化版）。纯逻辑可注入日期单测；存储用 gt_review。
// 结构：{ [quizId]: { node, nextReviewAt } }
//   node 0/1/2 → 待复习节点（nextReviewAt = 到期日）；node 3 → 已掌握（nextReviewAt = null）。
// 答错生成/重置计划（回第一节点 +1 天）；复习答对推进到下一节点；全节点完成且答对 → 已掌握。
import { todayStr, addDays } from './days.js';

export const OFFSETS = [1, 3, 7]; // 三个复习节点间隔（天）

function normEntry(e) {
  return e && typeof e === 'object' && Number.isInteger(e.node) ? e : null;
}

/** 纯函数：答错 → 生成/重置复习计划（回第一节点）。 */
export function planOnWrong(review, quizId, day) {
  return { ...(review || {}), [quizId]: { node: 0, nextReviewAt: addDays(day, OFFSETS[0]) } };
}

/** 纯函数：复习作答。答对推进节点（满 → 已掌握），再错回第一节点。无计划时答对不产生计划。 */
export function applyReviewAnswer(review, quizId, ok, day) {
  const e = normEntry((review || {})[quizId]);
  if (!ok) return planOnWrong(review, quizId, day);
  if (!e || e.node >= OFFSETS.length) return { ...(review || {}) }; // 无计划或已掌握：不动
  const node = e.node + 1;
  const done = node >= OFFSETS.length;
  return {
    ...(review || {}),
    [quizId]: { node, nextReviewAt: done ? null : addDays(day, OFFSETS[node]) },
  };
}

/** 到期应复习的题目 id 列表（node < 3 且 nextReviewAt ≤ day）。 */
export function dueReviews(review, day) {
  return Object.entries(review || {})
    .filter(([, e]) => {
      const n = normEntry(e);
      return (
        n && n.node < OFFSETS.length && typeof n.nextReviewAt === 'string' && n.nextReviewAt <= day
      );
    })
    .map(([id]) => id);
}

/** 该题是否有进行中的复习计划（未掌握）。 */
export function hasActivePlan(review, quizId) {
  const e = normEntry((review || {})[quizId]);
  return !!e && e.node < OFFSETS.length;
}

/** 该题复习是否已掌握。 */
export function isMastered(review, quizId) {
  const e = normEntry((review || {})[quizId]);
  return !!e && e.node >= OFFSETS.length;
}

// ---------- localStorage 包装（try/catch 惯例） ----------

const KEY = 'gt_review';

export function loadReview() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* 忽略 */
    }
    return {};
  }
}

export function saveReview(r) {
  try {
    localStorage.setItem(KEY, JSON.stringify(r));
  } catch {
    /* 静默 */
  }
}

export function recordWrong(quizId, day = todayStr()) {
  const r = planOnWrong(loadReview(), quizId, day);
  saveReview(r);
  return r;
}

export function recordReviewAnswer(quizId, ok, day = todayStr()) {
  const r = applyReviewAnswer(loadReview(), quizId, ok, day);
  saveReview(r);
  return r;
}
