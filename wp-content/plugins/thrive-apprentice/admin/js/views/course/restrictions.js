( function ( $ ) {
	var editView = require( './edit' ),
		accessManager = require( './access-rules/access-manager' );

	var restrictionsView = editView.extend( {
		template: TVE_Dash.tpl( 'course/restrictions/options' ),

		render: function () {

			this.$el.html( this.template( {model: this.model} ) );

			return this;
		}
	} );

	module.exports = editView.extend( {
		template: TVE_Dash.tpl( 'course/restrictions/main' ),
		events: {
			'input #tva-course-excluded': 'setExcluded',
			'input #tva-course-message': 'setMessage',
			'change .tva-course-role': 'setRole',
			'click #tva-course-logged-in': 'toggleLoggedIn',
			'click .tva-expand-labels': 'toggleLabels',
			'click .tva-course-label-item': 'selectLabel',
			'click .tva-add-course-label': 'addLabel',
			'click .tva-save-course-restrictions': 'save'
		},
		initialize: function () {

			this.listenTo( ThriveApp.globals.labels, 'add', this.renderLabels() );
			this.listenTo( ThriveApp.globals.labels, 'remove', this.renderLabels );

			this.model.on( 'tva_integration_updated', function ( model ) {
				if ( true === model.isSendOwl() ) {
					this.model.set( 'update_sendowl_products', true );
				}
			}, this );
		},
		render: function () {
			this.$el.html( this.template( {model: this.model} ) );
			this.renderRestrictions();
			this.renderLabels();

			this.$( '.tva-course-no-restrictions' ).toggle( this.model.get( 'logged_in' ) === 0 );

			this.$el.find( '.tva-label-add-color' ).spectrum( {
				color: '#58a545',
				containerClassName: 'tva-color-picker',
				allowEmpty: false,
				showInitial: true,
				showButtons: true,
				chooseText: "Apply",
				cancelText: "Cancel",
				showInput: true,
				preferredFormat: "hex",
			} );

			var display = this.model.get( 'logged_in' ) === 1 ? 'block' : 'none';

			this.$( '.tva-course-restrictions-options' ).css( 'display', display );

			this.renderAccessRules();

			return this;
		},
		renderRestrictions: function () {
			this.$( '.tva-restrictions-options' ).empty();

			new restrictionsView( {
				el: this.$( '.tva-restrictions-options' ),
				model: this.model
			} ).render();

			this.renderMCE( 'tva-course-message', 'message' );
		},

		/**
		 * Access Rules Manager
		 *
		 * Render rules list with all its functionality
		 */
		renderAccessRules: function () {

			var view = new accessManager( {
				collection: this.model.get( 'rules' )
			} );

			this.$( '.tva-course-restrictions-options' ).prepend( view.render().$el );
		},

		renderRestrictionsOptions: function () {
			var self = this,
				membership_plugins = new ThriveApp.collections.MembershipsCollection( ThriveApp.data.settings.membership_plugin );

			if ( membership_plugins.length === 0 ) {
				ThriveApp.globals.roles.each( this.renderRole, this );
				return;
			}

			/**
			 * Render membership options for each membership plugin the user has active
			 */
			membership_plugins.each( function ( membership_plugin ) {
				var tag = membership_plugin.get( 'tag' ),
					view = null;

				/**
				 * Instantiate the base for the tag if no view was created for the membership plugin
				 */
				if ( ! ThriveApp.views[ ThriveApp.util.upperFirst( tag ) + 'MembershipOptions' ] ) {
					view = new ThriveApp.views.MembershipOptionsBase( {
						model: self.model,
						settings: membership_plugin,
						tag: tag
					} );
				} else {
					view = new ThriveApp.views[ ThriveApp.util.upperFirst( tag ) + 'MembershipOptions' ]( {
						model: self.model,
						settings: membership_plugin,
						tag: tag
					} );
				}

				self.$( '.tva-membership-options' ).append( view.render().$el );
			}, membership_plugins );
		},
		renderRole: function ( role ) {
			var roleView = new ThriveApp.views.Role( {
				el: this.$( '#tva-course-roles' ),
				model: role,
				checked: this.model.get( 'roles' )
			} );

			roleView.render();
		},
		renderLabels: function () {
			this.label_controls = new ThriveApp.views.LabelsControls( {
				model: this.model,
				el: this.$( '.tva-course-label-controls' )
			} );

			this.label_controls.render();

			this.$( '.tva-course-labels-list' ).empty();
			ThriveApp.globals.labels.each( this.renderLabel, this );
		},
		toggleLoggedIn: function ( e ) {

			this.model.set( {logged_in: e.target.checked === true ? 1 : 0} );
			this.model.set( 'update_sendowl_products', true );

			this.$( '.tva-course-restrictions-options' ).toggle( this.model.get( 'logged_in' ) === 1 );
			this.$( '.tva-course-no-restrictions' ).toggle( this.model.get( 'logged_in' ) === 0 );
		},
		selectLabel: function ( e ) {
			var id = parseInt( $( e.target ).attr( 'data-id' ) ),
				label = ThriveApp.globals.labels.findWhere( {ID: id} );

			if ( ! ( label instanceof ThriveApp.models.Base ) ) {
				return;
			}

			this.model.set( {label: parseInt( id )} );
			this.model.set( {label_name: label.get( 'title' )} );
			this.model.set( {label_color: label.get( 'color' )} );

			this.renderLabels();

			this.$( '.tva-course-label-values' ).slideToggle();
		},
		setRole: function ( e ) {
			var roles = this.model.get( 'roles' ),
				key = $( e.currentTarget ).val();

			if ( $( e.currentTarget ).prop( 'checked' ) ) {
				roles[ key ] = 1;
			} else {
				delete roles[ key ];
			}

			this.model.set( {roles: roles} );
		},
		setExcluded: function ( e ) {
			this.model.set( {excluded: e.currentTarget.value} );
		},
		setMessage: function ( e ) {
			this.model.set( {message: e.currentTarget.value} );
		},
		toggleLabels: function ( e ) {
			e.stopPropagation();
			this.$( '.tva-course-label-values' ).slideToggle();
		},
		addLabel: function () {

			var value = this.$( '#tva-add-label' ).val(),
				self = this,
				element = this.$( '#tva-add-label' );

			if ( ! value ) {
				TVE_Dash.err( ThriveApp.t.InvalidLabelName );
				return;
			}

			TVE_Dash.showLoader();
			setTimeout( function () {
				var color = $( '.tva-label-add-color' ).val() ? $( '.tva-label-add-color' ).val() : '#58a545',
					model = new ThriveApp.models.Label( {
						title: value,
						label: value,
						color: color,
						label_color: color,
						label_name: value
					} ),
					xhr = model.save();

				if ( ! model.isValid() ) {
					return this.tvd_show_errors( model );
				}

				if ( xhr ) {
					xhr.done( function ( response, status, options ) {
						model.set( 'ID', response.ID );
						self.model.set( {
							label: model.get( 'ID' ),
							color: color,
							label_color: color,
							label_name: value
						} );
						ThriveApp.globals.labels.add( model );
						element.val( '' );
						self.renderLabels();
					} );
					xhr.error( function ( errorObj ) {
						TVE_Dash.err( errorObj.responseText );
					} );
					xhr.always( function () {
						TVE_Dash.hideLoader();
					} );
				}
			}, 900 );

		},
	} )

} )( jQuery )
