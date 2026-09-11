// 应用视图逻辑：课程 / 题库 / 错题本 / 实验室 四个主视图 + 顶部 tab 切换
import { catalog } from '../geo/solids.js';
import { buildEdges } from '../geo/topology.js';
import { GeoViewer } from '../viewer/viewer.js';
import { LESSONS } from '../data/lessons.js';
import { QUIZZES } from '../data/quizzes.js';
import * as audio from '../engine/audio.js';
import * as progress from '../engine/progress.js';
import { renderThreeViews } from './threeview.js';

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

// 学习统计条：已完成课程数 / 已答题数 / 正确率
function statsBar() {
  const done = LESSONS.filter((l) => progress.isLessonDone(l.id, l.steps.length)).length;
  const at = progress.allAttempts();
  const answered = new Set(at.map((a) => a.id)).size;
  const okCount = at.filter((a) => a.ok).length;
  const acc = at.length ? Math.round((okCount / at.length) * 100) : 0;
  const bar = el('div', 'stats stat-bar');
  bar.appendChild(el('div', 'stat', `<strong>${done}</strong><span>已完成课程</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${answered}</strong><span>已答题数</span>`));
  bar.appendChild(el('div', 'stat', `<strong>${acc}%</strong><span>正确率</span>`));
  return bar;
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
  panel.scrollTop = 0;
}

// ---------- 题库 ----------

const DIFF_NAMES = { 1: '简单', 2: '中等', 3: '困难' };
const QUIZ_STATUS = { none: ['未做', 'st-none'], ok: ['已对', 'st-ok'], wrong: ['错过', 'st-wrong'] };
let quizFilter = 0; // 0 = 全部

function renderQuizList() {
  audio.stopAll();
  state.quiz = null;
  panel.innerHTML = '';
  panel.appendChild(el('h2', 'panel-title', '题库'));
  panel.appendChild(statsBar());

  const filters = el('div', 'filter-bar');
  for (const [v, name] of [[0, '全部'], [1, '简单'], [2, '中等'], [3, '困难']]) {
    const b = el('button', `btn btn-small${quizFilter === v ? ' btn-primary' : ''}`, name);
    b.addEventListener('click', () => { quizFilter = v; renderQuizList(); });
    filters.appendChild(b);
  }
  panel.appendChild(filters);

  const list = el('div', 'card-list');
  const items = QUIZZES.filter((q) => !quizFilter || q.difficulty === quizFilter);
  if (!items.length) list.appendChild(el('p', 'muted', '该难度暂无题目'));
  for (const q of items) {
    const card = el('button', 'card');
    card.appendChild(el('strong', null, q.title));
    const badges = el('span', 'badge-row');
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
  viewer.setSolid(makeSolid(q.solid));
  viewer.setLabelsVisible(true);
  renderQuizQuestion();
}

// 从错题本进入的题，返回时回到错题本
function quizBack() {
  if (state.quizFrom === 'wrong') renderWrongBook();
  else renderQuizList();
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
  panel.scrollTop = 0;
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
  const result = el('div', `result ${ok ? 'ok' : 'no'}`, ok ? '✓ 回答正确！' : '✗ 回答错误，看看讲解吧。');
  panel.appendChild(result);
  const btn = el('button', 'btn btn-primary btn-block', '查看讲解 →');
  btn.addEventListener('click', renderExplainStep);
  panel.appendChild(btn);
  if (ok) audio.speak('回答正确');
}

function renderExplainStep() {
  const q = state.quiz;
  const i = state.explainStep;
  const step = q.explain[i];
  panel.innerHTML = '';
  panel.appendChild(playerHeader(q.title, '讲解', quizBack));

  panel.appendChild(el('div', 'result ' + (state.quizPicked === q.answer.correct ? 'ok' : 'no'),
    `正确答案：${q.answer.options[q.answer.correct]}`));
  panel.appendChild(el('div', 'step-body', step.text));

  const nav = el('div', 'step-nav');
  const prev = el('button', 'btn', '← 上一步');
  prev.disabled = i === 0;
  prev.addEventListener('click', () => { state.explainStep--; renderExplainStep(); });
  nav.appendChild(prev);
  nav.appendChild(el('span', 'muted', `讲解 ${i + 1} / ${q.explain.length}`));
  const next = el('button', 'btn btn-primary', i === q.explain.length - 1 ? '返回题库' : '下一步 →');
  next.addEventListener('click', () => {
    if (i === q.explain.length - 1) quizBack();
    else { state.explainStep++; renderExplainStep(); }
  });
  nav.appendChild(next);
  panel.appendChild(nav);

  state._replay = () => playStepAudio(step);
  applyScene(step.scene);
  playStepAudio(step);
  panel.scrollTop = 0;
}

// ---------- 错题本 ----------

function renderWrongBook() {
  audio.stopAll();
  state.quiz = null;
  panel.innerHTML = '';
  panel.appendChild(el('h2', 'panel-title', '错题本'));

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
      badges.appendChild(el('span', `badge diff-${q.difficulty}`, DIFF_NAMES[q.difficulty] || ''));
      badges.appendChild(el('span', `badge ${w.corrected ? 'st-ok' : 'st-wrong'}`, w.corrected ? '已订正' : '待订正'));
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

// ---------- 主视图切换 ----------

const VIEWS = {
  lessons: { name: '课程', render: renderLessonList },
  quizzes: { name: '题库', render: renderQuizList },
  wrong: { name: '错题本', render: renderWrongBook },
  lab: { name: '实验室', render: renderLab },
};

function switchView(view) {
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
  if (qView && VIEWS[qView]) switchView(qView);
}
