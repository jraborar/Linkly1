( function ( $ ) {

	/**
	 * Base Model
	 */
	module.exports = Backbone.Model.extend( {

		idAttribute: 'ID',
		/**
		 * deep-json implementation for backbone models - flattens any abject, collection etc from the model
		 *
		 * @returns {Object}
		 */
		toDeepJSON: function () {
			var obj = $.extend( true, {}, this.attributes );
			_.each( _.keys( obj ), function ( key ) {
				if ( ! _.isUndefined( obj[ key ] ) && ! _.isNull( obj[ key ] ) && _.isFunction( obj[ key ].toJSON ) ) {
					obj[ key ] = obj[ key ].toJSON();
				}
			} );
			return obj;
		},
		/**
		 * deep clone a backbone model
		 * this will duplicate all included collections, models etc located in the attributes field
		 *
		 * @returns {models.Base}
		 */
		deepClone: function () {
			return new this.constructor( this.toDeepJSON() );
		},
		/**
		 * ensures the same instance of a collection is used in a Backbone model
		 *
		 * @param {object} data
		 * @param {object} collection_map map with object keys and collection constructors
		 */
		ensureCollectionData: function ( data, collection_map ) {
			_.each( collection_map, _.bind( function ( constructor, key ) {
				if ( ! data[ key ] ) {
					return true;
				}
				var instanceOf = this.get( key ) instanceof constructor;
				if ( ! instanceOf ) {
					data[ key ] = new constructor( data[ key ] );
					return true;
				}
				this.get( key ).reset( data[ key ] );
				data[ key ] = this.get( key );
			}, this ) );
		},
		validation_error: function ( field, message ) {
			return {
				field: field,
				message: message
			};
		},
		/**
		 * Set nonce header before every Backbone sync.
		 *
		 * @param {string} method.
		 * @param {Backbone.Model} model.
		 * @param {{beforeSend}, *} options.
		 * @returns {*}.
		 */
		sync: function ( method, model, options ) {
			var beforeSend;

			options = options || {};

			options.cache = false;

			if ( ! _.isUndefined( ThriveApp.nonce ) && ! _.isNull( ThriveApp.nonce ) ) {
				beforeSend = options.beforeSend;

				options.beforeSend = function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', ThriveApp.nonce );
					xhr.setRequestHeader( 'X-TVA-Request-ID', ThriveApp.request_id );

					if ( beforeSend ) {
						return beforeSend.apply( this, arguments );
					}
				};
			}

			return Backbone.sync( method, model, options );
		},
		isValidProtocol: function ( url ) {
			if ( url ) {
				return ( url.indexOf( document.location.protocol ) === - 1 ) ? false : true;
			}
			return false;
		},
		/**
		 * Set all fields required for a list
		 */
		setListRequiredFields: function () {
			this.set( {
				ID: this.getId(),
				name: this.getName()
			}, {silent: true} );
		},
		getName: function () {
			return this.get( 'name' )
		},
		getId: function () {
			return this.get( 'ID' );
		}
	} );
} )( jQuery );
