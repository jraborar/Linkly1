( function ( $ ) {

	var baseModel = require( './base' );

	module.exports = baseModel.extend( {
		initialize: function () {
			this.set( {
				ID: this.get( 'id' ),
				identifier: 'product'
			} );
			this.get( 'queryParams' ).set( {pid: this.get( 'id' )} )
		}
	} );

} )( jQuery );
