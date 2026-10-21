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
	'secondaryButtonEnabled',
	'secondaryButtonText',
	'secondaryButtonUrl',
	'secondaryButtonHasUrl',
	'secondaryButtonTarget',
	'secondaryButtonRelNoFollow',
	'secondaryButtonRelSponsored',
	'colorSecondary',
	'colorSecondaryHover',
	'colorSecondaryText',
	'colorSecondaryTextHover',
	'maximumWidthUnit',
	'maximumWidth',
	'marginSpacing',
	'marginSpacingTarget',
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

	assert.equal( metadata.attributes.marginSpacing.default, 'spacious', `${ expectedName } defaults margin spacing to spacious` );
	assert.equal( metadata.attributes.marginSpacingTarget.default, 'both', `${ expectedName } defaults margin target to both` );
	assert.equal( metadata.attributes.colorSecondary.default, '', `${ expectedName } leaves secondary button color empty for stylesheet tokens` );
	assert.equal( metadata.attributes.colorSecondaryHover.default, '', `${ expectedName } leaves secondary button hover color empty` );
	assert.equal( metadata.attributes.colorSecondaryText.default, '', `${ expectedName } leaves secondary button text color empty` );
	assert.equal( metadata.attributes.colorSecondaryTextHover.default, '', `${ expectedName } leaves secondary button text hover color empty` );

	checked += 1;
}

const canonical = JSON.parse( fs.readFileSync( 'src/js/blocks/alert/block.json', 'utf8' ) );
assert.equal( canonical.attributes.marginSpacing.default, 'spacious', 'Canonical Alert defaults margin spacing to spacious' );
assert.equal( canonical.attributes.marginSpacingTarget.default, 'both', 'Canonical Alert defaults margin target to both' );

console.log( `Block metadata compatibility checks passed for ${ checked } alert blocks.` );
