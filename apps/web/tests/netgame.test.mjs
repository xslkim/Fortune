// 「展开图闯关」题库引擎测试：11 种合法展开图生成、判定器、相对面查询与真实折叠对照、关卡生成器。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cube } from '@geo/core/geo/solids.js';
import { unfoldLayout, applyPoint } from '@geo/core/geo/unfold.js';
import { normFace, faceNormal } from '@geo/core/geo/topology.js';
import {
  cubeNets,
  canFold,
  foldNet,
  isOpposite,
  oppositeOf,
  analyzeNet,
  canonicalKey,
  makeRng,
  randomHexomino,
  generateLevels,
  LEVEL_COUNT,
  normalizeProgress,
  isLevelUnlocked,
} from '@geo/core/data/netgame.js';
import * as store from '../src/engine/store.js';
import { loadProgress, saveProgress } from '../src/ui/netgame.js';

const vecKey = (v) => v.join(',');

test('正方体合法展开图程序化生成：去重后恰好 11 种', () => {
  const nets = cubeNets();
  assert.equal(nets.length, 11, `应为 11 种，实际 ${nets.length}`);
  const keys = new Set(nets.map((n) => n.key));
  assert.equal(keys.size, 11, '规范形应互不相同');
  for (const n of nets) {
    assert.equal(n.cells.length, 6);
    assert.equal(new Set(n.cells.map(([x, y]) => `${x},${y}`)).size, 6, '格不应重叠');
    assert.ok(canFold(n.cells), `应能折成正方体：${n.key}`);
  }
});

test('判定器：11 种合法展开图全部判合法', () => {
  for (const n of cubeNets()) {
    const a = analyzeNet(n.cells);
    assert.ok(a.ok, `${n.key} 被判为非法（${a.reason}）`);
  }
});

test('判定器：5 个经典非法连方全部判非法', () => {
  const classics = {
    '田字形 2×3 矩形': [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    '一字长蛇 1×6': [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
    ],
    五连格挂一角: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [2, 1],
    ],
    含田字块带尾巴: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 0],
      [3, 0],
    ],
    凹字形: [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [2, 1],
      [0, 2],
    ],
  };
  for (const [name, cells] of Object.entries(classics)) {
    assert.ok(!canFold(cells), `${name} 应判非法`);
  }
  // 退化输入也不放过
  assert.equal(
    analyzeNet([
      [0, 0],
      [1, 0],
      [2, 0],
    ]).reason,
    'not-six',
  );
  assert.equal(
    analyzeNet([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [6, 0],
    ]).reason,
    'disconnected',
  );
  // 非法诊断：重叠格下标可用于 UI 讲解
  const a = analyzeNet(classics['一字长蛇 1×6']);
  assert.equal(a.reason, 'overlap');
  assert.ok(Array.isArray(a.overlap) && a.overlap.length === 2);
});

test('相对面查询：与 cube() 真实面法线一致（11 种展开图全量对照）', () => {
  const g = cube();
  const realNormals = new Set(
    g.faces.map((f) => vecKey(faceNormal(g.points, normFace(f).idx).map(Math.round))),
  );
  for (const n of cubeNets()) {
    const frames = foldNet(n.cells);
    assert.ok(frames, n.key);
    // 6 格折叠朝向必须与正方体 6 个面法线一一对应
    const mapped = frames.map((f) => vecKey(f.n));
    assert.equal(new Set(mapped).size, 6, n.key);
    for (const k of mapped) assert.ok(realNormals.has(k), `${n.key} 出现非正方体朝向 ${k}`);
    // 每格恰有一个相对面，且相对关系对称
    for (let i = 0; i < 6; i++) {
      const j = oppositeOf(n.cells, i);
      assert.ok(j >= 0 && j !== i, `${n.key} 格 ${i} 应有相对面`);
      assert.ok(isOpposite(n.cells, i, j) && isOpposite(n.cells, j, i));
      assert.equal(oppositeOf(n.cells, j), i);
    }
    // 全部 15 对格中恰有 3 对相对
    let pairs = 0;
    for (let i = 0; i < 6; i++)
      for (let j = i + 1; j < 6; j++) if (isOpposite(n.cells, i, j)) pairs++;
    assert.equal(pairs, 3, n.key);
  }
});

