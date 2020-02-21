var baseModel = require( './base' );

module.exports = baseModel.extend( {
	idAttribute: 'ID',
	defaults: function () {
		return {
			name: '',
			old_ID: '',
			state: 'empty',
			edit_url: '',
			edit_text: 'Edit',
			preview_url: ''
		}
	},
	url: function () {
		return ThriveApp.routes.sendowl + '/save_thankyou_page/'
	}
} );