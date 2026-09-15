// 三视图（正交投影）：正视图（从 +z 向 -z 看，x 右 y 上）、侧视图/左视图（从 +x 向 -x 看，
// z 画成水平、+z 朝左——教材惯例：侧视图中物体前方靠近正视图一侧）、俯视图（从 +y 向 -y 看，
// x 右、+z 朝下——俯视图画在正视图下方，前后方向对应）。纯 JS 无 three 依赖，node 可单测。
// 可见性：用正交方向（无穷远 eye）给面分类——法线与视线方向点积 >0 正面、<0 背面、=0 侧立；
// 硬边两侧面都背向→虚线（被遮挡），否则实线；smooth 软边只在成为轮廓线（一正一背）时显示，
// 因此圆柱正视图是长方形、俯视图是圆，球三视图都是圆。重合线段去重（实线优先），
// 曲边（48 段离散的圆周）输出为折线段。
import { buildEdges, faceNormal, normFace, vcross, vdot, vnorm } from './topology.js';

const EPS = 1e-9;

/**
 * 沿 dir（从物体指向观察者的方向）正交投影并做可见性分类。
 * 返回 { segments:[{a:[x,y],b:[x,y],hidden,edge:[ai,bi]}], width, height, bounds }，
 * 2D 坐标 y 轴向上（SVG 渲染时自行翻转）；edge 是原 3D 顶点索引，便于测试/调试。
 */
export function projectView(solid, dir) {
  const d = vnorm(dir);
  const viewDir = [-d[0], -d[1], -d[2]]; // 观察方向（从观察者指向物体）
  // 屏幕基：right = viewDir × upRef；dir≈±y 时 upRef 取 -z（俯视图 +z 朝下）
  const upRef = Math.abs(d[1]) > 0.999 ? [0, 0, -1] : [0, 1, 0];
  const right = vnorm(vcross(viewDir, upRef));
  const up = vcross(right, viewDir);

  const faces = solid.faces.map(normFace);
  const facing = faces.map((f) => {
    const s = vdot(faceNormal(solid.points, f.idx), d);
    return s > EPS ? 1 : s < -EPS ? -1 : 0; // 1 正面 / -1 背面 / 0 侧立（与视线平行）
  });

  const segs = [];
  for (const e of buildEdges(solid.faces)) {
    const fs = e.faces.map((f) => facing[f]);
    let hidden = false;
    if (e.smooth) {
      // 软边只画轮廓线（两侧面一正一背），轮廓线必为实线
      if (!(fs.includes(1) && fs.includes(-1))) continue;
    } else {
      hidden = fs.length > 0 && fs.every((s) => s < 0); // 两侧面都背向 → 虚线
    }
    const pa = solid.points[e.a].p,
      pb = solid.points[e.b].p;
    const a2 = [vdot(pa, right), vdot(pa, up)];
    const b2 = [vdot(pb, right), vdot(pb, up)];
    if (Math.hypot(a2[0] - b2[0], a2[1] - b2[1]) < EPS) continue; // 沿视线方向的边退化为点
    segs.push({ a: a2, b: b2, hidden, edge: [e.a, e.b] });
  }

  // 重合线段去重（如正方体被遮挡的远面棱与外框重合）：实线优先
  const map = new Map();
  for (const s of segs) {
    const k1 = s.a.map((v) => v.toFixed(6)).join(',');
    const k2 = s.b.map((v) => v.toFixed(6)).join(',');
    const key = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
    const old = map.get(key);
    if (!old) map.set(key, s);
    else if (old.hidden && !s.hidden) old.hidden = false;
  }
  const segments = [...map.values()];

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const s of segments) {
    for (const p of [s.a, s.b]) {
      minX = Math.min(minX, p[0]);
      maxX = Math.max(maxX, p[0]);
      minY = Math.min(minY, p[1]);
      maxY = Math.max(maxY, p[1]);
    }
  }
  if (!segments.length) {
    minX = maxX = minY = maxY = 0;
  }
  return {
    segments,
    width: maxX - minX,
    height: maxY - minY,
    bounds: { minX, maxX, minY, maxY },
  };
}

/** 教材三视图：front 正视图 / side 侧视图（左视图）/ top 俯视图。 */
export function threeViews(solid) {
  return {
    front: projectView(solid, [0, 0, 1]),
    side: projectView(solid, [1, 0, 0]),
    top: projectView(solid, [0, 1, 0]),
  };
}
