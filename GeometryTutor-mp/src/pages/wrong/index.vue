// 错题本（tabBar 页）：重答 / 移除 / 订正状态 + 作答统计。
<template>
  <view class="page">
    <view class="panel-title">错题本</view>
    <view class="stats stat-bar">
      <view class="stat"><text class="num">{{ total }}</text><text class="cap">总作答数</text></view>
      <view class="stat"><text class="num">{{ acc }}%</text><text class="cap">正确率</text></view>
      <view class="stat"><text class="num">{{ todo }}</text><text class="cap">待订正</text></view>
    </view>

    <view v-if="!items.length" class="muted empty">暂无错题，继续保持！答错的题目会自动收进来。</view>
    <template v-else>
      <view class="muted">答对后会标记「已订正」，记录仍保留，可手动移除。</view>
      <view class="card-list">
        <view v-for="w in items" :key="w.id" class="card">
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
  </view>
</template>

<script>
import { QUIZZES } from '../../data/quizzes.js';
import * as progress from '../../engine/progress.js';

const QUIZ_BY_ID = new Map(QUIZZES.map((q) => [q.id, q]));
const DIFF_NAMES = { 1: '简单', 2: '中等', 3: '困难' };

export default {
  data() {
    return {
      items: [],
      total: 0,
      acc: 0,
      todo: 0,
    };
  },
  onShow() {
    this.refresh();
  },
  methods: {
    refresh() {
      const at = progress.allAttempts();
      this.total = at.length;
      const okCount = at.filter((a) => a.ok).length;
      this.acc = at.length ? Math.round((okCount / at.length) * 100) : 0;
      const list = progress.wrongList();
      this.todo = list.filter((w) => !w.corrected).length;
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
  font-weight: 700;
}

.wrong-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex-shrink: 0;
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

.empty {
  margin-top: 40rpx;
  display: block;
  text-align: center;
}
</style>
