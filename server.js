/* Oddiy mahalliy server — "node server.js" deb ishga tushiring */
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 5173;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'
};
const EXACT = { '/manifest.json': 'application/manifest+json; charset=utf-8' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(__dirname, path.normalize(p).replace(/^([/\\])+/, ''));
  if (!file.startsWith(__dirname)) { res.writeHead(403).end('403'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Topilmadi'); return; }
    res.writeHead(200, {
      'Content-Type': EXACT[p] || TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Service-Worker-Allowed': '/'
    });
    res.end(buf);
  });
}).listen(PORT, () => console.log('Ochish: http://localhost:' + PORT));


