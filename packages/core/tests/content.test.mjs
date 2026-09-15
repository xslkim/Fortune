import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { catalog } from '../src/geo/solids.js';
import { LESSONS } from '../src/data/lessons.js';
import { QUIZZES } from '../src/data/quizzes.js';
import { QUESTION_TYPES, DEFAULT_TYPE, typeOf, correctOptionIndex } from '../src/question-types.js';

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
      out.push({
        where: `LESSONS[${li}](${lesson.id}).steps[${si}]`,
        solid: lesson.solid,
        scene: step.scene,
      });
    });
  });
  QUIZZES.forEach((quiz, qi) => {
    out.push({ where: `QUIZZES[${qi}](${quiz.id}).scene`, solid: quiz.solid, scene: quiz.scene });
    quiz.explain.forEach((ex, ei) => {
      out.push({
        where: `QUIZZES[${qi}](${quiz.id}).explain[${ei}]`,
        solid: quiz.solid,
        scene: ex.scene,
      });
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
      assert.ok(
        Number.isInteger(f) && f >= 0 && f < g.faces.length,
        `${where}: 面索引 ${f} 越界（${solid} 共 ${g.faces.length} 个面）`,
      );
    }
  }
});

test('scene.unfold 若存在，必须是 [0, 1] 内的数', () => {
  for (const { where, scene } of collectScenes()) {
    if (scene.unfold === undefined || scene.unfold === null) continue;
    assert.equal(typeof scene.unfold, 'number', `${where}: unfold 应为数字`);
    assert.ok(
      scene.unfold >= 0 && scene.unfold <= 1,
      `${where}: unfold=${scene.unfold} 超出 [0, 1]`,
    );
  }
});

