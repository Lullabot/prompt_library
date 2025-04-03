---
title: "11ty Project Configuration"
description: "Configuration and setup instructions for 11ty static site projects."
layout: "markdown.njk"
category: "Static Sites"
tags: ["11ty", "setup", "configuration", "development"]
date: "2024-03-20"
discipline: "development"
---
`````
# 11ty Project Configuration

## Project Structure
```
├── _data/              # Global data files
├── _includes/          # Layouts and partials
├── _layouts/           # Page templates
├── assets/             # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── content/            # Content files
├── .eleventy.js        # 11ty configuration
├── .gitignore
├── package.json
└── README.md
```

## .eleventy.js Configuration
```javascript
module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  
  // Add filters
  eleventyConfig.addFilter("date", function(date) {
    return new Date(date).toLocaleDateString();
  });

  // Add collections
  eleventyConfig.addCollection("posts", function(collection) {
    return collection.getFilteredByGlob("content/posts/*.md");
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
    dataTemplateEngine: "njk"
  };
};
```

## package.json Scripts
```json
{
  "scripts": {
    "start": "eleventy --serve",
    "build": "eleventy",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## GitHub Pages Deployment
1. Create `.github/workflows/deploy.yml`
2. Configure repository settings
3. Set up GitHub Pages source
4. Monitor deployment status 
`````