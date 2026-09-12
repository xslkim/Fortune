// 语音播放引擎：优先 assets/audio/voice/<id>.ogg，兜底 .m4a；
// 文件缺失或播放被拒时静默返回 false，调用方可降级到 speak() 的中文 TTS。
const VOICE_BASE = './assets/audio/voice/';

let current = null;
let rate = 1;
let ttsEnabled = true;
let earconEnabled = true;
let audioCtx = null;

export function setEarconEnabled(on) {
  earconEnabled = !!on;
}

/** 答题正确的「啊哈」提示音：程序合成的三音上行琶音（C5-E5-G5），无音频资产依赖。 */
export function playEarcon() {
  if (!earconEnabled) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = audioCtx || new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t0 = audioCtx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const t = t0 + i * 0.11;
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch { /* 无音频环境时静默 */ }
}

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
