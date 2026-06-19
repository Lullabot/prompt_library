# Prompt Library — Homepage Redesign Spec

Source of truth for the homepage redesign. Extracted from the Framer project
**"Miraculous Motivation"** (`8OZqoCrNXFsUHCrgmH3H`), page `/` (node `augiA20Il`),
plus the design page **"Prompt Library Theme Comparison"** (light + dark versions).

> **How this was captured.** The dark version was read node-for-node via the
> [unframer](https://github.com/remorses/unframer) MCP (`getProjectXml` /
> `getNodeXml`). The light version is a Framer *replica/variant* node, which the
> MCP cannot traverse, so its palette was read from an editor screenshot. Framer's
> first-party `@framer/agent` bridge could not be used for reads — it fails with
> `Assertion Error: The importMap has to exist on the module` on every render-path
> call (`screenshot`, `serialize`, node attributes). See
> `docs/framer-claude-code-evaluation.md` for the full tooling write-up.

## Goal

Replace the current homepage (plain title + Swiper carousel + "By Type" pills +
discipline grid) with the Framer redesign: a search-first hero, an install
callout, a resource-card grid, a type-card grid, a discipline **matrix**, an
orange contribution CTA, and a footer — all dual-theme (light + dark), keeping
the existing `theme.js` toggle.

Scope: **homepage only** (`index.njk`). Interior pages keep their current
templates. Counts are computed **live** from collections (never hardcoded).

## Palette (both themes)

Implemented as `--rd-*` tokens scoped to `:root` (light) and `:root.dark-theme`
(dark) so the redesign is self-contained and does not restyle interior pages.

| Token | Role | Light | Dark |
|---|---|---|---|
| `--rd-bg` | page background | `#F7F4EF` (warm cream) | `#102331` |
| `--rd-surface` | cards / panels | `#FFFFFF` | `#17303E` |
| `--rd-terminal` | terminal card (dark in BOTH themes) | `#0B1822` | `#0B1822` |
| `--rd-terminal-text` | terminal text | `#E6EDF2` | `#E6EDF2` |
| `--rd-ink` | headings | `#16242E` | `#FFFFFF` |
| `--rd-text` | body text | `#2C3A44` | `#C7D6DF` |
| `--rd-muted` | muted / icons | `#5C6B73` | `#7FA2B3` (`rgb(127,162,179)`) |
| `--rd-accent` | coral accent (same both) | `#F15A3B` | `#F15A3B` |
| `--rd-accent-soft` | eyebrow / tint | `rgba(241,90,59,0.12)` | `rgba(241,90,59,0.12)` |
| `--rd-chip` | inactive filter / tag chip | `#ECEAE4` | `rgba(178,209,223,0.10)` |
| `--rd-chip-text` | chip text | `#46535C` | `#B2D1DF` |
| `--rd-border` | hairline borders | `rgba(16,35,49,0.10)` | `rgba(178,209,223,0.12)` |
| `--rd-nav-shell` | nav pill background | `rgba(255,255,255,0.72)` | `rgba(23,48,62,0.78)` |
| `--rd-matrix-head` | matrix header row | `#EFEDE7` | `#0B1822` |
| `--rd-on-accent` | text on coral | `#FFFFFF` | `#FFFFFF` |
| dots | terminal traffic lights | `#FF6A57` / `#FFD15C` / `#5CDF7B` | same |

Fonts: **Inter** (already the site font). Framer weights used: Black, ExtraBold,
Bold, SemiBold, Medium, Regular.

**Confidence:** dark values + page-bg + the "terminal stays dark / coral is shared"
decisions are exact. Light ink/muted/chip/header values were read off a 32%-zoom
screenshot and should be fine-tuned against the Tugboat preview.

## Layout

Single column, centered, `max-width: 1120px`, `28px` horizontal padding. Sections
top → bottom:

### 1. Navigation (pill)
Rounded `999px` shell (`--rd-nav-shell`), `space-between`:
- **Brand** — coral `#F15A3B` rounded square (`8px`) with white "P" (Inter Black) + "Prompt Library" wordmark (Inter ExtraBold).
- **Links** — Home (`/`), Help (`/help`).
- **Library Button** "GitHub" (outline) → `https://github.com/Lullabot/prompt_library`.

### 2. Hero (`SearchFirstIntroduction`)
Centered, `56px` top padding:
- Eyebrow pill (`--rd-accent-soft`): sparkles icon + "AI workflows, ready to reuse".
- H1 (Inter ExtraBold): **"Find the right prompt before the work starts."**
- Subtitle (max 720px): "A searchable library of prompts, rules, agents, skills, and resources for practical AI workflows across project teams."
- **Search panel** (`--rd-surface`, radius `28px`): search bar (icon + placeholder "Search prompts, rules, agents, skills…" + filled "Search" button → `/#search`) and **filter chips**: `Prompts` (active, coral) · `Skills` · `Agents` · `Development` · `Content Strategy`.
- **Stats** (Inter ExtraBold): `{N} resources` · `5 content types` · `6 disciplines` — all live.

