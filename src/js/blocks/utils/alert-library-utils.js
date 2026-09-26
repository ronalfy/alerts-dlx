/**
 * Block editor helpers for the AlertsDLX library (global styles and snapshots).
 */

import { buildAlertStyleClassName } from './alert-style-utils';

/**
 * CamelCase block attribute keys owned by a library global style.
 */
export const GLOBAL_STYLE_BLOCK_KEYS = [
	'alertGroup',
	'alertType',
	'variant',
	'mode',
	'maximumWidth',
	'maximumWidthUnit',
	'baseFontSize',
	'iconSource',
	'iconAppearance',
	'iconVerticalAlignment',
	'icon',
	'imageUrl',
	'imageId',
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

/**
 * Snapshot allowlist as camelCase block attributes (appearance plus snapshot-only).
 */
export const SNAPSHOT_BLOCK_KEYS = [
	...GLOBAL_STYLE_BLOCK_KEYS.filter( ( key ) => 'className' !== key ),
	'align',
	'titleEnabled',
	'descriptionEnabled',
	'buttonEnabled',
	'closeButtonEnabled',
	'closeButtonExpiration',
	'className',
];

const SNAKE_TO_CAMEL = {
	alert_group: 'alertGroup',
	alert_type: 'alertType',
	variant: 'variant',
	mode: 'mode',
	align: 'align',
	maximum_width: 'maximumWidth',
	maximum_width_unit: 'maximumWidthUnit',
	base_font_size: 'baseFontSize',
	icon_source: 'iconSource',
	icon_appearance: 'iconAppearance',
	icon_vertical_alignment: 'iconVerticalAlignment',
	icon: 'icon',
	image_url: 'imageUrl',
	image_id: 'imageId',
	color_primary: 'colorPrimary',
	color_border: 'colorBorder',
	color_accent: 'colorAccent',
	color_alt: 'colorAlt',
	color_alt_hover: 'colorAltHover',
	color_alt_text: 'colorAltText',
	color_alt_text_hover: 'colorAltTextHover',
	color_bold: 'colorBold',
	color_light: 'colorLight',
	title_enabled: 'titleEnabled',
	description_enabled: 'descriptionEnabled',
	button_enabled: 'buttonEnabled',
	close_button_enabled: 'closeButtonEnabled',
	close_button_expiration: 'closeButtonExpiration',
};

/**
 * Read localized library payload from the block editor boot object.
 *
 * @return {Array} Library items.
 */
export function getLocalizedLibraryItems() {
	if ( typeof globalThis === 'undefined' || ! globalThis.alertsDlxBlock ) {
		return [];
	}
	const items = globalThis.alertsDlxBlock.libraryItems;
	return Array.isArray( items ) ? items : [];
}

/**
 * Whether the current user can manage the Styles & Snapshots admin UI.
 *
 * @return {boolean}
 */
export function canManageLibrary() {
	if ( typeof globalThis === 'undefined' || ! globalThis.alertsDlxBlock ) {
		return false;
	}
	return [ true, 1, '1' ].includes( globalThis.alertsDlxBlock.canManageLibrary );
}

/**
 * Map snake_case library config onto camelCase block attributes.
 *
 * @param {Object}   config           Library config.
 * @param {string[]} allowlist        CamelCase keys to keep.
 * @param {string}   existingClassName Optional className to preserve custom classes.
 * @return {Object} Block attribute patch.
 */
export function libraryConfigToBlockAttributes(
	config = {},
	allowlist = GLOBAL_STYLE_BLOCK_KEYS,
	existingClassName = ''
) {
	const allowed = new Set( allowlist );
	const attributes = {};

	for ( const [ snake, camel ] of Object.entries( SNAKE_TO_CAMEL ) ) {
		if ( ! Object.prototype.hasOwnProperty.call( config, snake ) ) {
			continue;
		}
		if ( ! allowed.has( camel ) ) {
			continue;
		}
		attributes[ camel ] = config[ snake ];
	}

	if (
		Object.prototype.hasOwnProperty.call( attributes, 'alertType' ) &&
		allowed.has( 'className' )
	) {
		attributes.className = buildAlertStyleClassName(
			existingClassName || '',
			attributes.alertType
		);
	}

	return attributes;
}

/**
 * Find a localized library item by id and kind.
 *
 * @param {number} id   Post ID.
 * @param {string} kind Library kind.
 * @return {Object|null}
 */
export function findLibraryItem( id, kind ) {
	const numericId = Number( id ) || 0;
	if ( ! numericId ) {
		return null;
	}
	return (
		getLocalizedLibraryItems().find(
			( item ) =>
				item &&
				Number( item.id ) === numericId &&
				item.kind === kind &&
				item.config &&
				typeof item.config === 'object'
		) || null
	);
}

/**
 * Resolve appearance attributes from an attached global style.
 *
 * @param {number} globalStyleId Stored block reference.
 * @return {Object} Appearance attribute patch (empty when unusable).
 */
export function resolveGlobalStyleAttributes( globalStyleId, existingClassName = '' ) {
	const item = findLibraryItem( globalStyleId, 'global_style' );
	if ( ! item ) {
		return {};
	}
	return libraryConfigToBlockAttributes(
		item.config,
		GLOBAL_STYLE_BLOCK_KEYS,
		existingClassName
	);
}

/**
 * Merge a global style over block attributes for editor preview.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Attributes with resolved appearance when linked.
 */
export function mergeGlobalStyleIntoAttributes( attributes = {} ) {
	const styleAttributes = resolveGlobalStyleAttributes(
		attributes.globalStyleId,
		attributes.className || ''
	);
	if ( ! Object.keys( styleAttributes ).length ) {
		return attributes;
	}
	return {
		...attributes,
		...styleAttributes,
	};
}

/**
 * Build the attribute patch written when applying a snapshot.
 *
 * Clears any linked global style so the snapshot copy wins.
 *
 * @param {Object} config            Snapshot library config.
 * @param {string} existingClassName Current block className.
 * @return {Object}
 */
export function buildSnapshotApplyAttributes( config = {}, existingClassName = '' ) {
	return {
		...libraryConfigToBlockAttributes( config, SNAPSHOT_BLOCK_KEYS, existingClassName ),
		globalStyleId: 0,
	};
}

/**
 * Appearance keys copied onto the block when detaching a global style.
 *
 * None and Detach both copy resolved appearance then clear the id so the
 * alert does not visually jump after the link is removed.
 *
 * @param {Object} attributes Current (possibly resolved) attributes.
 * @return {Object}
 */
export function buildDetachGlobalStyleAttributes( attributes = {} ) {
	const patch = { globalStyleId: 0 };
	for ( const key of GLOBAL_STYLE_BLOCK_KEYS ) {
		if ( Object.prototype.hasOwnProperty.call( attributes, key ) ) {
			patch[ key ] = attributes[ key ];
		}
	}
	return patch;
}

/**
 * Guard setAttributes while a global style is attached.
 *
 * @param {Object}   attributes    Current stored or merged attributes.
 * @param {Function} setAttributes Block setter.
 * @return {Function} Guarded setter.
 */
export function createGuardedLibrarySetAttributes( attributes, setAttributes ) {
	return ( updates = {} ) => {
		if ( ! updates || typeof updates !== 'object' ) {
			return;
		}

		const unlocking =
			Object.prototype.hasOwnProperty.call( updates, 'globalStyleId' ) &&
			! Number( updates.globalStyleId );

		const attaching =
			Object.prototype.hasOwnProperty.call( updates, 'globalStyleId' ) &&
			Number( updates.globalStyleId ) > 0;

		const currentlyLocked = Number( attributes.globalStyleId ) > 0;

		// Selecting another global style stores the reference only.
		if ( attaching ) {
			setAttributes( { globalStyleId: Number( updates.globalStyleId ) } );
			return;
		}

		// Detach / snapshot apply may copy appearance while clearing the id.
		if ( unlocking || ! currentlyLocked ) {
			setAttributes( updates );
			return;
		}

		const filtered = { ...updates };
		for ( const key of GLOBAL_STYLE_BLOCK_KEYS ) {
			delete filtered[ key ];
		}
		if ( Object.keys( filtered ).length ) {
			setAttributes( filtered );
		}
	};
}
