( function ( $ ) {

	var baseView = require( './base' );

	var itemView = baseView.extend( {
		render: function () {
			this.model.setListRequiredFields();
			this.$el.append(
				'<div class="tva-material-option" data-id="' + this.model.get( 'ID' ) + '">' + this.model.get( 'name' ) + '</div>'
			);

			return this;
		}
	} );

	var selectedItem = baseView.extend( {
		render: function () {
			this.$el.attr( 'data-id', this.model.get( 'ID' ) );
			this.$el.html(
				'<div class="tva-selected-item">' + this.model.get( 'name' ) + '</div>'
			);

			return this
		}
	} );

	var listView = baseView.extend( {
		initialize: function ( options ) {
			this.args = options.args;
		},
		render: function () {
			this.collection.each( function ( model ) {
				new this.args.singleItemView( {
						model: model,
						el: this.$el
					}
				).render();
			}, this );

			return this;
		}
	} );

	module.exports = baseView.extend( {
		events: {
			'click .tva-material-selected-option': 'onChange',
			'click .tva-material-option': 'onSelect'
		},
		initialize: function ( options ) {
			this.args = {
				className: '',
				defaultValue: 'Select an option',
				emptyMsg: 'No Results',
				method: 'html',
				singleItemView: itemView,
				selectedItemView: selectedItem,
				listItemsView: listView
			};

			this.setDefaults( options.args );
		},
		renderEmptyMsg: function () {
			this.$el.append( $( '<p/>' ).text( this.args.emptyMsg ) );
		},
		setDefaults: function ( options ) {
			if ( typeof options !== 'object' ) {
				return;
			}

			var self = this;

			Object.keys( options ).forEach( function ( key ) {

				if ( self.args.hasOwnProperty( key ) ) {
					self.args[ key ] = options[ key ];

					return;
				}

				if ( typeof key === 'string' ) {
					self.args[ key ] = options[ key ];
				}
			} )
		},
		render: function () {
			this.$el[ this.args.method ]( '<div class="tva-material-select ' + this.args.className + '">' +
			                              '<div class="tva-material-selected-option">' + this.args.defaultValue + '</div>' +
			                              '<div class="tva-material-options tva-hide"></div>' +
			                              '</div>' );

			if ( this.collection.length === 0 ) {
				this.renderEmptyMsg();

				return this;
			}

			this.renderSelectedValue();

			new this.args.listItemsView( {
				model: this.model,
				el: this.$( '.tva-material-options' ),
				args: this.args,
				collection: this.collection
			} ).render();

			return this;
		},
		renderSelectedValue: function () {
			var model = this.collection.findWhere( {selected: true} );

			if ( ! model ) {
				return;
			}

			new this.args.selectedItemView( {
				model: model,
				el: this.$( '.tva-material-selected-option' )
			} ).render();
		},
		onChange: function ( e ) {
			e.stopPropagation();
			this.$( e.currentTarget ).trigger( 'tva_clear_document', e );
			this.$( '.tva-material-options' ).slideToggle();
		},
		onSelect: function ( e ) {
			var id = parseInt( this.$( e.currentTarget ).data( 'id' ) ),
				model = this.collection.findWhere( {ID: id} );

			this.$( '.tva-material-options' ).hide();

			if ( typeof model === 'undefined' || ! model instanceof Backbone.Model ) {
				return;
			}

			this.collection.each( function ( item ) {
				item.set( {selected: false}, {silent: true} );
			}, this );

			model.set( {selected: true} );

			new this.args.selectedItemView( {
				el: this.$( '.tva-material-selected-option' ),
				model: model
			} ).render();
		}
	} );

} )( jQuery );
