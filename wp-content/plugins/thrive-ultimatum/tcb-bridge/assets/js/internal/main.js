/**
 * Created by Ovidiu on 7/21/2017.
 */
var TVE_Ult_Int = window.TVE_Ult_Int = TVE_Ult_Int || {},
	countdownSet = require( './countdown-sets-constants' );

( function ( $ ) {

	/**
	 * On TCB Main Ready
	 */
	$( window ).on( 'tcb_main_ready', function () {

		TVE_Ult_Int.DesignTemplates = require( './modals/design-templates' );
		TVE_Ult_Int.DesignReset = require( './modals/design-reset' );
		TVE_Ult_Int.DesignSave = require( './modals/design-save' );
		TVE_Ult_Int.AddEditState = require( './modals/add-edit-state' );

		var _states = require( './states' );
		TVE_Ult_Int.States = new _states( {
			el: jQuery( '#tu-form-states' )[ 0 ]
		} );

		function open_templates_modal() {
			var designTemplatesModal = TVE_Ult_Int.DesignTemplates.get_instance( TVE.modal.get_element( 'design-templates' ) );
			designTemplatesModal.open( {
				top: '5%',
				css: {
					width: '80%',
					left: '10%'
				},
				dismissible: ( tve_ult_page_data.has_content )
			} );
		}

		TVE.add_filter( 'editor_loaded_callback', function () {


			$( TVE.main ).on( 'tcb.open_templates_picker', function ( event ) {
				event.preventDefault();
				open_templates_modal();
			} );

			TVE.main.sidebar_extra.tve_ult_save_template = function () {
				var designSaveModal = TVE_Ult_Int.DesignSave.get_instance( TVE.modal.get_element( 'design-save' ) );
				TVE.main.sidebar_extra.hide_drawers();
				designSaveModal.open( {
					top: '20%'
				} );

				return false;
			};

			TVE.main.sidebar_extra.tve_ult_reset_template = function () {
				TVE.Editor_Page.blur();
				var designResetsModal = TVE_Ult_Int.DesignReset.get_instance( TVE.modal.get_element( 'design-reset' ) );
				designResetsModal.open( {
					top: '20%'
				} );

				return false;
			};

			/**
			 * Open Template Chooser if the variation is empty
			 */
			if ( ! tve_ult_page_data.has_content ) {
				open_templates_modal();
			}

			/**
			 * Backwards Compatibility:
			 * Adds thrv-inline-text class to countdown elements that doesn't have it on caption class
			 */
			TVE.inner_$( '.thrv_countdown_timer .t-caption:not(.thrv-inline-text)' ).each( function () {
				jQuery( this ).addClass( 'thrv-inline-text' );
			} );
		} );

		/**
		 * The countdown color form TU sets is now editable
		 */
		TVE.add_action( 'tcb.element.focus', function ( $element ) {
			if ( $element.hasClass( 'thrv_countdown_timer' ) && tve_ult_page_data.tpl_action ) {
				//get the templates set
				var setID = TVE.inner_$( '.tl-style' ).attr( 'id' );

				TVE.Components.countdown.controls.Color.config.css_suffix = '';

				if ( countdownSet[ setID ] ) {
					TVE.Components.countdown.controls.Color.config.config.style_default_color = countdownSet[ setID ];
				}
			}
		} );

	} );
} )( jQuery );
