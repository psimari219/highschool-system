const http = require('http');
const urls = ['/api/db-status','/api/dashboard','/api/announcements'];
const host = 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 5000;

function fetchUrl(path){
  return new Promise(resolve => {
    const req = http.get({ hostname: host, port, path, timeout: 5000 }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', err => resolve({ error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
  });
}

(async () => {
  for (const u of urls) {
    console.log('---', u, '---');
    const r = await fetchUrl(u);
    console.log(JSON.stringify(r, null, 2));
  }
})();
