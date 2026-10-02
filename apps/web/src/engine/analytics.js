// Web 端匿名访问埋点：批量上报到 apps/analytics，失败静默。
// 关闭方式：window.__GEO_ANALYTICS_URL__ = ''（或未启动统计服务时自动失败忽略）。

import * as store from './store.js';

const ENDPOINT =
  typeof window !== 'undefined' && '__GEO_ANALYTICS_URL__' in window
    ? String(window.__GEO_ANALYTICS_URL__ || '')
    : 'http://localhost:8472';

const FLUSH_MS = 3000;
const MAX_BATCH = 40;

let queue = [];
let timer = null;
let sessionSent = false;

function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, '');
  return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function visitorId() {
  let id = store.get(store.STORAGE_KEYS.visitor, null);
  if (typeof id === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(id)) return id;
  id = uuid().slice(0, 32);
  store.set(store.STORAGE_KEYS.visitor, id);
  return id;
}

function enqueue(ev) {
  if (!ENDPOINT) return;
  queue.push({ ...ev, ts: Date.now() });
  if (queue.length >= MAX_BATCH) flush();
  else schedule();
}

function schedule() {
  if (timer != null) return;
  timer = setTimeout(() => {
    timer = null;
    flush();
  }, FLUSH_MS);
}

export function flush() {
  if (!ENDPOINT || !queue.length) return;
  const events = queue.splice(0, MAX_BATCH);
  const body = JSON.stringify({ visitorId: visitorId(), events });
  const url = `${ENDPOINT.replace(/\/$/, '')}/api/v1/events`;
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    /* fall through */
  }
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
    mode: 'cors',
  }).catch(() => {
    /* 静默：统计服务未启动时不影响产品 */
  });
}

/** 应用启动时调用一次。 */
export function trackSession() {
  if (sessionSent) return;
  sessionSent = true;
  enqueue({ type: 'session_start' });
}

/** @param {string} page */
export function trackPage(page) {
  if (!page) return;
  enqueue({ type: 'page_view', page: String(page) });
}

/** @param {string} quizId @param {{ from?: string }} [meta] */
export function trackQuiz(quizId, meta = {}) {
  if (!quizId) return;
  const payload = { type: 'quiz_view', quizId: String(quizId) };
  if (meta && typeof meta === 'object') payload.meta = meta;
  enqueue(payload);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
