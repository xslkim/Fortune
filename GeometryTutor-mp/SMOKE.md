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

- 语音只走远程 CDN：`src/config.js` 的 `AUDIO_BASE`（当前是占位 `https://example.com/geo-audio/`）。
- 上线前：把 m4a 文件传到自己**已备案**的 CDN 域名，并在
  - 微信公众平台 → 开发管理 → 服务器域名 → **downloadFile 合法域名** 加入该域名
  - 抖音开放平台 → 小程序后台 → 开发设置 → 服务器域名 同样配置
  然后改 `AUDIO_BASE` 重新构建。
- 开发期替代方案：在 web 项目跑 `npm run serve`（端口 8471），把 `AUDIO_BASE` 改成
  `http://localhost:8471/assets/audio/voice/`，并保持开发者工具的「不校验合法域名」勾选。
  注意真机预览时 `localhost` 指手机自己，要用局域网 IP（如 `http://192.168.x.x:8471/...`）。
- 音频不可用时课程/讲解会静默跳过播放（控制台有 `[audio]` 日志），不影响其他功能冒烟。

## 3. 逐页冒烟（两端各过一遍）

1. **课程 tab**：10 门课程卡片列出；随便进一门 → 上方出现 3D 模型（可拖动旋转、双指缩放）→
   点「下一步」步骤切换，正文加粗高亮与 3D 高亮（橙红色点/边/面）联动；返回后列表出现
   「已学 n/N」进度徽章，再进同一门点「继续」应跳到断点。
2. **题库 tab**：分类横滑条（全部 + 8 类）、难度筛选可用；答题后选项变红/绿、出现
   「查看讲解」；讲解页分步且有 3D 联动；返回列表状态徽章更新（未做/已对/错过）。
3. **错题本 tab**：先故意答错一题 → 错题本出现该题（待订正）→「重答」答对 → 变「已订正」→
   「移除」消失；顶部统计数字正确。
4. **实验室 tab**（重点验证 3D）：
   - 切换 10 种几何体，模型正常渲染，背面棱自动虚线；
   - 「自转」开关有效；「顶点标注」开启后标签跟随模型（A、B、A₁…，被遮挡变淡）；
   - 「水平截面」开启后滑杆移动，橙色截面多边形随高度变化；
   - 「展开」按钮播放摊平动画，滑杆可拖回（球置灰不支持）；
   - 「三视图」开启后左下角浮层显示正/侧/俯视（canvas 2d 绘制，虚线为遮挡棱）；
   - 底部 V/E/F 统计与欧拉公式 = 2 ✓。
5. **变速**：课程/讲解页点 1.25× 后重播，语速变化。抖音端若变速不生效，变速入口应自动隐藏。

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
