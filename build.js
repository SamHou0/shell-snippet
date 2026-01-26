const fs = require('fs');
const path = require('path');

const docsDir = path.join(process.cwd(), 'docs');
const outAssets = path.join(process.cwd(), 'public', 'assets');
const snippetsDir = path.join(outAssets, 'snippets');

fs.mkdirSync(outAssets, { recursive: true });
fs.mkdirSync(snippetsDir, { recursive: true });

const files = fs.existsSync(docsDir)
  ? fs.readdirSync(docsDir).filter(f => f.toLowerCase().endsWith('.txt'))
  : [];

const index = [];

for (const fname of files) {
  const id = path.basename(fname, path.extname(fname));
  const raw = fs.readFileSync(path.join(docsDir, fname), 'utf8');
  const parts = raw.split(/\r?\n-{3,}\r?\n/); // split on a line with ---
  const description = (parts[0] || '').trim();
  const body = (parts[1] || '').trim();

  const snippet = { id, description, body };
  fs.writeFileSync(path.join(snippetsDir, `${id}.json`), JSON.stringify(snippet));
  index.push({ id, description });
}

fs.writeFileSync(path.join(outAssets, 'index.json'), JSON.stringify(index));
console.log(`Processed ${files.length} file(s).`);
