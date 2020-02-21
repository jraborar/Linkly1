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
 * Class TVA_Order_Item
 */
class TVA_Order_Item {

	/**
	 * The order id
	 * @var null|int
	 */
	protected $ID = null;

	/**
	 * The order ID
	 * @var int
	 */
	protected $order_id = 0;

	/**
	 * The Gateway Order ID
	 * @var int
	 */
	protected $gateway_order_id = 0;

	/**
	 * The Gateway order item id
	 * @var int
	 */
	protected $gateway_order_item_id = 0;

	/**
	 * @var int
	 */
	protected $product_id = 0;
	/**
	 * @var string
	 */
	protected $product_type = '';
	/**
	 * @var string
	 */
	protected $product_name = '';
	/**
	 * @var int
	 */
	protected $product_price = 0;
	/**
	 * @var int
	 */
	protected $quantity = 1;
	/**
	 * @var int
	 */
	protected $unit_price = '0';
	/**
	 * @var int
	 */
	protected $total_price = '0';

	/**
	 * @var int
	 */
	protected $currency = '';

	/**
	 * @var string
	 */
	protected $valid_until = '0000-00-00 00:00:00';
	/**
	 * @var string
	 */
	protected $created_at = '0000-00-00 00:00:00';

	/**
	 * Database object
	 *
	 * @var WP_Query|wpdb
	 */
	protected $wpdb;

	/**
	 * TVA_Order_Item constructor.
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
		$sql             = 'SELECT * FROM ' . $this->wpdb->prefix . TVA_Const::DB_PREFIX . TVA_Const::ORDER_ITEMS_TABLE_NAME . ' WHERE ID = %d';
		$order_item_data = $this->wpdb->get_row( $this->wpdb->prepare( $sql, array( $this->ID ) ), ARRAY_A );

		if ( ! empty( $order_item_data ) ) {
			$this->set_data( $order_item_data );
		}
	}

	/**
	 * Return an array of all the object's properties, besides WPDB
	 * @return array
	 */
	public function get_all_object_properties() {
		$vars = get_object_vars( $this );
		unset( $vars['wpdb'] );

		return $vars;
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

		/**
		 * We don't need to map the data here because both the IPN data and DB data either come
		 * with the correct fields or need to be constructed beforehand because it's set in
		 * multiple arrays of data
		 */
		foreach ( $data as $key => $value ) {
			if ( property_exists( $this, $key ) ) {
				$fn = 'set_' . $key;
				$this->$fn( $value );
			}
		}
	}

	/**
	 * Save the data
	 * @return bool
	 */
	public function save() {
		$order_id = $this->get_order_id();

		if ( empty( $order_id ) ) {
			return false;
		}
		$data = get_object_vars( $this );
		unset( $data['wpdb'] );
		unset( $data['ID'] );

		$types = array(
			'%d',
			'%d',
			'%d',
			'%d',
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

			do_action( 'tva_before_sendowl_insert_order_item', $data, $types, $this );

			$result = $this->wpdb->insert(
				$this->wpdb->prefix . TVA_Const::DB_PREFIX . TVA_Const::ORDER_ITEMS_TABLE_NAME,
				$data,
				$types
			);

			if ( $result ) {
				$this->set_id( $this->wpdb->insert_id );
			}


		} else {

			do_action( 'tva_before_sendowl_update_order_item', $data, $types, $this );

			$result = $this->wpdb->update(
				$this->wpdb->prefix . TVA_Const::DB_PREFIX . TVA_Const::ORDER_ITEMS_TABLE_NAME,
				$data,
				array( 'ID' => $this->get_id() ),
				$types,
				array( '%d' )
			);
		}

		do_action( 'tva_after_sendowl_order_item_db', $data, $types, $this );

		return $result;
	}

	/**
	 * Delete the data
	 * @return false|int
	 */
	public function delete() {
		return $this->wpdb->delete(
			$this->wpdb->prefix . TVA_Const::DB_PREFIX . TVA_Const::ORDER_ITEMS_TABLE_NAME,
			array( 'ID' => $this->get_id() ),
			array( '%d' )
		);
	}

	/**
	 * @return int|null
	 */
	public function get_ID() {
		return $this->ID;
	}

	/**
	 * @param int|null $ID
	 */
	public function set_ID( $ID ) {
		$this->ID = (int) $ID;
	}

	/**
	 * @return int
	 */
	public function get_order_id() {
		return $this->order_id;
	}

	/**
	 * @param int $order_id
	 */
	public function set_order_id( $order_id ) {
		$this->order_id = (int) $order_id;
	}

	/**
	 * @return int
	 */
	public function get_gateway_order_id() {
		return $this->gateway_order_id;
	}

	/**
	 * @param int $gateway_order_id
	 */
	public function set_gateway_order_id( $gateway_order_id ) {
		$this->gateway_order_id = (int) $gateway_order_id;
	}

	/**
	 * @return int
	 */
	public function get_gateway_order_item_id() {
		return $this->gateway_order_item_id;
	}

	/**
	 * @param int $gateway_order_item_id
	 */
	public function set_gateway_order_item_id( $gateway_order_item_id ) {
		$this->gateway_order_item_id = (int) $gateway_order_item_id;
	}

	/**
	 * @return int
	 */
	public function get_product_id() {
		return $this->product_id;
	}

	/**
	 * @param int $product_id
	 */
	public function set_product_id( $product_id ) {
		$this->product_id = (int) $product_id;
	}

	/**
	 * @return string
	 */
	public function get_product_type() {
		return $this->product_type;
	}

	/**
	 * @param string $product_type
	 */
	public function set_product_type( $product_type ) {
		$this->product_type = $product_type;
	}

	/**
	 * @return string
	 */
	public function get_product_name() {
		return $this->product_name;
	}

	/**
	 * @param string $product_name
	 */
	public function set_product_name( $product_name ) {
		$this->product_name = $product_name;
	}

	/**
	 * @return int
	 */
	public function get_product_price() {
		return $this->product_price;
	}

	/**
	 * @param int $product_price
	 */
	public function set_product_price( $product_price ) {
		$this->product_price = $product_price;
	}

	/**
	 * @return int
	 */
	public function get_quantity() {
		return $this->quantity;
	}

	/**
	 * @param int $quantity
	 */
	public function set_quantity( $quantity ) {
		$this->quantity = (int) $quantity;
	}

	/**
	 * @return int
	 */
	public function get_unit_price() {
		return $this->unit_price;
	}

	/**
	 * @param int $unit_price
	 */
	public function set_unit_price( $unit_price ) {
		$this->unit_price = $unit_price;
	}

	/**
	 * @return int
	 */
	public function get_total_price() {
		return $this->total_price;
	}

	/**
	 * @param int $total_price
	 */
	public function set_total_price( $total_price ) {
		$this->total_price = $total_price;
	}

	/**
	 * @return int
	 */
	public function get_currency() {
		return $this->currency;
	}

	/**
	 * @param int $currency
	 */
	public function set_currency( $currency ) {
		$this->currency = $currency;
	}

	/**
	 * @return string
	 */
	public function get_valid_until() {
		return $this->valid_until;
	}

	/**
	 * @param string $valid_until
	 */
	public function set_valid_until( $valid_until ) {
		$this->valid_until = $valid_until;
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


}