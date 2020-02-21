var baseModel = require( './../../base' );

module.exports = baseModel.extend( {
	initialize: function ( options ) {
		if ( this.get( 'ID' ) ) {
			this.set( {state: 'normal'} );
		}
	},
	validate: function ( options ) {
		var errors = [];

		if ( ! options.name ) {
			errors.push( this.validation_error( 'name', ThriveApp.t.pageTitleMissing ) );
			return errors;
		}
	}
} );
