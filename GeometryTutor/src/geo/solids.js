// 几何体程序化定义：与 Geomertry/Unity 项目同构——顶点数组 + 按面分组的有序索引。
import { faceNormal, faceCenter, vsub, vdot } from './topology.js';
// 每个面是从几何体外侧看逆时针(CCW)排列的顶点索引多边形。
// 顶点带 label（中文教材惯例：底面 A B C D…，顶面对应 A₁ B₁…，锥顶 P）。
// 旋转体(圆柱/圆锥/球)相邻侧面之间的边标记 smooth=true，查看器只在它成为轮廓线时才画。

const SUBSCRIPT = { '1': '₁', '2': '₂', '3': '₃' };

export function sub(label) {
  return label.replace(/[123]$/, (m) => SUBSCRIPT[m]);
}

function solid(id, name, points, faces, opts = {}) {
  return { id, name, points, faces, ...opts };
}

// points: [{ p: [x,y,z], label }]
function pt(x, y, z, label) {
  return { p: [x, y, z], label };
}

/** 长方体（底面在 y=0）。底面 ABCD 逆时针，顶面 A1B1C1D1。 */
export function box(a = 2, b = 3, c = 4) {
  const [x, z] = [a / 2, c / 2];
  const points = [
    pt(-x, 0, -z, 'A'), pt(x, 0, -z, 'B'), pt(x, 0, z, 'C'), pt(-x, 0, z, 'D'),
    pt(-x, b, -z, 'A1'), pt(x, b, -z, 'B1'), pt(x, b, z, 'C1'), pt(-x, b, z, 'D1'),
  ];
  const faces = [
    [0, 1, 2, 3], // 底面 ABCD（法线 -y）
    [4, 7, 6, 5], // 顶面（法线 +y）
    [0, 4, 5, 1], // 前 ABB1A1
    [1, 5, 6, 2], // 右
    [2, 6, 7, 3], // 后
    [3, 7, 4, 0], // 左
  ];
  return solid('box', '长方体', points, faces);
}

export function cube(s = 2) {
  const g = box(s, s, s);
  g.id = 'cube';
  g.name = '正方体';
  return g;
}

/** 正 n 棱柱。底面正 n 边形在 y=0，第一顶点在 -z 方向。 */
export function prism(n = 3, r = 1.6, h = 2.6) {
  const points = [];
  for (let i = 0; i < n; i++) {
    const t = -Math.PI / 2 + (2 * Math.PI * i) / n;
    points.push(pt(r * Math.cos(t), 0, r * Math.sin(t), String.fromCharCode(65 + i)));
  }
  for (let i = 0; i < n; i++) {
    const t = -Math.PI / 2 + (2 * Math.PI * i) / n;
    points.push(pt(r * Math.cos(t), h, r * Math.sin(t), String.fromCharCode(65 + i) + '1'));
  }
  const bottom = [], top = [];
  for (let i = 0; i < n; i++) { bottom.push(i); top.push(2 * n - 1 - i); }
  const faces = [bottom, top];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    faces.push([i, n + i, n + j, j]);
  }
  const names = { 3: '三棱柱', 4: '四棱柱', 5: '五棱柱', 6: '六棱柱' };
  return solid(`prism${n}`, `正${names[n] || n + '棱柱'}`, points, faces);
}

/** 正 n 棱锥。底面正 n 边形在 y=0，顶点 P 在轴上。 */
export function pyramid(n = 4, r = 1.8, h = 2.6) {
  const points = [];
  for (let i = 0; i < n; i++) {
    const t = -Math.PI / 2 + (2 * Math.PI * i) / n;
    points.push(pt(r * Math.cos(t), 0, r * Math.sin(t), String.fromCharCode(65 + i)));
  }
  points.push(pt(0, h, 0, 'P'));
  const base = [];
  for (let i = 0; i < n; i++) base.push(i);
  const faces = [base];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    faces.push([i, n, j]);
  }
  const names = { 3: '三棱锥', 4: '四棱锥', 5: '五棱锥', 6: '六棱锥' };
  return solid(`pyramid${n}`, `正${names[n] || n + '棱锥'}`, points, faces);
}

/** 圆柱（侧面离散为 seg 段；侧面之间的边 smooth）。 */
export function cylinder(r = 1.4, h = 2.6, seg = 48) {
  const points = [];
  for (let i = 0; i < seg; i++) {
    const t = (2 * Math.PI * i) / seg;
    points.push(pt(r * Math.cos(t), 0, r * Math.sin(t), i === 0 ? 'A' : ''));
  }
  for (let i = 0; i < seg; i++) {
    const t = (2 * Math.PI * i) / seg;
    points.push(pt(r * Math.cos(t), h, r * Math.sin(t), i === 0 ? 'A1' : ''));
  }
  const bottom = [], top = [];
  for (let i = 0; i < seg; i++) { bottom.push(i); top.push(2 * seg - 1 - i); }
  const faces = [
    { idx: bottom },
    { idx: top },
  ];
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    faces.push({ idx: [i, seg + i, seg + j, j], smooth: true });
  }
  return solid('cylinder', '圆柱', points, faces);
}

