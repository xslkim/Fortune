# 立体几何课堂 · 产品评审与整改方案

> 评审日期：2026-09-13 ｜ 角色：产品经理评审 ｜ 方法：graphify 知识图谱（3177 节点 / 301 社区）+ 三路并行代码审查（UI/内容/架构），全部结论均有文件级证据
> 图谱产物：`graphify-out/graph.html`（交互式架构图）、`graphify-out/GRAPH_REPORT.md`（审计报告）

---

## 一、产品现状速览

**一句话定位**：面向中国初高中学生的立体几何教学产品，Web 版（`GeometryTutor/`，零构建原生 JS）为单一事实源，微信/抖音小程序版（`GeometryTutor-mp/`，uni-app + Vue3）为移植端，`Geomertry/`、`UnityPractice/` 是已被吸收重写的 Unity 原型（建议归档）。

**内容底盘盘点**（质量在同类小产品中偏上，这是最大的资本）：

| 资产 | 规模 | 备注 |
|---|---|---|
| 课程 | 10 课 × 7 步 = 70 个讲解步骤 | 文案+语音+3D 场景联动，覆盖必修二到空间向量 |
| 题库 | 100 题（全为 4 选 1），8 大分类 | 难度 简单17/中等47/困难36；每题 2 步解析+出题人自验算注释 |
| 语音 | 277 条台词 / 554 个音频文件 | 统一"耐心数学老师"语气、-16 LUFS 响度归一、FunASR 质检 |
| 游戏化 | streak、掌握度三星、艾宾浩斯复习、15 关闯关、探究模式、几何之美、家长周报、双评分挑战 | **仅 Web 端有** |
| 几何体 | 14 种（Web）/ 10 种（小程序） | 实验室自由观察/截面/展开/三视图 |
| 测试 | Web 78 项 + 小程序 31 项，全部通过 | 纯逻辑测试，无 UI/e2e 测试 |

**值得保持的亮点**：每题出题人自验算注释、语音工程化质检管线、展开图判定器程序化生成（非硬编码）、掌握度"隔天确认"防刷设计、"啊哈时刻"答对即时反馈（音效+3D 演示+理解卡）、游戏化/增长两份调研文档质量高且部分已落地。

---

## 二、总体诊断

| 维度 | 评分 | 核心判断 |
|---|---|---|
| UI 美观度 | ★★☆☆☆ | 处于"工程师审美"阶段：无设计 token、两端两套色板、裸原生控件扎堆、按钮无按压反馈、可访问性缺失 |
| 内容趣味性 | ★★★☆☆ | 文案生动度中上（生活化引入、倒水实验、口诀陷阱提示），但课内零嵌入式互动、学练断档、题型单一 |
| 循序渐进 | ★★☆☆☆ | 内容编排本身有序，但产品上 10 门课平铺任意进、无前置/解锁/学段分层，初中与高中内容混排 |
| 架构扎实度 | ★★★☆☆ | geo 层干净无环依赖、数据驱动加课顺滑；但双端人肉同步已实际漂移、游戏化层小程序整体缺失、无 lint/CI 防线 |

**三个最痛的问题（不解决则其他工作贬值）**：

1. **小程序端语音链路是断的**——CDN 还是占位域名 `https://example.com/geo-audio/`（`GeometryTutor-mp/src/config.js:9`），播放失败仅 console.log，学生点"重播讲解"永远无声无提示（`player.vue:103-106`、`detail.vue:163-167`）。课程核心卖点在小程序端等于不存在。
2. **双端代码靠人肉 bash 同步且已漂移**——`GeometryTutor-mp/tools/sync-core.sh` 无校验无 CI，小程序端已缺 5 个柏拉图立体（`geo/solids.js` 差 131 行）、18 道题的 challenge 字段、对应测试。每次 Web 端提交都在加深漂移。
3. **学习闭环断裂**——课程与题库在数据上完全解耦（题无 lessonId、课无 category），学完没有"去练相关题"的出口；小程序端更连 mastery/review/streak 都没有，错题进了错题本就没有然后了。

---

## 三、UI 美观度整改方案

### 问题清单（证据详见各文件行号）

