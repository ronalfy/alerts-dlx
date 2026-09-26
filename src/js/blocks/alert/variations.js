import { __ } from '@wordpress/i18n';

import { getCanonicalAlertTypeForPurpose } from '../utils/canonical-alert-presets';
import {
	GLOBAL_STYLE_BLOCK_KEYS,
	buildSnapshotApplyAttributes,
	getLocalizedLibraryItems,
	globalStyleHasIcon,
	libraryConfigToBlockAttributes,
} from '../utils/alert-library-utils';

const commonAttributes = {
	alertGroup: 'bootstrap',
	variant: 'default',
	titleEnabled: true,
	descriptionEnabled: true,
	iconEnabled: true,
};

const goals = [
	{
		name: 'info',
		title: __( 'Info', 'alerts-dlx' ),
		description: __( 'Share helpful information.', 'alerts-dlx' ),
		icon: 'info',
	},
	{
		name: 'success',
		title: __( 'Success', 'alerts-dlx' ),
		description: __( 'Confirm a successful result.', 'alerts-dlx' ),
		icon: 'yes-alt',
	},
	{
		name: 'warning',
		title: __( 'Warning', 'alerts-dlx' ),
		description: __( 'Highlight something that needs attention.', 'alerts-dlx' ),
		icon: 'warning',
	},
	{
		name: 'error',
		title: __( 'Error', 'alerts-dlx' ),
		description: __( 'Explain a problem or failure.', 'alerts-dlx' ),
		icon: 'dismiss',
	},
	{
		name: 'tip',
		title: __( 'Tip', 'alerts-dlx' ),
		description: __( 'Share a useful tip or recommendation.', 'alerts-dlx' ),
		icon: 'lightbulb',
	},
	{
		name: 'announcement',
		title: __( 'Announcement', 'alerts-dlx' ),
		description: __( 'Publish an important announcement.', 'alerts-dlx' ),
		icon: 'megaphone',
	},
	{
		name: 'cta',
		title: __( 'Call to Action', 'alerts-dlx' ),
		description: __( 'Prompt the reader to take an action.', 'alerts-dlx' ),
		icon: 'external',
	},
];

/**
 * Build the seven public insertion choices once when the editor script loads.
 *
 * Variations use built-in goal mapping only (no site-saved preset defaults).
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
 * Build one inserter variation per library item flagged for the inserter.
 *
 * Goal variations stay in place. None of these are isDefault, so inserting
 * Alert itself still uses the Success variation.
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
		if ( ! id || ( 'global_style' !== item.kind && 'snapshot' !== item.kind ) ) {
			return [];
		}

		const title = typeof item.title === 'string' && item.title.trim()
			? item.title.trim()
			: __( 'Library item', 'alerts-dlx' );
		const config = item.config && typeof item.config === 'object' ? item.config : {};

		if ( 'global_style' === item.kind ) {
			const exampleAttributes = {
				...libraryConfigToBlockAttributes( config, GLOBAL_STYLE_BLOCK_KEYS, '' ),
				globalStyleId: id,
			};
			exampleAttributes.iconEnabled = globalStyleHasIcon( exampleAttributes );
			return [ {
				name: `library-${ id }`,
				title,
				description: __( 'Insert an alert that follows this global style.', 'alerts-dlx' ),
				icon: 'admin-appearance',
				scope: [ 'inserter' ],
				isDefault: false,
				attributes: {
					globalStyleId: id,
				},
				example: {
					attributes: exampleAttributes,
				},
			} ];
		}

		const attributes = buildSnapshotApplyAttributes( config, '' );
		return [ {
			name: `library-${ id }`,
			title,
			description: __( 'Insert a copy of this snapshot.', 'alerts-dlx' ),
			icon: 'admin-page',
			scope: [ 'inserter' ],
			isDefault: false,
			attributes,
			example: {
				attributes,
			},
		} ];
	} );
}

export default [
	...createGoalFirstCanonicalVariations(),
	...createLibraryInserterVariations(),
];
