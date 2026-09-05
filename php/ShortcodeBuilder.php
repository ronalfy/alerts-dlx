<?php
/**
 * Stateless visual builder for the existing AlertsDLX shortcode.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Parses, normalizes, generates, and previews the existing shortcode.
 */
final class ShortcodeBuilder {

	/** AJAX nonce action. */
	public const NONCE_ACTION = 'alerts_dlx_shortcode_builder';

	/** Maximum supported description bytes. */
	private const MAX_DESCRIPTION_LENGTH = 20000;

	/** Maximum supported SVG/icon bytes. */
	private const MAX_ICON_LENGTH = 12000;

	/** Maximum filter-owned attributes preserved during one round trip. */
	private const MAX_EXTRA_ATTRIBUTES = 32;

	/**
	 * Renderer-derived attributes that are calculated by Blocks::shortcode().
	 */
	private const DERIVED_FIELDS = array(
		'button_enabled',
		'description_enabled',
		'title_enabled',
		'icon_enabled',
	);

	/**
	 * Boolean shortcode fields.
	 */
	private const BOOLEAN_FIELDS = array(
		'button_target',
		'button_rel_no_follow',
		'button_rel_sponsored',
		'close_button_enabled',
		'is_block_editorial_only',
	);

	/**
	 * Custom color shortcode fields.
	 */
	private const COLOR_FIELDS = array(
		'color_primary',
		'color_border',
		'color_accent',
		'color_alt',
		'color_alt_hover',
		'color_alt_text',
		'color_alt_text_hover',
		'color_bold',
		'color_light',
	);

	/**
	 * Historical public theme values, mirrored from the proved theme adapters.
	 */
	private const THEME_DEFINITIONS = array(
		'bootstrap' => array(
			'label'           => 'Bootstrap',
			'alert_types'     => array( 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'custom' ),
			'variants'        => array( 'default', 'centered' ),
			'default_type'    => 'success',
			'default_variant' => 'default',
		),
		'chakra'    => array(
			'label'           => 'Chakra UI',
			'alert_types'     => array( 'success', 'info', 'warning', 'error', 'custom' ),
			'variants'        => array( 'subtle', 'solid', 'left-accent', 'top-accent', 'centered' ),
			'default_type'    => 'success',
			'default_variant' => 'subtle',
		),
		'material'  => array(
			'label'           => 'Material',
			'alert_types'     => array( 'success', 'info', 'warning', 'error', 'custom' ),
			'variants'        => array( 'default', 'outlined', 'filled', 'centered' ),
			'default_type'    => 'success',
			'default_variant' => 'default',
		),
		'shoelace'  => array(
			'label'           => 'Shoelace',
			'alert_types'     => array( 'primary', 'success', 'neutral', 'warning', 'danger', 'custom' ),
			'variants'        => array( 'top-accent', 'left-accent', 'solid', 'centered' ),
			'default_type'    => 'success',
			'default_variant' => 'top-accent',
		),
	);

	/**
	 * Get the complete supported theme map.
	 *
	 * @return array
	 */
	public static function get_theme_definitions() {
		return self::THEME_DEFINITIONS;
	}

	/**
	 * Get shortcode input names from the renderer schema and shared defaults.
	 *
	 * @return array
	 */
	public static function get_input_names() {
		$schema_names  = array_keys( AlertAttributes::get_schema() );
		$default_names = array_keys( AlertAttributes::get_shortcode_defaults() );
		$input_names   = array_values( array_diff( $schema_names, self::DERIVED_FIELDS ) );

		return array_values( array_intersect( $input_names, $default_names ) );
	}

	/**
	 * Get stable values for the visual editor without preselecting an ID.
	 *
	 * Uses builder-only starter content so the first-run preview is not empty.
	 * Frontend omit-attribute fallbacks stay in get_shortcode_defaults().
	 *
	 * @return array
	 */
	public static function get_editor_defaults() {
		$defaults              = AlertAttributes::get_builder_defaults();
		$defaults['unique_id'] = '';
		$defaults['variant']   = self::THEME_DEFINITIONS[ $defaults['alert_group'] ]['default_variant'];

		return array_intersect_key( $defaults, array_flip( self::get_input_names() ) );
	}

