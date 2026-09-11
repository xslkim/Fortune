// 语音播放引擎：优先 assets/audio/voice/<id>.ogg，兜底 .m4a；
// 文件缺失或播放被拒时静默返回 false，调用方可降级到 speak() 的中文 TTS。
const VOICE_BASE = './assets/audio/voice/';

let current = null;
let rate = 1;
let ttsEnabled = true;

export function setRate(x) {
  rate = x;
  if (current) current.playbackRate = x;
}

export function setTtsEnabled(on) {
  ttsEnabled = !!on;
  if (!on && 'speechSynthesis' in window) speechSynthesis.cancel();
}

export function stopVoice() {
  if (current) {
    current.pause();
    current.src = '';
    current = null;
  }
}

export function stopAll() {
  stopVoice();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

// iOS/Safari 要求音频播放发生在用户手势里：首次手势时调用一次预热。
export function unlock() {
  const el = new Audio();
  el.muted = true;
  el.play().then(() => el.pause()).catch(() => {});
}

/**
 * 播放语音文件。返回 Promise<boolean>：成功开始播放为 true，任何失败均为 false（静默）。
 * 播放中再次调用会先停掉旧的。
 */
export function playVoice(id) {
  stopVoice();
  if (!id) return Promise.resolve(false);
  const el = new Audio();
  el.preload = 'auto';
  current = el;
  return new Promise((resolve) => {
    let settled = false;
    el.addEventListener('error', () => {
      if (settled) return;
      if (el.src.endsWith('.ogg')) {
        el.src = `${VOICE_BASE}${id}.m4a`; // 兜底格式，error 监听继续生效
      } else {
        settled = true;
        if (current === el) current = null;
        resolve(false);
      }
    });
    el.addEventListener('canplay', () => {
      if (settled) return;
      settled = true;
      el.playbackRate = rate;
      el.play()
        .then(() => resolve(true))
        .catch(() => {
          if (current === el) current = null;
          resolve(false);
        });
    }, { once: true });
    el.src = `${VOICE_BASE}${id}.ogg`;
  });
}

/** 中文 TTS 兜底（可通过 setTtsEnabled 关闭）。 */
export function speak(text) {
  if (!ttsEnabled || !('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = rate;
  speechSynthesis.speak(u);
}
