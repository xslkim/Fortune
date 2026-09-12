// 应用视图逻辑：课程 / 题库 / 错题本 / 实验室 四个主视图 + 顶部 tab 切换
import { catalog } from '../geo/solids.js';
import { buildEdges } from '../geo/topology.js';
import { GeoViewer } from '../viewer/viewer.js';
import { LESSONS } from '../data/lessons.js';
import { QUIZZES } from '../data/quizzes.js';
import * as audio from '../engine/audio.js';
import * as progress from '../engine/progress.js';
import * as mastery from '../engine/mastery.js';
import * as streak from '../engine/streak.js';
import * as review from '../engine/review.js';
import * as report from '../engine/report.js';
import { todayStr } from '../engine/days.js';
import { renderThreeViews } from './threeview.js';
import { initNetGame } from './netgame.js';
import { initExplore } from './explore.js';

const CATALOG = new Map(catalog().map((c) => [c.id, c]));
const QUIZ_BY_ID = new Map(QUIZZES.map((q) => [q.id, q]));

const stage = document.getElementById('stage');
const panel = document.getElementById('panel');
const viewer = new GeoViewer(stage);

// 三视图浮层（叠加在 3D 区左下角，不拦截交互；手机上自适应宽度）
const viewPane = el('div', 'view-pane');
viewPane.style.display = 'none';
stage.appendChild(viewPane);

/** 显示/隐藏当前几何体的三视图面板。 */
function setViewsVisible(on) {
  if (on && viewer.solid) {
    renderThreeViews(viewPane, viewer.solid);
    viewPane.style.display = '';
  } else {
    viewPane.style.display = 'none';
  }
}

// 首次手势解锁 iOS 音频
window.addEventListener('pointerdown', () => audio.unlock(), { once: true });

const state = {
  view: 'lessons',
  lesson: null, lessonStep: 0,
  quiz: null, quizPicked: -1, explainStep: 0, quizFrom: 'quizzes',
  lab: { solidId: 'cube', spin: false, labels: true, sectionOn: false, t: 0.5, unfold: 0, views: false },
  extSession: null, // 外部自包含模块（闯关/探究/几何之美）的会话句柄，切 tab 时 destroy
};

// ---------- 工具 ----------

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function stripHtml(html) {
  const d = el('div', null, html);
  return d.textContent || '';
}

function makeSolid(id) {
  const item = CATALOG.get(id);
  return item ? item.make() : CATALOG.get('cube').make();
}

// 学习统计条：已完成课程数 / 已答题数 / 正确率 / 连续学习天数；传入 quizIds(Set) 时跟随筛选范围统计
function statsBar(quizIds = null) {
  const all = progress.allAttempts();
  const at = quizIds ? all.filter((a) => quizIds.has(a.id)) : all;
  const answered = new Set(at.map((a) => a.id)).size;
  const okCount = at.filter((a) => a.ok).length;
  const acc = at.length ? Math.round((okCount / at.length) * 100) : 0;
  const s = streak.loadStreak();
  const bar = el('div', 'stats stat-bar');
  if (quizIds) {
    bar.appendChild(el('div', 'stat', `<strong>${quizIds.size}</strong><span>本组题目</span>`));
  } else {
    const done = LESSONS.filter((l) => progress.isLessonDone(l.id, l.steps.length)).length;
    bar.appendChild(el('div', 'stat', `<strong>${done}</strong><span>已完成课程</span>`));
  }
  bar.appendChild(el('div', 'stat', `<strong>${answered}</strong><span>已答题数</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${acc}%</strong><span>正确率</span>`));
  bar.appendChild(el('div', 'stat', `<strong>🔥 ${s.current}</strong><span>连续学习</span>`));
  return bar;
}

// 统计条下方一行：今日目标进度 + 到期复习入口提示
function goalLine() {
  const day = todayStr();
  const g = streak.goalProgress(streak.loadStreak(), day);
  const due = review.dueReviews(review.loadReview(), day).filter((id) => QUIZ_BY_ID.has(id));
  const line = el('div', 'goal-line muted');
  line.appendChild(el('span', null, g.done
    ? '✓ 今日目标已达成，明天继续加油'
    : `今日目标（任一即可）：学 ${streak.GOAL_STEPS} 个课程步骤 / 答 ${streak.GOAL_ANSWERS} 题 / 玩 ${streak.GOAL_GAMES} 关闯关（已学 ${g.steps} 步 · 已答 ${g.answers} 题 · 已玩 ${g.games} 关）`));
  if (due.length) {
    const link = el('button', 'btn btn-ghost due-link', `📌 ${due.length} 道错题到期待复习 →`);
    link.addEventListener('click', () => switchView('wrong'));
    line.appendChild(link);
  }
  return line;
}

