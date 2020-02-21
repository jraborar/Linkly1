var listView;

( function ( $ ) {
	var contentView = require( './content' );

	listView = contentView.extend( {
		className: 'tva-items-list',
		expanded: null,
		events: {
			'click .tva-parent-item': 'animateItem',
			'click .tva-checkbox': 'setItems'
		},
		initialize: function () {
		},
		render: function () {
			var type = this.model.hasChildren();
			this.collection.each( this.renderOne, this );
			this.$el.addClass( 'tva-' + type + '-section' );

			if ( this.model.hasChildren() && ! this.model.get( 'taxonomy' ) ) {
				this.$el.addClass( 'tva-childs-section' );
			}

			return this
		},
		setItems: function ( e ) {
			e.stopPropagation();

			ThriveApp.globals.active_course.trigger( 'reset_select_all' );

			this.showActions( e );
		},
		animateItem: function ( e ) {
			e.stopPropagation();

			this.expanded = this.collection.findWhere( {expanded: true} );
			this.model.set( {expanded: ! this.model.get( 'expanded' )} );
		},
		showActions: function ( e ) {
			/**
			 * Because we're doing actions on the wrapper
			 * the checked prop will always return the opposite of what we expect
			 * @type {*|void}
			 */
			var checked = ! $( e.currentTarget ).find( 'input' ).prop( 'checked' );
			$( e.currentTarget ).find( 'input' ).prop( 'checked', checked );

			if ( ! checked ) {
				$( '#tva-select-all-items' ).prop( 'checked', checked )
			}

			ThriveApp.globals.selected_items.checkItems( this.model, checked );

			ThriveApp.globals.active_course.trigger( 'render_bulk_actions' );
		},
		setChecked: function () {
			this.$( '.tva-select-items:first' ).prop( 'checked', this.model.get( 'checked' ) );
		}
	} );

} )( jQuery );

module.exports = listView;
