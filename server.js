/**
 * Serves the SyllabusHub static site and optional JSON catalog.
 * Run: npm start  → open http://localhost:3000
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const root = __dirname;
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');

app.get('/api/syllabi', (_req, res) => {
  const fp = path.join(root, 'data', 'syllabi.json');
  fs.readFile(fp, 'utf8', (err, raw) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Could not read catalog file.' });
    }
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return res.status(500).json({ success: false, error: 'Catalog must be a JSON array.' });
      }
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.json(data);
    } catch {
      return res.status(500).json({ success: false, error: 'Invalid JSON in catalog file.' });
    }
  });
});

app.use(express.static(root, { index: ['index.html'], extensions: ['html'] }));

app.use((_req, res) => {
  res.status(404).type('text/plain').send('Not found');
});

app.listen(PORT, () => {
  console.log(`SyllabusHub → http://localhost:${PORT}`);
});
