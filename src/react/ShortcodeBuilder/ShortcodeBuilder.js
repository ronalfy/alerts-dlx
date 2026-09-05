/* eslint-disable no-undef */
import { useEffect, useRef, useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import {
	BaseControl,
	Button,
	ColorIndicator,
	ColorPalette,
	Dropdown,
	Notice,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl,
	PanelBody,
	ToggleControl,
} from "@wordpress/components";

import sendCommand from "../Utils/SendCommand";
import { getAlertColorPalette } from "../../js/blocks/utils/alert-color-palette";
import { getIconSetForGroup } from "../../js/blocks/utils/icon-sets";
import IconPicker from "../../js/blocks/components/IconPicker";

const groupLabels = {
	content: __("Content", "alerts-dlx"),
	appearance: __("Appearance", "alerts-dlx"),
	action: __("Button", "alerts-dlx"),
	icon: __("Icon or image", "alerts-dlx"),
	colors: __("Custom colors", "alerts-dlx"),
	dismiss: __("Dismiss", "alerts-dlx"),
	advanced: __("Advanced", "alerts-dlx"),
};

const COLOR_FIELD_NAMES = [
	"color_primary",
	"color_border",
	"color_accent",
	"color_alt",
	"color_alt_hover",
	"color_alt_text",
	"color_alt_text_hover",
	"color_bold",
	"color_light",
];

/**
 * Return the info palette for one alert group.
 *
 * @param {string} alertGroup Alert design slug.
 * @return {Object} Color attribute map.
 */
const getInfoColors = (alertGroup) =>
	alertsDlxAdmin.shortcodeBuilderInfoColors?.[alertGroup] || {};

/**
 * Return true when every custom color field is empty.
 *
 * @param {Object} values Current builder values.
 * @return {boolean} Whether all nine colors are blank.
 */
const colorsAreEmpty = (values) =>
	COLOR_FIELD_NAMES.every((name) => !values[name]);

/**
 * Return true when colors still match a group's info starter palette.
 *
 * @param {Object} values     Current builder values.
 * @param {string} alertGroup Alert design slug.
 * @return {boolean} Whether colors equal that group's info defaults.
 */
const colorsMatchInfo = (values, alertGroup) => {
	const infoColors = getInfoColors(alertGroup);
	if (!Object.keys(infoColors).length) {
		return false;
	}
	return COLOR_FIELD_NAMES.every(
		(name) => (values[name] || "") === (infoColors[name] || "")
	);
};

/**
 * Fill empty color fields, or replace untouched info defaults, for a group.
 *
 * User-edited colors are kept. Empty fields receive the group's info colors.
 * When every field is empty or still matches a previous group's info palette,
 * the full info set is applied.
 *
 * @param {Object} values       Current builder values.
 * @param {string} alertGroup   Alert design slug to apply.
 * @param {string} [fromGroup]  Previous group when switching designs.
 * @return {Object} Values with starter colors applied where allowed.
 */
const applyInfoColors = (values, alertGroup, fromGroup) => {
	const infoColors = getInfoColors(alertGroup);
	if (!Object.keys(infoColors).length) {
		return values;
	}
	if (
		colorsAreEmpty(values) ||
		(fromGroup && colorsMatchInfo(values, fromGroup))
	) {
		return { ...values, ...infoColors };
	}
	const next = { ...values };
	COLOR_FIELD_NAMES.forEach((name) => {
		if (!next[name] && infoColors[name]) {
			next[name] = infoColors[name];
		}
	});
	return next;
};

/**
 * Return true when a visibility condition matches current builder values.
 *
 * @param {Object} condition Field show_when condition.
 * @param {Object} values    Current builder values.
 * @return {boolean} Whether the condition passes.
 */
const conditionMatches = (condition, values) => {
	if (!condition?.field || !condition?.operator) {
		return false;
	}

	const actual = values[condition.field];
	switch (condition.operator) {
		case "equals":
			return String(actual ?? "") === String(condition.value ?? "");
		case "not_equals":
			return String(actual ?? "") !== String(condition.value ?? "");
		case "filled":
			return "" !== String(actual ?? "").trim();
		case "is_true":
			return true === actual || "true" === actual || 1 === actual || "1" === actual;
		case "is_false":
			return true !== actual && "true" !== actual && 1 !== actual && "1" !== actual;
		default:
			return false;
	}
};

/**
 * Return true when a schema field should render for the current values.
 *
 * @param {Object} field  Localized field metadata.
 * @param {Object} values Current builder values.
 * @return {boolean} Whether the field is visible.
 */
const isFieldVisible = (field, values) => {
	if (!Array.isArray(field.show_when) || !field.show_when.length) {
		return true;
	}
	return field.show_when.every((condition) => conditionMatches(condition, values));
};

/**
 * Group color fields by their localized subgroup label.
 *
 * @param {Array} fields Color field metadata.
 * @return {Array} Subgroup sections with fields.
 */
const groupColorFields = (fields) => {
	const sections = [];
	const indexBySubgroup = {};

	fields.forEach((field) => {
		const subgroup = field.subgroup || "";
		if (undefined === indexBySubgroup[subgroup]) {
			indexBySubgroup[subgroup] = sections.length;
			sections.push({
				subgroup,
				fields: [],
			});
		}
		sections[indexBySubgroup[subgroup]].fields.push(field);
	});

	return sections;
};

/**
 * Return true when a typed color is complete enough to send to the server.
 *
 * Incomplete hex fragments such as #58 must not trigger a preview render.
 *
 * @param {string} raw Candidate color value.
 * @return {boolean} Whether the value should be committed.
 */
const isCommitableColor = (raw) => {
	const next = (raw || "").trim();
	if ("" === next) {
		return true;
	}
	if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(next)) {
		return true;
	}
	if (/^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s+/\-]+\)$/i.test(next)) {
		return true;
	}
	if (/^var\(\s*--[a-zA-Z0-9_-]+(?:\s*,\s*(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(?:rgb|rgba|hsl|hsla)\([0-9.,%\s+/\-]+\)|var\(\s*--[a-zA-Z0-9_-]+\s*\)|[a-zA-Z]+))?\s*\)$/.test(next)) {
		return true;
	}
	if (/^[a-zA-Z]+$/.test(next)) {
		return true;
	}
	return false;
};

