// 交叉核对：lessons.js/quizzes.js 引用的 audio id ↔ tts_lines.py 台词表 ↔ assets/audio/voice/ 文件
// 用法：node tools/check_audio_refs.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

const refs = new Set();
for (const f of ['../src/data/lessons.js', '../src/data/quizzes.js']) {
  for (const m of read(f).matchAll(/audio:\s*'([^']+)'/g)) refs.add(m[1]);
}

const py = execSync(
  `/home/xsl/SoundGame/.venv-tts/bin/python -c "import sys; sys.path.insert(0,'tools'); from tts_lines import LINES; print('\\n'.join(x[0] for x in LINES))"`,
  { cwd: new URL('..', import.meta.url).pathname, encoding: 'utf8' });
const lines = new Set(py.trim().split('\n'));

const files = new Set(
  readdirSync(new URL('../assets/audio/voice', import.meta.url))
    .filter((f) => f.endsWith('.ogg')).map((f) => f.slice(0, -4)));

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
