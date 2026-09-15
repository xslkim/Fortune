# 立体几何课堂 · 小程序版（GeometryTutor-mp）

从 `apps/web`（Web 版）移植的微信 + 抖音双端小程序。
uni-app Vue3 + Vite；3D 用 three-platformize（按端注入 WechatPlatform / BytePlatform）。

## 常用命令

```bash
npm install              # 建议在仓库根执行（workspaces 会链接 @geo/core）
npm test                 # node --test：工作区冒烟测试（@geo/core 引用 + 业务层 roundtrip）
npm run build:mp-weixin  # 产物 dist/build/mp-weixin
npm run build:mp-toutiao # 产物 dist/build/mp-toutiao
```

真机预览步骤见 [SMOKE.md](./SMOKE.md)。

## 结构

```
@geo/core      几何核心/课程题库（packages/core，npm workspaces 包引用，单一事实源，无需同步）
src/engine/   storage.js（uni.setStorageSync，gt_ 前缀）/ progress.js / audio.js（InnerAudioContext，m4a）
              mastery.js / streak.js / review.js / report.js / categories.js：core 引擎纯函数的 mp 薄包装
              （存储 key 与 web 一致：gt_mastery / gt_streak / gt_review；report.js 负责周报数据组装）
src/viewer/   mpviewer.js（GeoViewerMP：web 版 viewer.js 的小程序移植，无 DOM）
src/components/ GeoCanvas.vue（webgl canvas + 顶点标注层 + 触控）/ ThreeView.vue（canvas 2d 三视图）/ AudioBar.vue
src/pages/    lessons(index+player) / quiz(index+detail) / wrong / lab（tabBar）+ lessons/player、quiz/detail、report/index
src/static/tabbar/  tabBar 图标（tools/gen-icons.sh 生成：python3 + PIL，81×81 透明 PNG）
src/config.js AUDIO_BASE 等常量（CDN 占位，上线前替换）
tests/        冒烟与引擎测试（smoke.test.mjs / engine.test.mjs）
```

## 功能

- 3D 实验室 + 课程播放器（分步讲解、语音、检查点）+ 题库刷题（8 分类 / 难度 / 题型）+ 错题本，详见 SMOKE.md。
- 学习闭环（与 web 版同一套 core 引擎，存储在小程序侧）：
  - 掌握度三星：按分类记录连对升星、答错清零（`gt_mastery`），题库顶部展示各分类星级。
  - 每日目标 streak：学 1 步 / 答 3 题 / 玩 1 关任达一成（`gt_streak`），断签有每月 2 次 freeze 保护。
  - 间隔复习：答错生成 +1/+3/+7 天三节点计划（`gt_review`），错题本顶部「待复习」列出到期题。
  - 家长周报：周一至今日的学习天数 / 正确率 / 攻克错题 / 薄弱知识点，支持一键复制分享文案。

分享：全部页面实现 onShareAppMessage（播放器/答题页/实验室带 path 参数直达内容）；
微信端额外 onShareTimeline + showShareMenu 开朋友圈，抖音端条件编译排除。

## 约定

- 几何核心与数据在 `@geo/core`（packages/core）维护，单一事实源，本工程通过 vite alias
  （`@geo/core` → `../../packages/core/src`）与 workspaces 依赖引用，**无需也不应再同步拷贝**。
- 存储 key 与 web 版一致：`gt_lessons` / `gt_attempts` / `gt_wrong` / `gt_filter` /
  `gt_mastery` / `gt_streak` / `gt_review`。
- npm 依赖版本在 package.json 中锁定（无 ^/~）。
