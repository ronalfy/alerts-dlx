/**
 * Helpers for alert block transforms.
 */

import { createBlock } from '@wordpress/blocks';
import { getAlertGroupForBlockName } from './alert-style-utils';

/**
 * Create a transformed alert block with cloned attributes.
 *
 * @param {string} targetBlockName Target block name.
 * @param {Object} attributes      Source block attributes.
 * @param {Array}  innerBlocks     Source inner blocks.
 * @param {Object} overrides       Attribute overrides for the target block.
 * @return {Object}
 */
export function transformToAlertBlock(
	targetBlockName,
	attributes,
	innerBlocks,
	overrides = {}
) {
	const alertGroup = getAlertGroupForBlockName( targetBlockName );

	return createBlock(
		targetBlockName,
		{
			...attributes,
			...overrides,
			alertGroup,
		},
		innerBlocks
	);
}

const historicalAlertTransformConfig = {
	'mediaron/alerts-dlx-bootstrap': {
		from: [
			'mediaron/alerts-dlx-chakra',
			'mediaron/alerts-dlx-material',
			'mediaron/alerts-dlx-shoelace',
		],
		to: [
			'mediaron/alerts-dlx-material',
			'mediaron/alerts-dlx-chakra',
			'mediaron/alerts-dlx-shoelace',
		],
		variant: 'default',
	},
	'mediaron/alerts-dlx-chakra': {
		from: [
			'mediaron/alerts-dlx-material',
			'mediaron/alerts-dlx-bootstrap',
			'mediaron/alerts-dlx-shoelace',
		],
		to: [
			'mediaron/alerts-dlx-material',
			'mediaron/alerts-dlx-bootstrap',
			'mediaron/alerts-dlx-shoelace',
		],
		variant: 'subtle',
	},
	'mediaron/alerts-dlx-material': {
		from: [
			'mediaron/alerts-dlx-bootstrap',
			'mediaron/alerts-dlx-chakra',
			'mediaron/alerts-dlx-shoelace',
		],
		to: [
			'mediaron/alerts-dlx-chakra',
			'mediaron/alerts-dlx-bootstrap',
			'mediaron/alerts-dlx-shoelace',
		],
		variant: 'default',
	},
	'mediaron/alerts-dlx-shoelace': {
		from: [
			'mediaron/alerts-dlx-chakra',
			'mediaron/alerts-dlx-material',
			'mediaron/alerts-dlx-bootstrap',
		],
		to: [
			'mediaron/alerts-dlx-material',
			'mediaron/alerts-dlx-chakra',
			'mediaron/alerts-dlx-bootstrap',
		],
		variant: 'default',
	},
};

function getHistoricalTransformOverrides( targetBlockName ) {
	const target = historicalAlertTransformConfig[ targetBlockName ];
	if ( ! target ) {
		throw new Error( `Unknown historical Alerts DLX block: ${ targetBlockName }` );
	}

	return {
		alertType: 'success',
		variant: target.variant,
		className: 'is-style-success',
	};
}

function createHistoricalTransform( sourceBlockName, targetBlockName ) {
	return {
		type: 'block',
		blocks: [ sourceBlockName ],
		transform: ( attributes, innerBlocks ) => transformToAlertBlock(
			targetBlockName,
			attributes,
			innerBlocks,
			getHistoricalTransformOverrides( targetBlockName )
		),
	};
}

/**
 * Build the existing from/to transform lists for one historical alert block.
 *
 * @param {string} currentBlockName Registered historical block name.
 * @return {Object} WordPress block transform settings.
 */
export function createHistoricalAlertTransforms( currentBlockName ) {
	const current = historicalAlertTransformConfig[ currentBlockName ];
	if ( ! current ) {
		throw new Error( `Unknown historical Alerts DLX block: ${ currentBlockName }` );
	}

	return {
		from: current.from.map( ( sourceBlockName ) =>
			createHistoricalTransform( sourceBlockName, currentBlockName )
		),
		to: current.to.map( ( targetBlockName ) =>
			createHistoricalTransform( targetBlockName, targetBlockName )
		),
	};
}
