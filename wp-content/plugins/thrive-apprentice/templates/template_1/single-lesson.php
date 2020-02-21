<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-apprentice
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}
?>

<div class="tva-cm-redesigned-breadcrumbs">
	<?php tva_custom_breadcrumbs(); ?>
</div>

<div class="tva-page-container tva-frontend-template" id="tva-course-lesson">
	<div class="tva-container">
		<?php if ( have_posts() ) : ?>
			<?php while ( have_posts() ) : ?>
				<?php the_post(); ?>

				<?php $terms = wp_get_post_terms( $post->ID, TVA_Const::COURSE_TAXONOMY ); ?>
				<?php $course = tva_get_course_by_slug( $terms[0]->slug, array( 'published' => true ) ); ?>
				<?php $post_arr = array_values( wp_list_filter( $course->posts, array( 'ID' => $post->ID ) ) ); ?>
				<?php

				global $tva_lesson;

				$post   = isset( $post_arr[0] ) ? $post_arr[0] : $post;
				$lesson = new TVA_Lesson( $post );
				$post   = $tva_lesson;
				?>
				<?php $topic = tva_get_topic_by_id( $course->topic ); ?>
				<?php $allowed = tva_access_manager()->has_access(); ?>
				<?php
				/**
				 * Stupid exception => if the user preview an unpublished lesson we won't have it in the course
				 */
				if ( TVA_Product::has_access() && 'draft' === $post->post_status ) {
					$post = tva_get_post_data( $post );
				}

				?>
				<div class="tva-course-head tva-course-head-<?php echo $topic['ID']; ?> tva-course-type-<?php echo $course->course_type_class; ?>">
					<div class="tva-course-icon">
						<?php if ( isset( $topic['icon_type'] ) && ( 'svg_icon' === $topic['icon_type'] ) && isset( $topic['svg_icon'] ) ) : ?>
							<div class="tva-svg-front" id="tva-topic-<?php echo $topic['ID']; ?>">
								<?php echo $topic['svg_icon']; ?>
							</div>
						<?php else : ?>
							<?php $img_url = $topic['icon'] ? $topic['icon'] : TVA_Const::get_default_course_icon_url(); ?>
							<div class="tva-topic-icon" style="background-image:url('<?php echo $img_url; ?>')"></div>
						<?php endif; ?>

						<span class="tva-lesson-name"><?php echo $topic['title']; ?></span>
					</div>
					<div class="tva-uni-course-type">
						<i></i>
						<span><?php echo tva_is_course_guide( $course ) ? __( 'Guide', 'thrive-apprentice' ) : $course->course_type; ?></span>
					</div>
				</div>

				<?php $extra = $post->lesson_type === 'video' && isset( $post->post_media ) && is_array( $post->post_media ) && isset( $post->post_media['media_type'] ) && $post->post_media['media_type'] === 'custom' ? 'tva-custom-embed-video' : ''; ?>
				<?php $wistia = isset( $post->post_media ) && is_array( $post->post_media ) && isset( $post->post_media['media_type'] ) && $post->post_media['media_type'] === 'wistia' && $allowed ? 'tva-wistia-video' : ''; ?>
				<?php $soundcloud = isset( $post->post_media ) && is_array( $post->post_media ) && isset( $post->post_media['media_type'] ) && $post->post_media['media_type'] === 'soundcloud' ? 'tva-soundcloud-audio' : ''; ?>
				<?php $vimeo = isset( $post->post_media ) && is_array( $post->post_media ) && isset( $post->post_media['media_type'] ) && $post->post_media['media_type'] === 'vimeo' ? 'tva-vimeo-video' : ''; ?>
				<?php $audio_custom = $post->lesson_type === 'audio' && isset( $post->post_media ) && is_array( $post->post_media ) && isset( $post->post_media['media_type'] ) && $post->post_media['media_type'] === 'custom' ? 'tva-custom-audio' : ''; ?>

				<div class="tva-featured-image-container-single <?php echo $allowed ? $extra . ' ' . $wistia . '  ' . $soundcloud . ' ' . $vimeo . ' ' . $audio_custom : ''; ?>">
					<?php $media = $post->lesson_type !== 'text' && isset( $post->post_media['media_url'] ) && ! empty( $post->post_media['media_url'] ) && $allowed; ?>
					<?php if ( $media ) : ?>
						<?php echo $post->video_embed; ?>
						<?php if ( is_editor_page() ) : ?>
							<div class="tva-video_overlay"></div>
						<?php endif; ?>
					<?php elseif ( $post->cover_image && $allowed ) : ?>
						<div style="background-image:url('<?php echo $post->cover_image; ?>')" class="tva-image-as-bg tva-post-cover"></div>
					<?php elseif ( $course->cover_image ) : ?>
						<div style="background-image:url('<?php echo $course->cover_image; ?>')" class="tva-image-as-bg tva-post-cover"></div>
					<?php else : ?>
						<?php $topic = tva_get_topic_by_id( $course->topic ); ?>
						<div class="tva-feaured-image-colored" style="background-color: <?php echo $topic['color']; ?>"></div>
					<?php endif; ?>
				</div>
				<?php
				$full_width = '';

				if ( ( tva_is_course_guide( $course ) && ! is_active_sidebar( 'tva-lesson-sidebar' ) ) || ( isset( $_REQUEST['tve'] ) && ! is_active_sidebar( 'tva-lesson-sidebar' ) ) || ! is_active_sidebar( 'tva-lesson-sidebar' )
				) {
					$full_width = 'tva-course-guide-lesson';
				}

				?>

				<section class="bSe tva-page-content tva-course-lesson <?php echo $full_width; ?> ">
					<?php if ( ! $allowed ) : ?>
						<div class="tva-course-lesson-wrapper">
							<p class="tva-lesson-title">
								<?php echo the_title(); ?>
							</p>
							<div>
								<?php echo $course->message; ?>
							</div>

							<?php include( dirname( __FILE__ ) . '/errors.php' ); ?>

							<?php if ( $settings['loginform'] ) : ?>
								<?php tva_login_form( $course, $post ); ?>
							<?php endif; ?>
						</div>
					<?php else : ?>
						<div class="tva-course-lesson-wrapper">
							<?php show_welcome_msg( $course ); ?>
							<p class="tva-lesson-title">
								<?php echo the_title(); ?>
							</p>
							<p class="tva-mcl">
								<?php if ( isset( $post->location ) && is_array( $post->location ) ) : ?>
									<span class="item-name"><?php echo $settings['template']['course_lesson']; ?></span>
									<span class="item-value"><?php echo $lesson->get_number(); ?></span>

									<?php if ( isset( $post->location['chapters'] ) ) : ?>
										<span class="item-name"><?php echo $settings['template']['course_chapter']; ?></span>
										<span class="item-value"><?php echo $post->location['chapters']; ?></span>
									<?php endif; ?>

									<?php if ( isset( $post->location['modules'] ) ) : ?>
										<span class="item-name"><?php echo $settings['template']['course_module']; ?></span>
										<span class="item-value"><?php echo $post->location['modules']; ?></span>
									<?php endif; ?>
								<?php endif; ?>
							</p>
							<div class="tva-lesson-content">
								<?php the_content(); ?>
							</div>
						</div>
						<div style="clear: both"></div>
						<div class="tva-pagination-wrapper">
							<ul>
								<?php if ( true === $lesson->get_previous_lesson() instanceof WP_Post ) : ?>
									<li class="tva-p-prev">
										<a href="<?php echo get_permalink( $lesson->get_previous_lesson() ); ?>">
											<?php echo $settings['template']['prev_lesson']; ?>
											<?php tva_get_svg_icon( 'next-prev-lesson' ); ?>
										</a>
									</li>
								<?php endif; ?>
								<?php if ( true === $lesson->get_next_lesson() instanceof WP_Post ) : ?>
									<li class="tva-p-next">
										<a href="<?php echo get_permalink( $lesson->get_next_lesson() ); ?>">
											<?php echo $settings['template']['next_lesson']; ?>
											<?php tva_get_svg_icon( 'next-prev-lesson' ); ?>
										</a>
									</li>
								<?php else : ?>
									<li class="tva-p-last">
										<a href="<?php echo get_term_link( $course, TVA_Const::COURSE_TAXONOMY ); ?>">
											<?php echo $settings['template']['to_course_page']; ?>
											<?php tva_get_svg_icon( 'last-lesson' ); ?>
										</a>
									</li>
								<?php endif; ?>
							</ul>
						</div>
					<?php endif; ?>
					<?php if ( true === $allowed ) : ?>
						<?php comments_template( '', true ); ?>
					<?php endif; ?>
				</section>
			<?php endwhile; ?>
		<?php endif; ?>
		<?php if ( is_active_sidebar( 'tva-lesson-sidebar' ) ) : ?>
			<aside class="tva-sidebar-container">
				<div class="tva-sidebar-wrapper">
					<?php dynamic_sidebar( 'tva-lesson-sidebar' ); ?>
				</div>
			</aside>
		<?php endif; ?>
	</div>
</div>

<?php echo tva_add_apprentice_label(); ?>
