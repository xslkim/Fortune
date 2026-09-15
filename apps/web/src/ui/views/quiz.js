// 题库视图：题库列表（推荐练习/分类/难度筛选）、答题判分、讲解流、复习队列、
// 练习序列与难题挑战卡。与 lessons.js（openLesson）、wrong.js（renderWrongBook）互通。
import { QUIZZES } from '@geo/core/data/quizzes.js';
import { LESSONS } from '@geo/core/data/lessons.js';
import { typeDef, correctOptionIndex } from '@geo/core/question-types.js';
import * as audio from '../../engine/audio.js';
import * as progress from '../../engine/progress.js';
import * as mastery from '../../engine/mastery.js';
import * as streak from '../../engine/streak.js';
import * as review from '../../engine/review.js';
import * as store from '../../engine/store.js';
import { flame, bulb, medal, starFilled, book } from '../icons.js';
import { state, viewer, panel, statsBar, setViewsVisible, applyScene, switchView } from '../app.js';
import {
  el,
  stripHtml,
  makeSolid,
  playStepAudio,
  playerHeader,
  goalLine,
  QUIZ_BY_ID,
} from './common.js';
import { openLesson } from './lessons.js';
import { renderWrongBook } from './wrong.js';

export const DIFF_NAMES = { 1: '简单', 2: '中等', 3: '困难' };
const QUIZ_STATUS = {
  none: ['未做', 'st-none'],
  ok: ['已对', 'st-ok'],
  wrong: ['错过', 'st-wrong'],
};
// 题目分类（与内容方约定的 8 类；缺 category 或取值未知时归入'综合'，不报错）
export const CATEGORIES = [
  '结构',
  '表面积体积',
  '展开图',
  '三视图',
  '截面',
  '位置关系',
  '平行垂直',
  '空间向量',
];
export const FALLBACK_CAT = '综合';

export function quizCategory(q) {
  return CATEGORIES.includes(q.category) ? q.category : FALLBACK_CAT;
}

// 推荐练习区块：无学习记录时不显示；学习存储无时间戳，按 LESSONS 顺序取最近学过的一门
function recommendedPractice() {
  const started = LESSONS.filter((l) => progress.getLessonStep(l.id) != null);
  if (!started.length) return null;
  const lesson = started[started.length - 1];
  const queue = buildPracticeQueue(lesson.category, lesson.id);
  if (!queue.length) return null;
  const block = el('div', 'due-block');
  const head = el('div', 'due-head');
  head.appendChild(el('strong', null, `${flame} 推荐练习`));
  const go = el('button', 'btn btn-small btn-primary', `继续《${lesson.title}》对应的练习 →`);
  go.addEventListener('click', () =>
    startPractice(lesson.category, `《${lesson.title}》推荐练习`, 'quizzes'),
  );
  head.appendChild(go);
  block.appendChild(head);
  block.appendChild(
    el(
      'p',
      'muted',
      `「${quizCategory(lesson)}」分类 · 已为你挑好 ${queue.length} 道题（优先未作答与答错过的）。`,
    ),
  );
  return block;
}

// 筛选状态持久化（gt_filter）：难度 + 分类，刷新后保留；经 store 读写（含降级容错）
function loadFilter() {
  const v = store.get(store.STORAGE_KEYS.filter, null);
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
}
function saveFilter() {
  store.set(store.STORAGE_KEYS.filter, { difficulty: quizFilter, category: quizCategoryFilter });
}
const _savedFilter = loadFilter();
let quizFilter = Number.isInteger(_savedFilter.difficulty) ? _savedFilter.difficulty : 0; // 0 = 全部
let quizCategoryFilter = typeof _savedFilter.category === 'string' ? _savedFilter.category : ''; // '' = 全部

