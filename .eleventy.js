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

  // Generate search index
  eleventyConfig.addCollection("searchIndex", async function(collection) {
    const items = collection.getAll().filter(item => item.template.inputPath.endsWith('.md'));
    const searchIndex = [];

    for (const item of items) {
      const content = await item.template.read();
      searchIndex.push({
        title: item.data.title || '',
        description: item.data.description || '',
        content: content || '',
        url: item.url,
        discipline: item.data.discipline || '',
        contentType: item.data.contentType || '',
        tags: item.data.tags || [],
        date: item.data.date || new Date().toISOString()
      });
    }

    // Write search index to JSON file
    const outputPath = path.join(__dirname, '_site', 'search-index.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(searchIndex));

    return searchIndex;
  });

  // Add base URL for GitHub Pages
  eleventyConfig.addGlobalData("baseUrl", process.env.GITHUB_ACTIONS ? "/prompt_library" : "");

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