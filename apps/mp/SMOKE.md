# 真机预览 / 冒烟测试清单（SMOKE）

本工程在开发机上只验证到「构建通过」；以下步骤需要你在 Windows/macOS 上完成。

## 0. 前置准备

- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 和
  [抖音开发者工具](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/developer-instrument/developer-instrument-update-and-download)
- 微信小程序 AppID（测试号可用「测试号」模式）；抖音小程序 AppID（需在抖音开放平台注册小程序）
- 本机执行过 `npm install` 和两端构建：
  ```bash
  npm run build:mp-weixin     # 产物 dist/build/mp-weixin
  npm run build:mp-toutiao    # 产物 dist/build/mp-toutiao
  ```

## 1. 导入工程

| 端 | 操作 |
| --- | --- |
| 微信 | 微信开发者工具 → 导入项目 → 目录选 `dist/build/mp-weixin` → 填 AppID（无则选测试号） |
| 抖音 | 抖音开发者工具 → 导入项目 → 目录选 `dist/build/mp-toutiao` → 填 AppID |

导入后工具会读取产物里的 `project.config.json`。首次打开在「详情 → 本地设置」勾选
**不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**（开发期）。

## 2. 配置域名白名单（音频）

- **开发期可不配置 CDN**：`build:mp-weixin` / `build:mp-toutiao` 前会跑 `node tools/check-config.mjs`，
  未配置只警告不阻断（运行时语音失败自动 toast 并展示文字讲解兜底）；显式配置成占位 `example.com`
  始终报错；发布时用严格模式：`node tools/check-config.mjs --strict`（或CI中加 `--strict`）。
  配置方式：
  ```bash
  VITE_GEO_AUDIO_BASE=https://cdn.your-domain.com/geo-audio/ npm run build:mp-weixin
  ```
- 语音只走远程 CDN：`src/config.js` 的 `AUDIO_BASE`（默认空字符串，由 `VITE_GEO_AUDIO_BASE` 注入）。
- 上线前：把 m4a 文件传到自己**已备案**的 CDN 域名，并在
  - 微信公众平台 → 开发管理 → 服务器域名 → **downloadFile 合法域名** 加入该域名
  - 抖音开放平台 → 小程序后台 → 开发设置 → 服务器域名 同样配置
  然后改 `AUDIO_BASE` 重新构建。
- 开发期替代方案：在仓库根跑 `npm run serve`（端口 8471，服务仓库根目录），把 `VITE_GEO_AUDIO_BASE`
  设成局域网地址 `http://<电脑IP>:8471/apps/web/assets/audio/voice/`（注意 `/apps/web/` 前缀），
  并保持开发者工具的「不校验合法域名」勾选。
  注意真机预览时 `localhost` 指手机自己，要用局域网 IP（如 `http://192.168.x.x:8471/...`）。
- 音频不可用时课程/讲解会 toast 提示「语音加载失败，请阅读文字讲解」并跳过播放（3 秒节流，防连续切换步骤时重复弹）。

## 3. 逐页冒烟（两端各过一遍）

1. **课程 tab**：10 门课程卡片列出；随便进一门 → 上方出现 3D 模型（可拖动旋转、双指缩放）→
   点「下一步」步骤切换，正文加粗高亮与 3D 高亮（橙红色点/边/面）联动；返回后列表出现
   「已学 n/N」进度徽章，再进同一门点「继续」应跳到断点。
2. **题库 tab**：分类横滑条（全部 + 8 类）、难度筛选可用；答题后选项变红/绿、出现
   「查看讲解」；讲解页分步且有 3D 联动；返回列表状态徽章更新（未做/已对/错过）。
3. **错题本 tab**：先故意答错一题 → 错题本出现该题（待订正）→「重答」答对 → 变「已订正」→
   「移除」消失；顶部统计数字正确。
4. **学习闭环（掌握度 / streak / 复习 / 周报）**：
   - 题库顶部：streak 卡显示 🔥 连续天数与「学 x/1 步 · 答 x/3 题」今日进度；其下 8 个分类的
     掌握度星级两列展示，答题对错后星级随之升降（答错清零）。
   - 课程播放器每学一步 → streak 今日「学」进度 +1（学 1 步即达成今日目标）；题库答 3 题同样达成。
   - 答错一题后，错题本顶部「待复习」区块出现该题（题干前 20 字）→ 次日（+1 天）到期可点进复习，
     复习答对推进 +3/+7 节点，三节点全过标记已掌握；未到期时显示「暂无到期复习」。
   - 错题本底部「查看家长周报」→ 周报页展示本周天数 / 正确率 / 攻克错题 / 薄弱知识点与建议；
     点「复制分享文案」成功提示「已复制」，本周无记录时显示空数据引导。
