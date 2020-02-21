( function ( $ ) {

	var baseView = require( '../../base' );

	var optionView = require( './type/row' );

	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'wizard/safe-fonts' ),
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );
			this.renderFonts();
			TVE_Dash.materialize( this.$el );
		},
		renderFonts: function () {
			this.collection.each( this.renderFont, this );
		},
		renderFont: function ( font ) {
			var view = new optionView( {
				el: this.$( '#tva-fonts-select' ),
				model: font,
				selected: this.model.get( 'template' ).font_family
			} );

			view.render();
		}
	} );


} )( jQuery );
