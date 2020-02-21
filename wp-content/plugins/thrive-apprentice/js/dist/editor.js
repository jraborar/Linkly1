/**
 * Created by Pop Aurelian on 21-Feb-17.
 */

( function ( $ ) {

	var ThriveAppr = window.parent.ThriveApp;
	ThriveAppr.globals.tva_iframe_loaded = window.ThriveApp;
	ThriveAppr.globals.wizzard.trigger( 'tva_iframe_loaded' );

	//set the inner iframe jquery to parent window
	//so that main frame can work with it and have access to jquery plugins: tva_collapsible
	window.parent.inner_jQuery = $;

} )( jQuery );
