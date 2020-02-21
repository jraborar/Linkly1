var baseView = require( '../../base' ),
	editRuleForm = require( './edit-rule-form' );

/**
 * Rule Backbone.View
 * Template is allowed to be set dynamically
 */
module.exports = baseView.extend( {

	edit_form: null,
	$edit_button: null,

	events: function () {
		return _.extend( {}, baseView.prototype.events, {
			'click p': 'editRule'
		} );
	},

	render: function () {

		baseView.prototype.render.apply( this, arguments );
		this.$edit_button = this.$( '.tva-edit-access-rule' );

		return this;
	},

	/**
	 * The current view is removed from DOM
	 * - remove event is triggered
	 */
	deleteRule: function () {

		this.remove();
		this.trigger( 'remove', this.model );

		ThriveApp.globals.active_course.trigger( 'tva_integration_updated', this.model );
	},

	/**
	 * Toggles the edit form for the current rule model
	 * - on save updates/re-renders the rules items names
	 */
	editRule: function () {

		if ( this.edit_form instanceof Backbone.View ) {
			this.edit_form.remove();
			this.edit_form = null;
			return;
		}

		var _form = new editRuleForm( {
			model: this.model
		} );

		this.$el.after( _form.render().$el );

		this.edit_form = _form;
		this.edit_form
		    .on( 'save', function () {
			    this.$( '.tva-items-names' ).html( this.model.getItemsToString() );
			    this.edit_form = null;
		    }, this )
		    .on( 'cancel', function () {
			    this.edit_form = null;
		    }, this );
	}
} );
