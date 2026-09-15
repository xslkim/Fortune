# 立体几何课堂（GeometryTutor）

面向中国中学生的立体几何教学辅导 Web 应用。纯前端、零构建、零 npm 依赖，
同时支持 PC 浏览器和手机浏览器（响应式布局）。

## 功能

- **课程**：分步讲解（文字 + 3D 联动高亮 + 语音讲解），现有 13 门：
  认识基本几何体、棱柱的表面积与体积、棱锥的体积、截面问题入门、
  展开图、空间点线面的位置关系、平行与垂直的判定、三视图、
  空间向量及运算、向量法求角与证位置关系、圆柱与圆锥、球与球的截面、
  组合体的表面积；每课带 category/level/prereq 元数据与课内检查点，
  课程进度自动记录（断点续学）
- **题库**：120 道经典中高考风格题目（100 道选择题 + 10 道判断题 + 10 道填空题；
  8 大章节分类 + 难度 1-3 梯度 + 状态筛选），
  每题经 lessonIds 关联对应课程；难度 3 的题附带关键洞察 insight 与"易错点"讲解步，答后给分步讲解
- **错题本**：答错自动收录并按知识点归因，艾宾浩斯 +1/+3/+7 天间隔复习计划，可重答订正
- **掌握度**：每个知识点三星制（连对 3 题熟悉、隔天再对精通），题库页显示星级
- **每日目标**：5 分钟低门槛 streak（学 1 步/答 3 题/玩 1 关任一），每月 2 次断签保护
- **啊哈时刻**：答对即时反馈（提示音 + 3D 演示 + 关键理解卡）
- **闯关**：展开图闯关小游戏 15 关（能不能折/找相对面/选能折成的，三星评分可重刷）
- **探究**：GeoGebra 式自由探究——参数滑杆实时联动体积/表面积，引导发现卡与探究任务
- **几何之美**：五种正多面体、欧拉公式、足球与黄金分割、彭罗斯三角，卡片可听讲解、可分享
- **家长周报**：本周学习数据聚合 + 薄弱知识点提醒 + 一键复制分享文案
- **双评分挑战**：18 道难题配"更简解法"挑战（Euclidea 式自我评估，无排行榜）
- **实验室**：14 种几何体自由观察（旋转/缩放），遮挡棱自动虚线，
  顶点标注、自动旋转、水平截面滑杆、展开图动画（正方体/棱柱/棱锥/圆柱/圆锥/
  圆台可摊平为平面网格，球除外）、三视图面板（正/侧/俯视正交投影，
  被遮挡棱虚线，教材式排版）、欧拉公式 V−E+F=2 实时验证
- 深链：?view=lab&solid=cube&unfold=1&views=1 可直接分享指定状态

## 运行

```bash
npm run serve     # 零依赖静态服务器，端口 8471，监听 0.0.0.0（服务仓库根）
# 浏览器打开 http://localhost:8471/apps/web/（手机与电脑同一局域网也可访问）
# 仓库根目录也可运行：npm run serve
```

## 测试

```bash
npm test          # node --test：web 端剩余用例（闯关/掌握度/streak/复习/周报）
npm run check:audio  # 音频引用↔台词表↔文件三方核对
```

## 架构

本应用是 npm workspaces monorepo 的 `apps/web`，几何核心与课程数据来自
`packages/core`（`@geo/core`，单一事实源）：浏览器内经 importmap 前缀
`@geo/core/` → `/packages/core/src/` 引用，node 测试经 workspaces 符号链接解析。

