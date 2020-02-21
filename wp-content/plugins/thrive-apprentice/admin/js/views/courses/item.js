( function ( $ ) {

	var util = require( '../../_util' ),
		base_view = require( '../base' ),
		course_state_views = {
			'CourseNormalState': require( './states/normal' ),
			'CourseDeleteState': require( './states/delete' )
		};

	module.exports = base_view.extend( {
		events: {
			'click .tva-course-status': 'changeCourseStatus'
		},
		initialize: function () {
			this.listenTo( this.model, 'change:state', this.renderState );
		},
		render: function () {
			this.renderState();
			return this;
		},
		renderState: function () {
			var state = this.model.get( 'state' );
			if ( ! course_state_views[ 'Course' + util.upperFirst( state ) + 'State' ] ) {
				return;
			}

			var view = new course_state_views[ 'Course' + util.upperFirst( state ) + 'State' ]( {
				model: this.model,
				collection: this.collection
			} );

			view.render();
			this.$el.replaceWith( view.$el );
			this.setElement( view.$el );

			return this;
		},
		changeCourseStatus: function ( e ) {
			e.stopPropagation();
			var current = this.model.get( 'status' ),
				can_publish = true;
			this.model.set( {update_sendowl_products: true} );

			if ( current === 'publish' ) {
				this.model.set( {status: 'draft'} );
				this.save();
				return;
			}

			if ( ! this.model.hasChildren() ) {
				can_publish = false;
			}

			if ( this.model.get( 'lessons' ).length > 0 ) {
				var published_lesson = this.model.get( 'lessons' ).findWhere( {post_status: 'publish'} );

				if ( ! published_lesson ) {
					can_publish = false;
				}
			}

			if ( this.model.get( 'chapters' ).length > 0 ) {
				var published_ch = this.model.get( 'chapters' ).findWhere( {post_status: 'publish'} );

				if ( ! published_ch ) {
					can_publish = false;
				}
			}

			if ( can_publish === false ) {
				TVE_Dash.err( ThriveApp.t.NumberLessons );
				return;
			}

			if ( this.model.get( 'modules' ).length > 0 ) {
				var published_module = this.model.get( 'modules' ).findWhere( {post_status: 'publish'} );

				if ( ! published_module ) {
					TVE_Dash.err( ThriveApp.t.NoPublishedModule );
					return;
				}
			}

			this.model.set( {status: current == 'draft' ? 'publish' : 'draft'} );

			this.save();

			return this
		},
		save: function () {
			TVE_Dash.cardLoader( this.$el );
			var self = this,
				xhr = self.model.save();

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					if ( response ) {
						self.collection.trigger( 'tva_filter_courses' );

						ThriveApp.globals.available_settings.fetch().success( function ( response, status, options ) {
							ThriveApp.globals.settings.set( {
								iframe_url: ThriveApp.globals.settings.get( 'preview_url' ),
								preview_url: response.preview_url,
								preview_option: ! ! ThriveApp.globals.courses.findWhere( {status: 'publish'} )
							} );
						} );
					}
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.err( errorObj.responseText );
				} );
			}
		}
	} );

} )( jQuery );

