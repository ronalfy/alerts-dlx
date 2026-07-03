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
			'headline_style'          => 'h2',
			'headline_custom_classes' => '',
			'headline_force_size'     => false,
			'enabled_block_styles'    => array( 'bootstrap', 'chakra', 'material', 'shoelace' ),
			'debug_mode'              => false,
			'options_version'         => '1.0.0',
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
	 * Resolve a headline tag to a safe allowlisted value via forced lookup.
	 *
	 * @param mixed $tag Requested headline tag.
	 * @return string Safe headline tag from the allowlist.
	 */
	public static function resolve_headline_tag( $tag ) {
		$map = array(
			'h1'  => 'h1',
			'h2'  => 'h2',
			'h3'  => 'h3',
			'h4'  => 'h4',
			'h5'  => 'h5',
			'h6'  => 'h6',
			'div' => 'div',
		);

		if ( ! is_string( $tag ) ) {
			return 'h2';
		}

		$key = strtolower( trim( $tag ) );

		return $map[ $key ] ?? 'h2';
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
	public static function get_headline_tag() {
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
		$style = apply_filters( 'alerts_dlx_headline_style', $style );

		return self::resolve_headline_tag( $style );
	}

	/**
	 * Get custom CSS classes for alert title elements.
	 *
	 * @return string Space-separated class names.
	 */
	public static function get_headline_custom_classes() {
		$options = self::get_plugin_options();
		$classes = isset( $options['headline_custom_classes'] ) ? $options['headline_custom_classes'] : '';

		if ( ! is_string( $classes ) ) {
			$classes = '';
		}

		/**
		 * Filter custom CSS classes applied to alert title elements.
		 *
		 * @param string $classes Space-separated class names.
		 */
		return apply_filters( 'alerts_dlx_headline_custom_classes', $classes );
	}

	/**
	 * Get the full class attribute value for alert title elements.
	 *
	 * @return string Space-separated class names including alerts-dlx-title.
	 */
	public static function get_headline_title_classes() {
		$classes = array( 'alerts-dlx-title' );

		$custom_classes = self::get_headline_custom_classes();
		if ( ! empty( $custom_classes ) ) {
			$classes = array_merge( $classes, explode( ' ', $custom_classes ) );
		}

		return implode( ' ', array_unique( array_filter( $classes ) ) );
	}

	/**
	 * Check if headline font size should be forced via wrapper class.
	 *
	 * @return bool
	 */
	public static function is_headline_force_size() {
		$options = self::get_plugin_options();
		$forced  = (bool) ( $options['headline_force_size'] ?? false );

		/**
		 * Filter whether alert title font size is forced over theme styles.
		 *
		 * @param bool $forced Whether to force headline size.
		 */
		return (bool) apply_filters( 'alerts_dlx_headline_force_size', $forced );
	}

	/**
	 * Parse and validate a comma-separated list of CSS class names.
	 *
	 * @param string $input Comma-separated class names.
	 *
	 * @return array|\WP_Error Array with sanitized space-separated string, or WP_Error on invalid input.
	 */
	public static function sanitize_headline_custom_classes( $input ) {
		if ( ! is_string( $input ) ) {
			$input = '';
		}

		$input = trim( $input );
		if ( '' === $input ) {
			return array(
				'value' => '',
			);
		}

		$tokens         = array_map( 'trim', explode( ',', $input ) );
		$invalid_tokens = array();
		$valid_classes  = array();

		foreach ( $tokens as $token ) {
			if ( '' === $token ) {
				$invalid_tokens[] = __( '(empty)', 'alerts-dlx' );
				continue;
			}

			$token = ltrim( $token, '.' );
			if ( '' === $token ) {
				$invalid_tokens[] = __( '(empty)', 'alerts-dlx' );
				continue;
			}

			if ( ! preg_match( '/^[-_a-zA-Z][-_a-zA-Z0-9]*$/', $token ) ) {
				$invalid_tokens[] = $token;
				continue;
			}

			$sanitized = sanitize_html_class( $token );
			if ( '' === $sanitized || $sanitized !== $token ) {
				$invalid_tokens[] = $token;
				continue;
			}

			$valid_classes[] = $sanitized;
		}

		if ( ! empty( $invalid_tokens ) ) {
			return new \WP_Error(
				'alerts_dlx_invalid_headline_classes',
				sprintf(
					/* translators: %s: comma-separated list of invalid CSS class names */
					__( 'Invalid headline CSS class names: %s', 'alerts-dlx' ),
					implode( ', ', array_unique( $invalid_tokens ) )
				)
			);
		}

		return array(
			'value' => implode( ' ', array_unique( $valid_classes ) ),
		);
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
