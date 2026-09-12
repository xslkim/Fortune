// 语音播放引擎：uni.createInnerAudioContext 封装，只放 m4a。
// 文件来自远程 CDN（src/config.js 的 AUDIO_BASE）；播放失败静默返回 false（调用方自行降级提示）。
// 变速：playbackRate 赋值探测，抖音端探测失败则 rateSupported=false，UI 隐藏变速。
import { AUDIO_BASE, IS_TOUTIAO } from '../config.js';

let current = null;
let rate = 1;
// 微信端 playbackRate 稳定支持；抖音端需要运行期探测（初始乐观，探测失败后翻转）。
let rateSupported = !IS_TOUTIAO;
let rateProbed = !IS_TOUTIAO;

export function isRateSupported() {
  return rateSupported;
}

export function setRate(x) {
  rate = x;
  if (current) {
    try { current.playbackRate = x; } catch { rateSupported = false; }
  }
}

export function stopVoice() {
  if (current) {
    try { current.destroy(); } catch { /* 忽略 */ }
    current = null;
  }
}

export const stopAll = stopVoice;

/**
 * 播放语音 id 对应的 `${AUDIO_BASE}${id}.m4a`。
 * 返回 Promise<boolean>：成功开始播放为 true，任何失败均为 false（静默）。
 */
export function playVoice(id) {
  stopVoice();
  if (!id) return Promise.resolve(false);
  const ctx = uni.createInnerAudioContext();
  current = ctx;
  return new Promise((resolve) => {
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      if (current === ctx) current = null;
      try { ctx.destroy(); } catch { /* 忽略 */ }
      resolve(false);
    };
    ctx.onError(fail);
    ctx.onCanplay(() => {
      if (settled) return;
      settled = true;
      // 变速探测：抖音端设置 playbackRate 可能抛错或无效
      try {
        ctx.playbackRate = rate;
        if (!rateProbed) {
          rateProbed = true;
          rateSupported = typeof ctx.playbackRate === 'number' || rate === 1;
        }
      } catch {
        rateProbed = true;
        rateSupported = false;
      }
      try {
        ctx.play();
        resolve(true);
      } catch {
        fail();
      }
    });
    try {
      ctx.src = `${AUDIO_BASE}${id}.m4a`;
    } catch {
      fail();
    }
  });
}
