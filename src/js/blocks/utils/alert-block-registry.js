/**
 * Single source of truth for AlertsDLX block integration identities.
 */

export const CANONICAL_ALERT_BLOCK_NAME = "mediaron/alerts-dlx-alert";
export const DEFAULT_ALERT_GROUP = "bootstrap";

export const HISTORICAL_ALERT_BLOCK_GROUPS = {
  "mediaron/alerts-dlx-bootstrap": "bootstrap",
  "mediaron/alerts-dlx-chakra": "chakra",
  "mediaron/alerts-dlx-material": "material",
  "mediaron/alerts-dlx-shoelace": "shoelace",
};

export const HISTORICAL_ALERT_BLOCK_BY_GROUP = {
  bootstrap: "mediaron/alerts-dlx-bootstrap",
  chakra: "mediaron/alerts-dlx-chakra",
  material: "mediaron/alerts-dlx-material",
  shoelace: "mediaron/alerts-dlx-shoelace",
};

export const ALERT_BLOCK_NAMES = [
  CANONICAL_ALERT_BLOCK_NAME,
  ...Object.keys(HISTORICAL_ALERT_BLOCK_GROUPS),
];

/**
 * Return the fixed design group for a historical block.
 * Canonical Alert has no fixed group because alertGroup is an attribute.
 *
 * @param {string} blockName Block name.
 * @return {string|null} Alert group or null.
 */
export function getRegisteredAlertGroupForBlockName(blockName) {
  return HISTORICAL_ALERT_BLOCK_GROUPS[blockName] ?? null;
}

/**
 * Resolve a design group to the historical block whose metadata remains
 * the compatibility authority for that design.
 *
 * @param {string|null} alertGroup Alert design group.
 * @return {string} Historical block name.
 */
export function getHistoricalAlertBlockNameForGroup(alertGroup) {
  return (
    HISTORICAL_ALERT_BLOCK_BY_GROUP[alertGroup] ??
    HISTORICAL_ALERT_BLOCK_BY_GROUP[DEFAULT_ALERT_GROUP]
  );
}

/**
 * Resolve the block registration that should supply design-specific metadata.
 *
 * @param {string}      blockName  Current block name.
 * @param {string|null} alertGroup Current canonical design group.
 * @return {string} Block name that owns the selected design metadata.
 */
export function resolveAlertDesignBlockName(blockName, alertGroup = null) {
  if (CANONICAL_ALERT_BLOCK_NAME === blockName) {
    return getHistoricalAlertBlockNameForGroup(alertGroup);
  }

  return blockName;
}
