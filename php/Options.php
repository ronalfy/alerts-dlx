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
			'debug_mode'              => false,
			'margin_spacing'          => 'spacious',
			'margin_spacing_target'   => 'both',
			'override_fonts'          => false,
			'font_family_override'    => '',
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
	 * Get the site default margin amount for new alerts.
	 *
	 * Omitted shortcode attributes stay spacious via AlertAttributes.
	 * This value is the starting point for new blocks and new admin sessions.
	 *
	 * @return string Allowlisted amount.
	 */
	public static function get_margin_spacing() {
		$options = self::get_plugin_options();
		return AlertAttributes::sanitize_margin_spacing( $options['margin_spacing'] ?? 'spacious' );
	}

	/**
	 * Get the site default margin target for new alerts.
	 *
	 * @return string Allowlisted target.
	 */
	public static function get_margin_spacing_target() {
		$options = self::get_plugin_options();
		return AlertAttributes::sanitize_margin_spacing_target( $options['margin_spacing_target'] ?? 'both' );
	}

	/**
	 * Overlay the site margin default onto a fresh admin session.
	 *
	 * Does not change omit-attribute fallbacks. Callers that parse saved
	 * shortcodes or stored library items should keep their own defaults.
	 *
	 * @param array $values Default values keyed in snake_case.
	 * @return array
	 */
	public static function overlay_margin_spacing_defaults( array $values ) {
		$values['margin_spacing']        = self::get_margin_spacing();
		$values['margin_spacing_target'] = self::get_margin_spacing_target();
		return $values;
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
	 * Check whether a manual font family override is enabled.
	 *
	 * @return bool
	 */
	public static function is_font_override_enabled() {
		$options = self::get_plugin_options();
		return (bool) ( $options['override_fonts'] ?? false );
	}

	/**
	 * Get the stored font family override.
	 *
	 * This is the saved stack only. Callers that print CSS must also check
	 * is_font_override_enabled() before using it.
	 *
	 * @return string
	 */
	public static function get_font_family_override() {
		$options = self::get_plugin_options();
		$family  = $options['font_family_override'] ?? '';

		if ( ! is_string( $family ) ) {
			return '';
		}

		$sanitized = self::sanitize_font_family_override( $family );
		if ( is_wp_error( $sanitized ) ) {
			return '';
		}

		return $sanitized;
	}

	/**
	 * Get the font stack used when the Lato stylesheet is not loaded.
	 *
	 * The manual override is used only when Override fonts is enabled and a stack is saved.
	 * An empty override keeps the Helvetica fallback.
	 *
	 * @return string CSS font-family value.
	 */
	public static function get_fallback_font_family() {
		$fallback = '"Helvetica", "Arial", sans-serif';
		if ( ! self::is_font_override_enabled() ) {
			return $fallback;
		}

		$override = self::get_font_family_override();
		if ( '' === $override ) {
			return $fallback;
		}

		return $override;
	}

	/**
	 * Whether the bundled Lato font stylesheet should load.
	 *
	 * A saved font override turns this off. The alerts_dlx_load_fonts filter can still change the result.
	 *
	 * @return bool
	 */
	public static function should_load_fonts() {
		$load_fonts = ! self::is_font_override_enabled();

		/**
		 * Filter whether to load the Lato font stylesheet.
		 *
		 * The default is false when Override fonts is enabled in the settings.
		 *
		 * @param bool $load_fonts Whether to load the Lato font stylesheet.
		 * @return bool
		 */
		return (bool) apply_filters( 'alerts_dlx_load_fonts', $load_fonts );
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
	 * Sanitize a CSS font-family stack typed in the settings screen.
	 *
	 * Allows letters, numbers, spaces, commas, quotes, hyphens, and underscores.
	 * Empty is valid and means no manual stack is stored.
	 *
	 * @param mixed $input Font family or stack.
	 * @return string|\WP_Error Sanitized stack, or an error when the value is not a safe font stack.
	 */
	public static function sanitize_font_family_override( $input ) {
		if ( ! is_string( $input ) ) {
			$input = '';
		}

		$input = trim( sanitize_text_field( $input ) );
		if ( '' === $input ) {
			return '';
		}

		$is_safe_stack = (bool) preg_match( '/^[a-zA-Z0-9\s,\'"_-]+$/', $input );
		$has_letter    = (bool) preg_match( '/[a-zA-Z]/', $input );
		if ( strlen( $input ) > 200 || ! $is_safe_stack || ! $has_letter ) {
			return new \WP_Error(
				'alerts_dlx_invalid_font_family',
				__( 'Enter a font family using letters, numbers, spaces, commas, quotes, hyphens, and underscores.', 'alerts-dlx' )
			);
		}

		return $input;
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
}
