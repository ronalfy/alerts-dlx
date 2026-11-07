/**
 * Open AlertsDLX dialogs from hash links, classes, and data attributes.
 *
 * The dialog stays in the page after it closes so the same trigger can open it again.
 */

import { escapeAttribute } from '@wordpress/escape-html';

const DIALOG_SELECTOR = 'dialog.alerts-dlx-dialog[data-alerts-dlx-dialog]';

/**
 * Dialogs currently in the document.
 *
 * @return {HTMLDialogElement[]} Rendered alert dialogs.
 */
const getDialogs = () => Array.from( document.querySelectorAll( DIALOG_SELECTOR ) );

/**
 * Find a dialog by its alert unique id.
 *
 * @param {string} id Unique id.
 * @return {HTMLDialogElement|null} Matching dialog, or null.
 */
const findDialog = ( id ) => {
	if ( ! id ) {
		return null;
	}

	return document.querySelector(
		`dialog.alerts-dlx-dialog[data-alerts-dlx-dialog="${ escapeAttribute( String( id ) ) }"]`
	);
};

/**
 * Open a dialog. An already-open dialog is left alone.
 *
 * @param {HTMLDialogElement|null} dialog Dialog element.
 */
const openDialog = ( dialog ) => {
	if ( ! dialog || dialog.open || 'function' !== typeof dialog.showModal ) {
		return;
	}

	dialog.showModal();
};

/**
 * Resolve a location hash to a rendered dialog id.
 *
 * Accepts #uniqueId and #uniqueId-dialog.
 *
 * @param {string} hash Hash, with or without a leading #.
 * @return {string|null} Unique id, or null when no dialog matches.
 */
const idFromHash = ( hash ) => {
	let value = String( hash || '' );
	if ( value.startsWith( '#' ) ) {
		value = value.slice( 1 );
	}
	if ( '' === value ) {
		return null;
	}

	try {
		value = decodeURIComponent( value );
	} catch ( error ) {
		return null;
	}

	if ( findDialog( value ) ) {
		return value;
	}

	if ( value.endsWith( '-dialog' ) ) {
		const trimmed = value.slice( 0, -'-dialog'.length );
		if ( findDialog( trimmed ) ) {
			return trimmed;
		}
	}

	return null;
};

/**
 * Open the dialog named by the current location hash.
 */
const openFromHash = () => {
	const id = idFromHash( window.location.hash );
	if ( ! id ) {
		return;
	}

	openDialog( findDialog( id ) );
};

/**
 * Match modal-{id} or alerts-dlx-open-{id} against dialogs on the page.
 *
 * @param {Element} start Clicked element.
 * @return {string|null} Unique id, or null.
 */
const idFromClassTrigger = ( start ) => {
	const dialogs = getDialogs();
	if ( ! dialogs.length || ! start ) {
		return null;
	}

	let node = start;
	while ( node && node !== document.documentElement ) {
		if ( node.classList ) {
			for ( const dialog of dialogs ) {
				const id = dialog.getAttribute( 'data-alerts-dlx-dialog' );
				if ( ! id ) {
					continue;
				}
				if (
					node.classList.contains( `modal-${ id }` ) ||
					node.classList.contains( `alerts-dlx-open-${ id }` )
				) {
					return id;
				}
			}
		}
		node = node.parentElement;
	}

	return null;
};

/**
 * Open from a click, or close when the backdrop itself is clicked.
 *
 * @param {MouseEvent} event Click event.
 */
const onClick = ( event ) => {
	const target = event.target;
	if ( ! ( target instanceof Element ) ) {
		return;
	}

	const dialogTarget = target.closest( 'dialog.alerts-dlx-dialog' );
	if ( dialogTarget && target === dialogTarget ) {
		dialogTarget.close();
		return;
	}

	const dataTrigger = target.closest( '[data-alerts-dlx-open]' );
	if ( dataTrigger ) {
		const dialog = findDialog( dataTrigger.getAttribute( 'data-alerts-dlx-open' ) );
		if ( dialog ) {
			event.preventDefault();
			openDialog( dialog );
		}
		return;
	}

	const classId = idFromClassTrigger( target );
	if ( classId ) {
		event.preventDefault();
		openDialog( findDialog( classId ) );
		return;
	}

	const link = target.closest( 'a[href^="#"]' );
	if ( ! link ) {
		return;
	}

	const href = link.getAttribute( 'href' ) || '';
	const id = idFromHash( href );
	if ( ! id ) {
		return;
	}

	event.preventDefault();
	openDialog( findDialog( id ) );
	if ( window.location.hash !== href ) {
		window.location.hash = href;
	}
};

/**
 * Open from another script.
 *
 * @param {CustomEvent} event Event whose detail.id is the unique id.
 */
const onOpenEvent = ( event ) => {
	const id = event.detail && event.detail.id;
	openDialog( findDialog( id ) );
};

document.addEventListener( 'click', onClick );
document.addEventListener( 'alerts-dlx-open', onOpenEvent );
window.addEventListener( 'hashchange', openFromHash );
document.addEventListener( 'alertsDlxAlertInserted', openFromHash );

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', openFromHash );
} else {
	openFromHash();
}