5. **实验室 tab**（重点验证 3D）：
   - 切换 10 种几何体，模型正常渲染，背面棱自动虚线；
   - 「自转」开关有效；「顶点标注」开启后标签跟随模型（A、B、A₁…，被遮挡变淡）；
   - 「水平截面」开启后滑杆移动，橙色截面多边形随高度变化；
   - 「展开」按钮播放摊平动画，滑杆可拖回（球置灰不支持）；
   - 「三视图」开启后左下角浮层显示正/侧/俯视（canvas 2d 绘制，虚线为遮挡棱）；
   - 底部 V/E/F 统计与欧拉公式 = 2 ✓。
6. **展开图闯关**（题库 tab 顶部入口卡 → 点进闯关页）：
   - 选关页：顶部进度条显示「已通过 x/15 关 · 总星数 y/45」；15 关呈 3×5 蛇形路径，
     首关可挑战、未通关的后续关显示 🔒；通过后回到选关页该关显示星数、下一关解锁。
   - 1-5 关：canvas 画出带面序号的展开图，点「能折成/不能折成」即时判定；
     答错时若因面重叠会标红重叠格并给讲解。
   - 6-10 关：点选图中两个面（或下方按钮）高亮，凑满两个后「提交」判定相对面。
   - 11-15 关：4 张选项图（各一个小 canvas），点选后标绿/标红并给讲解。
   - 提示按钮展开文字讲解；答对结算三星（看提示扣一星）并可「下一关 →」；
     通关 1 关后题库 streak 卡今日目标显示「玩 1 关闯关」达成。
   - 进度与 web 端同 key（gt_netgame_v1）同结构：web 端玩过几关后，小程序端进入应看到相同进度（反之亦然）。
7. **变速**：课程/讲解页点 1.25× 后重播，语速变化。抖音端若变速不生效，变速入口应自动隐藏。

## 4. 已知差异 / TODO

- **顶点标注依赖 canvas 同层渲染**（绝对定位 view 盖在 webgl canvas 上）。实验室、课程
  播放器、答题页均已开启标注。旧版微信基础库同层渲染失效时标注会被画布盖住：若真机
  发现标签不显示，先验证其余功能，再考虑把标签层换成 `cover-view`（只支持有限样式）
  或 canvas 内绘字方案。
- **tabBar 图标**：`src/static/tabbar/` 下 4 tab × 2 态 PNG，由 `tools/gen-icons.sh`
  （python3 + PIL）生成，改设计后重跑该脚本即可。
- **BytePlatform 触控**：未使用 three-platformize 的 `dispatchTouchEvent`/TouchEventHandler
  （社区报告抖音端控制器有 bug），触控由页面 `bindtouch*` 直接喂给 viewer 自实现的轨道逻辑。
  若抖音端出现触摸事件字段差异（如 `touches` 缺 `identifier`），在
  `src/viewer/mpviewer.js` 的 `_touchId/touchStart` 处打补丁即可。
- 深链：课程播放器（id+step）、答题页（id）、实验室（solid）均支持 path 参数直达；
  web 版的 unfold/views 深链参数未做等价物（v2 再加）。
- 语音 TTS 兜底（web 版 WebSpeech）小程序无等价 API，音频缺失时直接静默跳过。
- 分享：全部页面已实现 onShareAppMessage；微信端额外开启朋友圈（onShareTimeline +
  showShareMenu），抖音端无朋友圈概念，仅站内分享。冒烟时验证：课程/答题分享卡片带
  具体标题，从分享卡片打开能经 path 参数直达对应课程步骤/题目/几何体。

## 5. 分享冒烟

1. 每个 tab 页右上角「···」→ 转发，卡片标题符合页面内容。
2. 课程播放器转发后，从卡片打开应直达该课程当前步骤（path 带 id 和 step）。
3. 答题页转发后，从卡片打开直达该题。
4. 实验室转发后，从卡片打开直达当前几何体（path 带 solid 参数）。
5. 微信端「···」菜单应出现「分享到朋友圈」（抖音端无此入口，属正常）。
