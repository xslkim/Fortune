// 三视图面板：canvas 2d 绘制（小程序不支持内联 SVG）。
// 排版对齐 web 版 src/ui/threeview.js：正视左上、侧视右上、俯视左下，统一比例，
// 实线深灰、被遮挡棱虚线浅灰，带标题。
<template>
  <view class="tv-wrap">
    <canvas type="2d" :id="canvasId" class="tv-canvas" :style="{ width: cssW + 'px', height: cssH + 'px' }"></canvas>
  </view>
</template>

<script>
import { threeViews } from '../geo/views.js';

const COLORS = { solid: '#33415c', hidden: '#a3b4c9', title: '#4a5a6d', bg: '#ffffff' };
const MAX_W = 260; // CSS px 上限（浮层宽度）

let uid = 0;

export default {
  props: {
    solid: { type: Object, default: null },
  },
  data() {
    return {
      canvasId: `tvcanvas-${++uid}`,
      cssW: MAX_W,
      cssH: 200,
    };
  },
  watch: {
    solid: {
      immediate: true,
      handler() {
        this.$nextTick(() => setTimeout(() => this._draw(), 60));
      },
    },
  },
  methods: {
    _draw() {
      if (!this.solid) return;
      const v = threeViews(this.solid);

      // 与 web 版一致的布局参数（几何单位）
      const pad = 0.5, gap = 0.9, titleH = 0.65;
      const wF = v.front.width, hF = v.front.height;
      const wS = v.side.width, hT = v.top.height;
      const span = Math.max(wF, hF, wS, v.top.width, hT, 1e-6);
      const svgW = pad * 2 + wF + gap + wS;
      const svgH = pad * 2 + titleH + hF + gap + hT;

      const scale = MAX_W / svgW;
      this.cssW = MAX_W;
      this.cssH = Math.ceil(svgH * scale);

      uni
        .createSelectorQuery()
        .in(this)
        .select(`#${this.canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          const info = res && res[0];
          if (!info || !info.node) return;
          const canvas = info.node;
          const dpr = uni.getSystemInfoSync().pixelRatio || 1;
          canvas.width = this.cssW * dpr;
          canvas.height = this.cssH * dpr;
          const ctx = canvas.getContext('2d');
          ctx.scale(dpr * scale, dpr * scale);
          ctx.fillStyle = COLORS.bg;
          ctx.fillRect(0, 0, svgW, svgH);
          ctx.lineCap = 'round';

          const lw = Math.max(span * 0.008, 0.015);
          const x0 = pad, y0 = pad + titleH;
          const cells = {
            front: { x: x0, y: y0, title: '正视图', w: wF },
            side: { x: x0 + wF + gap, y: y0, title: '侧视图', w: wS },
            top: { x: x0, y: y0 + hF + gap, title: '俯视图', w: wF },
          };

          for (const key of ['front', 'side', 'top']) {
            const view = v[key];
            const cell = cells[key];
            const mapX = (u) => cell.x + (u - view.bounds.minX);
            const mapY = (w2) => cell.y + (view.bounds.maxY - w2);
            for (const s of view.segments) {
              ctx.beginPath();
              ctx.strokeStyle = s.hidden ? COLORS.hidden : COLORS.solid;
              ctx.lineWidth = lw;
              ctx.setLineDash(s.hidden ? [lw * 4, lw * 3] : []);
              ctx.moveTo(mapX(s.a[0]), mapY(s.a[1]));
              ctx.lineTo(mapX(s.b[0]), mapY(s.b[1]));
              ctx.stroke();
            }
            ctx.setLineDash([]);
            ctx.fillStyle = COLORS.title;
            ctx.font = `${Math.max(span * 0.09, 0.32)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(cell.title, cell.x + cell.w / 2, cell.y - 0.3);
          }
        });
    },
  },
};
</script>

<style scoped>
.tv-wrap {
  position: absolute;
  left: 16rpx;
  bottom: 16rpx;
  background: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(31, 58, 95, 0.18);
  padding: 8rpx;
  pointer-events: none;
}

.tv-canvas {
  display: block;
}
</style>