	/**
	 * Get translated field metadata for the React controls.
	 *
	 * @return array
	 */
	public static function get_editor_fields() {
		$theme_options   = array();
		$type_options    = array();
		$variant_options = array();
		foreach ( self::THEME_DEFINITIONS as $slug => $definition ) {
			$theme_options[]          = array(
				'value' => $slug,
				'label' => $definition['label'],
			);
			$type_options[ $slug ]    = self::options_from_values( $definition['alert_types'] );
			$variant_options[ $slug ] = self::options_from_values( $definition['variants'] );
		}

		$fields = array(
			array(
				'name'    => 'alert_title',
				'group'   => 'content',
				'control' => 'text',
				'label'   => __( 'Title', 'alerts-dlx' ),
			),
			array(
				'name'    => 'alert_description',
				'group'   => 'content',
				'control' => 'textarea',
				'label'   => __( 'Description', 'alerts-dlx' ),
			),
			array(
				'name'    => 'alert_group',
				'group'   => 'appearance',
				'control' => 'select',
				'label'   => __( 'Design system', 'alerts-dlx' ),
				'options' => $theme_options,
			),
			array(
				'name'             => 'alert_type',
				'group'            => 'appearance',
				'control'          => 'select',
				'label'            => __( 'Alert type', 'alerts-dlx' ),
				'options_by_theme' => $type_options,
			),
			array(
				'name'             => 'variant',
				'group'            => 'appearance',
				'control'          => 'select',
				'label'            => __( 'Appearance', 'alerts-dlx' ),
				'options_by_theme' => $variant_options,
			),
			array(
				'name'    => 'align',
				'group'   => 'appearance',
				'control' => 'select',
				'label'   => __( 'Alignment', 'alerts-dlx' ),
				'options' => self::options_from_values( array( 'left', 'center', 'right', 'wide', 'full' ) ),
			),
			array(
				'name'    => 'mode',
				'group'   => 'appearance',
				'control' => 'select',
				'label'   => __( 'Color mode', 'alerts-dlx' ),
				'options' => self::options_from_values( array( 'light', 'dark' ) ),
			),
			array(
				'name'    => 'maximum_width',
				'group'   => 'appearance',
				'control' => 'number',
				'label'   => __( 'Maximum width', 'alerts-dlx' ),
				'min'     => 1,
				'max'     => 5000,
			),
			array(
				'name'    => 'maximum_width_unit',
				'group'   => 'appearance',
				'control' => 'select',
				'label'   => __( 'Width unit', 'alerts-dlx' ),
				'options' => self::options_from_values( array( 'px', 'em', 'rem', '%', 'vw' ), uppercase:true ),
			),
			array(
				'name'    => 'base_font_size',
				'group'   => 'appearance',
				'control' => 'number',
				'label'   => __( 'Base font size', 'alerts-dlx' ),
				'min'     => 8,
				'max'     => 96,
			),
			array(
				'name'    => 'button_text',
				'group'   => 'action',
				'control' => 'text',
				'label'   => __( 'Button text', 'alerts-dlx' ),
			),
			array(
				'name'    => 'button_url',
				'group'   => 'action',
				'control' => 'url',
				'label'   => __( 'Button URL', 'alerts-dlx' ),
			),
			array(
				'name'    => 'button_target',
				'group'   => 'action',
				'control' => 'toggle',
				'label'   => __( 'Open button in a new tab', 'alerts-dlx' ),
			),
			array(
				'name'    => 'button_rel_no_follow',
				'group'   => 'action',
				'control' => 'toggle',
				'label'   => __( 'Add nofollow', 'alerts-dlx' ),
			),
			array(
				'name'    => 'button_rel_sponsored',
				'group'   => 'action',
				'control' => 'toggle',
				'label'   => __( 'Mark as sponsored', 'alerts-dlx' ),
			),
			array(
				'name'    => 'icon_source',
				'group'   => 'icon',
				'control' => 'select',
				'label'   => __( 'Icon source', 'alerts-dlx' ),
				'options' => self::options_from_values( array( 'icon', 'image' ) ),
			),
			array(
				'name'    => 'icon',
				'group'   => 'icon',
				'control' => 'textarea',
				'label'   => __( 'Icon SVG', 'alerts-dlx' ),
			),
			array(
				'name'    => 'image_url',
				'group'   => 'icon',
				'control' => 'url',
				'label'   => __( 'Image URL', 'alerts-dlx' ),
			),
			array(
				'name'    => 'image_id',
				'group'   => 'icon',
				'control' => 'number',
				'label'   => __( 'Image attachment ID', 'alerts-dlx' ),
				'min'     => 0,
				'max'     => 2147483647,
			),
			array(
				'name'    => 'icon_appearance',
				'group'   => 'icon',
				'control' => 'select',
				'label'   => __( 'Icon appearance', 'alerts-dlx' ),
				'options' => self::options_from_values( array( 'default', 'rounded' ) ),
			),
			array(
				'name'    => 'icon_vertical_alignment',
				'group'   => 'icon',
				'control' => 'select',
				'label'   => __( 'Icon alignment', 'alerts-dlx' ),
				'options' => self::options_from_values( array( 'top', 'centered' ) ),
			),
			array(
				'name'    => 'close_button_enabled',
				'group'   => 'dismiss',
				'control' => 'toggle',
				'label'   => __( 'Allow visitors to dismiss this alert', 'alerts-dlx' ),
			),
			array(
				'name'    => 'close_button_expiration',
				'group'   => 'dismiss',
				'control' => 'number',
				'label'   => __( 'Dismiss duration in seconds', 'alerts-dlx' ),
				'min'     => 0,
				'max'     => 31536000,
			),
			array(
				'name'    => 'unique_id',
				'group'   => 'advanced',
				'control' => 'text',
				'label'   => __( 'Fixed unique ID', 'alerts-dlx' ),
			),
		);

		$color_labels = array(
			'color_primary'        => __( 'Text Color', 'alerts-dlx' ),
			'color_border'         => __( 'Border Color', 'alerts-dlx' ),
			'color_accent'         => __( 'Accent Color', 'alerts-dlx' ),
			'color_alt'            => __( 'Button Color', 'alerts-dlx' ),
			'color_alt_hover'      => __( 'Button Hover Color', 'alerts-dlx' ),
			'color_alt_text'       => __( 'Button Text Color', 'alerts-dlx' ),
			'color_alt_text_hover' => __( 'Button Text Hover Color', 'alerts-dlx' ),
			'color_bold'           => __( 'Icon Color', 'alerts-dlx' ),
			'color_light'          => __( 'Background Color', 'alerts-dlx' ),
		);

		$color_subgroups = array(
			'color_primary'        => __( 'Alert surface', 'alerts-dlx' ),
			'color_border'         => __( 'Alert surface', 'alerts-dlx' ),
			'color_accent'         => __( 'Alert surface', 'alerts-dlx' ),
			'color_light'          => __( 'Alert surface', 'alerts-dlx' ),
			'color_alt'            => __( 'Button', 'alerts-dlx' ),
			'color_alt_hover'      => __( 'Button', 'alerts-dlx' ),
			'color_alt_text'       => __( 'Button', 'alerts-dlx' ),
			'color_alt_text_hover' => __( 'Button', 'alerts-dlx' ),
			'color_bold'           => __( 'Icon', 'alerts-dlx' ),
		);

		foreach ( self::COLOR_FIELDS as $color_field ) {
			$fields[] = array(
				'name'     => $color_field,
				'group'    => 'colors',
				'subgroup' => $color_subgroups[ $color_field ],
				'control'  => 'color',
				'label'    => $color_labels[ $color_field ],
			);
		}

		return $fields;
	}

