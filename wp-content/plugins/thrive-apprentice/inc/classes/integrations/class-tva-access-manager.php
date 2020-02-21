<?php
/**
 * Created by PhpStorm.
 * User: dan bilauca
 * Date: 22-Apr-19
 * Time: 01:46 PM
 */

/**
 * Class TVA_Access_Manager
 * - for content
 */
class TVA_Access_Manager {

	/**
	 * @var WP_Post
	 */
	private $_post;

	/**
	 * @var TVA_Course
	 */
	private $_course;

	/**
	 * @var WP_Post
	 */
	private $_module;

	/**
	 * @var WP_Post
	 */
	private $_lesson;

	/**
	 * @var WP_User
	 */
	private $_user;

	/**
	 * @var null|bool
	 */
	private $_access_allowed = null;

	/**
	 * Logged in WP_User
	 *
	 * @var TVA_User
	 */
	private $_tva_user;

	/**
	 * @var TVA_Integrations_Manager
	 */
	protected $_integration_manager;

	/**
	 * TVA_Access_Manager constructor.
	 *
	 * @param TVA_Integrations_Manager $integration_manager
	 *
	 * @throws Exception
	 */
	public function __construct( $integration_manager ) {

		if ( false === $integration_manager instanceof TVA_Integrations_Manager ) {
			throw new Exception( 'Invalid integration manager provided' );
		}

		$this->_integration_manager = $integration_manager;

		$this->hooks();
	}

	public function hooks() {

		/**
		 * Initialize this at this hook cos now we have the global $post
		 */
		add_action( 'wp', array( $this, 'init' ) );

		/**
		 * Now it's time to decide if we render the content
		 * or let other plugins to do their logic: redirect
		 */
		add_action( 'template_redirect', array( $this, 'template_redirect' ) );
	}

	/**
	 * Tries to read the current post from which is determined the current course
	 */
	public function init() {

		global $post;

		if ( $post instanceof WP_Post ) {
			$this->_post = $post;
		}
	}

	/**
	 * Based on current request/post tries to get the course
	 * - lazy loaded
	 *
	 * @return TVA_Course|null
	 */
	public function get_course() {

		if ( false === $this->_course instanceof TVA_Course ) {
			$this->_init_course();
		}

		return $this->_course;
	}

	/**
	 * Reads the WP_Term for the current _post
	 * and initialize TVA_Course
	 */
	private function _init_course() {

		if ( false === $this->_post instanceof WP_Post ) {
			return;
		}

		$terms = wp_get_post_terms( $this->_post->ID, TVA_Const::COURSE_TAXONOMY );

		if ( is_array( $terms ) && isset( $terms[0] ) && $terms[0] instanceof WP_Term ) {

			if ( true === $this->_course instanceof TVA_Course && $terms[0]->term_id === $this->_course->term_id ) {
				return;
			}

			$this->_course = new TVA_Course( $terms[0] );
		}
	}

	public function get_logged_in_user() {

		if ( false === $this->_user instanceof WP_User ) {
			$this->_init_user();
		}

		return $this->_user;
	}

	/**
	 * If a user is logged in gets its date and set it for later use
	 */
	private function _init_user() {

		$user_id = get_current_user_id();

		if ( $user_id ) {
			$this->_user = get_userdata( $user_id );
		}
	}

	public function template_redirect() {

		/**
		 * if is course page let the logic continue
		 */
		if ( true === is_tax( TVA_Const::COURSE_TAXONOMY ) ) {
			return;
		}

		/**
		 * if no course could be determined then let the logic flow
		 */
		if ( false === $this->get_course() instanceof TVA_Course ) {
			return;
		}

		/** @var TVA_Integration $integration */
		if ( false === $this->has_access() ) {
			$integration = $this->_integration_manager->get_fallback_integration( $this->get_course() );
			$integration instanceof TVA_Integration ? $integration->trigger_no_access() : null;
		}
	}

