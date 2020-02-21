<style type="text/css">
	#wpadminbar {
		z-index: 999992 !important;
	}
</style>
<?php
$timezone_offset = get_option( 'gmt_offset' );
$sign            = ( $timezone_offset < 0 ? '-' : '+' );
$min             = abs( $timezone_offset ) * 60;
$hour            = floor( $min / 60 );
$tzd             = $sign . str_pad( $hour, 2, '0', STR_PAD_LEFT ) . ':' . str_pad( $min % 60, 2, '0', STR_PAD_LEFT );
?>

<div class="thrv_ult_bar tve_no_drag tve_no_icons tve_element_hover thrv_wrapper tvu_set_01 tve_white"
     style="background-image: url('<?php echo TVE_Ult_Const::plugin_url( "tcb-bridge/editor-templates/css/images/tvu_set1_bg.jpg" ) ?>'); background-size:cover; background-position: center center;">
	<div class="tve-ult-bar-content tve_editor_main_content">
		<div class="thrv_wrapper thrv-columns" style="margin-top: 0;margin-bottom: 0;">
			<div class="tcb-flex-row tcb--cols--2 tcb-medium-wrap" style="padding-top:0;padding-bottom: 0;">
				<div class="tcb-flex-col c-66">
					<div class="tcb-col">
						<div class="thrv_wrapper thrv-columns" style="margin-top: 0;margin-bottom: 0;">
							<div class="tcb-flex-row tcb--cols--2 tcb-medium-wrap" style="padding-top:0;padding-bottom: 0;">
								<div class="tcb-flex-col">
									<div class="tcb-col">
										<h5 class="tve_p_right tvu-heading" style="color: #d7fe3a; font-size:  26px;margin-top: 20px;margin-bottom: 0;">
											Time before this offer runs out:
										</h5>
									</div>
								</div>
								<div class="tcb-flex-col">
									<div class="tcb-col">
										<div class="thrv_wrapper thrv_countdown_timer tve_cd_timer_plain tve_clearfix init_done tve_black tve_countdown_2"
										     data-date="<?php echo gmdate( 'Y-m-d', time() + 3600 * $timezone_offset + ( 24 * 3600 ) ) ?>"
										     data-hour="<?php echo gmdate( 'H', time() + 3600 * $timezone_offset ) ?>"
										     data-min="<?php echo gmdate( 'i', time() + 3600 * $timezone_offset ) ?>"
										     data-timezone="<?php echo $tzd ?>">
											<div class="sc_timer_content tve_clearfix tve_block_center">
												<div class="tve_t_day tve_t_part">
													<div class="t-digits"></div>
													<div class="t-caption thrv-inline-text">days</div>
												</div>
												<div class="tve_t_hour tve_t_part">
													<div class="t-digits"></div>
													<div class="t-caption thrv-inline-text">hours</div>
												</div>
												<div class="tve_t_min tve_t_part">
													<div class="t-digits"></div>
													<div class="t-caption thrv-inline-text">minutes</div>
												</div>
												<div class="tve_t_sec tve_t_part">
													<div class="t-digits"></div>
													<div class="t-caption thrv-inline-text">seconds</div>
												</div>
												<div class="tve_t_text"></div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="tcb-flex-col c-33">
					<div class="tcb-col">
						<div class="thrv_wrapper thrv-button">
							<a href="#" class="tcb-button-link">
								<span class="tcb-button-texts"><span class="tcb-button-text thrv-inline-text">Get it Now!</span></span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<a href="javascript:void(0)" class="tve-ult-bar-close" title="Close">x</a>
</div>