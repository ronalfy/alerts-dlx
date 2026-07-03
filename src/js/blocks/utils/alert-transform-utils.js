/**
 * Helpers for alert block transforms.
 */

import { createBlock } from '@wordpress/blocks';
import { getAlertGroupForBlockName } from './alert-style-utils';

/**
 * Create a transformed alert block with cloned attributes.
 *
 * @param {string} targetBlockName Target block name.
 * @param {Object} attributes      Source block attributes.
 * @param {Array}  innerBlocks     Source inner blocks.
 * @param {Object} overrides       Attribute overrides for the target block.
 * @return {Object}
 */
export function transformToAlertBlock(
	targetBlockName,
	attributes,
	innerBlocks,
	overrides = {}
) {
	const alertGroup = getAlertGroupForBlockName( targetBlockName );

	return createBlock(
		targetBlockName,
		{
			...attributes,
			...overrides,
			alertGroup,
		},
		innerBlocks
	);
}
