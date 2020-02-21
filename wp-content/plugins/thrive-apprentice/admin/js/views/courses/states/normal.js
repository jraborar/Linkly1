( function ( $ ) {

	var base_view = require( '../../base' );

	module.exports = base_view.extend( {
		className: 'tva-course-item',
		template: TVE_Dash.tpl( 'course/item' ),
		initialize: function () {
			this.listenTo( this.model.get( 'lessons' ), 'add', this.render );
		},
		events: {
			'click .tva-go-to-course': 'goToCourse',
			'click .tva-delete-course': 'changeState',
			'click .tva-preview-course-url': 'previewCourse',
			'click .tva-drag-card': function ( e ) {
				e.stopPropagation();
			}
		},
		render: function () {
			var published = this.collection.where( {status: 'publish'} ),
				topic = ThriveApp.globals.topics.findWhere( {ID: parseInt( this.model.get( 'topic' ) )} ),
				display = this.collection.where( {display: 0} ),
				show_order = display.length == 0;

			this.model.set( {tooltiped: false} );

			if ( published.length == 0 && this.collection.at( 0 ) == this.model ) {
				var pb_lesson = this.model.get( 'lessons' ).findWhere( {post_status: 'publish'} ),
					pb_chapter = this.model.get( 'chapters' ).findWhere( {post_status: 'publish'} ),
					pb_module = this.model.get( 'modules' ).findWhere( {post_status: 'publish'} );

				if ( pb_lesson || pb_chapter || pb_module ) {
					this.model.set( {tooltiped: true} );
				}
			}

			this.$el.html( this.template( {model: this.model, topic: topic, show_order: show_order} ) );
			this.renderTopic();
			this.$el.attr( 'data-id', this.model.get( 'ID' ) );
			return this;
		},
		renderTopic: function () {
			var topic = ThriveApp.globals.topics.findWhere( {ID: parseInt( this.model.get( 'topic' ) )} );

			if ( ! topic ) {
				return;
			}

			var type = topic.get( 'icon_type' );

			if ( ! type || type === 'icon' ) {
				this.$( '.ta-course-icon' ).html( '<div style="background-image: url(' + topic.get( 'icon' ) + ')"></div>' );

				return;
			}

			var svg = topic.get( 'svg_icon' );
			this.$( '.ta-course-icon' ).html( svg );
			this.$( '.ta-course-icon svg' ).css( 'fill', topic.get( 'layout_icon_color' ) );
			this.$( '.ta-course-icon span' ).css( 'color', topic.get( 'layout_icon_color' ) );
			this.$( '.ta-course-icon' ).css( 'padding', '10px' );
		},
		goToCourse: function ( e ) {
			var id = $( e.currentTarget ).attr( 'data-id' );
			if ( ! $( e.target ).hasClass( 'tva-delete-course' ) ) {
				ThriveApp.router.navigate( '#course/' + id, {trigger: true} );
			}
		},
		changeState: function ( e ) {
			e.stopPropagation();
			var model = this.collection.findWhere( {state: ThriveApp.t.delete_state} );
			if ( model ) {
				model.set( {state: ThriveApp.t.normal_state} );
			}
			this.model.set( {state: ThriveApp.t.delete_state} );
		},
		previewCourse: function ( e ) {
			e.stopPropagation();
		}
	} );

} )( jQuery );