function applyScene(scene) {
  if (!scene) {
    viewer.highlight({});
    viewer.setSpin(false);
    viewer.setSection(null);
    viewer.setUnfold(0);
    setViewsVisible(false);
    return;
  }
  viewer.highlight(scene.highlight || {});
  viewer.setSpin(!!scene.spin);
  viewer.setSection(scene.section || null);
  // scene.unfold：0..1 展开程度，缺省为 0（不展开），向后兼容
  viewer.setUnfold(typeof scene.unfold === 'number' ? scene.unfold : 0);
  // scene.views：true 时显示三视图面板，缺省 false，向后兼容
  setViewsVisible(!!scene.views);
}

function playStepAudio(step) {
  audio.stopAll();
  if (step && step.audio) {
    audio.playVoice(step.audio).then((ok) => {
      if (!ok) audio.speak(stripHtml(step.text));
    });
  } else if (step) {
    audio.speak(stripHtml(step.text));
  }
}

// 播放器通用头部：返回按钮 + 音频控制（重播 / 语速 / TTS 兜底）
function playerHeader(title, subtitle, onBack) {
  const head = el('div', 'player-head');
  const back = el('button', 'btn btn-ghost', '← 返回');
  back.addEventListener('click', () => { audio.stopAll(); onBack(); });
  head.appendChild(back);
  const t = el('div', 'player-title');
  t.appendChild(el('h2', null, title));
  if (subtitle) t.appendChild(el('p', 'muted', subtitle));
  head.appendChild(t);

  const bar = el('div', 'audio-bar');
  const replay = el('button', 'btn btn-small', '🔊 重播讲解');
  replay.addEventListener('click', () => state._replay && state._replay());
  bar.appendChild(replay);

  const sel = el('select', 'rate-select');
  for (const [v, txt] of [[0.75, '0.75×'], [1, '1.0×'], [1.25, '1.25×'], [1.5, '1.5×']]) {
    const o = el('option', null, txt);
    o.value = v;
    if (v === 1) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener('change', () => audio.setRate(parseFloat(sel.value)));
  bar.appendChild(sel);

  const ttsLabel = el('label', 'tts-toggle');
  const tts = document.createElement('input');
  tts.type = 'checkbox';
  tts.checked = true;
  tts.addEventListener('change', () => audio.setTtsEnabled(tts.checked));
  ttsLabel.appendChild(tts);
  ttsLabel.appendChild(document.createTextNode(' 语音兜底'));
  bar.appendChild(ttsLabel);

  const earLabel = el('label', 'tts-toggle');
  const ear = document.createElement('input');
  ear.type = 'checkbox';
  ear.checked = true;
  ear.addEventListener('change', () => audio.setEarconEnabled(ear.checked));
  earLabel.appendChild(ear);
  earLabel.appendChild(document.createTextNode(' 提示音'));
  bar.appendChild(earLabel);
  head.appendChild(bar);
  return head;
}

// ---------- 课程 ----------

function renderLessonList() {
  audio.stopAll();
  state.lesson = null;
  panel.innerHTML = '';
  panel.appendChild(el('h2', 'panel-title', '课程'));
  panel.appendChild(statsBar());
  panel.appendChild(goalLine());
  const list = el('div', 'card-list');
  for (const lesson of LESSONS) {
    const total = lesson.steps.length;
    const step = progress.getLessonStep(lesson.id); // null = 未开始
    const done = step != null && step >= total - 1;

    const card = el('div', 'card lesson-card');
    const main = el('div', 'card-main');
    main.appendChild(el('strong', null, lesson.title));
    main.appendChild(el('span', 'muted', `${lesson.subtitle || ''} · ${total} 步`));
    if (step != null) {
      main.appendChild(el('span', done ? 'badge st-ok' : 'badge st-doing',
        done ? `✓ 已完成 ${total}/${total}` : `已学 ${step + 1}/${total}`));
    }
    card.appendChild(main);
    if (step != null && !done) {
      const cont = el('button', 'btn btn-small btn-primary', '继续');
      cont.addEventListener('click', (e) => { e.stopPropagation(); openLesson(lesson, step); });
      card.appendChild(cont);
    }
    card.addEventListener('click', () => openLesson(lesson, 0));
    list.appendChild(card);
  }
  panel.appendChild(list);
  viewer.setSolid(makeSolid('cube'));
  viewer.setSpin(true);
  viewer.setSection(null);
  viewer.setLabelsVisible(true);
  setViewsVisible(false);
}

function openLesson(lesson, startStep = 0) {
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

  const nav = el('div', 'step-nav');
  const prev = el('button', 'btn', '← 上一步');
  prev.disabled = i === 0;
  prev.addEventListener('click', () => { state.lessonStep--; renderLessonStep(); });
  nav.appendChild(prev);
  nav.appendChild(el('span', 'muted', `第 ${i + 1} / ${lesson.steps.length} 步`));
  const next = el('button', 'btn btn-primary', i === lesson.steps.length - 1 ? '完成 ✓' : '下一步 →');
  next.addEventListener('click', () => {
    if (i === lesson.steps.length - 1) renderLessonList();
    else { state.lessonStep++; renderLessonStep(); }
  });
  nav.appendChild(next);
  panel.appendChild(nav);

  state._replay = () => playStepAudio(step);
  applyScene(step.scene);
  playStepAudio(step);
}

// ---------- 题库 ----------

const DIFF_NAMES = { 1: '简单', 2: '中等', 3: '困难' };
const QUIZ_STATUS = { none: ['未做', 'st-none'], ok: ['已对', 'st-ok'], wrong: ['错过', 'st-wrong'] };
// 题目分类（与内容方约定的 8 类；缺 category 或取值未知时归入'综合'，不报错）
const CATEGORIES = ['结构', '表面积体积', '展开图', '三视图', '截面', '位置关系', '平行垂直', '空间向量'];
const FALLBACK_CAT = '综合';

function quizCategory(q) {
  return CATEGORIES.includes(q.category) ? q.category : FALLBACK_CAT;
}

// 筛选状态持久化（gt_filter）：难度 + 分类，刷新后保留；读写全程 try/catch
function loadFilter() {
  try {
    const v = JSON.parse(localStorage.getItem('gt_filter') || 'null');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}
function saveFilter() {
  try {
    localStorage.setItem('gt_filter', JSON.stringify({ difficulty: quizFilter, category: quizCategoryFilter }));
  } catch { /* 存储不可用时静默 */ }
}
const _savedFilter = loadFilter();
let quizFilter = Number.isInteger(_savedFilter.difficulty) ? _savedFilter.difficulty : 0; // 0 = 全部
let quizCategoryFilter = typeof _savedFilter.category === 'string' ? _savedFilter.category : ''; // '' = 全部

function renderQuizList() {
  audio.stopAll();
  state.quiz = null;
  panel.innerHTML = '';
  panel.appendChild(el('h2', 'panel-title', '题库'));

  // 分类筛选行：全部 + 8 类（存在未分类题目时追加'综合'），横滑可滚动
  const cats = [...CATEGORIES];
  if (QUIZZES.some((q) => quizCategory(q) === FALLBACK_CAT)) cats.push(FALLBACK_CAT);
  if (quizCategoryFilter && !cats.includes(quizCategoryFilter)) quizCategoryFilter = ''; // 数据变更后容错
  const m = mastery.loadMastery(); // 各类掌握度星级
  const catBar = el('div', 'filter-bar cat-bar');
  for (const [v, name] of [['', '全部'], ...cats.map((c) => [c, c])]) {
    const label = v ? `${name} ${mastery.starsOf(m, v)}` : name;
    const b = el('button', `btn btn-small chip${quizCategoryFilter === v ? ' btn-primary' : ''}`, label);
    b.addEventListener('click', () => { quizCategoryFilter = v; saveFilter(); renderQuizList(); });
    catBar.appendChild(b);
  }
  panel.appendChild(catBar);

  const filters = el('div', 'filter-bar');
  for (const [v, name] of [[0, '全部'], [1, '简单'], [2, '中等'], [3, '困难']]) {
    const b = el('button', `btn btn-small${quizFilter === v ? ' btn-primary' : ''}`, name);
    b.addEventListener('click', () => { quizFilter = v; saveFilter(); renderQuizList(); });
    filters.appendChild(b);
  }
  panel.appendChild(filters);

  const list = el('div', 'card-list');
  const items = QUIZZES.filter((q) => (!quizFilter || q.difficulty === quizFilter)
    && (!quizCategoryFilter || quizCategory(q) === quizCategoryFilter));
  panel.appendChild(statsBar(new Set(items.map((q) => q.id)))); // 统计条跟随筛选范围
  panel.appendChild(goalLine());
  if (!items.length) list.appendChild(el('p', 'muted', '该筛选条件下暂无题目'));
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

function openQuiz(q, from = 'quizzes') {
  state.quiz = q;
  state.quizFrom = from;
  state.quizPicked = -1;
  state.explainStep = 0;
  clearAha();
  viewer.setSolid(makeSolid(q.solid));
  viewer.setLabelsVisible(true);
  renderQuizQuestion();
}

// 从错题本/复习模式进入的题，返回时回到错题本
function quizBack() {
  if (state.quizFrom === 'wrong' || state.quizFrom === 'review') renderWrongBook();
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
  panel.appendChild(playerHeader(q.title, `难度：${DIFF_NAMES[q.difficulty] || q.difficulty}`, quizBack));

  panel.appendChild(el('div', 'step-body', q.question));
  const opts = el('div', 'option-list');
  q.answer.options.forEach((text, idx) => {
    const b = el('button', 'option', text);
    b.addEventListener('click', () => pickOption(idx));
    opts.appendChild(b);
  });
  panel.appendChild(opts);

  state._replay = () => audio.speak(stripHtml(q.question));
  applyScene(q.scene);
}

function pickOption(idx) {
  if (state.quizPicked >= 0) return;
  state.quizPicked = idx;
  const q = state.quiz;
  const buttons = panel.querySelectorAll('.option');
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer.correct) b.classList.add('correct');
    else if (i === idx) b.classList.add('wrong');
  });
  const ok = idx === q.answer.correct;
  progress.recordAttempt(q.id, ok); // 记录作答；答错进错题本
  mastery.recordAnswer(quizCategory(q), ok); // 知识点掌握度三星
  streak.record('answer'); // 每日 streak：答 3 题达成今日目标
  if (!ok) review.recordWrong(q.id); // 生成/重置 +1/+3/+7 复习计划
  else if (review.hasActivePlan(review.loadReview(), q.id)) review.recordReviewAnswer(q.id, true); // 复习推进
  const result = el('div', `result ${ok ? 'ok' : 'no'}`, ok ? '✓ 回答正确！' : '✗ 回答错误，看看讲解吧。');
  panel.appendChild(result);
  if (ok) {
    // 啊哈时刻：自转几何体 + 高亮题面元素 + 关键理解 + 上行琶音，约 1.8s 后自动进讲解
    audio.playEarcon();
    viewer.setSpin(true);
    viewer.highlight(q.scene && q.scene.highlight || {});
    const insight = q.insight || firstSentence(stripHtml(q.explain[0].text));
    panel.appendChild(el('div', 'result ok aha', `💡 关键理解：${insight}`));
  }
  const btn = el('button', 'btn btn-primary btn-block', '查看讲解 →');
  btn.addEventListener('click', () => { clearAha(); renderExplainStep(); });
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

  panel.appendChild(el('div', 'result ' + (state.quizPicked === q.answer.correct ? 'ok' : 'no'),
    `正确答案：${q.answer.options[q.answer.correct]}`));
  panel.appendChild(el('div', 'step-body', step.text));

  // 复习模式：讲解完自动接下一题到期题
  const inReview = state.quizFrom === 'review';
  const hasNext = inReview && state.reviewQueue && state.reviewQueue.length > 0;
  const lastLabel = inReview ? (hasNext ? '下一题 →' : '返回错题本') : '返回题库';

  const nav = el('div', 'step-nav');
  const prev = el('button', 'btn', '← 上一步');
  prev.disabled = i === 0;
  prev.addEventListener('click', () => { state.explainStep--; renderExplainStep(); });
  nav.appendChild(prev);
  nav.appendChild(el('span', 'muted', `讲解 ${i + 1} / ${q.explain.length}`));
  const next = el('button', 'btn btn-primary', i === q.explain.length - 1 ? lastLabel : '下一步 →');
  next.addEventListener('click', () => {
    if (i !== q.explain.length - 1) { state.explainStep++; renderExplainStep(); }
    else if (hasNext) nextReviewQuiz();
    else quizBack();
  });
  nav.appendChild(next);
  panel.appendChild(nav);

  // 答对且带 challenge 字段的难题：讲解最后一步展示「挑战模式」卡（自我评估简洁星）
  if (i === q.explain.length - 1 && state.quizPicked === q.answer.correct) {
    const cc = challengeCard(q);
    if (cc) panel.appendChild(cc);
  }

  state._replay = () => playStepAudio(step);
  applyScene(step.scene);
  playStepAudio(step);
}

