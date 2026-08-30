<?php
/**
 * Render historical alerts without changing their frontend contract.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared frontend renderer for historical blocks and the existing shortcode.
 */
final class AlertRenderer {

	/** @var callable */
	private $register_scripts_callback;

	/** @var callable */
	private $print_close_button_svgs_callback;

	/**
	 * @param callable $register_scripts_callback            Existing asset registration callback.
	 * @param callable $print_close_button_svgs_callback     Existing close-icon callback.
	 */
	public function __construct( $register_scripts_callback, $print_close_button_svgs_callback ) {
		$this->register_scripts_callback        = $register_scripts_callback;
		$this->print_close_button_svgs_callback = $print_close_button_svgs_callback;
	}

	/**
	 * Output the historical frontend structure.
	 *
	 * @param array          $attributes Block editor attributes.
	 * @param string         $content    Current content.
	 * @param \WP_Block|null $block      Block instance.
	 * @return string
	 */
	public function render( array $attributes, string $content, $block = null ) {
		$normalized = AlertAttributes::normalize( $attributes, $block );

		$unique_id = $normalized['unique_id'];
		$alert_group = $normalized['alert_group'];
		$alert_type = $normalized['alert_type'];
		$align = $normalized['align'];
		$alert_title = $normalized['alert_title'];
		$alert_description = $normalized['alert_description'];
		$button_enabled = $normalized['button_enabled'];
		$maximum_width_unit = $normalized['maximum_width_unit'];
		$maximum_width = $normalized['maximum_width'];
		$icon = $normalized['icon'];
		$description_enabled = $normalized['description_enabled'];
		$title_enabled = $normalized['title_enabled'];
		$icon_enabled = $normalized['icon_enabled'];
		$base_font_size = $normalized['base_font_size'];
		$icon_vertical_alignment = $normalized['icon_vertical_alignment'];
		$variant = $normalized['variant'];
		$mode = $normalized['mode'];
		$button_text = $normalized['button_text'];
		$button_url = $normalized['button_url'];
		$button_target = $normalized['button_target'];
		$button_rel_no_follow = $normalized['button_rel_no_follow'];
		$button_rel_sponsored = $normalized['button_rel_sponsored'];
		$icon_appearance = $normalized['icon_appearance'];
		$color_primary = $normalized['color_primary'];
		$color_border = $normalized['color_border'];
		$color_accent = $normalized['color_accent'];
		$color_alt = $normalized['color_alt'];
		$color_alt_hover = $normalized['color_alt_hover'];
		$color_alt_text = $normalized['color_alt_text'];
		$color_alt_text_hover = $normalized['color_alt_text_hover'];
		$color_bold = $normalized['color_bold'];
		$color_light = $normalized['color_light'];
		$close_button_enabled = $normalized['close_button_enabled'];
		$close_button_expiration = $normalized['close_button_expiration'];
		$is_block_editorial_only = $normalized['is_block_editorial_only'];
		$icon_source = $normalized['icon_source'];
		$image_url = $normalized['image_url'];
		$image_id = $normalized['image_id'];

		// If block is editorial only, return early.
		if ( $is_block_editorial_only ) {
			return '';
		}

		// Check to see if expiration cookie is set.
		// Prefer uniqueId as cookie name; also accept legacy double-prefixed name.
		$cookie_name        = $unique_id;
		$legacy_cookie_name = 'alerts-dlx-' . $unique_id;
		if ( $close_button_enabled && ( isset( $_COOKIE[ $cookie_name ] ) || isset( $_COOKIE[ $legacy_cookie_name ] ) ) ) {
			return '';
		}

		ob_start();

		// Add base classes to figure element.
		$figure_classes = array(
			'alerts-dlx-alert',
			'alerts-dlx-' . $alert_group,
		);
		if ( $icon_enabled ) {
			$figure_classes[] = 'alerts-dlx-has-icon';
		}
		if ( $description_enabled ) {
			$figure_classes[] = 'alerts-dlx-has-description';
		}
		if ( $button_enabled ) {
			$figure_classes[] = 'alerts-dlx-has-button';
		}

		// Register scripts.
		call_user_func( $this->register_scripts_callback );

		// Print block styles.
		switch ( $alert_group ) {
			case 'bootstrap':
				add_action(
					'wp_footer',
					function () {
						wp_print_styles(
							array(
								'alerts-dlx-bootstrap-styles',
								'alerts-dlx-block-editor-styles-lato',
							)
						);
					}
				);
				break;
			case 'chakra':
				add_action(
					'wp_footer',
					function () {
						wp_print_styles(
							array(
								'alerts-dlx-chakra-styles',
								'alerts-dlx-block-editor-styles-lato',
							)
						);
					}
				);
				break;
			case 'material':
				add_action(
					'wp_footer',
					function () {
						wp_print_styles(
							array(
								'alerts-dlx-material-styles',
								'alerts-dlx-block-editor-styles-lato',
							)
						);
					}
				);
				break;
			case 'shoelace':
				add_action(
					'wp_footer',
					function () {
						wp_print_styles(
							array(
								'alerts-dlx-shoelace-styles',
								'alerts-dlx-block-editor-styles-lato',
							)
						);
					}
				);
				break;
		}

		// Close button footer and scripts.
		if ( $close_button_enabled ) {
			// Add footer SVGs for close button.
			add_action( 'wp_footer', $this->print_close_button_svgs_callback );

			// Add close button script.
			wp_enqueue_script(
				'alerts-dlx-close-button',
				Functions::get_plugin_url( 'dist/alerts-dlx-dismiss.js' ),
				array(),
				Functions::get_plugin_version(),
				true
			);
		}

		if ( 'custom' === $alert_type ) {
			ob_start();
			?>
			#<?php echo esc_html( $unique_id ); ?> {
				--alerts-dlx-<?php echo esc_html( $alert_group ); ?>-color-primary: <?php echo esc_html( $color_primary ); ?>;
				--alerts-dlx-<?php echo esc_html( $alert_group ); ?>-color-border: <?php echo esc_html( $color_border ); ?>;
				--alerts-dlx-<?php echo esc_html( $alert_group ); ?>-color-accent: <?php echo esc_html( $color_accent ); ?>;
				--alerts-dlx-<?php echo esc_html( $alert_group ); ?>-color-alt: <?php echo esc_html( $color_alt ); ?>;
				--alerts-dlx-<?php echo esc_html( $alert_group ); ?>-color-bold: <?php echo esc_html( $color_bold ); ?>;
				--alerts-dlx-<?php echo esc_html( $alert_group ); ?>-color-light: <?php echo esc_html( $color_light ); ?>;
				--alerts-dlx-<?php echo esc_html( $alert_group ); ?>-color-alt-hover: <?php echo esc_html( $color_alt_hover ); ?>;
				--alerts-dlx-<?php echo esc_html( $alert_group ); ?>-color-alt-text: <?php echo esc_html( $color_alt_text ); ?>;
				--alerts-dlx-<?php echo esc_html( $alert_group ); ?>-color-alt-text-hover: <?php echo esc_html( $color_alt_text_hover ); ?>;
			}
			<?php
			$custom_css = ob_get_clean();
			wp_register_style(
				'alerts-dlx-custom-css',
				false,
				array(),
				Functions::get_plugin_version()
			);
			wp_add_inline_style(
				'alerts-dlx-custom-css',
				$custom_css
			);
			if ( wp_style_is( 'alerts-dlx-custom-css', 'registered' ) ) {
				wp_enqueue_style( 'alerts-dlx-custom-css' );
			}

			add_action(
				'wp_footer',
				function () {
					if ( ! wp_style_is( 'alerts-dlx-custom-css', 'done' ) ) {
						wp_print_styles( 'alerts-dlx-custom-css' );
					}
				},
				100
			);
		}

