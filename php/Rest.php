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
