import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cube, box, prism, pyramid, cylinder, cone, frustum, sphere } from '../src/geo/solids.js';
import { threeViews, projectView } from '../src/geo/views.js';

function center2(v) {
  return [(v.bounds.minX + v.bounds.maxX) / 2, (v.bounds.minY + v.bounds.maxY) / 2];
}

test('threeViews 结构：front/side/top 各含 segments/width/height', () => {
  const v = threeViews(cube());
  for (const k of ['front', 'side', 'top']) {
    assert.ok(Array.isArray(v[k].segments) && v[k].segments.length > 0, k);
    assert.ok(v[k].width > 0 && v[k].height > 0, k);
  }
});

test('正方体正视图：外轮廓是正方形，4 条外框实线、0 条独立虚线（被遮挡棱与外框重合）', () => {
  const v = threeViews(cube(2));
  const f = v.front;
  assert.ok(Math.abs(f.width - 2) < 1e-9, `宽 ${f.width}`);
  assert.ok(Math.abs(f.height - 2) < 1e-9, `高 ${f.height}`);
  assert.equal(f.segments.length, 4); // 12 棱：4 条沿视线退化、其余两两重合
  assert.ok(f.segments.every((s) => !s.hidden));
  // 侧视图/俯视图同样是正方形实线框
  for (const k of ['side', 'top']) {
    assert.ok(Math.abs(v[k].width - 2) < 1e-9 && Math.abs(v[k].height - 2) < 1e-9, k);
    assert.ok(v[k].segments.every((s) => !s.hidden), k);
  }
});

test('可见性分类规则：沿 (1,1,1) 方向看正方体 → 9 实 3 虚，虚线汇聚于远处顶点 A', () => {
  const v = projectView(cube(2), [1, 1, 1]);
  const solidSegs = v.segments.filter((s) => !s.hidden);
  const hiddenSegs = v.segments.filter((s) => s.hidden);
  assert.equal(solidSegs.length, 9);
  assert.equal(hiddenSegs.length, 3);
  // 3 条虚线正是远点 A（顶点索引 0）汇聚的 3 条棱
  assert.ok(hiddenSegs.every((s) => s.edge.includes(0)));
});

test('圆柱：正视图是长方形（无斜线/弧线），俯视图是近似圆的折线', () => {
  const r = 1.4, h = 2.6;
  const v = threeViews(cylinder(r, h, 48));
  const f = v.front;
  assert.ok(Math.abs(f.width - 2 * r) < 1e-6, `正视宽 ${f.width}`);
  assert.ok(Math.abs(f.height - h) < 1e-6, `正视高 ${f.height}`);
  for (const s of f.segments) {
    const dx = Math.abs(s.a[0] - s.b[0]), dy = Math.abs(s.a[1] - s.b[1]);
    assert.ok(dx < 1e-9 || dy < 1e-9, '正视图不应出现斜线/弧线（轮廓是长方形）');
  }
  // 侧视图同为长方形
  assert.ok(Math.abs(v.side.width - 2 * r) < 1e-6 && Math.abs(v.side.height - h) < 1e-6);
  // 俯视图：大量线段，端点都在半径 r 的圆上，全实线
  const t = v.top;
  assert.ok(t.segments.length >= 40, `俯视线段数 ${t.segments.length}`);
  assert.ok(t.segments.every((s) => !s.hidden));
  const [cx, cy] = center2(t);
  for (const s of t.segments) {
    for (const p of [s.a, s.b]) {
      const rr = Math.hypot(p[0] - cx, p[1] - cy);
      assert.ok(Math.abs(rr - r) / r < 0.01, `俯视图端点偏离圆周 r=${rr}`);
    }
  }
});

test('圆锥正视图是等腰三角形（底边水平 + 两条轮廓母线）', () => {
  const r = 1.6, h = 2.6;
  const v = threeViews(cone(r, h, 48));
  const f = v.front;
  assert.ok(Math.abs(f.width - 2 * r) / (2 * r) < 0.01, `宽 ${f.width}`);
  assert.ok(Math.abs(f.height - h) < 1e-6, `高 ${f.height}`);
  // 斜线恰为 2 条轮廓母线（其余是底面圆投出的水平小段）
  const slant = f.segments.filter((s) => Math.abs(s.a[0] - s.b[0]) > 1e-9 && Math.abs(s.a[1] - s.b[1]) > 1e-9);
  assert.equal(slant.length, 2);
  assert.ok(slant.every((s) => !s.hidden));
});

test('球：三视图都是近似圆（轮廓线，全实线）', () => {
  const r = 1.6;
  const v = threeViews(sphere(r, 32, 24));
  for (const k of ['front', 'side', 'top']) {
    const vw = v[k];
    assert.ok(vw.segments.length >= 24, `${k} 线段数 ${vw.segments.length}`);
    assert.ok(vw.segments.every((s) => !s.hidden), k);
    assert.ok(Math.abs(vw.width - 2 * r) / (2 * r) < 0.01, `${k} 宽 ${vw.width}`);
    assert.ok(Math.abs(vw.height - 2 * r) / (2 * r) < 0.01, `${k} 高 ${vw.height}`);
    const [cx, cy] = center2(vw);
    for (const s of vw.segments) {
      for (const p of [s.a, s.b]) {
        const rr = Math.hypot(p[0] - cx, p[1] - cy);
        assert.ok(Math.abs(rr - r) / r < 0.01, `${k} 端点偏离圆周 r=${rr}`);
      }
    }
  }
});

test('其余几何体三视图均可生成且线段有限：长方体/三棱柱/四棱锥/圆台', () => {
  for (const g of [box(), prism(3), pyramid(4), frustum()]) {
    const v = threeViews(g);
    for (const k of ['front', 'side', 'top']) {
      assert.ok(v[k].segments.length > 0, `${g.id} ${k}`);
      for (const s of v[k].segments) {
        assert.ok([...s.a, ...s.b].every(Number.isFinite), `${g.id} ${k} 坐标有限`);
      }
    }
  }
});

test('三棱柱俯视图：底面三角形被侧棱遮挡关系正确（含实线外框）', () => {
  const v = threeViews(prism(3, 1.6, 2.6));
  // 俯视图外轮廓 = 底面三角形，3 条边均为实线（侧面从上看是正面）
  assert.ok(v.top.segments.length >= 3);
  assert.ok(v.top.segments.every((s) => !s.hidden));
});
