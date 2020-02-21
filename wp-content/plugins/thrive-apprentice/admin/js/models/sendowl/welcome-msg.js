var base = require( './../base' );

module.exports = base.extend( {
	defaults: function () {
		return {
			message: ''
		}
	},
	url: function () {
		return ThriveApp.routes.sendowl + '/save_welcome_message/'
	}
} );
