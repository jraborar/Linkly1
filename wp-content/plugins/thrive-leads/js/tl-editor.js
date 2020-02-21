/**
 * This file is included only when editing a TL form ( and only in the main frame )
 */
var TL_Editor = TL_Editor || {},
	TCB_AnimViews = TVE.Views.Components.AnimationViews;

TL_Editor.views = TL_Editor.views || {};
TVE.leads = TVE.leads || {};

/**
 * Modal for templates
 * Local and Cloud templates are listed in the same tab
 */
TL_Editor.views.ModalTemplates = TVE.modal.base.extend( {
	el: TVE.modal.get_element( 'tl-templates' ),
	saved_tpl_delete_confirmation: TVE.tpl( 'landing-pages/delete-confirmation' ),

	events: function () {

		return _.extend( {}, TVE.modal.base.prototype.events(), {
			'click .tcb-cancel-delete-template': 'no_delete_template',
			'click .tcb-apply-delete-template': 'yes_delete_template',
			'click .tcb-modal-cancel': 'close',
			'click .tcb-modal-save': 'save',
			'click .tab-item': 'tab_click',
			'click .tve-template-item .template-wrapper': function ( e ) {
				this.$( '.template-wrapper.active' ).removeClass( 'active' );
				e.currentTarget.classList.toggle( 'active' );
			}
		} );
	},

	initialize: function () {

		TVE.modal.base.prototype.initialize.apply( this, arguments );

		this.$tabs = this.$( '.tab-item' );
		this.$content = this.$( '.tve-tab-content' );
		this.$default_templates = this.$( '.tve-default-templates-list' );
		this.$saved_templates = this.$( '.tve-saved-templates-list' );

		this.set_templates( TVE.CONST.tl_templates );
	},

	/**
	 * Shows The Delete Confirmation View
	 *
	 * @param event
	 */
	delete_confirmation: function ( event ) {
		var $templateItem = jQuery( event.currentTarget ).closest( '.tve-template-item' );

		$templateItem.find( '.template-wrapper' ).hide();
		$templateItem.append( this.saved_tpl_delete_confirmation() );
	},
	/**
	 * Cancel A Delete Action And Returns to Default State
	 *
	 * @param event
	 */
	no_delete_template: function ( event ) {
		var $templateItem = jQuery( event.currentTarget ).closest( '.tve-template-item' );
		$templateItem.find( '.template-wrapper' ).show();
		$templateItem.find( '.tcb-delete-template-confirmation' ).remove();
	},
	/**
	 * Deletes A Saved Landing Page
	 *
	 * @param event
	 */
	yes_delete_template: function ( event ) {
		var $templateItem = jQuery( event.currentTarget ).closest( '.tve-template-item' ),
			data = {
				external_action: tve_leads_page_data.tpl_action,
				route: 'delete',
				tpl: $templateItem.attr( 'data-id' ),
				post_id: TVE.CONST.post_id,
				_key: tve_leads_page_data._key
			};

		TVE.main.overlay();
		TVE.ajax( 'save_post_external', 'post', data ).done( function ( response ) {
			$templateItem.remove();
			TVE.main.overlay( 'close' );
		} );
	},

	/**
	 * this modal has fixed footer
	 *
	 * @returns {boolean}
	 */
	has_fixed_footer: function () {

		return true;
	},

	/**
	 * user clicks the save button
	 */
	save: function () {

		var self = this,
			$template = this.$( '.tve-template-item .active' );

		if ( $template.length <= 0 ) {

			return TVE.page_message( TVE.t.SelectTemplate, true, 5000 );
		}


		var id = $template.data( 'id' ),
			tpl_model = this.templates.findWhere( {id: id} );

		if ( ! ( tpl_model instanceof Backbone.Model ) ) {
			return TVE.page_message( 'Something is wrong here. Template model not found ', true );
		}

		var data = {
			tpl: tpl_model.get( 'key' ),
			external_action: tve_leads_page_data.tpl_action,
			post_id: TVE.CONST.post_id,
			_key: tve_leads_page_data._key,
			route: 'choose',
			cloud: tpl_model.get( 'cloud' ) || 0,
			multi_step: tpl_model.get( 'multi_step' ) || 0,
			form_type: tpl_model.get( 'form_type' ) || ''
		};

		TVE.main.overlay();

		if ( jQuery( '#tl-form-states' ).find( '.design-states' ).is( ':visible' ) ) {
			jQuery( '#tl-form-states' ).find( 'button.state-close' ).trigger( 'click' );
		}

		TVE.ajax( 'save_post_external', 'post', data )
		   .done( function ( response ) {
			   var success = response.success || response.main_page_content || false;
			   if ( ! success ) {
				   TVE.page_message( response.message, true );
				   return TVE.main.overlay( 'close' );
			   }
			   TL_Editor.state.insertResponse( response );

			   try {
				   /**
				    * Store the id of the variation to be available in TL Dashboard
				    */
				   localStorage.setItem( 'tve_add_content_variation', JSON.stringify( {
					   form_type_id: data.post_id,
					   variation_id: data._key
				   } ) );
			   } catch ( e ) {

			   }
			   self.close();
		   } );
	},

	tab_click: function ( event ) {

		var tab = event.currentTarget.getAttribute( 'data-content' );

		if ( tab === 'saved' ) {
			this.render_saved_templates();
		} else {
			this.templates = new Backbone.Collection( TVE.CONST.tl_templates );
		}

		this.$tabs.removeClass( 'active' );
		event.currentTarget.classList.add( 'active' );

		this.$content.removeClass( 'active' );
		this.$content.filter( '[data-content="' + tab + '"]' ).addClass( 'active' );
	},

	before_open: function () {
		this.render_templates();

		this.$( '.tab-item[data-content="default"]' ).trigger( 'click' );
	},

	render_templates: function () {

		if ( this.$default_templates.html().length > 0 ) {
			return this;
		}

		var self = this,
			tpl = TVE.tpl( 'templates/item' );

		this.templates.each( function ( item, index, list ) {
			self.$default_templates.append( tpl( {item: item} ) );
		} );
	},

	render_saved_templates: function () {

		var self = this,
			data = {
				external_action: tve_leads_page_data.tpl_action,
				route: 'get_saved',
				current_template: this.$( '#tl-filter-current-templates' ).is( ':checked' ) ? 1 : 0,
				post_id: TVE.CONST.post_id,
				_key: tve_leads_page_data._key
			};

		TVE.main.overlay();

		self.$saved_templates.html( 'Fetching saved templates...' );

		TVE.ajax( 'save_post_external', 'post', data )
		   .done( function ( response ) {

			   var success = response.success || response.main_page_content || false;
			   if ( ! success ) {
				   TVE.page_message( response.message, true );
				   return TVE.main.overlay( 'close' );
			   }

			   self.$saved_templates.empty();

			   var tpl = TVE.tpl( 'templates/saved-item' );

			   self.templates = new Backbone.Collection( response.templates );

			   if ( self.templates.length === 0 ) {
				   self.$saved_templates.append( 'No saved templates found' );
			   } else {
				   self.templates.each( function ( item, index, list ) {
					   self.$saved_templates.append( tpl( {item: item} ) );
				   } );
			   }

			   TVE.main.overlay( 'close' );
		   } );
	},

	/**
	 * Set the templates collection
	 *
	 * @param templates
	 */
	set_templates: function ( templates ) {
		this.templates = new Backbone.Collection( templates );
		this.$default_templates.empty();
	}
} );

