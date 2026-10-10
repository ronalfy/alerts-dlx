/**
 * Apply the site margin default when a block is inserted.
 *
 * Block registration stays at spacious / both so saved posts that omit the
 * attributes keep today's margin. This variation only supplies attributes for
 * a new insert. Existing default variations keep their own attributes and
 * gain the site margin only when they do not already set it.
 */

import { getBlockVariations, registerBlockVariation } from '@wordpress/blocks';

import { ALERT_BLOCK_NAMES } from '../utils/alert-block-registry';
import {
	FACTORY_MARGIN_SPACING,
	FACTORY_MARGIN_SPACING_TARGET,
	normalizeMarginSpacing,
	normalizeMarginSpacingTarget,
} from '../utils/margin-spacing';

/**
 * Read the site margin default localized for the editor.
 *
 * @return {{marginSpacing: string, marginSpacingTarget: string}} Site default.
 */
function getSiteMarginDefaults() {
	const source = ( typeof globalThis !== 'undefined' && globalThis.alertsDlxBlock ) || {};
	return {
		marginSpacing: normalizeMarginSpacing( source.marginSpacingDefault ),
		marginSpacingTarget: normalizeMarginSpacingTarget( source.marginSpacingTargetDefault ),
	};
}

const siteDefaults = getSiteMarginDefaults();
const siteMatchesFactory = siteDefaults.marginSpacing === FACTORY_MARGIN_SPACING &&
	siteDefaults.marginSpacingTarget === FACTORY_MARGIN_SPACING_TARGET;

if ( ! siteMatchesFactory ) {
	ALERT_BLOCK_NAMES.forEach( ( blockName ) => {
		const variations = getBlockVariations( blockName ) || [];
		const existingDefault = variations.find( ( variation ) => variation.isDefault );

		if ( existingDefault ) {
			existingDefault.attributes = {
				marginSpacing: siteDefaults.marginSpacing,
				marginSpacingTarget: siteDefaults.marginSpacingTarget,
				...( existingDefault.attributes || {} ),
			};
			return;
		}

		registerBlockVariation( blockName, {
			name: 'alerts-dlx-site-margin',
			isDefault: true,
			isActive: () => false,
			scope: [ 'inserter', 'block' ],
			attributes: {
				marginSpacing: siteDefaults.marginSpacing,
				marginSpacingTarget: siteDefaults.marginSpacingTarget,
			},
		} );
	} );
}
