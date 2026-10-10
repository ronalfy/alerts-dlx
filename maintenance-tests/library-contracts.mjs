#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const alertLibrary = fs.readFileSync('php/AlertLibrary.php', 'utf8');
const shortcodeBuilder = fs.readFileSync('php/ShortcodeBuilder.php', 'utf8');
const rest = fs.readFileSync('php/Rest.php', 'utf8');
const admin = fs.readFileSync('php/Admin.php', 'utf8');
const blocks = fs.readFileSync('php/Blocks.php', 'utf8');
const functions = fs.readFileSync('php/Functions.php', 'utf8');
const canonicalBlock = JSON.parse(
	fs.readFileSync('src/js/blocks/alert/block.json', 'utf8')
);
const libraryPanel = fs.readFileSync(
	'src/js/blocks/components/AlertLibraryPanel.js',
	'utf8'
);
const alertEdit = fs.readFileSync('src/js/blocks/alert/edit.js', 'utf8');
const libraryUtils = fs.readFileSync(
	'src/js/blocks/utils/alert-library-utils.js',
	'utf8'
);

assert.match(alertLibrary, /POST_TYPE = 'alerts_dlx_library'/, 'Alert library CPT slug is registered');
assert.match(alertLibrary, /META_KIND = '_alerts_dlx_kind'/, 'Alert library kind meta is defined');
assert.doesNotMatch(alertLibrary, /_alerts_dlx_config/, 'Alert library config is not stored in post meta');
assert.match(alertLibrary, /encode_config_for_storage/, 'Alert library encodes config for post_content');
assert.match(alertLibrary, /wp_slash/, 'Alert library slashes config JSON before post_content write');
assert.match(alertLibrary, /post_content/, 'Alert library reads and writes config via post_content');
assert.match(alertLibrary, /'editor'/, 'Alert library CPT supports editor/post_content');
assert.match(rest, /encode_config_for_storage/, 'Library REST writes config through the storage encoder');
assert.doesNotMatch(rest, /_alerts_dlx_config|META_CONFIG/, 'Library REST does not write config meta');
assert.match(alertLibrary, /KIND_SNAPSHOT = 'snapshot'/, 'Snapshot kind is defined');
assert.match(alertLibrary, /sanitize_list_kind/, 'List kind sanitizer allows all kinds');
assert.match(alertLibrary, /alerts_dlx_snapshot_config/, 'Snapshot config filter is registered');
assert.match(alertLibrary, /maybe_seed_starter_snapshots/, 'Starter snapshot seeding is wired');
assert.match(alertLibrary, /STARTER_SNAPSHOTS_SEEDED_OPTION/, 'Starter seed option flag is defined');
assert.match(alertLibrary, /apply_global_style_to_block_attributes/, 'Global style merge helper exists for render');
assert.match(alertLibrary, /global_style_has_icon/, 'Global style icon presence helper exists for render');
assert.doesNotMatch(alertLibrary, /iconEnabled.*=.*global_style_has_icon/, 'Frontend merge leaves iconEnabled on the block');
assert.match(alertLibrary, /get_items_for_editor/, 'Editor localization helper exists');
assert.match(shortcodeBuilder, /get_global_style_input_names/, 'Appearance allowlist is defined in ShortcodeBuilder');
assert.match(shortcodeBuilder, /sanitize_global_style_values/, 'Appearance sanitizer is defined');
assert.match(shortcodeBuilder, /get_snapshot_input_names/, 'Snapshot allowlist is defined in ShortcodeBuilder');
assert.match(shortcodeBuilder, /get_snapshot_fields/, 'Snapshot inspector fields are defined');
assert.match(shortcodeBuilder, /get_snapshot_defaults/, 'Snapshot defaults are defined');
assert.match(shortcodeBuilder, /sanitize_snapshot_values/, 'Snapshot sanitizer is defined');
assert.match(shortcodeBuilder, /title_enabled/, 'Snapshots persist title visibility');
assert.match(shortcodeBuilder, /description_enabled/, 'Snapshots persist description visibility');
assert.match(shortcodeBuilder, /button_enabled/, 'Snapshots persist button visibility');
assert.match(alertLibrary, /sanitize_snapshot_values/, 'Library snapshots use the snapshot sanitizer');
assert.match(alertLibrary, /merge_snapshot_preview_values/, 'Snapshot preview merge honors stored toggles');
assert.match(rest, /\/library-items/, 'Library REST routes are registered');
assert.match(rest, /sanitize_list_kind/, 'Library list kind is optional');
assert.match(rest, /library_read_permissions_check/, 'Library GET uses a read permission path');
assert.match(rest, /edit_posts/, 'Library read allows editors who can edit posts');
assert.match(admin, /styles-snapshots/, 'Styles & Snapshots admin tab is wired');
assert.match(admin, /alerts-dlx-library/, 'Library mount and bundle are wired');
assert.match(admin, /libraryFields/, 'Library field schema is localized');
assert.match(admin, /snapshotFields/, 'Snapshot field schema is localized');
assert.match(admin, /snapshotDefaults/, 'Snapshot defaults are localized');
assert.match(admin, /libraryBoot/, 'Library boot state is localized');
assert.match(functions, /INPUT_GET, 'item'/, 'Library item query arg is item');
assert.doesNotMatch(admin, /tab=global-styles|globalStyleFields|alerts-dlx-global-styles/, 'Legacy global-styles tab contracts are removed');

