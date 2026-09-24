import { __ } from '@wordpress/i18n';

export const CANONICAL_PRESET_SAFE_KEYS = [
	'purpose',
	'alertGroup',
	'alertType',
	'variant',
	'mode',
	'align',
	'maximumWidthUnit',
	'maximumWidth',
	'baseFontSize',
	'icon',
	'iconEnabled',
	'iconSource',
	'iconAppearance',
	'iconVerticalAlignment',
	'imageUrl',
	'imageId',
	'descriptionEnabled',
	'titleEnabled',
	'buttonEnabled',
	'closeButtonEnabled',
	'closeButtonExpiration',
	'enableCustomFonts',
	'enableDropShadow',
	'colorPrimary',
	'colorBorder',
	'colorAccent',
	'colorAlt',
	'colorAltHover',
	'colorAltText',
	'colorAltTextHover',
	'colorBold',
	'colorLight',
	'className',
];

export const CANONICAL_PRESET_EXCLUDED_KEYS = [
	'uniqueId',
	'alertTitle',
	'alertDescription',
	'buttonText',
	'buttonUrl',
	'buttonHasUrl',
	'buttonTarget',
	'buttonRelNoFollow',
	'buttonRelSponsored',
	'innerBlocksEnabled',
	'isBlockAdminOnly',
	'adminOnlyBlockExpiresEnabled',
	'adminOnlyBlockExpires',
	'isBlockEditorialOnly',
	'isBlockReadOnly',
];

const designs = {
	bootstrap: {
		types: [ 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'custom' ],
		variants: [ 'default', 'centered' ],
		defaultType: 'success',
		defaultVariant: 'default',
	},
	chakra: {
		types: [ 'success', 'info', 'warning', 'error', 'custom' ],
		variants: [ 'subtle', 'solid', 'left-accent', 'top-accent', 'centered' ],
		defaultType: 'success',
		defaultVariant: 'subtle',
	},
	material: {
		types: [ 'success', 'info', 'warning', 'error', 'custom' ],
		variants: [ 'default', 'outlined', 'filled', 'centered' ],
		defaultType: 'success',
		defaultVariant: 'default',
	},
	shoelace: {
		types: [ 'primary', 'success', 'neutral', 'warning', 'danger', 'custom' ],
		variants: [ 'top-accent', 'left-accent', 'solid', 'centered' ],
		defaultType: 'success',
		defaultVariant: 'top-accent',
	},
};

const supportedPurposes = [
	'info',
	'success',
	'warning',
	'error',
	'tip',
	'announcement',
	'cta',
	'custom',
];

export const BUILT_IN_CANONICAL_ALERT_PRESETS = [
	{
		id: 'builtin-tip',
		name: __( 'Tip', 'alerts-dlx' ),
		description: __( 'A friendly Bootstrap information callout.', 'alerts-dlx' ),
		builtIn: true,
		attributes: {
			purpose: 'tip',
			alertGroup: 'bootstrap',
			alertType: 'info',
			variant: 'default',
			titleEnabled: true,
			descriptionEnabled: true,
			iconEnabled: true,
			buttonEnabled: false,
			closeButtonEnabled: false,
		},
	},
	{
		id: 'builtin-important',
		name: __( 'Important', 'alerts-dlx' ),
		description: __( 'A strong Chakra warning callout.', 'alerts-dlx' ),
		builtIn: true,
		attributes: {
			purpose: 'warning',
			alertGroup: 'chakra',
			alertType: 'warning',
			variant: 'solid',
			titleEnabled: true,
			descriptionEnabled: true,
			iconEnabled: true,
			buttonEnabled: false,
			closeButtonEnabled: false,
		},
	},
	{
		id: 'builtin-maintenance',
		name: __( 'Maintenance notice', 'alerts-dlx' ),
		description: __( 'A dismissible Shoelace maintenance warning.', 'alerts-dlx' ),
		builtIn: true,
		attributes: {
			purpose: 'announcement',
			alertGroup: 'shoelace',
			alertType: 'warning',
			variant: 'top-accent',
			titleEnabled: true,
			descriptionEnabled: true,
			iconEnabled: true,
			buttonEnabled: false,
			closeButtonEnabled: true,
			closeButtonExpiration: 0,
		},
	},
	{
		id: 'builtin-download',
		name: __( 'Download CTA', 'alerts-dlx' ),
		description: __( 'A centered Bootstrap call to action.', 'alerts-dlx' ),
		builtIn: true,
		attributes: {
			purpose: 'cta',
			alertGroup: 'bootstrap',
			alertType: 'primary',
			variant: 'centered',
			titleEnabled: true,
			descriptionEnabled: true,
			iconEnabled: true,
			buttonEnabled: true,
			closeButtonEnabled: false,
		},
	},
	{
		id: 'builtin-form-confirmation',
		name: __( 'Form confirmation', 'alerts-dlx' ),
		description: __( 'A dismissible Material success confirmation.', 'alerts-dlx' ),
		builtIn: true,
		attributes: {
			purpose: 'success',
			alertGroup: 'material',
			alertType: 'success',
			variant: 'outlined',
			titleEnabled: true,
			descriptionEnabled: true,
			iconEnabled: true,
			buttonEnabled: false,
			closeButtonEnabled: true,
			closeButtonExpiration: 0,
		},
	},
];

