// 全局配置常量。
// AUDIO_BASE：讲解语音（.m4a）的远程基地址。
// - 通过环境变量 VITE_GEO_AUDIO_BASE 注入（vite 约定，如 VITE_GEO_AUDIO_BASE=https://cdn.example.com/geo-audio/ npm run build:mp-weixin）。
// - **发布前必须配置真实 CDN 域名**：域名需已备案，并加入小程序 downloadFile 合法域名白名单
//   （微信公众平台 → 开发管理 → 服务器域名；抖音开放平台 → 开发设置），否则线上语音全部加载失败。
//   构建脚本（build:mp-weixin / build:mp-toutiao）内置 tools/check-config.mjs 校验：
//   开发期未配置只警告不阻断；发布时用 --strict（node tools/check-config.mjs --strict）未配置则构建失败。
// - 开发期可用 http://localhost:8471/assets/audio/voice/（web 版 npm run serve 起的静态服务，
//   需在开发者工具里勾选「不校验合法域名」；真机预览要用局域网 IP）。
// - 默认值为空字符串：表示未配置，播放请求会走失败回调并提示用户阅读文字讲解。
export const AUDIO_BASE = import.meta.env.VITE_GEO_AUDIO_BASE || '';

// 语音播放器收起时是否保留变速入口：抖音端 playbackRate 探测失败时置 false 隐藏变速。
// 初始按编译平台给默认值，运行期探测结果会覆盖抖音端。
export const IS_TOUTIAO = process.env.UNI_PLATFORM === 'mp-toutiao';
