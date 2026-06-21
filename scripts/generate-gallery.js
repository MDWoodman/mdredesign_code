const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const imagesRoot = path.join(projectRoot, 'images');
const infoRoot = path.join(projectRoot, 'information');
const outputPath = path.join(projectRoot, 'gallery.json');
const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg']);

const readDirs = dirPath => {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
};

const readFiles = dirPath => {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => entry.name);
};

const extractNumber = name => {
  const match = name.match(/(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
};

const sortByNumber = (a, b) => {
  const numA = extractNumber(a);
  const numB = extractNumber(b);
  if (numA !== numB) {
    return numA - numB;
  }
  return a.localeCompare(b);
};

const parseOpis = opisPath => {
  if (!fs.existsSync(opisPath)) {
    return { title: '', description: '' };
  }
  const html = fs.readFileSync(opisPath, 'utf8');
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<span>([\s\S]*?)<\/span>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  const description = descMatch ? descMatch[1].trim() : '';
  return { title, description };
};

const buildSection = sectionName => {
  const imageSectionDir = path.join(imagesRoot, sectionName);
  const infoSectionDir = path.join(infoRoot, sectionName);
  const imageProductDirs = readDirs(imageSectionDir).sort(sortByNumber);
  const infoProductDirs = readDirs(infoSectionDir);

  return imageProductDirs.map(productDir => {
    const productNumber = extractNumber(productDir);
    const matchingInfoDir = infoProductDirs.find(name => extractNumber(name) === productNumber) || productDir;
    const opisPath = path.join(infoSectionDir, matchingInfoDir, 'opis.html');
    const { title, description } = parseOpis(opisPath);

    const images = readFiles(path.join(imageSectionDir, productDir))
      .filter(file => allowedExt.has(path.extname(file).toLowerCase()))
      .sort(sortByNumber)
      .map(file => path.posix.join('images', sectionName, productDir, file));

    return {
      id: productDir,
      title,
      description,
      images
    };
  });
};

const sections = readDirs(imagesRoot).sort(sortByNumber);
const gallery = {};

sections.forEach(sectionName => {
  gallery[sectionName] = buildSection(sectionName);
});

fs.writeFileSync(outputPath, JSON.stringify(gallery, null, 2));
console.log(`Generated ${outputPath}`);
