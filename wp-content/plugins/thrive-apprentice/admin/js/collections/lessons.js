/**
 * Collection of Levels
 */
var selected_items_collection = require( './selected_items' ),
	lesson_model = require( './../models/lesson' );

module.exports = selected_items_collection.extend( {
	model: lesson_model,
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