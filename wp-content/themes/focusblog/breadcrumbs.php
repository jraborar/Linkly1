<?php $options = thrive_get_options_for_post();

if (
	! empty( $options['display_breadcrumbs'] ) &&
	! is_front_page() &&
	! is_search() &&
	! is_404()
) {
	?>
	<?php if ( ! thrive_check_top_focus_area() ) : ?>
		<div class="spr"></div>
	<?php endif; ?>

	<section class="brd">
		<div class="wrp bwr">
			<?php if ( _thrive_check_is_woocommerce_page() && function_exists( 'woocommerce_breadcrumb' ) ) : ?>
				<?php woocommerce_breadcrumb(); ?>
			<?php else : ?>
				<ul>
					<?php thrive_breadcrumbs(); ?>
				</ul>
			<?php endif; ?>
		</div>
	</section>
<?php }
