( function ( $ ) {

	var listView = require( '../course/items-list' );

	module.exports = listView.extend( {
		template: TVE_Dash.tpl( 'course/chapter/chapter' ),
		className: 'tva-chapter-item tva-single-item',
		allowedItems: [ 'lesson' ],
		$_list: null,
		events: function () {
			return _.extend( {}, listView.prototype.events, {
				'click .tva-expand-chapter': 'expandChapter',
				'click .tva-collapse-chapter': 'collapseChapter',
				'click .tva-add-chapter-lesson': 'addLesson',
				'click .tva-delete-chapter': 'deleteChapter',
				'click .tva-edit-chapter-name': 'editTitle',
				'click .tva-drag-chapter': function ( e ) {
					e.stopPropagation();
				},
				'mousedown .tva-drag-chapter': function () {
					ThriveApp.globals.moved_item = this.model;
				}
			} );
		},
		initialize: function ( args ) {
			var self = this;

			this.index = args.index;

			this.listenTo( this.model, 'change:checked', this.setChecked );

			this.model.on( 'tva_render_content', function () {
				self.render();
			} );

			this.$el.attr( 'data-id', this.model.get( 'ID' ) );

			return this;
		},
		render: function () {
			this.$el.empty();
			var status = 'tva-status-red';

			if ( this.model.get( 'post_status' ) === 'publish' ) {
				status = this.model.get( 'lessons' ).findWhere( {post_status: 'draft'} ) ? 'tva-status-yellow' : 'tva-status-green';
			}

			this.$el.html( this.template( {
					model: this.model,
					status: status,
					index: this.index + 1
				} )
			);
			this.$chapterTitle = this.$( '.tva-chapter-title' );

			this.renderContent();

			if ( ! this.model.get( 'expanded' ) ) {
				this.$el.addClass( 'tva-chapter-collapsed' );
			}

			if ( this.model.get( 'lessons' ).length ) {
				this.$( '.tva-ch-lessons-count' ).removeClass( 'tva-hide' );
			} else {
				this.$( '.tva-brackets' ).addClass( 'tva-gold' );
			}

			return this;
		},
		afterAddLessonModel: function () {
			this.lesson_model.set( {post_parent: this.model.get( 'ID' )} );
		},
		deleteChapter: function () {
			ThriveApp.globals.selected_items.reset();
			this.modal( ThriveApp.modals.ChapterModalDelete, {
				model: this.model,
				collection: this.collection,
				'max-width': '600px',
				width: 'auto',
				in_duration: 200,
				out_duration: 300,
				viewName: 'ChapterDelete',
				className: 'tva-delete-modal-style tvd-modal'
			} );
		},
		editTitle: function ( e ) {
			e.stopPropagation();
			var self = this,
				edit_btn = this.$el.find( '.tva-edit-chapter-name' ),
				edit_model = new Backbone.Model( {
					title: this.model.get( 'post_title' ),
					required: true
				} );
			edit_btn.hide();
			edit_model.on( 'change:value', function () {

				self.model.set( {post_title: edit_model.get( 'value' )} );
				self.save.apply( self, arguments );
				self.$chapterTitle.show();
				self.$el.find( '.tva-inline-edit' ).hide();
				edit_btn.css( 'display', 'inline-block' );
				self.$chapterTitle.text( edit_model.get( 'value' ) );
			} );
			edit_model.on( 'tvu_no_change', function () {
				self.$chapterTitle.html( self.model.get( 'post_title' ) ).show();
				self.$el.find( '.tva-inline-edit' ).remove();
				edit_btn.css( 'display', 'inline-block' );
			} );

			var textEdit = new ThriveApp.views.InputTitle( {
				model: edit_model,
				el: this.$el.find( '.tva-chapter-title-container' ),
				tagName: 'div',
				method: 'append'
			} );

			this.$chapterTitle.hide();
			textEdit.render();
			textEdit.focus();
		},
		animateItem: function () {
			this.model.set( {expanded: ! this.model.get( 'expanded' )} );
			this.render();
			ThriveApp.globals.active_course.trigger( 'tva_apply_sortable' );
		},
		save: function () {
			TVE_Dash.showLoader();
			var xhr = this.model.save();

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.err( errorObj.responseText );
				} );
				xhr.always( function () {
					TVE_Dash.hideLoader();
				} );
			}
		}
	} );

} )( jQuery );
