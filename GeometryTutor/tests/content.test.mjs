import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { catalog } from '../src/geo/solids.js';
import { LESSONS } from '../src/data/lessons.js';
import { QUIZZES } from '../src/data/quizzes.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// 几何体目录：catalog id -> 构建出的几何体
const SOLIDS = new Map(catalog().map((item) => [item.id, item.make()]));

// 用正则从 tools/tts_lines.py 解析出所有音频 id（元组的第一个字符串元素）
function ttsIds() {
  const src = readFileSync(join(root, 'tools', 'tts_lines.py'), 'utf8');
  const ids = new Set();
  for (const m of src.matchAll(/\(\s*"([^"]+)"\s*,/g)) ids.add(m[1]);
  return ids;
}

// 收集一条内容（课程或题目）里的全部 scene，并标注来源路径便于报错
function collectScenes() {
  const out = [];
  LESSONS.forEach((lesson, li) => {
    lesson.steps.forEach((step, si) => {
      out.push({ where: `LESSONS[${li}](${lesson.id}).steps[${si}]`, solid: lesson.solid, scene: step.scene });
    });
  });
  QUIZZES.forEach((quiz, qi) => {
    out.push({ where: `QUIZZES[${qi}](${quiz.id}).scene`, solid: quiz.solid, scene: quiz.scene });
    quiz.explain.forEach((ex, ei) => {
      out.push({ where: `QUIZZES[${qi}](${quiz.id}).explain[${ei}]`, solid: quiz.solid, scene: ex.scene });
    });
  });
  return out;
}

test('每个 scene.highlight 的 label 与 faces 索引在对应几何体中合法', () => {
  for (const { where, solid, scene } of collectScenes()) {
    const g = SOLIDS.get(solid);
    assert.ok(g, `${where}: 未知几何体 ${solid}`);
    const labels = new Set(g.points.map((p) => p.label).filter(Boolean));
    const h = scene.highlight;
    for (const label of h.points) {
      assert.ok(labels.has(label), `${where}: 顶点 label "${label}" 在 ${solid} 中不存在`);
    }
    for (const [a, b] of h.edges) {
      assert.ok(labels.has(a), `${where}: 边端点 "${a}" 在 ${solid} 中不存在`);
      assert.ok(labels.has(b), `${where}: 边端点 "${b}" 在 ${solid} 中不存在`);
    }
    for (const f of h.faces) {
      assert.ok(Number.isInteger(f) && f >= 0 && f < g.faces.length,
        `${where}: 面索引 ${f} 越界（${solid} 共 ${g.faces.length} 个面）`);
    }
  }
});

test('scene.unfold 若存在，必须是 [0, 1] 内的数', () => {
  for (const { where, scene } of collectScenes()) {
    if (scene.unfold === undefined || scene.unfold === null) continue;
    assert.equal(typeof scene.unfold, 'number', `${where}: unfold 应为数字`);
    assert.ok(scene.unfold >= 0 && scene.unfold <= 1,
      `${where}: unfold=${scene.unfold} 超出 [0, 1]`);
  }
});

test('scene.views 若存在，必须是 boolean', () => {
  for (const { where, scene } of collectScenes()) {
    if (scene.views === undefined || scene.views === null) continue;
    assert.equal(typeof scene.views, 'boolean', `${where}: views 应为 boolean，得到 ${typeof scene.views}`);
  }
});

test('audio id 全局唯一，且非 null 的 id 都在 tts_lines.py 中有台词', () => {
  const seen = new Map();
  const check = (audio, where) => {
    if (audio === null || audio === undefined) return;
    assert.equal(typeof audio, 'string', `${where}: audio 应为字符串或 null`);
    assert.ok(!seen.has(audio), `${where}: audio id "${audio}" 与 ${seen.get(audio)} 重复`);
    seen.set(audio, where);
  };
  LESSONS.forEach((lesson, li) => {
    lesson.steps.forEach((step, si) => check(step.audio, `LESSONS[${li}].steps[${si}]`));
  });
  QUIZZES.forEach((quiz, qi) => {
    quiz.explain.forEach((ex, ei) => check(ex.audio, `QUIZZES[${qi}].explain[${ei}]`));
  });

  const ids = ttsIds();
  for (const [audio, where] of seen) {
    assert.ok(ids.has(audio), `${where}: audio id "${audio}" 在 tools/tts_lines.py 中没有对应台词`);
  }
});

test('quiz 的 correct 在 options 界内，且 explain 至少 2 步', () => {
  for (const quiz of QUIZZES) {
    assert.equal(quiz.answer.type, 'choice', quiz.id);
    assert.equal(quiz.answer.options.length, 4, `${quiz.id}: 应有 4 个选项`);
    assert.ok(Number.isInteger(quiz.answer.correct)
      && quiz.answer.correct >= 0 && quiz.answer.correct < quiz.answer.options.length,
      `${quiz.id}: correct=${quiz.answer.correct} 越界`);
    assert.ok(quiz.explain.length >= 2, `${quiz.id}: explain 至少 2 步`);
  }
});

const CATEGORIES = ['结构', '表面积体积', '展开图', '三视图', '截面', '位置关系', '平行垂直', '空间向量'];

test('每题 category 存在且在 8 个合法值内；每类至少 5 题；总题数 ≥ 100', () => {
  assert.ok(QUIZZES.length >= 100, `总题数 ${QUIZZES.length} < 100`);
  const count = new Map(CATEGORIES.map((c) => [c, 0]));
  for (const quiz of QUIZZES) {
    assert.ok(quiz.category, `${quiz.id}: 缺 category`);
    assert.ok(CATEGORIES.includes(quiz.category),
      `${quiz.id}: category "${quiz.category}" 不在合法值集合内`);
    count.set(quiz.category, count.get(quiz.category) + 1);
  }
  for (const [cat, n] of count) {
    assert.ok(n >= 5, `category "${cat}" 只有 ${n} 题（< 5）`);
  }
});

test('challenge 若存在：lStars ∈ {1,2,3}，eHint 是不超过 50 字的字符串', () => {
  for (const quiz of QUIZZES) {
    if (quiz.challenge === undefined || quiz.challenge === null) continue;
    const { lStars, eHint } = quiz.challenge;
    assert.ok(Number.isInteger(lStars) && lStars >= 1 && lStars <= 3,
      `${quiz.id}: lStars=${lStars} 应为 1-3 的整数`);
    assert.equal(typeof eHint, 'string', `${quiz.id}: eHint 应为字符串`);
    assert.ok(eHint.length <= 50, `${quiz.id}: eHint 超长（${eHint.length} 字）`);
  }
});