export function renderQuizList() {
  audio.stopAll();
  state.quiz = null;
  panel.innerHTML = '';
  panel.appendChild(el('h2', 'panel-title', '题库'));

  // 推荐练习：取最近有学习进度的课（数组顺序即课程地图由浅入深的顺序），给对应分类的入口
  const rec = recommendedPractice();
  if (rec) panel.appendChild(rec);

  // 分类筛选行：全部 + 8 类（存在未分类题目时追加'综合'），横滑可滚动
  const cats = [...CATEGORIES];
  if (QUIZZES.some((q) => quizCategory(q) === FALLBACK_CAT)) cats.push(FALLBACK_CAT);
  if (quizCategoryFilter && !cats.includes(quizCategoryFilter)) quizCategoryFilter = ''; // 数据变更后容错
  const m = mastery.loadMastery(); // 各类掌握度星级
  const catBar = el('div', 'filter-bar cat-bar');
  for (const [v, name] of [['', '全部'], ...cats.map((c) => [c, c])]) {
    const label = v ? `${name} ${mastery.starsOf(m, v)}` : name;
    const b = el(
      'button',
      `btn btn-small chip${quizCategoryFilter === v ? ' btn-primary' : ''}`,
      label,
    );
    b.addEventListener('click', () => {
      quizCategoryFilter = v;
      saveFilter();
      renderQuizList();
    });
    catBar.appendChild(b);
  }
  panel.appendChild(catBar);

  const filters = el('div', 'filter-bar');
  for (const [v, name] of [
    [0, '全部'],
    [1, '简单'],
    [2, '中等'],
    [3, '困难'],
  ]) {
    const b = el('button', `btn btn-small${quizFilter === v ? ' btn-primary' : ''}`, name);
    b.addEventListener('click', () => {
      quizFilter = v;
      saveFilter();
      renderQuizList();
    });
    filters.appendChild(b);
  }
  panel.appendChild(filters);

  const list = el('div', 'card-list');
  const items = QUIZZES.filter(
    (q) =>
      (!quizFilter || q.difficulty === quizFilter) &&
      (!quizCategoryFilter || quizCategory(q) === quizCategoryFilter),
  );
  panel.appendChild(statsBar(new Set(items.map((q) => q.id)))); // 统计条跟随筛选范围
  panel.appendChild(goalLine());
  if (!items.length) {
    // 空状态：图标 + 引导 + 跳转按钮
    const empty = el('div', 'empty-state');
    empty.innerHTML = `${book}<p>该筛选条件下暂无题目</p><p>换个筛选条件试试，或先去课程巩固基础。</p>`;
    const go = el('button', 'btn btn-small btn-primary', '去课程');
    go.addEventListener('click', () => switchView('lessons'));
    empty.appendChild(go);
    list.appendChild(empty);
  }
  for (const q of items) {
    const card = el('button', 'card');
    card.appendChild(el('strong', null, q.title));
    const badges = el('span', 'badge-row');
    const cat = quizCategory(q);
    badges.appendChild(el('span', 'badge cat', cat));
    badges.appendChild(el('span', 'badge stars', mastery.starsOf(m, cat)));
    badges.appendChild(el('span', `badge diff-${q.difficulty}`, DIFF_NAMES[q.difficulty] || ''));
    const [stName, stCls] = QUIZ_STATUS[progress.quizStatus(q.id)];
    badges.appendChild(el('span', `badge ${stCls}`, stName));
    card.appendChild(badges);
    card.addEventListener('click', () => openQuiz(q));
    list.appendChild(card);
  }
  panel.appendChild(list);
  viewer.setSolid(makeSolid(items[0] ? items[0].solid : 'cube'));
  viewer.setSpin(true);
  viewer.setSection(null);
  viewer.setLabelsVisible(true);
  setViewsVisible(false);
}

export function openQuiz(q, from = 'quizzes') {
  state.quiz = q;
  state.quizFrom = from;
  state.quizPicked = -1;
  state.explainStep = 0;
  clearAha();
  viewer.setSolid(makeSolid(q.solid));
  viewer.setLabelsVisible(true);
  renderQuizQuestion();
}

// 从错题本/复习/练习模式进入的题，返回时回到各自来源
function quizBack() {
  if (state.quizFrom === 'wrong' || state.quizFrom === 'review') renderWrongBook();
  else if (state.quizFrom === 'practice') endPractice();
  else renderQuizList();
}

// 啊哈时刻定时器失效（切题/手动进讲解时调用）
function clearAha() {
  state._ahaToken = (state._ahaToken || 0) + 1;
}

/** 取文本首句（讲解第 1 步兜底为「关键理解」）。 */
function firstSentence(text) {
  const m = text.match(/^[^。！？!?]*[。！？!?]/);
  if (m) return m[0];
  return text.length > 60 ? text.slice(0, 60) + '…' : text;
}

