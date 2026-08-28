#!/usr/bin/env node

/**
 * Confirm the narrow RC1 developer-install compatibility bridge.
 *
 * RC1 deliberately does not modernize @wordpress/components. That package is
 * bundled into the plugin's admin CSS, so changing it would also change the
 * user-visible admin interface. Instead, RC1 keeps the reviewed dependency
 * versions and records the repository-local npm peer-resolution compatibility
 * setting that makes install and npm ci reproducible.
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
  '^19.13.0',
  'RC1 does not silently change the WordPress Components line or bundled admin styles'
);
assert.equal(
  npmrc,
  'legacy-peer-deps=true\n',
  'RC1 npm compatibility config is explicit, local, and contains no unrelated npm settings'
);
assert.equal(manifest.overrides, undefined, 'RC1 does not force undeclared peer compatibility through package overrides');

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

console.log('\nRC1 keeps the reviewed dependency versions and uses the explicit repository-local npm compatibility bridge.');
