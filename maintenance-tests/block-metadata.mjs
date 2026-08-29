#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const blocks = [
	[ 'bootstrap', 'mediaron/alerts-dlx-bootstrap', 'bootstrap' ],
	[ 'chakraui', 'mediaron/alerts-dlx-chakra', 'chakra' ],
	[ 'material', 'mediaron/alerts-dlx-material', 'material' ],
	[ 'shoelace', 'mediaron/alerts-dlx-shoelace', 'shoelace' ],
];

const sharedAttributes = [
	'align',
	'alertType',
	'alertTitle',
	'alertDescription',
	'descriptionEnabled',
	'titleEnabled',
	'buttonEnabled',
	'iconEnabled',
	'buttonText',
	'buttonUrl',
	'buttonHasUrl',
	'buttonTarget',
	'buttonRelNoFollow',
	'buttonRelSponsored',
	'maximumWidthUnit',
	'maximumWidth',
	'baseFontSize',
	'icon',
	'enableCustomFonts',
	'variant',
	'mode',
	'enableDropShadow',
	'iconVerticalAlignment',
	'uniqueId',
	'alertGroup',
	'closeButtonEnabled',
	'closeButtonExpiration',
	'innerBlocksEnabled',
	'isBlockEditorialOnly',
	'isBlockReadOnly',
	'iconSource',
	'imageUrl',
	'imageId',
];

let checked = 0;

for ( const [ directory, expectedName, expectedGroup ] of blocks ) {
	const path = `src/js/blocks/${ directory }/block.json`;
	const metadata = JSON.parse( fs.readFileSync( path, 'utf8' ) );

	assert.equal( metadata.name, expectedName, `${ directory } keeps its public block name` );
	assert.equal( metadata.apiVersion, 3, `${ expectedName } remains on Block API v3` );
	assert.equal( metadata.attributes?.alertGroup?.default, expectedGroup, `${ expectedName } keeps its alert group` );
	assert.equal( metadata.attributes?.uniqueId?.type, 'string', `${ expectedName } keeps persisted uniqueId` );
	assert.equal( metadata.attributes?.closeButtonEnabled?.type, 'boolean', `${ expectedName } keeps dismiss enabled state` );
	assert.equal( metadata.attributes?.closeButtonExpiration?.type, 'number', `${ expectedName } keeps dismiss expiration` );

	for ( const attribute of sharedAttributes ) {
		assert.ok( metadata.attributes?.[ attribute ], `${ expectedName } keeps stored attribute ${ attribute }` );
	}

	checked += 1;
}

console.log( `Block metadata compatibility checks passed for ${ checked } alert blocks.` );
