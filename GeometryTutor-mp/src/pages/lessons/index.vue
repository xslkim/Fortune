// 课程列表（tabBar 页）：卡片式列表 + 学习统计，断点续学。
<template>
  <view class="page">
    <view class="panel-title">课程</view>
    <view class="stats stat-bar">
      <view class="stat"><text class="num">{{ doneCount }}</text><text class="cap">已完成课程</text></view>
      <view class="stat"><text class="num">{{ answered }}</text><text class="cap">已答题数</text></view>
      <view class="stat"><text class="num">{{ acc }}%</text><text class="cap">正确率</text></view>
    </view>
    <view class="card-list">
      <view v-for="l in lessonCards" :key="l.id" class="card" @click="openLesson(l, 0)">
        <view class="card-main">
          <text class="card-title">{{ l.title }}</text>
          <text class="muted">{{ l.subtitle }} · {{ l.total }} 步</text>
          <text v-if="l.step != null" class="badge" :class="l.done ? 'st-ok' : 'st-doing'">
            {{ l.done ? `✓ 已完成 ${l.total}/${l.total}` : `已学 ${l.step + 1}/${l.total}` }}
          </text>
        </view>
        <button
          v-if="l.step != null && !l.done"
          class="btn btn-small btn-primary"
          @click.stop="openLesson(l, l.step)"
        >继续</button>
      </view>
    </view>
  </view>
</template>

<script>
import { LESSONS } from '../../data/lessons.js';
import * as progress from '../../engine/progress.js';

export default {
  data() {
    return {
      lessonCards: [],
      doneCount: 0,
      answered: 0,
      acc: 0,
    };
  },
  onShow() {
    this.refresh();
  },
  onShareAppMessage() {
    return { title: '立体几何课堂：3D 互动学几何', path: 'pages/lessons/index' };
  },
  // #ifdef MP-WEIXIN
  onShareTimeline() {
    return { title: '立体几何课堂：3D 互动学几何' };
  },
  // #endif
  methods: {
    refresh() {
      this.lessonCards = LESSONS.map((l) => {
        const total = l.steps.length;
        const step = progress.getLessonStep(l.id);
        return {
          id: l.id,
          title: l.title,
          subtitle: l.subtitle || '',
          total,
          step,
          done: step != null && step >= total - 1,
        };
      });
      this.doneCount = this.lessonCards.filter((l) => l.done).length;
      const at = progress.allAttempts();
      this.answered = new Set(at.map((a) => a.id)).size;
      const okCount = at.filter((a) => a.ok).length;
      this.acc = at.length ? Math.round((okCount / at.length) * 100) : 0;
    },
    openLesson(l, step) {
      uni.navigateTo({ url: `/pages/lessons/player?id=${l.id}&step=${step}` });
    },
  },
};
</script>

<style scoped>
.page {
  padding: 20rpx 24rpx 40rpx;
}

.card-title {
  font-weight: 700;
  color: #24303f;
}

.num {
  font-size: 36rpx;
  font-weight: 700;
  color: #1f3a5f;
}

.cap {
  font-size: 22rpx;
  color: #7a8aa0;
}
</style>
