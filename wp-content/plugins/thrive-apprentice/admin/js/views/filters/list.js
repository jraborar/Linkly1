( function ( $ ) {

	var baseView = require( '../base' );

	var itemView = require( './item' );

	module.exports = baseView.extend( {

		render: function () {
			this.collection.each( this.renderOne, this );
			this.renderSelect();
		},
		renderOne: function ( filter ) {
			var view = new itemView( {
				tagName: 'li',
				model: filter,
				collection: this.collection
			} );

			this.$el.append( view.render().$el )
		},
		renderSelect: function () {
			var model = new ThriveApp.models.Topic();
			model.set( {
				ID: 'none',
				title: 'Select All',
				checked: 1
			} );

			var select = new itemView( {
				tagName: 'li',
				model: model,
				collection: this.collection
			} );

			this.$el.append( select.render().$el )
		}
	} );

} )( jQuery );