/**
 * Modal for saving current template for later use
 */
TL_Editor.views.ModalTemplateSaving = TVE.modal.base.extend( {

	el: TVE.modal.get_element( 'tl-template-saving' ),

	after_initialize: function () {

		this.$el.addClass( 'medium' );
	},

	save: function () {

		var _name = this.$( 'input' ).val();

		if ( _name.length <= 0 ) {
			return TVE.page_message( TVE.t.tpl_name_required, true, 5000 );
		}

		var self = this,
			data = {
				external_action: tve_leads_page_data.tpl_action,
				route: 'save',
				post_id: TVE.CONST.post_id,
				_key: tve_leads_page_data._key,
				name: _name
			};

		TVE.main.overlay();
		TVE.main.editor_settings.save( null, null, function () {
			TVE.ajax( 'save_post_external', 'post', data )
			   .done( function ( response ) {

				   var success = response.success || false;
				   if ( ! success ) {
					   TVE.page_message( response.message, true );
					   return TVE.main.overlay( 'close' );
				   }

				   TVE.main.overlay( 'close' );
				   self.close();
				   TVE.page_message( response.message );
			   } );
		} );
		return this;
	}

} );

TVE.leads.LightboxStateAction = TCB_AnimViews.ThriveLightbox.extend( {
	reinit: function () {
		if ( ! this.options.actions[ this.key ] ) {
			this.$el.closest( '.action-item' ).hide();
		} else {
			this.$el.closest( '.action-item' ).show();
			this.list.set_items( this.options.actions[ this.key ].options );
		}
	},
	controls_init: function () {
		this.list = new TVE.Views.Controls.List( {
			el: this.$( '.state-list' )[ 0 ],
			items: this.options.actions[ this.key ].options
		} );
		this.event_trigger = 'click';
		this.$animation = this.$( '#lb-animation' );
		if ( TVE.CONST.options.animation.actions.tl_state_lightbox ) {
			this.$animation.show();
			_.each( TVE.CONST.options.animation.actions.tl_state_lightbox.animations, function ( v, k ) {
				this.$animation.append( '<option value="' + k + '">' + v + '</option>' );
			}, this );
		} else {
			this.$animation.hide();
		}
	},
	set_model: function ( model ) {
		this.model = typeof model !== 'undefined' ? model : new Backbone.Model( {'config': {}} );
		this.list.set_value( parseInt( this.model.get( 'config' ).s || 0 ) );
		this.$animation.val( this.model.get( 'config' ).anim || 'instant' );

		return this;
	},
	validate: function () {
		return this.list.get_value() ? true : TVE.page_message( TVE.t.state_missing, true );
	},
	apply_settings: function ( $element ) {
		if ( ! this.validate() ) {
			return false;
		}
		this.model.set( {
			a: this.key,
			t: this.event_trigger,
			config: {
				anim: this.$animation.val() || 'instant',
				s: this.list.get_value()
			}
		} );
		return true;
	}
} );
TVE.leads.StateSwitchAction = TVE.leads.LightboxStateAction.extend( {
	controls_init: function () {
		TVE.leads.LightboxStateAction.prototype.controls_init.apply( this, arguments );

		this.$animation.hide();
	}
} );

