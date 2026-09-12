// 「展开图闯关」游戏视图：独立自包含模块，由接线人在 app.js 注册为新 tab。
//
// 给接线人的接口说明：
//   import { initNetGame, destroy, NETGAME_CSS } from './netgame.js';
//   const session = initNetGame(container, deps);
//   - container：游戏渲染容器（建议用 #panel 或专门的 tab 页 div），模块只动 container 内部。
//   - deps.viewer：GeoViewer 实例（可选）。答对后若有 viewer 会播放正方体「展开→折叠」演示；
//     viewer 缺失或抛错时自动降级（只出结果，不影响游戏）。
//   - deps.audio：可选，答对时调用 deps.audio?.playEarcon?.()（try/catch 包裹）。
//   - deps.seed：可选，关卡种子（缺省 20260913，固定种子保证 15 关可复现）。
//   返回值 session 有 destroy()；也可直接调模块级 destroy() 销毁当前会话（切 tab 时调用）。
//   样式：模块 init 时自动把 NETGAME_CSS 注入 <style id="ng-style">（destroy 时移除）；
//   若接线人想自行管理样式，也可取 NETGAME_CSS 字符串并入全局样式表，注入是幂等的可忽略。
//   进度：每关最佳星级存 localStorage 键 'gt_netgame_v1'（只写这一个键，读写带 try/catch）。
import { cube } from '../geo/solids.js';
import { generateLevels, analyzeNet, LEVEL_COUNT } from '../data/netgame.js';

export const NETGAME_CSS = `
.ng-root { font-size: 16px; color: #1f2d3d; }
.ng-title { font-size: 20px; margin-bottom: 12px; }
.ng-muted { color: #8a97a8; font-size: 13px; }
.ng-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.ng-head h2 { font-size: 19px; margin: 0; }
.ng-spacer { flex: 1; }
.ng-btn {
  min-height: 44px; padding: 0 18px; font-size: 15px; border-radius: 10px;
  border: 1px solid #c3cfdf; background: #fff; color: #1f2d3d; cursor: pointer;
}
.ng-btn:disabled { opacity: .4; cursor: default; }
.ng-btn-primary { background: #2f6fdd; border-color: #2f6fdd; color: #fff; }
.ng-btn-ghost { border: none; background: none; color: #2f6fdd; padding: 0 8px; }
.ng-timer { font-size: 15px; font-weight: 600; color: #1f3a5f; min-width: 64px; text-align: right; }
.ng-timer.ng-low { color: #e8491d; }
.ng-stars { color: #f0a500; letter-spacing: 2px; font-size: 15px; }
.ng-stars .ng-off { color: #d5dce6; }
.ng-level-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 10px; }
.ng-level-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  min-height: 44px; padding: 12px 8px; border-radius: 12px; cursor: pointer;
  background: #f4f7fb; border: 1px solid #dde4ee; font-size: 15px;
}
.ng-level-card:hover { background: #e8eff9; border-color: #b9cbe4; }
.ng-level-card .ng-type { font-size: 12px; color: #8a97a8; }
.ng-prompt { font-size: 16px; line-height: 1.7; margin: 10px 0 12px; }
.ng-net-wrap { display: flex; justify-content: center; margin: 8px 0 14px; }
.ng-net { background: #f8fafd; border: 1px solid #dde4ee; border-radius: 12px; }
.ng-cell { fill: #fff; stroke: #274156; stroke-width: 2; }
.ng-cell-marked { fill: #ffe1c2; stroke: #e8491d; }
.ng-cell-overlap { fill: #f8d7da; stroke: #9c1c24; }
.ng-cell-picked { fill: #dbe7fb; stroke: #2f6fdd; }
.ng-cell-num { font-size: 15px; font-weight: 600; fill: #274156; text-anchor: middle; dominant-baseline: central; }
.ng-cell-mark { font-size: 17px; text-anchor: middle; dominant-baseline: central; }
.ng-options { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
.ng-options-row { flex-direction: row; flex-wrap: wrap; }
.ng-options-row .ng-btn { flex: 1; min-width: 120px; }
.ng-pick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
.ng-pick-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px; border-radius: 12px; cursor: pointer;
  background: #fff; border: 2px solid #c3cfdf;
}
.ng-pick-card:hover:not(.ng-locked) { border-color: #2f6fdd; background: #f0f5fc; }
.ng-pick-card.ng-correct { border-color: #2d6a4f; background: #d8f3dc; }
.ng-pick-card.ng-wrong { border-color: #9c1c24; background: #f8d7da; }
.ng-pick-card.ng-locked { cursor: default; }
.ng-pick-label { font-weight: 600; color: #1f3a5f; }
.ng-hint-box {
  margin-top: 12px; padding: 10px 14px; border-radius: 10px; font-size: 14px; line-height: 1.7;
  background: #fff7e6; border: 1px solid #f2d9a4;
}
.ng-result { margin-top: 14px; padding: 10px 14px; border-radius: 10px; font-size: 15px; line-height: 1.7; }
.ng-result.ng-ok { background: #d8f3dc; color: #2d6a4f; }
.ng-result.ng-no { background: #f8d7da; color: #9c1c24; }
.ng-result .ng-big { font-size: 18px; font-weight: 600; }
.ng-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.ng-demo-note { margin-top: 10px; }
@media (max-width: 720px) {
  .ng-pick-grid { grid-template-columns: 1fr 1fr; }
  .ng-level-grid { grid-template-columns: repeat(3, 1fr); }
}
`;