test('相对面查询：与 unfold.js 真实展开结果对照一致', () => {
  const g = cube(2);
  const L = unfoldLayout(g);
  const mats = L.transformsAt(1);
  // 取 t=1 时各面面心（在根面平面 y=0 内），按边长 2 吸附到 2D 网格
  const centers = g.faces.map((_, fi) => {
    const idx = normFace(g.faces[fi]).idx;
    const c = [0, 0, 0];
    for (const i of idx) {
      const p = applyPoint(mats[fi], g.points[i].p);
      c[0] += p[0];
      c[1] += p[1];
      c[2] += p[2];
    }
    return c.map((v) => v / idx.length);
  });
  const [x0, , z0] = centers[0];
  const cells = centers.map((c) => [Math.round((c[0] - x0) / 2), Math.round((c[2] - z0) / 2)]);

  // unfold.js 摆出的图形必为合法展开图，且属于 11 种之一
  assert.ok(canFold(cells), `unfold.js 展开结果应合法：${JSON.stringify(cells)}`);
  const keys = new Set(cubeNets().map((n) => n.key));
  assert.ok(keys.has(canonicalKey(cells)), 'unfold.js 展开结果应在 11 种之中');

  // cells 下标 = cube 面下标：isOpposite 必须与真实面法线相反完全一致
  const fn = g.faces.map((f) => faceNormal(g.points, normFace(f).idx).map(Math.round));
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      const realOpp = i !== j && fn[i].every((v, k) => v === -fn[j][k]);
      assert.equal(isOpposite(cells, i, j), realOpp, `面 ${i} 与面 ${j}`);
    }
  }
});

test('随机连方发生器：确定性（同种子同结果）且含田字块模式必非法', () => {
  const rng1 = makeRng(7),
    rng2 = makeRng(7);
  for (let k = 0; k < 20; k++) {
    const a = randomHexomino(rng1),
      b = randomHexomino(rng2);
    assert.deepEqual(a, b);
    assert.equal(a.length, 6);
  }
  const rng3 = makeRng(99);
  for (let k = 0; k < 10; k++) {
    assert.ok(!canFold(randomHexomino(rng3, { withBlock: true })), '含田字块必非法');
  }
});

test('关卡生成器：15 关、类型分段正确、固定种子可复现', () => {
  const a = generateLevels(20260913);
  assert.equal(a.length, LEVEL_COUNT);
  assert.deepEqual(
    a.map((l) => l.type),
    [...Array(5).fill('judge'), ...Array(5).fill('opposite'), ...Array(5).fill('pick')],
  );
  assert.ok(
    a.some((l) => l.type === 'judge' && l.answer),
    'judge 关应有能折成的',
  );
  assert.ok(
    a.some((l) => l.type === 'judge' && !l.answer),
    'judge 关应有折不成的',
  );
  // 同种子完全复现，异种子应有差异
  assert.equal(JSON.stringify(generateLevels(20260913)), JSON.stringify(a));
  assert.notEqual(JSON.stringify(generateLevels(1)), JSON.stringify(a));
});