**P0（用户直接受害）**
- U-P0-1 小程序语音 CDN 占位域名，无声且无用户提示（`GeometryTutor-mp/src/config.js:9`）
- U-P0-2 GeoCanvas 初始化失败只有 console.warn，用户面对空白灰区（`GeometryTutor-mp/src/components/GeoCanvas.vue:65-66`）
- U-P0-3 答题后未命中选项仍白色+pointer 光标，看似可点实际锁死（`GeometryTutor/index.html:142-148` 缺 `.option:disabled`）
- U-P0-4 Web 全站无键盘焦点样式；课程卡/错题卡/欧拉表行用 div/tr 模拟按钮（`app.js:199,592`、`beauty.js:42,354`），键盘与读屏不可用

**P1（明显拉低颜值）**
- U-P1-1 两端语义色板分裂：主按钮蓝 `#2f6fdd`（Web `index.html:96`）vs 深蓝 `#1f3a5f`（MP `App.vue:95`）；成功/错误/警告三色两端全不同；卡片"边框派 vs 阴影派"；无任何 CSS 变量
- U-P1-2 裸原生控件：range 滑杆、checkbox、select、details 默认样式混入定制 UI（`index.html:104-106,154-158`；`app.js:153,738,772`；`explore.js:36-38,247`）
- U-P1-3 Web 按钮/tab 无 hover、无 :active、无 transition；MP 全项目 0 过渡动画（`index.html:23-28,91-99`）
- U-P1-4 3D 顶点标注两端两种画法：白晕文字（`index.html:40-45`）vs 白底胶囊（`GeoCanvas.vue:108-118`）
- U-P1-5 弱化灰 `#8a97a8` 等小字对比度约 3:1 未达 WCAG AA；灰色系至少 4 种色值泛滥
- U-P1-6 MP 速率 chip 触控目标约 20px 高（`AudioBar.vue:53-64`），远低于 44pt 标准

**P2（打磨项）**：顶栏 7 个纯文字 tab 无图标无滚动提示；MP switch 用 `scale(0.7)` 硬缩（`lab/index.vue:275-277`）；空状态仅一行灰字；emoji 当图标且两端用量悬殊；MP 错题卡按钮竖排挤压；无深色模式/reduced-motion；`copyText` 复制粘贴两份（`app.js:645-664` vs `beauty.js:257-278`）；过期注释（"题库：30 题"实为 100 题）；页面底 `#eef2f7` 与 3D 场景底 `#f6f8fb` 两个浅灰并存。

### U1. 建立设计 Token 体系（其余所有 UI 工作的地基）

**实现步骤**：
1. Web 端：在 `GeometryTutor/index.html` 的 `<style>` 顶部定义 `:root` CSS 变量：品牌色（`--brand:#1f3a5f`、`--primary:#2f6fdd`）、语义色（`--success/--warning/--error` 及各自浅底）、中性灰阶收敛为 3 档（正文/弱化/边框）、间距（4 的倍数：4/8/12/16/24）、圆角（`--r-s:8px; --r-m:12px; --r-pill:99px`）、阴影（1 档卡片阴影）、字号阶梯。
2. 把 `index.html` 及三份运行时注入样式（`beauty.js:20-66`、`explore.js:17-46`、`netgame.js:18-81`）中的硬编码色值全部替换为变量引用。
3. 小程序端：在 `GeometryTutor-mp/src/App.vue` 全局样式以同一组色值定义 CSS 变量（uni-app 支持 CSS 变量），替换 `App.vue:15-215` 及各页面硬编码色值。
4. 单一事实源：新建 `docs/design-tokens.md`（或后续 monorepo 的 `packages/core/tokens.js`）列出全部 token 及两端落点，改色只改一处文档+两处实现。
5. 顺手统一：两端成功/错误/警告色对齐到同一组值；卡片语言定为"白底+细边框+浅阴影"（Web 加浅阴影、MP 补细边框）；3D 场景底与页面底统一为一个浅灰；顶点标注统一为"半透明白底胶囊"方案（Web 端改 `index.html:42` 的 text-shadow 写法）。

**验证步骤**：
- `grep -n "#[0-9a-fA-F]\{3,6\}" GeometryTutor/index.html GeometryTutor/src/ui/*.js GeometryTutor-mp/src/App.vue` —— 除 `:root` 变量定义和 3D 查看器配色表外应接近零命中。
- 人工：Web 端 `npm run serve` 打开 7 个 tab 逐页截图；小程序开发者工具逐页截图；两端同页面并排放置对比，确认主色/语义色/卡片风格一致。

### U2. 控件状态与原生控件重设计

