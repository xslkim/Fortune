// 语音播放引擎：uni.createInnerAudioContext 封装，只放 m4a。
// 文件来自远程 CDN（src/config.js 的 AUDIO_BASE，经 VITE_GEO_AUDIO_BASE 注入）；
// 播放失败走 fail 回调：resolve(false) 并 toast 提示用户阅读文字讲解（3 秒节流防重复）。
// 变速：playbackRate 赋值探测，抖音端探测失败则 rateSupported=false，UI 隐藏变速。
import { AUDIO_BASE, IS_TOUTIAO } from '../config.js';

let current = null;
let rate = 1;
// 微信端 playbackRate 稳定支持；抖音端需要运行期探测（初始乐观，探测失败后翻转）。
let rateSupported = !IS_TOUTIAO;
let rateProbed = !IS_TOUTIAO;

// toast 节流：短时间内多次播放失败只提示一次
let lastToastAt = 0;
function toastFail() {
  const now = Date.now();
  if (now - lastToastAt < 3000) return;
  lastToastAt = now;
  try {
    uni.showToast({ title: '语音加载失败，请阅读文字讲解', icon: 'none' });
  } catch {
    /* 忽略 */
  }
}

export function isRateSupported() {
  return rateSupported;
}

export function setRate(x) {
  rate = x;
  if (current) {
    try {
      current.playbackRate = x;
    } catch {
      rateSupported = false;
    }
  }
}

export function stopVoice() {
  if (current) {
    try {
      current.destroy();
    } catch {
      /* 忽略 */
    }
    current = null;
  }
}

export const stopAll = stopVoice;

/**
 * 播放语音 id 对应的 `${AUDIO_BASE}${id}.m4a`。
 * 返回 Promise<boolean>：成功开始播放为 true，任何失败均为 false（并 toast 提示）。
 */
export function playVoice(id) {
  stopVoice();
  if (!id) return Promise.resolve(false);
  // AUDIO_BASE 未配置（空字符串）时直接走失败路径，不拼畸形 URL
  if (!AUDIO_BASE)
    return Promise.resolve(false).then((ok) => {
      toastFail();
      return ok;
    });
  const ctx = uni.createInnerAudioContext();
  current = ctx;
  return new Promise((resolve) => {
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      if (current === ctx) current = null;
      try {
        ctx.destroy();
      } catch {
        /* 忽略 */
      }
      toastFail();
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
