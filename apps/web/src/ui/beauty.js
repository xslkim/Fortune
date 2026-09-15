// 「几何之美」展示页：第三梯队获客内容，卡片流（标题 + 3D 联动 + 通俗讲解 + 可选语音 + 分享）。
// 独立自包含模块——不改动 app.js / index.html / viewer.js。
//
// 【给接线人】
//   import { initBeauty, destroy, BEAUTY_CSS } from './beauty.js';
//   const session = initBeauty(container, { viewer, audio });
//   - container：渲染容器（建议专门的 tab 页 div），模块只动 container 内部。
//   - deps.viewer：GeoViewer 实例（可选）。点卡片里的几何体名/「在 3D 区查看」会调
//     viewer.setSolid(...) 并 setSpin(true) 自转展示；viewer 缺失或抛错时自动降级（仅不出 3D 联动）。
//   - deps.audio：可选。卡片 🔊 按钮调 deps.audio.playVoice(id)（Promise 失败静默降级——
//     beauty 语音文件下一波才生成，现在点了不会报错）；destroy 时调 deps.audio.stopVoice?.()。
//   返回值 session 有 destroy()；也可直接调模块级 destroy() 销毁当前会话（切 tab 时调用）。
//   样式：init 时自动把 BEAUTY_CSS 注入 <style id="beauty-style">（destroy 时移除，注入幂等）。
//   本模块在 node（无 DOM）里 import 是安全的：所有 DOM 操作都在 initBeauty 内部。

import { cube, tetrahedron, octahedron, icosahedron, dodecahedron } from '@geo/core/geo/solids.js';
import { speaker } from './icons.js';

// ---------- 样式（自动注入；也可由接线人取 BEAUTY_CSS 自行放入 <style>） ----------

export const BEAUTY_CSS = `
.beauty-root { font-size: 16px; color: var(--text); }
.beauty-hero { text-align: center; padding: 18px 12px 6px; }
.beauty-hero h2 { font-size: 24px; margin: 0 0 8px; }
.beauty-hero p { color: var(--muted); font-size: 14px; line-height: 1.8; margin: 0 auto; max-width: 560px; }
.beauty-card {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--r-m);
  padding: 16px 18px; margin: 14px 0;
}
.beauty-card h3 { font-size: 18px; margin: 0; color: var(--brand); }
.beauty-card-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.beauty-card-text { font-size: 15px; line-height: 1.9; margin: 10px 0; }
.beauty-chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0 4px; }
.beauty-chip {
  min-height: 40px; padding: 0 14px; font-size: 14px; border-radius: var(--r-pill);
  border: 1px solid var(--border); background: var(--card); color: var(--text); cursor: pointer;
  transition: all .15s ease;
}
.beauty-chip:hover { border-color: var(--primary); color: var(--primary); }
.beauty-chip:active { transform: scale(.97); }
.beauty-chip.on { background: var(--primary); border-color: var(--primary); color: #fff; font-weight: 600; }
.beauty-hint { font-size: 13px; color: var(--muted); margin-top: 6px; }
.beauty-table { width: 100%; border-collapse: collapse; margin: 10px 0 4px; font-size: 14px; }
.beauty-table th, .beauty-table td { border: 1px solid var(--border); padding: 8px 6px; text-align: center; }
.beauty-table th { background: var(--card-alt); color: var(--muted); font-weight: 600; }
.beauty-table tbody tr { cursor: pointer; }
.beauty-table tbody tr:hover { background: color-mix(in srgb, var(--primary) 6%, var(--card)); }
.beauty-table td.beauty-ok { color: var(--success); font-weight: 600; }
.beauty-voice {
  min-height: 32px; padding: 0 12px; font-size: 13px; border-radius: var(--r-pill);
  border: 1px solid var(--border); background: var(--card-alt); color: var(--brand); cursor: pointer;
  transition: all .15s ease;
}
.beauty-voice:hover { border-color: var(--primary); }
.beauty-voice:active { transform: scale(.96); }
.beauty-actions { display: flex; align-items: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.beauty-share {
  min-height: 40px; padding: 0 16px; font-size: 14px; border-radius: var(--r-m);
  border: 1px solid var(--primary); background: var(--primary); color: #fff; cursor: pointer;
  transition: all .15s ease;
}
.beauty-share:hover { filter: brightness(.93); }
.beauty-share:active { transform: scale(.97); }
.beauty-view3d {
  min-height: 40px; padding: 0 16px; font-size: 14px; border-radius: var(--r-m);
  border: 1px solid var(--border); background: var(--card); color: var(--primary); cursor: pointer;
  transition: all .15s ease;
}
.beauty-view3d:hover { border-color: var(--primary); transform: translateY(-1px); box-shadow: var(--shadow); }
.beauty-view3d:active { transform: scale(.97); }
.beauty-toast { font-size: 13px; color: var(--success); opacity: 0; transition: opacity .2s; }
.beauty-toast.on { opacity: 1; }
.beauty-penrose-wrap { display: flex; justify-content: center; margin: 8px 0; }
.beauty-penrose { width: 220px; max-width: 70vw; }
.beauty-footer { text-align: center; padding: 8px 12px 20px; color: var(--muted); font-size: 14px; line-height: 1.8; }
@media (max-width: 720px) {
  .beauty-card { padding: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .beauty-chip, .beauty-voice, .beauty-share, .beauty-view3d { transition: none; }
}
`;

