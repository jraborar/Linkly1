/**
 * Membermouse membership and bundle model
 */

var base_model = require( './base' );

module.exports = base_model.extend( {
	defaults: {
		id: '',
		name: 'None'
	}
} );
