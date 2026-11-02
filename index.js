const express = require('express');
const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', 'https://chloerangersonic0909-cmd.github.io');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-secret-key');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '10kb' }));

const SECRET_KEY = process.env.SECRET_KEY;
let serverCount = 0;
let lastUpdated = null;

app.get('/', (req, res) => {
  res.json({ name: 'VYRON Stats API', status: 'online' });
});

app.get('/api/stats', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ serverCount, lastUpdated, status: 'online' });
});

app.post('/api/stats', (req, res) => {
  if (!SECRET_KEY) {
    return res.status(503).json({ error: 'API secret is not configured' });
  }

  const suppliedSecret = req.get('x-secret-key');
  if (!suppliedSecret || suppliedSecret !== SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { count } = req.body || {};
  if (!Number.isSafeInteger(count) || count < 0) {
    return res.status(400).json({ error: 'count must be a non-negative integer' });
  }

  serverCount = count;
  lastUpdated = new Date().toISOString();
  console.log('Updated VYRON server count:', serverCount);

  return res.json({ message: 'Data updated successfully', serverCount, lastUpdated });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('VYRON Stats API running on port ' + PORT);
});
