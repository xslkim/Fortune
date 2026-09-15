// 错题间隔复习（mp 薄包装）：纯逻辑在 @geo/core/engine/review.js，
// 存储换成本地 engine/storage.js（uni.setStorageSync），key 与 web 一致：gt_review。
import {
  planOnWrong,
  applyReviewAnswer,
  dueReviews,
  hasActivePlan,
  isMastered,
  OFFSETS,
} from '@geo/core/engine/review.js';
import { todayStr } from '@geo/core/engine/days.js';
import { loadObj, writeRaw } from './storage.js';

export { dueReviews, hasActivePlan, isMastered, OFFSETS };

export function loadReview() {
  return loadObj('review');
}

export function saveReview(r) {
  writeRaw('review', r);
}

/** 答错 → 生成/重置 +1/+3/+7 复习计划。day 缺省为今天。 */
export function recordWrong(quizId, day = todayStr()) {
  const r = planOnWrong(loadReview(), quizId, day);
  saveReview(r);
  return r;
}

/** 复习作答并持久化：答对推进节点，再错回第一节点。day 缺省为今天。 */
export function recordReviewAnswer(quizId, ok, day = todayStr()) {
  const r = applyReviewAnswer(loadReview(), quizId, ok, day);
  saveReview(r);
  return r;
}
