<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-apprentice
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

/**
 * modify the localization parameters for the javascript on the editor page (in editing mode)
 */
add_filter( 'tcb_editor_javascript_params', 'tva_editor_javascript_params', 10, 3 );

/**
 * Check the license
 */
add_filter( 'tcb_user_can_edit', 'tva_editor_check_license' );

/**
 * Custom Layouts
 */
add_filter( 'tcb_custom_post_layouts', 'tva_editor_layout', 10, 3 );

/**
 * Disable Revision Manager For Thrive Apprentice Pages
 */
add_filter( 'tcb_has_revision_manager', 'tva_disable_revision_manager', 10, 1 );

/**
 * Add some Apprentice post types to Architect Post Grid Element Banned Types
 */
add_filter( 'tcb_post_grid_banned_types', 'tva_add_post_grid_banned_types', 10, 1 );

add_filter( 'architect.branding', 'tva_architect_branding' );

/**
 * Adds TA product to TVA
 */
add_filter( 'tcb_element_instances', 'tva_inject_checkout_element', 10, 1 );

/**
 * Include TVA Checkout Component Menu
 */
add_filter( 'tcb_menu_path_checkout', 'tva_include_checkout_menu', 10, 1 );
add_filter( 'tcb_menu_path_checkout_form', 'tva_include_checkout_form_menu', 10, 1 );

/**
 * Adds extra script(s) to the main frame
 */
add_action( 'tcb_main_frame_enqueue', 'tva_add_script_to_main_frame', 10, 0 );

/**
 * Adds extra SVG icons to editor page
 */
add_action( 'tcb_editor_iframe_after', 'tva_output_extra_control_panel_svg', 10, 0 );

/**
 * Loading templates of checkout element
 */
add_filter( 'tcb_backbone_templates', 'tve_include_backbone_template', 10, 1 );

add_filter( 'tcb_post_editable', 'tva_post_editable', 10, 3 );

/**
 * Allow Apprentice Pages to be edit with TAr on LpBuild
 *
 * @deprecated this filter is not applied anymore in TAr
 */
add_filter( 'tve_post_type_can_use_landing_page', 'tva_post_type_can_use_landing_page', 10, 1 );

add_filter( 'tcb_can_use_landing_pages', 'tva_can_use_landing_page_templates', 10, 1 );
add_filter( 'tcb_has_templates_tab', 'tva_can_use_landing_page_templates', 10, 1 );

/**
 * Include Thrive Apprentice texts to TAR Editor
 */
add_filter( 'tcb_js_translate', 'tva_include_items_to_js_translate', 10, 1 );
add_filter( 'tcb_inline_shortcodes', 'tva_add_sendowl_product_shortcode', 10, 1 );

///////////////////////////////////////////////////////////////
/// 			    CLOUD TEMPLATES API                     ///
/// ///////////////////////////////////////////////////////////
add_filter( 'tcb_cloud_request_params', 'tva_filter_cloud_request_params' );
add_action( 'wp_ajax_tva_cloud_templates', 'tva_ajax_landing_page_cloud' );

/**
 * Sets a new transient name for caching cloud templates based on page type: thankyou/checkout/etc
 * If the page/post is not a TA one then leave the transient name as it is set in TAr
 * - fixes displaying right TA Checkout/Thankyou templates
 */
add_filter( 'tve_cloud_templates_transient_name', function ( $transient_name ) {

	$post_id   = (int) sanitize_text_field( $_POST['post_id'] );
	$page_type = TVA_Const::get_page_type( $post_id );

	$transient_name .= $page_type ? '_' . $page_type : '';

	return $transient_name;
} );

/**
 * Include Modal Template for checkout
 */
add_filter( 'tcb_modal_templates', 'tva_include_tcb_modals' );

add_filter( 'tcb_can_use_page_events', 'tva_can_user_page_events' );

/**
 * Include backbone templates for TCB
 */
add_filter( 'tcb_backbone_templates', 'include_tcb_templates' );

add_action( 'wp', 'tva_simulate_tve_page_events' );

