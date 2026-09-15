// 题型注册表：新增题型 = 在此注册 + 各端一个渲染/判分适配。
// 每类题型提供三个纯函数契约：
//   validate(answer)   校验 answer 结构，返回错误字符串或 null（content.test 用）
//   optionsOf(quiz)    渲染用选项列表（choice/judge 有选项；fill 返回 null，UI 渲染输入框）
//   isCorrect(quiz, response)  判定用户响应是否正确；response 形状随题型（索引 / 索引 / 字符串）
export const QUESTION_TYPES = {
  choice: {
    type: 'choice',
    validate(answer) {
      if (!answer || typeof answer !== 'object') return 'answer 应为对象';
      if (!Array.isArray(answer.options) || answer.options.length < 2) {
        return 'choice: options 应为长度 ≥2 的数组';
      }
      if (
        !Number.isInteger(answer.correct) ||
        answer.correct < 0 ||
        answer.correct >= answer.options.length
      ) {
        return `choice: correct=${answer.correct} 应为 options 界内整数索引`;
      }
      return null;
    },
    optionsOf(quiz) {
      return quiz.answer.options;
    },
    isCorrect(quiz, response) {
      return response === quiz.answer.correct;
    },
  },
  judge: {
    type: 'judge',
    validate(answer) {
      if (!answer || typeof answer !== 'object') return 'answer 应为对象';
      if (answer.correct !== 0 && answer.correct !== 1) {
        return `judge: correct=${answer.correct} 应为 0（错误）或 1（正确）`;
      }
      return null;
    },
    optionsOf() {
      return ['正确', '错误'];
    },
    isCorrect(quiz, response) {
      // answer.correct 是语义值（1=命题正确/0=命题错误），不是选项下标；
      // 选项下标 0='正确'、1='错误'，需经 correctOptionIndex 映射后再比较
      return response === correctOptionIndex(quiz);
    },
  },
  fill: {
    type: 'fill',
    validate(answer) {
      if (!answer || typeof answer !== 'object') return 'answer 应为对象';
      if (
        !Array.isArray(answer.answers) ||
        answer.answers.length < 1 ||
        answer.answers.some((a) => typeof a !== 'string' || a.trim() === '')
      ) {
        return 'fill: answers 应为至少 1 个非空字符串的数组';
      }
      if (answer.numeric) {
        for (const a of answer.answers) {
          const n = Number(a);
          if (!Number.isFinite(n)) return `fill: numeric 答案 "${a}" 无法转换为数值`;
        }
      }
      return null;
    },
    optionsOf() {
      return null;
    },
    isCorrect(quiz, response) {
      const { answers, numeric } = quiz.answer;
      if (typeof response !== 'string') return false;
      if (numeric) {
        const n = Number(response.trim());
        if (!Number.isFinite(n)) return false;
        // 数值容差 1e-6：不接受分数/根式写法，仅十进制数值
        return answers.some((a) => Math.abs(Number(a) - n) <= 1e-6);
      }
      const norm = (s) => s.trim().toLowerCase();
      return answers.some((a) => norm(a) === norm(response));
    },
  },
};

export const DEFAULT_TYPE = 'choice';

// 题目题型：优先取顶层 type，其次 answer.type（旧数据），缺省 choice
export function typeOf(quiz) {
  return quiz.type || (quiz.answer && quiz.answer.type) || DEFAULT_TYPE;
}

// 正确选项的下标：choice 直接是 answer.correct；judge 的 answer.correct 是
// 语义值（1=正确/0=错误），映射到 optionsOf 的下标（0='正确'、1='错误'）
export function correctOptionIndex(quiz) {
  if (typeOf(quiz) === 'judge') return quiz.answer.correct === 1 ? 0 : 1;
  return quiz.answer.correct;
}

// 取题型定义；未知题型抛错（数据校验阶段应先经 validate 拦截）
export function typeDef(quiz) {
  const def = QUESTION_TYPES[typeOf(quiz)];
  if (!def) throw new Error(`未知题型 "${typeOf(quiz)}"（题 ${quiz.id || '?'}）`);
  return def;
}
