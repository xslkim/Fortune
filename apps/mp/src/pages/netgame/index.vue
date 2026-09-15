// 「展开图闯关」：15 关（能不能折 / 找相对面 / 选能折成的），顺序锁 + 3×5 蛇形成长线。
// 玩法数据复用 @geo/core/data/netgame.js 生成器（固定种子，与 web 端同题）；
// 展开图用 uni 2D canvas 绘制（格子多边形：描边 + 浅色填充 + 面序号）；
// 进度存 uni storage，key 与结构同 web：gt_netgame_v1 = { levels: [{ stars, passed }] }。
// 三星简化计分（小程序端不做严格计时）：答对得 ★，不看提示再得 ★，快速答对 ★ 简化为
// 答对 3 星、看提示 2 星；通关记 streak.record('game')。
<template>
  <view class="page">
    <!-- 选关：成长线 -->
    <template v-if="view === 'select'">
      <view class="panel-title">展开图闯关</view>
      <view class="card progress-card">
        <view class="progress-meta">
          <text class="muted">已通过 <text class="strong">{{ passedCount }}/{{ LEVEL_COUNT }}</text> 关 · 总星数 <text class="strong">{{ totalStars }}/{{ LEVEL_COUNT * 3 }}</text></text>
        </view>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: (passedCount / LEVEL_COUNT) * 100 + '%' }" />
        </view>
        <text class="muted progress-hint">每关三星：答对 ★、不看提示 ★、快速答对 ★（小程序端简化为：答对得星，看提示扣一星）。按顺序闯关，通过后解锁下一关。</text>
      </view>
      <view class="path-grid">
        <view
          v-for="node in pathNodes"
          :key="node.lv.id"
          class="path-node"
          :class="nodeCls(node.idx)"
          @click="openLevel(node.idx)"
        >
          <text class="node-num">{{ node.idx + 1 }}</text>
          <text class="node-type">{{ node.lv.typeName }}</text>
          <text v-if="prog.levels[node.idx].passed" class="node-stars">{{ starText(prog.levels[node.idx].stars) }}</text>
          <text v-else-if="!unlocked(node.idx)" class="node-lock">🔒</text>
          <text v-else class="node-go">挑战</text>
        </view>
      </view>
    </template>

    <!-- 关卡 -->
    <template v-else>
      <view class="lv-head">
        <button class="btn btn-small" @click="backSelect">← 选关</button>
        <text class="lv-title">{{ current.title }}</text>
        <text v-if="prog.levels[currentIdx].passed" class="lv-stars">{{ starText(prog.levels[currentIdx].stars) }}</text>
      </view>
      <text class="muted lv-prompt">{{ promptText }}</text>

      <view class="net-wrap">
        <canvas
          v-if="current.type !== 'pick'"
          id="net-canvas"
          canvas-id="net-canvas"
          type="2d"
          class="net-canvas"
          @tap="onNetTap"
        />
      </view>

      <!-- 1-5 判断能否折成 -->
      <view v-if="current.type === 'judge' && !answered" class="opt-row">
        <button class="btn btn-primary opt-btn" :disabled="answered" @click="answerJudge(true)">能折成 ✓</button>
        <button class="btn opt-btn" :disabled="answered" @click="answerJudge(false)">不能折成 ✗</button>
      </view>

      <!-- 6-10 找相对面：点选两个面后提交 -->
      <template v-if="current.type === 'opposite' && !answered">
        <text class="muted pick-tip">已选 {{ picked.length }}/2 个面{{ picked.length ? '：格 ' + picked.map((i) => i + 1).join('、') : '，点上图中的格子选择' }}</text>
        <view class="opt-row">
          <button
            v-for="o in current.options"
            :key="o"
            class="btn opt-btn"
            :class="{ 'btn-primary': picked.includes(o) }"
            @click="togglePick(o)"
          >格 {{ o + 1 }}</button>
        </view>
        <button class="btn btn-primary submit-btn" :disabled="picked.length !== 2" @click="submitOpposite">提交</button>
      </template>

      <!-- 11-15 四选一 -->
      <view v-if="current.type === 'pick'" class="pick-grid">
        <view
          v-for="(cells, i) in current.options"
          :key="i"
          class="pick-card"
          :class="pickCls(i)"
          @click="answerPick(i)"
        >
          <text class="pick-label">{{ pickLabels[i] }}</text>
          <canvas :id="'opt-canvas-' + i" :canvas-id="'opt-canvas-' + i" type="2d" class="opt-canvas" />
        </view>
      </view>

      <!-- 提示 -->
      <button v-if="!hintUsed && !answered" class="btn btn-small hint-btn" @click="useHint">💡 提示（会失去一颗星）</button>
      <view v-if="hintUsed" class="hint-box">{{ current.hint }}</view>

      <!-- 结算 -->
      <view v-if="answered" class="result" :class="ok ? 'result-ok' : 'result-no'">
        <text class="result-big">{{ ok ? '✓ 回答正确！ ' + starText(earned) : '✗ 回答错误' }}</text>
        <text class="result-detail">{{ resultDetail }}</text>
      </view>
      <view v-if="answered" class="opt-row">
        <button class="btn" @click="replay">重玩本关</button>
        <button v-if="currentIdx < LEVEL_COUNT - 1" class="btn btn-primary" @click="nextLevel">下一关 →</button>
        <button class="btn" @click="backSelect">返回选关</button>
      </view>
    </template>
  </view>
