<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-apprentice
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}
if ( isset( $_REQUEST['s'] ) && ! empty ( $_REQUEST['s'] ) ) {
	$tva_search_crit = $_REQUEST['s'];
}
if ( isset( $_REQUEST['tvas'] ) && ! empty ( $_REQUEST['tvas'] ) ) {
	$tva_search_crit = $_REQUEST['tvas'];
}
?>

<div class="tva_ob_error">
	<?php echo '<span class="tva-err-text">' . __( 'There are no courses matching your criteria: ', TVA_Const::T ) . '</span>'; ?>
	<?php echo '<span class="tva-strong-text">' . $tva_search_crit . '</span>'; ?>
	<?php echo '<span class="tva-err-text">' . __( 'Please change or delete the search criteria.', TVA_Const::T ) . '</span>'; ?>
</div>
