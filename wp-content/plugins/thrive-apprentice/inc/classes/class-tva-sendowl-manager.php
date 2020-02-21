<?php
/**
 * Created by PhpStorm.
 * User: User
 * Date: 4/24/2019
 * Time: 16:56
 */

class TVA_Sendowl_Manager {

	/**
	 * TVA_Sendowl_Manager constructor.
	 */
	public function __construct() {
		$this->hooks();
	}

	public function hooks() {
		add_action( 'init', array( $this, 'check_sendowl_products' ) );
	}

	/**
	 * Check if products and bundles received from sendowl api must be parsed and updated as needed for further use
	 */
	public function check_sendowl_products() {
		$checked = get_option( 'tva_sendowl_products_updated', false );

		if ( 1 === (int) $checked ) {
			return;
		}

		self::update_sendowl_products();
	}

	/**
	 * Update sendowl products. Here we have them into a format we can use further in TA
	 */
	public static function update_sendowl_products() {
		update_option( 'tva_sendowl_products', self::get_updated_products() );
		update_option( 'tva_sendowl_products_updated', 1 );
	}

	/**
	 * This method will return an array which contains both products and bundles received from sendowl api
	 *
	 * It will also contain the $protected_terms prop which include any course protected by a given product
	 *
	 * @return array
	 */
	public static function get_updated_products() {
		$new_products = TVA_Products_Collection::make( self::get_products_from_transient() );
		$old_products = TVA_Products_Collection::make( self::get_products() );

		foreach ( $old_products->get_items() as $item ) {
			/** @var TVA_Model $item */

			! $new_products->get_from_key( $item->get_id() )
				? $old_products->remove( $item->get_id() )  //The item no longer exist in sendowl so we don't need it anymore
				: $new_products->remove( $item->get_id() ); //We don't need the item among the new items if it's among the old items
		}

		return array_merge( $new_products->prepare_for_db(), $old_products->prepare_for_db() );
	}

	/**
	 * Get both products and bundles from transients
	 *
	 * @return array
	 */
	public static function get_products_from_transient() {
		$products = TVA_Products_Collection::make( TVA_SendOwl::get_products() );
		$bundles  = TVA_Bundles_Collection::make( TVA_SendOwl::get_bundles() );

		foreach ( $products->get_items() as $key => $item ) {
			/** @var TVA_Product_Model $item */
			$item->set_protected_terms();

			$products->set( $key, $item );
		}

		foreach ( $bundles->get_items() as $key => $item ) {
			/** @var TVA_Bundle_Model $item */
			$item->set_protected_terms();

			$bundles->set( $key, $item );
		}

		return array_merge( $products->prepare_for_db(), $bundles->prepare_for_db() );
	}

	/**
	 * @return array
	 */
	public static function get_products() {
		return get_option( 'tva_sendowl_products', array() );
	}
}

new TVA_Sendowl_Manager();
