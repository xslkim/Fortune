// 音频控制条：重播讲解 + 变速（抖音端 playbackRate 探测失败则隐藏变速）。
<template>
  <view class="audio-bar">
    <button class="btn btn-small" @click="$emit('replay')">🔊 重播讲解</button>
    <view v-if="rateSupported" class="rate-row">
      <text
        v-for="r in rates"
        :key="r"
        class="rate-chip"
        :class="{ on: rate === r }"
        @click="pick(r)"
      >{{ r }}×</text>
    </view>
  </view>
</template>

<script>
import * as audio from '../engine/audio.js';

export default {
  emits: ['replay'],
  data() {
    return {
      rates: [0.75, 1, 1.25, 1.5],
      rate: 1,
      rateSupported: audio.isRateSupported(),
    };
  },
  methods: {
    pick(r) {
      this.rate = r;
      audio.setRate(r);
      // 抖音端探测失败：隐藏变速
      this.rateSupported = audio.isRateSupported();
    },
  },
};
</script>

<style scoped>
.audio-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin: 12rpx 0;
}

.rate-row {
  display: flex;
  gap: 12rpx;
}

.rate-chip {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background: #eef2f7;
  color: #5a6b80;
}

.rate-chip.on {
  background: #1f3a5f;
  color: #ffffff;
}
</style>
