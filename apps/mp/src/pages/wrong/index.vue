// 错题本（tabBar 页）：重答 / 移除 / 订正状态 + 作答统计。
<template>
  <view class="page">
    <view class="panel-title">错题本</view>
    <view class="stats stat-bar">
      <view class="stat"><text class="num">{{ total }}</text><text class="cap">总作答数</text></view>
      <view class="stat"><text class="num">{{ acc }}%</text><text class="cap">正确率</text></view>
      <view class="stat"><text class="num">{{ todo }}</text><text class="cap">待订正</text></view>
    </view>

    <view class="card due-card fade-in">
      <text class="due-title">📌 待复习 {{ dueItems.length }} 题</text>
      <text class="muted due-sub">按 +1/+3/+7 天间隔安排，复习答对即推进，全部通过标记「已掌握」。</text>
      <view v-if="dueItems.length" class="due-list">
        <view
          v-for="d in dueItems"
          :key="d.id"
          class="due-item"
          hover-class="cell-hover"
          @click="review(d)"
        >
          <text class="due-stem">{{ d.stem }}</text>
          <text class="muted due-go">复习 →</text>
        </view>
      </view>
      <text v-else class="muted">暂无到期复习</text>
    </view>

    <view v-if="!items.length" class="empty-state">
      <view class="empty-icon">📭</view>
      <view class="muted empty-text">暂无错题，继续保持！</view>
      <view class="muted empty-sub">答错的题目会自动收进错题本，方便日后订正。</view>
      <button class="btn btn-primary empty-btn" @click="goQuiz">去题库刷题</button>
    </view>
    <template v-else>
      <view class="muted">答对后会标记「已订正」，记录仍保留，可手动移除。</view>
      <view class="card-list fade-in">
        <view v-for="w in items" :key="w.id" class="card" hover-class="cell-hover">
          <view class="card-main">
            <text class="card-title">{{ w.title }}</text>
            <view class="badge-row">
              <text class="badge" :class="'diff-' + w.difficulty">{{ w.diffName }}</text>
              <text class="badge" :class="w.corrected ? 'st-ok' : 'st-wrong'">
                {{ w.corrected ? '已订正' : '待订正' }}
              </text>
            </view>
          </view>
          <view class="wrong-actions">
            <button class="btn btn-small btn-primary" @click="retry(w)">重答</button>
            <button class="btn btn-small" @click="remove(w)">移除</button>
          </view>
        </view>
      </view>
    </template>

    <button class="btn btn-block report-btn" @click="goReport">📊 查看家长周报</button>
  </view>
</template>

<script>
import { QUIZZES } from '@geo/core/data/quizzes.js';
import { todayStr } from '@geo/core/engine/days.js';
import * as progress from '../../engine/progress.js';
import * as review from '../../engine/review.js';

const QUIZ_BY_ID = new Map(QUIZZES.map((q) => [q.id, q]));
const DIFF_NAMES = { 1: '简单', 2: '中等', 3: '困难' };

// 题干纯文本（question 含 <b> 等标签）：截前 20 字作列表摘要
function stemOf(q) {
  return String(q.question || q.title || '').replace(/<[^>]*>/g, '').slice(0, 20);
}

export default {
  data() {
    return {
      items: [],
      dueItems: [],
      total: 0,
      acc: 0,
      todo: 0,
    };
  },
  onShow() {
    this.refresh();
  },
  onShareAppMessage() {
    return { title: '立体几何错题本：答错自动收录，订正追踪', path: 'pages/wrong/index' };
  },
  // #ifdef MP-WEIXIN
  onShareTimeline() {
    return { title: '立体几何错题本：答错自动收录，订正追踪' };
  },
  // #endif
  methods: {
    refresh() {
      const at = progress.allAttempts();
      this.total = at.length;
      const okCount = at.filter((a) => a.ok).length;
      this.acc = at.length ? Math.round((okCount / at.length) * 100) : 0;
      const list = progress.wrongList();
      this.todo = list.filter((w) => !w.corrected).length;
      // 待复习：间隔复习到期题（题目已下架则跳过），题干截前 20 字
      this.dueItems = review
        .dueReviews(review.loadReview(), todayStr())
        .filter((id) => QUIZ_BY_ID.has(id))
        .map((id) => ({ id, stem: stemOf(QUIZ_BY_ID.get(id)) }));
      this.items = list
        .map((w) => {
          const q = QUIZ_BY_ID.get(w.id);
          if (!q) return null; // 题目已下架则跳过
          return {
            id: w.id,
            corrected: w.corrected,
            title: q.title,
            difficulty: q.difficulty,
            diffName: DIFF_NAMES[q.difficulty] || '',
          };
        })
        .filter(Boolean);
    },
    retry(w) {
      uni.navigateTo({ url: `/pages/quiz/detail?id=${w.id}&from=wrong` });
    },
    review(d) {
      uni.navigateTo({ url: `/pages/quiz/detail?id=${d.id}&from=review` });
    },
    goReport() {
      uni.navigateTo({ url: '/pages/report/index' });
    },
    goQuiz() {
      uni.switchTab({ url: '/pages/quiz/index' });
    },
    remove(w) {
      progress.removeWrong(w.id);
      this.refresh();
    },
  },
};
</script>

<style scoped>
.page {
  padding: 20rpx 24rpx 40rpx;
}

.card-title {
  font-weight: 600;
  color: var(--text);
}

.wrong-actions {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  flex-shrink: 0;
}

/* 待复习区块（间隔复习到期题） */
.due-card {
  flex-direction: column;
  align-items: stretch;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.due-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--brand);
}

.due-sub {
  font-size: 22rpx;
}

.due-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 4rpx;
}

.due-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  background: var(--card-alt);
  border-radius: var(--r-s);
  padding: 14rpx 20rpx;
}

.due-stem {
  font-size: 26rpx;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.due-go {
  flex-shrink: 0;
  font-size: 24rpx;
}

.report-btn {
  margin-top: 32rpx;
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
</style>
