<?php
/**
 * Snapshot presets and new-canonical-alert defaults.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Store and sanitize canonical Alert presentation snapshots.
 */
class CanonicalAlertPresets {

	/** Plugin option key retained for backward compatibility. */
	const OPTION_NAME = 'alerts_dlx';

	/** Nested option key for administrator-created presets. */
	const PRESETS_KEY = 'canonical_alert_presets';

	/** Nested option key for defaults copied into newly inserted Alerts. */
	const DEFAULTS_KEY = 'canonical_alert_defaults';

	/** Nonce action for every preset mutation. */
	const NONCE_ACTION = 'alerts_dlx_manage_canonical_presets';

	/** Hard limits keep the option and AJAX payload bounded. */
	const MAX_PRESETS       = 20;
	const MAX_NAME_LENGTH   = 80;
	const MAX_ICON_LENGTH   = 10000;
	const MAX_PAYLOAD_BYTES = 65536;

	/**
	 * Register authenticated administrator-only mutation endpoints.
	 *
	 * @return CanonicalAlertPresets
	 */
	public static function run() {
		$self = new self();
		add_action( 'wp_ajax_alerts_dlx_save_canonical_preset', array( $self, 'ajax_save_preset' ) );
		add_action( 'wp_ajax_alerts_dlx_delete_canonical_preset', array( $self, 'ajax_delete_preset' ) );
		add_action( 'wp_ajax_alerts_dlx_save_canonical_defaults', array( $self, 'ajax_save_defaults' ) );
		return $self;
	}

	/**
	 * Return sanitized custom presets for every block editor user.
	 *
	 * Presets contain presentation settings only. No authored content, links,
	 * unique IDs, InnerBlocks, editorial visibility, or live preset reference is
	 * stored in a block.
	 *
	 * @return array
	 */
	public static function get_presets_for_editor() {
		return array_values( self::get_presets_map() );
	}

	/**
	 * Return a sanitized flat snapshot used only while registering new-block
	 * variations in the current editor load.
	 *
	 * @return array|\stdClass
	 */
	public static function get_defaults_for_editor() {
		$options  = self::get_raw_options();
		$defaults = $options[ self::DEFAULTS_KEY ] ?? array();
		$defaults = self::sanitize_snapshot( $defaults );
		return empty( $defaults ) ? new \stdClass() : $defaults;
	}

	/**
	 * Save or update one named snapshot.
	 */
	public function ajax_save_preset() {
		$this->verify_request();

		$name = self::sanitize_name( self::request_string( 'name' ) );
		if ( '' === $name ) {
			wp_send_json_error( array( 'message' => __( 'Enter a preset name.', 'alerts-dlx' ) ), 400 );
		}

		$attributes = self::request_snapshot();
		if ( empty( $attributes ) ) {
			wp_send_json_error( array( 'message' => __( 'The preset contains no supported settings.', 'alerts-dlx' ) ), 400 );
		}

		$presets      = self::get_presets_map();
		$requested_id = sanitize_key( self::request_string( 'preset_id' ) );
		if ( '' !== $requested_id && ! isset( $presets[ $requested_id ] ) ) {
			wp_send_json_error( array( 'message' => __( 'The preset no longer exists. Reload the editor and try again.', 'alerts-dlx' ) ), 409 );
		}

		if ( '' === $requested_id ) {
			if ( count( $presets ) >= self::MAX_PRESETS ) {
				wp_send_json_error( array( 'message' => __( 'The site already has the maximum of 20 custom presets.', 'alerts-dlx' ) ), 400 );
			}
			$requested_id = self::create_preset_id( $name, $presets );
		}

		$presets[ $requested_id ] = array(
			'id'         => $requested_id,
			'name'       => $name,
			'attributes' => $attributes,
		);
		self::write_option_fragment( self::PRESETS_KEY, array_values( $presets ) );

		wp_send_json_success( self::get_editor_state() );
	}