// Global-style vs snapshot field sets stay distinct.
const globalNamesMatch = shortcodeBuilder.match(
	/function get_global_style_input_names\(\) \{\s*return array\(([\s\S]*?)\);\s*\}/
);
const snapshotNamesMatch = shortcodeBuilder.match(
	/function get_snapshot_input_names\(\) \{([\s\S]*?)return array_values/
);
assert.ok(globalNamesMatch, 'Can parse global style input names');
assert.ok(snapshotNamesMatch, 'Can parse snapshot input names merge');
assert.match(shortcodeBuilder, /'align'/, 'Snapshots include align');
assert.match(shortcodeBuilder, /close_button_expiration/, 'Snapshots include close expiration');
assert.doesNotMatch(
	globalNamesMatch[1],
	/'align'|'title_enabled'|'close_button_enabled'/,
	'Global styles do not include snapshot-only fields'
);

// Block-level library reference is globalStyleId only.
assert.equal(
	canonicalBlock.attributes?.globalStyleId?.type,
	'number',
	'Canonical block stores globalStyleId as a number'
);
assert.equal(
	canonicalBlock.attributes?.globalStyleId?.default,
	0,
	'globalStyleId defaults to 0 (none)'
);
assert.equal(
	Object.hasOwn(canonicalBlock.attributes, 'snapshotId'),
	false,
	'Snapshots are not stored as a live block reference'
);
assert.match(blocks, /libraryItems/, 'Editor localizes library items');
assert.match(blocks, /apply_global_style_to_block_attributes/, 'Frontend render merges global styles');
assert.match(
	fs.readFileSync('src/js/blocks/plugins/global-style-resolution.js', 'utf8'),
	/updates\.className = resolvedClassName/,
	'Editor syncs the saved is-style class to the attached global style'
);
assert.doesNotMatch(blocks, /CanonicalAlertPresets|canonicalPresets|canonicalDefaults/, 'Preset editor boot payload is removed');
assert.match(alertEdit, /AlertLibraryPanel/, 'Canonical edit uses the Library panel');
assert.doesNotMatch(alertEdit, /CanonicalAlertPresetsPanel|Presets and Defaults/, 'Preset panel is removed from the canonical edit');
assert.match(libraryPanel, /Global Styles/, 'Styles sidebar labels global styles');
assert.match(
	libraryPanel,
	/setPendingGlobalStyleId\( String\( value \) \)/,
	'Changing the global style dropdown only updates pending selection'
);
assert.match(
	libraryPanel,
	/setPendingGlobalStyleId\( String\( globalStyleId \) \)/,
	'Pending global style resets when the attached id changes'
);
assert.match(
	libraryPanel,
	/__\( 'Apply', 'alerts-dlx' \)/,
	'Global style selection is confirmed with Apply'
);
assert.match(
	libraryPanel,
	/! pendingMatchesAttached &&/,
	'Apply is hidden when the pending style already matches'
);
assert.doesNotMatch(
	libraryPanel,
	/disabled=\{ pendingMatchesAttached \}/,
	'Apply is not left visible in a disabled state'
);
assert.match(
	libraryPanel,
	/if \( ! pendingId \) \{\s*detachGlobalStyle\(\);/,
	'Apply with None uses the shared detach path'
);
assert.doesNotMatch(
	libraryPanel,
	/This alert follows the selected global style/,
	'Global style select has no follow-style help text'
);
assert.match(
	libraryPanel,
	/Applying a preset copies its settings into this alert\. Later edits to the preset will not change it\./,
	'Preset help text stays in place'
);
assert.match(
	libraryPanel,
	/This alert follows %s\./,
	'Attached global style notice stays in place'
);
assert.match(libraryPanel, /__\( 'Presets', 'alerts-dlx' \)/, 'Styles sidebar labels snapshots as Presets');
assert.match(
	libraryPanel,
	/onClick=\{ \(\) => applySnapshot\( item\.id \) \}/,
	'Clicking a preset button applies it immediately'
);
assert.match(
	libraryPanel,
	/alerts-dlx-preset-buttons/,
	'Presets render as buttons'
);
assert.match(
	libraryPanel,
	/alerts-dlx-preset-popover/,
	'Hovering a preset shows a popover preview'
);
assert.match(
	libraryPanel,
	/libraryConfigToBlockAttributes/,
	'Preset preview maps snapshot config through the library helper'
);
assert.match(
	libraryPanel,
	/SNAPSHOT_BLOCK_KEYS/,
	'Preset preview uses the snapshot attribute allowlist'
);
assert.match(
	libraryPanel,
	/findLibraryItem\( snapshotId, 'snapshot' \)/,
	'Preset apply still loads the snapshot library item'
);
assert.match(
	libraryPanel,
	/buildSnapshotApplyAttributes/,
	'Preset apply still writes snapshot attributes'
);
assert.doesNotMatch(
	libraryPanel,
	/Apply preset/,
	'Presets panel has no separate Apply preset button'
);
assert.match(libraryPanel, /Detach the global style to apply a preset/, 'Preset buttons are hidden while a global style is attached');
assert.match(libraryPanel, /panelOpenState/, 'Panel open state survives inspector remounts');
assert.doesNotMatch(libraryPanel, /No global styles yet/, 'Empty global styles panel is hidden');
assert.doesNotMatch(libraryPanel, /No snapshots yet/, 'Empty presets panel is hidden');
assert.match(libraryPanel, /Detach/, 'Library panel exposes detach');
assert.match(
	fs.readFileSync('src/js/blocks/components/BlockMain/index.js', 'utf8'),
	/disabled=\{appearanceLocked\}/,
	'Canvas icon picker is disabled while a global style is attached'
);
assert.match(
	fs.readFileSync('src/js/blocks/components/IconPicker/index.js', 'utf8'),
	/disabled = false/,
	'Icon picker accepts a disabled prop'
);
assert.match(libraryUtils, /GLOBAL_STYLE_BLOCK_KEYS/, 'Editor maps global-style keys explicitly');
assert.match(libraryUtils, /SNAPSHOT_BLOCK_KEYS/, 'Editor maps snapshot keys explicitly');
assert.match(libraryUtils, /buildSnapshotApplyAttributes/, 'Snapshot apply clears globalStyleId');
assert.match(libraryUtils, /globalStyleHasIcon/, 'Inserter previews can still detect a style icon');
assert.doesNotMatch(
	libraryUtils.match(/export const GLOBAL_STYLE_BLOCK_KEYS = \[([\s\S]*?)\];/)[1],
	/'iconEnabled'/,
	'Enable Alert Icon stays editable while a global style is attached'
);
assert.doesNotMatch(
	fs.readFileSync('src/js/blocks/components/AlertSettingsPanel.js', 'utf8'),
	/Enable Alert Icon[\s\S]{0,180}disabled=\{/,
	'Enable Alert Icon toggle is not disabled in the sidebar'
);
assert.doesNotMatch(
	globalNamesMatch[1],
	/'icon_enabled'/,
	'Global styles do not persist icon_enabled; presence is derived from icon fields'
);
const variationsSource = fs.readFileSync('src/js/blocks/alert/variations.js', 'utf8');
assert.doesNotMatch(
	variationsSource,
	/getCanonicalAlertDefaults|canonicalDefaults/,
	'Variations do not depend on site preset defaults'
);
assert.match(variationsSource, /isDefault: goal\.name === defaultPurpose/, 'Success remains the insert default');
assert.match(variationsSource, /createLibraryInserterVariations/, 'Flagged library items become inserter variations');
assert.match(variationsSource, /showInInserter/, 'Library variations read the inserter flag');
assert.doesNotMatch(variationsSource, /'admin-page'/, 'Library variations do not use the generic page icon');

const alertMetadata = JSON.parse(fs.readFileSync('src/js/blocks/alert/block.json', 'utf8'));
const executableLibraryVariations = variationsSource
	.replace(/^import[\s\S]*?from '[^']+';\n/gm, '')
	.replace(/export function/g, 'function')
	.replace(/export default \[[\s\S]*?\];\s*$/, '');
const globalStyleIconStub = { stub: 'styles' };
const libraryVariations = new Function(
	'__',
	'getCanonicalAlertTypeForPurpose',
	'GLOBAL_STYLE_BLOCK_KEYS',
	'buildSnapshotApplyAttributes',
	'getLocalizedLibraryItems',
	'globalStyleHasIcon',
	'libraryConfigToBlockAttributes',
	'globalStyleIcon',
	'metadata',
	`${executableLibraryVariations}\nreturn createLibraryInserterVariations;`
)(
	(value) => value,
	() => 'success',
	[],
	(config) => ({ ...config, globalStyleId: 0 }),
	() => [],
	() => true,
	(config) => ({ ...config }),
	globalStyleIconStub,
	alertMetadata
)([
	{ id: 11, kind: 'global_style', title: 'Brand', showInInserter: true, config: { alertType: 'info' } },
	{ id: 12, kind: 'snapshot', title: 'Promo', showInInserter: '1', config: { alertType: 'warning', titleEnabled: false, buttonEnabled: true } },
	{ id: 13, kind: 'snapshot', title: 'Hidden', showInInserter: false, config: {} },
]);
assert.equal(libraryVariations.length, 2, 'Only flagged library items become inserter variations');
const [globalStyleVariation, snapshotVariation] = libraryVariations;
assert.equal(globalStyleVariation.icon, globalStyleIconStub, 'Global style variations use the styles icon');
assert.equal(snapshotVariation.icon, 'camera', 'Snapshot variations use the camera dashicon');
assert.equal(
	globalStyleVariation.example.attributes.alertTitle,
	alertMetadata.example.attributes.alertTitle,
	'Global style previews reuse the block example title'
);
assert.equal(
	globalStyleVariation.example.attributes.alertDescription,
	alertMetadata.example.attributes.alertDescription,
	'Global style previews reuse the block example description'
);
assert.equal(globalStyleVariation.example.attributes.globalStyleId, 11, 'Global style previews resolve the linked style');
assert.deepEqual(globalStyleVariation.attributes, { globalStyleId: 11 }, 'Global style insertion stores only the reference');
assert.equal(
	snapshotVariation.example.attributes.alertDescription,
	alertMetadata.example.attributes.alertDescription,
	'Snapshot previews reuse the block example description'
);
assert.equal(snapshotVariation.example.attributes.titleEnabled, false, 'Snapshot preview respects snapshot element toggles');
assert.equal(snapshotVariation.example.attributes.buttonText, 'Learn More', 'Snapshot preview labels an enabled button');
for (const variation of libraryVariations) {
	for (const key of ['alertTitle', 'alertDescription', 'buttonText']) {
		assert.equal(
			Object.hasOwn(variation.attributes, key),
			false,
			`${variation.name} preview ${key} must not leak into inserted attributes`
		);
	}
}
assert.match(alertLibrary, /META_SHOW_IN_INSERTER = '_alerts_dlx_show_in_inserter'/, 'Inserter flag meta key is defined');
assert.match(alertLibrary, /function set_show_in_inserter/, 'Inserter flag is saved per post');
assert.match(rest, /set_show_in_inserter/, 'Library REST writes the inserter flag');
assert.match(
	fs.readFileSync('src/react/AlertLibrary/LibraryEditor.js', 'utf8'),
	/Show in block inserter/,
	'Library editor exposes the inserter toggle'
);

assert.equal(
	fs.existsSync('php/CanonicalAlertPresets.php'),
	false,
	'CanonicalAlertPresets PHP class is removed'
);
assert.equal(
	fs.existsSync('src/js/blocks/components/CanonicalAlertPresetsPanel.js'),
	false,
	'CanonicalAlertPresetsPanel is removed'
);

console.log('Alert library contracts passed.');
