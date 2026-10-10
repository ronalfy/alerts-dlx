import {
	BaseControl,
	Button,
	ButtonGroup,
	PanelRow,
	RangeControl,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
	getMarginSpacingOptions,
	getMarginSpacingTargetOptions,
	normalizeMarginSpacing,
	normalizeMarginSpacingTarget,
} from '../utils/margin-spacing';

/**
 * Editor ranges for the maximum-width slider.
 *
 * The attribute is a string and PHP sanitizes it as an integer, so the step is 1.
 * These ranges are not stored. An out-of-range saved value is clamped only when
 * the user changes the unit or the slider.
 */
const MAXIMUM_WIDTH_RANGES = {
	px: { min: 0, max: 1600, step: 1 },
	'%': { min: 0, max: 100, step: 1 },
	vw: { min: 0, max: 100, step: 1 },
	rem: { min: 0, max: 100, step: 1 },
};

/**
 * Slider bounds for one maximum-width unit.
 *
 * @param {string} unit Width unit.
 * @return {{min: number, max: number, step: number}} Slider bounds.
 */
function getMaximumWidthRange( unit ) {
	return MAXIMUM_WIDTH_RANGES[ unit ] || MAXIMUM_WIDTH_RANGES.px;
}

/**
 * Parse a stored maximum width.
 *
 * @param {string|number} value Stored maximum width.
 * @return {number|undefined} Parsed width, or undefined when it is not numeric.
 */
function parseMaximumWidth( value ) {
	const numericWidth = parseFloat( value );
	return Number.isFinite( numericWidth ) ? numericWidth : undefined;
}

/**
 * Clamp a width into a unit range.
 *
 * @param {number} value  Width value.
 * @param {Object} bounds Slider bounds with min and max.
 * @return {number} Clamped width.
 */
function clampMaximumWidth( value, bounds ) {
	return Math.min( bounds.max, Math.max( bounds.min, value ) );
}

function isAppearanceLocked(attributes) {
	return Number(attributes?.globalStyleId) > 0;
}

export function MaximumWidthControls( {
	attributes,
	setAttributes,
	labelTextDomain = 'alerts-dlx',
	UnitChooserComponent,
} ) {
	const { maximumWidth, maximumWidthUnit } = attributes;
	const locked = isAppearanceLocked( attributes );
	const label = labelTextDomain === 'quotes-dlx'
		? __( 'Maximum Width', 'quotes-dlx' )
		: __( 'Maximum Width', 'alerts-dlx' );
	const bounds = getMaximumWidthRange( maximumWidthUnit );
	const numericWidth = parseMaximumWidth( maximumWidth );

	return (
		<>
			<UnitChooserComponent
				label={ label }
				value={ maximumWidthUnit }
				units={ [ 'px', '%', 'vw', 'rem' ] }
				onClick={ ( unit ) => {
					if ( locked ) {
						return;
					}

					const nextAttributes = { maximumWidthUnit: unit };
					const nextBounds = getMaximumWidthRange( unit );

					// Clamp only after the user switches units.
					if (
						Number.isFinite( numericWidth ) &&
						( numericWidth < nextBounds.min || numericWidth > nextBounds.max )
					) {
						nextAttributes.maximumWidth = String(
							clampMaximumWidth( numericWidth, nextBounds )
						);
					}

					setAttributes( nextAttributes );
				} }
			/>
			<RangeControl
				label={ label }
				hideLabelFromVision
				value={ numericWidth }
				min={ bounds.min }
				max={ bounds.max }
				step={ bounds.step }
				withInputField
				disabled={ locked }
				onChange={ ( nextValue ) => {
					// RangeControl emits a number. The block attribute stays a string.
					if ( 'number' !== typeof nextValue || Number.isNaN( nextValue ) ) {
						return;
					}
					setAttributes( {
						maximumWidth: String( clampMaximumWidth( Math.round( nextValue ), bounds ) ),
					} );
				} }
			/>
		</>
	);
}

