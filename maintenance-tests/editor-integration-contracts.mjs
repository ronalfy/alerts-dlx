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

const groupToolbar = fs.readFileSync(
  "src/js/blocks/plugins/alert-group-toolbar.js",
  "utf8"
);
assert.match(
  groupToolbar,
  /CANONICAL_ALERT_BLOCK_NAME/,
  "Alert group toolbar is limited to the canonical Alert block"
);
assert.doesNotMatch(
  groupToolbar,
  /ALERT_BLOCK_NAMES/,
  "Alert group toolbar does not appear on historical alert blocks"
);
assert.match(
  groupToolbar,
  /group as groupIcon/,
  "Alert group toolbar uses the WordPress group icon"
);
assert.match(
  groupToolbar,
  /applyCanonicalAlertGroup\(/,
  "Alert group toolbar switches designs through the shared helper"
);
assert.match(
  groupToolbar,
  /Detach the global style to change the design system\./,
  "Locked group toolbar explains that the global style must be detached"
);
assert.match(
  groupToolbar,
  /accessibleWhenDisabled: appearanceLocked/,
  "Locked group toolbar stays focusable so the explanation can be read"
);
for (const blockName of allAlertBlockNames) {
  assert.ok(
    !groupToolbar.includes(`"${blockName}"`) && !groupToolbar.includes(`'${blockName}'`),
    `Alert group toolbar must not hardcode ${blockName}`
  );
}

const editorIndex = fs.readFileSync("src/index.js", "utf8");
const styleImportAt = editorIndex.indexOf(
  'import "./js/blocks/plugins/alert-style-toolbar"'
);
const groupImportAt = editorIndex.indexOf(
  'import "./js/blocks/plugins/alert-group-toolbar"'
);
const elementsImportAt = editorIndex.indexOf(
  'import "./js/blocks/plugins/alert-elements-toolbar"'
);
assert.ok(styleImportAt !== -1 && groupImportAt !== -1, "Both alert toolbars are registered");
assert.ok(
  groupImportAt > styleImportAt && groupImportAt < elementsImportAt,
  "Alert group toolbar is registered after the style toolbar and before later toolbars so it renders immediately to the style toolbar's left"
);

const canonicalEdit = fs.readFileSync("src/js/blocks/alert/edit.js", "utf8");
assert.match(
  canonicalEdit,
  /applyCanonicalAlertGroup\(/,
  "Inspector design select uses the shared group switch helper"
);

function loadThemeDefinition(file) {
  const source = fs
    .readFileSync(file, "utf8")
    .replace(/^import .*;\n/gm, "")
    .replace("export default ", "return ");
  return new Function("__", source)((text) => text);
}

const helperSource = fs
  .readFileSync("src/js/blocks/utils/canonical-alert-design.js", "utf8")
  .replace(/^import .*;\n/gm, "")
  .replace(/export const /g, "const ")
  .replace(/export function /g, "function ");
const loadHelper = new Function(
  "bootstrapDefinition",
  "chakraDefinition",
  "materialDefinition",
  "shoelaceDefinition",
  "buildAlertStyleClassName",
  `${helperSource}\nreturn { CANONICAL_ALERT_DESIGNS, applyCanonicalAlertGroup, getCanonicalAlertGroupAttributes };`
);
const buildAlertStyleClassName = (className, styleName) => {
  const trimmed = (className || "")
    .replace(/\bis-style-\S+/g, "")
    .trim()
    .replace(/\s+/g, " ");
  return trimmed ? `${trimmed} is-style-${styleName}` : `is-style-${styleName}`;
};
const designHelper = loadHelper(
  loadThemeDefinition("src/js/blocks/bootstrap/theme-definition.js"),
  loadThemeDefinition("src/js/blocks/chakraui/theme-definition.js"),
  loadThemeDefinition("src/js/blocks/material/theme-definition.js"),
  loadThemeDefinition("src/js/blocks/shoelace/theme-definition.js"),
  buildAlertStyleClassName
);
assert.deepEqual(
  Object.entries(designHelper.CANONICAL_ALERT_DESIGNS).map(([value, item]) => [value, item.label]),
  [
    ["bootstrap", "Bootstrap"],
    ["chakra", "Chakra"],
    ["material", "Material"],
    ["shoelace", "Shoelace"],
  ],
  "Group toolbar labels match the inspector design-system labels"
);

const switchedToChakra = designHelper.getCanonicalAlertGroupAttributes({
  alertGroup: "chakra",
  alertType: "success",
  className: "custom-class is-style-success",
});
assert.deepEqual(switchedToChakra, {
  alertGroup: "chakra",
  variant: "subtle",
  alertType: "success",
  className: "custom-class is-style-success",
});

const unsupportedType = designHelper.getCanonicalAlertGroupAttributes({
  alertGroup: "bootstrap",
  alertType: "error",
  className: "custom-class is-style-error extra",
});
assert.deepEqual(unsupportedType, {
  alertGroup: "bootstrap",
  variant: "default",
  alertType: "success",
  className: "custom-class extra is-style-success",
});

const switchedToShoelace = designHelper.getCanonicalAlertGroupAttributes({
  alertGroup: "shoelace",
  alertType: "primary",
  className: "",
});
assert.equal(switchedToShoelace.variant, "top-accent");
assert.equal(switchedToShoelace.alertType, "primary");
assert.equal(switchedToShoelace.className, "is-style-primary");

let lockedWrites = 0;
designHelper.applyCanonicalAlertGroup({
  alertGroup: "material",
  currentAlertGroup: "bootstrap",
  alertType: "success",
  className: "is-style-success",
  appearanceLocked: true,
  setAttributes() {
    lockedWrites += 1;
  },
});
assert.equal(lockedWrites, 0, "A locked global style blocks group switching");

let sameGroupWrites = 0;
designHelper.applyCanonicalAlertGroup({
  alertGroup: "bootstrap",
  currentAlertGroup: "bootstrap",
  alertType: "success",
  className: "is-style-success",
  appearanceLocked: false,
  setAttributes() {
    sameGroupWrites += 1;
  },
});
assert.equal(sameGroupWrites, 0, "Reselecting the current group does not reset its variant");

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
