import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import ShoelaceLogo from '../components/icons/ShoelaceLogo';
import Edit from './edit';
import { createHistoricalAlertTransforms } from '../utils/alert-transform-utils';

registerBlockType( metadata, {
	edit: Edit,
	save() {
		return <InnerBlocks.Content />;
	},
	icon: <ShoelaceLogo />,
	transforms: createHistoricalAlertTransforms( metadata.name ),
} );