	/**
	 * Delete one administrator-created preset.
	 */
	public function ajax_delete_preset() {
		$this->verify_request();

		$preset_id = sanitize_key( self::request_string( 'preset_id' ) );
		$presets   = self::get_presets_map();
		if ( '' === $preset_id || ! isset( $presets[ $preset_id ] ) ) {
			wp_send_json_error( array( 'message' => __( 'The preset no longer exists.', 'alerts-dlx' ) ), 404 );
		}

		unset( $presets[ $preset_id ] );
		self::write_option_fragment( self::PRESETS_KEY, array_values( $presets ) );
		wp_send_json_success( self::get_editor_state() );
	}

	/**
	 * Save or clear the snapshot used by future inserter variations.
	 */
	public function ajax_save_defaults() {
		$this->verify_request();

		$clear = filter_var( self::request_string( 'clear' ), FILTER_VALIDATE_BOOLEAN );
		if ( $clear ) {
			self::write_option_fragment( self::DEFAULTS_KEY, array() );
			wp_send_json_success( self::get_editor_state() );
		}

		$attributes = self::request_snapshot();
		if ( empty( $attributes ) ) {
			wp_send_json_error( array( 'message' => __( 'The defaults contain no supported settings.', 'alerts-dlx' ) ), 400 );
		}

		self::write_option_fragment( self::DEFAULTS_KEY, $attributes );
		wp_send_json_success( self::get_editor_state() );
	}

	/**
	 * Sanitize only the documented snapshot fields.
	 *
	 * @param mixed $attributes Untrusted attributes.
	 * @return array
	 */
	public static function sanitize_snapshot( $attributes ) {
		if ( ! is_array( $attributes ) ) {
			return array();
		}

		$clean = array();
		$enums = array(
			'purpose'               => array( 'info', 'success', 'warning', 'error', 'tip', 'announcement', 'cta', 'custom' ),
			'alertGroup'            => array( 'bootstrap', 'chakra', 'material', 'shoelace' ),
			'alertType'             => array( 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'error', 'neutral', 'custom' ),
			'variant'               => array( 'default', 'centered', 'subtle', 'solid', 'left-accent', 'top-accent', 'outlined', 'filled' ),
			'mode'                  => array( 'light', 'dark' ),
			'align'                 => array( 'center', 'wide', 'full' ),
			'maximumWidthUnit'      => array( 'px', '%', 'em', 'rem', 'vw' ),
			'iconVerticalAlignment' => array( 'top', 'centered' ),
			'iconSource'            => array( 'icon', 'image' ),
			'iconAppearance'        => array( 'default', 'rounded' ),
		);
		foreach ( $enums as $key => $allowed ) {
			if ( ! array_key_exists( $key, $attributes ) ) {
				continue;
			}
			$value = sanitize_key( (string) $attributes[ $key ] );
			if ( in_array( $value, $allowed, true ) ) {
				$clean[ $key ] = $value;
			}
		}

		$boolean_keys = array(
			'descriptionEnabled',
			'titleEnabled',
			'buttonEnabled',
			'iconEnabled',
			'closeButtonEnabled',
			'enableCustomFonts',
			'enableDropShadow',
		);
		foreach ( $boolean_keys as $key ) {
			if ( array_key_exists( $key, $attributes ) ) {
				$clean[ $key ] = filter_var( $attributes[ $key ], FILTER_VALIDATE_BOOLEAN );
			}
		}

		if ( array_key_exists( 'maximumWidth', $attributes ) ) {
			$width = (string) $attributes['maximumWidth'];
			if ( preg_match( '/^\d{1,4}(?:\.\d{1,2})?$/', $width ) ) {
				$clean['maximumWidth'] = (string) min( 3000, max( 0, (float) $width ) );
			}
		}

		if ( array_key_exists( 'baseFontSize', $attributes ) ) {
			$clean['baseFontSize'] = min( 72, max( 8, absint( $attributes['baseFontSize'] ) ) );
		}
		if ( array_key_exists( 'closeButtonExpiration', $attributes ) ) {
			$clean['closeButtonExpiration'] = min( 365, absint( $attributes['closeButtonExpiration'] ) );
		}
		if ( array_key_exists( 'imageId', $attributes ) ) {
			$clean['imageId'] = absint( $attributes['imageId'] );
		}

		if ( array_key_exists( 'icon', $attributes ) ) {
			$icon = wp_kses( (string) $attributes['icon'], Functions::get_kses_allowed_html() );
			if ( strlen( $icon ) <= self::MAX_ICON_LENGTH ) {
				$clean['icon'] = $icon;
			}
		}
		if ( array_key_exists( 'imageUrl', $attributes ) ) {
			$clean['imageUrl'] = esc_url_raw( (string) $attributes['imageUrl'] );
		}

		$color_keys = array(
			'colorPrimary',
			'colorBorder',
			'colorAccent',
			'colorAlt',
			'colorAltHover',
			'colorAltText',
			'colorAltTextHover',
			'colorBold',
			'colorLight',
		);
		foreach ( $color_keys as $key ) {
			if ( ! array_key_exists( $key, $attributes ) ) {
				continue;
			}
			$color = self::sanitize_css_color( $attributes[ $key ] );
			if ( null !== $color ) {
				$clean[ $key ] = $color;
			}
		}

		return self::normalize_design_snapshot( $clean );
	}

