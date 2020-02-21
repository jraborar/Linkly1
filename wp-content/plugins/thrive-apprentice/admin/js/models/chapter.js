var base_model = require( './base' ),
	lessons_collections = require( './../collections/lessons' );

module.exports = base_model.extend( {
	idAttribute: 'ID',
	defaults: {
		post_title: '',
		post_excerpt: '',
		data_field: 'chapter_name',
		state: ThriveApp.t.normal_state,
		edit_text: ThriveApp.t.edit_chapter,
		post_status: 'draft',
		course_id: '',
		post_parent: 0,
		type: 'chapter',
		tooltip_text: '',
		item_type: 'Chapter',
		expanded: false,
		checked: false

	},
	initialize: function () {
		this.set_data();
	},
	set_data: function () {
		this.set( 'lessons', new lessons_collections( this.get( 'lessons' ) ) );
	},
	checkData: function () {
		return true;
	},
	url: function () {
		var url = ThriveApp.routes.chapters;

		if ( this.get( 'ID' ) || this.get( 'ID' ) === 0 ) {
			url += '/' + this.get( 'ID' );
		}

		return url;
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

		if ( ! attrs.post_title ) {
			errors.push( this.validation_error( 'item_name', ThriveApp.t.InvalidName ) );
		}

		if ( errors.length ) {
			return errors;
		}
	},
	hasChildren: function () {
		if ( this.get( 'lessons' ).length > 0 ) {
			return 'lessons';
		}

		return false;
	}
} );
