/* eslint-disable no-undef */
import { useEffect, useMemo, useRef, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { cleanForSlug } from "@wordpress/url";
import { Button, Notice, TextControl } from "@wordpress/components";
import AlertBuilderInspector from "../Components/AlertBuilder/AlertBuilderInspector";
import AlertBuilderPreview from "../Components/AlertBuilder/AlertBuilderPreview";
import Snackbar from "../Components/Snackbar";
import { applyBuilderFieldChange } from "../Components/AlertBuilder/builder-utils";
import {
	createLibraryItem,
	deleteLibraryItem,
	fetchLibraryItem,
	updateLibraryItem,
} from "./useLibraryItem";

/**
 * Studio editor for one global style library item.
 *
 * @param {Object}   props              Component props.
 * @param {string}   props.libraryKind  Library kind.
 * @param {number}   props.itemId       Existing item ID or 0 for new.
 * @param {Function} props.onBack       Back navigation handler.
 * @param {Function} props.onSaved      Called after successful save.
 * @return {Element} Editor screen.
 */
const LibraryEditor = ({ libraryKind, itemId, onBack, onSaved }) => {
	const fields = alertsDlxAdmin.globalStyleFields || [];
	const defaultConfig = useMemo(
		() => alertsDlxAdmin.globalStyleDefaults || {},
		[]
	);
	const previewFixture = useMemo(
		() => alertsDlxAdmin.globalStylePreviewFixture || {},
		[]
	);

	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [config, setConfig] = useState(defaultConfig);
	const [loading, setLoading] = useState(Boolean(itemId));
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [previewError, setPreviewError] = useState("");
	const checkpoint = useRef(null);
	const [snackbar, setSnackbar] = useState({ isVisible: false, message: "", type: "success" });

	const isDirty = useMemo(() => {
		if (!checkpoint.current) {
			return false;
		}
		return (
			checkpoint.current.title !== title ||
			checkpoint.current.slug !== slug ||
			JSON.stringify(checkpoint.current.config) !== JSON.stringify(config)
		);
	}, [title, slug, config]);

	useEffect(() => {
		const handleBeforeUnload = (event) => {
			if (!isDirty) {
				return;
			}
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty]);

	useEffect(() => {
		if (!itemId) {
			const initial = {
				title: "",
				slug: "",
				config: { ...defaultConfig },
			};
			checkpoint.current = initial;
			setTitle("");
			setSlug("");
			setConfig(initial.config);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError("");
		fetchLibraryItem(itemId)
			.then((item) => {
				const next = {
					title: item.title || "",
					slug: item.slug || "",
					config: item.config || { ...defaultConfig },
				};
				checkpoint.current = next;
				setTitle(next.title);
				setSlug(next.slug);
				setConfig(next.config);
			})
			.catch((requestError) => {
				setError(
					requestError.message ||
					__("Could not load this global style.", "alerts-dlx")
				);
			})
			.finally(() => setLoading(false));
	}, [itemId, defaultConfig]);

	const handleChange = (name, value) => {
		setConfig((current) =>
			applyBuilderFieldChange(name, value, current, fields)
		);
	};

	const handleImageSelect = (attachment) => {
		setConfig((current) => ({
			...current,
			image_url: attachment.url || "",
			image_id: attachment.id || 0,
		}));
	};

	const showSnackbar = (message, type = "success") => {
		setSnackbar({ isVisible: true, message, type });
	};

	const handleSave = () => {
		if (!title.trim()) {
			setError(__("A title is required.", "alerts-dlx"));
			return;
		}

		setSaving(true);
		setError("");
		const payload = {
			kind: libraryKind,
			title: title.trim(),
			slug: slug.trim() || undefined,
			config,
		};

		const request = itemId
			? updateLibraryItem(itemId, payload)
			: createLibraryItem(payload);

		request
			.then((saved) => {
				const next = {
					title: saved.title || title,
					slug: saved.slug || slug,
					config: saved.config || config,
				};
				checkpoint.current = next;
				setTitle(next.title);
				setSlug(next.slug);
				setConfig(next.config);
				showSnackbar(__("Global style saved.", "alerts-dlx"));
				onSaved(saved);
			})
			.catch((requestError) => {
				const message =
					requestError.message ||
					__("Could not save this global style.", "alerts-dlx");
				setError(message);
				showSnackbar(message, "error");
			})
			.finally(() => setSaving(false));
	};

	const handleDelete = () => {
		if (!itemId) {
			return;
		}
		// eslint-disable-next-line no-alert
		if (!window.confirm(__("Delete this global style permanently?", "alerts-dlx"))) {
			return;
		}
		setSaving(true);
		deleteLibraryItem(itemId)
			.then(() => onBack())
			.catch((requestError) => {
				setError(
					requestError.message ||
					__("Could not delete this global style.", "alerts-dlx")
				);
			})
			.finally(() => setSaving(false));
	};

	const handleBack = () => {
		if (isDirty) {
			// eslint-disable-next-line no-alert
			if (!window.confirm(__("Discard unsaved changes?", "alerts-dlx"))) {
				return;
			}
		}
		onBack();
	};

	if (loading) {
		return <p>{__("Loading…", "alerts-dlx")}</p>;
	}

	return (
		<div className="alerts-dlx-library-editor">
			<div className="alerts-dlx-library-editor__header">
				<Button variant="link" onClick={handleBack}>
					{__("← Back to all styles", "alerts-dlx")}
				</Button>
				<div className="alerts-dlx-library-editor__meta">
					<TextControl
						label={__("Style name", "alerts-dlx")}
						value={title}
						onChange={(nextTitle) => {
							setTitle( nextTitle || "" )
						}}
						onBlur={() => {
							if ( !slug ) {
								setSlug(cleanForSlug(title.trim()))
							}
						}}
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={__("Slug", "alerts-dlx")}
						value={slug}
						onChange={setSlug}
						help={__(
							"Used to reference this style from blocks and shortcodes in a future release.",
							"alerts-dlx"
						)}
						__nextHasNoMarginBottom
					/>
				</div>
			</div>

			{error && (
				<Notice status="error" isDismissible={false}>
					{error}
				</Notice>
			)}
			{previewError && (
				<Notice status="error" isDismissible={false}>
					{previewError}
				</Notice>
			)}

			<div className="alerts-dlx-library-editor__studio">
				<div className="alerts-dlx-library-editor__inspector">
					<AlertBuilderInspector
						fields={fields}
						values={config}
						onChange={handleChange}
						onSelectImage={handleImageSelect}
					/>
					<p className="description alerts-dlx-library-editor__icon-help">
						{__(
							"Leave icon empty to avoid forcing an icon on alerts that use this style.",
							"alerts-dlx"
						)}
					</p>
				</div>
				<div className="alerts-dlx-library-editor__preview">
					<p className="description">
						{__(
							"Sample title, description, button, and icon (when unset) are shown for preview only.",
							"alerts-dlx"
						)}
					</p>
					<AlertBuilderPreview
						values={config}
						fixture={previewFixture}
						iconFallback={true}
						onPreviewError={setPreviewError}
					/>
				</div>
			</div>

			<div className="alerts-dlx-library-editor__actions">
				<Button variant="primary" onClick={handleSave} disabled={saving}>
					{saving ? __("Saving…", "alerts-dlx") : __("Save global style", "alerts-dlx")}
				</Button>
				{itemId > 0 && (
					<Button
						variant="secondary"
						isDestructive
						onClick={handleDelete}
						disabled={saving}
					>
						{__("Delete", "alerts-dlx")}
					</Button>
				)}
			</div>

			<Snackbar
				isVisible={snackbar.isVisible}
				message={snackbar.message}
				type={snackbar.type}
				onClose={() =>
					setSnackbar({ isVisible: false, message: "", type: "success" })
				}
			/>
		</div>
	);
};

export default LibraryEditor;
