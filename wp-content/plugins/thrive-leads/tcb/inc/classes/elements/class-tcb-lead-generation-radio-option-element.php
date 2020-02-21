<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package TCB2.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

class TCB_Lead_Generation_Radio_Option_Element extends TCB_Element_Abstract {

	public function name() {
		return __( 'Lead Generation Radio Option', 'thrive-cb' );
	}

	public function identifier() {
		return '.tve_lg_radio_wrapper';
	}

	public function hide() {
		return true;
	}

	/**
	 * @return bool
	 */
	public function has_hover_state() {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public function active_state_config() {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public function active_state_label() {
		return __( 'Selected', 'thrive-cb' );
	}

	public function own_components() {
		$prefix_config = tcb_selection_root() . ' ';

		return array(
			'lead_generation_radio_option' => array(
				'config' => array(
					'RadioSize'        => array(
						'to'      => '.tve-checkmark',
						'config'  => array(
							'default' => '20',
							'min'     => '0',
							'max'     => '30',
							'label'   => __( 'Radio Size', 'thrive-cb' ),
							'um'      => array( 'px' ),

						),
						'extends' => 'Slider',
					),
					'StyleChange'      => array(
						'config' => array(
							'label' => __( 'Radio Style', 'thrive-cb' ),
						),
					),
					'RadioStylePicker' => array(
						'config' => array(
							'label'   => __( 'Choose radio style', 'thrive-cb' ),
							'items'   => array(
								'default'     => __( 'Default', 'thrive-cb' ),
								'style-1'     => __( 'Style 1', 'thrive-cb' ),
								'fill-round'  => __( 'Fill Round', 'thrive-cb' ),
								'square-fill' => __( 'Square Fill', 'thrive-cb' ),
							),
							'default' => 'no_style',
						),
					),
					'RadioStyleColor'  => array(
						'config'  => array(
							'label'   => __( 'Style Color', 'thrive-cb' ),
							'options' => array(
								'output'      => 'object',
								'showAlpha'   => false,
								'allowEmpty'  => false,
							),
						),
						'extends' => 'ColorPicker',
					),
				),
			),

			'typography' => array(
				'config' => array(
					'FontColor'     => array(
						'css_suffix' => ' .tve-input-option-text',
						'important'  => true,
					),
					'TextAlign'     => array(
						'css_suffix' => ' .tve-input-option-text',
						'css_prefix' => $prefix_config,
						'important'  => true,
					),
					'FontSize'      => array(
						'css_suffix' => ' .tve-input-option-text',
						'important'  => true,
					),
					'TextStyle'     => array(
						'css_suffix' => ' .tve-input-option-text',
						'css_prefix' => $prefix_config,
						'important'  => true,
					),
					'LineHeight'    => array(
						'css_suffix' => ' .tve-input-option-text',
						'important'  => true,
					),
					'FontFace'      => array(
						'css_suffix' => ' .tve-input-option-text',
						'important'  => true,
					),
					'LetterSpacing' => array(
						'css_suffix' => ' .tve-input-option-text',
						'css_prefix' => $prefix_config,
						'important'  => true,
					),
					'TextTransform' => array(
						'css_suffix' => ' .tve-input-option-text',
						'css_prefix' => $prefix_config,
						'important'  => true,
					),
				),
			),
			'animation'  => array(
				'hidden' => true,
			),
		);
	}
}
