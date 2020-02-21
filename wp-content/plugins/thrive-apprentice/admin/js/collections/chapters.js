/**
 * Collection of chapters which includes the collection of lessons
 */

var selected_items_collection = require( './selected_items' ),
	chapter_model = require( './../models/chapter' );

module.exports = selected_items_collection.extend( {
	model: chapter_model,
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
