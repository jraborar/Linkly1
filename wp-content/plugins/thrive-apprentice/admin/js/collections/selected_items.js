( function ( $ ) {

	var base_collection = require( './base' ),
		base_model = require( './../models/base' );

	module.exports = base_collection.extend( {
		model: base_model,
		/**
		 * deep-json implementation for backbone collection - flattens a collection of models
		 *
		 * @returns {Array|Object}
		 */
		toDeepJson: function () {

			/**
			 * flattens all collections within a model..
			 *
			 * @todo not sure if this should be here or we should implement it on model base
			 * it may look like a "struto-camila" in the end!!!!
			 */
			if ( this instanceof Backbone.Model ) {
				return ThriveApp.collections.SelectedItems.prototype.parseModel.call( this )
			}

			var models = $.extend( true, [], this.models ),
				self = this,
				items = [];

			_.each( models, function ( model, index ) {
				model = self.parseModel( model );

				items[ index ] = model;
			} );

			return items;
		},
		checkItems: function ( model, checked ) {
			var modules = this.where( {type: 'module'} );

			/**
			 * When we select chapters and lessons we need to also check if they're part of the same module,
			 * otherwise we need to reset the selected items collection
			 */
			if ( checked && this.length > 0 && ! this.findWhere( {type: 'module'} ) && ThriveApp.globals.course_elements.get( 'modules' ).length > 0 && model.get( 'type' ) !== 'module' ) {
				var module_id,
					reset = false;
				this.each( function ( item ) {
					if ( item.get( 'post_parent' ) > 0 && ThriveApp.globals.course_elements.get( 'modules' ).findWhere( {ID: item.get( 'post_parent' )} ) ) {
						module_id = item.get( 'post_parent' );
					} else {
						var parent = ThriveApp.globals.course_elements.get( 'chapters' ).findWhere( {ID: item.get( 'post_parent' )} );
						module_id = parent.get( 'post_parent' );
					}
				} );

				var post_parent = ThriveApp.globals.course_elements.get( 'all' ).findWhere( {ID: model.get( 'post_parent' )} );

				if ( post_parent.get( 'type' ) === 'module' && post_parent.get( 'ID' ) !== module_id ) {
					reset = true;
				}

				if ( post_parent.get( 'type' ) !== 'module' && post_parent.get( 'post_parent' ) !== module_id ) {
					reset = true;
				}
			}


			if ( ( this.length > 0 && model.get( 'type' ) === 'module' && modules.length === 0 ) || ( model.get( 'post_parent' ) > 0 && modules.length > 0 && ! this.findWhere( {ID: model.get( 'post_parent' )} ) ) || reset ) {
				this.updateValues( {checked: false}, true );
				this.reset();
			}

			model.set( {checked: checked} );
			checked ? this.add( model ) : this.remove( model, {silent: true} );

			this.setChildrenChecked( model, checked );

			if ( ! checked && model.get( 'post_parent' ) > 0 ) {
				this.setParentsUnchecked( model );
			}
		},
		setChildrenChecked: function ( model, checked ) {
			var children = model.hasChildren();

			if ( children ) {
				model.get( children ).each( function ( item ) {
					item.set( {checked: checked} );
					item.trigger( 'item_checked' );

					checked ? this.add( item ) : this.remove( item, {silent: true} );
					var item_children = item.hasChildren();
					if ( item_children ) {
						item.get( item_children ).each( function ( lesson ) {
							lesson.set( {checked: checked} );
							checked ? this.add( lesson ) : this.remove( lesson, {silent: true} );
						}, this );
					}
				}, this );
			}
		},
		setParentsUnchecked: function ( model ) {
			var parent = ThriveApp.globals.course_elements.get( 'all' ).findWhere( {ID: parseInt( model.get( 'post_parent' ) )} ),
				remove_other = false;

			if ( parent ) {
				parent.set( {checked: false} );
				this.remove( parent, {silent: true} );

				if ( parent.get( 'type' ) === 'module' ) {
					remove_other = true;
				}

				if ( parent.get( 'post_parent' ) > 0 ) {
					var module = ThriveApp.globals.course_elements.get( 'modules' ).findWhere( {ID: parseInt( parent.get( 'post_parent' ) )} );
					if ( module ) {
						remove_other = true;
						module.set( {checked: false} );
						this.remove( module, {silent: true} );
					}
				}
			}

			if ( remove_other ) {
				this.removeOtherModules();
			}

		},
		removeOtherModules: function () {
			var other_modules = this.where( {type: 'module'} );
			if ( other_modules.length > 0 ) {
				_.each( other_modules, function ( other_module ) {
					this.remove( other_module, {silent: true} );
					other_module.set( {checked: false} );
					this.setChildrenChecked( other_module, false );
				}, this );

			}
		},
		getHighestSelectedLevel: function () {
			if ( this.length === 0 ) {
				return false;
			}
			var level = 0;

			this.each( function ( item ) {
				var item_level = ThriveApp.util.levels[ item.get( 'type' ) ];
				if ( level < item_level ) {
					level = item_level;
				}
			} );

			return level;
		},
		parseCollection: function ( collection ) {
			var models = $.extend( true, [], collection.models ),
				self = this,
				items = [];

			_.each( models, function ( item, index ) {
				items[ index ] = ThriveApp.collections.SelectedItems.prototype._call( 'parseModel', item );
			} );

			return items;
		},
		parseModel: function ( model ) {
			model = this instanceof Backbone.Model ? this : model;

			var obj = $.extend( true, {}, model.attributes ),
				self = this,
				json_model = model.toJSON();

			_.each( _.keys( obj ), function ( key ) {
				if ( ! _.isUndefined( obj[ key ] ) && ! _.isNull( obj[ key ] ) && ( obj[ key ] instanceof Backbone.Collection ) ) {
					json_model[ key ] = ThriveApp.collections.SelectedItems.prototype._call( 'parseCollection', obj[ key ] );
				}
			} );

			return json_model;
		},
		_call: function ( callback, args ) {
			return this instanceof Backbone.Model ?
				ThriveApp.collections.SelectedItems.prototype[ callback ].call( this ) :
				this[ callback ]( args )
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
							data[ key ] = ThriveApp.util.isCollection( model.get( key ) ) ?
								parseModels( model.get( key ) ) : //ensure recursive calls for nested levels of collections
								model.get( key );
						}

						if ( key === 'order' ) {
							data[ key ] = index;
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
		},
		listValue: function ( value ) {
			if ( typeof value !== 'string' ) {
				return;
			}

			function parseModels( collection ) {
				var result = collection.pluck( value ),
					models = $.extend( true, [], collection.models );

				_.each( models, function ( model ) {
					var childs = model.hasChildren();

					if ( ThriveApp.util.isCollection( model.get( childs ) ) ) {
						var concat = parseModels( model.get( childs ) );
						result = result.concat( concat );
					}
				} );

				return result;
			}

			return parseModels( this );
		},
		updateValues: function ( keys, with_children ) {
			if ( typeof keys !== 'object' ) {
				return;
			}

			/**
			 * TODO: Move this outside or in _utils.js
			 * @param collection
			 *
			 * @param with_children
			 */
			function parseModels( collection, with_children ) {
				var models = $.extend( true, [], collection.models );
				_.each( models, function ( model, index ) {
					Object.keys( keys ).forEach( function ( key ) {
						if ( typeof key === 'string' ) {
							var obj = {};

							// allways ensure the corect order for a model
							if ( key === 'order' ) {
								obj[ key ] = index;
							} else {
								obj[ key ] = keys[ key ];
							}

							model.set( obj );
						}
					} );

					var childs = model.hasChildren();
					if ( ( with_children === true ) && ThriveApp.util.isCollection( model.get( childs ) ) ) {
						parseModels( model.get( childs ), with_children );
					}
				} );
			}

			parseModels( this, with_children );
		}
	} );
} )( jQuery );