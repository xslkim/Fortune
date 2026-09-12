// 答题页：题目 → 选项判分（记录作答、答错进错题本）→ 分步讲解（3D 高亮联动 + 语音）。
// 顶点标注已接入（与实验室同一实现，节流已就位）。
<template>
  <view class="page">
    <geo-canvas :height="glHeight" :show-labels="true" @ready="onViewerReady" />
    <view class="panel" v-if="quiz">
      <view class="player-head">
        <view class="player-title">
          <text class="h2">{{ quiz.title }}</text>
          <text class="muted">{{ phase === 'question' ? `难度：${diffName}` : '讲解' }}</text>
        </view>
      </view>
      <audio-bar v-if="phase === 'explain'" @replay="replay" />

      <template v-if="phase === 'question'">
        <view class="step-body">
          <rich-text :nodes="quiz.question"></rich-text>
        </view>
        <view class="option-list">
          <button
            v-for="(opt, idx) in quiz.answer.options"
            :key="idx"
            class="option"
            :class="optionClass(idx)"
            :disabled="picked >= 0"
            @click="pickOption(idx)"
          >{{ opt }}</button>
        </view>
        <view v-if="picked >= 0" class="result" :class="pickedOk ? 'ok' : 'no'">
          {{ pickedOk ? '✓ 回答正确！' : '✗ 回答错误，看看讲解吧。' }}
        </view>
        <button v-if="picked >= 0" class="btn btn-primary btn-block" @click="toExplain">查看讲解 →</button>
      </template>

      <template v-else>
        <view class="result" :class="pickedOk ? 'ok' : 'no'">
          正确答案：{{ quiz.answer.options[quiz.answer.correct] }}
        </view>
        <view class="step-body" v-if="explainStep">
          <rich-text :nodes="explainStep.text"></rich-text>
        </view>
        <view class="step-nav">
          <button class="btn" :disabled="explainIndex === 0" @click="goExplain(-1)">← 上一步</button>
          <text class="muted">讲解 {{ explainIndex + 1 }} / {{ quiz.explain.length }}</text>
          <button class="btn btn-primary" @click="goExplain(1)">
            {{ explainIndex === quiz.explain.length - 1 ? '返回' : '下一步 →' }}
          </button>
        </view>
      </template>
    </view>
  </view>
</template>

<script>
import GeoCanvas from '../../components/GeoCanvas.vue';
import AudioBar from '../../components/AudioBar.vue';
import { catalog } from '../../geo/solids.js';
import { QUIZZES } from '../../data/quizzes.js';
import * as audio from '../../engine/audio.js';
import * as progress from '../../engine/progress.js';

const CATALOG = new Map(catalog().map((c) => [c.id, c]));
const DIFF_NAMES = { 1: '简单', 2: '中等', 3: '困难' };

export default {
  components: { GeoCanvas, AudioBar },
  data() {
    return {
      glHeight: 280,
      quiz: null,
      from: 'quizzes',
      phase: 'question', // 'question' | 'explain'
      picked: -1,
      explainIndex: 0,
      viewer: null,
    };
  },
  computed: {
    diffName() {
      return DIFF_NAMES[this.quiz.difficulty] || this.quiz.difficulty;
    },
    pickedOk() {
      return this.picked === this.quiz.answer.correct;
    },
    explainStep() {
      return this.phase === 'explain' ? this.quiz.explain[this.explainIndex] : null;
    },
  },
  onLoad(query) {
    const sys = uni.getSystemInfoSync();
    this.glHeight = Math.round((sys.windowHeight || 640) * 0.38);
    this.quiz = QUIZZES.find((q) => q.id === query.id) || QUIZZES[0];
    this.from = query.from === 'wrong' ? 'wrong' : 'quizzes';
  },
  onUnload() {
    audio.stopAll();
  },
  onShareAppMessage() {
    return {
      title: `几何题：${this.quiz ? this.quiz.title : '立体几何题库'}`,
      path: `pages/quiz/detail?id=${this.quiz ? this.quiz.id : ''}&from=quizzes`,
    };
  },
  // #ifdef MP-WEIXIN
  onShareTimeline() {
    return { title: `几何题：${this.quiz ? this.quiz.title : '立体几何题库'}` };
  },
  // #endif
  methods: {
    onViewerReady(viewer) {
      this.viewer = viewer;
      const item = CATALOG.get(this.quiz.solid) || CATALOG.get('cube');
      viewer.setSolid(item.make());
      viewer.setLabelsVisible(true);
      this.applyScene(this.quiz.scene);
    },
    applyScene(scene) {
      if (!this.viewer) return;
      if (!scene) {
        this.viewer.highlight({});
        this.viewer.setSpin(false);
        this.viewer.setSection(null);
        this.viewer.setUnfold(0);
        return;
      }
      this.viewer.highlight(scene.highlight || {});
      this.viewer.setSpin(!!scene.spin);
      this.viewer.setSection(scene.section || null);
      this.viewer.setUnfold(typeof scene.unfold === 'number' ? scene.unfold : 0);
    },
    optionClass(idx) {
      if (this.picked < 0) return '';
      if (idx === this.quiz.answer.correct) return 'correct';
      if (idx === this.picked) return 'wrong';
      return '';
    },
    pickOption(idx) {
      if (this.picked >= 0) return;
      this.picked = idx;
      progress.recordAttempt(this.quiz.id, this.pickedOk);
    },
    toExplain() {
      this.phase = 'explain';
      this.explainIndex = 0;
      this.applyExplain();
    },
    goExplain(delta) {
      audio.stopAll();
      const next = this.explainIndex + delta;
      if (next >= this.quiz.explain.length) {
        uni.navigateBack();
        return;
      }
      this.explainIndex = Math.max(0, next);
      this.applyExplain();
    },
    applyExplain() {
      this.applyScene(this.explainStep.scene);
      this.replay();
    },
    replay() {
      audio.stopAll();
      if (this.explainStep && this.explainStep.audio) {
        audio.playVoice(this.explainStep.audio).then((ok) => {
          if (!ok) console.log('[audio] 语音不可用（CDN 未配置或网络失败）');
        });
      }
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

.h2 {
  font-size: 34rpx;
  font-weight: 700;
  color: #1f3a5f;
}

.player-title {
  display: flex;
  flex-direction: column;
}
</style>