</template>

<script>
import { generateLevels, analyzeNet, isOpposite, LEVEL_COUNT } from '@geo/core/data/netgame.js';
import * as netgame from '../../engine/netgame.js';
import * as streak from '../../engine/streak.js';

// canvas 取不到 CSS var，这里用与 App.vue token 一致的实色
const COLORS = {
  bg: '#f6f8fb',
  card: '#ffffff',
  text: '#1f2d3d',
  markedFill: '#fdeee9',
  accent: '#e8491d',
  pickedFill: '#eaf1fd',
  primary: '#2f6fdd',
  overlapFill: '#f8d7da',
  error: '#9c1c24',
};

export default {
  data() {
    return {
      LEVEL_COUNT,
      pickLabels: ['A', 'B', 'C', 'D'],
      levels: generateLevels(),
      prog: netgame.loadProgress(),
      view: 'select',
      currentIdx: 0,
      hintUsed: false,
      answered: false,
      ok: false,
      earned: 0,
      resultDetail: '',
      picked: [],
      pickChosen: -1,
      netGeom: null, // 主 canvas 网格几何，tap 判格用
    };
  },
  computed: {
    passedCount() {
      return this.prog.levels.filter((l) => l.passed).length;
    },
    totalStars() {
      return this.prog.levels.reduce((a, l) => a + l.stars, 0);
    },
    // 3×5 蛇形：奇数行倒排，flex 折行即得 S 形路径
    pathNodes() {
      return this.levels
        .map((lv, idx) => ({ lv, idx, order: this.snakeOrder(idx) }))
        .sort((a, b) => a.order - b.order);
    },
    current() {
      return this.levels[this.currentIdx];
    },
    promptText() {
      const lv = this.current;
      if (lv.type === 'judge') return '下面这个由 6 个正方形组成的图形，能折成一个正方体吗？';
      if (lv.type === 'opposite') return `折成正方体后，与 ★ 标记的格 ${lv.marked + 1} 相对的是哪一格？先在上图点选两个面，再提交。`;
      return '下面 4 个图形中，只有 1 个能折成正方体。把它找出来！';
    },
  },
  methods: {
    starText(n) {
      let s = '';
      for (let i = 0; i < 3; i++) s += i < n ? '★' : '☆';
      return s;
    },
    snakeOrder(idx) {
      const row = Math.floor(idx / 5);
      const col = row % 2 === 0 ? idx % 5 : 4 - (idx % 5);
      return row * 5 + col;
    },
    unlocked(idx) {
      return netgame.isLevelUnlocked(this.prog, idx);
    },
    nodeCls(idx) {
      if (this.prog.levels[idx].passed) return 'node-done';
      if (this.unlocked(idx)) return 'node-open';
      return 'node-locked';
    },
    pickCls(i) {
      if (!this.answered) return '';
      if (i === this.current.answer) return 'pick-correct';
      if (i === this.pickChosen) return 'pick-wrong';
      return 'pick-muted';
    },

    // ---------- 选关 / 导航 ----------
    openLevel(idx) {
      if (!this.unlocked(idx)) return;
      this.currentIdx = idx;
      this.hintUsed = false;
      this.answered = false;
      this.ok = false;
      this.earned = 0;
      this.resultDetail = '';
      this.picked = [];
      this.pickChosen = -1;
      this.netGeom = null;
      this.view = 'play';
      // 等待原生 canvas 节点渲染出来再绘制
      this.$nextTick(() => setTimeout(() => this.drawLevel(), 60));
    },
    backSelect() {
      this.view = 'select';
      this.prog = netgame.loadProgress();
    },
    replay() {
      this.openLevel(this.currentIdx);
    },
    nextLevel() {
      this.openLevel(this.currentIdx + 1);
    },

    // ---------- canvas 绘制 ----------
    dpr() {
      try {
        const info = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync();
        return info.pixelRatio || 1;
      } catch {
        return 1;
      }
    },
    queryCanvas(sel, cb) {
      uni.createSelectorQuery()
        .in(this)
        .select(sel)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0] || !res[0].node) return;
          const node = res[0].node;
          const dpr = this.dpr();
          node.width = res[0].width * dpr;
          node.height = res[0].height * dpr;
          const ctx = node.getContext('2d');
          ctx.scale(dpr, dpr);
          cb(ctx, res[0].width, res[0].height);
        });
    },
    /** 画一张展开图：每格 = 描边 + 浅色填充的方形多边形，标面序号；opts: { marked, picked, overlap, numbers } */
    drawNetContent(ctx, cssW, cssH, cells, opts = {}) {
      const pad = 12;
      const gw = Math.max(...cells.map((c) => c[0])) + 1;
      const gh = Math.max(...cells.map((c) => c[1])) + 1;
      const cell = Math.floor(Math.min((cssW - pad * 2) / gw, (cssH - pad * 2) / gh));
      const ox = Math.round((cssW - cell * gw) / 2);
      const oy = Math.round((cssH - cell * gh) / 2);
      ctx.clearRect(0, 0, cssW, cssH);
      const overlapSet = new Set(opts.overlap || []);
      cells.forEach(([x, y], i) => {
        const px = ox + x * cell;
        const py = oy + y * cell;
        let fill = COLORS.card;
        let stroke = COLORS.text;
        if (overlapSet.has(i)) {
          fill = COLORS.overlapFill;
          stroke = COLORS.error;
        } else if (i === opts.marked) {
          fill = COLORS.markedFill;
          stroke = COLORS.accent;
        } else if (opts.picked && opts.picked.includes(i)) {
          fill = COLORS.pickedFill;
          stroke = COLORS.primary;
        }
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
        ctx.strokeRect(px + 1, py + 1, cell - 2, cell - 2);
        if (opts.numbers !== false) {
          ctx.fillStyle = COLORS.text;
          ctx.font = `600 ${Math.floor(cell * 0.36)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(i + 1), px + cell / 2, py + cell / 2 + 1);
        }
        if (i === opts.marked) {
          ctx.fillStyle = COLORS.accent;
          ctx.font = `${Math.floor(cell * 0.34)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', px + cell - Math.floor(cell * 0.22), py + Math.floor(cell * 0.24));
        }
      });
      return { ox, oy, cell };
    },
    drawLevel() {
      const lv = this.current;
      if (lv.type === 'pick') {
        lv.options.forEach((cells, i) => {
          this.queryCanvas(`#opt-canvas-${i}`, (ctx, w, h) => {
            this.drawNetContent(ctx, w, h, cells, { numbers: false });
          });
        });
        return;
      }
      this.queryCanvas('#net-canvas', (ctx, w, h) => {
        this.netGeom = this.drawNetContent(ctx, w, h, lv.cells, {
          marked: lv.type === 'opposite' ? lv.marked : -1,
          picked: lv.type === 'opposite' ? this.picked : null,
        });
      });
    },

    // ---------- 作答 ----------
    onNetTap(e) {
      const lv = this.current;
      if (lv.type !== 'opposite' || this.answered || !this.netGeom) return;
      const { ox, oy, cell } = this.netGeom;
      const gx = Math.floor((e.detail.x - ox) / cell);
      const gy = Math.floor((e.detail.y - oy) / cell);
      const idx = lv.cells.findIndex(([x, y]) => x === gx && y === gy);
      if (idx < 0) return;
      this.togglePick(idx);
    },
    togglePick(i) {
      if (this.answered) return;
      const at = this.picked.indexOf(i);
      if (at >= 0) this.picked.splice(at, 1);
      else {
        if (this.picked.length >= 2) this.picked.shift();
        this.picked.push(i);
      }
      this.drawLevel(); // 刷新高亮
    },
    useHint() {
      if (this.hintUsed || this.answered) return;
      this.hintUsed = true;
    },
    settle(correct, detail) {
      this.answered = true;
      this.ok = correct;
      this.resultDetail = detail;
      if (!correct) return;
      // 简化三星：答对 3 星，看提示扣 1 星；不做严格限时（见文件头注释）
      this.earned = this.hintUsed ? 2 : 3;
      const rec = this.prog.levels[this.currentIdx];
      if (this.earned > rec.stars) rec.stars = this.earned;
      rec.passed = true;
      netgame.saveProgress(this.prog);
      try {
        streak.record('game');
      } catch {
        /* 存储异常不影响游戏 */
      }
    },
    answerJudge(yes) {
      if (this.answered) return;
      const lv = this.current;
      const correct = yes === lv.answer;
      let detail;
      if (lv.answer) {
        detail = '这个图形是正方体的 11 种合法展开图之一，可以折成正方体。';
      } else {
        const a = analyzeNet(lv.cells);
        if (a.reason === 'overlap' && a.overlap) {
          detail = `折不成：格 ${a.overlap[0] + 1} 和格 ${a.overlap[1] + 1} 折起后会重叠到同一个面（上图中已标红）。`;
          this.queryCanvas('#net-canvas', (ctx, w, h) => {
            this.drawNetContent(ctx, w, h, lv.cells, { overlap: a.overlap });
          });
        } else {
          detail = '折不成：图形中存在环绕结构（如「田」字块），折起时面的朝向会自相矛盾。';
        }
      }
      this.settle(correct, detail);
    },
    submitOpposite() {
      if (this.answered || this.picked.length !== 2) return;
      const lv = this.current;
      // 判定：必须选中 ★ 格，且两格折叠后恰为一对相对面（core isOpposite：法线相反）
      const correct =
        this.picked.includes(lv.marked) && isOpposite(lv.cells, this.picked[0], this.picked[1]);
      this.settle(
        correct,
        `格 ${lv.marked + 1} 折起后与格 ${lv.answer + 1} 朝向正好相反，是一对相对面。`,
      );
    },
    answerPick(i) {
      if (this.answered) return;
      this.pickChosen = i;
      const lv = this.current;
      const correct = i === lv.answer;
      let detail = `答案是 ${this.pickLabels[lv.answer]}。`;
      if (!correct) {
        const a = analyzeNet(lv.options[i]);
        if (a.reason === 'conflict') detail += ` ${this.pickLabels[i]} 含「田」字块式的环绕结构，必折不成。`;
        else if (a.reason === 'overlap' && a.overlap) {
          detail += ` ${this.pickLabels[i]} 折起后有两格会重叠到同一个面。`;
        }
      }
      this.settle(correct, detail);
    },
  },
};
</script>

