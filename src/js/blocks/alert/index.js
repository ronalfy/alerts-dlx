import { InnerBlocks } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import variations from './variations';
import { createCanonicalAlertTransforms } from '../utils/canonical-alert-transforms';

registerBlockType( metadata.name, {
	edit: Edit,
	variations,
	transforms: createCanonicalAlertTransforms(),
	save() {
		return <InnerBlocks.Content />;
	},
} );
