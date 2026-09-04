/**
 * Dismissible alert cookies and close-button handlers.
 *
 * Client-side hide-on-load is required so dismissal works under full-page
 * caches that skip PHP cookie checks for anonymous visitors.
 */

/**
 * Get cookie names for an alert unique ID.
 *
 * New cookies use the figure id as-is. Legacy cookies used a double prefix.
 *
 * @param {string} uniqueId Alert unique id (e.g. alerts-dlx-abc123).
 * @return {{ current: string, legacy: string }}
 */
const getCookieNames = ( uniqueId ) => {
	return {
		current: uniqueId,
		legacy: `alerts-dlx-${ uniqueId }`,
	};
};

/**
 * Read a cookie value by name.
 *
 * @param {string} name Cookie name.
 * @return {string|null} Cookie value or null.
 */
const getCookie = ( name ) => {
	const match = document.cookie.match(
		new RegExp( '(?:^|; )' + name.replace( /([.$?*|{}()[\]\\/+^])/g, '\\$1' ) + '=([^;]*)' )
	);
	if ( ! match ) {
		return null;
	}

	// A malformed third-party cookie must not disable every alert handler.
	try {
		return decodeURIComponent( match[ 1 ] );
	} catch ( error ) {
		return null;
	}
};

/**
 * Whether an alert has a dismiss cookie set (current or legacy name).
 *
 * @param {string} uniqueId Alert unique id.
 * @return {boolean}
 */
const hasDismissCookie = ( uniqueId ) => {
	if ( ! uniqueId ) {
		return false;
	}

	const { current, legacy } = getCookieNames( uniqueId );
	return Boolean( getCookie( current ) || getCookie( legacy ) );
};

/**
 * Set a dismiss cookie with Safari-friendly attributes.
 *
 * @param {string} name    Cookie name.
 * @param {string} value   Cookie value.
 * @param {number} maxAge  Lifetime in seconds.
 */
const setDismissCookie = ( name, value, maxAge ) => {
	// Mirror the server-side one-year bound even if DOM attributes are modified.
	const boundedMaxAge = Math.min( 31536000, Math.max( 1, maxAge ) );
	const expires = new Date( Date.now() + boundedMaxAge * 1000 ).toUTCString();
	let cookie = `${ name }=${ encodeURIComponent( value ) }`;
	cookie += `; Path=/`;
	cookie += `; Max-Age=${ boundedMaxAge }`;
	cookie += `; Expires=${ expires }`;
	cookie += `; SameSite=Lax`;

	if ( 'https:' === window.location.protocol ) {
		cookie += `; Secure`;
	}

	document.cookie = cookie;
};

/**
 * Resolve the unique id for an alert container.
 *
 * @param {Element} alert Alert root element.
 * @return {string|null}
 */
const getAlertUniqueId = ( alert ) => {
	const figure = alert.querySelector( 'figure' );
	if ( ! figure ) {
		return null;
	}

	return figure.getAttribute( 'id' ) || null;
};

/**
 * Remove alerts that were previously dismissed (works with page cache).
 */
const hideDismissedAlerts = () => {
	document.querySelectorAll( '.alerts-dlx' ).forEach( ( alert ) => {
		if ( ! alert.querySelector( '.alerts-dlx-close' ) ) {
			return;
		}

		const uniqueId = getAlertUniqueId( alert );
		if ( hasDismissCookie( uniqueId ) ) {
			alert.remove();
		}
	} );
};

/**
 * Bind close button click handlers.
 */
const bindCloseButtons = () => {
	document.querySelectorAll( '.alerts-dlx-close' ).forEach( ( closeButton ) => {
		if ( 'true' === closeButton.dataset.alertsDlxBound ) {
			return;
		}
		closeButton.dataset.alertsDlxBound = 'true';

		closeButton.addEventListener( 'click', () => {
			const alert = closeButton.closest( '.alerts-dlx' );
			if ( ! alert ) {
				return;
			}

			// Add removal class.
			alert.classList.add( 'alerts-dlx-remove' );

			// Remove once even when reduced-motion CSS disables the animation.
			let removed = false;
			const removeAlert = () => {
				if ( removed ) {
					return;
				}
				removed = true;
				alert.remove();
			};
			alert.addEventListener( 'animationend', removeAlert, { once: true } );
			if ( window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches ) {
				removeAlert();
			} else {
				window.setTimeout( removeAlert, 1000 );
			}

			const cookieExpiration = parseInt( alert.getAttribute( 'data-expiration' ), 10 );

			// Session-only: no cookie when expiration is 0 or invalid.
			if ( ! cookieExpiration || 0 === cookieExpiration ) {
				return;
			}

			const uniqueId = getAlertUniqueId( alert );
			if ( ! uniqueId ) {
				return;
			}

			const { current } = getCookieNames( uniqueId );
			setDismissCookie( current, 'dismissed', cookieExpiration );
		} );
	} );
};

/**
 * Initialize dismiss behavior.
 */
const init = () => {
	hideDismissedAlerts();
	bindCloseButtons();
};

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
