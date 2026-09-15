// ===== 内容数据 schema（内容方填写约定）=====
//
// quizzes.js 中每题的基础字段：{ id, title, category, difficulty, solid, question, answer, explain, scene, insight?, challenge? }
// lessons.js 中每课的基础字段：{ id, title, subtitle, solid, category, level, prereq, steps }
// 以下为可选扩展字段，app.js 全部容错：缺字段或取值非法时按"无该特性"正常显示，不报错。
//
// ----- type：题型（缺省 'choice'；注册表见 src/question-types.js）-----
//
//   'choice'  四选一。answer: { type:'choice', options: string[]（长度 ≥2，现题库统一 4 项）, correct: 正确项索引 }。
//             用户响应为选项索引。
//   'judge'   判断题。answer: { correct: 0 | 1 }（1 = 正确，0 = 错误）；不写 options 字段，
//             渲染用选项 ['正确','错误'] 由注册表 optionsOf 提供。用户响应为 0 | 1。
//   'fill'    填空题。answer: { answers: string[]（至少 1 个非空字符串，可多个等价答案）, numeric?: boolean }。
//             numeric:true 时每个 answers 项必须可被 Number() 转换，判定按数值比较（容差 1e-6，
//             仅十进制数值，不支持分数/根式写法）；非 numeric 时字符串去空白、不区分大小写全等。
//             用户响应为字符串。
//
// ----- category：8 大章节分类（课程与题目共用同一枚举）-----
//
//   '结构'      认识基本几何体（面/棱/顶点/欧拉公式）
//   '表面积体积' 柱锥球的表面积与体积
//   '截面'      平面截几何体（含球的截面）
//   '展开图'     net-unfold 相关
//   '三视图'    主/左/俯视图
//   '位置关系'  点线面位置关系（含异面直线）
//   '平行垂直'  平行与垂直的判定与性质
//   '空间向量'  建系、向量运算与向量法
//
// ----- lessonIds：题目 ↔ 课程关联（C1 学练数据打通）-----
//
//   每题必填 lessonIds: string[]，指向 lessons.js 中存在的课程 id，含义是"本题考查的知识
//   对应哪几门课"。按 category 映射：
//     结构        → ['solid-basic']
//     表面积体积  → ['prism-volume', 'pyramid-volume', 'cylinder-cone']
//     截面        → ['section-skill', 'sphere-section']
//     展开图      → ['net-unfold']
//     三视图      → ['three-views']
//     位置关系    → ['position-rel']
//     平行垂直    → ['parallel-perp']
//     空间向量    → ['vector-basic', 'vector-angle']
//   约定：lessonIds 中至少一门课的 category 必须等于该题的 category（防止映射错乱）。
//
// ----- lessons.js 课程字段 -----
//
//   level: 'junior' | 'senior'   // 学段/难度层级。junior = 入门五门 + 圆柱与圆锥；
//                                //   senior = 位置关系及之后的综合课。
//   prereq: string[]             // 软前置课程 id（可为空数组）。只是推荐学习顺序，
//                                //   app 不强制；内容测试会校验引用存在且无环。
//   steps[].check?: {            // 课内检查点（可选，插在任一步上作为兄弟字段，不新增 step）
//     question: string,          //   题干
//     options: string[],         //   2-4 个选项
//     answer: number,            //   正确选项索引（0 起）
//     hint?: string,             //   答错提示（可选）
//   }
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