/** 圆锥。底面 + seg 个三角形侧面。 */
export function cone(r = 1.6, h = 2.6, seg = 48) {
  const points = [];
  for (let i = 0; i < seg; i++) {
    const t = (2 * Math.PI * i) / seg;
    points.push(pt(r * Math.cos(t), 0, r * Math.sin(t), i === 0 ? 'A' : ''));
  }
  points.push(pt(0, h, 0, 'P'));
  const base = [];
  for (let i = 0; i < seg; i++) base.push(i);
  const faces = [{ idx: base }];
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    faces.push({ idx: [i, seg, j], smooth: true });
  }
  return solid('cone', '圆锥', points, faces);
}

/** 圆台。 */
export function frustum(r1 = 1.6, r2 = 0.9, h = 2.2, seg = 48) {
  const points = [];
  for (let i = 0; i < seg; i++) {
    const t = (2 * Math.PI * i) / seg;
    points.push(pt(r1 * Math.cos(t), 0, r1 * Math.sin(t), ''));
  }
  for (let i = 0; i < seg; i++) {
    const t = (2 * Math.PI * i) / seg;
    points.push(pt(r2 * Math.cos(t), h, r2 * Math.sin(t), ''));
  }
  const bottom = [], top = [];
  for (let i = 0; i < seg; i++) { bottom.push(i); top.push(2 * seg - 1 - i); }
  const faces = [{ idx: bottom }, { idx: top }];
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    faces.push({ idx: [i, seg + i, seg + j, j], smooth: true });
  }
  return solid('frustum', '圆台', points, faces);
}

/** 球（UV 网格，全部边 smooth）。 */
export function sphere(r = 1.6, wseg = 32, hseg = 24) {
  const points = [pt(0, r, 0, '')]; // 北极
  for (let j = 1; j < hseg; j++) {
    const phi = (Math.PI * j) / hseg;
    for (let i = 0; i < wseg; i++) {
      const t = (2 * Math.PI * i) / wseg;
      points.push(pt(r * Math.sin(phi) * Math.cos(t), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(t), ''));
    }
  }
  const south = points.length;
  points.push(pt(0, -r, 0, ''));
  const faces = [];
  const at = (j, i) => 1 + (j - 1) * wseg + ((i % wseg + wseg) % wseg);
  for (let i = 0; i < wseg; i++) faces.push({ idx: [0, at(1, i + 1), at(1, i)], smooth: true });
  for (let j = 1; j < hseg - 1; j++) {
    for (let i = 0; i < wseg; i++) {
      faces.push({ idx: [at(j, i), at(j, i + 1), at(j + 1, i + 1), at(j + 1, i)], smooth: true });
    }
  }
  for (let i = 0; i < wseg; i++) faces.push({ idx: [at(hseg - 1, i), at(hseg - 1, i + 1), south], smooth: true });
  // 球心移到原点
  for (const q of points) q.p[1] -= 0; // 保持 y ∈ [-r, r]，北极在 r
  return solid('sphere', '球', points, faces);
}

// ---------- 柏拉图立体（五种正多面体） ----------

/** 黄金比例 φ：正十二面体、正二十面体的标准顶点坐标都要用到它。 */
export const PHI = (1 + Math.sqrt(5)) / 2;

/** 正四面体。底面正三角形 ABC 在 y=0，锥顶 P 在轴上，棱长 2。 */
export function tetrahedron() {
  const r = 2 / Math.sqrt(3);        // 底面外接圆半径 = a/√3
  const h = (2 * Math.sqrt(6)) / 3;  // 高 = a√6/3
  const points = [];
  for (let i = 0; i < 3; i++) {
    const t = -Math.PI / 2 + (2 * Math.PI * i) / 3;
    points.push(pt(r * Math.cos(t), 0, r * Math.sin(t), 'ABC'[i]));
  }
  points.push(pt(0, h, 0, 'P'));
  const faces = [
    [0, 1, 2], // 底面 ABC（法线 -y）
    [0, 3, 1], [1, 3, 2], [2, 3, 0], // 侧面（与 pyramid 同绕向）
  ];
  return solid('tetrahedron', '正四面体', points, faces);
}

/** 正八面体。上下顶点 P1/P2，中间正方形 ABCD 在 y=0，中心在原点，棱长 √2。 */
export function octahedron() {
  const points = [
    pt(0, 0, -1, 'A'), pt(1, 0, 0, 'B'), pt(0, 0, 1, 'C'), pt(-1, 0, 0, 'D'),
    pt(0, 1, 0, 'P1'), pt(0, -1, 0, 'P2'),
  ];
  const faces = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    faces.push([4, j, i]); // 上半：P1 与环边 (i,j)
    faces.push([5, i, j]); // 下半：P2 与环边 (i,j)
  }
  return solid('octahedron', '正八面体', points, faces);
}

