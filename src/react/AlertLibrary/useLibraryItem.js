/* eslint-disable no-undef */
import apiFetch from "@wordpress/api-fetch";
import { isRawSvg } from "../../js/blocks/utils/icon-value";

const namespace = "/dlxplugins/alerts-dlx/v1";
const coreLibraryPath = "/wp/v2/alerts-dlx-library";

/**
 * Fetch library items, optionally filtered by kind.
 *
 * @param {string} [kind] Library kind slug or all.
 * @return {Promise<Array>} Items.
 */
export const fetchLibraryItems = (kind) => {
	const query =
		kind && "all" !== kind ? `?kind=${encodeURIComponent(kind)}` : "";
	return apiFetch({
		path: `${namespace}/library-items${query}`,
	});
};

/**
 * Fetch one library item.
 *
 * @param {number} id Post ID.
 * @return {Promise<Object>} Item.
 */
export const fetchLibraryItem = (id) =>
	apiFetch({
		path: `${namespace}/library-items/${id}`,
	});

/**
 * Whether this payload must use core CPT content for a custom SVG.
 *
 * @param {Object} payload Item payload.
 * @return {boolean} Whether the icon is raw SVG.
 */
const needsCoreContentSave = (payload) =>
	isRawSvg(payload?.config?.icon || "");

/**
 * Create or update a library item through core post REST.
 *
 * @param {number} id      Existing post ID or 0.
 * @param {Object} payload Item payload.
 * @return {Promise<Object>} Formatted library item.
 */
const saveViaCoreRest = async (id, payload) => {
	const path = id ? `${coreLibraryPath}/${id}` : coreLibraryPath;
	const saved = await apiFetch({
		path,
		method: "POST",
		data: {
			title: payload.title,
			slug: payload.slug,
			status: "publish",
			content: JSON.stringify(payload.config || {}),
			meta: {
				_alerts_dlx_kind: payload.kind,
				_alerts_dlx_show_in_inserter: Boolean(payload.showInInserter),
			},
		},
	});

	// apiFetch already resolved the post. Return the formatted library item.
	return fetchLibraryItem(saved.id);
};

/**
 * Create a library item.
 *
 * @param {Object} payload Item payload.
 * @return {Promise<Object>} Created item.
 */
export const createLibraryItem = (payload) => {
	if (needsCoreContentSave(payload)) {
		return saveViaCoreRest(0, payload);
	}
	return apiFetch({
		path: `${namespace}/library-items`,
		method: "POST",
		data: payload,
	});
};

/**
 * Update a library item.
 *
 * @param {number} id      Post ID.
 * @param {Object} payload Item payload.
 * @return {Promise<Object>} Updated item.
 */
export const updateLibraryItem = (id, payload) => {
	if (needsCoreContentSave(payload)) {
		return saveViaCoreRest(id, payload);
	}
	return apiFetch({
		path: `${namespace}/library-items/${id}`,
		method: "PUT",
		data: payload,
	});
};

/**
 * Delete a library item.
 *
 * @param {number} id Post ID.
 * @return {Promise<Object>} Delete response.
 */
export const deleteLibraryItem = (id) =>
	apiFetch({
		path: `${namespace}/library-items/${id}`,
		method: "DELETE",
	});

/**
 * Duplicate a library item, optionally into another kind.
 *
 * @param {number} id   Post ID.
 * @param {string} kind Optional target kind.
 * @return {Promise<Object>} New item.
 */
export const duplicateLibraryItem = (id, kind) =>
	apiFetch({
		path: `${namespace}/library-items/${id}/duplicate`,
		method: "POST",
		data: kind ? { kind } : {},
	});
