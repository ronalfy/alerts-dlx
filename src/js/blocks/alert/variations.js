import { __, sprintf } from '@wordpress/i18n';

import metadata from './block.json';
import { getCanonicalAlertTypeForPurpose } from '../utils/canonical-alert-presets';
import {
	GLOBAL_STYLE_BLOCK_KEYS,
	buildSnapshotApplyAttributes,
	getLocalizedLibraryItems,
	libraryConfigToBlockAttributes,
} from '../utils/alert-library-utils';

const GLOBAL_STYLE_INSERTER_CATEGORY = 'singular-alerts-global';

const commonAttributes = {
	alertGroup: 'bootstrap',
	variant: 'default',
	titleEnabled: true,
	descriptionEnabled: true,
	iconEnabled: true,
};

const goals = []; // empty variations for now.

/**
 * Map static public insertion choices once when the editor script loads.
 *
 * The goal list is empty for now, so this returns no inserter variations.
 * Mapping uses built-in goal types only (no site-saved preset defaults).
 *
 * @return {Array} Goal-first canonical Alert variations.
 */
export function createGoalFirstCanonicalVariations() {
	const defaultPurpose = 'success';
	const alertGroup = commonAttributes.alertGroup;

	return goals.map( ( goal ) => {
		const alertType = getCanonicalAlertTypeForPurpose( goal.name, alertGroup );
		const attributes = {
			...commonAttributes,
			purpose: goal.name,
			alertType,
			className: `is-style-${ alertType }`,
			...( goal.name === 'cta' ? { buttonEnabled: true } : {} ),
		};
		return {
			name: goal.name,
			title: goal.title,
			description: goal.description,
			icon: goal.icon,
			scope: [ 'inserter' ],
			isDefault: goal.name === defaultPurpose,
			attributes,
			...( goal.name === 'cta' ? {
				example: {
					attributes: {
						...attributes,
						alertTitle: 'Click here to learn more',
						buttonText: 'Learn More',
						descriptionEnabled: false,
					},
				},
			} : {} ),
		};
	} );
}

/**
 * Whether a localized library item is flagged for the inserter.
 *
 * @param {Object} item Library item.
 * @return {boolean}
 */
function isShownInInserter( item ) {
	return Boolean( item ) && [ true, 1, '1' ].includes( item.showInInserter );
}

/**
 * Build preview-only attributes for a library inserter variation.
 *
 * A variation `example` replaces the block.json example, so library items
 * reuse the block example sample copy. The sample copy is preview-only and
 * never becomes part of the inserted attributes.
 *
 * @param {Object} attributes Library appearance or snapshot attributes.
 * @return {Object} Example attributes with sample content.
 */
function buildLibraryExampleAttributes( attributes = {} ) {
	const sample = metadata.example?.attributes || {};
	const exampleAttributes = {
		alertTitle: sample.alertTitle,
		alertDescription: sample.alertDescription,
		titleEnabled: true,
		descriptionEnabled: true,
		...attributes,
	};

	if ( exampleAttributes.buttonEnabled ) {
		exampleAttributes.buttonText = 'Learn More';
	}

	return exampleAttributes;
}

/**
 * Readable title for a library inserter item.
 *
 * @param {Object} item Library item.
 * @return {string}
 */
function libraryItemTitle( item ) {
	return typeof item.title === 'string' && item.title.trim()
		? item.title.trim()
		: __( 'Library item', 'alerts-dlx' );
}

/**
 * Build one linked inserter variation for a flagged global style.
 *
 * The inserted block stores only globalStyleId. Appearance is resolved
 * while the style stays attached. The example is preview-only.
 *
 * @param {Object} item Library item.
 * @param {number} id   Library post ID.
 * @return {Object} Inserter variation.
 */
function createGlobalStyleInserterVariation( item, id ) {
	const title = libraryItemTitle( item );
	const config = item.config && typeof item.config === 'object' ? item.config : {};
	const previewAttributes = {
		...libraryConfigToBlockAttributes( config, GLOBAL_STYLE_BLOCK_KEYS, '' ),
		globalStyleId: id,
	};

	return {
		name: `global-style-${ id }`,
		title: sprintf(
			/* translators: %s: global style title. */
			__( '%s (Global)', 'alerts-dlx' ),
			title
		),
		description: __( 'Insert an alert linked to this global style.', 'alerts-dlx' ),
		category: GLOBAL_STYLE_INSERTER_CATEGORY,
		scope: [ 'inserter' ],
		isDefault: false,
		attributes: {
			globalStyleId: id,
		},
		example: {
			attributes: buildLibraryExampleAttributes( previewAttributes ),
		},
	};
}

/**
 * Build inserter variations for library items flagged for the inserter.
 *
 * Flagged snapshots stay in Singular Alerts and copy attributes. Flagged
 * global styles go in Singular Alerts (Global) and stay linked. Unflagged
 * items are omitted. None of these variations are isDefault.
 *
 * @param {Array} items Localized library items.
 * @return {Array} Library inserter variations.
 */
export function createLibraryInserterVariations( items = getLocalizedLibraryItems() ) {
	if ( ! Array.isArray( items ) ) {
		return [];
	}

	return items.filter( isShownInInserter ).flatMap( ( item ) => {
		const id = Number( item.id ) || 0;
		if ( ! id ) {
			return [];
		}

		if ( 'global_style' === item.kind ) {
			return [ createGlobalStyleInserterVariation( item, id ) ];
		}

		if ( 'snapshot' !== item.kind ) {
			return [];
		}

		const title = libraryItemTitle( item );
		const config = item.config && typeof item.config === 'object' ? item.config : {};
		const attributes = buildSnapshotApplyAttributes( config, '' );

		return [ {
			name: `library-${ id }`,
			title,
			description: __( 'Insert a copy of this preset.', 'alerts-dlx' ),
			icon: 'camera',
			scope: [ 'inserter' ],
			isDefault: false,
			attributes,
			example: {
				attributes: buildLibraryExampleAttributes( attributes ),
			},
		} ];
	} );
}

export default [
	...createGoalFirstCanonicalVariations(),
	...createLibraryInserterVariations(),
];
