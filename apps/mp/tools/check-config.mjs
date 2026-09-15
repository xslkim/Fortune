// 构建前置检查：课程语音 CDN 域名配置状态。
// - 优先读环境变量 VITE_GEO_AUDIO_BASE；未设置时回退解析 src/config.js 的默认值；
// - 默认（宽松模式，开发期）：未配置只打印警告，不阻断构建（运行时已有"语音加载失败，
//   请阅读文字讲解"的兜底）；显式配置成 example.com 占位值始终报错；
// - `--strict`（发布/CI 用）：未配置也报错退出。
// 开发期本地试听：可设 VITE_GEO_AUDIO_BASE 指向本机静态服务，例如
//   VITE_GEO_AUDIO_BASE=http://192.168.x.x:8471/apps/web/assets/audio/voice/ npm run dev:mp-weixin
// （微信开发者工具勾选"不校验合法域名"）。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const env = process.env.VITE_GEO_AUDIO_BASE;

let value = env;
let source = '环境变量 VITE_GEO_AUDIO_BASE';
let fromDefault = false;
if (!value) {
  const src = readFileSync(join(root, 'src', 'config.js'), 'utf8');
  const m = src.match(
    /AUDIO_BASE\s*=\s*(?:import\.meta\.env\.VITE_GEO_AUDIO_BASE\s*\|\|\s*)?['"]([^'"]*)['"]/,
  );
  value = m ? m[1] : '';
  source = 'src/config.js 默认值';
  fromDefault = true;
}

const placeholder = /example\.com/i.test(value);
if (value && placeholder) {
  console.error('[check-config] 语音 CDN 域名仍是 example.com 占位值，请配置真实域名：');
  console.error(
    '  VITE_GEO_AUDIO_BASE=https://cdn.your-domain.com/geo-audio/ npm run build:mp-weixin',
  );
  process.exit(1);
}

if (!value) {
  const msg = `[check-config] 未配置语音 CDN 域名（${source}）。开发期可忽略：运行时将以文字讲解兜底。`;
  if (strict) {
    console.error(msg);
    console.error('[check-config] --strict 模式：发布前必须配置真实 CDN 域名并加入 downloadFile 白名单（见 SMOKE.md 第 2 节）。');
    process.exit(1);
  }
  console.warn(msg);
}

console.log(`[check-config] OK：语音 CDN = ${JSON.stringify(value || '(未配置，开发期)')}（${source}）`);
