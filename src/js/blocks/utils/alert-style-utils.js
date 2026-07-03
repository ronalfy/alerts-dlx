/**
 * Alert block style helpers for toolbar style picker.
 */

import { useEffect } from '@wordpress/element';
import classnames from 'classnames';
import { getBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { openAlertParentInspectorTab } from './alert-parent-inspector';

/**
 * Map block names to their alert group slugs.
 */
export const BLOCK_ALERT_GROUPS = {
	'mediaron/alerts-dlx-bootstrap': 'bootstrap',
	'mediaron/alerts-dlx-chakra': 'chakra',
	'mediaron/alerts-dlx-material': 'material',
	'mediaron/alerts-dlx-shoelace': 'shoelace',
};

/**
 * Get the alert group slug for a block name.
 *
 * @param {string} blockName Block name.
 * @return {string|null}
 */
export function getAlertGroupForBlockName( blockName ) {
	return BLOCK_ALERT_GROUPS[ blockName ] ?? null;
}

/**
 * Parse the alert type slug from a block className.
 *
 * @param {string} className Block className attribute.
 * @return {string|null}
 */
export function parseAlertTypeFromClassName( className ) {
	if ( ! className ) {
		return null;
	}

	const styleMatch = /\bis-style-([^\s]+)/.exec( className );
	return styleMatch ? styleMatch[ 1 ] : null;
}

/**
 * Remove is-style-* classes from a className string.
 *
 * @param {string} className Block className attribute.
 * @return {string}
 */
export function stripAlertStyleClasses( className ) {
	return ( className || '' )
		.replace( /\bis-style-\S+/g, '' )
		.trim()
		.replace( /\s+/g, ' ' );
}

/**
 * Build a className string with a single is-style-* class.
 *
 * @param {string} className  Block className attribute.
 * @param {string} styleName  Alert style slug.
 * @return {string}
 */
export function buildAlertStyleClassName( className, styleName ) {
	const trimmedClassName = stripAlertStyleClasses( className );

	return trimmedClassName
		? `${ trimmedClassName } is-style-${ styleName }`
		: `is-style-${ styleName }`;
}

/**
 * Build the outer wrapper className for an alert block edit component.
 *
 * @param {Object} params               Parameters.
 * @param {string} params.className     Block className attribute.
 * @param {string} params.alertType     Current alert type slug.
 * @param {string} params.templateSlug  Template slug (bootstrap, chakra, etc.).
 * @param {Object} params.blockClasses  Additional block classes.
 * @return {string}
 */
export function getAlertWrapperClassName( {
	className,
	alertType,
	templateSlug,
	blockClasses = {},
} ) {
	const styleSlug = alertType || 'success';
	const normalizedClassName = buildAlertStyleClassName( className, styleSlug );

	return classnames(
		normalizedClassName,
		`alerts-dlx template-${ templateSlug }`,
		blockClasses
	);
}

/**
 * Sync alertType and className when the native block style picker changes className.
 *
 * @param {Object}   params              Parameters.
 * @param {string}   params.className    Block className attribute.
 * @param {string}   params.alertType    Current alert type slug.
 * @param {Function} params.setAttributes Set attributes callback.
 */
export function useAlertStyleSync( { className, alertType, setAttributes } ) {
	useEffect( () => {
		const styleFromClassName = parseAlertTypeFromClassName( className );

		if ( null === styleFromClassName ) {
			return;
		}

		const normalizedClassName = buildAlertStyleClassName(
			className,
			styleFromClassName
		);

		if (
			styleFromClassName === alertType &&
			normalizedClassName === ( className || '' ).trim()
		) {
			return;
		}

		setAttributes( {
			alertType: styleFromClassName,
			className: normalizedClassName,
		} );
	}, [ className ] );
}

/**
 * Read preset and custom style options from block registration.
 *
 * @param {string} blockName Block name.
 * @return {{ presets: Object[], hasCustom: boolean, customLabel: string }}
 */
export function getAlertStyleOptions( blockName ) {
	const blockStyles = getBlockType( blockName )?.styles ?? [];
	const presets = blockStyles.filter( ( style ) => style.name !== 'custom' );
	const customFromMeta = blockStyles.find( ( style ) => style.name === 'custom' );

	return {
		presets,
		hasCustom: true,
		customLabel: customFromMeta?.label ?? __( 'Custom', 'alerts-dlx' ),
	};
}

/**
 * Apply an alert style to block attributes.
 *
 * @param {Object}   params              Parameters.
 * @param {string}   params.className    Current block className.
 * @param {string}   params.styleName    Style slug to apply.
 * @param {Function} params.setAttributes Set attributes callback.
 */
export function applyAlertStyle( { className, styleName, setAttributes } ) {
	setAttributes( {
		alertType: styleName,
		className: buildAlertStyleClassName( className, styleName ),
	} );
}

/**
 * Open an alert block inspector tab.
 *
 * @param {string} clientId Block client ID.
 * @param {string} tab      Inspector tab: 'settings' or 'styles'.
 */
export function openAlertInspectorTab( clientId, tab ) {
	openAlertParentInspectorTab( clientId, tab );
}

/**
 * Get the display label for the current alert style.
 *
 * @param {string}   alertType   Current alert type slug.
 * @param {Object[]} presets    Preset style options.
 * @param {string}   customLabel Custom style label.
 * @return {string}
 */
export function getCurrentStyleLabel( alertType, presets, customLabel ) {
	if ( 'custom' === alertType ) {
		return customLabel;
	}

	const match = presets.find( ( style ) => style.name === alertType );
	return match?.label ?? alertType;
}
