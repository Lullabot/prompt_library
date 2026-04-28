const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { readSkill, buildPageContent, VALID_DISCIPLINES, GenerateSkillsError } = require('./generate-skill-pages');

// These tests rely on the lullabot-skills submodule being initialized.
// They exercise the real fixtures rather than synthesizing fake ones,
// which keeps them honest about real upstream content.

const VENDOR_DIR = path.resolve(__dirname, '..', '_skills-vendor');

function vendorAvailable() {
  return fs.existsSync(path.join(VENDOR_DIR, 'cloudflare-tunnel', 'SKILL.md'));
}

test('VALID_DISCIPLINES contains the six disciplines', () => {
  assert.equal(VALID_DISCIPLINES.size, 6);
  assert.ok(VALID_DISCIPLINES.has('development'));
  assert.ok(VALID_DISCIPLINES.has('content-strategy'));
  assert.ok(VALID_DISCIPLINES.has('design'));
  assert.ok(VALID_DISCIPLINES.has('project-management'));
  assert.ok(VALID_DISCIPLINES.has('quality-assurance'));
  assert.ok(VALID_DISCIPLINES.has('sales-marketing'));
});

test('readSkill loads SKILL.md + meta.yml correctly', { skip: !vendorAvailable() }, () => {
  const skill = readSkill('cloudflare-tunnel');
  assert.equal(skill.name, 'cloudflare-tunnel');
  assert.equal(skill.meta.discipline, 'development');
  assert.equal(skill.meta.title, 'Cloudflare Tunnel');
  assert.ok(skill.description.length > 0, 'description should come from SKILL.md frontmatter');
  assert.ok(skill.skillBody.includes('# Cloudflare Tunnel'), 'body should contain H1');
  assert.ok(Array.isArray(skill.meta.tags));
});

test('buildPageContent wraps SKILL.md body in five backticks', { skip: !vendorAvailable() }, () => {
  const skill = readSkill('cloudflare-tunnel');
  const page = buildPageContent(skill);

  // Must have outer prompt-library frontmatter
  assert.match(page, /^---\n[\s\S]*?\n---\n/, 'has outer frontmatter');
  assert.match(page, /discipline: development/);
  assert.match(page, /contentType: skills/);
  assert.match(page, /layout: markdown\.njk/);

  // Must wrap body in five backticks
  const fenceMatches = page.match(/^`{5}$/gm);
  assert.ok(fenceMatches && fenceMatches.length === 2, 'has opening + closing five-backtick fences');

  // Body must contain the SKILL.md frontmatter intact (Claude Code reads it)
  assert.match(page, /name: cloudflare-tunnel/);
});

test('buildPageContent preserves optional version fields when present', { skip: !vendorAvailable() }, () => {
  const skill = readSkill('gws-cli');
  const page = buildPageContent(skill);
  assert.match(page, /version: 1\.1\.0/);
  assert.match(page, /lastUpdated:/);
  assert.match(page, /changelog:/);
});

test('buildPageContent omits version fields when absent', { skip: !vendorAvailable() }, () => {
  const skill = readSkill('cloudflare-tunnel');
  const page = buildPageContent(skill);
  assert.doesNotMatch(page, /^version:/m);
  assert.doesNotMatch(page, /^lastUpdated:/m);
  assert.doesNotMatch(page, /^changelog:/m);
});

function makeFixture(files) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-test-'));
  const skillDir = path.join(tmp, 'bad-skill');
  fs.mkdirSync(skillDir);
  for (const [name, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(skillDir, name), contents);
  }
  return { vendorDir: tmp, skillDir, cleanup: () => fs.rmSync(tmp, { recursive: true, force: true }) };
}

test('readSkill rejects unknown discipline', () => {
  const { vendorDir, cleanup } = makeFixture({
    'SKILL.md': '---\nname: bad-skill\ndescription: x\n---\n# x\n',
    'meta.yml': 'title: Bad\ndiscipline: not-real\ndate: "2025-01-01"\n',
  });
  try {
    assert.throws(
      () => readSkill('bad-skill', vendorDir),
      (err) => err instanceof GenerateSkillsError && /Invalid discipline "not-real"/.test(err.message)
    );
  } finally {
    cleanup();
  }
});

test('readSkill fails clearly when SKILL.md is missing', () => {
  const { vendorDir, cleanup } = makeFixture({
    'meta.yml': 'title: x\ndiscipline: development\ndate: "2025-01-01"\n',
  });
  try {
    assert.throws(
      () => readSkill('bad-skill', vendorDir),
      (err) => err instanceof GenerateSkillsError && /Missing SKILL\.md/.test(err.message)
    );
  } finally {
    cleanup();
  }
});

test('readSkill fails clearly when meta.yml is missing', () => {
  const { vendorDir, cleanup } = makeFixture({
    'SKILL.md': '---\nname: x\ndescription: x\n---\n# x\n',
  });
  try {
    assert.throws(
      () => readSkill('bad-skill', vendorDir),
      (err) => err instanceof GenerateSkillsError && /Missing meta\.yml/.test(err.message)
    );
  } finally {
    cleanup();
  }
});

test('readSkill rejects missing required meta fields', () => {
  const { vendorDir, cleanup } = makeFixture({
    'SKILL.md': '---\nname: x\ndescription: x\n---\n# x\n',
    'meta.yml': 'discipline: development\n',
  });
  try {
    assert.throws(
      () => readSkill('bad-skill', vendorDir),
      (err) => err instanceof GenerateSkillsError && /Missing title/.test(err.message)
    );
  } finally {
    cleanup();
  }
});

test('readSkill preserves SKILL.md content verbatim', () => {
  // Trailing two-space hard line break must survive — markdown semantic
  const body = '---\nname: x\ndescription: x\n---\n# x\n\nline one  \nline two\n';
  const { vendorDir, cleanup } = makeFixture({
    'SKILL.md': body,
    'meta.yml': 'title: x\ndiscipline: development\ndate: "2025-01-01"\n',
  });
  try {
    const skill = readSkill('bad-skill', vendorDir);
    assert.equal(skill.skillBody, body, 'body must match upstream byte-for-byte');
  } finally {
    cleanup();
  }
});
