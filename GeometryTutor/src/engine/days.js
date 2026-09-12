// 日期小工具（纯函数）：day 统一为 'YYYY-MM-DD' 字符串，便于注入与单测。

export function todayStr(now = new Date()) {
  const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function addDays(day, n) {
  const [y, m, d] = day.split('-').map(Number);
  return todayStr(new Date(y, m - 1, d + n));
}

/** b - a 的天数差（a ≤ b 为正）。 */
export function diffDays(a, b) {
  const toUtc = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86400000);
}
