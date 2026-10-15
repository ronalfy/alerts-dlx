/* eslint-disable no-undef */
import apiFetch from "@wordpress/api-fetch";

const namespace = "/dlxplugins/alerts-dlx/v1";

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
 * Create a library item.
 *
 * @param {Object} payload Item payload.
 * @return {Promise<Object>} Created item.
 */
export const createLibraryItem = (payload) =>
	apiFetch({
		path: `${namespace}/library-items`,
		method: "POST",
		data: payload,
	});

/**
 * Update a library item.
 *
 * @param {number} id      Post ID.
 * @param {Object} payload Item payload.
 * @return {Promise<Object>} Updated item.
 */
export const updateLibraryItem = (id, payload) =>
	apiFetch({
		path: `${namespace}/library-items/${id}`,
		method: "PUT",
		data: payload,
	});

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