<style scoped>
.page {
  padding: 20rpx 24rpx 40rpx;
}

/* 成长线进度条 */
.progress-card {
  flex-direction: column;
  align-items: stretch;
  gap: 10rpx;
}

.progress-meta {
  font-size: 26rpx;
}

.strong {
  color: var(--brand);
  font-weight: 700;
}

.progress-track {
  height: 16rpx;
  border-radius: var(--r-pill);
  background: var(--card-alt);
  border: 1rpx solid var(--border);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--r-pill);
  background: linear-gradient(90deg, var(--primary), var(--brand));
  transition: width 0.3s ease;
}

.progress-hint {
  font-size: 22rpx;
  line-height: 1.6;
}

/* 3×5 蛇形路径：pathNodes 已按蛇形序排好，flex 折行即成 S 形 */
.path-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.path-node {
  width: calc(20% - 10rpx);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 14rpx 4rpx 12rpx;
  border-radius: var(--r-m);
  background: var(--card-alt);
  border: 1rpx solid var(--border);
}

.node-num {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 700;
  background: var(--border);
  color: var(--card);
}

.node-type {
  font-size: 18rpx;
  color: var(--muted);
}

.node-stars {
  font-size: 18rpx;
  color: var(--accent);
  letter-spacing: 2rpx;
}

