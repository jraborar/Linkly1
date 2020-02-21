var base_model = require( './../base' );

module.exports = base_model.extend( {
	idAttribute: 'ID',
	defaults: function () {
		return {
			display_name: '',
			user_email: '',
			user_login: '',
			edit_url: '',
			membership_ids: [],
			bundle_ids: []
		}
	},
	initialize: function () {

		if ( this.get( 'ID' ) ) {
			this.set( {ID: parseInt( this.get( 'ID' ) )} );
		}

		if ( this.get( 'buyer_name' ) ) {
			this.set( {
				display_name: this.get( 'buyer_name' ),
				user_login: this.get( 'buyer_email' )
			} );
		}

		if ( this.get( 'buyer_email' ) ) {
			this.set( {user_email: this.get( 'buyer_email' )} );
		}

		if ( parseInt( this.get( 'is_valid' ) !== 1 ) ) {
			this.set( {is_valid: 0} );
		}
	},
	url: function () {
		var url = ThriveApp.routes.users;

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

		if ( ! attrs.user_login ) {
			errors.push( this.validation_error( 'user_login', ThriveApp.t.MissingUserLogin ) );
		}

		if ( ! attrs.user_email ) {
			errors.push( this.validation_error( 'user_email', ThriveApp.t.MissingEmail ) );
		}

		if ( errors.length ) {
			return errors;
		}

		if ( ! ThriveApp.util.isEmail( attrs.user_email ) ) {
			return this.validation_error( 'user_email', ThriveApp.t.InvalidCustomerEmail );
		}
	}
} );
