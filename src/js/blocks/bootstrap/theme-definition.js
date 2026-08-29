import { __ } from '@wordpress/i18n';

export default {
	key: 'bootstrap',
	blockName: 'mediaron/alerts-dlx-bootstrap',
	templateSlug: 'bootstrap',
	supportedAlertTypes: [
		'primary', 'secondary', 'success', 'danger', 'warning',
		'info', 'light', 'dark', 'custom',
	],
	defaultAlertType: 'success',
	defaultVariant: 'default',
	variants: [
		{ value: 'default', label: __( 'Default', 'alerts-dlx' ) },
		{ value: 'centered', label: __( 'Centered', 'alerts-dlx' ) },
	],
	variantControlClassName: 'alerts-dlx-bootstrap-variants',
	variantControlTextDomain: 'alerts-dlx',
	iconSetName: 'BootstrapIcons',
	closeButtonIconName: 'BootstrapCloseIcon',
	colorTokenNamespace: 'alerts-dlx-bootstrap',
	themeOnlyAttributes: [],
	hideIconAlignmentForVariants: [ 'centered' ],
	classRules: [
		{ className: 'custom-fonts-enabled', attribute: 'enableCustomFonts' },
		{ className: 'is-appearance-default', attribute: 'variant', equals: 'default' },
		{ className: 'is-appearance-centered', attribute: 'variant', equals: 'centered' },
		{ className: 'icon-vertical-align-top', attribute: 'iconVerticalAlignment', equals: 'top' },
		{ className: 'icon-vertical-align-centered', attribute: 'iconVerticalAlignment', equals: 'centered' },
		{ className: 'is-dark-mode', attribute: 'mode', equals: 'dark' },
	],
};
