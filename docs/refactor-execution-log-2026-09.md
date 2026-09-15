# 重构执行日志（2026-09-13）

> 依据：`docs/product-review-remediation-2026-09.md` 的整改方案与四阶段 Roadmap。
> 本文件记录实际执行内容、验证证据、与方案的偏差及后续待办。**所有改动未 git commit**，由用户审阅后自行提交（建议按阶段分 4-6 个 commit）。

---

## 最终状态

| 验证项 | 结果 |
|---|---|
| 根 `npm test`（workspaces 全量） | core 57 + web 28 + mp 6 = **91 项全绿**（基线 78+31=109 中，mp 的 38 项副本测试由共享测试取代，净新增为内容校验、challenge、题型分布、mp 引擎等用例） |
| `npm run check:audio -w apps/web` | refs=277 lines=277 files=277 OK（新增课程内容全部 audio:null，不破坏三方一致） |
| `npm run lint`（ESLint flat config） | 0 error，4 warn（no-unused-vars 存量，未为清零改逻辑） |
| 小程序构建 `build:mp-weixin` | Build complete（含 @geo/core 打包进 vendor，alias 生效） |
| pre-push 钩子 | 安装于 .git/hooks/pre-push：全量测试 + 音频核对，实测通过 |
| CI | `.github/workflows/ci.yml`：npm ci → lint → test → check:audio（push/PR 触发，尚未在 GitHub 实际运行） |

---

## 阶段 0 止血（完成）

- **U5 语音链路**：`apps/mp/src/config.js` 的 `AUDIO_BASE` 改为 `import.meta.env.VITE_GEO_AUDIO_BASE || ''`；`engine/audio.js` 空 base 走失败路径、统一 toast"语音加载失败，请阅读文字讲解"（3 秒节流）；新增 `tools/check-config.mjs` 构建期校验（两个 build 脚本前置，未配置真实 CDN 域名时构建失败）；SMOKE.md 更新。
- **U-P0-2**：`GeoCanvas.vue` 失败态占位视图 + 点击重试（含构造异常 catch）。
- **U-P0-3**：`index.html` 补 `.option:disabled`/`.tab:disabled` 样式（opacity+cursor:not-allowed，correct/wrong 高亮不被覆盖）；`.btn:disabled` 光标修正。
- **A1 同步防线**：`sync-core.sh` 重写（自动探测 web 目录、`--check` 校验模式、mp 仅同步其持有的 4 个测试——全量拷贝会把 web 独有引擎的测试带进 mp 导致失败，这是对原脚本的实际 bug 修复）；完成一次全量同步消除漂移（mp 获得 5 个柏拉图立体、18 条 challenge、6 项内容校验测试）；pre-push 钩子；根 `.gitignore` 忽略 `graphify-out/`；`tools/check_audio_refs.mjs` 去除 Linux Python venv 依赖，改为 Node 正则解析 tts_lines.py（跨平台）。

## 阶段 1 颜值（完成）

- **U1 设计 token**：两端定义同一套 CSS 变量（品牌/主色/语义色/中性灰/圆角/阴影），硬编码色值替换——web index.html 51→12 处（残留即 token 定义自身），mp 66→19 处（残留为 token 定义与组件 prop 取色）。卡片语言统一"白底+细边框+浅阴影"；页面底与 3D 场景底统一 #f6f8fb；顶点标注统一白底胶囊。
- **U2 控件状态**：web 按钮/tab hover/active/transition 三件套、自绘 range/checkbox/select；mp hover-class、fade-in、switch 硬缩放修复、速率 chip 加高至 56rpx。
- **U3 图标体系**：`apps/web/src/ui/icons.js` 11 个线性 SVG（currentColor），替换全部 emoji（含顺手清理的 netgame ⭐🏅🔥 等），两端图标语言一致。
- **U4 可访问性**：`:focus-visible` 焦点环；课程卡改 `<button>`、错题卡/欧拉行补 role/tabindex/键盘操作；对比度弱化的灰统一升至 #5a6b80；空状态（题库无结果/错题本空/mp 两端）补图标+引导 CTA；`prefers-reduced-motion` 关闭啊哈动画/展开动画/自动旋转。
- **U6 两端对齐**：语义色/badge 色/主按钮色逐一对齐；mp 错题卡操作改横排；标题字重 600。

## 阶段 2 内容（完成）

