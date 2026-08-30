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
		'unique_id' => array( 'uniqueId', 'text' ),
		'alert_group' => array( 'alertGroup', 'text' ),
		'alert_type' => array( 'alertType', 'text' ),
		'align' => array( 'align', 'text' ),
		'alert_title' => array( 'alertTitle', 'text' ),
		'alert_description' => array( 'alertDescription', 'raw' ),
		'button_enabled' => array( 'buttonEnabled', 'boolean' ),
		'maximum_width_unit' => array( 'maximumWidthUnit', 'text' ),
		'maximum_width' => array( 'maximumWidth', 'integer' ),
		'icon' => array( 'icon', 'raw' ),
		'description_enabled' => array( 'descriptionEnabled', 'boolean' ),
		'title_enabled' => array( 'titleEnabled', 'boolean' ),
		'icon_enabled' => array( 'iconEnabled', 'boolean' ),
		'base_font_size' => array( 'baseFontSize', 'integer' ),
		'icon_vertical_alignment' => array( 'iconVerticalAlignment', 'text' ),
		'variant' => array( 'variant', 'text' ),
		'mode' => array( 'mode', 'text' ),
		'button_text' => array( 'buttonText', 'text' ),
		'button_url' => array( 'buttonUrl', 'text' ),
		'button_target' => array( 'buttonTarget', 'boolean' ),
		'button_rel_no_follow' => array( 'buttonRelNoFollow', 'boolean' ),
		'button_rel_sponsored' => array( 'buttonRelSponsored', 'boolean' ),
		'icon_appearance' => array( 'iconAppearance', 'text' ),
		'color_primary' => array( 'colorPrimary', 'text' ),
		'color_border' => array( 'colorBorder', 'text' ),
		'color_accent' => array( 'colorAccent', 'text' ),
		'color_alt' => array( 'colorAlt', 'text' ),
		'color_alt_hover' => array( 'colorAltHover', 'text' ),
		'color_alt_text' => array( 'colorAltText', 'text' ),
		'color_alt_text_hover' => array( 'colorAltTextHover', 'text' ),
		'color_bold' => array( 'colorBold', 'text' ),
		'color_light' => array( 'colorLight', 'text' ),
		'close_button_enabled' => array( 'closeButtonEnabled', 'boolean' ),
		'close_button_expiration' => array( 'closeButtonExpiration', 'integer' ),
		'is_block_editorial_only' => array( 'isBlockEditorialOnly', 'boolean' ),
		'icon_source' => array( 'iconSource', 'text' ),
		'image_url' => array( 'imageUrl', 'text' ),
		'image_id' => array( 'imageId', 'integer' ),
	);

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
			$style_map = array(
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
