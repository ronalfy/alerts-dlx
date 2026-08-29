/**
 * Shared controls used by all four historical Alerts DLX block editors.
 */

import {
	PanelBody,
	PanelRow,
	Slot,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Render the common alert settings without changing the public block contract.
 *
 * @param {Object}   props               Component properties.
 * @param {Object}   props.attributes    Current alert block attributes.
 * @param {Function} props.setAttributes WordPress block attribute updater.
 * @param {Object}   props.fillProps     Original block editor properties for Slots.
 * @return {Element} Shared Alert Settings inspector panel.
 */
export default function AlertSettingsPanel( {
	attributes,
	setAttributes,
	fillProps,
} ) {
	const {
		buttonEnabled,
		closeButtonEnabled,
		closeButtonExpiration,
		descriptionEnabled,
		iconEnabled,
		titleEnabled,
	} = attributes;

	return (
		<>
			<Slot name="alertsDLXPanelStart" fillProps={ fillProps } />
			<PanelBody title={ __( 'Alert Settings', 'alerts-dlx' ) }>
				<>
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Alert Icon', 'alerts-dlx' ) }
							checked={ iconEnabled }
							onChange={ ( value ) => {
								setAttributes( { iconEnabled: value } );
							} }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Title', 'alerts-dlx' ) }
							checked={ titleEnabled }
							onChange={ ( value ) => {
								setAttributes( { titleEnabled: value } );
							} }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Alert Description', 'alerts-dlx' ) }
							checked={ descriptionEnabled }
							onChange={ ( value ) => {
								setAttributes( { descriptionEnabled: value } );
							} }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Alert Button', 'alerts-dlx' ) }
							checked={ buttonEnabled }
							onChange={ ( value ) => {
								setAttributes( { buttonEnabled: value } );
							} }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Close Button', 'alerts-dlx' ) }
							checked={ closeButtonEnabled }
							onChange={ ( value ) => {
								setAttributes( { closeButtonEnabled: value } );
							} }
							help={ __(
								'Enable this option to allow the alert to be dismissible.',
								'alerts-dlx'
							) }
						/>
					</PanelRow>
					{ closeButtonEnabled && (
						<PanelRow>
							<TextControl
								label={ __( 'Set the Close Button save expiration', 'alerts-dlx' ) }
								value={ closeButtonExpiration }
								onChange={ ( value ) => {
									setAttributes( {
										closeButtonExpiration: parseInt( value ),
									} );
								} }
								help={ __(
									'Set the expiration time in seconds for the close button to reappear. Set to zero to never expire.',
									'alerts-dlx'
								) }
								type={ 'number' }
							/>
						</PanelRow>
					) }
					<Slot name="alertsDLXSettingsPanelEnd" fillProps={ fillProps } />
				</>
			</PanelBody>
		</>
	);
}
