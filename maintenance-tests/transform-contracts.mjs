#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const sources = {
	'mediaron/alerts-dlx-bootstrap': 'src/js/blocks/bootstrap/index.js',
	'mediaron/alerts-dlx-chakra': 'src/js/blocks/chakraui/index.js',
	'mediaron/alerts-dlx-material': 'src/js/blocks/material/index.js',
	'mediaron/alerts-dlx-shoelace': 'src/js/blocks/shoelace/index.js',
};

const names = Object.keys( sources );
let directedTransforms = 0;

for ( const [ sourceName, path ] of Object.entries( sources ) ) {
	const content = fs.readFileSync( path, 'utf8' );
	assert.ok( content.includes( 'transformToAlertBlock' ), `${ sourceName } uses the shared transform helper` );

	for ( const targetName of names ) {
		if ( targetName === sourceName ) {
			continue;
		}

		assert.ok( content.includes( `'${ targetName }'` ), `${ sourceName } offers transform with ${ targetName }` );
		directedTransforms += 1;
	}
}

assert.equal( directedTransforms, 12, 'All 12 directed alert transforms are declared' );

const helper = fs.readFileSync( 'src/js/blocks/utils/alert-transform-utils.js', 'utf8' );
assert.match( helper, /\.\.\.attributes/, 'Transforms carry existing block attributes' );
assert.match( helper, /innerBlocks\s*\)/, 'Transforms carry existing inner blocks' );
assert.match( helper, /alertGroup,/, 'Transforms set the target alert group explicitly' );

console.log( 'All 12 alert transform compatibility paths are present.' );
