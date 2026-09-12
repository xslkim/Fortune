import { defineConfig } from 'vite';
import uniImport from '@dcloudio/vite-plugin-uni';

// vite-plugin-uni 是 CJS 包（exports.default），在 "type":"module" 下做兜底互操作
const uni = uniImport.default || uniImport;

export default defineConfig({
  plugins: [uni()],
});