// 复习模式：只做到期题，逐题推进队列
function startReview(ids) {
  state.reviewQueue = ids.map((id) => QUIZ_BY_ID.get(id)).filter(Boolean);
  nextReviewQuiz();
}

function nextReviewQuiz() {
  const q = state.reviewQueue && state.reviewQueue.shift();
  if (!q) { state.quizFrom = 'wrong'; renderWrongBook(); return; }
  openQuiz(q, 'review');
}

// ---------- 难题双评分挑战（自我评估式「简洁星」，schema 见 src/data/schema.js）----------

// gt_challenge：{ [quizId]: { stars, ts } }，记录每题拿到的最高简洁星
function loadChallenge() {
  try {
    const v = JSON.parse(localStorage.getItem('gt_challenge') || 'null');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    try { localStorage.removeItem('gt_challenge'); } catch { /* 忽略 */ }
    return {};
  }
}

/** 容错读取 challenge 字段；无效返回 null。lStars 合法化为 1-3。 */
function challengeOf(q) {
  const ch = q && q.challenge;
  if (!ch || typeof ch !== 'object') return null;
  const lStars = Number.isInteger(ch.lStars) ? Math.min(3, Math.max(1, ch.lStars)) : 1;
  return { lStars, eHint: typeof ch.eHint === 'string' && ch.eHint.trim() ? ch.eHint.trim() : null };
}

