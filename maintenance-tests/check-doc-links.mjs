#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const oldRepository = 'https://github.com/ronalfy/alerts-dlx-docs';
const currentRepository = 'https://github.com/MediaRon/alertsdlx-docs';
const files = [
	'README.md',
	'readme.txt',
	'CONTRIBUTING.md',
	'ADOPTION.md',
	'AGENTS.md',
	'docs/ARCHITECTURE.md',
	'php/Functions.php',
];

let currentLinks = 0;

for ( const file of files ) {
	const content = fs.readFileSync( file, 'utf8' );
	assert.ok( ! content.includes( oldRepository ), `${ file } does not point to the retired docs repository` );
	currentLinks += content.split( currentRepository ).length - 1;
}

assert.ok( currentLinks >= files.length, 'Maintained source/docs point to the current docs repository' );

console.log( `Documentation link check passed. Current repository references found: ${ currentLinks }.` );
