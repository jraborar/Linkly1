<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-apprentice
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

/**
 * Class TVA_Order
 */
class TVA_Order {

	/**
	 * The order id
	 *
	 * @var null|int
	 */
	protected $ID = null;

	/**
	 * The user ID
	 *
	 * @var int
	 */
	protected $user_id = 0;

	/**
	 * The status of the order, should be a
	 * version of the constants in this class
	 *
	 * @var int
	 */
	protected $status = 0;

	/**
	 * Payment ID
	 *
	 * @var int
	 */
	protected $payment_id = 0;

	/**
	 * Payment Order ID
	 *
	 * @var int
	 */
	protected $gateway_order_id = 0;

	/**
	 * Gateway name
	 *
	 * @var string
	 */
	protected $gateway = '';

	/**
	 * The payment method
	 *
	 * @var string
	 */
	protected $payment_method = '';

	/**
	 * The fee from the gateway
	 *
	 * @var int
	 */
	protected $gateway_fee = 0;

	/**
	 * The email of the buyer
	 *
	 * @var string
	 */
	protected $buyer_email = '';

	/**
	 * The buyer's name
	 *
	 * @var string
	 */
	protected $buyer_name = '';

	/**
	 * The Buyer's address1
	 *
	 * @var string
	 */
	protected $buyer_address1 = '';

	/**
	 * The Buyer's address2
	 *
	 * @var string
	 */
	protected $buyer_address2 = '';

	/**
	 * The Buyer's city
	 *
	 * @var string
	 */
	protected $buyer_city = '';

	/**
	 * The Buyer's region
	 *
	 * @var string
	 */
	protected $buyer_region = '';

	/**
	 * The Buyer's postcode
	 *
	 * @var string
	 */
	protected $buyer_postcode = '';

	/**
	 * The Buyer's country code
	 *
	 * @var string
	 */
	protected $buyer_country = '';

	/**
	 * The billing address1
	 *
	 * @var string
	 */
	protected $billing_address1 = '';

	/**
	 * The billing address2
	 *
	 * @var string
	 */
	protected $billing_address2 = '';

	/**
	 * The billing city
	 *
	 * @var string
	 */
	protected $billing_city = '';

	/**
	 * The billing region
	 *
	 * @var string
	 */
	protected $billing_region = '';

	/**
	 * The billing postcode
	 *
	 * @var string
	 */
	protected $billing_postcode = '';

	/**
	 * The billing country code
	 *
	 * @var string
	 */
	protected $billing_country = '';

	/**
	 * The shipping address1
	 *
	 * @var string
	 */
	protected $shipping_address1 = '';

	/**
	 * Shipping address2
	 *
	 * @var string
	 */
	protected $shipping_address2 = '';

	/**
	 * @var string
	 */
	protected $shipping_city = '';

	/**
	 * Shipping region
	 *
	 * @var string
	 */
	protected $shipping_region = '';

	/**
	 * Shipping post code
	 *
	 * @var string
	 */
	protected $shipping_postcode = '';

	/**
	 * Shipping country
	 *
	 * @var string
	 */
	protected $shipping_country = '';

	/**
	 * The IP address of the buyer
	 *
	 * @var string
	 */
	protected $buyer_ip_address = '';

	/**
	 * Order is free or not
	 *
	 * @var int
	 */
	protected $is_gift = 0;

	/**
	 * The net price of the order
	 *
	 * @var int
	 */
	protected $price = 0;

	/**
	 * The Gross Price of the order
	 *
	 * @var int
	 */
	protected $price_gross = 0;

	/**
	 * The currency of the order
	 *
	 * @var string
	 */
	protected $currency = '';

	/**
	 * When was the order first created
	 *
	 * @var string
	 */
	protected $created_at = '0000-00-00 00:00:00';

	/**
	 * When was the order last updated
	 *
	 * @var string
	 */
	protected $updated_at = '0000-00-00 00:00:00';

	/**
	 * All the items attached to this order
	 *
	 * @var array $order_items
	 */
	protected $order_items = array();

	/**
	 * Database object
	 *
	 * @var WP_Query|wpdb
	 */
	protected $wpdb;

