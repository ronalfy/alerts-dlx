<?php
/**
 * Standalone checks for icon SVG sanitizing.
 *
 * SvgSanitizer has no WordPress runtime dependency. Defining ABSPATH lets this
 * script load the class and the Functions wrapper without bootstrapping WordPress.
 *
 * Run: php maintenance-tests/sanitize-icon-svg.php
 *
 * @package AlertsDLX
 */

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

require_once dirname( __DIR__ ) . '/php/SvgSanitizer.php';
require_once dirname( __DIR__ ) . '/php/Functions.php';

use DLXPlugins\AlertsDLX\Functions;
use DLXPlugins\AlertsDLX\SvgSanitizer;

$failures = 0;

/**
 * Record a failed check.
 *
 * @param string $label   Check name.
 * @param string $detail  Failure detail.
 */
function alerts_dlx_svg_fail( $label, $detail ) {
	global $failures;
	++$failures;
	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite -- CLI test output.
	fwrite( STDERR, $label . ': ' . $detail . PHP_EOL );
}

/**
 * Require dangerous markup to be rejected.
 *
 * @param string $label  Check name.
 * @param string $input  Raw markup.
 * @param string $needle Text that must not survive.
 */
function alerts_dlx_svg_reject( $label, $input, $needle ) {
	$result = SvgSanitizer::sanitize( $input );
	if ( '' !== $result && false !== stripos( $result, $needle ) ) {
		alerts_dlx_svg_fail( $label, 'kept ' . $needle . ' in ' . $result );
	}
	if ( false !== stripos( $result, '<script' ) || false !== stripos( $result, 'javascript:' ) ) {
		alerts_dlx_svg_fail( $label, 'active content survived: ' . $result );
	}
}

$good      = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>';
$kept      = SvgSanitizer::sanitize( $good );
$icon_path = 'M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z';

if ( false === strpos( $kept, $icon_path ) || false === strpos( $kept, '<path' ) ) {
	alerts_dlx_svg_fail( 'bootstrap icon', 'path d was removed: ' . $kept );
}
if ( Functions::sanitize_icon_svg( $good ) !== $kept ) {
	alerts_dlx_svg_fail( 'wrapper', 'Functions::sanitize_icon_svg() did not match SvgSanitizer::sanitize().' );
}
if ( false === strpos( SvgSanitizer::sanitize( $kept ), $icon_path ) ) {
	alerts_dlx_svg_fail( 'second pass', 'a clean icon did not survive a second pass: ' . SvgSanitizer::sanitize( $kept ) );
}

$class_name_icon = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' className='bi bi-check' viewBox='0 0 16 16'><path d='M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z' /></svg>";
$class_result    = SvgSanitizer::sanitize( $class_name_icon );
if ( false !== stripos( $class_result, 'className' ) || false === strpos( $class_result, 'bi bi-check' ) || false === strpos( $class_result, $icon_path ) ) {
	alerts_dlx_svg_fail( 'className', 'expected class bi bi-check and a path d, got: ' . $class_result );
}

alerts_dlx_svg_reject( 'script', '<svg><script>alert(1)</script></svg>', 'script' );
alerts_dlx_svg_reject(
	'foreignObject',
	'<svg><foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></body></foreignObject></svg>',
	'foreignObject'
);
alerts_dlx_svg_reject( 'use href', '<svg><use href="https://evil.example/x.svg#a"/></svg>', 'evil.example' );
alerts_dlx_svg_reject( 'xlink href', '<svg><use xlink:href="https://evil.example/x.svg#a"/></svg>', 'xlink:href' );
alerts_dlx_svg_reject( 'javascript link', '<svg><a href="javascript:alert(1)"><path d="M0 0"/></a></svg>', 'javascript:' );

$onload = SvgSanitizer::sanitize( '<svg onload="alert(1)"><path d="M0 0"/></svg>' );
if ( false !== stripos( $onload, 'onload' ) || false !== stripos( $onload, 'alert(1)' ) || false === strpos( $onload, 'M0 0' ) ) {
	alerts_dlx_svg_fail( 'onload', 'event handler was not stripped cleanly: ' . $onload );
}

if ( '' !== SvgSanitizer::sanitize( '<img src=x onerror=alert(1)>' ) ) {
	alerts_dlx_svg_fail( 'img root', 'non-SVG markup was not rejected.' );
}
if ( '' !== SvgSanitizer::sanitize( '<div><span>nope</span></div>' ) ) {
	alerts_dlx_svg_fail( 'div root', 'non-SVG root was not rejected.' );
}
if ( '' !== SvgSanitizer::sanitize( str_repeat( '<svg></svg>', 2000 ) ) ) {
	alerts_dlx_svg_fail( 'length cap', 'oversized markup was not rejected.' );
}

if ( $failures > 0 ) {
	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite -- CLI test output.
	fwrite( STDERR, $failures . " SVG sanitizer check(s) failed.\n" );
	exit( 1 );
}

echo "SVG sanitizer checks passed.\n";
exit( 0 );
