/* eslint-disable no-undef */
import { useCallback, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import {
	Button,
	Notice,
	TextareaControl,
	PanelBody,
	Spinner,
} from "@wordpress/components";

import sendCommand from "../Utils/SendCommand";
import AlertBuilderInspector from "../Components/AlertBuilder/AlertBuilderInspector";
import AlertBuilderPreview from "../Components/AlertBuilder/AlertBuilderPreview";
import { applyBuilderFieldChange } from "../Components/AlertBuilder/builder-utils";

/**
 * Visual editor for the existing [alertsdlx] shortcode.
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
	const [error, setError] = useState("");
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(false);
	const [previewLoading, setPreviewLoading] = useState(false);

	const requestBuilder = (operation, data) =>
		sendCommand("alerts_dlx_shortcode_builder", {
			nonce: alertsDlxAdmin.shortcodeBuilderNonce,
			operation,
			...data,
		});

	const handleChange = (name, value) => {
		setStatus("");
		setValues((current) => applyBuilderFieldChange(name, value, current, fields));
	};

	const handleImageSelect = (attachment) => {
		setStatus("");
		setValues((current) => ({
			...current,
			image_url: attachment.url || "",
			image_id: attachment.id || 0,
		}));
	};

	const parseSource = () => {
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

	const handlePreviewSuccess = useCallback((data) => {
		const nextShortcode = data.shortcode || "";
		setShortcode((current) =>
			current === nextShortcode ? current : nextShortcode
		);
	}, []);

	const copyShortcode = () => {
		if (!shortcode || !navigator.clipboard?.writeText) {
			setError(
				__("Clipboard access is unavailable in this browser.", "alerts-dlx")
			);
			return;
		}
		navigator.clipboard
			.writeText(shortcode)
			.then(() => {
				setError("");
				setStatus(__("Shortcode copied.", "alerts-dlx"));
			})
			.catch(() => setError(__("Could not copy the shortcode.", "alerts-dlx")));
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
					className="adlx-admin-panel"
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
							<Button
								variant="secondary"
								onClick={parseSource}
								disabled={!source || loading}
							>
								{__("Load shortcode", "alerts-dlx")}
							</Button>
						</div>
					</div>
				</PanelBody>

				<AlertBuilderInspector
					fields={fields}
					values={values}
					onChange={handleChange}
					onSelectImage={handleImageSelect}
				/>

				<div className="adlx-admin-content-body">
					<div className="adlx-admin-component-wrapper">
						<h3 className="adlx-admin-content-subheading">
							{__("Generated shortcode", "alerts-dlx")}
						</h3>
						{previewLoading && (
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
							onChange={() => {}}
							readOnly
						/>
						<Button
							variant="primary"
							onClick={copyShortcode}
							disabled={!shortcode || previewLoading}
						>
							{__("Copy shortcode", "alerts-dlx")}
						</Button>
					</div>
				</div>

				<div className="adlx-admin-content-body">
					<AlertBuilderPreview
						values={values}
						onPreviewError={setError}
						onPreviewLoading={setPreviewLoading}
						onPreviewSuccess={handlePreviewSuccess}
					/>
				</div>
			</div>
		</section>
	);
};

export default ShortcodeBuilder;
