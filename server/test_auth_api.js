const http = require('http');
const data = JSON.stringify({ username: 'ADM001', password: 'admin2024' });

function post(path, body){
  return new Promise(resolve => {
    const req = http.request({ hostname: 'localhost', port: 5000, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, res => {
      let b=''; res.on('data', c => b+=c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(body); req.end();
  });
}

function get(path, token){
  return new Promise(resolve => {
    const headers = token ? { Authorization: 'Bearer '+token } : {};
    const req = http.get({ hostname: 'localhost', port: 5000, path, headers, timeout: 5000 }, res => {
      let b=''; res.on('data', c => b+=c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.on('error', e => resolve({ error: e.message }));
  });
}

(async ()=>{
  console.log('Logging in...');
  const login = await post('/api/auth/login', data);
  console.log('Login:', login.status);
  if (login.status !== 200){ console.log('Body:', login.body); process.exit(0); }
  const token = JSON.parse(login.body).token;
  console.log('Token:', token ? token.slice(0,20)+'...' : 'none');

  const dash = await get('/api/dashboard', token);
  console.log('/api/dashboard', dash.status, dash.body ? dash.body.substring(0,200) : '');

  const anns = await get('/api/announcements', token);
  console.log('/api/announcements', anns.status, anns.body ? anns.body.substring(0,200) : '');
})();
