<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-university
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

class TVA_Product extends TVE_Dash_Product_Abstract {
	protected $tag = 'tva';

	protected $title = 'Thrive Apprentice';

	protected $productIds = array();

	protected $type = 'plugin';

	protected $needs_architect = true;

	public function __construct( $data = array() ) {
		parent::__construct( $data );

		$this->logoUrl      = TVA_Const::plugin_url( 'admin/img/thrive-apprentice-dashboard.png' );
		$this->logoUrlWhite = TVA_Const::plugin_url( 'admin/img/thrive-apprentice-dashboard.png' );

		$this->description = __( 'Create online courses in minutes to share your skills, knowledge and expertise', TVA_Const::T );

		$this->button = array(
			'active' => true,
			'url'    => admin_url( 'admin.php?page=tva_dashboard' ),
			'label'  => __( 'Apprentice Dashboard', TVA_Const::T ),
		);

		$this->moreLinks = array(
			'support' => array(
				'class'      => '',
				'icon_class' => 'tvd-icon-life-bouy',
				'href'       => 'https://thrivethemes.com/forums/forum/plugins/thrive-apprentice/',
				'target'     => '_blank',
				'text'       => __( 'Support', TVA_Const::T ),
			),
		);
	}
}
