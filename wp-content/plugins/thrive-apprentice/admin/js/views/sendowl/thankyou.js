( function ( $ ) {

	var checkoutView = require( './checkout' );

	module.exports = checkoutView.extend( {
		template: TVE_Dash.tpl( 'sendowl/static' ),
		events: {},
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );


			var $post_search = this.$( '#tva-sendowl-thankyou-page' ),
				model = this.model,
				self = this;

			new ThriveApp.PostSearch( $post_search, {
				url: ThriveApp.routes.settings + '/search_pages/',
				type: 'POST',
				select: function ( event, ui ) {
					model.get( 'thankyou_page' ).ID = parseInt( ui.item.id );
					model.get( 'thankyou_page' ).name = ui.item.label;
					self.saveCheckoutSettings();
				},
				search: function () {
					model.set( {thankyou_page: {}} );
					self.$( '#tva-new-sendowl-thankyou-page' ).removeAttr( 'disabled' );
				},
				open: function () {
					model.set( {thankyou_page: {}} );
					self.$( '#tva-new-sendowl-thankyou-page' ).attr( 'disabled', 'disabled' );
				},
				close: function ( event, ui ) {
					if ( ! model.get( 'thankyou_page' ).ID ) {
						self.$( '#tva-new-sendowl-thankyou-page' ).removeAttr( 'disabled' );
					}
				},
				fetch_single: model.get( 'thankyou_page' )
			} );

			return this;
		}
	} )

} )( jQuery );
