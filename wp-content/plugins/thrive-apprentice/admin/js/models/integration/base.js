/**
 * Model of an Integration Item
 * An abstract Class which can be extend specifically
 * SendOwl: - product
 *          - bundle
 *
 * Usually is has and ID and a Name
 */
var item_model = Backbone.Model.extend( {
		/**
		 * Usually a Model has and ID but for this one the ID prop can be anything/string
		 * @return {*}
		 */
		getId: function () {
			return this.get( 'id' );
		},

		/**
		 * Any integration item should have a name/label to be displayed
		 * @return {*}
		 */
		getName: function () {
			return this.get( 'name' );
		}
	} ),

	items_collection = Backbone.Collection.extend( {
		model: item_model
	} );

/**
 * Each integration model should have and items/products collection
 * Usually a Plugin or an API Connection:
 * - SendOwl
 * - MemberMouse
 * - WishList
 * - etc
 */
module.exports = {
	items_collection: items_collection,
	model: Backbone.Model.extend( {

		initialize: function ( options ) {

			this.set( 'items', new items_collection( options && options.items && Array.isArray( options.items ) ? options.items : [] ) );
		},

		/**
		 * Predefined method
		 * @return {items_collection}
		 */
		getItems: function () {
			return this.get( 'items' );
		},

		/**
		 * Based on its slug a no item message is returned
		 * @return {string}
		 */
		getNoItemsMessage: function () {

			var _message = 'No Items';

			if ( ThriveApp.t.integrations[ this.get( 'slug' ) ] ) {
				_message = ThriveApp.t.integrations[ this.get( 'slug' ) ].no_item_message;
			}

			return _message;
		},

		/**
		 * Based on the slug property returns a text which is used for a rule model to be human readable
		 *
		 * @return {string}
		 */
		getText: function () {

			var _text = 'Give access if user has any of the following:';
			var _integration = ThriveApp.t.integrations[ this.get( 'slug' ) ];

			if ( _integration ) {
				_text = _integration.rule_text;
			}

			return _text;
		}
	} )
};