// ---------- 内容数据 ----------

const PHI_TEXT = '(1+√5)/2 ≈ 1.618';

export const PLATONIC_FIVE = [
  { id: 'tetrahedron', name: '正四面体', make: tetrahedron, V: 4, E: 6, F: 4, face: '正三角形 ×4' },
  { id: 'cube', name: '正方体（正六面体）', make: cube, V: 8, E: 12, F: 6, face: '正方形 ×6' },
  { id: 'octahedron', name: '正八面体', make: octahedron, V: 6, E: 12, F: 8, face: '正三角形 ×8' },
  {
    id: 'dodecahedron',
    name: '正十二面体',
    make: dodecahedron,
    V: 20,
    E: 30,
    F: 12,
    face: '正五边形 ×12',
  },
  {
    id: 'icosahedron',
    name: '正二十面体',
    make: icosahedron,
    V: 12,
    E: 30,
    F: 20,
    face: '正三角形 ×20',
  },
];

export const BEAUTY_HERO = {
  title: '几何之美',
  text: '这里没有刷题，只有五个让人忍不住想转给朋友的几何冷知识。每张卡片都能联动右边（或上方）的 3D 模型，还能点喇叭听讲解。',
  audio: 'beauty-1',
  share:
    '发现一个宝藏几何小站：正多面体全宇宙只有 5 种、足球是削了角的正二十面体、黄金分割直接藏在坐标里……每条都能转着 3D 模型看，特别适合给孩子磨几何直觉。',
};

