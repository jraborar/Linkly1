( function ( $ ) {

	var utilsView = require( './utils' );

	module.exports = utilsView.extend( {
		className: '',
		template: TVE_Dash.tpl( 'course/manage/course-content' ),
		$_list: null,
		newOrder: [],
		/**
		 * {Boolean}
		 */
		updated: false,
		/**
		 * {Backbone.Model}
		 */
		receiver_item_model: null,
		events: {
			'click .tva-add-c-lesson': 'addLesson',
			'click .tva-add-chapter-single': 'addChapter',
			'click .tva-add-module-single': 'addModule'
		},
		initialize: function () {
			var self = this;
			this.model.on( 'tva_apply_sortable', function () {
				self.applySortable();
			} );
		},
		render: function () {
			this.$( '.tva-content-container' ).empty();
			this.$el.append( this.template( {model: this.model} ) );
			this.renderContent();
			this.applySortable();

			return this;
		},
		renderContent: function () {
			var children = this.model.hasChildren();

			if ( ! children || ! ThriveApp.util.isCollection( this.model.get( children ) ) ) {
				return;
			}

			this.renderList();

			return this;
		},
		renderList: function () {
			if ( this.$_list ) {
				this.$_list.remove();
			}

			var children = this.model.hasChildren(),
				view = require( './items-list' );

			this.$_list = new view( {
				model: this.model,
				collection: this.model.get( children )
			} );

			this.$( '.tva-elements-container' ).prepend( this.$_list.render().$el );

			return this;
		},
		renderOne: function ( item, index ) {
			var type = item.get( 'item_type' ).toLowerCase(),
				view = '';

			switch ( item.get( 'item_type' ).toLowerCase() ) {
				case 'module':
					view = require( '../module/module' );
					break;

				case 'chapter':
					view = require( '../chapter/chapter' );

					break;

				case 'lesson':
					view = require( '../lesson/lesson' );

					break;

				default:
					break;
			}

			var $lastItem = this.$el.find( '.tva-' + type + '-item' ).last(),
				view = new view( {
					model: item,
					collection: this.model.get( this.getPlural( type ) ),
					index: index
				} );

			if ( $lastItem.length ) {
				$lastItem.after( view.render().$el );
			} else {
				this.$el.prepend( view.render().$el );
			}

			return this;
		},
		updateOrder: function () {
			var self = this;
			this.updated = true;

			TVE_Dash.showLoader();
			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce,
					'X-TVA-Request-ID': ThriveApp.request_id
				},
				type: 'POST',
				url: ThriveApp.routes.courses + '/update_posts_order/',
				data: {
					items: self.newOrder,
					course_id: self.model.get( 'ID' )
				}
			} ).done( function ( response, status, options ) {
				if ( response ) {
					self.model.set( response );
					self.model.set_data();

					ThriveApp.globals.course_elements = ThriveApp.util.getCourseElements( ThriveApp.globals.active_course );

					if ( self.receiver_item_model ) {
						ThriveApp.globals.course_elements.get( 'all' ).findWhere(
							{ID: self.receiver_item_model.get( 'ID' )} ).set( {expanded: true}
						);

						// expand the module if needed
						if ( self.receiver_item_model.get( 'post_parent' ) > 0 ) {
							self.model.get( 'modules' ).findWhere(
								{ID: self.receiver_item_model.get( 'post_parent' )} ).set( {expanded: true}
							)
						}

						self.receiver_item_model = null;
					}

					self.render();
				}
			} ).always( function () {
				self.newOrder = [];
				$( '.tvd-material-tooltip' ).hide();
				TVE_Dash.hideLoader();
			} );

			return this;
		},
		applySortable: function () {
			/**
			 * When called this should always be a ThriveApp.views.CourseContent instance
			 * and have ThriveApp.globals.active_course as model
			 */

			this._sortable();
			this._droppable();
		},
		_sortable: function () {
			var self = this;

			function show_position( event, ui ) {
				var $placeholder = $( ui.placeholder );

				self.position = $placeholder.prevAll().not( ui.item ).length + 1;

				$placeholder.html( "<div class='tvd-col tvd-s12 tva-inside-placeholder' style='height: 100px;'><span>" + self.position + (
					ThriveApp.t.n_suffix[ self.position ] ? ThriveApp.t.n_suffix[ self.position ] : ThriveApp.t.n_th
				) + ' ' + ThriveApp.t.position + "</span></div>" );
			}

			/**
			 * Sortable for modules
			 */
			this.$( '.tva-modules-section' ).sortable( {
				placeholder: 'tva-sortable-placeholder',
				items: '.tva-module-item',
				forceHelperSize: true,
				dropOnEmpty: true,
				refreshPositions: true,
				handle: '.tva-drag-module',
				update: _.bind( self.updateModulesOrder, this ),
				change: show_position,
				start: function ( event, ui ) {
					var expanded = self.model.get( 'modules' ).where( {expanded: true} );

					if ( expanded.length > 0 ) {
						_.each( expanded, function ( model ) {
							model.set( {expanded: false} );
							model.trigger( 'tva_render_content' );
						} );
					}
				},
				stop: function ( event, ui ) {
				}
			} );

			/**
			 * Sortable for chapters
			 */
			this.$( '.tva-chapters-section' ).sortable( {
				connectWith: this.$( '.tva-chapters-section' ),
				placeholder: 'tva-sortable-placeholder',
				items: '.tva-chapter-item',
				forceHelperSize: true,
				dropOnEmpty: true,
				refreshPositions: true,
				handle: '.tva-drag-chapter',
				update: _.bind( self.updateChaptersOrder, this ),
				change: show_position,
				start: function ( event, ui ) {
					self.updated = false;
					ui.helper.outerHeight();
					show_position( event, ui );
					$( 'body' ).addClass( 'tva-sorting' );

					self.$( '.tva-module-has-lessons' ).parent().addClass( 'tva-module-disabled' );

					var expanded = ThriveApp.globals.course_elements.get( 'chapters' ).where( {expanded: true} );

					if ( expanded.length > 0 ) {
						_.each( expanded, function ( model ) {
							model.set( {expanded: false} );
							model.trigger( 'tva_render_content' );
						} );
					}
				},
				stop: function ( event, ui ) {
					self.$( '.tva-module-has-lessons' ).parent().removeClass( 'tva-module-disabled' );
				}
			} );

			/**
			 * Sortable for lessons
			 */
			this.$( '.tva-lessons-section' ).sortable( {
				connectWith: this.$( '.tva-lessons-section' ),
				placeholder: 'ui-sortable-placeholder',
				items: '.tva-lesson-item',
				forceHelperSize: true,
				dropOnEmpty: true,
				refreshPositions: true,
				forcePlaceholderSize: true,
				handle: '.tva-drag-card',
				update: _.bind( self.updateLessonsOrder, this ),
				change: show_position,
				start: function ( event, ui ) {
					self.updated = false;

					self.$( '.tva-chapter-item' ).droppable( {
						accept: '.tva-lesson-item',
						hoverClass: 'tva-drop-hover',
						drop: function ( event, ui ) {
							var id = parseInt( self.$( event.target ).attr( 'data-id' ) );

							self.receiver_item_model = new ThriveApp.models.Chapter( JSON.parse( JSON.stringify(
								ThriveApp.globals.course_elements.get( 'chapters' ).findWhere( {ID: id} )
							) ) );
						},
						over: function ( event, ui ) {
							setTimeout( function () {
								self.eventTarget = event.target;

								if ( self.eventTarget === event.target ) {
									self.$( event.target ).find( '.tva-drag-chapter' ).remove();
									self.$( event.target ).find( '.tva-lessons-section' )
									    .css( 'min-height', self.$( ui.draggable ).height() );

									self.$( event.target )
									    .find( '.tva-elements-container' )
									    .slideDown( 'slow', function () {
										    self.$( '.tva-lessons-section' ).sortable( 'refresh' );
									    } );
								}
							}, self.model.hasChildren() === 'modules' ? 0 : 1000 );
						},
						out: function ( event, ui ) {
							self.receiver_item_model = null;
						}
					} );

					ui.helper.outerHeight();
					show_position( event, ui );
					$( 'body' ).addClass( 'tva-sorting' );
				},
				stop: function ( event, ui ) {
					if ( ! self.receiver_item_model ) {
						self.$( '.tva-lessons-section' ).sortable( 'cancel' );
						ThriveApp.globals.moved_item = null;
					}

					setTimeout( function () {
						$( 'body' ).removeClass( 'tva-sorting' );
					}, 200 );
				}
			} );
		},
		_droppable: function () {
			var self = this;

			this.$( '.tva-module-item' ).droppable( {
				accept: '.tva-chapter-item, .tva-lesson-item',
				hoverClass: 'tva-drop-hover',
				drop: function ( event, ui ) {
					var id = parseInt( self.$( event.target ).attr( 'data-id' ) );

					self.receiver_item_model = new ThriveApp.models.Module( JSON.parse( JSON.stringify(
						ThriveApp.globals.course_elements.get( 'modules' ).findWhere( {ID: id} )
					) ) );
				},
				over: function ( event, ui ) {
					self.eventTarget = event.target;

					setTimeout( function () {
						if ( self.eventTarget === event.target ) {
							var $elements = self.$( event.target ).find( '.tva-elements-container:first' ),
								slide = self.$( $elements ).hasClass( 'tva-module-has-lessons' ) ? self.isLesson( ThriveApp.globals.moved_item ) : true;

							self.$( $elements ).find( '.tva-childs-section' ).css( 'min-height', '10px' );

							if ( slide ) {
								self.$( event.target ).find( '.tva-drag-module' ).remove();
								self.$( $elements )
								    .css( 'min-height', self.$( ui.draggable ).height() )
								    .slideDown( 'slow', function () {
									    self.$( '.tva-chapters-section' ).sortable( 'refresh' );
									    self.$( '.tva-lessons-section' ).sortable( 'refresh' );
								    } );
							}
						}
					}, 1000 );
				}
			} );
		},
		addLesson: function () {
			this.lesson_model = new ThriveApp.models.Lesson( {
				order: this.model.get( 'lessons' ).length,
				course_id: this.model.get( 'term_id' ) ? this.model.get( 'term_id' ) : this.model.get( 'course_id' ),
				lesson_type: ThriveApp.globals.active_course.get( 'lesson_template' ).lesson_type,
				post_media: ThriveApp.globals.active_course.get( 'lesson_template' ).post_media,
				comment_status: ThriveApp.globals.active_course.get( 'lesson_template' ).comment_status
			} );

			this.afterAddLessonModel();

			this.modal( ThriveApp.modals.LessonModalEditor, {
				model: this.lesson_model,
				collection: this.model.get( 'lessons' ),
				'max-width': '850px',
				width: 'auto',
				in_duration: 200,
				out_duration: 300,
				className: 'tva-default-modal-style tvd-modal',
				viewName: 'LessonEditor'
			} );
		},
		addChapter: function ( e ) {
			this.chapter_model = new ThriveApp.models.Chapter( {
				order: this.model.get( 'chapters' ).length,
				course_id: this.model.get( 'ID' ),
				comment_status: this.model.get( 'comment_status' )
			} );

			this.afterAddChapterModel();

			this.modal( ThriveApp.modals.ChapterModalEditor, {
				model: this.chapter_model,
				collection: this.model.get( 'chapters' ),
				module: this.model,
				'max-width': '850px',
				width: 'auto',
				in_duration: 200,
				out_duration: 300,
				className: 'tva-default-modal-style tvd-modal',
				viewName: 'ChapterEditor'
			} );
		},
		addModule: function () {
			this.module_model = new ThriveApp.models.Module( {
				order: this.model.get( 'modules' ).length,
				course_id: this.model.get( 'ID' ),
				comment_status: this.model.get( 'comment_status' )
			} );

			this.afterAddModuleModel();

			this.modal( ThriveApp.modals.ModuleModalEditor, {
				model: this.module_model,
				collection: this.model.get( 'modules' ),
				'max-width': '850px',
				width: 'auto',
				in_duration: 200,
				out_duration: 300,
				className: 'tva-default-modal-style tvd-modal',
				viewName: 'ModuleEditor'
			} );
		},
		afterAddLessonModel: function () {
		},
		afterAddChapterModel: function () {
		},
		afterAddModuleModel: function () {
		},
		/**
		 *
		 * @param {Backbone.Model} model
		 * @param {String} collection_name
		 * @param {Boolean} add
		 */
		updateCollection: function ( model, collection_name, add ) {

			var values = [ 'ID', 'order', 'post_type', 'post_parent' ];

			model.get( collection_name ).remove( ThriveApp.globals.moved_item, {silent: true} );

			if ( add === true ) {
				model.get( collection_name ).add( ThriveApp.globals.moved_item, {at: this.position - 1} );
			}

			model.get( collection_name ).updateValues( {order: ''} );

			/** {Backbone.Collection} */
			var collection = model.get( collection_name );
			collection.sort();

			this.newOrder = collection.pluckValues( values ).concat( this.newOrder );
		},
		/**
		 *
		 * @param {String} items
		 */
		updateItemsOrder: function ( items ) {
			this.updateCollection( this.model, items, true );
			ThriveApp.globals.moved_item = null;
			this.updateOrder();
		},
		updateModulesOrder: function () {
			this.updateItemsOrder( 'modules' )
		},
		updateChaptersOrder: function () {
			if ( this.model.hasChildren() === 'chapters' ) {
				this.updateItemsOrder( 'chapters' );

				return;
			}

			/**
			 * Because we may move a chapter from one module to another sortable will trigger change event twice,
			 * for each item involved in move action. So here we ensure a single execution!
			 */
			if ( this.updated === true ) {
				this.updated = false;
				return;
			}

			if ( ! this.receiver_item_model ) {
				this.render();
				return;
			}

			/**
			 * Here we know for sure that we either move chapter from one module to another or within the same module
			 */
			if ( this.isModule( this.receiver_item_model ) ) {

				/**
				 * Cancel the sortable if a chapter is dropped over a module with lessons
				 */
				if ( this.isChapter( ThriveApp.globals.moved_item ) && this.receiver_item_model.hasChildren() === 'lessons' ) {
					this.$( '.tva-chapters-section' ).sortable( 'cancel' );
					return
				}

				if ( this.receiver_item_model.hasChildren() === 'chapters' && this.isLesson( ThriveApp.globals.moved_item ) ) {
					this.$( '.tva-lessons-section' ).sortable( 'cancel' );
					this.render();
					return;
				}

				var sender_module = this.model.get( 'modules' ).findWhere( {ID: ThriveApp.globals.moved_item.get( 'post_parent' )} );

				ThriveApp.globals.moved_item.set( {post_parent: this.receiver_item_model.get( 'ID' )} );

				if ( sender_module.get( 'ID' ) !== this.receiver_item_model.get( 'ID' ) ) {
					this.updateCollection( sender_module, 'chapters', false );
				}

				this.updateCollection( this.receiver_item_model, 'chapters', true );
			}

			ThriveApp.globals.moved_item = null;
			this.updateOrder();

			return this;
		},
		updateLessonsOrder: function () {
			if ( this.model.hasChildren() === 'lessons' ) {
				this.updateItemsOrder( 'lessons' );

				return;
			}

			if ( this.updated === true ) {
				this.updated = false;
				return;
			}

			if ( ! this.receiver_item_model ) {
				this.render();
				return;
			}

			/**
			 * Make sure that the receiver item is a chapter
			 */
			if ( this.receiver_item_model.hasChildren() === 'chapters' && ! this.isChapter( ThriveApp.globals.moved_item ) ) {
				this.$( '.tva-lessons-section' ).sortable( 'cancel' );
				this.render();
				return;
			}

			var from_parent = ThriveApp.globals.course_elements.get( 'all' ).findWhere( {ID: ThriveApp.globals.moved_item.get( 'post_parent' )} );

			ThriveApp.globals.moved_item.set( {post_parent: this.receiver_item_model.get( 'ID' )} );
			this.updateCollection( this.receiver_item_model, 'lessons', true );

			if ( from_parent.get( 'ID' ) !== this.receiver_item_model.get( 'ID' ) ) {
				this.updateCollection( from_parent, 'lessons', false );
			}

			ThriveApp.globals.moved_item = null;
			this.updateOrder();
		}
	} );

} )( jQuery );
