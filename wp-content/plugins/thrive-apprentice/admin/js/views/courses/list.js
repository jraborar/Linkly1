( function ( $ ) {

	var baseView = require( '../base' );

	var courseView = require( './item' );

	module.exports = baseView.extend( {
		initialize: function () {
			var self = this;
			this.listenTo( this.collection, 'add', function () {
				self.collection.sort();
				self.render();
			} );
			this.listenTo( ThriveApp.globals.settings, 'change:comment_status', this.setNewCommentStatus );

			this.collection.on( 'tva_filter_courses', function () {
				TVE_Dash.showLoader();
				self.itemViews = [];
				self.$( '.tva-course-item' ).remove();

				var topics = ThriveApp.globals.topics.where( {checked: 1} );

				if ( topics.length == 0 ) {
					self.collection.each( function ( model ) {
						model.set( {display: 0} );
					}, this );
				} else if ( topics.length == ThriveApp.globals.topics.length ) {
					self.collection.each( function ( model ) {
						model.set( {display: 1} );
					}, this );
				} else {
					self.collection.each( function ( model ) {
						model.set( {display: 0} );
					}, this );

					_.each( topics, function ( topic ) {
						var id = topic.get( 'ID' );
						self.collection.each( function ( model ) {
							if ( model.get( 'topic' ) == id ) {
								model.set( {display: 1} );
							}

						}, this );
					}, this );
				}

				self.render();

				TVE_Dash.hideLoader();
			} );
			this.collection.on( 'tva_update_courses', function () {
				self.updateOrder();
			} )
		},
		setNewCommentStatus: function () {
			this.collection.each( this.setCourseCommentStatus, this );
		},
		setCourseCommentStatus: function ( course ) {
			course.set( {comment_status: ThriveApp.globals.settings.get( 'comment_status' )} );
		},
		/**
		 * @param {Array} used for sortable
		 */
		itemViews: [],
		render: function () {
			/**
			 * remove the views if they're already created so we don't have duplicate events
			 */
			var self = this,
				total = this.collection.length;

			this.collection.each( this.renderOne, this );

			function show_position( event, ui ) {
				var $placeholder = $( ui.placeholder ),
					position = total - $placeholder.prevAll().not( ui.item ).length;

				$placeholder.html( "<div class=tva-inside-placeholder'><span>" + position + (
					ThriveApp.t.n_suffix[ position ] ? ThriveApp.t.n_suffix[ position ] : ThriveApp.t.n_th
				) + ' ' + ThriveApp.t.position + "</span></div>" );
			}

			this.$el.sortable( {
				placeholder: 'tvd-card-new tva-course-ui-sortable-placeholder tvd-col tvd-s6 tvd-ms6 tvd-m4 tvd-l3',
				items: '.tva-course-item',
				forcePlaceholderSize: true,
				handle: '.tva-drag-card',
				update: _.bind( self.updateOrder, this ),
				tolerance: 'pointer',
				change: show_position,
				start: function ( event, ui ) {
					show_position( event, ui );
					$( 'body' ).addClass( 'tva-sorting' );
				},
				stop: function () {
					setTimeout( function () {
						$( 'body' ).removeClass( 'tva-sorting' );
					}, 200 );
				}
			} );

			$( '#collapse-button' ).on( 'click', function () {
				self.recalcWidth();
			} );

			if ( ! this.ribbon ) {
				this.renderRibbon();
			}

			return this;
		},
		renderOne: function ( course ) {
			if ( course.get( 'display' ) ) {
				var $lastItem = this.$el.find( '.tva-course-item' ).last(),
					view = new courseView( {
						model: course,
						collection: this.collection
					} );

				if ( $lastItem.length ) {
					$lastItem.after( view.render().$el );
				} else {
					this.$el.prepend( view.render().$el );
				}

				this.itemViews.push( view );
			}


			return this;
		},
		renderRibbon: function () {

			if ( this.model.get( 'is_thrivetheme' ) && this.model.get( 'apprentice' ) && this.collection.where( {status: 'publish'} ).length > 0 && ! this.model.get( 'apprentice_ribbon' ) ) {
				this.ribbon = new ThriveApp.views.Ribbon( {
					model: this.model
				} );

				this.$el.append( this.ribbon.render().$el );
				this.itemViews.push( this.ribbon );

				this.recalcWidth();
			}

		},
		recalcWidth: function () {
			var bar_width = $( '#adminmenuback' ).outerWidth();
			var body_width = $( 'body' ).outerWidth();

			// this.$( '.tva-ribbon-container' ).css( {'width': body_width - bar_width + 'px', 'left': bar_width + 'px'} );
		},
		updateOrder: function () {
			var to_update = {},
				$items = this.$( '.tva-course-item' ).reverse(),
				self = this;

			_.each( $items, function ( item, index ) {
				var id = self.$( item ).attr( 'data-id' ),
					model = self.collection.findWhere( {ID: parseInt( id )} );

				if ( model ) {
					model.set( {order: index} )
				}

				to_update[ id ] = index;
			} );

			if ( this.collection.length !== Object.keys( to_update ).length ) {
				TVE_Dash.hideLoader();
				return;
			}

			this.collection.sort();
			TVE_Dash.showLoader();
			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce
				},
				type: 'POST',
				url: ThriveApp.routes.courses + '/update_order/',
				data: {
					new_order: to_update
				}
			} ).done( function ( response, status, options ) {
				ThriveApp.globals.available_settings.fetch().success( function ( response, status, options ) {
					ThriveApp.globals.settings.set( {
						iframe_url: ThriveApp.globals.settings.get( 'preview_url' ),
						preview_url: response.preview_url
					} );
				} );
			} ).always( function () {
				TVE_Dash.hideLoader();
			} );
		}
	} );

} )( jQuery );