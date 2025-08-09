const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});

server.listen(5180, '0.0.0.0', () => {
  console.log('Test server listening on http://0.0.0.0:5180');
});

