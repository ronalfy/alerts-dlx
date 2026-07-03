/**
 * Block name to preset icon set mapping.
 */

import ChakraIcons from "../components/icons/ChakraIcons";
import BootstrapIcons from "../components/icons/BootstrapIcons";
import MaterialIcons from "../components/icons/MaterialIcons";

const ICON_SETS_BY_BLOCK = {
  "mediaron/alerts-dlx-chakra": ChakraIcons,
  "mediaron/alerts-dlx-bootstrap": BootstrapIcons,
  "mediaron/alerts-dlx-material": MaterialIcons,
  "mediaron/alerts-dlx-shoelace": BootstrapIcons,
};

/**
 * Return the preset icon set for an AlertsDLX block.
 *
 * @param {string} blockName Block name.
 * @return {Object} Preset icon map.
 */
export function getIconSetForBlock(blockName) {
  return ICON_SETS_BY_BLOCK[blockName] || ChakraIcons;
}
