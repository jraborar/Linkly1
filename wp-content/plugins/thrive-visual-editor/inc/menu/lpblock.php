<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-visual-editor
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
} ?>

<div id="tve-lpblock-component" class="tve-component" data-view="LpBlock">
	<div class="borders-options action-group">
		<div class="dropdown-header" data-prop="docked">
			<div class="group-description">
				<?php echo __( 'Main Options', 'thrive-cb' ); ?>
			</div>
			<i></i>
		</div>
		<div class="dropdown-content">
			<div class="tve-control hide-tablet hide-mobile" data-view="MatchColors"></div>

			<div class="tve-local-variables pt-10 hide-tablet hide-mobile"></div>

			<div class="tve-control hide-tablet hide-mobile" data-view="InheritFromLandingPage"></div>

			<div class="tve-control" data-view="ContentWidth"></div>
			<div class="tve-control" data-view="ContentFullWidth"></div>
			<hr>
			<div class="tve-control" data-view="SectionHeight"></div>
			<div class="tve-control" data-view="FullHeight"></div>
			<hr>
			<div class="tve-control" data-view="VerticalPosition"></div>
			<hr>
			<div class="tve-control" data-view="SectionFullWidth"></div>
		</div>
	</div>
</div>

