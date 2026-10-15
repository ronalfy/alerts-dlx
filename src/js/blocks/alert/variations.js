import { __ } from '@wordpress/i18n';

import metadata from './block.json';
import { getCanonicalAlertTypeForPurpose } from '../utils/canonical-alert-presets';
import {
	buildSnapshotApplyAttributes,
	getLocalizedLibraryItems,
} from '../utils/alert-library-utils';

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
 * Build one inserter variation per snapshot flagged for the inserter.
 *
 * Global styles are omitted, including items that already have the inserter
 * flag. They stay linked from the Styles sidebar. Static goal variations are
 * empty. None of these snapshot variations are isDefault.
 *
 * @param {Array} items Localized library items.
 * @return {Array} Snapshot inserter variations.
 */
export function createLibraryInserterVariations( items = getLocalizedLibraryItems() ) {
	if ( ! Array.isArray( items ) ) {
		return [];
	}

	return items.filter( isShownInInserter ).flatMap( ( item ) => {
		const id = Number( item.id ) || 0;
		// Global styles are not inserter choices, even when the flag is still stored.
		if ( ! id || 'snapshot' !== item.kind ) {
			return [];
		}

		const title = typeof item.title === 'string' && item.title.trim()
			? item.title.trim()
			: __( 'Library item', 'alerts-dlx' );
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
