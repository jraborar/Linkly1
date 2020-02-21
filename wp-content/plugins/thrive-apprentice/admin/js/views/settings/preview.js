( function ( $ ) {

	var baseView = require( '../base' );

	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'wizard/preview' ),
		render: function () {
			var url = this.model.get( 'iframe_url' ).replace( /^https?\:/i, "" );
			this.model.set( 'no_protocol_url', url );
			this.$el.html( this.template( {model: this.model} ) );

			return this;
		}
	} );

} )( jQuery );
