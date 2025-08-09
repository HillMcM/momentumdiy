const http = require('http');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const port = 5181;

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function serveFile(filePath, res, contentTypeOverride) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return send(res, 404, { 'Content-Type': 'text/plain' }, 'Not found');
      return send(res, 500, { 'Content-Type': 'text/plain' }, 'Server error');
    }
    const ext = path.extname(filePath);
    const type = contentTypeOverride
      || (ext === '.html' ? 'text/html'
        : ext === '.js' ? 'application/javascript'
        : ext === '.css' ? 'text/css'
        : ext === '.svg' ? 'image/svg+xml'
        : 'application/octet-stream');
    send(res, 200, { 'Content-Type': type }, data);
  });
}

const server = http.createServer((req, res) => {
  let urlPath = (req.url || '/').split('?')[0];

  // Serve favicon (map to vite.svg if no favicon present)
  if (urlPath === '/favicon.ico') {
    const svgPath = path.join(distDir, 'vite.svg');
    return serveFile(svgPath, res, 'image/svg+xml');
  }

  // History API fallback: if no file extension, serve index.html
  const hasExtension = path.extname(urlPath) !== '';
  if (!hasExtension) {
    return serveFile(path.join(distDir, 'index.html'), res);
  }

  // Otherwise serve static file from dist
  const filePath = path.join(distDir, urlPath);
  serveFile(filePath, res);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static preview on http://0.0.0.0:${port}`);
});
