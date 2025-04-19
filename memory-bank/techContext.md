# Tech Context

## Core Technologies
- **Static Site Generator:** 11ty (Eleventy)
- **Hosting:** GitHub Pages
- **Content Format:** Markdown (.md)
- **Runtime:** Node.js (v16 or higher required)
- **Package Manager:** npm (or yarn)
- **Version Control:** Git

## Supporting Technologies / Formats
- **GitHub Issue Templates:** YAML format used for creating structured issue forms (`.github/ISSUE_TEMPLATE/*.yml`).
- **GitHub Actions (`repository_dispatch`):** Used to receive external events (like Slack prompt submissions) and trigger workflows. Requires a shared secret (`SLACK_SHARED_SECRET`) configured in repository secrets.

## Development Setup
1.  Clone the repository.
2.  Install dependencies using `npm install`.
3.  Run the development server using `npm start`.

## Build Process
- Production builds are generated using `npm run build`.

## Dependencies
- **Primary:** `@11ty/eleventy` (^3.0.0) as a dev dependency.
- See `package.json` for a full list of npm dependencies. (Verified). 