// 题目分类常量：与 web 版 ui/app.js 保持一致（8 类；未知归入'综合'）。
export const CATEGORIES = [
  '结构',
  '表面积体积',
  '展开图',
  '三视图',
  '截面',
  '位置关系',
  '平行垂直',
  '空间向量',
];
export const FALLBACK_CAT = '综合';

export function quizCategory(q) {
  return CATEGORIES.includes(q.category) ? q.category : FALLBACK_CAT;
}
