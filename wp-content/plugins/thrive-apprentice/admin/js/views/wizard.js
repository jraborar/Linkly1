( function ( $ ) {

	var baseView = require( './base' );

	var previewView = require( './settings/preview' );

	var templateSettingsView = require( './settings/template' );

	var advancedSettingsView = require( './settings/advanced' );

	var indexSettingsView = require( './settings/index' );

	/**
	 * Wizard view
	 */
	module.exports = baseView.extend( {
		className: 'tva-wizard-container',
		template: TVE_Dash.tpl( 'wizard' ),
		events: {
			'click .save-template': 'save',
			'click .tva-close': 'close',
			'click .tva-advanced-settings': 'showAdvancedSettings',
			'click .tva-apprentice-template': 'showCourseList',
			'click .tva-go-back': 'showTemplateSettings',
			'click .tva-live': 'showLive',
			'click .tva-mock-up': 'showMockUp',
			'click .tva-card-title': 'openCardContent',
			'input .tva-slider-input': 'slide',
			'input .tva-no-ui-slider': 'slide',
			'change .tva-no-ui-slider': 'setValue'
		},
		preview: '',
		settings: '',
		initialize: function ( options ) {
			TVE_Dash.showLoader();
			var self = this;
			ThriveApp.globals.wizzard = this;

			ThriveApp.globals.wizzard.on( 'tva_iframe_loaded', function () {
				ThriveApp.util.Editor.init();
				self.renderSettings();
				TVE_Dash.hideLoader();
			} );

			$( '.dismiss-notice, .notice-dismiss' ).on( 'click', function () {
				setTimeout( function () {
					self.calcHeight();
				}, 200 );
			} );

			this.listenTo( this.model, 'change:template', this.render );
			this.listenTo( this.model, 'change:current_page', this.render );
			this.edit = options.edit ? options.edit : false;
			this.original_model = options.original_model;
			this.model.set( {advanced: false} );
		},
		render: function () {
			/**
			 * if we don't have any courses and the preview is set to see live move the switch to mock-up
			 */
			var published = ThriveApp.globals.courses.where( {status: 'publish'} );

			if ( this.model.get( 'preview_option' ) && published.length === 0 ) {
				this.model.set( {preview_option: false} );
			}

			if ( published.length === 0 && this.model.get( 'preview_notification' ) ) {
				this.modal( ThriveApp.modals.ModalFirstTimeNotification, {
					model: this.model,
					'max-width': '60%',
					width: '800px'
				} );
			}

			this.$el.html( this.template( {model: this.model, published: published} ) );

			this.renderPreview();

			return this
		},
		calcHeight: function () {
			var height = $( '.notice' ).outerHeight() + $( '.update-nag' ).outerHeight() + 'px';
			this.$el.css( {height: height} );
		},
		renderPreview: function () {
			this.preview = new previewView( {
				model: this.model,
				el: this.$( '.tva-template-container' )
			} );

			this.preview.render();
		},
		renderSettings: function () {

			var state = this.model.get( 'current_page' ),
				view = null;

			switch ( state ) {
				case 'template':
					view = templateSettingsView;

					break;

				case 'advanced':
					view = advancedSettingsView;
					break;

				case 'index':
					view = indexSettingsView;
					break;

				default:
					break;
			}

			if ( ! view instanceof Backbone.View ) {
				return
			}

			this.settings = new view( {
				model: this.model,
				collection: this.collection,
				available_settings: ThriveApp.globals.available_settings,
				edit: this.edit,
				el: this.$( '.tva-options-container' )
			} );

			this.settings.render();

			//Hide notices on template settings view

			if ( $( '.tva-header' ).prevAll().length > 1 ) {

				$( '.tva-header' ).prevAll().css( "display", "none" );

			}

			TVE_Dash.materialize( this.$el );

		},
		showLive: function () {
			this.switchPreview( true );
		},
		showMockUp: function () {
			this.switchPreview( false );
		},
		switchPreview: function ( value ) {
			var self = this;
			TVE_Dash.showLoader();

			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce
				},
				type: 'POST',
				url: ThriveApp.routes.settings + '/switch_preview/',
				data: {
					preview_option: value
				}
			} ).done( function ( response, status, options ) {
				if ( response.url ) {

					var iframe_url = self.model.get( 'current_page' ) === 'index' ? self.model.get( 'apprentice_url' ) : response.url;

					self.model.set( {preview_option: value, iframe_url: iframe_url, preview_url: response.url} );
					ThriveApp.globals.settings.set( {
						preview_option: value,
						iframe_url: iframe_url,
						preview_url: response.url
					} );

					self.render();
				}
			} ).always( function () {
				TVE_Dash.hideLoader();
			} );
		},
		showTemplateSettings: function () {

			this.model.set( {iframe_url: this.model.get( 'preview_url' ), current_page: 'template'} );
		},
		showAdvancedSettings: function () {
			TVE_Dash.showLoader();

			var self = this;

			self.model.set( {
				membership_plugin: {},
				sendowl_products: {}
			} );

			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce
				},
				type: 'POST',
				url: ThriveApp.routes.settings + '/set_advanced_user_settings/',
				data: {
					template: self.model.toDeepJSON()
				}
			} ).done( function ( response, status, options ) {
				self.model.set( {
					iframe_url: response.url,
					current_page: 'advanced',
					preview_notification: false,
					advanced: true
				} );
			} ).always( function () {
				TVE_Dash.hideLoader();
			} );

		},
		showCourseList: function () {
			if ( this.model.get( 'apprentice_url' ) ) {
				this.model.set( {iframe_url: this.model.get( 'apprentice_url' )} );
			}

			this.model.set( {current_page: 'index'} );
		},
		openCardContent: function ( e ) {
			var currentCard = e.currentTarget;
			if ( jQuery( currentCard ).siblings( ".tva-card-content" ).hasClass( "open" ) ) {
				jQuery( currentCard ).siblings( ".tva-card-content" ).removeClass( "open" );
				jQuery( currentCard ).children( ".tva-arrow" ).css( "transform", "rotate(45deg)" );
			} else {
				jQuery( currentCard ).siblings( ".tva-card-content" ).addClass( "open" );
				jQuery( currentCard ).children( ".tva-arrow" ).css( "transform", "rotate(225deg)" );
			}

		},
		save: function () {

			TVE_Dash.showLoader();
			this.model.set( {first_time: false} );

			var xhr = this.model.save(),
				self = this;

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					if ( response ) {
						self.original_model.set( {template: response.template} );
						self.original_model.set( 'first_time', false );
					}

					TVE_Dash.success( ThriveApp.t.TemplateSaved );
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.err( errorObj.responseText );
				} );
				xhr.always( function () {
					TVE_Dash.hideLoader();

				} );
			}
		},
		slide: function ( e ) {
			var type = e.currentTarget.type,
				target = e.currentTarget,
				name = e.currentTarget.name,
				row = $( target ).closest( '.tva-card-content' );

			if ( type == 'range' ) {
				row.find( '#tva_' + name + '_input' ).val( target.value );
			} else {
				row.find( '#tva_' + name ).val( target.value );

				this.setValue( e );
			}

			ThriveApp.util.Editor.apply( '.tva_' + name, 'width', target.value, 'px' );
			ThriveApp.util.Editor.apply( '.tva-img-logo', 'width', target.value, 'px' );
			ThriveApp.util.Editor.apply( '.tva-img-logo, .tva_logo_size', 'max-width', 600, 'px' );
			ThriveApp.util.Editor.apply( '.tva-img-logo, .tva_logo_size', 'max-height', 300, 'px' );

			if ( name === 'logo_size' && this.model.get( 'template' ).logo_type ) {
				var $span = ThriveApp.util.Editor.iframe.find( '.tva_text_logo_size' );

				if ( $span.length > 0 ) {
					ThriveApp.util.Editor.apply( '.tva-header .header-logo .tva_text_logo_size', 'font-size', target.value, 'px' );
				} else {
					ThriveApp.util.Editor.apply( '.header-logo > a', 'font-size', target.value, 'px' );
				}
			}

			e.stopPropagation();
		},
		setValue: function ( e ) {
			var name = e.currentTarget.name,
				value = $( e.currentTarget ).hasClass( 'tva-text-change' ) ? e.currentTarget.value : parseFloat( e.currentTarget.value.replace( /,/g, "." ) );

			this.model.get( 'template' )[ name ] = value;
		},
		close: function () {
			TVE_Dash.showLoader();
			if ( this.model.get( 'old_template' ) ) {
				this.model.set( {template: this.model.get( 'old_template' )} );
				this.model.unset( 'old_template' );

				this.save();
			} else {
				/**
				 * Set the preview option in case it was changed
				 */
				this.original_model.set( {preview_option: this.model.get( 'preview_option' )} );
				this.original_model.set( {iframe_url: this.model.get( 'iframe_url' )} );

				if ( this.model.get( 'first_time' ) ) {
					this.showCloseNotification();

					TVE_Dash.hideLoader();
				} else {
					if ( _.isEqual( this.model.get( 'template' ), this.original_model.get( 'template' ) ) ) {
						ThriveApp.router.navigate( "#dashboard", {trigger: true} );
					} else {
						this.showCloseNotification();
						TVE_Dash.hideLoader();
					}
				}
			}

		},
		showCloseNotification: function () {
			this.modal( ThriveApp.modals.ConfirmEditorClose, {
				'max-width': '60%',
				width: '800px',
				model: this.model,
				in_duration: 200,
				out_duration: 0
			} );
		}
	} );

} )( jQuery );
