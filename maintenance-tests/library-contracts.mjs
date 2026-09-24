#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const alertLibrary = fs.readFileSync( 'php/AlertLibrary.php', 'utf8' );
const shortcodeBuilder = fs.readFileSync( 'php/ShortcodeBuilder.php', 'utf8' );
const rest = fs.readFileSync( 'php/Rest.php', 'utf8' );
const admin = fs.readFileSync( 'php/Admin.php', 'utf8' );

assert.match( alertLibrary, /POST_TYPE = 'alerts_dlx_library'/, 'Alert library CPT slug is registered' );
assert.match( alertLibrary, /META_KIND = '_alerts_dlx_kind'/, 'Alert library kind meta is defined' );
assert.match( alertLibrary, /META_CONFIG = '_alerts_dlx_config'/, 'Alert library config meta is defined' );
assert.match( shortcodeBuilder, /get_global_style_input_names/, 'Global style allowlist is defined in ShortcodeBuilder' );
assert.match( shortcodeBuilder, /sanitize_global_style_values/, 'Global style sanitizer is defined' );
assert.match( rest, /\/library-items/, 'Library REST routes are registered' );
assert.match( admin, /global-styles/, 'Global Styles admin tab is wired' );
assert.match( admin, /globalStyleFields/, 'Global style field schema is localized' );

console.log( 'Alert library contracts passed.' );
