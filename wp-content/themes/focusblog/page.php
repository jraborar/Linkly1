<?php
$options = thrive_get_options_for_post( get_the_ID() );

$main_content_class = ( $options['sidebar_alignement'] == "right" || $options['sidebar_alignement'] == "left" ) ? $options['sidebar_alignement'] : "";

if ( $options['sidebar_alignement'] == "right" ) {
	$main_content_class = "left";
} elseif ( $options['sidebar_alignement'] == "left" ) {
	$main_content_class = "right";
} else {
	$main_content_class = "fullWidth";
}
$sidebar_is_active = _thrive_is_active_sidebar();

if ( ! $sidebar_is_active ) {
	$main_content_class = "fullWidth";
}

get_header();
?>
<?php if ( $options['sidebar_alignement'] == "left" && $sidebar_is_active ): ?>
	<?php get_sidebar(); ?>
<?php endif; ?>
<?php if ( $sidebar_is_active ): ?>
	<div class="bSeCont">
<?php endif; ?>
	<section class="bSe <?php echo $main_content_class; ?>">

		<?php if ( have_posts() ): ?>

			<?php while ( have_posts() ): ?>

				<?php the_post(); ?>

				<?php get_template_part( 'content-single', get_post_format() ); ?>

				<?php
				if ( thrive_check_bottom_focus_area() ):
					thrive_render_top_focus_area( "bottom" );
				endif;
				?>

				<?php if ( ! post_password_required() && $options['comments_on_pages'] != 0 ) : ?>
					<?php comments_template( '', true ); ?>
				<?php elseif ( ( ! comments_open() || post_password_required() ) && get_comments_number() > 0 ): ?>
					<?php comments_template( '/comments-disabled.php' ); ?>
				<?php endif; ?>

			<?php endwhile; ?>

		<?php else: ?>
			<div class="no_content_msg">
				<p><?php _e( "Sorry, but no results were found.", 'thrive' ); ?></p>
				<p class="ncm_comment"><?php _e( "YOU CAN RETURN", 'thrive' ); ?> <a
						href="<?php echo home_url( '/' ); ?>"><?php _e( "HOME", 'thrive' ) ?></a> <?php _e( "OR SEARCH FOR THE PAGE YOU WERE LOOKING FOR.", 'thrive' ) ?>
				</p>
				<form action="<?php echo home_url( '/' ); ?>" method="get">
					<input type="text" placeholder="<?php _e( "Search Here", 'thrive' ); ?>" class="search_field"
					       name="s"/>
					<input type="submit" value="<?php _e( "Search", 'thrive' ); ?>" class="submit_btn"/>
				</form>
			</div>
		<?php endif ?>

	</section>
<?php if ( $sidebar_is_active ): ?>
	</div>
<?php endif; ?>

<?php if ( $options['sidebar_alignement'] == "right" && $sidebar_is_active ): ?>
	<?php get_sidebar(); ?>
<?php endif; ?>
	<div class="clear"></div>
<?php get_footer(); ?>