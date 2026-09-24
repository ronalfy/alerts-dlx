/* eslint-disable no-undef */
import { useCallback, useEffect, useMemo, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { Button, Notice, Spinner } from "@wordpress/components";
import { DataViews } from "@wordpress/dataviews/wp";
import {
	duplicateLibraryItem,
	deleteLibraryItem,
	fetchLibraryItems,
} from "./useLibraryItem";

const DEFAULT_VIEW = {
	type: "table",
	search: "",
	page: 1,
	perPage: 20,
	sort: {
		field: "title",
		direction: "asc",
	},
	titleField: "title",
	fields: ["slug", "alert_group", "alert_type", "variant", "modified"],
	layout: {},
};

/**
 * List global styles in a DataViews table.
 *
 * @param {Object}   props              Component props.
 * @param {string}   props.libraryKind  Library kind slug.
 * @param {Function} props.onAdd        Add handler.
 * @param {Function} props.onEdit       Edit handler.
 * @return {Element} List screen.
 */
const LibraryList = ({ libraryKind, onAdd, onEdit }) => {
	const [items, setItems] = useState([]);
	const [view, setView] = useState(DEFAULT_VIEW);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionId, setActionId] = useState(0);

	const themeLabels = alertsDlxAdmin.themeLabels || {};

	const loadItems = useCallback(() => {
		setLoading(true);
		setError("");
		fetchLibraryItems(libraryKind)
			.then((response) => {
				setItems(Array.isArray(response) ? response : []);
			})
			.catch((requestError) => {
				setError(
					requestError.message ||
						__("Could not load global styles.", "alerts-dlx")
				);
			})
			.finally(() => setLoading(false));
	}, [libraryKind]);

	useEffect(() => {
		loadItems();
	}, [loadItems]);

	const handleDuplicate = useCallback(
		(item) => {
			setActionId(item.id);
			duplicateLibraryItem(item.id)
				.then(() => loadItems())
				.catch((requestError) => {
					setError(
						requestError.message ||
							__("Could not duplicate this style.", "alerts-dlx")
					);
				})
				.finally(() => setActionId(0));
		},
		[loadItems]
	);

	const handleDelete = useCallback(
		(item) => {
			// eslint-disable-next-line no-alert
			if (!window.confirm(__("Delete this global style permanently?", "alerts-dlx"))) {
				return;
			}
			setActionId(item.id);
			deleteLibraryItem(item.id)
				.then(() => loadItems())
				.catch((requestError) => {
					setError(
						requestError.message ||
							__("Could not delete this style.", "alerts-dlx")
					);
				})
				.finally(() => setActionId(0));
		},
		[loadItems]
	);

	const fields = useMemo(
		() => [
			{
				id: "title",
				label: __("Name", "alerts-dlx"),
				enableSorting: true,
				enableGlobalSearch: true,
				render: ({ item }) => (
					<Button variant="link" onClick={() => onEdit(item.id)}>
						{item.title}
					</Button>
				),
			},
			{
				id: "slug",
				label: __("Slug", "alerts-dlx"),
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: "alert_group",
				label: __("Design system", "alerts-dlx"),
				enableSorting: true,
				getValue: ({ item }) => themeLabels[item.alert_group] || item.alert_group,
			},
			{
				id: "alert_type",
				label: __("Alert type", "alerts-dlx"),
				enableSorting: true,
			},
			{
				id: "variant",
				label: __("Appearance", "alerts-dlx"),
				enableSorting: true,
			},
			{
				id: "modified",
				label: __("Updated", "alerts-dlx"),
				enableSorting: true,
				getValue: ({ item }) => {
					if (!item.modified) {
						return "";
					}
					return new Date(item.modified).toLocaleString();
				},
			},
		],
		[onEdit, themeLabels]
	);

	const actions = useMemo(
		() => [
			{
				id: "edit",
				label: __("Edit", "alerts-dlx"),
				isPrimary: true,
				callback: (selectedItems) => {
					if (selectedItems[0]) {
						onEdit(selectedItems[0].id);
					}
				},
			},
			{
				id: "duplicate",
				label: __("Duplicate", "alerts-dlx"),
				callback: (selectedItems) => {
					if (selectedItems[0]) {
						handleDuplicate(selectedItems[0]);
					}
				},
			},
			{
				id: "delete",
				label: __("Delete", "alerts-dlx"),
				callback: (selectedItems) => {
					if (selectedItems[0]) {
						handleDelete(selectedItems[0]);
					}
				},
			},
		],
		[onEdit, handleDuplicate, handleDelete]
	);

	const filteredItems = useMemo(() => {
		let rows = [...items];
		const search = (view.search || "").trim().toLowerCase();
		if (search) {
			rows = rows.filter((row) => {
				const haystack = `${row.title} ${row.slug} ${row.alert_group} ${row.alert_type}`.toLowerCase();
				return haystack.includes(search);
			});
		}
		if (view.sort?.field) {
			const { field, direction } = view.sort;
			rows.sort((left, right) => {
				let leftValue = left[field] ?? "";
				let rightValue = right[field] ?? "";
				if ("alert_group" === field) {
					leftValue = themeLabels[leftValue] || leftValue;
					rightValue = themeLabels[rightValue] || rightValue;
				}
				if ("modified" === field) {
					leftValue = left.modified ? new Date(left.modified).getTime() : 0;
					rightValue = right.modified ? new Date(right.modified).getTime() : 0;
				}
				if (leftValue < rightValue) {
					return "asc" === direction ? -1 : 1;
				}
				if (leftValue > rightValue) {
					return "asc" === direction ? 1 : -1;
				}
				return 0;
			});
		}
		return rows;
	}, [items, view.search, view.sort, themeLabels]);

	const paginationInfo = useMemo(
		() => ({
			totalItems: filteredItems.length,
			totalPages: Math.max(1, Math.ceil(filteredItems.length / (view.perPage || 20))),
		}),
		[filteredItems.length, view.perPage]
	);

	const pagedItems = useMemo(() => {
		const perPage = view.perPage || 20;
		const page = view.page || 1;
		const start = (page - 1) * perPage;
		return filteredItems.slice(start, start + perPage);
	}, [filteredItems, view.page, view.perPage]);

	if (loading && !items.length) {
		return (
			<div className="alerts-dlx-library-loading">
				<Spinner />
				<span>{__("Loading global styles…", "alerts-dlx")}</span>
			</div>
		);
	}

	return (
		<div className="alerts-dlx-library-list">
			<div className="alerts-dlx-library-list__toolbar">
				<Button variant="primary" onClick={onAdd}>
					{__("Add global style", "alerts-dlx")}
				</Button>
			</div>

			{error && (
				<Notice status="error" isDismissible={false}>
					{error}
				</Notice>
			)}

			{!items.length ? (
				<div className="alerts-dlx-library-empty">
					<p>
						{__(
							"Create reusable appearance presets for your alerts. Global styles can be referenced from blocks and shortcodes in a future release.",
							"alerts-dlx"
						)}
					</p>
					<Button variant="primary" onClick={onAdd}>
						{__("Add global style", "alerts-dlx")}
					</Button>
				</div>
			) : (
				<DataViews
					data={pagedItems}
					fields={fields}
					view={view}
					onChangeView={setView}
					actions={actions}
					isLoading={loading || actionId > 0}
					paginationInfo={paginationInfo}
					defaultLayouts={{ table: {} }}
					getItemId={(item) => String(item.id)}
				/>
			)}
		</div>
	);
};

export default LibraryList;