	/**
	 * TVA_Order constructor.
	 *
	 * @param null $ID
	 */
	public function __construct( $ID = null ) {
		global $wpdb;

		$this->wpdb = $wpdb;
		/**
		 * Skip everything else if we don't have any order id
		 */
		if ( ! $ID ) {
			$this->set_created_at( date( 'Y-m-d H:i:s' ) );

			return;
		}

		$this->set_ID( $ID );
		$this->get_data();
	}

	/**
	 * Get the data from the DB
	 */
	protected function get_data() {
		$sql        = 'SELECT * FROM ' . $this->wpdb->prefix . TVA_Const::DB_PREFIX . TVA_Const::ORDERS_TABLE_NAME . ' WHERE ID = %d';
		$order_data = $this->wpdb->get_row( $this->wpdb->prepare( $sql, array( $this->ID ) ), ARRAY_A );

		if ( ! empty( $order_data ) ) {
			$this->set_data( $order_data );
		}
	}

	/**
	 * Set the data
	 *
	 * @param $data
	 */
	public function set_data( $data ) {

		if ( is_object( $data ) ) {
			$data = (array) $data;
		}

		$data = $this->prepare_data( $data );

		foreach ( $data as $key => $value ) {

			if ( property_exists( $this, $key ) ) {
				$fn = 'set_' . $key;
				$this->$fn( $value );
			}
		}

		$this->set_order_items();
	}

	/**
	 * Map and prepare the data for setting in the object
	 *
	 * @param $data
	 *
	 * @return mixed
	 */
	protected function prepare_data( $data ) {

		foreach ( $data as $key => $value ) {
			/**
			 * Try to map the data
			 */
			if ( $key == 'id' ) {
				$data['payment_id'] = $value;
			}

			if ( $key == 'settled_currency' ) {
				$data['currency'] = $value;
			}

			if ( $key == 'price_at_checkout' ) {
				$data['price'] = $value;
			}

			if ( $key == 'settled_gateway_fee' ) {
				$data['gateway_fee'] = $value;
			}

			if ( $key == 'settled_gross' ) {
				$data['price_gross'] = $value;
			}

			if ( $key == 'sendowl_order_id' ) {
				$data['gateway_order_id'] = $value;
			}

			if ( $key == 'cart' ) {
				$data['updated_at'] = date( 'Y-m-d H:i:s', strtotime( $value->completed_checkout_at ) );
			}

			/**
			 * check if it's a gift
			 */
			if ( ! isset( $data['is_gift'] ) ) {
				$data['is_gift'] = empty( $data['gift_order'] ) ? 0 : 1;
			}
		}

		return $data;
	}

	/**
	 * Return all order items
	 *
	 * @return array
	 */
	public function get_order_items() {
		return $this->order_items;
	}

	/**
	 * Return Order item by ID
	 *
	 * @param $ID
	 *
	 * @return bool|mixed|TVA_Order_Item
	 */
	public function get_order_item_by_product_id( $ID ) {
		foreach ( $this->order_items as $order_item ) {
			/** @var TVA_Order_Item $order_item */
			if ( $order_item->get_product_id() == $ID ) {
				return $order_item;
			}
		}

		return false;
	}

	/**
	 * Add an Order Item
	 *
	 * @param TVA_Order_Item $item
	 */
	public function set_order_item( TVA_Order_Item $item ) {
		$this->order_items[] = $item;
	}

	/**
	 * Remove an Order Item
	 *
	 * @param TVA_Order_Item $item
	 */
	public function unset_order_item( TVA_Order_Item $item ) {
		foreach ( $this->order_items as $key => $order_item ) {
			/** @var TVA_Order_Item $order_item */
			if ( $order_item->get_product_id() == $item->get_product_id() ) {
				unset( $this->order_items[ $key ] );
			}
		}
	}

	/**
	 * Add multiple Order items from data
	 *
	 * @param $order_items
	 */
	public function set_order_items_from_data( $order_items ) {
		foreach ( $order_items as $item ) {
			/**
			 * Make sure we have an order item instance
			 */
			if ( ! $item instanceof TVA_Order_Item ) {
				$data = $item;
				$item = new TVA_Order_Item( $data['ID'] );
				$item->set_data( $data );

			}
			$this->set_order_item( $item );
		}
	}

