/**
 * localStorage helpers for the Styles & Presets DataViews view.
 *
 * Stored values are sanitized. The default view is not written.
 */

export const LIBRARY_VIEW_STORAGE_KEY = "alerts-dlx-library-view";

export const DEFAULT_LIBRARY_VIEW = {
	type: "table",
	search: "",
	page: 1,
	perPage: 20,
	sort: {
		field: "title",
		direction: "asc",
	},
	titleField: "title",
	fields: ["kind", "alert_group", "alert_type", "variant"],
	filters: [],
	layout: {},
};

const PAGE_SIZES = [10, 20, 50, 100];
const SORT_FIELDS = [
	"title",
	"kind",
	"slug",
	"showInInserter",
	"alert_group",
	"alert_type",
	"variant",
	"modified",
];
const COLUMN_FIELDS = SORT_FIELDS.filter((fieldId) => "title" !== fieldId);
const KIND_VALUES = ["global_style", "snapshot"];
const DENSITIES = ["compact", "balanced", "comfortable"];
const ALIGNS = ["start", "center", "end"];
const STYLE_SIZE_PATTERN = /^[\d.]+(%|px|em|rem|ch|vw)?$/;

/**
 * Whether a value is a plain object.
 *
 * @param {*} value Candidate value.
 * @return {boolean} Whether the value is a plain object.
 */
const isPlainObject = (value) =>
	Boolean(value) && "object" === typeof value && !Array.isArray(value);

/**
 * Keep a column size that can be applied as CSS.
 *
 * @param {*} value Raw size.
 * @return {number|string|undefined} Sanitized size.
 */
const sanitizeStyleSize = (value) => {
	if ("number" === typeof value && Number.isFinite(value) && value >= 0) {
		return value;
	}
	if ("string" !== typeof value) {
		return undefined;
	}
	const size = value.trim();
	if (!size || size.length > 16 || !STYLE_SIZE_PATTERN.test(size)) {
		return undefined;
	}
	return size;
};

/**
 * Keep supported column style keys for one field.
 *
 * @param {*} style Raw column style.
 * @return {Object|null} Sanitized style, or null when nothing remains.
 */
const sanitizeColumnStyle = (style) => {
	if (!isPlainObject(style)) {
		return null;
	}
	const next = {};
	["width", "maxWidth", "minWidth"].forEach((key) => {
		const size = sanitizeStyleSize(style[key]);
		if (undefined !== size) {
			next[key] = size;
		}
	});
	if (ALIGNS.includes(style.align)) {
		next.align = style.align;
	}
	return Object.keys(next).length ? next : null;
};

/**
 * Keep density and column styles from a table layout.
 *
 * @param {*} layout Raw layout.
 * @return {Object} Sanitized layout.
 */
const sanitizeLayout = (layout) => {
	if (!isPlainObject(layout)) {
		return {};
	}
	const next = {};
	if (DENSITIES.includes(layout.density)) {
		next.density = layout.density;
	}
	if (!isPlainObject(layout.styles)) {
		return next;
	}
	const styles = {};
	COLUMN_FIELDS.forEach((fieldId) => {
		const style = sanitizeColumnStyle(layout.styles[fieldId]);
		if (style) {
			styles[fieldId] = style;
		}
	});
	if (Object.keys(styles).length) {
		next.styles = styles;
	}
	return next;
};

/**
 * Keep the kind filter and its allowlisted values.
 *
 * An empty value is preserved so an opened filter is not dropped
 * before the user picks a kind.
 *
 * @param {*} filters Raw filters.
 * @return {Array} Sanitized filters.
 */
const sanitizeFilters = (filters) => {
	if (!Array.isArray(filters)) {
		return [];
	}
	const kindFilters = filters.filter(
		(filter) =>
			isPlainObject(filter) &&
			"kind" === filter.field &&
			"isAny" === filter.operator
	);
	if (!kindFilters.length) {
		return [];
	}
	const value = [];
	kindFilters.forEach((filter) => {
		if (!Array.isArray(filter.value)) {
			return;
		}
		filter.value.forEach((item) => {
			if (KIND_VALUES.includes(item) && !value.includes(item)) {
				value.push(item);
			}
		});
	});
	return [
		{
			field: "kind",
			operator: "isAny",
			value,
		},
	];
};

/**
 * Return a view limited to the keys this list understands.
 *
 * @param {*} view Raw view.
 * @return {Object} Sanitized view.
 */
export const sanitizeLibraryView = (view) => {
	const source = isPlainObject(view) ? view : {};
	let fields = [...DEFAULT_LIBRARY_VIEW.fields];
	if (Array.isArray(source.fields)) {
		fields = [];
		source.fields.forEach((fieldId) => {
			if (COLUMN_FIELDS.includes(fieldId) && !fields.includes(fieldId)) {
				fields.push(fieldId);
			}
		});
	}

	const sortIsValid =
		isPlainObject(source.sort) &&
		SORT_FIELDS.includes(source.sort.field) &&
		("asc" === source.sort.direction || "desc" === source.sort.direction);

	const page = Number.isInteger(source.page) && source.page >= 1 ? source.page : 1;

	return {
		type: "table",
		search: "string" === typeof source.search ? source.search : "",
		page,
		perPage: PAGE_SIZES.includes(source.perPage) ? source.perPage : DEFAULT_LIBRARY_VIEW.perPage,
		sort: sortIsValid
			? {
				field: source.sort.field,
				direction: source.sort.direction,
			}
			: {
				field: DEFAULT_LIBRARY_VIEW.sort.field,
				direction: DEFAULT_LIBRARY_VIEW.sort.direction,
			},
		titleField: "title",
		fields,
		filters: sanitizeFilters(source.filters),
		layout: sanitizeLayout(source.layout),
	};
};

/**
 * Whether a view matches the default table after sanitizing.
 *
 * @param {Object} view View to compare.
 * @return {boolean} Whether the view is the default.
 */
export const isDefaultLibraryView = (view) =>
	JSON.stringify(sanitizeLibraryView(view)) ===
	JSON.stringify(sanitizeLibraryView(DEFAULT_LIBRARY_VIEW));

/**
 * Read the saved view, or the default when storage is empty or invalid.
 *
 * @return {Object} View to display.
 */
export const loadLibraryView = () => {
	try {
		const raw = window.localStorage.getItem(LIBRARY_VIEW_STORAGE_KEY);
		if (!raw) {
			return sanitizeLibraryView(DEFAULT_LIBRARY_VIEW);
		}
		return sanitizeLibraryView(JSON.parse(raw));
	} catch {
		return sanitizeLibraryView(DEFAULT_LIBRARY_VIEW);
	}
};

/**
 * Remove the saved view.
 */
export const clearLibraryView = () => {
	try {
		window.localStorage.removeItem(LIBRARY_VIEW_STORAGE_KEY);
	} catch {
		// Storage can be unavailable. The in-memory view still resets.
	}
};

/**
 * Save a sanitized view. The default view clears storage instead.
 *
 * @param {Object} view Next view.
 * @return {Object} Sanitized view.
 */
export const saveLibraryView = (view) => {
	const next = sanitizeLibraryView(view);
	try {
		if (isDefaultLibraryView(next)) {
			window.localStorage.removeItem(LIBRARY_VIEW_STORAGE_KEY);
		} else {
			window.localStorage.setItem(LIBRARY_VIEW_STORAGE_KEY, JSON.stringify(next));
		}
	} catch {
		// Ignore quota and privacy-mode failures.
	}
	return next;
};
