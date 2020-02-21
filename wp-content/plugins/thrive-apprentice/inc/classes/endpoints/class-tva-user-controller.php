<?php
/**
 * Created by PhpStorm.
 * User: Ovidiu
 * Date: 10/18/2018
 * Time: 9:49 AM
 */

/**
 * Class TVA_User_Controller
 */
class TVA_User_Controller extends TVA_REST_Controller {

	/**
	 * endpoint base
	 *
	 * @var string
	 */
	public $base = 'user';

	/**
	 * The User ID
	 *
	 * @var $user_id
	 */
	private $user_id;

	/**
	 * The request
	 *
	 * @var $request
	 */
	private $request;

	/**
	 * Register the routes
	 */
	public function register_routes() {

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/login/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'process_login' ),
				'permission_callback' => array( $this, 'user_login_permission_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/tva_register/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'process_register' ),
				'permission_callback' => array( $this, 'user_register_permission_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/recover/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'process_recover' ),
				'permission_callback' => array( $this, 'user_login_permission_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/process_redirect/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'process_redirect' ),
				'permission_callback' => array( $this, 'user_logged_in_permission_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base, array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'new_user' ),
				'permission_callback' => array( $this, 'user_logged_in_permission_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/upload_file/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'tva_upload_file' ),
				'permission_callback' => array( $this, 'admin_permission_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/import_customers/', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'import_customers' ),
				'permission_callback' => array( $this, 'admin_permission_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/(?P<ID>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'edit_customer' ),
				'permission_callback' => array( $this, 'admin_permission_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( self::$namespace . self::$version, '/' . $this->base . '/get_customers', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'get_customers' ),
				'permission_callback' => array( $this, 'admin_permission_check' ),
				'args'                => array(),
			),
		) );

	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return array|object|null
	 */
	public function get_customers( $request ) {
		$product_id = 0;

		if ( $request->get_param( 'product_id' ) > 0 ) {
			$product_id = $request->get_param( 'product_id' );
		} elseif ( $request->get_param( 'bundle_id' ) > 0 ) {
			$product_id = $request->get_param( 'bundle_id' );
		}

		$args = array(
			'limit'  => $request->get_param( 'limit' ),
			'offset' => $request->get_param( 'offset' ),
		);

		if ( $product_id > 0 ) {
			$args['product_id'] = $product_id;
		}

		$s = $request->get_param( 's' );

		if ( ! empty( $s ) ) {
			$args['s'] = $s;
		}

		$data = array(
			'customers' => TVA_User::get_sendowl_customers( $args ),
			'count'     => $request->get_param( 'count_value' ),
		);

		if ( (bool) $request->get_param( 'count' ) === true ) {
			$data['count'] = TVA_User::count_sendowl_customers( $args );
		}

		return $data;
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function edit_customer( $request ) {
		$id             = $request->get_param( 'ID' );
		$memberships    = (array) $request->get_param( 'membership_ids' );
		$bundles        = (array) $request->get_param( 'bundle_ids' );
		$p_ids          = array_merge( $memberships, $bundles );
		$existing_ids   = array();
		$orders_updated = array();
		$tva_user       = new TVA_User( $id );

		foreach ( $tva_user->get_orders_by_status( TVA_Const::STATUS_COMPLETED ) as $order ) {
			/** @var TVA_Order $order */
			foreach ( $order->get_order_items() as $item ) {
				/** @var TVA_Order_Item $item */

				/**
				 * If an order item is fond on user obj, but no longer in request means that the user removed access
				 * to that product
				 */
				if ( ! in_array( $item->get_product_id(), $p_ids ) ) {
					$order->unset_order_item( $item );
					$item->delete(); // TODO: WE SHOULD THINK HARDER HERE
					unset( $p_ids[ array_search( $item->get_product_id(), $p_ids ) ] );
					$orders_updated[] = $order->get_id();
//					TVA_Logger::set_type( 'ORDER ITEM DELETED' );
//					TVA_Logger::log( 'ORDER ITEM', $item, true, null, 'ITEM' );
				} else {
					$existing_ids[] = $item->get_product_id();
				}
			}

			if ( count( $order->get_order_items() ) === 0 ) {
				$order->set_status( TVA_Const::STATUS_EMPTY );
				$order->save();
			}
		}

		$existing_ids = array_unique( $existing_ids );
		$bundles      = array_diff( $bundles, $existing_ids );
		$memberships  = array_diff( $memberships, $existing_ids );

		if ( ! empty( $bundles ) || ! empty( $memberships ) ) {
			$user = get_userdata( $id );

			$user->bundle_ids     = $bundles;
			$user->membership_ids = $memberships;

			$this->tva_create_customer_order( $user );
		}

		return new WP_REST_Response( $orders_updated, 200 );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function import_customers( $request ) {
		$customers = $request->get_param( 'customers' );

		if ( ! is_array( $customers ) || empty( $customers ) ) {
			return new WP_REST_Response( array(
				'customers' => TVA_User::get_sendowl_customers(),
				'count'     => TVA_User::count_sendowl_customers(),
			), 200 );
		}

		$is_last_request = $request->get_param( 'is_last_request' );

		$new_users    = array();
		$inserted_ids = array();
		$response     = array(
			'imported_users' => array(),
			'failed_users'   => array(),
			'failed_orders'  => array(),
		);

		$user_emails = wp_list_pluck( $customers, 'user_email' );
		$user_emails = array_map( 'trim', $user_emails );

		$args = array(
			array(
				'name'   => 'user_email',
				'values' => $user_emails,
			),
		);

		$users_by_email = TVA_User::get_users_by_fields( $args );
		$users_by_email = array_filter( $users_by_email, function ( $user ) {
			return ! $user instanceof WP_Error;
		} );

		$_emails      = wp_list_pluck( $users_by_email, 'user_email' );
		$existing_ids = wp_list_pluck( $users_by_email, 'ID' );

		/**
		 * push only users which don't have an account, by email
		 */
		foreach ( $customers as $key => $customer ) {
			if ( ! in_array( $customer['user_email'], $_emails ) ) {
				$new_users[] = $customer;
			}
		}

		foreach ( $new_users as $new_user ) {
			$new_user = array_map( 'trim', $new_user );

			if ( ! is_email( $new_user['user_email'] ) ) {
				$response['failed_users'][] = $new_user;
				continue;
			}

			$args = array(
				'user_email'   => $new_user['user_email'],
				'user_login'   => $new_user['user_email'],
				'display_name' => $new_user['display_name'],
				'first_name'   => $new_user['display_name'],
				'user_pass'    => '',
				'role'         => 'subscriber',
			);
			$user = wp_insert_user( $args );

			if ( ! $user instanceof WP_Error ) {
				$inserted_ids[] = $user;
			}
		}

		$user_args    = array( 'include' => array_unique( array_merge( $inserted_ids, $existing_ids ) ) );
		$users_by_ids = get_users( $user_args );

		foreach ( $users_by_ids as $user ) {
			/** @var WP_User $user */
			$user->bundle_ids     = $request->get_param( 'bundle_ids' );
			$user->membership_ids = $request->get_param( 'membership_ids' );

			$order = $this->tva_create_customer_order( $user );

			if ( ! $order ) {
				$response['failed_orders'][] = $user->to_array();
			} else {
				if ( in_array( $user->ID, $inserted_ids ) ) {
					$this->tva_send_customer_email( $user );
				}

				$arr_user = $user->to_array();

				unset( $arr_user['user_pass'] );
				unset( $arr_user['user_activation_key'] );

				$response['imported_users'][] = $arr_user;
			}
		}

		if ( (bool) $is_last_request === true ) {
			$response['customers'] = TVA_User::get_sendowl_customers();
			$response['count']     = TVA_User::count_sendowl_customers();
		}

		return new WP_REST_Response( $response, 200 );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function tva_upload_file( $request ) {
		$file_data = $request->get_param( 'tva_csv_file' );
		$rows      = array();

		if ( ( $handle = fopen( $file_data['tmp_name'], 'r' ) ) !== false ) {
			while ( ( ( ( $data = fgetcsv( $handle, 1000, ',' ) ) !== false ) ) && count( $rows ) < 1001 ) {
				$rows[] = $data;
			}
			fclose( $handle );
		}

		$data = $this->tva_process_data_from_csv( $rows );

		if ( empty( $data ) ) {
			$request['invalid_file'] = true;

			return new WP_REST_Response( array( 'invalid_file' => true ), 200 );
		}

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * @param $data
	 *
	 * @return array|bool
	 */
	public function tva_process_data_from_csv( $data ) {

		if ( ! is_array( $data ) ) {
			return false;
		}

		$headers = isset( $data[0] ) ? $data[0] : false;

		if ( ! is_array( $headers ) ) {
			return false;
		}

		$_headers  = array();
		$_data     = array();
		$email_key = null;
		$name_key  = null;

		foreach ( $headers as $key => $header ) {
			$_key       = trim( strtolower( $header ) );
			$_key       = str_replace( array( '/', '&', '?', '@', ',', '"' ), '', $_key );
			$_key       = str_replace( ' ', '_', $_key );
			$_headers[] = $_key;

			if ( $_key === 'buyer_name' ) {
				$name_key = $key;
			}

			if ( $_key === 'buyer_email' ) {
				$email_key = $key;
			}
		}

		if ( ! in_array( 'buyer_name', $_headers ) || ! in_array( 'buyer_email', $_headers ) ) {
			return array( 'invalid_file' => true );
		}

		unset( $data[0] );

		foreach ( $data as $key => $row ) {
			// invalid row
			if ( count( $row ) !== count( $_headers ) ) {
				continue;
			}
			$row['is_valid'] = true;
			$email           = sanitize_email( $row[ $email_key ] );

			/**
			 * If the email is invalid we unset the current row
			 */
			if ( ! is_email( $email ) ) {
				$row['is_valid'] = false;
			}
			/**
			 * If we don't have a name in order, we will use the first part of the email
			 */
			if ( empty( $row[ $name_key ] ) ) {
				$chunks           = explode( '@', $email );
				$row[ $name_key ] = sanitize_text_field( $chunks[0] );
			}

			foreach ( $row as $row_key => $item ) {
				unset( $row[ $row_key ] );

				$item            = str_replace( array( '/', '&', '?', ',', '"' ), '', $item );
				$row_key         = isset( $_headers[ $row_key ] ) ? $_headers[ $row_key ] : $row_key;
				$row[ $row_key ] = $item;
			}

			$emails = wp_list_filter( $_data, array( 'buyer_email' => $row['buyer_email'] ) );

			/**
			 * Make sure we push a user only once
			 */
			if ( empty( $emails ) ) {
				$_data[] = $row;
			}
		}

		return $_data;
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function process_login( $request ) {
		$this->request         = $request;
		$info                  = array();
		$info['user_login']    = $request->get_param( 'username' );
		$info['user_password'] = $request->get_param( 'password' );
		$info['remember']      = true;

		$user_signon = wp_signon( $info, false );

		if ( is_wp_error( $user_signon ) ) {
			return new WP_Error( 'error_while_login', __( 'Wrong username or password.', 'thrive-apprentice' ) );
		}

		$this->user_id = $user_signon->ID;
		/**
		 * Process payment
		 */
		$payment_processor = $request->get_param( 'payment_processor' );
		$bid               = (int) $request->get_param( 'bid' );
		$pid               = (int) $request->get_param( 'pid' );
		$discount          = $request->get_param( 'thrv_so_discount' );

		$type  = ! empty( $bid ) ? 'bid' : '';
		$value = ! empty( $bid ) ? $bid : 0;

		if ( ! empty( $pid ) ) {
			$type  = 'pid';
			$value = $pid;
		}

		$result = $this->process_payment( $payment_processor, $type, $value, $discount );

		if ( $result ) {
			$response = array(
				'message'  => __( 'Login successful, redirecting...', TVA_Const::T ),
				'redirect' => $result,
			);
		} else {
			$url = TVA_Settings::get_index_page_url();

			$response['redirect'] = $url ? $url : get_home_url();
		}

		return new WP_REST_Response( $response, 200 );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function process_register( $request ) {
		$this->request = $request;
		$fields        = array(
			'user_login'       => sanitize_email( $request->get_param( 'email' ) ),
			'user_email'       => sanitize_email( $request->get_param( 'email' ) ),
			'user_pass'        => esc_attr( $request->get_param( 'password' ) ),
			'confirm_password' => esc_attr( $request->get_param( 'confirm_password' ) ),
			'first_name'       => sanitize_text_field( $request->get_param( 'first_name' ) ),
			'role'             => 'subscriber',
		);

		foreach ( $fields as $field ) {
			if ( empty( $field ) ) {
				return new WP_Error( 'empty_field_check', __( 'Please do not leave empty fields', TVA_Const::T ) );
				break;
			}
		}

		if ( ! is_email( $fields['user_email'] ) ) {
			return new WP_Error( 'email_not_valid', __( 'The email you enter is not a valid email!', TVA_Const::T ) );
		}

		if ( $fields['user_pass'] !== $fields['confirm_password'] ) {
			return new WP_Error( 'password_not_match', __( 'The passwords you enter did not match!', TVA_Const::T ) );
		}

		$user = wp_insert_user( $fields );

		if ( is_wp_error( $user ) ) {
			return new WP_Error( $user->get_error_code(), $user->get_error_message() );
		}

		$route = '/' . self::$namespace . self::$version . '/' . $this->base . '/login';
		$login = new WP_REST_Request( 'POST', $route );

		$login->set_query_params( array(
			'username'          => $fields['user_login'],
			'password'          => $fields['user_pass'],
			'payment_processor' => $request->get_param( 'payment_processor' ),
			'bid'               => $request->get_param( 'bid' ),
			'pid'               => $request->get_param( 'pid' ),
			'thrv_so_discount'  => $request->get_param( 'thrv_so_discount' ),
		) );

		$response = rest_do_request( $login );
		$server   = rest_get_server();
		$data     = $server->response_to_data( $response, false );

		if ( $data ) {
			return new WP_REST_Response( $data, 200 );
		}

		return new WP_Error( 'error_while_inserting_user', __( 'Oops, Something went wrong!', TVA_Const::T ) );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function process_recover( $request ) {

		$user_login = $request->get_param( 'user_login' );
		if ( empty( $user_login ) || ! is_string( $user_login ) ) {
			return new WP_Error( 'empty_username', __( 'Enter a username or email address.', TVA_Const::T ) );
		} elseif ( strpos( $user_login, '@' ) ) {
			$user_data = get_user_by( 'email', trim( wp_unslash( $user_login ) ) );
			if ( empty( $user_data ) ) {
				return new WP_Error( 'invalid_email', __( 'There is no user registered with that email address.', TVA_Const::T ) );
			}
		} else {
			$user_data = get_user_by( 'login', trim( $user_login ) );
		}

		if ( ! $user_data ) {
			return new WP_Error( 'invalidcombo', __( 'Invalid username or email.', TVA_Const::T ) );
		}

		$wp_mail_response = $this->recover_password( $user_data );

		if ( ! $wp_mail_response ) {
			return new WP_Error( 'invalidcombo', __( 'The email could not be sent. Possible reason: your host may have disabled the mail() function.', TVA_Const::T ) );
		}

		return new WP_REST_Response( array(
			'message' => null,
			'state'   => 'reset_confirmation',
		), 200 );
	}

	/**
	 * @param $request WP_REST_Request
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function process_redirect( $request ) {
		/**
		 * Process payment
		 */
		$this->request     = $request;
		$payment_processor = $request->get_param( 'payment_processor' );
		$bid               = (int) $request->get_param( 'bid' );
		$pid               = (int) $request->get_param( 'pid' );
		$discount          = $request->get_param( 'thrv_so_discount' );

		$type  = ! empty( $bid ) ? 'bid' : '';
		$value = ! empty( $bid ) ? $bid : 0;

		if ( ! empty( $pid ) ) {
			$type  = 'pid';
			$value = $pid;
		}

		$this->user_id = get_current_user_id();

		$result = $this->process_payment( $payment_processor, $type, $value, $discount );

		if ( $result ) {
			$response = array(
				'message'  => __( 'Login successful, redirecting...', 'thrive-apprentice' ),
				'redirect' => $result,
			);
		} else {
			return new WP_Error( 'invalidcombo', __( 'Something went wrong, please try again ...', 'thrive-apprentice' ) );
		}

		return new WP_REST_Response( $response, 200 );
	}


	/**
	 * @param     $payment_processor
	 * @param     $type
	 * @param int $id
	 *
	 * @return bool|string
	 */
	public function process_payment( $payment_processor, $type, $id = 0, $discount = 0 ) {
		$allow_payment_processors = array( 'Sendowl' );

		if ( ! in_array( $payment_processor, $allow_payment_processors ) || empty( $type ) || empty( $id ) ) {
			return false;
		}

		$order = new TVA_Order();
		$order->set_user_id( $this->user_id );
		$order->set_gateway( $payment_processor );

		if ( 'pid' === $type ) {
			$product = TVA_SendOwl::get_product_by_id( $id );
		} else {
			$product = TVA_SendOwl::get_bundle_by_id( $id );
		}

		if ( $product ) {
			$product_type = isset( $product['product_type'] ) ? $product['product_type'] : 'bundle';
			$order_item   = new TVA_Order_Item();
			$order_item->set_product_id( $product['id'] );
			$order_item->set_product_name( $product['name'] );
			$order_item->set_product_type( $product_type );
			$order_item->set_product_price( $product['price'] );
			$order_item->set_currency( $product['currency_code'] );

			$order->set_order_item( $order_item );
		}

		$result = $order->save();

		/**
		 * Drop a cookie on the checkout page for sendowl for us to know which product is purchased
		 */

		$data = array(
			'type' => $type,
			'id'   => $id,
		);

		setcookie( TVA_Const::TVA_SENDOWL_COOKIE_NAME, maybe_serialize( $data ), time() + 3600, '/' );

		if ( $result ) {
			$user_data = get_userdata( $this->user_id );
			$name      = urlencode( $user_data->first_name );

			$purchase_url = $product['instant_buy_url'];

			$purchase_url = add_query_arg(
				array(
					'tag'         => tva_calculate_order_tag( array( $order->get_id() ) ),
					'buyer_name'  => $name,
					'buyer_email' => $user_data->user_email,
				),
				$purchase_url
			);

			if ( ! empty( $discount ) ) {
				$purchase_url = add_query_arg(
					array(
						'discount_code' => $discount,
					),
					$purchase_url
				);
			}

			TVA_Cookie_Manager::set_cookie( TVA_Thankyou::LAST_PURCHASED_PRODUCT, $product['id'] );

			return $purchase_url;
		}

		return false;
	}

	/**
	 * Check if the user has permission to execute this ajax call
	 *
	 * @param $request
	 *
	 * @return bool
	 */
	public function user_login_permission_check( $request ) {
		return ! is_user_logged_in();
	}

	/**
	 * Check if the user has permission to execute this ajax call
	 *
	 * @param $request
	 *
	 * @return bool
	 */
	public function user_register_permission_check( $request ) {
		return intval( get_option( 'users_can_register' ) );
	}

	/**
	 * Check if the user has permission to execute this ajax call
	 *
	 * @param $request
	 *
	 * @return bool
	 */
	public function user_logged_in_permission_check( $request ) {
		return intval( get_option( 'users_can_register' ) );
	}

	/**
	 * Constructs the user recover email and sends the email
	 *
	 * @param $user_data
	 *
	 * @return bool
	 */
	private function recover_password( $user_data ) {
		$user_login = $user_data->user_login;
		$user_email = $user_data->user_email;

		$key = get_password_reset_key( $user_data );

		if ( is_wp_error( $key ) ) {
			return false;
		}

		if ( is_multisite() ) {
			$site_name = get_network()->site_name;
		} else {
			/*
			 * The blogname option is escaped with esc_html on the way into the database
			 * in sanitize_option we want to reverse this for the plain text arena of emails.
			 */
			$site_name = wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES );
		}

		$message = __( 'Someone has requested a password reset for the following account:' ) . "\r\n\r\n";
		/* translators: %s: site name */
		$message .= sprintf( __( 'Site Name: %s' ), $site_name ) . "\r\n\r\n";
		/* translators: %s: user login */
		$message .= sprintf( __( 'Username: %s' ), $user_login ) . "\r\n\r\n";
		$message .= __( 'If this was a mistake, just ignore this email and nothing will happen.' ) . "\r\n\r\n";
		$message .= __( 'To reset your password, visit the following address:' ) . "\r\n\r\n";
		$message .= '<' . network_site_url( "wp-login.php?action=rp&key=$key&login=" . rawurlencode( $user_login ), 'login' ) . ">\r\n";

		/**
		 * Password Recover Email Subject
		 */
		$title = sprintf( __( '[%s] Password Reset' ), $site_name );

		return wp_mail( $user_email, wp_specialchars_decode( $title ), $message );
	}

	public function admin_permission_check( $request ) {
		return true;
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_REST_Response
	 */
	public function new_user( $request ) {
		$args = array(
			'user_email'   => $request->get_param( 'user_email' ),
			'user_login'   => $request->get_param( 'user_email' ),
			'display_name' => $request->get_param( 'display_name' ),
			'first_name'   => $request->get_param( 'display_name' ),
			'user_pass'    => '',
			'role'         => 'subscriber',
		);
		$args = array_map( 'trim', $args );

		if ( ! is_email( $request->get_param( 'user_email' ) ) ) {
			return new WP_Error( 'invalid_email', 'Invalid email' );
		}

		$user = get_user_by( 'email', $args['user_email'] );

		if ( $user instanceof WP_User ) {
			$tva_user = new TVA_User( $user->ID );
			$orders   = $tva_user->get_orders_by_status( TVA_Const::STATUS_COMPLETED );

			if ( ! empty( $orders ) ) {
				return new WP_Error( 'existing_customer', 'The customer already exists! If you want to update the user\'s access please use the Edit Access Rights option' );
			}
		} else {
			$user = wp_insert_user( $args );

			if ( $user instanceof WP_Error ) {
				return new WP_Error( 'failed_user', 'Failed to insert user ' . $args['user_email'] . '! Please try again.' );
			}
		}

		$bundle_ids     = $request->get_param( 'bundle_ids' );
		$membership_ids = $request->get_param( 'membership_ids' );

		/**
		 * No need to go further if no products are set for the customer
		 */
		if ( empty( $bundle_ids ) && empty( $membership_ids ) ) {
			return new WP_REST_Response( true, 200 );
		}

		if ( $user ) {
			$user_obj                 = get_userdata( $user instanceof WP_User ? $user->ID : $user );
			$user_obj->bundle_ids     = $bundle_ids;
			$user_obj->membership_ids = $membership_ids;

			$order = $this->tva_create_customer_order( $user_obj );

			if ( ! $order ) {
				return new WP_Error( 'order_failed', 'Failed to create order for ' . $user_obj->display_name );
			} else {
				$this->tva_send_customer_email( $user_obj );

				$args = array(
					'limit'  => TVA_Const::SENDOWL_CUSTOMERS_PER_PAGE,
					'offset' => 0,
				);

				$data = array(
					'customers' => TVA_User::get_sendowl_customers( $args ),
					'count'     => TVA_User::count_sendowl_customers( $args ),
				);

				return new WP_REST_Response( $data, 200 );
			}
		}

		return new WP_Error( 'user_failed', 'A problem has occurred while adding ' . $args['user_email'] . ' to the customers list. Please try again. If this issue persists please contact our support team' );
	}

	/**
	 * @param WP_User $customer
	 *
	 * @return bool|false|int
	 */
	public function tva_create_customer_order( $customer ) {

		if ( ! $customer instanceof WP_User ) {
			return false;
		}

		$bundles     = is_array( $customer->bundle_ids ) ? $customer->bundle_ids : array();
		$memberships = is_array( $customer->membership_ids ) ? $customer->membership_ids : array();

		if ( empty( $bundles ) && empty( $memberships ) ) {
			return 0;
		}

		$order = new TVA_Order();
		$order->set_user_id( $customer->ID );
		$order->set_gateway( TVA_Const::MANUAL_GATEWAY );
		$order->set_status( TVA_Const::STATUS_COMPLETED );

		foreach ( $bundles as $bundle ) {
			$product = TVA_SendOwl::get_bundle_by_id( $bundle );

			if ( ! $product ) {
				continue;
			}

			$product_type = 'bundle';
			$order_item   = new TVA_Order_Item();
			$order_item->set_product_id( $product['id'] );
			$order_item->set_product_name( $product['name'] );
			$order_item->set_product_type( $product_type );
			$order_item->set_product_price( $product['price'] );
			$order_item->set_currency( $product['currency_code'] );

			$order->set_order_item( $order_item );
		}

		foreach ( $memberships as $membership ) {
			$product = TVA_SendOwl::get_product_by_id( $membership );

			if ( ! $product ) {
				continue;
			}

			$product_type = $product['product_type'];
			$order_item   = new TVA_Order_Item();
			$order_item->set_product_id( $product['id'] );
			$order_item->set_product_name( $product['name'] );
			$order_item->set_product_type( $product_type );
			$order_item->set_product_price( $product['price'] );
			$order_item->set_currency( $product['currency_code'] );

			$order->set_order_item( $order_item );
		}

		return $order->save( true );
	}

	/**
	 * @param WP_User $user
	 */
	public function tva_send_customer_email( $user ) {
		global $WishListMemberInstance;

		$is_wl = class_exists( 'WishListMember3' ) && $WishListMemberInstance instanceof WishListMember3;

		if ( true === $is_wl ) {
			remove_action( 'retrieve_password', array( $WishListMemberInstance, 'RetrievePassword' ) );
		}

		$key = get_password_reset_key( $user );

		if ( true === $is_wl ) {
			add_action( 'retrieve_password', array( $WishListMemberInstance, 'RetrievePassword' ) );
		}

		if ( is_multisite() ) {
			$site_name = get_network()->site_name;
		} else {
			/*
			 * The blogname option is escaped with esc_html on the way into the database
			 * in sanitize_option we want to reverse this for the plain text arena of emails.
			 */
			$site_name = wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES );
		}

		$message = __( 'A new account has been created for you:' ) . "\r\n\r\n";
		/* translators: %s: site name */
		$message .= sprintf( __( 'Site Name: %s' ), $site_name ) . "\r\n\r\n";
		/* translators: %s: user login */
		$message .= sprintf( __( 'Username: %s' ), $user->user_login ) . "\r\n\r\n";
		$message .= __( 'To reset your password, visit the following address:' ) . "\r\n\r\n";
		$message .= '<' . network_site_url( "wp-login.php?action=rp&key=$key&login=" . rawurlencode( $user->user_login ), 'login' ) . ">\r\n";

		/**
		 * Password Recover Email Subject
		 */
		$title = sprintf( __( '[%s] New account' ), $site_name );

		wp_mail( $user->user_email, wp_specialchars_decode( $title ), $message );
	}
}
