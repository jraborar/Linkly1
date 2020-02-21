( function ( $ ) {

	var baseView = require( '../../../base' );

	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'wizard/font-row' ),
		initialize: function ( options ) {
			this.selected = options.selected;
		},
		render: function () {
			this.$el.append( this.template( {model: this.model, selected: this.selected} ) );
			return this;
		}
	} )

} )( jQuery );
