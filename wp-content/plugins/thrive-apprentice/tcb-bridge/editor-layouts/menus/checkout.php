<?php
/**
 * Created by PhpStorm.
 * User: Ovidiu
 * Date: 10/15/2018
 * Time: 5:18 PM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}
$apis = Thrive_Dash_List_Manager::getAvailableAPIs( true, array(), true );

$extra_class = '';
?>

<div id="tve-checkout-component" class="tve-component" data-view="checkout">
	<div class="dropdown-header" data-prop="docked">
		<?php echo __( 'Checkout Options', TVA_Const::T ); ?>
		<i></i>
	</div>
	<div class="dropdown-content">
		<div class="tve-control no-space" data-view="AddRemoveLabels"></div>
		<div class="tcb-text-center margin-top-10">
			<button class="tve-button blue long click" data-fn="edit_checkout_elements"><?php echo __( 'EDIT CHECKOUT ELEMENTS', TVA_Const::T ); ?></button>
		</div>
		<hr>
		<?php if ( empty( $apis['sendowl'] ) ) : ?>
			<?php $extra_class = ' tcb-hidden'; ?>
			<div class="margin-top-10 no_payment_warning">
				<?php echo sprintf( __( 'You don’t have any payment processors connected, %s to set up a connection', TVA_Const::T ), '<a target="_blank" href="' . admin_url( 'admin.php?page=tve_dash_section' ) . '">' . __( 'click here', TVA_Const::T ) . '</a>' ); ?>
			</div>
		<?php endif; ?>
		<div class="tve-control<?php echo $extra_class; ?>" data-view="payment_provider"></div>
		<div class="tve-advanced-controls extend-grey">
			<div class="dropdown-header" data-prop="advanced">
				<span>
					<?php echo __( 'Advanced', TVA_Const::T ); ?>
				</span>
				<i></i>
			</div>
			<div class="dropdown-content clear-top">
				<button class="tve-button blue long click" data-fn="manage_error_messages">
					<?php echo __( 'Edit error messages', TVA_Const::T ); ?>
				</button>
			</div>
		</div>
	</div>
</div>