	/**
	 * Verify capability and nonce without adding any unauthenticated endpoint.
	 */
	private function verify_request() {
		if (
			false === check_ajax_referer( self::NONCE_ACTION, 'nonce', false ) ||
			! current_user_can( 'manage_options' )
		) {
			wp_send_json_error( array( 'message' => __( 'Security check failed', 'alerts-dlx' ) ), 403 );
		}
	}

	/**
	 * Read and decode one bounded attributes payload.
	 *
	 * @return array
	 */
	private static function request_snapshot() {
		$encoded = self::request_string( 'attributes' );
		if ( '' === $encoded || strlen( $encoded ) > self::MAX_PAYLOAD_BYTES ) {
			return array();
		}

		try {
			$attributes = json_decode( $encoded, true, 16, JSON_THROW_ON_ERROR );
		} catch ( \JsonException $exception ) {
			return array();
		}

		return self::sanitize_snapshot( $attributes );
	}

	/**
	 * Read one scalar POST value.
	 *
	 * @param string $key Request key.
	 * @return string
	 */
	private static function request_string( $key ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- nonce is checked by each caller before mutation.
		$value = isset( $_POST[ $key ] ) ? wp_unslash( $_POST[ $key ] ) : '';
		return is_scalar( $value ) ? (string) $value : '';
	}

	/**
	 * Read raw plugin settings without injecting defaults or changing the option.
	 *
	 * @return array
	 */
	private static function get_raw_options() {
		$options = get_option( self::OPTION_NAME, array() );
		return is_array( $options ) ? $options : array();
	}

	/**
	 * Return a sanitized map of stored custom presets.
	 *
	 * @return array
	 */
	private static function get_presets_map() {
		$options = self::get_raw_options();
		$stored  = $options[ self::PRESETS_KEY ] ?? array();
		if ( ! is_array( $stored ) ) {
			return array();
		}

		$presets = array();
		foreach ( array_slice( $stored, 0, self::MAX_PRESETS ) as $preset ) {
			if ( ! is_array( $preset ) ) {
				continue;
			}
			$id         = sanitize_key( (string) ( $preset['id'] ?? '' ) );
			$name       = self::sanitize_name( $preset['name'] ?? '' );
			$attributes = self::sanitize_snapshot( $preset['attributes'] ?? array() );
			if ( '' === $id || '' === $name || empty( $attributes ) || isset( $presets[ $id ] ) ) {
				continue;
			}
			$presets[ $id ] = array(
				'id'         => $id,
				'name'       => $name,
				'attributes' => $attributes,
			);
		}
		return $presets;
	}

	/**
	 * Update one nested value while preserving every existing setting.
	 *
	 * @param string $key   Nested key.
	 * @param array  $value Sanitized value.
	 */
	private static function write_option_fragment( $key, $value ) {
		$options         = self::get_raw_options();
		$options[ $key ] = $value;
		update_option( self::OPTION_NAME, $options );
	}

	/**
	 * Return the complete state after a successful mutation.
	 *
	 * @return array
	 */
	private static function get_editor_state() {
		return array(
			'presets'  => self::get_presets_for_editor(),
			'defaults' => self::get_defaults_for_editor(),
		);
	}