**实现步骤**：
1. 给 `.btn`/`.btn-primary`/`.tab`/`.option` 补全状态四件套：`hover`（加深/上浮）、`:active`（按压缩放 0.97）、`:disabled`（降透明度+`cursor:not-allowed`）、`transition: all .15s ease`（`GeometryTutor/index.html:91-99,142-148`）。
2. 答题判分后给未选中选项加 `.option:disabled` 样式（灰化+去除 pointer），修复 U-P0-3。
3. 自绘 range 滑杆（`::-webkit-slider-thumb`/`::-moz-range-thumb`）、checkbox 改定制开关、select 加自定义箭头包装，替换 `app.js:153,738,772-776`、`explore.js:247-252` 的原生控件。
4. MP 端：所有可点元素加 `hover-class`；修复 `lab/index.vue:275-277` 的 switch 硬缩放（改用官方推荐尺寸写法）；速率 chip 加高到 ≥56rpx（`AudioBar.vue:53-64`）。
5. MP 全局补常用过渡（页面卡片出现 fade-in 200ms 即可，不追求花哨）。

**验证步骤**：
- 人工：鼠标走完一遍"答题→判分→重答"流程，确认每个可点元素有 hover/按下/禁用三种可见状态；键盘 Tab 键可以顺序走完全部交互元素且焦点可见（配合 U4）。
- MP 真机预览：拇指实测速率 chip、错题卡按钮可轻松点中。

### U3. 图标体系替换 emoji + 导航补强

**实现步骤**：
1. 引入一套线性 SVG 图标（内联 16×16 path，约 15 个：🔥→火焰、📌→图钉、💡→灯泡、⭐→星、🏅→奖章、🎯→靶心、📊→图表等现状 emoji 的对应物），Web 端建 `src/ui/icons.js` 导出字符串常量集中管理。
2. 替换 `app.js:87,101,149,420,519,550,573,705`、`explore.js:270,289` 等处的 emoji；MP 端 tabBar 已有线性图标风格，页内图标向它对齐。
3. Web 顶栏 7 个 tab 加图标，横滑容器两端加渐隐遮罩提示（`index.html:20-28,209-212`）。

**验证步骤**：`grep -rn "🔥\|📌\|💡\|⭐\|🏅\|🎯" GeometryTutor/src/` 应为零命中；人工对比替换前后截图。

### U4. 可访问性与状态完整性

**实现步骤**：
1. 全局加 `:focus-visible` 焦点环样式；课程卡/错题卡/欧拉表行从 div/tr 改为 `<button>`/`<a>` 语义标签（`app.js:199,592`、`beauty.js:42,354`）。
2. 弱化灰从 `#8a97a8` 加深到对比度 ≥4.5:1 的色值（在 U1 的 token 表里定死）；`st-none` 徽章、到期链接小字一并处理。
3. 空状态（题库无结果 `app.js:326`、错题本空 `app.js:585`、MP `wrong/index.vue:11`）补插画/图标+一句引导 CTA（如"去题库刷 3 道题"按钮）。
4. 加 `@media (prefers-reduced-motion: reduce)` 关闭啊哈浮入、自转、展开动画（`index.html:138-139`、`app.js:417,824`、`viewer.js:520`）。
5. 修复 U-P0-2：GeoCanvas 初始化失败时渲染"3D 加载失败，点击重试"占位视图（`GeoCanvas.vue:65-66`）。

**验证步骤**：键盘-only 走通"选课→学一步→答题→看解析"全流程；Chrome DevTools Lighthouse 跑可访问性分数 ≥90；开 reduced-motion 系统设置确认动画不播放。

### U5. 修复小程序语音链路（最高优先级 P0）

**实现步骤**：
1. 决定音频托管方案：把 554 个音频文件传到 CDN/对象存储，替换 `GeometryTutor-mp/src/config.js:9` 的占位域名；按 `GeometryTutor-mp/SMOKE.md` 配置 downloadFile 合法域名白名单。
2. 播放失败时给用户可见反馈（toast"语音加载失败，可阅读文字稿"），并把 Web 端已有的 WebSpeech TTS 兜底思路移植到 MP（或至少在失败时自动展开文字稿），覆盖 `player.vue:103-106`、`detail.vue:163-167`。
3. 在 `tools/check_audio_refs.mjs` 基础上加一条 CI 检查：构建时校验 `AUDIO_BASE` 不是占位域名。

