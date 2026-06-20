const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// End-to-end link checks over the BUILT site. These guard against the broken
// paths reported in production:
//   - double-slash links  (e.g. /prompt_library//project-configs)
//   - internal links missing the GitHub Pages baseUrl prefix
//     (e.g. /development/resources/ instead of /prompt_library/development/resources/)
//   - links that point at pages/files that don't exist (dead internal links)
//
// The site is built with GITHUB_ACTIONS=1 (so baseUrl = /prompt_library), which
// mirrors the deployed environment where these bugs appear. We build into the
// real `_site` output because the zip + search-index after-hooks write there
// directly (they don't honor a custom --output), so everything stays co-located.

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, '_site');
const BASE_URL = '/prompt_library';

let built = false;
let buildError = null;

// npm is `npm.cmd` on Windows; pick the right executable so `npm test` works cross-platform.
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function build() {
  if (built) return;
  try {
    // Start from a clean output so stale artifacts from removed pages (Eleventy
    // does not prune _site between builds) can't mask or fake link results.
    fs.rmSync(SITE, { recursive: true, force: true });
    execFileSync(NPM, ['run', 'build'], {
      cwd: ROOT,
      env: { ...process.env, GITHUB_ACTIONS: '1' },
      stdio: 'pipe',
    });
    built = true;
  } catch (e) {
    // With stdio:'pipe' the build output is captured on the error — surface it so
    // CI failures are actionable instead of just "Command failed".
    const details = [e.message, e.stdout && e.stdout.toString(), e.stderr && e.stderr.toString()]
      .filter(Boolean).join('\n');
    buildError = new Error(details);
  }
}

// Guard used by every link test: fail fast with the build error instead of
// letting collectLinks() throw confusing secondary errors on a missing _site.
function ensureBuilt() {
  build();
  assert.equal(buildError, null, `Eleventy build failed:\n${buildError && buildError.message}`);
}

function htmlFiles(dir) {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.html')) out.push(full);
    }
  })(dir);
  return out;
}

// Resolve a site-absolute path (baseUrl already stripped) to a file in _site.
function resolvesToFile(sitePath) {
  const clean = sitePath.split('#')[0].split('?')[0];
  let candidates;
  if (clean.endsWith('/')) candidates = [clean + 'index.html'];
  else if (path.extname(clean)) candidates = [clean];
  else candidates = [clean + '.html', clean + '/index.html'];
  return candidates.some((c) => fs.existsSync(path.join(SITE, '.' + c)));
}

let _links = null;
function collectLinks() {
  if (_links) return _links;
  const linkRe = /(?:href|src)="([^"]*)"/g;
  const links = [];
  for (const file of htmlFiles(SITE)) {
    const rel = path.relative(SITE, file);
    const html = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = linkRe.exec(html)) !== null) links.push({ file: rel, value: m[1] });
  }
  _links = links;
  return links;
}

test('site builds for link checking', () => {
  ensureBuilt();
  assert.ok(fs.existsSync(path.join(SITE, 'index.html')), '_site/index.html should exist after build');
});

test('no internal link contains a double slash', () => {
  ensureBuilt();
  const offenders = collectLinks().filter(({ value }) =>
    value.startsWith('/') && !value.startsWith('//') && value.includes('//')
  );
  assert.deepEqual(
    offenders, [],
    `Double-slash links found:\n${offenders.map((o) => `  ${o.file}: ${o.value}`).join('\n')}`
  );
});

test('internal links that resolve to a real page carry the baseUrl prefix', () => {
  ensureBuilt();
  // A root-relative link that does NOT start with baseUrl but DOES resolve to a
  // built file is a missing-prefix bug. Content examples (e.g. /category) don't
  // resolve, so they're correctly ignored.
  const offenders = collectLinks().filter(({ value }) =>
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.startsWith(BASE_URL + '/') &&
    value !== BASE_URL &&
    resolvesToFile(value)
  );
  assert.deepEqual(
    offenders, [],
    `Internal links missing the "${BASE_URL}" prefix:\n${offenders.map((o) => `  ${o.file}: ${o.value}`).join('\n')}`
  );
});

test('baseUrl-prefixed internal links point at real files (no dead links)', () => {
  ensureBuilt();
  const offenders = collectLinks().filter(({ value }) => {
    if (!value.startsWith(BASE_URL + '/') && value !== BASE_URL) return false;
    const sitePath = value.slice(BASE_URL.length) || '/';
    return !resolvesToFile(sitePath);
  });
  assert.deepEqual(
    offenders, [],
    `Dead internal links (target not found in build):\n${offenders.map((o) => `  ${o.file}: ${o.value}`).join('\n')}`
  );
});
