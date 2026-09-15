// 三视图 SVG 渲染：教材排版（正视图左上、侧视图右上、俯视图左下，统一比例，
// 正俯长对正、正侧高平齐）。实线深灰、虚线浅灰，面板带标题，随容器宽度自适应。
import { threeViews } from '@geo/core/geo/views.js';

const NS = 'http://www.w3.org/2000/svg';
const COLORS = { solid: '#33415c', hidden: '#a3b4c9', title: '#4a5a6d' };

function svgEl(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

/** 由几何体构造三视图面板元素（div.threeview-pane > svg）。 */
export function createThreeViewPane(solid) {
  const v = threeViews(solid);

  // 统一比例（单位即几何单位），三面板按教材排版摆放
  const pad = 0.5,
    gap = 0.9,
    titleH = 0.65;
  const wF = v.front.width,
    hF = v.front.height;
  const wS = v.side.width; // 侧视高 = 正视高（同为 y 向跨度，天然平齐）
  const hT = v.top.height; // 俯视宽 = 正视宽（同为 x 向跨度，天然对正）
  const span = Math.max(wF, hF, wS, v.top.width, hT, 1e-6);
  const lw = Math.max(span * 0.008, 0.015); // 线宽
  const x0 = pad,
    y0 = pad + titleH;
  const cells = {
    front: { x: x0, y: y0, title: '正视图' },
    side: { x: x0 + wF + gap, y: y0, title: '侧视图' },
    top: { x: x0, y: y0 + hF + gap, title: '俯视图' },
  };
  const svgW = pad * 2 + wF + gap + wS;
  const svgH = pad * 2 + titleH + hF + gap + hT;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${svgW.toFixed(4)} ${svgH.toFixed(4)}`,
    role: 'img',
    'aria-label': '三视图',
  });

  for (const key of ['front', 'side', 'top']) {
    const view = v[key];
    const cell = cells[key];
    // 面板内容在单元格内居中（理论上正视/侧视等高、正视/俯视等宽，居中即对齐）
    const ox = cell.x + (key === 'side' ? 0 : 0); // 左对齐即可保证对正/平齐
    const oy = cell.y;
    const mapX = (u) => ox + (u - view.bounds.minX);
    const mapY = (w) => oy + (view.bounds.maxY - w); // 2D y 向上 → SVG y 向下
    for (const s of view.segments) {
      const attrs = {
        x1: mapX(s.a[0]).toFixed(4),
        y1: mapY(s.a[1]).toFixed(4),
        x2: mapX(s.b[0]).toFixed(4),
        y2: mapY(s.b[1]).toFixed(4),
        stroke: s.hidden ? COLORS.hidden : COLORS.solid,
        'stroke-width': lw.toFixed(4),
        'stroke-linecap': 'round',
      };
      if (s.hidden) attrs['stroke-dasharray'] = `${(lw * 4).toFixed(4)} ${(lw * 3).toFixed(4)}`;
      svg.appendChild(svgEl('line', attrs));
    }
    const title = svgEl('text', {
      x: (cell.x + (key === 'top' ? wF : key === 'front' ? wF : wS) / 2).toFixed(4),
      y: (cell.y - 0.18).toFixed(4),
      'text-anchor': 'middle',
      'font-size': Math.max(span * 0.09, 0.32).toFixed(4),
      fill: COLORS.title,
    });
    title.textContent = cell.title;
    svg.appendChild(title);
  }

  const pane = document.createElement('div');
  pane.className = 'threeview-pane';
  pane.appendChild(svg);
  return pane;
}

/** 清空 container 并渲染该几何体的三视图。 */
export function renderThreeViews(container, solid) {
  container.innerHTML = '';
  container.appendChild(createThreeViewPane(solid));
}
