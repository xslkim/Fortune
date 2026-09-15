// 几何量计算：体积 V、表面积 S、侧面积、体对角线、母线长等。
// 纯 JS（无 DOM 依赖），可单测。
// 两套算法互相印证：
//   1) 网格法：直接对 solid 的面/顶点数据求和（多面体精确，旋转体是离散逼近）。
//      体积用「分面锥求和」（以原点为顶点、各面三角剖分后的有向四面体体积之和）；
//      表面积用多边形面积求和。多面体（面都是平面多边形）时网格法即精确值。
//   2) 公式法：按几何体类别用教科书公式，供探究面板实时显示。

import { normFace, faceNormal } from './topology.js';

// ---------- 网格法（基于面/顶点数据） ----------

function cross3(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/** 单个平面多边形的面积（顶点 CCW）。 */
export function faceArea(points, idx) {
  let sx = 0,
    sy = 0,
    sz = 0;
  for (let i = 0; i < idx.length; i++) {
    const p = points[idx[i]].p,
      q = points[idx[(i + 1) % idx.length]].p;
    sx += p[1] * q[2] - p[2] * q[1];
    sy += p[2] * q[0] - p[0] * q[2];
    sz += p[0] * q[1] - p[1] * q[0];
  }
  return Math.hypot(sx, sy, sz) / 2;
}

/** 表面积：所有面面积求和。多面体精确；旋转体为 seg 段离散逼近。 */
export function meshSurfaceArea(points, faces) {
  let s = 0;
  for (const face of faces) s += faceArea(points, normFace(face).idx);
  return s;
}

/**
 * 侧面积：非水平面的面积之和（底面/顶面法线平行 y 轴，|ny|≈1，被排除）。
 * 对本项目的摆放约定（底面在 y=0、轴沿 +y）成立；球无水平面，侧面积无意义，不应调用。
 */
export function meshLateralArea(points, faces) {
  let s = 0;
  for (const face of faces) {
    const f = normFace(face);
    const n = faceNormal(points, f.idx);
    if (Math.abs(n[1]) < 0.999) s += faceArea(points, f.idx);
  }
  return s;
}

/**
 * 体积：分面锥求和。把每个面从首顶点扇形三角剖分，
 * 累加有向四面体体积 det(a,b,c)/6（面 CCW 朝外时总和为正），最后取绝对值。
 * 多面体精确；旋转体为离散逼近（随 seg 增大收敛到公式值）。
 */
export function meshVolume(points, faces) {
  let v = 0;
  for (const face of faces) {
    const idx = normFace(face).idx;
    const a = points[idx[0]].p;
    for (let i = 1; i < idx.length - 1; i++) {
      const b = points[idx[i]].p,
        c = points[idx[i + 1]].p;
      const cr = cross3(b, c);
      v += (a[0] * cr[0] + a[1] * cr[1] + a[2] * cr[2]) / 6;
    }
  }
  return Math.abs(v);
}

// ---------- 公式法（教科书公式） ----------

/** 正 n 边形（外接圆半径 r）的面积与边长。 */
export function regularNGon(n, r) {
  return {
    area: (n / 2) * r * r * Math.sin((2 * Math.PI) / n),
    side: 2 * r * Math.sin(Math.PI / n),
    apothem: r * Math.cos(Math.PI / n),
  };
}

function result(volume, surface, extra = {}) {
  return { volume, surface, lateral: null, diagonal: null, slant: null, baseArea: null, ...extra };
}

export function measureBox({ a, b, c }) {
  return result(a * b * c, 2 * (a * b + b * c + c * a), {
    lateral: 2 * b * (a + c),
    diagonal: Math.hypot(a, b, c),
    baseArea: a * c,
  });
}

export function measurePrism({ n, r, h }) {
  const g = regularNGon(n, r);
  const lateral = n * g.side * h;
  return result(g.area * h, 2 * g.area + lateral, { lateral, baseArea: g.area });
}

export function measurePyramid({ n, r, h }) {
  const g = regularNGon(n, r);
  const slantH = Math.hypot(h, g.apothem); // 斜高（侧面三角形的高）
  const lateral = (n * g.side * slantH) / 2;
  return result((g.area * h) / 3, g.area + lateral, { lateral, baseArea: g.area });
}

export function measureCylinder({ r, h }) {
  const base = Math.PI * r * r;
  const lateral = 2 * Math.PI * r * h;
  return result(base * h, 2 * base + lateral, { lateral, slant: h, baseArea: base });
}

export function measureCone({ r, h }) {
  const base = Math.PI * r * r;
  const l = Math.hypot(r, h); // 母线
  const lateral = Math.PI * r * l;
  return result((base * h) / 3, base + lateral, { lateral, slant: l, baseArea: base });
}

export function measureFrustum({ r1, r2, h }) {
  const l = Math.hypot(h, r1 - r2); // 母线
  const lateral = Math.PI * (r1 + r2) * l;
  const surface = lateral + Math.PI * (r1 * r1 + r2 * r2);
  const volume = (Math.PI * h * (r1 * r1 + r1 * r2 + r2 * r2)) / 3;
  return result(volume, surface, { lateral, slant: l, baseArea: Math.PI * r1 * r1 });
}

export function measureSphere({ r }) {
  return result((4 / 3) * Math.PI * r ** 3, 4 * Math.PI * r * r);
}

const FORMULAS = {
  cube: ({ a }) => measureBox({ a, b: a, c: a }),
  box: measureBox,
  prism: measurePrism,
  pyramid: measurePyramid,
  cylinder: measureCylinder,
  cone: measureCone,
  frustum: measureFrustum,
  sphere: measureSphere,
};

/**
 * 按几何体类别 + 参数计算几何量。
 * kind ∈ cube|box|prism|pyramid|cylinder|cone|frustum|sphere
 * 返回 { volume, surface, lateral, diagonal, slant, baseArea }，不适用项为 null。
 */
export function measure(kind, params) {
  const f = FORMULAS[kind];
  if (!f) throw new Error(`未知几何体类别: ${kind}`);
  return f(params);
}
