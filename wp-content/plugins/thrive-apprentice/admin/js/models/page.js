var baseModel = require( './base' );

/**
 * Representation of a page used by TA
 */
module.exports = baseModel.extend( {
	defaults: function () {
		return {
			ID: '',
			name: ''
		}
	}
} );
