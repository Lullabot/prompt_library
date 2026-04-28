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

function fail(msg) {
  console.error(`[generate-skill-pages] ${msg}`);
  process.exit(1);
}

function isSkillDir(entry) {
  if (!entry.isDirectory()) return false;
  if (entry.name.startsWith('.')) return false;
  const skillMd = path.join(VENDOR_DIR, entry.name, 'SKILL.md');
  return fs.existsSync(skillMd);
}

function readSkill(skillName) {
  const skillDir = path.join(VENDOR_DIR, skillName);
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  const metaPath = path.join(skillDir, 'meta.yml');

  if (!fs.existsSync(metaPath)) {
    fail(`Missing meta.yml in _skills-vendor/${skillName}/`);
  }

  const skillRaw = fs.readFileSync(skillMdPath, 'utf8');
  const skillFm = matter(skillRaw);
  const meta = yaml.load(fs.readFileSync(metaPath, 'utf8')) || {};

  if (!meta.discipline || !VALID_DISCIPLINES.has(meta.discipline)) {
    fail(
      `Invalid discipline "${meta.discipline}" in _skills-vendor/${skillName}/meta.yml. ` +
      `Must be one of: ${[...VALID_DISCIPLINES].join(', ')}`
    );
  }
  if (!meta.title) fail(`Missing title in _skills-vendor/${skillName}/meta.yml`);
  if (!meta.date) fail(`Missing date in _skills-vendor/${skillName}/meta.yml`);

  return {
    name: skillName,
    skillDir,
    skillBody: skillRaw.trim(),
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
  main();
}

module.exports = { readSkill, buildPageContent, VALID_DISCIPLINES };
