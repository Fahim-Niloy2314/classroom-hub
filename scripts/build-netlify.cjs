const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const files = [
  'index.html', 'styles.css', 'app.js', 'hub-core.js', 'hub-fixes.js', 'hub-features.js',
  'data.js', 'classroom_index.json', 'portal_sync.json', 'backend-config.json',
  'manifest.json', 'sw.js', 'jszip.min.js', 'icon.svg', 'icon-192.png', 'icon-512.png',
  'cuet_routine_template_blank.docx', 'cuet_routine_template_sample.docx'
];
fs.rmSync(output, {recursive: true, force: true});
fs.mkdirSync(output);
for (const file of files) fs.copyFileSync(path.join(root, file), path.join(output, file));
// The hosted frontend uses its own API, regardless of the GitHub Pages copy's settings.
fs.writeFileSync(path.join(output, 'backend-config.json'), JSON.stringify({apiBase: ''}) + '\n');
console.log(`Prepared ${files.length} public files. Server source, tests and private configuration are excluded.`);
