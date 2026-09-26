/**
 * Resolve linked global styles onto the canonical Alert edit tree.
 *
 * Runs after other BlockEdit filters so preview, toolbar, and inspector
 * plugins all receive merged appearance attributes while a style is attached.
 */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
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
