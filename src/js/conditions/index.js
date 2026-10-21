/**
 * Client-side display conditions for AlertsDLX alerts.
 *
 * Evaluates start/end dates, days of week, URL parameters, and user login/role
 * requirements after the page loads so conditions work under full-page caching.
 */

/**
 * Cached user state promise so multiple alerts share one request.
 */
let userStatePromise = null;

/**
 * Fetch the current user's login state and roles from the REST API.
 *
 * @return {Promise<{isLoggedIn: boolean, roles: string[]}>}
 */
const fetchUserState = () => {
	if ( userStatePromise ) {
		return userStatePromise;
	}

	userStatePromise = fetch( '/wp-json/dlxplugins/alerts-dlx/v1/user-state', {
		method: 'GET',
		credentials: 'same-origin',
		headers: { 'Accept': 'application/json' },
	} )
		.then( ( response ) => {
			if ( ! response.ok ) {
				return { isLoggedIn: false, roles: [] };
			}
			return response.json();
		} )
		.catch( () => {
			return { isLoggedIn: false, roles: [] };
		} );

	return userStatePromise;
};

/**
 * Check whether the current date/time satisfies the alert's date and day rules.
 *
 * @param {HTMLElement} alert Alert container element.
 * @return {boolean} Whether the alert should be kept.
 */
const passesDateConditions = ( alert ) => {
	const now = new Date();
	const start = alert.dataset.startDate;
	const end = alert.dataset.endDate;
	const days = alert.dataset.daysOfWeek;

	if ( start ) {
		const startDate = new Date( start );
		if ( now < startDate ) {
			return false;
		}
	}

	if ( end ) {
		const endDate = new Date( end );
		if ( now > endDate ) {
			return false;
		}
	}

	if ( days ) {
		const allowed = days.split( ',' ).map( ( d ) => parseInt( d.trim(), 10 ) );
		if ( ! allowed.includes( now.getDay() ) ) {
			return false;
		}
	}

	return true;
};

/**
 * Check whether the current URL satisfies the alert's parameter rules.
 *
 * @param {HTMLElement} alert Alert container element.
 * @return {boolean} Whether the alert should be kept.
 */
const passesUrlParamCondition = ( alert ) => {
	let params;
	try {
		params = JSON.parse( alert.dataset.urlParams || '[]' );
	} catch {
		return true;
	}
	if ( ! Array.isArray( params ) || params.length === 0 ) {
		return true;
	}

	const searchParams = new URLSearchParams( window.location.search );
	return params.every( ( param ) => {
		const current = searchParams.get( param.key );
		if ( param.value === '' || param.value === undefined ) {
			return searchParams.has( param.key );
		}
		return current === param.value;
	} );
};

/**
 * Check whether the current user satisfies the alert's login/role rules.
 *
 * @param {HTMLElement}  alert     Alert container element.
 * @param {Object}       userState Resolved user state.
 * @return {boolean} Whether the alert should be kept.
 */
const passesUserConditions = ( alert, userState ) => {
	const requireLogin = alert.dataset.requireLogin === 'true';
	const requiredRoles = alert.dataset.requiredRoles;

	if ( ! requireLogin ) {
		return true;
	}

	if ( ! userState.isLoggedIn ) {
		return false;
	}

	if ( ! requiredRoles ) {
		return true;
	}

	const allowedRoles = requiredRoles.split( ',' ).map( ( r ) => r.trim() );
	return allowedRoles.some( ( role ) => userState.roles.includes( role ) );
};

/**
 * Evaluate all display conditions for every conditioned alert on the page.
 */
const evaluateDisplayConditions = async () => {
	const alerts = document.querySelectorAll( '.alerts-dlx[data-conditions-enabled="true"]' );
	if ( alerts.length === 0 ) {
		return;
	}

	const hasUserConditions = Array.from( alerts ).some(
		( alert ) => alert.dataset.requireLogin === 'true' || alert.dataset.requiredRoles
	);

	const userState = hasUserConditions ? await fetchUserState() : { isLoggedIn: false, roles: [] };

	alerts.forEach( ( alert ) => {
		if ( ! passesDateConditions( alert ) ) {
			alert.remove();
			return;
		}

		if ( ! passesUrlParamCondition( alert ) ) {
			alert.remove();
			return;
		}

		if ( ! passesUserConditions( alert, userState ) ) {
			alert.remove();
			return;
		}
	} );
};

/**
 * Initialize display conditions.
 */
const init = () => {
	evaluateDisplayConditions();
};

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
