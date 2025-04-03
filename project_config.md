# 11ty Prompt Library Project Configuration

## Project Overview
This project is a static site built with 11ty that allows users to save, search, and share AI prompts, cursor rules, project configurations, and workflow state examples. The site is hosted on GitHub Pages and features a clean, modern design.

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
   ├── _includes/          # Layouts and partials
   ├── _layouts/           # Page templates
   ├── assets/             # Static assets
   │   ├── css/
   │   ├── js/
   │   └── images/
   ├── content/            # Content files
   │   ├── prompts/
   │   ├── cursor-rules/
   │   ├── project-configs/
   │   └── workflow-states/
   ├── .eleventy.js        # 11ty configuration
   ├── .gitignore
   ├── package.json
   └── README.md
   ```

## Configuration Files

### .eleventy.js
```javascript
module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");

  // Add filters and shortcodes
  eleventyConfig.addFilter("date", require("./filters/date.js"));
  
  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    }
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

### Prompts
```markdown
---
title: "Prompt Title"
description: "Brief description of the prompt"
category: "category"
tags: ["tag1", "tag2"]
date: "2024-03-20"
---

Content of the prompt goes here...
```

### Cursor Rules
```markdown
---
title: "Rule Title"
description: "Brief description of the rule"
category: "category"
tags: ["tag1", "tag2"]
date: "2024-03-20"
---

Content of the rule goes here...
```

## Search Implementation

1. **Install search dependencies**
   ```bash
   npm install --save-dev @11ty/eleventy-plugin-search
   ```

2. **Configure search in .eleventy.js**
   ```javascript
   const searchPlugin = require("@11ty/eleventy-plugin-search");
   eleventyConfig.addPlugin(searchPlugin);
   ```

## GitHub Pages Setup

1. **Create .github/workflows/deploy.yml**
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

2. **Configure GitHub Pages**
   - Go to repository Settings > Pages
   - Set source to "GitHub Actions"

## Development Workflow

1. **Create a new feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and test locally**
   ```bash
   npm start
   ```

3. **Build and test production version**
   ```bash
   npm run build
   ```

4. **Commit and push changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/new-feature
   ```

5. **Create pull request**
   - Go to GitHub repository
   - Create new pull request
   - Request review from team members

## Maintenance

- Regularly update dependencies
- Monitor GitHub Pages deployment status
- Review and update content structure as needed
- Test search functionality after content updates
- Check for broken links and assets

## Troubleshooting

1. **Build fails**
   - Check Node.js version
   - Verify all dependencies are installed
   - Review error messages in console

2. **Search not working**
   - Verify search plugin configuration
   - Check content structure matches expected format
   - Clear browser cache

3. **GitHub Pages deployment issues**
   - Check GitHub Actions workflow status
   - Verify repository settings
   - Review build logs for errors 