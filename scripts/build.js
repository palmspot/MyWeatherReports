const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');

function read(relativePath) {
  return fs.readFileSync(path.join(src, relativePath), 'utf8').trim();
}

const appScripts = [
  'js/config.js',
  'js/i18n.js',
  'js/core.js',
  'js/warnings.js',
  'js/charts-air-quality.js',
  'js/panels.js',
  'js/render.js',
  'js/push.js',
].map(read).join('\n\n');

const replacements = {
  '{{THEME_SCRIPT}}': read('js/theme-init.js'),
  '{{STYLES}}': read('styles.css'),
  '{{APP_SCRIPTS}}': appScripts,
};

let html = read('index.template.html');
for (const [placeholder, content] of Object.entries(replacements)) {
  if (!html.includes(placeholder)) {
    throw new Error(`Missing placeholder in template: ${placeholder}`);
  }
  html = html.replace(placeholder, content);
}

const unresolved = html.match(/{{[A-Z_]+}}/g);
if (unresolved) {
  throw new Error(`Unresolved placeholders: ${unresolved.join(', ')}`);
}

const banner = '<!-- GENERATED FILE: edit files under src/ and run npm run build -->\n';
fs.writeFileSync(path.join(root, 'index.html'), banner + html + '\n', 'utf8');
console.log('Built index.html from src/');
