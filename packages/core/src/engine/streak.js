// 每日 streak + 断签保护（Duolingo 式低门槛：每日目标 = 学 1 个课程步骤 或 答 3 题 或 玩 1 关闯关）。
// 纯逻辑可注入日期单测；存储用 gt_streak。
// 字段：{ current, best, lastDoneDate, freezes, freezeMonth, today:{date, steps, answers, games} }
// 断签（间隔恰好 1 天未达成）时若当月还有 freeze（每月 2 次，月初重置）自动消耗保住 streak。
import { todayStr, diffDays } from './days.js';

export const FREEZES_PER_MONTH = 2;
export const GOAL_STEPS = 1; // 学 1 个课程步骤
export const GOAL_ANSWERS = 3; // 或答 3 题
export const GOAL_GAMES = 1; // 或玩 1 关闯关（含探究任务达成，由 app.js 在游戏答对时记入）

export function emptyStreak() {
  return {
    current: 0,
    best: 0,
    lastDoneDate: null,
    freezes: FREEZES_PER_MONTH,
    freezeMonth: null,
    today: null,
  };
}

function norm(streak) {
  const s = streak && typeof streak === 'object' ? streak : {};
  return {
    current: s.current | 0,
    best: s.best | 0,
    lastDoneDate: typeof s.lastDoneDate === 'string' ? s.lastDoneDate : null,
    freezes: Number.isInteger(s.freezes) ? s.freezes : FREEZES_PER_MONTH,
    freezeMonth: typeof s.freezeMonth === 'string' ? s.freezeMonth : null,
    today: s.today && typeof s.today === 'object' ? s.today : null,
  };
}

/**
 * 纯函数：记录一次活动（kind: 'step' | 'answer' | 'game'），返回新的 streak。
 * day 为 'YYYY-MM-DD'。当天目标达成时才推进 streak。
 */
export function recordActivity(streak, kind, day) {
  const s = norm(streak);
  const month = day.slice(0, 7);
  if (s.freezeMonth !== month) {
    s.freezes = FREEZES_PER_MONTH;
    s.freezeMonth = month;
  } // 月初重置

  const today =
    s.today && s.today.date === day
      ? { ...s.today }
      : { date: day, steps: 0, answers: 0, games: 0 };
  if (kind === 'step') today.steps += 1;
  else if (kind === 'answer') today.answers += 1;
  else if (kind === 'game') today.games = (today.games | 0) + 1;
  s.today = today;

  const goalMet =
    today.steps >= GOAL_STEPS || today.answers >= GOAL_ANSWERS || (today.games | 0) >= GOAL_GAMES;
  if (goalMet && s.lastDoneDate !== day) {
    if (s.lastDoneDate === null) {
      s.current = 1;
    } else {
      const gap = diffDays(s.lastDoneDate, day);
      if (gap === 1) s.current += 1;
      else if (gap === 2 && s.freezes > 0) {
        s.freezes -= 1;
        s.current += 1;
      } // 断签保护
      else s.current = 1; // 断签（或无 freeze 可用）重新开始
    }
    s.lastDoneDate = day;
    s.best = Math.max(s.best, s.current);
  }
  return s;
}

/** 今日目标进度：{ steps, answers, games, done }。 */
export function goalProgress(streak, day) {
  const s = norm(streak);
  const t = s.today && s.today.date === day ? s.today : { steps: 0, answers: 0, games: 0 };
  return {
    steps: t.steps | 0,
    answers: t.answers | 0,
    games: t.games | 0,
    done: s.lastDoneDate === day,
  };
}

// ---------- localStorage 包装（try/catch 惯例） ----------

const KEY = 'gt_streak';

export function loadStreak() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : emptyStreak();
  } catch {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* 忽略 */
    }
    return emptyStreak();
  }
}

export function saveStreak(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 静默 */
  }
}

/** 记录一次活动并持久化，返回最新 streak。 */
export function record(kind, day = todayStr()) {
  const s = recordActivity(loadStreak(), kind, day);
  saveStreak(s);
  return s;
}
