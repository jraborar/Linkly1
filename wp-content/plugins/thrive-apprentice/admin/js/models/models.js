( function ( $ ) {

	var base_collection = require( './../collections/base' );
	var models = {
		Base: require( './base' ),
		Label: require( './label' ),
		Topic: require( './topic' ),
		Course: require( './course' ),
		Level: require( './level' ),
		Role: require( './role' ),
		Lesson: require( './lesson' ),
		Template: require( './template' ),
		Font: require( './font' ),
		GoogleFont: require( './google-font' ),
		Membermouse: require( './membermouse' ),
		Sendowl: require( './sendowl' ),
		Wishlist: require( './wishlist' ),
		Chapter: require( './chapter' ),
		Module: require( './module' ),
		Log: require( './log' ),
		Stack: require( './stack' ),
		Type: require( './type' ),
		SendowlCustomer: require( './sendowl/customer' ),
		OrderItem: require( './order-item' ),
		BreadcrumbLink: require( './breadcrumb/link' )
	};

	models.MediaSelect = models.Base.extend( {
		defaults: function () {
			return {
				media_options: {
					youtube: {
						name: 'Youtube',
						extra: {},
						validate_domain: true
					},
					vimeo: {
						name: 'Vimeo',
						validate_domain: true
					},
					wistia: {
						name: 'Wistia',
						validate_domain: true
					},
					custom: {
						name: 'Custom',
						validate_domain: false
					}
				},
				media_type: 'youtube',
				media_url: '',
				media_extra_options: {}
			}
		},
		initialize: function () {
			if ( this.get( 'media_type' ) === 'soundcloud' ) {
				this.set( {
					media_options: {
						soundcloud: {
							name: 'SoundCloud',
							validate_domain: true
						},
						custom: {
							name: 'Custom',
							validate_domain: false
						}
					}
				} )
			}
		},

		/**
		 * Check if youtube url is valid
		 * @param url
		 * @param errors array of error messages
		 * @returns {boolean}
		 */
		is_youtube_url: function ( url, errors ) {

			if ( typeof url === 'undefined' ) {
				url = '';
			}

			if ( ( url.indexOf( 'youtube' ) === - 1 ) && ( url.indexOf( 'youtu' ) === - 1 ) ) {
				errors.push( this.validation_error( 'media_url', ThriveApp.t.invalidDomainUrl ) );

				return false;
			}

			return true;
		},

		/**
		 * Check if url is Video one
		 * @param url
		 * @param errors array of error messages
		 * @returns {boolean}
		 */
		is_vimeo_url: function ( url, errors ) {

			if ( typeof url === 'undefined' ) {
				url = '';
			}

			if ( url.indexOf( 'vimeo' ) === - 1 ) {
				errors.push( this.validation_error( 'media_url', ThriveApp.t.invalidDomainUrl ) );

				return false;
			}

			return true;
		},

		/**
		 * Check if wistia url is valid
		 * @param url
		 * @param errors array of error messages
		 * @returns {boolean}
		 */
		is_wistia_url: function ( url, errors ) {

			if ( typeof url === 'undefined' ) {
				url = '';
			}

			if ( ! this.isValidProtocol( url ) ) {
				var msg = ThriveApp.t.InvalidProtocol + document.location.protocol;

				errors.push( this.validation_error( 'media_url', msg ) );
				return false;
			}

			if ( url.indexOf( 'wistia' ) === - 1 ) {
				errors.push( this.validation_error( 'media_url', ThriveApp.t.invalidDomainUrl ) );

				return false;
			}

			return true;
		},

		/**
		 * Check if soundcloud url is valid
		 *
		 * @param url
		 * @param errors array of error messages
		 * @returns {boolean}
		 */
		is_soundcloud_url: function ( url, errors ) {
			if ( typeof url === 'undefined' ) {
				url = '';
			}

			if ( url.indexOf( 'soundcloud' ) === - 1 ) {
				errors.push( this.validation_error( 'media_url', ThriveApp.t.invalidDomainUrl ) );

				return false;
			}

			return true;
		},

		validate: function ( attrs ) {

			var errors = [];

			if ( attrs.media_url === '' ) {
				var msg = attrs.media_type === 'custom' ? ThriveApp.t.NoEmbedCode : ThriveApp.t.NoURL;

				return this.validation_error( 'media_url', msg );
			}

			var callback = 'is_' + attrs.media_type + '_url';

			if ( typeof this[ callback ] === 'function' && this[ callback ]( attrs.media_url, errors ) === false ) {
				return errors;
			}
		}
	} );

	models.MediaSelect.prototype.isValidModel = function ( attrs ) {
		var errors = [];

		if ( attrs.media_url == '' ) {
			errors.push( this.validation_error( 'media_url', ThriveApp.t.NoURL ) );
		}

		var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
			domainRegex = new RegExp( attrs.media_type, 'g' );

		if ( ! regexp.test( attrs.media_url ) ) {
			errors.push( this.validation_error( 'media_url', ThriveApp.t.URLNotValid ) );
		}

		if ( errors.length ) {
			return errors;
		}
	};

	/**
	 * Settings model
	 */
	models.Settings = models.Base.extend( {
		defaults: {
			per_page: '',
			preview_option: true,
			apprentice_label: true,
			index_page: {
				ID: '',
				name: ''
			},
			template: {
				font_family: '',
				font_source: 'safe',
				main_color: '',
				course_title: '',
				course_title_color: '',
				page_headline: '',
				page_headline_color: '',
				lesson_headline: '',
				chapter_headline: '',
				module_headline: '',
				paragraph: '',
				paragraph_color: '',
				view_lesson: '',
				logo_type: false
			}
		},
		url: function () {
			var url = ThriveApp.routes.settings + '/save_settings/';

			return url;
		},
		validate: function ( attrs, options ) {
			var errors = [];

			if ( ! attrs.per_page ) {
				errors.push( this.validation_error( 'per_page', ThriveApp.t.InvalidPerPage ) );
			}

			if ( ! attrs.index_page.ID ) {
				errors.push( this.validation_error( 'index_page', ThriveApp.t.InvalidIndexPage ) );
			}

			if ( ( attrs.loginform === true ) && ( attrs.index_page.ID === attrs.register_page.ID ) ) {
				errors.push( this.validation_error( 'index_page', ThriveApp.t.InvalidPagesSetup ) );
				errors.push( this.validation_error( 'register_page', ThriveApp.t.InvalidPagesSetup ) );
			}

			if ( errors.length ) {
				return errors;
			}

		},
		changeTemplate: function ( template ) {
			TVE_Dash.showLoader();

			var self = this;
			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce
				},
				type: 'POST',
				url: ThriveApp.routes.settings + '/get_user_settings/',
				data: {
					template: template.toJSON()
				}
			} ).done( function ( response, status, options ) {
				if ( response ) {
					self.set( {old_template: response.template} );
				}
				self.set( {template: template.toJSON()} );
			} ).always( function () {
				TVE_Dash.hideLoader();
			} );
		},
		importLessons: function () {
			TVE_Dash.showLoader();

			var self = this;
			$.ajax( {
				headers: {
					'X-WP-Nonce': ThriveApp.nonce
				},
				type: 'POST',
				url: ThriveApp.routes.settings + '/import_lessons/'
			} ).done( function ( response, status, options ) {
				if ( response ) {
					if ( response.length > 0 ) {
						ThriveApp.globals.courses.add( response );
						TVE_Dash.success( ThriveApp.t.SuccessImport )
					} else {
						TVE_Dash.success( ThriveApp.t.NoNewCoursesImported )
					}

				}
			} ).always( function () {
				TVE_Dash.hideLoader();
			} );
		},

		/**
		 * Generates the checkout page url for a SendOwl product: simple or bundle
		 *
		 * @param product Backbone.Model
		 * @param collection string default is 'products'
		 * @returns string
		 */
		get_checkout_page_url: function ( product, collection ) {

			var id,
				url = this.get( 'checkout_endpoint' ) || this.get( 'checkout_page_url' );

			if ( typeof collection === 'undefined' ) {
				collection = 'products';
			}

			if ( false === ( product instanceof Backbone.Model ) ) {
				product = this.get( 'sendowl_' + collection ).first();
			}

			if ( product instanceof Backbone.Model ) {
				id = product.get( 'id' );
			}

			if ( url.length && id ) {

				var glue = url.indexOf( '?' ) !== - 1 ? '&' : '?';

				url += glue + 'pp=Sendowl&' + ( collection === 'bundles' ? 'bid' : 'pid' ) + '=' + id;
			}

			return url;
		}
	} );

	models.AvailableSettings = models.Base.extend( {
		defaults: {
			'tooltip': 'data-position="top" data-tooltip="' + ThriveApp.t.OptionUnavailable + '"'
		},
		url: function () {
			return ThriveApp.routes.settings + '/get_available_settings/';
		}
	} );

	models.ModuleParent = models.Base.extend( {
		defaults: {
			name: 'Select Module'
		}
	} );

	models.ChapterParent = models.Base.extend( {
		defaults: {
			name: 'Select Chapter'
		}
	} );

	models.CourseElements = models.Base.extend( {
		defaults: {
			modules: {},
			chapters: {},
			lessons: {},
			all: {}
		},
		initialize: function () {
			this.set_data()
		},
		set_data: function () {
			this.set( {modules: new base_collection( this.get( 'modules' ) )} );
			this.set( {chapters: new base_collection( this.get( 'chapters' ) )} );
			this.set( {lessons: new base_collection( this.get( 'lessons' ) )} );
			this.set( {all: new base_collection( this.get( 'all' ) )} );
		}
	} );

	models.BulkActions = models.Base.extend( {
		initialize: function () {

			var module = ThriveApp.globals.selected_items.findWhere( {post_type: 'tva_module'} ),
				chapter = ThriveApp.globals.selected_items.findWhere( {post_type: 'tva_chapter'} ),
				lesson = ThriveApp.globals.selected_items.findWhere( {post_type: 'tva_lesson'} ),
				all_selected_lessons = ThriveApp.globals.selected_items.where( {type: 'lesson'} ),
				chapter_lessons = [],
				full_chapters = true,
				full_modules = ThriveApp.globals.selected_items.where( {type: 'module'} ).length > 0;

			/**
			 * Check if we have full chapters, this way we could group them into a module
			 */
			_.each( ThriveApp.globals.selected_items.where( {type: 'chapter'} ), function ( chapter ) {
				var items = ThriveApp.globals.course_elements.get( 'lessons' ).where( {post_parent: chapter.get( 'ID' )} );

				/**
				 * chapter_lessons = [ ...chapter_lessons, ...items]; would have worked here well but the uglification doesn't recognize the syntax
				 */
				_.each( items, function ( item ) {
					chapter_lessons.push( item );
				} );
			} );

			if ( all_selected_lessons.length !== chapter_lessons.length ) {
				full_chapters = false;
			}

			var self = this,
				actions = {
					publish: ! ! ThriveApp.globals.selected_items.findWhere( {type: 'lesson'} ),
					unpublish: ThriveApp.globals.selected_items.length > 0,
					delete: ThriveApp.globals.selected_items.length > 0,
					moduleGroup: ( (
							( ! module ) &&                           // no modules
							( ( ! ! lesson && ! chapter ) ||          // lessons only
							  ( ! ! chapter && full_chapters ) )      // chapters only
						)
					),
					chapterGroup: (
						ThriveApp.globals.selected_items.length > 0 && ! module && ! chapter  // no modules and no chapters
					),
					move: ( (
							( full_modules ) ||
							( ( ! ! lesson && ! chapter ) ||     // lessons only
							( ! ! chapter && full_chapters ) )   // chapters only
						)
					)
				};

			this.set( {actions: []} );

			Object.keys( actions ).forEach( function ( action ) {
				if ( actions[ action ] === true ) {
					var name = action + 'Name',
						obj = {};

					obj[ name ] = typeof ThriveApp.t[ action ] !== "undefined" ? ThriveApp.t[ action ] : '';

					self.get( 'actions' ).push( action );
					self.set( obj );
				}
			} );
		}
	} );


	models.LogsSettings = models.Base.extend( {
		defaults: {
			limit: 20,
			types: [],
			s: ''
		}
	} );

	module.exports = {
		models: models
	}

} )( jQuery );
