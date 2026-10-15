/**
 * Styles sidebar control for selecting alert types on the canonical Alert block.
 */

import { BlockPreview, store as blockEditorStore } from '@wordpress/block-editor';
import { cloneBlock, createBlock } from '@wordpress/blocks';
import { BaseControl, Button, Popover } from '@wordpress/components';
import { useRegistry } from '@wordpress/data';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	getAlertStyleOptions,
	applyAlertStyle,
	openAlertInspectorTab,
	buildAlertStyleClassName,
} from '../utils/alert-style-utils';

const PREVIEW_VIEWPORT_WIDTH = 600;
const EMPTY_PREVIEW_BLOCKS = [];

/**
 * Build a BlockPreview block list for one alert style.
 *
 * BlockPreview reads `blocks` and renders nothing when that prop is missing.
 * Each block needs a client id and innerBlocks so the preview registry can mount it.
 *
 * @param {Object} registry   WordPress data registry.
 * @param {string} clientId   Block client ID.
 * @param {string} name       Block name.
 * @param {Object} attributes Current block attributes.
 * @param {string} styleName  Alert style slug to preview.
 * @return {Object[]} Preview blocks.
 */
function getStylePreviewBlocks(registry, clientId, name, attributes, styleName) {
	const sourceBlock = clientId
		? registry.select(blockEditorStore).getBlock(clientId)
		: null;
	const sourceAttributes = sourceBlock?.attributes ?? attributes ?? {};
	const previewAttributes = {
		alertType: styleName,
		className: buildAlertStyleClassName(
			sourceAttributes.className,
			styleName
		),
		// Keep this id off the canvas block so the theme edit effect does not rewrite it.
		uniqueId: `alerts-dlx-style-preview-${styleName}`,
	};
	const fallbackInnerBlocks = () => [
		createBlock('core/paragraph', {
			content: __('This is an alert preview.', 'alerts-dlx'),
		}),
	];

	if (sourceBlock) {
		return [
			cloneBlock(
				sourceBlock,
				previewAttributes,
				sourceBlock.innerBlocks?.length
					? undefined
					: fallbackInnerBlocks()
			),
		];
	}

	if (!name) {
		return EMPTY_PREVIEW_BLOCKS;
	}

	return [
		createBlock(
			name,
			{
				...sourceAttributes,
				...previewAttributes,
			},
			fallbackInnerBlocks()
		),
	];
}

/**
 * Render a wrapping button group of alert type styles for the Styles sidebar.
 *
 * @param {Object}   props               Component props.
 * @param {string}   props.name          Block name.
 * @param {Object}   props.attributes    Current block attributes.
 * @param {Function} props.setAttributes Block attribute updater.
 * @param {string}   props.clientId      Block client ID.
 * @param {boolean}  props.disabled      Whether style changes are locked.
 * @return {JSX.Element} Alert type style control.
 */
export default function AlertTypeStyleControl({
	name,
	attributes,
	setAttributes,
	clientId,
	disabled = false,
}) {
	const { alertType, className, alertGroup } = attributes;
	const registry = useRegistry();

	const { presets, customLabel } = useMemo(
		() => getAlertStyleOptions(name, alertGroup),
		[name, alertGroup]
	);

	const [showPopover, setShowPopover] = useState(false);
	const [popoverAnchor, setPopoverAnchor] = useState();
	const [hoveredStyle, setHoveredStyle] = useState(null);
	const closePreviewTimer = useRef(null);

	useEffect(() => {
		return () => {
			if (closePreviewTimer.current) {
				clearTimeout(closePreviewTimer.current);
			}
		};
	}, []);

	const cancelCloseStylePreview = () => {
		if (closePreviewTimer.current) {
			clearTimeout(closePreviewTimer.current);
			closePreviewTimer.current = null;
		}
	};

	/**
	 * Open a preview of the style under the pointer.
	 *
	 * @param {string}      styleName Style slug to preview.
	 * @param {HTMLElement} anchor    Button the popover should attach to.
	 */
	const openStylePreview = (styleName, anchor) => {
		if (disabled || !anchor) {
			return;
		}

		cancelCloseStylePreview();
		setPopoverAnchor(anchor);
		setHoveredStyle(styleName);
		setShowPopover(true);
	};

	/**
	 * Close the preview after a short delay so the pointer can reach the popover.
	 */
	const closeStylePreview = () => {
		cancelCloseStylePreview();
		closePreviewTimer.current = setTimeout(() => {
			setShowPopover(false);
			setHoveredStyle(null);
		}, 150);
	};

	const previewBlocks = useMemo(() => {
		if (!hoveredStyle) {
			return EMPTY_PREVIEW_BLOCKS;
		}

		return getStylePreviewBlocks(
			registry,
			clientId,
			name,
			attributes,
			hoveredStyle
		);
	}, [registry, clientId, name, attributes, hoveredStyle]);

	/**
	 * Apply a style and open the Styles tab when Custom is selected.
	 *
	 * @param {string} styleName Style slug to apply.
	 */
	const selectStyle = (styleName) => {
		if (disabled) {
			return;
		}
		applyAlertStyle({
			className,
			styleName,
			setAttributes,
		});

		if ('custom' === styleName) {
			openAlertInspectorTab(clientId, 'styles');
		}
	};

	return (
		<>
			<BaseControl
				id="alerts-dlx-alert-type-styles"
				label={__('Alert style', 'alerts-dlx')}
				help={
					disabled
						? __('Detach the global style to change alert styles.', 'alerts-dlx')
						: undefined
				}
				__nextHasNoMarginBottom
			>
				<div
					className="alerts-dlx-alert-type-styles"
					role="group"
					aria-label={__('Alert style', 'alerts-dlx')}
				>
					{presets.map((style) => (
						<Button
							key={style.name}
							variant={
								alertType === style.name ? 'primary' : 'secondary'
							}
							onClick={() => selectStyle(style.name)}
							aria-pressed={alertType === style.name}
							disabled={disabled}
							onMouseEnter={(event) =>
								openStylePreview(style.name, event.currentTarget)
							}
							onMouseLeave={closeStylePreview}
						>
							{style.label}
						</Button>
					))}
					<Button
						variant={'custom' === alertType ? 'primary' : 'secondary'}
						onClick={() => selectStyle('custom')}
						aria-pressed={'custom' === alertType}
						disabled={disabled}
						onMouseEnter={(event) =>
							openStylePreview('custom', event.currentTarget)
						}
						onMouseLeave={closeStylePreview}
					>
						{customLabel}
					</Button>
				</div>
			</BaseControl>
			{showPopover && popoverAnchor && !!previewBlocks.length && (
				<Popover
					className="alerts-dlx-preset-popover"
					placement="left"
					onMouseEnter={cancelCloseStylePreview}
					onMouseLeave={closeStylePreview}
					noArrow={false}
					offset={30}
					anchor={popoverAnchor}
					expandOnMobile={true}
					focusOnMount={false}
				>
					<div
						className="alerts-dlx-preset-popover__preview"
						style={{ width: '100%', minWidth: '296px' }}
					>
						<BlockPreview
							blocks={previewBlocks}
							viewportWidth={PREVIEW_VIEWPORT_WIDTH}
							minHeight={96}
						/>
					</div>
				</Popover>
			)}
		</>
	);
}
