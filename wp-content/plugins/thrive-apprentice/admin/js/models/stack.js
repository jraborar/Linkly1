var base_model = require( './base' );

module.exports = base_model.extend( {
	idAttribute: 'id',
	defaults: {
		type: '',
		product: 'None',
		data: {},
		date: ''
	},
	initialize: function () {
		this.set( {data: new collections.Logs( this.get( 'data' ) )} );
	}
} );
