<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'Linkly' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

if ( !defined('WP_CLI') ) {
    define( 'WP_SITEURL', $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] );
    define( 'WP_HOME',    $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] );
}



/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'M5voi959Nh4wdUqIC0rFT8J5h3cSOfK9SQnCFf96XediJaNblhJJus3t5LVJBIyM' );
define( 'SECURE_AUTH_KEY',  'V9wVGfkDyUteyNJ4wRbjVqgsEqdQavc4BtMgviNTmPDZ5BuP7A6D2VYAkFwkbhVO' );
define( 'LOGGED_IN_KEY',    '73Sxt1rmndhxEUg1SYsk7BoHbX2nYXkIJzopKiDPLNAfPN5BOJ62sKA4O2KIryGu' );
define( 'NONCE_KEY',        'wzXHsWiLCLeBUMFXPlbirLeM4z5yo2MabyDGaN3IcBH5V8Dl2GhcctIlhOVpbDxb' );
define( 'AUTH_SALT',        'HtjjfIpuq43U1TdUbstiCXm2A7S6ctUOjEfQpMSDByDkGjd7JPiADjlOLa0NsViQ' );
define( 'SECURE_AUTH_SALT', 'i07PeSuXWSXX8QNZoRW8Gu9nipP0TzITP5vHMZe930l2RrarD2J0VRUSr9qrDB5G' );
define( 'LOGGED_IN_SALT',   '5OWLAWCFMEdAQ8LNjIK0EgsTZwtHjSwjOoZExPKmuUb9wbou0j4yHzC5BGqQWDah' );
define( 'NONCE_SALT',       'EuJiz7H9ht9DX5lRw8eXIOefHPqL1XjojNfwV37QVvUOHjlO3vu8Z8b9hEHv8jX8' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once( ABSPATH . 'wp-settings.php' );
