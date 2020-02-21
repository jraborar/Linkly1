var base_model = require( './base' );

module.exports = base_model.extend( {
	initialize: function () {
		this.set( {
			product_id: parseInt( this.get( 'product_id' ) )
		} )
	}
} );