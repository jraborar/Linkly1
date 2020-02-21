var baseModel = require( './base' );
var integrations = require( './../../collections/access-integrations' );

var integrations_collection = new integrations( ThriveApp.access_integrations );

/**
 * Access Rule Model based on which TA protects content
 */
module.exports = baseModel.model.extend( {

	/**
	 * A rule should have at least and integration name and a list of items
	 * @return {*}
	 */
	validate: function () {

		if ( ! this.get( 'integration' ) || typeof this.get( 'integration' ) !== 'string' ) {
			return ThriveApp.t.rule.errors.no_integration_set;
		}

		if ( ! this.get( 'items' ) || this.get( 'items' ).length <= 0 ) {
			return ThriveApp.t.rule.errors.no_item_selected;
		}
	},

	resetItems: function ( items ) {

		this.set( 'items', items instanceof Backbone.Collection ? items : new Backbone.Collection );
	},

	/**
	 * Wrapper over this.get('integration')
	 *
	 * @return {string}
	 */
	getIntegration: function () {

		return this.get( 'integration' ) ? this.get( 'integration' ) : 'no-integration';
	},

	/**
	 * Check if the rule has/contains the item based on ID
	 *
	 * @param item {{Backbone.Model}}
	 * @return {boolean}
	 */
	contains: function ( item ) {

		if ( false === ( item instanceof Backbone.Model ) ) {
			return false;
		}

		return this.getItems().findWhere( {id: item.getId()} ) instanceof Backbone.Model;
	},

	/**
	 * Returns a string built from name property of items collection
	 *
	 * @return {String}
	 */
	getItemsToString: function () {

		var _names = this.get( 'items' ).pluck( 'name' );

		_names = _names.join( ', ' );

		return _names;
	},

	/**
	 * Check if this rule is a SendOwl one
	 *
	 * @return {boolean}
	 */
	isSendOwl: function () {

		return this.get( 'integration' ) === 'sendowl_product' || this.get( 'integration' ) === 'sendowl_bundle';
	},

	toString: function () {

		if ( this.getIntegration() === 'no-integration' ) {
			return 'Integration has to been set';
		}

		var integration = integrations_collection.findWhere( {slug: this.getIntegration()} );
		var _text = 'Unknown ' + this.integrationName( this.get( 'integration' ) ) + ' rule ';

		if ( integration instanceof Backbone.Model ) {
			_text = integration.getText();
		}

		return _text;
	},

	integrationName: function ( slug ) {

		var _name = slug;

		if ( ! _name ) {
			_name = this.get( 'integration' );
		}

		switch ( slug ) {
			case 'sendowl_product':
				_name = 'SendOwl product';
				break;
			case 'sendowl_bundle':
				_name = 'SendOwl bundle';
				break;
			case 'wishlist':
				_name = 'WishList Membership';
				break;
			case 'memberpress':
				_name = 'Memberpress Membership';
				break;
			case 'membermouse':
				_name = 'MemberMouse Membership';
				break;
			case 'membermouse_bundle':
				_name = 'Membermouse Bundle';
				break;
		}

		return _name;
	}
} );