/**
 * called when trying to edit a post to check TVA capability with TA deactivated
 */
add_filter( 'tcb_user_has_plugin_edit_cap', 'tva_check_can_use_plugin' );
/**
 * Called when edit with TAR buttons should be displayed or not
 */
add_filter( 'tcb_user_has_post_access', 'tva_enable_tar_button' );

/**
 * Called from TAr on LP Modal
 * Where to display Smart LP Templates Section or NOT
 */
add_filter( 'tcb_show_smart_landing_pages', 'tva_display_smart_templates' );

/**
 * Include Backbone templates
 *
 * @param $files
 *
 * @return array
 */
function tva_include_tcb_modals( $files ) {

	if ( apply_filters( 'tva_include_tcb_modals', TVA_Const::tva_is_checkout_page() ) ) {
		$files[] = TVA_Const::plugin_path( 'tcb-bridge/views/modals/checkout.php' );
	}

	return $files;
}

/**
 * For checkout pages do not display in Landing Page Modal
 * Smart Templates cos it's empty anyway
 *
 * @param bool $display
 *
 * @return bool
 */
function tva_display_smart_templates( $display ) {

	if ( $display && ( TVA_Const::tva_is_checkout_page() || TVA_Const::tva_is_thankyou_page() || TVA_Sendowl_Settings::instance()->is_thankyou_multiple_page() ) ) {
		$display = false;
	}

	return $display;
}

/**
 * Include templates for checkout
 *
 * @param $templates
 *
 * @return array
 */
function include_tcb_templates( $templates ) {
	global $post;

	if ( apply_filters( 'include_tcb_templates', TVA_Const::tva_is_checkout_page( $post->ID ) ) ) {
		$templates['checkout-item'] = TVA_Const::plugin_path( 'tcb-bridge/views/cloud-templates/checkout-item.phtml' );
	}

	return $templates;
}

/**
 * Get A template
 */
function tva_ajax_landing_page_cloud() {

	if ( empty( $_POST['task'] ) ) {
		$error = __( 'Invalid request', 'thrive-cb' );
	}

	if ( ! isset( $error ) ) {

		try {
			switch ( $_POST['task'] ) {
				case 'download':
					$template = isset( $_POST['template'] ) ? $_POST['template'] : '';
					$post_id  = isset( $_POST['post_id'] ) ? $_POST['post_id'] : '';
					if ( empty( $template ) ) {
						throw new Exception( __( 'Invalid template', 'thrive-cb' ) );
					}
					$force_download = defined( 'TCB_CLOUD_DEBUG' ) && TCB_CLOUD_DEBUG;
					if ( ! $force_download ) {
						$transient_name = 'tva_template_download_' . $template;
						if ( get_transient( $transient_name ) === false ) {
							$force_download = true;
							set_transient( $transient_name, 1, DAY_IN_SECONDS );
						}
					}
					$downloaded = tve_get_downloaded_templates();

					if ( $force_download || ! array_key_exists( $template, $downloaded ) || tve_get_landing_page_config( $template ) === false ) {

						/**
						 * this will throw Exception if anything goes wrong
						 */
						add_filter( 'tcb_cloud_request_params', 'tva_filter_cloud_request_params' );

						TCB_Landing_Page_Cloud_Templates_Api::getInstance()->download( $template, 2 );

						remove_filter( 'tcb_cloud_request_params', 'tva_filter_cloud_request_params' );
					}

					tcb_landing_page( $post_id )->set_cloud_template( $template );

					wp_send_json(
						array(
							'success' => true,
						)
					);
			}
		} catch ( Exception $e ) {
			wp_send_json(
				array(
					'success' => false,
					'message' => $e->getMessage(),
				)
			);
		}
	}

	wp_die();
}

/**
 * Add Sendowl Shortcode
 *
 * @param $shortcodes
 *
 * @return array
 */
