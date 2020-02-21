( function ( $ ) {

	var lesson = require( './lesson' );

	module.exports = lesson.extend( {
		className: 'tva-lesson-item tva-single-item',
		template: TVE_Dash.tpl( 'course/edit/lesson-normal' ),
		events: {
			'click .tva-edit-lesson': 'editLesson',
			'click .tva-delete-lesson': 'changeState',
			'click .tva-publish-lesson': 'publishLesson',
			'click .tva-edit-lesson-name': 'editTitle',
			'click .tva-select-lesson': 'toggleSelectedClass',
			'mousedown .tva-drag-lesson': function () {
				ThriveApp.globals.moved_item = this.model;
			}
		},
		changed_models: [],
		initialize: function () {

			this.$el.attr( 'data-id', this.model.get( 'ID' ) );

			this.listenTo( this.model, 'remove', function () {
				this.collection.remove( this.model );
				this.$el.remove();
			} );
		},
		render: function () {
			var published = this.collection.where( {post_status: 'publish'} );

			this.model.set( {tooltiped: false} );

			if ( published.length === 0 && this.collection.at( 0 ) == this.model ) {
				this.model.set( {tooltiped: true} );
			}

			this.$el.html( this.template( {model: this.model} ) );

			this.$lessonTitle = this.$( '.tva-lesson-title' );

			if ( this.model.get( 'has_tcb_content' ) === true ) {
				this.$( '.tva-edit-option' ).toggleClass( 'tva-hide' );
			}

			return this;
		},
		editLesson: function ( e ) {
			if ( $( '.tva-course-section' ).hasClass( 'tva-course-editor' ) ) {
				$( '.tva-cancel-edit' ).click();
			}

			var id = $( e.currentTarget ).attr( 'data-id' ),
				model = this.collection.findWhere( {ID: parseInt( id )} ),
				clone_model = new ThriveApp.models.Lesson( model.toDeepJSON() );

			this.modal( ThriveApp.modals.LessonModalEditor, {
				model: clone_model,
				collection: this.collection,
				'max-width': '60%',
				width: '800px',
				in_duration: 200,
				out_duration: 0,
				className: 'tva-default-modal-style tvd-modal',
				viewName: 'LessonEditor'
			} );
		},
		changeState: function () {
			var model = this.collection.findWhere( {state: ThriveApp.t.delete_state} );

			if ( model ) {
				model.set( {state: ThriveApp.t.normal_state} );
			}

			this.model.set( {state: ThriveApp.t.delete_state} )
		},
		publishLesson: function () {
			var current = this.model.get( 'post_status' ),
				post_status = current === 'draft' ? 'publish' : 'draft';

			this.changed_models = this.model.changeParentsStatus();

			this.model.set( {post_status: post_status} );
			this.save();

			return this;
		},
		editTitle: function ( e ) {
			var self = this,
				edit_btn = this.$el.find( '.tva-edit-lesson-name' ),
				edit_model = new Backbone.Model( {
					title: this.model.get( 'post_title' ),
					required: true
				} );
			edit_btn.hide();
			edit_model.on( 'change:value', function () {

				self.model.set( {post_title: edit_model.get( 'value' )} );
				self.save.apply( self, arguments );
				self.$lessonTitle.show();
				self.$el.find( '.tva-inline-edit' ).hide();
				edit_btn.show();
			} );
			edit_model.on( 'tvu_no_change', function () {
				self.$lessonTitle.html( self.model.get( 'post_title' ) ).show();
				self.$el.find( '.tva-inline-edit' ).remove();
				edit_btn.show();
			} );

			var textEdit = new ThriveApp.views.InputTitle( {
				model: edit_model,
				el: this.$el.find( '.tva-title-container' ),
				tagName: 'div',
				method: 'prepend'
			} );

			this.$lessonTitle.hide();
			textEdit.render();
			textEdit.focus();
		},
		save: function () {
			TVE_Dash.showLoader();
			var xhr = this.model.save(),
				self = this;

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {

					/**
					 * It's very sad that this need to be here but seems that after every save options object
					 * which holds all xhr data is inserted in the model
					 * having as key response var: https://www.screencast.com/t/KGRDtctLreL
					 * This leeds to issues and unexpected behaviour if the model need to be used later on
					 * into a normal ajax call
					 */

					if ( self.model.get( response ) ) {
						self.model.unset( response )
					}

					if ( self.changed_models.length > 0 ) {
						_.each( self.changed_models, function ( model ) {
							model.save();
						} );
					}

					ThriveApp.globals.active_course.trigger( 'tva_render_content' );
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.err( JSON.parse( errorObj.responseText ).message );
				} );
				xhr.always( function () {
					TVE_Dash.hideLoader();
				} );
			}
		}
	} );

} )( jQuery )