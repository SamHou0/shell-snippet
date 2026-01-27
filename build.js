const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcDir = path.join(root, 'src');
const publicDir = path.join(root, 'public');
const docsDir = path.join(root, 'docs');
const outAssets = path.join(publicDir, 'assets');
const snippetsDir = path.join(outAssets, 'snippets');

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(outAssets, { recursive: true });
fs.mkdirSync(snippetsDir, { recursive: true });

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Copy frontend from src to public
copyRecursive(srcDir, publicDir);

const files = fs.existsSync(docsDir)
  ? fs.readdirSync(docsDir).filter(f => f.toLowerCase().endsWith('.txt'))
  : [];

const index = [];

for (const fname of files) {
  const id = path.basename(fname, path.extname(fname));
  const raw = fs.readFileSync(path.join(docsDir, fname), 'utf8');
  const parts = raw.split(/\r?\n-{3,}\r?\n/); // split on a line with ---
  const headerRaw = (parts[0] || '').trim();
  const body = (parts[1] || '').trim();

  const headerLines = headerRaw.split(/\r?\n/);
  const description = (headerLines[0] || '').trim();
  const explanation = headerLines.slice(1).join('\n').trim();

  const snippet = { id, description, explanation, body };
  fs.writeFileSync(path.join(snippetsDir, `${id}.json`), JSON.stringify(snippet));
  index.push({ id, description });
}

fs.writeFileSync(path.join(outAssets, 'index.json'), JSON.stringify(index));
console.log(`Processed ${files.length} file(s).`);