	/**
	 * Create a stable unique ID for a new custom preset.
	 *
	 * @param string $name    Preset name.
	 * @param array  $presets Existing presets.
	 * @return string
	 */
	private static function create_preset_id( $name, $presets ) {
		$slug = sanitize_title( $name );
		$base = 'custom-' . ( '' !== $slug ? $slug : 'preset' );
		$base = substr( $base, 0, 56 );
		$id   = $base;
		$next = 2;
		while ( isset( $presets[ $id ] ) ) {
			$id = $base . '-' . $next;
			++$next;
		}
		return sanitize_key( $id );
	}

	/**
	 * Sanitize a human-readable name and enforce a hard length limit.
	 *
	 * @param mixed $name Untrusted name.
	 * @return string
	 */
	private static function sanitize_name( $name ) {
		$name = trim( sanitize_text_field( (string) $name ) );
		if ( function_exists( 'mb_substr' ) ) {
			return mb_substr( $name, 0, self::MAX_NAME_LENGTH );
		}
		return substr( $name, 0, self::MAX_NAME_LENGTH );
	}

	/**
	 * Keep design, variant and type combinations valid and derive the block
	 * style class instead of accepting an arbitrary class from AJAX.
	 *
	 * @param array $snapshot Sanitized snapshot.
	 * @return array
	 */
	private static function normalize_design_snapshot( $snapshot ) {
		$designs = array(
			'bootstrap' => array(
				'types'           => array( 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'custom' ),
				'variants'        => array( 'default', 'centered' ),
				'default_type'    => 'success',
				'default_variant' => 'default',
			),
			'chakra'    => array(
				'types'           => array( 'success', 'info', 'warning', 'error', 'custom' ),
				'variants'        => array( 'subtle', 'solid', 'left-accent', 'top-accent', 'centered' ),
				'default_type'    => 'success',
				'default_variant' => 'subtle',
			),
			'material'  => array(
				'types'           => array( 'success', 'info', 'warning', 'error', 'custom' ),
				'variants'        => array( 'default', 'outlined', 'filled', 'centered' ),
				'default_type'    => 'success',
				'default_variant' => 'default',
			),
			'shoelace'  => array(
				'types'           => array( 'primary', 'success', 'neutral', 'warning', 'danger', 'custom' ),
				'variants'        => array( 'top-accent', 'left-accent', 'solid', 'centered' ),
				'default_type'    => 'success',
				'default_variant' => 'top-accent',
			),
		);

		$group  = $snapshot['alertGroup'] ?? 'bootstrap';
		$design = $designs[ $group ] ?? $designs['bootstrap'];
		if ( isset( $snapshot['variant'] ) && ! in_array( $snapshot['variant'], $design['variants'], true ) ) {
			$snapshot['variant'] = $design['default_variant'];
		}
		if ( isset( $snapshot['alertType'] ) && ! in_array( $snapshot['alertType'], $design['types'], true ) ) {
			$snapshot['alertType'] = $design['default_type'];
		}
		if ( isset( $snapshot['alertType'] ) ) {
			$snapshot['className'] = 'is-style-' . sanitize_html_class( $snapshot['alertType'] );
		}
		return $snapshot;
	}

	/**
	 * Accept the CSS color forms already used by block metadata while refusing
	 * declarations, URLs and other executable CSS fragments.
	 *
	 * @param mixed $value Untrusted CSS color.
	 * @return string|null
	 */
	private static function sanitize_css_color( $value ) {
		$color = trim( sanitize_text_field( (string) $value ) );
		if ( '' === $color || strlen( $color ) > 200 ) {
			return null;
		}
		if ( preg_match( '/^#[0-9a-f]{3,8}$/i', $color ) ) {
			return $color;
		}
		if ( preg_match( '/^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s+\/-]+\)$/i', $color ) ) {
			return $color;
		}
		if ( preg_match( '/^var\(--[a-z0-9-]+(?:,\s*#[0-9a-f]{3,8})?\)$/i', $color ) ) {
			return $color;
		}
		if ( preg_match( '/^(?:transparent|currentcolor)$/i', $color ) ) {
			return $color;
		}
		return null;
	}
}
