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
					'permission_callback' => array( static::class, 'library_permissions_check' ),
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
					'permission_callback' => array( static::class, 'library_permissions_check' ),
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
	 * Permission callback for alert library routes.
	 *
	 * @return bool
	 */
	public static function library_permissions_check() {
		return current_user_can( 'manage_options' );
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
				'post_type'   => AlertLibrary::POST_TYPE,
				'post_title'  => $title,
				'post_name'   => $slug,
				'post_status' => 'publish',
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		update_post_meta( $post_id, AlertLibrary::META_KIND, $kind );
		update_post_meta( $post_id, AlertLibrary::META_CONFIG, wp_json_encode( $config ) );

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

		if ( count( $update ) > 1 ) {
			$result = wp_update_post( $update, true );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		if ( array_key_exists( 'config', $params ) ) {
			$config = AlertLibrary::sanitize_config( $params['config'] ?? array(), $kind );
			if ( is_wp_error( $config ) ) {
				return new \WP_Error( 'alerts_dlx_library_config', $config->get_error_message(), array( 'status' => 400 ) );
			}
			update_post_meta( $post_id, AlertLibrary::META_CONFIG, wp_json_encode( $config ) );
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

		$new_id = wp_insert_post(
			array(
				'post_type'   => AlertLibrary::POST_TYPE,
				'post_title'  => $title,
				'post_name'   => $slug,
				'post_status' => 'publish',
			),
			true
		);

		if ( is_wp_error( $new_id ) ) {
			return $new_id;
		}

		$sanitized = AlertLibrary::sanitize_config( $config, $kind );
		if ( is_wp_error( $sanitized ) ) {
			wp_delete_post( $new_id, true );
			return new \WP_Error( 'alerts_dlx_library_config', $sanitized->get_error_message(), array( 'status' => 400 ) );
		}

		update_post_meta( $new_id, AlertLibrary::META_KIND, $kind );
		update_post_meta( $new_id, AlertLibrary::META_CONFIG, wp_json_encode( $sanitized ) );

		$formatted = AlertLibrary::format_item_for_rest( get_post( $new_id ) );
		return rest_ensure_response( $formatted );
	}

	/**
	 * Search published posts and pages for URL picker suggestions.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response
	 */
	public static function rest_get_pages( $request ) {
		$search = sanitize_text_field( wp_unslash( urldecode( $request->get_param( 'search' ) ) ) );

		$post_types_to_search = array(
			'post',
			'page',
		);

		/**
		 * Filter the post types to search.
		 *
		 * @param array $post_types_to_search The post types to search.
		 */
		$post_types_to_search = apply_filters( 'alerts_dlx_rest_post_types_to_search', $post_types_to_search );

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
