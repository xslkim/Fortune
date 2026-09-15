// 课程视图：课程列表（level 分组 + 前置提示）与课程播放器（步骤/checkpoint/互动 chip/配套练习）。
// 依赖壳 app.js 的 state/viewer/panel/statsBar/applyScene，与 quiz.js 的练习序列互通。
import { LESSONS } from '@geo/core/data/lessons.js';
import * as audio from '../../engine/audio.js';
import * as progress from '../../engine/progress.js';
import * as streak from '../../engine/streak.js';
import { pin, bulb, target } from '../icons.js';
import { state, viewer, panel, statsBar, setViewsVisible, applyScene } from '../app.js';
import {
  el,
  stripHtml,
  makeSolid,
  playStepAudio,
  playerHeader,
  goalLine,
  INTERACT_RE,
  markInteractChipDone,
} from './common.js';
import { quizCategory, buildPracticeQueue, startPractice } from './quiz.js';

export function renderLessonList() {
  audio.stopAll();
  state.lesson = null;
  panel.innerHTML = '';
  panel.appendChild(el('h2', 'panel-title', '课程'));
  panel.appendChild(statsBar());
  panel.appendChild(goalLine());

  // 课程地图：按 level 分两段（初中段在上、高中段在下），段内保持数组顺序
  const LEVEL_GROUPS = [
    { level: 'junior', title: '初中段 · 基础', chip: '初中', chipCls: 'lv-junior' },
    { level: 'senior', title: '高中段 · 进阶', chip: '高中', chipCls: 'lv-senior' },
  ];
  for (const grp of LEVEL_GROUPS) {
    const lessons = LESSONS.filter((l) => (l.level || 'junior') === grp.level);
    if (!lessons.length) continue;
    panel.appendChild(el('h3', 'lesson-group-title', grp.title));
    const list = el('div', 'card-list lesson-group');
    for (const lesson of lessons) {
      const total = lesson.steps.length;
      const step = progress.getLessonStep(lesson.id); // null = 未开始
      const done = step != null && step >= total - 1;

      // 前置软门禁：本课未开始且存在未完成的前置课时，给弱化提示（不锁定）
      let prereqHint = '';
      if (step == null) {
        for (const pid of lesson.prereq || []) {
          const pre = LESSONS.find((l) => l.id === pid);
          if (pre && !progress.isLessonDone(pid, pre.steps.length)) {
            prereqHint = pre.title;
            break;
          }
        }
      }

      const card = el('button', 'card lesson-card');
      const main = el('div', 'card-main');
      const titleRow = el('div', 'card-title-row');
      titleRow.appendChild(el('strong', null, lesson.title));
      titleRow.appendChild(el('span', `badge ${grp.chipCls}`, grp.chip));
      main.appendChild(titleRow);
      main.appendChild(el('span', 'muted', `${lesson.subtitle || ''} · ${total} 步`));
      if (prereqHint) {
        main.appendChild(el('span', 'prereq-hint', `${pin} 建议先学《${prereqHint}》`));
      }
      if (step != null) {
        main.appendChild(
          el(
            'span',
            done ? 'badge st-ok' : 'badge st-doing',
            done ? `✓ 已完成 ${total}/${total}` : `已学 ${step + 1}/${total}`,
          ),
        );
      }
      card.appendChild(main);
      if (step != null && !done) {
        const cont = el('button', 'btn btn-small btn-primary', '继续');
        cont.addEventListener('click', (e) => {
          e.stopPropagation();
          openLesson(lesson, step);
        });
        card.appendChild(cont);
      }
      card.addEventListener('click', () => openLesson(lesson, 0));
      list.appendChild(card);
    }
    panel.appendChild(list);
  }
  viewer.setSolid(makeSolid('cube'));
  viewer.setSpin(true);
  viewer.setSection(null);
  viewer.setLabelsVisible(true);
  setViewsVisible(false);
}

export function openLesson(lesson, startStep = 0) {
  state.lesson = lesson;
  state.lessonStep = Math.min(Math.max(0, startStep), lesson.steps.length - 1);
  viewer.setSolid(makeSolid(lesson.solid));
  viewer.setLabelsVisible(true);
  renderLessonStep();
}

