( function ( $ ) {

	module.exports = Backbone.Collection.extend( {
		/**
		 * helper function to get the last item of a collection
		 *
		 * @return Backbone.Model
		 */
		last: function () {
			return this.at( this.size() - 1 );
		},
		sync: function ( method, model, options ) {
			var beforeSend;

			options = options || {};

			options.cache = false;

			if ( ! _.isUndefined( ThriveApp.nonce ) && ! _.isNull( ThriveApp.nonce ) ) {
				beforeSend = options.beforeSend;

				options.beforeSend = function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', ThriveApp.nonce );

					if ( beforeSend ) {
						return beforeSend.apply( this, arguments );
					}
				};
			}

			return Backbone.sync( method, model, options );
		},
		_pluck: function ( keys ) {
			if ( typeof keys !== 'object' ) {
				return;
			}

			function parseModels( collection ) {
				var result = [],
					models = $.extend( true, [], collection.models );

				_.each( models, function ( model, index ) {
					var data = {};

					_.each( keys, function ( key ) {
						if ( ( typeof key === 'string' ) && ! _.isUndefined( model.get( key ) ) ) {
							data[ key ] = ThriveApp.util.isCollection( model.get( key ) )
								? parseModels( model.get( key ) ) //ensure recursive calls for nested levels of collections
								: model.get( key );
						}
					} );

					result.push( data );
				} );

				return result;
			}

			return parseModels( this );
		},
		pluckValues: function ( values ) {
			return this._pluck( values );
		}
	} );

} )( jQuery );
