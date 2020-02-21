( function ( $ ) {

	var baseCollection = require( './../base' ),
		model = require( './../../models/sendowl/product' );

	module.exports = baseCollection.extend( {
		model: model
	} );

} )( jQuery );
