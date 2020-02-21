var baseModel = require( './../base' );

module.exports = baseModel.extend( {
	defaults: function () {
		return {
			key: '',
			secret: ''
		}
	},
	url: function () {
		return ThriveApp.routes.sendowl + '/save_account_keys/'
	}
} );
