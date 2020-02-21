var baseModel = require( './base' );

module.exports = baseModel.extend( {
	initialize: function () {
		this.set( {
			ID: this.get( 'id' ),
			identifier: 'bundle'
		} );
		this.get( 'queryParams' ).set( {bid: this.get( 'id' )} )
	}
} );
