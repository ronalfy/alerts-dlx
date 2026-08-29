#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const grunt = fs.readFileSync( 'Gruntfile.js', 'utf8' );

for ( const expected of [
	'alerts-dlx.php',
	'readme.txt',
	'php/**',
	'lib/**',
	'dist/**',
	'build/**',
	'assets/**',
] ) {
	assert.ok( grunt.includes( expected ), `Release package includes ${ expected }` );
}

assert.match( grunt, /archive:\s*['"]alerts-dlx\.zip['"]/, 'Release package keeps the alerts-dlx.zip archive name' );

const rootDestinations = grunt.match(/dest:\s*['"]\/['"]/g) ?? [];
assert.equal( rootDestinations.length, 7, 'All seven release payload groups are written to the archive root' );

console.log( 'Release package contract is intact.' );
