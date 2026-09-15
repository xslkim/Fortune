import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import uniImport from '@dcloudio/vite-plugin-uni';

// vite-plugin-uni 是 CJS 包（exports.default），在 "type":"module" 下做兜底互操作
const uni = uniImport.default || uniImport;

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      // 工作区包 @geo/core 的源码目录（vite 字符串 alias 为前缀替换）
      '@geo/core': fileURLToPath(new URL('../../packages/core/src', import.meta.url)),
    },
  },
});