export function MarginSpacingControls( { attributes, setAttributes } ) {
	const locked = isAppearanceLocked( attributes );
	const marginSpacing = normalizeMarginSpacing( attributes?.marginSpacing );
	const marginSpacingTarget = normalizeMarginSpacingTarget( attributes?.marginSpacingTarget );

	return (
		<>
			<SelectControl
				label={ __( 'Margin Spacing', 'alerts-dlx' ) }
				value={ marginSpacing }
				options={ getMarginSpacingOptions() }
				disabled={ locked }
				onChange={ ( value ) => {
					if ( locked ) {
						return;
					}
					setAttributes( { marginSpacing: normalizeMarginSpacing( value ) } );
				} }
				help={ __( 'Spacious matches the original alert margin.', 'alerts-dlx' ) }
				__nextHasNoMarginBottom
			/>
			<SelectControl
				label={ __( 'Margin Target', 'alerts-dlx' ) }
				value={ marginSpacingTarget }
				options={ getMarginSpacingTargetOptions() }
				disabled={ locked }
				onChange={ ( value ) => {
					if ( locked ) {
						return;
					}
					setAttributes( { marginSpacingTarget: normalizeMarginSpacingTarget( value ) } );
				} }
				__nextHasNoMarginBottom
			/>
		</>
	);
}

export function AlertModeControl({
	attributes,
	setAttributes,
	labelTextDomain = 'alerts-dlx',
	className,
}) {
	const { mode } = attributes;
	const locked = isAppearanceLocked(attributes);
	const label = labelTextDomain === 'quotes-dlx'
		? __('Set Light or Dark Mode', 'quotes-dlx')
		: __('Set Light or Dark Mode', 'alerts-dlx');

	return (
		<PanelRow>
			<BaseControl
				id="alerts-dlx-mode-button-group"
				label={label}
				className={className}
			>
				<ButtonGroup>
					<Button
						variant={mode === 'light' ? 'primary' : 'secondary'}
						disabled={locked}
						onClick={() => setAttributes({ mode: 'light' })}
					>
						{__('Light Mode', 'alerts-dlx')}
					</Button>
					<Button
						variant={mode === 'dark' ? 'primary' : 'secondary'}
						disabled={locked}
						onClick={() => setAttributes({ mode: 'dark' })}
					>
						{__('Dark Mode', 'alerts-dlx')}
					</Button>
				</ButtonGroup>
			</BaseControl>
		</PanelRow>
	);
}

export function IconVerticalAlignmentControl({
	attributes,
	setAttributes,
	labelTextDomain = 'alerts-dlx',
	isVisible,
}) {
	if (!isVisible) {
		return null;
	}

	const { iconVerticalAlignment } = attributes;
	const locked = isAppearanceLocked(attributes);
	const label = labelTextDomain === 'quotes-dlx'
		? __('Icon Vertical Alignment', 'quotes-dlx')
		: __('Icon Vertical Alignment', 'alerts-dlx');

	return (
		<PanelRow>
			<BaseControl
				id="alerts-dlx-button-group-icon-alignment"
				label={label}
				className="alerts-dlx-material-variants"
			>
				<ButtonGroup>
					<Button
						variant={iconVerticalAlignment === 'top' ? 'primary' : 'secondary'}
						disabled={locked}
						onClick={() => setAttributes({ iconVerticalAlignment: 'top' })}
					>
						{__('Top', 'alerts-dlx')}
					</Button>
					<Button
						variant={iconVerticalAlignment === 'centered' ? 'primary' : 'secondary'}
						disabled={locked}
						onClick={() => setAttributes({ iconVerticalAlignment: 'centered' })}
					>
						{__('Centered', 'alerts-dlx')}
					</Button>
				</ButtonGroup>
			</BaseControl>
		</PanelRow>
	);
}

export function BaseFontSizeControl({ attributes, setAttributes }) {
	const { baseFontSize } = attributes;
	const locked = isAppearanceLocked(attributes);

	return (
		<PanelRow>
			<RangeControl
				label={__('Set the Base Font Size', 'alerts-dlx')}
				step={1}
				value={baseFontSize}
				max={36}
				min={12}
				currentInput={16}
				initialPosition={16}
				allowReset={true}
				disabled={locked}
				onChange={(fontSizeValue) => {
					setAttributes({ baseFontSize: fontSizeValue });
				}}
				help={__('Set the base font size for the alert.', 'alerts-dlx')}
			/>
		</PanelRow>
	);
}
