import { __ } from '@wordpress/i18n';

export default {
	key: 'material',
	blockName: 'mediaron/alerts-dlx-material',
	templateSlug: 'material',
	supportedAlertTypes: [ 'success', 'info', 'warning', 'error', 'custom' ],
	defaultAlertType: 'success',
	defaultVariant: 'default',
	variants: [
		{ value: 'default', label: __( 'Default', 'alerts-dlx' ) },
		{ value: 'outlined', label: __( 'Outlined', 'alerts-dlx' ) },
		{ value: 'filled', label: __( 'Filled', 'alerts-dlx' ) },
		{ value: 'centered', label: __( 'Centered', 'alerts-dlx' ) },
	],
	variantControlClassName: 'alerts-dlx-material-variants',
	variantControlTextDomain: 'alerts-dlx',
	iconSetName: 'MaterialIcons',
	closeButtonIconName: 'MaterialCloseIcon',
	colorTokenNamespace: 'alerts-dlx-material',
	themeOnlyAttributes: [ 'enableDropShadow' ],
	hideIconAlignmentForVariants: [ 'centered' ],
	classRules: [
		{ className: 'is-dark-mode', attribute: 'mode', equals: 'dark' },
		{ className: 'custom-fonts-enabled', attribute: 'enableCustomFonts' },
		{ className: 'is-appearance-default', attribute: 'variant', equals: 'default' },
		{ className: 'is-appearance-outlined', attribute: 'variant', equals: 'outlined' },
		{ className: 'is-appearance-filled', attribute: 'variant', equals: 'filled' },
		{ className: 'is-appearance-centered', attribute: 'variant', equals: 'centered' },
		{ className: 'is-dropshadow-enabled', attribute: 'enableDropShadow' },
		{ className: 'icon-vertical-align-top', attribute: 'iconVerticalAlignment', equals: 'top' },
		{ className: 'icon-vertical-align-centered', attribute: 'iconVerticalAlignment', equals: 'centered' },
	],
};
