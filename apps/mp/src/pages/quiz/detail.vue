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
        <view class="option-list" v-if="options">
          <button
            v-for="(opt, idx) in options"
            :key="idx"
            class="option"
            hover-class="cell-hover"
            :class="optionClass(idx)"
            :disabled="picked !== -1"
            @click="submitAnswer(idx)"
          >{{ opt }}</button>
        </view>
        <view class="option-list" v-else>
          <input
            class="fill-input"
            type="text"
            inputmode="decimal"
            v-model="fillValue"
            placeholder="输入答案（数值）"
            :disabled="picked !== -1"
            :class="fillClass"
            @confirm="submitFill"
          />
          <button class="btn btn-primary btn-block" :disabled="picked !== -1" @click="submitFill">提交</button>
        </view>
        <view v-if="picked !== -1" class="result" :class="pickedOk ? 'ok' : 'no'">
          {{ pickedOk ? '✓ 回答正确！' : '✗ 回答错误，看看讲解吧。' }}
        </view>
        <button v-if="picked !== -1" class="btn btn-primary btn-block" @click="toExplain">查看讲解 →</button>
      </template>

      <template v-else>
        <view class="result" :class="pickedOk ? 'ok' : 'no'">
          正确答案：{{ correctText }}
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
import { catalog } from '@geo/core/geo/solids.js';
import { QUIZZES } from '@geo/core/data/quizzes.js';
import { typeDef, correctOptionIndex } from '@geo/core/question-types.js';
import * as audio from '../../engine/audio.js';
import * as progress from '../../engine/progress.js';
import * as mastery from '../../engine/mastery.js';
import * as streak from '../../engine/streak.js';
import * as review from '../../engine/review.js';
import { quizCategory } from '../../engine/categories.js';

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
      picked: -1, // 选项题为索引，填空题为答案字符串；未作答恒为 -1
      fillValue: '',
      explainIndex: 0,
      viewer: null,
    };
  },
  computed: {
    diffName() {
      return DIFF_NAMES[this.quiz.difficulty] || this.quiz.difficulty;
    },
    // 渲染用选项列表（choice 来自数据，judge 由注册表提供 ['正确','错误']，fill 为 null）
    options() {
      return typeDef(this.quiz).optionsOf(this.quiz);
    },
    pickedOk() {
      return typeDef(this.quiz).isCorrect(this.quiz, this.picked);
    },
    correctText() {
      const opts = this.options;
      if (opts) return opts[correctOptionIndex(this.quiz)];
      return this.quiz.answer.answers.join(' 或 ');
    },
    fillClass() {
      if (this.picked === -1) return '';
      return this.pickedOk ? 'correct' : 'wrong';
    },
    explainStep() {
      return this.phase === 'explain' ? this.quiz.explain[this.explainIndex] : null;
    },
  },
  onLoad(query) {
    const sys = uni.getSystemInfoSync();
    this.glHeight = Math.round((sys.windowHeight || 640) * 0.38);
    this.quiz = QUIZZES.find((q) => q.id === query.id) || QUIZZES[0];
    this.from = ['wrong', 'review'].includes(query.from) ? query.from : 'quizzes';
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
      if (this.picked === -1 || !this.options) return '';
      if (idx === correctOptionIndex(this.quiz)) return 'correct';
      if (idx === this.picked) return 'wrong';
      return '';
    },
    // 统一判分入口：response 随题型（choice/judge 为索引，fill 为字符串）
    submitAnswer(response) {
      if (this.picked !== -1) return;
      this.picked = response;
      const ok = this.pickedOk;
      progress.recordAttempt(this.quiz.id, ok); // 记录作答；答错进错题本
      mastery.recordAnswer(quizCategory(this.quiz), ok); // 知识点掌握度三星
      streak.record('answer'); // 每日 streak：答 3 题达成今日目标
      if (!ok) review.recordWrong(this.quiz.id); // 生成/重置 +1/+3/+7 复习计划
      else if (review.hasActivePlan(review.loadReview(), this.quiz.id))
        review.recordReviewAnswer(this.quiz.id, true); // 复习答对推进节点
    },
    submitFill() {
      const v = (this.fillValue || '').trim();
      if (!v) return;
      this.submitAnswer(v);
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
  font-weight: 600;
  color: var(--brand);
}

.player-title {
  display: flex;
  flex-direction: column;
}
</style>
