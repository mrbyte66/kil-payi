/* Loopback-only fixture server: works when Chromium disallows file:// URLs. */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
export async function serveTestFile(file) {
  const root = dirname(resolve(file));
  const server = createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const path = pathname === '/' ? resolve(file) : resolve(root, '.' + pathname);
      if (!path.startsWith(root + sep)) { res.writeHead(403);res.end();return; }
      res.setHeader('Content-Type', path.endsWith('.html') ? 'text/html; charset=utf-8' : path.endsWith('.css') ? 'text/css' : 'application/octet-stream');
      res.end(readFileSync(path));
    } catch { res.writeHead(404);res.end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  server.unref();
  return 'http://127.0.0.1:' + server.address().port + '/';
}
