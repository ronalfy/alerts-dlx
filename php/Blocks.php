<?php
/**
 * Set up the blocks and their attributes.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Helper class for registering blocks.
 */
class Blocks {

	/**
	 * Main class runner.
	 *
	 * @return Blocks.
	 */
	public static function run() {
		$self = new self();
		CanonicalAlertPresets::run();
		add_action( 'init', array( $self, 'init' ) );
		return $self;
	}

	/**
	 * Init action callback.
	 */
	public function init() {

		$render_callbacks = array(
			'mediaron/alerts-dlx-alert'     => array( $this, 'frontend' ),
			'mediaron/alerts-dlx-bootstrap' => array( $this, 'frontend' ),
			'mediaron/alerts-dlx-chakra'    => array( $this, 'frontend' ),
			'mediaron/alerts-dlx-material'  => array( $this, 'frontend' ),
			'mediaron/alerts-dlx-shoelace'  => array( $this, 'frontend' ),
		);

		add_filter(
			'block_type_metadata_settings',
			function ( $settings, $metadata ) use ( $render_callbacks ) {
				if ( isset( $render_callbacks[ $metadata['name'] ] ) ) {
					$settings['render_callback'] = $render_callbacks[ $metadata['name'] ];
				}
				return $settings;
			},
			10,
			2
		);

		add_filter(
			'register_block_type_args',
			function ( $args, $block_name ) {
				$style_map = array(
					'mediaron/alerts-dlx-bootstrap' => 'bootstrap',
					'mediaron/alerts-dlx-chakra'    => 'chakra',
					'mediaron/alerts-dlx-material'  => 'material',
					'mediaron/alerts-dlx-shoelace'  => 'shoelace',
				);

				if ( isset( $style_map[ $block_name ] ) && ! Options::is_block_style_enabled( $style_map[ $block_name ] ) ) {
					if ( ! isset( $args['supports'] ) || ! is_array( $args['supports'] ) ) {
						$args['supports'] = array();
					}
					$args['supports']['inserter'] = false;
				}

				return $args;
			},
			10,
			2
		);

		if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
			wp_register_block_types_from_metadata_collection( Functions::get_plugin_dir( 'build/js/blocks/' ), Functions::get_plugin_dir( 'build/blocks-manifest.php' ) );
		} else {
			if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
				wp_register_block_metadata_collection( Functions::get_plugin_dir( 'build/js/blocks/' ), Functions::get_plugin_dir( 'build/blocks-manifest.php' ) );
			}
			$manifest_data = require Functions::get_plugin_dir( 'build/blocks-manifest.php' );
			foreach ( array_keys( $manifest_data ) as $block_type ) {
				register_block_type( __DIR__ . "/build/js/blocks/{$block_type}" );
			}
		}

		// Enqueue block assets.
		add_action( 'enqueue_block_assets', array( $this, 'register_block_editor_scripts_iframe' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'register_block_editor_scripts' ) );

		// Add alertsdlx block category.
		add_filter(
			'block_categories_all',
			function ( $categories ) {
				return array_merge(
					$categories,
					array(
						array(
							'slug'  => 'alertsdlx',
							'title' => __( 'AlertsDLX', 'alerts-dlx' ),
						),
						array(
							'slug'  => 'alertsdlx-legacy',
							'title' => __( 'AlertsDLX Legacy', 'alerts-dlx' ),
						),
					)
				);
			}
		);

		// Add shortcode to block.
		add_shortcode( 'alertsdlx', array( $this, 'shortcode' ) );
	}

	/**
	 * Shortcode callback.
	 *
	 * @param array  $atts    Shortcode attributes.
	 * @param string $content Shortcode content.
	 * @return string
	 */
	public function shortcode( $atts = array(), $content = '' ) {
		$defaults = AlertAttributes::get_shortcode_defaults();
		$atts     = shortcode_atts( $defaults, $atts, 'alertsdlx' );

		// Sanitize values used before the shared renderer. Inline CSS is emitted
		// below, so waiting for renderer normalization would be too late.
		$sanitized_id      = sanitize_html_class( (string) $atts['unique_id'] );
		$atts['unique_id'] = '' !== $sanitized_id ? $sanitized_id : $defaults['unique_id'];

		// Values embedded into CSS syntax need strict allowlists; HTML escaping
		// alone does not neutralize braces or declaration separators. Preserve
		// every unit exposed by the existing builder and fall back to defaults.
		$allowed_alert_groups = array( 'bootstrap', 'chakra', 'material', 'shoelace' );
		if ( ! in_array( $atts['alert_group'], $allowed_alert_groups, true ) ) {
			$atts['alert_group'] = $defaults['alert_group'];
		}
		$allowed_width_units = array( 'px', 'em', 'rem', '%', 'vw' );
		if ( ! in_array( $atts['maximum_width_unit'], $allowed_width_units, true ) ) {
			$atts['maximum_width_unit'] = $defaults['maximum_width_unit'];
		}

		$color_fields = array(
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
		foreach ( $color_fields as $color_field ) {
			$color                = Functions::sanitize_css_color( (string) $atts[ $color_field ] );
			$atts[ $color_field ] = false === $color ? $defaults[ $color_field ] : $color;
		}

		// Keep the legacy public shortcode within the same resource limits as
		// the visual builder. Oversized icons fail closed before expensive KSES.
		if ( strlen( (string) $atts['icon'] ) > 12000 ) {
			$atts['icon'] = '';
		} else {
			$atts['icon'] = wp_kses( (string) $atts['icon'], Functions::get_kses_allowed_html() );
		}
		if ( preg_match( '/\b(?:xlink:href|href)\s*=\s*([\"\'])(?!#)/i', $atts['icon'] ) ) {
			$atts['icon'] = '';
		}

		// Numeric shortcode attributes share the builder's documented bounds.
		// This prevents extreme values from reaching CSS or cookie metadata.
		$atts['maximum_width']           = min( 5000, max( 1, (int) $atts['maximum_width'] ) );
		$atts['base_font_size']          = min( 96, max( 8, (int) $atts['base_font_size'] ) );
		$atts['close_button_expiration'] = min( 31536000, max( 0, (int) $atts['close_button_expiration'] ) );

		// If alert description is empty, use content.
		if ( empty( $atts['alert_description'] ) && ! empty( $content ) ) {
			// Bound content before filters and their result after filtering.
			$content                   = substr( (string) $content, 0, 20000 );
			$atts['alert_description'] = apply_filters( 'alerts_dlx_the_content', $content );
		}
		$atts['alert_description'] = substr( (string) $atts['alert_description'], 0, 20000 );

		// Set the default variant.
		if ( '' === $atts['variant'] ) {
			switch ( $atts['alert_group'] ) {
				case 'bootstrap':
					$atts['variant'] = 'default';
					break;
				case 'chakra':
					$atts['variant'] = 'subtle';
					break;
				case 'material':
					$atts['variant'] = 'default';
					break;
				case 'shoelace':
					$atts['variant'] = 'top-accent';
					break;
			}
		}

		// Fill in the rest of the attributes.
		$atts['button_enabled']      = ! empty( $atts['button_text'] ) && ! empty( $atts['button_url'] );
		$atts['description_enabled'] = ! empty( $atts['alert_description'] );
		$atts['title_enabled']       = ! empty( $atts['alert_title'] );
		$atts['icon_enabled']        = ! empty( $atts['icon'] ) || ! empty( $atts['image_url'] );

		// Register scripts.
		$this->register_block_editor_scripts();

		$style_handles_to_print = array();
		if ( ! wp_style_is( 'alerts-dlx-block-editor-styles-lato', 'done' ) ) {
			$style_handles_to_print[] = 'alerts-dlx-block-editor-styles-lato';
		}

		switch ( $atts['alert_group'] ) {
			case 'bootstrap':
				if ( ! wp_style_is( 'alerts-dlx-bootstrap-styles', 'done' ) ) {
					wp_enqueue_style( 'alerts-dlx-bootstrap-styles' );
					$style_handles_to_print[] = 'alerts-dlx-bootstrap-styles';
				}
				break;
			case 'chakra':
				if ( ! wp_style_is( 'alerts-dlx-chakra-styles', 'done' ) ) {
					wp_enqueue_style( 'alerts-dlx-chakra-styles' );
					$style_handles_to_print[] = 'alerts-dlx-chakra-styles';
				}
				break;
			case 'material':
				if ( ! wp_style_is( 'alerts-dlx-material-styles', 'done' ) ) {
					wp_enqueue_style( 'alerts-dlx-material-styles' );
					$style_handles_to_print[] = 'alerts-dlx-material-styles';
				}
				break;
			case 'shoelace':
				if ( ! wp_style_is( 'alerts-dlx-shoelace-styles', 'done' ) ) {
					$style_handles_to_print[] = 'alerts-dlx-shoelace-styles';
				}
				break;
		}
		ob_start();

		if ( 'custom' === $atts['alert_type'] ) {
			ob_start();
			?>
			<style>
			#<?php echo esc_html( $atts['unique_id'] ); ?> {
				--alerts-dlx-<?php echo esc_html( $atts['alert_group'] ); ?>-color-primary: <?php echo esc_html( $atts['color_primary'] ); ?>;
				--alerts-dlx-<?php echo esc_html( $atts['alert_group'] ); ?>-color-border: <?php echo esc_html( $atts['color_border'] ); ?>;
				--alerts-dlx-<?php echo esc_html( $atts['alert_group'] ); ?>-color-accent: <?php echo esc_html( $atts['color_accent'] ); ?>;
				--alerts-dlx-<?php echo esc_html( $atts['alert_group'] ); ?>-color-alt: <?php echo esc_html( $atts['color_alt'] ); ?>;
				--alerts-dlx-<?php echo esc_html( $atts['alert_group'] ); ?>-color-alt-hover: <?php echo esc_html( $atts['color_alt_hover'] ); ?>;
				--alerts-dlx-<?php echo esc_html( $atts['alert_group'] ); ?>-color-alt-text: <?php echo esc_html( $atts['color_alt_text'] ); ?>;
				--alerts-dlx-<?php echo esc_html( $atts['alert_group'] ); ?>-color-alt-text-hover: <?php echo esc_html( $atts['color_alt_text_hover'] ); ?>;
				--alerts-dlx-<?php echo esc_html( $atts['alert_group'] ); ?>-color-bold: <?php echo esc_html( $atts['color_bold'] ); ?>;
				--alerts-dlx-<?php echo esc_html( $atts['alert_group'] ); ?>-color-light: <?php echo esc_html( $atts['color_light'] ); ?>;
			}
			</style>
			<?php
		}

		// Convert atts to camelCase.
		$new_atts = array();
		foreach ( $atts as $key => $value ) {
			$new_atts[ Functions::to_camelcase( $key ) ] = $value;
		}

		$return = ob_get_clean() . $this->frontend( $new_atts, $new_atts['alertDescription'] );

		return $return;
	}

	/**
	 * Output the front-end structure.
	 *
	 * @param array          $attributes Block editor attributes.
	 * @param string         $content    Current content.
	 * @param \WP_Block|null $block      Block instance.
	 * @return string
	 */
	public function frontend( array $attributes, string $content, $block = null ) {
		$renderer = new AlertRenderer(
			array( $this, 'register_block_editor_scripts' ),
			array( $this, 'print_close_button_svgs' )
		);
		return $renderer->render( $attributes, $content, $block );
	}
	/**
	 * Register the block editor script for the iframe.
	 */
	public function register_block_editor_scripts_iframe(): void {
		if ( ! is_admin() ) {
			return;
		}
		$this->register_block_editor_scripts();
	}

	/**
	 * Register the block editor script with localized vars.
	 */
	public function register_block_editor_scripts() {
		$can_manage_presets = current_user_can( 'manage_options' );

		// Register styles here because array in block.json fails when using array of styles (enqueues wrong script).
		wp_register_style(
			'alerts-dlx-block-editor',
			Functions::get_plugin_url( 'dist/alerts-dlx-block-editor.css' ),
			array(),
			Functions::get_plugin_version(),
			'all'
		);
		wp_register_style(
			'alerts-dlx-block-editor-styles',
			Functions::get_plugin_url( 'build/index.css' ),
			array( 'alerts-dlx-block-editor' ),
			Functions::get_plugin_version(),
			'all'
		);

		$deps = require Functions::get_plugin_dir( 'build/index.asset.php' );
		wp_register_script(
			'alerts-dlx-block',
			Functions::get_plugin_url( 'build/index.js' ),
			$deps['dependencies'],
			$deps['version'],
			true
		);

		wp_localize_script(
			'alerts-dlx-block',
			'alertsDlxBlock',
			array(
				'font_stylesheet'           => Functions::get_plugin_url( 'dist/alerts-dlx-gfont-lato.css' ),
				'isEditor'                  => current_user_can( 'edit_others_posts' ),
				'isAuthor'                  => current_user_can( 'edit_posts' ),
				'isAdmin'                   => current_user_can( 'manage_options' ),
				'colorPalette'              => Functions::get_theme_color_palette(),
				'defaultImage'              => Functions::get_plugin_url( 'assets/bell.png' ),
				'headlineStyle'             => Options::get_headline_tag(),
				'headlineCustomClasses'     => Options::get_headline_custom_classes(),
				'headlineForceSize'         => Options::is_headline_force_size(),
				'enabledBlockStyles'        => Options::get_enabled_block_styles(),
				'canonicalPresets'          => CanonicalAlertPresets::get_presets_for_editor(),
				'canonicalDefaults'         => CanonicalAlertPresets::get_defaults_for_editor(),
				'canonicalCanManagePresets' => $can_manage_presets,
				'canonicalPresetNonce'      => $can_manage_presets ? wp_create_nonce( CanonicalAlertPresets::NONCE_ACTION ) : '',
				'ajaxUrl'                   => $can_manage_presets ? admin_url( 'admin-ajax.php' ) : '',
			)
		);

		wp_register_style(
			'alerts-dlx-bootstrap-styles',
			Functions::get_plugin_url( 'dist/alerts-dlx-bootstrap-styles.css' ),
			array(),
			Functions::get_plugin_version(),
			'all'
		);
		wp_register_style(
			'alerts-dlx-chakra-styles',
			Functions::get_plugin_url( 'dist/alerts-dlx-chakra-styles.css' ),
			array(),
			Functions::get_plugin_version(),
			'all'
		);
		wp_register_style(
			'alerts-dlx-material-styles',
			Functions::get_plugin_url( 'dist/alerts-dlx-material-styles.css' ),
			array(),
			Functions::get_plugin_version(),
			'all'
		);
		wp_register_style(
			'alerts-dlx-shoelace-styles',
			Functions::get_plugin_url( 'dist/alerts-dlx-shoelace-styles.css' ),
			array(),
			Functions::get_plugin_version(),
			'all'
		);

		/**
		 * Filter whether to load the Lato font stylesheet.
		 *
		 * @param bool $load_lato_font Whether to load the Lato font stylesheet.
		 * @return bool
		 */
		if ( apply_filters( 'alerts_dlx_load_fonts', true ) ) {
			wp_register_style(
				'alerts-dlx-block-editor-styles-lato',
				Functions::get_plugin_url( 'dist/alerts-dlx-gfont-lato.css' ),
				array(),
				Functions::get_plugin_version(),
				'all'
			);
			wp_add_inline_style(
				'alerts-dlx-block-editor-styles-lato',
				':root {
					--alerts-dlx-font-family: "Lato", "Helvetica", "Arial", sans-serif;
				}'
			);
		} else {
			wp_register_style(
				'alerts-dlx-block-editor-styles-lato',
				false,
				array(),
				Functions::get_plugin_version(),
				'all'
			);
			$default_font_family = apply_filters( 'alerts_dlx_default_font_family', '"Helvetica", "Arial", sans-serif' );
			wp_add_inline_style(
				'alerts-dlx-block-editor-styles-lato',
				':root {
					--alerts-dlx-font-family: ' . wp_strip_all_tags( $default_font_family ) . ';
				}'
			);
		}
	}

	/**
	 * Print the close button SVGs.
	 */
	public function print_close_button_svgs() {
		?>
		<svg width="0" height="0" class="hidden" style="display: none;">
			<symbol id="alerts-dlx-bootstrap-close-button" viewBox="0 0 16 16" width="16" height="16">
				<path fill="currentColor" d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/>
			</symbol>
			<symbol id="alerts-dlx-chakra-close-button" viewBox="0 0 24 24" width="16" height="16">
				<path fill="currentColor" d="M.439,21.44a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,1,0,2.122-2.121L14.3,12.177a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.44L12.177,9.7a.25.25,0,0,1-.354,0L2.561.44A1.5,1.5,0,0,0,.439,2.561L9.7,11.823a.25.25,0,0,1,0,.354Z" />
			</symbol>
			<symbol id="alerts-dlx-shoelace-close-button" viewBox="0 0 16 16" width="16" height="16">
				<path fill="currentColor" d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"></path>
			</symbol>
			<symbol id="alerts-dlx-material-close-button" viewBox="0 0 24 24" width="16" height="16">
				<path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
			</symbol>
		</svg>
		<?php
	}
}