test('scene.views 若存在，必须是 boolean', () => {
  for (const { where, scene } of collectScenes()) {
    if (scene.views === undefined || scene.views === null) continue;
    assert.equal(
      typeof scene.views,
      'boolean',
      `${where}: views 应为 boolean，得到 ${typeof scene.views}`,
    );
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

test('quiz 的 answer 结构按题型注册表校验，explain 至少 2 步', () => {
  for (const quiz of QUIZZES) {
    const t = typeOf(quiz);
    const def = QUESTION_TYPES[t];
    assert.ok(def, `${quiz.id}: 未知题型 "${t}"（未在 QUESTION_TYPES 注册）`);
    const err = def.validate(quiz.answer);
    assert.equal(err, null, `${quiz.id}(${t}): ${err}`);
    assert.ok(quiz.explain.length >= 2, `${quiz.id}: explain 至少 2 步`);
    if (t === 'fill' && quiz.answer.numeric) {
      for (const a of quiz.answer.answers) {
        assert.ok(Number.isFinite(Number(a)), `${quiz.id}: numeric 答案 "${a}" 无法 Number() 转换`);
      }
    }
  }
});

// judge 语义回归：answer.correct 是语义值（1=命题正确/0=命题错误），不是选项下标。
// 选项为 ['正确','错误']（下标 0/1），判分与高亮必须经 correctOptionIndex 映射——
// 两端 UI 曾直接 response === answer.correct 导致全部判反（见重构日志"提交前评审修复"）。
test('judge 题：语义 correct 与选项下标的映射一致，全量 judge 题判分方向正确', () => {
  const judge = QUESTION_TYPES.judge;
  assert.deepEqual(judge.optionsOf(), ['正确', '错误']);
  // 命题为真（correct=1）：点「正确」(0) 判对，点「错误」(1) 判错
  const truthy = { type: 'judge', answer: { correct: 1 } };
  assert.equal(correctOptionIndex(truthy), 0);
  assert.ok(judge.isCorrect(truthy, 0));
  assert.ok(!judge.isCorrect(truthy, 1));
  // 命题为假（correct=0）：点「错误」(1) 判对，点「正确」(0) 判错
  const falsy = { type: 'judge', answer: { correct: 0 } };
  assert.equal(correctOptionIndex(falsy), 1);
  assert.ok(judge.isCorrect(falsy, 1));
  assert.ok(!judge.isCorrect(falsy, 0));
  for (const quiz of QUIZZES.filter((q) => typeOf(q) === 'judge')) {
    assert.ok(
      judge.isCorrect(quiz, correctOptionIndex(quiz)),
      `${quiz.id}: 按 correctOptionIndex 作答应判对`,
    );
    assert.ok(
      !judge.isCorrect(quiz, 1 - correctOptionIndex(quiz)),
      `${quiz.id}: 选另一项应判错`,
    );
  }
});

test('题型分布：choice 占主体，judge/fill 各 10 道', () => {
  const count = (t) => QUIZZES.filter((q) => typeOf(q) === t).length;
  assert.equal(count('judge'), 10);
  assert.equal(count('fill'), 10);
  assert.equal(count(DEFAULT_TYPE), QUIZZES.length - 20);
});

const CATEGORIES = [
  '结构',
  '表面积体积',
  '展开图',
  '三视图',
  '截面',
  '位置关系',
  '平行垂直',
  '空间向量',
];

test('每题 category 存在且在 8 个合法值内；每类至少 5 题；总题数 ≥ 100', () => {
  assert.ok(QUIZZES.length >= 100, `总题数 ${QUIZZES.length} < 100`);
  const count = new Map(CATEGORIES.map((c) => [c, 0]));
  for (const quiz of QUIZZES) {
    assert.ok(quiz.category, `${quiz.id}: 缺 category`);
    assert.ok(
      CATEGORIES.includes(quiz.category),
      `${quiz.id}: category "${quiz.category}" 不在合法值集合内`,
    );
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
    assert.ok(
      Number.isInteger(lStars) && lStars >= 1 && lStars <= 3,
      `${quiz.id}: lStars=${lStars} 应为 1-3 的整数`,
    );
    assert.equal(typeof eHint, 'string', `${quiz.id}: eHint 应为字符串`);
    assert.ok(eHint.length <= 50, `${quiz.id}: eHint 超长（${eHint.length} 字）`);
  }
});

// ===== C1 学练数据打通：课程 category 与题目 lessonIds =====

const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));

test('每课 category 存在且在 8 个合法值内', () => {
  for (const lesson of LESSONS) {
    assert.ok(lesson.category, `${lesson.id}: 缺 category`);
    assert.ok(
      CATEGORIES.includes(lesson.category),
      `${lesson.id}: category "${lesson.category}" 不在 8 类枚举内`,
    );
  }
});

test('每题 lessonIds 为非空数组、引用课存在，且所引课 category 覆盖该题 category', () => {
  for (const quiz of QUIZZES) {
    assert.ok(
      Array.isArray(quiz.lessonIds) && quiz.lessonIds.length > 0,
      `${quiz.id}: lessonIds 应为非空数组`,
    );
    for (const lid of quiz.lessonIds) {
      assert.ok(LESSON_BY_ID.has(lid), `${quiz.id}: lessonIds 引用了不存在的课程 "${lid}"`);
    }
    assert.ok(
      quiz.lessonIds.some((lid) => LESSON_BY_ID.get(lid).category === quiz.category),
      `${quiz.id}: lessonIds [${quiz.lessonIds}] 中没有 category 为 "${quiz.category}" 的课程`,
    );
  }
});

// ===== C2 循序渐进数据：level 与 prereq =====

test('每课 level 合法（junior|senior），prereq 为数组且引用的课存在', () => {
  for (const lesson of LESSONS) {
    assert.ok(
      ['junior', 'senior'].includes(lesson.level),
      `${lesson.id}: level "${lesson.level}" 非法`,
    );
    assert.ok(Array.isArray(lesson.prereq), `${lesson.id}: prereq 应为数组`);
    for (const pid of lesson.prereq) {
      assert.ok(LESSON_BY_ID.has(pid), `${lesson.id}: prereq 引用了不存在的课程 "${pid}"`);
    }
  }
});

test('prereq 依赖无环（传递闭包检测）', () => {
  const visiting = new Set();
  const done = new Set();
  const visit = (id, chain) => {
    if (done.has(id)) return;
    assert.ok(!visiting.has(id), `prereq 存在环：${[...chain, id].join(' -> ')}`);
    visiting.add(id);
    const lesson = LESSON_BY_ID.get(id);
    for (const pid of lesson.prereq) visit(pid, [...chain, id]);
    visiting.delete(id);
    done.add(id);
  };
  for (const lesson of LESSONS) visit(lesson.id, []);
});

// ===== C3 课内检查点数据：step.check =====

test('step.check 若存在：options 2-4 个、answer 整数且界内、hint 为字符串', () => {
  let count = 0;
  for (const lesson of LESSONS) {
    lesson.steps.forEach((step, si) => {
      const c = step.check;
      if (c === undefined || c === null) return;
      count++;
      assert.equal(
        typeof c.question,
        'string',
        `${lesson.id}.steps[${si}]: check.question 应为字符串`,
      );
      assert.ok(
        Array.isArray(c.options) && c.options.length >= 2 && c.options.length <= 4,
        `${lesson.id}.steps[${si}]: check.options 应有 2-4 个选项`,
      );
      assert.ok(
        Number.isInteger(c.answer) && c.answer >= 0 && c.answer < c.options.length,
        `${lesson.id}.steps[${si}]: check.answer=${c.answer} 越界`,
      );
      if (c.hint !== undefined)
        assert.equal(typeof c.hint, 'string', `${lesson.id}.steps[${si}]: check.hint 应为字符串`);
    });
  }
  assert.ok(count >= 5, `课内检查点数量 ${count} < 5`);
});

// ===== C5 难题内容：难度 3 的题应有 insight 与易错点第 3 步 =====

test('难度 3 的题：insight 为不超过 30 字的字符串，explain 恰有易错点第 3 步', () => {
  const q3 = QUIZZES.filter((q) => q.difficulty === 3);
  assert.ok(q3.length >= 30, `难度 3 的题只有 ${q3.length} 道`);
  for (const quiz of q3) {
    assert.equal(typeof quiz.insight, 'string', `${quiz.id}: 难度 3 应补 insight`);
    assert.ok(
      quiz.insight.length > 0 && quiz.insight.length <= 30,
      `${quiz.id}: insight 长度 ${quiz.insight.length} 超出 (0, 30]`,
    );
    assert.ok(quiz.explain.length >= 3, `${quiz.id}: 难度 3 的 explain 应有第 3 步易错点`);
    assert.ok(
      quiz.explain[quiz.explain.length - 1].text.startsWith('<b>易错点：</b>'),
      `${quiz.id}: explain 末步应以 <b>易错点：</b> 开头`,
    );
    // fill 型题（q101 起）讲解不配语音，音频 id 仍应为 null；选择题的易错点步配 qXX-ex3
    const expectedAudio = quiz.type === 'fill' ? null : `${quiz.id}-ex3`;
    assert.equal(
      quiz.explain[quiz.explain.length - 1].audio,
      expectedAudio,
      `${quiz.id}: 易错点步 audio 应为 ${expectedAudio}`,
    );
  }
});
