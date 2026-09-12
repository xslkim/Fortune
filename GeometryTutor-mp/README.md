# 立体几何课堂 · 小程序版（GeometryTutor-mp）

从 `/home/xsl/Fortune/GeometryTutor/`（Web 版）移植的微信 + 抖音双端小程序。
uni-app Vue3 + Vite；3D 用 three-platformize（按端注入 WechatPlatform / BytePlatform）。

## 常用命令

```bash
npm install
npm run sync-core        # 从 web 版同步几何核心/数据/测试（单一事实源在 web 版）
npm test                 # node --test：几何核心 + 内容数据校验（与 web 版同一套）
npm run build:mp-weixin  # 产物 dist/build/mp-weixin
npm run build:mp-toutiao # 产物 dist/build/mp-toutiao
```

真机预览步骤见 [SMOKE.md](./SMOKE.md)。

## 结构

```
src/geo/      几何核心（sync-core.sh 从 web 版拷贝，勿直接改）
src/data/     课程/题库数据（同上）
src/engine/   storage.js（uni.setStorageSync，gt_ 前缀）/ progress.js / audio.js（InnerAudioContext，m4a）
src/viewer/   mpviewer.js（GeoViewerMP：web 版 viewer.js 的小程序移植，无 DOM）
src/components/ GeoCanvas.vue（webgl canvas + 顶点标注层 + 触控）/ ThreeView.vue（canvas 2d 三视图）/ AudioBar.vue
src/pages/    lessons(index+player) / quiz(index+detail) / wrong / lab，前四者为 tabBar
src/static/tabbar/  tabBar 图标（tools/gen-icons.sh 生成：python3 + PIL，81×81 透明 PNG）
src/config.js AUDIO_BASE 等常量（CDN 占位，上线前替换）
tools/sync-core.sh  同步脚本；tools/tts_lines.py 为测试核对用的台词表副本
tests/        从 web 版同步的 node --test 用例
```

分享：全部页面实现 onShareAppMessage（播放器/答题页/实验室带 path 参数直达内容）；
微信端额外 onShareTimeline + showShareMenu 开朋友圈，抖音端条件编译排除。

## 约定

- 几何核心与数据只改 web 版，然后跑 `npm run sync-core`；本工程内不直接编辑 `src/geo`、`src/data`。
- 存储 key 与 web 版一致：`gt_lessons` / `gt_attempts` / `gt_wrong` / `gt_filter`。
- npm 依赖版本在 package.json 中锁定（无 ^/~）。
