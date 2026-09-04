#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const budgets = {
	'build/index.js': 245760,
	'build/index.css': 12288,
	'build/index-rtl.css': 12288,
	'dist/alerts-dlx-admin-settings.js': 184320,
};

let totalEditorBytes = 0;
const receipts = {};
for (const [file, maximum] of Object.entries(budgets)) {
	assert.equal(fs.existsSync(file), true, `Generated release asset is present: ${file}`);
	const bytes = fs.statSync(file).size;
	receipts[file] = { bytes, maximum };
	assert.ok(bytes <= maximum, `${file} exceeded release budget: ${bytes} > ${maximum}`);
	if (file.startsWith('build/')) totalEditorBytes += bytes;
}
const editorEntrypointMaximum = 266240;
assert.ok(
	totalEditorBytes <= editorEntrypointMaximum,
	`Combined editor entrypoint exceeded release budget: ${totalEditorBytes} > ${editorEntrypointMaximum}`
);

console.log(JSON.stringify({
	status: 'PASS',
	contract: 'ALERTS_DLX_BUNDLE_BUDGET',
	receipts,
	editor_entrypoint_bytes: totalEditorBytes,
	editor_entrypoint_maximum: editorEntrypointMaximum,
}));
