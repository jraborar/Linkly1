var base_model = require( './base' );

module.exports = base_model.extend( {
	defaults: {
		ID: ThriveApp.data.defaults.author.ID,
		url: ThriveApp.data.defaults.author.url,
		user_login: ThriveApp.data.defaults.author.user_login,
		biography_type: 'wordpress_bio',
		custom_biography: ''
	},
	/**
	 * Overwrite Backbone validation
	 * Return something to invalidate the model
	 *
	 * @param {Object} attrs
	 * @param {Object} options
	 */
	validate: function ( attrs, options ) {
		if ( ! attrs.author.user_login ) {
			return this.validation_error( 'author', ThriveApp.t.NoAuthor )
		}
	}
} );