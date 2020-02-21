<?php
/**
 * Created by PhpStorm.
 * User: User
 * Date: 3/23/2018
 * Time: 17:46
 */

class TVA_Chapters_Controller extends TVA_REST_Controller {
	/**
	 * @var string
	 */
	public $base = 'chapters';

	/**
	 * @var
	 */
	public $post_id;
	/**
	 * @var
	 */
	public $course_id;

	/**
	 * @var WP_REST_Request $request
	 */
	public $request = array();

	/**
	 * @var array
	 */
	public $settings = array();

	/**
	 * The course Object
	 *
	 * @var TVA_Course array
	 */
	public $course;

	/**
	 * Published items
	 *
	 * @var array
	 */
	public $published = array();

	/**
	 * Register Routes
	 */
	public function register_routes() {

		register_rest_route( self::$namespace . self::$version, '/' . $this->base, array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'new_chapter' ),
				'permission_callback' => array( $this, 'chapters_permissions_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/(?P<ID>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_chapter' ),
				'permission_callback' => array( $this, 'chapters_permissions_check' ),
				'args'                => array(),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'edit_chapter' ),
				'permission_callback' => array( $this, 'chapters_permissions_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/update_order/', array(
			array(
				'methods'             => WP_REST_Server::ALLMETHODS,
				'callback'            => array( $this, 'update_chapter_order' ),
				'permission_callback' => array( $this, 'chapters_permissions_check' ),
				'args'                => array(),
			),
		) );
		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/move_chapters/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'move_chapters' ),
				'permission_callback' => array( $this, 'chapters_permissions_check' ),
				'args'                => array(),
			),
		) );
		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/group_as_chapter/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'group_as_chapter' ),
				'permission_callback' => array( $this, 'chapters_permissions_check' ),
				'args'                => array(),
			),
		) );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function new_chapter( $request ) {
		if ( ! TVA_Courses_Controller::is_valid_request( $request ) ) {
			return new WP_Error( 'invalid-request', __( 'Invalid Request. Please reload the page', TVA_Const::T ) );
		}

		$parent_id     = (int) $request->get_param( 'post_parent' );
		$chapter_order = (int) $request->get_param( 'order' );
		$course_id     = (int) $request->get_param( 'course_id' );

		$lessons = $request->get_param( 'lessons' );

		if ( false === is_array( $lessons ) ) {
			$lessons = array();
		}

		$args = array(
			'post_title'     => $request->get_param( 'post_title' ),
			'post_type'      => TVA_Const::CHAPTER_POST_TYPE,
			'post_parent'    => $parent_id,
			'post_status'    => $request->get_param( 'post_status' ),
			'comment_status' => $request->get_param( 'comment_status' ),
		);

		$chapter_id = wp_insert_post( $args );

		if ( ! is_wp_error( $chapter_id ) ) {

			$module = get_post( $parent_id );

			if ( true === $module instanceof WP_Post ) {
				$chapter_order = $module->tva_module_order . $chapter_order;
			}

			/**
			 * set chapter order
			 */
			update_post_meta( $chapter_id, 'tva_chapter_order', $chapter_order );

			/**
			 * assign chapter to course/term
			 */
			wp_set_object_terms( $chapter_id, $course_id, TVA_Const::COURSE_TAXONOMY );

			$chapter            = get_post( $chapter_id );
			$chapter->course_id = $course_id;
			$chapter->order     = $chapter_order;

			if ( ! empty( $lessons ) ) {
				$chapter->lessons = array();

				foreach ( $lessons as $key => $lesson ) {
					wp_update_post( array(
						'ID'          => $lesson['ID'],
						'post_parent' => $chapter_id,
					) );

					$lesson_order               = $chapter->order . $key;
					$lesson['tva_lesson_order'] = $lesson_order;

					update_post_meta( $lesson['ID'], 'tva_lesson_order', $lesson_order );

					$lesson['post_parent'] = $chapter_id;
					$chapter->lessons[]    = $lesson;
				}
			}

			$chapter->tva_chapter_order = $chapter_order;

			return new WP_REST_Response( $chapter, 200 );
		}

		return new WP_Error( 'no-results', __( $chapter_id, TVA_Const::T ) );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function edit_chapter( $request ) {
		if ( ! TVA_Courses_Controller::is_valid_request( $request ) ) {
			return new WP_Error( 'invalid-request', __( 'Invalid Request. Please reload the page', TVA_Const::T ) );
		}

		$chapter_id = $request->get_param( 'ID' );
		$post_title = $request->get_param( 'post_title' );

		$args = array(
			'ID'          => $chapter_id,
			'post_title'  => $post_title,
			'post_status' => $request->get_param( 'post_status' ),
		);

		$update = wp_update_post( $args );
		$post   = get_post( $chapter_id );

		if ( ! is_wp_error( $update ) ) {
			/**
			 * We don't need those data and we unset them because they trigger unnecessary 'change' events in js
			 */
			unset( $post->post_modified );
			unset( $post->post_modified_gmt );

			$this->course_id = $request->get_param( 'course_id' );

			$this->handle_membership_plugin_setup();

			return new WP_REST_Response( $post, 200 );
		}

		return new WP_Error( 'no-results', __( $update->get_error_message(), TVA_Const::T ) );
	}

	/**
	 * Handle the membership plugin setup, like adding things needed to the DB
	 */
	public function handle_membership_plugin_setup() {
		global $tva_db;

		$course         = tva_get_course_by_id( $this->course_id );
		$user_settings  = TVA_Settings::instance();
		$this->settings = $user_settings->get_settings();

		foreach ( $this->settings['membership_plugin'] as $membership ) {
			$tva_db->tva_protection_manager( $course, $membership['tag'] );
		}
	}

	/**
	 * Update the order to show the chapters to
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function update_chapter_order( $request ) {
		if ( ! TVA_Courses_Controller::is_valid_request( $request ) ) {
			return new WP_Error( 'invalid-request', __( 'Invalid Request. Please reload the page', TVA_Const::T ) );
		}

		/**
		 * @var WP_REST_Request $request
		 */
		$order   = $request->get_param( 'order' );
		$post_id = $request->get_param( 'ID' );

		update_post_meta( $post_id, 'tva_chapter_order', $order );

		return new WP_REST_Response( true, 200 );
	}

	/**
	 * Move chapters around
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function move_chapters( $request ) {
		if ( ! TVA_Courses_Controller::is_valid_request( $request ) ) {
			return new WP_Error( 'invalid-request', __( 'Invalid Request. Please reload the page', TVA_Const::T ) );
		}

		$ids    = $request->get_param( 'ids' );
		$result = wp_set_object_terms( $ids, (int) $request->get_param( 'course_id' ), TVA_Const::COURSE_TAXONOMY );

		if ( empty( $result ) || is_wp_error( $result ) ) {
			return new WP_Error( 'no-results', __( $result, TVA_Const::T ) );
		}

		return new WP_REST_Response( true, 200 );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function delete_chapter( $request ) {

		$chapter_id  = (int) $request->get_param( 'ID' );
		$post        = get_post( $chapter_id );
		$tva_chapter = TVA_Post::factory( $post );
		$deleted     = $tva_chapter->delete();

		if ( $deleted ) {

			$response    = array();
			$module_post = get_post( $tva_chapter->post_parent );

			if ( $module_post && $module_post->post_status === 'draft' ) {
				$response[] = $module_post->ID;
			}

			return new WP_REST_Response( $response, 200 );
		}

		return new WP_Error( 'delete_failed', __( 'Failed to delete Chapter. Please try again later!', TVA_Const::T ) );
	}

	/**
	 * Update the module post_status
	 * - based if there are any other published chapters
	 *
	 * @param WP_Post $module
	 *
	 * @return false|string
	 */
	private function _set_module_status( $module ) {

		if ( false === $module instanceof WP_Post ) {
			return false;
		}

		$children = TVA_Manager::get_children( $module );
		$status   = 'draft';

		foreach ( $children as $child ) {
			if ( $child->post_status === 'publish' ) {
				$status = 'publish';
				break;
			}
		}

		wp_update_post( array(
			'ID'          => $module->ID,
			'post_status' => $status,
		) );

		return $status;
	}

	/**
	 * Check if user is logged in and is an administrator
	 *
	 * @return bool
	 */
	public function chapters_permissions_check() {
		return TVA_Product::has_access();
	}

	/**
	 * Group items as chapters
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function group_as_chapter( $request ) {

		if ( ! TVA_Courses_Controller::is_valid_request( $request ) ) {
			return new WP_Error( 'invalid-request', __( 'Invalid Request. Please reload the page', TVA_Const::T ) );
		}

		$items     = $request->get_param( 'items' );
		$course_id = $request->get_param( 'course_id' );

		foreach ( $items as $item ) {

			try {

				if ( ! empty( $item['post_parent'] ) ) {
					$module        = get_post( $item['post_parent'] );
					$item['order'] = $module->tva_module_order . $item['order'];
				}

				$chapter = new TVA_Chapter( $item );

				/**
				 * add the new chapter into DB
				 */
				$chapter->save();

				$parent_ids = [];

				/**
				 * assign the lessons to the newly created chapter
				 */
				foreach ( $chapter->item_ids as $key => $lesson_id ) {

					$lesson_post = get_post( $lesson_id );

					if ( $lesson_post->post_parent ) {
						$parent_ids[] = $lesson_post->post_parent;
					}

					$tva_lesson              = new TVA_Lesson( $lesson_post );
					$tva_lesson->post_parent = $chapter->ID;
					$tva_lesson->order       = $chapter->order . $key;

					$tva_lesson->save();
				}

				$parent_ids = array_unique( $parent_ids );

				/**
				 * review the status of the parents from which the lessons came from
				 */
				foreach ( $parent_ids as $parent_id ) {
					TVA_Manager::review_status( $parent_id );
					TVA_Manager::review_children_order( $parent_id );
				}
			} catch ( Exception $e ) {

				return new WP_REST_Response( $e->getMessage(), 400 );
			}
		}

		$course = new TVA_Course( $course_id );

		return new WP_REST_Response( $course->get_term(), 200 );
	}
}
