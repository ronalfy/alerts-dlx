#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const canonicalName = "mediaron/alerts-dlx-alert";
const historicalByGroup = {
  bootstrap: "mediaron/alerts-dlx-bootstrap",
  chakra: "mediaron/alerts-dlx-chakra",
  material: "mediaron/alerts-dlx-material",
  shoelace: "mediaron/alerts-dlx-shoelace",
};
const allAlertBlockNames = [canonicalName, ...Object.values(historicalByGroup)];

const registryPath = "src/js/blocks/utils/alert-block-registry.js";
const registrySource = fs.readFileSync(registryPath, "utf8");
const executableRegistry = registrySource
  .replace(/export const /g, "const ")
  .replace(/export function /g, "function ");

const loadRegistry = new Function(
  `${executableRegistry}
return {
  ALERT_BLOCK_NAMES,
  getRegisteredAlertGroupForBlockName,
  getHistoricalAlertBlockNameForGroup,
  resolveAlertDesignBlockName
};`
);
const registry = loadRegistry();

assert.deepEqual(
  registry.ALERT_BLOCK_NAMES,
  allAlertBlockNames,
  "Single alert-block registry covers canonical plus all four historical blocks"
);

for (const [group, historicalName] of Object.entries(historicalByGroup)) {
  assert.equal(
    registry.getHistoricalAlertBlockNameForGroup(group),
    historicalName,
    `Design group ${group} resolves to its historical metadata authority`
  );
  assert.equal(
    registry.resolveAlertDesignBlockName(canonicalName, group),
    historicalName,
    `Canonical Alert resolves ${group} integrations through the correct design block`
  );
  assert.equal(
    registry.getRegisteredAlertGroupForBlockName(historicalName),
    group,
    `Historical ${historicalName} keeps its fixed alert group`
  );
}

assert.equal(
  registry.resolveAlertDesignBlockName(canonicalName, "unknown"),
  historicalByGroup.bootstrap,
  "Malformed canonical group fails closed to Bootstrap integration metadata"
);

const integrationPluginFiles = [
  "src/js/blocks/plugins/custom-colors.js",
  "src/js/blocks/plugins/editorial-only.js",
  "src/js/blocks/plugins/alert-style-toolbar.js",
  "src/js/blocks/plugins/alert-elements-toolbar.js",
  "src/js/blocks/plugins/alert-close-expiration-toolbar.js",
  "src/js/blocks/plugins/button-sidebar-panel.js",
  "src/js/blocks/plugins/alert-group-guard.js",
  "src/js/blocks/plugins/inner-block-parent-toolbar.js",
];

for (const file of integrationPluginFiles) {
  const source = fs.readFileSync(file, "utf8");
  assert.ok(
    source.includes("ALERT_BLOCK_NAMES"),
    `${file} scopes AlertsDLX integrations through the central block registry`
  );

  for (const blockName of allAlertBlockNames) {
    assert.ok(
      !source.includes(`"${blockName}"`) && !source.includes(`'${blockName}'`),
      `${file} must not hardcode ${blockName}; use the central registry`
    );
  }
}

const styleToolbar = fs.readFileSync(
  "src/js/blocks/plugins/alert-style-toolbar.js",
  "utf8"
);
assert.match(
  styleToolbar,
  /getAlertStyleOptions\(name,\s*alertGroup\)/,
  "Canonical style toolbar resolves options using the selected design group"
);
assert.match(
  styleToolbar,
  /\[name,\s*alertGroup\]/,
  "Canonical style toolbar refreshes when the selected design changes"
);

const styleUtils = fs.readFileSync(
  "src/js/blocks/utils/alert-style-utils.js",
  "utf8"
);
assert.match(
  styleUtils,
  /resolveAlertDesignBlockName\(\s*blockName,\s*alertGroup\s*\)/,
  "Style options resolve through design-specific historical metadata"
);

const canonicalMetadata = JSON.parse(
  fs.readFileSync("src/js/blocks/alert/block.json", "utf8")
);
assert.equal(
  Object.hasOwn(canonicalMetadata, "styles"),
  false,
  "Canonical Alert does not advertise a static union of incompatible native block styles"
);

for (const [group, historicalName] of Object.entries(historicalByGroup)) {
  const metadataPath = {
    bootstrap: "src/js/blocks/bootstrap/block.json",
    chakra: "src/js/blocks/chakraui/block.json",
    material: "src/js/blocks/material/block.json",
    shoelace: "src/js/blocks/shoelace/block.json",
  }[group];
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  const styleNames = metadata.styles.map((style) => style.name);

  assert.ok(styleNames.includes("custom"), `${group} retains Custom style`);
  assert.ok(styleNames.length >= 5, `${group} exposes its historical style set`);
  assert.equal(
    registry.resolveAlertDesignBlockName(canonicalName, group),
    historicalName,
    `${group} toolbar options are sourced from ${historicalName}`
  );
}

const iconSets = fs.readFileSync("src/js/blocks/utils/icon-sets.js", "utf8");
assert.match(
  iconSets,
  /resolveAlertDesignBlockName\(blockName,\s*alertGroup\)/,
  "Canonical icon choices resolve through the selected design"
);

assert.match(
  iconSets,
  /export function getIconSetForGroup\(alertGroup\)/,
  "Design-group icon lookup is exported for the shortcode builder"
);

const iconSelector = fs.readFileSync(
  "src/js/blocks/plugins/icon-image-selector.js",
  "utf8"
);
assert.match(
  iconSelector,
  /getIconSetForBlock\(name,\s*alertGroup\)/,
  "Canonical icon sidebar passes the selected design group"
);

console.log(
  "Editor integration anti-bug contracts pass for canonical and historical AlertsDLX blocks."
);
