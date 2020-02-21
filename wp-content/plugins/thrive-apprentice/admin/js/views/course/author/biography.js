( function () {

	var baseView = require( './../../base' ),
		author_model = require( './../../../models/author' );

	var imgNormalState = baseView.extend( {
		template: TVE_Dash.tpl( 'course/edit/author/image-normal-state' ),
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );

			return this;
		}
	} );

	var imgEmptyState = baseView.extend( {
		template: TVE_Dash.tpl( 'course/edit/author/image-empty-state' ),
		render: function () {
			this.$el.html( this.template( {} ) );

			return this;
		}
	} );

	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'course/edit/author/biography' ),
		events: {
			'click .tva-author-image': 'addAuthorImage',
			'click .tva-remove-author-cover-image': 'removeImage',
			'input #tva-author-description': 'setBiography',
			'change #tva-author-biography': 'onBiographyChange'
		},
		initialize: function () {
			var self = this;

			ThriveApp.globals.active_course.on( 'tva_author_changed', function ( model ) {
				self.model = model;
				self.render();
			} )
		},
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );
			this.renderAuthorImage();

			var $select = this.$( '#tva-author-biography' );

			$select.attr( 'value', this.model.get( 'biography_type' ) );

			this.model.get( 'biography_type' ) === 'wordpress_bio'
				? this.$( '.tva-textarea-holder' ).hide()
				: this.renderMCE( 'tva-author-description', 'custom_biography' );

			TVE_Dash.materialize( this.$el );

			return this;
		},
		renderMCE: function ( selector, prop ) {
			var self = this;

			setTimeout( function () {
				ThriveApp.util.clearMCEEditor( selector );
				ThriveApp.util.editorInit( selector, self.model, prop );
				TVE_Dash.materialize( self.$el );
			}, 0 );
		},
		renderAuthorImage: function () {
			var view = this.model.get( 'url' ).length > 0 ? imgNormalState : imgEmptyState;

			new view( {
				el: this.$( '.tva-author-image-holder' ),
				model: this.model
			} ).render();
		},
		addAuthorImage: function () {
			var frame,
				self = this;

			// If the media frame already exists, reopen it.
			if ( frame ) {
				frame.open();
				return;
			}

			// Create a new media frame
			frame = wp.media( {
				title: 'Select or Upload a Cover Image',
				button: {
					text: 'Use this Image'
				},
				library: {type: 'image'},
				multiple: false  // Set to true to allow multiple files to be selected
			} );

			// When an image is selected in the media frame...
			frame.on( 'select', function () {
				var attachment = frame.state().get( 'selection' ).first().toJSON();
				self.model.set( {url: attachment.url} );
				self.renderAuthorImage();
			} );

			// Finally, open the modal on click
			frame.open();
		},
		onBiographyChange: function ( e ) {
			this.model.set( {biography_type: e.currentTarget.value} );

			if ( this.model.get( 'biography_type' ) === 'custom_bio' ) {
				this.$( '.tva-textarea-holder' ).show();

				this.renderMCE( 'tva-author-description', 'custom_biography' );
			} else {
				this.$( '.tva-textarea-holder' ).hide();
			}
		},
		removeImage: function ( e ) {
			e.stopPropagation();

			this.model.set( {url: ''} );
			this.renderAuthorImage();
		},
		setBiography: function ( e ) {
			this.model.set( {custom_biography: e.currentTarget.value} );
		}
	} )

} )( jQuery );
