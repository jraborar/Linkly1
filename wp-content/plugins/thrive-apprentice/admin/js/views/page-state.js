( function ( $ ) {

	var baseView = require( './base' );

	var pageStateView = baseView.extend( {
		events: {
			'click .tva-remove-page': 'removePage',
			'click .tva-create-new-page': 'createPage',
			'click .tva-close': 'close',
			'click .tva-save': 'save',
			'click .tva-close-edit': 'closeEdit',
			'input .tva-sendowl-page': 'setPageTitle',
			'click .tva-remove': 'remove'
		},
		initialize: function ( options ) {
			this.deleteMsg = options.deleteMsg ? options.deleteMsg : ThriveApp.t.deleteThPage;
			this.headlineMsg = options.headlineMsg ? options.headlineMsg : ThriveApp.t.setTyPage;
			this.listenTo( this.model, 'change:state', this.render )
		},
		render: function () {
			this.setTemplate();
			this.$el.html( this.template( {
					model: this.model,
					deleteMsg: this.deleteMsg,
					headlineMsg: this.headlineMsg
				}
			) );

			if ( this.model.get( 'state' ) === 'empty' ) {
				this.initializePostSearch();
			}

			ThriveApp.util.rebindWistiaFancyBoxes();

			return this;
		},
		setTemplate: function () {
			switch ( this.model.get( 'state' ) ) {
				case 'normal':
					this.template = TVE_Dash.tpl( 'sendowl/checkout/page-state/normal' );
					break;

				case 'delete':
					this.template = TVE_Dash.tpl( 'sendowl/checkout/page-state/delete' );
					break;

				case 'edit':
					this.template = TVE_Dash.tpl( 'sendowl/checkout/page-state/edit' );

					break;

				default:
					this.template = TVE_Dash.tpl( 'sendowl/checkout/page-state/create' );
					break;
			}
		},
		setPageTitle: function ( e ) {
			this.model.set( {name: e.currentTarget.value} )
		},
		initializePostSearch: function () {
			var $post_search = this.$( '#tva-sendowl-checkout-page' ),
				model = this.model,
				self = this;

			new ThriveApp.PostSearch( $post_search, {
				url: ThriveApp.routes.settings + '/search_pages/',
				type: 'POST',
				select: function ( event, ui ) {
					model.set( {
						ID: parseInt( ui.item.id ),
						name: ui.item.label
					} );

					self.save();
				},
				search: function () {
					if ( model.get( 'ID' ) ) {
						model.set( {old_ID: model.get( 'ID' )} );
					}

					model.set( {
						ID: '',
						name: ''
					} );
				},
				open: function () {
					if ( model.get( 'ID' ) ) {
						model.set( {old_ID: model.get( 'ID' )} );
					}

					model.set( {
						ID: '',
						name: ''
					} );
				},
				close: function ( event, ui ) {
					if ( model.get( 'ID' ) ) {
						model.set( {old_ID: model.get( 'ID' )} );
					}
				},
				fetch_single: model.get( 'IS' )
			} );
		},
		removePage: function () {
			this.model.set( {state: 'delete'} );
		},
		close: function () {
			if ( this.model.get( 'old_ID' ) ) {
				this.model.set( {
					ID: this.model.get( 'old_ID' ),
					old_ID: ''
				} )
			}

			this.model.set( {
				state: this.model.get( 'ID' ) ? 'normal' : 'empty',
				name: this.model.get( 'ID' ) ? this.model.get( 'name' ) : ''
			} );
		},
		createPage: function () {
			this.undelegateEvents();
			this.$el.empty();

			this.model.set( {
				old_page_name: this.model.get( 'name' ),
				old_ID: this.model.get( 'ID' ),
				state: 'edit'
			} );

			this.model.unset( 'ID' );

			new pageStateView( {
				model: this.model,
				el: this.$el
			} ).render();
		},
		remove: function () {
			TVE_Dash.showLoader();
			var self = this,
				xhr = this.model.destroy();

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					var _edit_text = self.model.get( 'edit_text' )
					self.model.clear( {silent: true} ).set( self.model.defaults() );
					self.model.set( {edit_text: _edit_text}, {silent: true} );
					self.render();
					TVE_Dash.success( ThriveApp.t.SuccessfulSave );
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.err( errorObj.responseText );
				} );
				xhr.always( function () {
					TVE_Dash.hideLoader();
				} );
			}
		},
		save: function ( model ) {
			model = model instanceof Backbone.Model ? model : this.model;

			if ( ! model.isValid() ) {
				return this.tvd_show_errors( model );
			}

			TVE_Dash.showLoader();

			var self = this,
				xhr = model.save();

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					self.render();
					if ( false === ThriveApp.globals.soSettings.get( 'tcb_plugin_active' ) ) {
						self.$( '.tva-page-option' ).addClass( 'tcb-inactive' );
					}
					TVE_Dash.success( ThriveApp.t.SuccessfulSave, 3000, null, 'top' );
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

	module.exports = pageStateView;

} )( jQuery );
