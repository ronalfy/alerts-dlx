#!/usr/bin/env node

/**
 * Confirm the reviewed developer-install dependency lines and npm compatibility bridge.
 *
 * After dependency audit upgrades, the manifest pins React 18, WordPress Components 42.x,
 * and the repository-local legacy-peer-deps setting that keeps install and npm ci reproducible
 * without undeclared package overrides.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const npmrc = fs.readFileSync('.npmrc', 'utf8');

assert.equal(
  manifest.devDependencies?.react,
  '^18.3.1',
  'Project keeps the reviewed React 18 development dependency'
);
assert.equal(
  manifest.devDependencies?.['react-dom'],
  '^18.3.1',
  'Project keeps the reviewed ReactDOM 18 development dependency'
);
assert.equal(
  manifest.dependencies?.['@wordpress/components'],
  '^42.0.0',
  'Reviewed WordPress Components line matches the post-audit dependency upgrade'
);
assert.equal(
  npmrc,
  'legacy-peer-deps=true\n',
  'npm compatibility config is explicit, local, and contains no unrelated npm settings'
);
assert.equal(
  manifest.overrides,
  undefined,
  'Project does not force undeclared peer compatibility through package overrides'
);

const result = spawnSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['ls', 'react', 'react-dom', '@wordpress/components', '--depth=0'],
  { stdio: 'inherit' }
);

if (result.error) {
  console.error(`Could not run npm dependency validation: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error('\nThe reviewed top-level development dependencies are not installed as expected.');
  process.exit(result.status || 1);
}

console.log(
  '\nReviewed dependency versions and the explicit repository-local npm compatibility bridge are in place.'
);
