// 实验室（tabBar 页）：几何体选择、自转、顶点标注、展开滑杆、截面滑杆、三视图面板、欧拉公式统计。
<template>
  <view class="page">
    <view class="gl-wrap">
      <geo-canvas :height="glHeight" :show-labels="labelsOn" @ready="onViewerReady" />
      <three-view v-if="viewsOn && solidData" :solid="solidData" />
    </view>

    <scroll-view scroll-y class="panel" :style="{ maxHeight: panelMaxH + 'px' }">
      <view class="panel-title">实验室</view>

      <view class="lab-row">
        <text>几何体：</text>
        <picker :range="solidNames" :value="solidIndex" @change="onSolidPick">
          <view class="picker-box" hover-class="cell-hover">{{ solidNames[solidIndex] }} ▾</view>
        </picker>
      </view>

      <view class="lab-row lab-toggles">
        <label class="lab-toggle">
          <switch :checked="spin" @change="(e) => setSpin(e.detail.value)" color="#1f3a5f" />
          <text>自转</text>
        </label>
        <label class="lab-toggle">
          <switch :checked="labelsOn" @change="(e) => setLabels(e.detail.value)" color="#1f3a5f" />
          <text>顶点标注</text>
        </label>
        <label class="lab-toggle">
          <switch :checked="viewsOn" @change="(e) => (viewsOn = e.detail.value)" color="#1f3a5f" />
          <text>三视图</text>
        </label>
        <label class="lab-toggle">
          <switch :checked="sectionOn" @change="(e) => setSectionOn(e.detail.value)" color="#1f3a5f" />
          <text>水平截面</text>
        </label>
      </view>

      <view class="lab-row" v-if="sectionOn">
        <slider
          class="lab-slider"
          :min="0"
          :max="1000"
          :value="Math.round(sectionT * 1000)"
          activeColor="#1f3a5f"
          @changing="onSectionSlide"
          @change="onSectionSlide"
        />
        <text class="muted">截面高度 h = {{ sectionH }} / {{ solidH }}</text>
      </view>

      <view class="lab-row">
        <button class="btn btn-small" :disabled="!unfoldable" @click="toggleUnfold">
          {{ unfold >= 1 ? '收起' : '展开' }}
        </button>
        <slider
          class="lab-slider"
          :min="0"
          :max="1000"
          :value="Math.round(unfold * 1000)"
          :disabled="!unfoldable"
          activeColor="#1f3a5f"
          @changing="onUnfoldSlide"
          @change="onUnfoldSlide"
        />
        <text class="muted">{{ unfoldable ? `展开程度 ${Math.round(unfold * 100)}%` : '该几何体不支持展开' }}</text>
      </view>

      <view class="stats">
        <view class="stat"><text class="num">{{ vCount }}</text><text class="cap">顶点 V</text></view>
        <view class="stat"><text class="num">{{ eCount }}</text><text class="cap">棱 E</text></view>
        <view class="stat"><text class="num">{{ fCount }}</text><text class="cap">面 F</text></view>
      </view>
      <view class="euler" :class="euler === 2 ? 'ok' : 'no'">
        欧拉公式：V − E + F = {{ vCount }} − {{ eCount }} + {{ fCount }} = {{ euler }}{{ euler === 2 ? ' ✓ 成立' : '' }}
      </view>
      <view class="muted">拖动 3D 区域旋转视角，双指捏合缩放。</view>
    </scroll-view>
  </view>
</template>

<script>
import GeoCanvas from '../../components/GeoCanvas.vue';
import ThreeView from '../../components/ThreeView.vue';
import { catalog } from '@geo/core/geo/solids.js';
import { buildEdges } from '@geo/core/geo/topology.js';
import * as audio from '../../engine/audio.js';

const CATALOG = catalog();

