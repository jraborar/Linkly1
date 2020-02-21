( function ( $ ) {
	/**
	 * remove tvd-invalid class for all inputs in the view's root element
	 *
	 * @returns {Backbone.View}
	 */
	Backbone.View.prototype.tvd_clear_errors = function () {
		this.$( '.tvd-invalid' ).removeClass( 'tvd-invalid' );
		this.$( 'select' ).trigger( 'tvdclear' );
		return this;
	};

	/**
	 *
	 * @param {Backbone.Model|object} [model] backbone model or error object with 'field' and 'message' properties
	 *
	 * @returns {Backbone.View|undefined}
	 */
	Backbone.View.prototype.tvd_show_errors = function ( model ) {
		model = model || this.model;

		if ( ! model ) {
			return;
		}

		var err = model instanceof Backbone.Model ? model.validationError : model,
			self = this,
			$all = $();

		function show_error( error_item ) {
			if ( typeof error_item === 'string' ) {
				return TVE_Dash.err( error_item );
			}
			$all = $all.add( self.$( '[data-field=' + error_item.field + ']' ).addClass( 'tvd-invalid' ).each( function () {
				var $this = $( this );
				if ( $this.is( 'select' ) ) {
					$this.trigger( 'tvderror', error_item.message );
				} else {
					$this.next( 'label' ).attr( 'data-error', error_item.message )
				}
			} ) );
		}

		if ( $.isArray( err ) ) {
			_.each( err, function ( item ) {
				show_error( item );
			} );
		} else {
			show_error( err );
		}
		$all.not( '.tvd-no-focus' ).first().focus();
		/* if the first error message is not visible, scroll the contents to include it in the viewport. At the moment, this is only implemented for modals */
		this.scroll_first_error( $all.first() );

		return this;
	};

	/**
	 * scroll the contents so that the first errored input is visible
	 * currently this is only implemented for modals
	 *
	 * @param {Object} $input first input element that has the error
	 *
	 * @returns {Backbone.View}
	 */
	Backbone.View.prototype.scroll_first_error = function ( $input ) {
		if ( ! ( this instanceof TVE_Dash.views.Modal ) || ! $input.length ) {
			return this;
		}
		var input_top = $input.offset().top,
			content_top = this.$_content.offset().top,
			scroll_top = this.$_content.scrollTop(),
			content_height = this.$_content.outerHeight();
		if ( input_top >= content_top && input_top < content_height + content_top - 50 ) {
			return this;
		}

		this.$_content.animate( {
			'scrollTop': scroll_top + input_top - content_top - 40 // 40px difference
		}, 200, 'swing' );
	};

	/**
	 * {Backbone.View}
	 */
	module.exports = Backbone.View.extend( {

		/**
		 * Allows template to be set dynamically
		 * @param {*} options
		 */
		initialize: function ( options ) {
			if ( options && options.template ) {
				this.template = options.template;
			}
		},

		/**
		 * Default events
		 * - click class on an HTML element and a data-fn="" attribute might call this a method from View
		 */
		events: {
			'click .click': function ( event ) {

				var _method = event.currentTarget.dataset.fn;

				if ( typeof this[ _method ] === 'function' ) {

					if ( event.currentTarget.dataset.params ) {
						this[ _method ].apply( this, [ event.currentTarget.dataset.params ] );
					} else {
						this[ _method ].apply( this, arguments );
					}
				}
			}
		},

		/**
		 * Appends the template's html into $el
		 *
		 * @returns {{Backbone.View}}
		 */
		render: function () {

			if ( typeof this.template === 'function' ) {
				this.$el.html( this.template( {model: this.model} ) );
			}

			return this;
		},
		/**
		 *
		 * Instantiate and open a new modal which has the view constructor assigned and send params further along
		 *
		 * @param ViewConstructor View constructor
		 * @param params
		 */
		modal: function ( ViewConstructor, params ) {
			return TVE_Dash.modal( ViewConstructor, params );
		},
		bind_zclip: function () {
			/**
			 * Keep the old ZClip working
			 */
			TVE_Dash.bindZClip( this.$el.find( 'a.tvd-copy-to-clipboard' ) );

			var $element = this.$el.find( '.tva-sendowl-search' );

			function bind_it() {
				$element.each( function () {
					var $elem = $( this ),
						$input = $elem.prev().on( 'click', function ( e ) {
							this.select();
							e.preventDefault();
							e.stopPropagation();
						} ),
						_default_btn_color_class = $elem.attr( 'data-tvd-btn-color-class' ) || 'tva-copied';

					try {
						$elem.zclip( {
							path: TVE_Dash_Const.dash_url + '/js/util/jquery.zclip.1.1.1/ZeroClipboard.swf',
							copy: function () {
								return jQuery( this ).prev().val();
							},
							afterCopy: function () {
								var $link = jQuery( this );
								$input.select();
								$link.removeClass( _default_btn_color_class ).addClass( 'tva-copied' );
								setTimeout( function () {
									$link.removeClass( 'tva-copied' );
								}, 2000 );
							}
						} );
					} catch ( e ) {
						console.error && console.error( 'Error embedding zclip - most likely another plugin is messing this up' ) && console.error( e );
					}
				} );
			}

			setTimeout( bind_it, 200 );
		},
		openModal: function ( ViewConstructor, params ) {

			if ( ! ViewConstructor instanceof Backbone.View ) {
				console.error && console.error( 'View must be an instance of Backbone View' );
				return false;
			}

			var _defaults = {
					model: this.model,
					collection: this.collection,
					'max-width': '850px',
					width: 'auto',
					in_duration: 200,
					out_duration: 300,
					className: 'tvd-modal'
				},
				args = $.extend( _defaults, params );

			return this.modal( ViewConstructor, args );
		}
	} );

} )( jQuery );
