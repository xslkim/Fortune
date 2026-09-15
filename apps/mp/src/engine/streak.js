// 每日 streak（mp 薄包装）：纯逻辑在 @geo/core/engine/streak.js，
// 存储换成本地 engine/storage.js（uni.setStorageSync），key 与 web 一致：gt_streak。
import {
  recordActivity,
  goalProgress,
  emptyStreak,
  FREEZES_PER_MONTH,
  GOAL_STEPS,
  GOAL_ANSWERS,
  GOAL_GAMES,
} from '@geo/core/engine/streak.js';
import { todayStr } from '@geo/core/engine/days.js';
import { loadObj, writeRaw } from './storage.js';

export { goalProgress, emptyStreak, FREEZES_PER_MONTH, GOAL_STEPS, GOAL_ANSWERS, GOAL_GAMES };

export function loadStreak() {
  // 与 core 容错对齐：损坏/缺失时回落到 emptyStreak 默认值
  return { ...emptyStreak(), ...loadObj('streak') };
}

export function saveStreak(s) {
  writeRaw('streak', s);
}

/** 记录一次活动（'step' | 'answer' | 'game'）并持久化，返回最新 streak。day 缺省为今天。 */
export function record(kind, day = todayStr()) {
  const s = recordActivity(loadStreak(), kind, day);
  saveStreak(s);
  return s;
}