- **C1 学练打通**：lessons 每课 `category`、quizzes 每题 `lessonIds`（映射一致性有测试强制）；课程完成页"去练 5 道相关题"（优先未答/答错）；题库页"推荐练习"区块；6 项新测试。
- **C2 循序渐进**：每课 `level`(junior/senior) + `prereq`（无环有测试）；课程列表分学段两组 + 软前置提示（建议先学《X》，不锁定）；修正 lessons/quizzes 过期注释。
- **C3 课内互动**：step.check 检查点（5 门课各 1 个：倒水实验/数边口诀/相对面/三视图口诀/点积垂直），答对解锁下一步、答错给 hint 可重试；两端播放器均实现；audio:null 步骤 Web 端自动 WebSpeech 朗读；"转动模型看一看"互动 chip 监听 viewer 首次拖拽。
- **C5 内容扩容**：新增 3 门课《圆柱与圆锥》《球与球的截面》《组合体的表面积》（各 7 步，13 门课）；36 道困难题全部补 `insight` 关键洞察 + explain 第 3 步"易错点"；README 更新。课程场景引用均对照 solids.js 合法 label/面索引，content.test 兜底。

## 阶段 3 架构（完成，A4 有记录偏差）

- **A2 monorepo**：`packages/core`（@geo/core：geo 4 + data 4 + engine 5 + 6 个测试 + tts_lines.py）为单一事实源；`apps/web`、`apps/mp` 整体迁入；web 经 importmap 前缀映射引用，mp 经 vite alias + workspaces 链接引用（构建实测通过）；600 个文件 git mv 保留历史；`sync-core.sh` 退役删除；mp 新增 smoke/engine 测试。
- **A3+C4 题型注册表**：`packages/core/src/question-types.js`（validate/optionsOf/isCorrect 三函数 + typeOf/typeDef）；新增 10 判断 + 10 填空（q101-q120，total 120）；content.test 按注册表分派校验；两端答题 UI 泛化（fill 数值容差 1e-6）。
- **A5 工程化**：ESLint flat config（0 error）+ Prettier（仅 js/mjs/json，43 文件，幂等）+ GitHub Actions CI + 删除 mp 过期 package-lock 与 uni-automator 死依赖 + README 数字修正（题库 120、实验室 14 种）。
- **A4 three 对齐——偏差记录**：**未执行版本统一，决策保留双版本**。理由：mp 的 three-platformize 1.133.3 与 three 0.133 硬绑定（该社区库已停止跟随新版 three），而 web viewer 代码使用 r160 时代 API（outputColorSpace/addUpdateRange 等），不存在"两端都验证过的中间版本"；在无视觉回归工具的环境下降级 web 风险大于收益。已在两端 README 记录版本现状。若未来要做：优先等 three-platformize 更新或对 mp viewer 做渲染快照测试后再升级。

## 阶段 4 对齐（完成）

- **C6 MP 闭环**：mp 侧 mastery/streak/review/report 薄包装（core 纯函数 + uni storage，key 与 web 一致）；作答/学步骤全接线；题库页今日目标卡 + 8 分类星级；错题本"待复习"区块（点入复习模式推进）；新增家长周报页（pages.json 注册 + 复制分享文案）；mp 测试 2→6。
- **A6 存储统一 + app.js 拆分**：`apps/web/src/engine/store.js`（9 个 gt_* key 集中登记 + get/set 降级内存 + migrate 钩子），UI 层不再直写 localStorage；app.js 1528→237 行纯壳 + `src/ui/views/{common,lessons,quiz,wrong,lab}.js`（VIEWS 注册表契约写入 README）；桩 DOM 无头走查 21 项断言（7 tab/学练闭环/深链）全过。
- **A7 Unity 归档**：`Geomertry/`、`UnityPractice/` → `archive/`（git mv 保留历史），eslint 忽略路径同步更新；根 readme.md 设计文档保留原位（仍被 web README 引用）。

---

## 第二轮迭代（2026-09-13，当日续）

针对用户三点指示的执行：

1. **开发期不用 CDN**：`apps/mp/tools/check-config.mjs` 改为宽松模式——未配置 CDN 只警告不阻断构建（运行时原有"语音加载失败请阅读文字讲解"兜底保留）；显式配置 example.com 占位值始终报错；新增 `--strict` 模式供发布/CI 使用。SMOKE.md 同步更新（含开发期用局域网静态服务 `http://<IP>:8471/apps/web/assets/audio/voice/` 试听的指引）。
2. **语音合成（借 WSL SoundGame 环境）**：
   - 重建 venv：`/home/xsl/SoundGame/.venv-tts`（torch 2.11.0+cu128 / qwen-tts 0.1.1 / transformers 4.57.3），RTX 5090 CUDA 可用；模型经 hf-mirror 下载，无需 token。
   - 补齐 58 条台词并全部生成 + loudnorm 转码（ogg+m4a 各 58 个）：3 门新课 21 步（cylinder-cone/sphere-section/composite-solid 的 s1-s7）、pyramid-volume-s4、36 道困难题易错点步（qXX-ex3 命名）。
   - `check_audio_refs` 三方一致从 277 升到 **335/335/335**；数据层 audio 全部接回真实 id（fill 型题讲解有意不配语音）。
   - 修正 `gen_voice.py`：台词表路径自动定位 packages/core/tools（不再依赖 PYTHONPATH），更新过时用法注释。