function tva_add_sendowl_product_shortcode( $shortcodes ) {

	$allowed = ! empty( $_REQUEST[ TVE_FRAME_FLAG ] ) && ( TVA_Const::tva_is_checkout_page() );
	$allowed = $allowed || TVA_Const::tva_is_thankyou_page();
	$allowed = $allowed || TVA_Sendowl_Settings::instance()->is_thankyou_multiple_page();

	if ( false === $allowed ) {
		return $shortcodes;
	}

	$shortcode = array(
		__( 'Thrive Product', 'thrive-apprentice' ) => array(
			array(
				'name'   => __( 'Product Name', 'thrive-apprentice' ),
				'option' => __( 'Product Name', 'thrive-apprentice' ),
				'value'  => 'tva_sendowl_product',
			),
		),
	);

	$shortcodes = array_merge( $shortcodes, $shortcode );

	return $shortcodes;
}

/**
 * Disable landing page functionality when TCB is not active
 *
 * @param $value
 *
 * @return bool
 */
function tva_can_use_landing_page_templates( $value ) {

	if ( TVA_Const::tva_is_checkout_page() || TVA_Const::tva_is_thankyou_page() ) {

		return tve_in_architect();
	}

	return $value;
}

/**
 * Inject apprentice_pages post type in list of post types which can be landing pages
 * If TAr is not activated: EXTERNAL_TCB === 0 then we cannot edit landing/checkout pages
 *
 * @param $post_types array
 *
 * @return array $post_types
 */
function tva_post_type_can_use_landing_page( $post_types ) {

	$post_types[] = 'apprentice_pages';

	global $post;

	if ( ! tve_in_architect() && TVA_Sendowl_Settings::instance()->is_checkout_page( $post ) ) {
		return array();
	}

	return $post_types;
}

/**
 * Allow Apprentice lessons modules and chapters and the checkout page to be editable with TCB
 *
 * @param $return    bool
 * @param $post_type string
 * @param $post_id   int
 *
 * @return bool
 */
function tva_post_editable( $return, $post_type, $post_id ) {

	$post_id = intval( $post_id );

	if ( ! tve_in_architect() ) {

		$return = TVA_Const::LESSON_POST_TYPE === $post_type || TVA_Sendowl_Settings::instance()->is_checkout_page( $post_id );
	}

	if ( TVA_Settings::instance()->is_index_page( $post_id ) ) {
		$return = false;
	}

	return $return;
}

/**
 * Is Editable with TCB
 *
 * @param int|string $post_or_type
 *
 * @return bool
 */
function tva_is_editable( $post_or_type ) {

	$post_or_type = is_numeric( $post_or_type ) ? get_post_type( $post_or_type ) : $post_or_type;

	global $post;

	$return = in_array( $post_or_type, array( TVA_Const::LESSON_POST_TYPE ) );
	$return = $return || ( $post instanceof WP_Post && TVA_Const::tva_is_checkout_page() );
	$return = $return || ( defined( 'DOING_AJAX' ) && DOING_AJAX );

	return apply_filters( 'tva_is_editable', $return, $post_or_type );
}

/**
 * Check if the post can be edited by checking access and post type
 *
 * @param bool $has_access
 *
 * @return bool
 */
function tva_check_can_use_plugin( $has_access ) {
	$post = get_post();
	if ( TVA_Sendowl_Settings::instance()->is_checkout_page( $post )
	     || TVA_Sendowl_Settings::instance()->is_thankyou_page( $post )
	     || in_array( get_post_type(), array(
			TVA_Const::LESSON_POST_TYPE,
			TVA_Const::CHAPTER_POST_TYPE,
			TVA_Const::MODULE_POST_TYPE,
		) )
	) {
		$has_access = TVA_Product::has_access();
	}

	return $has_access;
}

/**
 * Check if the page is register page so we show the Edit with TAR in pages tab
 *
 * @param $access
 *
 * @return bool
 */
function tva_enable_tar_button( $access ) {
	$post = get_post();
	if ( $post && TVA_Sendowl_Settings::instance()->is_checkout_page( $post ) ) {
		$access = true;
	}

	return $access;
}


