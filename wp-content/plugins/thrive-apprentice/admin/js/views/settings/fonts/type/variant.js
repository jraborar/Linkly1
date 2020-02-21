( function ( $ ) {

	var rowView = require( './row' );

	module.exports = rowView.extend( {
		template: TVE_Dash.tpl( 'wizard/variants-row' )
	} )

} )( jQuery );