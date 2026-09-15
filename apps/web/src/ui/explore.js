// 探究模式（GeoGebra 式自由探究）：参数滑杆 + 实时几何量面板 + 引导发现卡 + 探究任务。
// 独立自包含模块——不改动 app.js / index.html / viewer.js。
//
// 【给接线人】
//   import { initExplore } from './explore.js';
//   const handle = initExplore(panelEl, { viewer, audio });
//   // viewer: GeoViewer 实例（参数变化时内部调 viewer.setSolid(新几何体) 实时联动）
//   // audio:  可选，答对探究任务时调 audio.playEarcon?.()
//   // 切走视图时调 handle.destroy()（或导出的 destroy()）清理 DOM 与样式。
//   样式由 initExplore 自动注入（EXPLORE_CSS，全部 .exp-* 前缀，不与现有样式冲突）。

import {
  cube,
  box,
  prism,
  pyramid,
  cylinder,
  cone,
  frustum,
  sphere,
} from '@geo/core/geo/solids.js';
import { measure } from '@geo/core/geo/measure.js';
import { thought, target } from './icons.js';

// ---------- 样式（自动注入；也可由接线人取 EXPLORE_CSS 自行放入 <style>） ----------

export const EXPLORE_CSS = `
.exp-title { font-size: 20px; margin-bottom: 12px; }
.exp-solids { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.exp-chip {
  min-height: 40px; padding: 0 14px; font-size: 14px; border-radius: var(--r-pill);
  border: 1px solid var(--border); background: var(--card); color: var(--text); cursor: pointer;
  transition: all .15s ease;
}
.exp-chip:hover { border-color: var(--primary); color: var(--primary); }
.exp-chip:active { transform: scale(.97); }
.exp-chip.on { background: var(--primary); border-color: var(--primary); color: #fff; font-weight: 600; }
.exp-slider-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.exp-slider-row label { width: 76px; font-size: 14px; flex-shrink: 0; }
.exp-slider-row input[type=range] { flex: 1; min-width: 120px; height: 32px; }
.exp-slider-val { width: 60px; text-align: right; font-size: 14px; font-weight: 600; color: var(--brand); font-variant-numeric: tabular-nums; }
.exp-measure { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 10px; margin: 14px 0; }
.exp-mstat { text-align: center; padding: 10px 4px; background: var(--card-alt); border-radius: var(--r-m); border: 1px solid var(--border); }
.exp-mstat strong { display: block; font-size: 19px; color: var(--brand); font-variant-numeric: tabular-nums; }
.exp-mstat span { font-size: 12px; color: var(--muted); }
.exp-sec { font-size: 15px; font-weight: 600; color: var(--brand); margin: 18px 0 8px; }
.exp-card { background: var(--card-alt); border: 1px solid var(--border); border-radius: var(--r-m); padding: 12px 14px; margin-bottom: 10px; }
.exp-card-q { font-size: 15px; line-height: 1.6; }
.exp-card details { margin-top: 8px; }
.exp-card summary { cursor: pointer; color: var(--primary); font-size: 14px; min-height: 32px; }
.exp-card-ans { margin-top: 6px; font-size: 14px; line-height: 1.7; background: var(--card); border: 1px dashed var(--border); border-radius: var(--r-s); padding: 8px 10px; }
.exp-task { background: color-mix(in srgb, var(--warning-bg) 55%, var(--card)); border: 1px solid color-mix(in srgb, var(--warning) 30%, var(--border)); border-radius: var(--r-m); padding: 12px 14px; margin-bottom: 10px; font-size: 14px; line-height: 1.6; }
.exp-task.done { background: var(--success-bg); border-color: var(--success); }
.exp-task-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.exp-task-st { flex-shrink: 0; font-size: 12px; padding: 2px 8px; border-radius: var(--r-pill); background: var(--card-alt); color: var(--muted); }
.exp-task.done .exp-task-st { background: var(--success); color: #fff; }
.exp-task-live { font-size: 13px; color: var(--muted); margin-top: 4px; font-variant-numeric: tabular-nums; }
.exp-hint { font-size: 13px; color: var(--muted); margin-top: 12px; }
@media (prefers-reduced-motion: reduce) {
  .exp-chip { transition: none; }
}
`;