export const BEAUTY_CARDS = [
  {
    id: 'platonic5',
    type: 'carousel',
    title: '正多面体，全宇宙只有 5 种',
    audio: ['beauty-2'],
    text: '所有面都是同一种正多边形、每个顶点地位都相同的多面体，叫正多面体。为什么只有 5 种？盯住一个顶点看：围拢在顶点处的面，内角加起来必须小于 360°（等于 360° 就摊成平面了）。正三角形内角 60°，一个顶点可以聚 3、4、5 个；正方形 90°，只能聚 3 个；正五边形 108°，只能聚 3 个；正六边形 120°，聚 3 个正好 360°——铺成地砖，立不起来。所以凑法到此为止：正四面体、正方体、正八面体、正十二面体、正二十面体，再没有第六种。点下面的名字，转一转这五位「天选之体」。',
    share:
      '你知道吗？正多面体全宇宙只有 5 种：正四、正六（正方体）、正八、正十二、正二十面体。因为每个顶点处内角和必须小于 360°，凑来凑去只有这 5 种凑法。数学的极致简洁，转一转 3D 模型就懂。',
  },
  {
    id: 'euler',
    type: 'euler',
    title: '欧拉公式：V − E + F = 2',
    audio: ['beauty-3', 'beauty-8'],
    text: '18 世纪，欧拉发现一个惊人的事实：任何凸多面体，顶点数减棱数加面数，恒等于 2。不管形状多拧巴，这个数雷打不动。下面把五种正多面体逐个数一遍——点任意一行，3D 模型就会换成它，你可以自己转着数。',
    share:
      '一个公式收编所有凸多面体：顶点数 − 棱数 + 面数 = 2。正方体 8−12+6=2，正二十面体 12−30+20=2。数学的美，就是用一行式子管无限多个形状。',
  },
  {
    id: 'soccer',
    type: 'solid',
    solid: 'icosahedron',
    title: '足球的秘密：削掉尖角的正二十面体',
    audio: ['beauty-4'],
    text: '经典足球有 32 块皮：12 块黑色五边形、20 块白色六边形。它的原型正是正二十面体——把 12 个顶点各削掉一小块，原来 20 个三角形面变成六边形，削出来的截面就是 12 个五边形。这个形状叫「截角二十面体」，碳分子 C60（富勒烯）也是同样的结构，建筑师还用它造穹顶。点下方按钮，在 3D 区看看它的原型。',
    share:
      '足球为什么是五边形加六边形？它其实是把正二十面体的 12 个尖角削掉后的样子：20 个三角形变六边形，12 个切口是五边形。连 C60 分子都长这样。几何，藏在每个孩子的脚下。',
  },
  {
    id: 'golden',
    type: 'solid',
    solid: 'dodecahedron',
    title: '黄金分割，藏在正十二面体的坐标里',
    audio: ['beauty-5'],
    text: `黄金比例 φ = ${PHI_TEXT}。正十二面体的 20 个顶点用坐标写出来，是 (±1, ±1, ±1)、(0, ±1/φ, ±φ) 以及它们的循环置换——φ 直接长在坐标里。道理不玄：正五边形的对角线与边长之比恰好是 φ，而十二面体的每个面都是正五边形。两千多年前柏拉图把这种多面体看作宇宙的象征，不是没有道理的。`,
    share:
      '正十二面体的顶点坐标里藏着黄金分割 φ≈1.618，因为正五边形的对角线恰好是边长的 φ 倍。两千年前柏拉图说它代表宇宙。美，原来可以被写进坐标。',
  },
  {
    id: 'penrose',
    type: 'penrose',
    title: '彩蛋：不可能的三角形',
    audio: ['beauty-6'],
    text: '上面这个「彭罗斯三角」，每一段看着都合理，合在一起却在三维世界里不可能存在——它只能活在纸上。1958 年数学家彭罗斯父子发表了它，后来成了埃舍尔那些不可能版画的灵感来源。它提醒我们：直觉会骗人，严谨的几何推理才是硬道理——这也是学几何真正的收获。',
    share:
      '这个三角形在三维世界根本造不出来，但你的眼睛信了。彭罗斯三角：局部都合理，整体不可能。几何课教的不只是算题，更是识破「眼见为实」的思维训练。',
  },
];

export const BEAUTY_FOOTER = {
  text: '几何不只是考试题，它是藏在足球、星空和建筑里的美。喜欢这个页面，就分享给朋友吧。',
  audio: 'beauty-7',
  share: BEAUTY_HERO.share,
};

// ---------- 会话 ----------

let current = null; // 当前会话（模块级 destroy() 用）

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

/** 初始化「几何之美」页面。返回会话句柄 { destroy() }。 */
export function initBeauty(container, deps = {}) {
  if (current) current.destroy();
  const session = createSession(container, deps);
  current = session;
  return session;
}

/** 销毁当前会话（切 tab 时由接线人调用）。 */
export function destroy() {
  if (current) {
    current.destroy();
    current = null;
  }
}

// ---------- 彭罗斯三角（2D SVG 示意：三个弯梁 + 交替斜接阴影制造矛盾感） ----------

const SVG_NS = 'http://www.w3.org/2000/svg';

