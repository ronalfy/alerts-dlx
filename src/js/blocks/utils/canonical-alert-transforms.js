/**
 * Explicit, lossless transforms for the canonical Alert block.
 */

import { createBlock } from '@wordpress/blocks';

const canonicalAlertBlock = 'mediaron/alerts-dlx-alert';

const historicalTargets = [
	{
		blockName: 'mediaron/alerts-dlx-bootstrap',
		alertGroup: 'bootstrap',
		supportedAlertTypes: [
			'primary', 'secondary', 'success', 'danger', 'warning',
			'info', 'light', 'dark', 'custom',
		],
		supportedVariants: [ 'default', 'centered' ],
		unsupportedCanonicalAttributes: [ 'iconAppearance' ],
	},
	{
		blockName: 'mediaron/alerts-dlx-chakra',
		alertGroup: 'chakra',
		supportedAlertTypes: [ 'success', 'info', 'warning', 'error', 'custom' ],
		supportedVariants: [ 'subtle', 'solid', 'left-accent', 'top-accent', 'centered' ],
		unsupportedCanonicalAttributes: [
			'isBlockAdminOnly',
			'adminOnlyBlockExpiresEnabled',
			'adminOnlyBlockExpires',
			'iconAppearance',
		],
	},
	{
		blockName: 'mediaron/alerts-dlx-material',
		alertGroup: 'material',
		supportedAlertTypes: [ 'success', 'info', 'warning', 'error', 'custom' ],
		supportedVariants: [ 'default', 'outlined', 'filled', 'centered' ],
		unsupportedCanonicalAttributes: [
			'isBlockAdminOnly',
			'adminOnlyBlockExpiresEnabled',
			'adminOnlyBlockExpires',
			'iconAppearance',
		],
	},
	{
		blockName: 'mediaron/alerts-dlx-shoelace',
		alertGroup: 'shoelace',
		supportedAlertTypes: [ 'primary', 'success', 'neutral', 'warning', 'danger', 'custom' ],
		supportedVariants: [ 'top-accent', 'left-accent', 'solid', 'centered' ],
		unsupportedCanonicalAttributes: [
			'isBlockAdminOnly',
			'adminOnlyBlockExpiresEnabled',
			'adminOnlyBlockExpires',
		],
	},
];

const recoverableDefaults = {
	iconAppearance: 'rounded',
	isBlockAdminOnly: false,
	adminOnlyBlockExpiresEnabled: false,
	adminOnlyBlockExpires: null,
};

/**
 * Give converted historical alerts an honest canonical purpose.
 *
 * @param {Object} attributes Source attributes.
 * @return {string} A recoverable canonical purpose.
 */
export function inferCanonicalAlertPurpose( attributes ) {
	if ( attributes.buttonEnabled === true ) {
		return 'cta';
	}

	switch ( attributes.alertType ) {
		case 'success':
		case 'info':
		case 'warning':
			return attributes.alertType;
		case 'danger':
		case 'error':
			return 'error';
		case 'primary':
			return 'announcement';
		default:
			return 'custom';
	}
}

function getHistoricalTarget( blockName ) {
	const target = historicalTargets.find( ( item ) => item.blockName === blockName );
	if ( ! target ) {
		throw new Error( `Unknown historical Alerts DLX block: ${ blockName }` );
	}
	return target;
}

function keepsRecoverableDefaults( target, attributes ) {
	return target.unsupportedCanonicalAttributes.every( ( attribute ) =>
		attributes[ attribute ] === undefined ||
		attributes[ attribute ] === recoverableDefaults[ attribute ]
	);
}

/**
 * Check whether a canonical Alert can become one historical block without
 * discarding meaning or a target-specific value.
 *
 * @param {string} targetBlockName Historical target block.
 * @param {Object} attributes      Canonical Alert attributes.
 * @return {boolean} Whether the transform is lossless and may be offered.
 */
export function isCanonicalAlertLosslessForHistoricalBlock(
	targetBlockName,
	attributes
) {
	const target = getHistoricalTarget( targetBlockName );

	return attributes.alertGroup === target.alertGroup &&
		target.supportedAlertTypes.includes( attributes.alertType ) &&
		target.supportedVariants.includes( attributes.variant ) &&
		attributes.purpose === inferCanonicalAlertPurpose( attributes ) &&
		keepsRecoverableDefaults( target, attributes );
}

function transformHistoricalToCanonical( target, attributes, innerBlocks ) {
	return createBlock(
		canonicalAlertBlock,
		{
			...attributes,
			purpose: inferCanonicalAlertPurpose( attributes ),
			alertGroup: target.alertGroup,
		},
		innerBlocks
	);
}

function transformCanonicalToHistorical( target, attributes, innerBlocks ) {
	if ( ! isCanonicalAlertLosslessForHistoricalBlock( target.blockName, attributes ) ) {
		throw new Error( `Refusing lossy canonical Alert transform to ${ target.blockName }.` );
	}

	const historicalAttributes = { ...attributes };
	delete historicalAttributes.purpose;
	for ( const attribute of target.unsupportedCanonicalAttributes ) {
		delete historicalAttributes[ attribute ];
	}

	return createBlock(
		target.blockName,
		{ ...historicalAttributes, alertGroup: target.alertGroup },
		innerBlocks
	);
}

/**
 * Register four explicit historical-to-canonical paths and four guarded
 * canonical-to-historical paths on the canonical Alert only.
 *
 * @return {Object} WordPress block transform settings.
 */
export function createCanonicalAlertTransforms() {
	return {
		from: historicalTargets.map( ( target ) => ( {
			type: 'block',
			blocks: [ target.blockName ],
			transform: ( attributes, innerBlocks ) =>
				transformHistoricalToCanonical( target, attributes, innerBlocks ),
		} ) ),
		to: historicalTargets.map( ( target ) => ( {
			type: 'block',
			blocks: [ target.blockName ],
			isMatch: ( attributes ) =>
				isCanonicalAlertLosslessForHistoricalBlock( target.blockName, attributes ),
			transform: ( attributes, innerBlocks ) =>
				transformCanonicalToHistorical( target, attributes, innerBlocks ),
		} ) ),
	};
}
