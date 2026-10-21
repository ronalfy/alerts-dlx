/**
 * Multi-select day-of-week toggle using plain Buttons.
 *
 * @package AlertsDLX
 */

import { BaseControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const DAY_LABELS = [
	{ label: __( 'Sunday', 'alerts-dlx' ), value: 0 },
	{ label: __( 'Monday', 'alerts-dlx' ), value: 1 },
	{ label: __( 'Tuesday', 'alerts-dlx' ), value: 2 },
	{ label: __( 'Wednesday', 'alerts-dlx' ), value: 3 },
	{ label: __( 'Thursday', 'alerts-dlx' ), value: 4 },
	{ label: __( 'Friday', 'alerts-dlx' ), value: 5 },
	{ label: __( 'Saturday', 'alerts-dlx' ), value: 6 },
];

/**
 * Render a row of toggle buttons for selecting days of the week.
 *
 * @param {Object}   props          Component properties.
 * @param {string}   props.value    Comma-separated day numbers.
 * @param {Function} props.onChange Callback receiving the new comma-separated string.
 * @param {string}   props.label    Label for the control.
 * @param {string}   props.help     Help text for the control.
 * @return {Element} Day selector control.
 */
export default function DayOfWeekSelector( { value, onChange, label, help } ) {
	const selectedDays = value
		? value
				.split( ',' )
				.map( ( d ) => parseInt( d.trim(), 10 ) )
				.filter( ( d ) => ! isNaN( d ) )
		: [];

	return (
		<BaseControl
			label={ label }
			help={ help }
			className="alerts-dlx-day-selector__wrapper"
		>
			<div
				className="alerts-dlx-day-selector"
				role="group"
				aria-label={ label || __( 'Days of Week', 'alerts-dlx' ) }
			>
				{ DAY_LABELS.map( ( day ) => {
					const isSelected = selectedDays.includes( day.value );
					return (
						<Button
							key={ day.value }
							variant={ isSelected ? 'primary' : 'secondary' }
							onClick={ () => {
								const next = isSelected
									? selectedDays.filter( ( d ) => d !== day.value )
									: [ ...selectedDays, day.value ].sort( ( a, b ) => a - b );
								onChange( next.join( ',' ) );
							} }
						>
							{ day.label }
						</Button>
					);
				} ) }
			</div>
		</BaseControl>
	);
}
