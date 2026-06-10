#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const nextVersion = process.argv[2];

if (!nextVersion) {
  console.error('Missing release version argument.');
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, '..');

execFileSync(
  'npm',
  ['version', '--no-git-tag-version', '--allow-same-version', nextVersion],
  {
    cwd: projectRoot,
    stdio: 'inherit'
  }
);

const packageJson = JSON.parse(
  readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
);
const packageLockJson = JSON.parse(
  readFileSync(path.join(projectRoot, 'package-lock.json'), 'utf8')
);

if (packageJson.version !== nextVersion) {
  console.error(
    `package.json version mismatch: expected ${nextVersion}, got ${packageJson.version}`
  );
  process.exit(1);
}

if (packageLockJson.version !== nextVersion) {
  console.error(
    `package-lock.json version mismatch: expected ${nextVersion}, got ${packageLockJson.version}`
  );
  process.exit(1);
}

if (
  packageLockJson.packages &&
  packageLockJson.packages[''] &&
  packageLockJson.packages[''].version !== nextVersion
) {
  console.error(
    `package-lock.json root package version mismatch: expected ${nextVersion}, got ${packageLockJson.packages[''].version}`
  );
  process.exit(1);
}

console.log(`Prepared release version ${nextVersion}.`);
