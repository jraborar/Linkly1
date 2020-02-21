<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-apprentice
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

/**
 * Class TVA_Logger
 */
class TVA_Logger {
	/**
	 * @var WP_Query|wpdb
	 */
	private static $wpdb;

	/**
	 * @var string
	 */
	private static $debug_table_name;

	/**
	 * @var
	 */
	private static $stack_table_name;

	/**
	 * @var string
	 */
	private static $type = 'Error';

	/**
	 * @var null
	 */
	private static $instance = null;

	/**
	 * @var string
	 */
	private static $product = 'Thrive Apprentice';

	/**
	 * @var array
	 */
	private static $stack = array();

	/**
	 * TTW_Debugger constructor.
	 */
	public function __construct() {
		global $wpdb;

		self::$wpdb             = $wpdb;
		self::$debug_table_name = self::$wpdb->prefix . 'thrive_debug';
		self::$stack_table_name = self::$wpdb->prefix . 'thrive_stacks';

		$this->create_debug_table();
	}

	/**
	 * Create an instance
	 *
	 * @return null|TVA_Logger
	 */
	public static function instance() {

		// Check if instance is already exists
		if ( self::$instance == null ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Log a row in the DB
	 *
	 * The $identifier should be the name for the row we're setting up
	 *
	 * @param       $identifier
	 * @param array $data
	 * @param bool  $to_db
	 * @param null  $date
	 * @param null  $type
	 */
	public static function log( $identifier, $data = array(), $to_db = false, $date = null, $type = null ) {
		self::instance();

		/**
		 * Set the date if we don't have one
		 */
		if ( ! $date ) {
			$date = date( 'Y-m-d H:m:s' );
		}

		/**
		 * Set the type if we have one set
		 */
		if ( ! $type ) {
			$type = self::get_type();
		}

		foreach ( $data as $key => $value ) {
			if ( is_object( $value ) ) {
				$data[ $key ] = (array) $value;
			}
		}

		$_data = array(
			'type'       => $type,
			'identifier' => $identifier,
			'product'    => self::$product,
			'data'       => $data,
			'date'       => $date,
		);


		if ( $to_db ) {
			$_data['data'] = maybe_serialize( $data );

			self::$wpdb->insert(
				self::$debug_table_name,
				$_data,
				array(
					'%s',
					'%s',
					'%s',
					'%s',
					'%s',
				)
			);

			return;
		}

		self::add_to_stack( $_data );
	}

	/**
	 * Log a row in the DB
	 *
	 * The $identifier should be the name for the row we're setting up
	 *
	 * @param $data
	 */
	public static function log_method( $data ) {
		self::instance();

		$date = date( 'Y-m-d H:m:s' );

		$_data = array(
			'type'       => 'method',
			'identifier' => 'Method',
			'product'    => self::$product,
			'data'       => $data . '()',
			'date'       => $date,
		);

		self::add_to_stack( $_data );
	}

	/**
	 * @param array $filters
	 *
	 * @return array|null|object
	 */
	public static function get_logs( $filters = array() ) {
		self::instance();
		$where = '';
		$types = '';
		$s     = '';
		if ( ! isset( $filters['limit'] ) ) {
			$limit = ' LIMIT %d';
			$args  = array( 20 );
		} else {
			$lower = (int) $filters['limit'];
			$upper = (int) $filters['limit'] + 20;
			$limit = ' LIMIT %d, %d';

			$args = array( $lower, $upper );
		}

		if ( ! empty( $filters['types'] ) ) {
			$i = 1;
			foreach ( $filters['types'] as $type ) {
				if ( $i === 1 && empty( $where ) ) {
					$where = ' WHERE  type = ' . "'" . $type . "'";
				} else {
					$types .= ' OR type = ' . "'" . $type . "'";
				}
			}
		}

		if ( ! empty( $filters['s'] ) ) {
			if ( empty( $where ) ) {
				$where = ' WHERE  type LIKE ' . "'%" . $filters['s'] . "%' OR product LIKE " . "'%" . $filters['s'] . "%' OR date LIKE " . "'%" . $filters['s'] . "%'";
			} else {
				$s = 'AND ( product LIKE ' . "'%" . $filters['s'] . "%' OR date LIKE " . "'%" . $filters['s'] . "%')";
			}
		}

		$logs = self::$wpdb->get_results(
			self::$wpdb->prepare(
				'SELECT * FROM ' . self::$debug_table_name . $where . $types . $s . ' ORDER BY date DESC' . $limit, $args
			)
		);

		if ( is_array( $logs ) ) {
			foreach ( $logs as $log ) {
				$log->data = maybe_unserialize( $log->data );
			}
		}

		return $logs;
	}

	/**
	 * Return the types for the logs
	 *
	 * @return array|null|object
	 */
	public static function get_log_types() {
		self::instance();
		$types = array();
		$data  = self::$wpdb->get_results(
			self::$wpdb->prepare(
				'SELECT DISTINCT type FROM ' . self::$debug_table_name . ' WHERE 1 = %s', array( 1 )
			)
		);

		if ( ! empty( $data ) ) {
			foreach ( $data as $key => $type ) {
				$types[] = array(
					'id'   => $key,
					'type' => $type->type,
				);
			}
		}

		return $types;
	}

	/**
	 * Return the types for the stacks
	 *
	 * @return array|null|object
	 */
	public static function get_stack_types() {
		self::instance();
		$types = array();

		$data = self::$wpdb->get_results(
			self::$wpdb->prepare(
				'SELECT DISTINCT type FROM ' . self::$stack_table_name . ' WHERE 1 = %d', array( 1 )
			)
		);

		if ( ! empty( $data ) ) {
			foreach ( $data as $key => $type ) {
				$types[] = array(
					'id'   => $key,
					'type' => $type->type,
				);
			}
		}

		return $types;
	}

	/**
	 * Set the product
	 *
	 * @param $product
	 */
	public static function set_product( $product ) {
		/**
		 * make sure we already have the instance
		 */
		self::instance();

		self::$product = $product;
	}

	/**
	 * Return the product
	 *
	 * @return string
	 */
	public static function get_product() {
		/**
		 * make sure we already have the instance
		 */
		self::instance();

		return self::$product;
	}

	/**
	 * Set the type
	 *
	 * @param $type
	 */
	public static function set_type( $type ) {
		/**
		 * make sure we already have the instance
		 */
		self::instance();

		self::$type = $type;
	}

	/**
	 * Return the type
	 *
	 * @return string
	 */
	public static function get_type() {
		/**
		 * make sure we already have the instance
		 */
		self::instance();

		return self::$type;
	}

	/**
	 * Add data to stack for tracing
	 *
	 * @param $data
	 */
	public static function add_to_stack( $data ) {
		self::$stack[] = $data;
	}

	/**
	 * Reset the stack
	 */
	public static function reset_stack() {
		self::$stack = array();
	}

	/**
	 * @param      $type
	 * @param null $date
	 */
	public static function commit_stack( $type, $date = null ) {
		/**
		 * Set the date if we don't have one
		 */
		if ( ! $date ) {
			$date = date( 'Y-m-d H:m:s' );
		}

		/**
		 * Set the type if we have one set
		 */
		if ( ! $type ) {
			$type = self::get_type();
		}

		$_data = array(
			'type'    => $type,
			'product' => self::$product,
			'data'    => maybe_serialize( self::$stack ),
			'date'    => $date,
		);

		self::$wpdb->insert(
			self::$stack_table_name,
			$_data,
			array(
				'%s',
				'%s',
				'%s',
				'%s',
			)
		);
	}

	/**
	 * @param array $filters
	 *
	 * @return array|null|object
	 */
	public static function get_stacks( $filters = array() ) {
		self::instance();
		$where = '';
		$types = '';
		$s     = '';
		if ( ! isset( $filters['limit'] ) ) {
			$limit = ' LIMIT %d';
			$args  = array( 20 );
		} else {
			$lower = (int) $filters['limit'];
			$upper = (int) $filters['limit'] + 20;
			$limit = ' LIMIT %d, %d';

			$args = array( $lower, $upper );
		}

		if ( ! empty( $filters['types'] ) ) {
			$i = 1;
			foreach ( $filters['types'] as $type ) {
				if ( $i === 1 && empty( $where ) ) {
					$where = ' WHERE  type = ' . "'" . $type . "'";
				} else {
					$types .= ' OR type = ' . "'" . $type . "'";
				}
			}
		}

		if ( ! empty( $filters['s'] ) ) {
			if ( empty( $where ) ) {
				$where = ' WHERE  type LIKE ' . "'%" . $filters['s'] . "%' OR product LIKE " . "'%" . $filters['s'] . "%' OR date LIKE " . "'%" . $filters['s'] . "%'";
			} else {
				$s = 'AND ( product LIKE ' . "'%" . $filters['s'] . "' OR date LIKE " . "'%" . $filters['s'] . "')";
			}
		}

		$stacks = self::$wpdb->get_results(
			self::$wpdb->prepare(
				'SELECT * FROM ' . self::$stack_table_name . $where . $types . $s . ' ORDER BY date DESC' . $limit, $args
			)
		);

		foreach ( $stacks as $stack ) {
			$stack->data = maybe_unserialize( $stack->data );
		}

		return $stacks;
	}

	/**
	 * Return the stacked data
	 */
	public static function print_stack() {
		echo '<pre>';
		var_dump( self::$stack );
		echo '</pre>';
	}

	/**
	 * Create the the debugging table if it doesn't exist
	 */
	private function create_debug_table() {
		if ( self::$wpdb->get_var( "SHOW TABLES LIKE '" . self::$debug_table_name . "'" ) != self::$debug_table_name ) {
			$charset_collate = self::$wpdb->get_charset_collate();

			$sql = 'CREATE TABLE IF NOT EXISTS ' . self::$debug_table_name . ' (
			  id mediumint(9) NOT NULL AUTO_INCREMENT,
			  `type` varchar(60) NOT NULL,
			  `identifier` TEXT NOT NULL,
			  product TEXT NOT NULL,
			  `data` TEXT NOT NULL,
			  `date` datetime DEFAULT "0000-00-00 00:00:00" NOT NULL,
			  PRIMARY KEY  (id)
			)' . $charset_collate . ';';

			$stack = 'CREATE TABLE IF NOT EXISTS ' . self::$stack_table_name . ' (
			  id mediumint(9) NOT NULL AUTO_INCREMENT,
			  `type` varchar(60) NOT NULL,
			  product TEXT NOT NULL,
			  `data` TEXT NOT NULL,
			  `date` datetime DEFAULT "0000-00-00 00:00:00" NOT NULL,
			  PRIMARY KEY  (id)
			)' . $charset_collate . ';';

			require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
			dbDelta( $sql );
			dbDelta( $stack );
		}
	}

	/**
	 * Delete logs older than 30 days
	 */
	public static function perform_cleanup() {
		$date = date( 'Y-m-d', strtotime( '-30 days' ) );
		self::$wpdb->delete( 'table', array( 'ID' => 1 ), array( '%d' ) );

		self::$wpdb->query( self::$wpdb->prepare( 'DELETE FROM ' . self::$stack_table_name . ' WHERE date < %s', array( $date ) ) );
		self::$wpdb->query( self::$wpdb->prepare( 'DELETE FROM ' . self::$debug_table_name . ' WHERE date < %s', array( $date ) ) );
	}
}
