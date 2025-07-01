import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

console.log('Serving static files from:', DIST_DIR);

if (!fs.existsSync(DIST_DIR)) {
  console.error(`Error: Build directory not found at ${DIST_DIR}. Please run 'npm run build' first.`);
  process.exit(1);
}

// Serve static files from the dist directory
app.use(express.static(DIST_DIR));

// For SPA: redirect all non-file requests that accept HTML to index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html') && !req.path.startsWith('/api') && !path.extname(req.path)) {
    if (fs.existsSync(INDEX_HTML)) {
      res.sendFile(INDEX_HTML);
    } else {
      res.status(404).send('index.html not found. Please build the project.');
    }
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
