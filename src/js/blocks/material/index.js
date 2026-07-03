import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import MaterialIconsLogo from '../components/icons/MaterialIconsLogo';
import Edit from './edit';
import { transformToAlertBlock } from '../utils/alert-transform-utils';

registerBlockType( metadata, {
	edit: Edit,
	save() {
		return <InnerBlocks.Content />;
	},
	icon: <MaterialIconsLogo />,
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'mediaron/alerts-dlx-bootstrap' ],
				transform: ( attributes, innerBlocks ) => {
					return transformToAlertBlock(
						'mediaron/alerts-dlx-material',
						attributes,
						innerBlocks,
						{
							alertType: 'success',
							variant: 'default',
							className: 'is-style-success',
						}
					);
				},
			},
			{
				type: 'block',
				blocks: [ 'mediaron/alerts-dlx-chakra' ],
				transform: ( attributes, innerBlocks ) => {
					return transformToAlertBlock(
						'mediaron/alerts-dlx-material',
						attributes,
						innerBlocks,
						{
							alertType: 'success',
							variant: 'default',
							className: 'is-style-success',
						}
					);
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'mediaron/alerts-dlx-chakra' ],
				transform: ( attributes, innerBlocks ) => {
					return transformToAlertBlock(
						'mediaron/alerts-dlx-chakra',
						attributes,
						innerBlocks,
						{
							alertType: 'success',
							variant: 'subtle',
							className: 'is-style-success',
						}
					);
				},
			},
			{
				type: 'block',
				blocks: [ 'mediaron/alerts-dlx-bootstrap' ],
				transform: ( attributes, innerBlocks ) => {
					return transformToAlertBlock(
						'mediaron/alerts-dlx-bootstrap',
						attributes,
						innerBlocks,
						{
							alertType: 'success',
							variant: 'default',
							className: 'is-style-success',
						}
					);
				},
			},
		],
	},
} );
