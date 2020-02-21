<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-university
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

/**
 * Init
 */
function tva_admin_init() {

	if ( ! tva_check_tcb_version() ) {
		add_action( 'admin_notices', 'tva_admin_notice_wrong_tcb_version' );
	}

	if ( (int) get_option( 'tva_order_updated', 0 ) === 0 || isset( $_REQUEST['tva_reset_order'] ) ) {
		tva_update_courses_order();
	}
}

/**
 * The TCB version is not compatible with the current TVA version
 */
function tva_admin_notice_wrong_tcb_version() {
	$screen = get_current_screen();

	if ( $screen && $screen->base === 'admin_page_tva_dashboard' ) {
		return;
	}

	$html = '<div class="error"><p>%s</p></div>';
	$text = sprintf( __( 'Current version of Thrive Apprentice is not compatible with the current version of Thrive Architect. Please update both plugins to the latest versions.', TVA_Const::T ) );
	$text .= ' <a href="' . network_admin_url( 'plugins.php' ) . '">' . __( 'Manage plugins', TVA_Const::T ) . '</a>';

	echo sprintf( $html, $text );
}

/**
 * Add the admin menu link for the dashboard page
 *
 * @param array $menus
 *
 * @return array
 */
function tva_admin_menu( $menus = array() ) {
	$menus['tva'] = array(
		'parent_slug' => 'tve_dash_section',
		'page_title'  => __( 'Thrive Apprentice', TVA_Const::T ),
		'menu_title'  => __( 'Thrive Apprentice', TVA_Const::T ),
		'capability'  => TVA_Product::cap(),
		'menu_slug'   => 'tva_dashboard',
		'function'    => 'tva_admin_dashboard',
	);


	return $menus;
}

/**
 * Output Thrive Apprentice dashboard - the main plugin admin page
 */
function tva_admin_dashboard() {
	global $wp_version;


	if ( floatval( $wp_version ) < 4.6 ) {
		return tva_wp_version_warning();
	}

	if ( ! tva_license_activated() ) {
		return tva_license_warning();
	}

	if ( ! tva_check_tcb_version() ) {
		return tva_tcb_version_warning();
	}

	include dirname( __FILE__ ) . '/views/dashboard.php';
}

/**
 * Enqueue admin scripts
 *
 * @param $hook
 */
function tva_admin_enqueue_scripts( $hook ) {
	$accepted_hooks = apply_filters( 'tve_ult_accepted_admin_pages', array(
		'thrive-dashboard_page_tva_dashboard',
	) );

	if ( ! in_array( $hook, $accepted_hooks ) ) {
		return;
	}

	/* first, the license check */
	if ( ! tva_license_activated() ) {
		return;
	}

	/* second, the minimum required TCB version */
	if ( ! tva_check_tcb_version() ) {
		return;
	}

	/**
	 * enqueue dash scripts
	 */
	tve_dash_enqueue();

	/**
	 * specific admin styles
	 */
	tva_enqueue_style( 'tva-admin-style', TVA_Const::plugin_url( '/admin/css/styles.css' ) );
	tva_enqueue_style( 'tva-spectrum-style', TVA_Const::plugin_url( '/js/spectrum/spectrum.css' ) );
	tva_enqueue_style( 'signup-style-css', TVA_Const::plugin_url( '/admin/css/logger.css' ) );

	wp_enqueue_media();

	/**
	 * Enqueue jquery backbone & thickbox
	 */
	wp_enqueue_script( 'jquery' );
	wp_enqueue_script( 'backbone' );
	wp_enqueue_script( 'wp-color-picker' );
	wp_enqueue_script( 'jquery-ui-sortable', false, array( 'jquery' ) );
	wp_enqueue_script( 'jquery-ui-droppable', false, array( 'jquery' ) );
	wp_enqueue_script( 'tva-wistia-enqueue', '//fast.wistia.com/assets/external/E-v1.js', array(), false, false );
	wp_enqueue_script( 'tva-wistia-popover', '//fast.wistia.com/assets/external/popover-v1.js', array(), '', true );

	if ( class_exists( 'TCB_Icon_Manager' ) ) {
		TCB_Icon_Manager::enqueue_icon_pack();
	}

	tva_enqueue_script( 'tva-admin-js', TVA_Const::plugin_url( 'admin/js/dist/tva-admin.min.js' ), array(
		'jquery',
		'backbone',
		'wp-color-picker',
	), false, true );
	/**
	 * jQuery autocomplete - needed for Display Settings search
	 */
	wp_enqueue_script( 'jquery-ui-autocomplete' );


	tva_enqueue_script( 'tva-spectrum-script', TVA_Const::plugin_url( '/js/spectrum/spectrum.js' ), array( 'jquery' ), false, false );

	wp_localize_script( 'tva-admin-js', 'ThriveApp', apply_filters( 'tva_admin_localize', tva_get_localization() ) );


	/**
	 * include backbone script templates at the bottom of the page
	 */
	add_action( 'admin_print_footer_scripts', 'tva_backbone_templates' );

}

