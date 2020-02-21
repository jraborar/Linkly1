( function ( $ ) {

	var baseView = require( '../base' );

	var keysView = baseView.extend( {
		template: TVE_Dash.tpl( 'sendowl/keys' ),
		events: {
			'input .tva-sendowl-input': 'setKey',
			'click .tva-save-keys': 'save'
		},
		render: function () {
			this.$el.html( this.template( {model: ThriveApp.globals.soSettings.get( 'account_keys' )} ) );

			return this;
		},
		setKey: function ( e ) {
			var _attr = e.currentTarget.dataset.attr,
				obj = {};

			obj[ _attr ] = e.target.value;

			this.model.set( obj );
		},
		validateModel: function () {

			if ( ! this.model.get( 'key' ) ) {
				TVE_Dash.err( ThriveApp.t.emptyKey );

				return false;
			}

			if ( ! this.model.get( 'secret' ) ) {
				TVE_Dash.err( ThriveApp.t.emptySecret );

				return false;
			}

			if ( this.model.get( 'key' ) === this.model.get( 'secret' ) ) {
				TVE_Dash.err( ThriveApp.t.identicalKeys );

				return false;
			}

			return true;
		},
		save: function () {
			if ( ! this.validateModel() ) {
				return;
			}

			TVE_Dash.showLoader();

			var xhr = this.model.save(),
				self = this;

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					self.$( '.tva-message' ).addClass( 'tva-hide' );
					if ( response ) {

						if ( true !== response && typeof response === 'object' ) {

							_.each( response, function ( key, value ) {
								self.$( '#' + value ).removeClass( 'tva-hide' );
							} );

							self.$( '#so_msg' ).removeClass( 'tva-hide' );

							return;
						}

						TVE_Dash.success( ThriveApp.t.accountKeysSaved );
					}
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.err( JSON.parse( errorObj.responseText ).message, 5000 );
				} );
				xhr.always( function () {
					TVE_Dash.hideLoader();
				} );
			}
		}
	} );

	module.exports = baseView.extend( {
		className: 'tvd-container',
		template: TVE_Dash.tpl( 'sendowl/integration' ),
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );

			new keysView( {
				model: this.model.get( 'account_keys' ),
				el: this.$( '.tva-account-keys-holder' )
			} ).render();

			this.bind_zclip();
			ThriveApp.util.rebindWistiaFancyBoxes();

			return this;
		}
	} );

} )( jQuery );