	/**
	 * Sanitize visual-builder values without writing options or content.
	 *
	 * @param array $values Raw builder values.
	 * @return array|\WP_Error
	 */
	public static function sanitize_values( $values ) {
		if ( ! is_array( $values ) ) {
			return new \WP_Error( 'alerts_dlx_builder_values', __( 'Invalid shortcode builder values.', 'alerts-dlx' ) );
		}

		$defaults = self::get_editor_defaults();

		// Every declared builder input is scalar. Reject PHP array-shaped request
		// parameters before any cast so malformed payloads fail closed cleanly.
		foreach ( self::get_input_names() as $input_name ) {
			if ( array_key_exists( $input_name, $values ) && ! is_scalar( $values[ $input_name ] ) && null !== $values[ $input_name ] ) {
				return new \WP_Error( 'alerts_dlx_builder_scalar', __( 'A shortcode builder field had an invalid value type.', 'alerts-dlx' ) );
			}
		}

		$sanitized = $defaults;
		foreach ( self::BOOLEAN_FIELDS as $field ) {
			$sanitized[ $field ] = filter_var( $values[ $field ] ?? $defaults[ $field ], FILTER_VALIDATE_BOOLEAN );
		}

		$alert_group = sanitize_key( $values['alert_group'] ?? $defaults['alert_group'] );
		if ( ! isset( self::THEME_DEFINITIONS[ $alert_group ] ) ) {
			return new \WP_Error( 'alerts_dlx_builder_group', __( 'Unsupported alert design.', 'alerts-dlx' ) );
		}
		$sanitized['alert_group'] = $alert_group;

		$alert_type = sanitize_key( $values['alert_type'] ?? self::THEME_DEFINITIONS[ $alert_group ]['default_type'] );
		if ( ! in_array( $alert_type, self::THEME_DEFINITIONS[ $alert_group ]['alert_types'], true ) ) {
			return new \WP_Error( 'alerts_dlx_builder_type', __( 'Unsupported alert type for this design.', 'alerts-dlx' ) );
		}
		$sanitized['alert_type'] = $alert_type;

		$variant = sanitize_key( $values['variant'] ?? self::THEME_DEFINITIONS[ $alert_group ]['default_variant'] );
		if ( ! in_array( $variant, self::THEME_DEFINITIONS[ $alert_group ]['variants'], true ) ) {
			return new \WP_Error( 'alerts_dlx_builder_variant', __( 'Unsupported appearance for this design.', 'alerts-dlx' ) );
		}
		$sanitized['variant'] = $variant;

		$sanitized['align']                   = self::sanitize_choice( $values['align'] ?? $defaults['align'], array( 'left', 'center', 'right', 'wide', 'full' ), $defaults['align'] );
		$sanitized['mode']                    = self::sanitize_choice( $values['mode'] ?? $defaults['mode'], array( 'light', 'dark' ), $defaults['mode'] );
		$sanitized['maximum_width_unit']      = self::sanitize_choice( $values['maximum_width_unit'] ?? $defaults['maximum_width_unit'], array( 'px', 'em', 'rem', '%', 'vw' ), $defaults['maximum_width_unit'] );
		$sanitized['icon_vertical_alignment'] = self::sanitize_choice( $values['icon_vertical_alignment'] ?? $defaults['icon_vertical_alignment'], array( 'top', 'centered' ), $defaults['icon_vertical_alignment'] );
		$sanitized['icon_appearance']         = self::sanitize_choice( $values['icon_appearance'] ?? $defaults['icon_appearance'], array( 'default', 'rounded' ), $defaults['icon_appearance'] );
		$sanitized['icon_source']             = self::sanitize_choice( $values['icon_source'] ?? $defaults['icon_source'], array( 'icon', 'image' ), $defaults['icon_source'] );

		$sanitized['maximum_width']           = self::bounded_integer( $values['maximum_width'] ?? $defaults['maximum_width'], 1, 5000 );
		$sanitized['base_font_size']          = self::bounded_integer( $values['base_font_size'] ?? $defaults['base_font_size'], 8, 96 );
		$sanitized['close_button_expiration'] = self::bounded_integer( $values['close_button_expiration'] ?? $defaults['close_button_expiration'], 0, 31536000 );
		$sanitized['image_id']                = self::bounded_integer( $values['image_id'] ?? $defaults['image_id'], 0, 2147483647 );

		$sanitized['unique_id']   = sanitize_html_class( (string) ( $values['unique_id'] ?? '' ) );
		$sanitized['alert_title'] = self::bounded_text( $values['alert_title'] ?? '', 300 );
		$sanitized['button_text'] = self::bounded_text( $values['button_text'] ?? '', 200 );
		$sanitized['button_url']  = esc_url_raw( self::bounded_text( $values['button_url'] ?? '', 2048 ) );
		$sanitized['image_url']   = esc_url_raw( self::bounded_text( $values['image_url'] ?? '', 2048 ) );

		$description = (string) ( $values['alert_description'] ?? '' );
		if ( strlen( $description ) > self::MAX_DESCRIPTION_LENGTH || false !== stripos( $description, '[alertsdlx' ) || false !== stripos( $description, '[/alertsdlx]' ) ) {
			return new \WP_Error( 'alerts_dlx_builder_description', __( 'The description is too long or contains a nested AlertsDLX shortcode tag.', 'alerts-dlx' ) );
		}
		$sanitized['alert_description'] = wp_kses_post( $description );

		$icon = (string) ( $values['icon'] ?? '' );
		if ( strlen( $icon ) > self::MAX_ICON_LENGTH ) {
			return new \WP_Error( 'alerts_dlx_builder_icon', __( 'The icon markup is too long.', 'alerts-dlx' ) );
		}
		$sanitized['icon'] = wp_kses( $icon, Functions::get_kses_allowed_html() );

		foreach ( self::COLOR_FIELDS as $color_field ) {
			$color = self::sanitize_color_value( $values[ $color_field ] ?? '' );
			if ( is_wp_error( $color ) ) {
				return $color;
			}
			$sanitized[ $color_field ] = $color;
		}

		$extra_attributes = array();
		if ( isset( $values['extra_attributes'] ) && is_array( $values['extra_attributes'] ) ) {
			// Filters may add attributes, but a preview request must remain bounded.
			if ( count( $values['extra_attributes'] ) > self::MAX_EXTRA_ATTRIBUTES ) {
				return new \WP_Error( 'alerts_dlx_builder_extra_limit', __( 'Too many additional shortcode attributes were supplied.', 'alerts-dlx' ) );
			}
			foreach ( $values['extra_attributes'] as $name => $value ) {
				$key = sanitize_key( $name );
				if ( $key !== $name || in_array( $key, self::get_input_names(), true ) || ! is_scalar( $value ) ) {
					return new \WP_Error( 'alerts_dlx_builder_extra', __( 'An unsupported shortcode attribute could not be preserved safely.', 'alerts-dlx' ) );
				}
				$extra_attributes[ $key ] = self::bounded_text( (string) $value, 2048 );
			}
		}
		$sanitized['extra_attributes'] = $extra_attributes;

		return $sanitized;
	}