.node-lock {
  font-size: 20rpx;
  color: var(--muted);
}

.node-go {
  font-size: 18rpx;
  color: var(--primary);
  font-weight: 600;
}

.node-open {
  border: 2rpx solid var(--primary);
  padding: 13rpx 3rpx 11rpx;
}

.node-open .node-num {
  background: var(--primary);
  color: #fff;
}

.node-done {
  background: var(--success-bg);
  border-color: var(--success);
}

.node-done .node-num {
  background: var(--success);
  color: #fff;
}

.node-locked {
  opacity: 0.55;
  background: var(--card);
}

/* 关卡页 */
.lv-head {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.lv-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--brand);
  flex: 1;
}

.lv-stars {
  color: var(--accent);
  letter-spacing: 2rpx;
}

.lv-prompt {
  margin: 14rpx 0;
  font-size: 26rpx;
  line-height: 1.7;
}

.net-wrap {
  display: flex;
  justify-content: center;
  margin: 10rpx 0 16rpx;
}

.net-canvas {
  width: 600rpx;
  height: 480rpx;
  background: var(--bg);
  border: 1rpx solid var(--border);
  border-radius: var(--r-m);
}

.pick-tip {
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.opt-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-top: 12rpx;
}

.opt-btn {
  flex: 1;
  min-width: 200rpx;
}

