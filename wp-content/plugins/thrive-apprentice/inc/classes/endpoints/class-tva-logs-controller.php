<?php

/**
 * Class TVA_Logs_Controller
 */
class TVA_Logs_Controller extends TVA_REST_Controller {

	/**
	 * @var string
	 */
	public $base = 'logs';

	/**
	 * Register rest routes
	 */
	public function register_routes() {
		parent::register_routes();

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/get_logs/', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'get_logs' ),
				'permission_callback' => array( $this, 'get_logs_permissions_check' ),
				'args'                => array(),
			),
		) );
	}

	/**
	 * @param $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_logs( $request ) {
		/** @var WP_REST_Request $request */
		$settings = $request->get_param( 'settings' );
		$logs     = TVA_Logger::get_logs( $settings );

		if ( empty( $logs ) ) {
			$logs['all'] = true;
		}

		return new WP_REST_Response( $logs, 200 );
	}

	/**
	 * @param $request
	 *
	 * @return bool
	 */
	public function get_logs_permissions_check( $request ) {
		return is_user_logged_in() && TVA_Product::has_access();
	}
}
