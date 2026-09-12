<script>
export default {
  onLaunch() {},
};
</script>

<style>
/* 全局风格对齐 web 版：深蓝顶栏 #1f3a5f、卡片式列表、浅灰背景 */
page {
  background: #f6f8fb;
  color: #24303f;
  font-size: 28rpx;
  line-height: 1.6;
}

.panel-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1f3a5f;
  margin: 24rpx 0 16rpx;
}

.muted {
  color: #7a8aa0;
  font-size: 24rpx;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 2rpx 10rpx rgba(31, 58, 95, 0.08);
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
  border-radius: 999rpx;
  background: #eef2f7;
  color: #5a6b80;
}

.badge.cat { background: #e8eefc; color: #1f3a5f; }
.badge.diff-1 { background: #e6f6ec; color: #1e8e4e; }
.badge.diff-2 { background: #fdf3e2; color: #b97909; }
.badge.diff-3 { background: #fdeaea; color: #c0392b; }
.badge.st-ok { background: #e6f6ec; color: #1e8e4e; }
.badge.st-doing { background: #e8eefc; color: #1f3a5f; }
.badge.st-wrong { background: #fdeaea; color: #c0392b; }
.badge.st-none { background: #eef2f7; color: #7a8aa0; }

.btn {
  background: #eef2f7;
  color: #24303f;
  border-radius: 12rpx;
  font-size: 28rpx;
  padding: 10rpx 28rpx;
  line-height: 1.5;
}

.btn::after { border: none; }

.btn-primary {
  background: #1f3a5f;
  color: #ffffff;
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
  color: #1f3a5f;
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
  border-radius: 999rpx;
}

.stats {
  display: flex;
  gap: 24rpx;
  margin: 16rpx 0;
}

.stat {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 16rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  box-shadow: 0 2rpx 10rpx rgba(31, 58, 95, 0.08);
}

.stat .num {
  font-size: 36rpx;
  color: #1f3a5f;
}

.stat .cap {
  font-size: 22rpx;
  color: #7a8aa0;
}

.step-body {
  background: #ffffff;
  border-radius: 16rpx;
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
  background: #ffffff;
  border-radius: 12rpx;
  padding: 20rpx 28rpx;
  text-align: left;
  font-size: 28rpx;
  border: 2rpx solid #dbe3ec;
}

.option.correct {
  border-color: #1e8e4e;
  background: #e6f6ec;
}

.option.wrong {
  border-color: #c0392b;
  background: #fdeaea;
}

.result {
  margin-top: 20rpx;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  font-weight: 600;
}

.result.ok { background: #e6f6ec; color: #1e8e4e; }
.result.no { background: #fdeaea; color: #c0392b; }

.euler {
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  background: #ffffff;
  margin: 12rpx 0;
}

.euler.ok { color: #1e8e4e; }
.euler.no { color: #c0392b; }
</style>
