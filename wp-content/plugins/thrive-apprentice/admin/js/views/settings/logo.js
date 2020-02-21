( function ( $ ) {

	var baseView = require( '../base' );

	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'wizard/logo-text' ),
		render: function () {
			this.$el.empty();
			if ( this.model.get( 'template' ).logo_type ) {
				this.$el.html( this.template( {model: this.model} ) );
			}

			return this;
		}
	} )

} )( jQuery );
