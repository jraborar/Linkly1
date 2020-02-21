var basicIntegration = require( '../models/integration/base' );

/**
 * List of Integration TA has to protect the content/course/module/etc
 */
module.exports = Backbone.Collection.extend( {

	model: function ( model, options ) {

		if ( ! model ) {
			model = {slug: null};
		}

		switch ( model.slug ) {
			default:
				return new basicIntegration.model( model, options );
		}
	},

	/**
	 * Get Items of an integration with slug
	 *
	 * @param slug
	 * @return {{Backbone.Collection}}
	 */
	getItems: function ( slug ) {

		var integration = this.findWhere( {slug: slug} );

		if ( integration instanceof basicIntegration.model ) {
			return integration.getItems();
		}

		return new basicIntegration.items_collection();
	},

	/**
	 * Get integration from this collection by slug
	 *
	 * @param {String} slug
	 * @return {basicIntegration.model}
	 */
	getIntegration: function ( slug ) {

		var integration = this.findWhere( {slug: slug} );

		if ( integration instanceof basicIntegration.model ) {
			return integration;
		}

		return new basicIntegration.model();
	}
} );
