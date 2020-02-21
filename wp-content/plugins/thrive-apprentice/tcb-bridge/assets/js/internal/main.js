/**
 * Created by PhpStorm.
 * User: Ovidiu
 * Date: 10/15/2018
 * Time: 5:42 PM
 */

( function ( $ ) {

	/**
	 * On TCB Main Ready
	 */
	$( window ).on( 'tcb_main_ready', function () {
		TVE.Views.Components.checkout = require( './checkout-component' );
		TVE.Views.Components.checkout_form = require( './checkout-form-component' );
	} );

} )( jQuery );
