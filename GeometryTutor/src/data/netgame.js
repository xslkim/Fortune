// 「展开图闯关」核心题库引擎：正方体展开图（6 格连方 / hexomino）的生成、判定与关卡生成。
// 纯 JS、无 DOM/three 依赖，可在 node 里单测。
//
// 11 种合法展开图不是硬编码的：从 cube() 的真实面邻接图出发，枚举面生成树（12 条棱取 5 条
// 且连通），沿树做组合式展开（每面维护整数 3D 朝向帧 {r,u,n}，子面按共享棱方向排到平面网格），
// 丢弃摊平时格子重叠的树，再按旋转/镜像（二面体群 D4，8 种对称）去重——恰好剩 11 种。
//
// 判定器 analyzeNet：给网格每格 BFS 赋折叠朝向帧；绕圈赋值冲突、或两格法线相同（折起后重叠）
// 即非法。相对面 = 折叠后法线相反的两格。

import { cube } from '../geo/solids.js';
import { buildEdges, faceNormal, faceCenter, normFace } from '../geo/topology.js';

// ---------- 整数 3 向量小工具（朝向帧分量都是 ±单位轴，全程整数运算） ----------

const vneg = (a) => [-a[0], -a[1], -a[2]];
const vdoti = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vcrossi = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const veq = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
const round3 = (a) => a.map((v) => Math.round(v));

// ---------- 网格与折叠 ----------

/** 4-邻接方向：网格 +x 为东、+y 为北。 */
export const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

const cellKey = (x, y) => `${x},${y}`;

/**
 * 折叠规则：已知某格朝向帧 {r,u,n}（右/上/法线，右手系 cross(r,u)=n），
 * 求其东侧/西侧/北侧/南侧相邻格折起 90° 后的朝向帧。
 * 推导：东侧格的法线 = 本格的 r（折起后它绕共享棱(u 方向)翻起），依此类推。
 */
function foldFrame(f, dx, dy) {
  if (dx === 1) return { r: vneg(f.n), u: f.u, n: f.r };
  if (dx === -1) return { r: f.n, u: f.u, n: vneg(f.r) };
  if (dy === 1) return { r: f.r, u: vneg(f.n), n: f.u };
  return { r: f.r, u: f.n, n: vneg(f.u) };
}

