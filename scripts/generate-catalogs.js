const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const catalogsRoot = path.join(projectRoot, 'katalogi');
const outputPath = path.join(projectRoot, 'katalogi.json');

const toCatalogUrl = fileName => `katalogi/${encodeURIComponent(fileName)}`;

const getCatalogFiles = () => {
  if (!fs.existsSync(catalogsRoot)) {
    return [];
  }

  const entries = fs.readdirSync(catalogsRoot, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile() && path.extname(entry.name).toLowerCase() === '.pdf')
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, 'pl', { numeric: true, sensitivity: 'base' }));
};

const files = getCatalogFiles().map(fileName => ({
  name: fileName,
  url: toCatalogUrl(fileName)
}));

const payload = { files };
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

console.log(`Generated ${path.relative(projectRoot, outputPath)} with ${files.length} file(s).`);
