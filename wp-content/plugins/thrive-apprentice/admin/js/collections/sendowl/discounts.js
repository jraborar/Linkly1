( function ( $ ) {

	var baseCollection = require( './../base' ),
		model = require( './../../models/sendowl/discount' );

	module.exports = baseCollection.extend( {
		model: model
	} );

} )( jQuery );
