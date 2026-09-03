import { __ } from '@wordpress/i18n';

const commonAttributes = {
	alertGroup: 'bootstrap',
	variant: 'default',
	titleEnabled: true,
	descriptionEnabled: true,
	iconEnabled: true,
};

export default [
	{
		name: 'info',
		title: __( 'Info', 'alerts-dlx' ),
		description: __( 'Share helpful information.', 'alerts-dlx' ),
		icon: 'info',
		scope: [ 'inserter' ],
		attributes: { ...commonAttributes, purpose: 'info', alertType: 'info', className: 'is-style-info' },
	},
	{
		name: 'success',
		title: __( 'Success', 'alerts-dlx' ),
		description: __( 'Confirm a successful result.', 'alerts-dlx' ),
		icon: 'yes-alt',
		scope: [ 'inserter' ],
		attributes: { ...commonAttributes, purpose: 'success', alertType: 'success', className: 'is-style-success' },
	},
	{
		name: 'warning',
		title: __( 'Warning', 'alerts-dlx' ),
		description: __( 'Highlight something that needs attention.', 'alerts-dlx' ),
		icon: 'warning',
		scope: [ 'inserter' ],
		attributes: { ...commonAttributes, purpose: 'warning', alertType: 'warning', className: 'is-style-warning' },
	},
	{
		name: 'error',
		title: __( 'Error', 'alerts-dlx' ),
		description: __( 'Explain a problem or failure.', 'alerts-dlx' ),
		icon: 'dismiss',
		scope: [ 'inserter' ],
		attributes: { ...commonAttributes, purpose: 'error', alertType: 'danger', className: 'is-style-danger' },
	},
	{
		name: 'tip',
		title: __( 'Tip', 'alerts-dlx' ),
		description: __( 'Share a useful tip or recommendation.', 'alerts-dlx' ),
		icon: 'lightbulb',
		scope: [ 'inserter' ],
		attributes: { ...commonAttributes, purpose: 'tip', alertType: 'info', className: 'is-style-info' },
	},
	{
		name: 'announcement',
		title: __( 'Announcement', 'alerts-dlx' ),
		description: __( 'Publish an important announcement.', 'alerts-dlx' ),
		icon: 'megaphone',
		scope: [ 'inserter' ],
		attributes: { ...commonAttributes, purpose: 'announcement', alertType: 'primary', className: 'is-style-primary' },
	},
	{
		name: 'cta',
		title: __( 'Call to Action', 'alerts-dlx' ),
		description: __( 'Prompt the reader to take an action.', 'alerts-dlx' ),
		icon: 'external',
		scope: [ 'inserter' ],
		attributes: {
			...commonAttributes,
			purpose: 'cta',
			alertType: 'primary',
			className: 'is-style-primary',
			buttonEnabled: true,
		},
		example: {
			attributes: {
				...commonAttributes,
				purpose: 'cta',
				alertType: 'primary',
				className: 'is-style-primary',
				buttonEnabled: true,
				alertTitle: 'Click here to learn more',
				buttonText: 'Learn More',
				descriptionEnabled: false,
			},
		},
	},
];
