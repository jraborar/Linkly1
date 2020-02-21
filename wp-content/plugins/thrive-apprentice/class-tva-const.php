<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-apprentice
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

class TVA_Const {

	/**
	 * TVA translation domain
	 */
	const T = 'thrive-apprentice';

	/**
	 * TVP plugin version
	 */
	const PLUGIN_VERSION = '2.2.10.1';

	/**
	 * Database version for current TVA version
	 */
	const DB_VERSION = '1.0';

	/**
	 * Database version for current TVA version
	 */
	const DB_PREFIX = 'tva_';

	/**
	 * TVA Post type
	 */
	const LESSON_POST_TYPE = 'tva_lesson';

	/**
	 * TVA chapter post type
	 */
	const CHAPTER_POST_TYPE = 'tva_chapter';

	/**
	 * TVA module post type
	 */
	const MODULE_POST_TYPE = 'tva_module';

	/**
	 * Tva hidden post type
	 */
	const COURSE_POST_TYPE = 'tva_course_type';

	/**
	 * TVA Taxonomy
	 */
	const COURSE_TAXONOMY = 'tva_courses';

	/**
	 * TVA Post type
	 */
	const OLD_POST_TYPE = 'appr_lesson';

	/**
	 * TVA Taxonomy
	 */
	const OLD_POST_TAXONOMY = 'apprentice';

	/**
	 * TVA Default number of courses (we will be setting the number of courses to display per page from an option)
	 */
	const DEFAULT_COURSES_PER_PAGE = 12;

	/**
	 * TVA Rest api namespace
	 */
	const REST_NAMESPACE = 'tva/v1';

	/**
	 * TVA Card Normal State
	 */
	const NORMAL_STATE = 'normal';

	/**
	 * The about this course default Text
	 */
	const TVA_ABOUT = 'About this course';

	/**
	 * The Start course default Text
	 */
	const TVA_START = 'Start Course';

	/**
	 * The Start course default Text
	 */
	const TVA_VIEW_LESSON = 'View Lesson';

	/**
	 * The Shortcode progress default text
	 */
	const TVA_SHORTCODE_PROGRESS = 'Progress';

	/**
	 * The Shortcode progress default text
	 */
	const TVA_SHORTCODE_PROGRESS_FINISHED = 'Finished';

	/**
	 * The Shortcode Not started default text
	 */
	const TVA_SHORTCODE_PROGRESS_NOT_STARTED = 'Not started';

	/**
	 * The Shortcode about the author default text
	 */
	const TVA_SHORTCODE_AUTHOR = 'Teacher';

	/**
	 * The Shortcode course list default text
	 */
	const TVA_SHORTCODE_LESSONS = 'Course Structure';

	/**
	 * Course structure default text
	 */
	const TVA_COURSE_STRUCTURE = 'Course Structure';

	/**
	 * The Shortcode course list not viewed default text
	 */
	const TVA_SHORTCODE_LESSONS_NOT_VIEWED = 'Not Viewed';

	/**
	 * The Shortcode course list progress default text
	 */
	const TVA_SHORTCODE_LESSONS_PROGRESS = 'In Progress';

	/**
	 * The Shortcode course list completed default text
	 */
	const TVA_SHORTCODE_LESSONS_COMPLETED = 'Completed';

	/**
	 * The Shortcode course list not viewed default text
	 */
	const TVA_SHORTCODE_CLASS_NOT_VIEWED = 'tva_lesson_list_not_viewed';

	/**
	 * The Shortcode course list progress default text
	 */
	const TVA_SHORTCODE_CLASS_PROGRESS = 'tva_lesson_list_progress';

	/**
	 * The Shortcode course list completed default text
	 */
	const TVA_SHORTCODE_CLASS_COMPLETED = 'tva_lesson_list_completed';

	/**
	 * the frame flag for TA editor
	 */
	const TVA_FRAME_FLAG = 'tvaf';
	/**
	 * the frame flag for TCB editor
	 */
	const TCB_FRAME_FLAG = 'tcbf';

	const TCB_EDITOR = 'tve';

	/**
	 * The course type default texts
	 */
	const TVA_COURSE_TYPE_TEXT = 'Text';

	const TVA_COURSE_TYPE_GUIDE = 'Guide';

	const TVA_COURSE_TYPE_VIDEO = 'Video';

	const TVA_COURSE_TYPE_AUDIO = 'Audio';

	const TVA_COURSE_TYPE_VIDEO_TEXT_MIX = 'Video/Text';

	const TVA_COURSE_TYPE_VIDEO_AUDIO_MIX = 'Video/Audio';

