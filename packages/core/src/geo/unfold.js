// 展开图布局：把多面体沿棱剪开、摊平成平面网格。纯 JS（无 three 依赖），可在 node 里单测。
// 方法：遍历面邻接图生成展开树——多面体从面 0 起 BFS；旋转体（含 smooth 面）从第一个侧面起，
// 且 smooth 边优先（边权 0，硬边权 1，同权先进先出，多面体即退化为从面 0 的 BFS），
// 这样圆柱/圆台侧面逐段串成长条、圆锥侧面串成扇形，上下底面（圆）挂在根侧面的边上。
// 每个非根面记录：父面索引、共享边、转轴（共享边方向）、总转角（绕共享边把本面法线旋到
// 父面法线的有向二面角）。t 时刻的变换 = 沿展开树自根向下累乘「绕共享边转 angle·t」，
// 故 t=0 恒等（完全折叠），t=1 完全展开且各面共面。邻接图的非树边展开后自然分离——
// 这正是展开图的正确行为。球（全部为 smooth 边）不支持展开，unfoldLayout 返回 null。
import { buildEdges, faceNormal, normFace, vcross, vdot, vnorm, vsub } from './topology.js';

// ---------- 4x4 矩阵（列主序，与 THREE.Matrix4.fromArray 兼容） ----------

export function mat4Identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/** out = a · b（列主序）。 */
export function mat4Mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  }
  return o;
}

/** 绕过 pivot、方向为 axis（单位向量）的轴旋转 angle 弧度的矩阵（Rodrigues）。 */
export function mat4AxisAngle(axis, pivot, angle) {
  const [x, y, z] = axis;
  const c = Math.cos(angle),
    s = Math.sin(angle),
    k = 1 - c;
  // R[row][col]
  const R = [
    [c + x * x * k, x * y * k - z * s, x * z * k + y * s],
    [y * x * k + z * s, c + y * y * k, y * z * k - x * s],
    [z * x * k - y * s, z * y * k + x * s, c + z * z * k],
  ];
  // t = pivot - R·pivot
  const t = [0, 1, 2].map(
    (i) => pivot[i] - (R[i][0] * pivot[0] + R[i][1] * pivot[1] + R[i][2] * pivot[2]),
  );
  // 列主序：o[col*4+row]
  return [
    R[0][0],
    R[1][0],
    R[2][0],
    0,
    R[0][1],
    R[1][1],
    R[2][1],
    0,
    R[0][2],
    R[1][2],
    R[2][2],
    0,
    t[0],
    t[1],
    t[2],
    1,
  ];
}

/** 用列主序 4x4 矩阵变换点 [x,y,z]。 */
export function applyPoint(m, p) {
  return [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
  ];
}

/**
 * 计算几何体的展开布局；不支持（球等纯曲面体）返回 null。
 * 返回 {
 *   root,            // 根面索引（展开后其余面均与根面共面）
 *   planeNormal,     // 展开图所在平面的法线（即根面原法线）
 *   tree,            // tree[f] = { parent, edge:[a,b], pivot, axis, angle }，根面 parent=-1
 *   order,           // 面被访问的顺序（父先于子）
 *   faceTransformAt(fi, t),  // 单面在 t 时刻的列主序 4x4 变换
 *   transformsAt(t),         // 全部面在 t 时刻的变换数组
 * }
 */
export function unfoldLayout(solid) {
  const points = solid.points;
  const faces = solid.faces.map(normFace);
  const F = faces.length;
  const edges = buildEdges(solid.faces);
  if (!edges.length || edges.every((e) => e.smooth)) return null; // 球等纯曲面体无法摊平

  // 面邻接表
  const adj = faces.map(() => []);
  for (const e of edges) {
    if (e.faces.length !== 2) continue;
    const [f0, f1] = e.faces;
    adj[f0].push({ to: f1, edge: e });
    adj[f1].push({ to: f0, edge: e });
  }

  // 旋转体从第一个侧面出发，让侧面沿 smooth 边串成条带；多面体从面 0 出发
  const hasSmooth = faces.some((f) => f.smooth);
  const root = hasSmooth ? faces.findIndex((f) => f.smooth) : 0;

  // 按边权的类 Prim 遍历：smooth 边权 0 优先（侧面串联），同权先进先出（多面体即 BFS）
  const tree = faces.map(() => null);
  const order = [root];
  tree[root] = { parent: -1, edge: null, pivot: null, axis: null, angle: 0 };
  const visited = new Array(F).fill(false);
  visited[root] = true;
  const frontier = []; // { w, seq, from, to, edge }
  let seq = 0;
  const pushFrontier = (from) => {
    for (const nb of adj[from]) {
      if (!visited[nb.to])
        frontier.push({ w: nb.edge.smooth ? 0 : 1, seq: seq++, from, to: nb.to, edge: nb.edge });
    }
  };
  pushFrontier(root);
  while (frontier.length) {
    let bi = 0;
    for (let i = 1; i < frontier.length; i++) {
      const f = frontier[i],
        b = frontier[bi];
      if (f.w < b.w || (f.w === b.w && f.seq < b.seq)) bi = i;
    }
    const { from, to, edge } = frontier.splice(bi, 1)[0];
    if (visited[to]) continue;
    visited[to] = true;

    // 绕共享边把子面法线 nc 旋到父面法线 np 的有向角
    const pa = points[edge.a].p,
      pb = points[edge.b].p;
    const axis = vnorm(vsub(pb, pa));
    const np = faceNormal(points, faces[from].idx);
    const nc = faceNormal(points, faces[to].idx);
    const angle = Math.atan2(vdot(axis, vcross(nc, np)), vdot(nc, np));
    tree[to] = { parent: from, edge: [edge.a, edge.b], pivot: pa, axis, angle };
    order.push(to);
    pushFrontier(to);
  }
  // 邻接图不连通时（本数据不会出现），未访问的面作为独立根保持原位
  for (let f = 0; f < F; f++) {
    if (!tree[f]) {
      tree[f] = { parent: -1, edge: null, pivot: null, axis: null, angle: 0 };
      order.push(f);
    }
  }

  const planeNormal = faceNormal(points, faces[root].idx);

  function faceTransformAt(fi, t) {
    let m = mat4Identity();
    // 沿树自根向下累乘：M_child = M_parent · Hinge(angle·t)
    const chain = [];
    for (let f = fi; tree[f] && tree[f].parent !== -1; f = tree[f].parent) chain.push(f);
    for (let i = chain.length - 1; i >= 0; i--) {
      const e = tree[chain[i]];
      m = mat4Mul(m, mat4AxisAngle(e.axis, e.pivot, e.angle * t));
    }
    return m;
  }

  function transformsAt(t) {
    const out = new Array(F);
    out[root] = mat4Identity();
    for (let i = 1; i < order.length; i++) {
      const f = order[i];
      const e = tree[f];
      out[f] =
        e.parent === -1
          ? mat4Identity()
          : mat4Mul(out[e.parent], mat4AxisAngle(e.axis, e.pivot, e.angle * t));
    }
    return out;
  }

  return { root, planeNormal, tree, order, faceTransformAt, transformsAt };
}

/** 该几何体是否支持展开。 */
export function canUnfold(solid) {
  return unfoldLayout(solid) !== null;
}
