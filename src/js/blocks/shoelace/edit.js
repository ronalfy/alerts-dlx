/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/**
 * External dependencies
 */


import { useEffect, useRef } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	PanelRow,
	ToggleControl,
	TextControl,
	Button,
	ButtonGroup,
	RangeControl,
	BaseControl,
	Slot,
} from '@wordpress/components';

import {
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';

import UnitChooser from '../components/unit-picker';
import BootstrapIcons from '../components/icons/BootstrapIcons';
import { ShoeLaceCloseIcon } from '../components/CloseButtonIcons';
import BlockMain from '../components/BlockMain';
import {
	getAlertWrapperClassName,
	useAlertStyleSync,
} from '../utils/alert-style-utils';

import useLegacyDescriptionMigration from "../utils/use-legacy-description-migration";
// For storing unique IDs.
const uniqueIds = [];

const ShoelaceAlerts = ( props ) => {
	// Shortcuts.
	const { attributes, setAttributes, clientId } = props;

	const {
		uniqueId,
		closeButtonEnabled,
		closeButtonExpiration,
		alertType,
		alertTitle,
		alertDescription,
		buttonEnabled,
		maximumWidthUnit,
		maximumWidth,
		icon,
		descriptionEnabled,
		titleEnabled,
		iconEnabled,
		className,
		baseFontSize,
		enableCustomFonts,
		variant,
		iconVerticalAlignment,
		mode,
		colorPrimary,
		colorBorder,
		colorAccent,
		colorAlt,
		colorBold,
		colorLight,
		innerBlocksEnabled,
	} = attributes;

	const innerBlocksRef = useRef( null );
	const innerBlockProps = useInnerBlocksProps(
		{
			className: 'alerts-dlx-content',
			ref: innerBlocksRef,
		},
		{
			allowedBlocks: innerBlocksEnabled ? true : [ 'core/paragraph' ],
			template: [ [ 'core/paragraph', { placeholder: '' } ] ],
		}
	);

	/**
	 * Get a unique ID for the block for inline styling if necessary.
	 */
	useEffect( () => {
		if ( null === uniqueId || uniqueIds.includes( uniqueId ) || '' === uniqueId ) {
			const newUniqueId = 'alerts-dlx-' + clientId.substr( 2, 9 ).replace( '-', '' );

			setAttributes( { uniqueId: newUniqueId } );
			uniqueIds.push( newUniqueId );
		} else {
			uniqueIds.push( uniqueId );
		}
	}, [] );

	useLegacyDescriptionMigration({
    alertDescription,
    innerBlocksRef,
    clientId,
    setAttributes,
  });

	const inspectorControls = (
		<>
			<Slot name="alertsDLXPanelStart" fillProps={ props } />
			<PanelBody title={ __( 'Alert Settings', 'alerts-dlx' ) }>
				<>
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Alert Icon', 'alerts-dlx' ) }
							checked={ iconEnabled }
							onChange={ ( value ) => {
								setAttributes( {
									iconEnabled: value,
								} );
							} }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Title', 'alerts-dlx' ) }
							checked={ titleEnabled }
							onChange={ ( value ) => {
								setAttributes( {
									titleEnabled: value,
								} );
							} }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Alert Description', 'alerts-dlx' ) }
							checked={ descriptionEnabled }
							onChange={ ( value ) => {
								setAttributes( {
									descriptionEnabled: value,
								} );
							} }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Alert Button', 'alerts-dlx' ) }
							checked={ buttonEnabled }
							onChange={ ( value ) => {
								setAttributes( {
									buttonEnabled: value,
								} );
							} }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Close Button', 'alerts-dlx' ) }
							checked={ closeButtonEnabled }
							onChange={ ( value ) => {
								setAttributes( {
									closeButtonEnabled: value,
								} );
							} }
							help={ __( 'Enable this option to allow the alert to be dismissible.', 'alerts-dlx' ) }
						/>
					</PanelRow>
					{
						closeButtonEnabled && (
							<PanelRow>
								<TextControl
									label={ __( 'Set the Close Button save expiration', 'alerts-dlx' ) }
									value={ closeButtonExpiration }
									onChange={ ( value ) => {
										setAttributes( {
											closeButtonExpiration: parseInt( value ),
										} );
									} }
									help={ __( 'Set the expiration time in seconds for the close button to reappear. Set to zero to never expire.', 'alerts-dlx' ) }
									type={ 'number' }
								/>
							</PanelRow>
						)
					}
					<Slot name="alertsDLXSettingsPanelEnd" fillProps={ props } />
				</>
			</PanelBody>
		</>
	);

	const styleControls = (
		<>
			<Slot name="alertsDLXStylePanelStart" fillProps={ props } />
			<PanelBody initialOpen={ true } title={ __( 'Appearance', 'alerts-dlx' ) }>
				<>
					<UnitChooser
						label={ __( 'Maximum Width', 'alerts-dlx' ) }
						value={ maximumWidthUnit }
						units={ [ 'px', '%', 'vw' ] }
						onClick={ ( value ) => {
							setAttributes( {
								maximumWidthUnit: value,
							} );
						} }
					/>

					<TextControl
						type={ 'text' }
						value={ maximumWidth }
						onChange={ ( value ) => {
							setAttributes( {
								maximumWidth: value,
							} );
						} }
					/>
				</>
				<PanelRow>
					<BaseControl id="alerts-dlx-variants-button-group" label={ __( 'Set the Alert Variant', 'alerts-dlx' ) } className="alerts-dlx-shoelace-variants">
						<ButtonGroup>
							<Button
								variant={ variant === 'top-accent' ? 'primary' : 'secondary' }
								onClick={ ( e ) => {
									setAttributes( {
										variant: 'top-accent',
									} );
								} }
							>
								{ __( 'Top Accent', 'alerts-dlx' ) }
							</Button>
							<Button
								variant={ variant === 'left-accent' ? 'primary' : 'secondary' }
								onClick={ ( e ) => {
									setAttributes( {
										variant: 'left-accent',
									} );
								} }
							>
								{ __( 'Left Accent', 'alerts-dlx' ) }
							</Button>
							<Button
								variant={ variant === 'solid' ? 'primary' : 'secondary' }
								onClick={ ( e ) => {
									setAttributes( {
										variant: 'solid',
									} );
								} }
							>
								{ __( 'Solid', 'alerts-dlx' ) }
							</Button>
							<Button
								variant={ variant === 'centered' ? 'primary' : 'secondary' }
								onClick={ ( e ) => {
									setAttributes( {
										variant: 'centered',
									} );
								} }
							>
								{ __( 'Centered', 'alerts-dlx' ) }
							</Button>
						</ButtonGroup>
					</BaseControl>
				</PanelRow>
				<PanelRow>
					<BaseControl id="alerts-dlx-mode-button-group" label={ __( 'Set Light or Dark Mode', 'alerts-dlx' ) } className="alerts-dlx-shoelace-mode">
						<ButtonGroup>
							<Button
								variant={ mode === 'light' ? 'primary' : 'secondary' }
								onClick={ ( e ) => {
									setAttributes( {
										mode: 'light',
									} );
								} }
							>
								{ __( 'Light Mode', 'alerts-dlx' ) }
							</Button>
							<Button
								variant={ mode === 'dark' ? 'primary' : 'secondary' }
								onClick={ ( e ) => {
									setAttributes( {
										mode: 'dark',
									} );
								} }
							>
								{ __( 'Dark Mode', 'alerts-dlx' ) }
							</Button>
						</ButtonGroup>
					</BaseControl>
				</PanelRow>
				{ ( iconEnabled && 'centered' !== variant && 'left-accent' !== variant ) && (
					<PanelRow>
						<BaseControl id="alerts-dlx-button-group-icon-alignment" label={ __( 'Icon Vertical Alignment', 'alerts-dlx' ) } className="alerts-dlx-material-variants">
							<ButtonGroup>
								<Button
									variant={ iconVerticalAlignment === 'top' ? 'primary' : 'secondary' }
									onClick={ ( e ) => {
										setAttributes( {
											iconVerticalAlignment: 'top',
										} );
									} }
								>
									{ __( 'Top', 'alerts-dlx' ) }
								</Button>
								<Button
									variant={ iconVerticalAlignment === 'centered' ? 'primary' : 'secondary' }
									onClick={ ( e ) => {
										setAttributes( {
											iconVerticalAlignment: 'centered',
										} );
									} }
								>
									{ __( 'Centered', 'alerts-dlx' ) }
								</Button>
							</ButtonGroup>
						</BaseControl>
					</PanelRow>
				) }
				<PanelRow>
					<RangeControl
						label={ __( 'Set the Base Font Size', 'alerts-dlx' ) }
						step={ 1 }
						value={ baseFontSize }
						max={ 36 }
						min={ 12 }
						currentInput={ 16 }
						initialPosition={ 16 }
						allowReset={ true }
						onChange={ ( fontSizeValue ) => {
							setAttributes( {
								baseFontSize: fontSizeValue,
							} );
						} }
						help={ __( 'Set the base font size for the alert.', 'alerts-dlx' ) }
					/>
				</PanelRow>
				<Slot name="alertsDLXAppearancePanelEnd" fillProps={ props } />
			</PanelBody>
			<Slot name="alertsDLXStylePanelEnd" fillProps={ props } />
		</>
	);

	const advancedControls = null;

	useAlertStyleSync( { className, alertType, setAttributes } );

	const block = (
		<BlockMain
			attributes={ attributes }
			setAttributes={ setAttributes }
			iconSet={ BootstrapIcons }
			inspectorControls={ inspectorControls }
			styleControls={ styleControls }
			advancedControls={ advancedControls }
			CloseButtonIcon={ ShoeLaceCloseIcon }
			innerBlockProps={ innerBlockProps }
		/>
	);

	/**
	 * Filter: alertsDlx.blockClasses
	 *
	 * This filter allows you to add custom classes to the block.
	 *
	 * @param {Object} blockClasses - The block classes.
	 * @param {Object} attributes   - The block attributes.
	 *
	 * @return {Object} The block classes.
	 */
	const blockClasses = applyFilters(
		'alertsDlx.blockClasses',
		{
			'custom-fonts-enabled': enableCustomFonts,
			'is-appearance-left-accent': 'left-accent' === variant,
			'is-appearance-top-accent': 'top-accent' === variant,
			'is-appearance-default': 'default' === variant,
			'is-appearance-centered': 'centered' === variant,
			'is-appearance-solid': 'solid' === variant,
			'icon-vertical-align-top': 'top' === iconVerticalAlignment,
			'icon-vertical-align-centered': 'centered' === iconVerticalAlignment,
			'is-dark-mode': 'dark' === mode,
		},
		attributes
	);

	const blockProps = useBlockProps( {
		className: getAlertWrapperClassName( {
			className,
			alertType,
			templateSlug: 'shoelace',
			blockClasses,
		} ),
	} );

	return (
		<>
			<div { ...blockProps }>{ block }</div>
		</>
	);
};

export default ShoelaceAlerts;