// ---------- 几何体与参数定义 ----------

const P = (key, label, min, max, step, def) => ({ key, label, min, max, step, def });

const SOLIDS = [
  {
    id: 'cube',
    name: '正方体',
    kind: 'cube',
    make: (p) => cube(p.a),
    params: [P('a', '棱长 a', 1, 6, 0.05, 2)],
  },
  {
    id: 'box',
    name: '长方体',
    kind: 'box',
    make: (p) => box(p.a, p.b, p.c),
    params: [
      P('a', '长 a', 1, 6, 0.05, 2),
      P('b', '高 b', 0.5, 6, 0.05, 3),
      P('c', '宽 c', 1, 6, 0.05, 4),
    ],
  },
  {
    id: 'prism',
    name: '正棱柱',
    kind: 'prism',
    make: (p) => prism(p.n, p.r, p.h),
    params: [
      P('n', '棱数 n', 3, 8, 1, 3),
      P('r', '底面半径 r', 0.8, 3, 0.05, 1.6),
      P('h', '高 h', 0.5, 5, 0.05, 2.6),
    ],
  },
  {
    id: 'pyramid',
    name: '正棱锥',
    kind: 'pyramid',
    make: (p) => pyramid(p.n, p.r, p.h),
    params: [
      P('n', '棱数 n', 3, 8, 1, 4),
      P('r', '底面半径 r', 0.8, 3, 0.05, 1.8),
      P('h', '高 h', 0.5, 5, 0.05, 2.6),
    ],
  },
  {
    id: 'cylinder',
    name: '圆柱',
    kind: 'cylinder',
    make: (p) => cylinder(p.r, p.h),
    params: [P('r', '底面半径 r', 0.5, 3, 0.05, 1.4), P('h', '高 h', 0.5, 5, 0.05, 2.6)],
  },
  {
    id: 'cone',
    name: '圆锥',
    kind: 'cone',
    make: (p) => cone(p.r, p.h),
    params: [P('r', '底面半径 r', 0.5, 3, 0.05, 1.6), P('h', '高 h', 0.5, 5, 0.05, 2.6)],
  },
  {
    id: 'frustum',
    name: '圆台',
    kind: 'frustum',
    make: (p) => frustum(p.r1, p.r2, p.h),
    params: [
      P('r1', '下底半径 r₁', 0.5, 3, 0.05, 1.6),
      P('r2', '上底半径 r₂', 0.2, 3, 0.05, 0.9),
      P('h', '高 h', 0.5, 5, 0.05, 2.2),
    ],
  },
  {
    id: 'sphere',
    name: '球',
    kind: 'sphere',
    make: (p) => sphere(p.r),
    params: [P('r', '半径 r', 0.5, 3, 0.05, 1.6)],
  },
];

// ---------- 引导发现卡（结论随当前参数动态填数值） ----------

const f2 = (x) => x.toFixed(2);