	const TVA_COURSE_TYPE_BIG_MIX = 'Video/Audio/Text';

	const TVA_COURSE_TYPE_AUDIO_TEXT_MIX = 'Audio/Text';

	/**
	 * The course lesson default texts
	 */
	const TVA_COURSE_LESSONS_TEXT = 'Lessons';

	const TVA_COURSE_CHAPTERS_TEXT = 'Chapters';

	const TVA_COURSE_MODULES_TEXT = 'Modules';

	/**
	 * Singular translation
	 */
	const TVA_COURSE_LESSON_TEXT = 'Lesson';

	const TVA_COURSE_CHAPTER_TEXT = 'Chapter';

	const TVA_COURSE_MODULE_TEXT = 'Module';

	const TVA_NEXT_LESSON = 'Next Lesson';

	const TVA_PREV_LESSON = 'Previous Lesson';

	const TVA_TO_COURSE_PAGE = 'To Course Page';
	/**
	 * The course mode default texts
	 */
	const TVA_COURSE_DETAILS_TEXT = 'Details';

	const TVA_COURSE_READ_TEXT = 'Read';

	const TVA_SEARCH_TEXT = 'Search';

	/**
	 * Members only tag text
	 */
	const TVA_COURSE_MEMBERS_ONLY = 'Only for logged-in users';

	/**
	 * View Lesson
	 */
	const TVA_COURSE_VIEW_LESSON = 'View Lesson';

	/**
	 * Membership plugin tags
	 */
	const MEMBERMOUSE = 'membermouse';

	/**
	 * SendOwl tag
	 */
	const SENDOWL = 'sendowl';

	/**
	 * Default value for comment status
	 */
	const TVA_DEFAULT_COMMENT_STATUS = 'closed';

	/**
	 * Flag to detect if comment status for the course has been changed
	 */
	const TVA_IS_COURSE_COMMENT_STATUS_CHANGED = false;

	/**
	 * Wishlist plugin tag
	 */
	const WISHLIST = 'wishlist';

	/*
	 *  Wishlist protection flag
	 */
	const WISHLIST_PROTECTION_FLAG = 'Protection';

	/**
	 * Memberpress plugin tags
	 */
	const MEMBERPRESS = 'memberpress';

	/**
	 * MemberPress post type slug
	 */
	const MEMBERPRESS_MEMBERSHIP_POST_TYPE = 'memberpressproduct';

	/**
	 * Memberpress Rules post type
	 */
	const MEMBERPRESS_RULES_POST_TYPE = 'memberpressrule';

	/**
	 * Reference class to check if disqus plugin is active
	 */
	const DISQUS_REF_CLASS = 'DisqusWordPressAPI';

	/**
	 * Orders Table name
	 */
	const ORDERS_TABLE_NAME = 'orders';

	/**
	 * Order Items Table name
	 */
	const ORDER_ITEMS_TABLE_NAME = 'order_items';

	/**
	 * Transactions Table name
	 */
	const TRANSACTIONS_TABLE_NAME = 'transactions';

	/**
	 * IPN Log table name
	 */
	const IPN_TABLE_NAME = 'ipn_log';

	/**
	 * Manual gateway name
	 */
	const MANUAL_GATEWAY = 'Manual Order';

	/**
	 * Order statuses
	 */
	const STATUS_PENDING = 0;

	const STATUS_COMPLETED = 1;

	const STATUS_REFUND = 2;

	const STATUS_FAILED = 3;

	const STATUS_EMPTY = 4;

	/**
	 * Limit Sendowl customers per page
	 */
	const SENDOWL_CUSTOMERS_PER_PAGE = 10;

	/**
	 * Max number of customers allowed on a single import request
	 */
	const SENDOWL_CUSTOMER_PER_REQUEST = 100;

	/**
	 * Flag to use during plugin activation
	 *
	 * @var bool
	 */
	public static $tva_during_activation = false;

	/**
	 * Cookie name for sendowl
	 *
	 * @var bool
	 */
	const TVA_SENDOWL_COOKIE_NAME = 'tva_sendowl_cookie';

	/**
	 * Full path to the plugin folder (!includes a trailing slash if the $file argument is missing)
	 *
	 * @param string $file
	 *
	 * @return string
	 */
	public static function plugin_path( $file = '' ) {

		return plugin_dir_path( __FILE__ ) . ltrim( $file, '\\/' );
	}

	/**
	 * Full plugin url
	 *
	 * @param string $file if sent, it will return the full URL to the file
	 *
	 * @return string
	 */
	public static function plugin_url( $file = '' ) {
		return plugin_dir_url( __FILE__ ) . ltrim( $file, '\\/' );
	}

