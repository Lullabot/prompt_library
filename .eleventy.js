const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  
  // Add filters
  eleventyConfig.addFilter("date", function(date) {
    return new Date(date).toLocaleDateString();
  });

  // Add collections
  eleventyConfig.addCollection("prompts", function(collection) {
    return collection.getFilteredByGlob("content/prompts/*.md");
  });

  eleventyConfig.addCollection("cursorRules", function(collection) {
    return collection.getFilteredByGlob("content/cursor-rules/*.md");
  });

  eleventyConfig.addCollection("projectConfigs", function(collection) {
    return collection.getFilteredByGlob("content/project-configs/*.md");
  });

  eleventyConfig.addCollection("workflowStates", function(collection) {
    return collection.getFilteredByGlob("content/workflow-states/*.md");
  });

  // Add base URL for GitHub Pages
  eleventyConfig.addGlobalData("baseUrl", process.env.GITHUB_ACTIONS ? "/prompt_library" : "");

  // Generate search index
  eleventyConfig.on('afterBuild', () => {
    const searchIndex = [];
    const contentTypes = ['prompts', 'cursor-rules', 'project-configs', 'workflow-states'];

    contentTypes.forEach(type => {
      const files = fs.readdirSync(path.join('content', type));
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const content = fs.readFileSync(path.join('content', type, file), 'utf8');
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
              content: cleanContent,
              url: `/${type}/${file.replace('.md', '')}/`
            });
          }
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