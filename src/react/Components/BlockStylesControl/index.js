import { __ } from '@wordpress/i18n';
import { BaseControl, CheckboxControl } from '@wordpress/components';

const BlockStylesControl = ( { options, value, onChange } ) => {
	const enabledStyles = Array.isArray( value ) ? value : [];

	const handleChange = ( slug, checked ) => {
		if ( ! checked && enabledStyles.length <= 1 ) {
			return;
		}

		const next = checked
			? [ ...enabledStyles, slug ]
			: enabledStyles.filter( ( style ) => style !== slug );

		onChange( next );
	};

	return (
		<BaseControl
			id="enabledBlockStyles"
			label={ __( 'Enabled Alert Themes', 'alerts-dlx' ) }
			help={ __(
				'Unchecked themes are hidden from the block inserter. Existing alerts using a disabled theme are unaffected.',
				'alerts-dlx'
			) }
		>
			<div className="alerts-dlx-block-styles-row">
				{ options.map( ( item ) => (
					<CheckboxControl
						key={ item.value }
						label={ item.label }
						checked={ enabledStyles.includes( item.value ) }
						onChange={ ( checked ) => handleChange( item.value, checked ) }
						__nextHasNoMarginBottom
					/>
				) ) }
			</div>
			{ enabledStyles.length <= 1 && (
				<p className="description alerts-dlx-block-styles-notice">
					{ __( 'At least one alert theme must remain enabled.', 'alerts-dlx' ) }
				</p>
			) }
		</BaseControl>
	);
};

export default BlockStylesControl;
