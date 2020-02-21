( function ( $ ) {

	var baseView = require( '../base' );

	var templateView = require( './template-option' );

	var googleFontsView = require( './fonts/googleFonts' );

	var safeFontsView = require( './fonts/safeFonts' );

	var logoView = require( './logo' );

	/**
	 * Render the template settings
	 */
	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'wizard/template-settings' ),
		events: {
			'change #tva-fonts-source': 'setSource',
			'change #tva-fonts-select': 'setFont',
			'change #tva-regular-select': 'setRegular',
			'change #tva-bold-select': 'setBold',
			'change #tva-charset-select': 'setCharset',
			'change #tva-template-select': 'changeTemplate',
			'change #tva-main-color-select': 'setSpectrum',
			'click .tva-change-logo': 'changeLogo',
			'input .tva-text-change': 'inputLogo',
			'click #tva-logo-type': 'changeLogoType',
			'input #tva-logo-text': 'textLogo'
		},
		initialize: function ( options ) {
			this.edit = options.edit ? options.edit : false;
			this.available_settings = options.available_settings;
		},
		render: function () {
			var self = this;
			this.$el.empty().html( this.template( {
				model: this.model,
				edit: this.edit,
				available_settings: this.available_settings
			} ) );
			this.collection.each( this.renderTemplate, this );
			this.renderFonts();
			this.renderTextLogo();
			this.setLogoSize();

			this.$( '#tva-fonts-select' ).select2( {
				multiple: false
			} );

			this.$( '#tva-main-color-select' ).spectrum( {
				containerClassName: 'tva-color-picker',
				allowEmpty: false,
				showInitial: true,
				showButtons: true,
				chooseText: "Apply",
				cancelText: "Cancel",
				preferredFormat: "hex",
				showInput: true,
				change: function ( color ) {
					var _color = color ? color.toHexString() : '',
						name = this.name;

					self.model.get( 'template' )[ name ] = _color;
				},
				move: function ( color ) {
					var _color = color ? color.toHexString() : '',
						name = this.name;

					ThriveApp.util.Editor.apply( '.tva_' + name, 'color', _color );
					ThriveApp.util.Editor.apply( '.tva_' + name, 'fill', _color, '', '#D0D0D0' );
					ThriveApp.util.Editor.apply( '.tva_' + name + '_bg, header.tva-header ul.menu > li.h-cta', 'background-color', _color );
					ThriveApp.util.Editor.apply( '.tva-sidebar-container ul a', 'color', _color );
					ThriveApp.util.Editor.apply( '.tva_text_logo_size, a.lg', 'color', _color );
					ThriveApp.util.Editor.apply( '.tva-cm-redesigned-breadcrumbs ul li a', 'color', _color, true, '#666666' );
				}
			} );

			return this;
		},
		setLogoSize: function () {
			var template = this.model.get( 'template' );

			if ( ! template.logo_size ) {
				template.logo_size = true === template.logo_type
					? ThriveApp.util.Editor.iframe.find( '.tva_text_logo_size' ).css( 'font-size' )
					: ThriveApp.util.Editor.iframe.find( '.tva-img-logo' ).width();

				template.logo_size = parseInt( template.logo_size );

				this.$( '#tva_logo_size_input, #tva_logo_size' ).val( template.logo_size );
				this.model.set( {template: template} );
			}
		},
		inputLogo: function ( e ) {
			var value = $( e.currentTarget ).val();

			ThriveApp.util.Editor.image( '.lg', value );
			this.model.get( 'template' ).logo_url = value;
		},
		changeLogoType: function ( e ) {
			e.stopPropagation();
			var checked = $( e.currentTarget ).is( ':checked' );

			ThriveApp.util.Editor.emptyElement( '.lg' );

			this.model.get( 'template' ).logo_type = checked;
			this.model.get( 'template' ).logo_url = '';

			this.$( '.tva-change-logo-input' ).val( '' );
			this.renderTextLogo();

			if ( checked ) {
				ThriveApp.util.Editor.apply( '.tva-header .header-logo > a', 'font-size', this.model.get( 'template' ).logo_size, 'px' );
			}
		},
		renderTextLogo: function () {

			var view = new logoView( {
				el: this.$( '.tva-text-logo-wrapper' )[ 0 ],
				model: this.model
			} );

			view.render();
		},
		textLogo: function ( e ) {
			var target = e.currentTarget,
				$span = ThriveApp.util.Editor.iframe.find( '.tva_text_logo_size' );

			ThriveApp.util.Editor.text( '.lg', target.value );

			$span.length ? $span.text( target.value ) : ThriveApp.util.Editor.text( '.lg', target.value );

			ThriveApp.util.Editor.apply( '.lg', 'font-size', this.model.get( 'template' ).logo_size, 'px' );
			ThriveApp.util.Editor.apply( '.lg', 'color', this.model.get( 'template' ).main_color );

			this.model.get( 'template' ).logo_url = target.value;
		},
		setSpectrum: function ( e ) {
			var name = $( e.currentTarget ).attr( 'name' ),
				color = $( e.currentTarget ).val();

			$( e.currentTarget ).spectrum( "set", color );

			this.model.get( 'template' )[ name ] = color;

			ThriveApp.util.Editor.apply( '.tva_' + name, 'color', color );
			ThriveApp.util.Editor.apply( '.tva_' + name + '_bg', 'background-color', color );
			ThriveApp.util.Editor.apply( '.tva-header > div ul li, header.tva-header ul.menu > li.h-cta', 'background-color', color, true, '#fff' );
			ThriveApp.util.Editor.apply( 'header.tva-header ul.menu > li.h-cta', 'background-color', color, true, this.model.get( 'template' ).main_color );
		},
		renderTemplate: function ( template ) {
			var view = new templateView( {
				el: this.$( '#tva-template-select' ),
				model: template,
				selected: this.model.get( 'template' ).ID
			} );

			view.render();
		},
		renderFonts: function () {
			var source = this.model.get( 'template' ).font_source,
				collection = ThriveApp.globals.fonts,
				view = null;

			if ( source === 'google' ) {
				collection = ThriveApp.globals.googlefonts;
			}

			switch ( source ) {
				case 'safe':
					view = safeFontsView;
					break;

				case 'google':
					view = googleFontsView;

				default:
					break;
			}

			if ( ! view instanceof Backbone.View ) {
				return;
			}

			this.fonts = new view( {
				model: this.model,
				collection: collection,
				el: this.$( '#tva-fonts' )
			} );

			this.fonts.render();
		},
		setSource: function ( e ) {
			this.model.get( 'template' ).font_source = e.currentTarget.value;
			this.model.get( 'template' ).font_family = '';
			this.renderFonts();
			this.setFont( this.$( '#tva-fonts-select' ) );
		},
		setRegular: function ( e ) {
			this.model.get( 'template' ).font_regular = e.currentTarget.value;
			this.applyFontToHead();
		},
		setBold: function ( e ) {
			this.model.get( 'template' ).font_bold = e.currentTarget.value;
			this.applyFontToHead();
		},
		setCharset: function ( e ) {
			this.model.get( 'template' ).font_charset = e.currentTarget.value;
			this.applyFontToHead();
		},
		setFont: function ( e ) {
			var font = e.currentTarget ? e.currentTarget.value : e.val();
			var source = this.model.get( 'template' ).font_source;
			this.model.get( 'template' ).font_family = font;

			if ( source === 'google' ) {
				var model = ThriveApp.globals.googlefonts.findWhere( {family: font} ),
					regular = '',
					bold = '';

				_.each( model.get( 'variants' ), function ( variant ) {
					if ( variant === 'regular' || ( parseInt( variant ) < 400 && ! isNaN( parseInt( variant ) ) && regular < parseInt( variant ) ) ) {
						regular = variant;
					}

					if ( variant === 'bold' || ( parseInt( variant ) > 400 && ! isNaN( parseInt( variant ) ) && bold < parseInt( variant ) ) ) {
						bold = variant;
					}
				} );
				this.model.get( 'template' ).font_regular = regular;
				this.model.get( 'template' ).font_charset = model.get( 'subsets' )[ 0 ];
				this.model.get( 'template' ).font_bold = bold;

				this.applyFontToHead();
			}

			ThriveApp.util.Editor.apply( 'body a', 'font-family', font );
			ThriveApp.util.Editor.apply( 'body p', 'font-family', font );
			ThriveApp.util.Editor.apply( 'body h1', 'font-family', font );
			ThriveApp.util.Editor.apply( 'body h2', 'font-family', font );
			ThriveApp.util.Editor.apply( 'body h3', 'font-family', font );
			ThriveApp.util.Editor.apply( 'body h4', 'font-family', font );
			ThriveApp.util.Editor.apply( 'body h5', 'font-family', font );
			ThriveApp.util.Editor.apply( 'body span', 'font-family', font );
			ThriveApp.util.Editor.apply( 'body strong', 'font-family', font );
			this.model.trigger( 'fonts_changed' );

		},
		applyFontToHead: function () {
			params = {
				family: '',
				variants: [],
				subset: ''
			};

			params.family = this.model.get( 'template' ).font_family;
			params.subset = this.model.get( 'template' ).font_charset;
			params.variants.push( this.model.get( 'template' ).font_regular );
			params.variants.push( this.model.get( 'template' ).font_bold );

			var font_url = ThriveApp.util.FontManager.generate_link( params );

			ThriveApp.util.Editor.font_to_head( font_url );

			this.model.get( 'template' ).font_url = font_url;
		},
		changeTemplate: function ( e ) {
			var template = e.currentTarget.value,
				model = this.collection.findWhere( {ID: parseInt( template )} );

			this.model.changeTemplate( model );

		},
		changeLogo: function () {
			var frame,
				self = this;

			if ( frame ) {
				frame.open();
				return;
			}

			frame = wp.media( {
				title: 'Select or Upload Your Logo',
				button: {
					text: 'Use this logo'
				},
				multiple: false,  // Set to true to allow multiple files to be selected
				library: {type: 'image'}
			} );

			frame.on( 'select', function () {
				$( '.tva-logo-type' ).prop( 'checked', false );
				$( '#tva-logo-text' ).val( '' );
				self.model.get( 'template' ).logo_type = false;

				$( '.tva-change-logo-input' ).val( '' );

				// Get media attachment details from the frame state
				var attachment = frame.state().get( 'selection' ).first().toJSON();
				ThriveApp.util.Editor.image( '.lg', attachment.url, attachment );
				self.model.get( 'template' ).logo_url = attachment.url;

				ThriveApp.util.Editor.iframe.find( '.lg > img' ).addClass( 'tva_logo_size' );
				ThriveApp.util.Editor.apply( '.tva_logo_size', 'width', self.model.get( 'template' ).logo_size, 'px' );
				ThriveApp.util.Editor.apply( '.lg', 'font-size', 'inherit' );
				ThriveApp.util.Editor.apply( '.tva-img-logo, .tva_logo_size', 'max-width', 600, 'px' );
				ThriveApp.util.Editor.apply( '.tva-img-logo, .tva_logo_size', 'max-height', 300, 'px' );

				self.render();
				TVE_Dash.materialize( self.$el );
			} );

			// Finally, open the modal on click
			frame.open();
		}
	} );


} )( jQuery );
