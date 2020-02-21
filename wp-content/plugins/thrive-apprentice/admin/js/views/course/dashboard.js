( function ( $ ) {

	var utils = require( './utils' ),
		contentView = require( './content' ),
		editView = require( './edit' ),
		restrictionsView = require( './restrictions' ),
		detailsView = require( './details' );

	/**
	 * Edit course and lessons view
	 */
	module.exports = utils.extend( {
		className: 'tvd-container',
		template: TVE_Dash.tpl( 'course/manage/manage' ),
		events: {
			'click .tva-publish-course': 'changeCourseStatus',
			'click .tva-edit-course-name': 'editTitle',
			'click .tva-delete-lessons': 'bulkDeleteItems',
			'click #tva-select-all-items': 'selectAll',
			'click .tva-publish-lessons': 'bulkPublishItems',
			'click .tva-unpublish-lessons': 'bulkUnPublishItems',
			'click .tva-move-items': 'bulkMoveItems',
			'click .tva-add-content': 'addContent',
			'click .tva-group-into-chapter': 'bulkChapterGroup',
			'click .tva-group-into-module': 'bulkModuleGroup',
			'click .tva-tab-item': 'setActiveTab'
		},
		content: null,
		allowedItems: [ 'module', 'chapter', 'lesson' ],
		select_all: false,
		activeTab: 'content',
		initialize: function ( options ) {
			this.activeTab = options.activeTab ? options.activeTab : this.activeTab;

			var self = this;

			this.model.on( 'tva_after_action', function ( args ) {
				self.afterAction( args );
				self.select_all = false;
				self.render();
			} );
			this.listenTo( this.model.get( 'lessons' ), 'remove', function () {
				if ( self.model.get( 'lessons' ).length === 0 ) {
					self.render();
				}
			} );

			this.model.on( 'reset_select_all', function () {
				self.select_all = false;
			} );
			this.model.on( 'tva_render_content', function ( args ) {
				self.model.checkStatus();
				self.render();
			} );

			this.model.on( 'render_bulk_actions', function () {
				self.renderBulkActions();
			} );

			this.listenTo( ThriveApp.globals.settings, 'change:comment_status', this.onCommentStatusChange );
		},
		render: function () {
			var contentTab = this.model.hasChildren(),
				tabName = contentTab ? ThriveApp.util.upperFirst( contentTab ) : 'Content',
				self = this;

			this.$el.html( this.template( {model: this.model, select_all: this.select_all, contentTab: tabName} ) );
			this.renderDetails();
			this.renderActiveTab();
			this.$el.find( '[data-tab="' + this.activeTab + '"]' ).addClass( 'tva-active-tab' );

			if ( ! this.model.get( 'ID' ) ) {
				this.$el.find( '[data-tab="content"]' ).addClass( 'tva-disable-tab' );
				this.$( '.tva-preview-course, .tva-edit-course-name' ).hide();
			}

			$( document ).scroll( function () {
				if ( self.activeTab === 'content' ) {
					ThriveApp.util.makeBulkActionsStiky();
				}
			} );
			this.$title = this.$( '.tva-main-course-title' );

			return this;
		},
		renderActiveTab: function () {
			var fn = 'render' + ThriveApp.util.upperFirst( this.activeTab ) + 'Tab';

			if ( typeof this[ fn ] === 'function' ) {
				this[ fn ]();
			}
		},
		renderContentTab: function () {
			this.$( '.tva-tab' ).hide();

			if ( this.$( '.tva-content-tab' ).length ) {
				this.$( '.tva-content-tab' ).show();
				this.$( '.tva-add-content' ).show();

				return;
			}

			this.$( '.tva-active-tab-content' ).append( '<div class="tva-tab tva-content-tab"></div>' );

			this.renderBulkActions();

			new contentView( {
				model: this.model,
				el: this.$( '.tva-content-tab' )
			} ).render();
		},
		renderDetailsTab: function () {
			this.$( '.tva-tab' ).hide();
			this.$( '.tva-add-content' ).hide();

			if ( this.$( '.tva-details-tab' ).length ) {
				this.$( '.tva-details-tab' ).show();
				return;
			}

			this.$( '.tva-active-tab-content' ).append( '<div class="tva-tab tva-details-tab"></div>' );


			new editView( {
				model: this.model,
				el: this.$( '.tva-details-tab' )
			} ).render();
		},
		renderRestrictionsTab: function () {
			this.$( '.tva-tab' ).hide();
			this.$( '.tva-add-content' ).hide();

			if ( this.$( '.tva-restrictions-tab' ).length ) {
				this.$( '.tva-restrictions-tab' ).show();
				return;
			}

			this.$( '.tva-active-tab-content' ).append( '<div class="tva-tab tva-restrictions-tab"></div>' );

			new restrictionsView( {
				model: this.model,
				el: this.$( '.tva-restrictions-tab' )
			} ).render();
		},
		setActiveTab: function ( e ) {
			this.tvd_clear_errors();
			var tab = e.currentTarget.getAttribute( 'data-tab' );

			if ( this.activeTab === tab ) {
				return;
			}

			/**
			 * we dont have to validate the model if the user is on Content Tab
			 */
			if ( this.activeTab !== 'content' && ! this.model.isValid() ) {
				return this.tvd_show_errors( this.model );
			}

			this.activeTab = tab;
			this.$( '.tva-tab-item' ).removeClass( 'tva-active-tab' );
			this.$( e.currentTarget ).addClass( 'tva-active-tab' );
			this.renderActiveTab();
		},
		renderBulkActions: function () {
			ThriveApp.globals.bulk_action_model = new ThriveApp.models.BulkActions();

			if ( this.model.hasChildren() ) {
				ThriveApp.globals.bulk_action_model.get( 'actions' ).push( 'selectAll' );
			}

			new ThriveApp.views.RenderBulkActions( {
				el: this.$( '.tva-content-tab' ),
				model: ThriveApp.globals.bulk_action_model,
				select_all: this.select_all
			} ).render();

			setTimeout( function () {
				ThriveApp.util.makeBulkActionsStiky();
			}, 100 );
		},
		renderDetails: function () {
			var view = new detailsView( {
				el: this.$( '.tva-course-section' ),
				model: this.model
			} );

			view.render();
		},
		afterAction: function ( args ) {
			var fn = 'after' + ThriveApp.util.upperFirst( args.action );
			this[ fn ]( args );

			return this;
		},
		afterDelete: function ( args ) {
			var course = args.model;

			this.model.set( course );
			this.model.set_data();

			ThriveApp.globals.course_elements = ThriveApp.util.getCourseElements( this.model );

			ThriveApp.globals.bulk_action_model.clear().set( ThriveApp.globals.bulk_action_model.defaults );
			ThriveApp.globals.selected_items.reset();
		},
		afterPublish: function () {
			ThriveApp.globals.selected_items.updateValues( {checked: false} );
			ThriveApp.globals.selected_items.reset();
		},
		afterUnpublish: function () {
			ThriveApp.globals.selected_items.updateValues( {checked: false} );
			ThriveApp.globals.active_course.checkStatus();
			ThriveApp.globals.selected_items.reset();
		},
		afterMove: function ( args ) {
			var self = this;

			_.each( args.model, function ( model ) {
				var course = ThriveApp.globals.courses.findWhere( {ID: parseInt( model.ID )} );
				course.set( model );
				course.set_data();

				if ( course.get( 'ID' ) === self.model.get( 'ID' ) ) {
					self.model = course;
				}
			} );

			ThriveApp.globals.selected_items.updateValues( {checked: false} );
			ThriveApp.globals.bulk_action_model.clear().set( ThriveApp.globals.bulk_action_model.defaults );
			ThriveApp.globals.selected_items.reset();

			ThriveApp.globals.course_elements = ThriveApp.util.getCourseElements( ThriveApp.globals.active_course );
		},
		afterGroup: function ( args ) {
			ThriveApp.globals.bulk_action_model.clear().set( ThriveApp.globals.bulk_action_model.defaults );
			ThriveApp.globals.active_course.set( JSON.parse( JSON.stringify( args.model ) ) );
			ThriveApp.globals.active_course.set_data();
			ThriveApp.globals.selected_items.reset();

			ThriveApp.globals.course_elements = ThriveApp.util.getCourseElements( ThriveApp.globals.active_course );
		},
		onCommentStatusChange: function () {
			var children = this.model.hasChildren();

			if ( children ) {
				this.model.get( children ).updateValues( {comment_status: this.model.get( 'comment_status' )}, true )
			}

			this.model.set( {comment_status: ThriveApp.globals.settings.get( 'comment_status' )} );
		},
		selectAll: function ( e ) {
			var checked = e.currentTarget.checked,
				children = this.model.hasChildren();

			this.model.get( children ).each( function ( model ) {
				ThriveApp.globals.selected_items.checkItems( model, checked );
			} );

			this.select_all = checked;

			this.renderBulkActions();
		},
		editTitle: function ( e ) {
			e.stopPropagation();
			var self = this,
				edit_btn = this.$el.find( '.tva-edit-course-name' ),
				edit_model = new Backbone.Model( {
					title: this.model.get( 'name' ),
					required: true
				} );
			edit_btn.hide();
			edit_model.on( 'change:value', function () {
				self.model.set( {
					name: edit_model.get( 'value' ),
					slug: ThriveApp.util.slugify( edit_model.get( 'value' ), "-" ).toLowerCase()
				} );
				self.save.apply( self, arguments );
				self.$title.show();
				self.$el.find( '.tva-inline-edit' ).hide();
				edit_btn.css( 'display', 'inline-block' );
				self.$title.text( edit_model.get( 'value' ) );
				self.$( '.tva-msg' ).addClass( 'tva-hide' );
			} );
			edit_model.on( 'tvu_no_change', function () {
				self.$title.html( self.model.get( 'name' ) ).show();
				self.$el.find( '.tva-inline-edit' ).hide();
				edit_btn.css( 'display', 'inline-block' );
				self.$( '.tva-msg' ).addClass( 'tva-hide' );
			} );

			if ( this.textEdit ) {
				this.textEdit.undelegateEvents();
				this.textEdit.$el.find( '.tva-inline-edit' ).remove();
			}

			this.textEdit = new ThriveApp.views.InputTitle( {
				el: this.$el.find( '.tva-course-title-holder' ),
				tagName: 'div',
				method: 'append'
			} );

			this.textEdit.model = edit_model;
			this.$title.hide();
			this.textEdit.render();
			this.textEdit.focus();
			this.$( '.tva-msg' ).removeClass( 'tva-hide' );

			this.textEdit.$el.find( 'input' ).on( 'keyup', function ( e ) {
				self.$( '#tva-course-slug' ).val( e.currentTarget.value );
			} )
		},
		changeCourseStatus: function () {
			var current = this.model.get( 'status' ),
				childs = this.model.hasChildren();

			this.model.set( {update_sendowl_products: true} );
			if ( current === 'publish' ) {
				this.model.set( {status: 'draft'} );
				this.save();
				return this;
			}

			if ( ! childs ) {
				TVE_Dash.err( ThriveApp.t.NumberLessons );
				return;
			}

			var collection = this.model.get( childs ),
				published_item = collection.findWhere( {post_status: 'publish'} );

			if ( ! published_item ) {
				if ( childs === 'modules' ) {
					TVE_Dash.err( ThriveApp.t.NoPublishedModule );
					return;
				}

				TVE_Dash.err( ThriveApp.t.NumberLessons );
				return;
			}

			this.model.set( {status: current == 'draft' ? 'publish' : 'draft'} );
			this.save();

			return this
		},
		bulkPublishItems: function () {
			TVE_Dash.showLoader();
			var valid_ids = [];
			ThriveApp.globals.selected_items.each( function ( model ) {
				if ( model.get( 'type' ) === 'lesson' && model.get( 'post_status' ) === 'draft' ) {
					valid_ids.push( model.get( 'ID' ) );
				}
			} );

			if ( valid_ids.length > 0 ) {
				this.saveBulkActions( 'publish', valid_ids );
			} else {
				TVE_Dash.hideLoader();
			}
		},
		bulkUnPublishItems: function () {
			TVE_Dash.showLoader();
			var valid_ids = [];
			ThriveApp.globals.selected_items.each( function ( model ) {
				if ( model.get( 'type' ) === 'lesson' && model.get( 'post_status' ) === 'publish' ) {
					valid_ids.push( model.get( 'ID' ) );
				}
			} );


			if ( valid_ids.length > 0 ) {
				this.saveBulkActions( 'unpublish', valid_ids );
			} else {
				TVE_Dash.hideLoader();
			}
		},
		bulkMoveItems: function () {
			this.openModal( ThriveApp.modals.ConfirmBulkMove, {
				collection: ThriveApp.globals.courses,
				className: 'tva-default-modal-style tvd-modal'
			} );
		},
		bulkDeleteItems: function () {
			this.openModal( ThriveApp.modals.ConfirmBulkDelete, {
				model: ThriveApp.globals.bulk_action_model,
				className: 'tva-delete-modal-style tvd-modal'
			} );
		},
		bulkChapterGroup: function () {
			this.openModal( ThriveApp.modals.ConfirmChapterGroup, {
				group_type: 'chapter',
				className: 'tva-default-modal-style tvd-modal'
			} );
		},
		bulkModuleGroup: function () {
			this.openModal( ThriveApp.modals.ConfirmModuleGroup, {
				group_type: 'module',
				className: 'tva-default-modal-style tvd-modal'
			} );
		},
		addContent: function () {
			this.openModal( ThriveApp.modals.AddContentModal, {
				className: 'tva-default-modal-style tvd-modal tva-extra-space'
			} );
		},
		saveBulkActions: function ( action, data ) {
			var self = this;
			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce,
					'X-TVA-Request-ID': ThriveApp.request_id
				},
				type: 'POST',
				url: ThriveApp.routes.courses + '/bulk_action/',
				data: {
					action: action,
					items: data,
					course_id: this.model.get( 'ID' )
				}
			} ).done( function ( response, status, options ) {
				var post_status = action === 'unpublish' ? 'draft' : 'publish';

				_.each( response, function ( id ) {
					var element = ThriveApp.globals.course_elements.get( 'all' ).findWhere( {ID: id} );

					if ( element ) {
						element.set( {post_status: post_status} );
					}
				} );

				self.model.trigger( 'tva_after_action', {action: action} );

			} ).error( function ( errorObj ) {
				TVE_Dash.err( JSON.parse( errorObj.responseText ).message );
			} ).always( function () {
				TVE_Dash.hideLoader();
			} );
		},
		save: function () {
			this.tvd_clear_errors();
			//Todo: Some validation to the fields is required
			TVE_Dash.showLoader();
			var self = this,
				xhr = self.model.save();

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					if ( response ) {
						self.renderDetails();

						ThriveApp.globals.available_settings.fetch().success( function ( response, status, options ) {
							ThriveApp.globals.settings.set( {
								iframe_url: ThriveApp.globals.settings.get( 'preview_url' ),
								preview_url: response.preview_url
							} );
						} );
					}
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
