( function ( $ ) {

	var list = require( '../course/items-list' );

	module.exports = list.extend( {
		initialize: function () {
			this.listenTo( this.model, 'change:state', this.renderState );
			this.listenTo( this.model, 'change:checked', this.setChecked );
		},
		render: function () {
			this.renderState();

			return this;
		},
		renderState: function () {
			var view = '';

			if ( this.model.get( 'state' ) === 'delete' ) {
				view = require( './lesson-delete-state' );
			} else {
				view = require( './lesson-normal-state' );
			}

			var _view = new view( {
				model: this.model,
				collection: this.collection
			} );

			_view.render();
			this.$el.replaceWith( _view.$el );
			this.setElement( _view.$el );

			return this;
		}
	} );

} )( jQuery )