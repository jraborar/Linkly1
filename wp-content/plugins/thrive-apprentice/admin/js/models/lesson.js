/**
 * Level Model
 */

var base_model = require( './base' );

module.exports = base_model.extend( {
	idAttribute: 'ID',
	defaults: function () {
		return {
			post_title: '',
			post_excerpt: '',
			post_parent: 0,
			lesson_type: 'text',
			post_media: {
				media_type: '',
				media_url: '',
				media_extra_options: {}
			},
			cover_image: '',
			state: ThriveApp.t.normal_state,
			post_status: 'draft',
			course_id: '',
			types: {
				text: {
					label: 'Text Lesson',
					type: 'text'
				},
				audio: {
					label: 'Audio Lesson',
					type: 'audio'
				},
				video: {
					label: 'Video Lesson',
					type: 'video'
				}
			},
			type: 'lesson',
			item_type: 'Lesson',
			checked: false,
			comment_status: 'closed',
			has_tcb_content: false
		}
	},
	url: function () {
		var url = ThriveApp.routes.lessons;

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

		if ( attrs.lesson_type !== 'text' ) {
			var media_select = new ThriveApp.models.MediaSelect( attrs.post_media );
			if ( ! media_select.isValid() ) {
				_.each( media_select.validationError, function ( error ) {
					errors.push( error );
				} );

			}

		}

		if ( errors.length ) {
			return errors;
		}
	},
	changeParentsStatus: function () {
		var collection = this.collection,
			changed_parents = [],
			current = this.get( 'post_status' ),
			post_status = current === 'draft' ? 'publish' : 'draft',
			same_status = collection.where( {post_status: post_status} );

		if ( ( ( post_status === 'publish' && same_status.length === 0 ) || ( post_status === 'draft' && same_status.length === ( this.collection.length - 1 ) ) ) && this.get( 'post_parent' ) > 0 ) {
			var parent_model = ThriveApp.globals.course_elements.get( 'all' ).findWhere( {ID: this.get( 'post_parent' )} );
			if ( parent_model ) {
				if ( parent_model instanceof ThriveApp.models.Chapter && parent_model.get( 'post_parent' ) > 0 ) {
					var module_model = ThriveApp.globals.course_elements.get( 'modules' ).findWhere( {ID: parent_model.get( 'post_parent' )} );
					if ( module_model ) {
						var chapters_same_status = module_model.get( 'chapters' ).where( {post_status: post_status} );

						if ( ( post_status === 'publish' && chapters_same_status.length === 0 ) || ( post_status === 'draft' && chapters_same_status.length === ( module_model.get( 'chapters' ).length - 1 ) ) ) {
							module_model.set( {post_status: post_status} );
							changed_parents.push( module_model )
						}

					}
				}
				parent_model.set( {post_status: post_status} );
				changed_parents.push( parent_model )
			}
		}

		return changed_parents;
	},
	hasChildren: function () {
		return false;
	},
	checkData: function () {
		return true;
	},
	set_data: function () {
		return true;
	}
} );