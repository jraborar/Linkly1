( function ( $ ) {
	var baseView = require( './base' );

	var pageStateView = require( './page-state' );

	/**
	 * View to render Login Page options
	 */
	var loginOptions = baseView.extend( {
		className: 'tva-tab tva-login-options tva-hide',
		template: TVE_Dash.tpl( 'sendowl/checkout/login' ),
		initialize: function () {
			this.model = ThriveApp.globals.settings.get( 'login_page' );

			pageStateView.prototype.initialize.apply( this, arguments );
		},
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );

			new pageStateView( {
				el: this.$( '.tva-login-page-container' ),
				model: this.model,
				deleteMsg: ThriveApp.t.deleteLoginPage,
				headlineMsg: ThriveApp.t.setLoginPage
			} ).render();

			return this;
		}
	} );

	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'login-page' ),
		className: 'tva-sendowl-login-cont',
		render: function () {
			this.$el.html( this.template( {} ) );

			new loginOptions( {
				el: this.$( '.tva-api-settings' )
			} ).render();

			ThriveApp.util.rebindWistiaFancyBoxes();

			return this;
		}
	} );

} )( jQuery );
