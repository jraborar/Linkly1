<?php
/**
 * Created by PhpStorm.
 * User: dan bilauca
 * Date: 12-Apr-19
 * Time: 01:55 PM
 */

abstract class TVA_Integration {

	private $_items = array();

	protected $_slug;

	protected $_label;

	/**
	 * Where some ids where stored for each membership plugin
	 *
	 * @var string Term/Course meta name
	 */
	protected $_course_membership_meta_name = 'tva_membership_ids';

	/**
	 * membership plugin key under which where stored some ids
	 *
	 * @var string
	 */
	protected $_membership_key = '';

	/**
	 * @var WP_Post
	 */
	protected $_post;

	/**
	 * TVA_Integration constructor.
	 *
	 * @param string $slug
	 * @param string $label
	 */
	final public function __construct( $slug, $label ) {

		$this->_slug  = $slug;
		$this->_label = $label;

		/**
		 * if not defined then overwrite it with slug
		 */
		if ( empty( $this->_membership_key ) ) {
			$this->_membership_key = $slug;
		}

		$this->init_items();
	}

	/**
	 * Has to be implemented for each specific/extended integration
	 * - each integration has to have its items
	 *
	 * @return void
	 */
	abstract protected function init_items();

	/**
	 * Based on what was saved in DB before implementing the new Access Rules
	 * - builds an integration item instance to be used for a access rule
	 *
	 * @param $key   mixed
	 * @param $value mixed
	 *
	 * @return TVA_Integration_Item
	 */
	abstract protected function _get_item_from_membership( $key, $value );

	protected function set_items( $items ) {

		if ( ! is_array( $items ) ) {
			return false;
		}

		foreach ( $items as $item ) {
			if ( $item instanceof TVA_Integration_Item ) {
				$this->_items[] = $item;
			}
		}

		return true;
	}

	/**
	 * @param bool $as_array
	 *
	 * @return array
	 */
	public function get_items( $as_array = false ) {

		$items = array();

		if ( true === $as_array ) {
			/** @var TVA_Integration_Item $item */
			foreach ( $this->_items as $item ) {
				$items[] = array(
					'id'   => $item->get_id(),
					'name' => $item->get_name(),
				);
			}
		}

		return $as_array ? $items : $this->_items;
	}

	public function get_slug() {

		return $this->_slug;
	}

	public function get_label() {

		return $this->_label;
	}

	/**
	 * Based on old membership data returns a new rule which will be backwards compatible
	 * with new system of access restrictions
	 *
	 * @param $course TVA_Course
	 *
	 * @return array rule
	 */
	public function get_old_rule( $course ) {

		$membership_id = get_term_meta( $course->get_id(), $this->_course_membership_meta_name, true );

		$rule = array(
			'integration' => $this->get_slug(),
			'items'       => array(),
		);

		if ( ! empty( $membership_id ) && is_array( $membership_id ) && isset( $membership_id[ $this->_membership_key ] ) ) {
			foreach ( $membership_id[ $this->_membership_key ] as $key => $value ) {
				try {
					$item = $this->_get_item_from_membership( $key, $value );

					if ( false === $item instanceof TVA_Integration_Item ) {
						throw new Exception( 'Invalid item to be added for a rule' );
					}

					$rule['items'][] = $item;
				} catch ( Exception $e ) {

				}
			}
		}

		return $rule;
	}

	public function append_rule( $rule, &$new_rules ) {

		try {

			if ( empty( $rule['integration'] ) || false === is_string( $rule['integration'] ) ) {
				throw new Exception( 'Integration for rule invalid' );
			}

			if ( empty( $rule['items'] ) || ! is_array( $rule['items'] ) ) {
				throw new Exception( 'Rule with empty items' );
			}

			$items = array();

			/** @var TVA_Integration_Item $item */
			foreach ( $rule['items'] as $item ) {

				if ( true === $item instanceof TVA_Integration_Item ) {

					$items[] = array(
						'id'   => $item->get_id(),
						'name' => $item->get_name(),
					);
				}
			}

			$new_rules[] = array(
				'integration' => $rule['integration'],
				'items'       => $items,
			);
		} catch ( Exception $e ) {

		}

		return $new_rules;
	}

	/**
	 * Removes the old rule so that the new system of rules can be applied
	 *
	 * @param $course_id int
	 *
	 * @return bool
	 */
	public function remove_old_rule( $course_id ) {

		$deleted    = false;
		$course_id  = (int) $course_id;
		$membership = null;

		if ( $course_id ) {
			$membership = get_term_meta( $course_id, $this->_course_membership_meta_name, true );
		}

		if ( is_array( $membership ) && ! empty( $membership[ $this->_membership_key ] ) ) {
			unset( $membership[ $this->_membership_key ] );
			$result = update_term_meta( $course_id, $this->_course_membership_meta_name, $membership );

			$deleted = is_int( $result ) || $result === true;
		}

		return $deleted;
	}

	/**
	 * Checks if a rule is applicable
	 * - fallback for children implementations
	 *
	 * @param array $rule
	 *
	 * @return bool
	 */
	public function is_rule_applied( $rule ) {

		return true;
	}

	/**
	 * When user has no access to the post
	 * Then the integration should take control and do something
	 * - redirect user to login form
	 */
	public function trigger_no_access() {

		$admin_url = get_admin_url();
		wp_redirect( $admin_url );
		die;
	}

	/**
	 * On saving rules this method is called for each integration from the rules array
	 *
	 * @param int   $course_id
	 * @param array $rule {integration,[items]}
	 *
	 * @see TVA_Integrations_Manager::save_rules()
	 */
	public function before_saving_rule( $course_id, $rule ) {
	}

	/**
	 * Set post for later use
	 * - used to check if a rule is applied
	 *
	 * @param WP_Post $post
	 *
	 * @see is_rule_applied()
	 */
	public function set_post( $post ) {

		if ( $post instanceof WP_Post ) {
			$this->_post = $post;
		}
	}
}
