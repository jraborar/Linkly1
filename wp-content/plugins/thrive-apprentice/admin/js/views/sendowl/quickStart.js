( function ( $ ) {

	var baseView = require( '../base' )

	module.exports = baseView.extend( {
		className: 'tvd-container',
		template: TVE_Dash.tpl( 'sendowl/quick-start' ),
		render: function () {
			var sendowl = this.model.get( 'membership_plugin' ).findWhere( {tag: 'sendowl'} ),
				access = false,
				step_1_completed = sendowl.get( 'membership_levels' ).length > 0 || sendowl.get( 'bundles' ).length > 0;

			step_1_completed = step_1_completed && 1 === parseInt( ThriveApp.globals.soSettings.get( 'tutorial_completed' ) );

			ThriveApp.globals.courses.each( function ( course ) {
				if ( course.get( 'rules' ).hasSendOwlRule() ) {
					access = true;
				}
			} );

			this.$el.html( this.template( {
					model: this.model,
					sendowl: sendowl,
					access: access,
					step_1_completed: step_1_completed
				} )
			);

			return this;
		}
	} );

} )( jQuery );

