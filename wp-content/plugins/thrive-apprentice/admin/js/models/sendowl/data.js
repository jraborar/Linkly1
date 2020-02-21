( function ( $ ) {

	var baseModel = require( './base' );

	module.exports = baseModel.extend( {
		initialize: function () {
			this.set( {discounts: new ThriveApp.collections.SendowlDiscounts( this.getDiscounts() )} );
			this.set( {bundles: new ThriveApp.collections.SendowlBundles( this.get( 'bundles' ) )} );
			this.set( {products: new ThriveApp.collections.SendowlProducts( this.get( 'products' ) )} );
		},
		getDiscounts: function () {
			var data = [],
				_key = 'discount_code';

			_.each( this.get( 'discounts' ), function ( item ) {
				if ( item[ _key ] ) {
					data.push( item[ _key ] );
				}
			} );

			return data;
		}
	} );

} )( jQuery );