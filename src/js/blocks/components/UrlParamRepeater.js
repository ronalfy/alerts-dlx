/**
 * URL parameter repeater for display conditions.
 */

import { TextControl, Button, BaseControl } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

/**
 * UrlParamRepeater component.
 *
 * @param {Object} props - Component props.
 * @return {Function} Component.
 */
const UrlParamRepeater = ( props ) => {
	const { attributes, setAttributes } = props;
	const { urlParams } = attributes;

	/**
	 * Iterate through the URL params and show controls.
	 *
	 * @return {Function} Component.
	 */
	const showParams = () => {
		const paramOutput = urlParams.map( ( param, index ) => {
			return (
				<div className="alerts-dlx__url-param-row" key={ index }>
					<TextControl
						__next40pxDefaultSize={ true }
						label={ __( 'Key', 'alerts-dlx' ) }
						value={ param.key }
						onChange={ ( value ) => {
							const newParams = [ ...urlParams ];
							newParams[ index ].key = value;
							setAttributes( { urlParams: newParams } );
						} }
					/>
					<TextControl
						__next40pxDefaultSize={ true }
						label={ __( 'Value', 'alerts-dlx' ) }
						value={ param.value }
						onChange={ ( value ) => {
							const newParams = [ ...urlParams ];
							newParams[ index ].value = value;
							setAttributes( { urlParams: newParams } );
						} }
					/>
					<Button
						variant="secondary"
						icon={ closeSmall }
						label={ __( 'Remove parameter', 'alerts-dlx' ) }
						onClick={ () => {
							const newParams = [ ...urlParams ];
							newParams.splice( index, 1 );
							setAttributes( { urlParams: newParams } );
						} }
					/>
				</div>
			);
		} );
		return paramOutput;
	};

	return (
		<BaseControl className="alerts-dlx__url-param-repeater"
		help={ __( 'Add one or more URL parameters to check for in the URL. Leave the value empty to check for existence only.', 'alerts-dlx' ) }
		>
			<BaseControl.VisualLabel>
				{ __( 'URL Parameters', 'alerts-dlx' ) }
			</BaseControl.VisualLabel>
			{ showParams() }
			<Button
				variant="secondary"
				onClick={ () => {
					setAttributes( { urlParams: [ ...urlParams, { key: '', value: '' } ] } );
				} }
			>
				{ __( 'Add Parameter', 'alerts-dlx' ) }
			</Button>
		</BaseControl>
	);
};

export default UrlParamRepeater;
