// 拓扑与可见性：从面数据推导边，并按视线方向分类 正面/背面/轮廓线。
// 对应 Unity Geomertry 项目的硬边/软边与正背面分类逻辑（那里在 shader 做，这里在 CPU 做，
// 因为教学场景边数量级很小，CPU 每帧算足够快，且逻辑更容易测试）。

export function vsub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
export function vcross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
export function vdot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
export function vlen(a) { return Math.hypot(a[0], a[1], a[2]); }
export function vnorm(a) { const l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

/** 规范化 face 表示：{idx:[...], smooth} 或裸数组 → {idx, smooth} */
export function normFace(face) {
  return Array.isArray(face) ? { idx: face, smooth: false } : face;
}

/** 面法线（Newell 方法，适合任意平面多边形）。 */
export function faceNormal(points, idx) {
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < idx.length; i++) {
    const p = points[idx[i]].p, q = points[idx[(i + 1) % idx.length]].p;
    nx += (p[1] - q[1]) * (p[2] + q[2]);
    ny += (p[2] - q[2]) * (p[0] + q[0]);
    nz += (p[0] - q[0]) * (p[1] + q[1]);
  }
  return vnorm([nx, ny, nz]);
}

export function faceCenter(points, idx) {
  const c = [0, 0, 0];
  for (const i of idx) { const p = points[i].p; c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }
  return [c[0] / idx.length, c[1] / idx.length, c[2] / idx.length];
}

/**
 * 从面推导边。返回 [{a, b, faces:[fIdx...], smooth}]。
 * smooth=true 的边是旋转体侧面离散产生（相邻面都 smooth），只在成为轮廓线时显示。
 */
export function buildEdges(faces) {
  const map = new Map();
  faces.forEach((face, fi) => {
    const { idx, smooth } = normFace(face);
    for (let i = 0; i < idx.length; i++) {
      const a = idx[i], b = idx[(i + 1) % idx.length];
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      let e = map.get(key);
      if (!e) { e = { a: Math.min(a, b), b: Math.max(a, b), faces: [], smooth: true }; map.set(key, e); }
      e.faces.push(fi);
      if (!smooth) e.smooth = false;
    }
  });
  return [...map.values()];
}

/** 面朝向：'front' | 'back'（相对 eye 位置）。 */
export function classifyFaces(points, faces, eye) {
  return faces.map((face) => {
    const f = normFace(face);
    const n = faceNormal(points, f.idx);
    const toEye = vsub(eye, faceCenter(points, f.idx));
    return vdot(n, toEye) >= 0 ? 'front' : 'back';
  });
}

/**
 * 边分类：'front'（两侧面都朝向眼睛）、'back'（两侧面都背向）、'silhouette'（一正一背）。
 * smooth 软边只有 silhouette 时需要显示。
 */
export function classifyEdges(edges, faceFacing) {
  return edges.map((e) => {
    const facings = e.faces.map((f) => faceFacing[f]);
    const allFront = facings.every((x) => x === 'front');
    const allBack = facings.every((x) => x === 'back');
    if (allFront) return 'front';
    if (allBack) return 'back';
    return 'silhouette';
  });
}

/**
 * 平面截几何体：plane = {n:[x,y,z], d}，满足 n·x = d。
 * 返回截口多边形的 3D 顶点序列（已排序成环），无截面返回 []。
 * 通过对每条边求与平面交点、再去重、绕质心按角度排序实现（适用凸几何体）。
 */
export function sectionPolygon(points, edges, plane) {
  const { n, d } = plane;
  const pts = [];
  const seen = new Set();
  for (const e of edges) {
    const pa = points[e.a].p, pb = points[e.b].p;
    const da = vdot(n, pa) - d, db = vdot(n, pb) - d;
    if (da * db > 0) continue;
    if (Math.abs(da) < 1e-9 && Math.abs(db) < 1e-9) continue; // 边在平面内，忽略退化情形
    let p;
    if (Math.abs(da) < 1e-9) p = pa;
    else if (Math.abs(db) < 1e-9) p = pb;
    else {
      const t = da / (da - db);
      p = [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, pa[2] + (pb[2] - pa[2]) * t];
    }
    const key = p.map((v) => v.toFixed(6)).join(',');
    if (!seen.has(key)) { seen.add(key); pts.push(p); }
  }
  if (pts.length < 3) return [];
  // 绕质心按平面内角度排序
  const c = [0, 0, 0];
  for (const p of pts) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }
  c[0] /= pts.length; c[1] /= pts.length; c[2] /= pts.length;
  const nn = vnorm(n);
  const ref = Math.abs(nn[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = vnorm(vcross(nn, ref));
  const v = vcross(nn, u);
  pts.sort((p, q) => {
    const dp = vsub(p, c), dq = vsub(q, c);
    return Math.atan2(vdot(dp, v), vdot(dp, u)) - Math.atan2(vdot(dq, v), vdot(dq, u));
  });
  return pts;
}
