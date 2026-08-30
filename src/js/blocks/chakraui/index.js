import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import ChakraUILogo from '../components/icons/ChakraUILogo';
import Edit from './edit';
import { createHistoricalAlertTransforms } from '../utils/alert-transform-utils';

registerBlockType( metadata, {
	edit: Edit,
	save() {
		return <InnerBlocks.Content />;
	},
	icon: <ChakraUILogo />,
	transforms: createHistoricalAlertTransforms( metadata.name ),
} );
