# Active Context

## Current Focus
- Implementing and testing GitHub Issue Templates as a primary method for content contribution, aligning with an "invite and curate" strategy.
- Refining the contribution workflow based on discussions in Issue #34.
- Ensuring all discipline/content-type folders (including QA) are properly initialized with customized `index.njk` files containing relevant metadata and placeholder content, replacing any `.gitkeep` files.
- **FIXED:** Quality Assurance discipline was missing from Eleventy's config. It has now been added to the `disciplines` array, so QA content is visible and highlighted on the homepage and navigation.
- **Next:** Rebuild the site and verify that the homepage and navigation now correctly highlight Quality Assurance when content exists.

## Recent Activity
- Discussed various approaches to simplifying contribution and frontmatter generation (GitHub Issue #34).
- Explored GitHub Issue Templates/Forms as a user-friendly option.
- Drafted and created the initial `prompt-submission.yml` template in `.github/ISSUE_TEMPLATE/`.
- Replaced `.gitkeep` files in all `quality-assurance/` subfolders with Quality Assurance-specific `index.njk` files, each including tailored metadata and a section description.

## Next Steps
- **Test Issue Template:** Submit test content using the new prompt submission template on GitHub.
- **Define Maintainer Workflow:** Document the process for maintainers to review issue submissions and convert them into markdown files with correct frontmatter and structure.
- **Finalize Template Fields:** Review and finalize the dropdown options for `discipline` and `content-type` in `prompt-submission.yml`.
- **Create More Templates:** Draft and create similar issue templates for other content types (workflows, rules, configs) as needed.
- **Update Contribution Docs:** Update `contributing.njk` to reflect the primary use of issue templates.
- **Verify Section Initialization:** Ensure all discipline/content-type folders are initialized with appropriate `index.njk` files and metadata. 