### 3. Install callout (`InstallSkillsCallout`)
Two-column card (`--rd-surface`, radius `28px`):
- **Left** — eyebrow "Claude Code skills bundle", "Install all skills at once.", body "Clone the shared skill bundle into your project and let Claude Code pick up the workflows automatically."
- **Right** — terminal card (`--rd-terminal`): red/yellow/green dots, `git clone https://github.com/Lullabot/lullabot-skills.git .claude/skills`, "Copy command" button (clipboard).

### 4. Recently Added (`RecentlyAdded`)
Heading ("Recently Added" eyebrow / "New and updated workflows" / body) + "View all"
button (→ `/skills/`). Then a **Resource Card grid** (`minmax(300px, 1fr)`), driven
by `collections.recentlyAdded`. Framer mock cards:

| Title | Type | Discipline | Status |
|---|---|---|---|
| Reviewing Skills | Skills | Development | Updated |
| Broken Link Report | Skills | Quality Assurance | Updated |
| Drupal Security Review | Skills | Development | Updated |
| Content Inventory | Skills | Content Strategy | New |
| Pencil Designer | Skills | Design | v1.0.0 |
| SEO Expert | Skills | Sales Marketing | New |

Status rule: `lastUpdated` within 30d → "Updated"; `version` set → `v{version}`;
else if recently created → "New".

### 5. Browse by Type (`BrowseByType`)
Centered heading ("Browse by Type" / "Choose the shape of help you need" / body) +
**Type Card grid** (`minmax(198px, 1fr)`). Cards (count = live):

| Type | Mock count | Description |
|---|---|---|
| Prompts | 12 | Reusable starting points for repeatable AI tasks. |
| Rules | 5 | Reusable standards for writing, code quality, and team conventions. |
| Agents | 8 | Role-based assistants for structured project workflows. |
| Skills | 19 | Installable workflows for Claude Code and project-specific tasks. |
| Resources | 2 | Reference links, documentation, and learning material. |

### 6. Browse by Discipline (`BrowseByDiscipline`)
Heading ("Browse by Discipline" / "A library map for every team" / body) + a
**6-column matrix** (`--rd-surface`, radius `26px`). Header row (`--rd-matrix-head`):
`Discipline | Prompts | Rules | Agents | Skills | Resources`. Cells show counts or
`—`. Framer mock rows (counts illustrative — implementation computes live):

| Discipline | Prompts | Rules | Agents | Skills | Resources |
|---|---|---|---|---|---|
| Project Management | 3 | — | 1 | — | — |
| Development | 5 | 3 | 4 | 9 | 2 |
| Content Strategy | 1 | 1 | 2 | 5 | — |
| Design | — | — | — | 2 | — |
| Quality Assurance | 1 | — | 1 | 3 | — |

> **⚠️ Fidelity note:** the Framer matrix omits **Sales Marketing** (5 rows, but the
> stats say "6 disciplines" and SEO Expert is Sales Marketing). The implementation
> **includes all 6 disciplines**.

### 7. Share your knowledge (`ShareYourKnowledge`)
Orange band (`--rd-accent`, radius `30px`), `space-between`:
- Copy: "Share your best workflow." / "Submit a prompt, rule, agent, or skill and help the library become more useful for everyone."
- Buttons: "Submit Prompt" (→ prompt issue template), "Contribute Guide" (→ `/contributing`).

### 8. Footer
`space-between`: "© {year} Prompt Library" + links GitHub, Help.

## Components → Nunjucks macros

| Framer component | id | Macro | Props |
|---|---|---|---|
| Library Button | `m6SKoROEH` | `_lib-button.njk` | label, href, variant (`filled`\|`outline`), newTab |
| Resource Card | `U4fILFY7M` | `_resource-card.njk` | title, description, typeTag, disciplineTag, status, href |
| Type Card | `zZ0bGFHll` | `_type-card.njk` | title, count, description, href |

Button variants in Framer: filled = `dmpGepZk0`, outline = `e4iNiqO4b`.

## Data layer (`.eleventy.js`)

Added Nunjucks filters (live counts):
- `typeCount(contentType)` → items in that content-type collection.
- `disciplineTypeCount(discipline, contentType)` → items matching both (matrix cells).
- `sumTypeCounts(types)` → total across a list of types (hero "N resources").
- `activeDisciplineCount(disciplines, types)` → disciplines with ≥1 item (hero "N disciplines").

Display types: `['prompts','rules','agents','skills','resources']`.
Disciplines: `['development','project-management','sales-marketing','content-strategy','design','quality-assurance']`.

## Implementation phases

0. **Data layer** — filters above. ✅ (this change)
1. **Palette + macros** — `--rd-*` tokens, 3 macros, `redesign.css` component styles. ✅ (this change)
2. **Header/footer** — pill nav + footer links in `base.njk`; drop Swiper CDN.
3. **Homepage rewrite** — `index.njk`: hero, install callout, resource grid, type grid, discipline matrix, CTA. Remove Swiper.
4. **JS** — remove Swiper init; wire "Copy command" + filter chips → search (`main.js`).
5. **Verify** — `npm run build` + `npm start`, both themes, responsive, Tugboat preview.

## Open decisions (resolved)
- Keep the light/dark toggle (dual-theme). ✅
- Reuse existing search JS; chips pre-filter. ✅
- Include all 6 disciplines in the matrix. ✅
- Compute all counts live. ✅
