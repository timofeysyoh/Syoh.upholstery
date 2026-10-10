import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { isAbsolute, join, relative, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const buildDirectory = fileURLToPath(new URL('../dist/brandsyoh/browser/', import.meta.url));
const defaultPort = 4300;
const host = '127.0.0.1';
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
};

function readPort(args) {
  if (args.length === 0) return defaultPort;
  const value = args.length === 2 && args[0] === '--port'
    ? args[1]
    : args.length === 1 && args[0].startsWith('--port=')
      ? args[0].slice('--port='.length)
      : '';
  const port = /^\d+$/.test(value) ? Number(value) : NaN;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Вкажіть порт від 1 до 65535: node scripts/preview.mjs --port 4300');
  }
  return port;
}

function isContained(root, target) {
  const pathFromRoot = relative(root, target);
  return pathFromRoot !== '..' && !pathFromRoot.startsWith(`..${sep}`) && !isAbsolute(pathFromRoot);
}

async function findFile(root, pathname) {
  const segments = pathname.split('/').filter(Boolean);
  // Reject dotfiles, traversal, Windows separators and alternate data streams.
  if (segments.some((segment) => segment.startsWith('.') || /[\\<>:"|?*\u0000-\u001f]/.test(segment))) {
    return null;
  }

  try {
    let file = await realpath(join(root, ...segments));
    if (!isContained(root, file)) return null;
    let info = await stat(file);
    if (info.isDirectory()) {
      file = await realpath(join(file, 'index.html'));
      if (!isContained(root, file)) return null;
      info = await stat(file);
    }
    return info.isFile() ? file : null;
  } catch (error) {
    if (['ENOENT', 'ENOTDIR', 'EACCES', 'EPERM', 'EINVAL', 'ELOOP'].includes(error.code)) return null;
    throw error;
  }
}

function reply(request, response, status, content, contentType) {
  response.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(content),
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(request.method === 'HEAD' ? undefined : content);
}

async function start() {
  const port = readPort(process.argv.slice(2));
  let root;
  try {
    root = await realpath(buildDirectory);
    const indexFile = await realpath(join(root, 'index.html'));
    if (!isContained(root, indexFile) || !(await stat(indexFile)).isFile()) throw new Error();
  } catch {
    throw new Error('Production-збірку не знайдено в dist/brandsyoh/browser. Спочатку виконайте npm run build.');
  }

  const notFoundFile = await findFile(root, '/404.html');
  const notFoundPage = await readFile(notFoundFile ?? new URL('../public/404.html', import.meta.url));

  const server = createServer((request, response) => {
    const handle = async () => {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.setHeader('Allow', 'GET, HEAD');
        reply(request, response, 405, 'Метод не підтримується.', 'text/plain; charset=utf-8');
        return;
      }

      let pathname;
      try {
        const rawPath = (request.url ?? '').split('?')[0];
        if (!rawPath.startsWith('/')) throw new Error();
        pathname = decodeURIComponent(rawPath);
      } catch {
        reply(request, response, 400, 'Некоректна адреса.', 'text/plain; charset=utf-8');
        return;
      }

      const file = await findFile(root, pathname);
      if (!file) {
        reply(request, response, 404, notFoundPage, 'text/html; charset=utf-8');
        return;
      }
      const content = await readFile(file);
      reply(request, response, 200, content, mimeTypes[extname(file).toLowerCase()] ?? 'application/octet-stream');
    };

    handle().catch((error) => {
      console.error('Не вдалося прочитати файл production-збірки:', error.message);
      if (!response.headersSent) {
        reply(request, response, 500, 'Не вдалося відкрити сторінку.', 'text/plain; charset=utf-8');
      } else {
        response.destroy();
      }
    });
  });

  server.on('error', (error) => {
    console.error(error.code === 'EADDRINUSE'
      ? `Порт ${port} уже зайнятий. Спробуйте: node scripts/preview.mjs --port ${port === 65535 ? 4300 : port + 1}`
      : `Не вдалося запустити локальний перегляд: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, host, () => {
    console.log(`Production-перегляд: http://${host}:${port}/`);
    console.log('Лише локальний доступ. Щоб зупинити, натисніть Ctrl+C.');
  });
}

start().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
