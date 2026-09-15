import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cube, box, prism, pyramid, cylinder, cone, frustum, sphere } from '../src/geo/solids.js';
import { unfoldLayout, applyPoint } from '../src/geo/unfold.js';
import { normFace } from '../src/geo/topology.js';

// ---------- 小工具（基于展开后的顶点坐标） ----------

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function norm(a) {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}

/** 面 fi 在 t 时刻的顶点坐标序列。 */
function facePts(g, mats, fi) {
  return normFace(g.faces[fi]).idx.map((i) => applyPoint(mats[fi], g.points[i].p));
}

/** Newell 法求多边形法线。 */
function normalOf(pts) {
  let nx = 0,
    ny = 0,
    nz = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i],
      q = pts[(i + 1) % pts.length];
    nx += (p[1] - q[1]) * (p[2] + q[2]);
    ny += (p[2] - q[2]) * (p[0] + q[0]);
    nz += (p[0] - q[0]) * (p[1] + q[1]);
  }
  return norm([nx, ny, nz]);
}

function centerOf(pts) {
  const c = [0, 0, 0];
  for (const p of pts) {
    c[0] += p[0];
    c[1] += p[1];
    c[2] += p[2];
  }
  return [c[0] / pts.length, c[1] / pts.length, c[2] / pts.length];
}

/** 展开后所有面的 {normal, center}。 */
function faceStats(g, mats) {
  return g.faces.map((_, fi) => {
    const pts = facePts(g, mats, fi);
    return { normal: normalOf(pts), center: centerOf(pts) };
  });
}

/** 断言所有面法线平行、面心共面（在根面平面内）。 */
function assertCoplanar(g, mats, tol = 1e-6) {
  const L = unfoldLayout(g);
  const stats = faceStats(g, mats);
  const n0 = stats[L.root].normal;
  const c0 = stats[L.root].center;
  for (let fi = 0; fi < g.faces.length; fi++) {
    assert.ok(Math.abs(dot(stats[fi].normal, n0) - 1) < 1e-6, `面 ${fi} 法线不与根面平行`);
    assert.ok(
      Math.abs(
        dot(
          [stats[fi].center[0] - c0[0], stats[fi].center[1] - c0[1], stats[fi].center[2] - c0[2]],
          n0,
        ),
      ) < tol,
      `面 ${fi} 面心不在展开平面内`,
    );
  }
  return stats;
}

// ---------- 测试 ----------

test('球不支持展开，其余目录几何体均支持', () => {
  assert.equal(unfoldLayout(sphere()), null);
  for (const g of [
    cube(),
    box(),
    prism(3),
    prism(6),
    pyramid(3),
    pyramid(4),
    cylinder(),
    cone(),
    frustum(),
  ]) {
    assert.ok(unfoldLayout(g), g.id);
  }
});

test('t=0 时所有面变换为恒等（完全折叠，原样）', () => {
  for (const g of [cube(2), pyramid(4), cylinder(), cone()]) {
    const L = unfoldLayout(g);
    const mats = L.transformsAt(0);
    g.faces.forEach((face, fi) => {
      for (const i of normFace(face).idx) {
        const p = applyPoint(mats[fi], g.points[i].p);
        assert.ok(dist(p, g.points[i].p) < 1e-9, `${g.id} 面 ${fi} 顶点 ${i} 在 t=0 时移动了`);
      }
    });
  }
});

test('展开树：n 个面恰有 n-1 条树边，且记录父面/共享边/二面角', () => {
  const g = cube(2);
  const L = unfoldLayout(g);
  assert.equal(L.root, 0);
  assert.equal(L.tree.filter((e) => e.parent !== -1).length, g.faces.length - 1);
  for (const e of L.tree) {
    if (e.parent === -1) continue;
    assert.ok(e.edge && e.edge.length === 2);
    assert.ok(Math.abs(Math.hypot(...e.axis) - 1) < 1e-9); // 转轴单位化
    assert.ok(Math.abs(e.angle) > 1e-6); // 正方体相邻面必有非零二面角
  }
});

