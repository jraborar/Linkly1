<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package TCB2.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}
?>
<div id="tve-lead_generation_textarea-component" class="tve-component" data-view="LeadGenerationTextarea">
	<div class="dropdown-header" data-prop="docked">
		<?php echo __( 'Main Options', 'thrive-cb' ); ?>
		<i></i>
	</div>
	<div class="dropdown-content">
		<div class="tve-control tcb-icon-side-wrapper" data-key="icon_side" data-icon="true" data-view="ButtonGroup"></div>
		<div class="tcb-text-center mt-10" data-icon="true">
			<span class="click tcb-text-uppercase clear-format" data-fn="remove_icon">
				<?php tcb_icon( 'close2' ) ?>&nbsp;<?php echo __( 'Remove Input Icon', 'thrive-cb' ) ?>
			</span>
		</div>
		<div class="tve-control" data-icon="false"  data-view="ModalPicker"></div>
		<hr>
		<div class="tve-control" data-key="placeholder" data-view="LabelInput"></div>
		<hr>
		<div class="tve-control" data-key="required" data-view="Checkbox"></div>
	</div>
</div>
