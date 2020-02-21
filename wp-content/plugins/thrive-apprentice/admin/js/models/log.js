var base_model = require( './base' );

module.exports = base_model.extend( {
	idAttribute: 'id',
	defaults: {
		type: '',
		identifier: '',
		product: 'None',
		data: {},
		date: ''
	}
} );
