var baseModel = require( './base' );

module.exports = baseModel.extend( {
	idAttribute: 'ID',
	defaults: function () {
		return {
			name: '',
			old_ID: '',
			state: 'empty',
			edit_text: 'Edit with Thrive Architect'
		}
	},
	url: function () {
		return ThriveApp.routes.sendowl + '/save_checkout_page/'
	}
} );