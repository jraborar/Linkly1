var base_model = require( './base' ),
	chapters_collection = require( './../collections/chapters' ),
	lessons_collection = require( './../collections/lessons' );

module.exports = base_model.extend( {
	idAttribute: 'ID',
	defaults: {
		post_title: '',
		post_excerpt: '',
		data_field: 'module_name',
		state: ThriveApp.t.normal_state,
		edit_text: ThriveApp.t.edit_module,
		post_status: 'draft',
		course_id: '',
		type: 'module',
		cover_image: '',
		tooltip_text: '',
		item_type: 'Module',
		post_parent: 0,
		expanded: false,
		checked: false
	},
	initialize: function () {
		this.set_data();
	},
	set_data: function () {
		this.set( 'chapters', new chapters_collection( this.get( 'chapters' ) ) );
		this.set( 'lessons', new lessons_collection( this.get( 'lessons' ) ) );
		this.checkData();
	},
	url: function () {
		var url = ThriveApp.routes.modules;

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
	toDeepJson: function () {
		return ThriveApp.collections.SelectedItems.prototype.toDeepJson.call( this );
	},
	hasChildren: function () {
		if ( this.get( 'lessons' ).length > 0 ) {
			return 'lessons';
		}

		if ( this.get( 'chapters' ).length > 0 ) {
			return 'chapters';
		}

		return false;
	},
	checkData: function () {
		if ( ( this.get( 'chapters' ).length > 0 ) && ( this.get( 'lessons' ).length > 0 ) ) {
			this.get( 'lessons' ).reset();
		}
	}
} );