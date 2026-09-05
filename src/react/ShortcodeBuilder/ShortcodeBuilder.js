/* eslint-disable no-undef */
import { useEffect, useRef, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import {
	Button,
	Notice,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl,
	PanelBody,
	ToggleControl,
} from "@wordpress/components";
import { PanelColorSettings } from '@wordpress/block-editor';

import sendCommand from "../Utils/SendCommand";

const groupLabels = {
	content: __("Content", "alerts-dlx"),
	appearance: __("Appearance", "alerts-dlx"),
	action: __("Button", "alerts-dlx"),
	icon: __("Icon or image", "alerts-dlx"),
	colors: __("Custom colors", "alerts-dlx"),
	dismiss: __("Dismiss", "alerts-dlx"),
	advanced: __("Advanced", "alerts-dlx"),
};

let colorSettings = [];

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

	const maybeInputColor = ["color"].includes(field.control)
		? field.control
		: null;
	if (maybeInputColor) {
		colorSettings.push({
			label: field.label,
			value: '#FF0000',
			onChange: (nextValue) => onChange(field.name, nextValue),
		});
		return null;
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
			const next = { ...current, [name]: value };
			if ("alert_group" === name) {
				const typeField = fields.find((field) => "alert_type" === field.name);
				const variantField = fields.find((field) => "variant" === field.name);
				const typeOptions = typeField?.options_by_theme?.[value] || [];
				const variantOptions = variantField?.options_by_theme?.[value] || [];
				if (!typeOptions.some((option) => option.value === next.alert_type)) {
					next.alert_type = typeOptions[0]?.value || "success";
				}
				next.variant = variantOptions[0]?.value || "default";
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

	console.log(colorSettings);

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
					const groupFields = fields.filter((field) => field.group === group);
					if (!groupFields.length) {
						return null;
					}
					return (
						<div className="adlx-admin-content-body" key={group}>
							<div className="adlx-admin-component-wrapper">
								<h3 className="adlx-admin-content-subheading">{label}</h3>
								{groupFields.map((field) => (
									<div className="adlx-admin-component-row" key={field.name}>
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
				{colorSettings.length > 0 && (
					<>
						<h3 className="adlx-admin-content-subheading">
							{__("Custom colorss", "alerts-dlx")}
						</h3>
						<PanelColorSettings
							__experimentalIsRenderedInSidebar={ false }
							title={__("Custom colorss", "alerts-dlx")}
							colorSettings={colorSettings}
						/>
					</>
				)}

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
