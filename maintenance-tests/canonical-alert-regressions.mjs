#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const canonicalName = 'mediaron/alerts-dlx-alert';
const historical = {
	bootstrap: {
		name: 'mediaron/alerts-dlx-bootstrap',
		metadata: 'src/js/blocks/bootstrap/block.json',
		index: 'src/js/blocks/bootstrap/index.js',
		variant: 'default',
	},
	chakra: {
		name: 'mediaron/alerts-dlx-chakra',
		metadata: 'src/js/blocks/chakraui/block.json',
		index: 'src/js/blocks/chakraui/index.js',
		variant: 'subtle',
	},
	material: {
		name: 'mediaron/alerts-dlx-material',
		metadata: 'src/js/blocks/material/block.json',
		index: 'src/js/blocks/material/index.js',
		variant: 'default',
	},
	shoelace: {
		name: 'mediaron/alerts-dlx-shoelace',
		metadata: 'src/js/blocks/shoelace/block.json',
		index: 'src/js/blocks/shoelace/index.js',
		variant: 'top-accent',
	},
};

const canonicalMetadata = JSON.parse(
	fs.readFileSync('src/js/blocks/alert/block.json', 'utf8')
);
assert.equal(canonicalMetadata.name, canonicalName, 'Canonical public block name stays stable');
assert.equal(canonicalMetadata.category, 'alertsdlx', 'Canonical Alert remains in the primary AlertsDLX category');
assert.equal(
	typeof canonicalMetadata.example?.attributes?.alertDescription,
	'string',
	'Preview copy remains available through block example metadata'
);
assert.ok(
	canonicalMetadata.example.attributes.alertDescription.length > 0,
	'Preview description is non-empty'
);

for (const [group, item] of Object.entries(historical)) {
	const metadata = JSON.parse(fs.readFileSync(item.metadata, 'utf8'));
	assert.equal(metadata.name, item.name, `${group} historical public block name stays stable`);
	assert.equal(metadata.category, 'alertsdlx-legacy', `${group} is discoverability-only legacy metadata`);
}

