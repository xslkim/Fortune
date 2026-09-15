// 交叉核对：lessons.js/quizzes.js/ui/beauty.js 引用的 audio id ↔ tts_lines.py 台词表 ↔ assets/audio/voice/ 文件
// 用法：node tools/check_audio_refs.mjs
import { readFileSync, readdirSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

// audio 取值有两种形态：'id' 单串（lessons/quizzes/beauty）与 ['id', ...] 数组（beauty 卡片）
const refs = new Set();
for (const f of [
  '../../../packages/core/src/data/lessons.js',
  '../../../packages/core/src/data/quizzes.js',
  '../src/ui/beauty.js',
]) {
  for (const m of read(f).matchAll(/audio:\s*(\[[^\]]*\]|'[^']+')/g)) {
    for (const q of m[1].matchAll(/'([^']+)'/g)) refs.add(q[1]);
  }
}

// 用正则从 tools/tts_lines.py 解析台词表（元组的第一个字符串元素），跨平台、不依赖 Python 环境
const lines = new Set(
  [...read('../../../packages/core/tools/tts_lines.py').matchAll(/\(\s*"([^"]+)"\s*,/g)].map(
    (m) => m[1],
  ),
);

const files = new Set(
  readdirSync(new URL('../assets/audio/voice', import.meta.url))
    .filter((f) => f.endsWith('.ogg'))
    .map((f) => f.slice(0, -4)),
);

const diff = (a, b) => [...a].filter((x) => !b.has(x));
const problems = [];
if (diff(refs, lines).length) problems.push(`引用但无台词: ${diff(refs, lines)}`);
if (diff(lines, refs).length) problems.push(`台词未被引用: ${diff(lines, refs)}`);
if (diff(refs, files).length) problems.push(`引用但缺文件: ${diff(refs, files)}`);
if (diff(files, refs).length) problems.push(`多余文件: ${diff(files, refs)}`);

console.log(`refs=${refs.size} lines=${lines.size} files=${files.size}`);
if (problems.length) {
  problems.forEach((p) => console.error('MISMATCH:', p));
  process.exit(1);
}
console.log('OK: 引用、台词表、音频文件三者一一对应');
