/**
 * Pure helpers for goal-first canonical Alert variations.
 *
 * Site presets and defaults were removed; insertion uses built-in goal mapping only.
 */

const designs = {
	bootstrap: {
		types: [ 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'custom' ],
		variants: [ 'default', 'centered' ],
		defaultType: 'success',
		defaultVariant: 'default',
	},
	chakra: {
		types: [ 'success', 'info', 'warning', 'error', 'custom' ],
		variants: [ 'subtle', 'solid', 'left-accent', 'top-accent', 'centered' ],
		defaultType: 'success',
		defaultVariant: 'subtle',
	},
	material: {
		types: [ 'success', 'info', 'warning', 'error', 'custom' ],
		variants: [ 'default', 'outlined', 'filled', 'centered' ],
		defaultType: 'success',
		defaultVariant: 'default',
	},
	shoelace: {
		types: [ 'primary', 'success', 'neutral', 'warning', 'danger', 'custom' ],
		variants: [ 'top-accent', 'left-accent', 'solid', 'centered' ],
		defaultType: 'success',
		defaultVariant: 'top-accent',
	},
};

/**
 * Map each goal to a type supported by the configured design.
 *
 * @param {string} purpose    Goal-first variation name.
 * @param {string} alertGroup Canonical design.
 * @return {string} Supported alert type.
 */
export function getCanonicalAlertTypeForPurpose( purpose, alertGroup ) {
	const goalTypes = {
		bootstrap: { info: 'info', success: 'success', warning: 'warning', error: 'danger', tip: 'info', announcement: 'primary', cta: 'primary' },
		chakra: { info: 'info', success: 'success', warning: 'warning', error: 'error', tip: 'info', announcement: 'info', cta: 'info' },
		material: { info: 'info', success: 'success', warning: 'warning', error: 'error', tip: 'info', announcement: 'info', cta: 'info' },
		shoelace: { info: 'neutral', success: 'success', warning: 'warning', error: 'danger', tip: 'neutral', announcement: 'primary', cta: 'primary' },
	};
	const map = goalTypes[ alertGroup ] || goalTypes.bootstrap;
	return map[ purpose ] || designs[ alertGroup ]?.defaultType || 'success';
}