// 挑战卡：讲解最后一步、本题答对且带 challenge 字段时展示；自我评估确认后记录简洁星
function challengeCard(q) {
  const ch = challengeOf(q);
  if (!ch) return null;
  const store = loadChallenge();
  const best = store[q.id] && Number.isInteger(store[q.id].stars) ? store[q.id].stars : 0;
  const starText = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

  const card = el('div', 'challenge-card');
  card.appendChild(el('strong', null, '⭐ 挑战模式：还能更简洁吗？'));
  card.appendChild(el('p', null,
    `你已解出此题。这题其实还有更简的做法（目标 ${starText(ch.lStars)} 简洁星）——试着用更少的步骤、更巧的思路重新解一遍。`));
  if (ch.eHint) card.appendChild(el('p', 'challenge-hint', `提示：${ch.eHint}`));
  const bestLine = el('p', 'muted', best ? `我的最佳纪录：${starText(best)}` : '还没有简洁星纪录，来挑战一下吧！');
  card.appendChild(bestLine);

  const btn = el('button', 'btn btn-small btn-primary', '我做到了更简解法 ✓');
  btn.addEventListener('click', () => {
    const stars = Math.max(best, ch.lStars);
    const s2 = loadChallenge();
    s2[q.id] = { stars, ts: Date.now() };
    try { localStorage.setItem('gt_challenge', JSON.stringify(s2)); } catch { /* 静默 */ }
    audio.playEarcon();
    btn.remove();
    card.appendChild(el('p', 'challenge-done',
      `🏅 已记录 ${starText(stars)} 简洁星！简洁的解法说明理解更深一层。`));
    bestLine.textContent = `我的最佳纪录：${starText(stars)}`;
  });
  card.appendChild(btn);
  return card;
}