const SVG_NS = 'http://www.w3.org/2000/svg';
const STORE_KEY = 'gt_netgame_v1';
const PICK_LABELS = ['A', 'B', 'C', 'D'];

let current = null; // 当前会话（模块级 destroy() 用）

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function loadStars() {
  try {
    const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (Array.isArray(v)) return Array.from({ length: LEVEL_COUNT }, (_, i) => Number(v[i]) || 0);
  } catch { /* 存储不可用时静默 */ }
  return new Array(LEVEL_COUNT).fill(0);
}

function saveStars(stars) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(stars)); } catch { /* 静默 */ }
}

/** 画一张展开图 SVG。opts: { cell, numbers, marked(格下标), overlap([i,j]) } */
function netSvg(cells, opts = {}) {
  const cs = opts.cell || 44;
  const w = Math.max(...cells.map((c) => c[0])) + 1;
  const h = Math.max(...cells.map((c) => c[1])) + 1;
  const pad = 8;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w * cs + pad * 2} ${h * cs + pad * 2}`);
  svg.setAttribute('class', 'ng-net');
  svg.style.width = `${Math.min(w * cs + pad * 2, 320)}px`;
  const overlapSet = new Set(opts.overlap || []);
  cells.forEach(([x, y], i) => {
    const r = document.createElementNS(SVG_NS, 'rect');
    r.setAttribute('x', pad + x * cs + 1);
    r.setAttribute('y', pad + y * cs + 1);
    r.setAttribute('width', cs - 2);
    r.setAttribute('height', cs - 2);
    let cls = 'ng-cell';
    if (i === opts.marked) cls += ' ng-cell-marked';
    if (overlapSet.has(i)) cls += ' ng-cell-overlap';
    r.setAttribute('class', cls);
    svg.appendChild(r);
    if (opts.numbers !== false) {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('x', pad + x * cs + cs / 2);
      t.setAttribute('y', pad + y * cs + cs / 2);
      t.setAttribute('class', 'ng-cell-num');
      t.textContent = String(i + 1);
      svg.appendChild(t);
    }
    if (i === opts.marked) {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('x', pad + x * cs + cs - 12);
      t.setAttribute('y', pad + y * cs + 12);
      t.setAttribute('class', 'ng-cell-mark');
      t.textContent = '★';
      svg.appendChild(t);
    }
  });
  return svg;
}

/**
 * 初始化游戏。返回会话句柄 { destroy() }。
 */
export function initNetGame(container, deps = {}) {
  if (current) current.destroy();
  const session = createSession(container, deps);
  current = session;
  return session;
}

/** 销毁当前会话（切 tab 时由接线人调用）。 */
export function destroy() {
  if (current) { current.destroy(); current = null; }
}

function createSession(container, deps) {
  const levels = generateLevels(Number.isInteger(deps.seed) ? deps.seed : undefined);
  const stars = loadStars();
  let styleEl = null;
  let timerId = 0;
  let animToken = 0;
  let destroyed = false;

  // 注入样式（幂等：若接线人已并入全局样式，跳过）
  if (!document.getElementById('ng-style')) {
    styleEl = document.createElement('style');
    styleEl.id = 'ng-style';
    styleEl.textContent = NETGAME_CSS;
    document.head.appendChild(styleEl);
  }

  const root = el('div', 'ng-root');
  container.innerHTML = '';
  container.appendChild(root);

  function starsText(n) {
    let s = '';
    for (let i = 0; i < 3; i++) s += i < n ? '★' : '☆';
    return s;
  }

  function starsSpan(n) {
    const s = el('span', 'ng-stars');
    s.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const c = el('span', i < n ? null : 'ng-off', '★');
      s.appendChild(c);
    }
    return s;
  }

  // ---------- 选关页 ----------

  function renderSelect() {
    stopTimer();
    root.innerHTML = '';
    root.appendChild(el('h2', 'ng-title', '展开图闯关'));
    const total = stars.reduce((a, b) => a + b, 0);
    root.appendChild(el('p', 'ng-muted',
      `正方体展开图共 11 种，闯过 15 关把它们全部看穿！已获 ${total} / ${LEVEL_COUNT * 3} 星。每关三星：答对 ★、不看提示 ★、限时内答对 ★。`));
    const grid = el('div', 'ng-level-grid');
    levels.forEach((lv, i) => {
      const card = el('button', 'ng-level-card');
      card.appendChild(el('strong', null, `第 ${i + 1} 关`));
      card.appendChild(el('span', 'ng-type', lv.typeName));
      card.appendChild(starsSpan(stars[i]));
      card.addEventListener('click', () => renderLevel(i));
      grid.appendChild(card);
    });
    root.appendChild(grid);
  }

  // ---------- 关卡页 ----------

  let levelState = null;

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = 0; }
  }

  function renderLevel(idx) {
    stopTimer();
    animToken++;
    const lv = levels[idx];
    levelState = { idx, lv, hintUsed: false, answered: false, start: Date.now() };

    root.innerHTML = '';
    const head = el('div', 'ng-head');
    const back = el('button', 'ng-btn ng-btn-ghost', '← 选关');
    back.addEventListener('click', renderSelect);
    head.appendChild(back);
    head.appendChild(el('h2', null, lv.title));
    head.appendChild(el('span', 'ng-spacer'));
    if (stars[idx] > 0) head.appendChild(starsSpan(stars[idx]));
    const timer = el('span', 'ng-timer', `${lv.timeLimit}s`);
    head.appendChild(timer);
    root.appendChild(head);

    // 题干与作答区
    if (lv.type === 'judge') {
      root.appendChild(el('p', 'ng-prompt', '下面这个由 6 个正方形组成的图形，能折成一个正方体吗？'));
      root.appendChild(wrapNet(netSvg(lv.cells)));
      const opts = el('div', 'ng-options ng-options-row');
      const yes = el('button', 'ng-btn ng-btn-primary', '能折成 ✓');
      const no = el('button', 'ng-btn', '折不成 ✗');
      yes.addEventListener('click', () => answerJudge(true, [yes, no]));
      no.addEventListener('click', () => answerJudge(false, [yes, no]));
      opts.appendChild(yes); opts.appendChild(no);
      root.appendChild(opts);
    } else if (lv.type === 'opposite') {
      root.appendChild(el('p', 'ng-prompt',
        `下面是一个正方体的展开图。折成正方体后，与 ★ 标记的格 ${lv.marked + 1} 相对的是哪一格？`));
      root.appendChild(wrapNet(netSvg(lv.cells, { marked: lv.marked })));
      const opts = el('div', 'ng-options ng-options-row');
      const buttons = lv.options.map((cellIdx) => {
        const b = el('button', 'ng-btn', `格 ${cellIdx + 1}`);
        b.addEventListener('click', () => answerOpposite(cellIdx, buttons));
        return b;
      });
      buttons.forEach((b) => opts.appendChild(b));
      root.appendChild(opts);
    } else {
      root.appendChild(el('p', 'ng-prompt', '下面 4 个图形中，只有 1 个能折成正方体。把它找出来！'));
      const grid = el('div', 'ng-pick-grid');
      const cards = lv.options.map((cells, i) => {
        const card = el('button', 'ng-pick-card');
        card.appendChild(el('span', 'ng-pick-label', PICK_LABELS[i]));
        card.appendChild(netSvg(cells, { cell: 34, numbers: false }));
        card.addEventListener('click', () => answerPick(i, cards));
        grid.appendChild(card);
        return card;
      });
      root.appendChild(grid);
    }

    // 提示（看了就失去提示星）
    const hintBtn = el('button', 'ng-btn ng-btn-ghost', '💡 提示（会失去一颗星）');
    hintBtn.addEventListener('click', () => {
      if (levelState.answered || levelState.hintUsed) return;
      levelState.hintUsed = true;
      hintBtn.disabled = true;
      root.insertBefore(el('div', 'ng-hint-box', lv.hint), hintBtn.nextSibling);
    });
    const hintRow = el('div', 'ng-actions');
    hintRow.appendChild(hintBtn);
    root.appendChild(hintRow);

    // 限时倒计时（超时只失去时间星，不判负）
    timerId = setInterval(() => {
      const left = lv.timeLimit - (Date.now() - levelState.start) / 1000;
      if (levelState.answered) { stopTimer(); return; }
      timer.textContent = left > 0 ? `${Math.ceil(left)}s` : '超时';
      timer.classList.toggle('ng-low', left <= 5);
    }, 250);
  }

  function wrapNet(svg) {
    const w = el('div', 'ng-net-wrap');
    w.appendChild(svg);
    return w;
  }

  // ---------- 作答与结算 ----------

  function elapsedSec() {
    return (Date.now() - levelState.start) / 1000;
  }

  function settle(correct, detailHtml) {
    const { idx, lv } = levelState;
    levelState.answered = true;
    stopTimer();
    animToken++;

    let earned = 0;
    if (correct) {
      earned = 1 + (levelState.hintUsed ? 0 : 1) + (elapsedSec() <= lv.timeLimit ? 1 : 0);
      if (earned > stars[idx]) { stars[idx] = earned; saveStars(stars); }
      try { deps.audio?.playEarcon?.(); } catch { /* 音频不可用时静默 */ }
    }

    const box = el('div', `ng-result ${correct ? 'ng-ok' : 'ng-no'}`);
    const head = el('div', 'ng-big', correct ? `✓ 回答正确！ ${starsText(earned)}` : '✗ 回答错误');
    box.appendChild(head);
    if (detailHtml) box.appendChild(el('div', null, detailHtml));
    if (correct) {
      const notes = [];
      if (levelState.hintUsed) notes.push('看了提示，提示星未获得');
      if (elapsedSec() > lv.timeLimit) notes.push(`超过 ${lv.timeLimit} 秒，时间星未获得`);
      if (notes.length) box.appendChild(el('div', null, notes.join('；') + '，重玩本关可补星。'));
    }
    root.appendChild(box);

    const actions = el('div', 'ng-actions');
    const retry = el('button', 'ng-btn', '重玩本关');
    retry.addEventListener('click', () => renderLevel(idx));
    actions.appendChild(retry);
    if (idx < LEVEL_COUNT - 1) {
      const next = el('button', 'ng-btn ng-btn-primary', '下一关 →');
      next.addEventListener('click', () => renderLevel(idx + 1));
      actions.appendChild(next);
    }
    const back = el('button', 'ng-btn ng-btn-ghost', '返回选关');
    back.addEventListener('click', renderSelect);
    actions.appendChild(back);
    root.appendChild(actions);

    if (correct) playFoldDemo();
  }

  function answerJudge(pickedYes, buttons) {
    if (levelState.answered) return;
    buttons.forEach((b) => { b.disabled = true; });
    const lv = levelState.lv;
    const correct = pickedYes === lv.answer;
    let detail;
    if (lv.answer) {
      detail = '这个图形是正方体的 11 种合法展开图之一，可以折成正方体。';
    } else {
      const a = analyzeNet(lv.cells);
      if (a.reason === 'overlap' && a.overlap) {
        detail = `折不成：格 ${a.overlap[0] + 1} 和格 ${a.overlap[1] + 1} 折起后会重叠到同一个面（上图中已标红）。`;
        root.querySelector('.ng-net-wrap').replaceWith(
          wrapNet(netSvg(lv.cells, { overlap: a.overlap })));
      } else {
        detail = '折不成：图形中存在环绕结构（如「田」字块），折起时面的朝向会自相矛盾。';
      }
    }
    settle(correct, detail);
  }

  function answerOpposite(cellIdx, buttons) {
    if (levelState.answered) return;
    const lv = levelState.lv;
    buttons.forEach((b) => { b.disabled = true; });
    lv.options.forEach((o, i) => {
      if (o === lv.answer) buttons[i].classList.add('ng-btn-primary');
    });
    const correct = cellIdx === lv.answer;
    settle(correct,
      `格 ${lv.marked + 1} 折起后与格 ${lv.answer + 1} 朝向正好相反，是一对相对面。`);
  }

  function answerPick(picked, cards) {
    if (levelState.answered) return;
    const lv = levelState.lv;
    cards.forEach((c, i) => {
      c.classList.add('ng-locked');
      if (i === lv.answer) c.classList.add('ng-correct');
      else if (i === picked) c.classList.add('ng-wrong');
    });
    const correct = picked === lv.answer;
    let detail = `答案是 ${PICK_LABELS[lv.answer]}。`;
    if (!correct) {
      const a = analyzeNet(lv.options[picked]);
      if (a.reason === 'conflict') detail += ` ${PICK_LABELS[picked]} 含「田」字块式的环绕结构，必折不成。`;
      else if (a.reason === 'overlap' && a.overlap) detail += ` ${PICK_LABELS[picked]} 折起后有两格会重叠到同一个面。`;
    }
    settle(correct, detail);
  }

  // ---------- viewer 折叠演示（可选，带降级） ----------

  function playFoldDemo() {
    const v = deps.viewer;
    if (!v || typeof v.setSolid !== 'function' || typeof v.setUnfold !== 'function') return;
    let raf = 0;
    try {
      v.setSolid(cube());
      if (typeof v.canUnfold === 'function' && !v.canUnfold()) return;
      if (typeof v.setSpin === 'function') v.setSpin(false);
      const token = ++animToken;
      const start = performance.now();
      const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2);
      v.setUnfold(1); // 从完全展开开始
      const frame = (now) => {
        if (destroyed || token !== animToken) return;
        const k = Math.min(1, (now - start) / 900);
        v.setUnfold(1 - ease(k)); // 展开 → 折叠
        if (k < 1) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      root.appendChild(el('p', 'ng-muted ng-demo-note', '▶ 3D 区域正在演示：展开图折成正方体。'));
    } catch {
      if (raf) cancelAnimationFrame(raf); // viewer 不可用时静默降级
    }
  }

  renderSelect();

  const session = {
    destroy() {
      destroyed = true;
      animToken++;
      stopTimer();
      container.innerHTML = '';
      if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      if (current === session) current = null;
    },
  };
  return session;
}
