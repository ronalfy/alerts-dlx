/**
 * Shared controls used by all four historical Alerts DLX block editors.
 */

import {
	Button,
	FormTokenField,
	PanelBody,
	PanelRow,
	Slot,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import DayOfWeekSelector from './DayOfWeekSelector';

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
		secondaryButtonEnabled,
		closeButtonEnabled,
		closeButtonExpiration,
		descriptionEnabled,
		iconEnabled,
		titleEnabled,
		conditionsEnabled,
		startDate,
		endDate,
		daysOfWeek,
		urlParam,
		requireLogin,
		requiredRoles,
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
							label={ __( 'Enable Secondary Button', 'alerts-dlx' ) }
							checked={ secondaryButtonEnabled }
							onChange={ ( value ) => {
								setAttributes( { secondaryButtonEnabled: value } );
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
			<PanelBody
				title={ __( 'Display Conditions', 'alerts-dlx' ) }
				initialOpen={ false }
			>
				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Display Conditions', 'alerts-dlx' ) }
						checked={ conditionsEnabled }
						onChange={ ( value ) => {
							setAttributes( { conditionsEnabled: value } );
						} }
						help={ __(
							'Conditions are evaluated in the browser so they work with full-page caching.',
							'alerts-dlx'
						) }
					/>
				</PanelRow>
				{ conditionsEnabled && (
					<>
						<PanelRow>
							<TextControl
								label={ __( 'Start Date/Time', 'alerts-dlx' ) }
								value={ startDate }
								onChange={ ( value ) => {
									setAttributes( { startDate: value } );
								} }
								help={ __( 'YYYY-MM-DDTHH:MM. Leave empty for no start.', 'alerts-dlx' ) }
								type="datetime-local"
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={ __( 'End Date/Time', 'alerts-dlx' ) }
								value={ endDate }
								onChange={ ( value ) => {
									setAttributes( { endDate: value } );
								} }
								help={ __( 'YYYY-MM-DDTHH:MM. Leave empty for no end.', 'alerts-dlx' ) }
								type="datetime-local"
							/>
						</PanelRow>
						<PanelRow>
							<DayOfWeekSelector
								label={ __( 'Days of Week', 'alerts-dlx' ) }
								help={ __( 'Select the days when the alert should be visible.', 'alerts-dlx' ) }
								value={ daysOfWeek }
								onChange={ ( value ) => {
									setAttributes( { daysOfWeek: value } );
								} }
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={ __( 'URL Parameter', 'alerts-dlx' ) }
								value={ urlParam }
								onChange={ ( value ) => {
									setAttributes( { urlParam: value } );
								} }
								help={ __( 'key=value for exact match, or just key to check existence.', 'alerts-dlx' ) }
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								label={ __( 'Require Logged-In User', 'alerts-dlx' ) }
								checked={ requireLogin }
								onChange={ ( value ) => {
									setAttributes( { requireLogin: value } );
								} }
							/>
						</PanelRow>
						<PanelRow>
							<FormTokenField
								label={ __( 'Required Roles', 'alerts-dlx' ) }
								value={ requiredRoles ? requiredRoles.split( ',' ).map( ( s ) => s.trim() ).filter( Boolean ) : [] }
								suggestions={ globalThis.alertsDlxBlock?.roles ? Object.keys( globalThis.alertsDlxBlock.roles ) : [] }
								onChange={ ( tokens ) => {
									setAttributes( { requiredRoles: tokens.join( ',' ) } );
								} }
								help={ __( 'Select one or more roles. The alert is shown if the user has any of them.', 'alerts-dlx' ) }
								placeholder={ __( 'Select roles', 'alerts-dlx' ) }
								__experimentalExpandOnFocus={ requiredRoles.split( ',' ).length >= 2  ? false : true }
								__experimentalAutoSelectFirstMatch={ true }
							/>
						</PanelRow>
					</>
				) }
			</PanelBody>
		</>
	);
}
