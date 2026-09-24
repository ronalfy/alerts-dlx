<?php
/**
 * Normalize historical alert attributes for frontend rendering.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Converts block and shortcode attributes into one renderer input contract.
 */
final class AlertAttributes {

	/**
	 * Historical attribute names and their unchanged sanitization modes.
	 */
	private const SCHEMA = array(
		'unique_id'               => array( 'uniqueId', 'text' ),
		'alert_group'             => array( 'alertGroup', 'text' ),
		'alert_type'              => array( 'alertType', 'text' ),
		'align'                   => array( 'align', 'text' ),
		'alert_title'             => array( 'alertTitle', 'text' ),
		'alert_description'       => array( 'alertDescription', 'raw' ),
		'button_enabled'          => array( 'buttonEnabled', 'boolean' ),
		'maximum_width_unit'      => array( 'maximumWidthUnit', 'text' ),
		'maximum_width'           => array( 'maximumWidth', 'integer' ),
		'icon'                    => array( 'icon', 'raw' ),
		'description_enabled'     => array( 'descriptionEnabled', 'boolean' ),
		'title_enabled'           => array( 'titleEnabled', 'boolean' ),
		'icon_enabled'            => array( 'iconEnabled', 'boolean' ),
		'base_font_size'          => array( 'baseFontSize', 'integer' ),
		'icon_vertical_alignment' => array( 'iconVerticalAlignment', 'text' ),
		'variant'                 => array( 'variant', 'text' ),
		'mode'                    => array( 'mode', 'text' ),
		'button_text'             => array( 'buttonText', 'text' ),
		'button_url'              => array( 'buttonUrl', 'text' ),
		'button_target'           => array( 'buttonTarget', 'boolean' ),
		'button_rel_no_follow'    => array( 'buttonRelNoFollow', 'boolean' ),
		'button_rel_sponsored'    => array( 'buttonRelSponsored', 'boolean' ),
		'icon_appearance'         => array( 'iconAppearance', 'text' ),
		'color_primary'           => array( 'colorPrimary', 'text' ),
		'color_border'            => array( 'colorBorder', 'text' ),
		'color_accent'            => array( 'colorAccent', 'text' ),
		'color_alt'               => array( 'colorAlt', 'text' ),
		'color_alt_hover'         => array( 'colorAltHover', 'text' ),
		'color_alt_text'          => array( 'colorAltText', 'text' ),
		'color_alt_text_hover'    => array( 'colorAltTextHover', 'text' ),
		'color_bold'              => array( 'colorBold', 'text' ),
		'color_light'             => array( 'colorLight', 'text' ),
		'close_button_enabled'    => array( 'closeButtonEnabled', 'boolean' ),
		'close_button_expiration' => array( 'closeButtonExpiration', 'integer' ),
		'is_block_editorial_only' => array( 'isBlockEditorialOnly', 'boolean' ),
		'icon_source'             => array( 'iconSource', 'text' ),
		'image_url'               => array( 'imageUrl', 'text' ),
		'image_id'                => array( 'imageId', 'integer' ),
	);

	/**
	 * Get the renderer schema used by blocks and the shortcode builder.
	 *
	 * @return array
	 */
	public static function get_schema() {
		return self::SCHEMA;
	}

	/**
	 * Get the existing shortcode defaults from one shared authority.
	 *
	 * These values are frontend omit-attribute fallbacks for [alertsdlx].
	 * Title and custom colors stay empty so existing shortcodes that omit
	 * those attributes do not gain a sample title or custom palette.
	 *
	 * The generated identifier remains per-call so the historical shortcode
	 * identity and Dismiss behavior stay unchanged.
	 *
	 * @return array
	 */
	public static function get_shortcode_defaults() {
		return array(
			'unique_id'               => 'alerts-dlx-' . wp_rand( 0, 1000 ) . wp_generate_password( 6, false, false ),
			'alert_group'             => 'chakra',
			'alert_type'              => 'success',
			'align'                   => 'center',
			'alert_title'             => '',
			'alert_description'       => '',
			'maximum_width_unit'      => 'px',
			'maximum_width'           => 650,
			'icon'                    => '',
			'base_font_size'          => 16,
			'icon_vertical_alignment' => 'top',
			'variant'                 => '',
			'mode'                    => 'light',
			'button_text'             => '',
			'button_url'              => '',
			'button_target'           => false,
			'button_rel_no_follow'    => false,
			'button_rel_sponsored'    => false,
			'icon_appearance'         => 'default',
			'color_primary'           => '',
			'color_border'            => '',
			'color_accent'            => '',
			'color_alt'               => '',
			'color_alt_hover'         => '',
			'color_alt_text'          => '',
			'color_alt_text_hover'    => '',
			'color_bold'              => '',
			'color_light'             => '',
			'close_button_enabled'    => false,
			'close_button_expiration' => 0,
			'is_block_editorial_only' => false,
			'icon_source'             => 'icon',
			'image_url'               => '',
			'image_id'                => 0,
		);
	}

	/**
	 * Get starter values for the Shortcode Builder preview.
	 *
	 * Copies get_shortcode_defaults() then overlays a sample title, sample
	 * description, the info alert type, and that group's info palette so the
	 * Custom colors panel is already filled when the type is switched.
	 *
	 * @return array
	 */
	public static function get_builder_defaults() {
		$defaults                      = self::get_shortcode_defaults();
		$defaults['alert_type']        = 'info';
		$defaults['alert_title']       = __( 'Alert title', 'alerts-dlx' );
		$defaults['alert_description'] = __( 'This is a sample alert.', 'alerts-dlx' );

		return array_merge( $defaults, self::get_info_colors( $defaults['alert_group'] ) );
	}

