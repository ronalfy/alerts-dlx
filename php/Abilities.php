<?php
/**
 * Abilities API registration for generating AlertsDLX shortcodes and listing saved global styles.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers abilities an AI client uses to build an [alertsdlx] shortcode and list saved global styles.
 *
 * @since 3.0.0
 */
class Abilities {

	/**
	 * Class runner.
	 */
	public function run() {
		if ( ! function_exists( 'wp_register_ability' ) || ! function_exists( 'wp_register_ability_category' ) ) {
			return;
		}

		add_action(
			'wp_abilities_api_categories_init',
			array( __CLASS__, 'register_abilities_category' )
		);

		add_action(
			'wp_abilities_api_init',
			array( __CLASS__, 'register_abilities' )
		);
	}

	/**
	 * Register the Singular Alerts ability category.
	 *
	 * @since 3.0.0
	 */
	public static function register_abilities_category() {
		\wp_register_ability_category(
			'singular-alerts',
			array(
				'label'       => esc_html__( 'Singular Alerts', 'alerts-dlx' ),
				'description' => esc_html__(
					'Support the generation of singular alerts, as well as returning available global styles.',
					'alerts-dlx'
				),
			)
		);
	}

	/**
	 * Register Singular Alerts abilities.
	 *
	 * @since 3.0.0
	 */
	public static function register_abilities() {
		\wp_register_ability(
			'singular-alerts/generate-alert-shortcode',
			array(
				'label'               => esc_html__( 'Generate a Singular Alert Shortcode', 'alerts-dlx' ),
				'description'         => esc_html__( 'Generate a ready-to-paste [alertsdlx] shortcode from alert content and appearance settings. Does not save or publish content. Omit any property to keep that shortcode default. The title, description, button, and icon appear only when their content is supplied.', 'alerts-dlx' ),
				'category'            => 'singular-alerts',
				'input_schema'        => self::get_generate_shortcode_input_schema(),
				'output_schema'       => array(
					'type'                 => 'object',
					'properties'           => array(
						'shortcode' => array(
							'type'        => 'string',
							'description' => esc_html__( 'A validated [alertsdlx] shortcode ready to paste into post content.', 'alerts-dlx' ),
						),
					),
					'required'             => array( 'shortcode' ),
					'additionalProperties' => false,
				),
				'execute_callback'    => array( __CLASS__, 'generate_shortcode' ),
				'permission_callback' => array( __CLASS__, 'user_can_generate_shortcode' ),
				'meta'                => array(
					'public'      => true,
					'annotations' => array(
						'readonly'    => true,
						'destructive' => false,
						'idempotent'  => true,
					),
				),
			)
		);

		\wp_register_ability(
			'singular-alerts/get-global-styles',
			array(
				'label'               => esc_html__( 'Get Global Styles', 'alerts-dlx' ),
				'description'         => esc_html__( 'Return the saved global styles for this site. Each style is a reusable appearance preset from the alert library. Copy its appearance properties into singular-alerts/generate-alert-shortcode. Global styles do not store alert text, and the generated shortcode does not stay linked to the style. Pass alert_group to limit the list to one design system, or send an empty object to return every saved global style.', 'alerts-dlx' ),
				'category'            => 'singular-alerts',
				'input_schema'        => self::get_global_styles_input_schema(),
				'output_schema'       => self::get_global_styles_output_schema(),
				'execute_callback'    => array( __CLASS__, 'get_global_styles' ),
				'permission_callback' => array( __CLASS__, 'user_can_read_global_styles' ),
				'meta'                => array(
					'public'      => true,
					'annotations' => array(
						'readonly'    => true,
						'destructive' => false,
						'idempotent'  => true,
					),
				),
			)
		);
	}