/**
 * show a box with a warning message notifying the user to update the TCB plugin to the latest version
 * this will be shown only when the TCB version is lower than a minimum required version
 */
function tva_tcb_version_warning() {
	return include TVA_Const::plugin_path( 'admin/views/tcb_version_incompatible.php' );
}

/**
 * @return mixed
 */
function tva_wp_version_warning() {
	return include TVA_Const::plugin_path( 'admin/views/wp_version_incompatible.php' );
}


/**
 * Data to be localized
 *
 * @return array
 */
function tva_get_localization() {
	$current_user = wp_get_current_user();
	$directories  = glob( TVA_Const::plugin_path( '/templates' ) . '/*', GLOB_ONLYDIR );

	$templates = array();
	foreach ( $directories as $directory ) {
		$settings = array();
		include( $directory . '/data.php' );
		$archive      = file_get_contents( $directory . '/archive.php' );
		$lesson_list  = get_option( 'widget_tva_lesson_list_widget' );
		$progress_bar = get_option( 'widget_tva_progress_bar_widget' );
		$author       = get_option( 'widget_tva_author_widget' );

		/**
		 * check for the shortcodes in the archive page so we can do the options correctly
		 */
		if ( count( $progress_bar ) >= 2 ) {
			$settings['template']['progress_bar'] = TVA_Const::TVA_SHORTCODE_PROGRESS;
		}

		if ( count( $author ) >= 2 ) {
			$settings['template']['author'] = TVA_Const::TVA_SHORTCODE_AUTHOR;
		}

		if ( count( $lesson_list ) >= 2 ) {
			$settings['template']['lesson_list']            = TVA_Const::TVA_SHORTCODE_LESSONS;
			$settings['template']['lesson_list_progress']   = TVA_Const::TVA_SHORTCODE_LESSONS_PROGRESS;
			$settings['template']['lesson_list_not_viewed'] = TVA_Const::TVA_SHORTCODE_LESSONS_NOT_VIEWED;
			$settings['template']['lesson_list_completed']  = TVA_Const::TVA_SHORTCODE_LESSONS_COMPLETED;
		}

		$settings['template']['page_headline_text']          = TVA_Const::TVA_ABOUT;
		$settings['template']['start_course']                = TVA_Const::TVA_START;
		$settings['template']['course_type_guide']           = TVA_Const::TVA_COURSE_TYPE_GUIDE;
		$settings['template']['course_type_video']           = TVA_Const::TVA_COURSE_TYPE_VIDEO;
		$settings['template']['course_type_audio']           = TVA_Const::TVA_COURSE_TYPE_AUDIO;
		$settings['template']['course_type_text']            = TVA_Const::TVA_COURSE_TYPE_TEXT;
		$settings['template']['course_type_video_text_mix']  = TVA_Const::TVA_COURSE_TYPE_VIDEO_TEXT_MIX;
		$settings['template']['course_type_audio_text_mix']  = TVA_Const::TVA_COURSE_TYPE_AUDIO_TEXT_MIX;
		$settings['template']['course_type_video_audio_mix'] = TVA_Const::TVA_COURSE_TYPE_VIDEO_AUDIO_MIX;
		$settings['template']['course_type_big_mix']         = TVA_Const::TVA_COURSE_TYPE_BIG_MIX;
		$settings['template']['course_lessons']              = TVA_Const::TVA_COURSE_LESSONS_TEXT;
		$settings['template']['course_more_details']         = TVA_Const::TVA_COURSE_DETAILS_TEXT;
		$settings['template']['course_more_read']            = TVA_Const::TVA_COURSE_READ_TEXT;
		$settings['template']['members_only']                = TVA_Const::TVA_COURSE_MEMBERS_ONLY;
		$settings['template']['view_lesson']                 = TVA_Const::TVA_COURSE_MEMBERS_ONLY;
		$settings['template']['course_structure']            = TVA_Const::TVA_COURSE_STRUCTURE;
		$settings['template']['collapse_modules']            = false;
		$settings['template']['collapse_chapters']           = false;

		$templates[] = $settings['template'];

	}

	$user_settings = TVA_Settings::instance();
	$settings      = $user_settings->get_settings();
	$uniq_id       = 'tva_uid_' . uniqid();

	update_option( 'tva_request_id', $uniq_id );

	return array(
		'data'        => array(
			'courses'            => tva_get_courses(),
			'topics'             => tva_get_topics(),
			'labels'             => tva_get_labels(),
			'settings'           => $settings,
			'available_settings' => tva_get_available_course_settings(),
			'fonts'              => tve_dash_font_manager_get_safe_fonts(),
			'levels'             => tva_get_levels(),
			'templates'          => $templates,
			'defaults'           => array(
				'icon'   => TVA_Const::get_default_course_icon_url(),
				'roles'  => tva_get_roles(),
				'author' => array(
					'ID'         => $current_user->data->ID,
					'user_login' => $current_user->data->user_login,
					'url'        => get_avatar_url( $current_user->data->ID ),
				),
			),
			'log_types'          => TVA_Logger::get_log_types(),
			'logs'               => TVA_Logger::get_logs(),
			'stack_types'        => TVA_Logger::get_stack_types(),
			'stacks'             => TVA_Logger::get_stacks(),
			'logs_settings'      => array(
				'limit' => 20,
			),
		),
		'wizard'      => get_option( 'tva_wizard_completed', false ),
		't'           => require dirname( __FILE__ ) . '/../i18n.php',
		'dash_url'    => admin_url( 'admin.php?page=tve_dash_section' ),
		'plugin_url'  => TVA_Const::plugin_url(),
		'nonce'       => wp_create_nonce( 'wp_rest' ),
		'request_id'  => $uniq_id,
		'frame_flag'  => TVA_Const::TVA_FRAME_FLAG,
		'frame_nonce' => wp_create_nonce( TVA_Const::TVA_FRAME_FLAG ),
		'ajax_url'    => admin_url( 'admin-ajax.php' ),
		'routes'      => array(
			'topics'   => tva_get_route_url( 'topics' ),
			'levels'   => tva_get_route_url( 'levels' ),
			'courses'  => tva_get_route_url( 'courses' ),
			'lessons'  => tva_get_route_url( 'lessons' ),
			'settings' => tva_get_route_url( 'settings' ),
			'labels'   => tva_get_route_url( 'labels' ),
			'chapters' => tva_get_route_url( 'chapters' ),
			'modules'  => tva_get_route_url( 'modules' ),
			'stacks'   => tva_get_route_url( 'stacks' ),
			'logs'     => tva_get_route_url( 'logs' ),
			'users'    => tva_get_route_url( 'user' ),
			'sendowl'  => tva_get_route_url( 'so_settings' ),
		),
		'TVA_DEBUG'   => defined( 'TVA_DEBUG' ) && TVA_DEBUG,
	);
}

