<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-apprentice
 *
 * This file is included if TAr does not exists as plugin and is not activated
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

/**
 * if the plugin-core.php file has not yet been included, include it here
 */

require_once dirname( dirname( __FILE__ ) ) . '/tcb/external-architect.php';

/**
 * This will add the "tve_custom_style" div usable for TCB editor CSS code
 */
add_action( 'wp_head', 'tve_load_custom_css', 100, 0 );

add_filter( 'tcb_post_types', 'tva_tcb_post_types', 100 );

/**
 * @param $blacklist_post_types
 *
 * @return mixed
 */
function tva_tcb_post_types( $blacklist_post_types ) {

	global $post;

	/**
	 * if page, the it might be checkout page then
	 * return null for force_whitelist and so letting tva_post_editable() apply its logic
	 *
	 * @see tva_post_editable()
	 */
	if ( $post->post_type === 'page' ) {
		$blacklist_post_types['force_whitelist'] = null;

		return $blacklist_post_types;
	}

	$blacklist_post_types['force_whitelist'] = isset( $blacklist_post_types['force_whitelist'] ) ? $blacklist_post_types['force_whitelist'] : array();
	$blacklist_post_types['force_whitelist'] = array_merge( $blacklist_post_types['force_whitelist'], array(
		'apprentice_pages',
		TVA_Const::LESSON_POST_TYPE,
	) );

	return $blacklist_post_types;
}
