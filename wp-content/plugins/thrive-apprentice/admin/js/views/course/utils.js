( function ( $ ) {

	var base = require( '../base' );

	module.exports = base.extend( {
		isCollection: function ( collection ) {
			return ( typeof collection === 'object' ) && ( collection instanceof Backbone.Collection );
		},
		getPlural: function ( str ) {
			return str + 's';
		},
		isModule: function ( model ) {
			return model && model.get( 'post_type' ) === 'tva_module';
		},
		isChapter: function ( model ) {
			return model && model.get( 'post_type' ) === 'tva_chapter';
		},
		isLesson: function ( model ) {
			return model && model.get( 'post_type' ) === 'tva_lesson';
		},
		renderMCE: function ( selector, prop ) {
			var self = this;

			setTimeout( function () {
				ThriveApp.util.clearMCEEditor( selector );
				ThriveApp.util.editorInit( selector, self.model, prop );
				TVE_Dash.materialize( self.$el );
			}, 0 );
		}
	} );

} )( jQuery )