/** 归一化：平移使 min x = min y = 0，按 [x,y] 字典序排序。 */
export function normalizeCells(cells) {
  const mx = Math.min(...cells.map((c) => c[0]));
  const my = Math.min(...cells.map((c) => c[1]));
  return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

/** D4 全部 8 种旋转/镜像变换。 */
function d4Transforms(cells) {
  const out = [];
  for (const [a, b, c, d] of [
    [1, 0, 0, 1], [0, -1, 1, 0], [-1, 0, 0, -1], [0, 1, -1, 0], // 旋转 0/90/180/270
    [-1, 0, 0, 1], [1, 0, 0, -1], [0, 1, 1, 0], [0, -1, -1, 0], // 镜像 × 旋转
  ]) {
    out.push(cells.map(([x, y]) => [a * x + b * y, c * x + d * y]));
  }
  return out;
}

/** 同构规范形：8 种对称变换归一化后取字典序最小者的字符串 key。 */
export function canonicalKey(cells) {
  return d4Transforms(cells)
    .map((t) => JSON.stringify(normalizeCells(t)))
    .sort()[0];
}

/** 6 格是否 4-连通。 */
function isConnected(cells) {
  const set = new Set(cells.map(([x, y]) => cellKey(x, y)));
  const seen = new Set([cellKey(cells[0][0], cells[0][1])]);
  const stack = [cells[0]];
  while (stack.length) {
    const [x, y] = stack.pop();
    for (const [dx, dy] of DIRS) {
      const k = cellKey(x + dx, y + dy);
      if (set.has(k) && !seen.has(k)) { seen.add(k); stack.push([x + dx, y + dy]); }
    }
  }
  return seen.size === cells.length;
}

/**
 * 展开图判定器（带诊断信息）。
 * cells: [[x,y],...]，应为 6 格连方。
 * 返回 {
 *   ok,                  // 能否折成正方体
 *   reason,              // 'ok' | 'not-six' | 'disconnected' | 'conflict' | 'overlap'
 *   frames,              // 每格的折叠朝向帧 {r,u,n}（非法时为部分赋值）
 *   overlap: [i,j]|null, // 折起后重叠到同一面的两格下标（reason='overlap' 时给出）
 * }
 */
export function analyzeNet(cells) {
  const bad = (reason, frames = [], overlap = null) => ({ ok: false, reason, frames, overlap });
  if (!Array.isArray(cells) || cells.length !== 6) return bad('not-six');
  if (new Set(cells.map(([x, y]) => cellKey(x, y))).size !== 6) return bad('not-six');
  if (!isConnected(cells)) return bad('disconnected');

  const index = new Map(cells.map(([x, y], i) => [cellKey(x, y), i]));
  const frames = new Array(6).fill(null);
  frames[0] = { r: [1, 0, 0], u: [0, 1, 0], n: [0, 0, 1] };
  const queue = [0];
  while (queue.length) {
    const i = queue.shift();
    const [x, y] = cells[i];
    for (const [dx, dy] of DIRS) {
      const j = index.get(cellKey(x + dx, y + dy));
      if (j == null) continue;
      const f = foldFrame(frames[i], dx, dy);
      if (!frames[j]) { frames[j] = f; queue.push(j); }
      else if (!veq(frames[j].n, f.n) || !veq(frames[j].r, f.r)) {
        // 绕网格圈走一圈朝向对不上（任何 2D 环都会折断折叠，如田字格）
        return bad('conflict', frames);
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    for (let j = i + 1; j < 6; j++) {
      if (veq(frames[i].n, frames[j].n)) return bad('overlap', frames, [i, j]);
    }
  }
  return { ok: true, reason: 'ok', frames, overlap: null };
}

/** 能否折成正方体。 */
export function canFold(cells) {
  return analyzeNet(cells).ok;
}

/** 折叠朝向帧数组（非法返回 null）。 */
export function foldNet(cells) {
  const a = analyzeNet(cells);
  return a.ok ? a.frames : null;
}

/** 格 i 与格 j 是否相对面（折叠后法线相反）。展开图非法时返回 false。 */
export function isOpposite(cells, i, j) {
  const frames = foldNet(cells);
  if (!frames) return false;
  return veq(frames[i].n, vneg(frames[j].n));
}

/** 格 i 的相对面下标（非法展开图返回 -1）。 */
export function oppositeOf(cells, i) {
  const frames = foldNet(cells);
  if (!frames) return -1;
  return frames.findIndex((f, j) => j !== i && veq(f.n, vneg(frames[i].n)));
}

// ---------- 11 种合法展开图的程序化生成 ----------

let _netsCache = null;

/**
 * 生成正方体全部合法展开图（按旋转/镜像同构去重），返回 [{ cells, key }]。
 * cells 已归一化排序（格号 = 下标 + 1）。
 * 方法：枚举 cube() 面邻接图的生成树 → 组合展开成平面网格 → 丢弃重叠 → D4 去重。
 * 结果恰为 11 种（tests/netgame.test.mjs 断言）。
 */
export function cubeNets() {
  if (_netsCache) return _netsCache;
  const g = cube();
  const pts = g.points;
  const faces = g.faces.map(normFace);
  const F = faces.length;
  const normals = faces.map((f) => round3(faceNormal(pts, f.idx)));
  const centers = faces.map((f) => faceCenter(pts, f.idx));

  // 面邻接：共享一条硬棱的面偶 + 棱中点
  const adjEdges = [];
  for (const e of buildEdges(g.faces)) {
    if (e.faces.length !== 2) continue;
    const [a, b] = e.faces;
    const mid = pts[e.a].p.map((v, k) => (v + pts[e.b].p[k]) / 2);
    adjEdges.push({ a, b, mid });
  }

  // 枚举生成树：12 条邻接棱取 5 条且连通（5 边连通 6 点必为树）
  const trees = [];
  const m = adjEdges.length;
  for (let mask = 0; mask < (1 << m); mask++) {
    let bits = 0;
    for (let k = 0; k < m; k++) if (mask & (1 << k)) bits++;
    if (bits !== F - 1) continue;
    const parent = Array.from({ length: F }, (_, i) => i);
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    for (let k = 0; k < m; k++) {
      if (mask & (1 << k)) parent[find(adjEdges[k].a)] = find(adjEdges[k].b);
    }
    if (new Set(Array.from({ length: F }, (_, i) => find(i))).size === 1) {
      trees.push([...Array(m).keys()].filter((k) => mask & (1 << k)));
    }
  }

  // 根面朝向帧：n = 根面法线，任选 ⊥n 的坐标轴作 r，u = n × r（右手系）
  const rootFrame = () => {
    const n = normals[0];
    const r = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].find((a) => vdoti(a, n) === 0);
    return { r, u: vcrossi(n, r), n };
  };

  const nets = new Map(); // canonicalKey -> { cells, key }
  for (const tree of trees) {
    // 树的邻接表
    const adj = Array.from({ length: F }, () => []);
    for (const k of tree) {
      const { a, b, mid } = adjEdges[k];
      adj[a].push({ to: b, mid });
      adj[b].push({ to: a, mid });
    }
    // 从面 0 沿树展开：子面在网格中的位置 = 父面位置 + 共享棱方向（用父面帧投影）
    const pos = new Array(F).fill(null);
    const frm = new Array(F).fill(null);
    pos[0] = [0, 0];
    frm[0] = rootFrame();
    const queue = [0];
    let collision = false;
    while (queue.length && !collision) {
      const f = queue.shift();
      for (const { to, mid } of adj[f]) {
        if (pos[to]) continue;
        // 父面心 → 棱中点 的方向 d（即子面法线，整数轴），投影到父面 2D 帧得网格偏移
        const d = round3(mid.map((v, k) => v - centers[f][k]));
        const dx = vdoti(d, frm[f].r);
        const dy = vdoti(d, frm[f].u);
        const np = [pos[f][0] + dx, pos[f][1] + dy];
        if (pos.some((p) => p && p[0] === np[0] && p[1] === np[1])) { collision = true; break; }
        pos[to] = np;
        frm[to] = foldFrame(frm[f], dx, dy);
        queue.push(to);
      }
    }
    if (collision) continue; // 摊平时两格重叠（如 6 格一字长蛇），不是合法展开图
    const cells = normalizeCells(pos);
    const key = canonicalKey(cells);
    if (!nets.has(key)) nets.set(key, { cells, key });
  }
  _netsCache = [...nets.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
  return _netsCache;
}

// ---------- 随机数与随机连方 ----------

/** mulberry32 确定性伪随机数发生器。 */
export function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 随机 6 格连方：从一格出发，每次随机添加一个与现有集合相邻的格外格。
 * 可要求含 2×2 田字块（经典陷阱）：先放田字再长到 6 格。
 */
export function randomHexomino(rng, { withBlock = false } = {}) {
  const set = new Map(); // key -> [x,y]
  const add = (x, y) => set.set(cellKey(x, y), [x, y]);
  if (withBlock) {
    add(0, 0); add(1, 0); add(0, 1); add(1, 1);
  } else {
    add(0, 0);
  }
  while (set.size < 6) {
    const base = pick(rng, [...set.values()]);
    const [dx, dy] = pick(rng, DIRS);
    add(base[0] + dx, base[1] + dy);
  }
  return normalizeCells([...set.values()]);
}

/** 随机取一个合法展开图并做随机 D4 变换（归一化后返回）。 */
function randomNet(rng) {
  const base = pick(rng, cubeNets()).cells;
  return normalizeCells(pick(rng, d4Transforms(base)));
}

/** 随机非法连方；withBlock=true 时保证含田字块（必非法）。 */
function randomIllegal(rng, opts = {}) {
  for (let tries = 0; tries < 200; tries++) {
    const cells = randomHexomino(rng, opts);
    if (!canFold(cells)) return cells;
  }
  // 兜底：田字块 + 两格必非法
  return randomHexomino(rng, { withBlock: true });
}

// ---------- 关卡生成（15 关，固定种子可复现） ----------

export const LEVEL_COUNT = 15;
export const TIME_LIMIT = 20; // 三星时限（秒）

const HINTS = {
  judge: '想象把某一格当作底面按住不动，把它周围的格逐个向上折 90°。如果有两格折到了同一个面（方向重叠），就说明折不成正方体。',
  opposite: '先把展开图在心里折起来：相对的两个面折起后朝向正好相反。也可以记住「同行隔一格的两面相对」等规律来速判。',
  pick: '逐个检查：含「田」字形四格的必错；一排超过 4 格的必错；其余想象逐格折起，看有没有两格折到同一个面上。',
};

const TYPE_NAME = { judge: '能不能折', opposite: '找相对面', pick: '选能折成的' };

/**
 * 生成 15 关（固定种子可复现）。
 * 返回 [{ id, type, typeName, title, hint, timeLimit,
 *   judge:    { cells, answer: bool }
 *   opposite: { cells, marked, options:[格下标×4], answer: 格下标 }
 *   pick:     { options:[cells×4], answer: 选项下标 }
 * }]
 * 所有 cells 均已归一化排序，格号 = 下标 + 1。
 */
export function generateLevels(seed = 20260913) {
  const rng = makeRng(seed);
  const levels = [];
  let id = 0;

  // 1-5 关「能不能折」：混合合法/非法，保证两类都有
  const legality = shuffle(rng, [true, true, false, false, rng() < 0.5]);
  for (let k = 0; k < 5; k++) {
    const legal = legality[k];
    const cells = legal ? randomNet(rng) : randomIllegal(rng);
    levels.push({
      id: ++id, type: 'judge', typeName: TYPE_NAME.judge,
      title: `第 ${id} 关 · 能不能折`,
      hint: HINTS.judge, timeLimit: TIME_LIMIT,
      cells, answer: legal,
    });
  }

  // 6-10 关「找相对面」：合法展开图，标记一格，4 选项中找相对面
  for (let k = 0; k < 5; k++) {
    const cells = randomNet(rng);
    const marked = Math.floor(rng() * 6);
    const answer = oppositeOf(cells, marked);
    const others = shuffle(rng, [0, 1, 2, 3, 4, 5].filter((j) => j !== marked && j !== answer));
    const options = shuffle(rng, [answer, ...others.slice(0, 3)]);
    levels.push({
      id: ++id, type: 'opposite', typeName: TYPE_NAME.opposite,
      title: `第 ${id} 关 · 找相对面`,
      hint: HINTS.opposite, timeLimit: TIME_LIMIT,
      cells, marked, options, answer,
    });
  }

  // 11-15 关「选能折成的」：4 选 1 唯一合法；13 关起混入田字陷阱
  for (let k = 0; k < 5; k++) {
    const legal = randomNet(rng);
    const traps = [randomIllegal(rng), randomIllegal(rng)];
    traps.push(k >= 2 ? randomIllegal(rng, { withBlock: true }) : randomIllegal(rng));
    const options = shuffle(rng, [legal, ...traps]);
    levels.push({
      id: ++id, type: 'pick', typeName: TYPE_NAME.pick,
      title: `第 ${id} 关 · 选能折成的`,
      hint: HINTS.pick, timeLimit: TIME_LIMIT,
      options, answer: options.indexOf(legal),
    });
  }
  return levels;
}
