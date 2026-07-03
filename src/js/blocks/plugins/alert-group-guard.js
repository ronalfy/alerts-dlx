/**
 * Ensures alertGroup always matches the current block type.
 */

import { useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { ALERT_BLOCK_NAMES } from '../utils/alert-parent-inspector';
import { getAlertGroupForBlockName } from '../utils/alert-style-utils';

/**
 * HOC that corrects a mismatched alertGroup attribute on alert blocks.
 *
 * @param {Function} BlockEdit Original BlockEdit component.
 * @return {Function}
 */
const withAlertGroupGuard = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { name, attributes, setAttributes } = props;

		if ( ! ALERT_BLOCK_NAMES.includes( name ) ) {
			return <BlockEdit { ...props } />;
		}

		const expectedGroup = getAlertGroupForBlockName( name );

		useEffect( () => {
			if ( expectedGroup && attributes.alertGroup !== expectedGroup ) {
				setAttributes( { alertGroup: expectedGroup } );
			}
		}, [ attributes.alertGroup, expectedGroup ] );

		return <BlockEdit { ...props } />;
	};
}, 'withAlertGroupGuard' );

addFilter(
	'editor.BlockEdit',
	'alerts-dlx/alert-group-guard',
	withAlertGroupGuard
);
