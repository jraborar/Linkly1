<?php
/**
 * Created by PhpStorm.
 * User: dan bilauca
 * Date: 16-May-19
 * Time: 01:43 PM
 */

/**
 * Keeps the common logic for both SendOwl Products and SendOwl Bundle Integration
 * Class TVA_SendOwl_Integration
 */
abstract class TVA_SendOwl_Integration extends TVA_Integration {

	/**
	 * Checks if TVA_User has a TVA_Order with a TVA_Order_Item which has a product ID from rule
	 *
	 * @param array $rule
	 *
	 * @return bool
	 */
	public function is_rule_applied( $rule ) {

		$allowed  = false;
		$tva_user = tva_access_manager()->get_tva_user();

		if ( true === $tva_user instanceof TVA_User ) {
			foreach ( $rule['items'] as $item ) {
				if ( $tva_user->has_bought( (int) $item['id'] ) ) {
					$allowed = true;
					break;
				}
			}
		}

		return $allowed;
	}

	/**
	 * For this do nothing so that the WP Login Form is displayed
	 */
	public function trigger_no_access() {
	}
}
