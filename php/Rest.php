<?php
/**
 * REST API endpoints for AlertsDLX.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Helper class for REST integration.
 */
class Rest {

	/**
	 * Main class runner.
	 */
	public static function run() {
		add_action( 'rest_api_init', array( static::class, 'register_rest_routes' ) );
	}

	/**
	 * Register REST routes for AlertsDLX.
	 */
	public static function register_rest_routes() {
		register_rest_route(
			'dlxplugins/alerts-dlx/v1',
			'/user-state',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => array( static::class, 'rest_get_user_state' ),
			)
		);

		register_rest_route(
			'dlxplugins/alerts-dlx/v1',
			'/alert-contents',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => '__return_true',
				'callback'            => array( static::class, 'rest_get_alert_contents' ),
				'args'                => array(
					'ids' => array(
						'type'              => 'array',
						'required'          => true,
						'sanitize_callback' => function ( $value ) {
							return array_map( 'sanitize_text_field', (array) $value );
						},
					),
				),
			)
		);

		register_rest_route(
			'dlxplugins/alerts-dlx/v1',
			'/search/pages',
			array(
				'methods'             => 'POST',
				'permission_callback' => function () {
					return current_user_can( 'publish_posts' );
				},
				'callback'            => array( static::class, 'rest_get_pages' ),
			)
		);

		register_rest_route(
			'dlxplugins/alerts-dlx/v1',
			'/library-items',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'permission_callback' => array( static::class, 'library_read_permissions_check' ),
					'callback'            => array( static::class, 'rest_get_library_items' ),
					'args'                => array(
						'kind' => array(
							'type'              => 'string',
							'required'          => false,
							'sanitize_callback' => array( AlertLibrary::class, 'sanitize_list_kind' ),
						),
					),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'permission_callback' => array( static::class, 'library_permissions_check' ),
					'callback'            => array( static::class, 'rest_create_library_item' ),
				),
			)
		);

		register_rest_route(
			'dlxplugins/alerts-dlx/v1',
			'/library-items/(?P<id>\d+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'permission_callback' => array( static::class, 'library_read_permissions_check' ),
					'callback'            => array( static::class, 'rest_get_library_item' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'permission_callback' => array( static::class, 'library_permissions_check' ),
					'callback'            => array( static::class, 'rest_update_library_item' ),
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'permission_callback' => array( static::class, 'library_permissions_check' ),
					'callback'            => array( static::class, 'rest_delete_library_item' ),
				),
			)
		);

		register_rest_route(
			'dlxplugins/alerts-dlx/v1',
			'/library-items/(?P<id>\d+)/duplicate',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => array( static::class, 'library_permissions_check' ),
				'callback'            => array( static::class, 'rest_duplicate_library_item' ),
				'args'                => array(
					'kind' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => array( AlertLibrary::class, 'sanitize_kind' ),
					),
				),
			)
		);
	}

	/**
	 * Return the current user's login state and roles for client-side condition checks.
	 *
	 * @return \WP_REST_Response
	 */
	public static function rest_get_user_state() {
		$user = wp_get_current_user();
		return rest_ensure_response(
			array(
				'isLoggedIn' => is_user_logged_in(),
				'roles'      => $user->roles,
			)
		);
	}

	/**
	 * Return rendered HTML for one or more conditioned alerts.
	 *
	 * Re-renders from stored attributes so all escaping runs on every request.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public static function rest_get_alert_contents( $request ) {
		$ids     = $request->get_param( 'ids' );
		$results = array();
		foreach ( $ids as $id ) {
			$stored = get_transient( 'adlx_alert_' . sanitize_key( $id ) );
			$html   = '';
			if ( false !== $stored ) {
				$data = json_decode( $stored, true );
				if ( is_array( $data ) && isset( $data['attributes'] ) ) {
					$html = Blocks::render_alert( $data['attributes'], $data['content'] ?? '' );
				}
			}
			$results[] = array(
				'id'   => $id,
				'html' => $html,
			);
		}
		return rest_ensure_response( $results );
	}

	/**
	 * Permission callback for read-only alert library routes.
	 *
	 * Block editors who are not administrators still need to list and resolve
	 * library items. Create, update, and delete stay on manage_options.
	 *
	 * @return bool
	 */
	public static function library_read_permissions_check() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Permission callback for mutating alert library routes.
	 *
	 * @return bool
	 */
	public static function library_permissions_check() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Reject raw SVG on plugin library routes.
	 *
	 * Custom markup must be written through core CPT content.
	 *
	 * @param array $params Request params.
	 * @return true|\WP_Error
	 */
	public static function reject_plugin_route_svg( array $params ) {
		$config = isset( $params['config'] ) && is_array( $params['config'] ) ? $params['config'] : array();
		$icon   = isset( $config['icon'] ) ? (string) $config['icon'] : '';
		if ( Functions::is_raw_svg_icon( $icon ) ) {
			return new \WP_Error(
				'alerts_dlx_library_icon_route',
				__( 'Custom SVG icons must be saved through the library content route.', 'alerts-dlx' ),
				array( 'status' => 400 )
			);
		}

		return true;
	}

	/**
	 * List library items for one kind, or every kind when omitted.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public static function rest_get_library_items( $request ) {
		$kind  = AlertLibrary::sanitize_list_kind( (string) $request->get_param( 'kind' ) );
		$items = AlertLibrary::query_items( $kind );
		return rest_ensure_response( $items );
	}

	/**
	 * Get one library item.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function rest_get_library_item( $request ) {
		$post = get_post( (int) $request['id'] );
		if ( ! $post ) {
			return new \WP_Error( 'alerts_dlx_library_not_found', __( 'Library item not found.', 'alerts-dlx' ), array( 'status' => 404 ) );
		}

		$formatted = AlertLibrary::format_item_for_rest( $post );
		if ( is_wp_error( $formatted ) ) {
			return $formatted;
		}

		return rest_ensure_response( $formatted );
	}

	/**
	 * Create a library item.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function rest_create_library_item( $request ) {
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		$icon_error = self::reject_plugin_route_svg( $params );
		if ( is_wp_error( $icon_error ) ) {
			return $icon_error;
		}

		$kind  = AlertLibrary::sanitize_kind( (string) ( $params['kind'] ?? AlertLibrary::KIND_GLOBAL_STYLE ) );
		$title = sanitize_text_field( (string) ( $params['title'] ?? '' ) );
		if ( '' === $title ) {
			return new \WP_Error( 'alerts_dlx_library_title', __( 'A title is required.', 'alerts-dlx' ), array( 'status' => 400 ) );
		}

		$slug = sanitize_title( (string) ( $params['slug'] ?? $title ) );
		if ( ! AlertLibrary::is_slug_unique_for_kind( $slug, $kind ) ) {
			return new \WP_Error( 'alerts_dlx_library_slug', __( 'That slug is already in use for this library type.', 'alerts-dlx' ), array( 'status' => 400 ) );
		}

		$config = AlertLibrary::sanitize_config( $params['config'] ?? array(), $kind );
		if ( is_wp_error( $config ) ) {
			return new \WP_Error( 'alerts_dlx_library_config', $config->get_error_message(), array( 'status' => 400 ) );
		}

		$post_id = wp_insert_post(
			array(
				'post_type'    => AlertLibrary::POST_TYPE,
				'post_title'   => $title,
				'post_name'    => $slug,
				'post_status'  => 'publish',
				'post_content' => AlertLibrary::encode_config_for_storage( $config ),
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		update_post_meta( $post_id, AlertLibrary::META_KIND, $kind );

		if ( array_key_exists( 'showInInserter', $params ) ) {
			AlertLibrary::set_show_in_inserter( $post_id, rest_sanitize_boolean( $params['showInInserter'] ) );
		}

		$formatted = AlertLibrary::format_item_for_rest( get_post( $post_id ) );
		return rest_ensure_response( $formatted );
	}

	/**
	 * Update a library item.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function rest_update_library_item( $request ) {
		$post_id = (int) $request['id'];
		$post    = get_post( $post_id );
		if ( ! $post || AlertLibrary::POST_TYPE !== $post->post_type ) {
			return new \WP_Error( 'alerts_dlx_library_not_found', __( 'Library item not found.', 'alerts-dlx' ), array( 'status' => 404 ) );
		}

		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		$icon_error = self::reject_plugin_route_svg( $params );
		if ( is_wp_error( $icon_error ) ) {
			return $icon_error;
		}

		$kind = AlertLibrary::get_post_kind( $post_id );
		if ( isset( $params['kind'] ) && AlertLibrary::sanitize_kind( (string) $params['kind'] ) !== $kind ) {
			return new \WP_Error( 'alerts_dlx_library_kind_immutable', __( 'The library kind cannot be changed.', 'alerts-dlx' ), array( 'status' => 400 ) );
		}

		$update = array(
			'ID' => $post_id,
		);

		if ( isset( $params['title'] ) ) {
			$title = sanitize_text_field( (string) $params['title'] );
			if ( '' === $title ) {
				return new \WP_Error( 'alerts_dlx_library_title', __( 'A title is required.', 'alerts-dlx' ), array( 'status' => 400 ) );
			}
			$update['post_title'] = $title;
		}

		if ( isset( $params['slug'] ) ) {
			$slug = sanitize_title( (string) $params['slug'] );
			if ( ! AlertLibrary::is_slug_unique_for_kind( $slug, $kind, $post_id ) ) {
				return new \WP_Error( 'alerts_dlx_library_slug', __( 'That slug is already in use for this library type.', 'alerts-dlx' ), array( 'status' => 400 ) );
			}
			$update['post_name'] = $slug;
		}

		if ( array_key_exists( 'config', $params ) ) {
			$config = AlertLibrary::sanitize_config( $params['config'] ?? array(), $kind );
			if ( is_wp_error( $config ) ) {
				return new \WP_Error( 'alerts_dlx_library_config', $config->get_error_message(), array( 'status' => 400 ) );
			}
			$update['post_content'] = AlertLibrary::encode_config_for_storage( $config );
		}

		if ( count( $update ) > 1 ) {
			$result = wp_update_post( $update, true );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		if ( array_key_exists( 'showInInserter', $params ) ) {
			AlertLibrary::set_show_in_inserter( $post_id, rest_sanitize_boolean( $params['showInInserter'] ) );
		}

		$formatted = AlertLibrary::format_item_for_rest( get_post( $post_id ) );
		return rest_ensure_response( $formatted );
	}

	/**
	 * Delete a library item.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function rest_delete_library_item( $request ) {
		$post_id = (int) $request['id'];
		$post    = get_post( $post_id );
		if ( ! $post || AlertLibrary::POST_TYPE !== $post->post_type ) {
			return new \WP_Error( 'alerts_dlx_library_not_found', __( 'Library item not found.', 'alerts-dlx' ), array( 'status' => 404 ) );
		}

		$deleted = wp_delete_post( $post_id, true );
		if ( ! $deleted ) {
			return new \WP_Error( 'alerts_dlx_library_delete', __( 'Could not delete the library item.', 'alerts-dlx' ), array( 'status' => 500 ) );
		}

		return rest_ensure_response(
			array(
				'deleted' => true,
				'id'      => $post_id,
			)
		);
	}

	/**
	 * Duplicate a library item.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function rest_duplicate_library_item( $request ) {
		$post_id = (int) $request['id'];
		$post    = get_post( $post_id );
		if ( ! $post || AlertLibrary::POST_TYPE !== $post->post_type ) {
			return new \WP_Error( 'alerts_dlx_library_not_found', __( 'Library item not found.', 'alerts-dlx' ), array( 'status' => 404 ) );
		}

		$source_kind = AlertLibrary::get_post_kind( $post_id );
		$config      = AlertLibrary::get_post_config( $post_id );
		$kind        = $source_kind;
		$raw_kind    = $request->get_param( 'kind' );
		if ( null !== $raw_kind && '' !== $raw_kind ) {
			$kind = AlertLibrary::sanitize_kind( (string) $raw_kind );
		}

		if ( $kind === $source_kind ) {
			/* translators: %s: original library item title. */
			$title = sprintf( __( 'Copy of %s', 'alerts-dlx' ), $post->post_title );
			$slug  = sanitize_title( $title );
		} else {
			$title = $post->post_title;
			$slug  = $post->post_name;
			if ( ! AlertLibrary::is_slug_unique_for_kind( $slug, $kind ) ) {
				/* translators: %s: original library item title. */
				$title = sprintf( __( 'Copy of %s', 'alerts-dlx' ), $post->post_title );
				$slug  = sanitize_title( $title );
			}
		}

		$base  = $slug;
		$index = 2;
		while ( ! AlertLibrary::is_slug_unique_for_kind( $slug, $kind ) ) {
			$slug = $base . '-' . $index;
			++$index;
		}

		$sanitized = AlertLibrary::sanitize_config( $config, $kind );
		if ( is_wp_error( $sanitized ) ) {
			return new \WP_Error( 'alerts_dlx_library_config', $sanitized->get_error_message(), array( 'status' => 400 ) );
		}

		$new_id = wp_insert_post(
			array(
				'post_type'    => AlertLibrary::POST_TYPE,
				'post_title'   => $title,
				'post_name'    => $slug,
				'post_status'  => 'publish',
				'post_content' => AlertLibrary::encode_config_for_storage( $sanitized ),
			),
			true
		);

		if ( is_wp_error( $new_id ) ) {
			return $new_id;
		}

		update_post_meta( $new_id, AlertLibrary::META_KIND, $kind );

		// Duplicates start hidden from the inserter. The source flag is not copied.
		$formatted = AlertLibrary::format_item_for_rest( get_post( $new_id ) );
		return rest_ensure_response( $formatted );
	}

	/**
	 * Public post types the button link search can return.
	 *
	 * Uses registered public types that are viewable on the front end, which
	 * includes posts, pages, and public custom post types. Attachments are
	 * excluded even though they are public. Revisions and nav menu items are
	 * not public.
	 *
	 * @return string[] Post type slugs.
	 */
	public static function get_link_search_post_types() {
		$post_types = get_post_types(
			array(
				'public' => true,
			),
			'objects'
		);

		$excluded = array(
			'attachment',
			'revision',
			'nav_menu_item',
		);

		$searchable = array();

		foreach ( $post_types as $post_type => $post_type_object ) {
			if ( in_array( $post_type, $excluded, true ) ) {
				continue;
			}

			if ( ! is_post_type_viewable( $post_type_object ) ) {
				continue;
			}

			$searchable[] = $post_type;
		}

		if ( empty( $searchable ) ) {
			$searchable = array(
				'post',
				'page',
			);
		}

		return $searchable;
	}

	/**
	 * Search published public content for URL picker suggestions.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response
	 */
	public static function rest_get_pages( $request ) {
		$search = sanitize_text_field( wp_unslash( urldecode( $request->get_param( 'search' ) ) ) );

		$post_types_to_search = self::get_link_search_post_types();

		/**
		 * Filter the post types searched by the button link picker.
		 *
		 * Default is public, viewable post types except attachments.
		 *
		 * @param array $post_types_to_search The post types to search.
		 */
		$post_types_to_search = apply_filters( 'alerts_dlx_rest_post_types_to_search', $post_types_to_search );
		$post_types_to_search = array_values(
			array_unique(
				array_filter(
					array_map( 'sanitize_key', (array) $post_types_to_search )
				)
			)
		);

		if ( empty( $post_types_to_search ) ) {
			$post_types_to_search = array(
				'post',
				'page',
			);
		}

		$args = array(
			'post_type'      => $post_types_to_search,
			'post_status'    => 'publish',
			'posts_per_page' => 20,
			's'              => $search,
			'orderby'        => 'relevance',
			'order'          => 'DESC',
		);

		if ( empty( $search ) ) {
			$args['orderby'] = 'date';
			$args['order']   = 'DESC';
		}

		$query = new \WP_Query( $args );

		$results = array();

		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				$post_id   = get_the_ID();
				$results[] = array(
					'value'     => $post_id,
					'label'     => html_entity_decode( get_the_title() ),
					'permalink' => get_the_permalink(),
					'slug'      => get_post_field( 'post_name', $post_id ),
					'type'      => get_post_type(),
				);
			}
		}

		wp_reset_postdata();

		return rest_ensure_response( $results );
	}
}