/**
 * Map which options are available for editing
 *
 * @return array
 */
function tva_get_available_course_settings() {
	$settings = array();

	$courses = tva_get_courses( array( 'published' => true ) );
	if ( ! empty( $courses ) ) {

		$progress = tva_get_user_progress( $courses[0] );

		$progress < 100 ? $settings['progress'] = 1 : $settings['finished'] = 1;

		$lessons_learned = tva_get_learned_lessons();

		foreach ( $courses[0]->lessons as $lesson ) {
			if ( array_key_exists( $courses[0]->term_id, $lessons_learned ) && array_key_exists( $lesson->ID, $lessons_learned[ $courses[0]->term_id ] ) ) {
				$lessons_learned[ $courses[0]->term_id ][ $lesson->ID ] == 1 ? $settings['completed'] = 1 : $settings['lesson_progress'] = 1;
			} else {
				$settings['not_viewed'] = 1;
			}
		}

		foreach ( $courses as $course ) {

			$settings[ $course->course_type_name ] = 1;

			if ( $course->logged_in === 1 ) {
				$settings['members_only'] = 1;
			}
			$count = count( $course->lessons );
			if ( $count === 1 ) {
				$settings['read']        = 1;
				$settings['lesson_text'] = 1;
			} elseif ( $count > 1 ) {
				$settings['details']      = 1;
				$settings['lessons_text'] = 1;
			}
		}
	}

	return $settings;
}

