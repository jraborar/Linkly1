( function ( $ ) {

	var base_collection = require( './base' ),
		base_model = require( './../models/base' ),
		topic_model = require( './../models/topic' ),
		label_model = require( './../models/label' ),
		level_model = require( './../models/level' ),
		role_model = require( './../models/role' ),
		template_model = require( './../models/template' ),
		font_model = require( './../models/font' ),
		google_font_model = require( './../models/google-font' ),
		membermouse_model = require( './../models/membermouse' ),
		sendowl_model = require( './../models/sendowl' ),
		wishlist_model = require( './../models/wishlist' ),
		log_model = require( './../models/log' ),
		stack_model = require( './../models/stack' ),
		type_model = require( './../models/type' ),
		sendowl_customer_model = require( './../models/sendowl/customer' ),
		order_item_model = require( './../models/order-item' ),
		breadcrumb_link_model = require( './../models/breadcrumb/link' ),
		collections = {
			SelectedItems: require( './selected_items' ),
			Lessons: require( './lessons' ),
			Courses: require( './courses' ),
			Chapters: require( './chapters' ),
			Modules: require( './modules' ),
			SendowlProducts: require( './sendowl/products'),
			SendowlBundles: require( './sendowl/bundles'),
			SendowlDiscounts: require( './sendowl/discounts')
		};

	collections.Base = base_collection;

	/**
	 * Breadcrumbs Collection
	 */
	collections.Breadcrumbs = base_collection.extend( {
		model: base_model.extend( {
			defaults: {
				hash: '',
				label: ''
			}
		} ),
		/**
		 * helper function allows adding items to the collection easier
		 *
		 * @param {string} route
		 * @param {string} label
		 */
		add_page: function ( route, label ) {
			var _model = new breadcrumb_link_model( {
				hash: route,
				label: label
			} );
			return this.add( _model );
		}
	} );

	/**
	 * Collection of topics
	 */
	collections.TopicsCollection = base_collection.extend( {
		model: topic_model,
		comparator: function ( topicA, topicB ) {
			if ( topicA.get( 'ID' ) > topicB.get( 'ID' ) ) {
				return - 1;
			} // before
			if ( topicB.get( 'ID' ) > topicA.get( 'ID' ) ) {
				return 1;
			} // after
			return 0; // equal
		}
	} );

	/**
	 * Collection of labels
	 */
	collections.LabelsCollection = collections.TopicsCollection.extend( {
		model: label_model,
		comparator: function ( labelA, labelB ) {
			if ( labelA.get( 'ID' ) > labelB.get( 'ID' ) ) {
				return - 1;
			} // before
			if ( labelB.get( 'ID' ) > labelA.get( 'ID' ) ) {
				return 1;
			} // after
			return 0; // equal
		}
	} );


	collections.ImportCourses = collections.Courses.extend( {
		url: function () {
			return ThriveApp.routes.settings + '/get_old_courses_lessons/';
		}
	} );

	/**
	 * Collection of Levels
	 */
	collections.Levels = base_collection.extend( {
		model: level_model
	} );

	/**
	 * Collection of Levels
	 */
	collections.Roles = base_collection.extend( {
		model: role_model
	} );

	/**
	 * The collection of templates
	 */
	collections.Templates = base_collection.extend( {
		model: template_model
	} );

	/**
	 * A collection of our web safe fonts
	 */
	collections.Fonts = base_collection.extend( {
		model: font_model
	} );

	/**
	 * Fonts collection for Google
	 */
	collections.GoogleFonts = base_collection.extend( {
		model: google_font_model
	} );
	/**
	 * Collection for all the membership plugins
	 */
	collections.MembershipsCollection = base_collection.extend( {
		model: base_model
	} );

	/**
	 * Membermouse memberships and bundles collection
	 */
	collections.MembermouseCollection = base_collection.extend( {
		model: membermouse_model
	} );

	/**
	 * Sendowl memberships and bundles collection
	 */
	collections.SendowlCollection = base_collection.extend( {
		model: sendowl_model

	} );

	collections.WishlistCollection = base_collection.extend( {
		model: wishlist_model
	} );

	collections.Logs = base_collection.extend( {
		model: log_model
	} );

	collections.Stacks = base_collection.extend( {
		model: stack_model
	} );

	collections.Types = base_collection.extend( {
		model: type_model
	} );

	collections.SendowlCustomers = collections.SelectedItems.extend( {
		model: sendowl_customer_model
	} );

	collections.OrderItems = base_collection.extend( {
		model: order_item_model
	} );

	module.exports = {
		collections: collections
	};

} )( jQuery );