const http = require('http');
const urls = ['http://localhost:3000/api/db-status','http://localhost:3000/api/dashboard','http://localhost:3000/api/announcements'];

function fetchUrl(fullUrl){
  return new Promise(resolve => {
    const u = new URL(fullUrl);
    const req = http.get({ hostname: u.hostname, port: u.port, path: u.pathname, timeout: 5000 }, res => {
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
