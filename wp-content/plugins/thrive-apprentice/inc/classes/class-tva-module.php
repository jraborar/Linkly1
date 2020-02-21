<?php
/**
 * Created by PhpStorm.
 * User: dan bilauca
 * Date: 29-May-19
 * Time: 01:55 PM
 */

/**
 * Class TVA_Chapter
 * - wrapper over WP_Post to handle Chapter Logic
 *
 * @property int        ID       post id
 * @property int        course_id
 * @property array      item_ids used for grouping into chapters
 * @property int|string order
 * @property int        post_parent
 */
class TVA_Module extends TVA_Post {

	/**
	 * @var array
	 */
	protected $_defaults
		= array(
			'post_type' => TVA_Const::MODULE_POST_TYPE,
		);

	public function get_siblings() {

		$siblings = array();
		$term     = TVA_Manager::get_post_term( $this->_post );

		/** @var WP_Post $item */
		foreach ( TVA_Manager::get_course_modules( $term ) as $key => $item ) {
			if ( $item->ID !== $this->_post->ID ) {
				$siblings[] = TVA_Post::factory( $item );
			}
		}

		return $siblings;
	}

	/**
	 * @return TVA_Post[]
	 */
	public function get_direct_children() {

		$tva_children = array();
		$children     = TVA_Manager::get_module_chapters( $this->_post );

		if ( true === empty( $children ) ) {
			$children = TVA_Manager::get_module_lessons( $this->_post );
		}

		foreach ( $children as $child ) {
			$tva_children[] = TVA_Post::factory( $child );
		}

		return $tva_children;
	}
}
