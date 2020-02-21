var rule_model = require( './../models/integration/rule' );

/**
 * List of Rules which helps TA protect content
 */
module.exports = Backbone.Collection.extend( {

	model: rule_model,

	hasRuleWithIntegration: function ( integration ) {

		return this.findWhere( {integration: integration} ) instanceof rule_model;
	},

	/**
	 * Check if any of the model rule is for
	 * - sendowl_product
	 * or
	 * - sendowl_bundle
	 *
	 * @return {boolean}
	 */
	hasSendOwlRule: function () {

		var _has = this.hasRuleWithIntegration( 'sendowl_product' );

		return _has || this.hasRuleWithIntegration( 'sendowl_bundle' );
	}
} );
