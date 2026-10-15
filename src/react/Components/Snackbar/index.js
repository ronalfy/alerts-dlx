import { useEffect } from '@wordpress/element';
import { Snackbar as WPSnackbar } from '@wordpress/components';
import classnames from 'classnames';

const Snackbar = ( props ) => {
	const {
		isVisible,
		message,
		type = 'success',
		isPersistent = false,
		onClose,
	} = props;

	useEffect( () => {
		if ( isVisible && ! isPersistent ) {
			const timer = setTimeout( () => {
				onClose();
			}, 5000 );
			return () => clearTimeout( timer );
		}
	}, [ isVisible, isPersistent, onClose ] );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<WPSnackbar
			className={ classnames( 'alerts-dlx-snackbar', `alerts-dlx-snackbar-${ type }` ) }
			onDismiss={ onClose }
		>
			{ message }
		</WPSnackbar>
	);
};

export default Snackbar;
