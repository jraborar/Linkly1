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
<div id="tve-lead_generation_radio_option-component" class="tve-component" data-view="LeadGenerationRadioOption">
	<div class="dropdown-header" data-prop="docked">
		<?php echo __( 'Main Options', 'thrive-cb' ); ?>
		<i></i>
	</div>

	<div class="dropdown-content">
		<div class="tve-control" data-view="RadioSize"></div>
		<div class="tve-control hide-states" data-view="StyleChange"></div>
		<div class="tve-control" data-key="RadioStylePicker" data-initializer="radioStylePicker"></div>
		<div class="eff-settings">
			<div class="tve-control hide-states eff-setting eff-color" data-view="RadioStyleColor"></div>
		</div>
	</div>
</div>
