import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import BootstrapLogo from '../components/icons/BootstrapLogo';
import Edit from './edit';
import { createHistoricalAlertTransforms } from '../utils/alert-transform-utils';

registerBlockType( metadata, {
	edit: Edit,
	save() {
		return <InnerBlocks.Content />;
	},
	icon: <BootstrapLogo />,
	transforms: createHistoricalAlertTransforms( metadata.name ),
} );
