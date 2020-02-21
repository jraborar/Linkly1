/**
 * Base Form View for Add/Edit a Rule Integration
 */

var baseView = require( '../../base' );
var rule_model = require( '../../../models/integration/rule' );

/**
 * Check if SendOwl settings are set
 *
 * @return {{checkout_page: boolean, account_keys: boolean}}
 * @private
 */
function getSendOwlSettings() {

	var _checkout_page = ThriveApp.globals.settings.get( 'checkout_page' );
	var _account_keys = ThriveApp.globals.settings.get( 'account_keys' );

	var response = {
		checkout_page: _checkout_page && ! ! _checkout_page.ID,
		account_keys: _account_keys && ! ! _account_keys.secret
	};

	/**
	 * it this is rule model check if it's sendowl rule
	 * - if model is not sendowl then mark settings as true
	 * - if the model is sendowl then it let the settings be
	 */
	if ( this instanceof rule_model ) {
		response.checkout_page = false === this.isSendOwl() || response.checkout_page;
		response.account_keys = false === this.isSendOwl() || response.account_keys;
	}

	return response;
}

( function ( $ ) {

	module.exports = baseView.extend( {

		item_template: TVE_Dash.tpl( 'course/access-rules/integration-item' ),

		/**
		 * @param {{jQuery}}
		 */
		$integrationItems: null,

		/**
		 * Checks the SendOwl settings and based on these renders specific warnings above the $integrationItems wrapper
		 * - returns true if at least 1 warning was rendered
		 * @return {boolean}
		 */
		renderSendOwlWarnings: function () {

			var _sendowl_settings = getSendOwlSettings.apply( this.model );
			var _count = 0;

			this.$( '.tva-sendowl-notice' ).remove();

			if ( false === _sendowl_settings.checkout_page ) {
				this.$integrationItems.before( TVE_Dash.tpl( 'course/access-rules/sendowl-checkout-warning' )() );
				_count ++;
			}

			if ( false === _sendowl_settings.account_keys ) {
				this.$integrationItems.before( TVE_Dash.tpl( 'course/access-rules/sendowl-account-keys-warning' )() );
				_count ++;
			}

			if ( _count ) {
				this.$integrationItems.hide();
			}

			return ! ! _count;
		}
	} );

} )( jQuery );
