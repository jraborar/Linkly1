( function ( $ ) {

	var listView = require( '../course/items-list' );

	module.exports = listView.extend( {
		template: TVE_Dash.tpl( 'course/module/module' ),
		className: 'tva-module-item tva-single-item',
		$_list: null,
		events: function () {
			return _.extend( {}, listView.prototype.events, {
				'click .tva-add-module-lesson': 'addLesson',
				'click .tva-add-module-chapter': 'addChapter',
				'click .tva-add-module-chapter-single': 'addChapter',
				'click .tva-edit-module': 'editModule',
				'click .tva-delete-module': 'deleteModule',
				'click .tva-edit-module-name': 'editTitle',
				'mousedown .tva-drag-module': function () {
					ThriveApp.globals.moved_item = this.model;
				},
				'click .tva-drag-module': function ( e ) {
					e.stopPropagation();
				}
			} );
		},
		initialize: function () {
			this.listenTo( this.model, 'change:checked', this.setChecked );
			this.listenTo( this.model, 'change:expanded', this.render );
			this.$el.attr( 'data-id', this.model.get( 'ID' ) );
			this.$el.attr( 'id', 'tva-module-' + this.model.get( 'ID' ) );

			var self = this;

			this.model.on( 'tva_render_content', function () {
				self.render();
			} );
		},
		render: function () {
			this.$el.empty();
			var status = 'tva-status-red',
				unpublished_lessons = false,
				lessons_count = this.model.get( 'lessons' ).length ? this.model.get( 'lessons' ).length : 0,
				chapters_count = this.model.get( 'chapters' ).length ? this.model.get( 'chapters' ).length : 0;

			if ( this.model.get( 'post_status' ) === 'publish' ) {
				var children = this.model.hasChildren();

				if ( children ) {
					var items_status = this.model.get( children ).listValue( 'post_status' ),
						drafts = _.find( items_status, function ( item_status ) {
							return item_status === 'draft'
						} );

					status = drafts ? 'tva-status-yellow' : 'tva-status-green';
				}
			}

			if ( this.model.hasChildren() === 'chapters' ) {
				this.model.get( 'chapters' ).each( function ( chapter ) {
					if ( chapter.get( 'lessons' ).length ) {
						lessons_count = lessons_count += chapter.get( 'lessons' ).length;
					}

					if ( unpublished_lessons === false ) {
						unpublished_lessons = ! ! chapter.get( 'lessons' ).findWhere( {post_status: 'draft'} );
					}
				} )
			}

			this.$el.html( this.template( {
				model: this.model,
				status: status,
				unpublished_lessons: unpublished_lessons,
				lessons_count: lessons_count,
				chapters_count: chapters_count
			} ) );

			this.$moduleTitle = this.$( '.tva-module-title' );
			this.renderContent();

			if ( ! this.model.get( 'expanded' ) ) {
				this.$el.addClass( 'tva-module-collapsed' );
			}

			if ( chapters_count > 0 ) {
				this.$( '.tva-chapters-count, .tva-brackets' ).removeClass( 'tva-hide' );
			}

			if ( lessons_count > 0 ) {
				this.$( '.tva-lessons-count, .tva-brackets' ).removeClass( 'tva-hide' );
				if ( chapters_count > 0 ) {
					this.$( '.tva-comma' ).removeClass( 'tva-hide' );
				}
			}

			if ( lessons_count === 0 && chapters_count === 0 ) {
				this.$( '.tva-empty' ).removeClass( 'tva-hide' );
				this.$( '.tva-brackets' ).addClass( 'tva-gold' );
			}

			return this;
		},
		animateItem: function () {
			listView.prototype.animateItem.apply( this, arguments );

			if ( this.expanded && ( this.expanded.get( 'ID' ) !== this.model.get( 'ID' ) ) ) {
				this.expanded.set( {expanded: false} );
			}

			ThriveApp.globals.active_course.trigger( 'tva_apply_sortable' );
		},
		afterAddChapterModel: function () {
			this.chapter_model.set( {
				course_id: this.model.get( 'course_id' ),
				post_parent: this.model.get( 'ID' )
			} );
		},
		afterAddLessonModel: function () {
			this.lesson_model.set( {post_parent: this.model.get( 'ID' )} );
		},
		editModule: function ( e ) {
			e.stopPropagation();
			this.modal( ThriveApp.modals.ModuleModalEditor, {
				model: new ThriveApp.models.Module( this.model.toDeepJson() ),
				collection: this.collection,
				'max-width': '850px',
				width: 'auto',
				in_duration: 200,
				out_duration: 300,
				className: 'tva-default-modal-style tvd-modal',
				viewName: 'ModuleEditor'
			} );
		},
		deleteModule: function ( e ) {
			e.stopPropagation();
			ThriveApp.globals.selected_items.reset();
			this.modal( ThriveApp.modals.ModuleModalDelete, {
				model: this.model,
				collection: this.collection,
				viewName: 'ModuleDelete',
				'max-width': '600px',
				width: 'auto',
				in_duration: 200,
				out_duration: 300,
				className: 'tva-delete-modal-style tvd-modal'
			} );
		},
		editTitle: function ( e ) {
			e.stopPropagation();
			var self = this,
				edit_btn = this.$el.find( '.tva-edit-module-name' ),
				edit_model = new Backbone.Model( {
					title: this.model.get( 'post_title' ),
					required: true
				} );
			edit_btn.hide();
			edit_model.on( 'change:value', function () {

				self.model.set( {post_title: edit_model.get( 'value' )} );
				self.save.apply( self, arguments );
				self.$moduleTitle.show();
				self.$el.find( '.tva-inline-edit' ).hide();
				edit_btn.css( 'display', 'inline-block' );
				self.$moduleTitle.text( edit_model.get( 'value' ) );


			} );
			edit_model.on( 'tvu_no_change', function () {
				self.$moduleTitle.html( self.model.get( 'post_title' ) ).show();
				self.$el.find( '.tva-inline-edit' ).remove();
				edit_btn.css( 'display', 'inline-block' );
			} );

			var textEdit = new ThriveApp.views.InputTitle( {
				model: edit_model,
				el: this.$el.find( '.tva-module-title-container' ),
				tagName: 'div',
				method: 'append'
			} );

			this.$moduleTitle.hide();

			textEdit.render();
			textEdit.focus();
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

} )( jQuery )