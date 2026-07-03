<?php
/**
 * Plugin options and defaults.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Options
 */
class Options {

	/**
	 * Cached plugin options.
	 *
	 * @var array|false
	 */
	private static $options = false;

	/**
	 * Main class runner.
	 */
	public static function run() {
		// Reserved for future migrations.
	}

	/**
	 * Get plugin option defaults.
	 *
	 * @return array
	 */
	public static function get_defaults() {
		return array(
			'headline_style'       => 'h2',
			'enabled_block_styles' => array( 'bootstrap', 'chakra', 'material', 'shoelace' ),
			'debug_mode'           => false,
			'options_version'      => '1.0.0',
		);
	}

	/**
	 * Get allowed headline style tags.
	 *
	 * @return array
	 */
	public static function get_allowed_headline_styles() {
		return array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div' );
	}

	/**
	 * Get allowed alert theme slugs.
	 *
	 * @return array
	 */
	public static function get_allowed_block_styles() {
		return array( 'bootstrap', 'chakra', 'material', 'shoelace' );
	}

	/**
	 * Get alert theme definitions for admin UI.
	 *
	 * @return array
	 */
	public static function get_block_style_definitions() {
		return array(
			'bootstrap' => __( 'Bootstrap', 'alerts-dlx' ),
			'chakra'    => __( 'Chakra UI', 'alerts-dlx' ),
			'material'  => __( 'Material', 'alerts-dlx' ),
			'shoelace'  => __( 'Shoelace', 'alerts-dlx' ),
		);
	}

	/**
	 * Get plugin options merged with defaults.
	 *
	 * @param bool $force Force refresh from database.
	 *
	 * @return array
	 */
	public static function get_plugin_options( $force = false ) {
		if ( false === self::$options || $force ) {
			$defaults = self::get_defaults();
			$options  = get_option( 'alerts_dlx', array() );
			if ( ! is_array( $options ) ) {
				$options = array();
			}
			self::$options = wp_parse_args( $options, $defaults );
		}
		return self::$options;
	}

	/**
	 * Get the headline style tag for alert titles.
	 *
	 * @return string
	 */
	public static function get_headline_style() {
		$options = self::get_plugin_options();
		$style   = isset( $options['headline_style'] ) ? $options['headline_style'] : 'h2';

		if ( ! in_array( $style, self::get_allowed_headline_styles(), true ) ) {
			$style = 'h2';
		}

		/**
		 * Filter the headline style tag used for alert titles.
		 *
		 * @param string $style The headline tag (h1-h6 or div).
		 */
		return apply_filters( 'alerts_dlx_headline_style', $style );
	}

	/**
	 * Get enabled alert theme slugs.
	 *
	 * @return array
	 */
	public static function get_enabled_block_styles() {
		$options = self::get_plugin_options();
		$styles  = isset( $options['enabled_block_styles'] ) ? $options['enabled_block_styles'] : self::get_allowed_block_styles();

		if ( ! is_array( $styles ) ) {
			$styles = self::get_allowed_block_styles();
		}

		$styles = array_values(
			array_intersect(
				array_map( 'sanitize_key', $styles ),
				self::get_allowed_block_styles()
			)
		);

		if ( empty( $styles ) ) {
			$styles = self::get_allowed_block_styles();
		}

		/**
		 * Filter the enabled alert themes.
		 *
		 * @param array $styles Array of enabled alert theme slugs.
		 */
		return apply_filters( 'alerts_dlx_enabled_block_styles', $styles );
	}

	/**
	 * Check if an alert theme is enabled.
	 *
	 * @param string $style Alert theme slug.
	 *
	 * @return bool
	 */
	public static function is_block_style_enabled( $style ) {
		return in_array( sanitize_key( $style ), self::get_enabled_block_styles(), true );
	}

	/**
	 * Check if debug mode is enabled.
	 *
	 * @return bool
	 */
	public static function is_debug_mode() {
		$options = self::get_plugin_options();
		return (bool) ( $options['debug_mode'] ?? false );
	}

	/**
	 * Sanitize enabled alert themes from form input.
	 *
	 * @param array $styles Alert theme slugs from form.
	 *
	 * @return array
	 */
	public static function sanitize_enabled_block_styles( $styles ) {
		if ( ! is_array( $styles ) ) {
			return array();
		}

		return array_values(
			array_intersect(
				array_map( 'sanitize_key', $styles ),
				self::get_allowed_block_styles()
			)
		);
	}
}
