// 家长周报（mp 薄包装）：聚合逻辑与文案在 @geo/core/engine/report.js，
// 这里负责从 mp 侧存储（progress/mastery/streak）组装 data，口径与 web app.js buildWeeklyReport 一致。
import { weekStart, buildReport, reportText } from '@geo/core/engine/report.js';
import { todayStr } from '@geo/core/engine/days.js';
import { QUIZZES } from '@geo/core/data/quizzes.js';
import { LESSONS } from '@geo/core/data/lessons.js';
import * as progress from './progress.js';
import * as mastery from './mastery.js';
import * as streak from './streak.js';
import { CATEGORIES, FALLBACK_CAT, quizCategory } from './categories.js';

export { weekStart, reportText };

const QUIZ_BY_ID = new Map(QUIZZES.map((q) => [q.id, q]));

/** 组装本周周报数据（day 缺省为今天，通常周一~今天的区间）。 */
export function buildWeeklyReport(day = todayStr()) {
  return buildReport(
    {
      attempts: progress.allAttempts(),
      categoryOf: (id) => {
        const q = QUIZ_BY_ID.get(id);
        return q ? quizCategory(q) : FALLBACK_CAT;
      },
      categories: [...CATEGORIES],
      lessonsDone: LESSONS.filter((l) => progress.isLessonDone(l.id, l.steps.length)).length,
      lessonsTotal: LESSONS.length,
      mastery: mastery.loadMastery(),
      streak: streak.loadStreak(),
    },
    day,
  );
}