function penroseSvg() {
  const cx = 110,
    cy = 104,
    R = 92,
    r = 42;
  const at = (rad, i) => {
    const t = ((-90 + 120 * i) * Math.PI) / 180;
    return [cx + rad * Math.cos(t), cy + rad * Math.sin(t)];
  };
  const O = [at(R, 0), at(R, 1), at(R, 2)]; // 外三角
  const I = [at(r, 0), at(r, 1), at(r, 2)]; // 内三角
  const mid = (A, i) => [(A[i][0] + A[(i + 1) % 3][0]) / 2, (A[i][1] + A[(i + 1) % 3][1]) / 2];
  const mO = [mid(O, 0), mid(O, 1), mid(O, 2)]; // 各边中点（外圈）
  const mI = [mid(I, 0), mid(I, 1), mid(I, 2)]; // 各边中点（内圈）
  const fmt = (pts) => pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 220 208');
  svg.setAttribute('class', 'beauty-penrose');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '彭罗斯三角示意图');

  // 每个角上一根弯梁（chevron），劈成两臂并交替明暗——三梁无法一致配色，矛盾感由此而来
  const shades = ['#b8c6dc', '#5b7ba6', '#8aa3c4'];
  for (let i = 0; i < 3; i++) {
    const prev = (i + 2) % 3;
    const armIn = [mO[prev], O[i], I[i], mI[prev]];
    const armOut = [O[i], mO[i], mI[i], I[i]];
    const p1 = document.createElementNS(SVG_NS, 'polygon');
    p1.setAttribute('points', fmt(armIn));
    p1.setAttribute('fill', shades[i]);
    p1.setAttribute('stroke', '#274156');
    p1.setAttribute('stroke-width', '1.5');
    const p2 = document.createElementNS(SVG_NS, 'polygon');
    p2.setAttribute('points', fmt(armOut));
    p2.setAttribute('fill', shades[(i + 1) % 3]);
    p2.setAttribute('stroke', '#274156');
    p2.setAttribute('stroke-width', '1.5');
    svg.appendChild(p1);
    svg.appendChild(p2);
  }
  return svg;
}

// ---------- 会话实现 ----------

