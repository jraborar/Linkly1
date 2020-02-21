( function ( $ ) {

	var baseView = require( './base' );

	/**
	 * Header View
	 */
	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'header' ),
		events: {
			'click #tva-general-settings': 'generalSettings',
			'click #tva-disable-apprentice': 'disableApprentice',
			'click #tva-template-settings': 'templateSettings',
			'click #tva-label-management': 'labelManagement'
		},
		initialize: function () {
			this.listenTo( this.model, 'change:apprentice', this.render );
			this.model.on( 'tva_render_header', function () {
				this.render();
			}, this )
		},
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );
			TVE_Dash.materialize( this.$el );
			return this;
		},
		generalSettings: function () {
			this.modal( ThriveApp.modals.ModalSettings, {
				model: ThriveApp.globals.settings,
				'max-width': '60%',
				width: '800px',
				in_duration: 200,
				out_duration: 0
			} );
		},
		templateSettings: function () {
			ThriveApp.router.navigate( "#template_settings", {trigger: true} );
		},
		labelManagement: function () {
			ThriveApp.router.navigate( "#label_management", {trigger: true} );
		},
		disableApprentice: function () {
			TVE_Dash.showLoader();
			var self = this;
			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce
				},
				type: 'POST',
				url: ThriveApp.routes.settings + '/disable_apprentice/'
			} ).done( function ( response, status, options ) {
				if ( response ) {
					self.model.set( {apprentice: false} );
					TVE_Dash.success( ThriveApp.t.SuccessDisabledApprentice );
					self.render();
				}
			} ).error( function ( errorObj ) {
				TVE_Dash.err( errorObj.responseText );
			} ).always( function () {
				TVE_Dash.hideLoader();
			} );
		}
	} );

} )( jQuery );
