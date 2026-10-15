#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const mainPlugin = fs.readFileSync('alerts-dlx.php', 'utf8');
const readme = fs.readFileSync('readme.txt', 'utf8');
const blocks = fs.readFileSync('php/Blocks.php', 'utf8');
const options = fs.readFileSync('php/Options.php', 'utf8');

assert.match(blocks, /add_shortcode\(\s*'alertsdlx'/, 'The [alertsdlx] shortcode remains registered');
assert.match(options, /get_option\(\s*'alerts_dlx'/, 'Stored settings keep the alerts_dlx option key');

for (const blockName of [
	'mediaron/alerts-dlx-bootstrap',
	'mediaron/alerts-dlx-chakra',
	'mediaron/alerts-dlx-material',
	'mediaron/alerts-dlx-shoelace',
]) {
	assert.ok(blocks.includes(blockName), `Runtime still recognizes ${blockName}`);
}


console.log('Public compatibility contracts remain present.');
