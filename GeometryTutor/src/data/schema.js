// ===== 题库扩展字段 schema（内容方填写约定）=====
//
// quizzes.js 中每题的基础字段：{ id, title, category, difficulty, solid, question, answer, explain, scene, insight? }
// 以下为可选扩展字段，app.js 全部容错：缺字段或取值非法时按"无该特性"正常显示，不报错。
//
// ----- challenge：难题双评分挑战（Euclidea 式自我评估挑战）-----
// 答对后展示「挑战模式」卡，鼓励学生用更少步骤/更简方法重解，自评确认后获得「简洁星」。
//
//   challenge: {
//     lStars: 2,                    // 简洁星档位：整数 1-3（类似 Euclidea 的 L 星）。
//                                   //   1 = 稍有简化空间；2 = 有明确的更简方法；3 = 存在非常巧妙的解法。
//                                   //   缺省/非法值按 1 处理。
//     eHint: '试试用勾股定理的合成而不是分步计算',   // 更简解法的提示文案（字符串，可选）。
//                                   //   不给提示时 UI 只显示鼓励文案。
//   }
//
// 说明：
// - challenge 只应加在难度 2-3 且有多种解法的题上；难度 1 的题一般不加。
// - 自我评估制：app 不做真实解法判定，学生点「我做到了更简解法」即记录 lStars 颗简洁星，
//   最佳纪录存 localStorage 键 gt_challenge（{ [quizId]: { stars, ts } }），取历史最高。
// - 填字段前请确认该题确实存在更简解法，eHint 只给方向不给完整答案。
export const SCHEMA_VERSION = 1;
