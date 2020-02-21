var baseModel = require( './../base' );

module.exports = baseModel.extend( {
	defaults: function () {
		return {
			queryParams: new baseModel( {
				pp: 'Sendowl'
			} ),
			discountCode: '',
			identifier: ''
		}
	},
	getPurchaseLink: function () {
		var url = this.getBaseUrl();

		if ( ! url.length ) {
			return;
		}

		var params = _.clone( this.get( 'queryParams' ).attributes );

		Object.keys( params ).forEach( function ( param ) {
			url += '&' + param + '=' + params[ param ];
		} );

		return url;
	},
	getPurchaseShortcode: function () {

		var discount = '',
			args = this.get( 'identifier' ) + '=' + this.get( 'id' );

		if ( this.get( 'queryParams' ).get( 'thrv_so_discount' ) ) {
			discount = ' thrv_so_discount=' + this.get( 'queryParams' ).get( 'thrv_so_discount' );
		}

		args = args + discount;

		return '[tva_sendowl_buy ' + args + ' pp=' + "'Sendowl'" + ' title=' + "'Buy Now'" + ']'
	},
	getPurchaseHtml: function () {
		return '<a href="' + this.getPurchaseLink() + '">Buy now</a>';
	},
	getBaseUrl: function () {
		var url = ThriveApp.globals.settings.get( 'checkout_endpoint' ) || ThriveApp.globals.settings.get( 'checkout_page_url' );

		if ( url.length ) {
			url += url.indexOf( '?' ) !== - 1 ? '&' : '?';
		}

		return url;
	}
} );