// ---------- 错题本 ----------

function renderWrongBook() {
  audio.stopAll();
  state.quiz = null;
  panel.innerHTML = '';
  const wbHead = el('div', 'due-head');
  wbHead.appendChild(el('h2', 'panel-title', '错题本'));
  const reportBtn = el('button', 'btn btn-small', '📊 家长周报');
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
    head.appendChild(el('strong', null, `📌 待复习 ${due.length} 题`));
    const start = el('button', 'btn btn-small btn-primary', '开始复习');
    start.addEventListener('click', () => startReview(due));
    head.appendChild(start);
    block.appendChild(head);
    block.appendChild(el('p', 'muted', '按 +1/+3/+7 天间隔安排，复习答对即推进，全部通过标记「已掌握」。'));
    const names = due.slice(0, 5).map((id) => QUIZ_BY_ID.get(id).title).join('、');
    block.appendChild(el('p', 'muted', names + (due.length > 5 ? ` 等 ${due.length} 题` : '')));
    panel.appendChild(block);
  }

  if (!list.length) {
    panel.appendChild(el('p', 'muted', '暂无错题，继续保持！答错的题目会自动收进来。'));
  } else {
    panel.appendChild(el('p', 'muted', '答对后会标记「已订正」，记录仍保留，可手动移除。'));
    const cards = el('div', 'card-list');
    for (const w of list) {
      const q = QUIZ_BY_ID.get(w.id);
      if (!q) continue; // 题目已下架则跳过
      const card = el('div', 'card wrong-card');
      const main = el('div', 'card-main');
      main.appendChild(el('strong', null, q.title));
      const badges = el('span', 'badge-row');
      badges.appendChild(el('span', 'badge cat', quizCategory(q))); // 错题归因到知识点
      badges.appendChild(el('span', `badge diff-${q.difficulty}`, DIFF_NAMES[q.difficulty] || ''));
      badges.appendChild(el('span', `badge ${w.corrected ? 'st-ok' : 'st-wrong'}`, w.corrected ? '已订正' : '待订正'));
      const plan = rv[w.id];
      if (plan && Number.isInteger(plan.node)) {
        if (review.isMastered(rv, w.id)) {
          badges.appendChild(el('span', 'badge st-ok', '已掌握'));
        } else {
          const dueTag = due.includes(w.id) ? ' · 已到期' : '';
          badges.appendChild(el('span', 'badge st-doing',
            `复习 ${plan.node}/${review.OFFSETS.length}${plan.nextReviewAt ? ` · ${plan.nextReviewAt.slice(5).replace('-', '/')} 到期` : ''}${dueTag}`));
        }
      }
      main.appendChild(badges);
      card.appendChild(main);
      const actions = el('div', 'wrong-actions');
      const retry = el('button', 'btn btn-small btn-primary', '重答');
      retry.addEventListener('click', () => openQuiz(q, 'wrong'));
      const remove = el('button', 'btn btn-small', '移除');
      remove.addEventListener('click', () => { progress.removeWrong(w.id); renderWrongBook(); });
      actions.appendChild(retry);
      actions.appendChild(remove);
      card.appendChild(actions);
      cards.appendChild(card);
    }
    panel.appendChild(cards);
  }
  viewer.setSolid(makeSolid(list.length && QUIZ_BY_ID.get(list[0].id) ? QUIZ_BY_ID.get(list[0].id).solid : 'cube'));
  viewer.setSpin(true);
  viewer.setSection(null);
  viewer.setLabelsVisible(true);
  setViewsVisible(false);
}

