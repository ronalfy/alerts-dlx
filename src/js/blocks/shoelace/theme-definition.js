import { __ } from '@wordpress/i18n';

export default {
	key: 'shoelace',
	blockName: 'mediaron/alerts-dlx-shoelace',
	templateSlug: 'shoelace',
	supportedAlertTypes: [ 'primary', 'success', 'neutral', 'warning', 'danger', 'custom' ],
	defaultAlertType: 'success',
	defaultVariant: 'top-accent',
	variants: [
		{ value: 'top-accent', label: __( 'Top Accent', 'alerts-dlx' ) },
		{ value: 'left-accent', label: __( 'Left Accent', 'alerts-dlx' ) },
		{ value: 'solid', label: __( 'Solid', 'alerts-dlx' ) },
		{ value: 'centered', label: __( 'Centered', 'alerts-dlx' ) },
	],
	variantControlClassName: 'alerts-dlx-shoelace-variants',
	variantControlTextDomain: 'alerts-dlx',
	iconSetName: 'BootstrapIcons',
	closeButtonIconName: 'ShoeLaceCloseIcon',
	colorTokenNamespace: 'alerts-dlx-shoelace',
	themeOnlyAttributes: [ 'iconAppearance' ],
	hideIconAlignmentForVariants: [ 'centered', 'left-accent' ],
	classRules: [
		{ className: 'custom-fonts-enabled', attribute: 'enableCustomFonts' },
		{ className: 'is-appearance-left-accent', attribute: 'variant', equals: 'left-accent' },
		{ className: 'is-appearance-top-accent', attribute: 'variant', equals: 'top-accent' },
		{ className: 'is-appearance-default', attribute: 'variant', equals: 'default' },
		{ className: 'is-appearance-centered', attribute: 'variant', equals: 'centered' },
		{ className: 'is-appearance-solid', attribute: 'variant', equals: 'solid' },
		{ className: 'icon-vertical-align-top', attribute: 'iconVerticalAlignment', equals: 'top' },
		{ className: 'icon-vertical-align-centered', attribute: 'iconVerticalAlignment', equals: 'centered' },
		{ className: 'is-dark-mode', attribute: 'mode', equals: 'dark' },
	],
};