**验证步骤**：微信开发者工具+真机各跑一次：断网/改错域名模拟失败，确认有 toast 和文字稿兜底；正常环境 277 条语音抽查 10 条可播放（对照 `GeometryTutor/docs/audio-manifest.md`）。

### U6. 两端设计语言对齐（依赖 U1 完成）

**实现步骤**：以 Web 端为准统一：主按钮色、badge 色（`.diff-1`/`.st-ok` 等，`index.html:58-65` ↔ `App.vue:74-81`）、错题卡操作按钮改横排（`wrong/index.vue:104-109` ↔ `app.js:611-618`）、圆角折算对齐（MP 圆角翻倍到 24rpx 档位）、标题字重统一。

**验证步骤**：两端同页面截图 diff 走查清单（课程列表、答题页、错题本、实验室 4 页）。

---

## 四、教学内容整改方案（有趣 + 循序渐进）

### 问题清单

**P0（教学闭环成立与否）**
- C-P0-1 学→练断档：课与题无数据关联，学完没有"去练相关题"出口（`lessons.js` 全文无 category；`quizzes.js` 无 lessonId；`app.js:268` 的分类是孤立枚举）
- C-P0-2 课程无顺序约束与前置设计：全部平铺任意进（`app.js:194-215`），初中（展开图/三视图）与高中（向量法）混排无学段标签
- C-P0-3 小程序端闭环断裂：无 mastery/review/streak/周报/闯关（`GeometryTutor-mp/src/engine/` 仅 storage/progress/audio 3 个文件）

**P1**
- C-P1-1 课内 70 步零嵌入式提问，"拖动模型转一转"等互动靠学生自觉
- C-P1-2 题型单一：100 题全是 4 选 1（`content.test.mjs:99` 锁死 `type==='choice'`），测不了"画截面""找异面直线"等空间能力
- C-P1-3 课程脚本未按自家调研的"洋葱味道"重构（先抛问题+变式练，见 `docs/product/gamification-research.md` 建议 9）
- C-P1-4 模型复用单调：10 门课中 8 门只用 cube，圆柱/圆锥/球没有专门课程，浪费 14 种几何体资产
- C-P1-5 MP 题库已落后 Web 一个版本（缺 18 条 challenge）

**P2**：复习间隔固定 +1/+3/+7 无自适应；闯关 15 关无顺序锁无地图成长线；解析统一 2 步、困难题缺"易错点第 3 步"；`insight` 字段设计了但 0 题使用（`app.js:419` 只能截首句兜底）；`pyramid-volume` 第 4 步是全课程唯一无语音步骤（`lessons.js:144`）；过期注释（`lessons.js:1` 写"4 门课程"、`quizzes.js:1` 写"30 题"）。

### C1. 打通"学→练→复习"链路

**实现步骤**：
1. 数据层：给 `GeometryTutor/src/data/lessons.js` 每课加 `category` 字段（10 课 ↔ 8 分类的映射表见本文档附录 A），给 `quizzes.js` 每题加 `lessonIds` 反链（可批量按 category 生成）。
2. 课程完成页加"去练 5 道相关题"卡片（按 category 抽题，优先未答/答错）；题库页顶部加"当前推荐"区块（最近学过的课对应的分类）。
3. 错题复习到期时，除现有首页一行提示外，在课程卡上加角标。
4. 同步修订 `schema.js` 和 `content.test.mjs`：强制每课有合法 category、每题 lessonIds 引用的课存在。

**验证步骤**：
- `cd GeometryTutor && npm test` 全绿（含新增 schema 校验）。
- 人工：学完"棱锥的体积"→ 完成页出现练习题入口 → 点入直达"表面积体积"分类且优先未答题 → 故意答错 1 题 → 次日（或改系统日期/注入日期，引擎都是可注入日期的纯函数）确认出现在复习队列。

### C2. 课程地图 + 前置解锁（循序渐进的产品化）

**实现步骤**：
1. 定义课程顺序与前置：1 认识基本几何体 → 2 棱柱表面积体积 → 3 棱锥体积 → 4 截面入门 → 5 展开图 → 8 三视图 → 6 位置关系 → 7 平行垂直判定 → 9 空间向量 → 10 向量法（前 5 课标"初中段"，后 5 课标"高中段"，课程卡加学段徽章）。
2. `lessons.js` 加 `order`、`prereq: [lessonId]`、`level: 'junior'|'senior'` 字段；`app.js:194-215` 课程列表改为地图/路径式 UI（或最小实现：分组列表+锁定态），未满足前置的课显示"先完成《XXX》"锁定卡但允许点进去预览（软门禁，不强制堵死——参考调研：过度控制损害内在动机）。
3. 闯关 15 关加顺序锁（过一关解锁下一关）+ 简单进度路径视觉。