/**
 * Compact inspector-style color row with a dropdown palette.
 *
 * @param {Object}   props          Component properties.
 * @param {Object}   props.field    Localized field metadata.
 * @param {string}   props.value    Current color value.
 * @param {Array}    props.colors   Palette entries.
 * @param {Function} props.onChange Value change callback.
 * @return {Element} Color field control.
 */
const CompactColorField = ({ field, value, colors, onChange }) => {
	const committedValue = value || "";
	const [draft, setDraft] = useState(committedValue);
	const debounceRef = useRef(null);
	const hasColor = Boolean(draft);
	const inputId = `alerts-dlx-${field.name}`;
	const triggerLabel = hasColor
		? sprintf(
				/* translators: 1: color field label, 2: current color value. */
				__("%1$s, %2$s", "alerts-dlx"),
				field.label,
				draft
		  )
		: sprintf(
				/* translators: %s: color field label. */
				__("%s, no color selected.", "alerts-dlx"),
				field.label
		  );

	useEffect(() => {
		setDraft(committedValue);
	}, [committedValue]);

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				window.clearTimeout(debounceRef.current);
			}
		};
	}, []);

	const commit = (nextValue) => {
		if (debounceRef.current) {
			window.clearTimeout(debounceRef.current);
			debounceRef.current = null;
		}
		const next = nextValue || "";
		setDraft(next);
		onChange(field.name, next);
	};

	const handleTextChange = (nextValue) => {
		const next = nextValue || "";
		setDraft(next);
		if (debounceRef.current) {
			window.clearTimeout(debounceRef.current);
		}
		debounceRef.current = window.setTimeout(() => {
			if (isCommitableColor(next) && next !== committedValue) {
				onChange(field.name, next);
			}
		}, 450);
	};

	const handleTextBlur = () => {
		if (debounceRef.current) {
			window.clearTimeout(debounceRef.current);
			debounceRef.current = null;
		}
		if (draft !== committedValue) {
			onChange(field.name, draft);
		}
	};

	return (
		<BaseControl
			id={inputId}
			className="alerts-dlx-shortcode-builder-color-control"
		>
			<div className="alerts-dlx-shortcode-builder-color-row">
				<Dropdown
					className="alerts-dlx-shortcode-builder-color-dropdown"
					contentClassName="alerts-dlx-shortcode-builder-color-popover"
					popoverProps={{
						className: "alerts-dlx-shortcode-builder-color-popover",
						placement: "bottom-start",
					}}
					renderToggle={({ isOpen, onToggle }) => (
						<Button
							className="alerts-dlx-shortcode-builder-color-trigger"
							onClick={onToggle}
							aria-expanded={isOpen}
							aria-haspopup="true"
							aria-label={triggerLabel}
						>
							<ColorIndicator colorValue={draft} />
							<span className="alerts-dlx-shortcode-builder-color-label">
								{field.label}
							</span>
						</Button>
					)}
					renderContent={({ onClose }) => (
						<ColorPalette
							colors={colors}
							value={committedValue}
							clearable={false}
							disableCustomColors
							onChange={(nextValue) => {
								commit(nextValue || "");
								if (onClose) {
									onClose();
								}
							}}
						/>
					)}
				/>
				<div className="alerts-dlx-shortcode-builder-color-hex">
					<TextControl
						id={inputId}
						label={field.label}
						hideLabelFromVision
						value={draft}
						onChange={handleTextChange}
						onBlur={handleTextBlur}
						__nextHasNoMarginBottom
					/>
				</div>
				<Button
					variant="tertiary"
					isSmall
					onClick={() => commit("")}
					disabled={!hasColor}
					aria-label={sprintf(
						/* translators: %s: color field label. */
						__("Clear %s", "alerts-dlx"),
						field.label
					)}
				>
					{__("Clear", "alerts-dlx")}
				</Button>
			</div>
		</BaseControl>
	);
};

