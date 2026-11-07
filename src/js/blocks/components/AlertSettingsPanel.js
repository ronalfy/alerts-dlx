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
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import DayOfWeekSelector from './DayOfWeekSelector';
import UrlParamRepeater from './UrlParamRepeater';

/**
 * Keep an id safe for a fragment, class, and data attribute.
 *
 * @param {string} value Raw id.
 * @return {string} Sanitized id.
 */
const sanitizeUniqueId = ( value ) => String( value || '' ).replace( /[^A-Za-z0-9_-]/g, '' );

/**
 * One copyable trigger snippet.
 *
 * @param {Object} props           Component properties.
 * @param {string} props.label     Short name for where the value is pasted.
 * @param {string} props.copyLabel Accessible name for the copy button.
 * @param {string} props.value     Paste-ready trigger text.
 * @return {Element} Snippet row.
 */
function ModalTriggerSnippet( { label, copyLabel, value } ) {
	const [ copied, setCopied ] = useState( false );

	useEffect( () => {
		if ( ! copied ) {
			return undefined;
		}
		const timeoutId = window.setTimeout( () => {
			setCopied( false );
		}, 2000 );
		return () => {
			window.clearTimeout( timeoutId );
		};
	}, [ copied ] );

	return (
		<div className="alerts-dlx-modal-trigger">
			<span className="alerts-dlx-modal-trigger__label">{ label }</span>
			<div className="alerts-dlx-modal-trigger__row">
				<code>{ value }</code>
				<Button
					icon={ copied ? 'yes' : 'copy' }
					label={ copied ? __( 'Copied', 'alerts-dlx' ) : copyLabel }
					showTooltip
					size="small"
					onClick={ () => {
						if ( ! navigator.clipboard?.writeText ) {
							return;
						}
						navigator.clipboard.writeText( value ).then( () => {
							setCopied( true );
						} );
					} }
				/>
			</div>
		</div>
	);
}

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
		modalEnabled,
		uniqueId,
		descriptionEnabled,
		iconEnabled,
		titleEnabled,
		conditionsEnabled,
		startDate,
		endDate,
		daysOfWeek,
		urlParams,
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
							checked={ !! modalEnabled || !! closeButtonEnabled }
							disabled={ !! modalEnabled }
							onChange={ ( value ) => {
								if ( modalEnabled ) {
									return;
								}
								setAttributes( { closeButtonEnabled: value } );
							} }
							help={
								modalEnabled
									? __(
											'Dialogs always include a close button. Closing the dialog does not remember the dismissal.',
											'alerts-dlx'
									  )
									: __(
											'Enable this option to allow the alert to be dismissible.',
											'alerts-dlx'
									  )
							}
						/>
					</PanelRow>
					{ closeButtonEnabled && ! modalEnabled && (
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
					<PanelRow>
						<ToggleControl
							label={ __( 'Open in a dialog', 'alerts-dlx' ) }
							checked={ !! modalEnabled }
							onChange={ ( value ) => {
								setAttributes( {
									modalEnabled: value,
									...( value ? { closeButtonEnabled: true } : {} ),
								} );
							} }
							help={ __(
								'The alert stays hidden on the front end until a trigger opens it. In the editor it keeps a blue dashed border.',
								'alerts-dlx'
							) }
						/>
					</PanelRow>
					{ modalEnabled && (
						<>
							<PanelRow>
								<TextControl
									label={ __( 'Unique ID', 'alerts-dlx' ) }
									value={ uniqueId || '' }
									onChange={ ( value ) => {
										setAttributes( { uniqueId: sanitizeUniqueId( value ) } );
									} }
									help={ __(
										'Links and buttons use this id. Letters, numbers, hyphens, and underscores.',
										'alerts-dlx'
									) }
								/>
							</PanelRow>
							{ !! uniqueId && (
								<PanelRow>
									<div className="alerts-dlx-modal-triggers">
										<p>{ __( 'Copy a trigger', 'alerts-dlx' ) }</p>
										<ModalTriggerSnippet
											label={ __( 'Link', 'alerts-dlx' ) }
											copyLabel={ __( 'Copy link trigger', 'alerts-dlx' ) }
											value={ `#${ uniqueId }` }
										/>
										<ModalTriggerSnippet
											label={ __( 'CSS class', 'alerts-dlx' ) }
											copyLabel={ __( 'Copy CSS class trigger', 'alerts-dlx' ) }
											value={ `modal-${ uniqueId }` }
										/>
										<ModalTriggerSnippet
											label={ __( 'Data attribute', 'alerts-dlx' ) }
											copyLabel={ __( 'Copy data attribute trigger', 'alerts-dlx' ) }
											value={ `data-alerts-dlx-open="${ uniqueId }"` }
										/>
									</div>
								</PanelRow>
							) }
						</>
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
						<UrlParamRepeater
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
						<PanelRow>
							<ToggleControl
								label={ __( 'Require Logged-In User', 'alerts-dlx' ) }
								checked={ requireLogin }
								onChange={ ( value ) => {
									setAttributes( { requireLogin: value } );
								} }
							/>
						</PanelRow>
						{ requireLogin && (
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
						) }
					</>
				) }
			</PanelBody>
		</>
	);
}
