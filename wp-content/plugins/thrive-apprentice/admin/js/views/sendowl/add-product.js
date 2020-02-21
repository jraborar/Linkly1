( function ( $ ) {

	var baseView = require( './../base' );

	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'sendowl/add-product' ),
		render: function () {
			this.$el.html( this.template( {} ) );

			if ( false === ThriveApp.globals.soSettings.get( 'tutorial_completed' ) ) {
				ThriveApp.globals.soSettings.set( {tutorial_completed: 1} );
				this.save();
			}

			this.bind_zclip();
			return this
		},
		save: function () {
			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce
				},
				type: 'POST',
				url: ThriveApp.routes.sendowl + '/sendowl_tutorial/',
				data: {
					sendowl_tutorial: {completed: 1}
				}
			} );
		}
	} );

} )( jQuery );
