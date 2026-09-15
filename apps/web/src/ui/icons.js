// 内联 SVG 图标库：替代 emoji，与小程序 tabBar 线性图标同风格。
// - 16×16 viewBox，stroke 风格，stroke-width 1.8，圆角端点，currentColor 继承父级文字色。
// - 纯字符串常量，node（无 DOM）下 import 安全；用法：el.innerHTML = `${ICONS.flame} ${n}`。
// - 需配合全局 .ico 类（index.html 定义宽高与对齐）；star-filled 为填充图标。

const WRAP = (inner) =>
  `<svg class="ico" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export const flame = WRAP(
  '<path d="M8 1.5s3.5 3.2 3.5 6.3a3.5 3.5 0 1 1-7 0C4.5 6 6 4.7 6.6 3.4c.3.8.9 1.3 1.4 1.4C8 3.4 8 2.4 8 1.5z"/>',
);

export const pin = WRAP(
  '<path d="M8 14.5S3.5 10.6 3.5 6.8a4.5 4.5 0 1 1 9 0C12.5 10.6 8 14.5 8 14.5z"/><circle cx="8" cy="6.8" r="1.6"/>',
);

export const bulb = WRAP(
  '<path d="M8 1.8a5 5 0 0 1 2.9 9.1c-.5.4-.9.8-.9 1.6H6c0-.8-.4-1.2-.9-1.6A5 5 0 0 1 8 1.8z"/><path d="M6.5 13h3"/>',
);

export const medal = WRAP(
  '<circle cx="8" cy="6" r="4.2"/><path d="M6.3 9.6 5 14.5l3-1.6 3 1.6-1.3-4.9"/>',
);

export const chart = WRAP(
  '<path d="M3 2.5V13h10.5"/><path d="M6 13V9"/><path d="M9.3 13V6"/><path d="M12.6 13V3.5"/>',
);

export const clipboard = WRAP(
  '<rect x="4" y="2.5" width="8" height="11.5" rx="1.5"/><rect x="6" y="1" width="4" height="3" rx="1"/><path d="M6.5 7.5h3"/><path d="M6.5 10.5h3"/>',
);

export const target = WRAP(
  '<circle cx="8" cy="8" r="6.2"/><circle cx="8" cy="8" r="3.2"/><circle cx="8" cy="8" r="0.6" fill="currentColor" stroke="none"/>',
);

export const speaker = WRAP(
  '<path d="M2.8 6v4h2.6l3.4 2.8V3.2L5.4 6z"/><path d="M11 5.6a3.4 3.4 0 0 1 0 4.8"/><path d="M13.2 3.6a6.2 6.2 0 0 1 0 8.8"/>',
);

export const thought = WRAP(
  '<path d="M4.7 9.7a3 3 0 0 1-.5-5.9 4.2 4.2 0 0 1 8.1 1 2.9 2.9 0 0 1-.8 5.6H6.3"/><path d="M6.3 12.3h.01"/><path d="M8.6 13.9h.01"/>',
);

export const book = WRAP(
  '<path d="M2.5 3.8c2-.9 4-.9 5.5.1 1.5-1 3.5-1 5.5-.1v8.9c-2-.9-4-.9-5.5.1-1.5-1-3.5-1-5.5-.1z"/><path d="M8 4v9"/>',
);

export const starFilled = WRAP(
  '<path d="M8 1.9l1.8 3.7 4.1.6-3 2.9.7 4.1L8 11.3l-3.6 1.9.7-4.1-3-2.9 4.1-.6z" fill="currentColor" stroke="none"/>',
);

export const lock = WRAP(
  '<rect x="3.5" y="7" width="9" height="6.5" rx="1.4"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/><circle cx="8" cy="10.2" r="0.7" fill="currentColor" stroke="none"/><path d="M8 10.7v1.4"/>',
);

export const ICONS = {
  flame,
  pin,
  bulb,
  medal,
  chart,
  clipboard,
  target,
  speaker,
  thought,
  book,
  starFilled,
  lock,
};
