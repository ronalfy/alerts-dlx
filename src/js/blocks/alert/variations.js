import { __ } from '@wordpress/i18n';

import {
	getCanonicalAlertDefaults,
	getCanonicalAlertTypeForPurpose,
	snapshotCanonicalAlertAttributes,
} from '../utils/canonical-alert-presets';

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
 * Site defaults are copied into these insertion-time attributes only; no
 * parsed or already-saved block is observed or mutated.
 *
 * @param {Object} siteDefaults Sanitized localized defaults.
 * @return {Array} Goal-first canonical Alert variations.
 */
export function createGoalFirstCanonicalVariations( siteDefaults = getCanonicalAlertDefaults() ) {
	const insertionDefaults = snapshotCanonicalAlertAttributes( siteDefaults );
	const defaultPurpose = goals.some( ( goal ) => goal.name === insertionDefaults.purpose )
		? insertionDefaults.purpose
		: 'success';
	const alertGroup = insertionDefaults.alertGroup || commonAttributes.alertGroup;

	return goals.map( ( goal ) => {
		const alertType = getCanonicalAlertTypeForPurpose( goal.name, alertGroup );
		const attributes = {
			...commonAttributes,
			...insertionDefaults,
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

export default createGoalFirstCanonicalVariations();
