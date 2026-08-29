#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const sources = {
	'mediaron/alerts-dlx-bootstrap': {
		path: 'src/js/blocks/bootstrap/index.js',
		from: [ 'mediaron/alerts-dlx-chakra', 'mediaron/alerts-dlx-material', 'mediaron/alerts-dlx-shoelace' ],
		to: [ 'mediaron/alerts-dlx-material', 'mediaron/alerts-dlx-chakra', 'mediaron/alerts-dlx-shoelace' ],
		group: 'bootstrap',
		variant: 'default',
	},
	'mediaron/alerts-dlx-chakra': {
		path: 'src/js/blocks/chakraui/index.js',
		from: [ 'mediaron/alerts-dlx-material', 'mediaron/alerts-dlx-bootstrap', 'mediaron/alerts-dlx-shoelace' ],
		to: [ 'mediaron/alerts-dlx-material', 'mediaron/alerts-dlx-bootstrap', 'mediaron/alerts-dlx-shoelace' ],
		group: 'chakra',
		variant: 'subtle',
	},
	'mediaron/alerts-dlx-material': {
		path: 'src/js/blocks/material/index.js',
		from: [ 'mediaron/alerts-dlx-bootstrap', 'mediaron/alerts-dlx-chakra', 'mediaron/alerts-dlx-shoelace' ],
		to: [ 'mediaron/alerts-dlx-chakra', 'mediaron/alerts-dlx-bootstrap', 'mediaron/alerts-dlx-shoelace' ],
		group: 'material',
		variant: 'default',
	},
	'mediaron/alerts-dlx-shoelace': {
		path: 'src/js/blocks/shoelace/index.js',
		from: [ 'mediaron/alerts-dlx-chakra', 'mediaron/alerts-dlx-material', 'mediaron/alerts-dlx-bootstrap' ],
		to: [ 'mediaron/alerts-dlx-material', 'mediaron/alerts-dlx-chakra', 'mediaron/alerts-dlx-bootstrap' ],
		group: 'shoelace',
		variant: 'default',
	},
};

const utilitySource = fs.readFileSync(
	'src/js/blocks/utils/alert-transform-utils.js',
	'utf8'
);
assert.match( utilitySource, /\.\.\.attributes/, 'Transforms carry existing block attributes' );
assert.match( utilitySource, /\.\.\.overrides/, 'Transforms apply target overrides after source attributes' );
assert.match( utilitySource, /innerBlocks\s*\)/, 'Transforms carry existing InnerBlocks' );
assert.ok( utilitySource.includes( 'export function createHistoricalAlertTransforms(' ), 'Shared historical transform factory is exported' );

const executableUtility = utilitySource
	.replace( /^import .*;\n/gm, '' )
	.replace( /export function /g, 'function ' );
const loadUtility = new Function(
	'createBlock',
	'getAlertGroupForBlockName',
	`${ executableUtility }\nreturn { createHistoricalAlertTransforms };`
);
const runtime = loadUtility(
	( name, attributes, innerBlocks ) => ( { name, attributes, innerBlocks } ),
	( name ) => sources[ name ]?.group || ''
);

const directedPaths = new Set();
for ( const [ sourceName, expected ] of Object.entries( sources ) ) {
	const registration = fs.readFileSync( expected.path, 'utf8' );
	assert.ok( registration.includes( 'createHistoricalAlertTransforms' ), `${ sourceName } uses the shared transform factory` );
	assert.ok( registration.includes( 'metadata.name' ), `${ sourceName } binds transforms to registered metadata` );
	assert.ok( ! registration.includes( 'transformToAlertBlock' ), `${ sourceName } has no repeated transform table` );

	const transforms = runtime.createHistoricalAlertTransforms( sourceName );
	assert.deepEqual( transforms.from.map( ( item ) => item.blocks[ 0 ] ), expected.from, `${ sourceName } preserves from order` );
	assert.deepEqual( transforms.to.map( ( item ) => item.blocks[ 0 ] ), expected.to, `${ sourceName } preserves to order` );

	for ( const descriptor of transforms.to ) {
		const targetName = descriptor.blocks[ 0 ];
		directedPaths.add( `${ sourceName }->${ targetName }` );
		const attributes = {
			alertTitle: 'Preserved title',
			alertType: 'warning',
			className: 'source-class',
			uniqueId: 'source-id',
			variant: 'source-variant',
		};
		const innerBlocks = [ { name: 'core/paragraph' } ];
		const result = descriptor.transform( attributes, innerBlocks );
		assert.equal( result.name, targetName, `${ sourceName } transforms to ${ targetName }` );
		assert.equal( result.attributes.alertTitle, 'Preserved title', 'Transform preserves ordinary attributes' );
		assert.equal( result.attributes.uniqueId, 'source-id', 'Factory preserves historical ID cloning behavior' );
		assert.equal( result.attributes.alertGroup, sources[ targetName ].group, 'Transform applies target group' );
		assert.equal( result.attributes.alertType, 'success', 'Transform applies historical success type' );
		assert.equal( result.attributes.variant, sources[ targetName ].variant, 'Transform applies target variant' );
		assert.equal( result.attributes.className, 'is-style-success', 'Transform applies historical style class' );
		assert.equal( result.innerBlocks, innerBlocks, 'Transform carries InnerBlocks unchanged' );
	}
}

assert.equal( directedPaths.size, 12, 'All 12 directed historical alert transforms are generated' );
console.log( 'All 12 historical alert transform compatibility paths are generated and behavior-bound.' );
