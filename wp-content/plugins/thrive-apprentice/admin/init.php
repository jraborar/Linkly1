<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-university
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

require_once dirname( __FILE__ ) . '/functions.php';

/**
 * HOOKS
 */
/**
 * Initiate the admmin
 */
add_action( 'admin_init', 'tva_admin_init' );

/**
 * Enqueue admin scripts
 */
add_action( 'admin_enqueue_scripts', 'tva_admin_enqueue_scripts' );

/**
 * FILTERS
 */
/**
 * Add to the dash menu
 */
add_filter( 'tve_dash_admin_product_menu', 'tva_admin_menu' );

/**
 * like homepage or blog page we display a label for checkout and thank you page
 */
add_filter( 'display_post_states', 'tva_display_post_states', 10, 2 );