test('关卡生成器：各关答案经判定器/相对面查询校验正确', () => {
  for (const seed of [20260913, 1, 42, 777]) {
    const levels = generateLevels(seed);
    for (const lv of levels) {
      if (lv.type === 'judge') {
        assert.equal(canFold(lv.cells), lv.answer, `种子 ${seed} 第 ${lv.id} 关`);
      } else if (lv.type === 'opposite') {
        assert.ok(canFold(lv.cells), `种子 ${seed} 第 ${lv.id} 关题面应合法`);
        assert.ok(isOpposite(lv.cells, lv.marked, lv.answer), `种子 ${seed} 第 ${lv.id} 关答案`);
        assert.equal(lv.options.length, 4);
        assert.ok(lv.options.includes(lv.answer));
        assert.ok(!lv.options.includes(lv.marked), '选项不应含被标记面自身');
        for (const o of lv.options) {
          if (o !== lv.answer) {
            assert.ok(
              !isOpposite(lv.cells, lv.marked, o),
              `种子 ${seed} 第 ${lv.id} 关干扰项 ${o}`,
            );
          }
        }
      } else {
        assert.equal(lv.options.length, 4);
        const legal = lv.options.filter((o) => canFold(o));
        assert.equal(legal.length, 1, `种子 ${seed} 第 ${lv.id} 关应恰有一个合法选项`);
        assert.ok(canFold(lv.options[lv.answer]), `种子 ${seed} 第 ${lv.id} 关答案`);
      }
    }
    // 13 关起必有含田字块的陷阱选项
    for (const lv of levels.slice(12)) {
      const hasBlock = lv.options.some((cells, i) => {
        if (i === lv.answer) return false;
        const set = new Set(cells.map(([x, y]) => `${x},${y}`));
        return cells.some(
          ([x, y]) =>
            set.has(`${x + 1},${y}`) && set.has(`${x},${y + 1}`) && set.has(`${x + 1},${y + 1}`),
        );
      });
      assert.ok(hasBlock, `种子 ${seed} 第 ${lv.id} 关应含田字陷阱`);
    }
  }
});

test('闯关进度：新结构规范化、旧版星级数组按无记录处理', () => {
  // 缺失/损坏：全零进度
  for (const raw of [null, undefined, 42, 'x', [3, 2, 1], { levels: 'nope' }]) {
    const p = normalizeProgress(raw);
    assert.equal(p.levels.length, LEVEL_COUNT);
    assert.ok(p.levels.every((l) => l.stars === 0 && !l.passed));
  }
  // 新结构：读回 per-level 星数/通过状态，越界与脏数据容错
  const p = normalizeProgress({
    levels: [{ stars: 3, passed: true }, { stars: 99, passed: false }, 'junk', null],
  });
  assert.deepEqual(p.levels[0], { stars: 3, passed: true });
  assert.equal(p.levels[1].stars, 3, '星数应被夹到 0-3');
  assert.equal(p.levels[1].passed, true, 'stars>0 视为已通过');
  assert.ok(!p.levels[2].passed && !p.levels[3].passed);
});

test('顺序锁：第 N 关通过后才解锁第 N+1 关；进度存取可往返', () => {
  const p = normalizeProgress(null);
  assert.ok(isLevelUnlocked(p, 0), '第 1 关恒可玩');
  assert.ok(!isLevelUnlocked(p, 1));
  assert.ok(!isLevelUnlocked(p, LEVEL_COUNT - 1));
  assert.ok(!isLevelUnlocked(p, LEVEL_COUNT), '越界不解锁');
  p.levels[0] = { stars: 1, passed: true };
  assert.ok(isLevelUnlocked(p, 1), '第 1 关通过后解锁第 2 关');
  assert.ok(!isLevelUnlocked(p, 2));
  p.levels[LEVEL_COUNT - 2] = { stars: 2, passed: true };
  assert.ok(isLevelUnlocked(p, LEVEL_COUNT - 1));

  // 存取往返：node 无 localStorage，store 自动降级为内存 Map，不污染真实存储
  store.remove(store.STORAGE_KEYS.netgame);
  saveProgress(p);
  const back = loadProgress();
  assert.deepEqual(back.levels[0], { stars: 1, passed: true });
  assert.equal(back.levels[1].passed, false);
  assert.ok(isLevelUnlocked(back, 1));
  store.remove(store.STORAGE_KEYS.netgame);
});