function tva_editor_check_license( $valid ) {
	if ( ! tva_is_apprentice() ) {
		return $valid;
	}

	if ( ! tva_license_activated() ) {
		add_action( 'wp_print_footer_scripts', 'tva_license_warning' );

		return false;
	}

	return true;
}

/**
 * Disable Revision Manager For Quiz Builder Pages
 *
 * @param bool $status
 *
 * @return bool
 */
function tva_disable_revision_manager( $status = true ) {
	$post_type = get_post_type();

	if ( tva_is_editable( $post_type ) ) {
		return ! $status;
	}

	return $status;
}

/**
 * Add some Apprentice post types to Architect Post Grid Element Banned Types
 *
 * @param array $banned_types
 *
 * @return array
 */
function tva_add_post_grid_banned_types( $banned_types = array() ) {
	$banned_types[] = TVA_Const::COURSE_POST_TYPE;

	return $banned_types;
}

/**
 * Set JS params
 *
 * @param $js_params
 * @param $post_id
 *
 * @return mixed
 */
function tva_editor_javascript_params( $js_params, $post_id ) {

	if ( ( ! tva_is_apprentice() && ! TVA_Sendowl_Settings::instance()->is_checkout_page( $post_id ) ) || tve_in_architect() ) {
		return $js_params;
	}

	/** clear out any data that's not necessary on the editor  */
	$js_params['landing_page']          = '';
	$js_params['landing_page_config']   = array();
	$js_params['landing_pages']         = array();
	$js_params['page_events']           = array();
	$js_params['landing_page_lightbox'] = array();
	$js_params['style_families']        = tve_get_style_families();
	$js_params['style_classes']         = array(
		'Flat'    => 'tve_flt',
		'Classy'  => 'tve_clsy',
		'Minimal' => 'tve_min',
	);
	$js_params['read_more_tag']         = false;

	return $js_params;
}

function tva_editor_layout( $current_templates, $post_id, $post_type ) {
	if ( ! tva_is_editable( $post_type ) ) {
		return $current_templates;
	}

	/* flat is the default style for Thrive Quiz Builder designs */
	global $tve_style_family_classes;
	$tve_style_families = tve_get_style_families();
	$style_family       = 'Flat';
	$style_key          = 'tve_style_family_' . strtolower( $tve_style_family_classes[ $style_family ] );
	/* Style family */
	wp_style_is( $style_key ) || tve_enqueue_style( $style_key, $tve_style_families[ $style_family ] );

	return $current_templates;
}

/**
 * show a box with a warning message and a link to take the user to the license activation page
 * this will be called only when no valid / activated license has been found
 *
 * @return mixed
 */
function tva_license_warning() {

	return include TVA_Const::plugin_path( 'admin/views/license_inactive.php' );
}

/**
 * @param string $logo_url
 *
 * @return string
 */
function tva_architect_branding( $logo_url ) {
	if ( tva_is_editable( get_post_type() ) ) {
		$logo_url = TVA_Const::plugin_url( 'admin/img/ta-logo-dashboard.png' );
	}

	return $logo_url;
}

/**
 * Adds checkout element to TAr Editor
 *
 * @param array $elements
 *
 * @return array
 */
function tva_inject_checkout_element( $elements = array() ) {

	global $post;

	$is_ajax = defined( 'DOING_AJAX' ) && DOING_AJAX === true;

	if ( TVA_Sendowl_Settings::instance()->is_checkout_page( $post ) || true === $is_ajax ) {

		require_once dirname( __FILE__ ) . '/editor-elements/class-tcb-checkout-element.php';
		require_once dirname( __FILE__ ) . '/editor-elements/class-tcb-checkout-form-element.php';

		$elements['checkout']      = new TCB_Checkout_Element( 'checkout' );
		$elements['checkout_form'] = new TCB_Checkout_Form_Element( 'checkout_form' );
	}

	return $elements;
}

/**
 * Gets Checkout Element Menu Component file path
 *
 * @param $component_file_path string
 *
 * @return string
 */
function tva_include_checkout_menu( $component_file_path ) {

	if ( tva_is_editable( get_post_type() ) ) {

		return TVA_Const::plugin_path( 'tcb-bridge/editor-layouts/menus/checkout.php' );
	}

	return $component_file_path;
}

