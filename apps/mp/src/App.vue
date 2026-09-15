<script>
export default {
  onLaunch() {
    // 开启分享菜单：微信含朋友圈（shareTimeline），抖音为站内分享
    // #ifdef MP-WEIXIN
    uni.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] });
    // #endif
    // #ifdef MP-TOUTIAO
    try { uni.showShareMenu({}); } catch { /* 旧版抖音无此 API 时忽略 */ }
    // #endif
  },
};
</script>

<style>
/* 全局设计 token：与 web 端共用同一套色板（见产品规范 token 表） */
:root, page {
  --brand:#1f3a5f;    /* 品牌深蓝 */
  --primary:#2f6fdd;  /* 主按钮蓝 */
  --accent:#e8491d;
  --text:#1f2d3d;
  --muted:#5a6b80;
  --bg:#f6f8fb;
  --card:#ffffff;
  --card-alt:#f4f7fb;
  --border:#dde4ee;
  --success:#2d6a4f;  --success-bg:#d8f3dc;
  --warning:#9c6b00;  --warning-bg:#fff3cd;
  --error:#9c1c24;    --error-bg:#f8d7da;
  --r-s:16rpx; --r-m:24rpx; --r-pill:999rpx;
  --shadow:0 2rpx 10rpx rgba(31,58,95,.08);
}

page {
  background: var(--bg);
  color: var(--text);
  font-size: 28rpx;
  line-height: 1.6;
}

/* 可点元素按压反馈（hover-class="cell-hover"） */
.cell-hover {
  opacity: 0.8;
}

/* 列表容器淡入 */
.fade-in {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.panel-title {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--brand);
  margin: 24rpx 0 16rpx;
}

.muted {
  color: var(--muted);
  font-size: 24rpx;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card {
  background: var(--card);
  border: 1rpx solid var(--border);
  border-radius: var(--r-s);
  padding: 24rpx 28rpx;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-main {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}

.badge-row {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-top: 8rpx;
}

.badge {
  font-size: 20rpx;
  padding: 2rpx 14rpx;
  border-radius: var(--r-pill);
  background: var(--card-alt);
  color: var(--muted);
}

.badge.cat { background: var(--card-alt); color: var(--brand); }
.badge.diff-1 { background: var(--success-bg); color: var(--success); }
.badge.diff-2 { background: var(--warning-bg); color: var(--warning); }
.badge.diff-3 { background: var(--error-bg); color: var(--error); }
.badge.st-ok { background: var(--success-bg); color: var(--success); }
.badge.st-doing { background: var(--card-alt); color: var(--brand); }
.badge.st-wrong { background: var(--error-bg); color: var(--error); }
.badge.st-none { background: var(--card-alt); color: var(--muted); }

.btn {
  background: var(--card-alt);
  color: var(--text);
  border-radius: var(--r-s);
  font-size: 28rpx;
  padding: 10rpx 28rpx;
  line-height: 1.5;
}

.btn::after { border: none; }

.btn-primary {
  background: var(--primary);
  color: var(--card);
}

.btn-small {
  font-size: 24rpx;
  padding: 6rpx 20rpx;
}

.btn-block {
  width: 100%;
  margin-top: 24rpx;
}

.btn-ghost {
  background: transparent;
  color: var(--brand);
}

.btn[disabled] {
  opacity: 0.45;
}

.filter-bar {
  display: flex;
  gap: 14rpx;
  flex-wrap: wrap;
  margin: 12rpx 0;
}

.chip {
  border-radius: var(--r-pill);
}

.stats {
  display: flex;
  gap: 24rpx;
  margin: 16rpx 0;
}

.stat {
  background: var(--card);
  border: 1rpx solid var(--border);
  border-radius: var(--r-s);
  padding: 16rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  box-shadow: var(--shadow);
}

.stat .num {
  font-size: 36rpx;
  color: var(--brand);
}

.stat .cap {
  font-size: 22rpx;
  color: var(--muted);
}

.step-body {
  background: var(--card);
  border: 1rpx solid var(--border);
  border-radius: var(--r-s);
  box-shadow: var(--shadow);
  padding: 24rpx 28rpx;
  margin: 16rpx 0;
}

.step-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20rpx 0;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 16rpx;
}

.option {
  background: var(--card);
  border-radius: var(--r-s);
  padding: 20rpx 28rpx;
  text-align: left;
  font-size: 28rpx;
  border: 2rpx solid var(--border);
}

.option.correct {
  border-color: var(--success);
  background: var(--success-bg);
}

.option.wrong {
  border-color: var(--error);
  background: var(--error-bg);
}

.fill-input {
  background: var(--card);
  border-radius: var(--r-s);
  padding: 20rpx 28rpx;
  font-size: 28rpx;
  border: 2rpx solid var(--border);
}

.fill-input.correct {
  border-color: var(--success);
  background: var(--success-bg);
}

.fill-input.wrong {
  border-color: var(--error);
  background: var(--error-bg);
}

.result {
  margin-top: 20rpx;
  padding: 16rpx 24rpx;
  border-radius: var(--r-s);
  font-weight: 600;
}

.result.ok { background: var(--success-bg); color: var(--success); }
.result.no { background: var(--error-bg); color: var(--error); }

.euler {
  padding: 16rpx 24rpx;
  border-radius: var(--r-s);
  background: var(--card);
  border: 1rpx solid var(--border);
  box-shadow: var(--shadow);
  margin: 12rpx 0;
}

.euler.ok { color: var(--success); }
.euler.no { color: var(--error); }
</style>
