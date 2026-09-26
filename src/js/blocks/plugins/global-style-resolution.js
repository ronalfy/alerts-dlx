/**
 * Resolve linked global styles onto the canonical Alert edit tree.
 *
 * Runs after other BlockEdit filters so preview, toolbar, and inspector
 * plugins all receive merged appearance attributes while a style is attached.
 */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import {
	createGuardedLibrarySetAttributes,
	mergeGlobalStyleIntoAttributes,
} from '../utils/alert-library-utils';

const CANONICAL_ALERT_BLOCK = 'mediaron/alerts-dlx-alert';

const withGlobalStyleResolution = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( props.name !== CANONICAL_ALERT_BLOCK ) {
			return <BlockEdit { ...props } />;
		}

		const resolvedAttributes = mergeGlobalStyleIntoAttributes( props.attributes );
		const guardedSetAttributes = createGuardedLibrarySetAttributes(
			props.attributes,
			props.setAttributes
		);
		const styleId = Number( props.attributes.globalStyleId ) || 0;
		const storedClassName = props.attributes.className || '';
		const resolvedClassName = resolvedAttributes.className || '';
		const storedAlertType = props.attributes.alertType || '';
		const resolvedAlertType = resolvedAttributes.alertType || '';

		// useBlockProps merges the saved is-style-* class with the preview class.
		// Theme CSS lists warning after info, so both classes leave the warning color in place.
		useEffect( () => {
			if ( ! styleId ) {
				return;
			}
			const updates = {};
			if ( resolvedClassName && resolvedClassName !== storedClassName ) {
				updates.className = resolvedClassName;
			}
			if ( resolvedAlertType && resolvedAlertType !== storedAlertType ) {
				updates.alertType = resolvedAlertType;
			}
			if ( Object.keys( updates ).length ) {
				props.setAttributes( updates );
			}
		}, [ styleId, storedClassName, resolvedClassName, storedAlertType, resolvedAlertType, props.setAttributes ] );

		return (
			<BlockEdit
				{ ...props }
				attributes={ resolvedAttributes }
				setAttributes={ guardedSetAttributes }
			/>
		);
	};
}, 'withGlobalStyleResolution' );

addFilter(
	'editor.BlockEdit',
	'alerts-dlx/global-style-resolution',
	withGlobalStyleResolution,
	20
);
