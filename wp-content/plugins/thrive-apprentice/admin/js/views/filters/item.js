( function ( $ ) {

	var baseView = require( '../base' );

	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'filters/item' ),
		events: {
			'click .tva-filter-topic': 'filterTopics'
		},
		checked: true,
		render: function () {
			this.$el.prepend( this.template( {model: this.model} ) );

			return this;
		},
		filterTopics: function ( e ) {
			var id = this.model.get( 'ID' );
			this.checked = $( e.currentTarget ).is( ':checked' ) ? 1 : 0;

			if ( id == 'none' && $( e.currentTarget ).is( ':checked' ) ) {
				$( '.tva-filter-topic' ).prop( 'checked', true );
				this.collection.each( this.toggleChecked, this );
			} else if ( id == 'none' && ! $( e.currentTarget ).is( ':checked' ) ) {
				$( '.tva-filter-topic' ).prop( 'checked', false );
				this.collection.each( this.toggleChecked, this );
			} else {
				this.toggleChecked( this.model );
				var count = this.collection.where( {checked: 1} ).length,
					check = count == this.collection.length;
				$( '#tva-filter-topic-none' ).prop( 'checked', check );
			}

			ThriveApp.globals.courses.trigger( 'tva_filter_courses' );
		},
		toggleChecked: function ( model ) {
			model.set( {checked: this.checked} );
		}
	} )

} )( jQuery );