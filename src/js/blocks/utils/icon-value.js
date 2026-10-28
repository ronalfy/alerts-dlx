/**
 * Catalog-key vs raw-SVG helpers for WAF-safe icon transport.
 */

import { renderToString } from "@wordpress/element";
import sanitizeSVG from "./sanitize-svg";

/**
 * Whether a stored icon value is inline SVG markup.
 *
 * @param {string} value Icon value.
 * @return {boolean} Whether the value contains an svg tag.
 */
export const isRawSvg = (value) =>
	"string" === typeof value && /<svg/i.test(value);

/**
 * Whether a stored icon value is a key in the supplied catalog.
 *
 * @param {string} value Icon value.
 * @param {Object} icons Preset icon map.
 * @return {boolean} Whether the value is a catalog key.
 */
export const isCatalogIconKey = (value, icons) =>
	"string" === typeof value &&
	"" !== value.trim() &&
	!isRawSvg(value) &&
	Boolean(icons?.[value]);

/**
 * Return a catalog key for a preview fallback icon.
 *
 * @param {Object} icons     Preset icon map.
 * @param {string} alertType Alert type slug.
 * @param {Object} typeMap   Type-to-key map.
 * @return {string} Catalog key or empty string.
 */
export const getSampleIconKey = (icons, alertType, typeMap = {}) => {
	const mapped = typeMap[alertType] || alertType;
	if (icons?.[mapped]) {
		return mapped;
	}
	if (icons?.info) {
		return "info";
	}
	const first = Object.keys(icons || {})[0];
	return first || "";
};

/**
 * Resolve a stored icon to SVG markup for display.
 *
 * @param {string} value Icon key or markup.
 * @param {Object} icons Preset icon map.
 * @return {string} SVG markup or empty string.
 */
export const resolveIconMarkup = (value, icons) => {
	if (!value || "string" !== typeof value) {
		return "";
	}
	if (isCatalogIconKey(value, icons)) {
		try {
			return renderToString(icons[value].icon);
		} catch (error) {
			return "";
		}
	}
	if (isRawSvg(value)) {
		return sanitizeSVG(value);
	}
	return "";
};

/**
 * Append or replace a shortcode icon attribute.
 *
 * @param {string} shortcode Generated shortcode.
 * @param {string} icon      Icon key or markup.
 * @return {string} Shortcode with an icon attribute when quoting is possible.
 */
export const appendIconAttribute = (shortcode, icon) => {
	if (!shortcode || !icon) {
		return shortcode;
	}
	const hasDouble = icon.includes('"');
	const hasSingle = icon.includes("'");
	if (hasDouble && hasSingle) {
		return shortcode;
	}
	const quoted = hasDouble ? `'${icon}'` : `"${icon}"`;
	if (/\sicon=/.test(shortcode)) {
		return shortcode.replace(/\sicon=(?:"[^"]*"|'[^']*')/, ` icon=${quoted}`);
	}
	return shortcode.replace(/\[alertsdlx\b/, `[alertsdlx icon=${quoted}`);
};

/**
 * Inject sanitized custom SVG into a server-rendered preview.
 *
 * @param {string} html Preview HTML.
 * @param {string} icon Custom SVG markup.
 * @return {string} Preview HTML with the custom icon applied.
 */
export const injectPreviewIcon = (html, icon) => {
	const markup = sanitizeSVG(icon);
	if (!html || !markup) {
		return html;
	}
	if (typeof window === "undefined" || !window.DOMParser) {
		return html;
	}
	try {
		const parser = new window.DOMParser();
		const doc = parser.parseFromString(html, "text/html");
		const preview = doc.querySelector(".alerts-dlx-icon-preview");
		if (!preview) {
			return html;
		}
		preview.innerHTML = markup;
		return doc.body.innerHTML;
	} catch (error) {
		return html;
	}
};