	/**
	 * Get the default icon for the topics
	 *
	 * @return string
	 */
	public static function get_default_course_icon_url() {
		$url = self::plugin_url( '/img/general.png' );
		$url = preg_replace( '#^https?://#', '//', $url );

		return $url;
	}

	/**
	 * Get the default topic
	 *
	 * @return array
	 */
	public static function default_topic() {
		return array(
			'ID'                  => 0,
			'title'               => 'General',
			'icon'                => '',
			'color'               => '#00c1ef',
			'icon_type'           => 'svg_icon',
			'overview_icon_color' => '#ffffff',
			'layout_icon_color'   => '#000000',
			'svg_icon'            => '<svg class="tva-icon" viewBox="0 0 576 512" data-id="icon-file-signature-light" data-name="">
<path d="M560.83 135.96l-24.79-24.79c-20.23-20.24-53-20.26-73.26 0L384 189.72v-57.75c0-12.7-5.1-25-14.1-33.99L286.02 14.1c-9-9-21.2-14.1-33.89-14.1H47.99C21.5.1 0 21.6 0 48.09v415.92C0 490.5 21.5 512 47.99 512h288.02c26.49 0 47.99-21.5 47.99-47.99v-80.54c6.29-4.68 12.62-9.35 18.18-14.95l158.64-159.3c9.79-9.78 15.17-22.79 15.17-36.63s-5.38-26.84-15.16-36.63zM256.03 32.59c2.8.7 5.3 2.1 7.4 4.2l83.88 83.88c2.1 2.1 3.5 4.6 4.2 7.4h-95.48V32.59zm95.98 431.42c0 8.8-7.2 16-16 16H47.99c-8.8 0-16-7.2-16-16V48.09c0-8.8 7.2-16.09 16-16.09h176.04v104.07c0 13.3 10.7 23.93 24 23.93h103.98v61.53l-48.51 48.24c-30.14 29.96-47.42 71.51-47.47 114-3.93-.29-7.47-2.42-9.36-6.27-11.97-23.86-46.25-30.34-66-14.17l-13.88-41.62c-3.28-9.81-12.44-16.41-22.78-16.41s-19.5 6.59-22.78 16.41L103 376.36c-1.5 4.58-5.78 7.64-10.59 7.64H80c-8.84 0-16 7.16-16 16s7.16 16 16 16h12.41c18.62 0 35.09-11.88 40.97-29.53L144 354.58l16.81 50.48c4.54 13.51 23.14 14.83 29.5 2.08l7.66-15.33c4.01-8.07 15.8-8.59 20.22.34C225.44 406.61 239.9 415.7 256 416h32c22.05-.01 43.95-4.9 64.01-13.6v61.61zm27.48-118.05A129.012 129.012 0 0 1 288 384v-.03c0-34.35 13.7-67.29 38.06-91.51l120.55-119.87 52.8 52.8-119.92 120.57zM538.2 186.6l-21.19 21.19-52.8-52.8 21.2-21.19c7.73-7.73 20.27-7.74 28.01 0l24.79 24.79c7.72 7.73 7.72 20.27-.01 28.01z"></path>
</svg>',
		);
	}

	/**
	 * @return array
	 */
	public static function default_label() {
		return array(
			'ID'    => 0,
			'title' => 'ONLY FOR LOGGED-IN USERS',
			'color' => '#58a545',
		);
	}

	/**
	 * Check if it's the checkout page
	 *
	 * @param string $id
	 *
	 * @return bool
	 */
	public static function tva_is_checkout_page( $id = '' ) {
		if ( empty( $id ) ) {
			$post = get_queried_object();

			if ( ! $post ) {
				global $post;
				if ( isset( $post ) && ! empty( $post ) ) {
					$post = $post;
				}
			}
		} else {
			$post     = new stdClass();
			$post->ID = $id;
		}

		if ( function_exists( 'thrive_ab' ) && thrive_ab()->maybe_variation( $post ) ) {
			return self::tva_is_checkout_page( $post->post_parent );
		}

		$is_lp_builder_checkout_template = ( ( $post instanceof WP_Post ) && 'checkout' === $post->apprentice_template_type );

		return TVA_Sendowl_Settings::instance()->is_checkout_page( $post ) || $is_lp_builder_checkout_template;
	}

