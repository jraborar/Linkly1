<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-apprentice
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

if ( ! isset( $courses ) ) {
	$page = get_query_var( 'page' );

	$arguments['topics'] = isset( $_REQUEST['filters'] ) ? json_decode( urldecode( $_REQUEST['filters'] ) ) : array();
	$arguments['page']   = isset( $page ) && $page > 1 ? $page : 1;
	if ( isset( $_REQUEST['tvas'] ) && ! empty( $_REQUEST['tvas'] ) ) {
		$arguments['s'] = $_REQUEST['tvas'];
	}
	$arguments['per_page']  = $settings['per_page'];
	$arguments['published'] = true;
	$courses                = tva_get_courses( $arguments );
}

if ( empty( $courses ) && isset( $_REQUEST['tvas'] ) && ! empty( $_REQUEST['tvas'] ) ) {
	include( TVA_Const::plugin_path( '/templates/err-no-data.php' ) );
}
?>

<?php if ( ! empty( $courses ) ) : ?>
	<?php foreach ( $courses as $course ) : ?>
		<?php $topic_arr = array(); ?>
		<div class="tva-course-card animated fadeIn">
			<div class="tva-course-card-header tva-course-footer-<?php echo $course->topic; ?>">
				<?php if ( ! empty( $course->cover_image ) ) : ?>
					<a href="<?php echo tva_get_course_url( $course ) ?>">
						<span style="background-image:url('<?php echo $course->cover_image ?>');" class="tva-course-card-image-container"></span>
					</a>
				<?php else : ?>
					<a href="<?php echo tva_get_course_url( $course ); ?>">
						<div class="tva-course-card-image-overlay tva-course-card-image-overlay-<?php echo $course->topic ?>"></div>
					</a>
				<?php endif; ?>
				<?php if ( $course->logged_in == 1 ) : ?>
					<?php $labels = tva_get_labels( array( 'ID' => $course->label ) ); ?>
					<span class="tva_members_only tva_members_only-<?php echo $course->label; ?>">
						<span class="tva-l-inner"><?php echo ( isset( $labels[0]['title'] ) && $labels[0]['title'] ) ? $labels[0]['title'] : $course->members_only; ?></span>
					</span>
				<?php endif; ?>
			</div>
			<div class="tva-course-card-content">
				<div class="tva-course-description">
					<h1>
						<a href="<?php echo tva_get_course_url( $course ); ?>">
							<?php echo $course->name; ?>
						</a>
					</h1>
					<p>
						<?php echo $course->description; ?>
					</p>
				</div>
				<div class="tva-course-details">
					<div class="tva-course-info">
						<div class="tva-topic-icon-holder">
							<?php foreach ( $topics as $topic ) : ?>
								<?php if ( $topic['ID'] == $course->topic ) : ?>
									<?php if ( isset( $topic['icon_type'] ) && ( 'svg_icon' === $topic['icon_type'] ) && isset( $topic['svg_icon'] ) ) : ?>
										<div class="tva-svg-front" id="tva-topic-<?php echo $topic['ID']; ?>">
											<?php echo $topic['svg_icon']; ?>
										</div>
									<?php else : ?>
										<?php $img_url = $topic['icon'] ? $topic['icon'] : TVA_Const::get_default_course_icon_url(); ?>
										<div class="tva-topic-icon" style="background-image:url('<?php echo $img_url; ?>')"></div>
									<?php endif; ?>
								<?php endif; ?>
							<?php endforeach; ?>
						</div>
						<div class="tva-course-lessons-info">
							<div class="tva-course-lessons-number">
								<?php if ( $course->published_lessons_count > 1 ) : ?>
									<p class="tva-course-card-count">
										<span>
											<?php echo $course->published_lessons_count; ?>
										</span>
										<span class="tva_course_lessons_plural">
											<?php echo $course->lessons_text; ?>
										</span>
									</p>
								<?php endif; ?>
							</div>
							<div class="tva-course-level">
									<span class="tva-course-card-level">
										<?php if ( $course->level != 0 ) : ?>
											<?php foreach ( $levels as $level ) : ?>
												<?php if ( $level['ID'] == $course->level ) : ?>
													<?php echo $level['name']; ?>
												<?php endif; ?>
											<?php endforeach; ?>
										<?php endif; ?>
									</span>
							</div>
						</div>
					</div>

					<div class="tva-course-progress">
						<div class="tva-progress-holder">
							<?php echo do_shortcode( '[tva_progress_bar course_id=' . $course->term_id . ']' ); ?>
						</div>
					</div>
				</div>
			</div>

			<div class="tva-course-card-footer tva-course-footer-<?php echo $course->topic; ?>">
				<div class="tva-course-card-footer-info">
					<div class="tva-course-type">
						<p class="tva-course-card-type-<?php echo $course->course_type_class ?>">
							<i></i>
							<span class="tva_course_type_<?php echo $course->course_type_class ?>"><?php echo $course->course_type; ?></span>
						</p>
					</div>
					<div class="tva-card-topic-action">
						<a class="tva_course_more_<?php echo $course->more_class; ?>"
						   href="<?php echo tva_get_course_url( $course ); ?>">
							<?php echo $course->more_text; ?>
						</a>
					</div>
				</div>
			</div>
		</div>

	<?php endforeach; ?>
<?php elseif ( TVA_Product::has_access() ) : ?>
	<div class="tva-empty-index">
		<p><?php echo __( 'You haven\'t set up any courses yet. <br /><a class="tva_main_color" href="' . get_admin_url() . '/admin.php?page=tva_dashboard#add_course' . '">Click here</a> to create your first course' ) ?></p>
	</div>
<?php endif; ?>

<?php include_once( TVA_Const::plugin_path( 'templates/pagination.php' ) ) ?>