/**
 * Output each Apprentice backbone template
 * called on the 'admin_print_footer_scripts' hook
 *
 */
function tva_backbone_templates() {
	$templates = tve_dash_get_backbone_templates( TVA_Const::plugin_path( 'admin/views/template' ), 'template' );

	tve_dash_output_backbone_templates( $templates );
}

/**
 * Display a label/status for current TA pages
 *
 * @param $states array
 * @param $post   WP_Post
 *
 * @return mixed
 */
function tva_display_post_states( $states, $post ) {

	if ( TVA_Sendowl_Settings::instance()->is_checkout_page( $post ) ) {
		$states['tva_checkout'] = __( 'Thrive Apprentice SendOwl Checkout', 'thrive-apprentice' );
	}

	if ( TVA_Sendowl_Settings::instance()->is_thankyou_page( $post->ID ) ) {
		$states['tva_thank_you'] = __( 'Thrive Apprentice SendOwl Thank You', 'thrive-apprentice' );
	}

	if ( TVA_Settings::instance()->is_index_page( $post ) ) {
		$states['tva_index'] = __( 'Thrive Apprentice Courses', 'thrive-apprentice' );
	}

	if ( TVA_Settings::instance()->is_register_page( $post ) ) {
		$states['tva_register'] = __( 'Thrive Apprentice Register', 'thrive-apprentice' );
	}

	return $states;
}

/**
 * Establishes a new order options for modules/chapters/lessons
 */
function tva_update_courses_order() {

	$courses = TVA_Manager::get_courses();

	/** @var WP_Term $course */
	foreach ( $courses as $course ) {

		$modules = TVA_Manager::get_course_modules( $course );

		/**
		 * @var int     $module_key
		 * @var WP_Post $module
		 */
		foreach ( $modules as $module_key => $module ) {

			$module_lessons = TVA_Manager::get_module_lessons( $module );

			$module_chapters = TVA_Manager::get_module_chapters( $module );

			/**
			 * @var int     $key
			 * @var WP_Post $lesson
			 */
			foreach ( $module_lessons as $lesson_key => $lesson ) {
				$order = $module_key . $lesson_key;
				update_post_meta( $lesson->ID, 'tva_lesson_order', $order );
			}

			/**
			 * @var int     $chapter_key
			 * @var WP_Post $chapter
			 */
			foreach ( $module_chapters as $chapter_key => $chapter ) {
				$order = $module_key . $chapter_key;
				update_post_meta( $chapter->ID, 'tva_chapter_order', $order );

				$chapter_lessons = TVA_Manager::get_chapter_lessons( $chapter );

				/**
				 * @var int     $lesson_key
				 * @var WP_Post $lesson
				 */
				foreach ( $chapter_lessons as $lesson_key => $lesson ) {
					$order = $module_key . $chapter_key . $lesson_key;
					update_post_meta( $lesson->ID, 'tva_lesson_order', $order );
				}
			}
		}

		$course_chapters = TVA_Manager::get_course_chapters( $course );

		/**
		 * @var int     $chapter_key
		 * @var WP_Post $chapter
		 */
		foreach ( $course_chapters as $chapter_key => $chapter ) {

			$order = $chapter_key;
			update_post_meta( $chapter->ID, 'tva_chapter_order', $order );

			$chapter_lessons = TVA_Manager::get_chapter_lessons( $chapter );
			/**
			 * @var int     $lesson_key
			 * @var WP_Post $lesson
			 */
			foreach ( $chapter_lessons as $lesson_key => $lesson ) {
				$order = $chapter_key . $lesson_key;
				update_post_meta( $lesson->ID, 'tva_lesson_order', $order );
			}
		}
	}
	update_option( 'tva_order_updated', 1 );
}