.submit-btn {
  margin-top: 16rpx;
}

.pick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 10rpx;
}

.pick-card {
  width: calc(50% - 8rpx);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 14rpx;
  border-radius: var(--r-m);
  background: var(--card);
  border: 2rpx solid var(--border);
}

.pick-label {
  font-weight: 700;
  color: var(--brand);
}

.opt-canvas {
  width: 260rpx;
  height: 220rpx;
  background: var(--bg);
  border-radius: var(--r-s);
}

.pick-correct {
  border-color: var(--success);
  background: var(--success-bg);
}

.pick-wrong {
  border-color: var(--error);
  background: var(--error-bg);
}

.pick-muted {
  opacity: 0.6;
}

.hint-btn {
  margin-top: 16rpx;
}

.hint-box {
  margin-top: 14rpx;
  padding: 16rpx 20rpx;
  border-radius: var(--r-m);
  font-size: 24rpx;
  line-height: 1.7;
  background: var(--warning-bg);
  border: 1rpx solid var(--warning);
  color: var(--text);
}

.result {
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  border-radius: var(--r-m);
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.result-ok {
  background: var(--success-bg);
}

.result-no {
  background: var(--error-bg);
}

.result-big {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--success);
}

.result-no .result-big {
  color: var(--error);
}

.result-detail {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text);
}
</style>
