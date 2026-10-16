const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;
const APP_DIR = __dirname;
const BASE_DIR = path.resolve(path.join(__dirname, '..'));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;

  // Open file locally in Windows default viewer
  if (pathname === '/api/open-local') {
    const relPath = reqUrl.searchParams.get('path');
    if (!relPath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Missing path' }));
    }
    const fullPath = path.resolve(path.join(BASE_DIR, relPath));
    if (!fullPath.startsWith(BASE_DIR) || !fs.existsSync(fullPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Not found' }));
    }

    const cmd = process.platform === 'win32' ? `start "" "${fullPath}"` :
                process.platform === 'darwin' ? `open "${fullPath}"` : `xdg-open "${fullPath}"`;

    exec(cmd, (err) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: err.message }));
      }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ success: true, message: `Opened ${path.basename(fullPath)}` }));
    });
    return;
  }

  // Stream or Download file
  if (pathname === '/api/file') {
    const relPath = reqUrl.searchParams.get('path');
    const download = reqUrl.searchParams.get('download') === '1';
    if (!relPath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Missing path' }));
    }
    const fullPath = path.resolve(path.join(BASE_DIR, relPath));
    if (!fullPath.startsWith(BASE_DIR) || !fs.existsSync(fullPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Not found' }));
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(fullPath);
    const filename = path.basename(fullPath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${encodeURIComponent(filename)}"`
    });
    fs.createReadStream(fullPath).pipe(res);
    return;
  }

  // Static files in APP_DIR
  let filePath = path.join(APP_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(APP_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      return res.end(`Server Error: ${err.code}`);
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`🚀 Classroom Hub Node Server is listening on http://localhost:${PORT}`);
  console.log(`📂 Serving Resources from: ${BASE_DIR}`);
  console.log(`======================================================`);
});