const CARDS = {
  cube: [
    {
      q: '把棱长 a 加倍，体积变几倍？',
      ans: (p, m) =>
        `现在 V = ${f2(m.volume)}；a 加倍后 V′ = ${f2(8 * m.volume)}，是原来的 <strong>8 倍</strong>——体积随棱长的三次方增长。`,
    },
    {
      q: '表面积呢？也加倍吗？',
      ans: (p, m) =>
        `现在 S = ${f2(m.surface)}；a 加倍后 S′ = ${f2(4 * m.surface)}，只变 <strong>4 倍</strong>——表面积随棱长的平方增长。`,
    },
  ],
  box: [
    {
      q: '固定 a、b 不变，把 c 加倍，体积怎么变？',
      ans: (p, m) =>
        `现在 V = abc = ${f2(m.volume)}；c 加倍后 V′ = ${f2(2 * m.volume)}，恰好是原来的 <strong>2 倍</strong>——体积与 c 成正比。`,
    },
    {
      q: '体对角线 d 和 a、b、c 是什么关系？',
      ans: (p, m) =>
        `d = √(a² + b² + c²) = √(${f2(p.a)}² + ${f2(p.b)}² + ${f2(p.c)}²) = <strong>${f2(m.diagonal)}</strong>。拖动滑杆验证吧。`,
    },
  ],
  prism: [
    {
      q: '保持底面不变，把高 h 加倍，体积怎么变？',
      ans: (p, m) =>
        `V = S底·h。现在 S底 = ${f2(m.baseArea)}，V = ${f2(m.volume)}；h 加倍后 V′ = ${f2(2 * m.volume)}——<strong>体积与高成正比</strong>。`,
    },
    {
      q: '把 n 从 3 一路调到 8，棱柱越来越像什么？',
      ans: (p, m) =>
        `像<strong>圆柱</strong>！现在底面积 = ${f2(m.baseArea)}，同半径圆面积 πr² = ${f2(Math.PI * p.r * p.r)}，比值 ${f2(m.baseArea / (Math.PI * p.r * p.r))}——n 越大越接近 1。`,
    },
  ],
  pyramid: [
    {
      q: '保持底面和高不变，把顶点 P 左右平移，体积会变吗？',
      ans: (p, m) =>
        `<strong>不会</strong>。V = S底·h / 3 只取决于底面积和高：现在 V = ${f2(m.baseArea)} × ${f2(p.h)} / 3 = ${f2(m.volume)}。等底等高的棱锥体积相等。`,
    },
    {
      q: '同底等高的棱柱，体积是棱锥的几倍？',
      ans: (p, m) =>
        `棱柱 V柱 = S底·h = ${f2(3 * m.volume)}，棱锥 V锥 = ${f2(m.volume)}，比值 = <strong>3.00</strong>。改 n、r、h 都不会改变这个倍数。`,
    },
  ],
  cylinder: [
    {
      q: 'r 加倍（h 不变），体积变几倍？',
      ans: (p, m) =>
        `V = πr²h：现在 V = ${f2(m.volume)}；r 加倍后 V′ = ${f2(4 * m.volume)}，变 <strong>4 倍</strong>——体积随半径的平方增长。`,
    },
    {
      q: '侧面展开是什么形状？边长各是多少？',
      ans: (p, m) =>
        `<strong>矩形</strong>：一边是高 h = ${f2(p.h)}，另一边是底面周长 2πr = ${f2(2 * Math.PI * p.r)}，所以 S侧 = ${f2(m.lateral)}。`,
    },
  ],
  cone: [
    {
      q: '同底等高的圆柱，体积是圆锥的几倍？拖一拖 r、h 验证。',
      ans: (p, m) =>
        `V柱 = πr²h = ${f2(3 * m.volume)}，V锥 = ${f2(m.volume)}，比值 = <strong>3.00</strong>——无论怎么拖，倍数始终是 3。`,
    },
    {
      q: '母线 l 怎么从 r、h 算出来？',
      ans: (p, m) =>
        `轴截面是直角三角形：l = √(r² + h²) = √(${f2(p.r)}² + ${f2(p.h)}²) = <strong>${f2(m.slant)}</strong>。`,
    },
  ],
  frustum: [
    {
      q: '把 r₂ 慢慢调向 0，圆台变成什么？体积呢？',
      ans: (p, m) =>
        `变成<strong>圆锥</strong>。r₂→0 时 V → πr₁²h/3 = ${f2((Math.PI * p.r1 * p.r1 * p.h) / 3)}；现在 V = ${f2(m.volume)}。`,
    },
    {
      q: '那把 r₂ 调到等于 r₁ 呢？',
      ans: (p, m) =>
        `变成<strong>圆柱</strong>：V → πr₁²h = ${f2(Math.PI * p.r1 * p.r1 * p.h)}。圆台公式在两种极限下分别退化为圆锥和圆柱公式。`,
    },
  ],
  sphere: [
    {
      q: '半径加倍，体积变几倍？',
      ans: (p, m) =>
        `V = (4/3)πr³：现在 V = ${f2(m.volume)}；r 加倍后 V′ = ${f2(8 * m.volume)}，变 <strong>8 倍</strong>。`,
    },
    {
      q: '半径加倍，表面积变几倍？',
      ans: (p, m) =>
        `S = 4πr²：现在 S = ${f2(m.surface)}；r 加倍后 S′ = ${f2(4 * m.surface)}，变 <strong>4 倍</strong>。`,
    },
  ],
};

