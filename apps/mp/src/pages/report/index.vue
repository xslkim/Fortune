// 家长周报：本周学习天数 / 正确率 / 攻克错题 / 薄弱知识点 + 各分类掌握度 + 复制分享文案。
// 数据由 engine/report.js 从 progress/mastery/streak 聚合（口径与 web 版一致：本周 = 周一至今日）。
<template>
  <view class="page">
    <view class="panel-title">家长周报（{{ fmt(r.weekStart) }} - {{ fmt(r.weekEnd) }}）</view>

    <view v-if="isEmpty" class="empty-state">
      <view class="empty-icon">📊</view>
      <view class="muted empty-text">本周还没有学习记录</view>
      <view class="muted empty-sub">建议每天抽 10 分钟学一步课程或做几道题，先养成习惯。</view>
      <button class="btn btn-primary empty-btn" @click="goQuiz">去题库刷题</button>
    </view>

    <template v-else>
      <view class="stats stat-bar">
        <view class="stat"><text class="num">{{ r.days }}</text><text class="cap">本周学习天数</text></view>
        <view class="stat"><text class="num">🔥 {{ r.currentStreak }}</text><text class="cap">连续学习</text></view>
        <view class="stat"><text class="num">{{ r.lessonsDone }}/{{ r.lessonsTotal }}</text><text class="cap">累计完成课程</text></view>
      </view>
      <view class="stats stat-bar">
        <view class="stat"><text class="num">{{ r.answers }}</text><text class="cap">本周答题数</text></view>
        <view class="stat"><text class="num">{{ r.acc }}%</text><text class="cap">本周正确率</text></view>
        <view class="stat"><text class="num">{{ r.conquered }}</text><text class="cap">本周攻克错题</text></view>
      </view>

      <view class="card sec-card fade-in">
        <text class="sec-title">各知识点掌握度</text>
        <view class="stars-list">
          <view v-for="x in r.stars" :key="x.cat" class="star-row">
            <text class="star-cat">{{ x.cat }}</text>
            <text class="star-badge">{{ x.stars }}</text>
          </view>
        </view>
      </view>

      <view v-if="r.weakCat" class="card sec-card fade-in">
        <text class="sec-title">薄弱知识点提醒</text>
        <text class="sec-text">「{{ r.weakCat }}」本周答错 {{ r.weakWrong }} 次，建议重点复习。</text>
      </view>

      <view class="card sec-card fade-in">
        <text class="sec-title">给家长的话</text>
        <text class="sec-text">{{ r.suggestion }}</text>
      </view>
    </template>

    <button class="btn btn-primary btn-block copy-btn" :disabled="isEmpty" @click="copy">
      {{ copied ? '✓ 已复制，去粘贴给家长吧' : '📋 复制分享文案' }}
    </button>
    <view class="muted footnote">统计口径：本周指周一至今日；学习天数以答题记录计。</view>
  </view>
</template>

<script>
import * as report from '../../engine/report.js';

export default {
  data() {
    return {
      r: null,
      copied: false,
    };
  },
  computed: {
    isEmpty() {
      return !!this.r && this.r.answers === 0 && this.r.days === 0;
    },
  },
  onLoad() {
    this.r = report.buildWeeklyReport();
  },
  onShareAppMessage() {
    return { title: '立体几何学习周报：看看孩子本周的表现', path: 'pages/report/index' };
  },
  // #ifdef MP-WEIXIN
  onShareTimeline() {
    return { title: '立体几何学习周报：看看孩子本周的表现' };
  },
  // #endif
  methods: {
    fmt(d) {
      return `${Number(d.slice(5, 7))}月${Number(d.slice(8, 10))}日`;
    },
    copy() {
      if (!this.r) return;
      uni.setClipboardData({
        data: report.reportText(this.r),
        success: () => {
          this.copied = true;
          setTimeout(() => {
            this.copied = false;
          }, 2500);
        },
        fail: () => {
          uni.showToast({ title: '复制失败，请手动截图分享', icon: 'none' });
        },
      });
    },
    goQuiz() {
      uni.switchTab({ url: '/pages/quiz/index' });
    },
  },
};
</script>

<style scoped>
.page {
  padding: 20rpx 24rpx 40rpx;
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

.sec-card {
  flex-direction: column;
  align-items: stretch;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.sec-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--brand);
}

.sec-text {
  font-size: 26rpx;
  color: var(--text);
  line-height: 1.6;
}

.stars-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.star-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.star-cat {
  font-size: 26rpx;
  color: var(--text);
}

.star-badge {
  font-size: 26rpx;
  color: var(--warning);
  letter-spacing: 2rpx;
}

.empty-state {
  margin-top: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.empty-icon {
  font-size: 88rpx;
  line-height: 1.2;
}

.empty-text {
  font-size: 30rpx;
  color: var(--text);
}

.empty-sub {
  max-width: 480rpx;
  text-align: center;
}

.empty-btn {
  margin-top: 16rpx;
}

.copy-btn {
  margin-top: 32rpx;
}

.footnote {
  margin-top: 16rpx;
  text-align: center;
}
</style>