// ---------- 家长周报（数据从 progress/mastery/streak 聚合，见 engine/report.js） ----------

function buildWeeklyReport() {
  return report.buildReport({
    attempts: progress.allAttempts(),
    categoryOf: (id) => { const q = QUIZ_BY_ID.get(id); return q ? quizCategory(q) : FALLBACK_CAT; },
    categories: [...CATEGORIES],
    lessonsDone: LESSONS.filter((l) => progress.isLessonDone(l.id, l.steps.length)).length,
    lessonsTotal: LESSONS.length,
    mastery: mastery.loadMastery(),
    streak: streak.loadStreak(),
  }, todayStr());
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

function renderReport() {
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
  bar.appendChild(el('div', 'stat', `<strong>🔥 ${r.currentStreak}</strong><span>连续学习</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${r.lessonsDone}/${r.lessonsTotal}</strong><span>累计完成课程</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${r.answers}</strong><span>本周答题数</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${r.acc}%</strong><span>本周正确率</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${r.conquered}</strong><span>本周攻克错题</span>`));
  panel.appendChild(bar);

  panel.appendChild(el('h3', 'report-sec', '各知识点掌握度'));
  const starsList = el('div', 'report-stars');
  for (const x of r.stars) {
    starsList.appendChild(el('div', 'report-star-row',
      `<span>${x.cat}</span><span class="badge stars">${x.stars}</span>`));
  }
  panel.appendChild(starsList);

  if (r.weakCat) {
    panel.appendChild(el('h3', 'report-sec', '薄弱知识点提醒'));
    panel.appendChild(el('p', 'report-weak',
      `「${r.weakCat}」本周答错 ${r.weakWrong} 次，建议重点复习。`));
  }

  panel.appendChild(el('h3', 'report-sec', '给家长的话'));
  panel.appendChild(el('p', 'report-advice', r.suggestion));

  const copyBtn = el('button', 'btn btn-primary btn-block', '📋 复制分享文案');
  copyBtn.addEventListener('click', async () => {
    const ok = await copyText(report.reportText(r));
    copyBtn.textContent = ok ? '✓ 已复制，去粘贴给家长吧' : '复制失败，请手动截图分享';
    setTimeout(() => { copyBtn.textContent = '📋 复制分享文案'; }, 2500);
  });
  panel.appendChild(copyBtn);
  panel.appendChild(el('p', 'muted', '统计口径：本周指周一至今日；学习天数以答题记录计。'));

  viewer.setSpin(true);
}

// ---------- 实验室 ----------

function renderLab() {
  audio.stopAll();
  const lab = state.lab;
  const solidData = makeSolid(lab.solidId);
  viewer.setSolid(solidData);
  viewer.setSpin(lab.spin);
  viewer.setLabelsVisible(lab.labels);
  viewer.setSection(null);
  viewer.setUnfold(lab.unfold);
  setViewsVisible(lab.views);

  let minY = Infinity, maxY = -Infinity;
  for (const q of solidData.points) { minY = Math.min(minY, q.p[1]); maxY = Math.max(maxY, q.p[1]); }

  panel.innerHTML = '';
  panel.appendChild(el('h2', 'panel-title', '实验室'));

  const selWrap = el('div', 'lab-row');
  selWrap.appendChild(el('label', null, '几何体：'));
  const sel = el('select', 'lab-select');
  for (const c of catalog()) {
    const o = el('option', null, c.name);
    o.value = c.id;
    if (c.id === lab.solidId) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener('change', () => { lab.solidId = sel.value; lab.unfold = 0; renderLab(); });
  selWrap.appendChild(sel);
  panel.appendChild(selWrap);

  const toggles = el('div', 'lab-row lab-toggles');
  const mkToggle = (label, checked, onChange) => {
    const l = el('label', 'lab-toggle');
    const c = document.createElement('input');
    c.type = 'checkbox';
    c.checked = checked;
    c.addEventListener('change', () => onChange(c.checked));
    l.appendChild(c);
    l.appendChild(document.createTextNode(' ' + label));
    return l;
  };
  toggles.appendChild(mkToggle('自转', lab.spin, (v) => { lab.spin = v; viewer.setSpin(v); }));
  toggles.appendChild(mkToggle('顶点标注', lab.labels, (v) => { lab.labels = v; viewer.setLabelsVisible(v); }));
  toggles.appendChild(mkToggle('三视图', lab.views, (v) => { lab.views = v; setViewsVisible(v); }));
  toggles.appendChild(mkToggle('水平截面', lab.sectionOn, (v) => {
    lab.sectionOn = v;
    updateSection();
    sliderWrap.style.display = v ? '' : 'none';
  }));
  panel.appendChild(toggles);

  const sliderWrap = el('div', 'lab-row lab-slider');
  sliderWrap.style.display = lab.sectionOn ? '' : 'none';
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = 1000;
  slider.value = Math.round(lab.t * 1000);
  const valLabel = el('span', 'muted');
  const updateVal = () => {
    const h = lab.t * (maxY - minY);
    valLabel.textContent = `截面高度 h = ${h.toFixed(2)} / ${(maxY - minY).toFixed(2)}`;
  };
  slider.addEventListener('input', () => { lab.t = slider.value / 1000; updateSection(); updateVal(); });
  sliderWrap.appendChild(slider);
  sliderWrap.appendChild(valLabel);
  panel.appendChild(sliderWrap);
  updateVal();

  function updateSection() {
    if (!lab.sectionOn) { viewer.setSection(null); return; }
    viewer.setSection({ n: [0, 1, 0], d: minY + lab.t * (maxY - minY) });
  }
  updateSection();

  // 展开图：滑杆 + 展开/收起动画按钮（球等不支持的几何体置灰）
  const unfoldable = viewer.canUnfold();
  const unfoldWrap = el('div', 'lab-row lab-slider');
  const unfoldBtn = el('button', 'btn btn-small', lab.unfold >= 1 ? '收起' : '展开');
  const unfoldSlider = document.createElement('input');
  unfoldSlider.type = 'range';
  unfoldSlider.min = 0;
  unfoldSlider.max = 1000;
  unfoldSlider.value = Math.round(lab.unfold * 1000);
  const unfoldVal = el('span', 'muted');
  const updateUnfoldVal = () => {
    unfoldVal.textContent = unfoldable ? `展开程度 ${(lab.unfold * 100).toFixed(0)}%` : '该几何体不支持展开';
    unfoldBtn.textContent = lab.unfold >= 1 ? '收起' : '展开';
  };
  const setUnfold = (v) => {
    lab.unfold = Math.min(1, Math.max(0, v));
    viewer.setUnfold(lab.unfold);
    unfoldSlider.value = Math.round(lab.unfold * 1000);
    updateUnfoldVal();
  };
  if (!unfoldable) {
    unfoldSlider.disabled = true;
    unfoldBtn.disabled = true;
  }
  unfoldSlider.addEventListener('input', () => setUnfold(unfoldSlider.value / 1000));
  unfoldBtn.addEventListener('click', () => {
    // 600ms 缓动动画到 0 或 1
    const from = lab.unfold, to = lab.unfold >= 1 ? 0 : 1;
    const token = (lab._animToken = (lab._animToken || 0) + 1);
    const start = performance.now();
    const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2);
    const frame = (now) => {
      if (lab._animToken !== token) return; // 被新的动画/操作打断
      const k = Math.min(1, (now - start) / 600);
      setUnfold(from + (to - from) * ease(k));
      if (k < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  unfoldWrap.appendChild(unfoldBtn);
  unfoldWrap.appendChild(unfoldSlider);
  unfoldWrap.appendChild(unfoldVal);
  panel.appendChild(unfoldWrap);
  updateUnfoldVal();

  // 顶点/棱/面统计 + 欧拉公式实时验证
  const V = solidData.points.length;
  const F = solidData.faces.length;
  const E = buildEdges(solidData.faces).length;
  const euler = V - E + F;
  const stats = el('div', 'stats');
  stats.appendChild(el('div', 'stat', `<strong>${V}</strong><span>顶点 V</span>`));
  stats.appendChild(el('div', 'stat', `<strong>${E}</strong><span>棱 E</span>`));
  stats.appendChild(el('div', 'stat', `<strong>${F}</strong><span>面 F</span>`));
  panel.appendChild(stats);
  panel.appendChild(el('div', `euler ${euler === 2 ? 'ok' : 'no'}`,
    `欧拉公式：V − E + F = ${V} − ${E} + ${F} = <strong>${euler}</strong>${euler === 2 ? ' ✓ 成立' : ''}`));
  panel.appendChild(el('p', 'muted lab-hint', '拖动 3D 区域旋转视角，滚轮或双指缩放。'));
}

// ---------- 闯关 / 探究 / 几何之美（自包含模块接线） ----------

// 闯关答对 / 探究任务达成也计入 streak 的「玩 1 关闯关」目标：
// 两个模块在成功时都会调 deps.audio.playEarcon()，这里包一层顺带记录。
const gameAudio = {
  ...audio,
  playEarcon() {
    try { streak.record('game'); } catch { /* 存储异常不影响游戏 */ }
    audio.playEarcon();
  },
};

function renderNetGame() {
  audio.stopAll();
  panel.innerHTML = '';
  state.extSession = initNetGame(panel, { viewer, audio: gameAudio });
}

function renderExplore() {
  audio.stopAll();
  panel.innerHTML = '';
  state.extSession = initExplore(panel, { viewer, audio: gameAudio });
}

// 「几何之美」由并行开发的 src/ui/beauty.js 提供，动态加载：未落盘时显示占位而不阻塞应用
let beautyMod = null, beautyTried = false;
async function loadBeauty() {
  if (!beautyTried) {
    beautyTried = true;
    try { beautyMod = await import('./beauty.js'); } catch { beautyMod = null; }
  }
  return beautyMod;
}

function renderBeauty() {
  audio.stopAll();
  panel.innerHTML = '';
  panel.appendChild(el('h2', 'panel-title', '几何之美'));
  const hint = el('p', 'muted', '加载中…');
  panel.appendChild(hint);
  loadBeauty().then((m) => {
    if (state.view !== 'beauty') return; // 等待期间已切走
    if (m && typeof m.initBeauty === 'function') {
      hint.remove();
      try {
        state.extSession = m.initBeauty(panel, { viewer, audio: gameAudio });
      } catch {
        panel.appendChild(el('p', 'muted', '「几何之美」加载失败，请刷新重试。'));
      }
    } else {
      hint.textContent = '「几何之美」模块尚未就绪，敬请期待。';
    }
  });
}

// ---------- 主视图切换 ----------

const VIEWS = {
  lessons: { name: '课程', render: renderLessonList },
  quizzes: { name: '题库', render: renderQuizList },
  wrong: { name: '错题本', render: renderWrongBook },
  lab: { name: '实验室', render: renderLab },
  netgame: { name: '闯关', render: renderNetGame },
  explore: { name: '探究', render: renderExplore },
  beauty: { name: '几何之美', render: renderBeauty },
};

function switchView(view) {
  if (state.extSession) { // 销毁上一个外部模块会话（移除其 DOM/样式/计时器）
    try { state.extSession.destroy(); } catch { /* 忽略 */ }
    state.extSession = null;
  }
  state.view = view;
  for (const [k, b] of Object.entries(tabButtons)) {
    b.classList.toggle('active', k === view);
  }
  VIEWS[view].render();
}

const tabButtons = {};
const tabs = document.getElementById('tabs');
for (const [k, v] of Object.entries(VIEWS)) {
  const b = el('button', 'tab', v.name);
  b.addEventListener('click', () => switchView(k));
  tabs.appendChild(b);
  tabButtons[k] = b;
}

switchView('lessons');

// 深链参数：?view=lab&solid=cube&unfold=1&views=1（便于分享/自测指定状态）
{
  const qs = new URLSearchParams(location.search);
  const qSolid = qs.get('solid');
  if (qSolid && CATALOG.has(qSolid)) state.lab.solidId = qSolid;
  const qUnfold = parseFloat(qs.get('unfold'));
  if (Number.isFinite(qUnfold)) state.lab.unfold = Math.min(1, Math.max(0, qUnfold));
  if (qs.get('views') === '1' || qs.get('views') === 'true') state.lab.views = true;
  const qView = qs.get('view');
  if (qView === 'report') { state.view = 'wrong'; renderReport(); }
  else if (qView && VIEWS[qView]) switchView(qView);
}