	/**
	 * Parse one complete existing AlertsDLX shortcode for editing.
	 *
	 * @param string $shortcode Existing shortcode source.
	 * @return array|\WP_Error
	 */
	public static function parse_shortcode( $shortcode ) {
		$shortcode = trim( (string) $shortcode );
		$pattern   = get_shortcode_regex( array( 'alertsdlx' ) );
		if ( ! preg_match( '/^' . $pattern . '$/s', $shortcode, $matches ) || 'alertsdlx' !== $matches[2] || '' !== $matches[1] || '' !== $matches[6] ) {
			return new \WP_Error( 'alerts_dlx_builder_parse', __( 'Enter exactly one complete [alertsdlx] shortcode.', 'alerts-dlx' ) );
		}

		$attributes = shortcode_parse_atts( $matches[3] );
		if ( ! is_array( $attributes ) ) {
			$attributes = array();
		}

		$values = array();
		$extra  = array();
		foreach ( $attributes as $name => $value ) {
			if ( in_array( $name, self::get_input_names(), true ) ) {
				$values[ $name ] = $value;
			} else {
				$extra[ $name ] = $value;
			}
		}
		if ( empty( $values['alert_description'] ) && ! empty( $matches[5] ) ) {
			$values['alert_description'] = $matches[5];
		}
		$values['extra_attributes'] = $extra;

		return self::sanitize_values( $values );
	}

