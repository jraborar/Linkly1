var baseModel = require( './base' ),
	thPageModel = require( './pages/thankyou' ),
	thPageTypeModel = require( './thankyou-type' ),
	thMultiplePageModel = require( './pages/thankyou-multiple' ),
	chPageModel = require( './pages/checkout' ),
	baseCollection = require( './../../collections/base' ),
	accountKeys = require( './keys' ),
	welcomeMsgModel = require( './welcome-msg' );

/**
 * Sendowl settings model
 */
module.exports = baseModel.extend( {
	defaults: function () {
		return {
			customers_per_page: 10,
			customers_per_request: 100
		}
	},
	initialize: function ( options ) {
		if ( false === options.is_connected ) {
			return;
		}

		this.set( {
			account_keys: new accountKeys( this.get( 'account_keys' ) ),
			welcome_message: new welcomeMsgModel( this.get( 'welcome_message' ) ),
			thankyou_page: new thPageModel( this.get( 'thankyou_page' ) ),
			thankyou_page_type: new thPageTypeModel( {type: this.get( 'thankyou_page_type' )} ),
			thankyou_multiple_page: new thMultiplePageModel( this.get( 'thankyou_multiple_page' ) ),
			checkout_page: new chPageModel( options.checkout_page ),
			products: new baseCollection( this.get( 'products' ) ),
			bundles: new baseCollection( this.get( 'bundles' ) )
		} );
	}
} );
