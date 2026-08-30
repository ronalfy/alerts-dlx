import {
	BaseControl,
	Button,
	ButtonGroup,
	PanelRow,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Render the historical variant buttons from a theme adapter.
 *
 * @param {Object}   props              Component props.
 * @param {Object}   props.attributes   Current block attributes.
 * @param {Function} props.setAttributes Block attribute updater.
 * @param {Object}   props.themeAdapter Bound historical theme adapter.
 * @return {import('react').JSX.Element} Variant control.
 */
export default function HistoricalAlertVariantControl( {
	attributes,
	setAttributes,
	themeAdapter,
} ) {
	return (
		<PanelRow>
			<BaseControl
				id="alerts-dlx-variants-button-group"
				label={ __( 'Set the Alert Variant', themeAdapter.variantControlTextDomain ) }
				className={ themeAdapter.variantControlClassName }
			>
				<ButtonGroup>
					{ themeAdapter.variants.map( ( option ) => (
						<Button
							key={ option.value }
							variant={ attributes.variant === option.value ? 'primary' : 'secondary' }
							onClick={ () => setAttributes( { variant: option.value } ) }
						>
							{ option.label }
						</Button>
					) ) }
				</ButtonGroup>
			</BaseControl>
		</PanelRow>
	);
}
