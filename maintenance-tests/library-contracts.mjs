#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const alertLibrary = fs.readFileSync( 'php/AlertLibrary.php', 'utf8' );
const shortcodeBuilder = fs.readFileSync( 'php/ShortcodeBuilder.php', 'utf8' );
const rest = fs.readFileSync( 'php/Rest.php', 'utf8' );
const admin = fs.readFileSync( 'php/Admin.php', 'utf8' );
const functions = fs.readFileSync( 'php/Functions.php', 'utf8' );

assert.match( alertLibrary, /POST_TYPE = 'alerts_dlx_library'/, 'Alert library CPT slug is registered' );
assert.match( alertLibrary, /META_KIND = '_alerts_dlx_kind'/, 'Alert library kind meta is defined' );
assert.match( alertLibrary, /META_CONFIG = '_alerts_dlx_config'/, 'Alert library config meta is defined' );
assert.match( alertLibrary, /KIND_SNAPSHOT = 'snapshot'/, 'Snapshot kind is defined' );
assert.match( alertLibrary, /sanitize_list_kind/, 'List kind sanitizer allows all kinds' );
assert.match( alertLibrary, /alerts_dlx_snapshot_config/, 'Snapshot config filter is registered' );
assert.match( shortcodeBuilder, /get_global_style_input_names/, 'Appearance allowlist is defined in ShortcodeBuilder' );
assert.match( shortcodeBuilder, /sanitize_global_style_values/, 'Appearance sanitizer is defined' );
assert.match( rest, /\/library-items/, 'Library REST routes are registered' );
assert.match( rest, /sanitize_list_kind/, 'Library list kind is optional' );
assert.match( admin, /styles-snapshots/, 'Styles & Snapshots admin tab is wired' );
assert.match( admin, /alerts-dlx-library/, 'Library mount and bundle are wired' );
assert.match( admin, /libraryFields/, 'Library field schema is localized' );
assert.match( admin, /libraryBoot/, 'Library boot state is localized' );
assert.match( functions, /INPUT_GET, 'item'/, 'Library item query arg is item' );
assert.doesNotMatch( admin, /tab=global-styles|globalStyleFields|alerts-dlx-global-styles/, 'Legacy global-styles tab contracts are removed' );

console.log( 'Alert library contracts passed.' );
