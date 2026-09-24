/* eslint-disable no-undef */
import { __ } from "@wordpress/i18n";
import { renderToStaticMarkup } from "react-dom/server";
import { getIconSetForGroup } from "../../../js/blocks/utils/icon-sets";

export const groupLabels = {
	content: __("Content", "alerts-dlx"),
	appearance: __("Appearance", "alerts-dlx"),
	action: __("Button", "alerts-dlx"),
	icon: __("Icon or image", "alerts-dlx"),
	colors: __("Custom colors", "alerts-dlx"),
	dismiss: __("Dismiss", "alerts-dlx"),
	advanced: __("Advanced", "alerts-dlx"),
};

export const COLOR_FIELD_NAMES = [
	"color_primary",
	"color_border",
	"color_accent",
	"color_alt",
	"color_alt_hover",
	"color_alt_text",
	"color_alt_text_hover",
	"color_bold",
	"color_light",
];

const TYPE_TO_ICON_KEY = {
	danger: "error",
	primary: "info",
	neutral: "info",
	light: "info",
	dark: "info",
	secondary: "info",
};

/**
 * Return the info palette for one alert group.
 *
 * @param {string} alertGroup Alert design slug.
 * @return {Object} Color attribute map.
 */
export const getInfoColors = (alertGroup) =>
	alertsDlxAdmin.shortcodeBuilderInfoColors?.[alertGroup] || {};

export const colorsAreEmpty = (values) =>
	COLOR_FIELD_NAMES.every((name) => !values[name]);

export const colorsMatchInfo = (values, alertGroup) => {
	const infoColors = getInfoColors(alertGroup);
	if (!Object.keys(infoColors).length) {
		return false;
	}
	return COLOR_FIELD_NAMES.every(
		(name) => (values[name] || "") === (infoColors[name] || "")
	);
};

export const applyInfoColors = (values, alertGroup, fromGroup) => {
	const infoColors = getInfoColors(alertGroup);
	if (!Object.keys(infoColors).length) {
		return values;
	}
	if (
		colorsAreEmpty(values) ||
		(fromGroup && colorsMatchInfo(values, fromGroup))
	) {
		return { ...values, ...infoColors };
	}
	const next = { ...values };
	COLOR_FIELD_NAMES.forEach((name) => {
		if (!next[name] && infoColors[name]) {
			next[name] = infoColors[name];
		}
	});
	return next;
};

export const conditionMatches = (condition, values) => {
	if (!condition?.field || !condition?.operator) {
		return false;
	}

	const actual = values[condition.field];
	switch (condition.operator) {
		case "equals":
			return String(actual ?? "") === String(condition.value ?? "");
		case "not_equals":
			return String(actual ?? "") !== String(condition.value ?? "");
		case "filled":
			return "" !== String(actual ?? "").trim();
		case "is_true":
			return true === actual || "true" === actual || 1 === actual || "1" === actual;
		case "is_false":
			return true !== actual && "true" !== actual && 1 !== actual && "1" !== actual;
		default:
			return false;
	}
};

export const isFieldVisible = (field, values) => {
	if (!Array.isArray(field.show_when) || !field.show_when.length) {
		return true;
	}
	return field.show_when.every((condition) => conditionMatches(condition, values));
};

export const groupColorFields = (fields) => {
	const sections = [];
	const indexBySubgroup = {};

	fields.forEach((field) => {
		const subgroup = field.subgroup || "";
		if (undefined === indexBySubgroup[subgroup]) {
			indexBySubgroup[subgroup] = sections.length;
			sections.push({
				subgroup,
				fields: [],
			});
		}
		sections[indexBySubgroup[subgroup]].fields.push(field);
	});

	return sections;
};

export const isCommitableColor = (raw) => {
	const next = (raw || "").trim();
	if ("" === next) {
		return true;
	}
	if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(next)) {
		return true;
	}
	if (/^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s+/\-]+\)$/i.test(next)) {
		return true;
	}
	if (/^var\(\s*--[a-zA-Z0-9_-]+(?:\s*,\s*(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(?:rgb|rgba|hsl|hsla)\([0-9.,%\s+/\-]+\)|var\(\s*--[a-zA-Z0-9_-]+\s*\)|[a-zA-Z]+))?\s*\)$/.test(next)) {
		return true;
	}
	if (/^[a-zA-Z]+$/.test(next)) {
		return true;
	}
	return false;
};

/**
 * Sample icon markup for preview when a style stores no icon.
 *
 * @param {string} alertGroup Alert design slug.
 * @param {string} alertType  Alert type slug.
 * @return {string} SVG markup or empty string.
 */
export const getSampleIconMarkup = (alertGroup, alertType) => {
	const icons = getIconSetForGroup(alertGroup);
	const key = TYPE_TO_ICON_KEY[alertType] || alertType;
	const entry = icons[key] || icons.info || Object.values(icons)[0];
	if (!entry?.icon) {
		return "";
	}
	try {
		return renderToStaticMarkup(entry.icon);
	} catch (error) {
		return "";
	}
};

/**
 * Merge stored values with a preview fixture for server render.
 *
 * @param {Object} storedValues Config values.
 * @param {Object} fixture       Preview-only overlay.
 * @param {Object} options       Options.
 * @return {Object} Merged preview payload.
 */
export const mergePreviewValues = (storedValues, fixture = {}, options = {}) => {
	const merged = {
		...fixture,
		...storedValues,
	};
	if (!merged.unique_id) {
		merged.unique_id = fixture.unique_id || "alerts-dlx-admin-preview";
	}
	if (options.iconFallback && !merged.icon && !merged.image_url) {
		const sample = getSampleIconMarkup(merged.alert_group, merged.alert_type);
		if (sample) {
			merged.icon = sample;
		}
	}
	return merged;
};

/**
 * Apply alert_group and alert_type side effects when a field changes.
 *
 * @param {string} name    Field name.
 * @param {*}      value   New value.
 * @param {Object} current Current values.
 * @param {Array}  fields  Field schema.
 * @return {Object} Next values.
 */
export const applyBuilderFieldChange = (name, value, current, fields) => {
	let next = { ...current, [name]: value };
	if ("alert_group" === name) {
		const typeField = fields.find((field) => "alert_type" === field.name);
		const variantField = fields.find((field) => "variant" === field.name);
		const typeOptions = typeField?.options_by_theme?.[value] || [];
		const variantOptions = variantField?.options_by_theme?.[value] || [];
		if (!typeOptions.some((option) => option.value === next.alert_type)) {
			next.alert_type = typeOptions[0]?.value || "success";
		}
		next.variant = variantOptions[0]?.value || "default";
		next = applyInfoColors(next, value, current.alert_group);
	}
	if ("alert_type" === name && "custom" === value) {
		next = applyInfoColors(next, next.alert_group);
	}
	return next;
};
