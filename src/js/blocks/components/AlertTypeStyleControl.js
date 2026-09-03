/**
 * Styles sidebar control for selecting alert types on the canonical Alert block.
 */

import { useMemo } from '@wordpress/element';
import { BaseControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	getAlertStyleOptions,
	applyAlertStyle,
	openAlertInspectorTab,
} from '../utils/alert-style-utils';

/**
 * Render a wrapping button group of alert type styles for the Styles sidebar.
 *
 * @param {Object}   props               Component props.
 * @param {string}   props.name          Block name.
 * @param {Object}   props.attributes    Current block attributes.
 * @param {Function} props.setAttributes Block attribute updater.
 * @param {string}   props.clientId      Block client ID.
 * @return {import('react').JSX.Element} Alert type style control.
 */
export default function AlertTypeStyleControl( {
	name,
	attributes,
	setAttributes,
	clientId,
} ) {
	const { alertType, className, alertGroup } = attributes;

	const { presets, customLabel } = useMemo(
		() => getAlertStyleOptions( name, alertGroup ),
		[ name, alertGroup ]
	);

	/**
	 * Apply a style and open the Styles tab when Custom is selected.
	 *
	 * @param {string} styleName Style slug to apply.
	 */
	const selectStyle = ( styleName ) => {
		applyAlertStyle( {
			className,
			styleName,
			setAttributes,
		} );

		if ( 'custom' === styleName ) {
			openAlertInspectorTab( clientId, 'styles' );
		}
	};

	return (
		<BaseControl
			id="alerts-dlx-alert-type-styles"
			label={ __( 'Alert style', 'alerts-dlx' ) }
			__nextHasNoMarginBottom
		>
			<div
				className="alerts-dlx-alert-type-styles"
				role="group"
				aria-label={ __( 'Alert style', 'alerts-dlx' ) }
			>
				{ presets.map( ( style ) => (
					<Button
						key={ style.name }
						variant={ alertType === style.name ? 'primary' : 'secondary' }
						onClick={ () => selectStyle( style.name ) }
						aria-pressed={ alertType === style.name }
					>
						{ style.label }
					</Button>
				) ) }
				<Button
					variant={ 'custom' === alertType ? 'primary' : 'secondary' }
					onClick={ () => selectStyle( 'custom' ) }
					aria-pressed={ 'custom' === alertType }
				>
					{ customLabel }
				</Button>
			</div>
		</BaseControl>
	);
}
