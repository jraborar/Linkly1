( function ( $ ) {

	var safeFontsView = require( './safeFonts' );

	var optionView = require( './type/row' );

	var variantView = require( './type/variant' );

	module.exports = safeFontsView.extend( {
		template: TVE_Dash.tpl( 'wizard/google-fonts' ),
		initialize: function () {
			var self = this;
			this.model.on( 'fonts_changed', function () {
				self.selected_model = self.collection.findWhere( {family: self.model.get( 'template' ).font_family} );

				self.renderVariants();
				self.renderCharsets();
			} );
		},
		renderFonts: function () {
			this.selected_model = this.collection.at( 0 );
			if ( this.model.get( 'template' ).font_family ) {
				this.selected_model = this.collection.findWhere( {family: this.model.get( 'template' ).font_family} );
			}

			this.collection.each( this.renderFont, this );
			this.renderVariants();
			this.renderCharsets();
		},
		renderFont: function ( font ) {
			var selected = this.model.get( 'template' ).font_family,
				view = new optionView( {
					el: this.$( '#tva-fonts-select' ),
					model: font,
					selected: selected
				} );

			view.render();

		},
		renderVariants: function () {
			if ( ! this.selected_model ) {
				this.selected_model = this.collection.at( 0 )
			}
			this.$( '#tva-regular-select' ).empty();
			this.$( '#tva-bold-select' ).empty();
			_.each( this.selected_model.get( 'variants' ), this.renderVariant, this );
			TVE_Dash.materialize( this.$el );

		},
		renderVariant: function ( variant ) {
			if ( variant.indexOf( 'italic' ) !== - 1 ) {
				return;
			}
			var $element = this.$( '#tva-regular-select' ),
				selected = this.model.get( 'template' ).font_regular;

			if ( variant === 'bold' || ( parseInt( variant ) > 400 && ! isNaN( parseInt( variant ) ) ) ) {
				this.$( '.tva-bold-holder' ).show();
				$element = this.$( '#tva-bold-select' );
				selected = this.model.get( 'template' ).font_bold;
			} else {
				this.$( '.tva-bold-holder' ).hide();
			}

			var view = new variantView( {
				el: $element,
				model: variant,
				selected: selected
			} );

			view.render();

		},
		renderCharsets: function () {
			if ( ! this.selected_model ) {
				this.selected_model = this.collection.at( 0 )
			}
			this.$( '#tva-charset-select' ).empty();
			_.each( this.selected_model.get( 'subsets' ), this.renderCharset, this );
			TVE_Dash.materialize( this.$el );

		},
		renderCharset: function ( charset ) {
			var view = new variantView( {
				el: this.$( '#tva-charset-select' ),
				model: charset,
				selected: this.model.get( 'template' ).font_charset
			} );

			view.render();
		}

	} );

} )( jQuery );
