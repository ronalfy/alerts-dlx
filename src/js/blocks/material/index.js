import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import MaterialIconsLogo from '../components/icons/MaterialIconsLogo';
import Edit from './edit';
import { createHistoricalAlertTransforms } from '../utils/alert-transform-utils';

registerBlockType( metadata, {
	edit: Edit,
	save() {
		return <InnerBlocks.Content />;
	},
	icon: <MaterialIconsLogo />,
	transforms: createHistoricalAlertTransforms( metadata.name ),
} );