	/**
	 * Public method to decide if logged in user has access for current request
	 *
	 * @return null|bool
	 */
	public function has_access() {

		if ( $this->_access_allowed === null ) {
			$this->_init_access();
		}

		return $this->_access_allowed;
	}

	/**
	 * Sets and returns the access property
	 *
	 * @return bool
	 */
	private function _init_access() {

		/**
		 * check if course has Excluded option set
		 * - restrict access switch is OFF
		 */
		$allow = $this->get_course() instanceof TVA_Course && $this->get_course()->get_logged_in() === 0;

		/**
		 * check if current lesson is excluded
		 */
		if ( false === $allow ) {
			$excluded = $this->get_course() instanceof TVA_Course ? $this->get_course()->get_excluded() : 0;
			$allow    = $excluded > 0 ? $this->_is_excluded( $excluded ) : $allow;
		}

		/**
		 * checks if user is admin
		 */
		$allow = $allow || current_user_can( 'manage_options' );

		/**
		 * checks all rules
		 */
		$allow = $allow || $this->check_rules();

		$this->_access_allowed = $allow;

		return $this->_access_allowed;
	}

	/**
	 * Checks if the lesson is part of the first $excluded lessons
	 * - a course has a property called excluded which allow user to see some excluded lessons from a protected course
	 * - if a lesson is excluded then it's parent module is excluded also: can be accessed
	 *
	 * @param $excluded int
	 *
	 * @return bool
	 */
	private function _is_excluded( $excluded = 0 ) {

		$excluded = (int) $excluded;

		if ( ! $excluded ) {
			return false;
		}

		$lessons = $this->get_course()->get_lessons();
		$lesson  = $this->get_lesson();

		/**
		 * checks if a a lesson is the 1st $excluded positions in list
		 */
		if ( $lesson instanceof TVA_Lesson && ! empty( $lessons ) ) {
			foreach ( $lessons as $index => $post ) {
				if ( $post->ID === $lesson->ID && $index + 1 <= $excluded ) {
					return true;
				}
			}
		}

		/**
		 * Current post as lesson wasn't found in the exclusion list of lessons
		 * - so it doesn't have access
		 */
		if ( $this->_post->post_type === TVA_Const::LESSON_POST_TYPE ) {
			return false;
		}

		$module = $this->get_module();

		/**
		 * check if module has a lesson which is excluded
		 */
		$module_lessons = TVA_Manager::get_all_module_lessons( $module, array( 'post_status' => 'publish' ) );

		$found = false;

		/**
		 * @var int     $index
		 * @var WP_Post $all_lesson
		 */
		foreach ( $lessons as $index => $all_lesson ) {

			if ( $found ) {
				break;
			}

			/** @var WP_Post $module_lesson */
			foreach ( $module_lessons as $module_lesson ) {

				if ( $module_lesson->ID === $all_lesson->ID && $index + 1 <= $excluded ) {
					$found = true;
					break;
				}
			}
		}

		return $found;
	}

	/**
	 * Checks all TVA_Integrations_Manager's rules for one which applies
	 * - rules for the current course
	 *
	 * @return bool
	 */
	public function check_rules() {

		$allow = false;

		$rules = $this->_integration_manager->get_rules( $this->get_course() );

		foreach ( $rules as $rule ) {
			$integration = $this->_integration_manager->get_integration( $rule['integration'] );
			if ( false === $integration instanceof TVA_Integration ) {
				continue;
			}
			$integration->set_post( $this->_post );
			$allow = $integration->is_rule_applied( $rule );
			if ( true === $allow ) {
				break;
			}
		}

		return $allow;
	}

	/**
	 * If the current post is a TVA_LESSON post type then returns it
	 *
	 * @return WP_Post|null
	 */
	public function get_lesson() {

		if ( false === $this->_lesson instanceof WP_Post ) {
			$this->_init_lesson();
		}

		return $this->_lesson;
	}

