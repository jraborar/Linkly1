/**
 * Model for one template
 */

var base_model = require( './base' );

module.exports = base_model.extend( {
	idAttribute: 'ID',
	defaults: {
		name: ''
	}
} );
