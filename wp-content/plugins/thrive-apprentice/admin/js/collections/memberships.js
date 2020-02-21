var baseCollection = require( './selected_items' ),
	model = require( './../models/membership' );

module.exports = baseCollection.extend( {
	model: model,
	isChanged: function () {
		var changed = false;

		this.each( function ( model ) {
			if ( model.changedAttributes() !== false ) {
				changed = true;
			}
		} );

		return changed;
	}
} );