// 应用壳：模块级 state、viewer/audio 接线、tab 路由、统计条、深链、存储迁移。
// 各主视图逻辑在 src/ui/views/（lessons/quiz/wrong/lab），自包含模块在 netgame/explore/beauty。
// 视图注册表见文件尾 VIEWS——新增 tab 只需注册一项（契约见 docs/README「架构」节）。
import { catalog } from '@geo/core/geo/solids.js';
import { GeoViewer } from '../viewer/viewer.js';
import { LESSONS } from '@geo/core/data/lessons.js';
import * as audio from '../engine/audio.js';
import * as progress from '../engine/progress.js';
import * as streak from '../engine/streak.js';
import * as store from '../engine/store.js';
import { renderThreeViews } from './threeview.js';
import { initNetGame } from './netgame.js';
import { initExplore } from './explore.js';
import { flame } from './icons.js';
import { el, markInteractChip } from './views/common.js';
import { renderLessonList } from './views/lessons.js';
import { renderQuizList } from './views/quiz.js';
import { renderWrongBook, renderReport } from './views/wrong.js';
import { renderLab } from './views/lab.js';

const CATALOG = new Map(catalog().map((c) => [c.id, c]));

const stage = document.getElementById('stage');
export const panel = document.getElementById('panel');
export const viewer = new GeoViewer(stage, { onUserInteract: markInteracted });

// 三视图浮层（叠加在 3D 区左下角，不拦截交互；手机上自适应宽度）
const viewPane = el('div', 'view-pane');
viewPane.style.display = 'none';
stage.appendChild(viewPane);

/** 显示/隐藏当前几何体的三视图面板。 */
export function setViewsVisible(on) {
  if (on && viewer.solid) {
    renderThreeViews(viewPane, viewer.solid);
    viewPane.style.display = '';
  } else {
    viewPane.style.display = 'none';
  }
}

// 首次手势解锁 iOS 音频
window.addEventListener('pointerdown', () => audio.unlock(), { once: true });

export const state = {
  view: 'lessons',
  lesson: null,
  lessonStep: 0,
  quiz: null,
  quizPicked: -1,
  explainStep: 0,
  quizFrom: 'quizzes',
  practice: null, // 练习序列：{ queue, idx, label, backTo, lessonId }
  lab: {
    solidId: 'cube',
    spin: false,
    labels: true,
    sectionOn: false,
    t: 0.5,
    unfold: 0,
    views: false,
  },
  extSession: null, // 外部自包含模块（闯关/探究/几何之美）的会话句柄，切 tab 时 destroy
};

// viewer 报告首次用户拖拽后调用：当前步骤的互动 chip 标记「已互动 ✓」（chip 本体在课程视图）
function markInteracted() {
  state._interacted = true; // 后续新渲染的步骤 chip 直接呈完成态
  markInteractChip();
}

// 学习统计条：已完成课程数 / 已答题数 / 正确率 / 连续学习天数；传入 quizIds(Set) 时跟随筛选范围统计
export function statsBar(quizIds = null) {
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
  bar.appendChild(el('div', 'stat', `<strong>${flame} ${s.current}</strong><span>连续学习</span>`));
  return bar;
}

export function applyScene(scene) {
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

// ---------- 闯关 / 探究 / 几何之美（自包含模块接线） ----------

// 闯关答对 / 探究任务达成也计入 streak 的「玩 1 关闯关」目标：
// 两个模块在成功时都会调 deps.audio.playEarcon()，这里包一层顺带记录。
const gameAudio = {
  ...audio,
  playEarcon() {
    try {
      streak.record('game');
    } catch {
      /* 存储异常不影响游戏 */
    }
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
let beautyMod = null,
  beautyTried = false;
async function loadBeauty() {
  if (!beautyTried) {
    beautyTried = true;
    try {
      beautyMod = await import('./beauty.js');
    } catch {
      beautyMod = null;
    }
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

// ---------- 视图注册表与 tab 切换 ----------
// 契约：{ id, title, init }；init 为无参渲染函数（把视图渲染进 #panel），
// 由本模块的 render* 函数或自包含模块的 initXxx(container, deps) 包一层适配。
// icon 字段预留给将来 tab 图标（当前 tab 只显示文字，不渲染 icon）。

const VIEWS = [
  { id: 'lessons', title: '课程', init: renderLessonList },
  { id: 'quizzes', title: '题库', init: renderQuizList },
  { id: 'wrong', title: '错题本', init: renderWrongBook },
  { id: 'lab', title: '实验室', init: renderLab },
  { id: 'netgame', title: '闯关', init: renderNetGame }, // 旧自包含模块适配
  { id: 'explore', title: '探究', init: renderExplore }, // 旧自包含模块适配
  { id: 'beauty', title: '几何之美', init: renderBeauty }, // 旧自包含模块适配（动态加载）
];

function viewById(id) {
  return VIEWS.find((v) => v.id === id);
}

export function switchView(view) {
  if (state.extSession) {
    // 销毁上一个外部模块会话（移除其 DOM/样式/计时器）
    try {
      state.extSession.destroy();
    } catch {
      /* 忽略 */
    }
    state.extSession = null;
  }
  state.view = view;
  for (const [k, b] of Object.entries(tabButtons)) {
    b.classList.toggle('active', k === view);
  }
  viewById(view).init();
}

const tabButtons = {};
const tabs = document.getElementById('tabs');
for (const v of VIEWS) {
  const b = el('button', 'tab', v.title);
  b.addEventListener('click', () => switchView(v.id));
  tabs.appendChild(b);
  tabButtons[v.id] = b;
}

store.migrate(); // 存储 schema 迁移钩子（见 engine/store.js）

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
  if (qView === 'report') {
    state.view = 'wrong';
    renderReport();
  } else if (qView && viewById(qView)) switchView(qView);
}