/**
 * Compact icon field with a preset picker beside the SVG textarea.
 *
 * @param {Object}   props            Component properties.
 * @param {Object}   props.field      Localized field metadata.
 * @param {string}   props.value      Current SVG markup.
 * @param {string}   props.alertGroup Alert design slug.
 * @param {Function} props.onChange   Value change callback.
 * @return {Element} Icon field control.
 */
const CompactIconField = ({ field, value, alertGroup, onChange }) => {
	const inputId = `alerts-dlx-${field.name}`;
	const committedValue = value || "";

	return (
		<BaseControl
			id={inputId}
			label={field.label}
			className="alerts-dlx-shortcode-builder-icon-control"
		>
			<div className="alerts-dlx-shortcode-builder-icon-row">
				<div className="alerts-dlx-shortcode-builder-icon-svg">
					<TextareaControl
						id={inputId}
						label={field.label}
						hideLabelFromVision
						value={committedValue}
						onChange={(nextValue) => onChange(field.name, nextValue || "")}
						rows={5}
					/>
				</div>
				<IconPicker
					defaultSvg={committedValue}
					onChange={(nextValue) => onChange(field.name, nextValue || "")}
					icons={getIconSetForGroup(alertGroup)}
					popoverPlacement="bottom-start"
					closeOnSelect
					preventTriggerFocus={false}
				/>
			</div>
		</BaseControl>
	);
};

/**
 * Render one schema-driven control.
 *
 * @param {Object}   props          Component properties.
 * @param {Object}   props.field    Localized field metadata.
 * @param {Object}   props.values   Current shortcode values.
 * @param {Function} props.onChange Value change callback.
 * @return {Element} Field control.
 */
const BuilderField = ({ field, values, onChange }) => {
	const value = values[field.name];
	const options = field.options_by_theme
		? field.options_by_theme[values.alert_group] || []
		: field.options || [];

	if ("toggle" === field.control) {
		return (
			<ToggleControl
				label={field.label}
				checked={Boolean(value)}
				onChange={(nextValue) => onChange(field.name, nextValue)}
			/>
		);
	}

	if ("select" === field.control) {
		return (
			<SelectControl
				label={field.label}
				value={value}
				options={options}
				onChange={(nextValue) => onChange(field.name, nextValue)}
				__nextHasNoMarginBottom
			/>
		);
	}

	if ("textarea" === field.control) {
		return (
			<TextareaControl
				label={field.label}
				value={value || ""}
				onChange={(nextValue) => onChange(field.name, nextValue)}
			/>
		);
	}

	if ("color" === field.control) {
		return (
			<CompactColorField
				field={field}
				value={value || ""}
				colors={getAlertColorPalette(
					values.alert_group,
					alertsDlxAdmin.colorPalette
				)}
				onChange={onChange}
			/>
		);
	}

	if ("icon" === field.control) {
		return (
			<CompactIconField
				field={field}
				value={value || ""}
				alertGroup={values.alert_group}
				onChange={onChange}
			/>
		);
	}

	const inputType = ["number", "url"].includes(field.control)
		? field.control
		: "text";



	return (
		<TextControl
			label={field.label}
			type={inputType}
			min={field.min}
			max={field.max}
			value={value ?? ""}
			onChange={(nextValue) => onChange(field.name, nextValue)}
			__nextHasNoMarginBottom
		/>
	);
};

