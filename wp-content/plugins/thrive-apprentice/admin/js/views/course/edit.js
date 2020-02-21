( function ( $ ) {

	var utils = require( './utils' ),
		authorView = require( './author/biography' );

	module.exports = utils.extend( {
		template: TVE_Dash.tpl( 'course/edit/course-fields' ),
		events: {
			'click .tva-cover-image': 'addCoverImage',
			'click .tva-heading': 'toggleSettings',
			'input #tva-course-title': 'setTitle',
			'input #tva-course-slug': 'setSlug',
			'change .tva-course-topic': 'setTopic',
			'input #tva-course-description': 'setDescription',
			'click .tva-save-course': 'save',
			'click .tva-remove-course-cover-image': 'removeCoverImage',
			'change #tva-course-featured-video': 'setVideoStatus',
			'change #tva-course-comments': 'setCommentStatus'
		},
		video_view: null,
		initial_comment_status: null,
		comment_status_view: null,
		initialize: function () {
			this.initial_comment_status = this.model.get( 'comment_status' );
			this.listenTo( ThriveApp.globals.settings, 'change:comment_status', this.onCommentStatusChange );
		},
		render: function () {
			this.$el.html( this.template( {model: this.model, author: this.model.get( 'author' )} ) );
			this.$( '.tva-edit-course-name' ).addClass( 'tva-hide' );

			if ( this.model.get( 'ID' ) ) {
				this.$( '.tva-course-title' ).hide();
			}

			this.renderCoverImage();
			this.renderCommentStatus();
			this.renderMCE( 'tva-course-description', 'description' );

			new authorView( {
				el: this.$( '.tva-author-biography' ),
				model: this.model.get( 'author' )
			} ).render();

			if ( this.model.get( 'video_status' ) == true ) {
				this.renderVideo();
			}

			$( 'body' ).trigger( 'course_fields', this.model );

			this.$el.addClass( 'tva-course-editor' );
			this.bind_zclip();
			TVE_Dash.hideLoader();

			return this;
		},
		onCommentStatusChange: function () {
			this.model.set( {comment_status: ThriveApp.globals.settings.get( 'comment_status' )} );

			var children = this.model.hasChildren();

			if ( children ) {
				this.model.get( children ).updateValues( {comment_status: this.model.get( 'comment_status' )}, true )
			}

			this.comment_status_view.render();
		},
		renderCommentStatus: function () {
			this.comment_status_view = new ThriveApp.views.CommentStatusView( {
				el: this.$( '#tva-comment-status-container' ),
				model: this.model
			} );

			this.comment_status_view.render();
		},
		removeCoverImage: function ( e ) {
			e.stopPropagation();

			this.model.set( {cover_image: ''} );
			this.renderCoverImage();

		},
		renderCoverImage: function () {
			var state = this.model.get( 'cover_image' ) ? 'normal' : 'empty';

			if ( ! ThriveApp.views[ 'Cover' + ThriveApp.util.upperFirst( state ) + 'State' ] ) {
				return;
			}

			var view = new ThriveApp.views[ 'Cover' + ThriveApp.util.upperFirst( state ) + 'State' ]( {
				el: this.$( '.tva-cover-image' ),
				model: this.model
			} );

			view.render();
		},
		renderLabel: function ( label ) {
			this.label = new ThriveApp.views.Label( {
				tagName: 'li',
				model: label,
				attributes: {
					"data-id": label.get( 'ID' )
				},
				className: 'tva-course-label-item tvd-pointer',
				selected: this.model.get( 'label' )
			} );

			this.$( '.tva-course-labels-list' ).append( this.label.render().$el );
		},
		renderVideo: function () {
			var media_model = new ThriveApp.models.MediaSelect( this.model.get( 'term_media' ) );

			if ( this.video_view ) {
				this.video_view.remove();
			}

			this.video_view = new ThriveApp.views.MediaSelectView( {
				model: media_model,
				source: this.model
			} );

			this.$( '#tva-course-video' ).show();
			this.$( '#tva-course-video' ).append( this.video_view.render().$el );

			return this;
		},
		setVideoStatus: function ( e ) {
			var value = e.currentTarget.checked;
			this.model.set( {video_status: value} );

			if ( value == true ) {
				this.renderVideo();
			} else {
				this.video_view.remove();
				this.$( '#tva-course-video' ).hide()
			}

			return this;
		},
		setTitle: function ( e ) {
			var value = e.target.value;

			this.$( '#tva-course-slug' ).val( value );

			this.model.set( {
				name: value,
				slug: ThriveApp.util.slugify( value, "-" ).toLowerCase()
			} )
		},
		setSlug: function ( e ) {
			this.model.set( 'slug', e.currentTarget.value );
		},
		setDescription: function ( e ) {
			this.model.set( 'description', e.currentTarget.value );
		},
		setTopic: function () {
			this.model.set( {topic: parseInt( this.$( '.tva-course-topic' ).val() )} );
			this.model.set( {topic_name: this.model.getTopicName()} );
			this.model.set( {topic_color: this.model.getTopicColor()} );
		},
		setCommentStatus: function ( e ) {
			var comment_status = e.currentTarget.checked ? 'open' : 'closed',
				lesson_template = this.model.get( 'lesson_template' );

			lesson_template.comment_status = comment_status;

			this.model.set( {
				comment_status: comment_status,
				comment_status_changed: true,
				lesson_template: lesson_template
			} );
		},
		toggleSettings: function ( e ) {
			var $parent = this.$( e.currentTarget ).parent( '.tva-toggle-container' );

			$parent.find( '.tva-heading-title' ).toggleClass( 'tva-hide' );
			$parent.find( '.tva-advanced-settings' ).slideToggle();
			$parent.find( '.ta-arrow-upd' ).toggleClass( 'ta-arr-inv' );
		},
		addCoverImage: function () {
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
				self.model.set( {cover_image: attachment.url} );
				self.renderCoverImage();
			} );

			// Finally, open the modal on click
			frame.open();
		},
		getPreviewUrl: function () {
			var self = this;
			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce
				},
				type: 'GET',
				url: ThriveApp.routes.settings + '/get_preview_url/'
			} ).done( function ( response, status, options ) {
				if ( response ) {
					ThriveApp.globals.settings.set( {preview_url: response} );
				}
			} )
		},
		save: function () {
			this.tvd_clear_errors();
			if ( ! this.model.isValid() ) {
				return this.tvd_show_errors( this.model );
			}

			if ( ( this.model.get( 'video_status' ) == true ) && this.video_view && ! this.video_view.model.isValid() ) {
				return this.tvd_show_errors( this.video_view.model );
			}

			if ( this.video_view ) {
				this.model.set( {
					term_media: {
						media_type: this.video_view.model.get( 'media_type' ),
						media_url: this.video_view.model.get( 'media_url' ),
						media_extra_options: this.video_view.model.get( 'media_extra_options' )
					}
				} );
			}

			if ( ! this.model.get( 'description' ) ) {
				TVE_Dash.err( ThriveApp.t.InvalidDescription );
				return;
			}

			var exclude_value = this.model.get( 'excluded' ),
				reg = /^\d+$/,
				exclude_num = reg.test( exclude_value );

			if ( exclude_num === false ) {
				TVE_Dash.err( ThriveApp.t.InvalidNumberType );
				return;
			}

			var collection = this.model.hasChildren();

			if ( collection ) {
				this.model.set( {post_ids: this.model.get( collection ).listValue( 'ID' )} );
			}

			TVE_Dash.showLoader();
			var route = Backbone.history.getFragment().indexOf( 'add_course' ) !== - 1 ? 'add' : 'edit',
				self = this,
				xhr = self.model.save();

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {

					var children = self.model.hasChildren();

					if ( children && true === self.model.get( 'comment_status_changed' ) ) {
						self.model.get( children ).updateValues( {comment_status: self.model.get( 'comment_status' )}, true )
					}

					self.model.set( {
						ID: response.term_id,
						url: response.url,
						update_sendowl_products: false,
						comment_status_changed: false,
					} );

					ThriveApp.globals.courses.add( self.model, {at: ThriveApp.globals.courses.length} );

					if ( ( ThriveApp.globals.settings.get( 'preview_url' ) === false ) ) {
						self.getPreviewUrl();
					}

					if ( route == 'add' ) {
						ThriveApp.router.navigate( '#course/' + response.term_id, {trigger: true} );
					}

					TVE_Dash.success( ThriveApp.t.courseSaved );
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.err( JSON.parse( errorObj.responseText ).message );
				} );
				xhr.always( function () {
					$( '.tva-course-section' ).removeClass( 'tva-course-editor' );
					TVE_Dash.hideLoader();
				} );
			}
		}
	} );

} )( jQuery );