test('正方体 t=1：6 面共面、互不重叠（面心最小间距 ≥ 边长 90%）', () => {
  const s = 2;
  const g = cube(s);
  const L = unfoldLayout(g);
  const mats = L.transformsAt(1);
  const stats = assertCoplanar(g, mats);
  for (let i = 0; i < stats.length; i++) {
    for (let j = i + 1; j < stats.length; j++) {
      const d = dist(stats[i].center, stats[j].center);
      assert.ok(d >= s * 0.9, `面 ${i} 与面 ${j} 面心间距 ${d} 过小，展开图重叠`);
    }
  }
});

test('多面体 t=1 均摊平：长方体/三棱柱/四棱锥', () => {
  for (const g of [box(), prism(3), pyramid(4)]) {
    const L = unfoldLayout(g);
    assertCoplanar(g, L.transformsAt(1));
  }
});

test('圆柱 t=1：侧面摊成近似长方形（共面，宽度 ≈ 2πr ±5%），底面成圆盘挂侧面边上', () => {
  const r = 1.4,
    h = 2.6,
    seg = 48;
  const g = cylinder(r, h, seg);
  const L = unfoldLayout(g);
  const mats = L.transformsAt(1);

  // 侧面（面 2..seg+1）所有顶点
  const sideVerts = [];
  for (let fi = 2; fi < g.faces.length; fi++) sideVerts.push(...facePts(g, mats, fi));

  // 共面：以根侧面法线为平面法线
  const n = normalOf(facePts(g, mats, L.root));
  const v0 = sideVerts[0];
  for (const v of sideVerts) {
    assert.ok(
      Math.abs(dot([v[0] - v0[0], v[1] - v0[1], v[2] - v0[2]], n)) < 1e-4,
      '侧面顶点不共面',
    );
  }

  // 展开宽度：沿条带方向（面内 ⊥ 原圆柱轴线 y）的跨度
  const e = norm(cross([0, 1, 0], n));
  let lo = Infinity,
    hi = -Infinity;
  for (const v of sideVerts) {
    const d = dot(v, e);
    lo = Math.min(lo, d);
    hi = Math.max(hi, d);
  }
  const width = hi - lo;
  assert.ok(
    Math.abs(width - 2 * Math.PI * r) / (2 * Math.PI * r) < 0.05,
    `展开宽度 ${width} 与 2πr=${2 * Math.PI * r} 偏差超过 5%`,
  );

  // 高度不变
  const ylo = Math.min(...sideVerts.map((v) => v[1]));
  const yhi = Math.max(...sideVerts.map((v) => v[1]));
  assert.ok(Math.abs(yhi - ylo - h) < 1e-6, '侧面展开高度应等于圆柱高');

  // 上下底面与侧面共面（圆盘贴在条带边上）
  assertCoplanar(g, mats, 1e-4);
});

test('圆锥/圆台 t=1：全部面共面（扇形 + 圆盘）', () => {
  for (const g of [cone(), frustum()]) {
    const L = unfoldLayout(g);
    assertCoplanar(g, L.transformsAt(1), 1e-4);
  }
});

test('中间时刻 t=0.5：正方体侧面转过 45°', () => {
  const g = cube(2);
  const L = unfoldLayout(g);
  const mats = L.transformsAt(0.5);
  // 找一个面 0 的直接子面，其法线应介于 -y 与原法线之间（转了一半）
  const child = L.tree.findIndex((e) => e.parent === 0);
  assert.ok(child > 0);
  const n = normalOf(facePts(g, mats, child));
  const nRoot = normalOf(facePts(g, mats, 0));
  const cos = dot(n, nRoot);
  assert.ok(Math.abs(cos - Math.SQRT1_2) < 1e-6, `t=0.5 时二面角应为 135°（cos=${cos}）`);
});

test('faceTransformAt 与 transformsAt 一致', () => {
  const g = cone();
  const L = unfoldLayout(g);
  const all = L.transformsAt(0.7);
  for (let fi = 0; fi < g.faces.length; fi++) {
    const one = L.faceTransformAt(fi, 0.7);
    for (let k = 0; k < 16; k++) assert.ok(Math.abs(one[k] - all[fi][k]) < 1e-12);
  }
});
