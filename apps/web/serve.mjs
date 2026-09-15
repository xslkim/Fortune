// 零依赖静态服务器：正确的 MIME + Range 支持（iOS 音频播放需要）
import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

// 服务仓库根（serve.mjs 上两级），使 /apps/web/ 与 /packages/core/ 均可访问
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const PORT = 8471;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.writeHead(400).end('Bad Request');
      return;
    }
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = normalize(join(ROOT, pathname));
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    let st;
    try {
      st = statSync(file);
    } catch {
      res.writeHead(404).end('Not Found');
      return;
    }
    if (st.isDirectory()) {
      res.writeHead(404).end('Not Found');
      return;
    }
    res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      if (m && (m[1] || m[2])) {
        let start, end;
        if (m[1]) {
          start = parseInt(m[1], 10);
          end = m[2] ? Math.min(parseInt(m[2], 10), st.size - 1) : st.size - 1;
        } else {
          start = Math.max(0, st.size - parseInt(m[2], 10));
          end = st.size - 1;
        }
        if (start >= st.size || start > end) {
          res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }).end();
          return;
        }
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${st.size}`,
          'Content-Length': end - start + 1,
        });
        createReadStream(file, { start, end }).pipe(res);
        return;
      }
    }
    res.writeHead(200, { 'Content-Length': st.size });
    createReadStream(file).pipe(res);
  })
  .listen(PORT, '0.0.0.0', () => {
    console.log(`立体几何教学应用已启动: http://localhost:${PORT}/apps/web/`);
  });
