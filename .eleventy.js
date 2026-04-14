const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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
  const disciplines = ['development', 'project-management', 'sales-marketing', 'content-strategy', 'design', 'quality-assurance'];
  const contentTypes = ['prompts', 'rules', 'project-configs', 'workflow-states', 'resources', 'agents', 'skills'];

  // Copy skill resource directories (scripts, configs, templates)
  const skillResourceExtensions = ['sh', 'yml', 'yaml', 'json', 'py', 'rb', 'js', 'txt', 'cfg', 'conf', 'toml'];
  disciplines.forEach(discipline => {
    skillResourceExtensions.forEach(ext => {
      eleventyConfig.addPassthroughCopy(`${discipline}/skills/**/*.${ext}`);
    });
  });

  // Filter to discover companion resource files for a skill page
  eleventyConfig.addNunjucksFilter("getSkillResources", function(page) {
    if (!page || !page.inputPath) return [];
    // Only apply to skill pages
    if (!page.inputPath.includes('/skills/')) return [];

    // Derive companion directory from the skill's markdown file path
    // e.g., ./development/skills/cloudflare-tunnel.md -> development/skills/cloudflare-tunnel/
    const inputPath = page.inputPath.replace(/^\.\//, '');
    const resourceDir = inputPath.replace(/\.md$/, '');
    const fullResourceDir = path.join(__dirname, resourceDir);

    if (!fs.existsSync(fullResourceDir) || !fs.statSync(fullResourceDir).isDirectory()) {
      return [];
    }

    // Recursively collect files matching the passthrough-copied extensions
    // This prevents listing files that won't be in the build output
    const allowedExtensions = new Set(skillResourceExtensions);
    const resources = [];
    const walk = (dir, prefix) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue; // skip dotfiles
        if (entry.isDirectory()) {
          walk(path.join(dir, entry.name), `${prefix}${entry.name}/`);
        } else {
          const ext = entry.name.split('.').pop();
          if (!allowedExtensions.has(ext)) continue;
          resources.push({
            name: entry.name,
            relativePath: `${prefix}${entry.name}`,
            url: `/${resourceDir}/${prefix}${entry.name}`
          });
        }
      }
    };
    walk(fullResourceDir, '');
    return resources;
  });

  // Add collections for each content type
  contentTypes.forEach(type => {
    eleventyConfig.addCollection(type, function(collection) {
      return collection.getFilteredByGlob(
        disciplines.map(discipline => `${discipline}/${type}/**/*.md`)
      ).map(item => {
        // Ensure URLs have the correct base URL
        if (process.env.GITHUB_ACTIONS && !item.url.startsWith('/prompt_library')) {
          item.url = `/prompt_library${item.url}`;
        }
        return item;
      });
    });
  });

  // Generate search index
  eleventyConfig.addCollection("searchIndex", async function(collection) {
    const items = collection.getAll().filter(item => item.template.inputPath.endsWith('.md'));
    const searchIndex = [];

    for (const item of items) {
      const content = await item.template.read();
      const url = process.env.GITHUB_ACTIONS && !item.url.startsWith('/prompt_library') 
        ? `/prompt_library${item.url}` 
        : item.url;
        
      searchIndex.push({
        title: item.data.title || '',
        description: item.data.description || '',
        content: content || '',
        url: url,
        discipline: item.data.discipline || '',
        contentType: item.data.contentType || '',
        tags: item.data.tags || [],
        date: item.data.date || new Date().toISOString(),
        version: item.data.version || '',
        lastUpdated: item.data.lastUpdated || ''
      });
    }

    // Write search index to JSON file
    const outputPath = path.join(__dirname, '_site', 'search-index.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(searchIndex));

    return searchIndex;
  });

  // Add base URL for GitHub Pages
  const baseUrl = process.env.GITHUB_ACTIONS ? "/prompt_library" : "";
  eleventyConfig.addGlobalData("baseUrl", baseUrl);

  // Add URL filter that includes base URL
  eleventyConfig.addFilter("fullUrl", function(url) {
    if (url.startsWith(baseUrl)) {
      return url;
    }
    return `${baseUrl}${url}`;
  });

  // Add Nunjucks filter to check if a section has content
  eleventyConfig.addNunjucksFilter("hasContent", function(discipline, contentType) {
    // Access collections via this.ctx
    const collections = this.ctx.collections;

    const logPrefix = "[HAS_CONTENT_NJK_DEBUG]"; // Changed prefix for clarity
    console.log(`${logPrefix} Checking filter for: discipline='${discipline}', contentType='${contentType}'`);

    const collectionName = contentType.toLowerCase().replace(/\s+/g, '-');
    
    if (!collections || !collections[collectionName]) {
      console.log(`${logPrefix} Collection not found for '${collectionName}'. Returning false.`);
      return false;
    }
    
    const collectionItems = collections[collectionName];
    console.log(`${logPrefix} Found collection '${collectionName}' with ${collectionItems.length} items.`);

    const hasContent = collectionItems.some(item => {
      const itemDiscipline = item.data.discipline;
      // Ensure case-insensitive comparison just in case
      const match = typeof itemDiscipline === 'string' && typeof discipline === 'string' && itemDiscipline.toLowerCase() === discipline.toLowerCase();
      console.log(`${logPrefix} Comparing item discipline '${itemDiscipline}' === filter discipline '${discipline}': ${match}`);
      return match;
    });

    console.log(`${logPrefix} Final result for ${discipline}/${contentType}: ${hasContent}`);
    return hasContent;
  });

  // Add a collection for recently added content (all types, sorted by date desc)
  eleventyConfig.addCollection('recentlyAdded', function(collection) {
    let all = [];
    contentTypes.forEach(type => {
      all = all.concat(collection.getFilteredByGlob(
        disciplines.map(discipline => `${discipline}/${type}/**/*.md`)
      ));
    });
    return all.sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  // Version validation: warn on invalid semver or incomplete version metadata
  const semverRegex = /^\d+\.\d+\.\d+$/;
  eleventyConfig.on('eleventy.before', async () => {
    for (const discipline of disciplines) {
      for (const type of contentTypes) {
        const dir = path.join(__dirname, discipline, type);
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'index.md');
        for (const file of files) {
          const filePath = path.join(dir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const { data } = matter(content);
          if (data.version && !semverRegex.test(String(data.version))) {
            console.warn(`[VERSION] Invalid semver in ${discipline}/${type}/${file}: "${data.version}"`);
          }
          if (data.version && !data.lastUpdated) {
            console.warn(`[VERSION] ${discipline}/${type}/${file} has version but no lastUpdated`);
          }
          if (data.changelog && Array.isArray(data.changelog)) {
            data.changelog.forEach((entry, i) => {
              if (!entry.version || !entry.date || !entry.summary) {
                console.warn(`[VERSION] Incomplete changelog entry #${i + 1} in ${discipline}/${type}/${file}`);
              }
              if (entry.version && !semverRegex.test(String(entry.version))) {
                console.warn(`[VERSION] Invalid semver in changelog entry #${i + 1} of ${discipline}/${type}/${file}: "${entry.version}"`);
              }
            });
          }
        }
      }
    }
  });

  // Add a collection for recently updated content (items with lastUpdated, sorted desc)
  eleventyConfig.addCollection('recentlyUpdated', function(collection) {
    let all = [];
    contentTypes.forEach(type => {
      all = all.concat(collection.getFilteredByGlob(
        disciplines.map(discipline => `${discipline}/${type}/**/*.md`)
      ));
    });
    return all
      .filter(item => item.data.lastUpdated)
      .sort((a, b) => new Date(b.data.lastUpdated) - new Date(a.data.lastUpdated));
  });

  // Filter to check if an item was updated within the last 30 days
  eleventyConfig.addNunjucksFilter("isRecentlyUpdated", function(item) {
    if (!item || !item.data || !item.data.lastUpdated) return false;
    const updated = new Date(item.data.lastUpdated);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return updated > thirtyDaysAgo;
  });

  // After build: copy raw markdown for skill files as SKILL.md
  // This enables agents to fetch skill definitions programmatically
  eleventyConfig.on('eleventy.after', async () => {
    const outputDir = path.join(__dirname, '_site');
    const glob = require('path');

    for (const discipline of disciplines) {
      const skillsDir = path.join(__dirname, discipline, 'skills');
      if (!fs.existsSync(skillsDir)) continue;

      const entries = fs.readdirSync(skillsDir);
      for (const entry of entries) {
        if (!entry.endsWith('.md') || entry === 'index.md') continue;

        const slug = entry.replace(/\.md$/, '');
        const srcFile = path.join(skillsDir, entry);
        const destDir = path.join(outputDir, discipline, 'skills', slug);
        const destFile = path.join(destDir, 'SKILL.md');

        // Read the raw markdown and extract the content between five backticks
        const raw = fs.readFileSync(srcFile, 'utf8');
        const match = raw.match(/`{5}\n([\s\S]*?)\n`{5}/);
        const skillContent = match ? match[1] : raw;

        fs.mkdirSync(destDir, { recursive: true });
        fs.writeFileSync(destFile, skillContent);
      }
    }
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
    pathPrefix: baseUrl
  };
}; 