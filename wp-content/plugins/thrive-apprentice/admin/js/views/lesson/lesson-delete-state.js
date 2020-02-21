( function ( $ ) {

	var base = require( '../base' );

	module.exports = base.extend( {
		className: 'tvd-col tvd-s12 tva-lesson-item',
		template: TVE_Dash.tpl( 'course/edit/lesson-delete' ),
		events: {
			'click .tva-delete-no': function () {
				this.model.set( {state: ThriveApp.t.normal_state} );
			},
			'click .tva-delete-yes': 'deleteLesson'
		},
		changed_models: [],
		initialize: function () {
			_.bindAll( this, 'keyAction' );
			$( document ).bind( 'keydown', this.keyAction );
		},
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );

			if ( this.model.get( 'post_status' ) === 'publish' ) {
				this.$el.addClass( 'tva-lesson-pb' )
			}

			return this;
		},
		keyAction: function ( e ) {
			var code = e.which;
			if ( code == 13 ) {
				this.deleteLesson();
			} else if ( code == 27 ) {
				this.model.set( {state: ThriveApp.t.normal_state} );
			}
		},
		deleteLesson: function () {
			TVE_Dash.cardLoader( this.$el );
			/**
			 * We should only change the status if the lesson is the last one and is published
			 * or if we have more than one lesson in the parents
			 */
			if ( this.model.get( 'post_status' ) === 'publish' ) {
				this.changed_models = this.model.changeParentsStatus();
			}

			var self = this,
				xhr = self.model.destroy();

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					TVE_Dash.success( ThriveApp.t.ItemDeleted );
					$( document ).unbind( 'keydown', this.keyAction );
					self.collection.remove( self.model );

					if ( self.changed_models.length > 0 ) {
						_.each( self.changed_models, function ( model ) {
							model.save();
						} );
					}

					ThriveApp.globals.active_course.trigger( 'tva_render_content' );
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

} )( jQuery )