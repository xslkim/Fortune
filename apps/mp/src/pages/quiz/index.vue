// 题库（tabBar 页）：8 大分类 + 难度 + 状态筛选，筛选条件持久化（gt_filter）。
// 顶部：今日目标 streak 卡 + 各分类掌握度星级。
<template>
  <view class="page">
    <view class="panel-title">题库</view>

    <view class="card netgame-card fade-in" hover-class="cell-hover" @click="openNetGame">
      <view class="netgame-main">
        <text class="netgame-icon">🧩</text>
        <view class="netgame-info">
          <text class="netgame-title">展开图闯关</text>
          <text class="muted netgame-sub">正方体展开图 15 关：能不能折 · 找相对面 · 选能折成的</text>
          <text class="muted netgame-sub">进度 {{ netgamePassed }}/15 关 · {{ netgameStars }}/45 星{{ netgamePassed >= 15 ? ' · 🎉 全部通关' : '' }}</text>
        </view>
        <text class="netgame-arrow">›</text>
      </view>
    </view>

    <view class="card streak-card fade-in">
      <view class="streak-main">
        <text class="streak-flame">🔥</text>
        <view class="streak-info">
          <text class="streak-num">连续 {{ streakDays }} 天</text>
          <text class="muted">最佳 {{ streakBest }} 天{{ goalDone ? ' · ✓ 今日目标已达成' : '' }}</text>
        </view>
      </view>
      <view class="streak-progress muted">
        今日目标：学 {{ goal.steps }}/{{ GOAL_STEPS }} 步 · 答 {{ goal.answers }}/{{ GOAL_ANSWERS }} 题
      </view>
    </view>

    <view class="card mastery-card fade-in">
      <text class="mastery-title">知识点掌握度</text>
      <view class="mastery-grid">
        <view v-for="row in masteryRows" :key="row.cat" class="mastery-row">
          <text class="mastery-cat">{{ row.cat }}</text>
          <text class="mastery-stars">{{ row.stars }}</text>
        </view>
      </view>
    </view>

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

    <view class="card-list fade-in">
      <view v-if="!items.length" class="empty-state">
        <view class="empty-icon">🗂️</view>
        <view class="muted empty-text">该筛选条件下暂无题目</view>
        <view class="muted empty-sub">换个分类或难度试试，也可以重置筛选查看全部题目。</view>
        <button class="btn btn-primary empty-btn" @click="resetFilter">重置筛选</button>
      </view>
      <view v-for="q in items" :key="q.id" class="card" hover-class="cell-hover" @click="openQuiz(q)">
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
import { QUIZZES } from '@geo/core/data/quizzes.js';
import { todayStr } from '@geo/core/engine/days.js';
import { LEVEL_COUNT } from '@geo/core/data/netgame.js';
import * as progress from '../../engine/progress.js';
import * as mastery from '../../engine/mastery.js';
import * as streak from '../../engine/streak.js';
import * as netgame from '../../engine/netgame.js';
import { CATEGORIES, FALLBACK_CAT, quizCategory } from '../../engine/categories.js';

const DIFF_NAMES = { 1: '简单', 2: '中等', 3: '困难' };
const QUIZ_STATUS = { none: ['未做', 'st-none'], ok: ['已对', 'st-ok'], wrong: ['错过', 'st-wrong'] };

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
      streakDays: 0,
      streakBest: 0,
      netgamePassed: 0,
      netgameStars: 0,
      goal: { steps: 0, answers: 0, games: 0, done: false },
      goalDone: false,
      GOAL_STEPS: streak.GOAL_STEPS,
      GOAL_ANSWERS: streak.GOAL_ANSWERS,
      masteryRows: [],
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
  onShareAppMessage() {
    return { title: '立体几何题库：100 道经典中高考风格几何题', path: 'pages/quiz/index' };
  },
  // #ifdef MP-WEIXIN
  onShareTimeline() {
    return { title: '立体几何题库：100 道经典中高考风格几何题' };
  },
  // #endif
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
    resetFilter() {
      this.difficulty = 0;
      this.category = '';
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

      const s = streak.loadStreak();
      this.streakDays = s.current | 0;
      this.streakBest = s.best | 0;
      this.goal = streak.goalProgress(s, todayStr());
      this.goalDone = this.goal.done;
      const ng = netgame.loadProgress();
      this.netgamePassed = ng.levels.filter((l) => l.passed).length;
      this.netgameStars = Math.min(ng.levels.reduce((a, l) => a + l.stars, 0), LEVEL_COUNT * 3);
      const m = mastery.loadMastery();
      this.masteryRows = CATEGORIES.map((cat) => ({ cat, stars: mastery.starsOf(m, cat) }));
    },
    openQuiz(q) {
      uni.navigateTo({ url: `/pages/quiz/detail?id=${q.id}&from=quizzes` });
    },
    openNetGame() {
      uni.navigateTo({ url: '/pages/netgame/index' });
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
  font-weight: 600;
  color: var(--text);
}

/* 展开图闯关入口卡 */
.netgame-card {
  margin-bottom: 4rpx;
}

.netgame-main {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.netgame-icon {
  font-size: 56rpx;
  line-height: 1.2;
}

.netgame-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.netgame-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--brand);
}

.netgame-sub {
  font-size: 22rpx;
  line-height: 1.5;
}

.netgame-arrow {
  font-size: 44rpx;
  color: var(--muted);
}

.num {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--brand);
}

/* 今日目标 streak 卡 */
.streak-card {
  flex-direction: column;
  align-items: stretch;
  gap: 12rpx;
}

.streak-main {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.streak-flame {
  font-size: 56rpx;
  line-height: 1.2;
}

.streak-info {
  display: flex;
  flex-direction: column;
}

.streak-num {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--brand);
}

.streak-progress {
  font-size: 24rpx;
}

/* 各分类掌握度（两列网格） */
.mastery-card {
  flex-direction: column;
  align-items: stretch;
  gap: 12rpx;
}

.mastery-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--brand);
}

.mastery-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10rpx 24rpx;
}

.mastery-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mastery-cat {
  font-size: 24rpx;
  color: var(--text);
}

.mastery-stars {
  font-size: 24rpx;
  color: var(--warning);
  letter-spacing: 2rpx;
}

.cap {
  font-size: 22rpx;
  color: var(--muted);
}

.empty-state {
  margin: 60rpx 0;
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
