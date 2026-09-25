import { __ } from "@wordpress/i18n";

export const KIND_GLOBAL_STYLE = "global_style";
export const KIND_SNAPSHOT = "snapshot";

/**
 * Return the user-facing label for a library kind.
 *
 * @param {string} kind Library kind slug.
 * @return {string} Kind label.
 */
export const getKindLabel = (kind) =>
	KIND_SNAPSHOT === kind
		? __("Snapshot", "alerts-dlx")
		: __("Global style", "alerts-dlx");

/**
 * Return parameterized copy for a library kind.
 *
 * @param {string} kind Library kind slug.
 * @return {Object} Label map.
 */
export const getLibraryLabels = (kind) => {
	if (KIND_SNAPSHOT === kind) {
		return {
			singular: __("Snapshot", "alerts-dlx"),
			add: __("Add snapshot", "alerts-dlx"),
			save: __("Save snapshot", "alerts-dlx"),
			saved: __("Snapshot saved.", "alerts-dlx"),
			loadError: __("Could not load this snapshot.", "alerts-dlx"),
			saveError: __("Could not save this snapshot.", "alerts-dlx"),
			deleteError: __("Could not delete this snapshot.", "alerts-dlx"),
			deleteConfirm: __("Delete this snapshot permanently?", "alerts-dlx"),
			name: __("Snapshot name", "alerts-dlx"),
			duplicateAs: __("Duplicate as global style", "alerts-dlx"),
		};
	}

	return {
		singular: __("Global style", "alerts-dlx"),
		add: __("Add global style", "alerts-dlx"),
		save: __("Save global style", "alerts-dlx"),
		saved: __("Global style saved.", "alerts-dlx"),
		loadError: __("Could not load this global style.", "alerts-dlx"),
		saveError: __("Could not save this global style.", "alerts-dlx"),
		deleteError: __("Could not delete this global style.", "alerts-dlx"),
		deleteConfirm: __("Delete this global style permanently?", "alerts-dlx"),
		name: __("Style name", "alerts-dlx"),
		duplicateAs: __("Duplicate as snapshot", "alerts-dlx"),
	};
};

/**
 * Return the opposite library kind.
 *
 * @param {string} kind Library kind slug.
 * @return {string} Opposite kind.
 */
export const getOppositeKind = (kind) =>
	KIND_SNAPSHOT === kind ? KIND_GLOBAL_STYLE : KIND_SNAPSHOT;
