// measure.js 测试：
//  1) 公式法与教科书数值比对（精确值断言）
//  2) 网格法（分面锥求和体积 / 面面积求和表面积）与公式法互验，误差 < 1%
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { box, cube, prism, pyramid, cylinder, cone, frustum, sphere } from '../src/geo/solids.js';
import {
  measure,
  meshVolume,
  meshSurfaceArea,
  meshLateralArea,
  regularNGon,
} from '../src/geo/measure.js';

const close = (actual, expected, tol, msg) => {
  const rel = Math.abs(actual - expected) / Math.abs(expected);
  assert.ok(
    rel < tol,
    `${msg}: 网格值 ${actual} vs 公式值 ${expected}，相对误差 ${(rel * 100).toFixed(3)}%`,
  );
};

// ---------- 公式法 vs 教科书数值 ----------

test('长方体/正方体：V、S、侧面积、体对角线', () => {
  const m = measure('box', { a: 2, b: 3, c: 4 });
  assert.equal(m.volume, 24);
  assert.equal(m.surface, 52);
  assert.equal(m.lateral, 36);
  assert.ok(Math.abs(m.diagonal - Math.sqrt(29)) < 1e-12);

  const c = measure('cube', { a: 4 });
  assert.equal(c.volume, 64);
  assert.equal(c.surface, 96);
});

test('正棱柱：底面正 n 边形面积 × 高', () => {
  // 正六棱柱 r=1：底面积 = 3√3/2，边长 = 1
  const m = measure('prism', { n: 6, r: 1, h: 1 });
  close(m.baseArea, (3 * Math.sqrt(3)) / 2, 1e-12, '六棱柱底面积');
  close(m.volume, (3 * Math.sqrt(3)) / 2, 1e-12, '六棱柱体积');
  close(m.lateral, 6, 1e-12, '六棱柱侧面积');
  close(m.surface, 3 * Math.sqrt(3) + 6, 1e-12, '六棱柱表面积');
});

test('正四棱锥：V = Sh/3，斜高 √(h² + 边心距²)', () => {
  // r=√2 时底面边长 2、底面积 4、边心距 1；h=3 → 斜高 √10
  const r = Math.SQRT2,
    h = 3;
  const m = measure('pyramid', { n: 4, r, h });
  close(m.volume, (4 * h) / 3, 1e-12, '四棱锥体积');
  close(m.lateral, (4 * (2 * Math.sqrt(10))) / 2, 1e-12, '四棱锥侧面积');
  close(m.surface, 4 + 4 * Math.sqrt(10), 1e-12, '四棱锥表面积');
});

test('圆柱：V=πr²h，S侧=2πrh，S=2πr²+2πrh，母线=h', () => {
  const m = measure('cylinder', { r: 2, h: 3 });
  close(m.volume, 12 * Math.PI, 1e-12, '圆柱体积');
  close(m.lateral, 12 * Math.PI, 1e-12, '圆柱侧面积');
  close(m.surface, 20 * Math.PI, 1e-12, '圆柱表面积');
  assert.equal(m.slant, 3);
});

test('圆锥：r=3,h=4 → 母线 5，V=12π，S侧=15π，S=24π', () => {
  const m = measure('cone', { r: 3, h: 4 });
  assert.equal(m.slant, 5);
  close(m.volume, 12 * Math.PI, 1e-12, '圆锥体积');
  close(m.lateral, 15 * Math.PI, 1e-12, '圆锥侧面积');
  close(m.surface, 24 * Math.PI, 1e-12, '圆锥表面积');
});

test('圆台：V=πh(r1²+r1r2+r2²)/3，S侧=π(r1+r2)l', () => {
  const m = measure('frustum', { r1: 2, r2: 1, h: 3 });
  const l = Math.sqrt(10);
  close(m.volume, 7 * Math.PI, 1e-12, '圆台体积');
  close(m.slant, l, 1e-12, '圆台母线');
  close(m.lateral, 3 * Math.PI * l, 1e-12, '圆台侧面积');
  close(m.surface, 3 * Math.PI * l + 5 * Math.PI, 1e-12, '圆台表面积');
});

test('球：V=4πr³/3，S=4πr²', () => {
  const m = measure('sphere', { r: 2 });
  close(m.volume, (32 * Math.PI) / 3, 1e-12, '球体积');
  close(m.surface, 16 * Math.PI, 1e-12, '球表面积');
  assert.equal(m.lateral, null);
  assert.equal(m.diagonal, null);
});

// ---------- 网格法 vs 公式法互验（误差 < 1%） ----------

test('多面体：分面锥求和体积 / 面面积表面积 与公式精确一致', () => {
  const cases = [
    [cube(2.5), 'cube', { a: 2.5 }],
    [box(2, 3, 4), 'box', { a: 2, b: 3, c: 4 }],
    [prism(3, 1.6, 2.6), 'prism', { n: 3, r: 1.6, h: 2.6 }],
    [prism(8, 2, 3), 'prism', { n: 8, r: 2, h: 3 }],
    [pyramid(4, 1.8, 2.6), 'pyramid', { n: 4, r: 1.8, h: 2.6 }],
    [pyramid(5, 2, 3), 'pyramid', { n: 5, r: 2, h: 3 }],
  ];
  for (const [g, kind, p] of cases) {
    const m = measure(kind, p);
    close(meshVolume(g.points, g.faces), m.volume, 0.01, `${g.id} 体积`);
    close(meshSurfaceArea(g.points, g.faces), m.surface, 0.01, `${g.id} 表面积`);
    close(meshLateralArea(g.points, g.faces), m.lateral, 0.01, `${g.id} 侧面积`);
  }
});

test('旋转体：离散网格与公式误差 < 1%', () => {
  const cases = [
    [cylinder(1.4, 2.6), 'cylinder', { r: 1.4, h: 2.6 }],
    [cone(1.6, 2.6), 'cone', { r: 1.6, h: 2.6 }],
    [frustum(1.6, 0.9, 2.2), 'frustum', { r1: 1.6, r2: 0.9, h: 2.2 }],
    // 球用更密的 UV 网格验证（默认 32×24 段离散误差约 1.07%）
    [sphere(1.6, 64, 48), 'sphere', { r: 1.6 }],
  ];
  for (const [g, kind, p] of cases) {
    const m = measure(kind, p);
    close(meshVolume(g.points, g.faces), m.volume, 0.01, `${g.id} 体积`);
    close(meshSurfaceArea(g.points, g.faces), m.surface, 0.01, `${g.id} 表面积`);
    if (m.lateral != null) {
      close(meshLateralArea(g.points, g.faces), m.lateral, 0.01, `${g.id} 侧面积`);
    }
  }
});

test('正 n 边形辅助：n→∞ 时面积趋近 πr²', () => {
  const g = regularNGon(1000, 2);
  close(g.area, 4 * Math.PI, 0.001, 'n=1000 正多边形面积');
});