function renderQuizQuestion() {
  const q = state.quiz;
  panel.innerHTML = '';
  const diff = `难度：${DIFF_NAMES[q.difficulty] || q.difficulty}`;
  const sub =
    state.quizFrom === 'practice' && state.practice
      ? `练习 ${state.practice.idx + 1} / ${state.practice.queue.length} · ${diff}`
      : diff;
  panel.appendChild(playerHeader(q.title, sub, quizBack));

  panel.appendChild(el('div', 'step-body', q.question));
  panel.appendChild(renderQuizAnswer());

  state._replay = () => audio.speak(stripHtml(q.question));
  applyScene(q.scene);
}

// 讲解页/错题反馈用的正确答案文本：选项题给选项文本，填空题给全部等价答案
function correctAnswerText(q) {
  const def = typeDef(q);
  const opts = def.optionsOf(q);
  if (opts) return opts[correctOptionIndex(q)];
  return q.answer.answers.join(' 或 ');
}

// 按题型渲染答题区：choice/judge 渲染选项按钮（judge 的两个选项来自注册表）；
// fill 渲染输入框（十进制数值键盘）+ 提交按钮，回车同提交
function renderQuizAnswer() {
  const q = state.quiz;
  const opts = typeDef(q).optionsOf(q);
  const box = el('div', 'option-list');
  if (opts) {
    opts.forEach((text, idx) => {
      const b = el('button', 'option', text);
      b.addEventListener('click', () => submitAnswer(idx));
      box.appendChild(b);
    });
    return box;
  }
  const input = el('input', 'fill-input');
  input.type = 'text';
  input.inputMode = 'decimal';
  input.placeholder = '输入答案（数值），回车或点提交';
  const btn = el('button', 'btn btn-primary btn-block', '提交');
  const submit = () => {
    const v = input.value.trim();
    if (!v) {
      input.focus();
      return;
    }
    submitAnswer(v);
  };
  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });
  box.appendChild(input);
  box.appendChild(btn);
  return box;
}

// 统一判分入口：response 随题型（choice/judge 为选项索引，fill 为字符串）
function submitAnswer(response) {
  if (state.quizPicked !== -1) return;
  state.quizPicked = response;
  const q = state.quiz;
  const def = typeDef(q);
  const buttons = panel.querySelectorAll('.option');
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === correctOptionIndex(q)) b.classList.add('correct');
    else if (i === response) b.classList.add('wrong');
  });
  const input = panel.querySelector('.fill-input');
  if (input) input.disabled = true;
  const ok = def.isCorrect(q, response);
  if (input) input.classList.add(ok ? 'correct' : 'wrong');
  progress.recordAttempt(q.id, ok); // 记录作答；答错进错题本
  mastery.recordAnswer(quizCategory(q), ok); // 知识点掌握度三星
  streak.record('answer'); // 每日 streak：答 3 题达成今日目标
  if (!ok)
    review.recordWrong(q.id); // 生成/重置 +1/+3/+7 复习计划
  else if (review.hasActivePlan(review.loadReview(), q.id)) review.recordReviewAnswer(q.id, true); // 复习推进
  const result = el(
    'div',
    `result ${ok ? 'ok' : 'no'}`,
    ok ? '✓ 回答正确！' : '✗ 回答错误，看看讲解吧。',
  );
  panel.appendChild(result);
  if (input && !ok) panel.appendChild(el('div', 'result no', `正确答案：${correctAnswerText(q)}`));
  if (ok) {
    // 啊哈时刻：自转几何体 + 高亮题面元素 + 关键理解 + 上行琶音，约 1.8s 后自动进讲解
    audio.playEarcon();
    viewer.setSpin(true);
    viewer.highlight((q.scene && q.scene.highlight) || {});
    const insight = q.insight || firstSentence(stripHtml(q.explain[0].text));
    panel.appendChild(el('div', 'result ok aha', `${bulb} 关键理解：${insight}`));
  }
  const btn = el('button', 'btn btn-primary btn-block', '查看讲解 →');
  btn.addEventListener('click', () => {
    clearAha();
    renderExplainStep();
  });
  panel.appendChild(btn);
  if (ok) {
    audio.speak('回答正确');
    const token = (state._ahaToken = (state._ahaToken || 0) + 1);
    setTimeout(() => {
      if (state._ahaToken === token && state.quiz === q) renderExplainStep(); // 微演示结束自动进讲解
    }, 1800);
  }
}

