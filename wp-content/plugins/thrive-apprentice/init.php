<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-apprentice
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

require_once dirname( __FILE__ ) . '/class-tva-const.php';
require_once dirname( __FILE__ ) . '/inc/classes/logger/class-tva-logger.php';
require_once dirname( __FILE__ ) . '/inc/classes/payment_gateways/class-tva-payment-init.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-term-query.php';
require_once dirname( __FILE__ ) . '/inc/classes/models/class-tva-model.php';
require_once dirname( __FILE__ ) . '/inc/classes/models/class-tva-term-model.php';
require_once dirname( __FILE__ ) . '/inc/classes/models/class-tva-product-model.php';
require_once dirname( __FILE__ ) . '/inc/classes/models/class-tva-bundle-model.php';
require_once dirname( __FILE__ ) . '/inc/classes/collections/class-tva-collection.php';
require_once dirname( __FILE__ ) . '/inc/classes/collections/class-tva-terms-collection.php';
require_once dirname( __FILE__ ) . '/inc/classes/collections/class-tva-products-collection.php';
require_once dirname( __FILE__ ) . '/inc/classes/collections/class-tva-bundles-collection.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-term.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-course.php';
require_once dirname( __FILE__ ) . '/inc/functions.php';
require_once dirname( __FILE__ ) . '/inc/class-tva-db.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-settings.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-sendowl-settings.php';
require_once dirname( __FILE__ ) . '/inc/hooks.php';
require_once dirname( __FILE__ ) . '/inc/helpers.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-rest-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-topics-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-labels-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-levels-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-courses-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-lessons-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-settings-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-frontend-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-user-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-chapters-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-modules-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-logs-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-stacks-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/endpoints/class-tva-sendowl-settings-controller.php';
require_once dirname( __FILE__ ) . '/inc/classes/payment_gateways/abstract/class-tva-abstract-payment-gateway.php';
require_once dirname( __FILE__ ) . '/inc/classes/payment_gateways/abstract/class-tva-abstract-process-order.php';
require_once dirname( __FILE__ ) . '/inc/classes/payment_gateways/class-tva-sendowl-payment-gateway.php';
require_once dirname( __FILE__ ) . '/inc/classes/payment_gateways/class-tva-sendowl-process-order.php';
require_once dirname( __FILE__ ) . '/inc/classes/payment_gateways/class-tva-order.php';
require_once dirname( __FILE__ ) . '/inc/classes/payment_gateways/class-tva-order-item.php';
require_once dirname( __FILE__ ) . '/inc/classes/payment_gateways/class-tva-transaction.php';
require_once dirname( __FILE__ ) . '/inc/classes/payment_gateways/class-tva-user.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-shortcodes.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-privacy.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-sendowl.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-checkout.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-thankyou.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-cookie-manager.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-sendowl-manager.php';
require_once dirname( __FILE__ ) . '/tcb-bridge/tcb-hooks.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-post.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-module.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-lesson.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-chapter.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-integration-item.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-unknown-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-wp-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-wl-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-sendowl-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-sendowl-product-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-sendowl-bundle-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-memberpress-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-membermouse-abstract-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-membermouse-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-membermouse-bundle-integration.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-integrations-manager.php';
require_once dirname( __FILE__ ) . '/inc/classes/integrations/class-tva-access-manager.php';
require_once dirname( __FILE__ ) . '/inc/classes/class-tva-manager.php';


global $tva_checkout;
$tva_checkout = new TVA_Checkout();
new TVA_Thankyou();

/**
 * At this point we need to either hook into an existing Content Builder plugin or use the copy we store in the tcb folder
 */
include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
// Fix for PHP 5.2<=
if ( ! defined( 'JSON_OBJECT_AS_ARRAY' ) ) {
	define( 'JSON_OBJECT_AS_ARRAY', 1 );
}

$tcb_file_exists   = file_exists( dirname( dirname( __FILE__ ) ) . '/thrive-visual-editor/thrive-visual-editor.php' );
$tcb_plugin_active = is_plugin_active( 'thrive-visual-editor/thrive-visual-editor.php' );
if ( false === $tcb_file_exists || false === $tcb_plugin_active ) {
	require_once dirname( __FILE__ ) . '/tcb-bridge/init.php';
}
