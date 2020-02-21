/**
 * Collection of courses which includes the collection of lessons
 */

var selected_items_collection = require( './selected_items' ),
	course_model = require( './../models/course' );

module.exports = selected_items_collection.extend( {
	model: course_model,
	/**
	 * @param a
	 * @param b
	 * @returns {number}
	 */
	comparator: function ( a, b ) {
		return parseInt( b.get( 'order' ) ) - parseInt( a.get( 'order' ) );
	}
} );