// ---------- 探究任务 ----------

const TASKS = [
  {
    id: 't-cube',
    solid: 'cube',
    text: '正方体：调棱长 a，使表面积恰好等于 96（S = 6a²）。',
    done: (p, m) => Math.abs(m.surface - 96) < 0.2,
    live: (p, m) => `当前 a = ${f2(p.a)}，S = ${f2(m.surface)}`,
  },
  {
    id: 't-box',
    solid: 'box',
    text: '长方体：保持 a = 2.00、b = 3.00，调 c 使体积等于 18。',
    done: (p, m) =>
      Math.abs(p.a - 2) < 0.03 && Math.abs(p.b - 3) < 0.03 && Math.abs(m.volume - 18) < 0.1,
    live: (p, m) => `当前 a = ${f2(p.a)}，b = ${f2(p.b)}，V = ${f2(m.volume)}`,
  },
  {
    id: 't-cylinder',
    solid: 'cylinder',
    text: '圆柱：保持 h = 3.00，调 r 使体积等于 12π ≈ 37.70。',
    done: (p, m) => Math.abs(p.h - 3) < 0.03 && Math.abs(m.volume - 12 * Math.PI) < 0.2,
    live: (p, m) => `当前 h = ${f2(p.h)}，V = ${f2(m.volume)}`,
  },
  {
    id: 't-pyramid',
    solid: 'pyramid',
    text: '四棱锥：保持 n = 4、r = 2.00，调 h 使体积等于 8。',
    done: (p, m) => p.n === 4 && Math.abs(p.r - 2) < 0.03 && Math.abs(m.volume - 8) < 0.1,
    live: (p, m) => `当前 n = ${p.n}，r = ${f2(p.r)}，V = ${f2(m.volume)}`,
  },
  {
    id: 't-sphere',
    solid: 'sphere',
    text: '球：调 r 使表面积等于 36π ≈ 113.10。',
    done: (p, m) => Math.abs(m.surface - 36 * Math.PI) < 0.3,
    live: (p, m) => `当前 r = ${f2(p.r)}，S = ${f2(m.surface)}`,
  },
];

// ---------- 模块实现 ----------

const fmt = (x) => (x == null ? '—' : f2(x));

let current = null; // 当前实例（供导出的 destroy() 使用）
let styleEl = null;
let styleRefs = 0;

function ensureStyle() {
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.dataset.explore = '1';
    styleEl.textContent = EXPLORE_CSS;
    document.head.appendChild(styleEl);
  }
  styleRefs++;
}

