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
      <view v-if="step && step.check" class="check-card">
        <text class="check-title">检查一下</text>
        <text class="check-q">{{ step.check.question }}</text>
        <view class="option-list">
          <button
            v-for="(opt, idx) in step.check.options"
            :key="idx"
            class="option"
            :class="checkClass(idx)"
            :disabled="checkSolved || checkWrong.includes(idx)"
            @click="pickCheck(idx)"
          >{{ opt }}</button>
        </view>
        <text v-if="checkMsg" class="check-msg" :class="checkOk ? 'ok' : 'no'">{{ checkMsg }}</text>
      </view>
      <view class="step-nav" v-if="lesson">
        <button class="btn" :disabled="stepIndex === 0" @click="go(-1)">← 上一步</button>
        <text class="muted">第 {{ stepIndex + 1 }} / {{ lesson.steps.length }} 步</text>
        <button class="btn btn-primary" :disabled="!checkPassed" @click="go(1)">
          {{ stepIndex === lesson.steps.length - 1 ? '完成 ✓' : '下一步 →' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import GeoCanvas from '../../components/GeoCanvas.vue';
import AudioBar from '../../components/AudioBar.vue';
import { catalog } from '@geo/core/geo/solids.js';
import { LESSONS } from '@geo/core/data/lessons.js';
import * as audio from '../../engine/audio.js';
import * as progress from '../../engine/progress.js';
import * as streak from '../../engine/streak.js';

const CATALOG = new Map(catalog().map((c) => [c.id, c]));

export default {
  components: { GeoCanvas, AudioBar },
  data() {
    return {
      glHeight: 300,
      lesson: null,
      stepIndex: 0,
      viewer: null,
      checkSolved: false, // 当前步骤检查点是否答对
      checkWrong: [], // 已排除的错误选项下标
      checkMsg: '',
      checkOk: false,
    };
  },
  computed: {
    step() {
      return this.lesson ? this.lesson.steps[this.stepIndex] : null;
    },
    // 有检查点且未答对前，「下一步」保持禁用
    checkPassed() {
      return !this.step || !this.step.check || this.checkSolved;
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
      streak.record('step'); // 每日 streak：学 1 步即达成今日目标（GOAL_STEPS）
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
      this.resetCheck();
      this.applyStep();
    },
    resetCheck() {
      this.checkSolved = false;
      this.checkWrong = [];
      this.checkMsg = '';
      this.checkOk = false;
    },
    // 检查点：答对解锁「下一步」；答错显示 hint，已排除项置灰、其余选项可重试
    pickCheck(idx) {
      const c = this.step && this.step.check;
      if (!c || this.checkSolved || this.checkWrong.includes(idx)) return;
      if (idx === c.answer) {
        this.checkSolved = true;
        this.checkOk = true;
        this.checkMsg = '答对了！';
      } else {
        this.checkWrong.push(idx);
        this.checkOk = false;
        this.checkMsg = c.hint ? `再想想：${c.hint}` : '再想想，其他选项还可以选。';
      }
    },
    checkClass(idx) {
      if (this.checkSolved && this.step.check && idx === this.step.check.answer) return 'correct';
      if (this.checkWrong.includes(idx)) return 'wrong';
      return '';
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
  font-weight: 600;
  color: var(--brand);
}

/* 课内检查点（答对解锁下一步） */
.check-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin: 16rpx 0;
  padding: 20rpx 24rpx;
  border: 1rpx dashed var(--primary);
  border-radius: 16rpx;
  background: var(--card-alt);
}

.check-title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--brand);
}

.check-q {
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--text);
}

.check-msg {
  font-size: 26rpx;
}

.check-msg.ok {
  color: var(--success);
  font-weight: 600;
}

.check-msg.no {
  color: var(--error);
}
</style>
