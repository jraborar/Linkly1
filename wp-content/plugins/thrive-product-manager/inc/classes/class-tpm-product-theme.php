<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-product-manager
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden!
}

class TPM_Product_Theme extends TPM_Product {

	public function get_status() {

		if ( ! empty( $this->status ) ) {
			return $this->status;
		}

		if ( ! $this->is_purchased() ) {
			return $this->status = self::AVAILABLE;
		}

		if ( ! $this->is_installed() ) {
			return $this->status = self::TO_INSTALL;
		}

		if ( ! $this->is_licensed() ) {
			return $this->status = self::TO_LICENSE;
		}

		if ( $this->is_activated() ) {

			return $this->status = self::ACTIVATED;
		}

		return $this->status = self::READY;
	}

	public function is_activated() {

		/** @var WP_Theme $current_theme */
		$current_theme = wp_get_theme();

		return $this->name === $current_theme->get( 'Name' );
	}

	public function is_installed() {

		$theme = wp_get_theme( $this->api_slug );

		return ! is_wp_error( $theme->errors() );
	}

	public function to_array() {

		$data         = parent::to_array();
		$data['type'] = 'theme';

		return $data;
	}

	protected function _get_download_url( $api_slug ) {

		global $wp_version;

		$args    = array(
			'slug'    => $api_slug,
			'version' => '1.0',
		);
		$request = array(
			'sslverify'  => false,
			'body'       => array(
				'action'  => 'theme_update',
				'request' => serialize( $args ),
				'api-key' => md5( home_url() ),
			),
			'user-agent' => 'WordPress/' . $wp_version . '; ' . home_url(),
		);

		$thrive_update_api_url = add_query_arg( array(
			'p' => $this->_get_hash( $request['body'] ),
		), 'http://service-api.thrivethemes.com/theme/update' );

		$result = wp_remote_post( $thrive_update_api_url, $request );

		if ( ! is_wp_error( $result ) ) {
			$info = @unserialize( wp_remote_retrieve_body( $result ) );
			if ( ! empty( $info ) ) {
				return $info['package'];
			}
		}

		return new WP_Error( '400', $result->get_error_message() );
	}

	public function install( $credentials ) {

		if ( $this->is_installed() ) {
			return true;
		}

		include_once( ABSPATH . 'wp-admin/includes/class-wp-upgrader.php' );

		$url = $this->_get_download_url( $this->api_slug );

		/** @var $wp_filesystem WP_Filesystem_Base */
		global $wp_filesystem;
		$connected = WP_Filesystem( $credentials );

		if ( $connected === false ) {
			return $wp_filesystem->errors;
		}

		require_once dirname( __FILE__ ) . '/class-tpm-theme-installer-skin.php';

		$installer = new Theme_Upgrader( new TPM_Theme_Installer_Skin( $credentials ) );

		return $installer->install( $url );
	}
}
