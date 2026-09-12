// 学习进度 + 错题本业务层：逻辑与 web 版 src/engine/progress.js 一致，
// 存储换成 engine/storage.js（uni.setStorageSync）。
import { loadObj, loadArr, writeRaw } from './storage.js';

// ---------- 课程进度 ----------

/** 已学到的最大步骤下标；从未学过返回 null。 */
export function getLessonStep(lessonId) {
  const v = loadObj('lessons')[lessonId];
  return Number.isInteger(v) && v >= 0 ? v : null;
}

/** 学到第 step 步（只增不减）。 */
export function setLessonStep(lessonId, step) {
  if (!Number.isInteger(step) || step < 0) return;
  const m = loadObj('lessons');
  if (m[lessonId] == null || step > m[lessonId]) {
    m[lessonId] = step;
    writeRaw('lessons', m);
  }
}

/** 课程是否已完成（学到过最后一步）。 */
export function isLessonDone(lessonId, totalSteps) {
  const s = getLessonStep(lessonId);
  return s != null && s >= totalSteps - 1;
}

// ---------- 答题记录与错题本 ----------

/** 全部作答记录 [{ id, ok, ts }]。 */
export function allAttempts() {
  return loadArr('attempts').filter((a) => a && typeof a.id === 'string' && typeof a.ok === 'boolean');
}

/** 记录一次作答；答错进错题本，答对且已在错题本则标记已订正（保留记录）。 */
export function recordAttempt(quizId, ok) {
  const ts = Date.now();
  const at = allAttempts();
  at.push({ id: quizId, ok: !!ok, ts });
  writeRaw('attempts', at);

  const wrong = loadObj('wrong');
  if (!ok) {
    wrong[quizId] = { corrected: false, ts };
    writeRaw('wrong', wrong);
  } else if (wrong[quizId] && !wrong[quizId].corrected) {
    wrong[quizId].corrected = true;
    writeRaw('wrong', wrong);
  }
}

/** 题目状态：'none' 未做 | 'ok' 已对 | 'wrong' 错过。 */
export function quizStatus(quizId) {
  let seen = false;
  for (const a of allAttempts()) {
    if (a.id !== quizId) continue;
    if (a.ok) return 'ok';
    seen = true;
  }
  return seen ? 'wrong' : 'none';
}

/** 错题本条目 [{ id, corrected, ts }]，按最近答错时间倒序。 */
export function wrongList() {
  const wrong = loadObj('wrong');
  return Object.entries(wrong)
    .filter(([, v]) => v && typeof v === 'object')
    .map(([id, v]) => ({ id, corrected: !!v.corrected, ts: v.ts || 0 }))
    .sort((a, b) => b.ts - a.ts);
}

/** 从错题本移除（不影响作答记录）。 */
export function removeWrong(quizId) {
  const wrong = loadObj('wrong');
  if (quizId in wrong) {
    delete wrong[quizId];
    writeRaw('wrong', wrong);
  }
}

// ---------- 题库筛选（gt_filter） ----------

export function loadFilter() {
  const v = loadObj('filter');
  return v;
}

export function saveFilter(filter) {
  writeRaw('filter', filter);
}
