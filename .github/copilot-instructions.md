# Prompt Library - Copilot Development Instructions

**ALWAYS follow these instructions first and fallback to additional search and context gathering ONLY if the information provided here is incomplete or found to be in error.**

## Project Overview

This is a Prompt Library built with 11ty (Eleventy) static site generator and hosted on GitHub Pages. It organizes AI prompts, rules, project configurations, and workflow states across different disciplines (Development, Project Management, Sales & Marketing, Content Strategy, Design, Quality Assurance).

## Working Effectively

### Bootstrap and Build the Repository
```bash
# Install dependencies - TIMEOUT: 60+ seconds minimum
npm install
# Build time: <1 second. TIMEOUT: 30+ seconds minimum 
npm run build
```

### Development Server
```bash
# Start development server - runs immediately, use async=true
npm start
# Server runs at: http://localhost:8080/prompt_library/
# NEVER CANCEL the dev server - it runs continuously for development
```

### Check for Security Issues
```bash
# Check npm audit - typically shows 1 low severity issue (brace-expansion)
npm audit
# This is a known issue and does not affect functionality
```

## Validation Requirements

### MANDATORY End-to-End Validation
After making ANY changes to the codebase, ALWAYS perform this complete validation sequence:

1. **Build Validation**:
   ```bash
   npm run build
   # Verify build completes successfully with "Wrote XX files" message
   ```

2. **Development Server Testing**:
   ```bash
   npm start  # Use async=true
   # Navigate to http://localhost:8080/prompt_library/
   ```

3. **Manual Site Testing** - CRITICAL:
   - Verify homepage loads with "Prompt Library" title
   - Test navigation to at least one discipline (e.g., /development/)
   - Test clicking on a specific content item (e.g., AI Code Review)
   - Verify search functionality works (type in search box)
   - Confirm content displays with proper formatting
   - Check that code blocks show copy buttons (if present)

### Content Validation
When adding or modifying content files:

1. **Follow Content Structure**:
   ```
   <discipline>/<content-type>/<filename>.md
   ```

2. **Required Frontmatter**:
   ```yaml
   ---
   title: "Your Title Here"
   description: "Clear description"
   date: "YYYY-MM-DD"
   layout: "markdown.njk"
   discipline: "<discipline-name>"
   contentType: "<content-type>"
   tags:
     - relevant
     - tags
   ---
   ```

3. **Prompt Content Special Format**:
   For files in any `*/prompts/` directory, wrap content in five backticks:
   ```
   ---
   frontmatter...
   ---
   `````
   Your prompt content here
   `````
   ```

4. **Test Content Locally**:
   ```bash
   npm start  # async=true
   # Visit: http://localhost:8080/prompt_library/<discipline>/<content-type>/<filename>/
   # Verify content renders correctly with proper formatting
   ```

## Build and Deployment Process

### Local Development
- **Development server**: Instant startup, hot reload enabled
- **Build process**: Sub-second builds, generates `_site/` directory
- **Base URL**: All URLs include `/prompt_library/` prefix for GitHub Pages

### CI/CD Pipeline
- **Automatic deployment**: Pushes to `main` branch trigger GitHub Pages deployment
- **PR previews**: Tugboat creates preview environments for pull requests
- **Node.js version**: Deployment uses Node.js v22 (local development works with v16+)

## Key File Locations

### Configuration Files
- `.eleventy.js` - Main 11ty configuration, collections, and filters
- `package.json` - Dependencies and npm scripts
- `.github/workflows/deploy.yml` - GitHub Pages deployment
- `.tugboat/config.yml` - PR preview environment configuration

### Content Structure
```
├── development/           # Development discipline
├── project-management/    # Project Management discipline  
├── sales-marketing/      # Sales & Marketing discipline
├── content-strategy/     # Content Strategy discipline
├── design/              # Design discipline
├── quality-assurance/   # Quality Assurance discipline
└── Each contains:
    ├── prompts/         # AI prompts
    ├── rules/          # Development guidelines
    ├── project-configs/ # Configuration templates
    ├── workflow-states/ # Process documentation
    └── resources/       # Reference materials
```

### Important Templates
- `_layouts/` - Page layout templates
- `_includes/` - Reusable components
- `_data/` - Global data files
- `assets/` - CSS, JavaScript, and images

## Content Submission

### GitHub Issue Templates
- Prompts: `.github/ISSUE_TEMPLATE/prompt-submission.yml`
- Rules: `.github/ISSUE_TEMPLATE/rule-submission.yml`
- Project Configs: `.github/ISSUE_TEMPLATE/project-config-submission.yml`
- Workflow States: `.github/ISSUE_TEMPLATE/workflow-state-submission.yml`

### Programmatic Submission
- Slack integration via repository_dispatch events
- See `.github/workflows/slack_submit.yml` for payload structure

## Common Tasks and Expected Timing

### Repository Setup (Fresh Clone)
```bash
git clone <repository-url>
cd prompt_library
npm install        # ~8-10 seconds, TIMEOUT: 60+ seconds
npm run build      # <1 second, TIMEOUT: 30+ seconds  
npm start          # Immediate startup, use async=true
```

### Content Development Workflow
```bash
# 1. Create/edit content files following structure
# 2. Test locally
npm start          # async=true for ongoing development
# 3. Validate content renders correctly
# 4. Build to verify no errors
npm run build      # <1 second, TIMEOUT: 30+ seconds
```

### Troubleshooting
- **Build errors**: Check console output for 11ty error messages
- **Content not showing**: Verify frontmatter fields match requirements
- **Search not working**: Rebuild to regenerate search-index.json
- **Styling issues**: Check if assets are copying correctly

## Quick Reference

### Essential URLs (Development)
- Homepage: `http://localhost:8080/prompt_library/`
- Development: `http://localhost:8080/prompt_library/development/`
- Help: `http://localhost:8080/prompt_library/help/`
- Contributing: `http://localhost:8080/prompt_library/contributing/`

### No Formal Testing
- **npm test**: Returns error message (no test suite configured)
- **Validation**: Manual testing via development server is the primary validation method
- **Quality assurance**: Content review and manual site testing

### Performance Expectations
- **Build time**: Sub-second for typical changes
- **Dev server startup**: Immediate
- **Hot reload**: Instant on file changes
- **Page generation**: ~60 files generated in <1 second

**CRITICAL**: Always perform complete end-to-end validation including manual site testing. Simply starting and stopping the development server is NOT sufficient - you must navigate the site, test functionality, and verify content displays correctly.