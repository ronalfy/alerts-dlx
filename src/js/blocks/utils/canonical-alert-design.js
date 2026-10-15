/**
 * Canonical Alert design systems and the shared group-switch update.
 */

import bootstrapDefinition from '../bootstrap/theme-definition';
import chakraDefinition from '../chakraui/theme-definition';
import materialDefinition from '../material/theme-definition';
import shoelaceDefinition from '../shoelace/theme-definition';
import { buildAlertStyleClassName } from './alert-style-utils';

export const CANONICAL_ALERT_DESIGNS = {
	bootstrap: { label: 'Bootstrap', definition: bootstrapDefinition },
	chakra: { label: 'Chakra', definition: chakraDefinition },
	material: { label: 'Material', definition: materialDefinition },
	shoelace: { label: 'Shoelace', definition: shoelaceDefinition },
};

/**
 * Attributes stored when the canonical Alert switches design systems.
 *
 * Keeps the current alert type when the next design supports it, otherwise
 * uses that design's default type. Variant always resets to the design default.
 *
 * @param {Object} params            Parameters.
 * @param {string} params.alertGroup Requested design group.
 * @param {string} params.alertType  Current alert type.
 * @param {string} params.className  Current className attribute.
 * @return {Object} Attributes to set.
 */
export function getCanonicalAlertGroupAttributes( {
	alertGroup,
	alertType,
	className,
} ) {
	const nextDesign = CANONICAL_ALERT_DESIGNS[ alertGroup ] || CANONICAL_ALERT_DESIGNS.bootstrap;
	const nextAlertType = nextDesign.definition.supportedAlertTypes.includes( alertType )
		? alertType
		: nextDesign.definition.defaultAlertType;

	return {
		alertGroup,
		variant: nextDesign.definition.defaultVariant,
		alertType: nextAlertType,
		className: buildAlertStyleClassName( className, nextAlertType ),
	};
}

/**
 * Apply a canonical design-system change.
 *
 * No-ops while a global style locks appearance, and when the group is unchanged
 * so an already selected variant is not reset.
 *
 * @param {Object}   params                    Parameters.
 * @param {string}   params.alertGroup         Requested design group.
 * @param {string}   params.currentAlertGroup  Current design group.
 * @param {string}   params.alertType          Current alert type.
 * @param {string}   params.className          Current className attribute.
 * @param {boolean}  params.appearanceLocked   Whether a global style locks appearance.
 * @param {Function} params.setAttributes      Block attribute setter.
 */
export function applyCanonicalAlertGroup( {
	alertGroup,
	currentAlertGroup,
	alertType,
	className,
	appearanceLocked,
	setAttributes,
} ) {
	if ( appearanceLocked || alertGroup === currentAlertGroup ) {
		return;
	}

	setAttributes(
		getCanonicalAlertGroupAttributes( {
			alertGroup,
			alertType,
			className,
		} )
	);
}
