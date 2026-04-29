const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { execFileSync } = require('child_process');

const { readSkill, buildPageContent, gitMetaForSkill, VALID_DISCIPLINES, GenerateSkillsError } = require('./generate-skill-pages');

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

test('buildPageContent omits version fields when absent (and no git history)', () => {
  // Use a non-git fixture so neither meta.yml nor git provide values.
  const { vendorDir, cleanup } = makeFixture({
    'SKILL.md': '---\nname: x\ndescription: y\n---\n# x\n',
    'meta.yml': 'title: X\ndiscipline: development\ndate: "2025-01-01"\n',
  });
  try {
    const skill = readSkill('bad-skill', vendorDir);
    const page = buildPageContent(skill);
    assert.doesNotMatch(page, /^version:/m);
    assert.doesNotMatch(page, /^lastUpdated:/m);
    assert.doesNotMatch(page, /^changelog:/m);
  } finally {
    cleanup();
  }
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

// Git-backed fixtures: initialize a tmp directory as a git repo, create
// skill folders, and make commits with controlled author dates and
// User-Facing-Change trailers. Used to test gitMetaForSkill end-to-end.
function makeGitFixture() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-git-test-'));
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: 'Test',
    GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'Test',
    GIT_COMMITTER_EMAIL: 'test@example.com',
  };
  execFileSync('git', ['init', '--quiet', '-b', 'main', tmp], { env });
  execFileSync('git', ['-C', tmp, 'config', 'commit.gpgsign', 'false'], { env });

  function commit({ files, message, date }) {
    for (const [filePath, content] of Object.entries(files)) {
      const abs = path.join(tmp, filePath);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content);
      execFileSync('git', ['-C', tmp, 'add', filePath], { env });
    }
    execFileSync('git', ['-C', tmp, 'commit', '-q', '-m', message], {
      env: { ...env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
    });
  }

  return {
    vendorDir: tmp,
    commit,
    cleanup: () => fs.rmSync(tmp, { recursive: true, force: true }),
  };
}

test('gitMetaForSkill returns nulls when not a git repo', () => {
  const { vendorDir, cleanup } = makeFixture({
    'SKILL.md': '---\nname: x\ndescription: x\n---\n# x\n',
    'meta.yml': 'title: x\ndiscipline: development\ndate: "2025-01-01"\n',
  });
  try {
    const result = gitMetaForSkill('bad-skill', vendorDir);
    assert.equal(result.lastUpdated, null);
    assert.deepEqual(result.changelog, []);
  } finally {
    cleanup();
  }
});

test('gitMetaForSkill derives lastUpdated from most recent commit', () => {
  const { vendorDir, commit, cleanup } = makeGitFixture();
  try {
    commit({
      files: { 'mine/SKILL.md': '---\nname: mine\ndescription: x\n---\n# m\n' },
      message: 'Initial',
      date: '2026-01-15T12:00:00Z',
    });
    commit({
      files: { 'mine/SKILL.md': '---\nname: mine\ndescription: y\n---\n# m\n\nupdated\n' },
      message: 'Tweak description',
      date: '2026-03-20T12:00:00Z',
    });
    const result = gitMetaForSkill('mine', vendorDir);
    assert.equal(result.lastUpdated, '2026-03-20');
  } finally {
    cleanup();
  }
});

test('gitMetaForSkill builds changelog from User-Facing-Change trailers, newest first', () => {
  const { vendorDir, commit, cleanup } = makeGitFixture();
  try {
    commit({
      files: { 'mine/SKILL.md': '---\nname: mine\ndescription: x\n---\n# m\n' },
      message: 'Initial commit\n\nUser-Facing-Change: Initial release of the mine skill\n',
      date: '2026-01-15T12:00:00Z',
    });
    commit({
      files: { 'mine/SKILL.md': '---\nname: mine\ndescription: x\n---\n# m\n\nv2\n' },
      message: 'Cosmetic typo fix', // no trailer — should not appear
      date: '2026-02-01T12:00:00Z',
    });
    commit({
      files: { 'mine/SKILL.md': '---\nname: mine\ndescription: x\n---\n# m\n\nv3\n' },
      message: 'Add new section\n\nUser-Facing-Change: Added quickstart section\n',
      date: '2026-03-10T12:00:00Z',
    });

    const result = gitMetaForSkill('mine', vendorDir);
    assert.equal(result.lastUpdated, '2026-03-10');
    assert.deepEqual(result.changelog, [
      { date: '2026-03-10', summary: 'Added quickstart section' },
      { date: '2026-01-15', summary: 'Initial release of the mine skill' },
    ]);
  } finally {
    cleanup();
  }
});

test('gitMetaForSkill respects scoped User-Facing-Change[<name>] trailers', () => {
  const { vendorDir, commit, cleanup } = makeGitFixture();
  try {
    // One commit touches two skills with two scoped trailers
    commit({
      files: {
        'a/SKILL.md': '---\nname: a\ndescription: x\n---\n# a\n',
        'b/SKILL.md': '---\nname: b\ndescription: x\n---\n# b\n',
      },
      message:
        'Sync skills\n\n' +
        'User-Facing-Change[a]: Added autocomplete to a\n' +
        'User-Facing-Change[b]: Renamed b helper script\n',
      date: '2026-04-01T12:00:00Z',
    });

    const a = gitMetaForSkill('a', vendorDir);
    assert.deepEqual(a.changelog, [
      { date: '2026-04-01', summary: 'Added autocomplete to a' },
    ]);

    const b = gitMetaForSkill('b', vendorDir);
    assert.deepEqual(b.changelog, [
      { date: '2026-04-01', summary: 'Renamed b helper script' },
    ]);
  } finally {
    cleanup();
  }
});

test('readSkill prefers meta.yml lastUpdated/changelog over git-derived values', () => {
  const { vendorDir, commit, cleanup } = makeGitFixture();
  try {
    commit({
      files: {
        'mine/SKILL.md': '---\nname: mine\ndescription: x\n---\n# m\n',
        'mine/meta.yml':
          'title: Mine\n' +
          'discipline: development\n' +
          'date: "2025-01-01"\n' +
          'lastUpdated: "2024-06-01"\n' +
          'changelog:\n' +
          '  - version: "1.0.0"\n' +
          '    date: "2024-06-01"\n' +
          '    summary: Manual entry\n',
      },
      message:
        'Initial\n\nUser-Facing-Change: Auto entry that should be ignored\n',
      date: '2026-04-01T12:00:00Z',
    });
    const skill = readSkill('mine', vendorDir);
    assert.equal(skill.meta.lastUpdated, '2024-06-01', 'manual lastUpdated wins');
    assert.equal(skill.meta.changelog.length, 1);
    assert.equal(skill.meta.changelog[0].summary, 'Manual entry');
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