function releaseStyle() {
  styleRefs--;
  if (styleRefs <= 0 && styleEl) {
    styleEl.remove();
    styleEl = null;
    styleRefs = 0;
  }
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

/**
 * 初始化探究模式面板。
 * @param {HTMLElement} container 挂载点（面板容器）
 * @param {{ viewer?: object, audio?: object }} deps
 * @returns {{ destroy(): void }}
 */
export function initExplore(container, deps = {}) {
  ensureStyle();

  const state = {
    solidId: 'box',
    params: {},
    solved: new Set(),
    destroyed: false,
  };

  const root = el('div', 'exp-root');
  container.appendChild(root);

  // 几何体切换 chips
  root.appendChild(el('h2', 'exp-title', '探究模式'));
  const chips = el('div', 'exp-solids');
  root.appendChild(chips);
  for (const s of SOLIDS) {
    const b = el('button', 'exp-chip', s.name);
    b.dataset.solid = s.id;
    b.addEventListener('click', () => selectSolid(s.id));
    chips.appendChild(b);
  }

  const slidersBox = el('div', 'exp-sliders');
  root.appendChild(slidersBox);
  const measureBox = el('div', 'exp-measure');
  root.appendChild(measureBox);

  root.appendChild(el('div', 'exp-sec', '引导发现'));
  const cardsBox = el('div', 'exp-cards');
  root.appendChild(cardsBox);

  root.appendChild(el('div', 'exp-sec', '探究任务'));
  const tasksBox = el('div', 'exp-tasks');
  root.appendChild(tasksBox);
  root.appendChild(
    el('p', 'exp-hint', '拖动滑杆改变参数，3D 模型与几何量实时联动；任务达成自动判对。'),
  );

  const def = () => SOLIDS.find((s) => s.id === state.solidId);

  function selectSolid(id) {
    state.solidId = id;
    state.params = {};
    for (const p of def().params) state.params[p.key] = p.def;
    for (const b of chips.children) b.classList.toggle('on', b.dataset.solid === id);
    buildSliders();
    buildCards();
    buildTasks();
    update();
  }

  function buildSliders() {
    slidersBox.innerHTML = '';
    for (const p of def().params) {
      const row = el('div', 'exp-slider-row');
      row.appendChild(el('label', null, p.label));
      const input = document.createElement('input');
      input.type = 'range';
      input.min = p.min;
      input.max = p.max;
      input.step = p.step;
      input.value = state.params[p.key];
      const val = el('span', 'exp-slider-val', f2(state.params[p.key]));
      input.addEventListener('input', () => {
        const v = parseFloat(input.value);
        state.params[p.key] = p.step === 1 ? Math.round(v) : v;
        val.textContent = p.step === 1 ? String(Math.round(v)) : f2(v);
        update();
      });
      row.appendChild(input);
      row.appendChild(val);
      slidersBox.appendChild(row);
    }
  }

  function buildCards() {
    cardsBox.innerHTML = '';
    for (const c of CARDS[state.solidId] || []) {
      const card = el('div', 'exp-card');
      card.appendChild(el('div', 'exp-card-q', `${thought} ${c.q}`));
      const det = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = '显示结论';
      const body = el('div', 'exp-card-ans');
      det.appendChild(summary);
      det.appendChild(body);
      card.appendChild(det);
      card._ans = c.ans;
      card._body = body;
      cardsBox.appendChild(card);
    }
  }

  function buildTasks() {
    tasksBox.innerHTML = '';
    for (const t of TASKS) {
      const card = el('div', 'exp-task');
      const head = el('div', 'exp-task-head');
      head.appendChild(el('span', null, `${target} ${t.text}`));
      head.appendChild(el('span', 'exp-task-st', '未完成'));
      card.appendChild(head);
      card.appendChild(el('div', 'exp-task-live'));
      card._task = t;
      tasksBox.appendChild(card);
    }
  }

  // 参数变化 → 重建几何体 + viewer 联动 + 面板/卡片/任务刷新
  function update() {
    if (state.destroyed) return;
    const d = def();
    const p = state.params;
    deps.viewer?.setSolid?.(d.make(p));
    const m = measure(d.kind, p);

    measureBox.innerHTML = '';
    const addStat = (label, v) => {
      if (v == null) return;
      measureBox.appendChild(
        el('div', 'exp-mstat', `<strong>${fmt(v)}</strong><span>${label}</span>`),
      );
    };
    addStat('体积 V', m.volume);
    addStat('表面积 S', m.surface);
    addStat('侧面积 S侧', m.lateral);
    addStat(
      state.solidId === 'box' || state.solidId === 'cube' ? '体对角线 d' : '母线 l',
      m.diagonal != null ? m.diagonal : m.slant,
    );

    for (const card of cardsBox.children) {
      card._body.innerHTML = card._ans(p, m);
    }

    for (const card of tasksBox.children) {
      const t = card._task;
      const st = card.querySelector('.exp-task-st');
      const live = card.querySelector('.exp-task-live');
      const active = t.solid === state.solidId;
      const done = state.solved.has(t.id) || (active && t.done(p, m));
      if (done && !state.solved.has(t.id)) {
        state.solved.add(t.id);
        deps.audio?.playEarcon?.();
      }
      card.classList.toggle('done', done);
      st.textContent = done
        ? '✓ 已完成'
        : active
          ? '探究中'
          : `切换到${SOLIDS.find((s) => s.id === t.solid).name}`;
      live.textContent = active ? t.live(p, m) : '';
    }
  }

  selectSolid(state.solidId);

  const handle = {
    destroy() {
      if (state.destroyed) return;
      state.destroyed = true;
      root.remove();
      releaseStyle();
      if (current === handle) current = null;
    },
  };
  current = handle;
  return handle;
}

/** 销毁当前探究模式实例（等价于 initExplore 返回值的 destroy()）。 */
export function destroy() {
  current?.destroy();
}
