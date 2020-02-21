( function ( $ ) {

	var baseView = require( './base' );

	/**
	 * breadcrumbs view - renders breadcrumb links
	 */
	module.exports = baseView.extend( {
		el: $( '#tva-breadcrumbs-wrapper' )[ 0 ],
		template: TVE_Dash.tpl( 'breadcrumbs' ),
		/**
		 * setup collection listeners
		 */
		initialize: function () {
			this.$title = $( 'head > title' );
			this.original_title = this.$title.html();
			this.listenTo( this.collection, 'change', this.render );
			this.listenTo( this.collection, 'add', this.render );
		},
		/**
		 * render the html
		 */
		render: function () {
			this.$el.empty().html( this.template( {links: this.collection} ) );
			return this;
		}
	} );

} )( jQuery );
