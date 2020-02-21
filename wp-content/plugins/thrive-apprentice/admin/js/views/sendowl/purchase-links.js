( function ( $ ) {

	var baseView = require( './../base' ),
		listView = require( './../select' ),
		productsCollection = require( './../../collections/sendowl/products' ),
		bundlesCollection = require( './../../collections/sendowl/bundles' ),
		discountsCollection = require( './../../collections/sendowl/discounts' );

	/**
	 * Base view for rendering a card box
	 */
	var card = baseView.extend( {
		template: TVE_Dash.tpl( 'sendowl/purchase-links/list' ),
		render: function () {
			this.$( '.tva-cards' ).append(
				'<div class="tva-box-card ' + this.cardClass + '"></div>'
			);
			this.$( '.' + this.cardClass ).html( this.template( {type: this.type} ) );

			this.renderContent();
			return this;
		},
		renderContent: function () {
			return this;
		},
		renderEmptyMsg: function () {
			new noContent( {
				el: this.$el,
				type: this.args.type
			} ).render();
		}
	} );

	var optionsCard = card.extend( {
		template: TVE_Dash.tpl( 'sendowl/purchase-links/cards/options' ),
		renderContent: function () {
			this.$( '.' + this.cardClass ).html( this.template( {} ) );

			return this;
		}
	} );

	var noContent = baseView.extend( {
		initialize: function ( options ) {
			this.type = options.type
		},
		template: function () {
			return TVE_Dash.tpl( 'sendowl/purchase-links/lists/empty/' + this.type );
		},
		render: function () {
			this.$el.html( this.template( {} ) );

			return this;
		}
	} );

	/**
	 * View to render memberships card ( either products or bundles  )
	 */
	var membershipsCard = card.extend( {
		initialize: function ( options ) {
			this.cardClass = 'tva-so-' + options.type;
			this.$( '.' + this.cardClass ).remove();
			this.type = ThriveApp.util.getPlural( this.model.get( 'currentOption' ) );
			this.collection = this.getCollection();

			var self = this;

			this.listenTo( this.collection, 'change:selected', function () {
				self.renderPurchaseLinks();
			} )

		},
		renderContent: function () {
			var view = new listView( {
				collection: this.collection,
				args: {
					type: this.type
				},
				el: this.$( '.tva-sendowl-' + this.type )
			} );

			view.renderEmptyMsg = _.bind( this.renderEmptyMsg, view );
			view.render();
			! this.collection.length ? this.$( '.tva-sendowl-' + this.type + '-list' ).addClass( 'tva-empty-list' ) : '';
		},
		getCollection: function () {
			var collection = null;

			switch ( this.model.get( 'currentOption' ) ) {
				case 'product':
					collection = new productsCollection( ThriveApp.data.sendowl.products );

					break;

				case 'bundle':
					collection = new bundlesCollection( ThriveApp.data.sendowl.bundles );

					break;

				default:
					break;
			}

			return collection;
		},
		renderPurchaseLinks: function () {
			this.$( '.tva-so-purchase-links' ).removeClass( 'tva-hide' );

			var model = this.collection.findWhere( {selected: true} );

			model.get( 'queryParams' ).unset( 'thrv_so_discount' );
			this.model.set( {currentProduct: model} );

			new purchaseLinks( {
				model: model,
				el: this.$( '.tva-so-purchase-links' )
			} ).render();

			new discountsCard( {
				el: this.$el,
				model: model,
				type: 'discounts',
				collection: new discountsCollection( ThriveApp.data.sendowl.discounts )
			} ).render();
		}
	} );

	/**
	 * View to render discounts card
	 */
	var discountsCard = card.extend( {
		initialize: function ( options ) {
			this.cardClass = 'tva-so-' + options.type;
			this.$( '.' + this.cardClass ).remove();
			this.type = options.type;

			var self = this;

			this.listenTo( this.collection, 'change:selected', function ( model ) {
				self.model.get( 'queryParams' ).set( {thrv_so_discount: model.get( 'code' )} );
			} )
		},
		renderContent: function () {
			var view = new listView( {
				collection: this.collection,
				args: {
					type: 'discounts'
				},
				el: this.$( '.tva-sendowl-' + this.type )
			} );

			view.renderEmptyMsg = _.bind( this.renderEmptyMsg, view );
			view.render();
		}
	} );

	/**
	 * View to render purchase links
	 */
	var purchaseLinks = baseView.extend( {
		template: TVE_Dash.tpl( 'sendowl/purchase-links/links' ),
		initialize: function () {
			this.listenTo( this.model.get( 'queryParams' ), 'change:thrv_so_discount', this.render );
		},
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );

			this.bind_zclip();

			if ( ! ThriveApp.globals.settings.get( 'checkout_page' ).ID ) {
				this.$( '.tva-purchase-url' ).addClass( 'tva-disable-copy' );
				this.$( '.tva-purchase-html' ).addClass( 'tva-disable-copy' );
			}

			return this;
		}
	} );

	module.exports = baseView.extend( {
		className: 'tvd-container',
		template: TVE_Dash.tpl( 'sendowl/purchase-links/dashboard' ),
		events: {
			'click .tva-product': 'onProductChange',
			'click .tva-refresh-items': 'refreshItems'
		},
		initialize: function () {
			var self = this;
			this.$el.on( 'click', function ( e ) {
				var $container = self.$( '.tva-material-options ' ),
					$element = self.$( '.tva-material-selected-option' );

				if ( ! $container.is( e.target ) && $container.has( e.target ).length === 0 && ! $element.is( e.target ) ) {
					$container.slideUp();
				}
			} );
		},
		render: function () {
			this.$el.html( this.template( {} ) );
			new optionsCard( {
				type: 'options',
				el: this.$el
			} ).render();

			ThriveApp.util.rebindWistiaFancyBoxes();

			if ( ! ThriveApp.globals.settings.get( 'checkout_page' ).ID ) {
				this.$( '.tva-missing-checkout-page' ).removeClass( 'tva-hide' );
			}

			return this;
		},
		onProductChange: function ( e ) {
			var type = e.currentTarget.dataset.type;

			if ( this.model.get( 'currentOption' ) === type ) {
				return;
			}

			this.model.set( {currentOption: e.currentTarget.dataset.type} );

			this.$( '.tva-option' ).removeClass( 'active' );
			this.$( e.currentTarget ).addClass( 'active' );
			this.cleanUp();
			this.renderMemberships();
		},
		renderMemberships: function () {
			new membershipsCard( {
				model: this.model,
				type: 'memberships',
				el: this.$el
			} ).render();
		},
		cleanUp: function () {
			this.$( '.tva-so-memberships, .tva-so-purchase-links, .tva-so-discounts' ).empty();
			this.$( '.tva-so-discounts, .tva-so-purchase-links' ).addClass( 'tva-hide' );
		},
		refreshItems: function ( e ) {
			var type = this.$( e.currentTarget ).data( 'type' ),
				self = this;

			TVE_Dash.showLoader();

			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce
				},
				type: 'GET',
				url: ThriveApp.routes.settings + '/refresh_sendowl_' + type + '/'
			} ).done( function ( response, status, options ) {
				if ( response.error ) {
					TVE_Dash.err( response.error, 5000 );

					return;
				}

				ThriveApp.data.sendowl[ type ] = response;

				var _fn = 'after' + ThriveApp.util.upperFirst( type ) + 'Refresh';

				if ( typeof self[ _fn ] === 'function' ) {
					self[ _fn ]( response );
				}
			} ).always( function () {
				TVE_Dash.hideLoader();
			} );

		},
		afterProductsRefresh: function ( response ) {
			var model = ThriveApp.globals.settings.get( 'membership_plugin' ).findWhere( {tag: 'sendowl'} );

			if ( model ) {
				model.set( {membership_levels: new ThriveApp.collections.MembermouseCollection( response )} )
			}

			this.cleanUp();
			this.renderMemberships();
		},
		afterBundlesRefresh: function ( response ) {
			var model = ThriveApp.globals.settings.get( 'membership_plugin' ).findWhere( {tag: 'sendowl'} );

			if ( model ) {
				model.set( {bundles: new ThriveApp.collections.MembermouseCollection( response )} )
			}

			this.cleanUp();
			this.renderMemberships();
		},
		afterDiscountsRefresh: function ( response ) {
			this.model.get( 'currentProduct' ).get( 'queryParams' ).unset( 'thrv_so_discount' );

			new discountsCard( {
				model: this.model.get( 'currentProduct' ),
				el: this.$el,
				type: 'discounts',
				collection: new discountsCollection( ThriveApp.data.sendowl.discounts )
			} ).render();
		}
	} );

} )( jQuery );