	/**
	 * Generate the existing public shortcode syntax deterministically.
	 *
	 * @param array $values Builder values.
	 * @return string|\WP_Error
	 */
	public static function generate_shortcode( $values ) {
		$values = self::sanitize_values( $values );
		if ( is_wp_error( $values ) ) {
			return $values;
		}

		$defaults              = AlertAttributes::get_shortcode_defaults();
		$defaults['unique_id'] = '';
		$theme_default_variant = self::THEME_DEFINITIONS[ $values['alert_group'] ]['default_variant'];
		$attributes            = array();

		foreach ( self::get_input_names() as $name ) {
			if ( 'alert_description' === $name ) {
				continue;
			}
			// Custom colors only apply when alert_type is custom.
			if ( 'custom' !== $values['alert_type'] && in_array( $name, self::COLOR_FIELDS, true ) ) {
				continue;
			}
			$value   = $values[ $name ];
			$default = 'variant' === $name ? $theme_default_variant : $defaults[ $name ];
			if ( $value === $default || ( '' === $value && '' === $default ) ) {
				continue;
			}
			if ( in_array( $name, self::BOOLEAN_FIELDS, true ) ) {
				$value = $value ? 'true' : 'false';
			}
			$attributes[ $name ] = (string) $value;
		}

		foreach ( $values['extra_attributes'] as $name => $value ) {
			$attributes[ $name ] = $value;
		}
		ksort( $attributes );

		$serialized = array();
		foreach ( $attributes as $name => $value ) {
			$quoted = self::quote_attribute( $value );
			if ( is_wp_error( $quoted ) ) {
				return $quoted;
			}
			$serialized[] = $name . '=' . $quoted;
		}

		$opening = '[alertsdlx' . ( empty( $serialized ) ? '' : ' ' . implode( ' ', $serialized ) ) . ']';
		$content = $values['alert_description'];
		return '' === $content ? $opening : $opening . $content . '[/alertsdlx]';
	}

