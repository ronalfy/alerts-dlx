import DOMPurify from 'dompurify';

const FORBIDDEN_TAGS = [
	'foreignObject',
	'script',
	'style',
	'use',
	'image',
	'a',
	'iframe',
	'embed',
	'object',
	'animate',
	'set',
];

const FORBIDDEN_ATTR = [ 'href', 'xlink:href' ];

// DOMPurify already strips event handlers. This hook covers any on* name it keeps.
DOMPurify.addHook( 'uponSanitizeAttribute', ( node, data ) => {
	if ( node && /^on/i.test( data.attrName ) ) {
		data.keepAttr = false;
	}
} );

/**
 * Sanitize icon SVG for the editor preview.
 *
 * PHP remains the security boundary. This only keeps the canvas preview
 * from rendering the same active tags the server rejects.
 *
 * @param {string} svg Raw icon markup.
 * @return {string} Preview markup.
 */
export default function sanitizeSVG( svg ) {
	return DOMPurify.sanitize( svg, {
		USE_PROFILES: { svg: true, svgFilters: true },
		FORBID_TAGS: FORBIDDEN_TAGS,
		FORBID_ATTR: FORBIDDEN_ATTR,
	} );
}