**验证步骤**：清掉 localStorage 新用户视角打开：课程按地图顺序呈现、第 3 课显示前置提示；完成第 1 课后第 2 课解锁；`npm test` 绿（为 prereq 引用合法性加测试）。

### C3. 课内嵌入式互动（让"有趣"从文案变成机制）

**实现步骤**：
1. `lessons.js` 的 step schema 加可选 `check` 字段：`{ question, options[2-3], answer, hint }`——轻量理解检查，答对才进下一步（或答错给 hint 重试）。优先改造 5 个关键课（棱锥体积"猜倒几次"、截面"数边口诀"、展开图"相对面"、三视图"长对正"、向量"点积为零"），每课 1-2 个检查点，复用题库选项卡 UI 与啊哈时刻反馈。
2. 把"拖动模型转一转"类文字提示产品化：检测用户拖动/旋转行为后打勾放行（viewer 已有轨道输入，`viewer.js` 暴露交互回调即可）。
3. 补 `pyramid-volume` 第 4 步的语音（`tools/tts_lines.py` 加台词 → 重跑 TTS → `check_audio_refs.mjs` 三方核对）。

**验证步骤**：`npm test`（content.test 增加 check 字段校验：answer 在 options 界内）；人工以新用户身份完整学完第 3 课，确认 2 个检查点可答、答错有提示、语音无断点。

### C4. 题型扩展（架构侧依赖 A3 的题型注册表，建议先做选择→判断/填空两种）

**实现步骤**：
1. `schema.js` 定义题型枚举与每种类型的 answer 结构；`content.test.mjs` 放开 `type==='choice'` 硬编码，改为按类型分派校验。
2. 两端答题 UI 加题型分派渲染（Web `app.js:396 pickOption`、MP `detail.vue:133` 现为硬编码选择题）。
3. 首批新增：10 道判断题（位置关系/平行垂直分类天然适合）+ 10 道填空题（体积表面积数值计算，输入框+数值容错判定）。
4. 中期候选：拖拽题（展开图找相对面，复用 `netgame.js` 的展开图渲染）。

**验证步骤**：`npm test` 绿且含新题型的 schema 校验用例；人工两端各答一遍新题型；错题本/掌握度对新题型行为一致（引擎按 category 统计，理论上无感——要回归验证）。

### C5. 课程扩容与脚本升级（发挥资产价值）

**实现步骤**：
1. 新增 3 门课补齐资产覆盖：《圆柱与圆锥》（圆锥体积=倒水实验延伸）、《球与球的截面》、《组合体的表面积》——复用 solids.js 已有几何体，每课 7 步+语音走现有 TTS 管线（`tools/tts_lines.py` → `gen_voice.py` → `check_audio_refs.mjs`，见 `docs/audio-manifest.md:10`）。
2. 按 gamification-research.md 建议 9 重构 3 门存量课脚本做 A/B 样板：每课第 1 步改为"先抛生活问题"，例题后加 1 个变式练。
3. 启用 `insight` 字段：给 36 道困难题补关键洞察句，让啊哈时刻不再截首句兜底（`app.js:419`）；困难题解析加第 3 步"易错点"。
4. 修正过期注释（`lessons.js:1`、`quizzes.js:1`）。

**验证步骤**：`npm test`（新课自动被 content.test 全量校验）；`node GeometryTutor/tools/check_audio_refs.mjs` 三方数量一致；人工试听新课全部语音。

### C6. 小程序端闭环补齐（产品决策：建议补齐，而非维持功能子集）

**实现步骤**（前提：A1/A2 的 monorepo 共享包已落地，否则等于重写两遍）：
1. 共享包直接给出 mastery/streak/review/report 引擎（纯逻辑无平台 API，天然可共享）；MP 端只需做 UI：题库页星级、首页今日目标+🔥、错题本复习队列区块、周报页。
2. 闯关/探究/几何之美三个 tab 按优先级分批移植：先闯关（netgame 引擎已在共享包，UI 一屏），再几何之美（卡片流+分享，与 MP 分享能力天然契合），探究模式最后（依赖度量引擎+滑杆交互重做）。
3. 复习触达：按 `growth-research.md:94-96` 接微信订阅消息，复习到期推送提醒。

