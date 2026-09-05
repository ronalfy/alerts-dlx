/**
 * Block name to preset icon set mapping.
 */

import ChakraIcons from "../components/icons/ChakraIcons";
import BootstrapIcons from "../components/icons/BootstrapIcons";
import MaterialIcons from "../components/icons/MaterialIcons";
import {
  CANONICAL_ALERT_BLOCK_NAME,
  resolveAlertDesignBlockName,
} from "./alert-block-registry";

const ICON_SETS_BY_BLOCK = {
  "mediaron/alerts-dlx-chakra": ChakraIcons,
  "mediaron/alerts-dlx-bootstrap": BootstrapIcons,
  "mediaron/alerts-dlx-material": MaterialIcons,
  "mediaron/alerts-dlx-shoelace": BootstrapIcons,
};

/**
 * Return the preset icon set for an AlertsDLX block.
 *
 * @param {string}      blockName  Block name.
 * @param {string|null} alertGroup Alert design slug for the canonical block.
 * @return {Object} Preset icon map.
 */
export function getIconSetForBlock(blockName, alertGroup = null) {
  const designBlockName = resolveAlertDesignBlockName(blockName, alertGroup);
  return ICON_SETS_BY_BLOCK[designBlockName] || ChakraIcons;
}

/**
 * Return the preset icon set for an alert design group.
 *
 * @param {string} alertGroup Alert design slug.
 * @return {Object} Preset icon map.
 */
export function getIconSetForGroup(alertGroup) {
  return getIconSetForBlock(CANONICAL_ALERT_BLOCK_NAME, alertGroup);
}