export default {
  components: { GeoCanvas, ThreeView },
  data() {
    return {
      glHeight: 320,
      panelMaxH: 400,
      viewer: null,
      solidData: null,
      solidIndex: 0,
      solidNames: CATALOG.map((c) => c.name),
      spin: false,
      labelsOn: true,
      viewsOn: false,
      sectionOn: false,
      sectionT: 0.5,
      unfold: 0,
      unfoldable: false,
      minY: 0,
      maxY: 1,
      vCount: 0,
      eCount: 0,
      fCount: 0,
    };
  },
  computed: {
    euler() {
      return this.vCount - this.eCount + this.fCount;
    },
    sectionH() {
      return (this.sectionT * (this.maxY - this.minY)).toFixed(2);
    },
    solidH() {
      return (this.maxY - this.minY).toFixed(2);
    },
  },
  onLoad(query = {}) {
    const sys = uni.getSystemInfoSync();
    const wh = sys.windowHeight || 640;
    this.glHeight = Math.round(wh * 0.45);
    this.panelMaxH = wh - this.glHeight - 60;
    // 深链：?solid=<id> 直达指定几何体（对齐 web 版 ?view=lab&solid=xxx）
    if (query.solid) {
      const idx = CATALOG.findIndex((c) => c.id === query.solid);
      this._initialSolidIndex = idx >= 0 ? idx : 0;
    }
  },
  onShow() {
    audio.stopAll();
  },
  onShareAppMessage() {
    const solid = CATALOG[this.solidIndex];
    return {
      title: `几何实验室：${solid ? solid.name : '3D 几何体'} 旋转/展开/截面/三视图`,
      path: `pages/lab/index?solid=${solid ? solid.id : 'cube'}`,
    };
  },
  // #ifdef MP-WEIXIN
  onShareTimeline() {
    return { title: '几何实验室：3D 几何体 旋转/展开/截面/三视图' };
  },
  // #endif
  onUnload() {
    this._animToken = (this._animToken || 0) + 1;
  },
  methods: {
    onViewerReady(viewer) {
      this.viewer = viewer;
      this.loadSolid(this._initialSolidIndex || 0);
    },
    loadSolid(index) {
      this.solidIndex = index;
      const item = CATALOG[index];
      const data = item.make();
      this.solidData = data;
      this.viewer.setSolid(data);
      this.viewer.setSpin(this.spin);
      this.viewer.setLabelsVisible(this.labelsOn);
      this.unfold = 0;
      this.unfoldable = this.viewer.canUnfold();

      let minY = Infinity, maxY = -Infinity;
      for (const q of data.points) { minY = Math.min(minY, q.p[1]); maxY = Math.max(maxY, q.p[1]); }
      this.minY = minY;
      this.maxY = maxY;

      this.vCount = data.points.length;
      this.fCount = data.faces.length;
      this.eCount = buildEdges(data.faces).length;
      this.updateSection();
    },
    onSolidPick(e) {
      this.loadSolid(Number(e.detail.value));
    },
    setSpin(v) {
      this.spin = v;
      if (this.viewer) this.viewer.setSpin(v);
    },
    setLabels(v) {
      this.labelsOn = v;
      if (this.viewer) this.viewer.setLabelsVisible(v);
    },
    setSectionOn(v) {
      this.sectionOn = v;
      this.updateSection();
    },
    updateSection() {
      if (!this.viewer) return;
      if (!this.sectionOn) {
        this.viewer.setSection(null);
        return;
      }
      this.viewer.setSection({ n: [0, 1, 0], d: this.minY + this.sectionT * (this.maxY - this.minY) });
    },
    onSectionSlide(e) {
      this.sectionT = e.detail.value / 1000;
      this.updateSection();
    },
    onUnfoldSlide(e) {
      this.setUnfold(e.detail.value / 1000);
    },
    setUnfold(v) {
      this.unfold = Math.min(1, Math.max(0, v));
      if (this.viewer) this.viewer.setUnfold(this.unfold);
    },
    toggleUnfold() {
      // 600ms 缓动动画（小程序页面没有 window.requestAnimationFrame，用 setTimeout 驱动）
      const from = this.unfold;
      const to = this.unfold >= 1 ? 0 : 1;
      const token = (this._animToken = (this._animToken || 0) + 1);
      const start = Date.now();
      const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2);
      const frame = () => {
        if (this._animToken !== token) return;
        const k = Math.min(1, (Date.now() - start) / 600);
        this.setUnfold(from + (to - from) * ease(k));
        if (k < 1) setTimeout(frame, 16);
      };
      frame();
    },
  },
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
}

.gl-wrap {
  position: relative;
}

.panel {
  padding: 16rpx 24rpx 60rpx;
}

.lab-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 14rpx 0;
  flex-wrap: wrap;
}

.picker-box {
  background: var(--card);
  border: 1rpx solid var(--border);
  border-radius: var(--r-s);
  padding: 8rpx 24rpx;
  color: var(--brand);
  font-weight: 600;
  box-shadow: var(--shadow);
}

.lab-toggles {
  gap: 24rpx;
}

.lab-toggle {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
}

.lab-slider {
  flex: 1;
  min-width: 200rpx;
}

.num {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--brand);
}

.cap {
  font-size: 22rpx;
  color: var(--muted);
}
</style>