3. **继续开发（闯关升级）**：
   - Web：15 关顺序锁（core 新增 `normalizeProgress`/`isLevelUnlocked` 纯函数，两端共用）+ 3×5 蛇形路径选关页 + 进度条（x/15、y/45 星）+ lock 图标；进度结构 `{levels:[{stars,passed}]}` 存 `gt_netgame_v1`，旧数据按无记录安全兼容。
   - MP：完整移植——新页面 `pages/netgame/index.vue`（选关路径网格 + 三种玩法：能否折/点选相对面（canvas 格子点选 + core 几何判据）/四选一；uni 2d canvas 按关卡 cells 网格绘制展开图，dpr 自适应）；quiz 首页入口卡（进度 x/15）；pages.json 注册；通关接 streak.record('game')；进度 key/shape 与 web 完全一致。
   - 三星规则：Web 不变（答对/不看提示/限时）；MP 简化为答对 3 星、看提示 2 星、不计时（页面已注明，保持 45 满分尺度一致）。

**本轮终验**：95 项测试全绿（core 57 + web 30 + mp 8）、音频三方核对 335 OK、ESLint 0 error、MP 构建成功。

## 待办（需要用户环境/决策）

1. **配置真实音频 CDN**：把 `apps/web/assets/audio/voice/` 的 554 个文件上传 CDN，构建 mp 时设 `VITE_GEO_AUDIO_BASE` 并加入小程序 downloadFile 白名单（开发期未配置仅警告；发布用 `check-config.mjs --strict` 未配置则构建失败）。
2. ~~生成 3 门新课 + 36 个易错点的语音~~（第二轮已完成：58 条台词补齐并生成，335/335/335 三方一致）。
3. **真机走查**：按 `apps/mp/SMOKE.md` 全清单在微信/抖音开发者工具走查（本地只能验证到构建层）；Web 端浏览器人工点一遍关键路径（自动化桩已覆盖到调用层，但真实渲染未验证）。
4. **CI 首次运行**：push 后确认 GitHub Actions 全绿（各步骤均已在本地等价执行）。
5. **可选后续**：探究/几何之美移植到 mp（闯关已于第二轮完成移植）；`data/netgame.js` 名归 packages/core 的 data 层但实为引擎，可再议归位；core 引擎内部的 localStorage 薄包装可再收编进 store（动 schema 需两端一起迁移）。
6. **提交建议**：按阶段分 commit（阶段0/1 的 UI 与内容可再细分）；提交前 `git status` 约 660+ 变更路径（含 554 音频 rename）。

## 提交前评审修复（2026-09-13，提交前）

- **判断题判分颠倒**（critical）：judge 题 `answer.correct` 是语义值（1=正确/0=错误），而 UI 把选项下标（0='正确'）直接比较，q101–q110 两端全部判反。`question-types.js` 新增 `correctOptionIndex()` 映射，web quiz 视图与 mp 答题页的正确答案文本/高亮/判分统一走该映射。
- **sphere-section 课截面平面在球外**：4 处 `section.d` 按"球底面在 y=0"误写（1.6 为切点、2.4 在球外，球心实际在原点 r=1.6）。改为 d=0（过球心大圆，对应课文"中间高度"）与 d=0.8（小圆）。
- **mp 闯关"找相对面"判定过宽**：任选一对相对面即判对，与题意"与 ★ 格相对的格"不符；改为必须含 ★ 格。
- GeoCanvas「点击重试」原永远失败（canvas 被 v-if 移除后未等重渲染即取 node）：retry 先复位 failed 再等 nextTick+60ms。
- store 内存降级读写不对称：getItem 正常但 setItem 抛错的场景（Safari 隐私模式）读不回本会话数据，rawGet 补 memory 回查。
- 同步过时注释/文档：config.js 构建校验说明、tts_lines.py 头注释路径、本日志待办 1/2/5；`.gitignore` 补 `__pycache__/`。