	/**
	 * Set the Order Items from the DB
	 */
	protected function set_order_items() {
		if ( $this->ID ) {
			$sql         = 'SELECT * FROM ' . $this->wpdb->prefix . TVA_Const::DB_PREFIX . TVA_Const::ORDER_ITEMS_TABLE_NAME . ' WHERE order_id = %d';
			$order_items = $this->wpdb->get_results( $this->wpdb->prepare( $sql, array( $this->ID ) ), ARRAY_A );

			if ( ! empty( $order_items ) ) {
				foreach ( $order_items as $order_item ) {
					$has_item = false;
					foreach ( $this->get_order_items() as $set_order_item ) {
						if ( $set_order_item->get_id() == $order_item['ID'] ) {
							$has_item = true;
						}
					}
					if ( ! $has_item ) {
						$item = new TVA_Order_Item( $order_item['ID'] );
						$item->set_data( $order_item );
						$this->set_order_item( $item );
					}

				}
			}
		}
	}

	/**
	 * Save object data
	 *
	 * @param bool $with_items
	 *
	 * @return false|int
	 */
	public function save( $with_items = true ) {

		$data = get_object_vars( $this );
		unset( $data['wpdb'] );
		unset( $data['order_items'] );
		unset( $data['ID'] );
		$types = array(
			'%d',
			'%d',
			'%s',
			'%d',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%d',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
		);
		if ( ! $this->get_id() ) {

			do_action( 'tva_before_sendowl_insert_order', $data, $types, $this );

			$result = $this->wpdb->insert(
				$this->wpdb->prefix . TVA_Const::DB_PREFIX . TVA_Const::ORDERS_TABLE_NAME,
				$data,
				$types
			);


			if ( $result ) {
				$this->set_id( $this->wpdb->insert_id );
			}


		} else {
			do_action( 'tva_before_sendowl_update_order', $data, $types, $this );

			$result = $this->wpdb->update(
				$this->wpdb->prefix . TVA_Const::DB_PREFIX . TVA_Const::ORDERS_TABLE_NAME,
				$data,
				array( 'ID' => $this->get_id() ),
				$types,
				array( '%d' )
			);
		}

		do_action( 'tva_after_sendowl_order_db', $data, $types, $this );

		if ( ! $result ) {
			return false;
		}

		if ( $with_items ) {

			foreach ( $this->get_order_items() as $order_item ) {
				/** @var TVA_Order_Item $order_item */
				$order_item->set_order_id( $this->get_id() );

				/**
				 * Wordpress returns false if you update a row with the same data,
				 * so we need to check this in order to be sure that we need to save
				 * the data and not return a false negative response to the caller
				 */
				$diff = array( 'data' ); //set some data so diff would save when we don't have an ID
				if ( $order_item->get_id() ) {
					$old_order_item = new TVA_Order_Item( $order_item->get_id() );
					$old_data       = $old_order_item->get_all_object_properties();
					$new_data       = $order_item->get_all_object_properties();

					$diff = array_diff( $new_data, $old_data );
				}

				if ( ! empty( $diff ) ) {
					$result = $order_item->save();

					if ( ! $result ) {
						return false;
					}
				}
			}
		}


		return $this->get_id();
	}

	/**
	 * @return int|null
	 */
	public function get_id() {
		return $this->ID;
	}

	/**
	 * @param int|null $id
	 */
	public function set_id( $id ) {
		$this->ID = (int) $id;
	}

	/**
	 * @return null
	 */
	public function get_user_id() {
		return $this->user_id;
	}

	/**
	 * @param null $user_id
	 */
	public function set_user_id( $user_id ) {
		$this->user_id = (int) $user_id;
	}

	/**
	 * @return int
	 */
	public function get_status() {
		return $this->status;
	}

	/**
	 * @param $status
	 */
	public function set_status( $status ) {
		$this->status = (int) $status;
	}

	/**
	 * @return null
	 */
	public function get_payment_id() {
		return $this->payment_id;
	}

