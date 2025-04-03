# 11ty Prompt Library Project Configuration

## Project Overview
This project is a static site built with 11ty that organizes and presents AI prompts, cursor rules, project configurations, and workflow state examples across different disciplines. The site is hosted on GitHub Pages and features a clean, modern design with discipline-based content organization.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- GitHub account

## Initial Setup

1. **Create a new GitHub repository**
   ```bash
   # Initialize a new repository
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Initialize 11ty project**
   ```bash
   # Create package.json
   npm init -y

   # Install 11ty and other dependencies
   npm install --save-dev @11ty/eleventy
   ```

3. **Project Structure**
   ```
   ├── _data/              # Global data files
   ├── _includes/          # Includes and partials
   ├── _layouts/           # Page templates
   │   ├── base.njk        # Base layout
   │   ├── discipline.njk  # Discipline-specific layout
   │   └── content-type.njk # Content type layout
   ├── assets/             # Static assets
   │   ├── css/           # Stylesheets
   │   ├── js/            # JavaScript files
   │   └── images/        # Image assets
   ├── development/        # Development discipline content
   │   ├── prompts/       # Development prompts
   │   ├── cursor-rules/  # Development cursor rules
   │   ├── project-configs/ # Development project configs
   │   └── workflow-states/ # Development workflow states
   ├── project-management/ # Project Management discipline
   ├── sales-marketing/    # Sales & Marketing discipline
   ├── content-strategy/   # Content Strategy discipline
   ├── design/            # Design discipline
   ├── .github/workflows/  # GitHub Actions workflows
   ├── .eleventy.js       # 11ty configuration
   ├── package.json
   └── README.md
   ```

## Configuration Files

### .eleventy.js
```javascript
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");

  // Add date filter with format support
  eleventyConfig.addFilter("date", function(date, format = "yyyy-MM-dd") {
    if (date === "now") {
      date = new Date();
    } else if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    if (isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

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

  // Add collections for content types
  const disciplines = ['development', 'project-management', 'sales-marketing', 'content-strategy', 'design'];
  const contentTypes = ['prompts', 'cursor-rules', 'project-configs', 'workflow-states'];

  contentTypes.forEach(type => {
    eleventyConfig.addCollection(type, function(collection) {
      return collection.getFilteredByGlob(
        disciplines.map(discipline => `${discipline}/${type}/**/*.md`)
      );
    });
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
```

### package.json Scripts
```json
{
  "scripts": {
    "start": "eleventy --serve",
    "build": "eleventy",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Content Structure

### Discipline Organization
Each discipline follows the same content type structure:
```markdown
---
title: "Content Title"
description: "Brief description"
category: "Category"
tags: ["tag1", "tag2"]
date: "2024-03-20"
discipline: "development"
---

Content goes here...
```

### Layout Templates

#### base.njk
Base template with common elements:
```njk
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }} - Prompt Library</title>
    <link rel="stylesheet" href="{{ baseUrl }}/assets/css/styles.css">
</head>
<body>
    <header>
        <nav>
            <a href="{{ baseUrl }}/">Home</a>
            <a href="{{ baseUrl }}/prompts">Prompts</a>
            <a href="{{ baseUrl }}/cursor-rules">Cursor Rules</a>
            <a href="{{ baseUrl }}/project-configs">Project Configs</a>
            <a href="{{ baseUrl }}/workflow-states">Workflow States</a>
        </nav>
    </header>

    <main>
        {{ content | safe }}
    </main>

    <footer>
        <p>&copy; {{ "now" | date("yyyy") }} Prompt Library</p>
    </footer>
</body>
</html>
```

#### discipline.njk
Template for discipline-specific pages:
```njk
---
layout: base.njk
---

<nav class="discipline-nav">
    <a href="{{ baseUrl }}/{{ discipline }}/prompts">Prompts</a>
    <a href="{{ baseUrl }}/{{ discipline }}/cursor-rules">Cursor Rules</a>
    <a href="{{ baseUrl }}/{{ discipline }}/project-configs">Project Configs</a>
    <a href="{{ baseUrl }}/{{ discipline }}/workflow-states">Workflow States</a>
</nav>

{{ content | safe }}
```

#### content-type.njk
Template for content type pages:
```njk
---
layout: discipline.njk
---

<div class="content-type-header">
    <h1>{{ title }}</h1>
    <p class="description">{{ description }}</p>
</div>

<div class="content-list">
    {% for item in collections[contentType] | filterByDiscipline(discipline) %}
        <article class="content-item">
            <h2><a href="{{ item.url }}">{{ item.data.title }}</a></h2>
            <p>{{ item.data.description }}</p>
            <div class="metadata">
                <span class="date">{{ item.date | date("yyyy-MM-dd") }}</span>
                {% if item.data.tags %}
                    <div class="tags">
                        {% for tag in item.data.tags %}
                            <span class="tag">{{ tag }}</span>
                        {% endfor %}
                    </div>
                {% endif %}
            </div>
        </article>
    {% endfor %}
</div>
```

## GitHub Pages Setup

### .github/workflows/deploy.yml
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

## Development Workflow

1. **Create content in appropriate discipline directory**
   ```bash
   # Example: Creating a new prompt in the development discipline
   mkdir -p development/prompts/new-prompt
   touch development/prompts/new-prompt/index.md
   ```

2. **Test locally**
   ```bash
   npm start
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Commit and push changes**
   ```bash
   git add .
   git commit -m "Add new content"
   git push origin main
   ```

## Maintenance

- Keep content organized within appropriate disciplines
- Regularly update dependencies
- Monitor GitHub Pages deployment status
- Review and update content structure as needed
- Test search functionality after content updates
- Check for broken links and assets
- Maintain consistent styling across all pages 