	/**
	 * Build a generated shortcode and production-rendered preview.
	 *
	 * @param array $values Builder values.
	 * @return array|\WP_Error
	 */
	public static function build_preview( $values ) {
		$sanitized = self::sanitize_values( $values );
		if ( is_wp_error( $sanitized ) ) {
			return $sanitized;
		}
		$shortcode = self::generate_shortcode( $sanitized );
		if ( is_wp_error( $shortcode ) ) {
			return $shortcode;
		}
		if ( ! shortcode_exists( 'alertsdlx' ) ) {
			return new \WP_Error( 'alerts_dlx_builder_runtime', __( 'The AlertsDLX shortcode is unavailable.', 'alerts-dlx' ) );
		}

		return array(
			'values'       => $sanitized,
			'shortcode'    => $shortcode,
			'preview_html' => do_shortcode( $shortcode ),
		);
	}

	/**
	 * Handle stateless parse and preview requests from the settings screen.
	 */
	public static function handle_ajax() {
		$nonce = filter_input( INPUT_POST, 'nonce', FILTER_DEFAULT );
		if ( ! wp_verify_nonce( $nonce, self::NONCE_ACTION ) || ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Security check failed', 'alerts-dlx' ) ), 403 );
		}

		$operation = sanitize_key( filter_input( INPUT_POST, 'operation', FILTER_DEFAULT ) ?? 'render' );
		if ( 'parse' === $operation ) {
			$shortcode = filter_input( INPUT_POST, 'shortcode', FILTER_UNSAFE_RAW );
			$result    = self::parse_shortcode( wp_unslash( (string) $shortcode ) );
			if ( ! is_wp_error( $result ) ) {
				$result = self::build_preview( $result );
			}
		} elseif ( 'render' === $operation ) {
			$form_data = isset( $_POST['form_data'] ) && is_array( $_POST['form_data'] ) ? wp_unslash( $_POST['form_data'] ) : array();
			$result    = self::build_preview( $form_data );
		} else {
			$result = new \WP_Error( 'alerts_dlx_builder_operation', __( 'Unsupported shortcode builder operation.', 'alerts-dlx' ) );
		}

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ), 400 );
		}

		wp_send_json_success( $result );
	}

	/**
	 * Create translated select options from public slugs.
	 *
	 * @param array $values Option values.
	 * @param bool  $uppercase Whether to uppercase the label.
	 * @return array
	 */
	private static function options_from_values( $values, bool $uppercase = false ) {
		return array_map(
			static function ( $value ) use ( $uppercase ) {
				return array(
					'value' => $value,
					'label' => $uppercase ? strtoupper( str_replace( '-', ' ', $value ) ) : ucwords( str_replace( '-', ' ', $value ) ),
				);
			},
			$values
		);
	}

	/**
	 * Sanitize an allowlisted string choice.
	 *
	 * @param mixed  $value    Requested value.
	 * @param array  $allowed  Allowed values.
	 * @param string $fallback Fallback value.
	 * @return string
	 */
	private static function sanitize_choice( $value, $allowed, $fallback ) {
		$value = strtolower( trim( sanitize_text_field( (string) $value ) ) );
		return in_array( $value, $allowed, true ) ? $value : $fallback;
	}

	/**
	 * Clamp an integer to a documented builder range.
	 *
	 * @param mixed $value Raw value.
	 * @param int   $min   Minimum value.
	 * @param int   $max   Maximum value.
	 * @return int
	 */
	private static function bounded_integer( $value, $min, $max ) {
		$value = intval( $value );
		return min( $max, max( $min, $value ) );
	}

	/**
	 * Sanitize and bound one text value.
	 *
	 * @param mixed $value      Raw value.
	 * @param int   $max_length Maximum bytes.
	 * @return string
	 */
	private static function bounded_text( $value, $max_length ) {
		$value = sanitize_text_field( (string) $value );
		return substr( $value, 0, $max_length );
	}

	/**
	 * Validate a CSS color without allowing declaration injection.
	 *
	 * @param mixed $value Raw color value.
	 * @return string|\WP_Error
	 */
	private static function sanitize_color_value( $value ) {
		$color = Functions::sanitize_css_color( $value );
		if ( false === $color ) {
			return new \WP_Error( 'alerts_dlx_builder_color', __( 'A custom color contains an unsupported value.', 'alerts-dlx' ) );
		}
		return $color;
	}

	/**
	 * Quote a shortcode attribute without lossy escaping.
	 *
	 * @param string $value Attribute value.
	 * @return string|\WP_Error
	 */
	private static function quote_attribute( $value ) {
		if ( false === strpos( $value, '"' ) ) {
			return '"' . $value . '"';
		}
		if ( false === strpos( $value, "'" ) ) {
			return "'" . $value . "'";
		}
		return new \WP_Error( 'alerts_dlx_builder_quotes', __( 'A shortcode attribute cannot contain both quote styles.', 'alerts-dlx' ) );
	}
}
