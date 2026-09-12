// 课程播放器：上方 3D（GeoCanvas），下方分步讲解（文字 + 语音 + 步骤与 3D 高亮联动）。
// 顶点标注已接入（与实验室同一实现，标注层更新已节流）；旧基础库同层渲染失效时
// 标注可能被画布盖住，属已知兼容风险（见 SMOKE.md）。
<template>
  <view class="page">
    <geo-canvas :height="glHeight" :show-labels="true" @ready="onViewerReady" />
    <view class="panel">
      <view class="player-head">
        <view class="player-title">
          <text class="h2">{{ lesson ? lesson.title : '' }}</text>
          <text class="muted" v-if="lesson && lesson.subtitle">{{ lesson.subtitle }}</text>
        </view>
      </view>
      <audio-bar @replay="replay" />
      <view class="step-body" v-if="step">
        <rich-text :nodes="step.text"></rich-text>
      </view>
      <view class="step-nav" v-if="lesson">
        <button class="btn" :disabled="stepIndex === 0" @click="go(-1)">← 上一步</button>
        <text class="muted">第 {{ stepIndex + 1 }} / {{ lesson.steps.length }} 步</text>
        <button class="btn btn-primary" @click="go(1)">
          {{ stepIndex === lesson.steps.length - 1 ? '完成 ✓' : '下一步 →' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import GeoCanvas from '../../components/GeoCanvas.vue';
import AudioBar from '../../components/AudioBar.vue';
import { catalog } from '../../geo/solids.js';
import { LESSONS } from '../../data/lessons.js';
import * as audio from '../../engine/audio.js';
import * as progress from '../../engine/progress.js';

const CATALOG = new Map(catalog().map((c) => [c.id, c]));

export default {
  components: { GeoCanvas, AudioBar },
  data() {
    return {
      glHeight: 300,
      lesson: null,
      stepIndex: 0,
      viewer: null,
    };
  },
  computed: {
    step() {
      return this.lesson ? this.lesson.steps[this.stepIndex] : null;
    },
  },
  onLoad(query) {
    const sys = uni.getSystemInfoSync();
    this.glHeight = Math.round((sys.windowHeight || 640) * 0.42);
    const lesson = LESSONS.find((l) => l.id === query.id) || LESSONS[0];
    this.lesson = lesson;
    const step = parseInt(query.step, 10);
    this.stepIndex = Number.isInteger(step) ? Math.min(Math.max(0, step), lesson.steps.length - 1) : 0;
  },
  onUnload() {
    audio.stopAll();
  },
  onShareAppMessage() {
    return {
      title: `立体几何课堂：${this.lesson ? this.lesson.title : '3D 互动学几何'}`,
      path: `pages/lessons/player?id=${this.lesson ? this.lesson.id : ''}&step=${this.stepIndex}`,
    };
  },
  // #ifdef MP-WEIXIN
  onShareTimeline() {
    return { title: `立体几何课堂：${this.lesson ? this.lesson.title : '3D 互动学几何'}` };
  },
  // #endif
  methods: {
    onViewerReady(viewer) {
      this.viewer = viewer;
      const item = CATALOG.get(this.lesson.solid) || CATALOG.get('cube');
      viewer.setSolid(item.make());
      viewer.setLabelsVisible(true);
      this.applyStep();
    },
    applyStep() {
      if (!this.viewer || !this.step) return;
      const scene = this.step.scene;
      progress.setLessonStep(this.lesson.id, this.stepIndex);
      if (!scene) {
        this.viewer.highlight({});
        this.viewer.setSpin(false);
        this.viewer.setSection(null);
        this.viewer.setUnfold(0);
      } else {
        this.viewer.highlight(scene.highlight || {});
        this.viewer.setSpin(!!scene.spin);
        this.viewer.setSection(scene.section || null);
        this.viewer.setUnfold(typeof scene.unfold === 'number' ? scene.unfold : 0);
      }
      this.replay();
    },
    replay() {
      audio.stopAll();
      if (this.step && this.step.audio) {
        audio.playVoice(this.step.audio).then((ok) => {
          if (!ok) console.log('[audio] 语音不可用（CDN 未配置或网络失败）');
        });
      }
    },
    go(delta) {
      audio.stopAll();
      const next = this.stepIndex + delta;
      if (next >= this.lesson.steps.length) {
        uni.navigateBack();
        return;
      }
      this.stepIndex = Math.max(0, next);
      this.applyStep();
    },
  },
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
}

.panel {
  padding: 16rpx 24rpx 40rpx;
}

.player-title {
  display: flex;
  flex-direction: column;
}

.h2 {
  font-size: 34rpx;
  font-weight: 700;
  color: #1f3a5f;
}
</style>