function renderExplainStep() {
  clearAha();
  const q = state.quiz;
  const i = state.explainStep;
  const step = q.explain[i];
  panel.innerHTML = '';
  panel.appendChild(playerHeader(q.title, '讲解', quizBack));

  panel.appendChild(
    el(
      'div',
      'result ' + (typeDef(q).isCorrect(q, state.quizPicked) ? 'ok' : 'no'),
      `正确答案：${correctAnswerText(q)}`,
    ),
  );
  panel.appendChild(el('div', 'step-body', step.text));

  // 复习模式：讲解完自动接下一题到期题；练习模式：讲解完推进练习队列
  const inReview = state.quizFrom === 'review';
  const inPractice = state.quizFrom === 'practice';
  const hasNext = inReview && state.reviewQueue && state.reviewQueue.length > 0;
  let lastLabel = '返回题库';
  if (inPractice && state.practice) {
    const p = state.practice;
    lastLabel =
      p.idx < p.queue.length - 1 ? `下一题 →（${p.idx + 2}/${p.queue.length}）` : '完成练习';
  } else if (inReview) {
    lastLabel = hasNext ? '下一题 →' : '返回错题本';
  }

  const nav = el('div', 'step-nav');
  const prev = el('button', 'btn', '← 上一步');
  prev.disabled = i === 0;
  prev.addEventListener('click', () => {
    state.explainStep--;
    renderExplainStep();
  });
  nav.appendChild(prev);
  nav.appendChild(el('span', 'muted', `讲解 ${i + 1} / ${q.explain.length}`));
  const next = el('button', 'btn btn-primary', i === q.explain.length - 1 ? lastLabel : '下一步 →');
  next.addEventListener('click', () => {
    if (i !== q.explain.length - 1) {
      state.explainStep++;
      renderExplainStep();
    } else if (inPractice) nextPractice();
    else if (hasNext) nextReviewQuiz();
    else quizBack();
  });
  nav.appendChild(next);
  panel.appendChild(nav);

  // 答对且带 challenge 字段的难题：讲解最后一步展示「挑战模式」卡（自我评估简洁星）
  if (i === q.explain.length - 1 && typeDef(q).isCorrect(q, state.quizPicked)) {
    const cc = challengeCard(q);
    if (cc) panel.appendChild(cc);
  }

  state._replay = () => playStepAudio(step);
  applyScene(step.scene);
  playStepAudio(step);
}

// 复习模式：只做到期题，逐题推进队列
export function startReview(ids) {
  state.reviewQueue = ids.map((id) => QUIZ_BY_ID.get(id)).filter(Boolean);
  nextReviewQuiz();
}

function nextReviewQuiz() {
  const q = state.reviewQueue && state.reviewQueue.shift();
  if (!q) {
    state.quizFrom = 'wrong';
    renderWrongBook();
    return;
  }
  openQuiz(q, 'review');
}

// ---------- 学练打通：分类练习序列（课程完成 / 题库推荐两条入口） ----------

// 从某分类抽 5 题：优先本课关联题（lessonIds），其次未作答，再次答错过；不足 5 道有多少给多少
export function buildPracticeQueue(cat, lessonId = null) {
  const pool = QUIZZES.filter((q) => quizCategory(q) === cat);
  if (!pool.length) return [];
  const inLesson = lessonId ? pool.filter((q) => (q.lessonIds || []).includes(lessonId)) : [];
  const rest = pool.filter((q) => !inLesson.includes(q));
  const rank = (q) => ({ none: 0, wrong: 1, ok: 2 })[progress.quizStatus(q.id)] ?? 0;
  const pick = (list, n) =>
    list
      .slice()
      .sort((a, b) => rank(a) - rank(b))
      .slice(0, n);
  return [...pick(inLesson, 5), ...pick(rest, 5 - Math.min(5, inLesson.length))].slice(0, 5);
}

// 进入练习序列；backTo: 'lesson'（返回来源课程）| 'quizzes'（返回题库）
export function startPractice(cat, label, backTo, lessonId = null) {
  const queue = buildPracticeQueue(cat, backTo === 'lesson' ? lessonId : null);
  if (!queue.length) return false;
  state.practice = { queue, idx: 0, label, backTo, lessonId };
  openPracticeQuiz();
  return true;
}