	/**
	 * Get the nine custom-color attributes for every supported alert group.
	 *
	 * @return array
	 */
	public static function get_info_colors_by_group() {
		$colors = array();
		foreach ( array( 'bootstrap', 'chakra', 'material', 'shoelace' ) as $alert_group ) {
			$colors[ $alert_group ] = self::get_info_colors( $alert_group );
		}

		return $colors;
	}

	/**
	 * Map a group's info palette onto the nine custom-color attribute keys.
	 *
	 * Values are the theme info tokens (primary for Shoelace, which has no
	 * info type) with hex fallbacks from the SCSS light maps so pickers and
	 * the production preview both have a concrete color.
	 *
	 * @param string $alert_group Alert design slug.
	 * @return array
	 */
	public static function get_info_colors( $alert_group ) {
		$alert_group = sanitize_key( (string) $alert_group );
		$palettes    = self::get_info_color_palettes();
		if ( ! isset( $palettes[ $alert_group ] ) ) {
			$alert_group = 'chakra';
		}

		return $palettes[ $alert_group ];
	}

	/**
	 * Return the info (or nearest informational) palette per alert group.
	 *
	 * @return array
	 */
	private static function get_info_color_palettes() {
		return array(
			'bootstrap' => array(
				'color_primary'        => 'var(--bootstrap-info-color, #055160)',
				'color_border'         => 'var(--bootstrap-info-color-border, #b6effb)',
				'color_accent'         => 'var(--bootstrap-info-color-accent, #076c81)',
				'color_alt'            => 'var(--bootstrap-info-color-alt, #055160)',
				'color_alt_hover'      => 'var(--bootstrap-info-color-accent, #076c81)',
				'color_alt_text'       => 'var(--bootstrap-info-color-contrast, #ffffff)',
				'color_alt_text_hover' => 'var(--bootstrap-info-color-contrast, #ffffff)',
				'color_bold'           => 'var(--bootstrap-info-color-bold, #055160)',
				'color_light'          => 'var(--bootstrap-info-color-light, #cff4fc)',
			),
			'chakra'    => array(
				'color_primary'        => 'var(--chakra-info-color, #014361)',
				'color_border'         => 'var(--chakra-info-color-border, #014361)',
				'color_accent'         => 'var(--chakra-info-color-accent, #3182ce)',
				'color_alt'            => 'var(--chakra-info-color-alt, #2d75b8)',
				'color_alt_hover'      => 'var(--chakra-info-color-accent, #3182ce)',
				'color_alt_text'       => 'var(--chakra-info-color-contrast, #ffffff)',
				'color_alt_text_hover' => 'var(--chakra-info-color-contrast, #ffffff)',
				'color_bold'           => 'var(--chakra-info-color-bold, #2d76bb)',
				'color_light'          => 'var(--chakra-info-color-light, #bee3f8)',
			),
			'material'  => array(
				'color_primary'        => 'var(--material-info-color, #014361)',
				'color_border'         => 'var(--material-info-color, #014361)',
				'color_accent'         => 'var(--material-info-color-accent, #035e88)',
				'color_alt'            => 'var(--material-info-color-alt, #0277bd)',
				'color_alt_hover'      => 'var(--material-info-color-accent, #035e88)',
				'color_alt_text'       => '#ffffff',
				'color_alt_text_hover' => '#ffffff',
				'color_bold'           => 'var(--material-info-color-bold, #03a9f4)',
				'color_light'          => 'var(--material-info-color-light, #e5f6fd)',
			),
			'shoelace'  => array(
				'color_primary'        => '#000',
				'color_border'         => '#0284c7',
				'color_accent'         => '#0ea5e9',
				'color_alt'            => '#0284c7',
				'color_alt_hover'      => '#0ea5e9',
				'color_alt_text'       => '#ffffff',
				'color_alt_text_hover' => '#ffffff',
				'color_bold'           => '#0284c7',
				'color_light'          => '#ffffff',
			),
		);
	}

	/**
	 * Normalize attributes without adding defaults or changing stored values.
	 *
	 * @param array          $attributes Block or shortcode attributes.
	 * @param \WP_Block|null $block      Block instance.
	 * @return array
	 */
	public static function normalize( array $attributes, $block = null ) {
		$normalized = array();
		foreach ( self::SCHEMA as $name => $definition ) {
			$normalized[ $name ] = Functions::sanitize_attribute(
				$attributes,
				$definition[0],
				$definition[1]
			);
		}

		if ( $block instanceof \WP_Block ) {
			$style_map            = array(
				'mediaron/alerts-dlx-bootstrap' => 'bootstrap',
				'mediaron/alerts-dlx-chakra'    => 'chakra',
				'mediaron/alerts-dlx-material'  => 'material',
				'mediaron/alerts-dlx-shoelace'  => 'shoelace',
			);
			$expected_alert_group = $style_map[ $block->name ] ?? null;
			if ( null !== $expected_alert_group && $normalized['alert_group'] !== $expected_alert_group ) {
				$normalized['alert_group'] = $expected_alert_group;
			}
		}

		return $normalized;
	}
}