/**
 * Gets CheckoutForm Element Menu Component file path
 *
 * @param $component_file_path string
 *
 * @return string
 */
function tva_include_checkout_form_menu( $component_file_path ) {

	if ( tva_is_editable( get_post_type() ) ) {

		return TVA_Const::plugin_path( 'tcb-bridge/editor-layouts/menus/checkout_form.php' );
	}

	return $component_file_path;
}

function tva_add_script_to_main_frame() {
	if ( tva_is_editable( get_post_type() ) ) {
		tva_enqueue_script( 'tva-internal-editor', TVA_Const::plugin_url( 'tcb-bridge/assets/js/tva-tcb-internal.js' ), array( 'tve-main' ) );
		tva_enqueue_style( 'tva-ce-preview-list', TVA_Const::plugin_url( 'tcb-bridge/assets/css/main_frame.css' ) );
	}
}

/**
 * Loading checkout element's templates only in editor
 *
 * @param array $templates
 *
 * @return array
 */
function tve_include_backbone_template( $templates = array() ) {
	if ( tva_is_editable( get_post_type() ) ) {
		$templates = array_merge( $templates, tve_dash_get_backbone_templates( plugin_dir_path( dirname( __FILE__ ) ) . 'tcb-bridge/editor-layouts/backbone', 'backbone' ) );
	}

	return $templates;
}

/**
 * Outputs Extra SVG Icons to editor page (Control Panel)
 */
function tva_output_extra_control_panel_svg() {

	if ( tva_is_editable( get_post_type() ) ) {
		include dirname( __FILE__ ) . '/assets/fonts/tva-main.svg';
	}
}

/**
 * Include Thrive Apprentice Text to TAR Editor
 *
 * @param array $translate_arr
 *
 * @return array
 */
function tva_include_items_to_js_translate( $translate_arr = array() ) {

	if ( tva_is_editable( get_post_type() ) ) {
		if ( ! empty( $translate_arr['cf_errors'] ) && is_array( $translate_arr['cf_errors'] ) ) {
			$translate_arr['cf_errors']['existing_user_email'] = array(
				'label' => __( 'Email Is Already Used', 'thrive-apprentice' ),
			);
		}
	}

	return $translate_arr;
}

function tva_filter_cloud_request_params( $params ) {

	global $post;

	$post_id = null;
	$type    = null;

	if ( $post instanceof WP_Post ) {
		$post_id = $post->ID;
	} else {
		/**
		 * $page_id is sent over $_REQUEST when zip template is imported from page settings
		 */
		$post_id = ! empty( $_REQUEST['page_id'] ) ? $_REQUEST['page_id'] : null;
	}

	/**
	 * loading a template through ajax $post_id param is used
	 */

	if ( ! isset( $post_id ) ) {
		$post_id = ! empty( $_REQUEST['post_id'] ) ? $_REQUEST['post_id'] : null;
	}

	if ( isset( $post_id ) ) {
		$type = TVA_Const::get_page_type( $post_id );
	}

	if ( isset( $type ) ) {
		$params['appr'] = '1';
		$params['type'] = $type;
	}

	return $params;
}

/**
 * There is a strange/edge case when a user sets a page event for a checkout page and then deactivates TAr
 * then in frontend TAr core tries to parse the events but the function does not exists and a fatal error is thrown
 *
 * Fix for this is to add the function after the TAr is loaded
 */
function tva_simulate_tve_page_events() {
	if ( false === function_exists( 'tve_page_events' ) ) {
		function tve_page_events() {
		}
	}
}

/**
 * Page events from TAr can be used only if TAr is installed and activated
 *
 * @param $can_use
 *
 * @return bool
 */
function tva_can_user_page_events( $can_use ) {

	if ( ( TVA_Const::tva_is_checkout_page() || TVA_Const::tva_is_thankyou_page() ) && ! tve_in_architect() ) {
		$can_use = false;
	}

	return $can_use;
}
