var baseModel = require( './thankyou' );

module.exports = baseModel.extend( {
	url: function () {
		return ThriveApp.routes.sendowl + '/save_thankyou_multiple_page/'
	}
} );