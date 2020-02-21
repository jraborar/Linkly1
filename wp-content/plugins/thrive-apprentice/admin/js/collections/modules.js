/**
 * Collection of modules which includes the collection of lessons and chapters
 */

var selected_items_collection = require( './selected_items' ),
	module_model = require( './../models/module' );

module.exports = selected_items_collection.extend( {
	model: module_model,
	/**
	 * Used to sort the collection
	 *
	 * @param model
	 * @returns {*}
	 */
	comparator: function ( model ) {
		return parseInt( model.get( 'order' ) );
	}
} );