const variationSource = fs.readFileSync('src/js/blocks/alert/variations.js', 'utf8');
const executableVariations = variationSource
	.replace(/^import .*;\n/gm, '')
	.replace(/export default \[/, 'const variations = [');
const loadVariations = new Function(
	'__',
	`${executableVariations}\nreturn { commonAttributes, variations };`
);
const { commonAttributes, variations } = loadVariations((value) => value);
assert.equal(
	Object.hasOwn(commonAttributes, 'alertDescription'),
	false,
	'Preview description must never live in common insertion attributes'
);
assert.equal(variations.length, 7, 'Seven canonical public variations remain available');
for (const variation of variations) {
	assert.equal(
		Object.hasOwn(variation.attributes, 'alertDescription'),
		false,
		`${variation.name} insertion attributes must not seed preview description content`
	);
}

const sidebar = fs.readFileSync(
	'src/js/blocks/components/AlertTypeStyleControl.js',
	'utf8'
);
assert.match(
	sidebar,
	/getAlertStyleOptions\(\s*name,\s*alertGroup\s*\)/,
	'Styles sidebar resolves design-specific metadata through the shared helper'
);
assert.match(
	sidebar,
	/\[\s*name,\s*alertGroup\s*\]/,
	'Styles sidebar refreshes when the selected design changes'
);
assert.match(sidebar, /applyAlertStyle\(/, 'Styles sidebar mutates styles only through the shared style helper');
assert.match(
	sidebar,
	/openAlertInspectorTab\(\s*clientId,\s*'styles'\s*\)/,
	'Custom style opens the existing Styles inspector path'
);
assert.doesNotMatch(sidebar, /\buseEffect\b/, 'Styles sidebar must not mutate saved attributes merely by rendering');

const blocksPhp = fs.readFileSync('php/Blocks.php', 'utf8');
for (const [group, item] of Object.entries(historical)) {
	assert.ok(blocksPhp.includes(`'${item.name}'`), `Runtime keeps ${item.name} registered`);
	assert.ok(blocksPhp.includes(`=> '${group}'`), `Disabled-style map keeps ${group}`);
}
assert.match(
	blocksPhp,
	/Options::is_block_style_enabled\(/,
	'Disabled historical designs still use the established settings gate'
);
assert.match(
	blocksPhp,
	/\$args\['supports'\]\['inserter'\]\s*=\s*false/,
	'Disabled historical designs are hidden from insertion without unregistering saved content'
);
assert.doesNotMatch(blocksPhp, /unregister_block_type\s*\(/, 'Saved historical content is never orphaned by unregistering its type');

for (const indexPath of [
	'src/js/blocks/alert/index.js',
	...Object.values(historical).map((item) => item.index),
]) {
	const source = fs.readFileSync(indexPath, 'utf8');
	assert.match(
		source,
		/save\(\)\s*\{\s*return\s*<InnerBlocks\.Content\s*\/>;\s*\}/s,
		`${indexPath} keeps the saved InnerBlocks serialization boundary`
	);
}

const canonicalTransformSource = fs.readFileSync(
	'src/js/blocks/utils/canonical-alert-transforms.js',
	'utf8'
);
const executableTransforms = canonicalTransformSource
	.replace(/^import .*;\n/gm, '')
	.replace(/export function /g, 'function ');
const loadTransforms = new Function(
	'createBlock',
	`${executableTransforms}\nreturn { createCanonicalAlertTransforms, isCanonicalAlertLosslessForHistoricalBlock, inferCanonicalAlertPurpose };`
);
const transformRuntime = loadTransforms(
	(name, attributes, innerBlocks) => ({ name, attributes, innerBlocks })
);
const canonicalTransforms = transformRuntime.createCanonicalAlertTransforms();
assert.equal(canonicalTransforms.from.length, 4, 'Four historical-to-canonical transforms remain registered');
assert.equal(canonicalTransforms.to.length, 4, 'Four guarded canonical-to-historical transforms remain registered');

for (const [group, item] of Object.entries(historical)) {
	const innerBlocks = [{ name: 'core/paragraph', attributes: { content: 'Preserved body' } }];
	const sourceAttributes = {
		alertTitle: 'Preserved title',
		uniqueId: `preserved-${group}`,
		className: 'custom-class is-style-success',
		alertType: 'success',
		variant: item.variant,
	};
	const from = canonicalTransforms.from.find((descriptor) => descriptor.blocks[0] === item.name);
	assert.ok(from, `Historical ${group} has a canonical transform`);
	const canonical = from.transform(sourceAttributes, innerBlocks);
	assert.equal(canonical.name, canonicalName, `${group} converts to canonical Alert`);
	assert.equal(canonical.attributes.alertTitle, 'Preserved title', `${group} preserves title`);
	assert.equal(canonical.attributes.uniqueId, `preserved-${group}`, `${group} preserves identity on migration`);
	assert.equal(canonical.attributes.alertGroup, group, `${group} binds canonical design group`);
	assert.equal(canonical.attributes.purpose, 'success', `${group} infers recoverable purpose`);
	assert.equal(canonical.innerBlocks, innerBlocks, `${group} preserves InnerBlocks`);

	const canonicalAttributes = {
		...sourceAttributes,
		alertGroup: group,
		purpose: 'success',
		iconAppearance: 'rounded',
		isBlockAdminOnly: false,
		adminOnlyBlockExpiresEnabled: false,
		adminOnlyBlockExpires: null,
	};
	const to = canonicalTransforms.to.find((descriptor) => descriptor.blocks[0] === item.name);
	assert.ok(to, `Canonical Alert has a ${group} historical target`);
	assert.equal(to.isMatch(canonicalAttributes), true, `${group} lossless target is offered`);
	const restored = to.transform(canonicalAttributes, innerBlocks);
	assert.equal(restored.name, item.name, `Canonical Alert restores ${group}`);
	assert.equal(restored.attributes.alertTitle, 'Preserved title', `${group} restore preserves title`);
	assert.equal(restored.attributes.uniqueId, `preserved-${group}`, `${group} restore preserves identity`);
	assert.equal(Object.hasOwn(restored.attributes, 'purpose'), false, `${group} strips canonical-only purpose`);
	assert.equal(restored.innerBlocks, innerBlocks, `${group} restore preserves InnerBlocks`);
}

const chakraTarget = canonicalTransforms.to.find(
	(descriptor) => descriptor.blocks[0] === historical.chakra.name
);
const lossy = {
	alertGroup: 'chakra',
	alertType: 'success',
	variant: 'subtle',
	purpose: 'tip',
	iconAppearance: 'rounded',
	isBlockAdminOnly: false,
	adminOnlyBlockExpiresEnabled: false,
	adminOnlyBlockExpires: null,
};
assert.equal(chakraTarget.isMatch(lossy), false, 'Lossy canonical-to-historical transform stays hidden');
assert.throws(
	() => chakraTarget.transform(lossy, []),
	/Refusing lossy canonical Alert transform/,
	'Lossy canonical-to-historical transform fails closed even if called directly'
);

console.log('Canonical Alert release anti-regression contracts passed.');