	/**
	 * Checks if the current post is a lesson post type and set _lesson property
	 */
	private function _init_lesson() {

		if ( $this->_post instanceof WP_Post && $this->_post->post_type === TVA_Const::LESSON_POST_TYPE ) {
			$this->_lesson = new TVA_Lesson( $this->_post );
		}
	}

	/**
	 * If the current post is module post type the returns it
	 *
	 * @return WP_Post|null
	 */
	public function get_module() {

		if ( false === $this->_module instanceof WP_Post ) {
			$this->_init_module();
		}

		return $this->_module;
	}

	/**
	 * If the current post is a module then sets it to _module
	 */
	private function _init_module() {

		if ( $this->_post instanceof WP_Post && $this->_post->post_type === TVA_Const::MODULE_POST_TYPE ) {
			$this->_module = $this->_post;
		}
	}

	/**
	 * Gets a TVA_User if was set
	 * - contains SendOwl orders
	 *
	 * @return TVA_User|null
	 */
	public function get_tva_user() {

		if ( false === $this->_tva_user instanceof TVA_User ) {
			$this->_init_tva_user();
		}

		return $this->_tva_user;
	}

	/**
	 * If there is a logged in user then init a TVA_User for it
	 */
	private function _init_tva_user() {

		$user = $this->get_logged_in_user();

		if ( $user instanceof WP_User ) {
			$this->_tva_user = new TVA_User( $user->ID );
		}
	}

	/**
	 * Check if current user has access to a $post
	 *
	 * @param WP_Post $post
	 *
	 * @return bool
	 */
	public function has_access_to_post( $post ) {

		if ( false === $post instanceof WP_Post ) {
			return false;
		}

		if ( $this->_post instanceof WP_Post && $this->_post->ID === $post->ID ) {
			return $this->has_access();
		}

		$current_post   = $this->_post;
		$current_access = $this->_access_allowed;
		$current_course = $this->get_course();

		$this->_post   = $post;
		$this->_lesson = null;
		$this->_module = null;

		$this->_init_course();
		$this->_init_access();

		$post_access = $this->_access_allowed;

		$this->_post           = $current_post;
		$this->_access_allowed = $current_access;
		$this->_course         = $current_course;

		return $post_access;
	}

	/**
	 * Check if current user has access to last lesson of current post/term;
	 * - which means it can post on current post/term
	 *
	 * @return bool
	 */
	public function can_comment() {

		//No need to go further if there is no content in the course
		if ( true !== $this->get_course() instanceof TVA_Course ) {
			return false;
		}

		$allow       = false;
		$last_lesson = null;

		if ( true === is_tax( TVA_Const::COURSE_TAXONOMY ) ) { //on course page structure
			$lessons     = $this->get_course()->get_lessons();
			$last_lesson = end( $lessons );
		}

		if ( empty( $last_lesson ) && $this->_post instanceof WP_Post && $this->_post->post_type === TVA_Const::MODULE_POST_TYPE ) {
			$lessons     = TVA_Manager::get_all_module_lessons( $this->_post );
			$last_lesson = end( $lessons );
		}

		if ( empty( $last_lesson ) && $this->_post instanceof WP_Post && $this->_post->post_type === TVA_Const::LESSON_POST_TYPE ) {
			$last_lesson = $this->_post;
		}

		if ( true === $last_lesson instanceof WP_Post ) {
			$allow = $this->has_access_to_post( $last_lesson );
		}

		return $allow;
	}
}

global $tva_access_manager;

/**
 * Global Accessor for TVA_Access_Manager
 *
 * @return TVA_Access_Manager
 */
function tva_access_manager() {

	global $tva_access_manager;

	if ( false === $tva_access_manager instanceof TVA_Access_Manager ) {
		try {
			$tva_access_manager = new TVA_Access_Manager( tva_integration_manager() );
		} catch ( Exception $e ) {
			var_dump( $e );
			die;
		}
	}

	return $tva_access_manager;
}

tva_access_manager();
