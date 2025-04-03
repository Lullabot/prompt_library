const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  
  // Add filters
  eleventyConfig.addFilter("date", function(date, format = "yyyy-MM-dd") {
    if (date === "now") {
      date = new Date();
    } else if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return "";
    }

    // Basic date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Return formatted date based on format string
    switch (format) {
      case "yyyy":
        return year.toString();
      case "yyyy-MM-dd":
        return `${year}-${month}-${day}`;
      default:
        return `${year}-${month}-${day}`;
    }
  });

  // Add discipline filter
  eleventyConfig.addFilter("filterByDiscipline", function(collection, discipline) {
    if (!collection) return [];
    return collection.filter(item => item.data.discipline === discipline);
  });

  // Add collections for all content types
  const disciplines = ['development', 'project-management', 'sales-marketing', 'content-strategy', 'design'];
  const contentTypes = ['prompts', 'cursor-rules', 'project-configs', 'workflow-states'];

  // Add collections for each content type
  contentTypes.forEach(type => {
    eleventyConfig.addCollection(type, function(collection) {
      return collection.getFilteredByGlob(
        disciplines.map(discipline => `${discipline}/${type}/**/*.md`)
      );
    });
  });

  // Add base URL for GitHub Pages
  eleventyConfig.addGlobalData("baseUrl", process.env.GITHUB_ACTIONS ? "/prompt_library" : "");

  // Generate search index
  eleventyConfig.on('afterBuild', () => {
    const searchIndex = [];
    const disciplines = ['development', 'project-management', 'sales-marketing', 'content-strategy', 'design'];
    const contentTypes = ['prompts', 'cursor-rules', 'project-configs', 'workflow-states'];

    disciplines.forEach(discipline => {
      contentTypes.forEach(type => {
        const dir = path.join(discipline, type);
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach(file => {
            if (file.endsWith('.md')) {
              const content = fs.readFileSync(path.join(dir, file), 'utf8');
              const frontMatter = content.match(/^---\n([\s\S]*?)\n---/);
              if (frontMatter) {
                const metadata = frontMatter[1].split('\n').reduce((acc, line) => {
                  const [key, ...value] = line.split(':');
                  if (key && value) {
                    acc[key.trim()] = value.join(':').trim();
                  }
                  return acc;
                }, {});

                // Clean up content by removing front matter
                const cleanContent = content.replace(/^---\n[\s\S]*?\n---/, '').trim();

                searchIndex.push({
                  title: metadata.title || '',
                  description: metadata.description || '',
                  category: metadata.category || '',
                  tags: metadata.tags ? metadata.tags.split(',').map(tag => tag.trim()) : [],
                  date: metadata.date || '',
                  discipline: discipline,
                  content: cleanContent,
                  url: `/${discipline}/${type}/${file.replace('.md', '')}/`
                });
              }
            }
          });
        }
      });
    });

    // Write search index to file
    fs.writeFileSync(
      path.join('_site', 'search-index.json'),
      JSON.stringify(searchIndex, null, 2)
    );
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    pathPrefix: process.env.GITHUB_ACTIONS ? "/prompt_library/" : "/"
  };
}; 