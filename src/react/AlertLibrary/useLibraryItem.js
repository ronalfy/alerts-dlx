/* eslint-disable no-undef */
import apiFetch from "@wordpress/api-fetch";

const namespace = "/dlxplugins/alerts-dlx/v1";

/**
 * Fetch library items for one kind.
 *
 * @param {string} kind Library kind slug.
 * @return {Promise<Array>} Items.
 */
export const fetchLibraryItems = (kind) =>
	apiFetch({
		path: `${namespace}/library-items?kind=${encodeURIComponent(kind)}`,
	});

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
 * Duplicate a library item.
 *
 * @param {number} id Post ID.
 * @return {Promise<Object>} New item.
 */
export const duplicateLibraryItem = (id) =>
	apiFetch({
		path: `${namespace}/library-items/${id}/duplicate`,
		method: "POST",
	});
