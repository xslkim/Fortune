// 家长周报聚合：从现有学习数据（作答记录/掌握度/streak）汇总本周表现。
// 纯逻辑可注入日期单测；UI 与分享文案在 app.js，存储读取也在 app.js 完成后传入。
import { todayStr, addDays } from './days.js';
import { levelOf, starsOf } from './mastery.js';

/** 本周一的日期字符串（day 为 'YYYY-MM-DD'）。 */
export function weekStart(day) {
  const [y, m, d] = day.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0=周日
  return addDays(day, -((dow + 6) % 7));
}

/** ts（毫秒）是否落在 [startDay, endDay]（含两端，按本地日期）。 */
function inWeek(ts, startDay, endDay) {
  if (!Number.isFinite(ts)) return false;
  const s = todayStr(new Date(ts));
  return s >= startDay && s <= endDay;
}

/**
 * 聚合周报数据。data：
 *   attempts    全部历史作答 [{ id, ok, ts }]
 *   categoryOf  (quizId) => 知识分类
 *   categories  要汇总的分类列表（顺序即展示顺序）
 *   lessonsDone / lessonsTotal  累计完成课程数 / 课程总数
 *   mastery     gt_mastery 对象
 *   streak      gt_streak 对象
 * day 为 'YYYY-MM-DD'（周报截止日，通常今天）。
 */
export function buildReport(data, day) {
  const start = weekStart(day);
  const attempts = Array.isArray(data.attempts) ? data.attempts : [];
  const categoryOf = typeof data.categoryOf === 'function' ? data.categoryOf : () => '综合';
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const week = attempts.filter((a) => inWeek(a.ts, start, day));

  // 本周学习天数：有作答记录的去重日期数（课程步骤无时间戳，以作答为准）
  const days = new Set(week.map((a) => todayStr(new Date(a.ts)))).size;

  const answers = week.length;
  const okCount = week.filter((a) => a.ok).length;
  const acc = answers ? Math.round((okCount / answers) * 100) : 0;

  // 本周攻克错题：本周答对、且历史（含本周）曾答错过的去重题数
  const everWrong = new Set(attempts.filter((a) => !a.ok).map((a) => a.id));
  const conquered = new Set(week.filter((a) => a.ok && everWrong.has(a.id)).map((a) => a.id)).size;

  // 薄弱知识点：本周答错最多的分类；本周无错题则看全部历史
  const pool = week.some((a) => !a.ok) ? week : attempts;
  const wrongByCat = {};
  for (const a of pool) {
    if (a.ok) continue;
    const c = categoryOf(a.id);
    wrongByCat[c] = (wrongByCat[c] || 0) + 1;
  }
  let weakCat = null,
    weakWrong = 0;
  for (const [c, n] of Object.entries(wrongByCat)) {
    if (n > weakWrong) {
      weakCat = c;
      weakWrong = n;
    }
  }

  const mastery = data.mastery && typeof data.mastery === 'object' ? data.mastery : {};
  const stars = categories.map((cat) => ({
    cat,
    level: levelOf(mastery, cat),
    stars: starsOf(mastery, cat),
  }));

  const s = data.streak && typeof data.streak === 'object' ? data.streak : {};
  const current = s.current | 0;

  let suggestion;
  if (answers === 0 && days === 0) {
    suggestion = '本周还没有学习记录，建议每天抽 10 分钟学一步课程或做几道题，先养成习惯。';
  } else if (weakCat) {
    suggestion = `本周孩子在「${weakCat}」上答错较多（${weakWrong} 次），建议陪同回顾相关课程，再到题库针对这个知识点练几道题。`;
  } else if (acc >= 80) {
    suggestion = '本周正确率很高，可以鼓励孩子挑战带「简洁星」的难题，尝试更巧妙的解法。';
  } else {
    suggestion = '本周学习节奏不错，继续保持；答错的题已在错题本安排了间隔复习，提醒孩子按时完成。';
  }

  return {
    weekStart: start,
    weekEnd: day,
    days,
    currentStreak: current,
    lessonsDone: data.lessonsDone | 0,
    lessonsTotal: data.lessonsTotal | 0,
    answers,
    acc,
    conquered,
    weakCat,
    weakWrong,
    stars,
    suggestion,
  };
}

/** 生成给家长群的纯文本分享文案。 */
export function reportText(r) {
  const fmt = (d) => `${Number(d.slice(5, 7))}/${d.slice(8, 10)}`;
  const lines = [
    `📊 立体几何学习周报（${fmt(r.weekStart)} - ${fmt(r.weekEnd)}）`,
    `✅ 本周学习 ${r.days} 天 · 连续学习 ${r.currentStreak} 天`,
    `📚 累计完成课程 ${r.lessonsDone}/${r.lessonsTotal} 节`,
    `✏️ 本周答题 ${r.answers} 道，正确率 ${r.acc}%`,
    `⭐ 知识点掌握：${r.stars.map((x) => `${x.cat}${x.stars}`).join('　') || '暂无'}`,
    `💪 本周攻克错题 ${r.conquered} 道`,
  ];
  if (r.weakCat) lines.push(`⚠️ 薄弱知识点：${r.weakCat}（答错 ${r.weakWrong} 次）`);
  lines.push(`💡 ${r.suggestion}`);
  return lines.join('\n');
}
