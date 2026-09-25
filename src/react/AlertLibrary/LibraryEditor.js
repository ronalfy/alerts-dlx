/* eslint-disable no-undef */
import { useEffect, useMemo, useRef, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { cleanForSlug } from "@wordpress/url";
import { Button, Notice, RadioControl, TextControl } from "@wordpress/components";
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
import {
	KIND_GLOBAL_STYLE,
	KIND_SNAPSHOT,
	getKindLabel,
	getLibraryLabels,
} from "./kind-labels";

/**
 * Return inspector fields for a library kind.
 *
 * @param {string} nextKind Library kind slug.
 * @return {Array} Field metadata.
 */
const getFieldsForKind = (nextKind) =>
	KIND_SNAPSHOT === nextKind
		? alertsDlxAdmin.snapshotFields || alertsDlxAdmin.libraryFields || []
		: alertsDlxAdmin.libraryFields || [];

/**
 * Return editor defaults for a library kind.
 *
 * @param {string} nextKind Library kind slug.
 * @return {Object} Default config.
 */
const getDefaultsForKind = (nextKind) =>
	KIND_SNAPSHOT === nextKind
		? { ...(alertsDlxAdmin.snapshotDefaults || alertsDlxAdmin.libraryDefaults || {}) }
		: { ...(alertsDlxAdmin.libraryDefaults || {}) };

/**
 * Studio editor for one library item.
 *
 * @param {Object}   props              Component props.
 * @param {string}   props.libraryKind  Initial library kind.
 * @param {number}   props.itemId       Existing item ID or 0 for new.
 * @param {Function} props.onBack       Back navigation handler.
 * @param {Function} props.onSaved      Called after successful save.
 * @param {Function} props.onKindChange Called when a new item kind changes.
 * @return {Element} Editor screen.
 */

const LibraryEditor = ({ libraryKind, itemId, onBack, onSaved, onKindChange }) => {
	const previewFixture = useMemo(
		() => alertsDlxAdmin.libraryPreviewFixture || {},
		[]
	);

	const [kind, setKind] = useState(libraryKind || KIND_GLOBAL_STYLE);
	const fields = getFieldsForKind(kind);
	const defaultConfig = useMemo(
		() => getDefaultsForKind(libraryKind || KIND_GLOBAL_STYLE),
		[libraryKind]
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
	const labels = getLibraryLabels(kind);

	const isDirty = useMemo(() => {
		if (!checkpoint.current) {
			return false;
		}
		return (
			checkpoint.current.title !== title ||
			checkpoint.current.slug !== slug ||
			checkpoint.current.kind !== kind ||
			JSON.stringify(checkpoint.current.config) !== JSON.stringify(config)
		);
	}, [title, slug, kind, config]);

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
			const initialKind = libraryKind || KIND_GLOBAL_STYLE;
			const initial = {
				title: "",
				slug: "",
				kind: initialKind,
				config: getDefaultsForKind(initialKind),
			};
			checkpoint.current = initial;
			setKind(initialKind);
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
					kind: item.kind || KIND_GLOBAL_STYLE,
					config: item.config || getDefaultsForKind(item.kind || KIND_GLOBAL_STYLE),
				};
				checkpoint.current = next;
				setTitle(next.title);
				setSlug(next.slug);
				setKind(next.kind);
				setConfig(next.config);
			})
			.catch((requestError) => {
				setError(
					requestError.message ||
					getLibraryLabels(libraryKind).loadError
				);
			})
			.finally(() => setLoading(false));
	}, [itemId]); // libraryKind is read on first new-item mount only.

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

	const handleKindChange = (nextKind) => {
		setKind(nextKind);
		if (!itemId) {
			const nextDefaults = getDefaultsForKind(nextKind);
			setConfig((current) => {
				const preserved = {};
				Object.keys(nextDefaults).forEach((key) => {
					if (Object.prototype.hasOwnProperty.call(current, key)) {
						preserved[key] = current[key];
					}
				});
				return { ...nextDefaults, ...preserved };
			});
		}
		if (onKindChange) {
			onKindChange(nextKind);
		}
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
			kind,
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
					kind: saved.kind || kind,
					config: saved.config || config,
				};
				checkpoint.current = next;
				setTitle(next.title);
				setSlug(next.slug);
				setKind(next.kind);
				setConfig(next.config);
				showSnackbar(getLibraryLabels(next.kind).saved);
				onSaved(saved);
			})
			.catch((requestError) => {
				const message =
					requestError.message ||
					labels.saveError;
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
		if (!window.confirm(labels.deleteConfirm)) {
			return;
		}
		setSaving(true);
		deleteLibraryItem(itemId)
			.then(() => onBack())
			.catch((requestError) => {
				setError(
					requestError.message ||
					labels.deleteError
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
					{__("← Back to library", "alerts-dlx")}
				</Button>
				<div className="alerts-dlx-library-editor__kind">
					{itemId > 0 ? (
						<p className="description">
							{__("Kind:", "alerts-dlx")} {getKindLabel(kind)}
						</p>
					) : (
						<RadioControl
							label={__("Kind", "alerts-dlx")}
							selected={kind}
							options={[
								{
									label: getKindLabel(KIND_GLOBAL_STYLE),
									value: KIND_GLOBAL_STYLE,
								},
								{
									label: getKindLabel(KIND_SNAPSHOT),
									value: KIND_SNAPSHOT,
								},
							]}
							onChange={handleKindChange}
						/>
					)}
				</div>
				<div className="alerts-dlx-library-editor__meta">
					<TextControl
						label={labels.name}
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
							"Used to reference this item from blocks and shortcodes in a future release.",
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
							"Leave icon empty to avoid forcing an icon on alerts that use this item.",
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
					{saving ? __("Saving…", "alerts-dlx") : labels.save}
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