**验证步骤**：MP 端 `npm test` 与 Web 同一套引擎测试全绿；按 `SMOKE.md` 清单真机走查新增页面；用两个微信号模拟"周一答错→周三收到复习提醒"全流程。

---

## 五、产品架构整改方案

### 问题清单

**P0**
- A-P0-1 双端人肉同步已实际漂移：`geo/solids.js` 差 131 行（MP 缺 5 个柏拉图立体）、`quizzes.js` 缺 18 条 challenge、MP 的 content.test 也是旧版（`GeometryTutor-mp/tools/sync-core.sh`，无校验无版本戳，默认源路径还是 Linux 的 `/home/xsl/Fortune`，本机需设 `GEOMETRY_TUTOR_WEB`）
- A-P0-2 游戏化层（mastery/streak/review/report/netgame/explore/beauty，约 3000 行）仅 Web 存在，"两端同一产品"已不成立

**P1**
- A-P1-1 `GeometryTutor/src/ui/app.js` 955 行上帝模块（模块级单例 state + 7 视图渲染 + 挑战卡 + 周报 + 深链）
- A-P1-2 7 个 localStorage key 散落三层 6 个文件（`progress.js:8`、`mastery.js:44`、`streak.js:67`、`review.js`、`app.js:278,494`、`netgame.js:84`），无中央 schema/迁移机制（仅 netgame 自带 `_v1` 后缀）
- A-P1-3 three 双版本错位：Web vendored r160 vs MP 0.133 + 个人维护的 three-platformize，渲染一致性无保障
- A-P1-4 无 lint/format/CI；MP 装了 `@dcloudio/uni-automator` 却无一处引用（死依赖）；验证全靠手工 `SMOKE.md`
- A-P1-5 题型渲染两端硬编码，无 type 分派（见 C4）

**P2**：`data/netgame.js` 实为 379 行引擎却放在 data 层；README 写"实验室 10 种几何体"实为 14；Unity 工程未归档；`graphify-out/` 未加入 .gitignore。

### A1. 同步止血（本周就能做，成本最低）

**实现步骤**：
1. 把 `sync-core.sh` 升级为双向校验：同步后 `diff -r` 核对 `src/geo/`、`src/data/`、`tests/`、`tools/tts_lines.py` 清单内文件，不一致即非零退出；源路径默认改为脚本自动探测（`../GeometryTutor` 相对路径），保留环境变量覆盖。
2. 立即执行一次全量同步，消除当前漂移（MP 获得柏拉图立体 + challenge 字段 + 新测试）；MP 侧确认 challenge 字段被静默忽略无碍（`detail.vue` 无对应 UI）。
3. 加 git pre-push hook（或 GitHub Actions 若有远端）：web 端清单文件变更而 MP 副本未同步则拦截。
4. 把 `graphify-out/` 加入 `.gitignore`。

**验证步骤**：故意在 Web 端 `solids.js` 改一行不同步 → 跑校验脚本/pre-push 应报错；同步后 `diff GeometryTutor/src/geo/solids.js GeometryTutor-mp/src/geo/solids.js` 为空；两端 `npm test` 全绿。

### A2. Monorepo 化（结构性解药，2-3 周）

**目标结构**：
```
Fortune/
  packages/core/          geo/* + data/* + engine/{days,mastery,streak,review,report,progress}.js（纯逻辑，0 平台 API）
  packages/core-storage/  {readRaw,writeRaw} 接口 + localStorage / uni.setStorageSync 两个适配器
  packages/core-audio/    playVoice/stopAll/setRate 接口 + HTMLAudio/WebSpeech / InnerAudioContext 两实现
  apps/web/               现 GeometryTutor 的 ui/viewer/serve
  apps/mp/                现 GeometryTutor-mp 的 pages/components/viewer
```

