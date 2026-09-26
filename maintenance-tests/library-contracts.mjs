#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const alertLibrary = fs.readFileSync( 'php/AlertLibrary.php', 'utf8' );
const shortcodeBuilder = fs.readFileSync( 'php/ShortcodeBuilder.php', 'utf8' );
const rest = fs.readFileSync( 'php/Rest.php', 'utf8' );
const admin = fs.readFileSync( 'php/Admin.php', 'utf8' );
const blocks = fs.readFileSync( 'php/Blocks.php', 'utf8' );
const functions = fs.readFileSync( 'php/Functions.php', 'utf8' );
const canonicalBlock = JSON.parse(
	fs.readFileSync( 'src/js/blocks/alert/block.json', 'utf8' )
);
const libraryPanel = fs.readFileSync(
	'src/js/blocks/components/AlertLibraryPanel.js',
	'utf8'
);
const alertEdit = fs.readFileSync( 'src/js/blocks/alert/edit.js', 'utf8' );
const libraryUtils = fs.readFileSync(
	'src/js/blocks/utils/alert-library-utils.js',
	'utf8'
);

assert.match( alertLibrary, /POST_TYPE = 'alerts_dlx_library'/, 'Alert library CPT slug is registered' );
assert.match( alertLibrary, /META_KIND = '_alerts_dlx_kind'/, 'Alert library kind meta is defined' );
assert.match( alertLibrary, /META_CONFIG = '_alerts_dlx_config'/, 'Alert library config meta is defined' );
assert.match( alertLibrary, /KIND_SNAPSHOT = 'snapshot'/, 'Snapshot kind is defined' );
assert.match( alertLibrary, /sanitize_list_kind/, 'List kind sanitizer allows all kinds' );
assert.match( alertLibrary, /alerts_dlx_snapshot_config/, 'Snapshot config filter is registered' );
assert.match( alertLibrary, /maybe_seed_starter_snapshots/, 'Starter snapshot seeding is wired' );
assert.match( alertLibrary, /STARTER_SNAPSHOTS_SEEDED_OPTION/, 'Starter seed option flag is defined' );
assert.match( alertLibrary, /apply_global_style_to_block_attributes/, 'Global style merge helper exists for render' );
assert.match( alertLibrary, /get_items_for_editor/, 'Editor localization helper exists' );
assert.match( shortcodeBuilder, /get_global_style_input_names/, 'Appearance allowlist is defined in ShortcodeBuilder' );
assert.match( shortcodeBuilder, /sanitize_global_style_values/, 'Appearance sanitizer is defined' );
assert.match( shortcodeBuilder, /get_snapshot_input_names/, 'Snapshot allowlist is defined in ShortcodeBuilder' );
assert.match( shortcodeBuilder, /get_snapshot_fields/, 'Snapshot inspector fields are defined' );
assert.match( shortcodeBuilder, /get_snapshot_defaults/, 'Snapshot defaults are defined' );
assert.match( shortcodeBuilder, /sanitize_snapshot_values/, 'Snapshot sanitizer is defined' );
assert.match( shortcodeBuilder, /title_enabled/, 'Snapshots persist title visibility' );
assert.match( shortcodeBuilder, /description_enabled/, 'Snapshots persist description visibility' );
assert.match( shortcodeBuilder, /button_enabled/, 'Snapshots persist button visibility' );
assert.match( alertLibrary, /sanitize_snapshot_values/, 'Library snapshots use the snapshot sanitizer' );
assert.match( alertLibrary, /merge_snapshot_preview_values/, 'Snapshot preview merge honors stored toggles' );
assert.match( rest, /\/library-items/, 'Library REST routes are registered' );
assert.match( rest, /sanitize_list_kind/, 'Library list kind is optional' );
assert.match( rest, /library_read_permissions_check/, 'Library GET uses a read permission path' );
assert.match( rest, /edit_posts/, 'Library read allows editors who can edit posts' );
assert.match( admin, /styles-snapshots/, 'Styles & Snapshots admin tab is wired' );
assert.match( admin, /alerts-dlx-library/, 'Library mount and bundle are wired' );
assert.match( admin, /libraryFields/, 'Library field schema is localized' );
assert.match( admin, /snapshotFields/, 'Snapshot field schema is localized' );
assert.match( admin, /snapshotDefaults/, 'Snapshot defaults are localized' );
assert.match( admin, /libraryBoot/, 'Library boot state is localized' );
assert.match( functions, /INPUT_GET, 'item'/, 'Library item query arg is item' );
assert.doesNotMatch( admin, /tab=global-styles|globalStyleFields|alerts-dlx-global-styles/, 'Legacy global-styles tab contracts are removed' );

// Global-style vs snapshot field sets stay distinct.
const globalNamesMatch = shortcodeBuilder.match(
	/function get_global_style_input_names\(\) \{\s*return array\(([\s\S]*?)\);\s*\}/
);
const snapshotNamesMatch = shortcodeBuilder.match(
	/function get_snapshot_input_names\(\) \{([\s\S]*?)return array_values/
);
assert.ok( globalNamesMatch, 'Can parse global style input names' );
assert.ok( snapshotNamesMatch, 'Can parse snapshot input names merge' );
assert.match( shortcodeBuilder, /'align'/, 'Snapshots include align' );
assert.match( shortcodeBuilder, /close_button_expiration/, 'Snapshots include close expiration' );
assert.doesNotMatch(
	globalNamesMatch[ 1 ],
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
	Object.hasOwn( canonicalBlock.attributes, 'snapshotId' ),
	false,
	'Snapshots are not stored as a live block reference'
);
assert.match( blocks, /libraryItems/, 'Editor localizes library items' );
assert.match( blocks, /apply_global_style_to_block_attributes/, 'Frontend render merges global styles' );
assert.doesNotMatch( blocks, /CanonicalAlertPresets|canonicalPresets|canonicalDefaults/, 'Preset editor boot payload is removed' );
assert.match( alertEdit, /AlertLibraryPanel/, 'Canonical edit uses the Library panel' );
assert.doesNotMatch( alertEdit, /CanonicalAlertPresetsPanel|Presets and Defaults/, 'Preset panel is removed from the canonical edit' );
assert.match( libraryPanel, /Apply snapshot/, 'Library panel exposes snapshot apply' );
assert.match( libraryPanel, /Detach/, 'Library panel exposes detach' );
assert.match( libraryUtils, /GLOBAL_STYLE_BLOCK_KEYS/, 'Editor maps global-style keys explicitly' );
assert.match( libraryUtils, /SNAPSHOT_BLOCK_KEYS/, 'Editor maps snapshot keys explicitly' );
assert.match( libraryUtils, /buildSnapshotApplyAttributes/, 'Snapshot apply clears globalStyleId' );
assert.doesNotMatch(
	fs.readFileSync( 'src/js/blocks/alert/variations.js', 'utf8' ),
	/getCanonicalAlertDefaults|canonicalDefaults/,
	'Variations do not depend on site preset defaults'
);

assert.equal(
	fs.existsSync( 'php/CanonicalAlertPresets.php' ),
	false,
	'CanonicalAlertPresets PHP class is removed'
);
assert.equal(
	fs.existsSync( 'src/js/blocks/components/CanonicalAlertPresetsPanel.js' ),
	false,
	'CanonicalAlertPresetsPanel is removed'
);

console.log( 'Alert library contracts passed.' );
