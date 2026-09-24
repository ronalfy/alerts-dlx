/* eslint-disable no-undef */
import { useEffect, useMemo, useRef, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { Spinner } from "@wordpress/components";
import sendCommand from "../../Utils/SendCommand";
import { mergePreviewValues } from "./builder-utils";

/**
 * Debounced production preview via the shortcode builder AJAX endpoint.
 *
 * @param {Object}   props                  Component props.
 * @param {Object}   props.values           Values to preview.
 * @param {Object}   [props.fixture]        Preview-only overlay.
 * @param {boolean}  [props.iconFallback]   Whether to inject a sample icon.
 * @param {Function} [props.onPreviewError]  Error callback.
 * @param {Function} [props.onPreviewSuccess] Success callback with render payload.
 * @param {Function} [props.onPreviewLoading] Loading state callback.
 * @return {Element} Preview panel.
 */
const AlertBuilderPreview = ({
	values,
	fixture = null,
	iconFallback = false,
	onPreviewError,
	onPreviewSuccess,
	onPreviewLoading,
}) => {
	const [previewHtml, setPreviewHtml] = useState("");
	const [loading, setLoading] = useState(false);
	const requestSequence = useRef(0);
	const onPreviewErrorRef = useRef(onPreviewError);
	const onPreviewSuccessRef = useRef(onPreviewSuccess);
	const onPreviewLoadingRef = useRef(onPreviewLoading);

	useEffect(() => {
		onPreviewErrorRef.current = onPreviewError;
		onPreviewSuccessRef.current = onPreviewSuccess;
		onPreviewLoadingRef.current = onPreviewLoading;
	}, [onPreviewError, onPreviewSuccess, onPreviewLoading]);

	const fixtureKey = useMemo(
		() => (fixture ? JSON.stringify(fixture) : ""),
		[fixture]
	);

	const previewPayloadKey = useMemo(() => {
		const payload = fixture
			? mergePreviewValues(values, fixture, { iconFallback })
			: { ...values };
		if (!payload.unique_id) {
			payload.unique_id = "alerts-dlx-admin-preview";
		}
		return JSON.stringify(payload);
	}, [values, fixtureKey, iconFallback, fixture]);

	useEffect(() => {
		const payload = JSON.parse(previewPayloadKey);

		const requestId = requestSequence.current + 1;
		requestSequence.current = requestId;
		const timeout = window.setTimeout(() => {
			setLoading(true);
			if (onPreviewLoadingRef.current) {
				onPreviewLoadingRef.current(true);
			}
			sendCommand("alerts_dlx_shortcode_builder", {
				nonce: alertsDlxAdmin.shortcodeBuilderNonce,
				operation: "render",
				form_data: payload,
			})
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
					setPreviewHtml(response.data.data.preview_html);
					if (onPreviewErrorRef.current) {
						onPreviewErrorRef.current("");
					}
					if (onPreviewSuccessRef.current) {
						onPreviewSuccessRef.current(response.data.data);
					}
				})
				.catch((requestError) => {
					if (requestId === requestSequence.current && onPreviewErrorRef.current) {
						onPreviewErrorRef.current(
							requestError.response?.data?.data?.message ||
								requestError.message ||
								__("Could not render the shortcode preview.", "alerts-dlx")
						);
					}
				})
				.finally(() => {
					if (requestId === requestSequence.current) {
						setLoading(false);
						if (onPreviewLoadingRef.current) {
							onPreviewLoadingRef.current(false);
						}
					}
				});
		}, 300);

		return () => window.clearTimeout(timeout);
	}, [previewPayloadKey]);

	return (
		<div className="adlx-admin-component-wrapper">
			<h3 className="adlx-admin-content-subheading">
				{__("Production preview", "alerts-dlx")}
			</h3>
			{loading && (
				<span role="status" aria-live="polite">
					<Spinner />
					<span className="screen-reader-text">
						{__("Updating preview.", "alerts-dlx")}
					</span>
				</span>
			)}
			<div
				className="alerts-dlx-shortcode-builder-preview"
				aria-live="polite"
				aria-busy={loading}
				dangerouslySetInnerHTML={{ __html: previewHtml }}
			/>
		</div>
	);
};

export default AlertBuilderPreview;
