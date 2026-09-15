// 掌握度三星制（mp 薄包装）：纯逻辑在 @geo/core/engine/mastery.js，
// 存储换成本地 engine/storage.js（uni.setStorageSync），key 与 web 一致：gt_mastery。
import { applyAnswer, levelOf, starsOf, STARS } from '@geo/core/engine/mastery.js';
import { todayStr } from '@geo/core/engine/days.js';
import { loadObj, writeRaw } from './storage.js';

export { levelOf, starsOf, STARS };

export function loadMastery() {
  return loadObj('mastery');
}

export function saveMastery(m) {
  writeRaw('mastery', m);
}

/** 记录一次作答并持久化，返回最新 mastery。day 缺省为今天。 */
export function recordAnswer(category, ok, day = todayStr()) {
  const m = applyAnswer(loadMastery(), category, ok, day);
  saveMastery(m);
  return m;
}
