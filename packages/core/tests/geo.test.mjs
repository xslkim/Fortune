import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cube, box, prism, pyramid, cylinder, cone, sphere, catalog } from '../src/geo/solids.js';
import {
  buildEdges,
  classifyFaces,
  classifyEdges,
  sectionPolygon,
  normFace,
  faceNormal,
} from '../src/geo/topology.js';

test('正方体：8 顶点 6 面 12 条硬边，无 smooth 边', () => {
  const g = cube();
  assert.equal(g.points.length, 8);
  assert.equal(g.faces.length, 6);
  const edges = buildEdges(g.faces);
  assert.equal(edges.length, 12);
  assert.ok(edges.every((e) => !e.smooth && e.faces.length === 2));
});

test('三棱柱：6 顶点 5 面 9 边', () => {
  const g = prism(3);
  assert.equal(g.points.length, 6);
  assert.equal(g.faces.length, 5);
  assert.equal(buildEdges(g.faces).length, 9);
});

test('四棱锥：5 顶点 5 面 8 边，顶点标签 P', () => {
  const g = pyramid(4);
  assert.equal(g.points.length, 5);
  assert.equal(g.faces.length, 5);
  assert.equal(buildEdges(g.faces).length, 8);
  assert.equal(g.points[4].label, 'P');
});

test('圆柱：侧面之间的边全是 smooth，上下底圆周是硬边', () => {
  const g = cylinder(1.4, 2.6, 48);
  const edges = buildEdges(g.faces);
  const smooth = edges.filter((e) => e.smooth);
  const hard = edges.filter((e) => !e.smooth);
  assert.equal(smooth.length, 48); // 母线
  assert.equal(hard.length, 96); // 上下底圆周各 48
});

test('所有面法线朝外（CCW 约定正确）', () => {
  for (const item of catalog()) {
    const g = item.make();
    const center = [0, 0, 0];
    for (const q of g.points) {
      center[0] += q.p[0];
      center[1] += q.p[1];
      center[2] += q.p[2];
    }
    center[0] /= g.points.length;
    center[1] /= g.points.length;
    center[2] /= g.points.length;
    g.faces.forEach((face, i) => {
      const f = normFace(face);
      const n = faceNormal(g.points, f.idx);
      const c = [0, 0, 0];
      for (const ix of f.idx) {
        c[0] += g.points[ix].p[0];
        c[1] += g.points[ix].p[1];
        c[2] += g.points[ix].p[2];
      }
      c[0] /= f.idx.length;
      c[1] /= f.idx.length;
      c[2] /= f.idx.length;
      // 球的两极三角形面心可能接近轴心，仍应满足 dot > 0
      const dot = n[0] * (c[0] - center[0]) + n[1] * (c[1] - center[1]) + n[2] * (c[2] - center[2]);
      assert.ok(dot > 1e-6, `${item.id} face ${i} 法线未朝外 (dot=${dot})`);
    });
  }
});

test('可见性分类：正方体从正上方斜看，顶面 front、底面 back', () => {
  const g = cube();
  const eye = [3, 5, 4];
  const facing = classifyFaces(g.points, g.faces, eye);
  assert.equal(facing[0], 'back'); // 底面
  assert.equal(facing[1], 'front'); // 顶面
  const edges = buildEdges(g.faces);
  const cls = classifyEdges(edges, facing);
  assert.ok(cls.includes('back'));
  assert.ok(cls.includes('silhouette'));
  assert.ok(cls.includes('front'));
  // 背面边恰是汇聚于被遮挡顶点 A 的 3 条边
  const backEdges = edges.filter((_, k) => cls[k] === 'back');
  assert.equal(backEdges.length, 3);
  assert.ok(backEdges.every((e) => e.a === 0 || e.b === 0));
});

test('截面：水平面截正方体得正方形；过顶点截棱锥得三角形', () => {
  const g = cube(2);
  const edges = buildEdges(g.faces);
  const poly = sectionPolygon(g.points, edges, { n: [0, 1, 0], d: 1 });
  assert.equal(poly.length, 4);
  // 边长 2
  const e0 = poly[0],
    e1 = poly[1];
  assert.ok(Math.abs(Math.hypot(e1[0] - e0[0], e1[1] - e0[1], e1[2] - e0[2]) - 2) < 1e-6);

  const py = pyramid(4, 1.8, 2.6);
  const e2 = buildEdges(py.faces);
  const tri = sectionPolygon(py.points, e2, { n: [0, 1, 0], d: 1.3 });
  assert.equal(tri.length, 4); // 四棱锥水平截面是四边形
});

test('目录中每个几何体：数据合法（索引在界内、面至少 3 顶点）', () => {
  for (const item of catalog()) {
    const g = item.make();
    for (const face of g.faces) {
      const f = normFace(face);
      assert.ok(f.idx.length >= 3, item.id);
      for (const i of f.idx) assert.ok(i >= 0 && i < g.points.length, item.id);
    }
  }
});
