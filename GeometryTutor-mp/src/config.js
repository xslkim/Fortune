// 全局配置常量。
// AUDIO_BASE：讲解语音（.m4a）的远程基地址。
// - 上线前改成自己已备案、且已加入小程序 downloadFile/媒体域名白名单的 CDN 域名。
// - 开发期可用 http://localhost:8471/assets/audio/voice/（web 版 npm run serve 起的静态服务，
//   需在开发者工具里勾选「不校验合法域名」）。
// TODO(用户): 替换为正式备案域名。
export const AUDIO_BASE = 'https://example.com/geo-audio/';

// 语音播放器收起时是否保留变速入口：抖音端 playbackRate 探测失败时置 false 隐藏变速。
// 初始按编译平台给默认值，运行期探测结果会覆盖抖音端。
export const IS_TOUTIAO = process.env.UNI_PLATFORM === 'mp-toutiao';
