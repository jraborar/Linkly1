( function ( $ ) {

	var baseView = require( './base' );

	var filtersView = require( './filters/list' );

	var coursesListView = require( './courses/list' );

	module.exports = baseView.extend( {
		className: 'tvd-container',
		template: TVE_Dash.tpl( 'dashboard' ),
		events: {
			'click .tva-add-course': 'addCourse',
			'click .tva-toggle-filters': 'toggleFilters'
		},
		courseList: '',
		render: function () {
			this.$el.html( this.template( {} ) );

			if ( this.model.get( 'is_thrivetheme' ) && this.model.get( 'apprentice' ) && ! this.model.get( 'import' ) && ! this.model.get( 'first_time' ) && this.model.get( 'has_importcourses' ) ) {
				this.modal( ThriveApp.modals.ModalImportLessons, {
					model: this.model,
					'max-width': '60%',
					width: '800px'
				} );
			}
			this.renderFilters();

			$( 'body' ).on( 'click', function ( e ) {
				var container = $( '.tva-filters-wrapper' );
				var btn = $( '.tva-toggle-filters' );

				if ( ! container.is( e.target ) && container.has( e.target ).length === 0 && ! btn.is( e.target ) ) {
					container.slideUp();
				}
			} );

			this.courseList = new coursesListView( {
				el: this.$el.find( '#tva-courses-list' ),
				model: this.model,
				collection: this.collection
			} );

			this.courseList.render();
			this.toggleNoCoursesText();

			TVE_Dash.hideLoader();
			return this;
		},
		addCourse: function () {
			ThriveApp.router.navigate( "#add_course", {trigger: true} );
		},
		toggleNoCoursesText: function () {

			if ( this.collection.length ) {
				this.$( '#tva-no-courses-text' ).hide();
			} else {
				this.$( '#tva-no-courses-text' ).show();
			}

			if ( this.collection.length == 1 ) {
				this.$el.find( '#tva-one-courses-text' ).show();
			} else {
				this.$el.find( '#tva-one-courses-text' ).hide();
			}
		},
		renderFilters: function () {
			var view = new filtersView( {
				el: this.$( '.tva-filters-container' ),
				collection: ThriveApp.globals.topics
			} );

			view.render();
		},
		toggleFilters: function () {
			this.$( '.tva-filters-wrapper' ).slideToggle();
		}
	} )

} )( jQuery );