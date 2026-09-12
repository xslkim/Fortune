// 3D 画布组件：WebGL canvas + 顶点文字标注层（绝对定位 view，同层渲染）+ 触控转发。
// 用法：<geo-canvas ref="gl" :show-labels="true" @ready="onViewerReady" />
// ready 回调拿到 GeoViewerMP 实例后调用其 setSolid/highlight/setSpin/setSection/setUnfold 等 API。
// 标注层已做 ~50ms 节流以降低 setData 压力。注意：webgl canvas 是原生组件，
// 标注层依赖同层渲染；旧基础库若同层渲染失效，标注会被 canvas 盖住（见 SMOKE.md）。
<template>
  <view class="geo-wrap" :style="{ height: height + 'px' }">
    <canvas
      type="webgl"
      :id="canvasId"
      class="geo-canvas"
      :disable-scroll="true"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    ></canvas>
    <view
      v-for="l in labels"
      :key="l.key"
      class="vtx-label"
      :class="{ dim: l.dim }"
      :style="{ left: l.x + 'px', top: l.y + 'px' }"
    >{{ l.text }}</view>
  </view>
</template>

<script>
import { GeoViewerMP } from '../viewer/mpviewer.js';

let uid = 0;

export default {
  props: {
    height: { type: Number, default: 300 }, // CSS px
    showLabels: { type: Boolean, default: false },
  },
  emits: ['ready'],
  data() {
    return {
      canvasId: `glcanvas-${++uid}`,
      labels: [],
    };
  },
  mounted() {
    // canvas 原生组件在 page onReady 后才可靠拿到 node
    this.$nextTick(() => setTimeout(() => this._init(), 60));
  },
  beforeUnmount() {
    if (this.viewer) {
      this.viewer.dispose();
      this.viewer = null;
    }
  },
  methods: {
    _init() {
      uni
        .createSelectorQuery()
        .in(this)
        .select(`#${this.canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          const info = res && res[0];
          if (!info || !info.node) {
            console.warn('[geo-canvas] 未拿到 canvas node');
            return;
          }
          const sys = uni.getSystemInfoSync();
          const dpr = sys.pixelRatio || 1;
          const viewer = new GeoViewerMP(info.node, {
            width: info.width,
            height: info.height,
            dpr,
          });
          viewer.onLabels = (labels) => {
            if (this.showLabels) this.labels = labels;
          };
          this.viewer = viewer;
          this.$emit('ready', viewer);
        });
    },
    onTouchStart(e) {
      if (this.viewer) this.viewer.touchStart(e);
    },
    onTouchMove(e) {
      if (this.viewer) this.viewer.touchMove(e);
    },
    onTouchEnd(e) {
      if (this.viewer) this.viewer.touchEnd(e);
    },
  },
};
</script>

<style scoped>
.geo-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #f6f8fb;
}

.geo-canvas {
  width: 100%;
  height: 100%;
}

.vtx-label {
  position: absolute;
  transform: translate(-50%, -130%);
  font-size: 22rpx;
  color: #274156;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 8rpx;
  padding: 0 8rpx;
  pointer-events: none;
  white-space: nowrap;
}

.vtx-label.dim {
  opacity: 0.35;
}
</style>