function getLocalizedConfig() {
	if ( typeof globalThis === 'undefined' || ! globalThis.alertsDlxBlock ) {
		return {};
	}
	return globalThis.alertsDlxBlock;
}

/**
 * Copy only primitive allowlisted presentation/settings attributes.
 *
 * @param {Object} attributes Candidate block attributes.
 * @return {Object} Detached snapshot with no content or identity fields.
 */
export function snapshotCanonicalAlertAttributes( attributes = {} ) {
	const snapshot = {};
	for ( const key of CANONICAL_PRESET_SAFE_KEYS ) {
		if ( ! Object.prototype.hasOwnProperty.call( attributes, key ) ) {
			continue;
		}
		const value = attributes[ key ];
		if ( [ 'string', 'number', 'boolean' ].includes( typeof value ) ) {
			snapshot[ key ] = value;
		}
	}
	return normalizeCanonicalAlertPresetAttributes( snapshot );
}

/**
 * Keep localized or built-in design snapshots internally valid.
 *
 * @param {Object} attributes Allowlisted snapshot.
 * @return {Object} Normalized detached snapshot.
 */
export function normalizeCanonicalAlertPresetAttributes( attributes = {} ) {
	const snapshot = { ...attributes };
	const alertGroup = Object.prototype.hasOwnProperty.call( designs, snapshot.alertGroup )
		? snapshot.alertGroup
		: 'bootstrap';
	const design = designs[ alertGroup ];

	if ( Object.prototype.hasOwnProperty.call( snapshot, 'alertGroup' ) ) {
		snapshot.alertGroup = alertGroup;
	}
	if ( Object.prototype.hasOwnProperty.call( snapshot, 'variant' ) && ! design.variants.includes( snapshot.variant ) ) {
		snapshot.variant = design.defaultVariant;
	}
	if ( Object.prototype.hasOwnProperty.call( snapshot, 'alertType' ) && ! design.types.includes( snapshot.alertType ) ) {
		snapshot.alertType = design.defaultType;
	}
	if ( Object.prototype.hasOwnProperty.call( snapshot, 'alertType' ) ) {
		snapshot.className = `is-style-${ snapshot.alertType }`;
	}
	if ( Object.prototype.hasOwnProperty.call( snapshot, 'purpose' ) && ! supportedPurposes.includes( snapshot.purpose ) ) {
		delete snapshot.purpose;
	}
	return snapshot;
}

/**
 * Get administrator-created snapshots after the server-side sanitizer.
 *
 * @return {Array} Custom preset records.
 */
export function getCustomCanonicalAlertPresets() {
	const presets = getLocalizedConfig().canonicalPresets;
	if ( ! Array.isArray( presets ) ) {
		return [];
	}
	return presets
		.filter( ( preset ) =>
			preset &&
			typeof preset.id === 'string' &&
			preset.id.startsWith( 'custom-' ) &&
			typeof preset.name === 'string' &&
			preset.attributes &&
			typeof preset.attributes === 'object'
		)
		.slice( 0, 20 )
		.map( ( preset ) => ( {
			id: preset.id,
			name: preset.name,
			description: __( 'Site preset', 'alerts-dlx' ),
			builtIn: false,
			attributes: snapshotCanonicalAlertAttributes( preset.attributes ),
		} ) );
}

export function getAllCanonicalAlertPresets() {
	return [ ...BUILT_IN_CANONICAL_ALERT_PRESETS, ...getCustomCanonicalAlertPresets() ];
}

export function getCanonicalAlertDefaults() {
	return snapshotCanonicalAlertAttributes( getLocalizedConfig().canonicalDefaults || {} );
}

export function getCanonicalAlertPresetAdminConfig() {
	const config = getLocalizedConfig();
	return {
		canManage: [ true, 1, '1' ].includes( config.canonicalCanManagePresets ),
		nonce: typeof config.canonicalPresetNonce === 'string' ? config.canonicalPresetNonce : '',
		ajaxUrl: typeof config.ajaxUrl === 'string' ? config.ajaxUrl : '',
	};
}

/**
 * Map each goal to a type supported by the configured design.
 *
 * @param {string} purpose    Goal-first variation name.
 * @param {string} alertGroup Canonical design.
 * @return {string} Supported alert type.
 */
export function getCanonicalAlertTypeForPurpose( purpose, alertGroup ) {
	const goalTypes = {
		bootstrap: { info: 'info', success: 'success', warning: 'warning', error: 'danger', tip: 'info', announcement: 'primary', cta: 'primary' },
		chakra: { info: 'info', success: 'success', warning: 'warning', error: 'error', tip: 'info', announcement: 'info', cta: 'info' },
		material: { info: 'info', success: 'success', warning: 'warning', error: 'error', tip: 'info', announcement: 'info', cta: 'info' },
		shoelace: { info: 'neutral', success: 'success', warning: 'warning', error: 'danger', tip: 'neutral', announcement: 'primary', cta: 'primary' },
	};
	const map = goalTypes[ alertGroup ] || goalTypes.bootstrap;
	return map[ purpose ] || designs[ alertGroup ]?.defaultType || 'success';
}
