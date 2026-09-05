#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const php = read('php/ShortcodeBuilder.php');
const functions = read('php/Functions.php');
const blocks = read('php/Blocks.php');
const builder = read('src/react/ShortcodeBuilder/ShortcodeBuilder.js');
const dismiss = read('src/js/dismiss/index.js');

let assertions = 0;
const contains = (source, needle, label) => {
	assert.equal(source.includes(needle), true, label);
	assertions += 1;
};

contains(php, 'private const MAX_EXTRA_ATTRIBUTES = 32;', 'Builder extra-attribute cap is present');
contains(php, "count( $values['extra_attributes'] ) > self::MAX_EXTRA_ATTRIBUTES", 'Builder enforces the extra-attribute cap');
contains(php, 'alerts_dlx_builder_extra_limit', 'Builder returns the bounded-attributes error');
contains(php, 'alerts_dlx_builder_scalar', 'Builder rejects non-scalar request fields');
contains(php, 'wp_verify_nonce', 'Builder keeps nonce verification');
contains(php, "current_user_can( 'manage_options' )", 'Builder keeps the capability boundary');

// Blocks.php contains the public-shortcode boundary. Reading this file without
// asserting its guards would allow the most security-sensitive W052 changes to
// disappear while the source contract still reported PASS.
contains(blocks, "sanitize_html_class( (string) $atts['unique_id'] )", 'Shortcode ID is safe for CSS and HTML');
contains(blocks, "$allowed_alert_groups = array( 'bootstrap', 'chakra', 'material', 'shoelace' );", 'Shortcode design systems are allowlisted');
contains(blocks, "$atts['alert_group'] = $defaults['alert_group'];", 'Invalid shortcode design systems fall back safely');
contains(blocks, "$allowed_width_units = array( 'px', 'em', 'rem', '%', 'vw' );", 'Shortcode width units are allowlisted');
contains(blocks, "$atts['maximum_width_unit'] = $defaults['maximum_width_unit'];", 'Invalid shortcode width units fall back safely');
contains(functions, 'public static function sanitize_css_color( $value )', 'Shared CSS color sanitizer is present');
contains(blocks, "Functions::sanitize_css_color( (string) $atts[ $color_field ] )", 'Shortcode colors are allowlisted');
contains(blocks, "strlen( (string) $atts['icon'] ) > 12000", 'Shortcode icon bytes are bounded before KSES');
contains(blocks, "wp_kses( (string) $atts['icon'], Functions::get_kses_allowed_html() )", 'Shortcode icon markup is sanitized');
contains(blocks, 'xlink:href|href', 'Shortcode icon references are inspected');
contains(blocks, '(?!#)', 'Only local SVG fragments survive the reference guard');
contains(blocks, "min( 5000, max( 1, (int) $atts['maximum_width'] ) )", 'Shortcode width is bounded');
contains(blocks, "min( 96, max( 8, (int) $atts['base_font_size'] ) )", 'Shortcode font size is bounded');
contains(blocks, "min( 31536000, max( 0, (int) $atts['close_button_expiration'] ) )", 'Shortcode cookie lifetime is bounded');
contains(blocks, 'substr( (string) $content, 0, 20000 )', 'Shortcode content is bounded before filters');
contains(blocks, "$atts['alert_description'] = substr( (string) $atts['alert_description'], 0, 20000 );", 'Filtered shortcode content is bounded before rendering');

contains(builder, '["number", "url"].includes(field.control)', 'Builder exposes semantic input types');
contains(builder, '"color" === field.control', 'Builder exposes a dedicated color control');
contains(builder, 'const isFieldVisible = (field, values)', 'Builder evaluates field visibility from schema metadata');
contains(builder, 'isFieldVisible(field, values)', 'Builder filters controls through field visibility');
contains(builder, 'field.show_when.every', 'Builder ANDs every show_when condition');
contains(builder, 'aria-live="assertive"', 'Builder errors are announced assertively');
contains(builder, 'aria-busy={loading}', 'Builder preview exposes busy state');
contains(builder, 'Updating shortcode preview', 'Builder exposes readable loading status');
assert.equal(
	builder.includes('"colors" === group && "custom" !== values.alert_type'),
	false,
	'Builder no longer hardcodes the custom-colors group gate'
);
assertions += 1;

contains(php, 'private static function field_is_visible', 'Builder generation shares the field visibility helper');
contains(php, "self::field_is_visible( $fields_by_name[ $name ], $values )", 'Builder omits hidden attributes from generated shortcodes');
contains(php, "'field'    => 'button_url',\n\t\t\t\t\t\t'operator' => 'filled',", 'Button URL dependents use a filled visibility rule');
contains(php, "'field'    => 'icon_source',\n\t\t\t\t\t\t'operator' => 'equals',\n\t\t\t\t\t\t'value'    => 'icon',", 'Icon SVG is gated on icon source');
contains(php, "'field'    => 'icon_source',\n\t\t\t\t\t\t'operator' => 'equals',\n\t\t\t\t\t\t'value'    => 'image',", 'Image fields are gated on icon source');
contains(php, "'field'    => 'close_button_enabled',\n\t\t\t\t\t\t'operator' => 'is_true',", 'Dismiss duration is gated on the dismiss toggle');
contains(php, "'field'    => 'alert_type',\n\t\t\t\t\t\t'operator' => 'equals',\n\t\t\t\t\t\t'value'    => 'custom',", 'Custom colors are gated on alert type');

contains(dismiss, 'try {\n\t\treturn decodeURIComponent( match[ 1 ] );', 'Malformed cookies fail closed');
contains(dismiss, 'const boundedMaxAge = Math.min( 31536000, Math.max( 1, maxAge ) );', 'Client cookie lifetime is bounded');
contains(dismiss, 'closeButton.dataset.alertsDlxBound', 'Dismiss controls bind once');
contains(dismiss, '(prefers-reduced-motion: reduce)', 'Reduced-motion dismissal is supported');
contains(dismiss, 'window.setTimeout( removeAlert, 1000 )', 'Dismissal has an animation fallback');

const combined = [php, functions, blocks, builder, dismiss].join('\n');
for (const [label, forbidden] of [
	['WordPress HTTP API', /\bwp_(?:safe_)?remote_(?:get|post|request|head)\s*\(/i],
	['direct external fetch', /\bfetch\s*\(\s*['"`]\s*https?:/i],
	['sendBeacon', /\bnavigator\s*\.\s*sendBeacon\s*\(/i],
	['XMLHttpRequest', /\bXMLHttpRequest\b/i],
	['persistent browser channel', /\b(?:WebSocket|EventSource)\s*\(/i],
	['gtag', /\bgtag\s*\(/i],
	['analytics', /\banalytics\b/i],
	['telemetry', /\btelemetry\b/i],
]) {
	assert.doesNotMatch(combined, forbidden, `W052 introduced forbidden remote/tracking surface: ${label}`);
	assertions += 1;
}

console.log(JSON.stringify({
	status: 'PASS',
	milestone: 'RELEASE_HARDENING',
	assertions,
	files_checked: 5,
	remote_or_tracking_surface_added: false,
}));
