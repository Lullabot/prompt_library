# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Prompt Library built with 11ty (Eleventy) static site generator and hosted on GitHub Pages. It organizes AI prompts, rules, project configurations, and workflow states across different disciplines (Development, Project Management, Sales & Marketing, Content Strategy, Design, Quality Assurance).

## Essential Commands

```bash
# Development
npm start          # Start development server at http://localhost:8080
npm run build      # Build static site to _site directory

# Git workflow for contributing
git checkout -b <issue-number>--<issue-title>  # Create feature branch
git push -u origin <branch-name>               # Push branch
gh pr create                                    # Create pull request
```

## Architecture & Content Structure

### Content Organization
Content is organized by discipline and type:
```
<discipline>/<content-type>/<filename>.md

Disciplines: development, project-management, sales-marketing, content-strategy, design, quality-assurance
Content Types: prompts, rules, project-configs, workflow-states, resources
```

### Required Frontmatter
All content files require this structure:
```yaml
---
title: "Title Here"
description: "Clear description"
date: "YYYY-MM-DD"
layout: "markdown.njk"
discipline: "<matching-parent-directory>"
contentType: "<matching-immediate-parent>"
tags:
  - relevant
  - tags
---
```

### Special Formatting for Prompts
Prompt files in `*/prompts/` directories must wrap content in five backticks:
```
---
frontmatter...
---
`````
Prompt content here
`````
```

## Key Configuration Files

- `.eleventy.js`: Main 11ty configuration, defines collections, filters, and build settings
- `.github/workflows/deploy.yml`: GitHub Actions deployment to gh-pages branch
- `.tugboat/config.yml`: PR preview environments configuration
- `.cursor/rules/prompt-library-requirements.mdc`: Detailed content requirements
- `llms.txt`: Compressed project structure file for AI context (auto-generated, contains all project files)

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the main branch. PR preview environments are created via Tugboat for visual testing.

## Content Submission

GitHub issue templates are available for submitting new content:
- Prompts: `.github/ISSUE_TEMPLATE/prompt-submission.yml`
- Rules: `.github/ISSUE_TEMPLATE/rule-submission.yml`
- Project Configs: `.github/ISSUE_TEMPLATE/project-config-submission.yml`
- Workflow States: `.github/ISSUE_TEMPLATE/workflow-state-submission.yml`

Programmatic submissions can be made via repository_dispatch events (see `.github/workflows/slack_submit.yml`).

## AI Context File (llms.txt)

The `llms.txt` file is an auto-generated compressed representation of the entire project structure and contents. It serves as a comprehensive context file for AI assistants (like Claude, GPT, etc.) to understand the complete codebase in a single file.

### Purpose
- Provides full project context to AI assistants without requiring multiple file reads
- Includes all relevant code files, documentation, and configuration
- Enables AI assistants to have a complete understanding of the project architecture and implementation

### Contents
The file contains:
- Complete project file structure
- All source code files (.js, .html, .css, .md, .json, .yaml, etc.)
- Configuration files
- Documentation
- Templates and layouts

### Usage
When working with AI assistants on this project, the llms.txt file can be provided as context to give the assistant a complete understanding of the codebase. This is particularly useful for:
- Code reviews and analysis
- Debugging assistance
- Feature implementation guidance
- Architecture discussions

Note: This file is auto-generated and should not be edited manually. It's created by processing all project files and compressing them into a single context file.
