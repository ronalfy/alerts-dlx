/**
 * Shared margin spacing amounts and targets.
 *
 * Spacious is the historical block margin (1.5rem). The other steps use the
 * same 0, 1, 2, 3, 4 ratio as the reference plugin's 0/16/32/48/64 scale.
 */

import { __ } from '@wordpress/i18n';

export const FACTORY_MARGIN_SPACING = 'spacious';
export const FACTORY_MARGIN_SPACING_TARGET = 'both';

export const MARGIN_SPACING_AMOUNTS = [
	'none',
	'compact',
	'comfortable',
	'spacious',
	'extreme',
];

export const MARGIN_SPACING_TARGETS = [ 'both', 'top', 'bottom' ];

/**
 * Normalize a margin amount onto the allowlist.
 *
 * @param {string} value Raw amount.
 * @return {string} Allowlisted amount.
 */
export function normalizeMarginSpacing( value ) {
	return MARGIN_SPACING_AMOUNTS.includes( value ) ? value : FACTORY_MARGIN_SPACING;
}

/**
 * Normalize a margin target onto the allowlist.
 *
 * @param {string} value Raw target.
 * @return {string} Allowlisted target.
 */
export function normalizeMarginSpacingTarget( value ) {
	return MARGIN_SPACING_TARGETS.includes( value ) ? value : FACTORY_MARGIN_SPACING_TARGET;
}

/**
 * Select options for the spacing amount.
 *
 * @return {Array<{value: string, label: string}>} Amount options.
 */
export function getMarginSpacingOptions() {
	return [
		{ value: 'none', label: __( 'None', 'alerts-dlx' ) },
		{ value: 'compact', label: __( 'Compact', 'alerts-dlx' ) },
		{ value: 'comfortable', label: __( 'Comfortable', 'alerts-dlx' ) },
		{ value: 'spacious', label: __( 'Spacious', 'alerts-dlx' ) },
		{ value: 'extreme', label: __( 'Extreme', 'alerts-dlx' ) },
	];
}

/**
 * Select options for which edges receive the margin.
 *
 * @return {Array<{value: string, label: string}>} Target options.
 */
export function getMarginSpacingTargetOptions() {
	return [
		{ value: 'both', label: __( 'Both', 'alerts-dlx' ) },
		{ value: 'top', label: __( 'Top', 'alerts-dlx' ) },
		{ value: 'bottom', label: __( 'Bottom', 'alerts-dlx' ) },
	];
}

/**
 * Class map for the public margin spacing contract.
 *
 * The amount class is always present. Both keeps the base top and bottom
 * margins, so it does not add a target class.
 *
 * @param {string} marginSpacing       Spacing amount.
 * @param {string} marginSpacingTarget Spacing target.
 * @return {Object<string, boolean>} Class-name map.
 */
export function getMarginSpacingClassMap( marginSpacing, marginSpacingTarget ) {
	const amount = normalizeMarginSpacing( marginSpacing );
	const target = normalizeMarginSpacingTarget( marginSpacingTarget );
	const classMap = {
		[ `alerts-dlx-margin-spacing-${ amount }` ]: true,
	};

	if ( 'both' !== target ) {
		classMap[ `alerts-dlx-margin-spacing-target-${ target }` ] = true;
	}

	return classMap;
}
