#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const options = fs.readFileSync( 'php/Options.php', 'utf8' );

assert.match( options, /get_option\(\s*'alerts_dlx'/, 'Stored settings use alerts_dlx option key' );
assert.match( options, /'headline_style'\s*=>\s*'h2'/, 'Headline style default stays h2' );
assert.match( options, /'headline_custom_classes'\s*=>\s*''/, 'Custom headline classes default stays empty' );
assert.match( options, /'headline_force_size'\s*=>\s*false/, 'Forced headline size remains disabled by default' );
assert.match(
	options,
	/'enabled_block_styles'\s*=>\s*array\(\s*'bootstrap',\s*'chakra',\s*'material',\s*'shoelace'\s*\)/s,
	'All four historical alert styles remain enabled by default'
);
assert.match( options, /'debug_mode'\s*=>\s*false/, 'Debug mode remains disabled by default' );
assert.match( options, /'options_version'\s*=>\s*'1\.0\.0'/, 'Stored settings schema version remains 1.0.0' );

console.log( 'Stored settings compatibility checks passed.' );
