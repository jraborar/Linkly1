var baseModel = require( './base' );

module.exports = baseModel.extend( {
	defaults: function () {
		return {
			ID: '',
			name: 'None',
			selected: false
		}
	}
} );