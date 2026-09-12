// 五种正多面体（柏拉图立体）数据验证：
// V-E+F=2、所有棱等长、所有面是全等正多边形、法线朝外、展开布局可用。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cube, tetrahedron, octahedron, icosahedron, dodecahedron, catalog } from '../src/geo/solids.js';
import { buildEdges, faceNormal, faceCenter, normFace, vdot, vsub, vnorm } from '../src/geo/topology.js';
import { canUnfold, unfoldLayout } from '../src/geo/unfold.js';

const PLATONIC = [
  { id: 'tetrahedron', make: tetrahedron, V: 4, E: 6, F: 4, faceSize: 3 },
  { id: 'cube', make: () => cube(), V: 8, E: 12, F: 6, faceSize: 4 },
  { id: 'octahedron', make: octahedron, V: 6, E: 12, F: 8, faceSize: 3 },
  { id: 'icosahedron', make: icosahedron, V: 12, E: 30, F: 20, faceSize: 3 },
  { id: 'dodecahedron', make: dodecahedron, V: 20, E: 30, F: 12, faceSize: 5 },
];

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

test('正多面体：顶点/棱/面数正确且满足欧拉公式 V-E+F=2', () => {
  for (const s of PLATONIC) {
    const g = s.make();
    assert.equal(g.points.length, s.V, `${s.id} V`);
    const edges = buildEdges(g.faces);
    assert.equal(edges.length, s.E, `${s.id} E`);
    assert.equal(g.faces.length, s.F, `${s.id} F`);
    assert.equal(g.points.length - edges.length + g.faces.length, 2, `${s.id} 欧拉公式`);
    assert.ok(edges.every((e) => e.faces.length === 2 && !e.smooth), `${s.id} 每条棱恰属于两个面`);
  }
});

test('正多面体：所有棱等长（<1e-6）', () => {
  for (const s of PLATONIC) {
    const g = s.make();
    const edges = buildEdges(g.faces);
    const lens = edges.map((e) => dist(g.points[e.a].p, g.points[e.b].p));
    const l0 = lens[0];
    for (const l of lens) assert.ok(Math.abs(l - l0) < 1e-6, `${s.id} 棱长不一致`);
  }
});

test('正多面体：所有面是共面、全等的正多边形', () => {
  for (const s of PLATONIC) {
    const g = s.make();
    let refSide = null, refCos = null;
    for (const face of g.faces) {
      const f = normFace(face);
      assert.equal(f.idx.length, s.faceSize, `${s.id} 面顶点数`);
      const P = f.idx.map((i) => g.points[i].p);
      // 共面：每个顶点到面 0-1-2 确定的平面距离为 0
      const n = faceNormal(g.points, f.idx);
      for (const p of P) assert.ok(Math.abs(vdot(n, vsub(p, P[0]))) < 1e-9, `${s.id} 面不共面`);
      // 正多边形：各边等长且各内角相等
      for (let i = 0; i < P.length; i++) {
        const side = dist(P[i], P[(i + 1) % P.length]);
        if (refSide === null) refSide = side;
        assert.ok(Math.abs(side - refSide) < 1e-6, `${s.id} 边长不一致（面不全等或非正）`);
        const u = vnorm(vsub(P[(i - 1 + P.length) % P.length], P[i]));
        const v = vnorm(vsub(P[(i + 1) % P.length], P[i]));
        const cos = vdot(u, v);
        if (refCos === null) refCos = cos;
        assert.ok(Math.abs(cos - refCos) < 1e-6, `${s.id} 内角不一致`);
      }
    }
  }
});

test('正多面体：所有面法线朝外（CCW 约定）', () => {
  for (const s of PLATONIC) {
    const g = s.make();
    const center = [0, 0, 0];
    for (const q of g.points) { center[0] += q.p[0]; center[1] += q.p[1]; center[2] += q.p[2]; }
    center[0] /= g.points.length; center[1] /= g.points.length; center[2] /= g.points.length;
    g.faces.forEach((face, i) => {
      const f = normFace(face);
      const n = faceNormal(g.points, f.idx);
      const c = faceCenter(g.points, f.idx);
      const dot = vdot(n, vsub(c, center));
      assert.ok(dot > 1e-6, `${s.id} face ${i} 法线未朝外 (dot=${dot})`);
    });
  }
});

test('正多面体：labels 符合约定', () => {
  const t = tetrahedron();
  assert.deepEqual(t.points.map((q) => q.label), ['A', 'B', 'C', 'P']);
  const o = octahedron();
  assert.deepEqual(o.points.map((q) => q.label), ['A', 'B', 'C', 'D', 'P1', 'P2']);
  const i20 = icosahedron();
  assert.equal(i20.points.length, 12);
  assert.ok(i20.points.every((q, k) => q.label === String.fromCharCode(65 + k)));
  const d12 = dodecahedron();
  assert.equal(d12.points.length, 20); // ≤26，全部给字母 A…T
  assert.ok(d12.points.every((q, k) => q.label === String.fromCharCode(65 + k)));
});

test('正多面体：都进了 catalog()，名字正确', () => {
  const byId = new Map(catalog().map((c) => [c.id, c]));
  for (const [id, name] of [['tetrahedron', '正四面体'], ['octahedron', '正八面体'],
    ['dodecahedron', '正十二面体'], ['icosahedron', '正二十面体']]) {
    assert.ok(byId.has(id), `catalog 缺 ${id}`);
    assert.equal(byId.get(id).name, name);
    assert.equal(byId.get(id).make().id, id);
  }
});

test('正多面体：展开布局可用且不卡（含 20 面二十面体）', () => {
  for (const s of PLATONIC) {
    const g = s.make();
    const t0 = Date.now();
    assert.ok(canUnfold(g), `${s.id} canUnfold`);
    const layout = unfoldLayout(g);
    const ms = layout.transformsAt(1); // 完全展开姿态能算出
    assert.equal(ms.length, g.faces.length, `${s.id} 变换数量`);
    assert.ok(Date.now() - t0 < 1000, `${s.id} 展开耗时 ${Date.now() - t0}ms`);
  }
});

test('beauty.js 在无 DOM 的 node 里可 import，且卡片音频 id 都在台词表中', async () => {
  const m = await import('../src/ui/beauty.js');
  assert.equal(typeof m.initBeauty, 'function');
  assert.equal(typeof m.destroy, 'function');
  assert.ok(Array.isArray(m.BEAUTY_CARDS) && m.BEAUTY_CARDS.length >= 5);
  const { readFileSync } = await import('node:fs');
  const py = readFileSync(new URL('../tools/tts_lines.py', import.meta.url), 'utf8');
  for (const card of m.BEAUTY_CARDS) {
    assert.ok(card.title && card.share, `${card.id} 缺标题或分享文案`);
    const audios = [...(Array.isArray(card.audio) ? card.audio : card.audio ? [card.audio] : []),
      ...(card.extraAudios || [])];
    for (const a of audios) {
      assert.ok(py.includes(`("${a}"`), `tts_lines.py 缺台词 ${a}`);
    }
  }
});
