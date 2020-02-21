( function ( $ ) {

	var ruleForm = require( './rule-form' ),
		integrations = require( '../../../collections/access-integrations' ),
		rule_model = require( '../../../models/integration/rule' );

	/**
	 * Backbone.View for adding new access rule into rules collection
	 * - usually called by Access Manager View
	 */
	module.exports = ruleForm.extend( {

		className: 'tva-add-rule-form',
		template: TVE_Dash.tpl( 'course/access-rules/add-form' ),

		integrations: null,

		/**
		 * @param {{jQuery}}
		 */
		$integrationsList: null,

		initialize: function ( options ) {

			this.integrations = new integrations( ThriveApp.access_integrations );
			this.model = new rule_model();
			this.rules = options.rules;

			this.listenTo( this.model, 'change:integration', this.renderIntegrationItems );
		},

		render: function () {

			this.$el.html( this.template() );

			this.$integrationsList = this.$( '.tva-integrations-list' );
			this.$integrationItems = this.$( '.tva-integration-items' ).hide();

			this.renderIntegrationsList();

			return this;
		},

		/**
		 * Display a list of items the integration has:
		 * - wordpress: user roles
		 * - sendowl: products, bundles
		 * - etc
		 *
		 * @param {{Backbone.Model}} rule_model that is wanted the be created
		 * @param {String} integration_slug
		 */
		renderIntegrationItems: function ( rule_model, integration_slug ) {

			if ( true === this.renderSendOwlWarnings() ) {
				return this.$( '.tva-integration-save' ).hide();
			}

			this.$( '.tva-integration-save' ).show();

			var _items = this.integrations.getItems( integration_slug );

			if ( _items.length === 0 ) {
				var _message = this.integrations.getIntegration( integration_slug ).getNoItemsMessage();
				return this.$integrationItems.html( '<label>' + _message + '</label>' );
			}

			_items.each( function ( item ) {

				this.$integrationItems.append( this.item_template( {
					rule: this.model,
					item: item
				} ) );
			}, this );
		},

		/**
		 * Renders the integrations collection with all their props: images/icons/labels/etc
		 */
		renderIntegrationsList: function () {

			this.integrations.each( this.renderIntegration, this );
		},

		renderIntegration: function ( integration ) {

			var _item_tpl = TVE_Dash.tpl( 'course/access-rules/integration' ),
				$html = $( _item_tpl( {
					model: integration,
					exists: this.rules.hasRuleWithIntegration( integration.get( 'slug' ) )
				} ) );

			this.$integrationsList.append( $html );
		},

		/**
		 * Called dynamically based on dataset attribute set on template's html
		 * @param integration
		 */
		setIntegration: function ( integration ) {

			if ( this.rules.hasRuleWithIntegration( integration ) ) {
				return TVE_Dash.err( ThriveApp.t.rule.errors.rule_exists );
			}

			if ( this.model.get( 'integration' ) === integration ) {
				return;
			}

			this.$integrationItems.show().empty();
			this.model.resetItems();

			this.$( '.tva-integration-item' ).removeClass( 'tva-active' );
			this.$( '[data-params=' + integration + ']' ).addClass( 'tva-active' );

			this.model.set( 'integration', integration );
		},

		/**
		 * Toggles an item into rule model
		 * - if item exists in rule model it removes it
		 * - if item does not exist then it adds it
		 *
		 * Called magically from template
		 *
		 * @param {String} item_id usually read from dataset: data-params=""
		 */
		setIntegrationItem: function ( item_id ) {

			if ( ! isNaN( item_id ) ) {
				item_id = parseInt( item_id );
			}

			var collection = this.integrations.getItems( this.model.get( 'integration' ) ),
				item = collection.findWhere( {id: item_id} );

			var _method = this.model.contains( item ) ? 'remove' : 'push';

			/**
			 * push or remove model based if it already exists into collection
			 */
			this.model.get( 'items' )[ _method ]( item );
		},

		/**
		 * When save/cancel button of the current form is click the model is:
		 * - saved and a save event is triggered
		 * - canceled with a cancel event triggered
		 * - form view is removed from DOM
		 */
		save: function () {

			if ( ! this.model.isValid() ) {
				return TVE_Dash.err( this.model.validationError );
			}

			this.trigger( 'save' );
			ThriveApp.globals.active_course.trigger( 'tva_integration_updated', this.model );
			this.remove();
		},

		/**
		 * User cancels the add new rule form
		 * Form is "closed" removed from DOM
		 */
		cancel: function () {

			this.trigger( 'cancel' );
			this.remove();
		}
	} );
} )( jQuery );
