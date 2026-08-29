import {
	BaseControl,
	Button,
	ButtonGroup,
	PanelRow,
	RangeControl,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export function MaximumWidthControls( {
	attributes,
	setAttributes,
	labelTextDomain = 'alerts-dlx',
	UnitChooserComponent,
} ) {
	const { maximumWidth, maximumWidthUnit } = attributes;
	const label = labelTextDomain === 'quotes-dlx'
		? __( 'Maximum Width', 'quotes-dlx' )
		: __( 'Maximum Width', 'alerts-dlx' );

	return (
		<>
			<UnitChooserComponent
				label={ label }
				value={ maximumWidthUnit }
				units={ [ 'px', '%', 'vw' ] }
				onClick={ ( value ) => {
					setAttributes( { maximumWidthUnit: value } );
				} }
			/>
			<TextControl
				type="text"
				value={ maximumWidth }
				onChange={ ( value ) => {
					setAttributes( { maximumWidth: value } );
				} }
			/>
		</>
	);
}

export function AlertModeControl( {
	attributes,
	setAttributes,
	labelTextDomain = 'alerts-dlx',
	className,
} ) {
	const { mode } = attributes;
	const label = labelTextDomain === 'quotes-dlx'
		? __( 'Set Light or Dark Mode', 'quotes-dlx' )
		: __( 'Set Light or Dark Mode', 'alerts-dlx' );

	return (
		<PanelRow>
			<BaseControl
				id="alerts-dlx-mode-button-group"
				label={ label }
				className={ className }
			>
				<ButtonGroup>
					<Button
						variant={ mode === 'light' ? 'primary' : 'secondary' }
						onClick={ () => setAttributes( { mode: 'light' } ) }
					>
						{ __( 'Light Mode', 'alerts-dlx' ) }
					</Button>
					<Button
						variant={ mode === 'dark' ? 'primary' : 'secondary' }
						onClick={ () => setAttributes( { mode: 'dark' } ) }
					>
						{ __( 'Dark Mode', 'alerts-dlx' ) }
					</Button>
				</ButtonGroup>
			</BaseControl>
		</PanelRow>
	);
}

export function IconVerticalAlignmentControl( {
	attributes,
	setAttributes,
	labelTextDomain = 'alerts-dlx',
	isVisible,
} ) {
	if ( ! isVisible ) {
		return null;
	}

	const { iconVerticalAlignment } = attributes;
	const label = labelTextDomain === 'quotes-dlx'
		? __( 'Icon Vertical Alignment', 'quotes-dlx' )
		: __( 'Icon Vertical Alignment', 'alerts-dlx' );

	return (
		<PanelRow>
			<BaseControl
				id="alerts-dlx-button-group-icon-alignment"
				label={ label }
				className="alerts-dlx-material-variants"
			>
				<ButtonGroup>
					<Button
						variant={ iconVerticalAlignment === 'top' ? 'primary' : 'secondary' }
						onClick={ () => setAttributes( { iconVerticalAlignment: 'top' } ) }
					>
						{ __( 'Top', 'alerts-dlx' ) }
					</Button>
					<Button
						variant={ iconVerticalAlignment === 'centered' ? 'primary' : 'secondary' }
						onClick={ () => setAttributes( { iconVerticalAlignment: 'centered' } ) }
					>
						{ __( 'Centered', 'alerts-dlx' ) }
					</Button>
				</ButtonGroup>
			</BaseControl>
		</PanelRow>
	);
}

export function BaseFontSizeControl( { attributes, setAttributes } ) {
	const { baseFontSize } = attributes;

	return (
		<PanelRow>
			<RangeControl
				label={ __( 'Set the Base Font Size', 'alerts-dlx' ) }
				step={ 1 }
				value={ baseFontSize }
				max={ 36 }
				min={ 12 }
				currentInput={ 16 }
				initialPosition={ 16 }
				allowReset={ true }
				onChange={ ( fontSizeValue ) => {
					setAttributes( { baseFontSize: fontSizeValue } );
				} }
				help={ __( 'Set the base font size for the alert.', 'alerts-dlx' ) }
			/>
		</PanelRow>
	);
}
