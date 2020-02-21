( function ( $ ) {

	var baseView = require( '../base' );

	module.exports = baseView.extend( {
		className: 'tvd-container',
		template: TVE_Dash.tpl( 'sendowl/settings' ),
		render: function () {
			this.$el.html( this.template() );
			return this;
		}
	} );

} )( jQuery );