	/**
	 * @param null $payment_id
	 */
	public function set_payment_id( $payment_id ) {
		$this->payment_id = $payment_id;
	}

	/**
	 * @return null
	 */
	public function get_gateway_order_id() {
		return $this->gateway_order_id;
	}

	/**
	 * @param null $gateway_order_id
	 */
	public function set_gateway_order_id( $gateway_order_id ) {
		$this->gateway_order_id = (int) $gateway_order_id;
	}

	/**
	 * @return null
	 */
	public function get_gateway() {
		return $this->gateway;
	}

	/**
	 * @param null $gateway
	 */
	public function set_gateway( $gateway ) {
		$this->gateway = $gateway;
	}

	/**
	 * @return null
	 */
	public function get_payment_method() {
		return $this->payment_method;
	}

	/**
	 * @param null $payment_method
	 */
	public function set_payment_method( $payment_method ) {
		$this->payment_method = $payment_method;
	}

	/**
	 * @return null
	 */
	public function get_gateway_fee() {
		return $this->gateway_fee;
	}

	/**
	 * @param null $gateway_fee
	 */
	public function set_gateway_fee( $gateway_fee ) {
		$this->gateway_fee = $gateway_fee;
	}

	/**
	 * @return null
	 */
	public function get_buyer_email() {
		return $this->buyer_email;
	}

	/**
	 * @param null $buyer_email
	 */
	public function set_buyer_email( $buyer_email ) {
		$this->buyer_email = $buyer_email;
	}

	/**
	 * @return null
	 */
	public function get_buyer_name() {
		return $this->buyer_name;
	}

	/**
	 * @param null $buyer_name
	 */
	public function set_buyer_name( $buyer_name ) {
		$this->buyer_name = $buyer_name;
	}

	/**
	 * @return null
	 */
	public function get_buyer_address() {
		return $this->buyer_address1 . ' ' . $this->billing_address2;
	}

	/**
	 * @param null $buyer_address1
	 */
	public function set_buyer_address1( $buyer_address1 ) {
		$this->buyer_address1 = $buyer_address1;
	}

	/**
	 * @param null $buyer_address2
	 */
	public function set_buyer_address2( $buyer_address2 ) {
		$this->buyer_address2 = $buyer_address2;
	}

	/**
	 * @return null
	 */
	public function get_buyer_city() {
		return $this->buyer_city;
	}

	/**
	 * @param null $buyer_city
	 */
	public function set_buyer_city( $buyer_city ) {
		$this->buyer_city = $buyer_city;
	}

	/**
	 * @return null
	 */
	public function get_buyer_region() {
		return $this->buyer_region;
	}

	/**
	 * @param null $buyer_region
	 */
	public function set_buyer_region( $buyer_region ) {
		$this->buyer_region = $buyer_region;
	}

	/**
	 * @return null
	 */
	public function get_buyer_postcode() {
		return $this->buyer_postcode;
	}

	/**
	 * @param null $buyer_postcode
	 */
	public function set_buyer_postcode( $buyer_postcode ) {
		$this->buyer_postcode = $buyer_postcode;
	}

	/**
	 * @return null
	 */
	public function get_buyer_country() {
		return $this->buyer_country;
	}

	/**
	 * @param null $buyer_country
	 */
	public function set_buyer_country( $buyer_country ) {
		$this->buyer_country = $buyer_country;
	}

	/**
	 * @return null
	 */
	public function get_billing_address() {
		return $this->billing_address1 . ' ' . $this->billing_address2;
	}

	/**
	 * @param null $billing_address1
	 */
	public function set_billing_address1( $billing_address1 ) {
		$this->billing_address1 = $billing_address1;
	}

	/**
	 * @param null $billing_address2
	 */
	public function set_billing_address2( $billing_address2 ) {
		$this->billing_address2 = $billing_address2;
	}

	/**
	 * @return null
	 */
	public function get_billing_city() {
		return $this->billing_city;
	}

	/**
	 * @param null $billing_city
	 */
	public function set_billing_city( $billing_city ) {
		$this->billing_city = $billing_city;
	}

