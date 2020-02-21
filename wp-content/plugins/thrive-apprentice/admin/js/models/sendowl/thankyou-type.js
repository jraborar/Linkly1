var baseModel = require( './../base' );

module.exports = baseModel.extend( {
	defaults: function() {
		return {
			type: 'static'
		}
	},
	url: function () {
		return ThriveApp.routes.sendowl + '/save_thankyou_page_type/'
	}
} );