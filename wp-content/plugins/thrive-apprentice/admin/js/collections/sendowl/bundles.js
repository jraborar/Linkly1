( function ( $ ) {

	var baseCollection = require( './../base' ),
		model = require( './../../models/sendowl/bundle' );

	module.exports = baseCollection.extend( {
		model: model
	} );

} )( jQuery );
