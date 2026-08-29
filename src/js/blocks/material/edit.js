/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/**
 * External dependencies
 */


import { useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	PanelRow,
	ToggleControl,
	Slot,
} from '@wordpress/components';

import {
	useBlockProps,
	InnerBlocks,
} from '@wordpress/block-editor';

import { useInstanceId } from '@wordpress/compose';

import UnitChooser from '../components/unit-picker';
import MaterialIcons from '../components/icons/MaterialIcons';
import { MaterialCloseIcon } from '../components/CloseButtonIcons';
import BlockMain from '../components/BlockMain';
import AlertSettingsPanel from '../components/AlertSettingsPanel';
import HistoricalAlertVariantControl from '../components/HistoricalAlertVariantControl';
import {
	AlertModeControl,
	BaseFontSizeControl,
	IconVerticalAlignmentControl,
	MaximumWidthControls,
} from '../components/HistoricalAlertAppearanceControls';
import {
	getAlertWrapperClassName,
	useAlertStyleSync,
} from '../utils/alert-style-utils';

import useLegacyDescriptionMigration from "../utils/use-legacy-description-migration";
import useHistoricalAlertInnerBlocks from '../utils/use-historical-alert-inner-blocks';
import {
	createHistoricalAlertThemeAdapter,
	getHistoricalAlertBlockClasses,
	isHistoricalIconAlignmentVisible,
} from '../utils/historical-alert-theme-adapter';
import themeDefinition from './theme-definition';

// Track the editor block that currently owns each persisted Material alert ID.
const materialAlertIdOwners = new Map();

const themeAdapter = createHistoricalAlertThemeAdapter( themeDefinition, {
	iconSet: MaterialIcons,
	CloseButtonIcon: MaterialCloseIcon,
} );
const MaterialAlerts = ( props ) => {
	const generatedUniqueId = useInstanceId( MaterialAlerts, 'adlx-material' );
	// Shortcuts.
	const { attributes, setAttributes, clientId } = props;

	const {
		uniqueId,
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
		mode,
		enableDropShadow,
		iconVerticalAlignment,
		colorPrimary,
		colorBorder,
		colorAccent,
		colorAlt,
		colorBold,
		colorLight,
		closeButtonEnabled,
		closeButtonExpiration,
		innerBlocksEnabled,
	} = attributes;

	const { innerBlocksRef, innerBlockProps } = useHistoricalAlertInnerBlocks( { innerBlocksEnabled, renderAppender: InnerBlocks.DefaultBlockAppender } );

	useLegacyDescriptionMigration({
    alertDescription,
    innerBlocksRef,
    clientId,
    setAttributes,
  });

	const inspectorControls = (

		<AlertSettingsPanel

			attributes={ attributes }

			setAttributes={ setAttributes }

			fillProps={ props }

		/>

	);


	const styleControls = (
		<>
			<Slot name="alertsDLXStylePanelStart" fillProps={ props } />
			<PanelBody initialOpen={ true } title={ __( 'Appearance', 'alerts-dlx' ) }>
				<MaximumWidthControls attributes={ attributes } setAttributes={ setAttributes } labelTextDomain="alerts-dlx" UnitChooserComponent={ UnitChooser } />
				<HistoricalAlertVariantControl attributes={ attributes } setAttributes={ setAttributes } themeAdapter={ themeAdapter } />
				<AlertModeControl attributes={ attributes } setAttributes={ setAttributes } labelTextDomain="alerts-dlx" className="alerts-dlx-chakra-mode" />
				<IconVerticalAlignmentControl attributes={ attributes } setAttributes={ setAttributes } labelTextDomain="alerts-dlx" isVisible={ isHistoricalIconAlignmentVisible( themeAdapter, iconEnabled, variant ) } />
				<BaseFontSizeControl attributes={ attributes } setAttributes={ setAttributes } />
				{ 'default' === variant && (
					<PanelRow>
						<ToggleControl
							label={ __( 'Enable Drop Shadow', 'alerts-dlx' ) }
							checked={ enableDropShadow }
							onChange={ ( value ) => {
								setAttributes( {
									enableDropShadow: value,
								} );
							} }
							help={ __(
								'Enable or disable the drop shadow for the default variant.',
								'alerts-dlx'
							) }
						/>
					</PanelRow>
				) }
				<Slot name="alertsDLXAppearancePanelEnd" fillProps={ props } />
			</PanelBody>
			<Slot name="alertsDLXStylePanelEnd" fillProps={ props } />
		</>
	);

	const advancedControls = null;

	/**
	 * Keep a saved Material alert's identity stable. New blocks, duplicates,
	 * copies, and transforms from another alert family still receive a fresh
	 * Material ID. The ID also scopes styles and identifies dismiss cookies.
	 */
	useEffect( () => {
		const isPersistedMaterialId =
			typeof uniqueId === 'string' &&
			uniqueId.startsWith( 'adlx-material-' );
		const currentOwner = materialAlertIdOwners.get( uniqueId );

		if (
			isPersistedMaterialId &&
			( ! currentOwner || currentOwner === clientId )
		) {
			materialAlertIdOwners.set( uniqueId, clientId );
			return;
		}

		let nextUniqueId = generatedUniqueId;
		if ( materialAlertIdOwners.has( nextUniqueId ) ) {
			nextUniqueId =
				'adlx-material-' + clientId.replace( /-/g, '' );
		}

		if ( nextUniqueId !== uniqueId ) {
			setAttributes( { uniqueId: nextUniqueId } );
		}
		materialAlertIdOwners.set( nextUniqueId, clientId );
	}, [ clientId, generatedUniqueId, setAttributes, uniqueId ] );

	useAlertStyleSync( { className, alertType, setAttributes } );

	const block = (
		<BlockMain
			attributes={ attributes }
			setAttributes={ setAttributes }
			iconSet={ themeAdapter.iconSet }
			inspectorControls={ inspectorControls }
			styleControls={ styleControls }
			advancedControls={ advancedControls }
			CloseButtonIcon={ themeAdapter.CloseButtonIcon }
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
		getHistoricalAlertBlockClasses( themeAdapter, attributes ),
		attributes
	);

	const blockProps = useBlockProps( {
		className: getAlertWrapperClassName( {
			className,
			alertType,
			templateSlug: themeAdapter.templateSlug,
			blockClasses,
		} ),
	} );

	return (
		<>
			<div { ...blockProps }>{ block }</div>
		</>
	);
};

export default MaterialAlerts;