/**
 * Visual editor for the existing [alertsdlx] shortcode.
 *
 * Generation, parsing, sanitization, and preview rendering stay server-side so
 * this interface cannot drift from the production shortcode renderer.
 *
 * @return {Element} Shortcode builder interface.
 */
const ShortcodeBuilder = () => {
	const fields = alertsDlxAdmin.shortcodeBuilderFields || [];
	const [values, setValues] = useState(
		alertsDlxAdmin.shortcodeBuilderDefaults || {}
	);
	const [shortcode, setShortcode] = useState("");
	const [source, setSource] = useState("");
	const [previewHtml, setPreviewHtml] = useState("");
	const [error, setError] = useState("");
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(false);
	const requestSequence = useRef(0);

	const requestBuilder = (operation, data) =>
		sendCommand("alerts_dlx_shortcode_builder", {
			nonce: alertsDlxAdmin.shortcodeBuilderNonce,
			operation,
			...data,
		});

	useEffect(() => {
		const requestId = requestSequence.current + 1;
		requestSequence.current = requestId;
		const timeout = window.setTimeout(() => {
			setLoading(true);
			requestBuilder("render", { form_data: values })
				.then((response) => {
					if (requestId !== requestSequence.current) {
						return;
					}
					if (!response.data.success) {
						throw new Error(
							response.data.data?.message ||
							__("Could not render the shortcode preview.", "alerts-dlx")
						);
					}
					setShortcode(response.data.data.shortcode);
					setPreviewHtml(response.data.data.preview_html);
					setError("");
				})
				.catch((requestError) => {
					if (requestId === requestSequence.current) {
						setError(
							requestError.response?.data?.data?.message ||
							requestError.message ||
							__("Could not render the shortcode preview.", "alerts-dlx")
						);
					}
				})
				.finally(() => {
					if (requestId === requestSequence.current) {
						setLoading(false);
					}
				});
		}, 300);

		return () => window.clearTimeout(timeout);
	}, [values]);

	const handleChange = (name, value) => {
		setStatus("");
		setValues((current) => {
			let next = { ...current, [name]: value };
			if ("alert_group" === name) {
				const typeField = fields.find((field) => "alert_type" === field.name);
				const variantField = fields.find((field) => "variant" === field.name);
				const typeOptions = typeField?.options_by_theme?.[value] || [];
				const variantOptions = variantField?.options_by_theme?.[value] || [];
				if (!typeOptions.some((option) => option.value === next.alert_type)) {
					next.alert_type = typeOptions[0]?.value || "success";
				}
				next.variant = variantOptions[0]?.value || "default";
				next = applyInfoColors(next, value, current.alert_group);
			}
			if ("alert_type" === name && "custom" === value) {
				next = applyInfoColors(next, next.alert_group);
			}
			return next;
		});
	};

	const parseSource = () => {
		requestSequence.current += 1;
		setLoading(true);
		setStatus("");
		requestBuilder("parse", { shortcode: source })
			.then((response) => {
				if (!response.data.success) {
					throw new Error(
						response.data.data?.message ||
						__("Could not parse the shortcode.", "alerts-dlx")
					);
				}
				setValues(response.data.data.values);
				setShortcode(response.data.data.shortcode);
				setPreviewHtml(response.data.data.preview_html);
				setError("");
				setStatus(__("Shortcode loaded into the builder.", "alerts-dlx"));
			})
			.catch((requestError) => {
				setError(
					requestError.response?.data?.data?.message ||
					requestError.message ||
					__("Could not parse the shortcode.", "alerts-dlx")
				);
			})
			.finally(() => setLoading(false));
	};

	const copyShortcode = () => {
		if (!shortcode || !navigator.clipboard?.writeText) {
			setError(__("Clipboard access is unavailable in this browser.", "alerts-dlx"));
			return;
		}
		navigator.clipboard
			.writeText(shortcode)
			.then(() => {
				setError("");
				setStatus(__("Shortcode copied.", "alerts-dlx"));
			})
			.catch(() =>
				setError(__("Could not copy the shortcode.", "alerts-dlx"))
			);
	};

	return (
		<section
			className="adlx-admin-content-wrapper alerts-dlx-shortcode-builder"
			aria-labelledby="alerts-dlx-shortcode-builder-title"
		>
			<div className="adlx-admin-content-panel">
				<div className="adlx-admin-content-heading">
					<h2 id="alerts-dlx-shortcode-builder-title">
						{__("Visual shortcode builder", "alerts-dlx")}
					</h2>
					<p className="description">
						{__(
							"Build or edit the existing [alertsdlx] shortcode. Nothing is inserted or saved automatically.",
							"alerts-dlx"
						)}
					</p>
				</div>

				{error && (
					<Notice status="error" isDismissible={false} aria-live="assertive">
						{error}
					</Notice>
				)}
				{status && (
					<Notice status="success" isDismissible={false} aria-live="polite">
						{status}
					</Notice>
				)}

				<PanelBody
					title={__("Edit an existing shortcode", "alerts-dlx")}
					initialOpen={false}
				>
					<div className="adlx-admin-content-body">
						<div className="adlx-admin-component-wrapper">
							<h3 className="adlx-admin-content-subheading">
								{__("Edit an existing shortcode", "alerts-dlx")}
							</h3>
							<TextareaControl
								label={__("Existing shortcode", "alerts-dlx")}
								value={source}
								onChange={setSource}
								help={__(
									"Paste exactly one [alertsdlx] shortcode, then load it into the controls.",
									"alerts-dlx"
								)}
							/>
							<Button variant="secondary" onClick={parseSource} disabled={!source || loading}>
								{__("Load shortcode", "alerts-dlx")}
							</Button>
						</div>
					</div>
				</PanelBody>

				{Object.entries(groupLabels).map(([group, label]) => {
					const groupFields = fields.filter(
						(field) => field.group === group && isFieldVisible(field, values)
					);
					if (!groupFields.length) {
						return null;
					}
					return (
						<div
							className={`adlx-admin-content-body${
								"colors" === group
									? " alerts-dlx-shortcode-builder-colors"
									: ""
							}`}
							key={group}
						>
							<div className="adlx-admin-component-wrapper">
								<h3 className="adlx-admin-content-subheading">{label}</h3>
								{"colors" === group
									? groupColorFields(groupFields).map((section) => (
											<div
												className="alerts-dlx-shortcode-builder-color-subgroup"
												key={section.subgroup || "colors"}
											>
												{section.subgroup && (
													<h4 className="alerts-dlx-shortcode-builder-color-subgroup-title">
														{section.subgroup}
													</h4>
												)}
												{section.fields.map((field) => (
													<div
														className="adlx-admin-component-row"
														key={field.name}
													>
														<BuilderField
															field={field}
															values={values}
															onChange={handleChange}
														/>
													</div>
												))}
											</div>
									  ))
									: groupFields.map((field) => (
											<div
												className="adlx-admin-component-row"
												key={field.name}
											>
												<BuilderField
													field={field}
													values={values}
													onChange={handleChange}
												/>
											</div>
									  ))}
							</div>
						</div>
					);
				})}

				<div className="adlx-admin-content-body">
					<div className="adlx-admin-component-wrapper">
						<h3 className="adlx-admin-content-subheading">
							{__("Generated shortcode", "alerts-dlx")}
						</h3>
						{loading && (
							<span role="status" aria-live="polite">
								<Spinner />
								<span className="screen-reader-text">
									{__("Updating shortcode preview.", "alerts-dlx")}
								</span>
							</span>
						)}
						<TextareaControl
							label={__("Copy this shortcode", "alerts-dlx")}
							value={shortcode}
							onChange={() => { }}
							readOnly
						/>
						<Button variant="primary" onClick={copyShortcode} disabled={!shortcode || loading}>
							{__("Copy shortcode", "alerts-dlx")}
						</Button>
					</div>
				</div>

				<div className="adlx-admin-content-body">
					<div className="adlx-admin-component-wrapper">
						<h3 className="adlx-admin-content-subheading">
							{__("Production preview", "alerts-dlx")}
						</h3>
						<div
							className="alerts-dlx-shortcode-builder-preview"
							aria-live="polite"
							aria-busy={loading}
							dangerouslySetInnerHTML={{ __html: previewHtml }}
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ShortcodeBuilder;
