<?php
/**
 * Minimal runtime compatibility checks for AlertsDLX.
 *
 * Run after WordPress has loaded and AlertsDLX is active.
 */

if ( ! defined( 'ABSPATH' ) ) {
	fwrite( STDERR, "WordPress must be loaded before runtime-smoke.php.\n" );
	exit( 1 );
}

$failures = array();

if ( ! shortcode_exists( 'alertsdlx' ) ) {
	$failures[] = 'The [alertsdlx] shortcode is not registered.';
}

$options = get_option( 'alerts_dlx', array() );
if ( false === $options ) {
	$failures[] = 'The alerts_dlx option could not be read.';
}

$registry = WP_Block_Type_Registry::get_instance();
foreach (
	array(
		'mediaron/alerts-dlx-bootstrap',
		'mediaron/alerts-dlx-chakra',
		'mediaron/alerts-dlx-material',
		'mediaron/alerts-dlx-shoelace',
	) as $block_name
) {
	if ( ! $registry->is_registered( $block_name ) ) {
		$failures[] = sprintf( 'Historical block is not registered: %s', $block_name );
	}
}

if ( ! empty( $failures ) ) {
	foreach ( $failures as $failure ) {
		fwrite( STDERR, $failure . "\n" );
	}
	exit( 1 );
}

fwrite( STDOUT, "AlertsDLX runtime compatibility smoke checks passed.\n" );
