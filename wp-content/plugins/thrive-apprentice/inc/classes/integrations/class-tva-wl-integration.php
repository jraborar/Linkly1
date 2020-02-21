<?php
/**
 * Created by PhpStorm.
 * User: dan bilauca
 * Date: 12-Apr-19
 * Time: 04:50 PM
 */

/**
 * Class TVA_WL_Integration
 * - implements TVA_Integration methods
 */
class TVA_WL_Integration extends TVA_Integration {

	protected function init_items() {

		$levels = WishListMember_Level::GetAllLevels( true );
		$items  = array();

		foreach ( $levels as $level ) {

			try {

				if ( $level instanceof WishListMember_Level ) {
					$items[] = new TVA_Integration_Item( $level->ID, $level->name );
				}
			} catch ( Exception $e ) {

			}
		}

		$this->set_items( $items );
	}

	protected function _get_item_from_membership( $key, $value ) {

		$level = new WishListMember_Level( $value );

		return new TVA_Integration_Item( $level->ID, $level->name );
	}

	/**
	 * Gets user's WishList Levels and checks if one of them can be found in rule
	 *
	 * @param array $rule
	 *
	 * @return bool
	 */
	public function is_rule_applied( $rule ) {

		$user  = tva_access_manager()->get_logged_in_user();
		$allow = false;

		if ( false === $user instanceof WP_User || false === function_exists( 'wlmapi_is_user_a_member' ) ) {
			return false;
		}

		foreach ( $rule['items'] as $item ) {

			if ( wlmapi_is_user_a_member( $item['id'], $user->ID ) ) {
				$allow = true;
				break;
			}
		}

		return $allow;
	}

	public function trigger_no_access() {

		if ( class_exists( 'WishListMember', false ) ) {
			$wl       = new WishListMember();
			$redirect = is_user_logged_in() ? $wl->WrongLevelURL() : $wl->NonMembersURL();
			wp_redirect( $redirect );
			die( 'asd' );
		}

	}
}
