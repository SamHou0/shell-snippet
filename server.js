const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const root = path.join(process.cwd(), 'public');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(root, urlPath);
  if (!filePath.startsWith(root)) {
    res.statusCode = 403; res.end('Forbidden'); return;
  }
  if (urlPath === '/' || urlPath === '') filePath = path.join(root, 'index.html');
  fs.stat(filePath, (err, stat) => {
    if (err) { res.statusCode = 404; res.end('Not found'); return; }
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => { res.statusCode = 500; res.end('Error'); });
    stream.pipe(res);
  });
});

server.listen(port, () => {
  console.log(`Static server http://localhost:${port}`);
});
