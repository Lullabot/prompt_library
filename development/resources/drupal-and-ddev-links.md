---
title: "Drupal and DDEV: Reference Links and Documentation Guidance"
description: "Essential links for Drupal and DDEV development, plus step-by-step instructions and best practices for adding documentation to Cursor AI projects."
url: "/development/resources/drupal-and-ddev-links/"
resource_type: "guide list"
skill_level: "Intermediate"
discipline: "development"
contentType: "resources"
layout: markdown.njk
date: "2025-05-12"
topics:
  - "Drupal"
  - "DDEV"
  - "documentation"
  - "AI agent context"
  - "best practices"
---
# How and Why to Add Docs to Cursor

Adding documentation to Cursor (or similar AI agents) is essential for providing persistent, reusable context that improves the agent's accuracy and usefulness. Well-maintained docs reduce hallucinations, standardize workflows, and encode domain knowledge for both humans and AI.

## How to Add Docs to Cursor

- Open the `@Docs` panel in Cursor and select **Add new doc**.
- Paste the URL of the documentation you want to add. (Tip: Add a trailing slash to the URL to index all subpages and subdirectories.)
- Cursor will crawl, index, and keep your custom doc up to date automatically.
- You can manage your custom docs in **Settings > Features > Docs**—edit, delete, or add new docs as needed.
- Once added, reference your custom docs in chat or prompts using the `@Docs` symbol to bring them into context for the agent.

---

# Drupal and DDEV Reference Links

Essential links for Drupal and DDEV development, useful for both agents and developers.

## Drupal
- **[Drupal - Hooks](https://www.drupal.org/node/3442349):** Overview and usage of hooks in Drupal.
- **[Drupal - Development guide](https://www.drupal.org/docs/develop):** Official Drupal development documentation.
- **[Drupal - Theming](https://www.drupal.org/docs/develop/theming-drupal):** Guide to theming in Drupal.
- **[Drupal - Modules](https://www.drupal.org/docs/develop/creating-modules):** Creating and managing Drupal modules.
- **[Drupal - APIs](https://www.drupal.org/docs/develop/drupal-apis):** Reference for Drupal's APIs.
- **[Drupal - Core modules and theming](https://www.drupal.org/docs/develop/core-modules-and-themes):** Documentation for core modules and themes.

## DDEV
- **[DDEV - Usage](https://ddev.readthedocs.io/en/stable/users/usage/):** How to use DDEV for local development.
- **[DDEV - FAQ](https://ddev.readthedocs.io/en/stable/users/usage/faq/):** Frequently asked questions about DDEV.
- **[DDEV - Commands](https://ddev.readthedocs.io/en/stable/users/usage/commands/):** List of DDEV commands and their usage.

## Other
- **[Lullabot ADRs](https://architecture.lullabot.com):** Architectural Decision Records from Lullabot for reference and inspiration. 