```
packages/core/src/geo/solids.js      几何体程序化定义（顶点+按面分组索引，CCW 朝外；旋转体边标 smooth）
packages/core/src/geo/topology.js    边推导、正背面/轮廓线分类（对应旧 Unity Geomertry 的 shader 逻辑，此处 CPU 实现）、平面截面
packages/core/src/geo/unfold.js      展开图：面邻接树 + 二面角翻转，faceTransformAt(t) 支持折叠↔摊平插值
packages/core/src/geo/views.js       三视图：正交投影 + 遮挡分类（实线/虚线/轮廓线），输出 2D 线段集
packages/core/src/engine/{days,mastery,streak,review,report}.js  纯逻辑引擎（经 src/engine/ 下 shim 再导出）
packages/core/src/data/              课程内容与题库（数据驱动，schema 见文件头注释；scene 支持 unfold 字段）
packages/core/tests/                 geo/unfold/views/measure/platonic/content 核心测试
src/engine/{days,mastery,streak,review,report}.js  @geo/core 引擎 shim（一行 re-export）
src/ui/threeview.js    三视图 SVG 渲染（教材排版：正视左上、侧视右上、俯视左下）
src/viewer/viewer.js   Three.js(r160, vendored) 查看器：虚线遮挡棱、HTML 顶点标注、高亮 API、截面渲染、展开动画、触控轨道
src/engine/audio.js    语音播放（ogg→m4a 兜底、变速、iOS 解锁、WebSpeech 兜底）
src/engine/store.js   统一存储层：gt_* key 清单 + get/set/remove（JSON，隐私模式降级内存 Map）+ migrate() schema 迁移钩子
src/engine/progress.js 学习进度/作答记录/错题本（localStorage，隐私模式降级）
src/ui/app.js          应用壳：state 单例、tab 路由、statsBar、深链、存储迁移、视图注册表
src/ui/views/          主视图模块（壳按需注册，见下「视图注册表契约」）
src/ui/views/common.js   视图共享底层件：el/stripHtml/makeSolid、playerHeader/playStepAudio、互动 chip、goalLine
../../packages/core/tools/tts_lines.py  讲解台词表（277 条，统一语气指令 + loudnorm 响度归一 -16 LUFS）
tools/gen_voice.py     TTS 生成脚本（复用 SoundGame 的 Qwen3-TTS 环境，幂等增量）
tools/check_audio_refs.mjs  音频引用↔台词表↔文件三方核对
assets/audio/voice/    生成的讲解语音（.ogg + .m4a 双格式，554 个文件）
docs/audio-manifest.md 音频资产清单
```

## 视图注册表契约

`src/ui/app.js` 尾部的 `VIEWS` 是唯一的视图注册表，新增 tab 即插即用：

```js
const VIEWS = [
  { id: 'lessons', title: '课程', init: renderLessonList },
  // { id, title, icon, init } —— icon 预留给将来 tab 图标（当前不渲染）
];
```

- `id`：视图标识，也是 `?view=` 深链参数与 `switchView(id)` 的入参。
- `init`：无参渲染函数，负责把视图渲染进 `#panel`（以及联动 3D 区）。
- 普通视图把 `renderXxx` 直接注册（实现在 `src/ui/views/*.js`，多函数视图由壳
  导入所需入口）；自包含旧模块（闯关/探究/几何之美，`initXxx(container, {viewer, audio})`
  返回带 `destroy()` 的会话句柄）由壳包一层适配：创建会话、记到 `state.extSession`，
  `switchView` 切走时统一调 `destroy()`。
- 跨视图跳转一律走 `switchView(id)`；视图间的细粒度互调（如练习序列 ↔ 课程播放器、
  错题本 → 答题）直接 import 兄弟模块的导出函数（ESM 循环引用仅发生在函数调用期，
  模块求值期不互相触碰，安全）。
- 视图需要的共享上下文：`state` 单例、`viewer`/`panel`、`statsBar`、`applyScene`、
  `setViewsVisible` 由壳 `app.js` 导出；DOM 小工具与播放器件在 `views/common.js`。
```

## 重新生成讲解音频

改 `tools/tts_lines.py` 后用 SoundGame 的 TTS 环境重跑生成脚本（需 GPU）：

```bash
/home/xsl/SoundGame/.venv-tts/bin/python tools/gen_tts.py
```

渲染原理（半透明分层、虚线、轮廓线分类）的设计来自仓库根目录 readme.md 的 Unity 版说明。
