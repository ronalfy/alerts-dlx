/* eslint-disable no-undef */
import { useEffect, useRef, useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import {
	BaseControl,
	Button,
	ColorIndicator,
	ColorPalette,
	Dropdown,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
} from "@wordpress/components";
import { getAlertColorPalette } from "../../../js/blocks/utils/alert-color-palette";
import { getIconSetForGroup } from "../../../js/blocks/utils/icon-sets";
import IconPicker from "../../../js/blocks/components/IconPicker";
import useMediaUploader from "../../../js/blocks/hooks/useMediaUploader";
import { isCommitableColor } from "./builder-utils";

const CompactColorField = ({ field, value, colors, onChange }) => {
	const committedValue = value || "";
	const [draft, setDraft] = useState(committedValue);
	const debounceRef = useRef(null);
	const hasColor = Boolean(draft);
	const inputId = `alerts-dlx-${field.name}`;
	const triggerLabel = hasColor
		? sprintf(__("%1$s, %2$s", "alerts-dlx"), field.label, draft)
		: sprintf(__("%s, no color selected.", "alerts-dlx"), field.label);

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
					aria-label={sprintf(__("Clear %s", "alerts-dlx"), field.label)}
				>
					{__("Clear", "alerts-dlx")}
				</Button>
			</div>
		</BaseControl>
	);
};

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

const CompactImageField = ({ field, values, onChange, onSelectImage }) => {
	const inputId = `alerts-dlx-${field.name}`;
	const { openMediaUploader } = useMediaUploader();
	const urlValue = values.image_url || "";

	return (
		<BaseControl
			id={inputId}
			label={field.label}
			className="alerts-dlx-shortcode-builder-image-control"
		>
			<div className="alerts-dlx-shortcode-builder-image-row">
				<div className="alerts-dlx-shortcode-builder-image-url">
					<TextControl
						id={inputId}
						label={field.label}
						hideLabelFromVision
						type="url"
						value={urlValue}
						onChange={(nextValue) => onChange(field.name, nextValue || "")}
						__nextHasNoMarginBottom
					/>
				</div>
				<Button
					variant="secondary"
					onClick={() => {
						openMediaUploader(
							{
								title: __("Set Your Image", "alerts-dlx"),
								buttonLabel: __("Save Image", "alerts-dlx"),
								removeLabel: __("Remove Image", "alerts-dlx"),
								suggestedWidth: 96,
								suggestedHeight: 96,
								aspectRatio: "1:1",
								attachmentId: values.image_id || 0,
								canSkipCrop: true,
							},
							(attachment) => {
								onSelectImage(attachment);
							}
						);
					}}
				>
					{__("Select Image", "alerts-dlx")}
				</Button>
			</div>
		</BaseControl>
	);
};

const BuilderField = ({ field, values, onChange, onSelectImage }) => {
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

	if ("image_url" === field.name) {
		return (
			<CompactImageField
				field={field}
				values={values}
				onChange={onChange}
				onSelectImage={onSelectImage}
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

export default BuilderField;