	/**
	 * @return null
	 */
	public function get_billing_region() {
		return $this->billing_region;
	}

	/**
	 * @param null $billing_region
	 */
	public function set_billing_region( $billing_region ) {
		$this->billing_region = $billing_region;
	}

	/**
	 * @return null
	 */
	public function get_billing_postcode() {
		return $this->billing_postcode;
	}

	/**
	 * @param null $billing_postcode
	 */
	public function set_billing_postcode( $billing_postcode ) {
		$this->billing_postcode = $billing_postcode;
	}

	/**
	 * @return null
	 */
	public function get_billing_country() {
		return $this->billing_country;
	}

	/**
	 * @param null $billing_country
	 */
	public function set_billing_country( $billing_country ) {
		$this->billing_country = $billing_country;
	}

	/**
	 * @return null
	 */
	public function get_shipping_address() {
		return $this->shipping_address1 . ' ' . $this->shipping_address2;
	}

	/**
	 * @param null $shipping_address1
	 */
	public function set_shipping_address1( $shipping_address1 ) {
		$this->shipping_address1 = $shipping_address1;
	}

	/**
	 * @param null $shipping_address2
	 */
	public function set_shipping_address2( $shipping_address2 ) {
		$this->shipping_address2 = $shipping_address2;
	}

	/**
	 * @return null
	 */
	public function get_shipping_city() {
		return $this->shipping_city;
	}

	/**
	 * @param null $shipping_city
	 */
	public function set_shipping_city( $shipping_city ) {
		$this->shipping_city = $shipping_city;
	}

	/**
	 * @return null
	 */
	public function get_shipping_region() {
		return $this->shipping_region;
	}

	/**
	 * @param null $shipping_region
	 */
	public function set_shipping_region( $shipping_region ) {
		$this->shipping_region = $shipping_region;
	}

	/**
	 * @return null
	 */
	public function get_shipping_postcode() {
		return $this->shipping_postcode;
	}

	/**
	 * @param null $shipping_postcode
	 */
	public function set_shipping_postcode( $shipping_postcode ) {
		$this->shipping_postcode = $shipping_postcode;
	}

	/**
	 * @return null
	 */
	public function get_shipping_country() {
		return $this->shipping_country;
	}

	/**
	 * @param null $shipping_country
	 */
	public function set_shipping_country( $shipping_country ) {
		$this->shipping_country = $shipping_country;
	}

	/**
	 * @return null
	 */
	public function get_buyer_ip_address() {
		return $this->buyer_ip_address;
	}

	/**
	 * @param null $buyer_ip_address
	 */
	public function set_buyer_ip_address( $buyer_ip_address ) {
		$this->buyer_ip_address = $buyer_ip_address;
	}

	/**
	 * @return int
	 */
	public function get_is_gift() {
		return $this->is_gift;
	}

	/**
	 * @param int $is_gift
	 */
	public function set_is_gift( $is_gift ) {
		$this->is_gift = (int) $is_gift;
	}

	/**
	 * @return null
	 */
	public function get_price() {
		return $this->price;
	}

	/**
	 * @param null $price
	 */
	public function set_price( $price ) {
		$this->price = $price;
	}

	/**
	 * @return null
	 */
	public function get_price_gross() {
		return $this->price_gross;
	}

	/**
	 * @param null $price_gross
	 */
	public function set_price_gross( $price_gross ) {
		$this->price_gross = $price_gross;
	}

	/**
	 * @return null
	 */
	public function get_currency() {
		return $this->currency;
	}

	/**
	 * @param null $currency
	 */
	public function set_currency( $currency ) {
		$this->currency = $currency;
	}

	/**
	 * @return string
	 */
	public function get_created_at() {
		return $this->created_at;
	}

	/**
	 * @param string $created_at
	 */
	public function set_created_at( $created_at ) {
		$this->created_at = $created_at;
	}

	/**
	 * @return string
	 */
	public function get_updated_at() {
		return $this->updated_at;
	}

	/**
	 * @param string $updated_at
	 */
	public function set_updated_at( $updated_at ) {
		$this->updated_at = $updated_at;
	}
}
