/**
 * Bind a theme definition to the existing icon components without moving their
 * imports out of the historical editor entry files.
 *
 * @param {Object}   definition                Static theme definition.
 * @param {Object}   components                Existing theme components.
 * @param {Object}   components.iconSet        Existing preset icon map.
 * @param {Function} components.CloseButtonIcon Existing close icon component.
 * @return {Object} Bound historical theme adapter.
 */
export function createHistoricalAlertThemeAdapter(
	definition,
	{ iconSet, CloseButtonIcon }
) {
	return {
		...definition,
		iconSet,
		CloseButtonIcon,
	};
}

/**
 * Evaluate the ordered editor-class rules for a historical theme.
 *
 * @param {Object} themeAdapter Bound historical theme adapter.
 * @param {Object} attributes   Current block attributes.
 * @return {Object} Ordered class-name boolean map.
 */
export function getHistoricalAlertBlockClasses( themeAdapter, attributes ) {
	return Object.fromEntries(
		themeAdapter.classRules.map( ( rule ) => [
			rule.className,
			Object.prototype.hasOwnProperty.call( rule, 'equals' )
				? attributes[ rule.attribute ] === rule.equals
				: Boolean( attributes[ rule.attribute ] ),
		] )
	);
}

/**
 * Preserve each theme's icon-alignment visibility rule.
 *
 * @param {Object}  themeAdapter Bound historical theme adapter.
 * @param {boolean} iconEnabled  Whether the icon is shown.
 * @param {string}  variant      Current theme variant.
 * @return {boolean} Whether the shared alignment control is visible.
 */
export function isHistoricalIconAlignmentVisible(
	themeAdapter,
	iconEnabled,
	variant
) {
	return Boolean( iconEnabled ) &&
		! themeAdapter.hideIconAlignmentForVariants.includes( variant );
}
