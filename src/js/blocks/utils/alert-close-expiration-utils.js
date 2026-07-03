/**
 * Close button expiration preset helpers for toolbar controls.
 */

import { __ } from '@wordpress/i18n';

const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 60 * MINUTE_SECONDS;
const DAY_SECONDS = 24 * HOUR_SECONDS;
const WEEK_SECONDS = 7 * DAY_SECONDS;
const MONTH_SECONDS = 30 * DAY_SECONDS;

/**
 * Preset close button expiration values in seconds.
 */
export const ALERT_CLOSE_EXPIRATION_PRESETS = [
	{
		seconds: 0,
		label: __( 'Show Every Time', 'alerts-dlx' ),
	},
	{
		seconds: 5 * MINUTE_SECONDS,
		label: __( '5 Minutes', 'alerts-dlx' ),
	},
	{
		seconds: 30 * MINUTE_SECONDS,
		label: __( '30 Minutes', 'alerts-dlx' ),
	},
	{
		seconds: HOUR_SECONDS,
		label: __( '1 Hour', 'alerts-dlx' ),
	},
	{
		seconds: DAY_SECONDS,
		label: __( '1 Day', 'alerts-dlx' ),
	},
	{
		seconds: 3 * DAY_SECONDS,
		label: __( '3 Days', 'alerts-dlx' ),
	},
	{
		seconds: WEEK_SECONDS,
		label: __( '1 Week', 'alerts-dlx' ),
	},
	{
		seconds: MONTH_SECONDS,
		label: __( '1 Month', 'alerts-dlx' ),
	},
	{
		seconds: 6 * MONTH_SECONDS,
		label: __( '6 Months', 'alerts-dlx' ),
	},
];

/**
 * Apply a close button expiration preset.
 *
 * @param {number}   seconds        Expiration time in seconds.
 * @param {Function} setAttributes  Set attributes callback.
 */
export function applyCloseButtonExpiration( seconds, setAttributes ) {
	setAttributes( { closeButtonExpiration: seconds } );
}
