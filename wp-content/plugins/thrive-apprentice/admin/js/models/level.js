/**
 * Level Model
 */

var base_model = require( './base' );

module.exports = base_model.extend( {
	idAttribute: 'ID',
	defaults: {
		name: ''
	},
	url: function () {
		var url = ThriveApp.routes.levels;

		if ( this.get( 'ID' ) || this.get( 'ID' ) === 0 ) {
			url += '/' + this.get( 'ID' );
		}

		return url;
	},
	/**
	 * Overwrite Backbone validation
	 * Return something to invalidate the model
	 *
	 * @param {Object} attrs
	 * @param {Object} options
	 */
	validate: function ( attrs, options ) {
		var errors = [];
		if ( ! attrs.name ) {
			errors.push( this.validation_error( 'add_level', ThriveApp.t.NoLevel ) );
		}

		if ( errors.length ) {
			return errors;
		}
	}
} );
