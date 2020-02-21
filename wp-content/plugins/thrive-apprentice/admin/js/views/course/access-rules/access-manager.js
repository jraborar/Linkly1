var baseView = require( '../../base' ),
	addRuleForm = require( './add-rule-form' ),
	ruleView = require( './rule' );

/**
 * Backbone View which manages the Access Rules
 * - manager over access rules
 */
module.exports = baseView.extend( {

	$addButton: null,
	$rulesList: null,
	template: TVE_Dash.tpl( 'course/access-rules/manager' ),
	className: 'tva-access-rules',

	initialize: function () {

		this.listenTo( this.collection, 'add', function ( model ) {

			this.renderRule( model );
			this.$rulesList.children().first().hide();
		} );

		this.listenTo( this.collection, 'remove', function () {

			if ( this.collection.length === 0 ) {
				this.$rulesList.children().first().show();
			}
		} );
	},

	render: function () {

		this.$el.html( this.template() );

		this.$addButton = this.$( 'button.tva-add-rule-form' );
		this.$rulesList = this.$( '.tva-course-rules-list' );

		this.renderRulesList();

		return this;
	},

	renderRulesList: function () {

		if ( this.collection.length ) {
			this.$rulesList.children().first().hide();
		}

		this.collection.each( this.renderRule, this );
	},

	/**
	 * Renders a Rule Model using ruleView
	 *
	 * @param {{Backbone.Model}} model
	 */
	renderRule: function ( model ) {

		if ( this.$rulesList.length <= 0 ) {
			throw 'List not defined to push Rule Item';
		}

		if ( false === ( model instanceof Backbone.Model ) ) {
			throw 'Invalid Rule Model provided';
		}

		var _rule_view = new ruleView( {
			template: TVE_Dash.tpl( 'course/access-rules/rule' ),
			className: 'tva-rule-elem',
			model: model
		} );

		_rule_view.on( 'remove', function ( model ) {
			this.collection.remove( model );
		}, this );

		this.$rulesList.append( _rule_view.render().$el );
	},

	/**
	 * Displays rule form
	 * - called magically from template
	 */
	displayAddForm: function () {

		var _form = new addRuleForm( {
			rules: this.collection
		} );

		_form

			.on( 'save', function () {
				this.$addButton.show();

				if ( this.collection.hasRuleWithIntegration( _form.model.getIntegration() ) ) {
					return TVE_Dash.err( ThriveApp.t.rule.errors.rule_exists );
				}

				this.collection.add( _form.model );
			}, this )

			.on( 'cancel', function () {
				this.$addButton.show();
			}, this );

		this.$addButton.hide();
		this.$addButton.after( _form.render().$el );
	}
} );
