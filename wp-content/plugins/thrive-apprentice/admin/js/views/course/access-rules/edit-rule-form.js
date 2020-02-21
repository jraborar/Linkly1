( function ( $ ) {

	var ruleForm = require( './rule-form' ),
		integrations = require( '../../../collections/access-integrations' ),
		items_collection = require( './../../../models/integration/base' ).items_collection;

	module.exports = ruleForm.extend( {

		className: 'tva-edit-rule-form',
		template: TVE_Dash.tpl( 'course/access-rules/edit-form' ),
		integrations: null,

		initialize: function () {

			this.integrations = new integrations( ThriveApp.access_integrations );
			this.selected_items = new items_collection( this.model.getItems().toJSON() );
		},

		render: function () {

			this.$el.html( this.template() );

			this.$integrationItems = this.$( '.tva-integration-items' );

			this.renderIntegrationItems();

			return this;
		},

		/**
		 * Checks if item exists in rule model and based on that
		 * - removes or pushes it into rule items collection
		 * @param item_id
		 */
		setIntegrationItem: function ( item_id ) {

			/**
			 * if the id is string and in this case we cover items which have id as string
			 * - in this case we don't convert id to int
			 */
			if ( ! isNaN( item_id ) ) {
				item_id = parseInt( item_id );
			}

			var all_integration_items = this.integrations.getItems( this.model.get( 'integration' ) ),
				item = all_integration_items instanceof Backbone.Collection ? all_integration_items.findWhere( {id: item_id} ) : undefined,
				_method = this.selected_items.findWhere( {id: item_id} ) instanceof Backbone.Model ? 'remove' : 'push';

			if ( item instanceof Backbone.Model ) {
				/**
				 * push or remove model based if it already exists into collection
				 */
				this.selected_items[ _method ]( item );
			}
		},

		renderIntegrationItems: function () {

			if ( true === this.renderSendOwlWarnings() ) {
				return this.$( '.tva-integration-save' ).hide();
			}

			this.$( '.tva-integration-save' ).show();

			this.integrations.getItems( this.model.get( 'integration' ) ).each( function ( item ) {

				this.$integrationItems.append( this.item_template( {
					rule: this.model,
					item: item,
					checked: this.model.contains( item )
				} ) );

			}, this );
		},

		/**
		 * Resets the rule's items collection with the local selected_items collection
		 */
		save: function () {

			if ( this.selected_items.length <= 0 ) {
				return TVE_Dash.err( ThriveApp.t.rule.errors.no_item_selected );
			}

			this.model.resetItems( this.selected_items );

			this.trigger( 'save' );
			ThriveApp.globals.active_course.trigger( 'tva_integration_updated', this.model );
			this.remove();
		},

		/**
		 * Triggers a cancel event and removes itself
		 */
		cancel: function () {

			this.trigger( 'cancel' );
			this.remove();
		}
	} );
} )( jQuery );
