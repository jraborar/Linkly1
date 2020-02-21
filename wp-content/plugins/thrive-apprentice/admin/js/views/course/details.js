( function ( $ ) {

	var baseView = require( './../base' );

	var selectView = require( './../select' );

	var author_model = require( './../../models/author' );

	var topicView = baseView.extend( {
		template: TVE_Dash.tpl( 'course/edit/topic/topic' ),
		render: function () {
			this.model.setListRequiredFields();
			this.$el.append( this.template( {model: this.model} ) );

			return this;
		}
	} );

	var selectedTopicView = baseView.extend( {
		template: TVE_Dash.tpl( 'course/edit/topic/selected-topic' ),
		render: function () {
			this.model.setListRequiredFields();
			this.$el.html( this.template( {model: this.model} ) );

			return this;
		}
	} );

	var selectedDifficultyView = baseView.extend( {
		template: TVE_Dash.tpl( 'course/edit/topic/selected-difficulty' ),
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );

			return this;
		}
	} );


	var listTopicView = baseView.extend( {
		template: TVE_Dash.tpl( 'course/edit/topic/list-topic' ),
		events: {
			'input #tva-search-topics': 'search'
		},
		initialize: function ( options ) {
			this.args = options.args;
		},
		render: function () {
			this.$el.html( this.template( {} ) );
			this.renderTopics( this.collection );

			if ( this.collection.length >= 20 ) {
				this.$( '.tva-search-topics' ).removeClass( 'tva-hide' );
			}

			return this;
		},
		renderTopics: function ( collection ) {
			collection.each( function ( model ) {
				new this.args.singleItemView( {
						model: model,
						el: this.$( '.tva-topics-list' )
					}
				).render();
			}, this );
		},
		search: function ( e ) {
			var rez = this.collection.filter( function ( model ) {
				return model.get( 'name' ).toLowerCase().includes( e.currentTarget.value )
			} );

			var collection = new Backbone.Collection( rez );
			this.$( '.tva-topics-list' ).empty();
			this.renderTopics( collection );
		}
	} );

	var difficultyView = baseView.extend( {
		template: TVE_Dash.tpl( 'level-item' ),
		render: function () {
			this.$el.append( this.template( {model: this.model} ) );

			if ( ! this.model.get( 'ID' ) ) {
				this.$( '.tva-course-level-delete' ).addClass( 'tva-hide' )
			}

			return this;
		}
	} );

	var listDifficultyView = baseView.extend( {
		template: TVE_Dash.tpl( 'course/edit/difficulty' ),
		events: {
			'click .tva-add-course-level': 'addLevel',
			'click .tva-save-course-level': 'saveLevel',
			'click .tva-course-level-delete': 'deleteLevel'
		},
		initialize: function ( options ) {
			this.args = options.args;
		},
		render: function () {
			this.$el.html( this.template( {} ) );

			this.collection.each( function ( model ) {
				new this.args.singleItemView( {
						model: model,
						el: this.$( '.tva-difficulty-levels-list' )
					}
				).render();
			}, this );

			return this;
		},
		addLevel: function () {
			this.$( '.tvd-input-field, .tva-save-course-level' ).removeClass( 'tva-hide' );
			this.$( '.tva-add-course-level' ).addClass( 'tva-hide' );
		},
		saveLevel: function () {

			var value = this.$( '#tva-add-level' ).val(),
				element = this.$( '#tva-add-level' ),
				model = new ThriveApp.models.Level( {name: value} ),
				self = this;

			if ( ! model.isValid() ) {
				return this.tvd_show_errors( model );
			}

			TVE_Dash.showLoader();
			var xhr = model.save();
			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					model.set( 'ID', response.ID );
					ThriveApp.globals.levels.add( model );
					self.collection.add( model );
					self.render();
					element.val( '' );
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.err( errorObj.responseText );
				} );
				xhr.always( function () {
					TVE_Dash.hideLoader();
				} );
			}
		},
		deleteLevel: function ( e ) {
			e.stopPropagation();
			TVE_Dash.showLoader();

			var id = e.currentTarget.dataset.id,
				model = ThriveApp.globals.levels.findWhere( {ID: parseInt( id )} ),
				self = this;

			var xhr = model.destroy();
			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					ThriveApp.globals.levels.remove( model );
					self.collection.remove( model );

					if ( self.collection.length > 0 && model.get( 'ID' ) === self.model.get( 'level' ) ) {
						self.collection.first().set( {selected: true} )
					}
					self.render();
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.err( errorObj.responseText );
				} );
				xhr.always( function () {
					TVE_Dash.hideLoader();
				} );
			}
		}
	} );

	module.exports = baseView.extend( {
		template: TVE_Dash.tpl( 'course/manage/course-details' ),
		events: {
			'click .tva-course-author-title': 'showSearch'
		},
		initialize: function () {
			var self = this;

			this.topicsCollection = new ThriveApp.collections.TopicsCollection( ThriveApp.globals.topics.toJSON() );
			this.difficultyCollection = new ThriveApp.collections.Levels( ThriveApp.globals.levels.toJSON() );

			this.listenTo( this.topicsCollection, 'change:selected', function ( model ) {

				if ( self.model.get( 'ID' ) === ThriveApp.globals.active_course.get( 'ID' ) ) {
					self.model.set( {
						topic: model.get( 'ID' ),
						topic_color: model.get( 'color' ),
						topic_name: model.get( 'title' )
					} );

					if ( self.model.get( 'ID' ) ) {
						self.save();
					}
				}
			} );
			this.listenTo( this.difficultyCollection, 'change:selected', function ( model ) {
				self.model.set( {
					level: model.get( 'ID' ),
					level_name: model.get( 'name' )
				} );

				if ( self.model.get( 'ID' ) ) {
					self.save();
				}
			} );

			this.listenTo( this.model.get( 'author' ), 'change:url', this.render );

			$( 'body' ).on( 'click', function ( e ) {
				var $container = self.$( '.tva-material-options ' ),
					$element = self.$( '.tva-material-selected-option' ),
					$title = self.$( '.tva-course-author-title' ),
					$search = self.$( '#tva-search-users' );

				if ( ! $container.is( e.target ) && $container.has( e.target ).length === 0 && ! $element.is( e.target ) ) {
					$container.slideUp();
				}

				if ( ! $search.is( e.target ) && ! $title.is( e.target ) ) {
					self.$( '.tva-search-author' ).addClass( 'tva-hide' );
				}
			} );
		},
		render: function () {
			var children = this.model.hasChildren(),
				can_publish = false,
				self = this;

			if ( children ) {
				var pb_ch = this.model.get( children ).findWhere( {post_status: 'publish'} );
				can_publish = ! ! pb_ch;
			}

			this.$el.html( this.template( {
					model: this.model,
					can_publish: can_publish,
					author: this.model.get( 'author' )
				}
			) );

			this.renderTopics();
			this.renderDifficultyLevels();
			this.renderSearchUsers();

			this.$( '.tva-material-selected-option' ).on( 'tva_clear_document', function ( element ) {
				self.$( '.tva-search-author' ).addClass( 'tva-hide' );

				self.$( '.tva-material-options' ).each( function ( index, item ) {
					self.$( item ).hide();
				} )
			} );

			return this;
		},
		renderTopics: function () {
			this.setSelectedModel( this.topicsCollection, 'topic' );

			new selectView( {
				model: this.model,
				el: this.$( '.tva-course-topic' ),
				collection: this.topicsCollection,
				args: {
					className: 'tva-course-topics-list',
					singleItemView: topicView,
					selectedItemView: selectedTopicView,
					listItemsView: listTopicView
				}
			} ).render();
		},
		renderDifficultyLevels: function () {
			this.setSelectedModel( this.difficultyCollection, 'level' );

			new selectView( {
				model: this.model,
				el: this.$( '.tva-course-difficulty' ),
				collection: this.difficultyCollection,
				args: {
					className: 'tva-course-levels-list',
					defaultValue: this.model.get( 'level_name' ),
					selectedItemView: selectedDifficultyView,
					listItemsView: listDifficultyView,
					singleItemView: difficultyView
				}
			} ).render();
		},
		renderSearchUsers: function () {
			var self = this,
				$post_search = this.$( '#tva-search-users' );

			new ThriveApp.PostSearch( $post_search, {
				url: ThriveApp.routes.courses + '/search_users/',
				type: 'POST',
				select: function ( event, ui ) {
					var author = new author_model( {
						ID: parseInt( ui.item.id ),
						user_login: ui.item.label,
						url: ui.item.url,
						biography_type: 'wordpress_bio'
					} );

					self.model.set( {author: author} );
					self.model.trigger( 'tva_author_changed', author );

					if ( self.model.get( 'ID' ) ) {
						self.save();
					}

					self.render();
				},
				search: function () {
					self.tvd_clear_errors();
				},
				fetch_single: self.model
			} );
		},
		setSelectedModel: function ( collection, type ) {
			_.each( collection.where( {selected: true} ), function ( model ) {
				model.set( {selected: false}, {silent: true} )
			} );

			var model = collection.findWhere( {ID: this.model.get( type )} );

			model
				? model.set( {selected: true}, {silent: true} )
				: collection.first().set( {selected: true}, {silent: true} );
		},
		showSearch: function () {
			this.$( '.tva-search-author' ).removeClass( 'tva-hide' )
		},
		save: function () {
			TVE_Dash.showLoader();
			var self = this,
				xhr = this.model.save();

			if ( xhr ) {
				xhr.done( function ( response, status, options ) {
					self.render();
					TVE_Dash.success( ThriveApp.t.courseSaved );
				} );
				xhr.error( function ( errorObj ) {
					TVE_Dash.err( errorObj.responseText );
				} );
				xhr.always( function () {
					TVE_Dash.hideLoader();
				} );
			}
		}
	} );

} )( jQuery );