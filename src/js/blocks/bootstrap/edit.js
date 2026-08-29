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
	Slot,
} from '@wordpress/components';

import {
	useBlockProps,
} from '@wordpress/block-editor';

import UnitChooser from '../components/unit-picker';
import BootstrapIcons from '../components/icons/BootstrapIcons';
import { BootstrapCloseIcon } from '../components/CloseButtonIcons';
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

const themeAdapter = createHistoricalAlertThemeAdapter( themeDefinition, {
	iconSet: BootstrapIcons,
	CloseButtonIcon: BootstrapCloseIcon,
} );
// For storing unique IDs.
const uniqueIds = [];

const BootstrapAlerts = ( props ) => {
	// Shortcts.
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
		closeButtonEnabled,
		closeButtonExpiration,
		className,
		baseFontSize,
		enableCustomFonts,
		variant,
		iconVerticalAlignment,
		innerBlocksEnabled,
		colorPrimary,
		colorBorder,
		colorAccent,
		colorAlt,
		colorBold,
		colorLight,
		mode,
		isBlockAdminOnly,
		adminOnlyBlockExpiresEnabled,
		adminOnlyBlockExpires,
	} = attributes;

	/**
	 * Get a unique ID for the block for inline styling if necessary.
	 */
	useEffect( () => {
		if ( null === uniqueId || uniqueIds.includes( uniqueId ) || '' === uniqueId ) {
			const newUniqueId =
				'alerts-dlx-' + clientId.substr( 2, 9 ).replace( '-', '' );

			setAttributes( { uniqueId: newUniqueId } );
			uniqueIds.push( newUniqueId );
		} else {
			uniqueIds.push( uniqueId );
		}
	}, [] );

	const { innerBlocksRef, innerBlockProps } = useHistoricalAlertInnerBlocks( { innerBlocksEnabled } );
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
				<IconVerticalAlignmentControl attributes={ attributes } setAttributes={ setAttributes } labelTextDomain="alerts-dlx" isVisible={ isHistoricalIconAlignmentVisible( themeAdapter, iconEnabled, variant ) } />
				<AlertModeControl attributes={ attributes } setAttributes={ setAttributes } labelTextDomain="alerts-dlx" className="alerts-dlx-chakra-mode" />
				<BaseFontSizeControl attributes={ attributes } setAttributes={ setAttributes } />
				<Slot name="alertsDLXAppearancePanelEnd" fillProps={ props } />
			</PanelBody>
			<Slot name="alertsDLXStylePanelEnd" fillProps={ props } />
		</>
	);

	const advancedControls = null;

	/**
	 * Attempt to check when block styles are changed.
	 */
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

export default BootstrapAlerts;