	/**
	 * Check if it's the thankyou page
	 *
	 * @param string $id
	 *
	 * @return bool
	 */
	public static function tva_is_thankyou_page( $id = '' ) {
		if ( empty( $id ) ) {
			$obj = get_queried_object();

			if ( ! $obj ) {
				global $post;
				if ( isset( $post ) && ! empty( $post ) ) {
					$obj = $post;
				}
			}
		} else {
			$obj     = new stdClass();
			$obj->ID = $id;
		}

		if ( function_exists( 'thrive_ab' ) && thrive_ab()->maybe_variation( $obj ) ) {
			return self::tva_is_thankyou_page( $obj->post_parent );
		}

		if ( isset( $obj->ID ) && TVA_Sendowl_Settings::instance()->is_thankyou_page( $obj->ID ) ) {
			return true;
		}

		if ( $obj instanceof WP_Post && 'thankyou' === $obj->apprentice_template_type ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if post is protected
	 *
	 * @param $post
	 * @param $excluded
	 *
	 * @return bool
	 */
	public static function handle_post_protection( $post, $excluded ) {
		$allowed   = true;
		$logged_in = (int) get_term_meta( $post->course_id, 'tva_logged_in', true );

		if ( 1 !== $logged_in ) {
			return $allowed;
		}

		if ( TVA_Product::has_access() ) {
			return $allowed;
		}

		$user_logged_in = is_user_logged_in();
		$memberships    = tva_has_membership_plugin();

		/**
		 * Handle membership platforms setup
		 */
		if ( $user_logged_in && ! empty( $memberships ) ) {
			global $tva_db;

			$available   = array();
			$allowed     = false;
			$memberships = wp_list_pluck( $memberships, 'tag' );

			$term_memberships = get_term_meta( $post->course_id, 'tva_membership_ids', true );
			$term_bundles     = get_term_meta( $post->course_id, 'tva_bundle_ids', true );

			foreach ( $term_memberships as $key => $membership ) {
				if ( in_array( $key, $memberships ) && ( ! empty( $membership ) ) ) {
					$available[] = $key;
				}
			}

			foreach ( $term_bundles as $key => $bundle ) {
				if ( in_array( $key, $memberships ) && ( ! empty( $bundle ) ) ) {
					$available[] = $key;
				}
			}

			$available = array_unique( $available );

			foreach ( $available as $membership ) {
				$fn = 'tva_handle_' . $membership . '_protection';

				if ( method_exists( $tva_db, $fn ) ) {
					$allowed = $tva_db->$fn( $post, $excluded );

					if ( true === $allowed ) {
						break;
					}
				}
			}

			/**
			 * Set your own rules in order to see if the user is allowed in the item (module/chapter/lesson)
			 */
			$allowed = apply_filters( 'tva_is_post_protected', $allowed, $post, $available, $excluded );

			return $allowed;
		}

		/**
		 * Grant access by role
		 */
		if ( ! tva_is_inner_frame() ) {
			if ( $user_logged_in ) {
				$user_id   = get_current_user_id();
				$user_meta = get_userdata( $user_id );
				$roles     = get_term_meta( $post->course_id, 'tva_roles', true );

				if ( $post->course_order < $excluded ) {
					return true;
				}

				foreach ( $user_meta->roles as $role ) {
					$allowed = ( is_array( $roles ) && array_key_exists( $role, $roles ) );

					if ( true === $allowed ) {
						return $allowed;
					}
				}
			} elseif ( TVA_Const::LESSON_POST_TYPE === $post->post_type ) {
				$allowed = $post->course_order < $excluded;
			}

			if ( TVA_Const::MODULE_POST_TYPE === $post->post_type ) {
				if ( count( $post->lessons ) > 0 ) {
					return (int) $post->lessons[0]->course_order < (int) $excluded;
				}

				$lessons = $post->chapters[0]->lessons;
				$allowed = $lessons[0]->course_order < (int) $excluded;
			}
		}

		return $allowed;
	}

	/**
	 * Check if current page is a TA checkout|thankyou
	 *
	 * @param $id WP_Post|int|null
	 *
	 * @return null|string
	 */
	public static function get_page_type( $id = null ) {

		if ( $id instanceof WP_Post ) {
			$id = $id->ID;
		}

		if ( $id === null ) {

			global $post;

			$id = $post instanceof WP_Post ? $post->ID : null;
		}

		$id = intval( $id );

		$is_checkout = TVA_Sendowl_Settings::instance()->is_checkout_page( $id );
		$is_thankyou = TVA_Const::tva_is_thankyou_page( $id ) || TVA_Sendowl_Settings::instance()->is_thankyou_multiple_page( $id );
		$is_thankyou = ! $is_checkout && $is_thankyou;

		$type = $is_checkout || $is_thankyou
			? $is_checkout ? 'checkout' : 'thankyou'
			: null;

		return $type;
	}
}
