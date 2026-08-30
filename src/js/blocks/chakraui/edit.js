/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/**
 * External dependencies
 */


import { useEffect } from "@wordpress/element";
import { applyFilters } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import {
  PanelBody,
  Slot,
} from "@wordpress/components";

import {
  useBlockProps,
} from "@wordpress/block-editor";

import UnitChooser from "../components/unit-picker";
import ChakraIcons from "../components/icons/ChakraIcons";
import { ChakraCloseIcon } from "../components/CloseButtonIcons";
import BlockMain from "../components/BlockMain";
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
} from "../utils/alert-style-utils";

import useLegacyDescriptionMigration from "../utils/use-legacy-description-migration";
import useHistoricalAlertInnerBlocks from '../utils/use-historical-alert-inner-blocks';
import {
  createHistoricalAlertThemeAdapter,
  getHistoricalAlertBlockClasses,
  isHistoricalIconAlignmentVisible,
} from '../utils/historical-alert-theme-adapter';
import themeDefinition from './theme-definition';

const themeAdapter = createHistoricalAlertThemeAdapter( themeDefinition, {
  iconSet: ChakraIcons,
  CloseButtonIcon: ChakraCloseIcon,
} );
// For storing unique IDs.
const uniqueIds = [];

const ChakraAlerts = (props) => {
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

  const { innerBlocksRef, innerBlockProps } = useHistoricalAlertInnerBlocks( { innerBlocksEnabled } );

  useLegacyDescriptionMigration({
    alertDescription,
    innerBlocksRef,
    clientId,
    setAttributes,
  });

  /**
   * Get a unique ID for the block for inline styling if necessary.
   */
  useEffect(() => {
    if (null === uniqueId || uniqueIds.includes(uniqueId) || "" === uniqueId) {
      const newUniqueId =
        "alerts-dlx-" + clientId.substr(2, 9).replace("-", "");

      setAttributes({ uniqueId: newUniqueId });
      uniqueIds.push(newUniqueId);
    } else {
      uniqueIds.push(uniqueId);
    }
  }, []);

  const inspectorControls = (

    <AlertSettingsPanel

      attributes={ attributes }

      setAttributes={ setAttributes }

      fillProps={ props }

    />

  );


  const styleControls = (
    <>
      <Slot name="alertsDLXStylePanelStart" fillProps={props} />
      <PanelBody initialOpen={true} title={__("Appearance", "quotes-dlx")}>
        <MaximumWidthControls attributes={ attributes } setAttributes={ setAttributes } labelTextDomain="quotes-dlx" UnitChooserComponent={ UnitChooser } />
        <HistoricalAlertVariantControl attributes={ attributes } setAttributes={ setAttributes } themeAdapter={ themeAdapter } />
        <AlertModeControl attributes={ attributes } setAttributes={ setAttributes } labelTextDomain="quotes-dlx" className="alerts-dlx-chakra-mode" />
        <IconVerticalAlignmentControl attributes={ attributes } setAttributes={ setAttributes } labelTextDomain="quotes-dlx" isVisible={ isHistoricalIconAlignmentVisible( themeAdapter, iconEnabled, variant ) } />
        <BaseFontSizeControl attributes={ attributes } setAttributes={ setAttributes } />
        <Slot name="alertsDLXAppearancePanelEnd" fillProps={props} />
      </PanelBody>
      <Slot name="alertsDLXStylePanelEnd" fillProps={props} />
    </>
  );

  const advancedControls = null;

  useAlertStyleSync( { className, alertType, setAttributes } );

  const block = (
    <BlockMain
      attributes={attributes}
      setAttributes={setAttributes}
      iconSet={ themeAdapter.iconSet }
      inspectorControls={inspectorControls}
      styleControls={styleControls}
      advancedControls={advancedControls}
      CloseButtonIcon={ themeAdapter.CloseButtonIcon }
      innerBlockProps={innerBlockProps}
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
    "alertsDlx.blockClasses",
    getHistoricalAlertBlockClasses( themeAdapter, attributes ),
    attributes
  );

  const blockProps = useBlockProps({
    className: getAlertWrapperClassName({
      className,
      alertType,
      templateSlug: themeAdapter.templateSlug,
      blockClasses,
    }),
  });

  return (
    <>
      <div {...blockProps}>{block}</div>
    </>
  );
};

export default ChakraAlerts;