( function ( $ ) {

	TVE.add_filter( 'tve_form_submit_options', function ( options ) {


		if ( ! _.findWhere( options, {key: 'state'} ) ) {
			options.push( {
				key: 'state',
				label: tve_leads_page_data.L.switch_state,
				icon: 'state'
			} );
		}

		return options;
	} );

	/**
	 * document ready
	 */
	$( function () {
		var state_manager = new TVE.leads.StateManager( {
			el: $( '#tl-form-states' )[ 0 ]
		} );

		TVE.add_filter( 'editor_loaded_callback', TL_Editor.tcb_editor_page_loaded );

		TVE.add_filter( 'before_editor_events', TL_Editor.before_editor_loaded );

		/**
		 * hook into JS filters for TCB
		 */
		TVE.add_filter( 'tcb_insert_content_template', TL_Editor.pre_process_content_template );

		TVE.main.on( 'animation_update', function ( $element, event_manager ) {
			var config = event_manager.read( $element );
			$.each( config, function ( i, evt ) {
				var animation_type = evt.a;
				if ( animation_type !== 'thrive_leads_form_close' ) {
					var trigger_id = parseInt( evt.config.s ),
						trigger = evt.t,
						actions = TVE.Components.animation.options.actions;
					if ( trigger === 'click' ) {
						var action_lightbox = actions[ animation_type ].options,
							arr = [];
						if ( action_lightbox.length ) {
							$.each( action_lightbox, function ( i, opt ) {
								if ( opt.id === trigger_id ) {
									arr.push( opt.id );
								}
							} );
							if ( ! arr.length ) {
								event_manager.remove( $element, trigger );
							}
						} else {
							event_manager.remove( $element, trigger );
						}
					}
				}
			} );
		} );
	} );

	TVE.leads.StateManager = TVE.Views.Base.base_view.extend( {
		after_initialize: function () {
			this.dom = {
				btn: this.$( '.states-button-container' )
			};
			TL_Editor.state.fixed_height();
		},
		expand: function () {
			clearTimeout( this.hide_timeout );
			this.$( '.design-states' ).removeClass( 'hide-from-view' );
		},
		collapse: function ( e ) {
			this.hide_timeout = setTimeout( this.bind( function () {
				this.$( '.design-states' ).addClass( 'hide-from-view' );
			} ), 200 );
		},
		cancel_hide: function () {
			clearTimeout( this.hide_timeout );
		},
		toggle_add: function ( e ) {
			$( e.currentTarget ).toggleClass( 'tl-multistep-open' );
		},
		add: function ( e ) {
			var link = e.currentTarget;
			if ( link.getAttribute( 'data-subscribed' ) ) {
				alert( tve_leads_page_data.L.only_one_subscribed );
				return;
			}
			this.collapse();
			TVE.main.overlay();
			TVE.Editor_Page.save( false, function () {
				TVE.KEEP_OVERLAY = true;
				TL_Editor.state.ajax( {
					custom_action: 'add',
					state: link.getAttribute( 'data-state' )
				} ).done( TL_Editor.state.insertResponse );
			} ); // passed in callback function to skip the closing of overlay
		},
		select: function ( e ) {
			const variationId = e.currentTarget.getAttribute( 'data-id' ),
				$previewButton = TVE.$( '.preview-content' ),
				previewLink = $previewButton.attr( 'href' );
			this.collapse();
			TVE.main.overlay();
			TVE.Editor_Page.save( false, function () {
				TVE.KEEP_OVERLAY = true;
				TL_Editor.state.ajax( {
					custom_action: 'display',
					id: variationId
				} ).done( TL_Editor.state.insertResponse );
			} ); // passed in callback function to skip the closing of overlay
			/**
			 * Replace preview _key value with current state id so the preview is updated too
			 */
			$previewButton.attr( 'href', this.updateUrlParameter( previewLink, '_key', variationId ) );
		},
		/**
		 * Replace a specific url param with a new value
		 * @param url - current url
		 * @param param - param to be replaced
		 * @param value - new value
		 * @returns {String}
		 */
		updateUrlParameter: function ( url, param, value ) {
			var regex = new RegExp( '(' + param + '=)[^\&]+' );
			return url.replace( regex, '$1' + value );
		},
		visibility: function ( e ) {
			var $link = $( e.currentTarget );
			if ( ! $link.parents( 'li' ).hasClass( 'lightbox-step-active' ) || typeof $link.attr( 'data-visible' ) === 'undefined' ) {
				return;
			}
			TVE.main.overlay();
			this.collapse();
			TL_Editor.state.ajax( {
				custom_action: 'visibility',
				visible: $link.attr( 'data-visible' )
			} ).done( function ( response ) {
				TVE.page_message( response.message );
				TL_Editor.state.insertResponse( response );
			} );

			return false;
		},
		duplicate: function ( e, link ) {
			if ( link.getAttribute( 'data-state' ) === 'already_subscribed' ) {
				alert( tve_leads_page_data.L.only_one_subscribed );
				return;
			}
			this.collapse();
			TVE.main.overlay();
			TVE.Editor_Page.save( false, function () {
				TVE.KEEP_OVERLAY = true;
				TL_Editor.state.ajax( {
					custom_action: 'duplicate',
					id: link.getAttribute( 'data-id' )
				} ).done( TL_Editor.state.insertResponse );
			} );

			return false;
		},
		remove: function ( e, link ) {
			if ( ! confirm( tve_leads_page_data.L.confirm_state_delete ) ) {
				return false;
			}
			this.collapse();
			TVE.main.overlay();
			TL_Editor.state.ajax( {
				custom_action: 'delete',
				id: link.getAttribute( 'data-id' )
			} ).done( function ( response ) {
				TVE.page_message( tve_leads_page_data.L.state_deleted );
				TL_Editor.state.insertResponse( response );
			} );

			return false;
		}
	} );
	/**
	 * handles all user interactions related to form states
	 */
	TL_Editor.state = {
		fixed_height: function () {
			var _state_content = $( '.fix-height-states' );
			//Test is scrollbar() is a function. Should be loaded from Architect
			if ( typeof _state_content.scrollbar === 'function' ) {
				_state_content.scrollbar();
			} else {
				_state_content.css( 'overflow-y', 'auto' );
			}
		},
		insertResponse: function ( response ) {
			if ( ! response ) {
				TVE.page_message( 'Something went wrong', true );
			}

			if ( TVE.main && TVE.main.$cpanel && response.preview_link.length ) {
				TVE.main.$cpanel.find( '.preview-content' ).attr( 'href', decodeURIComponent( response.preview_link ) );
			}

			TL_Editor_Page.handle_state_response( response );
			$( '.design-states' ).replaceWith( response.state_bar );
			TL_Editor.state.fixed_height();

			if ( response.tve_path_params.tl_templates ) {
				modal_templates.set_templates( TVE.CONST.tl_templates );
			}

			/**
			 * Any element configuration that needs updating
			 */
			if ( response.animation_options ) {
				TVE.Components.animation.options = response.animation_options;
				TVE.Components.animation.reinit();
				TL_Editor.FLAG_RE_RENDER_EVENTS = true;
			}

			var $total_states = $( '.total_states' );
			if ( response.tve_leads_page_data.states.length >= 2 ) {
				$total_states.show();
				$total_states.html( response.tve_leads_page_data.states.length - 1 );
			} else {
				$total_states.hide();
			}

			setTimeout( function () {
				TVE.main.overlay( 'close' );
			}, 1 );
		},
		ajax: function ( data ) {
			TVE.Editor_Page.blur();
			data._key = tve_leads_page_data._key;
			data.post_id = tve_leads_page_data.post_id;
			data.active_state = tve_leads_page_data._key;
			data.external_action = tve_leads_page_data.state_action;

			return TVE.ajax( 'save_post_external', 'post', data );
		}
	};


	/**
	 * Callback for 'editor_loaded_callback' filter thrown on DOMReady in TCB
	 */
	TL_Editor.tcb_editor_page_loaded = function () {

		modal_templates = new TL_Editor.views.ModalTemplates();

		/**
		 * event listener for setting submit options on LG Element
		 * @param $el lg component element
		 * @param model Backbone.model
		 * @param option - submit option selected
		 */
		TVE.main.on( 'lgRenderOptionForm', function ( $el, model, option ) {
			if ( option !== 'state' ) {
				return;
			}
			var form_template = TVE.tpl( 'lead-generation/switch-states-form' ),
				$html = $( form_template() ),
				$select = $html.find( 'select' ),
				prefix = '__TCB_EVENT_[',
				suffix = ']_TNEVE_BCT__',
				updateState = function ( id ) {

					var event_action = 'tl_state_switch',
						state_id = parseInt( id );
					model.set( '_state', state_id );
					//decide if the state is a lightbox
					$( tve_leads_page_data.states ).each( function ( index, state ) {
						if ( parseInt( state_id ) === parseInt( state.key ) && state.form_state === 'lightbox' ) {
							event_action = 'tl_state_lightbox';
						}
					} );

					var event_config = {
						t: 'click',
						a: event_action,
						elementType: 'a',
						config: {
							s: state_id
						}
					};

					event_config = prefix + JSON.stringify( event_config ) + suffix;

					//write the event config html
					TVE.ActiveElement.find( '.tve-switch-state-trigger' ).remove();
					var $a = $( '<a href="javascript:void(0)" style="display: none;" class="tve-switch-state-trigger tve_evt_manager_listen tve_et_click"></a>' );
					$a.attr( 'data-tcb-events', event_config );
					TVE.Components.lead_generation.getWrapper( 'form' ).append( $a );
				};

			/**
			 * onChange set the state value on model to be written in HTML later on
			 */
			$select.on( 'change', function ( event ) {
				updateState( event.currentTarget.value );
			} );
			/**
			 * append states top select element
			 */
			$.each( tve_leads_page_data.states, function ( index, state ) {

				if ( ( parseInt( state.key ) === parseInt( tve_leads_page_data._key ) ) || state.form_state === 'already_subscribed' ) {
					return;
				}
				var $option = $( '<option value="' + state.key + '">' + state.state_name + '</option>' );

				$select.append( $option );
			} );
			if ( TVE.ActiveElement.find( '.tve-switch-state-trigger' ).length ) {
				var config = JSON.parse( TVE.ActiveElement.find( '.tve-switch-state-trigger' ).attr( 'data-tcb-events' ).replace( prefix, '' ).replace( suffix, '' ) ).config;
				$select.val( config.s );
				TVE.ActiveElement.data( 'lg' ).set( '_state', config.s );
			} else {
				updateState( $select.val() );
			}
			$el.find( '#lg-state' ).html( $html ).removeClass( 'tcb-hidden' );
		} );

		TVE.Components.lead_generation.on( 'tcb_lg_manage_submit_options', function ( modal, lead_generation_view ) {
			lead_generation_view._write._form_type = function () {

				//todo: make sure the input does not exist; unused for the moment
				TVE.Components.lead_generation.getWrapper( 'form' ).append( TVE.Components.lead_generation.generateHiddenInput( {
					name: '_form_type',
					value: tve_leads_page_data.form_type
				} ) );
			};
		} );

		/**
		 * Open templates modal - choose/change the template for the variation
		 */
		$( TVE.main ).on( 'tcb.open_templates_picker', function ( event ) {
			event.preventDefault();
			modal_templates.open( {} );

			return false;
		} );

		/**
		 * if variation has no content/template set
		 */
		if ( ! tve_leads_page_data.has_content ) {
			modal_templates.open( {
				dismissible: false
			} );
		}

		/**
		 * reset to default current content
		 */
		TVE.main.sidebar_extra.tl_template_reset = function () {

			if ( ! confirm( tve_leads_page_data.L.confirm_tpl_reset ) ) {
				return;
			}

			TVE.Editor_Page.blur();

			TVE.main.sidebar_extra.hide_drawers();

			var data = {
				_key: tve_leads_page_data._key,
				post_id: TVE.CONST.post_id,
				external_action: tve_leads_page_data.tpl_action,
				route: 'reset'
			};

			TVE.main.overlay();

			TVE.ajax( 'save_post_external', 'post', data )
			   .done( TL_Editor.state.insertResponse );
		};

		/**
		 * Save current template for later use
		 */
		TVE.main.sidebar_extra.tl_template_save = function () {
			if ( this.modal instanceof Backbone.View ) {
				return this.modal.open();
			}

			this.modal = new TL_Editor.views.ModalTemplateSaving();
			this.modal.open();
		};

		/**
		 * Do not open thrive lightboxes from links
		 */
		TVE.add_filter( 'link_search_lightbox', function () {
			return '';
		} );

		/**
		 * For lightboxes and 2 steps, we need to store some meta-data for the variation
		 */
		TVE.add_filter( 'tcb_save_post_data_before', function ( data ) {

			/**
			 * Only if a lightbox is being edited
			 */
			if ( TVE.inner_$( '.tve_p_lb_content' ).length ) {
				/**
				 * remove old attributes from the globals config for the lightbox
				 */
				var globals = TVE.CONST.tve_globals,
					$lb = TVE.inner_$( '.tve_p_lb_content' ),
					css;

				/**
				 * Content CSS attr
				 */
				if ( css = $lb.attr( 'data-css' ) ) {
					globals.content_css = css;
				}
			}

			return data;
		} );
	};

	/**
	 * Callback for 'before_editor_events' filter thrown on DOMReady in TCB
	 */
	TL_Editor.before_editor_loaded = function () {
		var EDITOR_INSTANCE = 1,
			TL_FORM_EVENTS = [
				'thrive_leads_form_close',
				'tl_state_lightbox',
				'tl_state_switch'
			];
		/**
		 * Add extra Event Manger options in the insert link functionality - froala
		 */
		TVE.add_filter( 'tcb_froala_config', function () {
			return {
				linkEventActions: {
					getHtml: function () {
						var opts = TVE.Components.animation.options.actions;
						var actions = {
							thrive_leads_form_close: opts.thrive_leads_form_close
						};
						if ( opts.tl_state_switch && opts.tl_state_switch.options.length ) {
							actions.tl_state_switch = opts.tl_state_switch;
						}
						if ( opts.tl_state_lightbox && opts.tl_state_lightbox.options.length ) {
							actions.tl_state_lightbox = opts.tl_state_lightbox;
						}

						return TVE.tpl( 'froala-leads-states' )( {
							actions: actions,
							current_id: ++ EDITOR_INSTANCE
						} );
					},
					bindEvents: function ( $popup ) {
						$popup.on( 'change', '.fr-extra-action', function ( e ) {
							$popup.find( '.tl-action-config' ).hide();
							if ( ! this.checked ) {
								$popup.find( '.fr-link-atts,.fr-link-url' ).show();
							} else {
								$popup.find( '.tl-action-opts-' + this.getAttribute( 'data-key' ) ).show();
								$popup.find( '.fr-link-atts,.fr-link-url' ).hide();
								$popup.find( '.fr-extra-action' ).not( this ).prop( 'checked', false );
							}
						} );
					},
					hasSelected: function ( $popup ) {
						return $popup.find( '.fr-extra-action:checked' ).length;
					},
					getEventConfig: function ( $popup ) {
						var event = {};
						event.a = $popup.find( '.fr-extra-action:checked' ).attr( 'data-key' );
						event.t = 'click';
						event.config = {
							s: $popup.find( '.tl-action-opts-' + event.a + ' select[name="s"]' ).val(),
							anim: $popup.find( '.tl-action-opts-' + event.a + ' select[name="a"]' ).val()
						};

						return event;
					},
					reset: function ( $popup ) {
						if ( TL_Editor.FLAG_RE_RENDER_EVENTS ) {
							/* re-render Thrive Leads action options inside froala link editing popup */
							$popup.find( '.tl-link-actions' ).replaceWith( this.getHtml() );

							delete TL_Editor.FLAG_RE_RENDER_EVENTS;
						}

						$popup.find( '.fr-extra-action' ).prop( 'checked', false );
						$popup.find( '.fr-link-atts,.fr-link-url' ).show();
						$popup.find( '.tl-action-config' ).hide();
					},
					updateFromLink: function ( $link, $popup ) {
						var leads_event_found = false;
						this.reset( $popup );

						if ( $link.hasClass( 'tve_evt_manager_listen' ) ) {
							var evt = TVE.EventManager.get( $link, 'click' );
							if ( evt && $.inArray( evt.a, TL_FORM_EVENTS ) !== - 1 ) {
								$popup.find( '.fr-extra-action[data-key="' + evt.a + '"]' ).prop( 'checked', true ).trigger( 'change' );
								$popup.find( '.tl-action-opts-' + evt.a + ' select[name="s"]' ).val( evt.config.s );
								leads_event_found = true;
								$popup.find( '.tl-action-opts-' + evt.a + ' select[name="a"]' ).val( evt.config.anim || 'instant' );
							}
						}

						return leads_event_found;
					}
				}
			};
		} );

		var CustomHTML = TVE.CustomHTML;

		TVE.CustomHTML = TVE.CustomHTML.extend( {
			append_extra_settings: function () {
				this.$( '.extra-settings' ).remove();
			},
			after_initialize: function () {
				CustomHTML.prototype.after_initialize.apply( this, arguments );
				this.$( '.tcb-modal-title' ).after( TVE.tpl( 'custom-html-options' )() );

				this.$lazy_load = this.$( '#custom-html-lazy-load' );
			},
			before_open: function () {
				CustomHTML.prototype.before_open.apply( this, arguments );
				this.$( '#tl-custom-html-opts' ).toggle( ! tve_leads_page_data.is_default_state );
			},
			is_lazy_load: function () {
				return ! tve_leads_page_data.is_default_state && this.$lazy_load.val() === 'lazy';
			},
			/**
			 * If "Lazy load" content is active, wrap everything in a <script type="text/template"> node
			 *
			 * @param {String} html
			 *
			 * @return {String} html
			 */
			prepare_content_for_save: function ( html ) {
				if ( this.is_lazy_load() ) {
					html = '<script type="text/template" style="display: none" class="tcb-lazyload-template">' + html + '</script>';
				}

				return html;
			},
			/**
			 * Check if html is a single <script type="text/template"> node. If yes, it means the script should be executed only when the state is displayed
			 *
			 * @return {String}
			 */
			prepare_content_for_load: function () {
				var $children = TVE.ActiveElement.children().first(),
					html;

				if ( $children.length === 1 && $children.is( 'script.tcb-lazyload-template[type="text/template"]' ) ) {
					this.$lazy_load.val( 'lazy' );
					html = $children.html();
				} else {
					html = TVE.ActiveElement.html();
				}

				return html;
			}
		} );
	};
} )( jQuery );