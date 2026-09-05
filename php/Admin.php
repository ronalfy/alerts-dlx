<?php
/**
 * Admin settings page and AJAX handlers.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Admin
 */
class Admin {

	/**
	 * Class runner.
	 */
	public function run() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( Functions::get_plugin_file() ), array( $this, 'add_settings_link' ) );
		add_action( 'admin_body_class', array( $this, 'add_admin_body_class' ) );

		add_action( 'wp_ajax_alerts_dlx_retrieve_settings', array( $this, 'ajax_retrieve_settings' ) );
		add_action( 'wp_ajax_alerts_dlx_save_settings', array( $this, 'ajax_save_settings' ) );
		add_action( 'wp_ajax_alerts_dlx_reset_settings', array( $this, 'ajax_reset_settings' ) );
		add_action( 'wp_ajax_alerts_dlx_shortcode_builder', array( ShortcodeBuilder::class, 'handle_ajax' ) );
	}

	/**
	 * Add a settings link on the plugins page.
	 *
	 * @param array $links Plugin action links.
	 *
	 * @return array
	 */
	public function add_settings_link( $links ) {
		$settings_link = sprintf(
			'<a href="%s">%s</a>',
			esc_url( Functions::get_settings_url() ),
			_x( 'Settings', 'Plugin settings link on the plugins page', 'alerts-dlx' )
		);
		array_unshift( $links, $settings_link );
		return $links;
	}

	/**
	 * Add admin body class on the settings screen.
	 *
	 * @param string $classes Admin body classes.
	 *
	 * @return string
	 */
	public function add_admin_body_class( $classes ) {
		$screen = get_current_screen();
		if ( $screen && 'settings_page_alerts-dlx' === $screen->id ) {
			$classes .= ' alerts-dlx-body';
		}
		return $classes;
	}

	/**
	 * Retrieve settings via AJAX.
	 */
	public function ajax_retrieve_settings() {
		if ( ! wp_verify_nonce( filter_input( INPUT_POST, 'nonce', FILTER_DEFAULT ), 'alerts_dlx_retrieve_settings' ) || ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Security check failed', 'alerts-dlx' ) ) );
		}

		$options = Options::get_plugin_options( true );
		wp_send_json_success(
			array(
				'values'               => $this->map_defaults_to_js( stripslashes_deep( $options ) ),
				'blockStyleOptions'    => $this->get_block_style_options_for_js(),
				'headlineStyleOptions' => $this->get_headline_style_options_for_js(),
			)
		);
	}

	/**
	 * Save settings via AJAX.
	 */
	public function ajax_save_settings() {
		if ( ! wp_verify_nonce( filter_input( INPUT_POST, 'nonce', FILTER_DEFAULT ), 'alerts_dlx_save_settings' ) || ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Security check failed', 'alerts-dlx' ) ) );
		}

		$form_data = filter_input( INPUT_POST, 'form_data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
		if ( ! is_array( $form_data ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid form data', 'alerts-dlx' ) ) );
		}

		$form_data = Functions::to_underlines_recursive( $form_data );
		$form_data = Functions::sanitize_array_recursive( $form_data );

		$headline_style = isset( $form_data['headline_style'] ) ? sanitize_key( $form_data['headline_style'] ) : 'h2';
		if ( ! in_array( $headline_style, Options::get_allowed_headline_styles(), true ) ) {
			$headline_style = 'h2';
		}

		$enabled_block_styles = Options::sanitize_enabled_block_styles( $form_data['enabled_block_styles'] ?? array() );
		if ( empty( $enabled_block_styles ) ) {
			wp_send_json_error( array( 'message' => __( 'At least one alert theme must remain enabled.', 'alerts-dlx' ) ) );
		}

		$debug_mode = filter_var( $form_data['debug_mode'] ?? false, FILTER_VALIDATE_BOOLEAN );

		$headline_custom_classes_result = Options::sanitize_headline_custom_classes( $form_data['headline_custom_classes'] ?? '' );
		if ( is_wp_error( $headline_custom_classes_result ) ) {
			wp_send_json_error( array( 'message' => $headline_custom_classes_result->get_error_message() ) );
		}

		$headline_force_size = filter_var( $form_data['headline_force_size'] ?? false, FILTER_VALIDATE_BOOLEAN );

		$settings = array(
			'headline_style'          => $headline_style,
			'headline_custom_classes' => $headline_custom_classes_result['value'],
			'headline_force_size'     => $headline_force_size,
			'enabled_block_styles'    => $enabled_block_styles,
			'debug_mode'              => $debug_mode,
			'options_version'         => Options::get_defaults()['options_version'],
		);

		// The settings screen owns the legacy fields above. Preserve the
		// separately capability-protected canonical preset snapshots.
		$current_settings = get_option( CanonicalAlertPresets::OPTION_NAME, array() );
		if ( is_array( $current_settings ) ) {
			foreach ( array( CanonicalAlertPresets::PRESETS_KEY, CanonicalAlertPresets::DEFAULTS_KEY ) as $preserved_key ) {
				if ( array_key_exists( $preserved_key, $current_settings ) ) {
					$settings[ $preserved_key ] = $current_settings[ $preserved_key ];
				}
			}
		}

		update_option( 'alerts_dlx', $settings );

		wp_send_json_success(
			array(
				'values' => $this->map_defaults_to_js( stripslashes_deep( Options::get_plugin_options( true ) ) ),
			)
		);
	}

	/**
	 * Reset settings via AJAX.
	 */
	public function ajax_reset_settings() {
		if ( ! wp_verify_nonce( filter_input( INPUT_POST, 'nonce', FILTER_DEFAULT ), 'alerts_dlx_reset_settings' ) || ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Security check failed', 'alerts-dlx' ) ) );
		}

		delete_option( 'alerts_dlx' );

		wp_send_json_success(
			array(
				'values' => $this->map_defaults_to_js( stripslashes_deep( Options::get_plugin_options( true ) ) ),
			)
		);
	}

	/**
	 * Register the settings page.
	 */
	public function add_admin_menu() {
		add_options_page(
			_x( 'AlertsDLX', 'Plugin Name - Settings Page Title', 'alerts-dlx' ),
			_x( 'AlertsDLX', 'Plugin Name - Menu Item', 'alerts-dlx' ),
			'manage_options',
			'alerts-dlx',
			array( $this, 'options_page' )
		);
	}

	/**
	 * Render the settings page shell.
	 */
	public function options_page() {
		?>
		<div class="alerts-dlx-form-wrapper">
			<header>
				<div class="alerts-dlx-admin-container-wrap">
					<div class="alerts-dlx-logo-wrapper">
						<h1 id="alerts-dlx-logo"><?php echo esc_html( Functions::get_plugin_name() ); ?></h1>
					</div>
				</div>
			</header>
			<div class="alerts-dlx-admin-container-body-wrapper">
				<div class="alerts-dlx-admin-container-body">
					<div class="alerts-dlx-admin-container-body__content">
						<div id="alerts-dlx-settings-admin">
							<?php echo wp_kses( $this->get_loading_svg(), Functions::get_kses_allowed_html() ); ?>
						</div>
					</div>
				</div>
				<div id="alerts-dlx-admin-container-slot"></div>
			</div>
		</div>
		<?php
	}

	/**
	 * Enqueue admin scripts and styles.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_admin_scripts( $hook ) {
		if ( 'settings_page_alerts-dlx' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'alerts-dlx-admin-css',
			Functions::get_plugin_url( '/dist/alerts-dlx-admin-style.css' ),
			array(),
			Functions::get_plugin_version(),
			'all'
		);

		// The visual builder previews the existing production renderer. These
		// styles are limited to this admin screen and never change frontend
		// conditional-loading behavior.
		$blocks = new Blocks();
		$blocks->register_block_editor_scripts();
		foreach ( array( 'bootstrap', 'chakra', 'material', 'shoelace' ) as $style ) {
			wp_enqueue_style( 'alerts-dlx-' . $style . '-styles' );
		}
		wp_enqueue_style( 'alerts-dlx-block-editor-styles-lato' );

		$asset_file = Functions::get_plugin_dir( 'dist/alerts-dlx-admin-settings.asset.php' );
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$deps = require $asset_file;
		wp_enqueue_script(
			'alerts-dlx-settings-admin-js',
			Functions::get_plugin_url( '/dist/alerts-dlx-admin-settings.js' ),
			$deps['dependencies'],
			$deps['version'],
			true
		);

		wp_localize_script(
			'alerts-dlx-settings-admin-js',
			'alertsDlxAdmin',
			array(
				'retrieveNonce'            => wp_create_nonce( 'alerts_dlx_retrieve_settings' ),
				'saveNonce'                => wp_create_nonce( 'alerts_dlx_save_settings' ),
				'resetNonce'               => wp_create_nonce( 'alerts_dlx_reset_settings' ),
				'shortcodeBuilderNonce'    => wp_create_nonce( ShortcodeBuilder::NONCE_ACTION ),
				'shortcodeBuilderDefaults' => ShortcodeBuilder::get_editor_defaults(),
				'shortcodeBuilderFields'   => ShortcodeBuilder::get_editor_fields(),
			)
		);
	}

	/**
	 * Get loading SVG markup.
	 *
	 * @return string
	 */
	private function get_loading_svg() {
		return '<div class="alerts-dlx-load-static-svg"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="26.349px" height="26.35px" viewBox="0 0 26.349 26.35" xml:space="preserve"><g><circle cx="13.792" cy="3.082" r="3.082"/><circle cx="13.792" cy="24.501" r="1.849"/><circle cx="6.219" cy="6.218" r="2.774"/><circle cx="21.365" cy="21.363" r="1.541"/><circle cx="3.082" cy="13.792" r="2.465"/><circle cx="24.501" cy="13.791" r="1.232"/></g></svg></div>';
	}

	/**
	 * Maps PHP option keys to JS camelCase keys.
	 *
	 * @param array $options Array of options and values.
	 *
	 * @return array
	 */
	private function map_defaults_to_js( $options ) {
		$js_option_names = array();
		foreach ( $options as $option_name => $option_value ) {
			if ( is_array( $option_value ) ) {
				$option_value = $this->map_defaults_to_js( $option_value );
			}
			$js_option_names[ Functions::to_camelcase( $option_name ) ] = $option_value;
		}
		return $js_option_names;
	}

	/**
	 * Get alert theme options for the admin UI.
	 *
	 * @return array
	 */
	private function get_block_style_options_for_js() {
		$definitions = Options::get_block_style_definitions();
		$options     = array();

		foreach ( $definitions as $value => $label ) {
			$options[] = array(
				'label' => $label,
				'value' => $value,
			);
		}

		return $options;
	}

	/**
	 * Get headline style options for the admin UI.
	 *
	 * @return array
	 */
	private function get_headline_style_options_for_js() {
		$options = array();
		foreach ( Options::get_allowed_headline_styles() as $style ) {
			$options[] = array(
				'label' => strtoupper( $style ),
				'value' => $style,
			);
		}
		return $options;
	}
}
