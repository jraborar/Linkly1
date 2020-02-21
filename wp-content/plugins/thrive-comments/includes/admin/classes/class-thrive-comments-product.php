<?php

/**
 * Class TCM_Product
 */
class TCM_Product extends TVE_Dash_Product_Abstract {

	/**
	 * TCM tag
	 *
	 * @var string
	 */
	protected $tag = 'tcm';

	/**
	 * Plugin title
	 *
	 * @var string
	 */
	protected $title = 'Thrive Comments';

	/**
	 * All product ids
	 *
	 * @var array
	 */
	protected $productIds = array();

	/**
	 * Type of product
	 *
	 * @var string
	 */
	protected $type = 'plugin';

	/**
	 * TCM_Product constructor.
	 *
	 * @param array $data additional data.
	 */
	public function __construct( $data = array() ) {
		parent::__construct( $data );

		$this->logoUrl      = tcm()->plugin_url( 'assets/images/tcm-logo-icon.svg' );
		$this->logoUrlWhite = tcm()->plugin_url( 'assets/images/tcm-logo-icon-white.png' );


		$this->description = __( 'Increase engagement on your website and interact with your audience', Thrive_Comments_Constants::T );

		$this->button = array(
			'active' => true,
			'url'    => admin_url( 'admin.php?page=tcm_admin_dashboard' ),
			'label'  => __( 'Thrive Comments', Thrive_Comments_Constants::T ),
		);

		$this->moreLinks = array(
			'tutorials' => array(
				'class'      => '',
				'icon_class' => 'tvd-icon-graduation-cap',
				'href'       => 'https://thrivethemes.com/thrive-knowledge-base/thrive-comments/',
				'target'     => '_blank',
				'text'       => __( 'Tutorials', Thrive_Comments_Constants::T ),
			),
			'support'   => array(
				'class'      => '',
				'icon_class' => 'tvd-icon-life-bouy',
				'href'       => 'https://thrivethemes.com/forums/forum/plugins/thrive-comments',
				'target'     => '_blank',
				'text'       => __( 'Support', Thrive_Comments_Constants::T ),
			),
		);
	}
}