function openPracticeQuiz() {
  const p = state.practice;
  openQuiz(p.queue[p.idx], 'practice');
}

// 讲解结束推进练习队列；耗尽后显示完成态
function nextPractice() {
  const p = state.practice;
  p.idx += 1;
  if (p.idx >= p.queue.length) renderPracticeDone();
  else openPracticeQuiz();
}

function renderPracticeDone() {
  const p = state.practice;
  panel.innerHTML = '';
  panel.appendChild(playerHeader(p.label, '练习完成', endPractice));
  panel.appendChild(el('div', 'result ok', `${medal} 完成 ${p.queue.length} 道练习，继续加油！`));
  const back = el(
    'button',
    'btn btn-primary btn-block',
    p.backTo === 'lesson' ? '返回课程' : '返回题库',
  );
  back.addEventListener('click', endPractice);
  panel.appendChild(back);
  viewer.setSpin(true);
  viewer.setSection(null);
}

// 退出练习序列（完成或中途返回）：按来源回到课程/题库
function endPractice() {
  const p = state.practice;
  state.practice = null;
  if (p && p.backTo === 'lesson') {
    const lesson = LESSONS.find((l) => l.id === p.lessonId);
    if (lesson) {
      openLesson(lesson, lesson.steps.length - 1);
      return;
    }
  }
  renderQuizList();
}

// ---------- 难题双评分挑战（自我评估式「简洁星」，schema 见 src/data/schema.js）----------

// gt_challenge：{ [quizId]: { stars, ts } }，记录每题拿到的最高简洁星（经 store 读写）
function loadChallenge() {
  const v = store.get(store.STORAGE_KEYS.challenge, null);
  if (v && typeof v === 'object' && !Array.isArray(v)) return v;
  store.remove(store.STORAGE_KEYS.challenge); // 清掉损坏数据
  return {};
}

/** 容错读取 challenge 字段；无效返回 null。lStars 合法化为 1-3。 */
function challengeOf(q) {
  const ch = q && q.challenge;
  if (!ch || typeof ch !== 'object') return null;
  const lStars = Number.isInteger(ch.lStars) ? Math.min(3, Math.max(1, ch.lStars)) : 1;
  return {
    lStars,
    eHint: typeof ch.eHint === 'string' && ch.eHint.trim() ? ch.eHint.trim() : null,
  };
}

// 挑战卡：讲解最后一步、本题答对且带 challenge 字段时展示；自我评估确认后记录简洁星
function challengeCard(q) {
  const ch = challengeOf(q);
  if (!ch) return null;
  const saved = loadChallenge();
  const best = saved[q.id] && Number.isInteger(saved[q.id].stars) ? saved[q.id].stars : 0;
  const starText = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

  const card = el('div', 'challenge-card');
  card.appendChild(el('strong', null, `${starFilled} 挑战模式：还能更简洁吗？`));
  card.appendChild(
    el(
      'p',
      null,
      `你已解出此题。这题其实还有更简的做法（目标 ${starText(ch.lStars)} 简洁星）——试着用更少的步骤、更巧的思路重新解一遍。`,
    ),
  );
  if (ch.eHint) card.appendChild(el('p', 'challenge-hint', `提示：${ch.eHint}`));
  const bestLine = el(
    'p',
    'muted',
    best ? `我的最佳纪录：${starText(best)}` : '还没有简洁星纪录，来挑战一下吧！',
  );
  card.appendChild(bestLine);

  const btn = el('button', 'btn btn-small btn-primary', '我做到了更简解法 ✓');
  btn.addEventListener('click', () => {
    const stars = Math.max(best, ch.lStars);
    const s2 = loadChallenge();
    s2[q.id] = { stars, ts: Date.now() };
    store.set(store.STORAGE_KEYS.challenge, s2);
    audio.playEarcon();
    btn.remove();
    card.appendChild(
      el(
        'p',
        'challenge-done',
        `${medal} 已记录 ${starText(stars)} 简洁星！简洁的解法说明理解更深一层。`,
      ),
    );
    bestLine.textContent = `我的最佳纪录：${starText(stars)}`;
  });
  card.appendChild(btn);
  return card;
}
