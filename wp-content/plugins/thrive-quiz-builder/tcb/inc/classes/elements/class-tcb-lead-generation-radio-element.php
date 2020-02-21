<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package TCB2.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

class TCB_Lead_Generation_Radio_Element extends TCB_Element_Abstract {

	public function name() {
		return __( 'Lead Generation Radio', 'thrive-cb' );
	}

	public function identifier() {
		return '.tve_lg_radio';
	}

	public function hide() {
		return true;
	}

	public function own_components() {
		$controls_default_config = array(
			'css_suffix' => ' label',
			'css_prefix' => tcb_selection_root() . ' ',
		);

		$columns = array();
		for ( $i = 1; $i <= 10; $i ++ ) {
			$col = array(
				'value' => $i,
				'name'  => $i,
			);

			$columns[] = $col;
		}

		$components = array(
			'lead_generation_radio' => array(
				'config' => array(
					'ShowLabel'   => array(
						'config'  => array(
							'label' => __( 'Show Label', 'thrive-cb' ),
						),
						'extends' => 'Switch',
					),
					'ColumnNumber' => array(
						'config'  => array(
							'default' => '1',
							'min'     => '1',
							'max'     => '5',
							'limit'   => '5',
							'label'   => __( 'Columns', 'thrive-cb' ),
							'um'      => array(),

						),
						'extends' => 'Slider',
					),
					'VerticalSpace'     => array(
						'to'      => ' .tve_lg_radio_wrapper',
						'config'  => array(
							'default' => '0',
							'min'     => '0',
							'max'     => '300',
							'label'   => __( 'Vertical Space', 'thrive-cb' ),
							'um'      => array( 'px', '%' ),
							'css'     => 'margin-top',

						),
						'extends' => 'Slider',
					),
					'HorizontalSpace'   => array(
						'config'  => array(
							'default' => '20',
							'min'     => '0',
							'max'     => '100',
							'label'   => __( 'Horizontal Space', 'thrive-cb' ),
							'um'      => array( 'px' ),
						),
						'extends' => 'Slider',
					),
					'OptionsList' => array(
						'config' => array(
							'sortable'      => true,
							'settings_icon' => 'pen-light',
							'marked'        => true,
							'marking_text'  => __( 'Set as default', 'thrive-cb' ),
							'marking_icon'  => 'check',
							'marked_field'  => 'default',
						),
					),
				),
			),
			'typography'            => array(
				'disabled_controls' => array( 'TextAlign' ),
				'config'            => array(
					'FontSize'      => $controls_default_config,
					'FontColor'     => $controls_default_config,
					'FontFace'      => $controls_default_config,
					'LetterSpacing' => $controls_default_config,
					'LineHeight'    => $controls_default_config,
					'TextAlign'     => $controls_default_config,
					'TextStyle'     => $controls_default_config,
					'TextTransform' => $controls_default_config,
				),
			),
			'layout'                => array(
				'disabled_controls' => array(
					'Width',
					'Height',
					'Alignment',
					'.tve-advanced-controls',
					'hr',
				),
				'config'            => array(),
			),
			'borders'               => array(
				'config' => array(),
			),
			'animation'             => array(
				'hidden' => true,
			),
			'background'            => array(
				'config' => array(),
			),
			'shadow'                => array(
				'hidden' => true,
			),
			'styles-templates'      => array(
				'config' => array(),
			),
			'responsive'            => array(
				'hidden' => true,
			),
		);

		return array_merge( $components, $this->group_component() );
	}

	/**
	 * Group Edit Properties
	 *
	 * @return array|bool
	 */
	public function has_group_editing() {
		return array(
			'select_values' => array(
				array(
					'value'     => 'radio_options',
					'selector'  => '.tve_lg_radio_wrapper',
					'name'      => __( 'Grouped Option Labels', 'thrive-cb' ),
					'singular'  => __( '-- Option Label %s', 'thrive-cb' ),
				),
			),
		);
	}
}
