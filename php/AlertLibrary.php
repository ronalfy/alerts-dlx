<?php
/**
 * Alert library custom post type (global styles and snapshots).
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the shared library CPT and config sanitization by kind.
 */
final class AlertLibrary {

	/** Post type slug. */
	public const POST_TYPE = 'alerts_dlx_library';

	/** Meta key for library entry kind. */
	public const META_KIND = '_alerts_dlx_kind';

	/** Meta key for stored alert configuration. */
	public const META_CONFIG = '_alerts_dlx_config';

	/** Global style library kind. */
	public const KIND_GLOBAL_STYLE = 'global_style';

	/** Snapshot library kind. */
	public const KIND_SNAPSHOT = 'snapshot';

	/** Query value that returns every library kind. */
	public const KIND_ALL = 'all';

	/**
	 * Register hooks.
	 */
	public static function run() {
		add_action( 'init', array( self::class, 'register_post_type' ) );
		add_action( 'init', array( self::class, 'register_meta' ) );
		add_filter( 'map_meta_cap', array( self::class, 'map_meta_cap' ), 10, 4 );
	}

	/**
	 * Register the private library post type.
	 */
	public static function register_post_type() {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => array(
					'name'          => _x( 'Alert library', 'post type general name', 'alerts-dlx' ),
					'singular_name' => _x( 'Alert library item', 'post type singular name', 'alerts-dlx' ),
				),
				'public'              => false,
				'show_ui'             => false,
				'show_in_menu'        => false,
				'show_in_rest'        => false,
				'exclude_from_search' => true,
				'capability_type'     => 'post',
				'map_meta_cap'        => true,
				'supports'            => array( 'title' ),
				'delete_with_user'    => false,
			)
		);
	}

	/**
	 * Register post meta for REST and internal use.
	 */
	public static function register_meta() {
		register_post_meta(
			self::POST_TYPE,
			self::META_KIND,
			array(
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => false,
				'auth_callback'     => array( self::class, 'meta_auth_callback' ),
				'sanitize_callback' => array( self::class, 'sanitize_kind_meta' ),
			)
		);

		register_post_meta(
			self::POST_TYPE,
			self::META_CONFIG,
			array(
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => false,
				'auth_callback'     => array( self::class, 'meta_auth_callback' ),
				'sanitize_callback' => array( self::class, 'sanitize_config_meta' ),
			)
		);
	}

	/**
	 * Restrict library meta to administrators.
	 *
	 * @return bool
	 */
	public static function meta_auth_callback() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Sanitize kind meta on direct meta updates.
	 *
	 * @param mixed $value Raw kind.
	 * @return string
	 */
	public static function sanitize_kind_meta( $value ) {
		return self::sanitize_kind( (string) $value );
	}

	/**
	 * Sanitize config meta without kind context (defaults to global style).
	 *
	 * @param mixed $value Raw config.
	 * @return string JSON encoded config.
	 */
	public static function sanitize_config_meta( $value ) {
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			$config  = is_array( $decoded ) ? $decoded : array();
		} elseif ( is_array( $value ) ) {
			$config = $value;
		} else {
			$config = array();
		}

		$sanitized = self::sanitize_config( $config, self::KIND_GLOBAL_STYLE );
		if ( is_wp_error( $sanitized ) ) {
			return wp_json_encode( ShortcodeBuilder::get_global_style_defaults() );
		}

		return wp_json_encode( $sanitized );
	}

	/**
	 * Map library post capabilities to manage_options.
	 *
	 * @param array  $caps    Required capabilities.
	 * @param string $cap     Capability name.
	 * @param int    $user_id User ID.
	 * @param array  $args    Extra arguments.
	 * @return array
	 */
	public static function map_meta_cap( $caps, $cap, $user_id, $args ) {
		$library_caps = array(
			'edit_post',
			'read_post',
			'delete_post',
			'edit_posts',
			'publish_posts',
			'create_posts',
		);

		if ( ! in_array( $cap, $library_caps, true ) ) {
			return $caps;
		}

		if ( in_array( $cap, array( 'edit_post', 'read_post', 'delete_post' ), true ) && ! empty( $args[0] ) ) {
			$post = get_post( (int) $args[0] );
			if ( $post && self::POST_TYPE === $post->post_type ) {
				return array( 'manage_options' );
			}
		}

		if ( in_array( $cap, array( 'edit_posts', 'publish_posts', 'create_posts' ), true ) ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Capability mapping only.
			if ( isset( $_REQUEST['post_type'] ) && self::POST_TYPE === sanitize_key( wp_unslash( $_REQUEST['post_type'] ) ) ) {
				return array( 'manage_options' );
			}
		}

		return $caps;
	}

	/**
	 * Return allowed kind slugs.
	 *
	 * @return string[]
	 */
	public static function get_allowed_kinds() {
		return array(
			self::KIND_GLOBAL_STYLE,
			self::KIND_SNAPSHOT,
		);
	}

	/**
	 * Sanitize a library kind value.
	 *
	 * @param string $kind Raw kind.
	 * @return string
	 */
	public static function sanitize_kind( $kind ) {
		$kind = sanitize_key( $kind );
		if ( ! in_array( $kind, self::get_allowed_kinds(), true ) ) {
			return self::KIND_GLOBAL_STYLE;
		}
		return $kind;
	}

	/**
	 * Sanitize config for a library kind.
	 *
	 * @param array  $config Raw config.
	 * @param string $kind   Library kind.
	 * @return array|\WP_Error
	 */
	public static function sanitize_config( $config, $kind ) {
		$kind = self::sanitize_kind( $kind );
		if ( ! is_array( $config ) ) {
			return new \WP_Error( 'alerts_dlx_library_config', __( 'Invalid library configuration.', 'alerts-dlx' ) );
		}

		if ( self::KIND_SNAPSHOT === $kind ) {
			return ShortcodeBuilder::sanitize_snapshot_values( $config );
		}

		if ( self::KIND_GLOBAL_STYLE === $kind ) {
			return ShortcodeBuilder::sanitize_global_style_values( $config );
		}

		return new \WP_Error( 'alerts_dlx_library_kind', __( 'Unsupported library kind.', 'alerts-dlx' ) );
	}

	/**
	 * Sanitize a list-query kind (allowed kind or all).
	 *
	 * @param string $kind Raw kind.
	 * @return string
	 */
	public static function sanitize_list_kind( $kind ) {
		$kind = sanitize_key( (string) $kind );
		if ( '' === $kind || self::KIND_ALL === $kind ) {
			return self::KIND_ALL;
		}

		if ( in_array( $kind, self::get_allowed_kinds(), true ) ) {
			return $kind;
		}

		return self::KIND_ALL;
	}

	/**
	 * Fixed preview overlay for global style admin (never persisted).
	 *
	 * @return array
	 */
	public static function get_global_style_preview_fixture() {
		return array(
			'alert_title'             => __( 'Lorem ipsum dolor sit amet', 'alerts-dlx' ),
			'alert_description'       => __( 'Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'alerts-dlx' ),
			'button_text'             => __( 'Lorem ipsum', 'alerts-dlx' ),
			'button_url'              => '#',
			'button_target'           => false,
			'button_rel_no_follow'    => false,
			'button_rel_sponsored'    => false,
			'close_button_enabled'    => false,
			'close_button_expiration' => 0,
			'align'                   => 'center',
			'is_block_editorial_only' => false,
		);
	}

	/**
	 * Merge style config with preview fixture for server-side render.
	 *
	 * Stored appearance keys win. Global styles do not persist title,
	 * description, alignment, or dismiss controls, so the fixture fills those.
	 *
	 * @param array $config Stored global style config.
	 * @return array
	 */
	public static function merge_global_style_preview_values( $config ) {
		$fixture = self::get_global_style_preview_fixture();
		$merged  = array_merge( $fixture, is_array( $config ) ? $config : array() );
		if ( empty( $merged['unique_id'] ) ) {
			$merged['unique_id'] = 'alerts-dlx-preview-' . wp_generate_password( 8, false, false );
		}
		return $merged;
	}

	/**
	 * Merge snapshot config with preview fixture for server-side render.
	 *
	 * Stored alignment and dismiss values win over the fixture. Title,
	 * description, and button stay preview-only: fixture copy is shown
	 * only when the corresponding visibility toggle is enabled.
	 *
	 * @param array $config Stored snapshot config.
	 * @return array
	 */
	public static function merge_snapshot_preview_values( $config ) {
		$fixture = self::get_global_style_preview_fixture();
		$config  = is_array( $config ) ? $config : array();
		$merged  = array_merge( $fixture, $config );

		$title_enabled               = filter_var( $config['title_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN );
		$description_enabled         = filter_var( $config['description_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN );
		$button_enabled              = filter_var( $config['button_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN );
		$merged['alert_title']       = $title_enabled ? $fixture['alert_title'] : '';
		$merged['alert_description'] = $description_enabled ? $fixture['alert_description'] : '';
		$merged['button_text']       = $button_enabled ? $fixture['button_text'] : '';
		$merged['button_url']        = $button_enabled ? $fixture['button_url'] : '';

		if ( empty( $merged['unique_id'] ) ) {
			$merged['unique_id'] = 'alerts-dlx-preview-' . wp_generate_password( 8, false, false );
		}

		return $merged;
	}

	/**
	 * Load kind meta for a library post.
	 *
	 * @param int $post_id Post ID.
	 * @return string
	 */
	public static function get_post_kind( $post_id ) {
		$kind = get_post_meta( $post_id, self::META_KIND, true );
		return self::sanitize_kind( (string) $kind );
	}

	/**
	 * Load decoded config for a library post.
	 *
	 * @param int $post_id Post ID.
	 * @return array
	 */
	public static function get_post_config( $post_id ) {
		$kind     = self::get_post_kind( $post_id );
		$defaults = self::KIND_SNAPSHOT === $kind
			? ShortcodeBuilder::get_snapshot_defaults()
			: ShortcodeBuilder::get_global_style_defaults();
		$config   = $defaults;
		$raw      = get_post_meta( $post_id, self::META_CONFIG, true );
		if ( is_string( $raw ) && '' !== $raw ) {
			$decoded = json_decode( $raw, true );
			if ( is_array( $decoded ) ) {
				$config = array_merge( $defaults, $decoded );
			}
		} elseif ( is_array( $raw ) ) {
			$config = array_merge( $defaults, $raw );
		}
		$post = get_post( $post_id );
		if ( self::KIND_SNAPSHOT === $kind ) {
			/**
			 * Filter a snapshot configuration array before it is returned.
			 *
			 * @since 2.5.0
			 *
			 * @param array    $config Sanitized snapshot config.
			 * @param \WP_Post $post   Library post object.
			 */
			$config = apply_filters( 'alerts_dlx_snapshot_config', $config, $post );
		} else {
			/**
			 * Filter a global style configuration array before it is returned.
			 *
			 * @since 2.5.0
			 *
			 * @param array    $config Sanitized global style config.
			 * @param \WP_Post $post   Library post object.
			 */
			$config = apply_filters( 'alerts_dlx_global_style_config', $config, $post );
		}

		return $config;
	}

	/**
	 * Return true when slug is unique for a kind.
	 *
	 * @param string $slug      Post slug.
	 * @param string $kind      Library kind.
	 * @param int    $exclude_id Post ID to exclude.
	 * @return bool
	 */
	public static function is_slug_unique_for_kind( $slug, $kind, $exclude_id = 0 ) {
		$slug = sanitize_title( $slug );
		if ( '' === $slug ) {
			return false;
		}

		$query = new \WP_Query(
			array(
				'post_type'      => self::POST_TYPE,
				'post_status'    => array( 'publish', 'draft', 'private' ),
				'name'           => $slug,
				'posts_per_page' => 1,
				'post__not_in'   => $exclude_id ? array( (int) $exclude_id ) : array(),
				'fields'         => 'ids',
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'   => self::META_KIND,
						'value' => self::sanitize_kind( $kind ),
					),
				),
			)
		);

		return empty( $query->posts );
	}

	/**
	 * Format a library post for REST.
	 *
	 * @param \WP_Post $post Post object.
	 * @return array|\WP_Error
	 */
	public static function format_item_for_rest( $post ) {
		if ( ! $post instanceof \WP_Post || self::POST_TYPE !== $post->post_type ) {
			return new \WP_Error( 'alerts_dlx_library_not_found', __( 'Library item not found.', 'alerts-dlx' ), array( 'status' => 404 ) );
		}

		$config = self::get_post_config( $post->ID );
		$kind   = self::get_post_kind( $post->ID );

		return array(
			'id'          => $post->ID,
			'title'       => $post->post_title,
			'slug'        => $post->post_name,
			'kind'        => $kind,
			'config'      => $config,
			'alert_group' => $config['alert_group'] ?? '',
			'alert_type'  => $config['alert_type'] ?? '',
			'variant'     => $config['variant'] ?? '',
			'modified'    => mysql2date( 'c', $post->post_modified_gmt, false ),
		);
	}

	/**
	 * Query library items for a kind, or every kind when `$kind` is all.
	 *
	 * @param string $kind Library kind or `all`.
	 * @param array  $args Optional query overrides.
	 * @return array
	 */
	public static function query_items( $kind = self::KIND_ALL, $args = array() ) {
		$kind     = self::sanitize_list_kind( $kind );
		$defaults = array(
			'post_type'      => self::POST_TYPE,
			'post_status'    => 'publish',
			'posts_per_page' => 100,
			'orderby'        => 'modified',
			'order'          => 'DESC',
		);

		if ( in_array( $kind, self::get_allowed_kinds(), true ) ) {
			$defaults['meta_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				array(
					'key'   => self::META_KIND,
					'value' => $kind,
				),
			);
		}

		$query_args = wp_parse_args( $args, $defaults );
		$query      = new \WP_Query( $query_args );
		$items      = array();

		foreach ( $query->posts as $post ) {
			if ( $post instanceof \WP_Post ) {
				$formatted = self::format_item_for_rest( $post );
				if ( ! is_wp_error( $formatted ) ) {
					$items[] = $formatted;
				}
			}
		}

		return $items;
	}
}
