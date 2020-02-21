<?php
/**
 * Created by PhpStorm.
 * User: User
 * Date: 3/24/2018
 * Time: 16:38
 */

class TVA_Modules_Controller extends TVA_REST_Controller {
	/**
	 * @var string
	 */
	public $base = 'modules';

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
	 * Register Routes
	 */
	public function register_routes() {

		register_rest_route( self::$namespace . self::$version, '/' . $this->base, array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'new_module' ),
				'permission_callback' => array( $this, 'modules_permissions_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/(?P<ID>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_module' ),
				'permission_callback' => array( $this, 'modules_permissions_check' ),
				'args'                => array(),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'edit_module' ),
				'permission_callback' => array( $this, 'modules_permissions_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/update_order/', array(
			array(
				'methods'             => WP_REST_Server::ALLMETHODS,
				'callback'            => array( $this, 'update_module_order' ),
				'permission_callback' => array( $this, 'modules_permissions_check' ),
				'args'                => array(),
			),
		) );
		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/move_modules/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'move_modules' ),
				'permission_callback' => array( $this, 'modules_permissions_check' ),
				'args'                => array(),
			),
		) );
		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/update_post_status/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_post_status' ),
				'permission_callback' => array( $this, 'modules_permissions_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/group_as_module/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'group_as_module' ),
				'permission_callback' => array( $this, 'modules_permissions_check' ),
				'args'                => array(),
			),
		) );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function new_module( $request ) {

		$cover_image    = $request->get_param( 'cover_image' );
		$course_id      = (int) $request->get_param( 'course_id' );
		$module_order   = (int) $request->get_param( 'order' );
		$comment_status = $request->get_param( 'comment_status' );

		$existing_chapters = $request->get_param( 'chapters' );

		if ( false === is_array( $existing_chapters ) ) {
			$existing_chapters = array();
		}

		$existing_lessons = $request->get_param( 'lessons' );
		if ( false === is_array( $existing_lessons ) ) {
			$existing_lessons = array();
		}

		$args      = array(
			'post_title'     => $request->get_param( 'post_title' ),
			'post_excerpt'   => $request->get_param( 'post_excerpt' ),
			'post_status'    => $request->get_param( 'post_status' ),
			'post_type'      => TVA_Const::MODULE_POST_TYPE,
			'comment_status' => $comment_status,
		);
		$module_id = wp_insert_post( $args );

		if ( false === is_wp_error( $module_id ) ) {
			update_post_meta( $module_id, 'tva_cover_image', $cover_image );
			/**
			 * set module order
			 */
			update_post_meta( $module_id, 'tva_module_order', $module_order );

			/**
			 * assign module to course
			 */
			wp_set_object_terms( $module_id, (int) $course_id, TVA_Const::COURSE_TAXONOMY );

			/** @var WP_Post $module */
			$module = get_post( $module_id );

			$module->order        = $module_order;
			$module->course_id    = $course_id;
			$module->cover_image  = $cover_image;
			$module->post_excerpt = $request->get_param( 'post_excerpt' );
			$module->chapters     = array();
			$module->lessons      = array();

			foreach ( $existing_chapters as &$existing_chapter ) {

				$chapter = get_post( $existing_chapter['ID'] );

				if ( false === $chapter instanceof WP_Post ) {
					continue;
				}

				wp_update_post(
					array(
						'ID'             => $chapter->ID,
						'post_parent'    => $module_id,
						'comment_status' => $comment_status,
					)
				);

				$chapter_order = $module_order . $chapter->tva_chapter_order;
				update_post_meta( $chapter->ID, 'tva_chapter_order', $chapter_order );

				$existing_chapter['module_id']   = $module_id;
				$existing_chapter['post_parent'] = $module_id;
				$module->chapters[]              = $existing_chapter;

				if ( isset( $existing_chapter['lessons'] ) && is_array( $existing_chapter['lessons'] ) ) {

					foreach ( $existing_chapter['lessons'] as $key => &$existing_chapter_lesson ) {

						$lesson = get_post( $existing_chapter_lesson['ID'] );

						if ( false === $lesson instanceof WP_Post ) {
							continue;
						}

						/**
						 * update comment status
						 */
						wp_update_post(
							array(
								'ID'             => $lesson->ID,
								'comment_status' => $comment_status,
							)
						);

						$lesson_order = $module_order . $lesson->tva_lesson_order;
						update_post_meta( $existing_chapter_lesson['ID'], 'tva_lesson_order', $lesson_order );

						$existing_chapter_lesson['comment_status'] = $comment_status;
					}
				}
			}

			foreach ( $existing_lessons as &$existing_lesson ) {

				$lesson = get_post( $existing_lesson['ID'] );

				if ( false === $lesson instanceof WP_Post ) {
					continue;
				}

				wp_update_post(
					array(
						'ID'             => $lesson->ID,
						'post_parent'    => $module_id,
						'comment_status' => $comment_status,
					)
				);

				$lesson_order = $module_order . $lesson->tva_lesson_order;
				update_post_meta( $lesson->ID, 'tva_lesson_order', $lesson_order );

				$existing_lesson['module_id']   = $module_id;
				$existing_lesson['post_parent'] = $module_id;
				$module->lessons[]              = $existing_lesson;
			}

			$module->tva_module_order = get_post_meta( $module_id, 'tva_module_order' );

			return new WP_REST_Response( $module, 200 );
		}

		return new WP_Error( 'no-results', __( $module_id, TVA_Const::T ) );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function edit_module( $request ) {
		if ( ! TVA_Courses_Controller::is_valid_request( $request ) ) {
			return new WP_Error( 'invalid-request', __( 'Invalid Request. Please reload the page', TVA_Const::T ) );
		}

		$module_id              = $request->get_param( 'ID' );
		$post_title             = $request->get_param( 'post_title' );
		$module_description     = $request->get_param( 'post_excerpt' );
		$cover_image            = $request->get_param( 'cover_image' );
		$chapters               = $request->get_param( 'chapters' );
		$lessons                = $request->get_param( 'lessons' );
		$comment_status_changed = $request->get_param( 'comment_status_changed' );

		$args = array(
			'ID'             => $module_id,
			'post_title'     => $post_title,
			'post_excerpt'   => $module_description,
			'post_status'    => $request->get_param( 'post_status' ),
			'comment_status' => $request->get_param( 'comment_status' ),
		);

		$update = wp_update_post( $args );
		$post   = get_post( $module_id );
		update_post_meta( $module_id, 'tva_cover_image', $cover_image );

		if ( $comment_status_changed ) {
			foreach ( (array) $chapters as $chapter ) {
				wp_update_post(
					array(
						'ID'             => $chapter['ID'],
						'comment_status' => $request->get_param( 'comment_status' ),
					)
				);

				foreach ( (array) $chapter['lessons'] as $lesson ) {
					wp_update_post(
						array(
							'ID'             => $lesson['ID'],
							'comment_status' => $request->get_param( 'comment_status' ),
						)
					);
				}
			}

			foreach ( (array) $lessons as $lesson ) {
				wp_update_post(
					array(
						'ID'             => $lesson['ID'],
						'comment_status' => $request->get_param( 'comment_status' ),
					)
				);
			}
		}

		if ( empty( $this->settings ) ) {
			$user_settings  = TVA_Settings::instance();
			$this->settings = $user_settings->get_settings();
		}

		if ( $this->settings['membership_plugin'] ) {
			$this->course_id = $request->get_param( 'course_id' );
			$this->handle_membership_plugin_setup();
		}

		if ( ! is_wp_error( $update ) ) {
			unset( $post->post_modified );
			unset( $post->post_modified_gmt );

			tva_integration_manager()->save_rules( $this->course_id, tva_integration_manager()->get_rules( new TVA_Course( $this->course_id ) ) );

			return new WP_REST_Response( $post, 200 );
		}

		return new WP_Error( 'no-results', __( $update->get_error_message(), TVA_Const::T ) );
	}

	/**
	 * Handle the membership plugin setup, like adding things needed to the DB
	 */
	public function handle_membership_plugin_setup() {
		global $tva_db;

		$course   = tva_get_course_by_id( $this->course_id );
		$settings = $this->settings;

		foreach ( $settings['membership_plugin'] as $membership ) {
			$tva_db->tva_protection_manager( $course, $membership['tag'] );
		}
	}

	/**
	 * Update the order to show the modules to
	 *
	 * @param $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function update_module_order( $request ) {
		if ( ! TVA_Courses_Controller::is_valid_request( $request ) ) {
			return new WP_Error( 'invalid-request', __( 'Invalid Request. Please reload the page', TVA_Const::T ) );
		}

		/**
		 * @var WP_REST_Request $request
		 */
		$order   = $request->get_param( 'order' );
		$post_id = $request->get_param( 'ID' );

		update_post_meta( $post_id, 'tva_module_order', $order );

		return new WP_REST_Response( true, 200 );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function delete_module( $request ) {

		$module_id = (int) $request->get_param( 'ID' );

		$module_post = get_post( $module_id );
		$tva_module  = TVA_Post::factory( $module_post );
		$deleted     = $tva_module->delete();

		if ( $deleted ) {
			return new WP_REST_Response( array(), 200 );
		}

		return new WP_Error( 'delete_failed', __( 'Failed to delete module. Please try again later!', TVA_Const::T ) );
	}

	/**
	 * Move modules from one course to another
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function move_modules( $request ) {
		if ( ! TVA_Courses_Controller::is_valid_request( $request ) ) {
			return new WP_Error( 'invalid-request', __( 'Invalid Request. Please reload the page', TVA_Const::T ) );
		}

		$id     = $request->get_param( 'ids' );
		$result = wp_set_object_terms( $id, (int) $request->get_param( 'course_id' ), TVA_Const::COURSE_TAXONOMY );

		if ( empty( $result ) || is_wp_error( $result ) ) {
			return new WP_Error( 'no-results', __( $result, TVA_Const::T ) );
		}

		return new WP_REST_Response( true, 200 );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return int|WP_Error
	 */
	public function update_post_status( $request ) {
		if ( ! TVA_Courses_Controller::is_valid_request( $request ) ) {
			return new WP_Error( 'invalid-request', __( 'Invalid Request. Please reload the page', TVA_Const::T ) );
		}

		$status  = $request->get_param( 'post_status' );
		$post_id = $request->get_param( 'post_id' );

		return wp_update_post( array( 'ID' => $post_id, 'post_status' => $status ) );
	}

	/**
	 * Check if user is logged in and is an administrator
	 *
	 * @return bool
	 */
	public function modules_permissions_check() {
		return TVA_Product::has_access();
	}

	/**
	 * Group items as modules
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function group_as_module( $request ) {
		if ( ! TVA_Courses_Controller::is_valid_request( $request ) ) {
			return new WP_Error( 'invalid-request', __( 'Invalid Request. Please reload the page', TVA_Const::T ) );
		}

		$items     = $request->get_param( 'items' );
		$course_id = $request->get_param( 'course_id' );

		foreach ( $items as $item ) {

			try {

				$module = new TVA_Module( $item );

				/**
				 * add the new chapter into DB
				 */
				$module->save();

				$parent_ids = [];

				/**
				 * assign the lessons to the newly created chapter
				 */
				foreach ( $module->item_ids as $key => $child ) {

					$child_post = get_post( $child );

					if ( $child_post->post_parent ) {
						$parent_ids[] = $child_post->post_parent;
					}

					$order = $module->order . $key;

					if ( $child_post->post_type === TVA_Const::CHAPTER_POST_TYPE ) {

						$chapter              = new TVA_Chapter( array( 'ID' => $child_post->ID ) );
						$chapter->order       = $order;
						$chapter->post_parent = $module->ID;

						$chapter->save();

						$lessons = TVA_Manager::get_children( get_post( $chapter->ID ) );

						foreach ( $lessons as $index => $lesson ) {
							$tva_lesson        = new TVA_Lesson( $lesson );
							$tva_lesson->order = $order . $index;
							$tva_lesson->save();
						}
					} elseif ( $child_post->post_type === TVA_Const::LESSON_POST_TYPE ) {

						$tva_lesson              = new TVA_Lesson( $child_post );
						$tva_lesson->post_parent = $module->ID;
						$tva_lesson->order       = $order;

						$tva_lesson->save();
					}
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
