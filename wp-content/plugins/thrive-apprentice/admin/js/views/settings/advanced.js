var base = require( './../base' );

( function ( $ ) {

	module.exports = base.extend( {

		template: TVE_Dash.tpl( 'wizard/template-advanced-settings' ),
		events: {
			'input .tva-no-ui-slider': 'slide',
			'change .tva-no-ui-slider': 'setValue',
			'change .tva_color_input_change': 'setSpectrum',
			'input .tva-slider-input': 'slide',
			'input .tva-text-change': 'text',
			'input .tva-attr-change': 'attrChange',
			'change .tva-checkbox': 'checkbox'
		},

		initialize: function ( options ) {

			this.available_settings = options.available_settings;
		},

		render: function () {

			this.$el.empty().html( this.template( {
				template: this.model.get( 'template' ),
				available_settings: this.available_settings
			} ) );

			var self = this;

			this.$( '#tva-headline-color, #tva-paragraph-color, #tva-course-title-color' ).spectrum( {
				containerClassName: 'tva-color-picker',
				allowEmpty: false,
				showInitial: true,
				showButtons: true,
				chooseText: "Apply",
				cancelText: "Cancel",
				preferredFormat: "hex",
				change: function ( color ) {

					var name = this.name;

					self.model.get( 'template' )[ name ] = color ? color.toHexString() : '';
				},
				move: function ( color ) {
					var _color = color ? color.toHexString() : '',
						name = this.name,
						element = name.replace( '_color', '' );

					ThriveApp.util.Editor.apply( '.tva_' + element, 'color', _color );
				}
			} );

			ThriveApp.util.Editor.init( this, this.model );

			return this;
		},

		setSpectrum: function ( e ) {

			var name = this.$( e.currentTarget ).attr( 'name' ),
				color = this.$( e.currentTarget ).val(),
				element = name.replace( '_color', '' );

			this.$( e.currentTarget ).spectrum( "set", color );

			this.model.get( 'template' )[ name ] = color;

			ThriveApp.util.Editor.apply( '.tva_' + element, 'color', color );
		},

		slide: function ( e ) {

			var type = e.currentTarget.type,
				target = e.currentTarget,
				name = e.currentTarget.name,
				row = this.$( target ).closest( '.tva-card' );

			if ( type === 'range' ) {
				row.find( '#tva_' + name + '_input' ).val( target.value );
			} else {
				row.find( '#tva_' + name ).val( target.value );

				this.setValue( e );
			}

			ThriveApp.util.Editor.apply( '.tva_' + name, 'font-size', target.value, 'px' );

			e.stopPropagation();
		},

		text: function ( e ) {

			var target = e.currentTarget,
				name = e.currentTarget.name;
			ThriveApp.util.Editor.text( '.tva_' + name, target.value );

			this.setValue( e );
		},

		checkbox: function ( event ) {

			this.model.get( 'template' )[ event.currentTarget.name ] = event.currentTarget.checked ? 1 : 0;

			ThriveApp.util.Editor.collapse( this.model.get( 'template' ) );
		},

		attrChange: function ( e ) {

			var target = e.currentTarget,
				name = e.currentTarget.name;
			ThriveApp.util.Editor.attrChange( '.tva_' + name, target.value, 'placeholder' );
			this.setAttrValue( e )
		},

		setValue: function ( e ) {

			var name = e.currentTarget.name,
				value = this.$( e.currentTarget ).hasClass( 'tva-text-change' ) ? e.currentTarget.value : parseFloat( e.currentTarget.value.replace( /,/g, "." ) );

			this.model.get( 'template' )[ name ] = value;
		},

		setAttrValue: function ( e ) {

			var name = e.currentTarget.name,
				value = this.$( e.currentTarget ).hasClass( 'tva-attr-change' ) ? e.currentTarget.value : parseFloat( e.currentTarget.value.replace( /,/g, "." ) );

			this.model.get( 'template' )[ name ] = value;
		}
	} );

} )( jQuery );
