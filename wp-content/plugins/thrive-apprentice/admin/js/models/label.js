/**
 * Label Model
 */

var topic_model = require( './topic' );

module.exports = topic_model.extend( {
	defaults: {
		title: 'New Label',
		color: '#58a545',
		label_color: '#58a545',
		checked: 1
	},
	url: function () {
		var url = ThriveApp.routes.labels;

		if ( this.get( 'ID' ) || this.get( 'ID' ) === 0 ) {
			url += '/' + this.get( 'ID' );
		}

		return url;
	}
} );
