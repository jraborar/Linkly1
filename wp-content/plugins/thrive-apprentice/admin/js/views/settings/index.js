( function () {

	var advSettingsView = require( './advanced' );

	module.exports = advSettingsView.extend( {
		template: TVE_Dash.tpl( 'wizard/template-index-settings' ),
		render: function () {
			this.$el.empty().html( this.template( {
				template: this.model.get( 'template' ),
				available_settings: this.available_settings
			} ) );
		}
	} )

} )( jQuery );