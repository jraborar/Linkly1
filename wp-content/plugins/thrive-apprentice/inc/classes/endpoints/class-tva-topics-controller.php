<?php

class TVA_Topics_Controller extends TVA_REST_Controller {

	public $base = 'topics';

	/**
	 * Register Routes
	 */
	public function register_routes() {

		register_rest_route( self::$namespace . self::$version, '/' . $this->base, array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'save_topics' ),
				'permission_callback' => array( $this, 'topics_permissions_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/(?P<ID>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_topics' ),
				'permission_callback' => array( $this, 'topics_permissions_check' ),
				'args'                => array(),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'edit_topics' ),
				'permission_callback' => array( $this, 'topics_permissions_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/get_fontawesome_icons/', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_fontawesome_icons' ),
				'permission_callback' => array( $this, 'icons_permissions_check' ),
				'args'                => array(),
			),
		) );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function save_topics( $request ) {
		$topics   = get_option( 'tva_filter_topics', array() );
		$model    = $this->prepare_model( $request );
		$topics[] = $model;
		$result   = update_option( 'tva_filter_topics', $topics );

		if ( $result ) {
			return new WP_REST_Response( $model, 200 );
		}

		return new WP_Error( 'no-results', __( 'No topic was updated!', TVA_Const::T ) );
	}

	public function topics_permissions_check( $request ) {
		return TVA_Product::has_access();
	}

	public function icons_permissions_check( $request ) {
		return true;
	}

	public function delete_topics( $request ) {
		$response = array();
		$id       = $request->get_param( 'ID' );

		$topics = get_option( 'tva_filter_topics', array() );
		foreach ( $topics as $key => $topic ) {
			if ( $topic['ID'] == $id ) {
				unset( $topics[ $key ] );
			}
		}
		$topics = array_values( $topics );

		$courses = tva_get_courses();
		foreach ( $courses as $course_term ) {
			if ( $course_term->topic == $id ) {
				$response['edited'][] = $course_term->term_id;
				update_term_meta( $course_term->term_id, 'tva_topic', 0 );
			}
		}
		$result = update_option( 'tva_filter_topics', $topics );

		if ( $result ) {
			return new WP_REST_Response( $response, 200 );
		}

		return new WP_Error( 'no-results', __( 'No topic was deleted!', TVA_Const::T ) );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function edit_topics( $request ) {
		$model  = $this->prepare_model( $request );
		$topics = get_option( 'tva_filter_topics', array() );

		foreach ( $topics as $key => $topic ) {
			if ( (int) $topic['ID'] === (int) $model['ID'] ) {

				$topics[ $key ] = $model;
			}
		}

		$result = update_option( 'tva_filter_topics', $topics );

		if ( $result ) {
			return new WP_REST_Response( $model, 200 );
		}

		return new WP_Error( 'no-results', __( 'No topic was updated!', TVA_Const::T ) );
	}

	/**
	 * Get Font Awesome Icons
	 *
	 * @return WP_REST_Response
	 */
	public function get_fontawesome_icons( $request ) {
		global $tcb_ajax_handler;

		$custom_icons = get_option( 'thrive_icon_pack', array() );

		$response = array(
			'tcb_icons'    => $tcb_ajax_handler->action_font_awesome_svg(),
			'custom_icons' => $custom_icons,
		);

		return new WP_REST_Response( $response, 200 );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return array
	 */
	public function prepare_model( $request ) {
		$icon_param = $request->get_param( 'icon' );
		$icon       = preg_replace( '#^https?://#', '//', $icon_param );
		$rec_id     = $request->get_param( 'ID' );
		$id         = isset( $rec_id ) ? $rec_id : $this->get_topic_id();

		$model = array(
			'ID'                  => $id,
			'color'               => $request->get_param( 'color' ),
			'icon'                => $icon,
			'title'               => $request->get_param( 'title' ),
			'svg_icon'            => $request->get_param( 'svg_icon' ),
			'icon_type'           => $request->get_param( 'icon_type' ),
			'layout_icon_color'   => $request->get_param( 'layout_icon_color' ),
			'overview_icon_color' => $request->get_param( 'overview_icon_color' ),
		);

		return $model;
	}

	/**
	 * Get the ID for new topic
	 *
	 * @return int
	 */
	public function get_topic_id() {
		$topics = get_option( 'tva_filter_topics', array() );
		$id     = 0;

		if ( ! empty( $topics ) ) {
			/**
			 * Get the biggest ID so we can create our new one
			 */
			foreach ( $topics as $topic ) {
				if ( $topic['ID'] > $id ) {
					$id = $topic['ID'];
				}
			}
		}

		$id ++;

		return $id;
	}
}
