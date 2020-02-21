( function ( $ ) {

	var baseView = require( '../base' );

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
				this.initializeCheckout();
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
		initializeCheckout: function () {
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

	/**
	 * View to render register options
	 */
	var registerOptions = pageStateView.extend( {
		template: TVE_Dash.tpl( 'sendowl/checkout/checkout' ),
		className: 'tva-tab tva-register-options',
		events: {},
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );

			new pageStateView( {
				el: this.$( '.tva-registration-page-container' ),
				model: this.model,
				deleteMsg: ThriveApp.t.deleteRegPage,
				headlineMsg: ThriveApp.t.setChPage
			} ).render();

			return this;
		}
	} );

	/**
	 * View to render redirect options for thankyou page
	 */
	var redirectOptionsView = pageStateView.extend( {
		template: TVE_Dash.tpl( 'sendowl/redirect' ),
		events: {},
		initialize: function () {
			ThriveApp.globals.soSettings.get( 'welcome_message' ).on( 'tva_tinymce_blur', function () {
				this.save( ThriveApp.globals.soSettings.get( 'welcome_message' ) );
			}, this )
		},
		render: function () {

			var url = ThriveApp.globals.soSettings.get( 'preview_msg_url' ) + '?show_welcome_msg=true';

			this.$el.html( this.template( {
				model: this.model,
				preview: url
			} ) );

			new pageStateView( {
				el: this.$( '.tva-thankyou-page-multiple' ),
				model: ThriveApp.globals.soSettings.get( 'thankyou_multiple_page' )
			} ).render();

			this.renderMCE();
			return this;
		},
		renderMCE: function () {
			var self = this;
			setTimeout( function () {
				var editors = [ 'tva-thankyou-message' ];
				ThriveApp.util.clearMCEEditor( editors );
				ThriveApp.util.editorInit( 'tva-thankyou-message', ThriveApp.globals.soSettings.get( 'welcome_message' ), 'message' );
				TVE_Dash.materialize( self.$el );
			}, 0 );
		}
	} );

	/**
	 * View to render thankyou page options
	 */
	var thankyouOptions = pageStateView.extend( {
		className: 'tva-tab tva-thankyou-options tva-hide',
		template: TVE_Dash.tpl( 'sendowl/checkout/thankyou' ),
		events: {
			'click .tva-thankyou-type': 'changeType'
		},
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );

			var view = '',
				soSettings = ThriveApp.globals.soSettings;

			switch ( this.model.get( 'type' ) ) {

				case 'static':
					view = pageStateView;

					this.$( '.tva-thankyou-wrapper' ).html( '<div class="tva-static-thankyou-page"></div>' );
					break;

				case 'redirect':
					view = redirectOptionsView;

					break;

				default:
					break;
			}

			var $el = this.model.get( 'type' ) === 'static' ? this.$( '.tva-static-thankyou-page' ) : this.$( '.tva-thankyou-wrapper' );

			new view( {
				el: $el,
				model: soSettings.get( 'thankyou_page' )
			} ).render();

			if ( false === soSettings.get( 'tcb_plugin_active' ) ) {
				this.$( '.tva-page-option' ).addClass( 'tcb-inactive' );
			}

			if ( false === soSettings.get( 'tutorial_completed' ) && 1 === soSettings.get( 'show_thankyou_tutorial' ) ) {
				this.$( '.tva-notice' ).removeClass( 'tva-hide' );
			}

			return this;
		},
		changeType: function ( e ) {
			this.model.set( {type: e.currentTarget.dataset.type} );

			this.save();
		}
	} );

	module.exports = baseView.extend( {
		className: 'tvd-container',
		template: TVE_Dash.tpl( 'sendowl/checkout' ),
		events: {
			'click .tva-tab-item': 'setActiveTab'
		},
		activeTab: 'register',
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );

			this.$( '.tva-checkout-tabs' ).append(
				new registerOptions( {
					model: ThriveApp.globals.soSettings.get( 'checkout_page' )
				} ).render().$el
			);

			this.$( '[data-tab="' + this.activeTab + '"]' ).addClass( 'tva-active-tab' );

			ThriveApp.util.rebindWistiaFancyBoxes();

			return this;
		},
		setActiveTab: function ( e ) {
			var tab = e.currentTarget.dataset.tab;

			if ( this.activeTab === tab ) {
				return;
			}

			this.activeTab = tab;

			if ( ! this.renderThankyou ) {
				this.$( '.tva-checkout-tabs' ).append(
					new thankyouOptions( {
						model: ThriveApp.globals.soSettings.get( 'thankyou_page_type' )
					} ).render().$el
				);

				this.renderThankyou = true;
			}

			this.$( '.tva-tab-item' ).removeClass( 'tva-active-tab' );
			this.$( e.currentTarget ).addClass( 'tva-active-tab' );
			this.$( '.tva-tab' ).addClass( 'tva-hide' );
			this.$( '.tva-' + tab + '-options' ).removeClass( 'tva-hide' );

			ThriveApp.util.rebindWistiaFancyBoxes();
		}
	} );

} )( jQuery );