**实现步骤**：
1. npm workspaces 初始化，先搬 `geo/`+`data/`（纯无依赖，风险最低），两端改为 import `@geo/core`；Web 端零构建路线用 importmap 指向包路径即可，MP 由 vite 天然解析。
2. 抽取 storage 适配器接口，把 `progress.js` 的 53 行"业务相同存储不同"双份收敛为一份；audio 同理收敛 135 行双份。
3. `content.test.mjs` 等共享测试下沉到 core 包，两端 CI 跑同一份。
4. viewer 保留两份（渲染栈不同），但把 SOLID 构建/highlight 参数计算等纯逻辑上提到 core。
5. 迁移期间保持 `apps/web` 零构建、`npm run serve`/`npm test` 命令不变（开发者体验不变）。

**验证步骤**：
- 迁移后两端 `npm test` 全绿（且测试总数 = core 共享测试 + 端各自测试）。
- Web 端 `npm run serve` 人工走查 7 个 tab；MP 开发者工具编译通过 + SMOKE 清单走查。
- 检验单一事实源：改 core 里一道题 → 两端同时生效（Web 刷新即见，MP 重新编译即见），无需任何 sync 脚本。

### A3. 题型与内容注册机制

**实现步骤**：core 包建 `QUESTION_TYPES = { choice: {...validate, render}, judge: {...}, fill: {...} }` 注册表；答题 UI 按 type 分派渲染器；新增题型 = 一处注册 + 每端一个渲染组件。同时把新增"第 9 类知识点"的 3 处同步点（`app.js:268` CATEGORIES、`content.test.mjs:108`、课程语义）收敛为 core 包单一常量。

**验证步骤**：新增一种题型的全流程演练（对照 C4），统计改动文件数 ≤ 注册 1 处 + 每端渲染器 1 处 + 题目数据。

### A4. three.js 版本对齐

**实现步骤**：Web 端 vendor 的 r160 单文件替换为与 MP 对齐的 npm 版 three（importmap 指向 `node_modules/three/build/three.module.js`，或 Web 端引入极轻量构建）；统一后跑两端三视图/截面/展开的截图对比走查。若 MP 的 three-platformize 0.133 升级风险大，可先统一到都经过验证的中间版本，并在 `docs/` 记录版本决策。

**验证步骤**：两端实验室逐一打开 14 种几何体，对比棱线虚实、截面、展开动画表现一致；`npm test` 绿。

### A5. 工程化防线

**实现步骤**：
1. 引入 ESLint（推荐 flat config，仅核心规则集）+ Prettier，对 `apps/*`、`packages/*` 生效；`--fix` 全量格式化一次性提交。
2. GitHub Actions（或等价 CI）：push 时跑两端 `npm test` + lint + A1 的同步校验（monorepo 后该校验自动退役）。
3. 移除 MP 的 `@dcloudio/uni-automator` 死依赖，或补一个最小自动化冒烟（启动+首页断言）让它名副其实。
4. 修正 README/注释漂移（"10 种几何体"→14、"4 门课程"→10+、"30 题"→100+）。

**验证步骤**：CI 绿灯；故意提交一处 lint 错误确认被拦截。

### A6. 存储层统一与 app.js 拆分（中期）

**实现步骤**：
1. core 包建统一存储模块：全部 `gt_*` key 集中登记（key、schema、版本号），提供 `migrate()` 钩子；UI 层不再直接碰 localStorage（`app.js:278,494`、`netgame.js:98` 收回 engine）。
2. `app.js` 按 7 个视图拆为 `ui/views/*.js`，每个视图遵守现有未成文契约（`initXxx(container, {viewer, audio})` + 返回 `destroy()` 句柄 + 样式自注入，见 `netgame.js:1-13` 范式），把该契约写进 `docs/` 固化成插件机制；`VIEWS` 表（`app.js:911`）改为视图注册表。

**验证步骤**：老用户数据迁移测试（先用旧 key 写入构造数据 → 升级后打开 → 进度/错题/streak 无损）；`npm test` 绿；每个视图单独可加载。

### A7. Unity 工程归档

**实现步骤**：保留根 `readme.md`（渲染设计文档仍被 Web 版引用）；`Geomertry/`、`UnityPractice/` 移到 `archive/` 目录（或打 git tag 后从主分支移除）。**验证**：Web 版 README 中引用关系改为指向 archive 路径；`npm test` 不受影响。

---

## 六、分阶段 Roadmap

