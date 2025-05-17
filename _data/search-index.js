const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Function to recursively get all markdown files
function getMarkdownFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}

// Function to create search index
function createSearchIndex() {
  const contentDirs = [
    'development',
    'project-management',
    'sales-marketing',
    'content-strategy',
    'design',
    'quality-assurance'
  ];

  const searchIndex = [];

  for (const dir of contentDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = getMarkdownFiles(dir);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const { data, content: markdown } = matter(content);
      const relativePath = path.relative(process.cwd(), file);
      const url = '/' + relativePath.replace(/\\/g, '/').replace(/\.md$/, '/');

      searchIndex.push({
        title: data.title || '',
        description: data.description || '',
        content: markdown,
        url: url,
        discipline: data.discipline || dir,
        contentType: data.contentType || '',
        tags: data.tags || [],
        date: data.date || new Date().toISOString()
      });
    }
  }

  return searchIndex;
}

module.exports = createSearchIndex; 