function renderLessonStep() {
  const lesson = state.lesson;
  const i = state.lessonStep;
  const step = lesson.steps[i];
  progress.setLessonStep(lesson.id, i); // 记录学习进度（只增不减）
  streak.record('step'); // 每日 streak：学 1 步即达成今日目标
  panel.innerHTML = '';
  panel.appendChild(playerHeader(lesson.title, lesson.subtitle, renderLessonList));

  const body = el('div', 'step-body', step.text);
  panel.appendChild(body);

  // 互动提示：讲解文本引导操作时，给出可勾选的互动 chip（不阻塞流程）
  state._interactChip = null;
  if (INTERACT_RE.test(stripHtml(step.text))) {
    const chip = el('span', 'chip interact-chip', `${target} 转动模型看一看`);
    if (state._interacted) markInteractChipDone(chip);
    state._interactChip = chip;
    panel.appendChild(chip);
  }

  // 课内检查点：答对后才解锁「下一步」；不阻塞上一步与重听
  let checkSolved = !step.check;
  const nav = el('div', 'step-nav');
  if (step.check) {
    panel.appendChild(
      checkpointCard(step.check, () => {
        checkSolved = true;
        next.disabled = false;
      }),
    );
  }

  const prev = el('button', 'btn', '← 上一步');
  prev.disabled = i === 0;
  prev.addEventListener('click', () => {
    state.lessonStep--;
    renderLessonStep();
  });
  nav.appendChild(prev);
  nav.appendChild(el('span', 'muted', `第 ${i + 1} / ${lesson.steps.length} 步`));
  const isLast = i === lesson.steps.length - 1;
  const next = el('button', 'btn btn-primary', isLast ? '完成 ✓' : '下一步 →');
  next.disabled = !checkSolved;
  next.addEventListener('click', () => {
    if (isLast) renderLessonList();
    else {
      state.lessonStep++;
      renderLessonStep();
    }
  });
  nav.appendChild(next);
  panel.appendChild(nav);

  // 最后一步（小结/课程完成态）：推荐同分类配套练习
  if (isLast) {
    const card = practiceCard(lesson);
    if (card) panel.appendChild(card);
  }

  state._replay = () => playStepAudio(step);
  applyScene(step.scene);
  playStepAudio(step);
}

// 课内检查点卡片：答对 → correct + 提示音 + 「答对了！」+ 解锁下一步；答错 → wrong + hint，可重试
function checkpointCard(check, onSolved) {
  const card = el('div', 'check-card');
  card.appendChild(el('strong', null, `${bulb} 检查一下`));
  card.appendChild(el('div', 'check-q', check.question));
  const opts = el('div', 'option-list');
  const msg = el('div', 'result muted');
  msg.style.display = 'none';
  let solved = false;
  check.options.forEach((text, idx) => {
    const b = el('button', 'option', text);
    b.addEventListener('click', () => {
      if (solved) return;
      if (idx === check.answer) {
        solved = true;
        b.classList.add('correct');
        opts.querySelectorAll('.option').forEach((o) => {
          o.disabled = true;
        });
        audio.playEarcon();
        msg.className = 'result ok';
        msg.style.display = '';
        msg.textContent = '答对了！';
        onSolved();
      } else {
        b.classList.add('wrong');
        b.disabled = true; // 已排除项保持标记，其余选项仍可点
        msg.className = 'result no';
        msg.style.display = '';
        msg.textContent = check.hint ? `再想想：${check.hint}` : '再想想，其他选项还可以选。';
      }
    });
    opts.appendChild(b);
  });
  card.appendChild(opts);
  card.appendChild(msg);
  return card;
}

// 课程完成态的配套练习卡：同分类抽 5 题（优先本课关联题、未作答与答错过的题）
function practiceCard(lesson) {
  const queue = buildPracticeQueue(lesson.category, lesson.id);
  if (!queue.length) return null;
  const cat = quizCategory(lesson);
  const card = el('div', 'practice-card');
  card.appendChild(el('strong', null, `${target} 去练 ${queue.length} 道相关题`));
  card.appendChild(
    el(
      'p',
      'muted',
      `来自「${cat}」分类，已为你挑好 ${queue.length} 道题（优先未作答与答错过的）。`,
    ),
  );
  const btn = el('button', 'btn btn-small btn-primary', '开始练习 →');
  btn.addEventListener('click', () =>
    startPractice(lesson.category, `《${lesson.title}》配套练习`, 'lesson', lesson.id),
  );
  card.appendChild(btn);
  return card;
}