/**
 * 由标准顶点坐标推导面：棱 = 距离最近的点对，面 = 棱图中的 size 元环。
 * 二十面体/十二面体的面按此法生成，再按 Newell 法线统一翻转成朝外（法线·面心 > 0）。
 * 顶点须关于质心对称（标准坐标均以原点为中心）。
 */
function platonicFaces(points, size) {
  const n = points.length;
  const P = points.map((q) => q.p);
  let dmin = Infinity;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1], P[i][2] - P[j][2]);
      if (d < dmin) dmin = d;
    }
  }
  const eps = dmin * 1e-6;
  const nbr = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1], P[i][2] - P[j][2]);
      if (Math.abs(d - dmin) < eps) { nbr[i].push(j); nbr[j].push(i); }
    }
  }
  // 枚举所有 size 元环（起点为环上最小下标，排序 key 去重两个方向）
  const cycles = new Map();
  for (let s = 0; s < n; s++) {
    const path = [s];
    const inPath = new Set([s]);
    const dfs = (v) => {
      if (path.length === size) {
        if (nbr[v].includes(s)) {
          const key = [...path].sort((a, b) => a - b).join(',');
          if (!cycles.has(key)) cycles.set(key, [...path]);
        }
        return;
      }
      for (const w of nbr[v]) {
        if (w <= s || inPath.has(w)) continue;
        path.push(w); inPath.add(w);
        dfs(w);
        path.pop(); inPath.delete(w);
      }
    };
    dfs(s);
  }
  const center = [0, 0, 0];
  for (const p of P) { center[0] += p[0]; center[1] += p[1]; center[2] += p[2]; }
  center[0] /= n; center[1] /= n; center[2] /= n;
  return [...cycles.values()].map((idx) => {
    const nrm = faceNormal(points, idx);
    const c = faceCenter(points, idx);
    return vdot(nrm, vsub(c, center)) < 0 ? [...idx].reverse() : idx;
  });
}

/** 正二十面体。标准坐标 (0,±1,±φ) 及其循环置换共 12 顶点（A…L），中心在原点，棱长 2。 */
export function icosahedron() {
  const f = PHI;
  const raw = [
    [0, 1, f], [0, 1, -f], [0, -1, f], [0, -1, -f],
    [1, f, 0], [1, -f, 0], [-1, f, 0], [-1, -f, 0],
    [f, 0, 1], [f, 0, -1], [-f, 0, 1], [-f, 0, -1],
  ];
  const points = raw.map((p, i) => pt(p[0], p[1], p[2], String.fromCharCode(65 + i)));
  return solid('icosahedron', '正二十面体', points, platonicFaces(points, 3));
}

/**
 * 正十二面体。标准坐标 (±1,±1,±1)、(0,±1/φ,±φ) 及其循环置换共 20 顶点（A…T），
 * 中心在原点，棱长 2/φ。
 */
export function dodecahedron() {
  const f = PHI, g = 1 / PHI;
  const raw = [
    [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
    [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
    [0, g, f], [0, g, -f], [0, -g, f], [0, -g, -f],
    [g, f, 0], [g, -f, 0], [-g, f, 0], [-g, -f, 0],
    [f, 0, g], [f, 0, -g], [-f, 0, g], [-f, 0, -g],
  ];
  const points = raw.map((p, i) => pt(p[0], p[1], p[2], String.fromCharCode(65 + i)));
  return solid('dodecahedron', '正十二面体', points, platonicFaces(points, 5));
}

export const SOLID_BUILDERS = {
  cube, box, prism, pyramid, cylinder, cone, frustum, sphere,
  tetrahedron, octahedron, icosahedron, dodecahedron,
};

/** 目录页用的几何体清单。 */
export function catalog() {
  return [
    { id: 'cube', name: '正方体', make: () => cube() },
    { id: 'tetrahedron', name: '正四面体', make: () => tetrahedron() },
    { id: 'octahedron', name: '正八面体', make: () => octahedron() },
    { id: 'dodecahedron', name: '正十二面体', make: () => dodecahedron() },
    { id: 'icosahedron', name: '正二十面体', make: () => icosahedron() },
    { id: 'box', name: '长方体', make: () => box() },
    { id: 'prism3', name: '三棱柱', make: () => prism(3) },
    { id: 'prism6', name: '六棱柱', make: () => prism(6) },
    { id: 'pyramid3', name: '三棱锥', make: () => pyramid(3) },
    { id: 'pyramid4', name: '四棱锥', make: () => pyramid(4) },
    { id: 'cylinder', name: '圆柱', make: () => cylinder() },
    { id: 'cone', name: '圆锥', make: () => cone() },
    { id: 'frustum', name: '圆台', make: () => frustum() },
    { id: 'sphere', name: '球', make: () => sphere() },
  ];
}
