/**
 * Alert block element visibility toggle helpers for toolbar controls.
 */

import { __ } from '@wordpress/i18n';

/**
 * Toolbar toggle configuration for alert element visibility.
 */
export const ALERT_ELEMENT_TOGGLES = [
	{
		attribute: 'iconEnabled',
		label: __( 'Icon', 'alerts-dlx' ),
	},
	{
		attribute: 'titleEnabled',
		label: __( 'Title', 'alerts-dlx' ),
	},
	{
		attribute: 'descriptionEnabled',
		label: __( 'Description', 'alerts-dlx' ),
	},
	{
		attribute: 'buttonEnabled',
		label: __( 'Button', 'alerts-dlx' ),
	},
	{
		attribute: 'closeButtonEnabled',
		label: __( 'Close Button', 'alerts-dlx' ),
	},
];

/**
 * Toggle an alert element visibility attribute.
 *
 * @param {string}   attribute      Attribute name to toggle.
 * @param {boolean}  currentValue   Current attribute value.
 * @param {Function} setAttributes  Set attributes callback.
 */
export function toggleAlertElement( attribute, currentValue, setAttributes ) {
	setAttributes( { [ attribute ]: ! currentValue } );
}
