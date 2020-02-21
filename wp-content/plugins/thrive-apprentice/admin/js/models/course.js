/**
 * Course Model
 */

var lessons_collection = require( './../collections/lessons' ),
	chapters_collection = require( './../collections/chapters' ),
	modules_collection = require( './../collections/modules' ),
	rules_collection = require( './../collections/rules' ),
	base_model = require( './base' ),
	author_model = require( './author' );

module.exports = base_model.extend( {
	idAttribute: 'ID',
	defaults: function () {
		return {
			name: '',
			slug: '',
			description: '',
			topic: 0,
			label: 0,
			display: 1,
			level: 0,
			roles: {},
			cover_image: '',
			conversions: 0,
			logged_in: 0,
			url: '',
			status: 'draft',
			state: ThriveApp.t.normal_state,
			message: ThriveApp.t.NotLoggedIn,
			excluded: 0,
			video_status: false,
			lesson_type: '',
			comment_status: ThriveApp.data.settings.comment_status,
			comment_status_changed: false,
			select_all: false,
			lessons_count: 0,
			taxonomy: 'tva_courses',
			membership_ids: {
				membermouse: [],
				memberpress: [],
				wishlist: [],
				sendowl: []
			},
			bundle_ids: {
				membermouse: [],
				memberpress: [],
				sendowl: []
			},
			lesson_template: {
				lesson_type: 'text',
				post_media: {
					media_extra_options: [],
					media_type: '',
					media_url: ''
				}

			}
		}
	},
	initialize: function ( data ) {

		this.set( 'rules', new rules_collection( data && data.rules ? data.rules : [] ) );

		this.set_data();
	},
	set_data: function () {
		this.set( {level_name: this.getLevelName()} );
		this.set( {topic_name: this.getTopicName()} );
		this.set( {topic_color: this.getTopicColor()} );
		this.set( {label_name: this.getLabelName()} );
		this.set( {label_color: this.getLabelColor()} );
		this.set( {author: new author_model( this.get( 'author' ) )} );
		this.set( 'lessons', new lessons_collection( this.get( 'lessons' ) ) );
		this.set( 'chapters', new chapters_collection( this.get( 'chapters' ) ) );
		this.set( 'modules', new modules_collection( this.get( 'modules' ) ) );
		this.get( 'lesson_template' ).comment_status = this.get( 'comment_status' );
		this.checkData();
		this.checkStatus();

		/**
		 * for the case when the course is updated with an ajax response
		 */
		if ( false === this.get( 'rules' ) instanceof rules_collection ) {
			this.set( 'rules', new rules_collection( typeof this.get( 'rules' ) === 'object' ? this.get( 'rules' ) : [] ) );
		}
	},
	url: function () {
		var url = ThriveApp.routes.courses;

		if ( this.get( 'ID' ) || this.get( 'ID' ) === 0 ) {
			url += '/' + this.get( 'ID' );
		}

		return url;
	},
	getLabelName: function () {
		var label_id = this.get( 'label' ) ? this.get( 'label' ) : 0;
		var label = ThriveApp.globals.labels.findWhere( {ID: parseInt( label_id )} );

		return label ? label.get( 'title' ) : '';
	},
	getLabelColor: function () {
		var label_id = this.get( 'label' ) ? this.get( 'label' ) : 0;
		var label = ThriveApp.globals.labels.findWhere( {ID: parseInt( label_id )} );

		return label ? label.get( 'color' ) : '';
	},
	getTopicName: function () {
		// use parseint just to be sure the ID will be an intiger and not a string
		var topic = ThriveApp.globals.topics.findWhere( {ID: parseInt( this.get( 'topic' ) )} );

		return topic ? topic.get( 'title' ) : '';
	},
	getTopicColor: function () {
		// use parseint just to be sure the ID will be an intiger and not a string
		var topic = ThriveApp.globals.topics.findWhere( {ID: parseInt( this.get( 'topic' ) )} );

		return topic ? topic.get( 'color' ) : '';
	},
	getLevelName: function () {
		// use parseint just to be sure the ID will be an intiger and not a string
		var level = ThriveApp.globals.levels.findWhere( {ID: parseInt( this.get( 'level' ) )} );

		return level && level.get( 'name' ) ? level.get( 'name' ) : '';
	},

	/**
	 * Overwrite Backbone validation
	 * Return something to invalidate the model
	 *
	 * @param {Object} attrs
	 * @param {Object} options
	 */
	validate: function ( attrs, options ) {
		var errors = [];

		if ( ! attrs.name ) {
			errors.push( this.validation_error( 'course_name', ThriveApp.t.InvalidName ) );
			return errors;
		}

		if ( ! attrs.description ) {
			TVE_Dash.err( ThriveApp.t.InvalidDescription );
			return errors;
		}

		if ( attrs.logged_in && this.get( 'rules' ).length <= 0 ) {
			TVE_Dash.err( ThriveApp.t.rule.errors.no_rule_set );
			return ThriveApp.t.rule.errors.no_rule_set;
		}

		if ( ! attrs.slug ) {
			errors.push( this.validation_error( 'course_slug', ThriveApp.t.InvalidSlug ) );
		}

		if ( attrs.excluded < 0 || ! Number.isInteger( parseFloat( attrs.excluded ) ) ) {
			errors.push( this.validation_error( 'course_excluded', ThriveApp.t.IntegerNumber ) );
		}

		if ( ! this.isValidProtocol( attrs.video_url ) && attrs.video_type == 'wistia' ) {
			errors.push( this.validation_error( 'video_url', ThriveApp.t.InvalidProtocol + document.location.protocol ) );
		}

		if ( errors.length ) {
			return errors;
		}
	},
	validateMemberships: function () {
		if ( this.get( 'logged_in' ) && ThriveApp.globals.settings.get( 'membership_plugin' ).length ) {
			var valid = false;
			ThriveApp.globals.settings.get( 'membership_plugin' ).each( function ( plugin ) {
				var tag = plugin.get( 'tag' );

				if ( Object.keys( this.get( 'membership_ids' )[ tag ] ).length > 0 || ( this.get( 'bundle_ids' )[ tag ] && Object.keys( this.get( 'bundle_ids' )[ tag ] ).length > 0 ) ) {
					valid = true;
				}
			}, this );

			/**
			 * Is valid if there is at least one rule defined
			 */
			if ( valid === false && this.get( 'rules' ).length > 0 ) {
				valid = true;
			}

			return valid;
		}

		return true;
	},
	validateRoles: function () {

		if ( ! this.get( 'logged_in' ) || ThriveApp.globals.settings.get( 'membership_plugin' ).length ) {
			return true;
		}

		return Object.keys( this.get( 'roles' ) ).length > 0
	},
	hasChildren: function () {
		if ( this.get( 'lessons' ).length > 0 ) {
			return 'lessons';
		}

		if ( this.get( 'chapters' ).length > 0 ) {
			return 'chapters';
		}

		if ( this.get( 'modules' ).length > 0 ) {
			return 'modules';
		}

		return false;
	},
	checkData: function () {
		if ( this.get( 'modules' ).length > 0 ) {
			if ( this.get( 'chapters' ).length > 0 ) {
				this.get( 'chapters' ).reset();
			}

			if ( this.get( 'lessons' ).length > 0 ) {
				this.get( 'lessons' ).reset();
			}
		}

		if ( ( this.get( 'chapters' ).length > 0 ) && ( this.get( 'lessons' ).length > 0 ) ) {
			this.get( 'lessons' ).reset();
		}
	},
	checkStatus: function () {
		var status = 'draft';

		if ( this.get( 'status' ) === 'publish' ) {
			var children = this.hasChildren();

			if ( children ) {
				status = this.get( children ).findWhere( {post_status: 'publish'} ) ? 'publish' : 'draft';
			}
		}

		if ( status !== this.get( 'status' ) ) {
			this.set( {status: status} );
			this.save();
		}
	}
} );
