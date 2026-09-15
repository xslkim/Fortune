// 掌握度三星制（按知识点 category 维度）。纯逻辑可注入日期单测；存储用 gt_mastery。
// 规则：答对 chain+1；答错 chain 清零、等级归零（重新连续答对才能升回）。
//   chain 1~2 → ★☆☆（入门）；chain ≥ 3 → ★★☆（熟悉，记下 familiarDay）；
//   达到熟悉后【隔天及以后】再答对该类 1 题 → ★★★（精通，间隔确认，防刷）。
import { todayStr } from './days.js';

export const STARS = ['☆☆☆', '★☆☆', '★★☆', '★★★'];

function entryOf(mastery, category) {
  const e = mastery && mastery[category];
  return e && typeof e === 'object' ? e : { chain: 0, level: 0, familiarDay: null };
}

/** 纯函数：应用一次作答，返回新的 mastery 对象。day 为 'YYYY-MM-DD'。 */
export function applyAnswer(mastery, category, ok, day) {
  const e = { ...entryOf(mastery, category) };
  if (!ok) {
    e.chain = 0;
    e.level = 0;
    e.familiarDay = null; // 答错清零降级
  } else {
    e.chain += 1;
    if (e.level === 2 && e.familiarDay && day > e.familiarDay) {
      e.level = 3; // 熟悉后隔天答对 → 精通（间隔确认）
    } else if (e.chain >= 3 && e.level < 2) {
      e.level = 2;
      e.familiarDay = day; // 达到熟悉，记下日期
    } else if (e.chain >= 1 && e.level < 1) {
      e.level = 1;
    }
  }
  return { ...(mastery || {}), [category]: e };
}

/** 某类的等级 0..3（无记录为 0）。 */
export function levelOf(mastery, category) {
  const l = entryOf(mastery, category).level;
  return Number.isInteger(l) && l >= 0 && l <= 3 ? l : 0;
}

export function starsOf(mastery, category) {
  return STARS[levelOf(mastery, category)];
}

// ---------- localStorage 包装（try/catch 惯例） ----------

const KEY = 'gt_mastery';

export function loadMastery() {
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

export function saveMastery(m) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* 静默 */
  }
}

/** 记录一次作答并持久化，返回最新 mastery。 */
export function recordAnswer(category, ok, day = todayStr()) {
  const m = applyAnswer(loadMastery(), category, ok, day);
  saveMastery(m);
  return m;
}
