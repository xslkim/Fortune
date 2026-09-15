// 错题本视图：错题列表 + 间隔复习队列 + 家长周报（数据从 progress/mastery/streak 聚合）。
// 答题/复习经 quiz.js 的 openQuiz/startReview 进入。
import { LESSONS } from '@geo/core/data/lessons.js';
import * as audio from '../../engine/audio.js';
import * as progress from '../../engine/progress.js';
import * as mastery from '../../engine/mastery.js';
import * as streak from '../../engine/streak.js';
import * as review from '../../engine/review.js';
import * as report from '../../engine/report.js';
import { todayStr } from '../../engine/days.js';
import { chart, clipboard, pin, flame } from '../icons.js';
import { state, viewer, panel, setViewsVisible, switchView } from '../app.js';
import { el, makeSolid, QUIZ_BY_ID } from './common.js';
import {
  openQuiz,
  startReview,
  quizCategory,
  DIFF_NAMES,
  CATEGORIES,
  FALLBACK_CAT,
} from './quiz.js';

export function renderWrongBook() {
  audio.stopAll();
  state.quiz = null;
  panel.innerHTML = '';
  const wbHead = el('div', 'due-head');
  wbHead.appendChild(el('h2', 'panel-title', '错题本'));
  const reportBtn = el('button', 'btn btn-small', `${chart} 家长周报`);
  reportBtn.addEventListener('click', renderReport);
  wbHead.appendChild(reportBtn);
  panel.appendChild(wbHead);

  // 统计：总作答数 / 正确率 / 待订正数
  const at = progress.allAttempts();
  const okCount = at.filter((a) => a.ok).length;
  const acc = at.length ? Math.round((okCount / at.length) * 100) : 0;
  const list = progress.wrongList();
  const todo = list.filter((w) => !w.corrected).length;
  const bar = el('div', 'stats stat-bar');
  bar.appendChild(el('div', 'stat', `<strong>${at.length}</strong><span>总作答数</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${acc}%</strong><span>正确率</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${todo}</strong><span>待订正</span>`));
  panel.appendChild(bar);

  // 待复习区块：间隔复习（+1/+3/+7 天）到期题置顶，可一键进入复习模式
  const rv = review.loadReview();
  const due = review.dueReviews(rv, todayStr()).filter((id) => QUIZ_BY_ID.has(id));
  if (due.length) {
    const block = el('div', 'due-block');
    const head = el('div', 'due-head');
    head.appendChild(el('strong', null, `${pin} 待复习 ${due.length} 题`));
    const start = el('button', 'btn btn-small btn-primary', '开始复习');
    start.addEventListener('click', () => startReview(due));
    head.appendChild(start);
    block.appendChild(head);
    block.appendChild(
      el('p', 'muted', '按 +1/+3/+7 天间隔安排，复习答对即推进，全部通过标记「已掌握」。'),
    );
    const names = due
      .slice(0, 5)
      .map((id) => QUIZ_BY_ID.get(id).title)
      .join('、');
    block.appendChild(el('p', 'muted', names + (due.length > 5 ? ` 等 ${due.length} 题` : '')));
    panel.appendChild(block);
  }

  if (!list.length) {
    // 空状态：图标 + 引导 + 去题库按钮
    const empty = el('div', 'empty-state');
    empty.innerHTML = `${clipboard}<p>暂无错题，继续保持！</p><p>答错的题目会自动收进错题本。</p>`;
    const go = el('button', 'btn btn-small btn-primary', '去题库刷题');
    go.addEventListener('click', () => switchView('quizzes'));
    empty.appendChild(go);
    panel.appendChild(empty);
  } else {
    panel.appendChild(el('p', 'muted', '答对后会标记「已订正」，记录仍保留，可手动移除。'));
    const cards = el('div', 'card-list');
    for (const w of list) {
      const q = QUIZ_BY_ID.get(w.id);
      if (!q) continue; // 题目已下架则跳过
      const card = el('div', 'card wrong-card');
      // 整卡可点（等同「重答」）：div 内含按钮，不能改 button，补键盘支持
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `重答：${q.title}`);
      card.addEventListener('click', () => openQuiz(q, 'wrong'));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openQuiz(q, 'wrong');
        }
      });
      const main = el('div', 'card-main');
      main.appendChild(el('strong', null, q.title));
      const badges = el('span', 'badge-row');
      badges.appendChild(el('span', 'badge cat', quizCategory(q))); // 错题归因到知识点
      badges.appendChild(el('span', `badge diff-${q.difficulty}`, DIFF_NAMES[q.difficulty] || ''));
      badges.appendChild(
        el(
          'span',
          `badge ${w.corrected ? 'st-ok' : 'st-wrong'}`,
          w.corrected ? '已订正' : '待订正',
        ),
      );
      const plan = rv[w.id];
      if (plan && Number.isInteger(plan.node)) {
        if (review.isMastered(rv, w.id)) {
          badges.appendChild(el('span', 'badge st-ok', '已掌握'));
        } else {
          const dueTag = due.includes(w.id) ? ' · 已到期' : '';
          badges.appendChild(
            el(
              'span',
              'badge st-doing',
              `复习 ${plan.node}/${review.OFFSETS.length}${plan.nextReviewAt ? ` · ${plan.nextReviewAt.slice(5).replace('-', '/')} 到期` : ''}${dueTag}`,
            ),
          );
        }
      }
      main.appendChild(badges);
      card.appendChild(main);
      const actions = el('div', 'wrong-actions');
      const retry = el('button', 'btn btn-small btn-primary', '重答');
      retry.addEventListener('click', (e) => {
        e.stopPropagation();
        openQuiz(q, 'wrong');
      });
      const remove = el('button', 'btn btn-small', '移除');
      remove.addEventListener('click', (e) => {
        e.stopPropagation();
        progress.removeWrong(w.id);
        renderWrongBook();
      });
      actions.appendChild(retry);
      actions.appendChild(remove);
      card.appendChild(actions);
      cards.appendChild(card);
    }
    panel.appendChild(cards);
  }
  viewer.setSolid(
    makeSolid(
      list.length && QUIZ_BY_ID.get(list[0].id) ? QUIZ_BY_ID.get(list[0].id).solid : 'cube',
    ),
  );
  viewer.setSpin(true);
  viewer.setSection(null);
  viewer.setLabelsVisible(true);
  setViewsVisible(false);
}