| 阶段 | 内容 | 预计周期 | 出口标准（Definition of Done） |
|---|---|---|---|
| **0 止血** | U5（语音链路）、U-P0-3（选项 disabled）、U-P0-2（GeoCanvas 失败态）、A1（同步校验+全量同步） | 1 周 | MP 语音可播放且失败有提示；双端 geo/data/tests 零漂移且有校验防线；两端 `npm test` 绿 |
| **1 颜值** | U1（设计 token）、U2（控件状态）、U3（图标）、U4（可访问性）、U6（两端对齐） | 2-3 周 | 硬编码色值清零；Lighthouse 可访问性 ≥90；两端 4 个核心页面截图对比通过走查 |
| **2 内容** | C1（学练打通）、C2（课程地图）、C3（课内互动）、C5（新课+脚本样板） | 3-4 周 | 新用户从第 1 课到"练→错→复习"全流程可走通；新增 3 门课上线且语音齐备 |
| **3 架构** | A2（monorepo）、A3（注册表）、A4（three 对齐）、A5（CI）、C4（新题型）依赖此阶段 | 3-4 周（可与阶段 2 部分并行） | 单一事实源生效（改一处两端生效）；CI 防线运行；新增题型演练通过 |
| **4 对齐** | C6（MP 闭环补齐）、A6（存储统一+app.js 拆分）、A7（Unity 归档） | 持续 | MP 具备完整学习闭环；双端功能对等或由文档明确差异化定位 |

阶段 0/1 不依赖架构改造，可立即开始；阶段 2 的 C1/C2/C3 只动 Web 端数据+UI，也可先行；C4、C6 建议等阶段 3 的共享包就位，避免写两遍。

---

## 七、全局验证清单（每次阶段交付后执行）

**自动化**：
```bash
cd GeometryTutor && npm test          # 现 78 项，应保持全绿且只增不减
cd GeometryTutor-mp && npm test       # 现 31 项，monorepo 后与 Web 同源
node GeometryTutor/tools/check_audio_refs.mjs   # 音频引用↔台词表↔文件三方一致（refs=lines=files）
bash GeometryTutor-mp/tools/sync-core.sh --check # 阶段 0 后：双端漂移校验（monorepo 后退役）
```

**人工走查**（每阶段）：
1. 新用户路径：清空存储 → 课程地图 → 学完 1 课（含语音、检查点）→ 练 5 题 → 错 1 题 → 看解析 → 错题本可见。
2. 留存路径：改系统日期 +1/+3 天 → 复习提醒出现 → 复习答对 → 掌握度升星；streak 与断签保护符合 `gamification-research.md` 的设计。
3. 双端对比：课程列表/答题/错题本/实验室 4 页截图并排放置。
4. MP 真机：按 `GeometryTutor-mp/SMOKE.md` 全清单走查（微信+抖音两端）。

**度量指标建议**（验证"有趣、循序渐进"是否真的达成，需埋点后观察）：首课完成率、学→练点击率（C1 的卡片）、课内检查点答对率、7 日留存、复习到期回访率、闯关三星率。埋点本身可列为阶段 2 之后的独立小项。

---

## 附录 A：课程 ↔ 题库分类映射（供 C1 使用）

| 课程 | 对应题库分类 |
|---|---|
| 1 认识基本几何体 | 结构 |
| 2 棱柱的表面积与体积 | 表面积体积 |
| 3 棱锥的体积 | 表面积体积 |
| 4 截面问题入门 | 截面 |
| 5 展开图 | 展开图 |
| 6 空间点线面的位置关系 | 位置关系 |
| 7 平行与垂直的判定 | 平行垂直 |
| 8 三视图 | 三视图 |
| 9 空间向量及其运算 | 空间向量 |
| 10 向量法求角与证位置关系 | 空间向量 |

## 附录 B：本次评审的图谱产物

- `graphify-out/graph.html` —— 全项目交互式知识图谱（浏览器直接打开）。可直观看到：产品代码社区（几何拓扑核心、展开图生成器、学习引擎、双端查看器等）与被 vendored 的 Three.js 大社区的边界；`app.js`、`topology.js` 等枢纽节点。
- `graphify-out/GRAPH_REPORT.md` —— 审计报告（含 token 成本 52,000 in / 4,600 out）。图健康提示：78 条悬空边、约 160 条同端点合并边，主要来自 Unity C# 工程与 Three.js 的跨语言 AST 引用噪音，不影响产品代码部分的结论。
- 说明：554 个课程语音文件（.m4a/.ogg 双格式）属于产品资产而非文档，本次未做语音转文字，内容质量以台词表 `tools/tts_lines.py` 和 `docs/audio-manifest.md` 为准进行评审。