function createSession(container, deps) {
  let styleEl = null;
  let toastTimer = 0;
  let destroyed = false;

  if (!document.getElementById('beauty-style')) {
    styleEl = document.createElement('style');
    styleEl.id = 'beauty-style';
    styleEl.textContent = BEAUTY_CSS;
    document.head.appendChild(styleEl);
  }

  const root = el('div', 'beauty-root');
  container.innerHTML = '';
  container.appendChild(root);

  // viewer 联动（可选，全部 try/catch 静默降级）
  function viewSolid(make, btn, group) {
    const v = deps.viewer;
    if (v && typeof v.setSolid === 'function') {
      try {
        v.setSolid(make());
        if (typeof v.setSpin === 'function') v.setSpin(true);
      } catch {
        /* viewer 不可用时静默 */
      }
    }
    if (group) {
      for (const b of group.querySelectorAll('.beauty-chip')) b.classList.remove('on');
      if (btn) btn.classList.add('on');
    }
  }

  // 语音播放（音频文件可能尚未生成：Promise 拒绝时静默降级，不报错）
  function playVoice(id) {
    try {
      const p = deps.audio?.playVoice?.(id);
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
      /* 静默 */
    }
  }

  function voiceButtons(ids, host) {
    for (const id of ids) {
      const b = el('button', 'beauty-voice');
      b.innerHTML = `${speaker} 听讲解`;
      b.addEventListener('click', () => playVoice(id));
      host.appendChild(b);
    }
  }

  // 分享：复制文案（clipboard API，降级 textarea + execCommand）
  function copyText(text, done) {
    const fallback = () => {
      let ok = false;
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        /* 静默 */
      }
      done(ok);
    };
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text).then(() => done(true), fallback);
      } else fallback();
    } catch {
      fallback();
    }
  }

  function shareRow(shareText) {
    const row = el('div', 'beauty-actions');
    const btn = el('button', 'beauty-share', '分享灵感');
    const toast = el('span', 'beauty-toast', '');
    btn.addEventListener('click', () => {
      copyText(shareText, (ok) => {
        if (destroyed) return;
        toast.textContent = ok ? '已复制文案，去粘贴分享吧 ✓' : '复制失败，请手动长按选择文字';
        toast.classList.add('on');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('on'), 2000);
      });
    });
    row.appendChild(btn);
    row.appendChild(toast);
    return row;
  }

  // ---------- 页头 ----------
  function renderHero() {
    const hero = el('div', 'beauty-hero');
    const head = el('div', 'beauty-card-head');
    head.style.justifyContent = 'center';
    head.appendChild(el('h2', null, BEAUTY_HERO.title));
    voiceButtons([BEAUTY_HERO.audio], head);
    hero.appendChild(head);
    hero.appendChild(el('p', null, BEAUTY_HERO.text));
    const share = shareRow(BEAUTY_HERO.share);
    share.style.justifyContent = 'center';
    hero.appendChild(share);
    root.appendChild(hero);
  }

  // ---------- 卡片 ----------
  function cardShell(card) {
    const sec = el('section', 'beauty-card');
    const head = el('div', 'beauty-card-head');
    head.appendChild(el('h3', null, card.title));
    voiceButtons(card.audio || [], head);
    sec.appendChild(head);
    return sec;
  }

  function renderCarousel(card) {
    const sec = cardShell(card);
    const chips = el('div', 'beauty-chips');
    PLATONIC_FIVE.forEach((s, i) => {
      const chip = el('button', 'beauty-chip' + (i === 0 ? ' on' : ''), s.name);
      chip.addEventListener('click', () => viewSolid(s.make, chip, chips));
      chips.appendChild(chip);
    });
    sec.appendChild(chips);
    sec.appendChild(el('p', 'beauty-hint', '点名字可在 3D 区切换模型，自转展示。'));
    sec.appendChild(el('p', 'beauty-card-text', card.text));
    sec.appendChild(shareRow(card.share));
    root.appendChild(sec);
    // 入场即展示正四面体
    viewSolid(PLATONIC_FIVE[0].make);
  }

  function renderEuler(card) {
    const sec = cardShell(card);
    const table = el('table', 'beauty-table');
    const thead = el('tr');
    for (const h of ['正多面体', '面 F', '棱 E', '顶点 V', 'V − E + F'])
      thead.appendChild(el('th', null, h));
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    for (const s of PLATONIC_FIVE) {
      const tr = document.createElement('tr');
      tr.appendChild(el('td', null, s.name));
      tr.appendChild(el('td', null, `${s.F}（${s.face}）`));
      tr.appendChild(el('td', null, String(s.E)));
      tr.appendChild(el('td', null, String(s.V)));
      tr.appendChild(el('td', 'beauty-ok', `${s.V} − ${s.E} + ${s.F} = 2 ✓`));
      // 可点行：补键盘支持（Enter/Space 同点击），tr 不能改 button 故用 ARIA 语义
      tr.tabIndex = 0;
      tr.setAttribute('role', 'button');
      tr.setAttribute('aria-label', `在 3D 区查看${s.name}`);
      tr.addEventListener('click', () => viewSolid(s.make));
      tr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          viewSolid(s.make);
        }
      });
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    sec.appendChild(table);
    sec.appendChild(el('p', 'beauty-hint', '点表格任意一行，3D 区会换成对应模型。'));
    sec.appendChild(el('p', 'beauty-card-text', card.text));
    sec.appendChild(shareRow(card.share));
    root.appendChild(sec);
  }

  function renderSolidCard(card) {
    const sec = cardShell(card);
    const s = PLATONIC_FIVE.find((x) => x.id === card.solid);
    const row = el('div', 'beauty-actions');
    const btn = el('button', 'beauty-view3d', `在 3D 区查看：${s.name} ▶`);
    btn.addEventListener('click', () => viewSolid(s.make));
    row.appendChild(btn);
    sec.appendChild(row);
    sec.appendChild(el('p', 'beauty-card-text', card.text));
    sec.appendChild(shareRow(card.share));
    root.appendChild(sec);
  }

  function renderPenrose(card) {
    const sec = cardShell(card);
    const wrap = el('div', 'beauty-penrose-wrap');
    wrap.appendChild(penroseSvg());
    sec.appendChild(wrap);
    sec.appendChild(el('p', 'beauty-card-text', card.text));
    sec.appendChild(shareRow(card.share));
    root.appendChild(sec);
  }

  function renderFooter() {
    const footer = el('div', 'beauty-footer');
    const head = el('div', 'beauty-card-head');
    head.style.justifyContent = 'center';
    voiceButtons([BEAUTY_FOOTER.audio], head);
    footer.appendChild(head);
    footer.appendChild(el('p', null, BEAUTY_FOOTER.text));
    const share = shareRow(BEAUTY_FOOTER.share);
    share.style.justifyContent = 'center';
    footer.appendChild(share);
    root.appendChild(footer);
  }

  renderHero();
  for (const card of BEAUTY_CARDS) {
    if (card.type === 'carousel') renderCarousel(card);
    else if (card.type === 'euler') renderEuler(card);
    else if (card.type === 'penrose') renderPenrose(card);
    else renderSolidCard(card);
  }
  renderFooter();

  const session = {
    destroy() {
      destroyed = true;
      clearTimeout(toastTimer);
      try {
        deps.audio?.stopVoice?.();
      } catch {
        /* 静默 */
      }
      container.innerHTML = '';
      if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      if (current === session) current = null;
    },
  };
  return session;
}