// ---------- 家长周报（数据从 progress/mastery/streak 聚合，见 engine/report.js） ----------

function buildWeeklyReport() {
  return report.buildReport(
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
    todayStr(),
  );
}

// 复制分享文案：优先 clipboard API，降级为 textarea 选中 + execCommand
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = el('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function renderReport() {
  audio.stopAll();
  const r = buildWeeklyReport();
  const fmt = (d) => `${Number(d.slice(5, 7))}月${Number(d.slice(8, 10))}日`;

  panel.innerHTML = '';
  const head = el('div', 'due-head');
  head.appendChild(el('h2', 'panel-title', `家长周报（${fmt(r.weekStart)} - ${fmt(r.weekEnd)}）`));
  const back = el('button', 'btn btn-small', '← 错题本');
  back.addEventListener('click', renderWrongBook);
  head.appendChild(back);
  panel.appendChild(head);

  const bar = el('div', 'stats stat-bar');
  bar.appendChild(el('div', 'stat', `<strong>${r.days}</strong><span>本周学习天数</span>`));
  bar.appendChild(
    el('div', 'stat', `<strong>${flame} ${r.currentStreak}</strong><span>连续学习</span>`),
  );
  bar.appendChild(
    el(
      'div',
      'stat',
      `<strong>${r.lessonsDone}/${r.lessonsTotal}</strong><span>累计完成课程</span>`,
    ),
  );
  bar.appendChild(el('div', 'stat', `<strong>${r.answers}</strong><span>本周答题数</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${r.acc}%</strong><span>本周正确率</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${r.conquered}</strong><span>本周攻克错题</span>`));
  panel.appendChild(bar);

  panel.appendChild(el('h3', 'report-sec', '各知识点掌握度'));
  const starsList = el('div', 'report-stars');
  for (const x of r.stars) {
    starsList.appendChild(
      el(
        'div',
        'report-star-row',
        `<span>${x.cat}</span><span class="badge stars">${x.stars}</span>`,
      ),
    );
  }
  panel.appendChild(starsList);

  if (r.weakCat) {
    panel.appendChild(el('h3', 'report-sec', '薄弱知识点提醒'));
    panel.appendChild(
      el('p', 'report-weak', `「${r.weakCat}」本周答错 ${r.weakWrong} 次，建议重点复习。`),
    );
  }

  panel.appendChild(el('h3', 'report-sec', '给家长的话'));
  panel.appendChild(el('p', 'report-advice', r.suggestion));

  const copyBtn = el('button', 'btn btn-primary btn-block');
  copyBtn.innerHTML = `${clipboard} 复制分享文案`;
  copyBtn.addEventListener('click', async () => {
    const ok = await copyText(report.reportText(r));
    copyBtn.innerHTML = ok ? '✓ 已复制，去粘贴给家长吧' : '复制失败，请手动截图分享';
    setTimeout(() => {
      copyBtn.innerHTML = `${clipboard} 复制分享文案`;
    }, 2500);
  });
  panel.appendChild(copyBtn);
  panel.appendChild(el('p', 'muted', '统计口径：本周指周一至今日；学习天数以答题记录计。'));

  viewer.setSpin(true);
}
