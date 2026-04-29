#!/usr/bin/env node
/**
 * Generate prompt-library skill pages from the lullabot-skills submodule.
 *
 * For each `<name>/` folder in `_skills-vendor/`, reads SKILL.md + meta.yml,
 * then writes `<discipline>/skills/<name>.md` (with prompt-library frontmatter
 * wrapping the SKILL.md body in five backticks) plus copies the skill's
 * resource files to `<discipline>/skills/<name>/`.
 *
 * Generated files are gitignored. The build runs this in `prebuild`, and
 * `npm start` runs it once at startup.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const yaml = require('js-yaml');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const VENDOR_DIR = path.join(ROOT, '_skills-vendor');

const VALID_DISCIPLINES = new Set([
  'development',
  'content-strategy',
  'design',
  'project-management',
  'quality-assurance',
  'sales-marketing',
]);

class GenerateSkillsError extends Error {}

function fail(msg) {
  throw new GenerateSkillsError(msg);
}

function isSkillDir(entry) {
  if (!entry.isDirectory()) return false;
  if (entry.name.startsWith('.')) return false;
  const skillMd = path.join(VENDOR_DIR, entry.name, 'SKILL.md');
  return fs.existsSync(skillMd);
}

// Walk git history of a skill folder and collect:
//   - lastUpdated: commit date (YYYY-MM-DD) of the most recent commit that
//     touched any file in <skillDir>/
//   - changelog:   array of { date, summary } entries, one per
//     `User-Facing-Change:` (or `User-Facing-Change[<name>]:`) trailer line
//     in commit messages of commits that touched this skill folder.
//     Newest first.
//
// Unscoped trailers apply to this skill. Scoped trailers apply only when
// the bracketed name matches `skillName`. This lets multi-skill commits
// emit one trailer per skill.
//
// If the directory isn't a git repo, or git isn't available, returns
// `{ lastUpdated: null, changelog: [] }` so the rest of the build can
// continue. meta.yml values always win over git-derived values.
function gitMetaForSkill(skillName, vendorDir) {
  // Cheap: just the last commit's date.
  let lastUpdated = null;
  try {
    const out = execFileSync(
      'git',
      ['-C', vendorDir, 'log', '-1', '--format=%cs', '--', `${skillName}/`],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    if (out) lastUpdated = out;
  } catch {
    return { lastUpdated: null, changelog: [] };
  }

  if (!lastUpdated) {
    return { lastUpdated: null, changelog: [] };
  }

  // Targeted: only commits whose message contains the trailer marker.
  // --grep filters server-side so we don't buffer commit bodies for noisy histories.
  const FIELD_SEP = '\x1f';
  const RECORD_SEP = '\x1e';
  let raw = '';
  try {
    raw = execFileSync(
      'git',
      [
        '-C', vendorDir,
        'log',
        '--grep=^User-Facing-Change',
        '--extended-regexp',
        `--pretty=format:%cs${FIELD_SEP}%B${RECORD_SEP}`,
        '--',
        `${skillName}/`,
      ],
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
    );
  } catch {
    // History too shallow or git unavailable for the second query — return
    // what we have. lastUpdated alone is still useful.
    return { lastUpdated, changelog: [] };
  }

  if (!raw) return { lastUpdated, changelog: [] };

  const scopedRe = /^User-Facing-Change\[([^\]]+)\]:\s*(.+)$/;
  const bareRe = /^User-Facing-Change:\s*(.+)$/;
  const changelog = [];
  // git log default order is newest-first; iterate in that order and append.
  for (const record of raw.split(RECORD_SEP).map(s => s.replace(/^\n+/, '')).filter(Boolean)) {
    const [date, body] = record.split(FIELD_SEP);
    if (!date || !body) continue;
    for (const line of body.split('\n')) {
      const scoped = line.match(scopedRe);
      if (scoped) {
        if (scoped[1].trim() === skillName) {
          changelog.push({ date, summary: scoped[2].trim() });
        }
        continue;
      }
      const bare = line.match(bareRe);
      if (bare) {
        changelog.push({ date, summary: bare[1].trim() });
      }
    }
  }

  return { lastUpdated, changelog };
}

function readSkill(skillName, vendorDir = VENDOR_DIR) {
  const skillDir = path.join(vendorDir, skillName);
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  const metaPath = path.join(skillDir, 'meta.yml');
  const rel = path.relative(path.dirname(vendorDir), skillDir);

  if (!fs.existsSync(skillMdPath)) {
    fail(`Missing SKILL.md in ${rel}/`);
  }
  if (!fs.existsSync(metaPath)) {
    fail(`Missing meta.yml in ${rel}/`);
  }

  const skillRaw = fs.readFileSync(skillMdPath, 'utf8');
  let skillFm;
  try {
    skillFm = matter(skillRaw);
  } catch (err) {
    fail(
      `Invalid YAML frontmatter in ${rel}/SKILL.md — ${err.reason || err.message}. ` +
      `Multi-line description values must be quoted or use YAML folded scalar (>-).`
    );
  }

  let meta;
  try {
    meta = yaml.load(fs.readFileSync(metaPath, 'utf8')) || {};
  } catch (err) {
    fail(`Invalid YAML in ${rel}/meta.yml — ${err.reason || err.message}.`);
  }

  if (!meta.discipline || !VALID_DISCIPLINES.has(meta.discipline)) {
    fail(
      `Invalid discipline "${meta.discipline}" in ${rel}/meta.yml. ` +
      `Must be one of: ${[...VALID_DISCIPLINES].join(', ')}`
    );
  }
  if (!meta.title) fail(`Missing title in ${rel}/meta.yml`);
  if (!meta.date) fail(`Missing date in ${rel}/meta.yml`);
  if (!skillFm.data.name) fail(`Missing 'name' in ${rel}/SKILL.md frontmatter (Claude Code requires it).`);
  if (!skillFm.data.description) fail(`Missing 'description' in ${rel}/SKILL.md frontmatter (Claude Code requires it).`);

  // Derive lastUpdated + changelog from git history. meta.yml values win.
  const gitMeta = gitMetaForSkill(skillName, vendorDir);
  if (!meta.lastUpdated && gitMeta.lastUpdated) {
    meta.lastUpdated = gitMeta.lastUpdated;
  }
  if (!meta.changelog && gitMeta.changelog.length > 0) {
    meta.changelog = gitMeta.changelog;
  }

  return {
    name: skillName,
    skillDir,
    // Preserve upstream content verbatim — don't trim trailing whitespace
    // that might be meaningful (e.g., hard line breaks in markdown).
    skillBody: skillRaw,
    description: skillFm.data.description || '',
    meta,
  };
}

function buildFrontmatter({ skill }) {
  const fm = {
    title: skill.meta.title,
    description: skill.description,
    date: skill.meta.date,
    layout: 'markdown.njk',
    discipline: skill.meta.discipline,
    contentType: 'skills',
  };
  if (skill.meta.version) fm.version = skill.meta.version;
  if (skill.meta.lastUpdated) fm.lastUpdated = skill.meta.lastUpdated;
  if (skill.meta.changelog) fm.changelog = skill.meta.changelog;
  if (skill.meta.tags) fm.tags = skill.meta.tags;

  // gray-matter's stringify produces clean YAML
  return matter.stringify('', fm).replace(/\n$/, '');
}

function buildPageContent(skill) {
  const frontmatter = buildFrontmatter({ skill });
  return `${frontmatter}\n\n\`\`\`\`\`\n${skill.skillBody}\n\`\`\`\`\`\n`;
}

function copyResources(skill, destDir) {
  // Copy everything in the skill's vendor dir except SKILL.md and meta.yml
  const entries = fs.readdirSync(skill.skillDir, { withFileTypes: true });
  let hasResources = false;
  for (const entry of entries) {
    if (entry.name === 'SKILL.md' || entry.name === 'meta.yml') continue;
    if (entry.name.startsWith('.')) continue;
    const src = path.join(skill.skillDir, entry.name);
    const dest = path.join(destDir, entry.name);
    fs.cpSync(src, dest, { recursive: true });
    hasResources = true;
  }
  return hasResources;
}

function cleanGeneratedSkills() {
  // Remove every <discipline>/skills/<name>.md and <discipline>/skills/<name>/
  // except index.njk. Generated files are listed in .gitignore so this is safe.
  for (const discipline of VALID_DISCIPLINES) {
    const dir = path.join(ROOT, discipline, 'skills');
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'index.njk') continue;
      if (entry.name.startsWith('.')) continue;
      fs.rmSync(path.join(dir, entry.name), { recursive: true, force: true });
    }
  }
}

function main() {
  if (!fs.existsSync(VENDOR_DIR)) {
    fail(
      `_skills-vendor/ not found. Run \`git submodule update --init --recursive\` ` +
      `to initialize the lullabot-skills submodule.`
    );
  }

  const entries = fs.readdirSync(VENDOR_DIR, { withFileTypes: true });
  const skillEntries = entries.filter(isSkillDir);

  if (skillEntries.length === 0) {
    fail(`No skills found in _skills-vendor/. Is the submodule initialized?`);
  }

  cleanGeneratedSkills();

  const generated = [];
  for (const entry of skillEntries) {
    const skill = readSkill(entry.name);
    const targetMdPath = path.join(
      ROOT,
      skill.meta.discipline,
      'skills',
      `${skill.name}.md`
    );
    const targetResourceDir = path.join(
      ROOT,
      skill.meta.discipline,
      'skills',
      skill.name
    );

    fs.mkdirSync(path.dirname(targetMdPath), { recursive: true });
    fs.writeFileSync(targetMdPath, buildPageContent(skill));

    fs.mkdirSync(targetResourceDir, { recursive: true });
    const hasResources = copyResources(skill, targetResourceDir);
    if (!hasResources) {
      // Empty resource dir would still be passthrough-copied; remove it
      fs.rmSync(targetResourceDir, { recursive: true, force: true });
    }

    generated.push(`${skill.meta.discipline}/skills/${skill.name}`);
  }

  console.log(
    `[generate-skill-pages] Generated ${generated.length} skill page(s):`
  );
  for (const p of generated.sort()) console.log(`  - ${p}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    if (err instanceof GenerateSkillsError) {
      console.error(`[generate-skill-pages] ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}

module.exports = { readSkill, buildPageContent, gitMetaForSkill, VALID_DISCIPLINES, GenerateSkillsError };