	/**
	 * Whether the current user may generate a shortcode.
	 *
	 * Matches the capability required to place a shortcode in post content.
	 * The Abilities API passes the same input the execute callback receives.
	 *
	 * @since 3.0.0
	 *
	 * @param mixed $input Ability input. Unused.
	 * @return bool
	 */
	public static function user_can_generate_shortcode( $input = null ) {
		unset( $input );
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Whether the current user may read saved global styles.
	 *
	 * Library reads use edit_posts, matching the library REST GET routes.
	 * Creating and editing a global style still requires manage_options.
	 *
	 * @since 3.0.0
	 *
	 * @param mixed $input Ability input. Unused.
	 * @return bool
	 */
	public static function user_can_read_global_styles( $input = null ) {
		unset( $input );
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Validate input and return a shortcode string.
	 *
	 * Sanitization and quoting are delegated to ShortcodeBuilder so AI-supplied
	 * values pass the same allowlists as the settings screen builder.
	 *
	 * @since 3.0.0
	 *
	 * @param mixed $input Ability input.
	 * @return array|\WP_Error Shortcode payload, or an error when the input cannot be expressed safely.
	 */
	public static function generate_shortcode( $input ) {
		if ( is_object( $input ) ) {
			$input = get_object_vars( $input );
		}
		if ( ! is_array( $input ) ) {
			$input = array();
		}

		// An image without an explicit source would be dropped, because the shortcode only prints image_url when icon_source is image.
		$has_image = ( isset( $input['image_url'] ) && '' !== (string) $input['image_url'] ) || ( isset( $input['image_id'] ) && (int) $input['image_id'] > 0 );
		$has_icon  = isset( $input['icon'] ) && '' !== (string) $input['icon'];
		if ( $has_image && ! $has_icon && ! isset( $input['icon_source'] ) ) {
			$input['icon_source'] = 'image';
		}

		$shortcode = ShortcodeBuilder::generate_shortcode( $input );
		if ( is_wp_error( $shortcode ) ) {
			return $shortcode;
		}

		return array(
			'shortcode' => $shortcode,
		);
	}

	/**
	 * Return saved global styles.
	 *
	 * Global styles are published alert-library items of kind global_style.
	 * Their appearance allowlist is the set ShortcodeBuilder persists, which
	 * uses the same property names as the shortcode generator.
	 *
	 * @since 3.0.0
	 *
	 * @param mixed $input Ability input.
	 * @return array|\WP_Error Global style payload, or an error when alert_group is not a known design.
	 */
	public static function get_global_styles( $input ) {
		if ( is_object( $input ) ) {
			$input = get_object_vars( $input );
		}
		if ( ! is_array( $input ) ) {
			$input = array();
		}

		$alert_group = '';
		if ( isset( $input['alert_group'] ) && '' !== (string) $input['alert_group'] ) {
			$alert_group = sanitize_key( (string) $input['alert_group'] );
			if ( ! isset( ShortcodeBuilder::get_theme_definitions()[ $alert_group ] ) ) {
				return new \WP_Error(
					'alerts_dlx_global_styles_group',
					esc_html__( 'Unsupported alert design.', 'alerts-dlx' )
				);
			}
		}

		$items  = AlertLibrary::query_items(
			AlertLibrary::KIND_GLOBAL_STYLE,
			array(
				'posts_per_page' => -1,
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);
		$styles = array();

		foreach ( $items as $item ) {
			$config     = ( isset( $item['config'] ) && is_array( $item['config'] ) ) ? $item['config'] : array();
			$appearance = self::normalize_global_style_appearance( $config );
			if ( '' !== $alert_group && sanitize_key( (string) $appearance['alert_group'] ) !== $alert_group ) {
				continue;
			}

			$styles[] = array(
				'id'         => (int) ( $item['id'] ?? 0 ),
				'title'      => (string) ( $item['title'] ?? '' ),
				'slug'       => (string) ( $item['slug'] ?? '' ),
				'appearance' => $appearance,
			);
		}

		return array(
			'global_styles' => $styles,
		);
	}

	/**
	 * JSON Schema for the shortcode generator input.
	 *
	 * Property names match the public [alertsdlx] attributes. Enums follow the
	 * renderer and shortcode-builder allowlists. alert_type and variant are the
	 * union of every design; ShortcodeBuilder rejects combinations that a
	 * single design does not support.
	 *
	 * @since 3.0.0
	 *
	 * @return array
	 */
	private static function get_generate_shortcode_input_schema() {
		$themes = ShortcodeBuilder::get_theme_definitions();

		return array(
			'type'                 => 'object',
			'description'          => esc_html__( 'Properties for one [alertsdlx] shortcode. Omit a property to keep the public shortcode default. The description is shortcode content, not an attribute.', 'alerts-dlx' ),
			'properties'           => array(
				'alert_title'                    => self::string_property(
					esc_html__( 'Alert heading. Plain text. The title is shown only when this is not empty.', 'alerts-dlx' ),
					300
				),
				'alert_description'              => self::string_property(
					esc_html__( 'Alert body. Limited HTML is allowed. Placed between the shortcode tags. Nested [alertsdlx] tags are rejected. The description is shown only when this is not empty.', 'alerts-dlx' ),
					20000
				),
				'alert_group'                    => self::enum_property(
					esc_html__( 'Design system. Defaults to chakra when omitted.', 'alerts-dlx' ),
					array_keys( $themes )
				),
				'alert_type'                     => self::enum_property(
					sprintf(
						/* translators: %s: alert groups and the alert types each one accepts. */
						esc_html__( 'Semantic alert type. Valid types depend on alert_group: %s. Use custom to apply the color properties. Defaults to success when omitted.', 'alerts-dlx' ),
						self::format_grouped_choices( 'alert_types' )
					),
					self::collect_theme_values( 'alert_types' )
				),
				'variant'                        => self::enum_property(
					sprintf(
						/* translators: %s: alert groups and the variants each one accepts. */
						esc_html__( 'Layout treatment. Valid variants depend on alert_group: %s. Omit to use the default variant for that design.', 'alerts-dlx' ),
						self::format_grouped_choices( 'variants' )
					),
					self::collect_theme_values( 'variants' )
				),
				'align'                          => self::enum_property(
					esc_html__( 'Horizontal alignment. Defaults to center.', 'alerts-dlx' ),
					array( 'left', 'center', 'right', 'wide', 'full' )
				),
				'mode'                           => self::enum_property(
					esc_html__( 'Color mode. Defaults to light.', 'alerts-dlx' ),
					array( 'light', 'dark' )
				),
				'maximum_width'                  => self::integer_property(
					esc_html__( 'Maximum width number. Pair with maximum_width_unit. Defaults to 650.', 'alerts-dlx' ),
					1,
					5000
				),
				'maximum_width_unit'             => self::enum_property(
					esc_html__( 'Unit for maximum_width. Defaults to px.', 'alerts-dlx' ),
					AlertAttributes::get_maximum_width_units()
				),
				'margin_spacing'                 => self::enum_property(
					esc_html__( 'Space outside the alert. Defaults to spacious.', 'alerts-dlx' ),
					AlertAttributes::get_margin_spacing_amounts()
				),
				'margin_spacing_target'          => self::enum_property(
					esc_html__( 'Which edges receive the margin. Defaults to both.', 'alerts-dlx' ),
					AlertAttributes::get_margin_spacing_targets()
				),
				'base_font_size'                 => self::integer_property(
					esc_html__( 'Base font size in pixels. Defaults to 16.', 'alerts-dlx' ),
					8,
					96
				),
				'button_text'                    => self::string_property(
					esc_html__( 'Button label. Plain text. The button is shown only when both button text and a button URL are set.', 'alerts-dlx' ),
					200
				),
				'button_url'                     => self::string_property(
					esc_html__( 'Button link. Absolute or relative URL.', 'alerts-dlx' ),
					2048
				),
				'button_target'                  => self::boolean_property(
					esc_html__( 'Open the button link in a new tab. Included only when button_url is set.', 'alerts-dlx' )
				),
				'button_rel_no_follow'           => self::boolean_property(
					esc_html__( 'Add rel="nofollow" on the button link. Included only when button_url is set.', 'alerts-dlx' )
				),
				'button_rel_sponsored'           => self::boolean_property(
					esc_html__( 'Add rel="sponsored" on the button link. Included only when button_url is set.', 'alerts-dlx' )
				),
				'secondary_button_text'          => self::string_property(
					esc_html__( 'Secondary button label. Plain text. The secondary button is shown only when both secondary button text and a secondary button URL are set.', 'alerts-dlx' ),
					200
				),
				'secondary_button_url'           => self::string_property(
					esc_html__( 'Secondary button link. Absolute or relative URL.', 'alerts-dlx' ),
					2048
				),
				'secondary_button_target'        => self::boolean_property(
					esc_html__( 'Open the secondary button link in a new tab. Included only when secondary_button_url is set.', 'alerts-dlx' )
				),
				'secondary_button_rel_no_follow' => self::boolean_property(
					esc_html__( 'Add rel="nofollow" on the secondary button link. Included only when secondary_button_url is set.', 'alerts-dlx' )
				),
				'secondary_button_rel_sponsored' => self::boolean_property(
					esc_html__( 'Add rel="sponsored" on the secondary button link. Included only when secondary_button_url is set.', 'alerts-dlx' )
				),
				'icon_source'                    => self::enum_property(
					esc_html__( 'Where the alert icon comes from. icon uses the icon SVG. image uses image_url and, when set, image_id. Defaults to icon. Omit this when supplying only an image; generation then selects image.', 'alerts-dlx' ),
					array( 'icon', 'image' )
				),
				'icon'                           => self::string_property(
					esc_html__( 'Inline SVG markup for the icon. Sanitized before it is written into the shortcode. Included only when icon_source is icon.', 'alerts-dlx' ),
					12000
				),
				'image_url'                      => self::string_property(
					esc_html__( 'Image address used when icon_source is image.', 'alerts-dlx' ),
					2048
				),
				'image_id'                       => self::integer_property(
					esc_html__( 'Media library attachment ID used when icon_source is image. When the attachment exists, it replaces image_url in the rendered alert. Use 0 when there is no attachment.', 'alerts-dlx' ),
					0,
					2147483647
				),
				'icon_appearance'                => self::enum_property(
					esc_html__( 'Icon shape. Defaults to default.', 'alerts-dlx' ),
					array( 'default', 'rounded' )
				),
				'icon_vertical_alignment'        => self::enum_property(
					esc_html__( 'Vertical alignment of the icon. Defaults to top.', 'alerts-dlx' ),
					array( 'top', 'centered' )
				),
				'icon_size'                      => self::enum_property(
					esc_html__( 'Icon size. Defaults to default.', 'alerts-dlx' ),
					array( 'small', 'default', 'medium', 'large', 'extra-large' )
				),
				'color_primary'                  => self::color_property( esc_html__( 'Text color.', 'alerts-dlx' ) ),
				'color_border'                   => self::color_property( esc_html__( 'Border color.', 'alerts-dlx' ) ),
				'color_accent'                   => self::color_property( esc_html__( 'Accent color.', 'alerts-dlx' ) ),
				'color_alt'                      => self::color_property( esc_html__( 'Button color.', 'alerts-dlx' ) ),
				'color_alt_hover'                => self::color_property( esc_html__( 'Button hover color.', 'alerts-dlx' ) ),
				'color_alt_text'                 => self::color_property( esc_html__( 'Button text color.', 'alerts-dlx' ) ),
				'color_alt_text_hover'           => self::color_property( esc_html__( 'Button text hover color.', 'alerts-dlx' ) ),
				'color_secondary'                => self::color_property( esc_html__( 'Secondary button color.', 'alerts-dlx' ) ),
				'color_secondary_hover'          => self::color_property( esc_html__( 'Secondary button hover color.', 'alerts-dlx' ) ),
				'color_secondary_text'           => self::color_property( esc_html__( 'Secondary button text color.', 'alerts-dlx' ) ),
				'color_secondary_text_hover'     => self::color_property( esc_html__( 'Secondary button text hover color.', 'alerts-dlx' ) ),
				'color_bold'                     => self::color_property( esc_html__( 'Icon color.', 'alerts-dlx' ) ),
				'color_light'                    => self::color_property( esc_html__( 'Background color.', 'alerts-dlx' ) ),
				'close_button_enabled'           => self::boolean_property(
					esc_html__( 'Show a dismiss control. Defaults to false.', 'alerts-dlx' )
				),
				'close_button_expiration'        => self::integer_property(
					esc_html__( 'How long a dismissal is remembered, in seconds. 0 means the current browser session only. Included only when close_button_enabled is true.', 'alerts-dlx' ),
					0,
					31536000
				),
				'unique_id'                      => self::string_property(
					esc_html__( 'Optional HTML id and dismiss-cookie name. Use a stable value when the alert can be dismissed so the choice survives reloads. Letters, numbers, hyphens, and underscores. Omit to let each view assign a new id.', 'alerts-dlx' ),
					100
				),
				'is_block_editorial_only'        => self::boolean_property(
					esc_html__( 'When true, the shortcode renders nothing on the front end. Use false for a visible alert. Defaults to false.', 'alerts-dlx' )
				),
				'conditions_enabled'             => self::boolean_property(
					esc_html__( 'Enable display conditions evaluated client-side. Defaults to false.', 'alerts-dlx' )
				),
				'start_date'                     => self::string_property(
					esc_html__( 'Earliest date/time to show the alert (YYYY-MM-DDTHH:MM). Evaluated client-side so it works with page caching.', 'alerts-dlx' ),
					19
				),
				'end_date'                       => self::string_property(
					esc_html__( 'Latest date/time to show the alert (YYYY-MM-DDTHH:MM). Evaluated client-side so it works with page caching.', 'alerts-dlx' ),
					19
				),
				'days_of_week'                   => self::string_property(
					esc_html__( 'Comma-separated day numbers (0=Sunday through 6=Saturday) when the alert may appear. Example: 0,6 for weekends.', 'alerts-dlx' ),
					20
				),
				'url_params'                     => array(
					'type'        => 'array',
					'description' => esc_html__( 'Show only when URL query parameters match. Each item needs a key and an optional value. Empty value checks for existence.', 'alerts-dlx' ),
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'key'   => array( 'type' => 'string', 'description' => esc_html__( 'Query parameter name.', 'alerts-dlx' ) ),
							'value' => array( 'type' => 'string', 'description' => esc_html__( 'Query parameter value. Omit or leave empty to check for existence only.', 'alerts-dlx' ) ),
						),
						'required'   => array( 'key' ),
					),
				),
				'require_login'                  => self::boolean_property(
					esc_html__( 'Show only to logged-in users. Evaluated client-side via REST so it works with page caching.', 'alerts-dlx' )
				),
				'required_roles'                 => self::string_property(
					esc_html__( 'Comma-separated WordPress role slugs. The alert is shown only when the visitor has at least one of these roles. Requires require_login.', 'alerts-dlx' ),
					200
				),
			),
			'additionalProperties' => false,
			'default'              => array(),
		);
	}

	/**
	 * JSON Schema for the global-style list input.
	 *
	 * No property is required. alert_group is the design-system allowlist from
	 * ShortcodeBuilder, not a list of saved styles.
	 *
	 * @since 3.0.0
	 *
	 * @return array
	 */
	private static function get_global_styles_input_schema() {
		$groups = array_keys( ShortcodeBuilder::get_theme_definitions() );

		return array(
			'type'                 => 'object',
			'description'          => esc_html__( 'Optional filters for the saved global style list. Send an empty object to return every saved global style.', 'alerts-dlx' ),
			'properties'           => array(
				'alert_group' => self::enum_property(
					sprintf(
						/* translators: %s: comma-separated design system slugs. */
						esc_html__( 'Limit the list to one design system: %s. Omit to return global styles for every design.', 'alerts-dlx' ),
						implode( ', ', $groups )
					),
					$groups
				),
			),
			'additionalProperties' => false,
			'default'              => array(),
		);
	}

	/**
	 * JSON Schema for the global-style list output.
	 *
	 * Required properties are always present, including an empty global_styles
	 * array when the site has no matching styles.
	 *
	 * @since 3.0.0
	 *
	 * @return array
	 */
	private static function get_global_styles_output_schema() {
		$appearance = self::get_global_style_appearance_schema();

		return array(
			'type'                 => 'object',
			'properties'           => array(
				'global_styles' => array(
					'type'        => 'array',
					'description' => esc_html__( 'Saved global styles in title order. Empty when none are saved or none match alert_group.', 'alerts-dlx' ),
					'items'       => array(
						'type'                 => 'object',
						'description'          => esc_html__( 'One saved global style.', 'alerts-dlx' ),
						'properties'           => array(
							'id'         => self::integer_property(
								esc_html__( 'Alert library item ID.', 'alerts-dlx' ),
								1,
								2147483647
							),
							'title'      => self::string_property(
								esc_html__( 'Global style name.', 'alerts-dlx' )
							),
							'slug'       => self::string_property(
								esc_html__( 'Global style slug. Unique among global styles.', 'alerts-dlx' )
							),
							'appearance' => $appearance,
						),
						'required'             => array( 'id', 'title', 'slug', 'appearance' ),
						'additionalProperties' => false,
					),
				),
			),
			'required'             => array( 'global_styles' ),
			'additionalProperties' => false,
		);
	}

	/**
	 * JSON Schema for one global style's saved appearance.
	 *
	 * Property names and bounds match ShortcodeBuilder::get_global_style_input_names()
	 * and the shortcode generator inputs of the same name.
	 *
	 * @since 3.0.0
	 *
	 * @return array
	 */
	private static function get_global_style_appearance_schema() {
		$properties = array();
		foreach ( self::get_global_style_appearance_fields() as $name => $field ) {
			if ( 'integer' === $field['type'] ) {
				$properties[ $name ] = self::integer_property( $field['description'], $field['minimum'], $field['maximum'] );
			} else {
				$properties[ $name ] = self::string_property( $field['description'] );
			}
		}

		return array(
			'type'                 => 'object',
			'description'          => esc_html__( 'Saved appearance. Property names match singular-alerts/generate-alert-shortcode inputs. Copy the ones you need into that ability. A global style does not store a title, description, or button.', 'alerts-dlx' ),
			'properties'           => $properties,
			'required'             => array_keys( $properties ),
			'additionalProperties' => false,
		);
	}

	/**
	 * Appearance fields stored on a global style, in allowlist order.
	 *
	 * @since 3.0.0
	 *
	 * @return array
	 */
	private static function get_global_style_appearance_fields() {
		$groups = implode( ', ', array_keys( ShortcodeBuilder::get_theme_definitions() ) );
		$fields = array(
			'alert_group'                => array(
				'type'        => 'string',
				'description' => sprintf(
					/* translators: %s: comma-separated design system slugs. */
					esc_html__( 'Design system. One of: %s.', 'alerts-dlx' ),
					$groups
				),
			),
			'alert_type'                 => array(
				'type'        => 'string',
				'description' => sprintf(
					/* translators: %s: alert groups and the alert types each one accepts. */
					esc_html__( 'Semantic alert type. Valid types depend on alert_group: %s.', 'alerts-dlx' ),
					self::format_grouped_choices( 'alert_types' )
				),
			),
			'variant'                    => array(
				'type'        => 'string',
				'description' => sprintf(
					/* translators: %s: alert groups and the variants each one accepts. */
					esc_html__( 'Layout treatment. Valid variants depend on alert_group: %s.', 'alerts-dlx' ),
					self::format_grouped_choices( 'variants' )
				),
			),
			'mode'                       => array(
				'type'        => 'string',
				'description' => esc_html__( 'Color mode: light or dark.', 'alerts-dlx' ),
			),
			'maximum_width'              => array(
				'type'        => 'integer',
				'description' => esc_html__( 'Maximum width number. Pair with maximum_width_unit.', 'alerts-dlx' ),
				'minimum'     => 1,
				'maximum'     => 5000,
			),
			'maximum_width_unit'         => array(
				'type'        => 'string',
				'description' => esc_html__( 'Unit for maximum_width.', 'alerts-dlx' ),
			),
			'margin_spacing'             => array(
				'type'        => 'string',
				'description' => esc_html__( 'Space outside the alert.', 'alerts-dlx' ),
			),
			'margin_spacing_target'      => array(
				'type'        => 'string',
				'description' => esc_html__( 'Which edges receive the margin.', 'alerts-dlx' ),
			),
			'base_font_size'             => array(
				'type'        => 'integer',
				'description' => esc_html__( 'Base font size in pixels.', 'alerts-dlx' ),
				'minimum'     => 8,
				'maximum'     => 96,
			),
			'icon_source'                => array(
				'type'        => 'string',
				'description' => esc_html__( 'Where the alert icon comes from: icon or image.', 'alerts-dlx' ),
			),
			'icon_appearance'            => array(
				'type'        => 'string',
				'description' => esc_html__( 'Icon shape: default or rounded.', 'alerts-dlx' ),
			),
			'icon_vertical_alignment'    => array(
				'type'        => 'string',
				'description' => esc_html__( 'Vertical alignment of the icon: top or centered.', 'alerts-dlx' ),
			),
			'icon'                       => array(
				'type'        => 'string',
				'description' => esc_html__( 'Inline SVG markup for the icon.', 'alerts-dlx' ),
			),
			'image_url'                  => array(
				'type'        => 'string',
				'description' => esc_html__( 'Image address used when icon_source is image.', 'alerts-dlx' ),
			),
			'image_id'                   => array(
				'type'        => 'integer',
				'description' => esc_html__( 'Media library attachment ID used when icon_source is image. 0 when there is no attachment.', 'alerts-dlx' ),
				'minimum'     => 0,
				'maximum'     => 2147483647,
			),
			'color_primary'              => array(
				'type'        => 'string',
				'description' => esc_html__( 'Text color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_border'               => array(
				'type'        => 'string',
				'description' => esc_html__( 'Border color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_accent'               => array(
				'type'        => 'string',
				'description' => esc_html__( 'Accent color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_alt'                  => array(
				'type'        => 'string',
				'description' => esc_html__( 'Button color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_alt_hover'            => array(
				'type'        => 'string',
				'description' => esc_html__( 'Button hover color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_alt_text'             => array(
				'type'        => 'string',
				'description' => esc_html__( 'Button text color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_alt_text_hover'       => array(
				'type'        => 'string',
				'description' => esc_html__( 'Button text hover color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_secondary'            => array(
				'type'        => 'string',
				'description' => esc_html__( 'Secondary button color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_secondary_hover'      => array(
				'type'        => 'string',
				'description' => esc_html__( 'Secondary button hover color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_secondary_text'       => array(
				'type'        => 'string',
				'description' => esc_html__( 'Secondary button text color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_secondary_text_hover' => array(
				'type'        => 'string',
				'description' => esc_html__( 'Secondary button text hover color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_bold'                 => array(
				'type'        => 'string',
				'description' => esc_html__( 'Icon color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
			'color_light'                => array(
				'type'        => 'string',
				'description' => esc_html__( 'Background color. Used when alert_type is custom.', 'alerts-dlx' ),
			),
		);

		$ordered = array();
		foreach ( ShortcodeBuilder::get_global_style_input_names() as $name ) {
			if ( isset( $fields[ $name ] ) ) {
				$ordered[ $name ] = $fields[ $name ];
				continue;
			}

			// Keep a newly allowlisted key in the payload even before it has its own description.
			$ordered[ $name ] = array(
				'type'        => 'string',
				'description' => esc_html__( 'Saved appearance value.', 'alerts-dlx' ),
			);
		}

		return $ordered;
	}

	/**
	 * Cast a stored global style config onto the appearance allowlist.
	 *
	 * Missing keys fall back to the global style defaults so every required
	 * output property is present.
	 *
	 * @since 3.0.0
	 *
	 * @param array $config Stored global style config.
	 * @return array
	 */
	private static function normalize_global_style_appearance( array $config ) {
		$defaults   = ShortcodeBuilder::get_global_style_defaults();
		$appearance = array();

		foreach ( self::get_global_style_appearance_fields() as $name => $field ) {
			$value = array_key_exists( $name, $config ) ? $config[ $name ] : ( $defaults[ $name ] ?? '' );
			if ( 'integer' === $field['type'] ) {
				$appearance[ $name ] = (int) $value;
				continue;
			}

			$appearance[ $name ] = ( is_scalar( $value ) || null === $value ) ? (string) $value : '';
		}

		return $appearance;
	}

	/**
	 * Build a string schema property.
	 *
	 * @since 3.0.0
	 *
	 * @param string $description Property description.
	 * @param int    $max_length  Maximum length. 0 leaves the length unbounded in the schema.
	 * @return array
	 */
	private static function string_property( $description, $max_length = 0 ) {
		$property = array(
			'type'        => 'string',
			'description' => $description,
		);
		if ( $max_length > 0 ) {
			$property['maxLength'] = $max_length;
		}
		return $property;
	}

	/**
	 * Build an enum string schema property.
	 *
	 * @since 3.0.0
	 *
	 * @param string $description    Property description.
	 * @param array  $allowed_values Allowed values.
	 * @return array
	 */
	private static function enum_property( $description, array $allowed_values ) {
		return array(
			'type'        => 'string',
			'description' => $description,
			'enum'        => array_values( $allowed_values ),
		);
	}

	/**
	 * Build an integer schema property.
	 *
	 * @since 3.0.0
	 *
	 * @param string $description Property description.
	 * @param int    $minimum     Minimum value.
	 * @param int    $maximum     Maximum value.
	 * @return array
	 */
	private static function integer_property( $description, $minimum, $maximum ) {
		return array(
			'type'        => 'integer',
			'description' => $description,
			'minimum'     => $minimum,
			'maximum'     => $maximum,
		);
	}

	/**
	 * Build a boolean schema property.
	 *
	 * @since 3.0.0
	 *
	 * @param string $description Property description.
	 * @return array
	 */
	private static function boolean_property( $description ) {
		return array(
			'type'        => 'boolean',
			'description' => $description,
		);
	}

	/**
	 * Build a custom-color schema property.
	 *
	 * Colors are written into the shortcode only when alert_type is custom.
	 *
	 * @since 3.0.0
	 *
	 * @param string $role What the color paints.
	 * @return array
	 */
	private static function color_property( $role ) {
		return self::string_property(
			sprintf(
				/* translators: %s: what the color paints, such as "Text color." */
				esc_html__( '%s Used only when alert_type is custom. Accepts hex, rgb(), hsl(), a CSS variable, or a named color.', 'alerts-dlx' ),
				$role
			),
			200
		);
	}

	/**
	 * Collect unique theme values in first-seen order.
	 *
	 * @since 3.0.0
	 *
	 * @param string $key Theme definition key, alert_types or variants.
	 * @return array
	 */
	private static function collect_theme_values( $key ) {
		$values = array();
		foreach ( ShortcodeBuilder::get_theme_definitions() as $definition ) {
			foreach ( $definition[ $key ] as $value ) {
				$values[ $value ] = $value;
			}
		}
		return array_values( $values );
	}

	/**
	 * Describe which values each design accepts.
	 *
	 * @since 3.0.0
	 *
	 * @param string $key Theme definition key, alert_types or variants.
	 * @return string
	 */
	private static function format_grouped_choices( $key ) {
		$parts = array();
		foreach ( ShortcodeBuilder::get_theme_definitions() as $slug => $definition ) {
			$parts[] = $slug . ' (' . implode( ', ', $definition[ $key ] ) . ')';
		}
		return implode( '; ', $parts );
	}
}
