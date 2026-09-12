// 题库（tabBar 页）：8 大分类 + 难度 + 状态筛选，筛选条件持久化（gt_filter）。
<template>
  <view class="page">
    <view class="panel-title">题库</view>

    <scroll-view scroll-x class="cat-scroll" :show-scrollbar="false">
      <view class="filter-bar cat-bar">
        <button
          v-for="c in catOptions"
          :key="c.value"
          class="btn btn-small chip"
          :class="{ 'btn-primary': category === c.value }"
          @click="pickCategory(c.value)"
        >{{ c.name }}</button>
      </view>
    </scroll-view>

    <view class="filter-bar">
      <button
        v-for="d in diffOptions"
        :key="d.value"
        class="btn btn-small"
        :class="{ 'btn-primary': difficulty === d.value }"
        @click="pickDifficulty(d.value)"
      >{{ d.name }}</button>
    </view>

    <view class="stats stat-bar">
      <view class="stat"><text class="num">{{ items.length }}</text><text class="cap">本组题目</text></view>
      <view class="stat"><text class="num">{{ answered }}</text><text class="cap">已答题数</text></view>
      <view class="stat"><text class="num">{{ acc }}%</text><text class="cap">正确率</text></view>
    </view>

    <view class="card-list">
      <view v-if="!items.length" class="muted">该筛选条件下暂无题目</view>
      <view v-for="q in items" :key="q.id" class="card" @click="openQuiz(q)">
        <view class="card-main">
          <text class="card-title">{{ q.title }}</text>
          <view class="badge-row">
            <text class="badge cat">{{ q.cat }}</text>
            <text class="badge" :class="'diff-' + q.difficulty">{{ q.diffName }}</text>
            <text class="badge" :class="q.stCls">{{ q.stName }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { QUIZZES } from '../../data/quizzes.js';
import * as progress from '../../engine/progress.js';

const DIFF_NAMES = { 1: '简单', 2: '中等', 3: '困难' };
const QUIZ_STATUS = { none: ['未做', 'st-none'], ok: ['已对', 'st-ok'], wrong: ['错过', 'st-wrong'] };
const CATEGORIES = ['结构', '表面积体积', '展开图', '三视图', '截面', '位置关系', '平行垂直', '空间向量'];
const FALLBACK_CAT = '综合';

function quizCategory(q) {
  return CATEGORIES.includes(q.category) ? q.category : FALLBACK_CAT;
}

export default {
  data() {
    return {
      difficulty: 0,
      category: '',
      items: [],
      catOptions: [],
      diffOptions: [
        { value: 0, name: '全部' },
        { value: 1, name: '简单' },
        { value: 2, name: '中等' },
        { value: 3, name: '困难' },
      ],
      answered: 0,
      acc: 0,
    };
  },
  onLoad() {
    const saved = progress.loadFilter();
    if (Number.isInteger(saved.difficulty)) this.difficulty = saved.difficulty;
    if (typeof saved.category === 'string') this.category = saved.category;
    const cats = [...CATEGORIES];
    if (QUIZZES.some((q) => quizCategory(q) === FALLBACK_CAT)) cats.push(FALLBACK_CAT);
    if (this.category && !cats.includes(this.category)) this.category = '';
    this.catOptions = [{ value: '', name: '全部' }, ...cats.map((c) => ({ value: c, name: c }))];
  },
  onShow() {
    this.refresh();
  },
  methods: {
    pickCategory(v) {
      this.category = v;
      this.saveFilter();
      this.refresh();
    },
    pickDifficulty(v) {
      this.difficulty = v;
      this.saveFilter();
      this.refresh();
    },
    saveFilter() {
      progress.saveFilter({ difficulty: this.difficulty, category: this.category });
    },
    refresh() {
      const list = QUIZZES.filter((q) => (!this.difficulty || q.difficulty === this.difficulty)
        && (!this.category || quizCategory(q) === this.category));
      this.items = list.map((q) => {
        const [stName, stCls] = QUIZ_STATUS[progress.quizStatus(q.id)];
        return {
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          diffName: DIFF_NAMES[q.difficulty] || '',
          cat: quizCategory(q),
          stName,
          stCls,
        };
      });
      const ids = new Set(list.map((q) => q.id));
      const at = progress.allAttempts().filter((a) => ids.has(a.id));
      this.answered = new Set(at.map((a) => a.id)).size;
      const okCount = at.filter((a) => a.ok).length;
      this.acc = at.length ? Math.round((okCount / at.length) * 100) : 0;
    },
    openQuiz(q) {
      uni.navigateTo({ url: `/pages/quiz/detail?id=${q.id}&from=quizzes` });
    },
  },
};
</script>

<style scoped>
.page {
  padding: 20rpx 24rpx 40rpx;
}

.cat-scroll {
  white-space: nowrap;
}

.cat-bar {
  flex-wrap: nowrap;
  display: inline-flex;
}

.card-title {
  font-weight: 700;
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
