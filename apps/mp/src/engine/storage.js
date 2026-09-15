// 存储封装：uni.setStorageSync/getStorageSync，key 前缀 'gt_'，读写全程 try/catch。
// 与 web 版 src/engine/progress.js 的数据结构保持一致：
//   gt_lessons  : { [lessonId]: maxStep }
//   gt_attempts : [{ id, ok, ts }]
//   gt_wrong    : { [quizId]: { corrected, ts } }
//   gt_filter   : { difficulty, category }

const PREFIX = 'gt_';

export function readRaw(key) {
  try {
    const raw = uni.getStorageSync(PREFIX + key);
    if (raw == null || raw === '') return null;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    try {
      uni.removeStorageSync(PREFIX + key);
    } catch {
      /* 忽略 */
    }
    return null;
  }
}

export function writeRaw(key, value) {
  try {
    uni.setStorageSync(PREFIX + key, JSON.stringify(value));
  } catch {
    /* 存储不可用时静默 */
  }
}

export function loadObj(key) {
  const v = readRaw(key);
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
}

export function loadArr(key) {
  const v = readRaw(key);
  return Array.isArray(v) ? v : [];
}
