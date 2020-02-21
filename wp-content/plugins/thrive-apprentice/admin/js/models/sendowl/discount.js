( function ( $ ) {

	var baseModel = require( './base' );

	module.exports = baseModel.extend( {
		initialize: function () {
			this.set( this.get( 'discount_code' ) );
			this.set( {ID: this.get( 'id' )} );
			this.unset( 'discount_code' );
		}
	} );

} )( jQuery );
