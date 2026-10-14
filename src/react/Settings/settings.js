import { useState, Suspense, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import { useForm, Controller, useFormState, useWatch } from "react-hook-form";
import { useAsyncResource } from "use-async-resource";
import {
	RadioControl,
	ToggleControl,
	TextControl,
	SelectControl,
	Fill,
	Notice,
} from "@wordpress/components";
import SaveBar from "../Components/SaveBar";
import Snackbar from "../Components/Snackbar";
import Loader from "../Components/Loader";
import BlockStylesControl from "../Components/BlockStylesControl";
import sendCommand from "../Utils/SendCommand";

let checkpointData = null;

/**
 * Validate comma-separated CSS class names for headline custom classes.
 *
 * @param {string} input Comma-separated class names.
 * @return {{ valid: boolean, invalidTokens: string[] }}
 */
const validateHeadlineCustomClasses = (input) => {
	if (!input || !input.trim()) {
		return { valid: true, invalidTokens: [] };
	}

	const invalidTokens = [];
	const tokens = input.split(",").map((token) => token.trim());

	tokens.forEach((token) => {
		if (!token) {
			invalidTokens.push(__("(empty)", "alerts-dlx"));
			return;
		}

		const className = token.replace(/^\./, "");
		if (!className) {
			invalidTokens.push(__("(empty)", "alerts-dlx"));
			return;
		}

		if (!/^[-_a-zA-Z][-_a-zA-Z0-9]*$/.test(className)) {
			invalidTokens.push(token);
		}
	});

	return {
		valid: invalidTokens.length === 0,
		invalidTokens,
	};
};

const formatHeadlineCustomClassesForDisplay = (value) => {
	if (!value) {
		return "";
	}

	return value.split(" ").filter(Boolean).join(", ");
};

const marginSpacingOptions = [
	{ value: "none", label: __("None", "alerts-dlx") },
	{ value: "compact", label: __("Compact", "alerts-dlx") },
	{ value: "comfortable", label: __("Comfortable", "alerts-dlx") },
	{ value: "spacious", label: __("Spacious", "alerts-dlx") },
	{ value: "extreme", label: __("Extreme", "alerts-dlx") },
];

const marginSpacingTargetOptions = [
	{ value: "both", label: __("Both", "alerts-dlx") },
	{ value: "top", label: __("Top", "alerts-dlx") },
	{ value: "bottom", label: __("Bottom", "alerts-dlx") },
];

const FONT_FAMILY_MAX_LENGTH = 200;

/**
 * Validate a CSS font-family stack. Empty is allowed.
 *
 * @param {string} input Font family or stack.
 * @return {boolean} True when the stack is empty or safe to store.
 */
const validateFontFamilyOverride = (input) => {
	if (!input || !String(input).trim()) {
		return true;
	}

	const value = String(input).trim();
	return (
		value.length <= FONT_FAMILY_MAX_LENGTH &&
		/[a-zA-Z]/.test(value) &&
		/^[a-zA-Z0-9\s,'"_-]+$/.test(value)
	);
};

const retrieveDefaults = () => {
	return sendCommand("alerts_dlx_retrieve_settings", {
		nonce: alertsDlxAdmin.retrieveNonce,
	});
};

const Settings = () => {
	const [defaults, getDefaults] = useAsyncResource(retrieveDefaults, []);

	return (
		<Suspense
			fallback={
				<Loader
					title={__("AlertsDLX Settings", "alerts-dlx")}
					label={__("Loading…", "alerts-dlx")}
				/>
			}
		>
			<Interface defaults={defaults} />
		</Suspense>
	);
};

const Interface = ({ defaults }) => {
	const response = defaults();
	const { data, success } = response.data;

	if (!success || !data?.values) {
		return (
			<Notice status="error" isDismissible={false}>
				{__("Could not load AlertsDLX settings.", "alerts-dlx")}
			</Notice>
		);
	}

	const [saving, setSaving] = useState(false);
	const [resetting, setResetting] = useState(false);
	const [ajaxError, setAjaxError] = useState(null);
	const [snackbar, setSnackbar] = useState({
		isVisible: false,
		message: __("Settings saved successfully.", "alerts-dlx"),
		type: "success",
	});

	const getDefaultValues = () => ({
		headlineStyle: data.values.headlineStyle || "h2",
		headlineCustomClasses: formatHeadlineCustomClassesForDisplay(
			data.values.headlineCustomClasses || ""
		),
		headlineForceSize: data.values.headlineForceSize || false,
		enabledBlockStyles: data.values.enabledBlockStyles || [],
		debugMode: data.values.debugMode || false,
		marginSpacing: data.values.marginSpacing || "spacious",
		marginSpacingTarget: data.values.marginSpacingTarget || "both",
		overrideFonts: data.values.overrideFonts || false,
		fontFamilyOverride: data.values.fontFamilyOverride || "",
	});

	const { control, reset, getValues } = useForm({
		defaultValues: getDefaultValues(),
	});

	const { isDirty } = useFormState({ control });
	const overrideFonts = useWatch({
		control,
		name: "overrideFonts",
	});

	useEffect(() => {
		checkpointData = getDefaultValues();
	}, [data]);

	const showSnackbar = (message, type = "success") => {
		setSnackbar({
			isVisible: true,
			message,
			type,
		});
	};

	const handleSave = () => {
		const formValues = getValues();

		if (!formValues.enabledBlockStyles?.length) {
			setAjaxError(
				__("At least one alert theme must remain enabled.", "alerts-dlx")
			);
			return;
		}

		const classValidation = validateHeadlineCustomClasses(
			formValues.headlineCustomClasses || ""
		);
		if (!classValidation.valid) {
			setAjaxError(
				__("Invalid headline CSS class names: ", "alerts-dlx") +
				classValidation.invalidTokens.join(", ")
			);
			return;
		}

		if (!validateFontFamilyOverride(formValues.fontFamilyOverride || "")) {
			setAjaxError(
				__(
					"Enter a font family using letters, numbers, spaces, commas, quotes, hyphens, and underscores.",
					"alerts-dlx"
				)
			);
			return;
		}

		setSaving(true);
		setAjaxError(null);

		sendCommand("alerts_dlx_save_settings", {
			nonce: alertsDlxAdmin.saveNonce,
			form_data: formValues,
		})
			.then((ajaxResponse) => {
				if (!ajaxResponse.data.success) {
					throw new Error(
						ajaxResponse.data.data?.message ||
						__("Could not save settings.", "alerts-dlx")
					);
				}

				const savedValues = ajaxResponse.data.data.values;
				reset({
					headlineStyle: savedValues.headlineStyle,
					headlineCustomClasses: formatHeadlineCustomClassesForDisplay(
						savedValues.headlineCustomClasses || ""
					),
					headlineForceSize: savedValues.headlineForceSize,
					enabledBlockStyles: savedValues.enabledBlockStyles,
					debugMode: savedValues.debugMode,
					marginSpacing: savedValues.marginSpacing || "spacious",
					marginSpacingTarget: savedValues.marginSpacingTarget || "both",
					overrideFonts: savedValues.overrideFonts || false,
					fontFamilyOverride: savedValues.fontFamilyOverride || "",
				});
				checkpointData = savedValues;
				showSnackbar(__("Settings saved successfully.", "alerts-dlx"));
			})
			.catch((error) => {
				setAjaxError(
					error.message || __("Could not save settings.", "alerts-dlx")
				);
				showSnackbar(__("Could not save settings.", "alerts-dlx"), "error");
			})
			.finally(() => {
				setSaving(false);
			});
	};

	const handleReset = () => {
		setResetting(true);
		setAjaxError(null);

		sendCommand("alerts_dlx_reset_settings", {
			nonce: alertsDlxAdmin.resetNonce,
		})
			.then((ajaxResponse) => {
				if (!ajaxResponse.data.success) {
					throw new Error(__("Could not reset settings.", "alerts-dlx"));
				}

				const savedValues = ajaxResponse.data.data.values;
				reset({
					headlineStyle: savedValues.headlineStyle,
					headlineCustomClasses: formatHeadlineCustomClassesForDisplay(
						savedValues.headlineCustomClasses || ""
					),
					headlineForceSize: savedValues.headlineForceSize,
					enabledBlockStyles: savedValues.enabledBlockStyles,
					debugMode: savedValues.debugMode,
					marginSpacing: savedValues.marginSpacing || "spacious",
					marginSpacingTarget: savedValues.marginSpacingTarget || "both",
					overrideFonts: savedValues.overrideFonts || false,
					fontFamilyOverride: savedValues.fontFamilyOverride || "",
				});
				checkpointData = savedValues;
				showSnackbar(__("Settings reset to defaults.", "alerts-dlx"));
			})
			.catch(() => {
				showSnackbar(__("Could not reset settings.", "alerts-dlx"), "error");
			})
			.finally(() => {
				setResetting(false);
			});
	};

	const handleDiscard = () => {
		if (checkpointData) {
			reset({
				headlineStyle: checkpointData.headlineStyle,
				headlineCustomClasses: formatHeadlineCustomClassesForDisplay(
					checkpointData.headlineCustomClasses || ""
				),
				headlineForceSize: checkpointData.headlineForceSize,
				enabledBlockStyles: checkpointData.enabledBlockStyles,
				debugMode: checkpointData.debugMode,
				marginSpacing: checkpointData.marginSpacing || "spacious",
				marginSpacingTarget: checkpointData.marginSpacingTarget || "both",
				overrideFonts: checkpointData.overrideFonts || false,
				fontFamilyOverride: checkpointData.fontFamilyOverride || "",
			});
		}
		setAjaxError(null);
	};

	const enabledBlockStyles = getValues("enabledBlockStyles");
	const hasErrors = !enabledBlockStyles?.length;

	return (
		<>
			<div className="adlx-admin-content-wrapper">
				<div className="adlx-admin-content-panel">
					<div className="adlx-admin-content-heading">
						<h1>
							<span className="adlx-admin-content-heading-text">
								{__("AlertsDLX Settings", "alerts-dlx")}
							</span>
						</h1>
						<p className="description">
							{__(
								"Configure global AlertsDLX options for your site.",
								"alerts-dlx"
							)}
						</p>
					</div>

					{ajaxError && (
						<Notice status="error" isDismissible={false}>
							{ajaxError}
						</Notice>
					)}

					<div className="adlx-admin-content-body">
						<div className="adlx-admin-component-wrapper">
							<h3 className="adlx-admin-content-subheading">
								{__("Alert Title Options", "alerts-dlx")}
							</h3>
							<div className="adlx-admin-component-row">
								<p className="description">
									{__(
										"Choose the HTML element, add CSS classes, and force the alert title styles.",
										"alerts-dlx"
									)}
								</p>
							</div>
							<div className="adlx-admin-component-row">
								<Controller
									name="headlineStyle"
									control={control}
									render={({ field: { onChange, value } }) => (
										<RadioControl
											label={__("Title Element", "alerts-dlx")}
											selected={value}
											options={data.headlineStyleOptions || []}
											onChange={onChange}
										/>
									)}
								/>
							</div>
							<div className="adlx-admin-component-row">
								<Controller
									name="headlineCustomClasses"
									control={control}
									render={({ field: { onChange, value } }) => (
										<TextControl
											label={__("Custom Headline Classes", "alerts-dlx")}
											value={value}
											onChange={onChange}
											help={__(
												"Comma-separated CSS class names applied to alert titles in addition to alerts-dlx-title. Accepts my-class or .my-class.",
												"alerts-dlx"
											)}
										/>
									)}
								/>
							</div>
							<div className="adlx-admin-component-row">
								<Controller
									name="headlineForceSize"
									control={control}
									render={({ field: { onChange, value } }) => (
										<ToggleControl
											label={__("Force Headline Size", "alerts-dlx")}
											checked={value}
											onChange={onChange}
											help={__(
												"Adds CSS important rules to the headline styles so the plugin title font size/styles win over theme CSS.",
												"alerts-dlx"
											)}
										/>
									)}
								/>
							</div>
						</div>
					</div>
					<div className="adlx-admin-content-body">
						<div className="adlx-admin-component-wrapper">
							<h3 className="adlx-admin-content-subheading">
								{__("Fonts", "alerts-dlx")}
							</h3>
							<div className="adlx-admin-component-row">
								<p className="description">
									{__(
										"Alerts use the bundled Lato font. Turn on an override to type your own font family.",
										"alerts-dlx"
									)}
								</p>
							</div>
							<div className="adlx-admin-component-row">
								<Controller
									name="overrideFonts"
									control={control}
									render={({ field: { onChange, value } }) => (
										<ToggleControl
											label={__("Override fonts", "alerts-dlx")}
											checked={value}
											onChange={onChange}
											help={__(
												"Use a custom font family instead of the bundled Lato font.",
												"alerts-dlx"
											)}
										/>
									)}
								/>
							</div>
							{overrideFonts && (
								<div className="adlx-admin-component-row">
									<Controller
										name="fontFamilyOverride"
										control={control}
										render={({ field: { onChange, value } }) => (
											<TextControl
												label={__("Font family", "alerts-dlx")}
												value={value}
												onChange={onChange}
												help={__(
													"CSS font stack, such as Georgia, \"Times New Roman\", serif. Leave blank to use Helvetica, Arial, sans-serif.",
													"alerts-dlx"
												)}
											/>
										)}
									/>
								</div>
							)}
						</div>
					</div>
					<div className="adlx-admin-content-body">
						<div className="adlx-admin-component-wrapper">
							<h3 className="adlx-admin-content-subheading">
								{__("Margin Spacing", "alerts-dlx")}
							</h3>
							<div className="adlx-admin-component-row">
								<p className="description">
									{__(
										"Default spacing for newly inserted alerts, new styles, and a fresh shortcode builder session.",
										"alerts-dlx"
									)}
								</p>
							</div>
							<div className="adlx-admin-component-row">
								<Controller
									name="marginSpacing"
									control={control}
									render={({ field: { onChange, value } }) => (
										<SelectControl
											label={__("Margin spacing", "alerts-dlx")}
											value={value || "spacious"}
											options={marginSpacingOptions}
											onChange={onChange}
											__nextHasNoMarginBottom
										/>
									)}
								/>
							</div>
							<div className="adlx-admin-component-row">
								<Controller
									name="marginSpacingTarget"
									control={control}
									render={({ field: { onChange, value } }) => (
										<SelectControl
											label={__("Margin target", "alerts-dlx")}
											value={value || "both"}
											options={marginSpacingTargetOptions}
											onChange={onChange}
											__nextHasNoMarginBottom
										/>
									)}
								/>
							</div>
						</div>
					</div>
					<div className="adlx-admin-content-body">
						<div className="adlx-admin-component-wrapper">
							<h3 className="adlx-admin-content-subheading">
								{__("Alert Themes", "alerts-dlx")}
							</h3>
							<div className="adlx-admin-component-row">
								<p className="description">
									{__(
										"Select which alert themes are available in the block inserter. This will not affect existing alerts on your site.",
										"alerts-dlx"
									)}
								</p>
							</div>
							<div className="adlx-admin-component-row">
								<Controller
									name="enabledBlockStyles"
									control={control}
									render={({ field: { onChange, value } }) => (
										<BlockStylesControl
											options={data.blockStyleOptions || []}
											value={value}
											onChange={onChange}
										/>
									)}
								/>
							</div>
						</div>
					</div>
					<div className="adlx-admin-content-body">
						<div className="adlx-admin-component-wrapper">
							<h3 className="adlx-admin-content-subheading">
								{__("Debug Mode", "alerts-dlx")}
							</h3>
							<div className="adlx-admin-component-row">
								<p className="description">
									{__(
										"Show useful information in the admin area for debugging purposes.",
										"alerts-dlx"
									)}
								</p>
							</div>
							<div className="adlx-admin-component-row">
								<Controller
									name="debugMode"
									control={control}
									render={({ field: { onChange, value } }) => (
										<ToggleControl
											label={__("Enable Debug Mode", "alerts-dlx")}
											checked={value}
											onChange={onChange}
										/>
									)}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Fill name="alertsDlxSettingsFooter">
				<Snackbar
					isVisible={snackbar.isVisible}
					message={snackbar.message}
					type={snackbar.type}
					onClose={() =>
						setSnackbar((current) => ({ ...current, isVisible: false }))
					}
				/>
				<SaveBar
					onSave={handleSave}
					onReset={handleReset}
					onDiscardChanges={handleDiscard}
					isSaving={saving}
					isResetting={resetting}
					isDirtyFields={isDirty}
					hasErrors={hasErrors}
				/>
			</Fill>
		</>
	);
};

export default Settings;
