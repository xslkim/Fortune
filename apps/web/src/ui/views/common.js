// 视图共享的底层工具：DOM 构造、目录/题库索引、播放器头部、步骤音频、互动 chip、目标行。
// 供壳 app.js 与各视图模块（views/*.js）共用；本模块不依赖任何视图模块。
// 注：state/switchView 来自壳 app.js（循环引用仅在函数调用期生效，模块求值期互不触碰）。
import { catalog } from '@geo/core/geo/solids.js';
import { QUIZZES } from '@geo/core/data/quizzes.js';
import * as audio from '../../engine/audio.js';
import * as streak from '../../engine/streak.js';
import * as review from '../../engine/review.js';
import { todayStr } from '../../engine/days.js';
import { speaker, target, pin } from '../icons.js';
import { state, switchView } from '../app.js';

export const CATALOG = new Map(catalog().map((c) => [c.id, c]));
export const QUIZ_BY_ID = new Map(QUIZZES.map((q) => [q.id, q]));

// ---------- DOM 工具 ----------

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

export function stripHtml(html) {
  const d = el('div', null, html);
  return d.textContent || '';
}

export function makeSolid(id) {
  const item = CATALOG.get(id);
  return item ? item.make() : CATALOG.get('cube').make();
}

// ---------- 播放器通用件 ----------

export function playStepAudio(step) {
  audio.stopAll();
  if (step && step.audio) {
    audio.playVoice(step.audio).then((ok) => {
      if (!ok) audio.speak(stripHtml(step.text));
    });
  } else if (step) {
    audio.speak(stripHtml(step.text));
  }
}

// 播放器通用头部：返回按钮 + 音频控制（重播 / 语速 / TTS 兜底）
export function playerHeader(title, subtitle, onBack) {
  const head = el('div', 'player-head');
  const back = el('button', 'btn btn-ghost', '← 返回');
  back.addEventListener('click', () => {
    audio.stopAll();
    onBack();
  });
  head.appendChild(back);
  const t = el('div', 'player-title');
  t.appendChild(el('h2', null, title));
  if (subtitle) t.appendChild(el('p', 'muted', subtitle));
  head.appendChild(t);

  const bar = el('div', 'audio-bar');
  const replay = el('button', 'btn btn-small', `${speaker} 重播讲解`);
  replay.addEventListener('click', () => state._replay && state._replay());
  bar.appendChild(replay);

  const sel = el('select', 'rate-select');
  for (const [v, txt] of [
    [0.75, '0.75×'],
    [1, '1.0×'],
    [1.25, '1.25×'],
    [1.5, '1.5×'],
  ]) {
    const o = el('option', null, txt);
    o.value = v;
    if (v === 1) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener('change', () => audio.setRate(parseFloat(sel.value)));
  bar.appendChild(sel);

  const ttsLabel = el('label', 'tts-toggle');
  const tts = document.createElement('input');
  tts.type = 'checkbox';
  tts.checked = true;
  tts.addEventListener('change', () => audio.setTtsEnabled(tts.checked));
  ttsLabel.appendChild(tts);
  ttsLabel.appendChild(document.createTextNode(' 语音兜底'));
  bar.appendChild(ttsLabel);

  const earLabel = el('label', 'tts-toggle');
  const ear = document.createElement('input');
  ear.type = 'checkbox';
  ear.checked = true;
  ear.addEventListener('change', () => audio.setEarconEnabled(ear.checked));
  earLabel.appendChild(ear);
  earLabel.appendChild(document.createTextNode(' 提示音'));
  bar.appendChild(earLabel);
  head.appendChild(bar);
  return head;
}

// ---------- 互动提示（viewer 首次拖拽回调，步骤区 chip 状态同步） ----------

export const INTERACT_RE = /拖动|转一转|旋转/;

/** viewer 报告首次用户拖拽后由壳调用：当前步骤的互动 chip 标记「已互动 ✓」。 */
export function markInteractChip() {
  if (state._interactChip) markInteractChipDone(state._interactChip);
}

export function markInteractChipDone(chip) {
  if (chip.classList.contains('done')) return;
  chip.classList.add('done');
  chip.innerHTML = `${target} 已互动 ✓`;
}

// ---------- 今日目标行 ----------

// 统计条下方一行：今日目标进度 + 到期复习入口提示
export function goalLine() {
  const day = todayStr();
  const g = streak.goalProgress(streak.loadStreak(), day);
  const due = review.dueReviews(review.loadReview(), day).filter((id) => QUIZ_BY_ID.has(id));
  const line = el('div', 'goal-line muted');
  line.appendChild(
    el(
      'span',
      null,
      g.done
        ? '✓ 今日目标已达成，明天继续加油'
        : `今日目标（任一即可）：学 ${streak.GOAL_STEPS} 个课程步骤 / 答 ${streak.GOAL_ANSWERS} 题 / 玩 ${streak.GOAL_GAMES} 关闯关（已学 ${g.steps} 步 · 已答 ${g.answers} 题 · 已玩 ${g.games} 关）`,
    ),
  );
  if (due.length) {
    const link = el('button', 'btn btn-ghost due-link', `${pin} ${due.length} 道错题到期待复习 →`);
    link.addEventListener('click', () => switchView('wrong'));
    line.appendChild(link);
  }
  return line;
}
