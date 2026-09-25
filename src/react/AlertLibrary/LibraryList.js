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
import {
	KIND_GLOBAL_STYLE,
	KIND_SNAPSHOT,
	getKindLabel,
	getLibraryLabels,
	getOppositeKind,
} from "./kind-labels";

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
	fields: ["kind", "slug", "alert_group", "alert_type", "variant", "modified"],
	filters: [],
	layout: {},
};

/**
 * List global styles and snapshots in a DataViews table.
 *
 * @param {Object}   props         Component props.
 * @param {Function} props.onAdd   Add handler that receives a kind.
 * @param {Function} props.onEdit  Edit handler.
 * @return {Element} List screen.
 */
const LibraryList = ({ onAdd, onEdit }) => {
	const [items, setItems] = useState([]);
	const [view, setView] = useState(DEFAULT_VIEW);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionId, setActionId] = useState(0);

	const themeLabels = alertsDlxAdmin.themeLabels || {};

	const loadItems = useCallback(() => {
		setLoading(true);
		setError("");
		fetchLibraryItems()
			.then((response) => {
				setItems(Array.isArray(response) ? response : []);
			})
			.catch((requestError) => {
				setError(
					requestError.message ||
						__("Could not load library items.", "alerts-dlx")
				);
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		loadItems();
	}, [loadItems]);

	const handleDuplicate = useCallback(
		(item, targetKind) => {
			setActionId(item.id);
			duplicateLibraryItem(item.id, targetKind)
				.then(() => loadItems())
				.catch((requestError) => {
					setError(
						requestError.message ||
							__("Could not duplicate this item.", "alerts-dlx")
					);
				})
				.finally(() => setActionId(0));
		},
		[loadItems]
	);

	const handleDelete = useCallback(
		(item) => {
			const labels = getLibraryLabels(item.kind);
			// eslint-disable-next-line no-alert
			if (!window.confirm(labels.deleteConfirm)) {
				return;
			}
			setActionId(item.id);
			deleteLibraryItem(item.id)
				.then(() => loadItems())
				.catch((requestError) => {
					setError(
						requestError.message ||
							__("Could not delete this item.", "alerts-dlx")
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
				id: "kind",
				label: __("Kind", "alerts-dlx"),
				enableSorting: true,
				elements: [
					{
						value: KIND_GLOBAL_STYLE,
						label: getKindLabel(KIND_GLOBAL_STYLE),
					},
					{
						value: KIND_SNAPSHOT,
						label: getKindLabel(KIND_SNAPSHOT),
					},
				],
				filterBy: {
					operators: ["isAny"],
					isPrimary: true,
				},
				getValue: ({ item }) => item.kind,
				render: ({ item }) => getKindLabel(item.kind),
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
				id: "duplicate-other-kind",
				label: (selectedItems) => {
					const item = selectedItems[0];
					return item
						? getLibraryLabels(item.kind).duplicateAs
						: __("Duplicate as other kind", "alerts-dlx");
				},
				callback: (selectedItems) => {
					if (selectedItems[0]) {
						handleDuplicate(
							selectedItems[0],
							getOppositeKind(selectedItems[0].kind)
						);
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
				const haystack = `${row.title} ${row.slug} ${row.alert_group} ${row.alert_type} ${getKindLabel(row.kind)}`.toLowerCase();
				return haystack.includes(search);
			});
		}

		const kindFilter = (view.filters || []).find(
			(filter) => "kind" === filter.field
		);
		if (kindFilter && Array.isArray(kindFilter.value) && kindFilter.value.length) {
			rows = rows.filter((row) => kindFilter.value.includes(row.kind));
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
				if ("kind" === field) {
					leftValue = getKindLabel(left.kind);
					rightValue = getKindLabel(right.kind);
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
	}, [items, view.search, view.sort, view.filters, themeLabels]);

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
				<span>{__("Loading library items…", "alerts-dlx")}</span>
			</div>
		);
	}

	const addButtons = (
		<>
			<Button variant="primary" onClick={() => onAdd(KIND_GLOBAL_STYLE)}>
				{getLibraryLabels(KIND_GLOBAL_STYLE).add}
			</Button>
			<Button variant="secondary" onClick={() => onAdd(KIND_SNAPSHOT)}>
				{getLibraryLabels(KIND_SNAPSHOT).add}
			</Button>
		</>
	);

	return (
		<div className="alerts-dlx-library-list">
			<div className="alerts-dlx-library-list__toolbar">
				{addButtons}
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
							"Reusable appearance presets. Global styles are meant to be referenced. Snapshots are meant to be applied as a copy.",
							"alerts-dlx"
						)}
					</p>
					<div className="alerts-dlx-library-list__toolbar">
						{addButtons}
					</div>
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