		// Add base classes to container element.
		$container_classes = array(
			'alerts-dlx',
			'template-' . $alert_group,
			'is-style-' . $alert_type,
			'is-appearance-' . $variant,
			'icon-vertical-align-' . $icon_vertical_alignment,
			'align' . $align,
		);
		if ( 'dark' === $mode ) {
			$container_classes[] = 'is-dark-mode';
		}
		if ( 'rounded' === $icon_appearance ) {
			$container_classes[] = 'icon-appearance-rounded';
		}
		if ( Options::is_headline_force_size() ) {
			$container_classes[] = 'is-headline-size-forced';
		}
		?>
		<!-- begin AlertsDLX output -->
		<style>
			#<?php echo esc_html( $unique_id ); ?> {
				max-width: <?php echo esc_html( $maximum_width ); ?><?php echo esc_html( $maximum_width_unit ); ?>;
				--alerts-dlx-base-font-size: <?php echo esc_html( $base_font_size ); ?>px;
				--alerts-dlx-<?php echo esc_html( $alert_group ); ?>-base-size: <?php echo esc_html( $base_font_size ); ?>px;
			}
			#<?php echo esc_html( $unique_id ); ?> .alerts-dlx-icon-preview svg {
				max-width: 1.8em;
				max-height: 1.8em;
			}
		</style>
		<div
			class="<?php echo esc_html( implode( ' ', $container_classes ) ); ?>"
			data-expiration="<?php echo esc_attr( absint( $close_button_expiration ) ); ?>"
		>
			<figure
				role="alert"
				class="<?php echo esc_attr( implode( ' ', $figure_classes ) ); ?>"
				id="<?php echo esc_attr( $unique_id ); ?>"
			>
				<?php
				if ( $icon_enabled && 'icon' === $icon_source ) {
					?>
					<div class="alerts-dlx-icon alerts-dlx-icon-frontend" aria-hidden="true">
						<div class="alerts-dlx-icon-preview">
							<?php echo wp_kses( $icon, Functions::get_kses_allowed_html() ); ?>
						</div>
					</div>
					<?php
				}
				if ( $icon_enabled && 'image' === $icon_source && ! empty( $image_url ) ) {
					$image = '<img src="' . esc_url( $image_url ) . '" alt="' . esc_attr( __( 'Alert image', 'alerts-dlx' ) ) . '" />';
					if ( 0 !== $image_id ) {
						$maybe_image = wp_get_attachment_image( $image_id, 'full' );
						if ( ! empty( $maybe_image ) ) {
							$image = $maybe_image;
						}
					}
					?>
					<div class="alerts-dlx-icon alerts-dlx-icon-frontend" aria-hidden="true">
						<?php echo wp_kses_post( $image ); ?>
					</div>
					<?php
				}
				?>
				<section>
					<?php
					if ( $close_button_enabled ) {
						?>
						<div class="alerts-dlx-close" aria-label="<?php esc_attr_e( 'Close', 'alerts-dlx' ); ?>">
							<?php
							switch ( $alert_group ) {
								case 'bootstrap':
									?>
									<svg class="alerts-dlx-close-button-svg" aria-hidden="true" width="16" height="16">
										<use xlink:href="#alerts-dlx-bootstrap-close-button"></use>
									</svg>
									<?php
									break;
								case 'chakra':
									?>
									<svg class="alerts-dlx-close-button-svg" aria-hidden="true" width="16" height="16">
										<use xlink:href="#alerts-dlx-chakra-close-button"></use>
									</svg>
									<?php
									break;
								case 'shoelace':
									?>
									<svg class="alerts-dlx-close-button-svg" aria-hidden="true" width="16" height="16">
										<use xlink:href="#alerts-dlx-shoelace-close-button"></use>
									</svg>
									<?php
									break;
								case 'material':
									?>
									<svg class="alerts-dlx-close-button-svg" aria-hidden="true" width="16" height="16">
										<use xlink:href="#alerts-dlx-material-close-button"></use>
									</svg>
									<?php
									break;
							}
							?>
						</div>
						<?php
					}
					if ( $title_enabled ) {
						$title_tag = Options::get_headline_tag();
						printf(
							'<%1$s class="%2$s">%3$s</%1$s>',
							esc_html( $title_tag ),
							esc_attr( Options::get_headline_title_classes() ),
							esc_html( $alert_title )
						);
					}
					?>
					<div class="alerts-dlx-content-wrapper">
						<?php
						if ( $description_enabled ) {
							?>
							<div class="alerts-dlx-content">
								<?php
								if ( ! empty( $alert_description ) ) {
									echo wp_kses_post( apply_filters( 'alerts_dlx_the_content', $alert_description ) );
								} else {
									echo wp_kses_post( apply_filters( 'alerts_dlx_the_content', $content ) );
								}
								?>
							</div>
							<?php
						}
						?>
						<?php
						if ( $button_enabled && ! empty( $button_text ) && ! empty( $button_url ) ) {
							?>
							<div
								class="alerts-dlx-button-wrapper"
								style="display: inline-flex;"
							>
								<a
									class="alerts-dlx-button button-reset"
									href="<?php echo esc_url( $button_url ); ?>"
									<?php
									if ( $button_target ) {
										?>
										target="_blank"
										<?php
									}
									?>
									<?php
									$rel = array();
									if ( $button_rel_no_follow ) {
										$rel[] = 'nofollow';
									}
									if ( $button_rel_sponsored ) {
										$rel[] = 'sponsored';
									}
									if ( ! empty( $rel ) ) {
										?>
										rel="<?php echo esc_attr( implode( ' ', $rel ) ); ?>"
										<?php
									}
									?>
								><?php echo esc_html( $button_text ); ?></a>
							</div>
							<?php
						}
						?>
					</div>
				</section>
			</figure>
		</div>
		<!-- end AlertsDLX output -->
		<?php
		return ob_get_clean();
	}
}
