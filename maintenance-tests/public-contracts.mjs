#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const mainPlugin = fs.readFileSync( 'alerts-dlx.php', 'utf8' );
const readme = fs.readFileSync( 'readme.txt', 'utf8' );
const blocks = fs.readFileSync( 'php/Blocks.php', 'utf8' );
const options = fs.readFileSync( 'php/Options.php', 'utf8' );
const customColors = fs.readFileSync( 'src/js/blocks/plugins/custom-colors.js', 'utf8' );

assert.match( mainPlugin, /Version:\s*2\.4\.1\b/, 'Plugin version remains 2.4.1 during RC validation' );
assert.match( mainPlugin, /define\(\s*'ALERTS_DLX_VERSION',\s*'2\.4\.1'\s*\)/, 'Runtime version constant remains 2.4.1' );
assert.match( readme, /^Stable tag:\s*2\.4\.1\s*$/m, 'WordPress.org Stable tag remains 2.4.1' );

assert.match( blocks, /add_shortcode\(\s*'alertsdlx'/, 'The [alertsdlx] shortcode remains registered' );
assert.match( options, /get_option\(\s*'alerts_dlx'/, 'Stored settings keep the alerts_dlx option key' );

for ( const blockName of [
	'mediaron/alerts-dlx-bootstrap',
	'mediaron/alerts-dlx-chakra',
	'mediaron/alerts-dlx-material',
	'mediaron/alerts-dlx-shoelace',
] ) {
	assert.ok( blocks.includes( blockName ), `Runtime still recognizes ${ blockName }` );
}

assert.match(
	customColors,
	/const alertsDLXBlockNamespaces = \[[\s\S]*?"mediaron\/alerts-dlx-alert"/,
	'Canonical Alert remains opted into custom-color editor styling'
);

console.log( 'Public compatibility contracts remain present.' );
