( function ( $ ) {

	var baseView = require( '../../base' );

	module.exports = baseView.extend( {
		className: 'tvd-col tvd-s6 tvd-ms6 tvd-m4 tvd-l3 tva-course-item',
		template: TVE_Dash.tpl( 'course/delete-state' ),
		events: {
			'click .tva-delete-no': function () {
				this.model.set( {state: ThriveApp.t.normal_state} );
			},
			'click .tva-delete-yes': 'deleteCourse'
		},
		initialize: function () {
			this.listenTo( this.collection, 'remove', this.remove );
			_.bindAll( this, 'keyAction' );
			$( document ).bind( 'keydown', this.keyAction );
		},
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );

			return this
		},
		keyAction: function ( e ) {
			var code = e.which;
			if ( code == 13 ) {
				this.deleteCourse();
			} else if ( code == 27 ) {
				this.model.set( {state: ThriveApp.t.normal_state} );
			}
		},
		deleteCourse: function () {
			TVE_Dash.cardLoader( this.$el );
			var self = this,
				xhr = self.model.destroy( {wait: true} );
			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					self.collection.trigger( 'tva_update_courses' );
					$( document ).unbind( 'keydown', this.keyAction );
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.hideLoader();
					TVE_Dash.err( errorObj.responseText );
				} );
				xhr.always( function () {
					TVE_Dash.hideLoader();
				} );
			}
		}
	} );

} )( jQuery );