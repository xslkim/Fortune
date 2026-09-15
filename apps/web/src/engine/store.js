// 统一存储层：localStorage 薄封装 + key 清单 + schema 迁移钩子。
//
// 背景：项目内多处直接读写 localStorage（前缀 'gt_'），本模块是 UI 层写存储的
// 唯一入口；engine/ 内部（progress/mastery/streak/review，见 packages/core/src/engine/）
// 的 load/save 仍是各自薄包装，收编为后续项。
//
// 容错：隐私模式/禁 Cookie 等场景 localStorage 会抛 SecurityError，此时静默降级为
// 进程内 Map（本次会话可用，刷新后丢失，与原 try/catch 忽略行为对齐但更有用）。
export const STORAGE_KEYS = {
  lessons: 'gt_lessons', // engine/progress：{ [lessonId]: maxStep }
  attempts: 'gt_attempts', // engine/progress：[{ id, ok, ts }]
  wrong: 'gt_wrong', // engine/progress：{ [quizId]: { corrected, ts } }
  filter: 'gt_filter', // UI 题库筛选：{ difficulty, category }
  challenge: 'gt_challenge', // UI 简洁星挑战：{ [quizId]: { stars, ts } }
  netgame: 'gt_netgame_v1', // 闯关进度：{ levels: [{ stars, passed }] }（旧版星级数组按无记录处理）
  mastery: 'gt_mastery', // engine/mastery：各分类掌握度
  streak: 'gt_streak', // engine/streak：连续学习/每日目标
  review: 'gt_review', // engine/review：+1/+3/+7 复习计划
};

// localStorage 不可用时的进程内兜底
const memory = new Map();

function rawGet(key) {
  try {
    const v = localStorage.getItem(key);
    // getItem 正常但 setItem 抛错（如 Safari 隐私模式配额为 0）时，本会话写入在 memory 里
    return v != null ? v : memory.has(key) ? memory.get(key) : null;
  } catch {
    return memory.has(key) ? memory.get(key) : null;
  }
}

function rawSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
}

function rawRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    memory.delete(key);
  }
}

/** 读并 JSON 反序列化；键不存在或数据损坏时返回 fallback。 */
export function get(key, fallback = null) {
  const raw = rawGet(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** JSON 序列化后写入；存储不可用时降级内存。 */
export function set(key, value) {
  rawSet(key, JSON.stringify(value));
}

/** 删除键（清损坏数据用）。 */
export function remove(key) {
  rawRemove(key);
}

// ---------- schema 迁移 ----------
//
// gt_netgame_v1 的 '_v1' 后缀是显式版本号：闯关进度 schema 一旦演进（如从
// 「星级数组」改为「带时间戳的对象」），新 key 应叫 gt_netgame_v2，并在 migrate()
// 里把 v1 数据转换后写入 v2、保留 v1 只读不回写（避免新旧版本互相踩）。
// 其余 key 目前均为 v1 隐式版本（无后缀），首次变更其 schema 时同样在这里补迁移。
export function migrate() {
  // 已知历史：netgame 从未有过未版本化的 'gt_netgame' key，这里仅作钩子占位；
  // 若未来发现旧版数据，按上面的约定在此转换。任何迁移失败都不阻塞启动。
  try {
    const legacy = get('gt_netgame', null);
    if (legacy != null && get(STORAGE_KEYS.netgame, null) == null) {
      set(STORAGE_KEYS.netgame, legacy);
    }
  } catch {
    /* 存储异常不影响启动 */
  }
}
